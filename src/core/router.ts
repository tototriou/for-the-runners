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

  /** Arêtes orientées du chemin s → t, ou null si t est inatteignable. */
  route(
    s: number,
    t: number,
    edgeCost: Float64Array,
    minFactor: number,
    used: Uint16Array,
    reusePenalty: number,
  ): { edges: number[]; nodes: number[] } | null {
    const g = this.g;
    const gen = ++this.gen;
    const heap = this.heap;
    heap.clear();
    const tx = g.x[t];
    const ty = g.y[t];
    this.dist[s] = 0;
    this.stamp[s] = gen;
    this.prevEdge[s] = -1;
    heap.push(s, Math.hypot(g.x[s] - tx, g.y[s] - ty) * minFactor);
    this.settled = 0;
    while (heap.size > 0) {
      const u = heap.pop();
      if (this.done[u] === gen) continue;
      this.done[u] = gen;
      this.settled++;
      if (u === t) break;
      const du = this.dist[u];
      for (let k = g.adjStart[u], end = g.adjStart[u + 1]; k < end; k++) {
        const v = g.adjTo[k];
        if (this.done[v] === gen) continue;
        const e = g.adjEdge[k];
        let c = edgeCost[e];
        if (used[e] > 0) c *= 1 + reusePenalty * used[e];
        const nd = du + c;
        if (this.stamp[v] !== gen || nd < this.dist[v]) {
          this.stamp[v] = gen;
          this.dist[v] = nd;
          this.prevEdge[v] = e;
          this.prevNode[v] = u;
          heap.push(v, nd + Math.hypot(g.x[v] - tx, g.y[v] - ty) * minFactor);
        }
      }
    }
    if (this.done[t] !== gen) return null;
    const edges: number[] = [];
    const nodes: number[] = [t];
    for (let v = t; v !== s; v = this.prevNode[v]) {
      edges.push(this.prevEdge[v]);
      nodes.push(this.prevNode[v]);
    }
    edges.reverse();
    nodes.reverse();
    return { edges, nodes };
  }
}
