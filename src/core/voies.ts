// Type de voie le long d'une boucle, pour le bandeau sous le profil.

import { TYPE_SENTIER, type Graph } from './graph';
import { CODES_SANS_VOITURE, type Loop } from './loops';

/** Chemin (sentier, piste), voie sans voitures (voie verte, piétonne…) ou route. */
export type Voie = 'chemin' | 'sans-voitures' | 'route';

export interface SegmentVoie {
  /** Début et fin le long de la boucle, en mètres (somme des longueurs d'arêtes). */
  debutM: number;
  finM: number;
  voie: Voie;
}

/** Boucle telle que l'interface la reçoit : le worker y ajoute les voies. */
export type BoucleAffichee = Loop & { voies?: SegmentVoie[] };

export function voieArete(g: Graph, e: number): Voie {
  if (g.type[e] === TYPE_SENTIER) return 'chemin';
  return CODES_SANS_VOITURE.has(g.cls[e]) ? 'sans-voitures' : 'route';
}

/** Segments consécutifs de même type fusionnés. */
export function voiesBoucle(g: Graph, edges: number[]): SegmentVoie[] {
  const out: SegmentVoie[] = [];
  let d = 0;
  for (const e of edges) {
    const voie = voieArete(g, e);
    const dernier = out[out.length - 1];
    if (dernier && dernier.voie === voie) dernier.finM = d + g.len[e];
    else out.push({ debutM: d, finM: d + g.len[e], voie });
    d += g.len[e];
  }
  return out;
}
