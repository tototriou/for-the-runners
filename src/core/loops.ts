// Générateur de boucles distance + D+ (logique de la démo, sur le vrai graphe).
//
// 1. ~50 candidates : départ, 2 ou 3 points sur un cercle passant par le
//    départ, retour au départ.
// 2. Chaque tronçon : A* avec un coût qui attire (beta > 0) ou évite
//    (beta < 0) le relief, et pénalise les arêtes déjà empruntées.
// 3. Rayon ajusté (2-3 itérations) pour entrer dans la fourchette de distance.
// 4. Score = écart de distance (presque nul dans la fourchette) + |écart D+|/15 %
//    + allers-retours/15 %.
// 5. ~35 variantes autour des 9 meilleures, puis 5 boucles différentes
//    (Jaccard des arêtes < 0,5).
// 6. Rien dans la tolérance : autres départs à moins de 2 km (le plus haut
//    ou le plus bas alentour, puis un cercle de 1,5 km) ; sinon la boucle la
//    plus proche, avec un message explicite.

import { CLASSES, distanceToNode, nearestNode, toXY, TYPE_SENTIER, type Graph, type Terrain } from './graph';
import { Router } from './router';
import { avertissementSeance, coutsTraversees, mesurerSeance, REGLAGES, resumeSeance, termeSeance, type MesuresSeance, type ReglagesSeance, type Seance } from './seances';

export const TOL_DISTANCE = 0.05;
/**
 * Fourchette de distance : ±500 m, ou ±5 % au-delà de 10 km. Dans la
 * fourchette, l'écart ne compte presque plus : viser la distance au mètre
 * près faisait tourner en rond dans quelques rues.
 */
export const TOL_DISTANCE_M = 500;
export const tolDistanceM = (d: number) => Math.max(TOL_DISTANCE_M, TOL_DISTANCE * d);
export const libelleTolDistance = (d: number) => (TOL_DISTANCE * d > TOL_DISTANCE_M ? '±5 %' : '±500 m');
/**
 * Poids de l'écart de distance dans la fourchette (contre 1 au-delà) : quasi
 * nul, un tour de parc qui dépasse de 400 m vaut mieux qu'un tour de pâté de
 * maisons qui tombe à 200 m. Il ne sert qu'à départager deux boucles égales.
 */
const POIDS_DANS_FOURCHETTE = 0.05;
/** Part du score due à la distance : faible dans la fourchette, forte au-delà. */
export function scoreDistance(distanceM: number, d: number) {
  const x = Math.abs(distanceM - d) / tolDistanceM(d);
  return x <= 1 ? POIDS_DANS_FOURCHETTE * x : POIDS_DANS_FOURCHETTE + 2 * (x - 1);
}
export const TOL_DPLUS = 0.15;
export const SEUIL_ALLER_RETOUR = 0.15;

export interface LoopRequest {
  lat: number;
  lon: number;
  distanceKm: number;
  /** D+ visé ; absent : boucle de la distance demandée, D+ libre. */
  dplusM?: number;
  terrain: Terrain;
  seed?: number;
  /** Chercher un autre départ à moins de 2 km si rien n'est possible (défaut : oui). */
  elargir?: boolean;
  /** Distance tolérée entre l'arrivée et le départ, en m (défaut ARRIVEE_M ; 0 : boucle fermée). */
  arriveeM?: number;
  /** Tour de parc : permis (défaut, une candidate sur deux), imposé, ou exclu. */
  tourParc?: 'permis' | 'impose' | 'exclu';
  /** Type de séance : en plus du calcul par défaut (absent : calcul inchangé). */
  seance?: Seance;
}

export interface Loop {
  /** Arêtes parcourues, dans l'ordre ; `dirs[i]` = 1 si parcourue de a vers b. */
  edges: number[];
  dirs: number[];
  distanceM: number;
  dplusM: number;
  /** Écarts relatifs signés à la cible (0,03 = +3 %). */
  ecartDistance: number;
  /** Distance dans la fourchette (±500 m, ou ±5 % au-delà de 10 km). */
  distanceOk: boolean;
  ecartDplus: number;
  /** Part de la longueur parcourue sur des arêtes empruntées plus d'une fois. */
  allerRetour: number;
  /** Part de la distance dans la zone choisie (boucles en zone seulement). */
  partZone?: number;
  /** Distance sur grande route (principale, départementale), en mètres. */
  grandesRoutesM: number;
  /** Distance sur voies interdites aux voitures, en mètres. */
  sansVoitureM: number;
  /** Distance dans les parcs et jardins publics, en mètres. */
  parcM: number;
  /** Distance au bord de l'eau (à moins de 30 m), en mètres. */
  eauM: number;
  /** Distance à vol d'oiseau entre l'arrivée et le départ, en mètres. */
  ecartArriveeM: number;
  /** Virages serrés par km. */
  virages: number;
  /** Distance près d'une autoroute (150 m) ou voie rapide (75 m), en mètres. */
  rapideM: number;
  /** Distance sur un itinéraire piéton balisé d'OpenStreetMap, en mètres. */
  itinM: number;
  /** Séance demandée : ses mesures et une phrase pour la carte. */
  seance?: MesuresSeance & { resume: string };
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
  /** Mode 0 : point attiré vers le parc ou le bord de l'eau le plus proche. */
  vert: boolean;
  /** Parc dont la boucle fait le tour (indice dans les parcs visés), -1 : aucun. */
  parc: number;
}

