// Règles du produit : tolérances, score, choix final. Source de vérité
// unique, importée par tous les générateurs ; un changement ici se juge au
// banc (RESULTATS.md).

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

/** Distance (m) et D+ (m) visés ; h null : D+ libre, seule la distance compte. */
export interface Cible {
  d: number;
  h: number | null;
}

export function dansTolerance(c: { distanceM: number; dplusM: number }, t: Cible) {
  return Math.abs(c.distanceM - t.d) <= tolDistanceM(t.d) && (t.h == null || Math.abs(c.dplusM - t.h) / t.h <= TOL_DPLUS);
}

/** Score d'une boucle : écarts relatifs aux tolérances, allers-retours (plus bas, mieux). */
export function scoreBoucle(m: { distanceM: number; dplusM: number; allerRetour: number }, t: Cible) {
  const eh = t.h == null ? 0 : Math.abs(m.dplusM - t.h) / t.h / TOL_DPLUS;
  // Au-delà de la tolérance, l'écart pèse davantage : on préfère deux
  // écarts modérés à un critère respecté et l'autre très loin.
  const f = (x: number) => (x <= 1 ? x : 1 + 2 * (x - 1));
  return scoreDistance(m.distanceM, t.d) + f(eh) + m.allerRetour / SEUIL_ALLER_RETOUR;
}

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
// Un demi-tour (on part sur une voie et on revient par la même) n'est
// accepté que si l'aller fait au moins cette longueur : vers un sommet, oui ;
// au bout d'une rue, non.
export const DEMI_TOUR_MIN_M = 1000;

/** Boucles proposées, assez différentes entre elles (Jaccard des arêtes sous ce seuil). */
export const N_BOUCLES = 5;
export const JACCARD_MAX = 0.5;

/**
 * Points de score au choix final, par point de part de la distance : parcs,
 * bord de l'eau, itinéraires balisés et voies sans voitures rapportent,
 * voies rapides coûtent (rabais de coût correspondants et mesures : loops.ts).
 * Poids calés sur un circuit modèle : le tour de la Grande
 * Île de Strasbourg par les quais (zones de rencontre, chemins de berge,
 * parcs). Avec l'eau à 4, les parcs à 2 et le sans-voitures à 1, l'app lui
 * préférait des berges de canal plus longues mais sans charme (3,5 boucles
 * proposées sur 5 notées au-dessus de lui) ; avec 2 / 3 / 0,5, les zones de
 * rencontre comptées sans voitures et 2 à 6 points de passage, il passe en
 * tête (0,3 sur 5 au-dessus) et la boucle n°1 en recouvre 58 % au lieu de 43 %.
 */
const POIDS_EAU_CHOIX = 2;
const POIDS_PARC_CHOIX = 3;
const POIDS_SANS_VOITURE_CHOIX = 0.5;
const POIDS_ITIN_CHOIX = 2;
const POIDS_RAPIDE_CHOIX = 6;
/**
 * Sortie plate : chaque virage serré par km coûte 0,6 point au choix. Les
 * circuits modèles en ont 1,5 et 1,8 par km, les boucles en escalier de rues
 * 3 à 4. Sur 15 départs, la n°1 passe de 2,8 à 2,2 virages par km, 59
 * demandes sur 60 tenues ; la n°1 du circuit de l'Orangerie le recouvre à
 * 36 % au lieu de 20 %.
 */
const POIDS_VIRAGES = 0.6;
/**
 * Sortie à dénivelé : le D+ prime, l'agrément ne compte qu'à moitié et les
 * zigzags ne sont pas pénalisés (lacets d'une montée). Effet faible mesuré
 * sur Annecy (82 % tenu, agrément quasi inchangé) : réglage de principe.
 */
const FACTEUR_AGREMENT_DPLUS = 0.5;
/** Sortie plate : D+ libre ou moins de PENTE_PLATE m par km. */
const PENTE_PLATE = 15;
export const estPlate = (t: Cible) => t.h == null || t.h / (t.d / 1000) < PENTE_PLATE;
/** Clé du choix final : entre deux boucles du même groupe, la plus agréable passe devant. */
export const cleChoix = (
  c: { score: number; partParc: number; partEau: number; partSansVoiture: number; partRapide: number; partItin: number; virages: number },
  plate: boolean,
) => {
  const agrement = POIDS_PARC_CHOIX * c.partParc + POIDS_EAU_CHOIX * c.partEau + POIDS_SANS_VOITURE_CHOIX * c.partSansVoiture
    - POIDS_RAPIDE_CHOIX * c.partRapide + POIDS_ITIN_CHOIX * c.partItin;
  return plate ? c.score - agrement + POIDS_VIRAGES * c.virages : c.score - FACTEUR_AGREMENT_DPLUS * agrement;
};
