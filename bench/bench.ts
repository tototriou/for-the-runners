// Banc de tests de Boucle D+ : orchestre les jeux de bench/jeux/ (un fichier
// par jeu) et assemble RESULTATS.md. Écrit aussi examples/*.gpx ; code de
// sortie 1 si un critère échoue sur un jeu. Les seuils sont ceux du cadrage :
// ne pas les modifier.
//
// Usage : npm run bench [-- --no-write] [-- --jeu <id>] [-- --sortie <fichier>]
// Sans --jeu : les jeux « par défaut » (ceux de la CI), et RESULTATS.md est
// réécrit. Avec --jeu : ce seul jeu, RESULTATS.md n'est pas touché ; son
// rapport va dans le fichier donné par --sortie, s'il y en a un.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Contexte, Jeu, ResultatJeu } from './commun';
import { JEU_DPLUS, JEU_DPLUS_COMPLET } from './jeux/dplus';
import { JEU_IMPOSSIBLES } from './jeux/impossibles';
import { JEUX_REGIONAUX } from './jeux/regionaux';
import { JEU_SEANCES } from './jeux/seances';
import { JEU_ZONE } from './jeux/zone';
import { Generateur } from '../src/core/generateur';
import { chargerStore } from './load';

/** Ordre des jeux, qui est aussi celui des sections du rapport ; le D+ visé, fonction centrale, d'abord. */
const JEUX: Jeu[] = [JEU_DPLUS, JEU_DPLUS_COMPLET, ...JEUX_REGIONAUX, JEU_ZONE, JEU_SEANCES, JEU_IMPOSSIBLES];

const racine = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const ecrire = !process.argv.includes('--no-write');
const option = (nom: string) => (process.argv.includes(nom) ? process.argv[process.argv.indexOf(nom) + 1] : null);
const jeuDemande = option('--jeu');
const sortie = option('--sortie');
if (jeuDemande && !JEUX.some((j) => j.id === jeuDemande)) {
  console.error(`Jeu inconnu : ${jeuDemande}. Jeux : ${JEUX.map((j) => j.id).join(', ')}`);
  process.exit(2);
}
// Graine du générateur : la même que l'app par défaut ; SEED=… pour vérifier
// que le taux de réussite ne tient pas à un tirage chanceux.
const SEED = Number(process.env.SEED ?? 12345);

const gen = new Generateur(chargerStore());
const ctx: Contexte = { gen, seed: SEED, presentes: new Set(gen.store.manifest.regions.map((r) => r.id)), ecrire };

const resultats: ResultatJeu[] = [];
for (const jeu of JEUX) {
  if (jeuDemande ? jeu.id !== jeuDemande : !jeu.parDefaut) continue;
  resultats.push(...(await jeu.jouer(ctx)));
}
const toutOk = resultats.every((r) => r.ok);

// ----------------------------------------------------------------- rapport
const regions = gen.store.manifest.regions
  .map((r) => `| ${r.name} | ${Object.keys(r.tiles).length} | ${r.km.toLocaleString('fr-FR')} km | ${(r.octets / 1e6).toFixed(1)} Mo |`)
  .join('\n');

const rapport = `# Résultats du banc de tests

Généré par \`npm run bench\` (Node ${process.version}). Réseau : ${gen.store.manifest.regions[0]?.reseau}.
Altitude : ${gen.store.manifest.regions[0]?.mnt}.

## Verdict : ${toutOk ? '✅ tous les critères automatiques sont atteints' : '❌ au moins un critère échoue'}

${resultats.map((r) => `- ${r.verdict}`).join('\n')}

Reste à vérifier hors banc : le D+ réel sur 3 sorties (montre) et le temps sur téléphone.

| Région | Tuiles | Réseau | Données |
| --- | --- | --- | --- |
${regions}

${resultats.map((r) => r.section).join('\n\n')}

## GPX d'exemple

${resultats.flatMap((r) => r.gpx ?? []).join('\n')}
`;

if (sortie) writeFileSync(sortie, rapport);
else if (ecrire && !jeuDemande) writeFileSync(racine('RESULTATS.md'), rapport);
process.exit(toutOk ? 0 : 1);
