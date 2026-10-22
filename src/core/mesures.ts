// Mesures d'une boucle (arêtes orientées) : distance, D+, allers-retours,
// demi-tours, virages, parts d'agrément, tracé final. Communes à tous les
// générateurs ; aucune règle de choix ici (regles.ts).

import { CODES_GRANDES_ROUTES, CODES_SANS_VOITURE, toXY, type Graph } from './graph';
import type { Loop } from './loops';
import { dansTolerance, tolDistanceM, type Cible } from './regles';

/**
 * Demi-tours de la boucle : positions t où l'arête t reprend l'arête t-1 en
 * sens inverse ; l'aller s'étend tant que la boucle repasse en miroir.
 * Renvoie [début de l'aller, fin du retour (exclue), longueur de l'aller].
 * Le raccord début/fin de boucle (départ au fond d'une impasse) n'est pas
 * un demi-tour : il faut bien en sortir.
 */
export function demiTours(len: Float64Array, edges: number[]): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let t = 1; t < edges.length; t++) {
    if (edges[t] !== edges[t - 1]) continue;
    let j = 1;
    while (t - 1 - j >= 0 && t + j < edges.length && edges[t - 1 - j] === edges[t + j]) j++;
    let aller = 0;
    for (let k = t - j; k < t; k++) aller += len[edges[k]];
    out.push([t - j, t + j, aller]);
  }
  return out;
}

/** Retire en place les demi-tours dont l'aller est plus court que `minM`. */
export function couperDemiTours(g: Graph, edges: number[], dirs: number[], minM: number) {
  // Une coupe peut en révéler une autre (impasse dans une impasse) : on
  // recommence jusqu'à ce qu'il n'y en ait plus.
  for (;;) {
    const court = demiTours(g.len, edges).find(([, , aller]) => aller < minM);
    if (!court) return;
    edges.splice(court[0], court[1] - court[0]);
    dirs.splice(court[0], court[1] - court[0]);
  }
}

export function jaccard(a: Set<number>, b: Set<number>) {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

/**
 * Virages serrés par km : le cap, pris sur des pas de 30 m le long de la
 * géométrie, qui tourne de plus de 60°. Un escalier de rues en compte 3 à 4
 * par km, une boucle fluide le long de l'eau 1,5 à 2, quelle que soit sa
 * forme (ronde ou allongée dans une vallée).
 */
export function viragesParKm(g: Graph, edges: number[], dirs: number[]) {
  const PAS = 30;
  const COS_SEUIL = Math.cos((60 * Math.PI) / 180);
  let n = 0;
  let total = 0;
  let reste = PAS;
  let px = NaN, py = NaN; // dernier point échantillonné
  let dx0 = 0, dy0 = 0; // direction du pas précédent
  let ax = NaN, ay = NaN;
  const visiter = (x: number, y: number) => {
    if (Number.isNaN(ax)) {
      ax = px = x;
      ay = py = y;
      return;
    }
    let d = Math.hypot(x - ax, y - ay);
    total += d;
    while (d >= reste) {
      const t = reste / d;
      const nx = ax + (x - ax) * t;
      const ny = ay + (y - ay) * t;
      const dx = nx - px, dy = ny - py;
      if (dx0 !== 0 || dy0 !== 0) {
        if ((dx * dx0 + dy * dy0) / (Math.hypot(dx, dy) * Math.hypot(dx0, dy0)) < COS_SEUIL) n++;
      }
      dx0 = dx; dy0 = dy; px = nx; py = ny;
      ax = nx; ay = ny;
      d -= reste;
      reste = PAS;
    }
    reste -= d;
    ax = x; ay = y;
  };
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    const [u, v] = dirs[i] ? [g.a[e], g.b[e]] : [g.b[e], g.a[e]];
    if (i === 0) visiter(g.x[u], g.y[u]);
    const o0 = g.geomOff[e], o1 = g.geomOff[e + 1];
    for (let k = 0; k < o1 - o0; k++) {
      const o = dirs[i] ? o0 + k : o1 - 1 - k;
      const [x, y] = toXY(g, g.geomLat[o], g.geomLon[o]);
      visiter(x, y);
    }
    visiter(g.x[v], g.y[v]);
  }
  return total > 0 ? n / (total / 1000) : 0;
}

