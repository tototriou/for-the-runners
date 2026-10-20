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
import { CAS_IMPOSSIBLES, CAS_ZONE_CIBLE, casDeTest, casRegionaux, type Cas } from './cases';
import { ZoneGenerator, rayonZoneM } from '../src/core/zone';
import { mesurerSeance, TYPES_SEANCE, type MesuresSeance, type TypeSeance } from '../src/core/seances';
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
  composition: number[]; grandesRoutes1km: number; nbBoucles: number; parc: number; eau: number; rapide: number; itin: number; ecartArrivee: number;
  lignes: string[]; reponses: { c: Cas; r: LoopResponse }[]; msChargementMax: number;
}

/** D+ visé pour le rapport ; NaN : D+ libre. */
function dplusTxt(dp: number) {
  return Number.isNaN(dp) ? 'D+ libre' : `${dp} m`;
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
  let parc = 0;
  let eau = 0;
  let rapide = 0;
  let itin = 0;
  let ecartArrivee = 0;
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
        parc += l.parcM / l.distanceM;
        eau += l.eauM / l.distanceM;
        rapide += l.rapideM / l.distanceM;
        itin += l.itinM / l.distanceM;
        ecartArrivee += l.ecartArriveeM;
      }
    }
    const b = r.loops[0];
    const cell = b
      ? `${(b.distanceM / 1000).toFixed(2)} km / ${Math.round(b.dplusM)} m | ${pct(b.ecartDistance)} | ${pct(b.ecartDplus)} | ${(b.allerRetour * 100).toFixed(0)} %`
      : '– | – | – | –';
    const nOk = r.loops.filter((l) => l.dansTolerance).length;
    const verdict = !ok ? '**non**' : r.depart ? `oui, départ décalé de ${Math.round(r.depart.decalageM)} m` : 'oui';
    lignes.push(
      `| ${c.id} | ${c.depart} | ${c.distanceKm} km / ${dplusTxt(c.dplusM)} | ${c.terrain} | ${cell} | ${nOk}/${r.loops.length} | ${(r.stats.ms / 1000).toFixed(2)} s | ${verdict} |`,
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
      echecs.push(`- #${c.id} ${c.depart}, ${c.distanceKm} km / ${dplusTxt(c.dplusM)} (${c.terrain}) : ${r.message}${suivi}`);
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
  console.log(`  Composition : ${FAMILLES.map(([n], k) => `${n} ${(compo[k] * 100).toFixed(1)} %`).join(' ; ')} ; sans voitures ${((compo[3] + compo[4]) * 100).toFixed(1)} % ; dans les parcs ${((parc / Math.max(1, nbBoucles)) * 100).toFixed(1)} % ; au bord de l'eau ${((eau / Math.max(1, nbBoucles)) * 100).toFixed(1)} % ; le long d'une voie rapide ${((rapide / Math.max(1, nbBoucles)) * 100).toFixed(1)} % ; sur itinéraire balisé ${((itin / Math.max(1, nbBoucles)) * 100).toFixed(1)} % ; arrivée à ${Math.round(ecartArrivee / Math.max(1, nbBoucles))} m du départ en moyenne ; boucles avec ≥ 1 km de grande route : ${grandesRoutes1km}/${nbBoucles}`);
  return { id, titre, description, criteres, echecs, lignes, reponses, msChargementMax, composition: compo, grandesRoutes1km, nbBoucles, parc: parc / Math.max(1, nbBoucles), eau: eau / Math.max(1, nbBoucles), rapide: rapide / Math.max(1, nbBoucles), itin: itin / Math.max(1, nbBoucles), ecartArrivee: ecartArrivee / Math.max(1, nbBoucles) };
}

