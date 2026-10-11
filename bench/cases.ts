import type { Terrain } from '../src/core/graph';

export interface Cas {
  id: number;
  depart: string;
  lat: number;
  lon: number;
  distanceKm: number;
  dplusM: number;
  terrain: Terrain;
}

/** 5 départs répartis dans la zone d'Annecy, chacun sur le réseau. */
export const DEPARTS: { nom: string; lat: number; lon: number }[] = [
  { nom: 'Annecy centre', lat: 45.8992, lon: 6.1294 },
  { nom: 'Sévrier', lat: 45.864, lon: 6.143 },
  { nom: 'Talloires', lat: 45.841, lon: 6.214 },
  { nom: 'Seynod', lat: 45.885, lon: 6.09 },
  { nom: 'Pringy', lat: 45.942, lon: 6.115 },
];

const DISTANCES = [5, 7, 10, 12, 15, 18, 20, 24, 27, 30];
// Pente moyenne visée (m de D+ par km) : de la sortie plate à la sortie raide.
const PENTES = [10, 25, 40, 55, 20, 35, 50, 15, 30, 45];
const TERRAINS: Terrain[] = ['mixte', 'mixte', 'sentiers', 'route'];

/**
 * 50 demandes déterministes : 5 départs × 10 distances de 5 à 30 km, D+ de
 * 50 à 1 500 m. La pente associée à chaque distance tourne d'un départ à
 * l'autre, pour que chaque départ voie des sorties plates et raides.
 */
export function casDeTest(): Cas[] {
  const out: Cas[] = [];
  DEPARTS.forEach((d, i) => {
    DISTANCES.forEach((km, j) => {
      const pente = PENTES[(j + 3 * i) % PENTES.length];
      const dplus = Math.min(1500, Math.max(50, Math.round((km * pente) / 10) * 10));
      out.push({
        id: out.length + 1, depart: d.nom, lat: d.lat, lon: d.lon,
        distanceKm: km, dplusM: dplus, terrain: TERRAINS[(i + j) % TERRAINS.length],
      });
    });
  });
  return out;
}

/**
 * Départs des régions Alsace et Île-de-France, chacun avec la plage de
 * pente moyenne (m de D+ par km) que son terrain rend réaliste : la plaine
 * de Strasbourg ou Paris intra-muros n'offrent pas le relief des Vosges.
 * Plages fixées d'après le terrain, avant toute mesure.
 */
export const DEPARTS_REGIONAUX: { region: string; nom: string; lat: number; lon: number; pente: [number, number] }[] = [
  { region: 'Alsace', nom: 'Strasbourg', lat: 48.5734, lon: 7.7521, pente: [3, 8] },
  { region: 'Alsace', nom: 'Mulhouse', lat: 47.7508, lon: 7.3359, pente: [5, 15] },
  { region: 'Alsace', nom: 'Colmar', lat: 48.0794, lon: 7.3585, pente: [10, 40] },
  { region: 'Alsace', nom: 'Munster', lat: 48.0408, lon: 7.1347, pente: [20, 55] },
  { region: 'Alsace', nom: 'Obernai', lat: 48.4622, lon: 7.4819, pente: [15, 45] },
  { region: 'Île-de-France', nom: 'Paris centre', lat: 48.853, lon: 2.3499, pente: [3, 10] },
  { region: 'Île-de-France', nom: 'Meudon', lat: 48.8125, lon: 2.238, pente: [8, 20] },
  { region: 'Île-de-France', nom: 'Chevreuse', lat: 48.7064, lon: 2.039, pente: [10, 25] },
  { region: 'Île-de-France', nom: 'Fontainebleau', lat: 48.4047, lon: 2.7016, pente: [8, 20] },
  { region: 'Île-de-France', nom: 'Saint-Germain-en-Laye', lat: 48.8989, lon: 2.0938, pente: [5, 15] },
];

const DISTANCES_REGIONALES = [6, 10, 14, 18, 24, 30];
// Position dans la plage de pente du départ (0 = bas, 1 = haut), tournante.
const POSITIONS_PENTE = [0, 0.6, 0.2, 1, 0.4, 0.8];

/** 6 demandes par départ régional : 6 à 30 km, pente dans la plage du départ. */
export function casRegionaux(): (Cas & { region: string })[] {
  const out: (Cas & { region: string })[] = [];
  DEPARTS_REGIONAUX.forEach((d, i) => {
    DISTANCES_REGIONALES.forEach((km, j) => {
      const t = POSITIONS_PENTE[(j + i) % POSITIONS_PENTE.length];
      const pente = d.pente[0] + t * (d.pente[1] - d.pente[0]);
      out.push({
        id: out.length + 1, region: d.region, depart: d.nom, lat: d.lat, lon: d.lon,
        distanceKm: km, dplusM: Math.min(1500, Math.max(20, Math.round((km * pente) / 10) * 10)),
        terrain: TERRAINS[(i + j) % TERRAINS.length],
      });
    });
  });
  return out;
}

/** Cibles impossibles : l'app doit répondre par un message, jamais une erreur. */
export const CAS_IMPOSSIBLES: (Omit<Cas, 'id'> & { attendu: string })[] = [
  { depart: 'Annecy centre', lat: 45.8992, lon: 6.1294, distanceKm: 4, dplusM: 1500, terrain: 'mixte', attendu: 'boucle la plus proche' },
  { depart: 'Annecy centre', lat: 45.8992, lon: 6.1294, distanceKm: 25, dplusM: 0, terrain: 'route', attendu: 'boucle la plus proche' },
  { depart: 'Milieu du lac', lat: 45.85, lon: 6.18, distanceKm: 10, dplusM: 200, terrain: 'mixte', attendu: 'départ hors réseau' },
  { depart: 'Annecy centre', lat: 45.8992, lon: 6.1294, distanceKm: 0, dplusM: 100, terrain: 'mixte', attendu: 'saisie invalide' },
  { depart: 'Lyon (hors régions)', lat: 45.764, lon: 4.8357, distanceKm: 10, dplusM: 200, terrain: 'mixte', attendu: 'hors régions' },
];