export function mesurer(g: Graph, edges: number[], dirs: number[]) {
  let distanceM = 0;
  let dplusM = 0;
  let parcM = 0;
  let eauM = 0;
  let svM = 0;
  let rapideM = 0;
  let itinM = 0;
  const count = new Map<number, number>();
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    distanceM += g.len[e];
    parcM += g.len[e] * g.parc[e];
    eauM += g.len[e] * g.eau[e];
    if (CODES_SANS_VOITURE.has(g.cls[e])) svM += g.len[e];
    rapideM += g.len[e] * g.rapide[e];
    itinM += g.len[e] * g.itin[e];
    dplusM += dirs[i] ? g.upAB[e] : g.upBA[e];
    count.set(e, (count.get(e) ?? 0) + 1);
  }
  let rep = 0;
  for (const [e, n] of count) if (n > 1) rep += g.len[e] * n;
  return { distanceM, dplusM, allerRetour: distanceM > 0 ? rep / distanceM : 0, partParc: distanceM > 0 ? parcM / distanceM : 0, partEau: distanceM > 0 ? eauM / distanceM : 0, partSansVoiture: distanceM > 0 ? svM / distanceM : 0,
    virages: viragesParKm(g, edges, dirs),
    partRapide: distanceM > 0 ? rapideM / distanceM : 0,
    partItin: distanceM > 0 ? itinM / distanceM : 0 };
}

/** Mesures d'une boucle, telles que `mesurer` les renvoie. */
export type Mesures = ReturnType<typeof mesurer>;

/** Boucle proposée : mesures, tracé et profil, écarts à la cible. */
export function finaliser(g: Graph, c: Mesures & { edges: number[]; dirs: number[]; score: number }, t: Cible): Loop {
  const coords: [number, number, number][] = [];
  const first = c.dirs[0] ? g.a[c.edges[0]] : g.b[c.edges[0]];
  coords.push([g.lat[first], g.lon[first], g.ele[first]]);
  for (let i = 0; i < c.edges.length; i++) {
    const e = c.edges[i];
    const o0 = g.geomOff[e];
    const o1 = g.geomOff[e + 1];
    if (c.dirs[i]) {
      for (let o = o0; o < o1; o++) coords.push([g.geomLat[o], g.geomLon[o], g.geomEle[o]]);
      const v = g.b[e];
      coords.push([g.lat[v], g.lon[v], g.ele[v]]);
    } else {
      for (let o = o1 - 1; o >= o0; o--) coords.push([g.geomLat[o], g.geomLon[o], g.geomEle[o]]);
      const v = g.a[e];
      coords.push([g.lat[v], g.lon[v], g.ele[v]]);
    }
  }
  const cumul = [0];
  for (let i = 1; i < coords.length; i++) {
    cumul.push(cumul[i - 1] + haversine(coords[i - 1][0], coords[i - 1][1], coords[i][0], coords[i][1]));
  }
  const ecartDistance = (c.distanceM - t.d) / t.d;
  const ecartDplus = t.h == null ? 0 : (c.dplusM - t.h) / t.h;
  return {
    edges: c.edges, dirs: c.dirs, distanceM: c.distanceM, dplusM: c.dplusM,
    ecartDistance, distanceOk: Math.abs(c.distanceM - t.d) <= tolDistanceM(t.d), ecartDplus, allerRetour: c.allerRetour, score: c.score,
    grandesRoutesM: c.edges.reduce((s, e) => s + (CODES_GRANDES_ROUTES.has(g.cls[e]) ? g.len[e] : 0), 0),
    parcM: c.edges.reduce((s, e) => s + g.parc[e] * g.len[e], 0),
    eauM: c.edges.reduce((s, e) => s + g.eau[e] * g.len[e], 0),
    virages: c.virages,
    rapideM: c.partRapide * c.distanceM,
    itinM: c.partItin * c.distanceM,
    ecartArriveeM: haversine(coords[0][0], coords[0][1], coords[coords.length - 1][0], coords[coords.length - 1][1]),
    sansVoitureM: c.edges.reduce((s, e) => s + (CODES_SANS_VOITURE.has(g.cls[e]) ? g.len[e] : 0), 0),
    dansTolerance: dansTolerance(c, t),
    coords, cumul,
  };
}

export function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const r = Math.PI / 180;
  const dp = (lat2 - lat1) * r;
  const dl = (lon2 - lon1) * r;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dl / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.min(1, Math.sqrt(a)));
}
