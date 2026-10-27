// Affiche une tuile binaire en JSON lisible, avec le décodeur de l'app.
// Usage : npx tsx scripts/lire-tuile.ts public/data/tuiles/459_40.bin.gz [--resume]

import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { decoderTuile } from '../src/core/tiles';

const [chemin, option] = process.argv.slice(2);
if (!chemin) {
  console.error('Usage : npx tsx scripts/lire-tuile.ts <tuile.bin.gz> [--resume]');
  process.exit(2);
}
const t = decoderTuile(basename(chemin).split('.')[0], gunzipSync(readFileSync(chemin)));
if (option === '--resume') {
  const partages = t.ids.filter((id) => id !== 0).length;
  const points = t.geom.reduce((s, g) => s + g.length / 3, 0);
  console.log(`${t.tile} : ${t.ids.length} nœuds (${partages} partagés), ${t.edges.a.length} arêtes, ${points} points de géométrie`);
} else {
  console.log(JSON.stringify(t));
}
