// Générateur de boucles distance + D+ (logique de la démo, sur le vrai graphe).
//
// 1. ~50 candidates : départ, 2 ou 3 points sur un cercle passant par le
//    départ, retour au départ.
// 2. Chaque tronçon : A* avec un coût qui attire (beta > 0) ou évite
//    (beta < 0) le relief, et pénalise les arêtes déjà empruntées.
// 3. Rayon ajusté (2-3 itérations) pour atteindre la distance.
// 4. Score = |écart distance|/5 % + |écart D+|/15 % + allers-retours/15 %.
// 5. ~35 variantes autour des 9 meilleures, puis 5 boucles différentes
//    (Jaccard des arêtes < 0,5).
// 6. Rien dans la tolérance : autres départs à moins de 2 km (le plus haut
//    ou le plus bas alentour, puis un cercle de 1,5 km) ; sinon la boucle la
//    plus proche, avec un message explicite.

import { distanceToNode, nearestNode, TYPE_SENTIER, type Graph, type Terrain } from './graph';
import { Router } from './router';

export const TOL_DISTANCE = 0.05;
export const TOL_DPLUS = 0.15;
export const SEUIL_ALLER_RETOUR = 0.15;

export interface LoopRequest {
  lat: number;
  lon: number;
  distanceKm: number;
  dplusM: number;
  terrain: Terrain;
  seed?: number;
  /** Chercher un autre départ à moins de 2 km si rien n'est possible (défaut : oui). */
  elargir?: boolean;
}

export interface Loop {
  /** Arêtes parcourues, dans l'ordre ; `dirs[i]` = 1 si parcourue de a vers b. */
  edges: number[];
  dirs: number[];
  distanceM: number;
  dplusM: number;
  /** Écarts relatifs signés à la cible (0,03 = +3 %). */
  ecartDistance: number;
  ecartDplus: number;
  /** Part de la longueur parcourue sur des arêtes empruntées plus d'une fois. */
  allerRetour: number;
  score: number;
  dansTolerance: boolean;
  /** Tracé : [lat, lon, altitude] ; profil : distance cumulée (m) par point. */
  coords: [number, number, number][];
  cumul: number[];
}

export interface LoopResponse {
  ok: boolean;
  loops: Loop[];
  message: string;
  startNode: number;
  stats: { candidates: number; routes: number; travail?: number; ms: number };
  /** Présent si le départ a été déplacé faute de boucle depuis le point demandé. */
  depart?: { lat: number; lon: number; decalageM: number };
  /**
   * Présent si la demande reste impossible : D+ réalisable à cette distance
   * depuis ce départ, tiré d'une boucle réellement explorée.
   */
  suggestion?: { dplusM: number; sens: 'reduire' | 'augmenter'; plage: [number, number] };
}

interface Params {
  theta: number;
  k: number;
  beta: number;
  radius: number;
  /** Point intermédiaire : le plus proche (0), le plus haut (1) ou le plus bas (-1) alentour. */
  mode: -1 | 0 | 1;
}

interface Candidate {
  p: Params;
  edges: number[];
  dirs: number[];
  distanceM: number;
  dplusM: number;
  allerRetour: number;
  score: number;
}

