// Graphe piéton de la zone, décodé depuis public/data/zone.json.gz
// (format écrit par scripts/prepare_data.py).

export type Terrain = 'mixte' | 'sentiers' | 'route';

/**
 * Classes Overture des tronçons, dans l'ordre du code « cls » des tuiles.
 * Partagée avec scripts/prepare_data.py (CLASSES) : à changer des deux côtés.
 */
export const CLASSES = [
  'primary', 'secondary', 'tertiary', 'residential', 'living_street', 'unclassified',
  'service', 'pedestrian', 'cycleway', 'unknown', 'path', 'track', 'footway', 'steps', 'bridleway',
] as const;
/** Code de classe absent (données antérieures au champ « cls »). */
export const CLS_INCONNUE = 255;

export const TYPE_ROUTE = 0;
export const TYPE_SENTIER = 1;

export interface ZoneDoc {
  v: number;
  meta: {
    zone: string;
    center: [number, number];
    radiusKm: number;
    reseau: string;
    mnt: string;
    noeuds: number;
    aretes: number;
  };
  nodes: number[];
  nodeEle: number[];
  edges: { a: number[]; b: number[]; len: number[]; upAB: number[]; upBA: number[]; type: number[]; cls?: number[]; parc?: number[]; eau?: number[] };
  geom: number[][];
}

export interface Graph {
  meta: ZoneDoc['meta'];
  n: number;
  m: number;
  lat: Float64Array;
  lon: Float64Array;
  ele: Float32Array;
  /** Projection locale en mètres (équirectangulaire autour du centre). */
  x: Float64Array;
  y: Float64Array;
  a: Int32Array;
  b: Int32Array;
  len: Float64Array;
  /** D+ (m) en parcourant l'arête de a vers b, et de b vers a. */
  upAB: Float64Array;
  upBA: Float64Array;
  type: Uint8Array;
  /** Classe Overture (indice dans CLASSES, CLS_INCONNUE si absente). */
  cls: Uint8Array;
  /** Part de la longueur dans un parc ou jardin public (0 à 1). */
  parc: Float32Array;
  /** Part de la longueur au bord de l'eau, à moins de 30 m (0 à 1). */
  eau: Float32Array;
  /** Points intérieurs de l'arête e (sens a → b) : geomOff[e]..geomOff[e+1]. */
  geomOff: Int32Array;
  geomLat: Float64Array;
  geomLon: Float64Array;
  geomEle: Float32Array;
  /** Adjacence CSR : pour le nœud u, adjEdge[adjStart[u]..adjStart[u+1]]. */
  adjStart: Int32Array;
  adjEdge: Int32Array;
  adjTo: Int32Array;
  /** 1 si l'arête est parcourue de a vers b depuis ce côté. */
  adjFwd: Uint8Array;
  grid: SpatialGrid;
}

export const R_TERRE = 6371008.8;

export function decodeGraph(doc: ZoneDoc): Graph {
  const n = doc.nodes.length / 2;
  const lat = new Float64Array(n);
  const lon = new Float64Array(n);
  let la = 0;
  let lo = 0;
  for (let i = 0; i < n; i++) {
    la += doc.nodes[2 * i];
    lo += doc.nodes[2 * i + 1];
    lat[i] = la / 1e5;
    lon[i] = lo / 1e5;
  }
  const ele = Float32Array.from(doc.nodeEle);
  const [clat, clon] = doc.meta.center;
  const kx = (Math.cos((clat * Math.PI) / 180) * Math.PI * R_TERRE) / 180;
  const ky = (Math.PI * R_TERRE) / 180;
  const x = new Float64Array(n);
  const y = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    x[i] = (lon[i] - clon) * kx;
    y[i] = (lat[i] - clat) * ky;
  }

  const E = doc.edges;
  const m = E.a.length;
  const a = Int32Array.from(E.a);
  const b = Int32Array.from(E.b);
  const len = Float64Array.from(E.len, (v) => v / 10);
  const upAB = Float64Array.from(E.upAB, (v) => v / 10);
  const upBA = Float64Array.from(E.upBA, (v) => v / 10);
  const type = Uint8Array.from(E.type);
  const cls = E.cls ? Uint8Array.from(E.cls) : new Uint8Array(m).fill(CLS_INCONNUE);
  const parc = E.parc ? Float32Array.from(E.parc, (v) => v / 100) : new Float32Array(m);
  const eau = E.eau ? Float32Array.from(E.eau, (v) => v / 100) : new Float32Array(m);

  const geomOff = new Int32Array(m + 1);
  for (let e = 0; e < m; e++) geomOff[e + 1] = geomOff[e] + doc.geom[e].length / 3;
  const total = geomOff[m];
  const geomLat = new Float64Array(total);
  const geomLon = new Float64Array(total);
  const geomEle = new Float32Array(total);
  for (let e = 0; e < m; e++) {
    const g = doc.geom[e];
    let pla = Math.round(lat[a[e]] * 1e5);
    let plo = Math.round(lon[a[e]] * 1e5);
    for (let k = 0, o = geomOff[e]; k < g.length; k += 3, o++) {
      pla += g[k];
      plo += g[k + 1];
      geomLat[o] = pla / 1e5;
      geomLon[o] = plo / 1e5;
      geomEle[o] = g[k + 2];
    }
  }

  const deg = new Int32Array(n + 1);
  for (let e = 0; e < m; e++) {
    deg[a[e]]++;
    deg[b[e]]++;
  }
  const adjStart = new Int32Array(n + 1);
  for (let i = 0; i < n; i++) adjStart[i + 1] = adjStart[i] + deg[i];
  const fill = adjStart.slice(0, n);
  const adjEdge = new Int32Array(2 * m);
  const adjTo = new Int32Array(2 * m);
  const adjFwd = new Uint8Array(2 * m);
  for (let e = 0; e < m; e++) {
    let k = fill[a[e]]++;
    adjEdge[k] = e;
    adjTo[k] = b[e];
    adjFwd[k] = 1;
    k = fill[b[e]]++;
    adjEdge[k] = e;
    adjTo[k] = a[e];
    adjFwd[k] = 0;
  }

  const g: Graph = {
    meta: doc.meta, n, m, lat, lon, ele, x, y, a, b, len, upAB, upBA, type, cls, parc, eau,
    geomOff, geomLat, geomLon, geomEle, adjStart, adjEdge, adjTo, adjFwd,
    grid: undefined as unknown as SpatialGrid,
  };
  g.grid = new SpatialGrid(x, y, 250);
  return g;
}

