// Banc de tests de Boucle D+ : 50 demandes réelles + cibles impossibles.
// Écrit RESULTATS.md et examples/*.gpx ; code de sortie 1 si un critère
// de validation échoue. Les seuils sont ceux du cadrage : ne pas les modifier.

import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LoopGenerator, SEUIL_ALLER_RETOUR, type LoopResponse } from '../src/core/loops';
import { toGpx } from '../src/core/gpx';
import { CAS_IMPOSSIBLES, casDeTest } from './cases';
import { loadGraph } from './load';

const SEUIL_REUSSITE = 0.8;
const SEUIL_TEMPS_MS = 10_000;
const CIBLE_TEMPS_MS = 3_000;

const racine = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const ecrire = process.argv.includes('--no-write') ? false : true;
// Graine du générateur : la même que l'app par défaut ; SEED=… pour vérifier
// que le taux de réussite ne tient pas à un tirage chanceux.
const SEED = Number(process.env.SEED ?? 12345);

const t0 = performance.now();
const g = loadGraph();
const tChargement = performance.now() - t0;
const gen = new LoopGenerator(g);

// --------------------------------------------------------------- 50 demandes
const cas = casDeTest();
const lignes: string[] = [];
const echecs: string[] = [];
let reussis = 0;
const temps: number[] = [];
const allersRetours: number[] = [];
const reponses: { c: (typeof cas)[number]; r: LoopResponse }[] = [];

for (const c of cas) {
  const r = gen.generate({ lat: c.lat, lon: c.lon, distanceKm: c.distanceKm, dplusM: c.dplusM, terrain: c.terrain, seed: SEED });
  reponses.push({ c, r });
  temps.push(r.stats.ms);
  const ok = r.loops.some((l) => l.dansTolerance);
  if (ok) reussis++;
  for (const l of r.loops) allersRetours.push(l.allerRetour);
  const b = r.loops[0];
  const cell = b
    ? `${(b.distanceM / 1000).toFixed(2)} km / ${Math.round(b.dplusM)} m | ${pct(b.ecartDistance)} | ${pct(b.ecartDplus)} | ${(b.allerRetour * 100).toFixed(0)} %`
    : '– | – | – | –';
  const nOk = r.loops.filter((l) => l.dansTolerance).length;
  lignes.push(
    `| ${c.id} | ${c.depart} | ${c.distanceKm} km / ${c.dplusM} m | ${c.terrain} | ${cell} | ${nOk}/${r.loops.length} | ${(r.stats.ms / 1000).toFixed(2)} s | ${ok ? 'oui' : '**non**'} |`,
  );
  if (!ok) echecs.push(`- #${c.id} ${c.depart}, ${c.distanceKm} km / ${c.dplusM} m (${c.terrain}) : ${r.message}`);
  process.stdout.write(ok ? '.' : 'x');
}
process.stdout.write('\n');

// ------------------------------------------------------- cibles impossibles
const lignesImp: string[] = [];
let impOk = true;
for (const c of CAS_IMPOSSIBLES) {
  let verdict: string;
  let message = '';
  try {
    const r = gen.generate({ lat: c.lat, lon: c.lon, distanceKm: c.distanceKm, dplusM: c.dplusM, terrain: c.terrain });
    message = r.message;
    const attenduBoucle = c.attendu === 'boucle la plus proche';
    const bon = !r.ok && message.length > 0 && (!attenduBoucle || r.loops.length > 0);
    verdict = bon ? 'oui' : '**non**';
    if (!bon) impOk = false;
  } catch (e) {
    verdict = '**non** (exception)';
    message = String(e);
    impOk = false;
  }
  lignesImp.push(`| ${c.depart}, ${c.distanceKm} km / ${c.dplusM} m (${c.terrain}) | ${c.attendu} | ${message} | ${verdict} |`);
}

// ------------------------------------------------------------------ verdict
const taux = reussis / cas.length;
const tMoy = temps.reduce((a, b) => a + b, 0) / temps.length;
const tMax = Math.max(...temps);
const tP90 = [...temps].sort((a, b) => a - b)[Math.floor(temps.length * 0.9)];
const arMoy = allersRetours.reduce((a, b) => a + b, 0) / allersRetours.length;
const arAuDela = allersRetours.filter((x) => x >= SEUIL_ALLER_RETOUR).length;