const N_CANDIDATS = 50;
const N_PARENTS = 9;
const N_VARIANTES = 35;
const ITER_RAYON = 4;
const TOURS_SUPPLEMENTAIRES = 2;
// Budget de travail par demande, en nœuds explorés par A* (déterministe,
// contrairement à un chronomètre) : ~2 s en Node, sous 10 s sur un
// téléphone 3 à 4 fois plus lent. Mesuré sur les trois jeux du banc : seuls
// les cas en plein Paris le dépassaient (jusqu'à 38 millions, 9,6 s en Node).
// Une fois épuisé, plus de nouvelle candidate ; les MIN_CANDIDATS premières
// sont toujours construites.
const BUDGET_TRAVAIL = 8_000_000;
const MIN_CANDIDATS = 10;
// Repli quand rien n'est possible depuis le point demandé : départs essayés
// entre 300 m et 2 km, avec un budget de travail en plus du premier.
const ELARGISSEMENT_MIN_M = 300;
const ELARGISSEMENT_MAX_M = 2000;
const BUDGET_ELARGISSEMENT = 6_000_000;
// A* pondéré : l'heuristique exacte (minorée par le plus petit facteur de
// coût, 0,2 quand le relief est attiré) n'élague presque rien et coûtait
// jusqu'à 20 s sur le réseau dense de Paris. Le coût n'est lui-même qu'une
// heuristique de forme de boucle : un chemin légèrement sous-optimal suffit.
// Mesuré sur les trois jeux du banc (0 ; 0,6 ; 0,8 ; 1) : 1 est le plus
// rapide et ne perd aucune réussite.
const POIDS_HEURISTIQUE_MIN = 1;
const MODES: (-1 | 0 | 1)[] = [-1, 0, 0, 1, 1];
const PENALITE_REUSE = 3;
// Un demi-tour (on part sur une voie et on revient par la même) n'est
// accepté que si l'aller fait au moins cette longueur : vers un sommet, oui ;
// au bout d'une rue, non.
export const DEMI_TOUR_MIN_M = 1000;
const DETOUR = 1.3;
const BETAS = [-2, -0.8, 0, 0.8, 1.8, 3];
const ANGLE_OR = Math.PI * (3 - Math.sqrt(5));

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

const FACTEURS_TERRAIN: Record<Terrain, [number, number]> = {
  // [route, sentier]
  mixte: [1, 1],
  sentiers: [1.8, 1],
  route: [1, 2.2],
};

export class LoopGenerator {
  private router: Router;
  private used: Uint16Array;
  private costCache = new Map<string, { cost: Float64Array; minFactor: number }>();
  routes = 0;
  /** Nœuds explorés par A* depuis le début de la demande : mesure du travail. */
  travail = 0;

  /** Budget de travail épuisé : on ne lance plus de nouvelle candidate. */
  private budget = BUDGET_TRAVAIL;
  private epuise() {
    return this.travail > this.budget;
  }

  constructor(private g: Graph) {
    this.router = new Router(g);
    this.used = new Uint16Array(g.m);
  }

  private costs(beta: number, terrain: Terrain) {
    const key = `${beta.toFixed(2)}|${terrain}`;
    let c = this.costCache.get(key);
    if (c) return c;
    const g = this.g;
    const cost = new Float64Array(g.m);
    const [fRoute, fSentier] = FACTEURS_TERRAIN[terrain];
    let minFactor = Infinity;
    for (let e = 0; e < g.m; e++) {
      const L = g.len[e];
      const relief = L > 0 ? (g.upAB[e] + g.upBA[e]) / L : 0;
      const fPente = Math.min(5, Math.max(0.2, Math.exp(-beta * relief * 10)));
      const f = fPente * (g.type[e] === TYPE_SENTIER ? fSentier : fRoute);
      cost[e] = Math.max(L, 0.1) * f;
      if (f < minFactor) minFactor = f;
    }
    if (this.costCache.size > 40) this.costCache.clear();
    c = { cost, minFactor };
    this.costCache.set(key, c);
    return c;
  }

