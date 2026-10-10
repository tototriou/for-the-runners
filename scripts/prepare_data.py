#!/usr/bin/env python3
"""Prépare le graphe piéton de la zone test pour Boucle D+.

Étapes :
  1. Segments de voirie Overture Maps (couche « transportation », issue
     d'OpenStreetMap, licence ODbL) lus directement sur S3 par requêtes HTTP
     partielles : seuls les groupes de lignes qui recoupent la zone sont lus.
  2. Altitude : service altimétrique IGN de la Géoplateforme, par lots, avec
     cache ; repli automatique sur le MNT SRTM 1" (tuiles « skadi » d'AWS).
  3. Découpage aux connecteurs, rayon, plus grande composante connexe, fusion
     des nœuds de degré 2.
  4. Par arête : longueur, D+ dans chaque sens (altitude échantillonnée tous
     les 30 m), type (route / sentier), géométrie simplifiée avec altitudes.
  5. Export JSON compressé (gzip) dans public/data/.

Usage : python3 scripts/prepare_data.py [--dem auto|ign|srtm] [--config config/zone.json]
"""
from __future__ import annotations

import argparse
import gzip
import io
import json
import math
import os
import re
import struct
import sys
import time
from collections import defaultdict
from pathlib import Path

import numpy as np
import requests

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".cache"
OVERTURE = "https://overturemaps-us-west-2.s3.amazonaws.com/"
SKADI = "https://s3.amazonaws.com/elevation-tiles-prod/skadi/"
IGN_URL = "https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json"

# Classes Overture praticables à pied ; autoroutes et voies rapides exclues.
CLASSES_ROUTE = {
    "primary", "secondary", "tertiary", "residential", "living_street",
    "unclassified", "service", "pedestrian", "cycleway", "unknown",
}
CLASSES_SENTIER = {"path", "track", "footway", "steps", "bridleway"}
# Un trottoir ou un passage piéton reste urbain : classé route.
SOUS_CLASSES_URBAINES = {"sidewalk", "crosswalk"}
# Allées privées et de parking : réelles, mais le routage s'en servait de
# raccourcis entre deux rues, à travers des propriétés et des parkings.
SOUS_CLASSES_EXCLUES = {"driveway", "parking_aisle"}
# Un sentier qui saute de plus d'un kilomètre d'un seul trait est une erreur
# de saisie (ex. un footway de 1,5 km en ligne droite à travers Annecy). Les
# vrais chemins rectilignes relevés dans la zone ne dépassent pas 600 m.
SAUT_MAX_M = 1000.0

PAS_ECHANTILLON_M = 30.0
TOLERANCE_SIMPLIF_M = 4.0
R_TERRE = 6371008.8


# --------------------------------------------------------------------------- géo

def haversine(lat1, lon1, lat2, lon2):
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R_TERRE * math.asin(min(1.0, math.sqrt(a)))


def longueurs_cumulees(coords):
    cum = [0.0]
    for (la1, lo1), (la2, lo2) in zip(coords, coords[1:]):
        cum.append(cum[-1] + haversine(la1, lo1, la2, lo2))
    return cum


def point_a(coords, cum, d):
    """Point à la distance curviligne d (bornée) le long de la polyligne."""
    if d <= 0:
        return coords[0], 0
    if d >= cum[-1]:
        return coords[-1], len(coords) - 1
    i = int(np.searchsorted(cum, d, side="right")) - 1
    seg = cum[i + 1] - cum[i]
    t = 0.0 if seg == 0 else (d - cum[i]) / seg
    la = coords[i][0] + t * (coords[i + 1][0] - coords[i][0])
    lo = coords[i][1] + t * (coords[i + 1][1] - coords[i][1])
    return (la, lo), i


def couper(coords, d0, d1):
    """Sous-polyligne entre les distances curvilignes d0 et d1."""
    cum = longueurs_cumulees(coords)
    p0, i0 = point_a(coords, cum, d0)
    p1, i1 = point_a(coords, cum, d1)
    mid = [c for k, c in enumerate(coords) if cum[k] > d0 and cum[k] < d1]
    return [p0] + mid + [p1]


