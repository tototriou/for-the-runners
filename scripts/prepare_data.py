#!/usr/bin/env python3
"""Prépare le graphe piéton des régions de Boucle D+, découpé en tuiles.

Étapes, par région (config/regions.json) :
  1. Segments de voirie Overture Maps (couche « transportation », issue
     d'OpenStreetMap, licence ODbL) lus directement sur S3 par requêtes HTTP
     partielles : seuls les groupes de lignes qui recoupent la région sont lus.
  2. Filtres piétons, découpage aux connecteurs, composantes connexes,
     fusion des nœuds de degré 2 (jamais à cheval sur deux tuiles).
  3. Altitude : RGE ALTI 5 m de l'IGN (sol nu), téléchargé par département
     (champ « rgealti » de la région) ; SRTM 1" (AWS) hors de France ou si
     l'IGN est injoignable.
  4. Par arête : longueur, D+ dans chaque sens (altitude échantillonnée tous
     les 30 m), type (route / sentier), part de la longueur dans un parc ou
     jardin public (couche Overture « land_use »), géométrie simplifiée avec
     altitudes.
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
# Code de classe écrit dans les tuiles (champ « cls ») : l'indice dans cette
# liste. Partagée avec src/core/graph.ts (CLASSES) : à changer des deux côtés.
CLASSES = ["primary", "secondary", "tertiary", "residential", "living_street", "unclassified",
           "service", "pedestrian", "cycleway", "unknown", "path", "track", "footway", "steps", "bridleway"]
# Voies en travaux ou abandonnées : sur tout le segment, infranchissables.
DRAPEAUX_EXCLUS = {"is_under_construction", "is_abandoned"}
# Un trottoir ou un passage piéton reste urbain : classé route.
SOUS_CLASSES_URBAINES = {"sidewalk", "crosswalk"}
# Allées privées et de parking : réelles, mais le routage s'en servait de
# raccourcis entre deux rues, à travers des propriétés et des parkings.
SOUS_CLASSES_EXCLUES = {"driveway", "parking_aisle"}
# Trottoirs et passages piétons cartographiés à part doublent le réseau des
# villes (Paris : des centaines de milliers de nœuds) sans rien ouvrir au
# coureur, qui court sur la rue elle-même, déjà dans le graphe. Ils rendaient
# le calcul trop lent (jusqu'à 20 s) en plein Paris.
SOUS_CLASSES_EXCLUES |= {"sidewalk", "crosswalk"}
# Un sentier qui saute de plus d'un kilomètre d'un seul trait est une erreur
# de saisie (ex. un footway de 1,5 km en ligne droite à travers Annecy). Les
# vrais chemins rectilignes relevés autour d'Annecy ne dépassent pas 600 m.
SAUT_MAX_M = 1000.0
# Une composante plus petite est un îlot (parc fermé, réseau coupé par le
# bord de la région) : inutilisable pour une boucle.
COMPOSANTE_MIN_ARETES = 300

# Parcs et jardins ouverts au public (couche land_use d'Overture, issue d'OSM).
CLASSES_PARC = {"park", "garden", "village_green", "recreation_ground"}
# Accès qui ferment le parc au coureur.
ACCES_FERMES = {"private", "no", "customers", "permit", "disabled", "military", "delivery"}
# Un jardin sans nom ni accès déclaré est le plus souvent une cour ou un
# jardin d'immeuble (Paris : 1 250 sur 1 860) : il faut un nom ou un accès
# déclaré ouvert pour le compter.
ACCES_OUVERTS = {"yes", "public", "permissive", "designated"}

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


def raison_exclusion(cls, sous_classe, access, coords, drapeaux=None):
    if cls not in CLASSES_ROUTE and cls not in CLASSES_SENTIER:
        return cls
    for d in drapeaux or []:
        if d.get("between") is None and DRAPEAUX_EXCLUS & set(d.get("values") or []):
            return "travaux ou abandon"
    if interdit_aux_pietons(access):
        return "interdit"
    if prive(access):
        return "privé"
    if cls in CLASSES_SENTIER | {"cycleway", "pedestrian"} and saut_aberrant(coords):
        return "saut aberrant"
    return None


def type_arete(cls, sous_classe):
    if cls in CLASSES_SENTIER and sous_classe not in SOUS_CLASSES_URBAINES:
        return 1  # sentier
    return 0  # route


# ---------------------------------------------------------------- 1. Overture

def lister_fichiers(release, theme="transportation", type_="segment"):
    pfx = f"release/{release}/theme={theme}/type={type_}/"
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
    la mémoire ne contient que les arêtes retenues. Résultat mis en cache,
    sous-classe comprise : filtrer_sous_classes s'applique après le cache,
    pour qu'en changer ne demande pas de tout retélécharger.
    """
    import fsspec
    import pyarrow.parquet as pq

    bbox = region["bbox"]
    cle = CACHE / f"aretes3-{region['id']}-{release}-{'_'.join(f'{v:.3f}' for v in bbox)}.pkl.gz"
    if cle.exists():
        print(f"[overture] cache : {cle.name}")
        with gzip.open(cle, "rb") as f:
            return pickle.load(f)

    xmin, ymin, xmax, ymax = bbox
    fs = fsspec.filesystem("https")
    fichiers = lister_fichiers(release)
    colonnes = ["subtype", "class", "subclass", "connectors", "geometry", "bbox", "access_restrictions", "road_flags"]
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
            raison = raison_exclusion(row["class"], row["subclass"], row["access_restrictions"], coords, row["road_flags"])
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
                aretes.append([ca, cb, morceau, t, row["subclass"], CLASSES.index(row["class"])])
        print(f"[overture] {region['id']} {k + 1}/{len(fichiers)} : {len(groupes)} groupe(s), "
              f"{len(aretes)} arêtes ({time.time() - t0:.0f} s)", flush=True)
    print(f"[overture] exclus : {dict(exclus)}")
    CACHE.mkdir(exist_ok=True)
    with gzip.open(cle, "wb", compresslevel=3) as f:
        pickle.dump(aretes, f, protocol=pickle.HIGHEST_PROTOCOL)
    return aretes


