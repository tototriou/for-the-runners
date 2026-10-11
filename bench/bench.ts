// Banc de tests de Boucle D+ : jeu du cadrage (50 demandes autour d'Annecy),
// jeux régionaux (Alsace, Île-de-France) et cibles impossibles.
// Écrit RESULTATS.md et examples/*.gpx ; code de sortie 1 si un critère
// échoue sur un jeu. Les seuils sont ceux du cadrage : ne pas les modifier.
//
// Usage : npm run bench [-- --no-write] [-- --jeu annecy|alsace|idf]

import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SEUIL_ALLER_RETOUR, type LoopResponse } from '../src/core/loops';
import { toGpx } from '../src/core/gpx';
import { CAS_IMPOSSIBLES, casDeTest, casRegionaux, type Cas } from './cases';
import { chargerStore, Generateur } from './load';

const SEUIL_REUSSITE = 0.8;
const SEUIL_TEMPS_MS = 10_000;
const CIBLE_TEMPS_MS = 3_000;

const racine = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const ecrire = !process.argv.includes('--no-write');
const jeuDemande = process.argv.includes('--jeu') ? process.argv[process.argv.indexOf('--jeu') + 1] : null;
// Graine du générateur : la même que l'app par défaut ; SEED=… pour vérifier
// que le taux de réussite ne tient pas à un tirage chanceux.
const SEED = Number(process.env.SEED ?? 12345);

const gen = new Generateur(chargerStore());

interface Critere { nom: string; seuil: string; valeur: string; ok: boolean }
interface ResultatJeu {
  id: string; titre: string; description: string; criteres: Critere[]; echecs: string[];
  lignes: string[]; reponses: { c: Cas; r: LoopResponse }[]; msChargementMax: number;
}

function pct(x: number) {
  return `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)} %`;
}

/**
 * `bloquantExact` : la réussite qui compte pour le seuil est celle obtenue
 * depuis le point exact (jeu du cadrage) ; sinon, celle de l'app telle
 * qu'un coureur l'utilise, départ décalé de 2 km au plus compris.
 */
