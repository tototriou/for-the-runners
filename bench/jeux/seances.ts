// Jeu « séances » : même demande avec et sans type de séance, mesures de la
// boucle n°1 recalculées par la même fonction dans les deux cas.

import { mesurerSeance, TYPES_SEANCE, type MesuresSeance, type TypeSeance } from '../../src/core/seances';
import type { Contexte, Jeu } from '../commun';

export const JEU_SEANCES: Jeu = {
  id: 'seances',
  parDefaut: true,
  async jouer({ gen, seed: SEED }: Contexte) {
    const lignesSeances: string[] = [];
    const departs: [string, number, number][] = [
      ['Strasbourg, Krutenau', 48.5764, 7.7569], ['Strasbourg, Orangerie', 48.5925, 7.7745],
      ['Paris, canal Saint-Martin', 48.8710, 2.3650], ['Annecy centre', 45.8992, 6.1294],
    ];
    const types: [TypeSeance, number, (m: MesuresSeance) => string, (m: MesuresSeance) => number][] = [
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
    const reussi = total > 0 && ok / total >= 0.8;
    const valeur = `${Math.round((100 * ok) / Math.max(1, total))} % (${ok}/${total})`;
    console.log(`  ${reussi ? 'OK ' : 'KO '} Types de séance, demandes dans la tolérance : ${valeur} (seuil ≥ 80 %) ; boucle n°1 au moins aussi adaptée qu'en boucle libre : ${mieux}/${total}`);
    return [{
      id: 'seances', ok: reussi,
      verdict: `Types de séance : ${reussi ? '✅' : '❌'} ${valeur} dans la tolérance`,
      section: `## Types de séance

En plus du calcul par défaut : même demande (D+ libre) en boucle libre, puis
avec le type de séance. Mesures de la boucle n°1, par la même fonction dans
les deux cas. Seuil : 80 % des demandes avec séance dans la tolérance.

| Séance | Demande | Boucle libre | Avec la séance | Temps | Dans la tolérance |
| --- | --- | --- | --- | --- | --- |
${lignesSeances.join('\n')}`,
    }];
  },
};