# ------------------------------------------------------------------ 2. graphe

def parc_public(cls, tags, nom):
    if cls not in CLASSES_PARC:
        return False
    acces = tags.get("access")
    if acces in ACCES_FERMES or tags.get("garden:type") in {"residential", "private"}:
        return False
    if cls == "garden":
        return bool(nom) or acces in ACCES_OUVERTS
    return True


def charger_parcs(region, release):
    """Polygones des parcs et jardins publics de la région (shapely), en cache."""
    import fsspec
    import pyarrow.parquet as pq
    import shapely

    bbox = region["bbox"]
    cle = CACHE / f"parcs1-{region['id']}-{release}-{'_'.join(f'{v:.3f}' for v in bbox)}.pkl.gz"
    if cle.exists():
        print(f"[parcs] cache : {cle.name}")
        with gzip.open(cle, "rb") as f:
            wkbs = pickle.load(f)
    else:
        xmin, ymin, xmax, ymax = bbox
        fs = fsspec.filesystem("https")
        wkbs, t0 = [], time.time()
        for cle_f in lister_fichiers(release, "base", "land_use"):
            with fs.open(OVERTURE + cle_f, block_size=1 << 20) as f:
                pf = pq.ParquetFile(f)
                md = pf.metadata
                idx = {md.row_group(0).column(i).path_in_schema: i for i in range(md.row_group(0).num_columns)}
                groupes = []
                for g in range(md.num_row_groups):
                    rg = md.row_group(g)
                    st = {n: rg.column(idx[f"bbox.{n}"]).statistics for n in ("xmin", "xmax", "ymin", "ymax")}
                    if any(x is None or not x.has_min_max for x in st.values()) or (
                            st["xmin"].min <= xmax and st["xmax"].max >= xmin
                            and st["ymin"].min <= ymax and st["ymax"].max >= ymin):
                        groupes.append(g)
                if not groupes:
                    continue
                table = pf.read_row_groups(groupes, columns=["class", "geometry", "bbox", "source_tags", "names"])
            for row in table.to_pylist():
                b = row["bbox"]
                if b["xmax"] < xmin or b["xmin"] > xmax or b["ymax"] < ymin or b["ymin"] > ymax:
                    continue
                if parc_public(row["class"], dict(row["source_tags"] or []), (row["names"] or {}).get("primary")):
                    wkbs.append(row["geometry"])
        print(f"[parcs] {region['id']} : {len(wkbs)} parcs et jardins publics ({time.time() - t0:.0f} s)", flush=True)
        CACHE.mkdir(exist_ok=True)
        with gzip.open(cle, "wb") as f:
            pickle.dump(wkbs, f)
    geoms = [g for g in shapely.from_wkb(wkbs) if g.geom_type in ("Polygon", "MultiPolygon")]
    union = shapely.union_all(shapely.make_valid(geoms)) if geoms else shapely.Polygon()
    shapely.prepare(union)
    return union


