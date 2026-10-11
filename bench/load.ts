import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import type { Graph } from '../src/core/graph';
import { LoopGenerator, type LoopRequest, type LoopResponse } from '../src/core/loops';
import { TileStore, type Manifest, type TileDoc } from '../src/core/tiles';

export const DATA = fileURLToPath(new URL('../public/data/', import.meta.url));

/** Magasin de tuiles lu sur disque, comme le Worker le lit par HTTP. */
export function chargerStore(dossier = DATA): TileStore {
  const manifest = JSON.parse(readFileSync(`${dossier}manifest.json`, 'utf8')) as Manifest;
  return new TileStore(manifest, async (region, tile) =>
    JSON.parse(gunzipSync(readFileSync(`${dossier}${region}/${tile}.json.gz`)).toString('utf8')) as TileDoc,
  );
}

/** Même chemin que le Worker : tuiles autour du départ, puis générateur. */
export class Generateur {
  private courant: { graph: Graph; gen: LoopGenerator } | null = null;
  /** Durée du dernier chargement + fusion de tuiles (0 si graphe réutilisé). */
  msChargement = 0;
  nbTuiles = 0;
  constructor(readonly store: TileStore) {}

  async generate(req: LoopRequest): Promise<LoopResponse & { graph: Graph | null }> {
    const t0 = performance.now();
    const r = await this.store.graphFor(req.lat, req.lon, req.distanceKm);
    if (!r) {
      return {
        ok: false, loops: [], startNode: -1, graph: null, stats: { candidates: 0, routes: 0, ms: 0 },
        message: 'Ce départ est hors des régions couvertes.',
      };
    }
    if (this.courant?.graph !== r.graph) this.courant = { graph: r.graph, gen: new LoopGenerator(r.graph) };
    this.msChargement = r.neuf ? performance.now() - t0 : 0;
    this.nbTuiles = r.tiles.length;
    return { ...this.courant.gen.generate(req), graph: r.graph };
  }
}