  /** Construit la boucle pour des paramètres donnés (sans ajuster le rayon). */
  private build(start: number, p: Params, terrain: Terrain, target: { d: number; h: number }): Candidate | null {
    const g = this.g;
    const cx = g.x[start] + p.radius * Math.cos(p.theta);
    const cy = g.y[start] + p.radius * Math.sin(p.theta);
    const pts: number[] = [start];
    for (let i = 1; i <= p.k; i++) {
      const ang = p.theta + Math.PI + (2 * Math.PI * i) / (p.k + 1);
      const px = cx + p.radius * Math.cos(ang);
      const py = cy + p.radius * Math.sin(ang);
      // Attirer un point vers un sommet (ou un creux) voisin donne au
      // routage le relief que le coût seul ne trouve pas en zone plate.
      let w = -1;
      if (p.mode !== 0) {
        const rayonSnap = Math.min(1500, Math.max(150, 0.35 * p.radius));
        w = g.grid.extreme(px, py, rayonSnap, g.ele, p.mode);
      }
      if (w < 0) w = g.grid.nearest(px, py);
      if (w >= 0 && w !== pts[pts.length - 1]) pts.push(w);
    }
    pts.push(start);
    if (pts.length < 3) return null;

    const { cost, minFactor } = this.costs(p.beta, terrain);
    const edges: number[] = [];
    const dirs: number[] = [];
    const used = this.used;
    let ok = true;
    for (let i = 0; i + 1 < pts.length; i++) {
      if (pts[i] === pts[i + 1]) continue;
      this.routes++;
      const r = this.router.route(pts[i], pts[i + 1], cost, Math.max(minFactor, POIDS_HEURISTIQUE_MIN), used, PENALITE_REUSE);
      this.travail += this.router.settled;
      if (!r) {
        ok = false;
        break;
      }
      for (let j = 0; j < r.edges.length; j++) {
        const e = r.edges[j];
        edges.push(e);
        dirs.push(g.a[e] === r.nodes[j] ? 1 : 0);
        used[e]++;
      }
    }
    for (const e of edges) used[e] = 0;
    if (!ok || edges.length === 0) return null;
    // Pas d'aller-retour court dans une impasse : coupé, la distance est
    // ensuite réajustée par le rayon.
    couperDemiTours(g, edges, dirs, DEMI_TOUR_MIN_M);
    if (edges.length === 0) return null;

    const m = mesurer(g, edges, dirs);
    return { p, edges, dirs, ...m, score: score(m, target) };
  }

  /** Construit puis ajuste le rayon jusqu'à approcher la distance visée. */
  private buildAdjusted(start: number, p: Params, terrain: Terrain, target: { d: number; h: number }, iters: number) {
    let best: Candidate | null = null;
    let cur = { ...p };
    for (let it = 0; it < iters; it++) {
      const c = this.build(start, cur, terrain, target);
      if (!c) break;
      if (!best || c.score < best.score) best = c;
      const ratio = target.d / c.distanceM;
      if (Math.abs(ratio - 1) < 0.015) break;
      cur = { ...cur, radius: cur.radius * Math.min(2.5, Math.max(0.4, ratio)) };
    }
    return best;
  }

