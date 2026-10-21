// Éléments communs aux jeux du banc : contexte, critères, seuils, mise en forme.

import { CLASSES, CLS_INCONNUE } from '../src/core/graph';
import type { Generateur } from './load';

export const SEUIL_REUSSITE = 0.8;
export const SEUIL_TEMPS_MS = 10_000;
export const CIBLE_TEMPS_MS = 3_000;

export interface Critere { nom: string; seuil: string; valeur: string; ok: boolean }

/** Ce que chaque jeu reçoit : le même générateur que l'app, la graine, les régions présentes. */
export interface Contexte {
  gen: Generateur;
  seed: number;
  presentes: Set<string>;
  /** Écrire les fichiers d'exemple (GPX) ; faux avec --no-write. */
  ecrire: boolean;
}

/** Résultat d'un jeu, assemblé par bench/bench.ts dans RESULTATS.md. */
export interface ResultatJeu {
  id: string;
  ok: boolean;
  /** Ligne du verdict en tête du rapport (sans la puce). */
  verdict: string;
  /** Section du rapport, en Markdown (sans saut de ligne final). */
  section: string;
  /** GPX d'exemple écrits, listés en fin de rapport. */
  gpx?: string[];
}

/** Un jeu : identifiant (pour --jeu), et s'il tourne sans --jeu (banc de la CI). */
export interface Jeu {
  id: string;
  parDefaut: boolean;
  jouer(ctx: Contexte): Promise<ResultatJeu[]>;
}

/** Familles de voies pour mesurer la composition des boucles. */
export const FAMILLES: [string, readonly string[]][] = [
  ['Grandes routes (primary, secondary)', ['primary', 'secondary']],
  ['Routes tertiaires', ['tertiary']],
  ['Rues et dessertes', ['residential', 'living_street', 'unclassified', 'service', 'unknown']],
  ['Pistes cyclables', ['cycleway']],
  ['Voies piétonnes et sentiers', ['pedestrian', 'path', 'track', 'footway', 'steps', 'bridleway']],
];
export function famille(cls: number): number {
  if (cls === CLS_INCONNUE) return -1;
  const nom = CLASSES[cls];
  return FAMILLES.findIndex(([, l]) => l.includes(nom));
}

/** D+ visé pour le rapport ; NaN : D+ libre. */
export function dplusTxt(dp: number) {
  return Number.isNaN(dp) ? 'D+ libre' : `${dp} m`;
}

export function pct(x: number) {
  return `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)} %`;
}

export const tableauCriteres = (criteres: Critere[]) => `| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
${criteres.map((c) => `| ${c.nom} | ${c.seuil} | ${c.valeur} | ${c.ok ? '✅' : '❌'} |`).join('\n')}`;

export const afficherCriteres = (criteres: Critere[]) => {
  for (const k of criteres) console.log(`  ${k.ok ? 'OK ' : 'KO '} ${k.nom} : ${k.valeur} (seuil ${k.seuil})`);
};
