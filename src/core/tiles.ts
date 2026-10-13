// Données découpées en tuiles (écrites par scripts/prepare_data.py) :
// choix des tuiles utiles à une demande, chargement avec cache, fusion en
// un seul graphe.

import { CLS_INCONNUE, decodeGraph, type Graph, type ZoneDoc } from './graph';

export interface RegionMeta {
  id: string;
  name: string;
  /** [lonMin, latMin, lonMax, latMax] */
  bbox: [number, number, number, number];
  center: [number, number];
  reseau: string;
  mnt: string;
  aretes: number;
  noeuds: number;
  km: number;
  octets: number;
  /** Nom de tuile → taille en octets. */
  tiles: Record<string, number>;
}

export interface Manifest {
  v: number;
  /** Taille d'une tuile : [degrés de latitude, degrés de longitude]. */
  tileDeg: [number, number];
  regions: RegionMeta[];
}

export interface TileDoc {
  v: number;
  region: string;
  tile: string;
  /** Identifiant de chaque nœud, unique dans la région. */
  ids: number[];
  nodes: number[];
  nodeEle: number[];
  edges: ZoneDoc['edges'];
  geom: number[][];
}

export function regionAt(m: Manifest, lat: number, lon: number): RegionMeta | null {
  for (const r of m.regions) {
    const [x0, y0, x1, y1] = r.bbox;
    if (lon >= x0 && lon <= x1 && lat >= y0 && lat <= y1) return r;
  }
  return null;
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

/** Tuiles de la région qui recoupent le carré de demi-côté `rayonM` autour du point. */
export function tilesAround(m: Manifest, r: RegionMeta, lat: number, lon: number, rayonM: number): string[] {
  const [dLat, dLon] = m.tileDeg;
  const rLat = rayonM / 111200;
  const rLon = rayonM / (111320 * Math.cos((lat * Math.PI) / 180));
  const out: string[] = [];
  for (let ty = Math.floor((lat - rLat) / dLat); ty <= Math.floor((lat + rLat) / dLat); ty++) {
    for (let tx = Math.floor((lon - rLon) / dLon); tx <= Math.floor((lon + rLon) / dLon); tx++) {
      const nom = `${ty}_${tx}`;
      if (nom in r.tiles) out.push(nom);
    }
  }
  return out;
}

/** Fusionne des tuiles d'une même région en un graphe (nœuds recollés par identifiant). */
export function mergeTiles(tiles: TileDoc[], meta: ZoneDoc['meta']): Graph {
  const index = new Map<number, number>();
  const nodes: number[] = [];
  const nodeEle: number[] = [];
  const edges: Required<ZoneDoc['edges']> = { a: [], b: [], len: [], upAB: [], upBA: [], type: [], cls: [], parc: [] };
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
      let g = index.get(t.ids[i]);
      if (g === undefined) {
        g = nodeEle.length;
        index.set(t.ids[i], g);
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
    private charger: (regionId: string, tile: string) => Promise<TileDoc>,
  ) {}

  private tuile(regionId: string, tile: string) {
    const cle = `${regionId}/${tile}`;
    let p = this.cache.get(cle);
    if (!p) {
      p = this.charger(regionId, tile);
      this.cache.set(cle, p);
      p.catch(() => this.cache.delete(cle));
    }
    return p;
  }

  /**
   * Graphe couvrant le départ pour une boucle de `distanceKm` (ou le rayon
   * `rayonM` donné, pour une zone), ou null si
   * le point est hors des régions couvertes. Réutilise le graphe précédent
   * s'il couvre déjà les mêmes tuiles.
   */
  async graphFor(lat: number, lon: number, distanceKm: number, rayonM = rayonUtileM(distanceKm)): Promise<{ graph: Graph; region: RegionMeta; tiles: string[]; neuf: boolean } | null> {
    const region = regionAt(this.manifest, lat, lon);
    if (!region) return null;
    const tiles = tilesAround(this.manifest, region, lat, lon, rayonM);
    if (tiles.length === 0) return null;
    const cle = `${region.id}|${tiles.join(',')}`;
    if (this.dernier?.cle === cle) return { graph: this.dernier.graph, region, tiles, neuf: false };
    const docs = await Promise.all(tiles.map((t) => this.tuile(region.id, t)));
    const graph = mergeTiles(docs, {
      zone: region.name, center: [lat, lon], radiusKm: rayonM / 1000,
      reseau: region.reseau, mnt: region.mnt, noeuds: 0, aretes: 0,
    });
    this.dernier = { cle, graph };
    return { graph, region, tiles, neuf: true };
  }
}
