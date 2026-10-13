import type { Graph } from './graph';

/** Tas binaire minimal sur clés flottantes (nœud, priorité). */
class Heap {
  private keys: Float64Array;
  private vals: Int32Array;
  size = 0;
  constructor(cap: number) {
    this.keys = new Float64Array(cap);
    this.vals = new Int32Array(cap);
  }
  clear() {
    this.size = 0;
  }
  push(v: number, k: number) {
    if (this.size === this.keys.length) {
      const nk = new Float64Array(this.size * 2);
      nk.set(this.keys);
      this.keys = nk;
      const nv = new Int32Array(this.size * 2);
      nv.set(this.vals);
      this.vals = nv;
    }
    let i = this.size++;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.keys[p] <= k) break;
      this.keys[i] = this.keys[p];
      this.vals[i] = this.vals[p];
      i = p;
    }
    this.keys[i] = k;
    this.vals[i] = v;
  }
  /** Retire le minimum ; renvoie le nœud, sa clé dans `lastKey`. */
  lastKey = 0;
  pop(): number {
    const top = this.vals[0];
    this.lastKey = this.keys[0];
    const k = this.keys[--this.size];
    const v = this.vals[this.size];
    let i = 0;
    for (;;) {
      let c = 2 * i + 1;
      if (c >= this.size) break;
      if (c + 1 < this.size && this.keys[c + 1] < this.keys[c]) c++;
      if (this.keys[c] >= k) break;
      this.keys[i] = this.keys[c];
      this.vals[i] = this.vals[c];
      i = c;
    }
    this.keys[i] = k;
    this.vals[i] = v;
    return top;
  }
}

/**
 * A* sur le graphe avec un coût par arête fourni par l'appelant.
 *
 * `edgeCost[e]` est le coût de base (≥ minFactor × longueur) ; `used[e]`
 * compte les passages déjà faits dans la boucle en cours, chacun multipliant
 * le coût par (1 + reusePenalty). L'heuristique (distance à vol d'oiseau ×
 * minFactor) reste admissible tant que minFactor minore coût/longueur.
 */
export class Router {
  private dist: Float64Array;
  private stamp: Uint32Array;
  private done: Uint32Array;
  private prevEdge: Int32Array;
  private prevNode: Int32Array;
  private gen = 0;
  private heap: Heap;
  /** Nœuds sortis du tas lors de la dernière recherche (mesure de charge). */
  settled = 0;

  constructor(private g: Graph) {
    this.dist = new Float64Array(g.n);
    this.stamp = new Uint32Array(g.n);
    this.done = new Uint32Array(g.n);
    this.prevEdge = new Int32Array(g.n);
    this.prevNode = new Int32Array(g.n);
    this.heap = new Heap(1024);
  }

  /**
   * Arêtes orientées du chemin s → t, ou null si t est inatteignable.
   *
   * Avec `arrivee`, le chemin peut s'arrêter sur tout nœud à moins de
   * `rayon` m de t (à vol d'oiseau), l'écart restant coûtant `prixM` par
   * mètre : on s'arrête avant t quand y aller coûte plus cher que l'écart.
   * L'heuristique (écart au disque × minFactor) reste admissible.
   */
  route(
    s: number,
    t: number,
    edgeCost: Float64Array,
    minFactor: number,
    used: Uint16Array,
    reusePenalty: number,
    arrivee?: { rayon: number; prixM: number },
  ): { edges: number[]; nodes: number[] } | null {
    const g = this.g;
    const gen = ++this.gen;
    const heap = this.heap;
    heap.clear();
    const tx = g.x[t];
    const ty = g.y[t];
    const rayon = arrivee?.rayon ?? 0;
    const h = (v: number) => Math.max(0, Math.hypot(g.x[v] - tx, g.y[v] - ty) - rayon) * minFactor;
    // Meilleure arrivée trouvée (nœud, coût chemin + écart).
    let fin = -1;
    let coutFin = Infinity;
    this.dist[s] = 0;
    this.stamp[s] = gen;
    this.prevEdge[s] = -1;
    heap.push(s, h(s));
    this.settled = 0;
    while (heap.size > 0) {
      const u = heap.pop();
      if (heap.lastKey >= coutFin) break;
      if (this.done[u] === gen) continue;
      this.done[u] = gen;
      this.settled++;
      if (u === t) {
        if (this.dist[u] < coutFin) fin = u;
        break;
      }
      if (arrivee) {
        const ecart = Math.hypot(g.x[u] - tx, g.y[u] - ty);
        if (ecart <= rayon && this.dist[u] + ecart * arrivee.prixM < coutFin) {
          coutFin = this.dist[u] + ecart * arrivee.prixM;
          fin = u;
        }
      }
      const du = this.dist[u];
      for (let k = g.adjStart[u], end = g.adjStart[u + 1]; k < end; k++) {
        const v = g.adjTo[k];
        if (this.done[v] === gen) continue;
        const e = g.adjEdge[k];
        let c = edgeCost[e];
        if (c === Infinity) continue; // arête interdite (hors zone)
        if (used[e] > 0) c *= 1 + reusePenalty * used[e];
        const nd = du + c;
        if (this.stamp[v] !== gen || nd < this.dist[v]) {
          this.stamp[v] = gen;
          this.dist[v] = nd;
          this.prevEdge[v] = e;
          this.prevNode[v] = u;
          heap.push(v, nd + h(v));
        }
      }
    }
    if (fin < 0) return null;
    const edges: number[] = [];
    const nodes: number[] = [fin];
    for (let v = fin; v !== s; v = this.prevNode[v]) {
      edges.push(this.prevEdge[v]);
      nodes.push(this.prevNode[v]);
    }
    edges.reverse();
    nodes.reverse();
    return { edges, nodes };
  }
}
