// Mode « D+ maximal » : à distance donnée, la boucle la plus dénivelée
// possible, sans sortir d'une zone (cercle autour du départ ou polygone
// dessiné).
//
// Chaque candidate enchaîne des points hauts et des points bas de la zone :
// monter à un sommet, redescendre dans un creux, remonter ailleurs. La
// pénalité de réutilisation fait monter par une rue et redescendre par la
// voisine ; avec les allers-retours permis, elle est faible et la même côte
// peut être répétée quand il n'y a pas d'autre choix. Le dernier point est
// choisi pour retomber sur la distance visée (±5 %).

import { distanceToNode, nearestNode, toXY, type Graph, type Terrain } from './graph';
import {
  BUDGET_TRAVAIL, couperDemiTours, coutsAretes, DEMI_TOUR_MIN_M, finaliser, jaccard, mesurer,
  POIDS_HEURISTIQUE_MIN, rng, TOL_DISTANCE, type Loop, type LoopResponse,
} from './loops';
import { Router } from './router';

export type Zone =
  | { kind: 'cercle'; rayonM: number }
  | { kind: 'polygone'; points: [number, number][] };

export interface DplusMaxRequest {
  lat: number;
  lon: number;
  distanceKm: number;
  terrain: Terrain;
  /** Absente : cercle d'un quart de la distance autour du départ. */
  zone?: Zone | null;
  /** Répéter la même côte (aller-retour) est permis. */
  allersRetours?: boolean;
  seed?: number;
}

// 80 → 400 candidates : +10 à +20 % de D+ sur Annecy, Montmartre et Meudon,
// pour moins de 0,6 s ; le budget de travail borne les zones denses.
const N_CANDIDATS = 400;
const BETAS = [1.5, 3];
// Points hauts et bas : les nœuds de la zone dans les premiers et derniers
// POOL_PART de l'altitude (au moins POOL_MIN).
const POOL_PART = 0.08;
const POOL_MIN = 12;
// Pas de saut trop court entre deux points : sinon on tourne sur place.
const SAUT_MIN_M = 150;
const DETOUR = 1.3;
// Hors de la zone, seul l'accès est permis, et cher : tout le réseau si le
// départ est dehors, sinon ce qui est à moins de ACCES_M du départ (un départ
// sur la bordure n'a souvent aucun tronçon entièrement dedans).
const FACTEUR_ACCES = 20;
const ACCES_M = 300;
const MAX_ETAPES = 40;
const ECHANTILLON_ETAPE = 60;

/**
 * Prochain point : tiré au hasard, avec un poids qui croît avec la pente
 * à vol d'oiseau dans le bon sens (dénivelé ÷ distance), au carré pour
 * privilégier nettement les côtes raides et proches.
 */
function choisirPente(options: number[], cur: number, versHaut: boolean, g: Graph,
  dist: (a: number, b: number) => number, rand: () => number): number {
  const poids = options.map((n) => {
    const dz = (g.ele[n] - g.ele[cur]) * (versHaut ? 1 : -1);
    return dz > 0 ? (dz / Math.max(dist(cur, n), 200)) ** 2 : 0;
  });
  const total = poids.reduce((a, b) => a + b, 0);
  if (total === 0) return options[Math.floor(rand() * options.length)];
  let x = rand() * total;
  for (let k = 0; k < options.length; k++) if ((x -= poids[k]) <= 0) return options[k];
  return options[options.length - 1];
}

export function zoneParDefaut(distanceKm: number): Zone {
  return { kind: 'cercle', rayonM: (distanceKm * 1000) / 4 };
}

/** Rayon de réseau à charger pour couvrir la zone depuis le départ. */
export function rayonZoneM(lat: number, lon: number, distanceKm: number, zone?: Zone | null): number {
  const z = zone ?? zoneParDefaut(distanceKm);
  if (z.kind === 'cercle') return z.rayonM + 500;
  const r = 6371008.8;
  let max = 0;
  for (const [la, lo] of z.points) {
    const dx = ((lo - lon) * Math.PI * r * Math.cos((lat * Math.PI) / 180)) / 180;
    const dy = ((la - lat) * Math.PI * r) / 180;
    max = Math.max(max, Math.hypot(dx, dy));
  }
  return max + 500;
}

/** Appartenance de chaque nœud à la zone. */
function noeudsDansZone(g: Graph, start: number, zone: Zone): Uint8Array {
  const dedans = new Uint8Array(g.n);
  if (zone.kind === 'cercle') {
    const r2 = zone.rayonM ** 2;
    for (let i = 0; i < g.n; i++) dedans[i] = (g.x[i] - g.x[start]) ** 2 + (g.y[i] - g.y[start]) ** 2 <= r2 ? 1 : 0;
    return dedans;
  }
  const poly = zone.points.map(([la, lo]) => toXY(g, la, lo));
  for (let i = 0; i < g.n; i++) {
    const px = g.x[i];
    const py = g.y[i];
    let c = false;
    for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) {
      const [xa, ya] = poly[a];
      const [xb, yb] = poly[b];
      if (ya > py !== yb > py && px < ((xb - xa) * (py - ya)) / (yb - ya) + xa) c = !c;
    }
    dedans[i] = c ? 1 : 0;
  }
  return dedans;
}

