// Type de séance : en plus du calcul par défaut, jamais à sa place. Sans
// séance choisie, le générateur ne passe par aucune fonction de ce fichier ;
// avec une séance, il garde tout son calcul et y ajoute :
//  - des réglages de construction (relief attiré ou évité, part de « lignes
//    droites » le long d'un canal ou d'un parc) ;
//  - des mesures propres à la séance (traversées de rues, plus long tronçon
//    continu, meilleure côte, part sur chemin) ;
//  - un terme de plus dans la clé du choix final, qui départage les boucles
//    du même groupe (dans la tolérance ou non) : le taux de réussite n'en
//    dépend pas.

import { CLASSES, TYPE_SENTIER, type Graph } from './graph';

export type TypeSeance = 'footing' | 'sortie-longue' | 'fractionne' | 'seuil' | 'cotes' | 'recuperation';

export const TYPES_SEANCE: { id: TypeSeance; libelle: string; aide: string }[] = [
  { id: 'footing', libelle: 'Footing', aide: 'Une boucle agréable à la bonne distance : le calcul par défaut.' },
  { id: 'sortie-longue', libelle: 'Sortie longue', aide: 'Une boucle agréable sur une plus grande distance : le calcul par défaut, comme le footing.' },
  { id: 'fractionne', libelle: 'Fractionné', aide: 'Un tronçon plat et sans traversée, au moins aussi long que tes répétitions, pour les enchaîner.' },
  { id: 'seuil', libelle: 'Seuil / tempo', aide: 'Plusieurs kilomètres continus, plats et sans traversée, pour tenir l’allure.' },
  { id: 'cotes', libelle: 'Côtes', aide: 'Une montée de 150 à 400 m à 5-12 % sur la boucle, à répéter.' },
  { id: 'recuperation', libelle: 'Récupération', aide: 'Plat et tranquille, sur chemins de préférence.' },
];

/** Tronçon continu visé par défaut (fractionné, seuil), en mètres. */
export const TRONCON_DEFAUT_M: Partial<Record<TypeSeance, number>> = { fractionne: 1000, seuil: 3000 };

export interface Seance {
  type: TypeSeance;
  /** Fractionné, seuil : longueur continue visée, en mètres. */
  tronconM?: number;
}

/** Mesures propres aux séances, sur une boucle. */
export interface MesuresSeance {
  /** Traversées de rues ouvertes aux voitures, par km. */
  traversees: number;
  /** Plus long tronçon plat (moins de 4 % par tronçon) sans traversée, en mètres. */
  tronconM: number;
  /** Meilleure côte : longueur (m) et pente moyenne (%) ; 0 si aucune. */
  coteM: number;
  cotePente: number;
  /** Part de la distance sur chemin (non revêtu ou sentier). */
  partChemin: number;
  /** D+ par km. */
  dplusKm: number;
}

/** Réglages de construction d'une séance (absents : ceux par défaut). */
export interface ReglagesSeance {
  /** Relief : liste de beta tirés en rond (> 0 attire, < 0 évite). */
  betas?: number[];
  /** Points intermédiaires : le plus proche (0), le plus haut (1), le plus bas (-1). */
  modes?: (-1 | 0 | 1)[];
  /** Part des candidates « ligne droite » (un seul point de passage). */
  partLignes?: number;
  /** Les virages serrés ne comptent pas (lacets d'une côte). */
  sansVirages?: boolean;
  /** Coût ajouté au tracé pour chaque rue traversée, en mètres équivalents. */
  prixTraverseeM?: number;
}

