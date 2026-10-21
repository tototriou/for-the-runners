// Jeu « D+ visé » : la fonction centrale de l'app, mesurée par tranche de D+
// par km et par relief. Pas de seuil de réussite sur le D+ tenu : ce jeu sert
// de référence pour comparer un changement du calcul à l'état de main.
// Bloquant : aucune erreur, temps sous le seuil commun.

import type { LoopResponse } from '../../src/core/loops';
import { casDplus, RELIEFS, type CasDplus } from '../cases';
import { afficherCriteres, SEUIL_TEMPS_MS, tableauCriteres, type Contexte, type Critere, type Jeu } from '../commun';

/** Tranches de D+ par km visé (bornes basses incluses). */
const TRANCHES: [string, number, number][] = [
  ['moins de 10 m/km', 0, 10], ['10 à 20 m/km', 10, 20], ['20 à 40 m/km', 20, 40], ['40 à 60 m/km', 40, 60], ['60 m/km et plus', 60, Infinity],
];

interface Ligne { c: CasDplus; r: LoopResponse | null; erreur: string }

const tenue = (l: Ligne) => !!l.r?.loops[0]?.dansTolerance;
const moyenne = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
const mediane = (xs: number[]) => {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const pc = (x: number) => (Number.isNaN(x) ? '–' : `${(x * 100).toFixed(1)} %`);

/** Ligne de synthèse d'un groupe de demandes : D+ tenu, écart, agrément de la n°1. */
function synthese(titre: string, g: Ligne[]): string {
  const n1 = g.map((l) => l.r?.loops[0]).filter((b) => !!b);
  const part = (f: (b: (typeof n1)[number]) => number) => pc(moyenne(n1.map((b) => f(b) / b.distanceM)));
  return `| ${titre} | ${g.length} | ${g.filter(tenue).length} (${pc(g.filter(tenue).length / Math.max(1, g.length))}) | ${pc(mediane(n1.map((b) => Math.abs(b.ecartDplus))))} | ${part((b) => b.sansVoitureM)} | ${part((b) => b.eauM)} | ${part((b) => b.parcM)} |`;
}

function issue(l: Ligne): string {
  if (l.erreur) return `**erreur** : ${l.erreur}`;
  const r = l.r!;
  if (tenue(l)) return r.depart ? `tenu, départ décalé de ${Math.round(r.depart.decalageM)} m` : 'tenu';
  if (r.suggestion) return `hors tolérance ; D+ proposé ${r.suggestion.dplusM} m (plage ${r.suggestion.plage[0]} à ${r.suggestion.plage[1]} m)`;
  return 'hors tolérance';
}

function jeuDplus(id: string, complet: boolean): Jeu {
  const titre = complet ? 'D+ visé, balayage complet' : 'D+ visé';
  return {
    id,
    parDefaut: !complet,
    async jouer({ gen, seed: SEED, presentes }: Contexte) {
      const cas = casDplus(complet).filter((c) => presentes.has(c.region));
      const lignes: Ligne[] = [];
      let tMax = 0;
      process.stdout.write(`${titre} : `);
      for (const c of cas) {
        try {
          const r = await gen.generate({ lat: c.lat, lon: c.lon, distanceKm: c.distanceKm, dplusM: c.dplusM, terrain: 'mixte', seed: SEED });
          tMax = Math.max(tMax, r.stats.ms);
          lignes.push({ c, r, erreur: '' });
        } catch (e) {
          lignes.push({ c, r: null, erreur: String(e) });
        }
        const l = lignes[lignes.length - 1];
        process.stdout.write(l.erreur ? 'E' : tenue(l) ? '.' : 'x');
      }
      process.stdout.write('\n');
      const n = lignes.length;
      const nTenues = lignes.filter(tenue).length;
      const erreurs = lignes.filter((l) => l.erreur).length;
      const criteres: Critere[] = [
        { nom: 'Boucle n°1 dans la tolérance (distance et D+ ±15 %, départ décalé compris)', seuil: '– (référence)', valeur: `${Math.round((100 * nTenues) / Math.max(1, n))} % (${nTenues}/${n})`, ok: true },
        { nom: 'Pour information : tenues grâce au départ décalé', seuil: '–', valeur: `${lignes.filter((l) => tenue(l) && l.r!.depart).length}`, ok: true },
        { nom: 'Pour information : hors tolérance avec un D+ réalisable proposé', seuil: '–', valeur: `${lignes.filter((l) => !tenue(l) && l.r?.suggestion).length}`, ok: true },
        { nom: 'Demandes en erreur', seuil: '0', valeur: `${erreurs}`, ok: erreurs === 0 },
        { nom: 'Temps de calcul (Node, max)', seuil: '< 10 s', valeur: `${(tMax / 1000).toFixed(2)} s`, ok: tMax < SEUIL_TEMPS_MS },
      ];
      const ok = criteres.every((k) => k.ok);
      afficherCriteres(criteres);
      const entete = `| Demandes | Nombre | n°1 tenue | Écart D+ médian (n°1) | Sans voitures | Bord de l'eau | Parcs |
| --- | --- | --- | --- | --- | --- | --- |`;
      const parTranche = TRANCHES.map(([t, a, b]) => synthese(t, lignes.filter((l) => a <= l.c.dplusM / l.c.distanceKm && l.c.dplusM / l.c.distanceKm < b)));
      const parRelief = RELIEFS.map((rel) => synthese(rel, lignes.filter((l) => l.c.relief === rel)));
      const detail = lignes.map((l) => {
        const b = l.r?.loops[0];
        return `| ${l.c.depart} | ${l.c.relief} | ${l.c.distanceKm} km / ${l.c.dplusM} m | ${b ? `${(b.distanceM / 1000).toFixed(2)} km / ${Math.round(b.dplusM)} m` : '–'} | ${b ? `${b.ecartDplus >= 0 ? '+' : ''}${(b.ecartDplus * 100).toFixed(1)} %` : '–'} | ${issue(l)} | ${l.r ? `${(l.r.stats.ms / 1000).toFixed(2)} s` : '–'} |`;
      });
      return [{
        id, ok,
        verdict: `${titre} : ${ok ? '✅' : '❌'} ${criteres[0].valeur} avec la boucle n°1 dans la tolérance (référence, sans seuil)`,
        section: `## ${titre}

${complet ? '20 départs × 3 distances (5, 10, 15 km), D+ de 50 à 1 000 m : `npm run bench -- --jeu dplus-complet`, hors CI.' : '10 départs (2 à 3 par relief, trois régions) × 10 km × 5 D+ visés, un par tranche de D+ par km.'}
Terrain « mixte ». Pas de seuil sur le D+ tenu : la mesure sert de
référence à tout changement du calcul (comparer avant et après). Agrément :
part moyenne de la distance de la boucle n°1.

${tableauCriteres(criteres)}

Par D+ par km visé :

${entete}
${parTranche.join('\n')}
${synthese('**Toutes**', lignes)}

Par relief autour du départ :

${entete}
${parRelief.join('\n')}

<details><summary>Détail des demandes</summary>

| Départ | Relief | Demande | Boucle n°1 | Écart D+ | Issue | Temps |
| --- | --- | --- | --- | --- | --- | --- |
${detail.join('\n')}

</details>`,
      }];
    },
  };
}

export const JEU_DPLUS = jeuDplus('dplus', false);
export const JEU_DPLUS_COMPLET = jeuDplus('dplus-complet', true);