def filtrer_sous_classes(aretes):
    garde = [[a, b, c, t, cls] for a, b, c, t, sc, cls in aretes if sc not in SOUS_CLASSES_EXCLUES]
    print(f"[graphe] sous-classes exclues ({', '.join(sorted(SOUS_CLASSES_EXCLUES))}) : "
          f"{len(aretes) - len(garde)} arêtes retirées, {len(garde)} gardées")
    return garde


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
    """Fusionne les nœuds de degré 2 reliant deux arêtes de même type et classe.

    Jamais de boucle sur un nœud (a == b) : une boucle fermée accrochée au
    réseau par un seul nœud reste en deux arêtes, sinon le routage ne
    pourrait plus l'emprunter. Jamais à cheval sur deux tuiles : la
    fusion n'a lieu que si ses trois nœuds sont dans la même tuile.
    """
    vivantes = dict(enumerate(aretes))
    incid = defaultdict(set)
    pos = {}
    for i, (a, b, c, *_) in vivantes.items():
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
        if ei[3] != ej[3] or ei[4] != ej[4]:  # même type et même classe
            continue
        ci = ei[2] if ei[1] == n else ei[2][::-1]
        ai = ei[0] if ei[1] == n else ei[1]
        cj = ej[2] if ej[0] == n else ej[2][::-1]
        bj = ej[1] if ej[0] == n else ej[0]
        if ai == bj or ai == n or bj == n:
            continue
        if not (tuile[ai] == tuile[n] == tuile[bj]):
            continue
        nouvelle = [ai, bj, ci + cj[1:], ei[3], ei[4]]
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


