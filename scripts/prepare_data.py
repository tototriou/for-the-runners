#!/usr/bin/env python3
"""Prépare le graphe piéton des régions de Boucle D+, découpé en tuiles.

Étapes, par région (config/regions.json) :
  1. Segments de voirie Overture Maps (couche « transportation », issue
     d'OpenStreetMap, licence ODbL) lus directement sur S3 par requêtes HTTP
     partielles : seuls les groupes de lignes qui recoupent la région sont lus.
  2. Filtres piétons, découpage aux connecteurs, composantes connexes,
     fusion des nœuds de degré 2 (jamais à cheval sur deux tuiles).
  3. Altitude : service altimétrique IGN de la Géoplateforme, par lots, avec
     cache ; repli automatique sur le MNT SRTM 1" (tuiles « skadi » d'AWS).
  4. Par arête : longueur, D+ dans chaque sens (altitude échantillonnée tous
     les 30 m), type (route / sentier), géométrie simplifiée avec altitudes.
  5. Export : une tuile JSON gzip par case de la grille globale
     (TUILE_LAT × TUILE_LON degrés) + public/data/manifest.json.

Une arête est rangée dans la tuile de son premier nœud ; les nœuds portent
un identifiant unique dans la région, pour que le navigateur recolle les
tuiles sans créer de fausse jonction (pont au-dessus d'une route).

Usage : python3 scripts/prepare_data.py [annecy alsace idf] [--dem auto|ign|srtm]
"""
from __future__ import annotations

import argparse
import gzip
import json
import math
import pickle
import re
import shutil
import struct
import sys
import time
from collections import defaultdict
from pathlib import Path

import numpy as np
import requests

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".cache"
DATA = ROOT / "public" / "data"
OVERTURE = "https://overturemaps-us-west-2.s3.amazonaws.com/"
SKADI = "https://s3.amazonaws.com/elevation-tiles-prod/skadi/"
IGN_URL = "https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json"

# Grille globale des tuiles (≈ 11 × 11,5 km à 46° N). Partagée avec
# src/core/tiles.ts : à changer des deux côtés.
TUILE_LAT = 0.1
TUILE_LON = 0.15

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
# vrais chemins rectilignes relevés autour d'Annecy ne dépassent pas 600 m.
SAUT_MAX_M = 1000.0
# Une composante plus petite est un îlot (parc fermé, réseau coupé par le
# bord de la région) : inutilisable pour une boucle.
COMPOSANTE_MIN_ARETES = 300

PAS_ECHANTILLON_M = 30.0
# 1 m : au-delà, les lacets des sentiers étaient coupés à l'écran et dans
# le GPX (la montre mesurait jusqu'à 35 % de moins sur un tronçon en zigzag).
TOLERANCE_SIMPLIF_M = 1.0
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


def couper(coords, cum, d0, d1):
    """Sous-polyligne entre les distances curvilignes d0 et d1."""
    p0, _ = point_a(coords, cum, d0)
    p1, _ = point_a(coords, cum, d1)
    mid = [c for k, c in enumerate(coords) if d0 < cum[k] < d1]
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


def tuile_de(lat, lon):
    return f"{math.floor(lat / TUILE_LAT)}_{math.floor(lon / TUILE_LON)}"


def dans_boite(lat, lon, bbox):
    return bbox[0] <= lon <= bbox[2] and bbox[1] <= lat <= bbox[3]


# ------------------------------------------------------------------- filtres

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


def raison_exclusion(cls, sous_classe, access, coords):
    if cls not in CLASSES_ROUTE and cls not in CLASSES_SENTIER:
        return cls
    if interdit_aux_pietons(access):
        return "interdit"
    if prive(access):
        return "privé"
    if sous_classe in SOUS_CLASSES_EXCLUES:
        return sous_classe
    if cls in CLASSES_SENTIER | {"cycleway", "pedestrian"} and saut_aberrant(coords):
        return "saut aberrant"
    return None


def type_arete(cls, sous_classe):
    if cls in CLASSES_SENTIER and sous_classe not in SOUS_CLASSES_URBAINES:
        return 1  # sentier
    return 0  # route


# ---------------------------------------------------------------- 1. Overture

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