/** Réseau d'allées d'un parc : nœuds, centre et longueur totale. */
interface Parc {
  cx: number;
  cy: number;
  longueurM: number;
  noeuds: number[];
}

/** Un parc compte à partir de 800 m d'allées : en dessous, son tour n'en vaut pas le détour. */
const PARC_MIN_M = 800;
/** Parcs visés : les mieux placés (grands et proches) à moins de 40 % de la distance. */
const N_PARCS_VISES = 3;
const PORTEE_PARC = 0.4;

interface Candidate {
  p: Params;
  edges: number[];
  dirs: number[];
  distanceM: number;
  dplusM: number;
  allerRetour: number;
  /** Part de la distance dans les parcs et jardins publics. */
  partParc: number;
  /** Part de la distance au bord de l'eau. */
  partEau: number;
  /** Part de la distance sur des voies interdites aux voitures. */
  partSansVoiture: number;
  /** Virages serrés par km (cap qui tourne de plus de 60° sur 30 m). */
  virages: number;
  /** Part de la distance le long d'une autoroute ou voie rapide. */
  partRapide: number;
  /** Part de la distance sur un itinéraire piéton balisé. */
  partItin: number;
  /** Mesures de la séance demandée (absentes sans séance). */
  seance?: MesuresSeance;
  score: number;
}

/**
 * Nombre de points de passage d'une candidate : 2 à 6. Avec 2 ou 3, les
 * boucles étaient des triangles qui coupaient à travers les quartiers ; plus
 * de points donnent des boucles rondes qui suivent un quai ou un parc.
 */
const K_MIN = 2;
const K_MAX = 6;
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
export const BUDGET_TRAVAIL = 8_000_000;
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
export const POIDS_HEURISTIQUE_MIN = 1;
const MODES: (-1 | 0 | 1)[] = [-1, 0, 0, 1, 1];
const PENALITE_REUSE = 3;
// Un demi-tour (on part sur une voie et on revient par la même) n'est
// accepté que si l'aller fait au moins cette longueur : vers un sommet, oui ;
// au bout d'une rue, non.
export const DEMI_TOUR_MIN_M = 1000;
const DETOUR = 1.3;
const BETAS = [-2, -0.8, 0, 0.8, 1.8, 3];
const ANGLE_OR = Math.PI * (3 - Math.sqrt(5));

export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/**
 * Surcoût par classe de voie : les grandes routes (souvent sans trottoir ni
 * accotement) ne sont prises que faute de mieux — un pont, un col — mais
 * restent possibles, les exclure couperait des liaisons indispensables.
 * Mesuré avant : 14 à 21 % de la distance des boucles sur ces routes.
 */
const FACTEUR_CLASSE: Partial<Record<(typeof CLASSES)[number], number>> = {
  primary: 4,
  secondary: 4,
  tertiary: 1.5,
};
/** Voies interdites aux voitures (voies vertes, pistes cyclables, piétonnes, sentiers). */
export const VOIES_SANS_VOITURE: readonly (typeof CLASSES)[number][] = [
  'pedestrian', 'cycleway', 'path', 'track', 'footway', 'steps', 'bridleway',
  // Zone de rencontre : le piéton y est prioritaire, les voitures à 20 km/h
  // (les quais de la Grande Île à Strasbourg) ; elle compte comme sans voitures.
  'living_street',
];
export const CODES_SANS_VOITURE = new Set(VOIES_SANS_VOITURE.map((c) => CLASSES.indexOf(c)));
/**
 * Toute voie ouverte aux voitures coûte en plus 2 fois sa longueur : un
 * détour par une voie verte ou un sentier est préféré jusqu'au double de la
 * distance. Mesuré (×1 à ×3, 3 graines) : de 56-59 % à 68-74 % de la distance
 * sans voitures ; au-delà de ×2, Annecy passe sous 80 % dans la tolérance.
 */