const criteres = [
  { nom: 'Demandes avec au moins une boucle dans la tolérance', seuil: '≥ 80 %', valeur: `${(taux * 100).toFixed(0)} % (${reussis}/${cas.length})`, ok: taux >= SEUIL_REUSSITE },
  { nom: 'Temps de réponse (Node, max)', seuil: '< 10 s (viser < 3 s)', valeur: `max ${(tMax / 1000).toFixed(2)} s, moyenne ${(tMoy / 1000).toFixed(2)} s, p90 ${(tP90 / 1000).toFixed(2)} s`, ok: tMax < SEUIL_TEMPS_MS },
  { nom: 'Tronçons empruntés deux fois (moyenne des boucles proposées)', seuil: '< 15 %', valeur: `${(arMoy * 100).toFixed(1)} % (${arAuDela}/${allersRetours.length} boucles ≥ 15 %)`, ok: arMoy < SEUIL_ALLER_RETOUR },
  { nom: 'Cible impossible : message clair, jamais d’erreur', seuil: `${CAS_IMPOSSIBLES.length}/${CAS_IMPOSSIBLES.length}`, valeur: impOk ? 'tous corrects' : 'échec', ok: impOk },
];
const toutOk = criteres.every((c) => c.ok);

// ---------------------------------------------------------- GPX d'exemple
const exemples = [
  { id: 3, nom: 'annecy-10km' },
  { id: 15, nom: 'sevrier-15km' },
  { id: 27, nom: 'talloires-20km' },
];
const gpxEcrits: string[] = [];
if (ecrire) {
  mkdirSync(racine('examples'), { recursive: true });
  for (const ex of exemples) {
    const rep = reponses.find((x) => x.c.id === ex.id);
    const loop = rep?.r.loops.find((l) => l.dansTolerance) ?? rep?.r.loops[0];
    if (!rep || !loop) continue;
    const nom = `${rep.c.depart} ${(loop.distanceM / 1000).toFixed(1)} km ${Math.round(loop.dplusM)} m D+`;
    const fichier = `examples/${ex.nom}.gpx`;
    writeFileSync(racine(fichier), toGpx(loop, nom));
    gpxEcrits.push(`- [\`${fichier}\`](${fichier}) : ${nom} (demande #${ex.id} : ${rep.c.distanceKm} km / ${rep.c.dplusM} m, ${rep.c.terrain})`);
  }
}

const rapport = `# Résultats du banc de tests

Généré par \`npm run bench\` (Node ${process.version}). Graphe : ${g.meta.zone}, ${g.n} nœuds, ${g.m} arêtes,
chargé en ${tChargement.toFixed(0)} ms. Réseau : ${g.meta.reseau}. Altitude : ${g.meta.mnt}.

## Verdict : ${toutOk ? '✅ tous les critères automatiques sont atteints' : '❌ au moins un critère échoue'}

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
${criteres.map((c) => `| ${c.nom} | ${c.seuil} | ${c.valeur} | ${c.ok ? '✅' : '❌'} |`).join('\n')}

Reste à vérifier hors banc : le D+ réel sur 3 sorties (montre) et le temps sur téléphone.

## Cas en échec

${echecs.length ? echecs.join('\n') : 'Aucun.'}

## Cibles impossibles

| Demande | Attendu | Message renvoyé | Correct |
| --- | --- | --- | --- |
${lignesImp.join('\n')}

## Détail des 50 demandes

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${lignes.join('\n')}

## GPX d'exemple

${gpxEcrits.join('\n')}
`;

if (ecrire) writeFileSync(racine('RESULTATS.md'), rapport);
for (const c of criteres) console.log(`${c.ok ? 'OK ' : 'KO '} ${c.nom} : ${c.valeur} (seuil ${c.seuil})`);
if (tMoy > CIBLE_TEMPS_MS) console.log(`Note : temps moyen au-dessus de la cible de ${CIBLE_TEMPS_MS / 1000} s.`);
process.exit(toutOk ? 0 : 1);

function pct(x: number) {
  return `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)} %`;
}
