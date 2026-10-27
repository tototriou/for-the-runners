// Jeux régionaux : cadrage d'Annecy (D+ visé et D+ libre), Alsace, Île-de-France.

import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { LoopResponse } from '../../src/core/loops';
import { demiTours } from '../../src/core/mesures';
import { DEMI_TOUR_MIN_M, SEUIL_ALLER_RETOUR } from '../../src/core/regles';
import { toGpx } from '../../src/core/gpx';
import { casDeTest, casRegionaux, type Cas } from '../cases';
import {
  afficherCriteres, CIBLE_TEMPS_MS, dplusTxt, FAMILLES, famille, pct, SEUIL_REUSSITE, SEUIL_TEMPS_MS, tableauCriteres,
  type Contexte, type Critere, type Jeu, type ResultatJeu,
} from '../commun';

const racine = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url));

interface Mesure {
  titre: string; description: string; criteres: Critere[]; echecs: string[];
  /** Part moyenne de distance par famille de voie, et boucles avec ≥ 1 km de grande route. */
  composition: number[]; grandesRoutes1km: number; nbBoucles: number; parc: number; eau: number; rapide: number; itin: number; ecartArrivee: number;
  lignes: string[]; reponses: { c: Cas; r: LoopResponse }[]; msChargementMax: number;
}

/**
 * `bloquantExact` : la réussite qui compte pour le seuil est celle obtenue
 * depuis le point exact (jeu du cadrage) ; sinon, celle de l'app telle
 * qu'un coureur l'utilise, départ décalé de 2 km au plus compris.
 */
async function jouer(ctx: Contexte, titre: string, description: string, cas: Cas[], bloquantExact: boolean): Promise<Mesure> {
  const { gen, seed: SEED } = ctx;
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
    if (r.chargement?.neuf) msChargementMax = Math.max(msChargementMax, r.chargement.ms);
    reponses.push({ c, r });
    temps.push(r.stats.ms);
    const ok = r.loops.some((l) => l.dansTolerance);
    if (ok) reussis++;
    if (ok && !r.depart) exacts++;
    for (const l of r.loops) allersRetours.push(l.allerRetour);
    const g = r.graph;
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
        suivi = ` → suggestion ${r.suggestion.dplusM} m suivie : ${ok2 ? 'aboutit' : '**n’aboutit pas**'}`;
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
  afficherCriteres(criteres);
  if (tMoy > CIBLE_TEMPS_MS) console.log(`  Note : temps moyen au-dessus de la cible de ${CIBLE_TEMPS_MS / 1000} s.`);
  const compo = composition.map((v) => v / Math.max(1, nbBoucles));
  console.log(`  Composition : ${FAMILLES.map(([n], k) => `${n} ${(compo[k] * 100).toFixed(1)} %`).join(' ; ')} ; sans voitures ${((compo[3] + compo[4]) * 100).toFixed(1)} % ; dans les parcs ${((parc / Math.max(1, nbBoucles)) * 100).toFixed(1)} % ; au bord de l'eau ${((eau / Math.max(1, nbBoucles)) * 100).toFixed(1)} % ; le long d'une voie rapide ${((rapide / Math.max(1, nbBoucles)) * 100).toFixed(1)} % ; sur itinéraire balisé ${((itin / Math.max(1, nbBoucles)) * 100).toFixed(1)} % ; arrivée à ${Math.round(ecartArrivee / Math.max(1, nbBoucles))} m du départ en moyenne ; boucles avec ≥ 1 km de grande route : ${grandesRoutes1km}/${nbBoucles}`);
  return { titre, description, criteres, echecs, lignes, reponses, msChargementMax, composition: compo, grandesRoutes1km, nbBoucles, parc: parc / Math.max(1, nbBoucles), eau: eau / Math.max(1, nbBoucles), rapide: rapide / Math.max(1, nbBoucles), itin: itin / Math.max(1, nbBoucles), ecartArrivee: ecartArrivee / Math.max(1, nbBoucles) };
}

const section = (j: Mesure) => `## ${j.titre}

${j.description} Chargement et fusion des tuiles : ${(j.msChargementMax / 1000).toFixed(2)} s au plus, hors calcul.

${tableauCriteres(j.criteres)}

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

</details>`;

/** GPX d'exemple tirés du jeu du cadrage. */
function ecrireExemples(m: Mesure): string[] {
  const out: string[] = [];
  mkdirSync(racine('examples'), { recursive: true });
  for (const ex of [{ id: 3, nom: 'annecy-10km' }, { id: 15, nom: 'sevrier-15km' }, { id: 27, nom: 'talloires-20km' }]) {
    const rep = m.reponses.find((x) => x.c.id === ex.id);
    const loop = rep?.r.loops.find((l) => l.dansTolerance) ?? rep?.r.loops[0];
    if (!rep || !loop) continue;
    const nom = `${rep.c.depart} ${(loop.distanceM / 1000).toFixed(1)} km ${Math.round(loop.dplusM)} m D+`;
    const fichier = `examples/${ex.nom}.gpx`;
    writeFileSync(racine(fichier), toGpx(loop, nom));
    out.push(`- [\`${fichier}\`](${fichier}) : ${nom} (demande #${ex.id} : ${rep.c.distanceKm} km / ${rep.c.dplusM} m, ${rep.c.terrain})`);
  }
  return out;
}

function jeuRegional(id: string, titre: string, description: string, cas: () => Cas[], bloquantExact: boolean): Jeu {
  return {
    id,
    parDefaut: true,
    async jouer(ctx: Contexte): Promise<ResultatJeu[]> {
      const demandes = cas();
      if (!demandes.every((c) => ctx.couvert(c.lat, c.lon))) {
        console.log(`${titre} : départs hors des données présentes, jeu ignoré`);
        return [];
      }
      const m = await jouer(ctx, titre, description, demandes, bloquantExact);
      const ok = m.criteres.every((c) => c.ok);
      return [{
        id, ok, section: section(m),
        verdict: `${m.titre} : ${ok ? '✅' : '❌'} ${m.criteres[0].valeur} dans la tolérance`,
        ...(id === 'annecy' && ctx.ecrire ? { gpx: ecrireExemples(m) } : {}),
      }];
    },
  };
}

export const JEUX_REGIONAUX: Jeu[] = [
  jeuRegional('annecy', 'Annecy (jeu du cadrage)', '50 demandes : 5 départs × 10 distances de 5 à 30 km, D+ de 50 à 1 500 m. Seuil jugé depuis le point exact, comme au cadrage.', casDeTest, true),
  jeuRegional('libre', 'Annecy, D+ libre', 'Les 50 demandes du cadrage sans D+ visé : seule la distance compte (±500 m, ou ±5 % au-delà de 10 km). Seuil jugé depuis le point exact.', () => casDeTest().map((c) => ({ ...c, dplusM: NaN })), true),
  jeuRegional('alsace', 'Alsace', '30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris.', () => casRegionaux().filter((c) => c.region === 'Alsace'), false),
  jeuRegional('idf', 'Île-de-France', '30 demandes : 5 départs × 6 distances de 6 à 30 km ; pente dans la plage réaliste de chaque départ (bench/cases.ts). Seuil jugé comme l’app répond, départ décalé compris.', () => casRegionaux().filter((c) => c.region === 'Île-de-France'), false),
];
