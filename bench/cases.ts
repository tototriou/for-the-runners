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

/** Cibles impossibles : l'app doit répondre par un message, jamais une erreur. */
export const CAS_IMPOSSIBLES: (Omit<Cas, 'id'> & { attendu: string })[] = [
  { depart: 'Annecy centre', lat: 45.8992, lon: 6.1294, distanceKm: 4, dplusM: 1500, terrain: 'mixte', attendu: 'boucle la plus proche' },
  { depart: 'Annecy centre', lat: 45.8992, lon: 6.1294, distanceKm: 25, dplusM: 0, terrain: 'route', attendu: 'boucle la plus proche' },
  { depart: 'Milieu du lac', lat: 45.85, lon: 6.18, distanceKm: 10, dplusM: 200, terrain: 'mixte', attendu: 'départ hors réseau' },
  { depart: 'Annecy centre', lat: 45.8992, lon: 6.1294, distanceKm: 0, dplusM: 100, terrain: 'mixte', attendu: 'saisie invalide' },
];