// Une rue traversée coûte l'équivalent de 150 m de chemin au tracé. Mesuré à
// 0 / 60 / 150 / 300 m sur 7 départs (Strasbourg, Paris, Annecy) : 150 m
// divise les traversées par 2 à 2,5 (fractionné 8,5 → 3,6 par km), toutes
// les demandes tenues ; 300 m n'apporte plus rien.
const PT = 150;
export const REGLAGES: Record<TypeSeance, ReglagesSeance> = {
  // La distance fait la sortie longue : la boucle libre suffit.
  footing: {},
  'sortie-longue': {},
  // Plat avant tout : relief évité, et une moitié de lignes droites, la forme
  // la plus sûre d'offrir une longue portion continue (canal, berge, allée).
  fractionne: { betas: [-2, -0.8, 0], partLignes: 0.5, prixTraverseeM: PT },
  seuil: { betas: [-2, -0.8, 0], partLignes: 0.5, prixTraverseeM: PT },
  // Relief attiré, points intermédiaires vers les hauteurs.
  cotes: { betas: [0.8, 1.8, 3], modes: [1, 1, 0], sansVirages: true },
  recuperation: { betas: [-2, -0.8], partLignes: 0.25 },
};

// Pente par tronçon en dessous de laquelle une portion compte comme plate.
// 2,5 % coupait les portions au moindre écart du modèle de terrain (1 m sur
// 30 m) ; mesuré à 2,5 / 4 / 6 % sur 7 départs : 4 % allonge le tronçon
// continu de 40 % sans y admettre de vraie montée.
const PENTE_PLATE = 0.04;
const COTE_PENTE_MIN = 0.04;

let codesVoitures: Set<number> | null = null;
/** Classes ouvertes aux voitures (une rue à traverser), hors voies piétonnes et chemins. */
function voitures(): Set<number> {
  if (!codesVoitures) {
    const sans = new Set(['pedestrian', 'cycleway', 'path', 'track', 'footway', 'steps', 'bridleway', 'living_street']);
    codesVoitures = new Set(CLASSES.map((c, k) => (sans.has(c) ? -1 : k)).filter((k) => k >= 0));
  }
  return codesVoitures;
}

/**
 * Mesures d'une boucle (arêtes orientées) pour les séances. Une traversée est
 * un nœud de passage où une autre rue ouverte aux voitures rejoint le
 * chemin : un carrefour, un arrêt possible.
 */
export function mesurerSeance(g: Graph, edges: number[], dirs: number[]): MesuresSeance {
  const autos = voitures();
  let distanceM = 0;
  let dplus = 0;
  let cheminM = 0;
  let traversees = 0;
  let tronconM = 0;
  let courant = 0;
  let coteM = 0;
  let cotePente = 0;
  let coteScore = 0;
  let monteeM = 0;
  let monteeGain = 0;
  const noteCote = (m: number, gain: number) => {
    if (m < 100) return 0;
    const p = gain / m;
    // Idéal : 150 à 400 m à 5-12 %.
    const fLong = Math.min(1, m / 150) * (m > 600 ? 600 / m : 1);
    const fPente = p < 0.05 ? p / 0.05 : p > 0.12 ? 0.12 / p : 1;
    return fLong * fPente;
  };
  const finirMontee = () => {
    const s = noteCote(monteeM, monteeGain);
    if (s > coteScore) {
      coteScore = s;
      coteM = monteeM;
      cotePente = monteeM > 0 ? (100 * monteeGain) / monteeM : 0;
    }
    monteeM = 0;
    monteeGain = 0;
  };
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    const L = g.len[e];
    const up = dirs[i] ? g.upAB[e] : g.upBA[e];
    const down = dirs[i] ? g.upBA[e] : g.upAB[e];
    distanceM += L;
    dplus += up;
    if (g.type[e] === TYPE_SENTIER) cheminM += L;
    // Côte : arêtes successives qui montent assez.
    if (L > 0 && up / L >= COTE_PENTE_MIN) {
      monteeM += L;
      monteeGain += up;
    } else finirMontee();
    // Tronçon continu : plat, interrompu par une traversée.
    if (L > 0 && (up + down) / L <= PENTE_PLATE) courant += L;
    else courant = 0;
    tronconM = Math.max(tronconM, courant);
    if (i + 1 < edges.length) {
      const v = dirs[i] ? g.b[e] : g.a[e];
      const suivante = edges[i + 1];
      let traverse = false;
      for (let k = g.adjStart[v]; k < g.adjStart[v + 1]; k++) {
        const f = g.adjEdge[k];
        if (f !== e && f !== suivante && autos.has(g.cls[f])) {
          traverse = true;
          break;
        }
      }
      if (traverse) {
        traversees++;
        courant = 0;
      }
    }
  }
  finirMontee();
  const km = distanceM / 1000;
  return {
    traversees: km > 0 ? traversees / km : 0,
    tronconM,
    coteM: coteScore > 0 ? coteM : 0,
    cotePente: coteScore > 0 ? cotePente : 0,
    partChemin: distanceM > 0 ? cheminM / distanceM : 0,
    dplusKm: km > 0 ? dplus / km : 0,
  };
}

