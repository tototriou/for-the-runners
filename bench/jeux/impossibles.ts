// Jeu « impossibles » : cibles irréalisables, un message clair et jamais d'erreur.

import { CAS_IMPOSSIBLES } from '../cases';
import type { Contexte, Jeu } from '../commun';

export const JEU_IMPOSSIBLES: Jeu = {
  id: 'impossibles',
  parDefaut: true,
  async jouer({ gen }: Contexte) {
    const lignesImp: string[] = [];
    let impOk = true;
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
    return [{
      id: 'impossibles', ok: impOk,
      verdict: `Cibles impossibles : ${impOk ? '✅' : '❌'} message clair, jamais d'erreur`,
      section: `## Cibles impossibles

| Demande | Attendu | Message renvoyé | Correct |
| --- | --- | --- | --- |
${lignesImp.join('\n')}`,
    }];
  },
};