const FACTEUR_VOITURES = 2;
/**
 * Parcs et jardins publics, à deux étages. Dans le coût, une voie qui y est
 * entièrement compte moitié moins. Au choix final, la part dans les parcs
 * rapporte des points de score (voir plus bas), entre boucles du même groupe (dans la
 * tolérance ou non) : le taux de réussite n'en dépend pas. Le coût seul ne
 * suffit pas, la forme de la boucle venant des points de passage. Mesuré sur
 * 10 départs près de parcs (Paris, Strasbourg, Colmar, Mulhouse, Annecy) :
 * 26 % de la distance dans les parcs sans rien, 29 % par le coût seul, 38 %
 * avec le choix (40 % avec un poids de 4, qui laisse passer plus d'allers-retours).
 */
const BONUS_PARC = 0.5;
/**
 * Bord de l'eau (à moins de 30 m), mêmes deux étages que les parcs : coût
 * moitié moins, et des points de score au choix final (voir plus bas). Une
 * voie à la fois dans un parc et au bord de l'eau prend le meilleur des deux
 * rabais. Mesuré sur 10 départs près de l'eau (Strasbourg, Colmar, Mulhouse,
 * Paris, Nogent, Annecy), 6 et 10 km, D+ libre ou 80 m : 22 % de la distance
 * au bord de l'eau sans rien, 30 % par le coût seul, 37 % avec un poids de
 * 2, 40 % avec 4, toutes demandes tenues. Un rabais de 0,7 monte à 43 % mais
 * perd une demande et double les allers-retours.
 */
const BONUS_EAU = 0.5;
/**
 * Près d'une autoroute (150 m) ou d'une voie rapide (75 m), hors tunnels :
 * bruit et pollution, personne ne veut y courir. Une voie qui y est
 * entièrement coûte 9 fois plus, et chaque point de part près d'une voie
 * rapide coûte 6 points au choix. Mesuré d'abord avec une bande de 50 m, sur
 * 10 départs proches de voies rapides (Strasbourg, Paris, Annecy, Colmar) × 2
 * tirages : 6,4 → 1,5 % de la distance (n°1 : 4,8 → 1,0 %), 20 demandes sur
 * 20 tenues. Bande élargie ensuite : le chemin de l'Ill à 100-200 m de l'A35
 * restait pris depuis Neudorf ; avec 150 m, 1,2 % et plus aucun tirage par là.
 */
const PENALITE_RAPIDE = 8;
/**
 * Itinéraire piéton balisé d'OpenStreetMap (randonnée, piéton, course,
 * parcours de santé) : des chemins choisis par d'autres marcheurs et coureurs.
 * Coût moitié moins (comme l'eau et les parcs, rabais non cumulés) et 2
 * points de score par point de part au choix. Sur 15 départs : 26 → 34 % de
 * la distance sur sentier balisé, 58 demandes sur 60 tenues (59 sans) ; depuis
 * la Krutenau, la n°1 passe à 33-44 % (18-27 % sans) de 5 à 16 km.
 */
const BONUS_ITIN = 0.5;
const POIDS_ITIN_CHOIX = 2;
const POIDS_RAPIDE_CHOIX = 6;
/**
 * Poids du choix final, calés sur un circuit modèle : le tour de la Grande
 * Île de Strasbourg par les quais (zones de rencontre, chemins de berge,
 * parcs). Avec l'eau à 4, les parcs à 2 et le sans-voitures à 1, l'app lui
 * préférait des berges de canal plus longues mais sans charme (3,5 boucles
 * proposées sur 5 notées au-dessus de lui) ; avec 2 / 3 / 0,5, les zones de
 * rencontre comptées sans voitures et 2 à 6 points de passage, il passe en
 * tête (0,3 sur 5 au-dessus) et la boucle n°1 en recouvre 58 % au lieu de 43 %.
 */
const POIDS_EAU_CHOIX = 2;
const POIDS_PARC_CHOIX = 3;
/**
 * Coût d'un mètre d'écart entre l'arrivée et le départ, quand il est toléré :
 * celui d'un mètre de rue. L'arrivée s'arrête avant le départ quand le retour
 * passerait par des rues ou ferait un détour de plus du double. Mesuré sur 10
 * départs × 3 distances : 1 donne 243 m d'écart moyen pour +0,8 point sans
 * voitures, 2 donne 115 m pour +0,6, 3 donne 70 m pour +0,1.
 */
