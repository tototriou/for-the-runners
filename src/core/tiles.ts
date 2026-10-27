// Données découpées en tuiles (écrites par scripts/prepare_data.py) :
// choix des tuiles utiles à une demande, chargement avec cache, fusion en
// un seul graphe. Une seule couverture nationale, sans régions : une boucle
// passe d'une tuile à l'autre partout.

import { CLS_INCONNUE, decodeGraph, type Graph, type ZoneDoc } from './graph';

export interface Manifest {
  v: number;
  /** Taille d'une tuile : [degrés de latitude, degrés de longitude]. */
  tileDeg: [number, number];
  reseau: string;
  mnt: string;
  octets: number;
  /** Nom de tuile (« ligne_colonne » de la grille) → taille en octets. */
  tuiles: Record<string, number>;
}

export interface TileDoc {
  v: number;
  tile: string;
  /**
   * Identifiant national de chaque nœud partagé avec une autre tuile
   * (recollé à la fusion) ; 0 pour un nœud propre à la tuile.
   */
  ids: number[];
  nodes: number[];
  nodeEle: number[];
  edges: ZoneDoc['edges'];
  geom: number[][];
}

/** Nom de la tuile qui contient le point. */
export function tuileDe(m: Manifest, lat: number, lon: number): string {
  return `${Math.floor(lat / m.tileDeg[0])}_${Math.floor(lon / m.tileDeg[1])}`;
}

/** Le point est dans la zone couverte : sa tuile existe. */
export function couvert(m: Manifest, lat: number, lon: number): boolean {
  return tuileDe(m, lat, lon) in m.tuiles;
}

/** Emprise couverte [lonMin, latMin, lonMax, latMax], d'après les tuiles présentes. */
export function empriseCouverte(m: Manifest): [number, number, number, number] {
  const noms = Object.keys(m.tuiles);
  const ty = noms.map((t) => Number(t.split('_')[0]));
  const tx = noms.map((t) => Number(t.split('_')[1]));
  const [dLat, dLon] = m.tileDeg;
  return [Math.min(...tx) * dLon, Math.min(...ty) * dLat, (Math.max(...tx) + 1) * dLon, (Math.max(...ty) + 1) * dLat];
}

/**
 * Rayon de réseau à charger autour du départ. Les points intermédiaires
 * sont sur un cercle de rayon ≈ D / (2π × 1,3) passant par le départ, donc
 * à moins de D/4 de lui ; la marge couvre l'ajustement du rayon et les
 * points attirés vers un sommet voisin.
 */
export function rayonUtileM(distanceKm: number): number {
  return distanceKm * 1000 * 0.33 + 1500;
}

/** Tuiles présentes qui recoupent le carré de demi-côté `rayonM` autour du point. */
export function tilesAround(m: Manifest, lat: number, lon: number, rayonM: number): string[] {
  const [dLat, dLon] = m.tileDeg;
  const rLat = rayonM / 111200;
  const rLon = rayonM / (111320 * Math.cos((lat * Math.PI) / 180));
  const out: string[] = [];
  for (let ty = Math.floor((lat - rLat) / dLat); ty <= Math.floor((lat + rLat) / dLat); ty++) {
    for (let tx = Math.floor((lon - rLon) / dLon); tx <= Math.floor((lon + rLon) / dLon); tx++) {
      const nom = `${ty}_${tx}`;
      if (nom in m.tuiles) out.push(nom);
    }
  }
  return out;
}

/**
 * Centre et demi-diagonale (km) de l'emprise des tuiles. Le graphe est
 * projeté autour de ce centre : il ne dépend que des tuiles, pas du départ
 * qui les a demandées, et une même demande donne la même boucle quelle que
 * soit la recherche précédente.
 */
export function empriseTuiles(m: Manifest, tiles: string[]): { center: [number, number]; radiusKm: number } {
  const [dLat, dLon] = m.tileDeg;
  const ty = tiles.map((t) => Number(t.split('_')[0]));
  const tx = tiles.map((t) => Number(t.split('_')[1]));
  const [la0, la1] = [Math.min(...ty) * dLat, (Math.max(...ty) + 1) * dLat];
  const [lo0, lo1] = [Math.min(...tx) * dLon, (Math.max(...tx) + 1) * dLon];
  const center: [number, number] = [(la0 + la1) / 2, (lo0 + lo1) / 2];
  const kx = 111.32 * Math.cos((center[0] * Math.PI) / 180);
  return { center, radiusKm: Math.hypot((lo1 - lo0) * kx, (la1 - la0) * 111.2) / 2 };
}

