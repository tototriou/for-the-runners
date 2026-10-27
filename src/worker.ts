// Web Worker : charge le manifeste, puis à chaque demande les tuiles
// autour du départ, et génère les boucles sans figer la page.

import { Generateur } from './core/generateur';
import type { LoopRequest } from './core/loops';
import { TileStore, type Manifest, type TileDoc } from './core/tiles';
import { voiesBoucle } from './core/voies';

let base = '';
let gen: Generateur | null = null;

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

async function generer(req: LoopRequest) {
  if (!gen) throw new Error('Données pas encore chargées');
  // Le graphe reste dans le Worker : seuls les tracés partent vers la page.
  const { graph, ...res } = await gen.generate(req);
  if (graph) for (const l of res.loops) Object.assign(l, { voies: voiesBoucle(graph, l.edges) });
  return res;
}

self.onmessage = async (ev: MessageEvent) => {
  const msg = ev.data as
    | { type: 'load'; base: string }
    | { type: 'generate'; id: number; req: LoopRequest };
  try {
    if (msg.type === 'load') {
      base = msg.base;
      const manifest = await lireJson<Manifest>(`${base}manifest.json`);
      gen = new Generateur(new TileStore(manifest, (tile) => lireJson<TileDoc>(`${base}tuiles/${tile}.json.gz`)));
      self.postMessage({ type: 'loaded', manifest });
    } else if (msg.type === 'generate') {
      const res = await generer(msg.req);
      self.postMessage({ type: 'result', id: msg.id, res });
    }
  } catch (e) {
    self.postMessage({ type: 'error', id: 'id' in msg ? msg.id : -1, message: e instanceof Error ? e.message : String(e) });
  }
};
