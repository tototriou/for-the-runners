// Point d'entrée unique d'une demande de boucles : tuiles autour du départ
// (ou de la zone), graphe, générateur. Le Worker et le banc passent tous deux
// par ici, pour que le banc mesure exactement ce que l'app calcule.

import type { Graph } from './graph';
import { LoopGenerator, type LoopRequest, type LoopResponse } from './loops';
import type { TileStore } from './tiles';
import { rayonZoneM, ZoneGenerator } from './zone';

/** Tuiles chargées pour la demande ; `neuf` : graphe construit (et non réutilisé). */
export interface Chargement {
  tuiles: number;
  ms: number;
  neuf: boolean;
}

export type Reponse = LoopResponse & { graph: Graph | null; chargement: Chargement | null };

export class Generateur {
  /** Générateurs du dernier graphe, créés à la première demande qui en a besoin. */
  private courant: { graph: Graph; boucles?: LoopGenerator; zone?: ZoneGenerator } | null = null;

  constructor(readonly store: TileStore) {}

  async generate(req: LoopRequest): Promise<Reponse> {
    const t0 = now();
    const rayon = req.zone ? rayonZoneM(req.lat, req.lon, req.zone) : undefined;
    const r = await this.store.graphFor(req.lat, req.lon, req.distanceKm, rayon);
    if (!r) {
      return {
        ok: false, loops: [], startNode: -1, stats: { candidates: 0, routes: 0, ms: 0 }, graph: null, chargement: null,
        message: 'Ce départ est hors de la zone couverte.',
      };
    }
    if (this.courant?.graph !== r.graph) this.courant = { graph: r.graph };
    const c = this.courant;
    const chargement = { tuiles: r.tiles.length, ms: 0, neuf: r.neuf };
    let res: LoopResponse;
    if (req.zone) {
      c.zone ??= new ZoneGenerator(r.graph);
      chargement.ms = now() - t0;
      res = c.zone.generate({ ...req, zone: req.zone });
    } else {
      c.boucles ??= new LoopGenerator(r.graph);
      chargement.ms = now() - t0;
      res = c.boucles.generate(req);
    }
    return { ...res, graph: r.graph, chargement };
  }
}

function now() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}