export const PRIX_ECART_ARRIVEE = 2;
/** L'arrivée peut toujours se trouver jusqu'à 400 m du départ. */
export const ARRIVEE_M = 400;
/**
 * Agrément dès la construction : le choix final ne peut garder qu'une boucle
 * déjà tracée. La moitié des candidates attirent leurs points de passage vers
 * un parc ou le bord de l'eau, et les variantes partent des boucles les plus
 * agréables, pas des plus proches de la cible. Mesuré sur 15 départs près de
 * parcs ou d'eau, 6 et 10 km, D+ libre ou 80 m, avec la part sans voitures au
 * choix et le poids 0,05 dans la fourchette : bord de l'eau 34 → 36,5 %,
 * parcs 14,7 → 16,6 %, sans voitures 75 → 78 %, écart moyen à la distance
 * 230 → 260 m, 59 demandes sur 60 tenues comme avant.
 */
const PART_VERTS = 0.5;
const TRI_PARENTS_AGREMENT = true;
/** Agrément minimal d'un point de passage attiré (sinon le plus proche). */
const AGREMENT_MIN_POINT = 0.5;
const POIDS_SANS_VOITURE_CHOIX = 0.5;
/** Clé du choix final : entre deux boucles du même groupe, la plus agréable passe devant. */
/**
 * Sortie plate : chaque virage serré par km coûte 0,6 point au choix. Les
 * circuits modèles en ont 1,5 et 1,8 par km, les boucles en escalier de rues
 * 3 à 4. Sur 15 départs, la n°1 passe de 2,8 à 2,2 virages par km, 59
 * demandes sur 60 tenues ; la n°1 du circuit de l'Orangerie le recouvre à
 * 36 % au lieu de 20 %.
 */
const POIDS_VIRAGES = 0.6;
/**
 * Sortie plate : un quart des candidates sont des « lignes droites » (un seul
 * point de passage loin devant, le long d'un canal ou d'un parc, retour par
 * l'autre rive), deux au plus parmi les cinq proposées. Au bord des canaux, la
 * part au bord de l'eau de la n°1 double (canal Saint-Martin : 28 → 61 %).
 */
const PART_LIGNES = 0.25;
const LIGNES_MAX = 2;
/**
 * Sortie à dénivelé : le D+ prime, l'agrément ne compte qu'à moitié et les
 * zigzags ne sont pas pénalisés (lacets d'une montée). Effet faible mesuré
 * sur Annecy (82 % tenu, agrément quasi inchangé) : réglage de principe.
 */
const FACTEUR_AGREMENT_DPLUS = 0.5;
/** Sortie plate : D+ libre ou moins de PENTE_PLATE m par km. */
const PENTE_PLATE = 15;
export const estPlate = (t: Cible) => t.h == null || t.h / (t.d / 1000) < PENTE_PLATE;
export const cleChoix = (
  c: { score: number; partParc: number; partEau: number; partSansVoiture: number; partRapide: number; partItin: number; virages: number },
  plate: boolean,
) => {
  const agrement = POIDS_PARC_CHOIX * c.partParc + POIDS_EAU_CHOIX * c.partEau + POIDS_SANS_VOITURE_CHOIX * c.partSansVoiture
    - POIDS_RAPIDE_CHOIX * c.partRapide + POIDS_ITIN_CHOIX * c.partItin;
  return plate ? c.score - agrement + POIDS_VIRAGES * c.virages : c.score - FACTEUR_AGREMENT_DPLUS * agrement;
};
const FACTEURS_PAR_CODE = Float64Array.from({ length: 256 }, (_, k) =>
  CODES_SANS_VOITURE.has(k) ? 1 : (FACTEUR_CLASSE[CLASSES[k]] ?? 1) * FACTEUR_VOITURES);
/** Classes comptées comme « grande route » dans les boucles affichées. */
export const CODES_GRANDES_ROUTES = new Set([CLASSES.indexOf('primary'), CLASSES.indexOf('secondary')]);

const FACTEURS_TERRAIN: Record<Terrain, [number, number]> = {
  // [route, sentier]
  mixte: [1, 1],
  sentiers: [1.8, 1],
  route: [1, 2.2],
};

/**
 * Coût de chaque arête pour A* : longueur × relief (attiré si beta > 0,
 * évité si beta < 0) × terrain × classe de voie. `minFactor` minore
 * coût/longueur.
 */
export function coutsAretes(g: Graph, beta: number, terrain: Terrain) {
  const cost = new Float64Array(g.m);
  const [fRoute, fSentier] = FACTEURS_TERRAIN[terrain];
  let minFactor = Infinity;
  for (let e = 0; e < g.m; e++) {
    const L = g.len[e];
    const relief = L > 0 ? (g.upAB[e] + g.upBA[e]) / L : 0;
    const fPente = Math.min(5, Math.max(0.2, Math.exp(-beta * relief * 10)));
    const f = fPente * (g.type[e] === TYPE_SENTIER ? fSentier : fRoute) * FACTEURS_PAR_CODE[g.cls[e]] * Math.min(1 - BONUS_PARC * g.parc[e], 1 - BONUS_EAU * g.eau[e], 1 - BONUS_ITIN * g.itin[e])
      * (1 + PENALITE_RAPIDE * g.rapide[e]);
    cost[e] = Math.max(L, 0.1) * f;
    if (f < minFactor) minFactor = f;
  }
  return { cost, minFactor };
}