def charger_aretes_brutes(region, release):
    """Arêtes de connecteur à connecteur de la région, filtres piétons appliqués.

    Traite les fichiers Overture un par un sans garder les segments bruts :
    la mémoire ne contient que les arêtes retenues. Résultat mis en cache.
    """
    import fsspec
    import pyarrow.parquet as pq

    bbox = region["bbox"]
    cle = CACHE / f"aretes-{region['id']}-{release}-{'_'.join(f'{v:.3f}' for v in bbox)}.pkl.gz"
    if cle.exists():
        print(f"[overture] cache : {cle.name}")
        with gzip.open(cle, "rb") as f:
            return pickle.load(f)

    xmin, ymin, xmax, ymax = bbox
    fs = fsspec.filesystem("https")
    fichiers = lister_fichiers(release)
    colonnes = ["subtype", "class", "subclass", "connectors", "geometry", "bbox", "access_restrictions"]
    aretes = []  # [connA, connB, coords, type]
    exclus = defaultdict(int)
    t0 = time.time()
    for k, cle_f in enumerate(fichiers):
        with fs.open(OVERTURE + cle_f, block_size=1 << 20) as f:
            pf = pq.ParquetFile(f)
            md = pf.metadata
            idx = {md.row_group(0).column(i).path_in_schema: i for i in range(md.row_group(0).num_columns)}
            groupes = []
            for g in range(md.num_row_groups):
                rg = md.row_group(g)
                st = {n: rg.column(idx[f"bbox.{n}"]).statistics for n in ("xmin", "xmax", "ymin", "ymax")}
                if any(s is None or not s.has_min_max for s in st.values()):
                    groupes.append(g)
                elif (st["xmin"].min <= xmax and st["xmax"].max >= xmin
                      and st["ymin"].min <= ymax and st["ymax"].max >= ymin):
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
            raison = raison_exclusion(row["class"], row["subclass"], row["access_restrictions"], coords)
            if raison:
                exclus[raison] += 1
                continue
            conns = sorted(((c["connector_id"], c["at"]) for c in (row["connectors"] or [])), key=lambda c: c[1])
            if len(conns) < 2:
                continue
            cum = longueurs_cumulees(coords)
            lg = cum[-1]
            t = type_arete(row["class"], row["subclass"])
            for (ca, at_a), (cb, at_b) in zip(conns, conns[1:]):
                if ca == cb:
                    continue
                morceau = couper(coords, cum, at_a * lg, at_b * lg)
                # Rangée dans la tuile de son premier nœud : ce nœud doit être
                # dans la région, l'autre peut déborder.
                if not dans_boite(*morceau[0], bbox) and not dans_boite(*morceau[-1], bbox):
                    continue
                if not dans_boite(*morceau[0], bbox):
                    ca, cb, morceau = cb, ca, morceau[::-1]
                aretes.append([ca, cb, morceau, t])
        print(f"[overture] {region['id']} {k + 1}/{len(fichiers)} : {len(groupes)} groupe(s), "
              f"{len(aretes)} arêtes ({time.time() - t0:.0f} s)", flush=True)
    print(f"[overture] exclus : {dict(exclus)}")
    CACHE.mkdir(exist_ok=True)
    with gzip.open(cle, "wb", compresslevel=3) as f:
        pickle.dump(aretes, f, protocol=pickle.HIGHEST_PROTOCOL)
    return aretes


# ------------------------------------------------------------------ 2. graphe

def garder_grandes_composantes(aretes):
    parent = {}

    def trouver(x):
        parent.setdefault(x, x)
        r = x
        while parent[r] != r:
            r = parent[r]
        while parent[x] != r:
            parent[x], x = r, parent[x]
        return r

    for a, b, *_ in aretes:
        ra, rb = trouver(a), trouver(b)
        if ra != rb:
            parent[ra] = rb
    taille = defaultdict(int)
    for a, *_ in aretes:
        taille[trouver(a)] += 1
    grandes = {r for r, n in taille.items() if n >= COMPOSANTE_MIN_ARETES}
    garde = [e for e in aretes if trouver(e[0]) in grandes]
    print(f"[graphe] {len(grandes)} composante(s) ≥ {COMPOSANTE_MIN_ARETES} arêtes : "
          f"{len(garde)}/{len(aretes)} arêtes gardées")
    return garde


def fusionner_degre_2(aretes):
    """Fusionne les nœuds de degré 2 reliant deux arêtes de même type.

    Jamais de boucle sur un nœud (a == b) : une boucle fermée accrochée au
    réseau par un seul nœud reste en deux arêtes, sinon le routage ne
    pourrait plus l'emprunter. Jamais à cheval sur deux tuiles : la
    fusion n'a lieu que si ses trois nœuds sont dans la même tuile.
    """
    vivantes = dict(enumerate(aretes))
    incid = defaultdict(set)
    pos = {}
    for i, (a, b, c, _) in vivantes.items():
        incid[a].add(i)
        incid[b].add(i)
        pos.setdefault(a, c[0])
        pos.setdefault(b, c[-1])
    tuile = {n: tuile_de(*p) for n, p in pos.items()}
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
        ci = ei[2] if ei[1] == n else ei[2][::-1]
        ai = ei[0] if ei[1] == n else ei[1]
        cj = ej[2] if ej[0] == n else ej[2][::-1]
        bj = ej[1] if ej[0] == n else ej[0]
        if ai == bj or ai == n or bj == n:
            continue
        if not (tuile[ai] == tuile[n] == tuile[bj]):
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