/** Fusionne des tuiles en un graphe : les nœuds partagés sont recollés par identifiant, les autres gardés tels quels. */
export function mergeTiles(tiles: TileDoc[], meta: ZoneDoc['meta']): Graph {
  const index = new Map<number, number>();
  const nodes: number[] = [];
  const nodeEle: number[] = [];
  const edges: Required<ZoneDoc['edges']> = { a: [], b: [], len: [], upAB: [], upBA: [], type: [], cls: [], parc: [], eau: [], rapide: [], itin: [] };
  const geom: number[][] = [];
  let prevLa = 0;
  let prevLo = 0;
  for (const t of tiles) {
    // Coordonnées absolues (1e-5 °) des nœuds de la tuile.
    const loc: number[] = new Array(t.ids.length);
    let la = 0;
    let lo = 0;
    for (let i = 0; i < t.ids.length; i++) {
      la += t.nodes[2 * i];
      lo += t.nodes[2 * i + 1];
      const id = t.ids[i];
      let g = id ? index.get(id) : undefined;
      if (g === undefined) {
        g = nodeEle.length;
        if (id) index.set(id, g);
        nodes.push(la - prevLa, lo - prevLo);
        prevLa = la;
        prevLo = lo;
        nodeEle.push(t.nodeEle[i]);
      }
      loc[i] = g;
    }
    const E = t.edges;
    for (let e = 0; e < E.a.length; e++) {
      edges.a.push(loc[E.a[e]]);
      edges.b.push(loc[E.b[e]]);
      edges.len.push(E.len[e]);
      edges.upAB.push(E.upAB[e]);
      edges.upBA.push(E.upBA[e]);
      edges.type.push(E.type[e]);
      edges.cls.push(E.cls?.[e] ?? CLS_INCONNUE);
      edges.parc.push(E.parc?.[e] ?? 0);
      edges.eau.push(E.eau?.[e] ?? 0);
      edges.rapide.push(E.rapide?.[e] ?? 0);
      edges.itin.push(E.itin?.[e] ?? 0);
      geom.push(t.geom[e]);
    }
  }
  return decodeGraph({ v: 1, meta: { ...meta, noeuds: nodeEle.length, aretes: edges.a.length }, nodes, nodeEle, edges, geom });
}

/**
 * Cache de tuiles et du dernier graphe construit. `charger` lit une tuile
 * (fetch dans le navigateur, fichier dans Node).
 */
export class TileStore {
  private cache = new Map<string, Promise<TileDoc>>();
  private dernier: { cle: string; graph: Graph } | null = null;

  constructor(
    readonly manifest: Manifest,
    private charger: (tile: string) => Promise<TileDoc>,
  ) {}

  private tuile(tile: string) {
    let p = this.cache.get(tile);
    if (!p) {
      p = this.charger(tile);
      this.cache.set(tile, p);
      p.catch(() => this.cache.delete(tile));
    }
    return p;
  }

  /**
   * Graphe couvrant le départ pour une boucle de `distanceKm` (ou le rayon
   * `rayonM` donné, pour une zone), ou null si le point est hors de la zone
   * couverte. Réutilise le graphe précédent s'il couvre déjà les mêmes tuiles.
   */
  async graphFor(lat: number, lon: number, distanceKm: number, rayonM = rayonUtileM(distanceKm)): Promise<{ graph: Graph; tiles: string[]; neuf: boolean } | null> {
    if (!couvert(this.manifest, lat, lon)) return null;
    const tiles = tilesAround(this.manifest, lat, lon, rayonM);
    const cle = tiles.join(',');
    if (this.dernier?.cle === cle) return { graph: this.dernier.graph, tiles, neuf: false };
    const docs = await Promise.all(tiles.map((t) => this.tuile(t)));
    const graph = mergeTiles(docs, {
      zone: 'France', ...empriseTuiles(this.manifest, tiles),
      reseau: this.manifest.reseau, mnt: this.manifest.mnt, noeuds: 0, aretes: 0,
    });
    this.dernier = { cle, graph };
    return { graph, tiles, neuf: true };
  }
}
