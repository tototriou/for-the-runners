// Web Worker : charge le graphe une fois, puis génère les boucles à la
// demande sans figer la page.

import { decodeGraph, type ZoneDoc } from './core/graph';
import { LoopGenerator, type LoopRequest } from './core/loops';

let gen: LoopGenerator | null = null;

async function charger(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Chargement des données impossible (${res.status})`);
  // GitHub Pages sert le .gz tel quel ; un autre serveur peut l'avoir déjà
  // décompressé (Content-Encoding). Les octets magiques 1f 8b tranchent.
  const brut = await res.arrayBuffer();
  const octets = new Uint8Array(brut, 0, 2);
  const flux = octets[0] === 0x1f && octets[1] === 0x8b
    ? new Blob([brut]).stream().pipeThrough(new DecompressionStream('gzip'))
    : new Blob([brut]).stream();
  const doc = (await new Response(flux).json()) as ZoneDoc;
  const g = decodeGraph(doc);
  gen = new LoopGenerator(g);
  return { meta: g.meta, n: g.n, m: g.m };
}

self.onmessage = async (ev: MessageEvent) => {
  const msg = ev.data as { type: 'load'; url: string } | { type: 'generate'; id: number; req: LoopRequest };
  try {
    if (msg.type === 'load') {
      const info = await charger(msg.url);
      self.postMessage({ type: 'loaded', info });
    } else if (msg.type === 'generate') {
      if (!gen) throw new Error('Données pas encore chargées');
      const res = gen.generate(msg.req);
      self.postMessage({ type: 'result', id: msg.id, res });
    }
  } catch (e) {
    self.postMessage({ type: 'error', id: 'id' in msg ? msg.id : -1, message: e instanceof Error ? e.message : String(e) });
  }
};