/**
 * Coût de tracé ajouté à chaque arête pour les rues traversées à ses bouts :
 * la moitié de `prixM` par bout où une autre rue ouverte aux voitures arrive.
 */
export function coutsTraversees(g: Graph, prixM: number): Float64Array {
  const autos = voitures();
  const nAutos = new Uint16Array(g.n);
  for (let e = 0; e < g.m; e++) {
    if (autos.has(g.cls[e])) {
      nAutos[g.a[e]]++;
      nAutos[g.b[e]]++;
    }
  }
  const extra = new Float64Array(g.m);
  for (let e = 0; e < g.m; e++) {
    const soi = autos.has(g.cls[e]) ? 1 : 0;
    const t = Number(nAutos[g.a[e]] - soi > 0) + Number(nAutos[g.b[e]] - soi > 0);
    extra[e] = (prixM * t) / 2;
  }
  return extra;
}

/** Note de côte (0 à 1) recalculée depuis les mesures. */
function noteCote(m: MesuresSeance) {
  if (m.coteM < 100) return 0;
  const p = m.cotePente / 100;
  const fLong = Math.min(1, m.coteM / 150) * (m.coteM > 600 ? 600 / m.coteM : 1);
  const fPente = p < 0.05 ? p / 0.05 : p > 0.12 ? 0.12 / p : 1;
  return fLong * fPente;
}

/**
 * Terme ajouté à la clé du choix final (plus bas = mieux), en points de
 * score : un point vaut à peu près un point de part au bord de l'eau × 2.
 */
export function termeSeance(s: Seance, m: MesuresSeance): number {
  switch (s.type) {
    case 'footing':
    case 'sortie-longue':
      return 0;
    case 'fractionne':
    case 'seuil': {
      const cible = s.tronconM ?? TRONCON_DEFAUT_M[s.type]!;
      return -3 * Math.min(1, m.tronconM / cible) + 0.2 * m.traversees;
    }
    case 'cotes':
      return -3 * noteCote(m);
    case 'recuperation':
      return 0.1 * m.dplusKm - m.partChemin + 0.1 * m.traversees;
  }
}

/** Phrase courte pour la carte d'une boucle. */
export function resumeSeance(s: Seance, m: MesuresSeance): string {
  const km = (v: number) => (v / 1000).toFixed(1).replace('.', ',');
  switch (s.type) {
    case 'footing':
    case 'sortie-longue':
      return '';
    case 'fractionne':
    case 'seuil':
      return `tronçon continu de ${km(m.tronconM)} km (plat, sans traversée)`;
    case 'cotes':
      return m.coteM > 0 ? `côte de ${Math.round(m.coteM / 10) * 10} m à ${Math.round(m.cotePente)} %` : 'aucune côte marquée';
    case 'recuperation':
      return `${Math.round(m.partChemin * 100)} % sur chemin · ${Math.round(m.dplusKm)} m D+/km`;
  }
}

/** Avertissement quand la boucle n°1 ne remplit pas l'objectif de la séance. */
export function avertissementSeance(s: Seance, m: MesuresSeance): string {
  if (s.type === 'fractionne' || s.type === 'seuil') {
    const cible = s.tronconM ?? TRONCON_DEFAUT_M[s.type]!;
    if (m.tronconM < cible) {
      return ` Aucun tronçon continu de ${(cible / 1000).toFixed(1).replace('.', ',')} km trouvé ici : le plus long fait ${Math.round(m.tronconM / 10) * 10} m.`;
    }
  }
  if (s.type === 'cotes' && noteCote(m) < 0.5) return ' Pas de vraie côte à portée : le relief est faible autour du départ.';
  return '';
}