# --------------------------------------------------------------- 3. altitude

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

    def altitudes(self, lat, lon):
        """Interpolation bilinéaire, vectorisée tuile SRTM par tuile SRTM."""
        out = np.full(len(lat), np.nan)
        li = np.floor(lat).astype(int)
        lo = np.floor(lon).astype(int)
        for a, b in set(zip(li.tolist(), lo.tolist())):
            m = (li == a) & (lo == b)
            t = self._tuile(a, b)
            n = t.shape[0] - 1
            y = (a + 1 - lat[m]) * n
            x = (lon[m] - b) * n
            y0 = np.minimum(y.astype(int), n - 1)
            x0 = np.minimum(x.astype(int), n - 1)
            fy, fx = y - y0, x - x0
            out[m] = (t[y0, x0] * (1 - fx) * (1 - fy) + t[y0, x0 + 1] * fx * (1 - fy)
                      + t[y0 + 1, x0] * (1 - fx) * fy + t[y0 + 1, x0 + 1] * fx * fy)
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

    def altitudes(self, lat, lon):
        cles = [f"{a:.5f},{b:.5f}" for a, b in zip(lat, lon)]
        manquants = sorted(set(cles) - self.cache.keys())
        for i in range(0, len(manquants), self.LOT):
            lot = manquants[i:i + self.LOT]
            for essai in range(4):
                try:
                    r = requests.post(IGN_URL, data={
                        "lat": "|".join(c.split(",")[0] for c in lot),
                        "lon": "|".join(c.split(",")[1] for c in lot),
                        "resource": "ign_rge_alti_wld", "zonly": "true", "delimiter": "|"}, timeout=120)
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
        return np.array([np.nan if self.cache[c] is None else self.cache[c] for c in cles])


def choisir_mnt(mode, sigma):
    if mode in ("ign", "auto"):
        try:
            MntIgn().altitudes(np.array([45.8992]), np.array([6.1294]))
            print("[mnt] IGN Géoplateforme (RGE ALTI)")
            return MntIgn(), "IGN RGE ALTI (Géoplateforme)"
        except Exception as e:
            if mode == "ign":
                raise
            print(f"[mnt] IGN injoignable ({type(e).__name__}) : repli sur SRTM 1\"")
    return MntSrtm(sigma), f"SRTM 1\" (AWS Terrain Tiles), flou gaussien σ = {sigma} px"


# ----------------------------------------------------------------- 4-5. export

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