def douglas_peucker(coords, tol_m):
    if len(coords) < 3:
        return list(coords)
    lat0 = math.radians(coords[0][0])
    kx = math.cos(lat0) * math.pi / 180 * R_TERRE
    ky = math.pi / 180 * R_TERRE
    pts = np.array([[c[1] * kx, c[0] * ky] for c in coords])
    garder = np.zeros(len(pts), dtype=bool)
    garder[0] = garder[-1] = True
    pile = [(0, len(pts) - 1)]
    while pile:
        a, b = pile.pop()
        if b - a < 2:
            continue
        ab = pts[b] - pts[a]
        n = np.hypot(*ab)
        seg = pts[a + 1:b] - pts[a]
        if n == 0:
            d = np.hypot(seg[:, 0], seg[:, 1])
        else:
            d = np.abs(ab[0] * seg[:, 1] - ab[1] * seg[:, 0]) / n
        k = int(np.argmax(d))
        if d[k] > tol_m:
            m = a + 1 + k
            garder[m] = True
            pile += [(a, m), (m, b)]
    return [c for c, g in zip(coords, garder) if g]


def wkb_linestring(buf):
    """Décode un LineString WKB 2D (le seul type de la couche segment)."""
    bo = "<" if buf[0] == 1 else ">"
    (typ,) = struct.unpack_from(bo + "I", buf, 1)
    if typ % 1000 != 2:
        return None
    (n,) = struct.unpack_from(bo + "I", buf, 5)
    xy = struct.unpack_from(bo + "%dd" % (2 * n), buf, 9)
    return [(xy[2 * k + 1], xy[2 * k]) for k in range(n)]  # (lat, lon)


# ---------------------------------------------------------------- 1. Overture

def boite_zone(centre, rayon_km, marge_km=0.3):
    r = rayon_km + marge_km
    dlat = r / 111.2
    dlon = r / (111.32 * math.cos(math.radians(centre[0])))
    return centre[1] - dlon, centre[1] + dlon, centre[0] - dlat, centre[0] + dlat


def lister_fichiers(release):
    pfx = f"release/{release}/theme=transportation/type=segment/"
    cles, jeton = [], None
    while True:
        url = f"{OVERTURE}?list-type=2&prefix={pfx}"
        if jeton:
            url += "&continuation-token=" + requests.utils.quote(jeton, safe="")
        xml = requests.get(url, timeout=60).text
        cles += re.findall(r"<Key>([^<]*\.parquet)</Key>", xml)
        m = re.search(r"<NextContinuationToken>([^<]*)</NextContinuationToken>", xml)
        if not m:
            return cles
        jeton = m.group(1)


def telecharger_segments(cfg):
    import fsspec
    import pyarrow.parquet as pq

    release = cfg["overtureRelease"]
    xmin, xmax, ymin, ymax = boite_zone(cfg["center"], cfg["radiusKm"])
    cle_cache = CACHE / f"overture-{release}-{xmin:.3f}-{ymin:.3f}-{xmax:.3f}-{ymax:.3f}.json.gz"
    if cle_cache.exists():
        print(f"[overture] cache : {cle_cache.name}")
        with gzip.open(cle_cache, "rt") as f:
            return json.load(f)

    fs = fsspec.filesystem("https")
    cles = lister_fichiers(release)
    print(f"[overture] {len(cles)} fichiers dans la release {release}")
    colonnes = ["id", "subtype", "class", "subclass", "connectors", "geometry",
                "bbox", "access_restrictions"]
    segments = []
    t0 = time.time()
    for k, cle in enumerate(cles):
        with fs.open(OVERTURE + cle, block_size=1 << 20) as f:
            pf = pq.ParquetFile(f)
            md = pf.metadata
            idx = {md.row_group(0).column(i).path_in_schema: i
                   for i in range(md.row_group(0).num_columns)}
            groupes = []
            for g in range(md.num_row_groups):
                rg = md.row_group(g)
                st = {n: rg.column(idx[f"bbox.{n}"]).statistics for n in ("xmin", "xmax", "ymin", "ymax")}
                if any(s is None or not s.has_min_max for s in st.values()):
                    groupes.append(g)
                    continue
                if st["xmin"].min <= xmax and st["xmax"].max >= xmin and \
                   st["ymin"].min <= ymax and st["ymax"].max >= ymin:
                    groupes.append(g)
            if not groupes:
                continue
            table = pf.read_row_groups(groupes, columns=colonnes)
        for row in table.to_pylist():
            b = row["bbox"]
            if b["xmax"] < xmin or b["xmin"] > xmax or b["ymax"] < ymin or b["ymin"] > ymax:
                continue
            if row["subtype"] != "road":
                continue
            coords = wkb_linestring(row["geometry"])
            if not coords or len(coords) < 2:
                continue
            segments.append({
                "id": row["id"], "class": row["class"], "subclass": row["subclass"],
                "connectors": [(c["connector_id"], c["at"]) for c in (row["connectors"] or [])],
                "coords": coords,
                "access": row["access_restrictions"],
            })
        print(f"[overture] {k + 1}/{len(cles)} : {len(groupes)} groupe(s) lu(s), "
              f"{len(segments)} segments ({time.time() - t0:.0f} s)")
    CACHE.mkdir(exist_ok=True)
    with gzip.open(cle_cache, "wt") as f:
        json.dump(segments, f)
    return segments