  /**
   * Étapes 1 à 5 depuis un départ : candidates, ajustement du rayon,
   * variantes autour des meilleures. Renvoie les candidates triées par score.
   */
  private rechercher(start: number, terrain: Terrain, target: { d: number; h: number }, rand: () => number,
    nCandidats: number, tours: number, nVariantes: number): Candidate[] {
    const theta0 = rand() * 2 * Math.PI;
    const r0 = target.d / (2 * Math.PI * DETOUR);
    const cands: Candidate[] = [];
    for (let i = 0; i < nCandidats; i++) {
      const p: Params = {
        theta: theta0 + i * ANGLE_OR,
        k: rand() < 0.5 ? 2 : 3,
        beta: BETAS[i % BETAS.length],
        radius: r0 * (0.85 + 0.3 * rand()),
        mode: MODES[Math.floor(rand() * MODES.length)],
      };
      if (i >= MIN_CANDIDATS && this.epuise()) break;
      const c = this.buildAdjusted(start, p, terrain, target, ITER_RAYON);
      if (c) cands.push(c);
    }
    // Les tours supplémentaires ne servent que si rien n'est encore dans la tolérance.
    for (let tour = 0; tour < tours && cands.length > 0; tour++) {
      cands.sort((x, y) => x.score - y.score);
      if (tour > 0 && cands.some((c) => dansTolerance(c, target))) break;
      const parents = cands.slice(0, N_PARENTS);
      const parVariante = Math.ceil(nVariantes / parents.length);
      let nVar = 0;
      for (const par of parents) {
        for (let v = 0; v < parVariante && nVar < nVariantes && !this.epuise(); v++, nVar++) {
          const errH = Math.log(Math.max(target.h, 10) / Math.max(par.dplusM, 10));
          const pas = Math.max(-1.6, Math.min(1.6, errH * 1.8));
          const p: Params = {
            theta: par.p.theta + (v === 0 ? 0 : (rand() - 0.5) * 0.7),
            k: v === 2 ? 5 - par.p.k : par.p.k,
            beta: Math.max(-3, Math.min(5, par.p.beta + pas * (v === 0 ? 1 : 0.5 + rand()))),
            radius: par.p.radius * (target.d / par.distanceM),
            mode: v === 3 ? (errH > 0.1 ? 1 : errH < -0.1 ? -1 : 0) : par.p.mode,
          };
          const c = this.buildAdjusted(start, p, terrain, target, 3);
          if (c) cands.push(c);
        }
      }
    }
    cands.sort((x, y) => x.score - y.score);
    return cands;
  }

