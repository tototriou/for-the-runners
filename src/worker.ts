// Web Worker : charge le manifeste, puis à chaque demande les tuiles
// autour du départ, et génère les boucles sans figer la page.

import type { Graph } from './core/graph';
import { DplusMaxGenerator, rayonZoneM, type DplusMaxRequest } from './core/dplusmax';
import { LoopGenerator, type LoopRequest, type LoopResponse } from './core/loops';
import { TileStore, type Manifest, type TileDoc } from './core/tiles';

let base = '';
let store: TileStore | null = null;
let gen: { graph: Graph; g: LoopGenerator } | null = null;
let genMax: { graph: Graph; g: DplusMaxGenerator } | null = null;

async function lireJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Chargement impossible : ${url} (${res.status})`);
  // GitHub Pages sert les .gz tels quels ; un autre serveur peut les avoir
  // déjà décompressés (Content-Encoding). Les octets magiques 1f 8b tranchent.
  const brut = await res.arrayBuffer();
  const o = new Uint8Array(brut, 0, Math.min(2, brut.byteLength));
  const flux = o[0] === 0x1f && o[1] === 0x8b
    ? new Blob([brut]).stream().pipeThrough(new DecompressionStream('gzip'))
    : new Blob([brut]).stream();
  return (await new Response(flux).json()) as T;
}

async function generer(req: LoopRequest): Promise<LoopResponse & { chargement?: { region: string; tuiles: number; ms: number } }> {
  if (!store) throw new Error('Données pas encore chargées');
  const t0 = performance.now();
  const r = await store.graphFor(req.lat, req.lon, req.distanceKm);
  if (!r) {
    const noms = store.manifest.regions.map((x) => x.name).join(', ');
    return {
      ok: false, loops: [], startNode: -1, stats: { candidates: 0, routes: 0, ms: 0 },
      message: `Ce départ est hors des régions couvertes (${noms}).`,
    };
  }
  if (!gen || gen.graph !== r.graph) gen = { graph: r.graph, g: new LoopGenerator(r.graph) };
  const ms = performance.now() - t0;
  const res = gen.g.generate(req);
  return { ...res, chargement: { region: r.region.name, tuiles: r.tiles.length, ms } };
}

async function genererMax(req: DplusMaxRequest) {
  if (!store) throw new Error('Données pas encore chargées');
  const t0 = performance.now();
  const r = await store.graphFor(req.lat, req.lon, req.distanceKm, rayonZoneM(req.lat, req.lon, req.distanceKm, req.zone));
  if (!r) {
    const noms = store.manifest.regions.map((x) => x.name).join(', ');
    return { ok: false, loops: [], startNode: -1, stats: { candidates: 0, routes: 0, ms: 0 }, message: `Ce départ est hors des régions couvertes (${noms}).` };
  }
  if (!genMax || genMax.graph !== r.graph) genMax = { graph: r.graph, g: new DplusMaxGenerator(r.graph) };
  const ms = performance.now() - t0;
  return { ...genMax.g.generate(req), chargement: { region: r.region.name, tuiles: r.tiles.length, ms } };
}

self.onmessage = async (ev: MessageEvent) => {
  const msg = ev.data as
    | { type: 'load'; base: string }
    | { type: 'generate'; id: number; req: LoopRequest }
    | { type: 'generateMax'; id: number; req: DplusMaxRequest };
  try {
    if (msg.type === 'load') {
      base = msg.base;
      const manifest = await lireJson<Manifest>(`${base}manifest.json`);
      store = new TileStore(manifest, (region, tile) => lireJson<TileDoc>(`${base}${region}/${tile}.json.gz`));
      self.postMessage({ type: 'loaded', manifest });
    } else if (msg.type === 'generate') {
      const res = await generer(msg.req);
      self.postMessage({ type: 'result', id: msg.id, res });
    } else if (msg.type === 'generateMax') {
      const res = await genererMax(msg.req);
      self.postMessage({ type: 'result', id: msg.id, res, max: true });
    }
  } catch (e) {
    self.postMessage({ type: 'error', id: 'id' in msg ? msg.id : -1, message: e instanceof Error ? e.message : String(e) });
  }
};