class MntRgeAlti:
    """RGE ALTI® 5 m de l'IGN (relief du sol nu), téléchargé par département.

    Le SRTM mesure le dessus des toits et des arbres : en ville, le D+
    sortait gonflé (Paris, Strasbourg). Le RGE ALTI décrit le sol. Les
    archives (≈ 330 Mo en 7z par département) sont gardées en cache ; seules
    les dalles (5 × 5 km, ASC en Lambert 93) qui contiennent des points sont
    décompressées, lues puis effacées. Hors des départements donnés (pays
    voisins), les points restent NaN : repli SRTM dans MntComposite.

    L'API altimétrique de la Géoplateforme n'est pas utilisée : elle ne
    répond qu'à de petites requêtes GET, inexploitables pour des dizaines de
    millions de points.
    """

    ATOM = "https://data.geopf.fr/telechargement/resource/RGEALTI"

    def __init__(self, departements):
        self.departements = departements
        self.dossier = CACHE / "rgealti"

    @staticmethod
    def _curl(url, sortie=None, essais=4):
        # curl plutôt que requests : le service répond lentement et le proxy
        # de l'environnement de construction coupait les connexions requests.
        import subprocess
        r = None
        for essai in range(essais):
            cmd = ["curl", "-sS", "-f", "-L", "-m", "1800"]
            if sortie:
                cmd += ["-o", str(sortie)]
            r = subprocess.run(cmd + [url], capture_output=True)
            if r.returncode == 0:
                return None if sortie else r.stdout.decode("utf-8", "replace")
            time.sleep(3 * (essai + 1))
        raise RuntimeError(f"téléchargement impossible : {url} ({r.stderr.decode()[:200]})")

    def _archive(self, dep):
        """Chemin local de l'archive 5 m du département (téléchargée au besoin)."""
        self.dossier.mkdir(parents=True, exist_ok=True)
        deja = sorted(self.dossier.glob(f"RGEALTI_2-0_5M_ASC_*_{dep}_*.7z"))
        if deja:
            return deja[-1]
        atom = self._curl(f"{self.ATOM}?zone={dep}")
        noms = sorted(set(re.findall(r"<title>(RGEALTI_2-0_5M_ASC_[^<]*_" + dep + r"_[^<]*)</title>", atom)))
        if not noms:
            raise RuntimeError(f"pas de RGE ALTI 5 m pour {dep}")
        nom = noms[-1]
        detail = self._curl(f"{self.ATOM}/{nom}")
        liens = sorted(set(re.findall(r'href="([^"]+\.7z(?:\.\d+)?)"', detail)))
        if len(liens) != 1:
            raise RuntimeError(f"{nom} : archive en {len(liens)} parties, non prise en charge")
        chemin = self.dossier / f"{nom}.7z"
        print(f"[rgealti] téléchargement {nom}", flush=True)
        partiel = chemin.with_suffix(".part")
        self._curl(liens[0], sortie=partiel)
        partiel.rename(chemin)
        return chemin

    def altitudes(self, lat, lon):
        import shutil as sh
        import tempfile

        import py7zr
        from pyproj import Transformer

        x, y = Transformer.from_crs("EPSG:4326", "EPSG:2154", always_xy=True).transform(lon, lat)
        x = np.asarray(x)
        y = np.asarray(y)
        out = np.full(len(lat), np.nan)
        for dep in self.departements:
            archive = self._archive(dep)
            with py7zr.SevenZipFile(archive) as z:
                noms = [n for n in z.getnames() if n.lower().endswith(".asc")]
            # Nom de dalle : …_XXXX_YYYY_MNT_… (coin haut gauche, en km).
            a_faire = []
            for n in noms:
                m = re.search(r"_(\d{4})_(\d{4})_MNT", n)
                if not m:
                    continue
                x0, y1 = int(m.group(1)) * 1000, int(m.group(2)) * 1000
                if np.any((x >= x0) & (x < x0 + 5000) & (y <= y1) & (y > y1 - 5000) & np.isnan(out)):
                    a_faire.append(n)
            print(f"[rgealti] {dep} : {len(a_faire)}/{len(noms)} dalles utiles", flush=True)
            if not a_faire:
                continue
            CACHE.mkdir(exist_ok=True)
            tmp = Path(tempfile.mkdtemp(dir=CACHE))
            try:
                for i in range(0, len(a_faire), 40):
                    lot = a_faire[i:i + 40]
                    with py7zr.SevenZipFile(archive) as z:
                        z.extract(path=tmp, targets=lot)
                    for n in lot:
                        f = tmp / n
                        self._echantillonner(f, x, y, out)
                        f.unlink()
            finally:
                sh.rmtree(tmp, ignore_errors=True)
        manquants = int(np.isnan(out).sum())
        print(f"[rgealti] {len(out) - manquants}/{len(out)} points couverts", flush=True)
        return out

    @staticmethod
    def _echantillonner(fichier, x, y, out):
        """Interpolation bilinéaire des points de la dalle encore sans altitude."""
        with open(fichier) as f:
            entete = {}
            for _ in range(6):
                k, v = f.readline().split()
                entete[k.lower()] = float(v)
            t = np.array(f.read().split(), dtype=np.float32)
        nc, nl = int(entete["ncols"]), int(entete["nrows"])
        t = t.reshape(nl, nc)
        t[t <= entete.get("nodata_value", -99999)] = np.nan
        pas = entete["cellsize"]
        x0 = entete["xllcorner"] if "xllcorner" in entete else entete["xllcenter"] - pas / 2
        y0 = entete["yllcorner"] if "yllcorner" in entete else entete["yllcenter"] - pas / 2
        y1 = y0 + nl * pas
        m = (x >= x0) & (x < x0 + nc * pas) & (y > y0) & (y <= y1) & np.isnan(out)
        if not m.any():
            return
        # Ligne 0 = nord ; valeurs aux centres de cellule.
        fx = (x[m] - x0) / pas - 0.5
        fy = (y1 - y[m]) / pas - 0.5
        j0 = np.clip(np.floor(fx).astype(int), 0, nc - 2)
        i0 = np.clip(np.floor(fy).astype(int), 0, nl - 2)
        dx = np.clip(fx - j0, 0, 1)
        dy = np.clip(fy - i0, 0, 1)
        v = (t[i0, j0] * (1 - dx) * (1 - dy) + t[i0, j0 + 1] * dx * (1 - dy)
             + t[i0 + 1, j0] * (1 - dx) * dy + t[i0 + 1, j0 + 1] * dx * dy)
        idx = np.nonzero(m)[0]
        out[idx] = v


class MntComposite:
    """RGE ALTI là où il couvre, SRTM ailleurs (pays voisins, vides)."""

    def __init__(self, principal, repli):
        self.principal = principal
        self.repli = repli

    def altitudes(self, lat, lon):
        z = self.principal.altitudes(lat, lon)
        trous = np.isnan(z)
        if trous.any():
            z[trous] = self.repli.altitudes(lat[trous], lon[trous])
        return z