// ------------------------------------------------------------------- jeux
const jeux: ResultatJeu[] = [];
const regionaux = casRegionaux();
const definitions: [string, string, string, Cas[]][] = [
  ['annecy', 'Annecy (jeu du cadrage)', '50 demandes : 5 départs × 10 distances de 5 à 30 km, D+ de 50 à 1 500 m. Seuil jugé depuis le point exact, comme au cadrage.', casDeTest()],
  ['libre', 'Annecy, D+ libre', 'Les 50 demandes du cadrage sans D+ visé : seule la distance compte (±500 m, ou ±5 % au-delà de 10 km). Seuil jugé depuis le point exact.', casDeTest().map((c) => ({ ...c, dplusM: NaN }))],
  ['alsace', 'Alsace', '30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l\u2019app répond, départ décalé compris.', regionaux.filter((c) => c.region === 'Alsace')],
  ['idf', 'Île-de-France', '30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l\u2019app répond, départ décalé compris.', regionaux.filter((c) => c.region === 'Île-de-France')],
];
const presentes = new Set(gen.store.manifest.regions.map((r) => r.id));
for (const [id, titre, desc, cas] of definitions) {
  if (jeuDemande && jeuDemande !== id) continue;
  if (!presentes.has(id === 'libre' ? 'annecy' : id)) {
    console.log(`${titre} : région absente du manifeste, jeu ignoré`);
    continue;
  }
  jeux.push(await jouer(id, titre, desc, cas, id === 'annecy' || id === 'libre'));
}

// ------------------------------------------------- zone avec D+ visé
const lignesZone: string[] = [];
let zoneOk = true;
let zoneCriteres: Critere[] = [];
if (!jeuDemande || jeuDemande === 'zone') {
  let reussis = 0;
  let horsAcces = 0;
  let tMax = 0;
  const cas = CAS_ZONE_CIBLE.filter((c) => presentes.has(c.region));
  process.stdout.write('Zone + D+ visé : ');
  for (const c of cas) {
    const r = (await gen.store.graphFor(c.lat, c.lon, c.distanceKm, rayonZoneM(c.lat, c.lon, c.zone)))!;
    const g = r.graph;
    const res = new ZoneGenerator(g).generate({ lat: c.lat, lon: c.lon, distanceKm: c.distanceKm, dplusM: c.dplusM, terrain: 'mixte', zone: c.zone, seed: SEED });
    tMax = Math.max(tMax, res.stats.ms);
    const b = res.loops[0];
    const ok = res.loops.some((l) => l.dansTolerance);
    if (ok) reussis++;
    // Départ dans un cercle : rien au-delà du rayon (l'accès de 300 m reste dedans).
    if (c.zone.kind === 'cercle') {
      for (const l of res.loops) for (const e of l.edges) {
        const d = Math.max(...[g.a[e], g.b[e]].map((n) => Math.hypot(g.x[n] - g.x[res.startNode], g.y[n] - g.y[res.startNode])));
        if (d > c.zone.rayonM + 1) horsAcces++;
      }
    }
    // Référence : le mode normal sans zone, même demande ; part de sa meilleure boucle dans la zone.
    const rn = await gen.generate({ lat: c.lat, lon: c.lon, distanceKm: c.distanceKm, dplusM: c.dplusM, terrain: 'mixte', seed: SEED });
    const gn = (rn as { graph: Graph | null }).graph;
    let refPart = NaN;
    if (gn && rn.loops[0]) {
      const z = c.zone;
      const dedans = (n: number) => {
        const lat = gn.lat[n], lon = gn.lon[n];
        if (z.kind === 'cercle') return Math.hypot((lon - c.lon) * 111320 * Math.cos((c.lat * Math.PI) / 180), (lat - c.lat) * 111200) <= z.rayonM;
        let ins = false;
        const p = z.points;
        for (let a = 0, k = p.length - 1; a < p.length; k = a++) {
          if ((p[a][0] > lat) !== (p[k][0] > lat) && lon < ((p[k][1] - p[a][1]) * (lat - p[a][0])) / (p[k][0] - p[a][0]) + p[a][1]) ins = !ins;
        }
        return ins;
      };
      let lz = 0;
      for (const e of rn.loops[0].edges) if (dedans(gn.a[e]) && dedans(gn.b[e])) lz += gn.len[e];
      refPart = lz / rn.loops[0].distanceM;
    }
    const zoneTxt = c.zone.kind === 'cercle' ? `cercle ${c.zone.rayonM / 1000} km` : 'zone dessinée';
    lignesZone.push(`| ${c.depart} | ${c.distanceKm} km / ${c.dplusM} m, ${zoneTxt} | ${b ? `${(b.distanceM / 1000).toFixed(2)} km / ${Math.round(b.dplusM)} m` : '–'} | ${b ? `${Math.round((b.partZone ?? 0) * 100)} %` : '–'} | ${Number.isNaN(refPart) ? '–' : `${Math.round(refPart * 100)} %`} | ${(res.stats.ms / 1000).toFixed(2)} s | ${ok ? 'oui' : '**non**'} |`);
    process.stdout.write(ok ? '.' : 'x');
  }
  process.stdout.write('\n');
  zoneCriteres = [
    { nom: 'Demandes avec une boucle dans la tolérance (distance et D+)', seuil: '≥ 80 %', valeur: `${reussis}/${cas.length}`, ok: reussis >= 0.8 * cas.length },
    { nom: 'Tronçons hors du cercle (départ dans la zone)', seuil: '0', valeur: `${horsAcces}`, ok: horsAcces === 0 },
    { nom: 'Temps de calcul (Node, max)', seuil: '< 10 s', valeur: `${(tMax / 1000).toFixed(2)} s`, ok: tMax < SEUIL_TEMPS_MS },
  ];
  zoneOk = zoneCriteres.every((k) => k.ok);
  for (const k of zoneCriteres) console.log(`  ${k.ok ? 'OK ' : 'KO '} ${k.nom} : ${k.valeur} (seuil ${k.seuil})`);
}