async function jouer(id: string, titre: string, description: string, cas: Cas[], bloquantExact: boolean): Promise<ResultatJeu> {
  const lignes: string[] = [];
  const echecs: string[] = [];
  const temps: number[] = [];
  const allersRetours: number[] = [];
  const reponses: { c: Cas; r: LoopResponse }[] = [];
  let reussis = 0;
  let exacts = 0;
  let suggerees = 0;
  let suggereesOk = 0;
  let msChargementMax = 0;
  process.stdout.write(`${titre} : `);
  for (const c of cas) {
    const r = await gen.generate({ lat: c.lat, lon: c.lon, distanceKm: c.distanceKm, dplusM: c.dplusM, terrain: c.terrain, seed: SEED });
    msChargementMax = Math.max(msChargementMax, gen.msChargement);
    reponses.push({ c, r });
    temps.push(r.stats.ms);
    const ok = r.loops.some((l) => l.dansTolerance);
    if (ok) reussis++;
    if (ok && !r.depart) exacts++;
    for (const l of r.loops) allersRetours.push(l.allerRetour);
    const b = r.loops[0];
    const cell = b
      ? `${(b.distanceM / 1000).toFixed(2)} km / ${Math.round(b.dplusM)} m | ${pct(b.ecartDistance)} | ${pct(b.ecartDplus)} | ${(b.allerRetour * 100).toFixed(0)} %`
      : '– | – | – | –';
    const nOk = r.loops.filter((l) => l.dansTolerance).length;
    const verdict = !ok ? '**non**' : r.depart ? `oui, départ décalé de ${Math.round(r.depart.decalageM)} m` : 'oui';
    lignes.push(
      `| ${c.id} | ${c.depart} | ${c.distanceKm} km / ${c.dplusM} m | ${c.terrain} | ${cell} | ${nOk}/${r.loops.length} | ${(r.stats.ms / 1000).toFixed(2)} s | ${verdict} |`,
    );
    if (!ok) {
      // La demande impossible propose un D+ : vérifier qu'il aboutit vraiment.
      let suivi = '';
      if (r.suggestion) {
        suggerees++;
        const r2 = await gen.generate({ lat: c.lat, lon: c.lon, distanceKm: c.distanceKm, dplusM: r.suggestion.dplusM, terrain: c.terrain, seed: SEED });
        const ok2 = r2.loops.some((l) => l.dansTolerance);
        if (ok2) suggereesOk++;
        suivi = ` → suggestion ${r.suggestion.dplusM} m suivie : ${ok2 ? 'aboutit' : '**n\u2019aboutit pas**'}`;
      }
      echecs.push(`- #${c.id} ${c.depart}, ${c.distanceKm} km / ${c.dplusM} m (${c.terrain}) : ${r.message}${suivi}`);
    }
    process.stdout.write(!ok ? 'x' : r.depart ? 'd' : '.');
  }
  process.stdout.write('\n');
  const taux = reussis / cas.length;
  const tauxExact = exacts / cas.length;
  const tauxBloquant = bloquantExact ? tauxExact : taux;
  const tMoy = temps.reduce((a, b) => a + b, 0) / temps.length;
  const tMax = Math.max(...temps);
  const tP90 = [...temps].sort((a, b) => a - b)[Math.floor(temps.length * 0.9)];
  const arMoy = allersRetours.reduce((a, b) => a + b, 0) / Math.max(1, allersRetours.length);
  const arAuDela = allersRetours.filter((x) => x >= SEUIL_ALLER_RETOUR).length;
  const criteres: Critere[] = [
    {
      nom: bloquantExact ? 'Demandes avec une boucle dans la tolérance, depuis le point exact' : 'Demandes avec une boucle dans la tolérance, départ décalé de 2 km au plus compris',
      seuil: '≥ 80 %',
      valeur: `${(tauxBloquant * 100).toFixed(0)} % (${bloquantExact ? exacts : reussis}/${cas.length})`,
      ok: tauxBloquant >= SEUIL_REUSSITE,
    },
    {
      nom: bloquantExact ? 'Pour information : départ décalé de 2 km au plus compris' : 'Pour information : depuis le point exact',
      seuil: '–',
      valeur: `${((bloquantExact ? taux : tauxExact) * 100).toFixed(0)} % (${bloquantExact ? reussis : exacts}/${cas.length})`,
      ok: true,
    },
    {
      nom: 'Demandes impossibles : D+ suggéré qui aboutit quand on le suit',
      seuil: '–',
      valeur: `${suggereesOk}/${suggerees} (${cas.length - reussis - suggerees} sans suggestion)`,
      ok: true,
    },
    { nom: 'Temps de calcul (Node, max)', seuil: '< 10 s (viser < 3 s)', valeur: `max ${(tMax / 1000).toFixed(2)} s, moyenne ${(tMoy / 1000).toFixed(2)} s, p90 ${(tP90 / 1000).toFixed(2)} s`, ok: tMax < SEUIL_TEMPS_MS },
    { nom: 'Tronçons empruntés deux fois (moyenne des boucles proposées)', seuil: '< 15 %', valeur: `${(arMoy * 100).toFixed(1)} % (${arAuDela}/${allersRetours.length} boucles ≥ 15 %)`, ok: arMoy < SEUIL_ALLER_RETOUR },
  ];
  for (const k of criteres) console.log(`  ${k.ok ? 'OK ' : 'KO '} ${k.nom} : ${k.valeur} (seuil ${k.seuil})`);
  if (tMoy > CIBLE_TEMPS_MS) console.log(`  Note : temps moyen au-dessus de la cible de ${CIBLE_TEMPS_MS / 1000} s.`);
  return { id, titre, description, criteres, echecs, lignes, reponses, msChargementMax };
}

// ------------------------------------------------------------------- jeux
const jeux: ResultatJeu[] = [];
const regionaux = casRegionaux();
const definitions: [string, string, string, Cas[]][] = [
  ['annecy', 'Annecy (jeu du cadrage)', '50 demandes : 5 départs × 10 distances de 5 à 30 km, D+ de 50 à 1 500 m. Seuil jugé depuis le point exact, comme au cadrage.', casDeTest()],
  ['alsace', 'Alsace', '30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l\u2019app répond, départ décalé compris.', regionaux.filter((c) => c.region === 'Alsace')],
  ['idf', 'Île-de-France', '30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l\u2019app répond, départ décalé compris.', regionaux.filter((c) => c.region === 'Île-de-France')],
];
const presentes = new Set(gen.store.manifest.regions.map((r) => r.id));
for (const [id, titre, desc, cas] of definitions) {
  if (jeuDemande && jeuDemande !== id) continue;
  if (!presentes.has(id)) {
    console.log(`${titre} : région absente du manifeste, jeu ignoré`);
    continue;
  }
  jeux.push(await jouer(id, titre, desc, cas, id === 'annecy'));
}