  /**
   * Départs de repli à moins de ELARGISSEMENT_MAX_M du départ demandé, du
   * plus prometteur au moins prometteur : le point le plus haut (ou le plus
   * bas, s'il faut moins de D+) dans 2 km puis dans 1 km, puis des points
   * répartis sur un cercle de 1,5 km.
   */
  private departsAlternatifs(start: number, plusDeDplus: boolean): number[] {
    const g = this.g;
    const x = g.x[start];
    const y = g.y[start];
    const signe = plusDeDplus ? 1 : -1;
    const out: number[] = [];
    const ajouter = (n: number) => {
      if (n < 0 || out.includes(n) || n === start) return;
      const d = Math.hypot(g.x[n] - x, g.y[n] - y);
      if (d >= ELARGISSEMENT_MIN_M && d <= ELARGISSEMENT_MAX_M) out.push(n);
    };
    ajouter(g.grid.extreme(x, y, ELARGISSEMENT_MAX_M, g.ele, signe));
    ajouter(g.grid.extreme(x, y, ELARGISSEMENT_MAX_M / 2, g.ele, signe));
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      ajouter(g.grid.nearest(x + 1500 * Math.cos(a), y + 1500 * Math.sin(a)));
    }
    return out;
  }

  generate(req: LoopRequest): LoopResponse {
    const t0 = now();
    const g = this.g;
    this.routes = 0;
    this.travail = 0;
    this.budget = BUDGET_TRAVAIL;
    const vide = (message: string, startNode = -1): LoopResponse => ({
      ok: false, loops: [], message, startNode,
      stats: { candidates: 0, routes: this.routes, travail: this.travail, ms: now() - t0 },
    });

    if (!(req.distanceKm > 0) || !(req.dplusM >= 0)) return vide('Distance et D+ doivent être positifs.');
    const demande = nearestNode(g, req.lat, req.lon);
    if (demande < 0 || distanceToNode(g, req.lat, req.lon, demande) > 300) {
      return vide('Point de départ trop loin d\u2019un chemin de la zone (plus de 300 m). Choisis un point sur un chemin ou une route.');
    }
    const target = { d: req.distanceKm * 1000, h: Math.max(req.dplusM, 1) };
    const rand = rng(req.seed ?? 12345);

    let start = demande;
    let cands = this.rechercher(start, req.terrain, target, rand, N_CANDIDATS, 1 + TOURS_SUPPLEMENTAIRES, N_VARIANTES);
    if (cands.length === 0) return vide('Aucune boucle n\u2019a pu être tracée depuis ce point.', start);

    // 6. Rien dans la tolérance : essayer d'autres départs à moins de 2 km,
    // avec une recherche allégée et un budget de travail supplémentaire.
    let decale = false;
    if (req.elargir !== false && !cands.some((c) => dansTolerance(c, target))) {
      this.budget += BUDGET_ELARGISSEMENT;
      const nOk = (cs: Candidate[]) => cs.filter((c) => dansTolerance(c, target)).length;
      let meilleur = { start, cands, ok: 0 };
      for (const alt of this.departsAlternatifs(start, cands[0].dplusM < target.h)) {
        if (this.epuise()) break;
        const cs = this.rechercher(alt, req.terrain, target, rand, 16, 1, 12);
        if (cs.length === 0) continue;
        const ok = nOk(cs);
        if (ok > meilleur.ok) meilleur = { start: alt, cands: cs, ok };
        if (ok >= 3) break;
      }
      // On ne déplace le départ que si cela donne une boucle dans la tolérance.
      if (meilleur.ok > 0) {
        start = meilleur.start;
        cands = meilleur.cands;
        decale = true;
      }
    }

    // Choix final : les meilleures, assez différentes entre elles.
    const choisies: { c: Candidate; set: Set<number> }[] = [];
    for (const c of cands) {
      const set = new Set(c.edges);
      if (choisies.every((s) => jaccard(set, s.set) < 0.5)) choisies.push({ c, set });
      if (choisies.length === 5) break;
    }
    const loops = choisies.map(({ c }) => finaliser(g, c, target));
    const nOk = loops.filter((l) => l.dansTolerance).length;
    const stats = { candidates: cands.length, routes: this.routes, travail: this.travail, ms: now() - t0 };

    if (nOk === 0) {
      const b = loops[0];
      const suggestion = suggererDplus(cands, target);
      const conseil = suggestion
        ? ` À ${req.distanceKm} km, les boucles possibles ici font de ${suggestion.plage[0]} à ${suggestion.plage[1]} m D+ : ` +
          `essaie ${suggestion.dplusM} m (${suggestion.sens === 'reduire' ? 'moins' : 'plus'} de D+).`
        : ` La plus proche fait ${(b.distanceM / 1000).toFixed(1)} km (${pct(b.ecartDistance)}) ` +
          `pour ${Math.round(b.dplusM)} m D+ (${pct(b.ecartDplus)}).`;
      return {
        ok: false, loops, startNode: start, stats, suggestion: suggestion ?? undefined,
        message: `Impossible depuis ce départ, même en le décalant de 2 km au plus.${conseil}`,
      };
    }
    const resume = `${nOk} boucle${nOk > 1 ? 's' : ''} dans la tolérance sur ${loops.length} proposée${loops.length > 1 ? 's' : ''}.`;
    if (decale) {
      const dx = g.x[start] - g.x[demande];
      const dy = g.y[start] - g.y[demande];
      const decalageM = Math.hypot(dx, dy);
      return {
        ok: true, loops, startNode: start, stats,
        depart: { lat: g.lat[start], lon: g.lon[start], decalageM },
        message:
          `Impossible depuis ton point de départ. En partant à ${(decalageM / 1000).toFixed(1).replace('.', ',')} km ` +
          `${direction(dx, dy)} (départ orange sur la carte) : ${resume}`,
      };
    }
    return { ok: true, loops, startNode: start, stats, message: resume };
  }
}

/**
 * D+ réalisable à la distance visée : parmi les candidates explorées dont la
 * distance est dans la tolérance, la plage de D+ obtenue, et sa borne la plus
 * proche de la cible, arrondie (arrondiDplus). Une
 * boucle explorée l'atteint : la redemander a de bonnes chances d'aboutir.
 */