def interdit_aux_pietons(access):
    for r in access or []:
        if r.get("access_type") != "denied":
            continue
        when = r.get("when") or {}
        modes = when.get("mode") or []
        if when.get("during") or when.get("heading"):
            continue  # restriction partielle : ignorée pour le POC
        if not modes or "foot" in modes:
            return True
    return False


def prive(access):
    """Accès réservé (access=private d'OSM, rendu « allowed as_private » par Overture)."""
    for r in access or []:
        when = r.get("when") or {}
        modes = when.get("mode") or []
        if "as_private" in (when.get("recognized") or []) and (not modes or "foot" in modes):
            return True
    return False


def saut_aberrant(coords):
    """Un pas droit de plus de SAUT_MAX_M entre deux sommets : erreur de saisie."""
    return any(haversine(*coords[i], *coords[i + 1]) > SAUT_MAX_M for i in range(len(coords) - 1))


def type_arete(cls, sous_classe):
    if cls in CLASSES_SENTIER and sous_classe not in SOUS_CLASSES_URBAINES:
        return 1  # sentier
    return 0  # route


# --------------------------------------------------------------- 2. altitude

def flou_gaussien(t, sigma):
    """Flou gaussien séparable ; les vides (NaN) ne contaminent pas leurs voisins."""
    r = int(math.ceil(3 * sigma))
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2)
    k /= k.sum()
    val = np.nan_to_num(t)
    poids = (~np.isnan(t)).astype(np.float32)
    for axe in (0, 1):
        val = np.apply_along_axis(lambda v: np.convolve(v, k, mode="same"), axe, val)
        poids = np.apply_along_axis(lambda v: np.convolve(v, k, mode="same"), axe, poids)
    with np.errstate(invalid="ignore", divide="ignore"):
        return np.where(poids > 0.5, val / poids, np.nan).astype(np.float32)