def choisir_mnt(mode, sigma, region):
    srtm = MntSrtm(sigma)
    nom_srtm = f"SRTM 1\" (AWS Terrain Tiles), flou gaussien σ = {sigma} px"
    deps = region.get("rgealti") or []
    if mode in ("ign", "auto") and deps:
        try:
            rge = MntRgeAlti(deps)
            rge._archive(deps[0])  # vérifie l'accès avant de tout lancer
            print(f"[mnt] RGE ALTI 5 m (IGN), départements {', '.join(deps)} ; SRTM hors de France")
            return MntComposite(rge, srtm), f"RGE ALTI 5 m (IGN) ; hors de France : {nom_srtm}"
        except Exception as e:
            if mode == "ign":
                raise
            print(f"[mnt] RGE ALTI indisponible ({type(e).__name__}: {e}) : repli sur SRTM")
    return srtm, nom_srtm


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


def exporter_region(region, aretes, mnt, nom_mnt, release, parcs):
    t0 = time.time()
    # Identifiants de nœud uniques dans la région, positions.
    ids, pos = {}, {}
    for a, b, coords, *_ in aretes:
        for n, p in ((a, coords[0]), (b, coords[-1])):
            if n not in ids:
                ids[n] = len(ids)
                pos[n] = p

    # Échantillons (D+) et sommets simplifiés (profil), puis un seul appel au MNT.
    lat_pts, lon_pts, plan = [], [], []
    for a, b, coords, *_ in aretes:
        ech, lg = echantillons(coords, PAS_ECHANTILLON_M)
        simp = douglas_peucker(coords, TOLERANCE_SIMPLIF_M)
        d0 = len(lat_pts)
        for p in ech + simp:
            lat_pts.append(round(p[0], 5))
            lon_pts.append(round(p[1], 5))
        plan.append((d0, len(ech), simp, lg))
    # Part de chaque arête dans un parc : milieux des pas d'échantillonnage.
    import shapely
    mil_lat, mil_lon, mil_e = [], [], []
    for e, (d0, n0, _simp, _lg) in enumerate(plan):
        for k in range(d0, d0 + max(1, n0 - 1)):
            k2 = min(k + 1, d0 + n0 - 1)
            mil_lat.append((lat_pts[k] + lat_pts[k2]) / 2)
            mil_lon.append((lon_pts[k] + lon_pts[k2]) / 2)
            mil_e.append(e)
    dedans = shapely.contains_xy(parcs, np.array(mil_lon), np.array(mil_lat))
    mil_e = np.array(mil_e)
    part_parc = np.bincount(mil_e, weights=dedans, minlength=len(plan)) / np.maximum(1, np.bincount(mil_e, minlength=len(plan)))
    print(f"[parcs] {region['id']} : {(part_parc > 0.5).sum()} arêtes surtout dans un parc", flush=True)
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
        A, B, L, UP_AB, UP_BA, T, CL, PA, G = [], [], [], [], [], [], [], [], []
        for e in liste:
            a, b, coords, t, cls = aretes[e]
            d0, n0, simp, lg = plan[e]
            up, down = denivele(z[d0:d0 + n0])
            A.append(loc[a]); B.append(loc[b]); T.append(t); CL.append(cls)
            PA.append(int(round(part_parc[e] * 100)))
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
            "edges": {"a": A, "b": B, "len": L, "upAB": UP_AB, "upBA": UP_BA, "type": T, "cls": CL, "parc": PA},
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
    for region in cfg["regions"]:
        if region["id"] not in choisies:
            continue
        mnt, nom_mnt = choisir_mnt(args.dem, args.lissage, region)
        aretes = charger_aretes_brutes(region, release)
        aretes = filtrer_sous_classes(aretes)
        aretes = garder_grandes_composantes(aretes)
        aretes = fusionner_degre_2(aretes)
        parcs = charger_parcs(region, release)
        anciennes[region["id"]] = exporter_region(region, aretes, mnt, nom_mnt, release, parcs)

    manifeste = {
        "v": 2, "tileDeg": [TUILE_LAT, TUILE_LON],
        "regions": [anciennes[r["id"]] for r in cfg["regions"] if r["id"] in anciennes],
    }
    manifeste_chemin.write_text(json.dumps(manifeste, ensure_ascii=False, indent=1))
    print(f"[manifeste] {manifeste_chemin} : {[r['id'] for r in manifeste['regions']]}")


if __name__ == "__main__":
    sys.exit(main())