// ------------------------------------------------------- cibles impossibles
const lignesImp: string[] = [];
let impOk = true;
if (!jeuDemande || jeuDemande === 'annecy') {
  for (const c of CAS_IMPOSSIBLES) {
    let verdict: string;
    let message = '';
    try {
      const r = await gen.generate({ lat: c.lat, lon: c.lon, distanceKm: c.distanceKm, dplusM: c.dplusM, terrain: c.terrain });
      message = r.message;
      // Une cible impossible depuis le point exact mais réalisable à moins
      // de 2 km n'est pas une cible impossible pour l'app.
      if (r.ok && r.depart) message = `(réalisable en décalant le départ) ${message}`;
      const attenduBoucle = c.attendu === 'boucle la plus proche';
      // Correct : un refus clair (avec la boucle la plus proche si attendue),
      // ou une solution trouvée en décalant le départ, annoncée comme telle.
      const bon = message.length > 0 && (r.ok ? !!r.depart : !attenduBoucle || r.loops.length > 0);
      verdict = bon ? 'oui' : '**non**';
      if (!bon) impOk = false;
    } catch (e) {
      verdict = '**non** (exception)';
      message = String(e);
      impOk = false;
    }
    lignesImp.push(`| ${c.depart}, ${c.distanceKm} km / ${c.dplusM} m (${c.terrain}) | ${c.attendu} | ${message} | ${verdict} |`);
  }
  console.log(`${impOk ? 'OK ' : 'KO '} Cibles impossibles : ${impOk ? 'toutes correctes' : 'échec'}`);
}
const toutOk = impOk && jeux.every((j) => j.criteres.every((c) => c.ok));

// ---------------------------------------------------------- GPX d'exemple
const gpxEcrits: string[] = [];
const annecy = jeux.find((j) => j.id === 'annecy');
if (ecrire && annecy) {
  mkdirSync(racine('examples'), { recursive: true });
  for (const ex of [{ id: 3, nom: 'annecy-10km' }, { id: 15, nom: 'sevrier-15km' }, { id: 27, nom: 'talloires-20km' }]) {
    const rep = annecy.reponses.find((x) => x.c.id === ex.id);
    const loop = rep?.r.loops.find((l) => l.dansTolerance) ?? rep?.r.loops[0];
    if (!rep || !loop) continue;
    const nom = `${rep.c.depart} ${(loop.distanceM / 1000).toFixed(1)} km ${Math.round(loop.dplusM)} m D+`;
    const fichier = `examples/${ex.nom}.gpx`;
    writeFileSync(racine(fichier), toGpx(loop, nom));
    gpxEcrits.push(`- [\`${fichier}\`](${fichier}) : ${nom} (demande #${ex.id} : ${rep.c.distanceKm} km / ${rep.c.dplusM} m, ${rep.c.terrain})`);
  }
}

// ----------------------------------------------------------------- rapport
const regions = gen.store.manifest.regions
  .map((r) => `| ${r.name} | ${Object.keys(r.tiles).length} | ${r.km.toLocaleString('fr-FR')} km | ${(r.octets / 1e6).toFixed(1)} Mo |`)
  .join('\n');
const sectionJeu = (j: ResultatJeu) => `## ${j.titre}

${j.description} Chargement et fusion des tuiles : ${(j.msChargementMax / 1000).toFixed(2)} s au plus, hors calcul.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
${j.criteres.map((c) => `| ${c.nom} | ${c.seuil} | ${c.valeur} | ${c.ok ? '✅' : '❌'} |`).join('\n')}

<details><summary>Cas en échec (${j.echecs.length}) et détail des demandes</summary>

${j.echecs.length ? j.echecs.join('\n') : 'Aucun cas en échec.'}

Colonne « Meilleure » : la première boucle proposée (meilleur score).

| # | Départ | Cible | Terrain | Meilleure | Écart dist. | Écart D+ | Aller-retour | Dans la tolérance | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${j.lignes.join('\n')}

</details>
`;

const rapport = `# Résultats du banc de tests

Généré par \`npm run bench\` (Node ${process.version}). Réseau : ${gen.store.manifest.regions[0]?.reseau}.
Altitude : ${gen.store.manifest.regions[0]?.mnt}.

## Verdict : ${toutOk ? '✅ tous les critères automatiques sont atteints' : '❌ au moins un critère échoue'}

${jeux.map((j) => `- ${j.titre} : ${j.criteres.every((c) => c.ok) ? '✅' : '❌'} ${j.criteres[0].valeur} dans la tolérance`).join('\n')}
- Cibles impossibles : ${impOk ? '✅' : '❌'} message clair, jamais d'erreur

Reste à vérifier hors banc : le D+ réel sur 3 sorties (montre) et le temps sur téléphone.

| Région | Tuiles | Réseau | Données |
| --- | --- | --- | --- |
${regions}

${jeux.map(sectionJeu).join('\n')}
## Cibles impossibles

| Demande | Attendu | Message renvoyé | Correct |
| --- | --- | --- | --- |
${lignesImp.join('\n')}

## GPX d'exemple

${gpxEcrits.join('\n')}
`;

if (ecrire && !jeuDemande) writeFileSync(racine('RESULTATS.md'), rapport);
process.exit(toutOk ? 0 : 1);
