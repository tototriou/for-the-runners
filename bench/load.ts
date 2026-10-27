import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { decoderTuile, TileStore, type Manifest } from '../src/core/tiles';

export const DATA = fileURLToPath(new URL('../public/data/', import.meta.url));

/** Magasin de tuiles lu sur disque, comme le Worker le lit par HTTP. */
export function chargerStore(dossier = DATA): TileStore {
  const manifest = JSON.parse(readFileSync(`${dossier}manifest.json`, 'utf8')) as Manifest;
  return new TileStore(manifest, async (tile) =>
    decoderTuile(tile, gunzipSync(readFileSync(`${dossier}tuiles/${tile}.bin.gz`))),
  );
}
