// Jeu « zone » : boucles dans un cercle ou une zone dessinée, D+ visé.

import { noeudsDansZone } from '../../src/core/zone';
import { CAS_ZONE_CIBLE } from '../cases';
import { afficherCriteres, SEUIL_TEMPS_MS, tableauCriteres, type Contexte, type Critere, type Jeu } from '../commun';

export const JEU_ZONE: Jeu = {
  id: 'zone',
  parDefaut: true,
  async jouer({ gen, seed: SEED, presentes }: Contexte) {
    const lignesZone: string[] = [];
    let reussis = 0;
    let horsAcces = 0;
    let tMax = 0;
    const cas = CAS_ZONE_CIBLE.filter((c) => presentes.has(c.region));
    process.stdout.write('Zone + D+ visé : ');
    for (const c of cas) {
      const res = await gen.generate({ lat: c.lat, lon: c.lon, distanceKm: c.distanceKm, dplusM: c.dplusM, terrain: 'mixte', zone: c.zone, seed: SEED });
      const g = res.graph!;
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
      const gn = rn.graph;
      let refPart = NaN;
      if (gn && rn.loops[0]) {
        // Même définition de la zone que le générateur.
        const dedans = noeudsDansZone(gn, rn.startNode, c.zone);
        let lz = 0;
        for (const e of rn.loops[0].edges) if (dedans[gn.a[e]] && dedans[gn.b[e]]) lz += gn.len[e];
        refPart = lz / rn.loops[0].distanceM;
      }
      const zoneTxt = c.zone.kind === 'cercle' ? `cercle ${c.zone.rayonM / 1000} km` : 'zone dessinée';
      lignesZone.push(`| ${c.depart} | ${c.distanceKm} km / ${c.dplusM} m, ${zoneTxt} | ${b ? `${(b.distanceM / 1000).toFixed(2)} km / ${Math.round(b.dplusM)} m` : '–'} | ${b ? `${Math.round((b.partZone ?? 0) * 100)} %` : '–'} | ${Number.isNaN(refPart) ? '–' : `${Math.round(refPart * 100)} %`} | ${(res.stats.ms / 1000).toFixed(2)} s | ${ok ? 'oui' : '**non**'} |`);
      process.stdout.write(ok ? '.' : 'x');
    }
    process.stdout.write('\n');
    const criteres: Critere[] = [
      { nom: 'Demandes avec une boucle dans la tolérance (distance et D+)', seuil: '≥ 80 %', valeur: `${reussis}/${cas.length}`, ok: reussis >= 0.8 * cas.length },
      { nom: 'Tronçons hors du cercle (départ dans la zone)', seuil: '0', valeur: `${horsAcces}`, ok: horsAcces === 0 },
      { nom: 'Temps de calcul (Node, max)', seuil: '< 10 s', valeur: `${(tMax / 1000).toFixed(2)} s`, ok: tMax < SEUIL_TEMPS_MS },
    ];
    const ok = criteres.every((k) => k.ok);
    afficherCriteres(criteres);
    return [{
      id: 'zone', ok,
      verdict: `Zone + D+ visé : ${ok ? '✅' : '❌'} ${criteres[0].valeur} dans la tolérance`,
      section: `## Boucles dans une zone (D+ visé)

La boucle reste le plus possible dans la zone ; elle n'en sort que pour y
entrer (départ dehors, ou 300 m autour d'un départ en bordure). Référence :
la part dans la zone de la meilleure boucle du mode normal, même demande.

${tableauCriteres(criteres)}

| Départ | Demande | Meilleure boucle | Dans la zone | Mode normal, dans la zone | Temps | Réussi |
| --- | --- | --- | --- | --- | --- | --- |
${lignesZone.join('\n')}`,
    }];
  },
};