// ------------------------------------------------------- types de séance
// En plus du calcul par défaut : même demande avec et sans séance, mesures
// de la boucle n°1 recalculées par la même fonction dans les deux cas.
const lignesSeances: string[] = [];
let seancesOk = true;
let seancesValeur = '–';
if (!jeuDemande || jeuDemande === 'seances') {
  const departs: [string, number, number][] = [
    ['Strasbourg, Krutenau', 48.5764, 7.7569], ['Strasbourg, Orangerie', 48.5925, 7.7745],
    ['Paris, canal Saint-Martin', 48.8710, 2.3650], ['Annecy centre', 45.8992, 6.1294],
  ];
  const types: [TypeSeance, number, (m: MesuresSeance) => string, (m: MesuresSeance) => number][] = [
    ['sortie-longue', 16, (m) => `${m.traversees.toFixed(1)} traversées/km`, (m) => -m.traversees],
    ['fractionne', 8, (m) => `tronçon continu ${Math.round(m.tronconM)} m`, (m) => m.tronconM],
    ['seuil', 10, (m) => `tronçon continu ${Math.round(m.tronconM)} m`, (m) => m.tronconM],
    ['cotes', 8, (m) => (m.coteM > 0 ? `côte ${Math.round(m.coteM)} m à ${m.cotePente.toFixed(1)} %` : 'aucune côte'), (m) => (m.coteM > 0 ? m.cotePente * Math.min(1, m.coteM / 150) : 0)],
    ['recuperation', 5, (m) => `${Math.round(m.partChemin * 100)} % chemin, ${m.traversees.toFixed(1)} trav./km`, (m) => m.partChemin - 0.05 * m.traversees],
  ];
  let ok = 0;
  let total = 0;
  let mieux = 0;
  process.stdout.write('Types de séance : ');
  for (const [type, d, decrire, note] of types) {
    for (const [nom, lat, lon] of departs) {
      const sans = await gen.generate({ lat, lon, distanceKm: d, terrain: 'mixte', seed: SEED });
      const avec = await gen.generate({ lat, lon, distanceKm: d, terrain: 'mixte', seed: SEED, seance: { type } });
      const g = avec.graph;
      if (!g || !sans.loops[0] || !avec.loops[0]) continue;
      const ms = mesurerSeance(g, sans.loops[0].edges, sans.loops[0].dirs);
      const ma = mesurerSeance(g, avec.loops[0].edges, avec.loops[0].dirs);
      total++;
      const tient = avec.loops.some((l) => l.dansTolerance);
      if (tient) ok++;
      if (note(ma) >= note(ms)) mieux++;
      lignesSeances.push(`| ${TYPES_SEANCE.find((t) => t.id === type)!.libelle} | ${nom}, ${d} km | ${decrire(ms)} | ${decrire(ma)} | ${(avec.stats.ms / 1000).toFixed(2)} s | ${tient ? 'oui' : '**non**'} |`);
      process.stdout.write('.');
    }
  }
  process.stdout.write('\n');
  seancesOk = total > 0 && ok / total >= 0.8;
  seancesValeur = `${Math.round((100 * ok) / Math.max(1, total))} % (${ok}/${total})`;
  console.log(`  ${seancesOk ? 'OK ' : 'KO '} Types de séance, demandes dans la tolérance : ${seancesValeur} (seuil ≥ 80 %) ; boucle n°1 au moins aussi adaptée qu'en boucle libre : ${mieux}/${total}`);
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
const toutOk = impOk && zoneOk && seancesOk && jeux.every((j) => j.criteres.every((c) => c.ok));

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
| **Total sans voitures** (pistes, piétonnes, sentiers) | ${((j.composition[3] + j.composition[4]) * 100).toFixed(1)} % |
| Dans les parcs et jardins publics (toutes voies) | ${(j.parc * 100).toFixed(1)} % |
| Au bord de l'eau, à moins de 30 m (toutes voies) | ${(j.eau * 100).toFixed(1)} % |
| Près d'une autoroute (150 m) ou voie rapide (75 m) | ${(j.rapide * 100).toFixed(1)} % |
| Sur un itinéraire piéton balisé (OpenStreetMap) | ${(j.itin * 100).toFixed(1)} % |

Boucles avec au moins 1 km de grande route : ${j.grandesRoutes1km} sur ${j.nbBoucles}. Arrivée à ${Math.round(j.ecartArrivee)} m du départ en moyenne (400 m tolérés).

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
- Zone + D+ visé : ${zoneOk ? '✅' : '❌'} ${zoneCriteres[0]?.valeur ?? '–'} dans la tolérance
- Types de séance : ${seancesOk ? '✅' : '❌'} ${seancesValeur} dans la tolérance
- Cibles impossibles : ${impOk ? '✅' : '❌'} message clair, jamais d'erreur

Reste à vérifier hors banc : le D+ réel sur 3 sorties (montre) et le temps sur téléphone.

| Région | Tuiles | Réseau | Données |
| --- | --- | --- | --- |
${regions}

${jeux.map(sectionJeu).join('\n')}
## Boucles dans une zone (D+ visé)

La boucle reste le plus possible dans la zone ; elle n'en sort que pour y
entrer (départ dehors, ou 300 m autour d'un départ en bordure). Référence :
la part dans la zone de la meilleure boucle du mode normal, même demande.

| Critère | Seuil | Mesure | |
| --- | --- | --- | --- |
${zoneCriteres.map((c) => `| ${c.nom} | ${c.seuil} | ${c.valeur} | ${c.ok ? '✅' : '❌'} |`).join('\n')}

| Départ | Demande | Meilleure boucle | Dans la zone | Mode normal, dans la zone | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- |
${lignesZone.join('\n')}

## Types de séance

En plus du calcul par défaut : même demande (D+ libre) en boucle libre, puis
avec le type de séance. Mesures de la boucle n°1, par la même fonction dans
les deux cas. Seuil : 80 % des demandes avec séance dans la tolérance.

| Séance | Demande | Boucle libre | Avec la séance | Temps | Dans la tolérance |
| --- | --- | --- | --- | --- | --- |
${lignesSeances.join('\n')}

## Cibles impossibles

| Demande | Attendu | Message renvoyé | Correct |
| --- | --- | --- | --- |
${lignesImp.join('\n')}

## GPX d'exemple

${gpxEcrits.join('\n')}
`;

if (ecrire && !jeuDemande) writeFileSync(racine('RESULTATS.md'), rapport);
process.exit(toutOk ? 0 : 1);