export class LoopGenerator {
  private router: Router;
  private used: Uint16Array;
  private costCache = new Map<string, { cost: Float64Array; minFactor: number }>();
  routes = 0;
  /** Nœuds explorés par A* depuis le début de la demande : mesure du travail. */
  travail = 0;

  /** Distance tolérée entre l'arrivée et le départ de la demande en cours. */
  private arriveeM = 0;
  /** Séance de la demande en cours et ses réglages (null : calcul par défaut). */
  private seance: Seance | null = null;
  private reglages: ReglagesSeance | null = null;

  /** Clé du choix : celle par défaut, plus le terme de la séance quand il y en a une. */
  private cle(c: Candidate, target: Cible) {
    if (!this.seance || !c.seance) return cleChoix(c, estPlate(target));
    return cleChoix(c, estPlate(target) && !this.reglages?.sansVirages) + termeSeance(this.seance, c.seance);
  }
  /** Parcs du graphe (calculés à la première demande de tour de parc). */
  private parcs: Parc[] | null = null;
  /** Parcs dont les boucles de la demande en cours peuvent faire le tour. */
  private parcsVises: Parc[] = [];
  private tourParc: 'permis' | 'impose' | 'exclu' = 'permis';

  /** Budget de travail épuisé : on ne lance plus de nouvelle candidate. */
  private budget = BUDGET_TRAVAIL;
  private epuise() {
    return this.travail > this.budget;
  }

  /** Agrément de chaque nœud : la meilleure part parc ou eau de ses arêtes. */
  private agrement: Float32Array;

  constructor(private g: Graph) {
    this.router = new Router(g);
    this.used = new Uint16Array(g.m);
    this.agrement = new Float32Array(g.n);
    for (let e = 0; e < g.m; e++) {
      const v = Math.max(g.parc[e], g.eau[e]);
      if (v > this.agrement[g.a[e]]) this.agrement[g.a[e]] = v;
      if (v > this.agrement[g.b[e]]) this.agrement[g.b[e]] = v;
    }
  }

  private costs(beta: number, terrain: Terrain) {
    const prix = this.reglages?.prixTraverseeM ?? 0;
    const key = `${beta.toFixed(2)}|${terrain}|${prix}`;
    let c = this.costCache.get(key);
    if (c) return c;
    c = coutsAretes(this.g, beta, terrain);
    // Séance qui veut peu d'arrêts : chaque rue traversée se paie.
    if (prix > 0) {
      const extra = coutsTraversees(this.g, prix);
      for (let e = 0; e < this.g.m; e++) c.cost[e] += extra[e];
    }
    if (this.costCache.size > 40) this.costCache.clear();
    this.costCache.set(key, c);
    return c;
  }