def exporter_region(region, aretes, mnt, nom_mnt, release):
    t0 = time.time()
    # Identifiants de nœud uniques dans la région, positions.
    ids, pos = {}, {}
    for a, b, coords, _ in aretes:
        for n, p in ((a, coords[0]), (b, coords[-1])):
            if n not in ids:
                ids[n] = len(ids)
                pos[n] = p

    # Échantillons (D+) et sommets simplifiés (profil), puis un seul appel au MNT.
    lat_pts, lon_pts, plan = [], [], []
    for a, b, coords, _ in aretes:
        ech, lg = echantillons(coords, PAS_ECHANTILLON_M)
        simp = douglas_peucker(coords, TOLERANCE_SIMPLIF_M)
        d0 = len(lat_pts)
        for p in ech + simp:
            lat_pts.append(round(p[0], 5))
            lon_pts.append(round(p[1], 5))
        plan.append((d0, len(ech), simp, lg))
    noeuds = sorted(ids, key=ids.get)
    for n in noeuds:
        lat_pts.append(round(pos[n][0], 5))
        lon_pts.append(round(pos[n][1], 5))
    print(f"[mnt] {region['id']} : {len(lat_pts)} altitudes ({time.time() - t0:.0f} s)", flush=True)
    z = mnt.altitudes(np.array(lat_pts), np.array(lon_pts))
    z_noeuds = z[len(z) - len(noeuds):]
    z_noeud = {n: z_noeuds[k] for k, n in enumerate(noeuds)}

    # Répartition par tuile (celle du premier nœud).
    par_tuile = defaultdict(list)
    for e, (a, *_rest) in enumerate(aretes):
        par_tuile[tuile_de(*pos[a])].append(e)

    dossier = DATA / region["id"]
    if dossier.exists():
        shutil.rmtree(dossier)
    dossier.mkdir(parents=True)
    tuiles, total_km, total_octets = {}, 0.0, 0
    q = lambda v: int(round(v * 1e5))
    for nom, liste in sorted(par_tuile.items()):
        loc = {}
        ids_loc = []
        for e in liste:
            for n in aretes[e][:2]:
                if n not in loc:
                    loc[n] = len(loc)
                    ids_loc.append(n)
        flat_noeuds, prev = [], (0, 0)
        for n in ids_loc:
            cur = (q(pos[n][0]), q(pos[n][1]))
            flat_noeuds += [cur[0] - prev[0], cur[1] - prev[1]]
            prev = cur
        A, B, L, UP_AB, UP_BA, T, G = [], [], [], [], [], [], []
        for e in liste:
            a, b, coords, t = aretes[e]
            d0, n0, simp, lg = plan[e]
            up, down = denivele(z[d0:d0 + n0])
            A.append(loc[a]); B.append(loc[b]); T.append(t)
            L.append(int(round(lg * 10)))
            UP_AB.append(int(round(up * 10))); UP_BA.append(int(round(down * 10)))
            zs = z[d0 + n0:d0 + n0 + len(simp)]
            flat, prev = [], (q(simp[0][0]), q(simp[0][1]))
            for p, zz in zip(simp[1:-1], zs[1:-1]):
                cur = (q(p[0]), q(p[1]))
                flat += [cur[0] - prev[0], cur[1] - prev[1], 0 if np.isnan(zz) else int(round(zz))]
                prev = cur
            G.append(flat)
            total_km += lg / 1000
        doc = {
            "v": 2, "region": region["id"], "tile": nom,
            "ids": [ids[n] for n in ids_loc],
            "nodes": flat_noeuds,
            "nodeEle": [0 if np.isnan(z_noeud[n]) else int(round(z_noeud[n])) for n in ids_loc],
            "edges": {"a": A, "b": B, "len": L, "upAB": UP_AB, "upBA": UP_BA, "type": T},
            "geom": G,
        }
        brut = json.dumps(doc, separators=(",", ":")).encode()
        chemin = dossier / f"{nom}.json.gz"
        chemin.write_bytes(gzip.compress(brut, 9, mtime=0))
        tuiles[nom] = chemin.stat().st_size
        total_octets += tuiles[nom]

    lats = [p[0] for p in pos.values()]
    lons = [p[1] for p in pos.values()]
    meta = {
        "id": region["id"], "name": region["name"], "bbox": region["bbox"],
        "center": region.get("center", [(min(lats) + max(lats)) / 2, (min(lons) + max(lons)) / 2]),
        "reseau": f"Overture Maps {release} (transportation, données © OpenStreetMap, ODbL)",
        "mnt": nom_mnt, "aretes": len(aretes), "noeuds": len(ids),
        "km": round(total_km), "octets": total_octets, "tiles": tuiles,
    }
    print(f"[export] {region['id']} : {len(tuiles)} tuiles, {len(ids)} nœuds, {len(aretes)} arêtes, "
          f"{total_km:.0f} km, {total_octets / 1e6:.1f} Mo ({time.time() - t0:.0f} s)", flush=True)
    return meta


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("regions", nargs="*", help="identifiants à (re)générer ; défaut : toutes")
    ap.add_argument("--config", default=str(ROOT / "config" / "regions.json"))
    ap.add_argument("--dem", choices=["auto", "ign", "srtm"], default="auto")
    ap.add_argument("--lissage", type=float, default=1.5,
                    help="sigma du flou gaussien appliqué au SRTM, en pixels (0 = aucun)")
    args = ap.parse_args()
    cfg = json.loads(Path(args.config).read_text())
    release = cfg["overtureRelease"]
    choisies = args.regions or [r["id"] for r in cfg["regions"]]

    manifeste_chemin = DATA / "manifest.json"
    anciennes = {}
    if manifeste_chemin.exists():
        anciennes = {r["id"]: r for r in json.loads(manifeste_chemin.read_text())["regions"]}
    mnt, nom_mnt = choisir_mnt(args.dem, args.lissage)
    for region in cfg["regions"]:
        if region["id"] not in choisies:
            continue
        aretes = charger_aretes_brutes(region, release)
        aretes = garder_grandes_composantes(aretes)
        aretes = fusionner_degre_2(aretes)
        anciennes[region["id"]] = exporter_region(region, aretes, mnt, nom_mnt, release)

    manifeste = {
        "v": 2, "tileDeg": [TUILE_LAT, TUILE_LON],
        "regions": [anciennes[r["id"]] for r in cfg["regions"] if r["id"] in anciennes],
    }
    manifeste_chemin.write_text(json.dumps(manifeste, ensure_ascii=False, indent=1))
    print(f"[manifeste] {manifeste_chemin} : {[r['id'] for r in manifeste['regions']]}")


if __name__ == "__main__":
    sys.exit(main())
