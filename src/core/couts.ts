// Coût des arêtes pour A* : relief, terrain, classe de voie, agrément (parcs,
// eau, itinéraires balisés) et voies rapides. Les points de score du choix
// final qui vont avec sont dans regles.ts (cleChoix).

import { CLASSES, CODES_SANS_VOITURE, TYPE_SENTIER, type Graph, type Terrain } from './graph';

// A* pondéré : l'heuristique exacte (minorée par le plus petit facteur de
// coût, 0,2 quand le relief est attiré) n'élague presque rien et coûtait
// jusqu'à 20 s sur le réseau dense de Paris. Le coût n'est lui-même qu'une
// heuristique de forme de boucle : un chemin légèrement sous-optimal suffit.
// Mesuré sur les trois jeux du banc (0 ; 0,6 ; 0,8 ; 1) : 1 est le plus
// rapide et ne perd aucune réussite.
export const POIDS_HEURISTIQUE_MIN = 1;

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
 * rapporte des points de score (cleChoix, regles.ts), entre boucles du même groupe (dans la
 * tolérance ou non) : le taux de réussite n'en dépend pas. Le coût seul ne
 * suffit pas, la forme de la boucle venant des points de passage. Mesuré sur
 * 10 départs près de parcs (Paris, Strasbourg, Colmar, Mulhouse, Annecy) :
 * 26 % de la distance dans les parcs sans rien, 29 % par le coût seul, 38 %
 * avec le choix (40 % avec un poids de 4, qui laisse passer plus d'allers-retours).
 */
const BONUS_PARC = 0.5;
/**
 * Bord de l'eau (à moins de 30 m), mêmes deux étages que les parcs : coût
 * moitié moins, et des points de score au choix final (regles.ts). Une
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
const FACTEURS_PAR_CODE = Float64Array.from({ length: 256 }, (_, k) =>
  CODES_SANS_VOITURE.has(k) ? 1 : (FACTEUR_CLASSE[CLASSES[k]] ?? 1) * FACTEUR_VOITURES);

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