  /** Construit la boucle pour des paramètres donnés (sans ajuster le rayon). */
  private build(start: number, p: Params, terrain: Terrain, target: Cible): Candidate | null {
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
      if (w < 0 && p.vert) {
        const rayonVert = Math.min(1000, Math.max(150, 0.3 * p.radius));
        const v = g.grid.extreme(px, py, rayonVert, this.agrement, 1);
        if (v >= 0 && this.agrement[v] >= AGREMENT_MIN_POINT) w = v;
      }
      if (w < 0) w = g.grid.nearest(px, py);
      if (w >= 0 && w !== pts[pts.length - 1]) pts.push(w);
    }
    if (p.parc >= 0) this.insererTourDeParc(pts, this.parcsVises[p.parc]);
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
      // Dernier tronçon : l'arrivée peut s'arrêter avant le départ.
      const arrivee = i + 2 === pts.length && this.arriveeM > 0 ? { rayon: this.arriveeM, prixM: PRIX_ECART_ARRIVEE } : undefined;
      const r = this.router.route(pts[i], pts[i + 1], cost, Math.max(minFactor, POIDS_HEURISTIQUE_MIN), used, PENALITE_REUSE, arrivee);
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
    return { p, edges, dirs, ...m, score: score(m, target), ...(this.seance ? { seance: mesurerSeance(g, edges, dirs) } : {}) };
  }

  /**
   * Remplace le point de passage le plus proche du parc par quatre points
   * sur son pourtour (les allées les plus excentrées vers l'entrée, puis en
   * tournant dans le sens de la boucle) : le routage, qui préfère les parcs,
   * relie ces points par les allées et fait le tour.
   */
  private insererTourDeParc(pts: number[], P: Parc) {
    const g = this.g;
    let j = -1;
    let dj = Infinity;
    for (let i = 1; i < pts.length; i++) {
      const d = Math.hypot(g.x[pts[i]] - P.cx, g.y[pts[i]] - P.cy);
      if (d < dj) {
        dj = d;
        j = i;
      }
    }
    if (j < 0) return;
    const prec = pts[j - 1];
    const a0 = Math.atan2(g.y[prec] - P.cy, g.x[prec] - P.cx);
    const tour: number[] = [];
    for (let q = 0; q < 4; q++) {
      const ux = Math.cos(a0 + (q * Math.PI) / 2);
      const uy = Math.sin(a0 + (q * Math.PI) / 2);
      let best = -1;
      let bv = -Infinity;
      for (const n of P.noeuds) {
        const v = (g.x[n] - P.cx) * ux + (g.y[n] - P.cy) * uy;
        if (v > bv) {
          bv = v;
          best = n;
        }
      }
      if (best >= 0 && best !== tour[tour.length - 1]) tour.push(best);
    }
    pts.splice(j, 1, ...tour);
  }

  /** Parcs d'au moins PARC_MIN_M d'allées : composantes des arêtes surtout dans un parc. */
  private tousLesParcs(): Parc[] {
    if (this.parcs) return this.parcs;
    const g = this.g;
    const pere = Int32Array.from({ length: g.n }, (_, i) => i);
    const racine = (u: number): number => {
      while (pere[u] !== u) u = pere[u] = pere[pere[u]];
      return u;
    };
    for (let e = 0; e < g.m; e++) if (g.parc[e] >= 0.5) pere[racine(g.a[e])] = racine(g.b[e]);
    const parRacine = new Map<number, Parc>();
    for (let e = 0; e < g.m; e++) {
      if (g.parc[e] < 0.5) continue;
      const r = racine(g.a[e]);
      let P = parRacine.get(r);
      if (!P) parRacine.set(r, (P = { cx: 0, cy: 0, longueurM: 0, noeuds: [] }));
      const L = g.len[e];
      P.cx += L * (g.x[g.a[e]] + g.x[g.b[e]]) / 2;
      P.cy += L * (g.y[g.a[e]] + g.y[g.b[e]]) / 2;
      P.longueurM += L;
      P.noeuds.push(g.a[e], g.b[e]);
    }
    this.parcs = [...parRacine.values()].filter((P) => P.longueurM >= PARC_MIN_M);
    for (const P of this.parcs) {
      P.cx /= P.longueurM;
      P.cy /= P.longueurM;
      P.noeuds = [...new Set(P.noeuds)];
    }
    return this.parcs;
  }

  /** Les parcs les mieux placés pour un tour : grands et proches du départ. */
  private choisirParcs(start: number, d: number): Parc[] {
    const g = this.g;
    const dist = (P: Parc) => Math.hypot(P.cx - g.x[start], P.cy - g.y[start]);
    return this.tousLesParcs()
      .filter((P) => dist(P) <= PORTEE_PARC * d)
      .sort((A, B) => B.longueurM / (1 + dist(B) / 1000) - A.longueurM / (1 + dist(A) / 1000))
      .slice(0, N_PARCS_VISES);
  }

  /** Construit puis ajuste le rayon jusqu'à approcher la distance visée. */
  private buildAdjusted(start: number, p: Params, terrain: Terrain, target: Cible, iters: number) {
    let best: Candidate | null = null;
    let cur = { ...p };
    for (let it = 0; it < iters; it++) {
      const c = this.build(start, cur, terrain, target);
      if (!c) break;
      if (!best || c.score < best.score) best = c;
      const ratio = target.d / c.distanceM;
      // Assez près du milieu de la fourchette : pas la peine de serrer plus.
      if (Math.abs(c.distanceM - target.d) < 0.4 * tolDistanceM(target.d)) break;
      cur = { ...cur, radius: cur.radius * Math.min(2.5, Math.max(0.4, ratio)) };
    }
    return best;
  }

  /**
   * Étapes 1 à 5 depuis un départ : candidates, ajustement du rayon,
   * variantes autour des meilleures. Renvoie les candidates triées par score.
   */
  private rechercher(start: number, terrain: Terrain, target: Cible, rand: () => number,
    nCandidats: number, tours: number, nVariantes: number): Candidate[] {
    const theta0 = rand() * 2 * Math.PI;
    const r0 = target.d / (2 * Math.PI * DETOUR);
    const cands: Candidate[] = [];
    for (let i = 0; i < nCandidats; i++) {
      const p: Params = {
        theta: theta0 + i * ANGLE_OR,
        // Sortie plate : une part de « lignes droites », un seul point de
        // passage loin devant (le long d'un canal, d'un parc), retour par l'autre rive.
        k: estPlate(target) && rand() < (this.reglages?.partLignes ?? PART_LIGNES) ? 1 : K_MIN + Math.floor(rand() * (K_MAX - K_MIN + 1)),
        beta: (this.reglages?.betas ?? BETAS)[i % (this.reglages?.betas ?? BETAS).length],
        radius: r0 * (0.85 + 0.3 * rand()),
        mode: (this.reglages?.modes ?? MODES)[Math.floor(rand() * (this.reglages?.modes ?? MODES).length)],
        vert: rand() < PART_VERTS,
        parc: -1,
      };
      // Tour de parc permis : une candidate sur deux, le choix final tranche.
      if (this.parcsVises.length > 0 && (this.tourParc === 'impose' || i % 2 === 0)) {
        // La boucle passe par le parc : cercle orienté vers lui, assez grand pour l'atteindre.
        const iParc = i % this.parcsVises.length;
        const P = this.parcsVises[iParc];
        const dx = P.cx - this.g.x[start];
        const dy = P.cy - this.g.y[start];
        p.parc = iParc;
        p.theta = Math.atan2(dy, dx) + (rand() - 0.5) * 1.2;
        p.radius = Math.max(p.radius, 0.55 * Math.hypot(dx, dy));
      }
      if (i >= MIN_CANDIDATS && this.epuise()) break;
      const c = this.buildAdjusted(start, p, terrain, target, ITER_RAYON);
      if (c) cands.push(c);
    }
    // Les tours supplémentaires ne servent que si rien n'est encore dans la tolérance.
    for (let tour = 0; tour < tours && cands.length > 0; tour++) {
      if (TRI_PARENTS_AGREMENT) {
        cands.sort((x, y) => Number(dansTolerance(y, target)) - Number(dansTolerance(x, target)) || this.cle(x, target) - this.cle(y, target));
      } else cands.sort((x, y) => x.score - y.score);
      if (tour > 0 && cands.some((c) => dansTolerance(c, target))) break;
      const parents = cands.slice(0, N_PARENTS);
      const parVariante = Math.ceil(nVariantes / parents.length);
      let nVar = 0;
      for (const par of parents) {
        for (let v = 0; v < parVariante && nVar < nVariantes && !this.epuise(); v++, nVar++) {
          // D+ libre : rien à corriger, seules l'orientation et la forme varient.
          const errH = target.h == null ? 0 : Math.log(Math.max(target.h, 10) / Math.max(par.dplusM, 10));
          const pas = Math.max(-1.6, Math.min(1.6, errH * 1.8));
          const p: Params = {
            theta: par.p.theta + (v === 0 ? 0 : (rand() - 0.5) * 0.7),
            k: v === 2 && par.p.k > 1 ? K_MIN + Math.floor(rand() * (K_MAX - K_MIN + 1)) : par.p.k,
            beta: Math.max(-3, Math.min(5, par.p.beta + pas * (v === 0 ? 1 : 0.5 + rand()))),
            radius: par.p.radius * (target.d / par.distanceM),
            mode: v === 3 ? (errH > 0.1 ? 1 : errH < -0.1 ? -1 : 0) : par.p.mode,
            vert: par.p.vert,
            parc: par.p.parc,
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
    this.arriveeM = Math.max(0, req.arriveeM ?? ARRIVEE_M);
    this.seance = req.seance ?? null;
    this.reglages = this.seance ? REGLAGES[this.seance.type] : null;
    const vide = (message: string, startNode = -1): LoopResponse => ({
      ok: false, loops: [], message, startNode,
      stats: { candidates: 0, routes: this.routes, travail: this.travail, ms: now() - t0 },
    });

    const libre = req.dplusM == null || Number.isNaN(req.dplusM);
    if (!(req.distanceKm > 0) || (!libre && !(req.dplusM! >= 0))) return vide('Distance et D+ doivent être positifs.');
    const demande = nearestNode(g, req.lat, req.lon);
    if (demande < 0 || distanceToNode(g, req.lat, req.lon, demande) > 300) {
      return vide('Point de départ trop loin d\u2019un chemin de la zone (plus de 300 m). Choisis un point sur un chemin ou une route.');
    }
    const target: Cible = { d: req.distanceKm * 1000, h: libre ? null : Math.max(req.dplusM!, 1) };
    this.tourParc = req.tourParc ?? 'permis';
    this.parcsVises = this.tourParc === 'exclu' ? [] : this.choisirParcs(demande, target.d);
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
      for (const alt of this.departsAlternatifs(start, target.h != null && cands[0].dplusM < target.h)) {
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

    // Choix final : les meilleures, assez différentes entre elles. Celles
    // dans la tolérance d'abord : le score peut classer devant elles une
    // boucle hors tolérance (+2 % / +18 % bat 4 % / 13 %), qui l'évinçait.
    const ordre = [...cands].sort(
      (x, y) => Number(dansTolerance(y, target)) - Number(dansTolerance(x, target)) || this.cle(x, target) - this.cle(y, target),
    );
    const choisies: { c: Candidate; set: Set<number> }[] = [];
    for (const c of ordre) {
      const set = new Set(c.edges);
      // Deux « lignes droites » au plus : les boucles rondes gardent leur place.
      if (c.p.k === 1 && choisies.filter((s) => s.c.p.k === 1).length >= LIGNES_MAX) continue;
      if (choisies.every((s) => jaccard(set, s.set) < 0.5)) choisies.push({ c, set });
      if (choisies.length === 5) break;
    }
    const loops = choisies.map(({ c }) => finaliser(g, c, target));
    if (this.seance) {
      choisies.forEach(({ c }, k) => {
        if (c.seance) loops[k].seance = { ...c.seance, resume: resumeSeance(this.seance!, c.seance) };
      });
    }
    // D+ libre : du plus roulant au plus vallonné, pour choisir. Avec une
    // séance, l'ordre du choix est gardé : la n°1 est la mieux adaptée.
    if (libre && !this.seance) loops.sort((a, b) => a.dplusM - b.dplusM);
    const nOk = loops.filter((l) => l.dansTolerance).length;
    const stats = { candidates: cands.length, routes: this.routes, travail: this.travail, ms: now() - t0 };

    if (nOk === 0) {
      const b = loops[0];
      const suggestion = target.h == null ? null : suggererDplus(cands, target.h, target.d);
      const conseil = suggestion
        ? ` À ${req.distanceKm} km, les boucles possibles ici font de ${suggestion.plage[0]} à ${suggestion.plage[1]} m D+ : ` +
          `essaie ${suggestion.dplusM} m (${suggestion.sens === 'reduire' ? 'moins' : 'plus'} de D+).`
        : ` La plus proche fait ${(b.distanceM / 1000).toFixed(1)} km (${pct(b.ecartDistance)}) ` +
          `pour ${Math.round(b.dplusM)} m D+${libre ? '' : ` (${pct(b.ecartDplus)})`}.`;
      return {
        ok: false, loops, startNode: start, stats, suggestion: suggestion ?? undefined,
        message: `Impossible depuis ce départ, même en le décalant de 2 km au plus.${conseil}`,
      };
    }
    const dplusOk = loops.filter((l) => l.dansTolerance).map((l) => Math.round(l.dplusM));
    const resume = (libre
      ? `${nOk} boucle${nOk > 1 ? 's' : ''} de ${req.distanceKm} km (${libelleTolDistance(target.d)}), de ${Math.min(...dplusOk)} à ${Math.max(...dplusOk)} m D+ : à toi de choisir.`
      : `${nOk} boucle${nOk > 1 ? 's' : ''} dans la tolérance sur ${loops.length} proposée${loops.length > 1 ? 's' : ''}.`)
      + (this.tourParc === 'impose' && this.parcsVises.length === 0 ? ' Aucun grand parc à portée : boucles sans tour de parc.' : '')
      + (this.seance && loops[0]?.seance ? avertissementSeance(this.seance, loops[0].seance) : '');
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
function suggererDplus(cands: Candidate[], h: number, d: number): LoopResponse['suggestion'] | null {
  const t = { d, h };
  const dp = cands.filter((c) => Math.abs(c.distanceM - t.d) <= tolDistanceM(t.d)).map((c) => c.dplusM);
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

/** Distance (m) et D+ (m) visés ; h null : D+ libre, seule la distance compte. */
export interface Cible {
  d: number;
  h: number | null;
}

function dansTolerance(c: { distanceM: number; dplusM: number }, t: Cible) {
  return Math.abs(c.distanceM - t.d) <= tolDistanceM(t.d) && (t.h == null || Math.abs(c.dplusM - t.h) / t.h <= TOL_DPLUS);
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

function score(m: { distanceM: number; dplusM: number; allerRetour: number }, t: Cible) {
  const eh = t.h == null ? 0 : Math.abs(m.dplusM - t.h) / t.h / TOL_DPLUS;
  // Au-delà de la tolérance, l'écart pèse davantage : on préfère deux
  // écarts modérés à un critère respecté et l'autre très loin.
  const f = (x: number) => (x <= 1 ? x : 1 + 2 * (x - 1));
  return scoreDistance(m.distanceM, t.d) + f(eh) + m.allerRetour / SEUIL_ALLER_RETOUR;
}

export function finaliser(g: Graph, c: Omit<Candidate, 'p'>, t: Cible): Loop {
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