function suggererDplus(cands: Candidate[], t: { d: number; h: number }): LoopResponse['suggestion'] | null {
  const dp = cands.filter((c) => Math.abs(c.distanceM - t.d) / t.d <= TOL_DISTANCE).map((c) => c.dplusM);
  if (dp.length === 0) return null;
  const min = Math.min(...dp);
  const max = Math.max(...dp);
  const plage: [number, number] = [arrondiDplus(min), arrondiDplus(max)];
  if (t.h > max) return { dplusM: plage[1], sens: 'reduire', plage };
  if (t.h < min) return { dplusM: plage[0], sens: 'augmenter', plage };
  // Cible dans la plage mais entre deux boucles explorées : la plus proche.
  const proche = dp.reduce((a, v) => (Math.abs(v - t.h) < Math.abs(a - t.h) ? v : a));
  return { dplusM: arrondiDplus(proche), sens: proche < t.h ? 'reduire' : 'augmenter', plage };
}

/**
 * Arrondi lisible qui reste dans la tolérance de ±15 % autour de la boucle
 * explorée : au plus proche, par pas de 5 m sous 100 m, de 10 m au-dessus.
 */
function arrondiDplus(v: number) {
  return v < 100 ? Math.max(5, Math.round(v / 5) * 5) : Math.round(v / 10) * 10;
}

/** Direction cardinale d'un déplacement (x vers l'est, y vers le nord). */
function direction(dx: number, dy: number) {
  const noms = ['à l\u2019est', 'au nord-est', 'au nord', 'au nord-ouest', 'à l\u2019ouest', 'au sud-ouest', 'au sud', 'au sud-est'];
  const k = Math.round(Math.atan2(dy, dx) / (Math.PI / 4));
  return noms[(k + 8) % 8];
}

function now() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function pct(x: number) {
  return `${x >= 0 ? '+' : ''}${(x * 100).toFixed(0)} %`;
}

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

function dansTolerance(c: { distanceM: number; dplusM: number }, t: { d: number; h: number }) {
  return Math.abs(c.distanceM - t.d) / t.d <= TOL_DISTANCE && Math.abs(c.dplusM - t.h) / t.h <= TOL_DPLUS;
}

function jaccard(a: Set<number>, b: Set<number>) {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

function mesurer(g: Graph, edges: number[], dirs: number[]) {
  let distanceM = 0;
  let dplusM = 0;
  const count = new Map<number, number>();
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    distanceM += g.len[e];
    dplusM += dirs[i] ? g.upAB[e] : g.upBA[e];
    count.set(e, (count.get(e) ?? 0) + 1);
  }
  let rep = 0;
  for (const [e, n] of count) if (n > 1) rep += g.len[e] * n;
  return { distanceM, dplusM, allerRetour: distanceM > 0 ? rep / distanceM : 0 };
}

function score(m: { distanceM: number; dplusM: number; allerRetour: number }, t: { d: number; h: number }) {
  const ed = Math.abs(m.distanceM - t.d) / t.d / TOL_DISTANCE;
  const eh = Math.abs(m.dplusM - t.h) / t.h / TOL_DPLUS;
  // Au-delà de la tolérance, l'écart pèse davantage : on préfère deux
  // écarts modérés à un critère respecté et l'autre très loin.
  const f = (x: number) => (x <= 1 ? x : 1 + 2 * (x - 1));
  return f(ed) + f(eh) + m.allerRetour / SEUIL_ALLER_RETOUR;
}

function finaliser(g: Graph, c: Candidate, t: { d: number; h: number }): Loop {
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
  const ecartDplus = (c.dplusM - t.h) / t.h;
  return {
    edges: c.edges, dirs: c.dirs, distanceM: c.distanceM, dplusM: c.dplusM,
    ecartDistance, ecartDplus, allerRetour: c.allerRetour, score: c.score,
    dansTolerance: Math.abs(ecartDistance) <= TOL_DISTANCE && Math.abs(ecartDplus) <= TOL_DPLUS,
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