interface Cand {
  edges: number[];
  dirs: number[];
  distanceM: number;
  dplusM: number;
  allerRetour: number;
  score: number;
}

export class DplusMaxGenerator {
  private router: Router;
  private used: Uint16Array;
  travail = 0;

  constructor(private g: Graph) {
    this.router = new Router(g);
    this.used = new Uint16Array(g.m);
  }

  generate(req: DplusMaxRequest): LoopResponse {
    const t0 = performance.now();
    const g = this.g;
    this.travail = 0;
    let routes = 0;
    const vide = (message: string): LoopResponse => ({
      ok: false, loops: [], message, startNode: -1, stats: { candidates: 0, routes, travail: this.travail, ms: performance.now() - t0 },
    });
    if (!(req.distanceKm > 0)) return vide('La distance doit être positive.');
    const start = nearestNode(g, req.lat, req.lon);
    if (start < 0 || distanceToNode(g, req.lat, req.lon, start) > 300) {
      return vide('Point de départ trop loin d’un chemin de la zone (plus de 300 m). Choisis un point sur un chemin ou une route.');
    }
    const D = req.distanceKm * 1000;
    const zone = req.zone ?? zoneParDefaut(req.distanceKm);
    if (zone.kind === 'polygone' && zone.points.length < 3) return vide('La zone dessinée doit avoir au moins 3 points.');
    const dedans = noeudsDansZone(g, start, zone);
    const departDedans = dedans[start] === 1;

    // Coûts : relief attiré, arêtes hors zone interdites (ou chères pour
    // l'accès si le départ est dehors).
    const couts = BETAS.map((beta) => {
      const { cost, minFactor } = coutsAretes(g, beta, req.terrain);
      const proche = (n: number) => (g.x[n] - g.x[start]) ** 2 + (g.y[n] - g.y[start]) ** 2 <= ACCES_M ** 2;
      for (let e = 0; e < g.m; e++) {
        if (dedans[g.a[e]] && dedans[g.b[e]]) continue;
        const acces = !departDedans || (proche(g.a[e]) && proche(g.b[e]));
        cost[e] = acces ? cost[e] * FACTEUR_ACCES : Infinity;
      }
      return { cost, h: Math.max(minFactor, POIDS_HEURISTIQUE_MIN) };
    });

    // Nœuds de la zone atteignables depuis le départ, triés par altitude.
    const atteint = new Uint8Array(g.n);
    const pile = [start];
    atteint[start] = 1;
    while (pile.length) {
      const u = pile.pop()!;
      for (let k = g.adjStart[u]; k < g.adjStart[u + 1]; k++) {
        const v = g.adjTo[k];
        if (atteint[v] || couts[0].cost[g.adjEdge[k]] === Infinity) continue;
        atteint[v] = 1;
        pile.push(v);
      }
    }
    const zoneNoeuds: number[] = [];
    for (let i = 0; i < g.n; i++) if (atteint[i] && dedans[i]) zoneNoeuds.push(i);
    if (zoneNoeuds.length < 10) return vide('La zone ne contient presque aucun chemin accessible depuis ce départ.');
    zoneNoeuds.sort((a, b) => g.ele[a] - g.ele[b]);
    const nPool = Math.min(zoneNoeuds.length >> 1, Math.max(POOL_MIN, Math.round(zoneNoeuds.length * POOL_PART)));
    const bas = zoneNoeuds.slice(0, nPool);
    const hauts = zoneNoeuds.slice(-nPool);
    const denivZone = g.ele[hauts[hauts.length - 1]] - g.ele[bas[0]];

    const rand = rng(req.seed ?? 12345);
    const dist = (a: number, b: number) => Math.hypot(g.x[a] - g.x[b], g.y[a] - g.y[b]);
    const cands: Cand[] = [];

    for (let i = 0; i < N_CANDIDATS && (i < 10 || this.travail < BUDGET_TRAVAIL); i++) {
      const { cost, h } = couts[i % couts.length];
      // Allers-retours permis : une candidate sur deux les décourage quand
      // même, pour que l'option ne fasse jamais moins bien que sans.
      const penalite = req.allersRetours && i % 2 === 1 ? 1 : 3;
      const edges: number[] = [];
      const dirs: number[] = [];
      let cum = 0;
      // Détour réel (chemin ÷ vol d'oiseau) mesuré sur les tronçons déjà
      // tracés : en ville, le 1,3 par défaut faisait dépasser la distance.
      let volOiseau = 0;
      const detour = () => (volOiseau > 300 ? Math.min(2, Math.max(1.05, cum / volOiseau)) : DETOUR);
      let cur = start;
      let versHaut = g.ele[start] < g.ele[hauts[0]];
      const aller = (cible: number) => {
        routes++;
        const r = this.router.route(cur, cible, cost, h, this.used, penalite);
        this.travail += this.router.settled;
        if (!r) return false;
        volOiseau += dist(cur, cible);
        for (let j = 0; j < r.edges.length; j++) {
          const e = r.edges[j];
          edges.push(e);
          dirs.push(g.a[e] === r.nodes[j] ? 1 : 0);
          this.used[e]++;
          cum += g.len[e];
        }
        cur = cible;
        return true;
      };
      for (let etape = 0; etape < MAX_ETAPES; etape++) {
        const reste = D - cum;
        const retour = dist(cur, start) * detour();
        // Les extrêmes de la zone, plus un échantillon de tous ses nœuds :
        // une rue raide à mi-pente vaut souvent mieux qu'un sommet lointain.
        const pool = (versHaut ? hauts : bas).concat(echantillon(zoneNoeuds, ECHANTILLON_ETAPE, rand));
        // Assez de distance pour une montée de plus et le retour ?
        const options = pool.filter((n) => n !== cur && dist(cur, n) >= SAUT_MIN_M);
        if (options.length === 0) break;
        const possibles = options.filter((n) => (dist(cur, n) + dist(n, start)) * detour() <= reste);
        if (possibles.length === 0 || reste < retour * 1.6) {
          // Dernier point : celui qui fait retomber sur la distance visée.
          let best = -1;
          let bestErr = Infinity;
          for (const n of zoneNoeuds.length > 400 ? options.concat(echantillon(zoneNoeuds, 400, rand)) : zoneNoeuds) {
            if (n === cur || n === start) continue;
            const err = Math.abs((dist(cur, n) + dist(n, start)) * detour() - reste);
            if (err < bestErr) {
              bestErr = err;
              best = n;
            }
          }
          if (best >= 0 && reste > retour * 1.1) aller(best);
          break;
        }
        const cible = choisirPente(possibles, cur, versHaut, g, dist, rand);
        if (!aller(cible)) break;
        versHaut = !versHaut;
      }
      const okRetour = cur === start || aller(start);
      for (const e of edges) this.used[e] = 0;
      if (!okRetour || edges.length === 0) continue;
      if (!req.allersRetours) couperDemiTours(g, edges, dirs, DEMI_TOUR_MIN_M);
      if (edges.length === 0) continue;
      const m = mesurer(g, edges, dirs);
      const ecart = Math.abs(m.distanceM - D) / D;
      // Dans la tolérance de distance : le plus de D+, ramené à la distance
      // demandée (sinon les +5 % de distance gagneraient toujours) ; hors
      // tolérance, la plus proche.
      const score = ecart <= TOL_DISTANCE ? -m.dplusM * (D / m.distanceM) : 1e6 + ecart * 1e6;
      cands.push({ edges, dirs, ...m, score });
    }

    cands.sort((a, b) => a.score - b.score);
    const choisies: { c: Cand; set: Set<number> }[] = [];
    for (const c of cands) {
      const set = new Set(c.edges);
      if (choisies.every((s) => jaccard(set, s.set) < 0.5)) choisies.push({ c, set });
      if (choisies.length === 5) break;
    }
    const stats = { candidates: cands.length, routes, travail: this.travail, ms: performance.now() - t0 };
    if (choisies.length === 0) return { ...vide('Aucune boucle n’a pu être tracée dans cette zone.'), stats, startNode: start };

    const loops: Loop[] = choisies.map(({ c }) => {
      const l = finaliser(g, c, { d: D, h: Math.max(1, c.dplusM) });
      l.dansTolerance = Math.abs(l.ecartDistance) <= TOL_DISTANCE;
      return l;
    });
    const nOk = loops.filter((l) => l.dansTolerance).length;
    const zoneTxt = req.zone == null
      ? `à moins de ${(zone.kind === 'cercle' ? zone.rayonM / 1000 : 0).toFixed(1).replace('.', ',')} km du départ`
      : zone.kind === 'cercle' ? `à moins de ${(zone.rayonM / 1000).toFixed(1).replace('.', ',')} km du départ` : 'dans la zone dessinée';
    if (nOk === 0) {
      return {
        ok: false, loops, startNode: start, stats,
        message: `Aucune boucle de ${req.distanceKm} km (±5 %) n’a été trouvée ${zoneTxt}. ` +
          `La plus proche fait ${(loops[0].distanceM / 1000).toFixed(1)} km. ` +
          (departDedans
            ? 'Agrandis la zone ou change la distance.'
            : 'Le départ est hors de la zone : l’accès compte dans la distance. Rapproche le départ, agrandis la zone ou change la distance.'),
      };
    }
    const b = loops[0];
    return {
      ok: true, loops, startNode: start, stats,
      message: `D+ maximal ${zoneTxt} : ${Math.round(b.dplusM)} m sur ${(b.distanceM / 1000).toFixed(1)} km ` +
        `(${Math.round(b.dplusM / (b.distanceM / 1000))} m/km ; la zone offre ${Math.round(denivZone)} m entre son point le plus bas et le plus haut).`,
    };
  }
}

function echantillon<T>(t: T[], n: number, rand: () => number): T[] {
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(t[Math.floor(rand() * t.length)]);
  return out;
}