class MntSrtm:
    """MNT SRTM 1" (3601 × 3601 entiers 16 bits gros-boutistes par degré).

    Le SRTM est un modèle de surface bruité (± quelques mètres d'un pixel à
    l'autre, bâtiments et canopée compris) : sommé tous les 30 m, ce bruit
    gonfle le D+ sur terrain plat. Un flou gaussien léger le retire sans
    toucher aux pentes réelles, plus longues que quelques pixels.
    """

    def __init__(self, sigma=1.5):
        self.tuiles = {}
        self.sigma = sigma

    def _tuile(self, lat_i, lon_i):
        cle = (lat_i, lon_i)
        if cle not in self.tuiles:
            ns = "N" if lat_i >= 0 else "S"
            ew = "E" if lon_i >= 0 else "W"
            nom = f"{ns}{abs(lat_i):02d}{ew}{abs(lon_i):03d}"
            chemin = CACHE / f"{nom}.hgt.gz"
            if not chemin.exists():
                print(f"[srtm] téléchargement {nom}")
                r = requests.get(f"{SKADI}{nom[:3]}/{nom}.hgt.gz", timeout=300)
                r.raise_for_status()
                CACHE.mkdir(exist_ok=True)
                chemin.write_bytes(r.content)
            brut = gzip.decompress(chemin.read_bytes())
            n = int(round(math.sqrt(len(brut) // 2)))
            t = np.frombuffer(brut, dtype=">i2").reshape(n, n).astype(np.float32)
            t[t < -1000] = np.nan  # vides
            if self.sigma > 0:
                t = flou_gaussien(t, self.sigma)
            self.tuiles[cle] = t
        return self.tuiles[cle]

    def altitudes(self, pts):
        out = np.empty(len(pts), dtype=np.float64)
        for k, (lat, lon) in enumerate(pts):
            li, lo = math.floor(lat), math.floor(lon)
            t = self._tuile(li, lo)
            n = t.shape[0] - 1
            y = (li + 1 - lat) * n
            x = (lon - lo) * n
            y0, x0 = min(int(y), n - 1), min(int(x), n - 1)
            fy, fx = y - y0, x - x0
            v = (t[y0, x0] * (1 - fx) * (1 - fy) + t[y0, x0 + 1] * fx * (1 - fy)
                 + t[y0 + 1, x0] * (1 - fx) * fy + t[y0 + 1, x0 + 1] * fx * fy)
            out[k] = v
        return out


class MntIgn:
    """Service altimétrique IGN (RGE ALTI), interrogé par lots avec cache disque."""

    LOT = 4000

    def __init__(self):
        self.chemin = CACHE / "ign-alti.json.gz"
        self.cache = {}
        if self.chemin.exists():
            with gzip.open(self.chemin, "rt") as f:
                self.cache = json.load(f)

    @staticmethod
    def _cle(lat, lon):
        return f"{lat:.5f},{lon:.5f}"

    def altitudes(self, pts):
        manquants = sorted({self._cle(a, b) for a, b in pts} - self.cache.keys())
        for i in range(0, len(manquants), self.LOT):
            lot = manquants[i:i + self.LOT]
            lats = "|".join(c.split(",")[0] for c in lot)
            lons = "|".join(c.split(",")[1] for c in lot)
            for essai in range(4):
                try:
                    r = requests.post(IGN_URL, data={
                        "lon": lons, "lat": lats, "resource": "ign_rge_alti_wld",
                        "zonly": "true", "delimiter": "|"}, timeout=120)
                    r.raise_for_status()
                    z = r.json()["elevations"]
                    break
                except Exception:
                    if essai == 3:
                        raise
                    time.sleep(2 ** (essai + 1))
            for c, v in zip(lot, z):
                self.cache[c] = None if v is None or v <= -9999 else float(v)
            print(f"[ign] {min(i + self.LOT, len(manquants))}/{len(manquants)} points")
        if manquants:
            CACHE.mkdir(exist_ok=True)
            with gzip.open(self.chemin, "wt") as f:
                json.dump(self.cache, f)
        return np.array([np.nan if self.cache[self._cle(a, b)] is None
                         else self.cache[self._cle(a, b)] for a, b in pts])


def choisir_mnt(mode, sigma):
    if mode in ("ign", "auto"):
        try:
            MntIgn().altitudes([(45.8992, 6.1294)])
            print("[mnt] IGN Géoplateforme (RGE ALTI)")
            return MntIgn(), "IGN RGE ALTI (Géoplateforme)"
        except Exception as e:
            if mode == "ign":
                raise
            print(f"[mnt] IGN injoignable ({type(e).__name__}) : repli sur SRTM 1\"")
    return MntSrtm(sigma), f"SRTM 1\" (AWS Terrain Tiles), flou gaussien σ = {sigma} px"


# ------------------------------------------------------------------ 3. graphe

def construire_aretes(segments, centre, rayon_km):
    """Découpe chaque segment à ses connecteurs ; garde ce qui est dans le rayon."""
    rayon_m = rayon_km * 1000
    aretes = []  # (connA, connB, coords, type)
    pos = {}
    ignores = defaultdict(int)
    for s in segments:
        cls = s["class"]
        if cls not in CLASSES_ROUTE and cls not in CLASSES_SENTIER:
            ignores[cls] += 1
            continue
        if interdit_aux_pietons(s["access"]):
            ignores["interdit"] += 1
            continue
        if prive(s["access"]):
            ignores["privé"] += 1
            continue
        if s["subclass"] in SOUS_CLASSES_EXCLUES:
            ignores[s["subclass"]] += 1
            continue
        if cls in CLASSES_SENTIER | {"cycleway", "pedestrian"} and saut_aberrant(s["coords"]):
            ignores["saut aberrant"] += 1
            continue
        conns = sorted(s["connectors"], key=lambda c: c[1])
        if len(conns) < 2:
            continue
        coords = s["coords"]
        lg = longueurs_cumulees(coords)[-1]
        t = type_arete(cls, s["subclass"])
        for (ca, at_a), (cb, at_b) in zip(conns, conns[1:]):
            if ca == cb:
                continue
            morceau = couper(coords, at_a * lg, at_b * lg)
            pos.setdefault(ca, morceau[0])
            pos.setdefault(cb, morceau[-1])
            if haversine(*centre, *pos[ca]) > rayon_m or haversine(*centre, *pos[cb]) > rayon_m:
                continue
            aretes.append([ca, cb, morceau, t])
    print(f"[graphe] {len(aretes)} arêtes brutes ; ignorés : {dict(ignores)}")
    return aretes


def plus_grande_composante(aretes):
    parent = {}

    def trouver(x):
        parent.setdefault(x, x)
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b, *_ in aretes:
        ra, rb = trouver(a), trouver(b)
        if ra != rb:
            parent[ra] = rb
    taille = defaultdict(int)
    for a, *_ in aretes:
        taille[trouver(a)] += 1
    racine = max(taille, key=taille.get)
    garde = [e for e in aretes if trouver(e[0]) == racine]
    print(f"[graphe] plus grande composante : {len(garde)}/{len(aretes)} arêtes")
    return garde


def fusionner_degre_2(aretes):
    """Fusionne les nœuds de degré 2 reliant deux arêtes de même type.

    Ne crée jamais de boucle sur un nœud (a == b) : une boucle fermée
    accrochée au réseau par un seul nœud reste en deux arêtes, sinon le
    routage ne pourrait plus l'emprunter.
    """
    vivantes = {i: e for i, e in enumerate(aretes)}
    incid = defaultdict(set)
    for i, (a, b, _, _) in vivantes.items():
        incid[a].add(i)
        incid[b].add(i)
    suivant = len(aretes)
    file = [n for n, s in incid.items() if len(s) == 2]
    while file:
        n = file.pop()
        s = incid.get(n)
        if not s or len(s) != 2:
            continue
        i, j = tuple(s)
        ei, ej = vivantes[i], vivantes[j]
        if ei[3] != ej[3]:
            continue
        # orienter ei pour finir en n, ej pour commencer en n
        ci = ei[2] if ei[1] == n else ei[2][::-1]
        ai = ei[0] if ei[1] == n else ei[1]
        cj = ej[2] if ej[0] == n else ej[2][::-1]
        bj = ej[1] if ej[0] == n else ej[0]
        if ai == bj or ai == n or bj == n:
            continue
        nouvelle = [ai, bj, ci + cj[1:], ei[3]]
        del vivantes[i], vivantes[j]
        for x in (ai, bj):
            incid[x].discard(i)
            incid[x].discard(j)
        del incid[n]
        vivantes[suivant] = nouvelle
        incid[ai].add(suivant)
        incid[bj].add(suivant)
        suivant += 1
        for x in (ai, bj):
            if len(incid[x]) == 2:
                file.append(x)
    res = list(vivantes.values())
    print(f"[graphe] fusion des nœuds de degré 2 : {len(aretes)} → {len(res)} arêtes")
    return res


def echantillons(coords, pas):
    cum = longueurs_cumulees(coords)
    lg = cum[-1]
    n = max(1, int(math.ceil(lg / pas)))
    return [point_a(coords, cum, lg * k / n)[0] for k in range(n + 1)], lg


def denivele(z):
    z = z[~np.isnan(z)]
    if len(z) < 2:
        return 0.0, 0.0
    d = np.diff(z)
    return float(d[d > 0].sum()), float(-d[d < 0].sum())


# ----------------------------------------------------------------- 4-5. export

def exporter(aretes, mnt, nom_mnt, cfg, sortie):
    ids = {}
    pos = {}
    for a, b, coords, _ in aretes:
        for n, p in ((a, coords[0]), (b, coords[-1])):
            if n not in ids:
                ids[n] = len(ids)
                pos[n] = p
    noeuds = [None] * len(ids)
    for n, i in ids.items():
        noeuds[i] = pos[n]

    # Tous les points à altitude, en un seul appel au MNT (lots IGN).
    points, plan = [], []
    simplifiees = []
    for a, b, coords, _ in aretes:
        ech, lg = echantillons(coords, PAS_ECHANTILLON_M)
        simp = douglas_peucker(coords, TOLERANCE_SIMPLIF_M)
        simplifiees.append(simp)
        plan.append((len(points), len(ech), len(points) + len(ech), len(simp), lg))
        points += ech + simp
    q = lambda p: (round(p[0], 5), round(p[1], 5))
    points = [q(p) for p in points]
    noeuds_q = [q(p) for p in noeuds]
    print(f"[mnt] {len(points) + len(noeuds_q)} altitudes à obtenir")
    z_tous = mnt.altitudes(points + noeuds_q)
    z = z_tous[:len(points)]
    z_noeuds = z_tous[len(points):]

    A, B, L, UP_AB, UP_BA, T, G = [], [], [], [], [], [], []
    for (a, b, coords, t), (d0, n0, d1, n1, lg), simp in zip(aretes, plan, simplifiees):
        up, down = denivele(z[d0:d0 + n0])
        A.append(ids[a]); B.append(ids[b]); T.append(t)
        L.append(int(round(lg * 10)))
        UP_AB.append(int(round(up * 10))); UP_BA.append(int(round(down * 10)))
        # géométrie intérieure : delta (1e-5 °) depuis le point précédent + altitude (m)
        zs = z[d1:d1 + n1]
        flat, prev = [], (int(round(simp[0][0] * 1e5)), int(round(simp[0][1] * 1e5)))
        for p, zz in zip(simp[1:-1], zs[1:-1]):
            cur = (int(round(p[0] * 1e5)), int(round(p[1] * 1e5)))
            flat += [cur[0] - prev[0], cur[1] - prev[1], 0 if np.isnan(zz) else int(round(zz))]
            prev = cur
        G.append(flat)

    flat_noeuds, prev = [], (0, 0)
    for p in noeuds:
        cur = (int(round(p[0] * 1e5)), int(round(p[1] * 1e5)))
        flat_noeuds += [cur[0] - prev[0], cur[1] - prev[1]]
        prev = cur

    doc = {
        "v": 1,
        "meta": {
            "zone": cfg["name"], "center": cfg["center"], "radiusKm": cfg["radiusKm"],
            "reseau": f"Overture Maps {cfg['overtureRelease']} (transportation, données © OpenStreetMap, ODbL)",
            "mnt": nom_mnt, "pasEchantillonM": PAS_ECHANTILLON_M,
            "noeuds": len(noeuds), "aretes": len(aretes),
        },
        "nodes": flat_noeuds,
        "nodeEle": [0 if np.isnan(v) else int(round(v)) for v in z_noeuds],
        "edges": {"a": A, "b": B, "len": L, "upAB": UP_AB, "upBA": UP_BA, "type": T},
        "geom": G,
    }
    brut = json.dumps(doc, separators=(",", ":")).encode()
    sortie.parent.mkdir(parents=True, exist_ok=True)
    with open(sortie, "wb") as f:
        f.write(gzip.compress(brut, 9, mtime=0))
    km = sum(L) / 1e4
    print(f"[export] {sortie} :{len(noeuds)} nœuds, {len(aretes)} arêtes, "
          f"{km:.0f} km de réseau, {len(brut) / 1e6:.1f} Mo brut → {sortie.stat().st_size / 1e6:.2f} Mo gzip")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--config", default=str(ROOT / "config" / "zone.json"))
    ap.add_argument("--dem", choices=["auto", "ign", "srtm"], default="auto")
    ap.add_argument("--out", default=str(ROOT / "public" / "data" / "zone.json.gz"))
    ap.add_argument("--lissage", type=float, default=1.5,
                    help="sigma du flou gaussien appliqué au SRTM, en pixels (0 = aucun)")
    args = ap.parse_args()
    cfg = json.loads(Path(args.config).read_text())
    centre = tuple(cfg["center"])

    segments = telecharger_segments(cfg)
    aretes = construire_aretes(segments, centre, cfg["radiusKm"])
    aretes = plus_grande_composante(aretes)
    aretes = fusionner_degre_2(aretes)
    mnt, nom_mnt = choisir_mnt(args.dem, args.lissage)
    exporter(aretes, mnt, nom_mnt, cfg, Path(args.out))


if __name__ == "__main__":
    sys.exit(main())