/** Grille régulière pour trouver le nœud le plus proche d'un point. */
export class SpatialGrid {
  private cells = new Map<number, number[]>();
  constructor(
    private x: Float64Array,
    private y: Float64Array,
    private size: number,
  ) {
    for (let i = 0; i < x.length; i++) {
      const k = this.key(Math.floor(x[i] / size), Math.floor(y[i] / size));
      let c = this.cells.get(k);
      if (!c) this.cells.set(k, (c = []));
      c.push(i);
    }
  }
  private key(cx: number, cy: number) {
    return (cx + 50000) * 100000 + (cy + 50000);
  }
  /**
   * Nœud le plus haut (signe = 1) ou le plus bas (signe = -1) à moins de
   * `rayon` mètres de (px, py) ; -1 si aucun.
   */
  extreme(px: number, py: number, rayon: number, ele: Float32Array, signe: 1 | -1): number {
    const r = Math.ceil(rayon / this.size);
    const cx = Math.floor(px / this.size);
    const cy = Math.floor(py / this.size);
    const r2 = rayon * rayon;
    let best = -1;
    let bestV = -Infinity;
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        const c = this.cells.get(this.key(cx + dx, cy + dy));
        if (!c) continue;
        for (const i of c) {
          if ((this.x[i] - px) ** 2 + (this.y[i] - py) ** 2 > r2) continue;
          const v = signe * ele[i];
          if (v > bestV) {
            bestV = v;
            best = i;
          }
        }
      }
    }
    return best;
  }

  /** Nœud le plus proche de (px, py), recherche en anneaux croissants. */
  nearest(px: number, py: number, maxRings = 80): number {
    const cx = Math.floor(px / this.size);
    const cy = Math.floor(py / this.size);
    let best = -1;
    let bestD = Infinity;
    for (let r = 0; r <= maxRings; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const c = this.cells.get(this.key(cx + dx, cy + dy));
          if (!c) continue;
          for (const i of c) {
            const d = (this.x[i] - px) ** 2 + (this.y[i] - py) ** 2;
            if (d < bestD) {
              bestD = d;
              best = i;
            }
          }
        }
      }
      // Un nœud trouvé à l'anneau r peut être battu par l'anneau r+1 au plus.
      if (best >= 0 && Math.sqrt(bestD) <= r * this.size) break;
    }
    return best;
  }
}

export function toXY(g: Graph, lat: number, lon: number): [number, number] {
  const [clat, clon] = g.meta.center;
  const kx = (Math.cos((clat * Math.PI) / 180) * Math.PI * R_TERRE) / 180;
  const ky = (Math.PI * R_TERRE) / 180;
  return [(lon - clon) * kx, (lat - clat) * ky];
}

export function nearestNode(g: Graph, lat: number, lon: number): number {
  const [px, py] = toXY(g, lat, lon);
  return g.grid.nearest(px, py);
}

export function distanceToNode(g: Graph, lat: number, lon: number, node: number): number {
  const [px, py] = toXY(g, lat, lon);
  return Math.hypot(g.x[node] - px, g.y[node] - py);
}
