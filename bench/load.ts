import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { decodeGraph, type Graph, type ZoneDoc } from '../src/core/graph';

export const DATA = fileURLToPath(new URL('../public/data/zone.json.gz', import.meta.url));

export function loadGraph(path = DATA): Graph {
  const doc = JSON.parse(gunzipSync(readFileSync(path)).toString('utf8')) as ZoneDoc;
  return decodeGraph(doc);
}
