// Banc de tests de Boucle D+ : jeu du cadrage (50 demandes autour d'Annecy),
// jeux régionaux (Alsace, Île-de-France) et cibles impossibles.
// Écrit RESULTATS.md et examples/*.gpx ; code de sortie 1 si un critère
// échoue sur un jeu. Les seuils sont ceux du cadrage : ne pas les modifier.
//
// Usage : npm run bench [-- --no-write] [-- --jeu annecy|alsace|idf]

import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DEMI_TOUR_MIN_M, demiTours, SEUIL_ALLER_RETOUR, type LoopResponse } from '../src/core/loops';
import { CLASSES, CLS_INCONNUE, type Graph } from '../src/core/graph';

/** Familles de voies pour mesurer la composition des boucles. */
const FAMILLES: [string, readonly string[]][] = [
  ['Grandes routes (primary, secondary)', ['primary', 'secondary']],
  ['Routes tertiaires', ['tertiary']],
  ['Rues et dessertes', ['residential', 'living_street', 'unclassified', 'service', 'unknown']],
  ['Pistes cyclables', ['cycleway']],
  ['Voies piétonnes et sentiers', ['pedestrian', 'path', 'track', 'footway', 'steps', 'bridleway']],
];
function famille(cls: number): number {
  if (cls === CLS_INCONNUE) return -1;
  const nom = CLASSES[cls];
  return FAMILLES.findIndex(([, l]) => l.includes(nom));
}
import { toGpx } from '../src/core/gpx';
import { CAS_DPLUS_MAX, CAS_IMPOSSIBLES, casDeTest, casRegionaux, type Cas } from './cases';
import { DplusMaxGenerator, rayonZoneM } from '../src/core/dplusmax';
import { LoopGenerator } from '../src/core/loops';
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
  /** Part moyenne de distance par famille de voie, et boucles avec ≥ 1 km de grande route. */
  composition: number[]; grandesRoutes1km: number; nbBoucles: number;
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
  let nbBoucles = 0;
  let demiToursCourts = 0;
  let grandesRoutes1km = 0;
  const composition = new Array(FAMILLES.length).fill(0);
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
    const g = (r as { graph: Graph | null }).graph;
    if (g) {
      for (const l of r.loops) {
        nbBoucles++;
        demiToursCourts += demiTours(g.len, l.edges).filter(([, , aller]) => aller < DEMI_TOUR_MIN_M).length;
        const parFamille = new Array(FAMILLES.length).fill(0);
        for (const e of l.edges) {
          const f = famille(g.cls[e]);
          if (f >= 0) parFamille[f] += g.len[e];
        }
        parFamille.forEach((v, k) => (composition[k] += v / l.distanceM));
        if (parFamille[0] >= 1000) grandesRoutes1km++;
      }
    }
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
    {
      nom: 'Demi-tours de moins de 1 km dans les boucles proposées',
      seuil: '0',
      valeur: `${demiToursCourts} sur ${nbBoucles} boucles`,
      ok: demiToursCourts === 0,
    },
    { nom: 'Temps de calcul (Node, max)', seuil: '< 10 s (viser < 3 s)', valeur: `max ${(tMax / 1000).toFixed(2)} s, moyenne ${(tMoy / 1000).toFixed(2)} s, p90 ${(tP90 / 1000).toFixed(2)} s`, ok: tMax < SEUIL_TEMPS_MS },
    { nom: 'Tronçons empruntés deux fois (moyenne des boucles proposées)', seuil: '< 15 %', valeur: `${(arMoy * 100).toFixed(1)} % (${arAuDela}/${allersRetours.length} boucles ≥ 15 %)`, ok: arMoy < SEUIL_ALLER_RETOUR },
  ];
  for (const k of criteres) console.log(`  ${k.ok ? 'OK ' : 'KO '} ${k.nom} : ${k.valeur} (seuil ${k.seuil})`);
  if (tMoy > CIBLE_TEMPS_MS) console.log(`  Note : temps moyen au-dessus de la cible de ${CIBLE_TEMPS_MS / 1000} s.`);
  const compo = composition.map((v) => v / Math.max(1, nbBoucles));
  console.log(`  Composition : ${FAMILLES.map(([n], k) => `${n} ${(compo[k] * 100).toFixed(1)} %`).join(' ; ')} ; boucles avec ≥ 1 km de grande route : ${grandesRoutes1km}/${nbBoucles}`);
  return { id, titre, description, criteres, echecs, lignes, reponses, msChargementMax, composition: compo, grandesRoutes1km, nbBoucles };
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

// --------------------------------------------------------------- D+ maximal
const lignesMax: string[] = [];
let maxOk = true;
let maxCriteres: Critere[] = [];
if (!jeuDemande || jeuDemande === 'dmax') {
  let dansTol = 0;
  let horsZone = 0;
  let demiToursMax = 0;
  let nBoucles = 0;
  let tMax = 0;
  const cas = CAS_DPLUS_MAX.filter((c) => presentes.has(c.region));
  process.stdout.write('D+ maximal : ');
  for (const c of cas) {
    const zone = { kind: 'cercle' as const, rayonM: c.rayonM };
    const r = (await gen.store.graphFor(c.lat, c.lon, c.distanceKm, rayonZoneM(c.lat, c.lon, c.distanceKm, zone)))!;
    const g = r.graph;
    const res = new DplusMaxGenerator(g).generate({ lat: c.lat, lon: c.lon, distanceKm: c.distanceKm, terrain: 'mixte', zone, seed: SEED });
    tMax = Math.max(tMax, res.stats.ms);
    const b = res.loops[0];
    const ok = !!b && b.dansTolerance;
    if (ok) dansTol++;
    for (const l of res.loops) {
      nBoucles++;
      demiToursMax += demiTours(g.len, l.edges).filter(([, , aller]) => aller < DEMI_TOUR_MIN_M).length;
      // Hors zone : au-delà du rayon, hors du couloir d'accès de 300 m.
      for (const e of l.edges) {
        const d = Math.max(...[g.a[e], g.b[e]].map((n) => Math.hypot(g.x[n] - g.x[res.startNode], g.y[n] - g.y[res.startNode])));
        if (d > c.rayonM + 1) horsZone++;
      }
    }
    // Référence : le mode normal, sans zone, à qui l'on demande un D+ très élevé.
    const r0 = (await gen.store.graphFor(c.lat, c.lon, c.distanceKm))!;
    const ref = new LoopGenerator(r0.graph).generate({ lat: c.lat, lon: c.lon, distanceKm: c.distanceKm, dplusM: 5000, terrain: 'mixte', elargir: false, seed: SEED });
    const refDp = Math.max(0, ...ref.loops.filter((l) => Math.abs(l.ecartDistance) <= 0.05).map((l) => l.dplusM));
    lignesMax.push(`| ${c.depart} | ${c.distanceKm} km, rayon ${c.rayonM / 1000} km | ${b ? `${(b.distanceM / 1000).toFixed(2)} km / ${Math.round(b.dplusM)} m (${Math.round(b.dplusM / (b.distanceM / 1000))} m/km)` : '–'} | ${refDp ? `${Math.round(refDp)} m` : '–'} | ${(res.stats.ms / 1000).toFixed(2)} s | ${ok ? 'oui' : '**non**'} |`);
    process.stdout.write(ok ? '.' : 'x');
  }
  process.stdout.write('\n');
  maxCriteres = [
    { nom: 'Meilleure boucle dans la tolérance de distance', seuil: '≥ 80 %', valeur: `${dansTol}/${cas.length}`, ok: dansTol >= 0.8 * cas.length },
    { nom: 'Tronçons hors zone', seuil: '0', valeur: `${horsZone}`, ok: horsZone === 0 },
    { nom: 'Demi-tours de moins de 1 km', seuil: '0', valeur: `${demiToursMax} sur ${nBoucles} boucles`, ok: demiToursMax === 0 },
    { nom: 'Temps de calcul (Node, max)', seuil: '< 10 s', valeur: `${(tMax / 1000).toFixed(2)} s`, ok: tMax < SEUIL_TEMPS_MS },
  ];
  maxOk = maxCriteres.every((k) => k.ok);
  for (const k of maxCriteres) console.log(`  ${k.ok ? 'OK ' : 'KO '} ${k.nom} : ${k.valeur} (seuil ${k.seuil})`);
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
const toutOk = impOk && maxOk && jeux.every((j) => j.criteres.every((c) => c.ok));

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

Composition des boucles proposées (part moyenne de la distance) :

| Voies | Part |
| --- | --- |
${FAMILLES.map(([n], k) => `| ${n} | ${(j.composition[k] * 100).toFixed(1)} % |`).join('\n')}

Boucles avec au moins 1 km de grande route : ${j.grandesRoutes1km} sur ${j.nbBoucles}.

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
- D+ maximal : ${maxOk ? '✅' : '❌'} ${maxCriteres[0]?.valeur ?? '–'} dans la tolérance de distance, zone respectée
- Cibles impossibles : ${impOk ? '✅' : '❌'} message clair, jamais d'erreur

Reste à vérifier hors banc : le D+ réel sur 3 sorties (montre) et le temps sur téléphone.

| Région | Tuiles | Réseau | Données |
| --- | --- | --- | --- |
${regions}

${jeux.map(sectionJeu).join('\n')}
## D+ maximal

Zone : cercle autour du départ ; allers-retours non permis. Référence : le
mode normal sans zone, à qui l'on demande 5 000 m de D+ (sa meilleure boucle
dans la tolérance de distance).

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
${maxCriteres.map((c) => `| ${c.nom} | ${c.seuil} | ${c.valeur} | ${c.ok ? '✅' : '❌'} |`).join('\n')}

| Départ | Demande | Meilleure boucle | Référence (mode normal, sans zone) | Temps | Distance tenue |
| --- | --- | --- | --- | --- | --- |
${lignesMax.join('\n')}

## Cibles impossibles

| Demande | Attendu | Message renvoyé | Correct |
| --- | --- | --- | --- |
${lignesImp.join('\n')}

## GPX d'exemple

${gpxEcrits.join('\n')}
`;

if (ecrire && !jeuDemande) writeFileSync(racine('RESULTATS.md'), rapport);
process.exit(toutOk ? 0 : 1);
