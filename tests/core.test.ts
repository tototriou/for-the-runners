import { describe, expect, it } from 'vitest';
import { decodeGraph, type Graph, type ZoneDoc } from '../src/core/graph';
import { LoopGenerator, type Loop } from '../src/core/loops';
import { couperDemiTours, demiTours } from '../src/core/mesures';
import { ARRIVEE_M, DEMI_TOUR_MIN_M } from '../src/core/regles';
import { toGpx } from '../src/core/gpx';
import { Router } from '../src/core/router';
import { mesurerSeance } from '../src/core/seances';
import { voiesBoucle } from '../src/core/voies';
import { ZoneGenerator } from '../src/core/zone';
import { chargerStore } from '../bench/load';

/**
 * Grille synthétique n × n de pas `pas` mètres autour de (45.9, 6.13), avec
 * une colline gaussienne au nord-est : de quoi avoir du relief sans dépendre
 * des vraies données.
 */
function grille(n = 30, pas = 100): Graph {
  const lat0 = 45.9;
  const lon0 = 6.13;
  const kx = Math.cos((lat0 * Math.PI) / 180) * 111320;
  const ky = 111200;
  const coords: [number, number][] = [];
  const ele: number[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = (j - n / 2) * pas;
      const y = (i - n / 2) * pas;
      coords.push([lat0 + y / ky, lon0 + x / kx]);
      ele.push(450 + 300 * Math.exp(-((x - 800) ** 2 + (y - 800) ** 2) / (2 * 600 ** 2)));
    }
  }
  const nodes: number[] = [];
  let p = [0, 0];
  for (const [la, lo] of coords) {
    const c = [Math.round(la * 1e5), Math.round(lo * 1e5)];
    nodes.push(c[0] - p[0], c[1] - p[1]);
    p = c;
  }
  const E = { a: [] as number[], b: [] as number[], len: [] as number[], upAB: [] as number[], upBA: [] as number[], type: [] as number[] };
  const geom: number[][] = [];
  const arete = (u: number, v: number) => {
    const dz = ele[v] - ele[u];
    E.a.push(u);
    E.b.push(v);
    E.len.push(pas * 10);
    E.upAB.push(Math.round(Math.max(dz, 0) * 10));
    E.upBA.push(Math.round(Math.max(-dz, 0) * 10));
    E.type.push((u + v) % 3 === 0 ? 1 : 0);
    geom.push([]);
  };
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const u = i * n + j;
      if (j + 1 < n) arete(u, u + 1);
      if (i + 1 < n) arete(u, u + n);
    }
  }
  const doc: ZoneDoc = {
    v: 1,
    meta: { zone: 'grille', center: [lat0, lon0], radiusKm: 2, reseau: 'synthétique', mnt: 'synthétique', noeuds: n * n, aretes: E.a.length },
    nodes, nodeEle: ele.map(Math.round), edges: E, geom,
  };
  return decodeGraph(doc);
}

/** Vérifie qu'une boucle est un chemin continu qui revient à son départ. */
/** Boucle continue, mesures exactes ; arrivée à moins de `ecartMaxM` du départ (0 : sur le départ). */
function verifierBoucle(g: Graph, loop: Loop, ecartMaxM = ARRIVEE_M) {
  let noeud = loop.dirs[0] ? g.a[loop.edges[0]] : g.b[loop.edges[0]];
  const depart = noeud;
  let distance = 0;
  let dplus = 0;
  loop.edges.forEach((e, i) => {
    const [de, vers] = loop.dirs[i] ? [g.a[e], g.b[e]] : [g.b[e], g.a[e]];
    expect(de).toBe(noeud);
    noeud = vers;
    distance += g.len[e];
    dplus += loop.dirs[i] ? g.upAB[e] : g.upBA[e];
  });
  if (ecartMaxM === 0) {
    expect(noeud).toBe(depart);
    expect(loop.coords[0]).toEqual(loop.coords[loop.coords.length - 1]);
  }
  expect(loop.ecartArriveeM).toBeLessThanOrEqual(ecartMaxM + 1);
  expect(loop.distanceM).toBeCloseTo(distance, 6);
  expect(loop.dplusM).toBeCloseTo(dplus, 6);
}

describe('decodeGraph', () => {
  it('reconstruit nœuds, arêtes et adjacence', () => {
    const g = grille(4, 100);
    expect(g.n).toBe(16);
    expect(g.m).toBe(24);
    // un coin a 2 voisins, un nœud intérieur 4
    expect(g.adjStart[1] - g.adjStart[0]).toBe(2);
    expect(g.adjStart[6] - g.adjStart[5]).toBe(4);
    expect(g.len[0]).toBe(100);
  });

  it('trouve le nœud le plus proche', () => {
    const g = grille(10, 100);
    const k = 3 * 10 + 7;
    expect(g.grid.nearest(g.x[k] + 20, g.y[k] - 30)).toBe(k);
  });
});

describe('LoopGenerator (grille synthétique)', () => {
  const g = grille();
  const gen = new LoopGenerator(g);
  const depart = { lat: 45.9, lon: 6.13 };

  it('renvoie des boucles fermées, continues et cohérentes', () => {
    const r = gen.generate({ ...depart, distanceKm: 4, dplusM: 150, terrain: 'mixte' });
    expect(r.loops.length).toBeGreaterThanOrEqual(3);
    expect(r.loops.length).toBeLessThanOrEqual(5);
    for (const l of r.loops) verifierBoucle(g, l);
    expect(r.loops.some((l) => l.dansTolerance)).toBe(true);
  });

  it('D+ libre : distance tenue, boucles du plus roulant au plus vallonné', () => {
    const r = gen.generate({ ...depart, distanceKm: 4, terrain: 'mixte' });
    expect(r.ok).toBe(true);
    const dp = r.loops.map((l) => l.dplusM);
    expect(dp).toEqual([...dp].sort((x, y) => x - y));
    for (const l of r.loops.filter((x) => x.dansTolerance)) {
      expect(Math.abs(l.distanceM - 4000)).toBeLessThanOrEqual(500);
      expect(l.ecartDplus).toBe(0);
    }
    expect(r.message).toMatch(/à toi de choisir/);
  });

  it('cible impossible : message clair et boucle la plus proche', () => {
    const r = gen.generate({ ...depart, distanceKm: 2, dplusM: 3000, terrain: 'mixte' });
    expect(r.ok).toBe(false);
    expect(r.loops.length).toBeGreaterThan(0);
    expect(r.message).toMatch(/Impossible depuis ce départ/);
  });

  it('cible impossible depuis le point, possible à moins de 2 km : départ décalé', () => {
    // Coin sud-ouest de la grille, plat ; la colline est à ~1,3 km au nord-est.
    const lat = 45.9 - 600 / 111200;
    const lon = 6.13 - 600 / (Math.cos((45.9 * Math.PI) / 180) * 111320);
    const r = gen.generate({ lat, lon, distanceKm: 2.5, dplusM: 150, terrain: 'mixte' });
    expect(r.ok).toBe(true);
    expect(r.depart).toBeDefined();
    expect(r.depart!.decalageM).toBeLessThanOrEqual(2000);
    expect(r.message).toMatch(/Impossible depuis ton point de départ/);
    for (const l of r.loops) {
      verifierBoucle(g, l);
      expect(l.coords[0][0]).toBeCloseTo(r.depart!.lat, 5);
    }
    // Sans élargissement, la même demande échoue : le décalage était nécessaire.
    expect(gen.generate({ lat, lon, distanceKm: 2.5, dplusM: 150, terrain: 'mixte', elargir: false }).ok).toBe(false);
  });

  it('toujours impossible : un D+ réalisable est suggéré, et il aboutit', () => {
    const r = gen.generate({ ...depart, distanceKm: 3, dplusM: 2000, terrain: 'mixte' });
    expect(r.ok).toBe(false);
    expect(r.suggestion?.sens).toBe('reduire');
    expect(r.message).toMatch(/essaie \d+ m/);
    const s = r.suggestion!;
    expect(s.dplusM).toBeGreaterThanOrEqual(s.plage[0]);
    expect(s.dplusM).toBeLessThanOrEqual(s.plage[1]);
    const r2 = gen.generate({ ...depart, distanceKm: 3, dplusM: s.dplusM, terrain: 'mixte' });
    expect(r2.loops.some((l) => l.dansTolerance)).toBe(true);
  });

  it('départ hors réseau : message, pas d’exception', () => {
    const r = gen.generate({ lat: 46.5, lon: 6.13, distanceKm: 5, dplusM: 100, terrain: 'mixte' });
    expect(r.ok).toBe(false);
    expect(r.loops).toHaveLength(0);
    expect(r.message).toMatch(/trop loin/);
  });

  it('saisie invalide : message, pas d’exception', () => {
    const r = gen.generate({ ...depart, distanceKm: 0, dplusM: 100, terrain: 'mixte' });
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/positifs/);
  });

  it('est déterministe à graine égale', () => {
    const a = gen.generate({ ...depart, distanceKm: 3, dplusM: 80, terrain: 'route', seed: 7 });
    const b = gen.generate({ ...depart, distanceKm: 3, dplusM: 80, terrain: 'route', seed: 7 });
    expect(a.loops.map((l) => l.edges)).toEqual(b.loops.map((l) => l.edges));
  });
});

describe('demi-tours', () => {
  // Arêtes 0..9, longueurs en mètres.
  const len = Float64Array.from([100, 100, 300, 400, 100, 100, 100, 100, 100, 100]);
  const g = { len } as unknown as Graph;

  it('repère un aller-retour au bout d\u2019une rue et sa longueur', () => {
    // 0, 1, puis impasse 2-3 aller-retour, puis 4.
    expect(demiTours(len, [0, 1, 2, 3, 3, 2, 4])).toEqual([[2, 6, 700]]);
  });

  it('coupe un demi-tour de moins de 1 km, garde la boucle continue', () => {
    const edges = [0, 1, 2, 3, 3, 2, 4];
    const dirs = [1, 1, 1, 1, 0, 0, 1];
    couperDemiTours(g, edges, dirs, DEMI_TOUR_MIN_M);
    expect(edges).toEqual([0, 1, 4]);
    expect(dirs).toEqual([1, 1, 1]);
  });

  it('garde un aller-retour d\u2019au moins 1 km (vers un sommet)', () => {
    const edges = [0, 2, 3, 2, 3, 3, 2, 3, 2, 1];
    // aller 2,3,2,3 = 1 400 m puis retour en miroir
    couperDemiTours(g, edges, edges.map(() => 1), DEMI_TOUR_MIN_M);
    expect(edges).toEqual([0, 2, 3, 2, 3, 3, 2, 3, 2, 1]);
  });

  it('coupe aussi une impasse dans l\u2019impasse', () => {
    const edges = [0, 2, 4, 4, 2, 1];
    couperDemiTours(g, edges, edges.map(() => 1), DEMI_TOUR_MIN_M);
    expect(edges).toEqual([0, 1]);
  });

  it('les boucles générées n\u2019ont aucun demi-tour de moins de 1 km', () => {
    const gr = grille();
    const r = new LoopGenerator(gr).generate({ lat: 45.9, lon: 6.13, distanceKm: 4, dplusM: 150, terrain: 'mixte' });
    for (const l of r.loops) {
      expect(demiTours(gr.len, l.edges).filter(([, , aller]) => aller < DEMI_TOUR_MIN_M)).toEqual([]);
    }
  });
});

describe('Boucles dans une zone (grille synthétique)', () => {
  const g = grille();
  const gen = new ZoneGenerator(g);
  const depart = { lat: 45.9, lon: 6.13 };

  it('reste dans le cercle, sans demi-tour court', () => {
    const rayonM = 1200;
    const r = gen.generate({ ...depart, distanceKm: 5, dplusM: 120, terrain: 'mixte', zone: { kind: 'cercle', rayonM } });
    expect(r.loops.length).toBeGreaterThan(0);
    for (const l of r.loops) {
      verifierBoucle(g, l);
      for (const e of l.edges) {
        for (const n of [g.a[e], g.b[e]]) {
          expect(Math.hypot(g.x[n] - g.x[r.startNode], g.y[n] - g.y[r.startNode])).toBeLessThanOrEqual(rayonM + 1);
        }
      }
      expect(demiTours(g.len, l.edges).filter(([, , aller]) => aller < DEMI_TOUR_MIN_M)).toEqual([]);
    }
  });

  it('tient la distance et le D+, entièrement dans la zone', () => {
    const r = gen.generate({ ...depart, distanceKm: 5, dplusM: 120, terrain: 'mixte', zone: { kind: 'cercle', rayonM: 1500 } });
    expect(r.ok).toBe(true);
    const ok = r.loops.filter((l) => l.dansTolerance);
    expect(ok.length).toBeGreaterThan(0);
    for (const l of ok) {
      expect(Math.abs(l.distanceM - 5000)).toBeLessThanOrEqual(500);
      expect(Math.abs(l.ecartDplus)).toBeLessThanOrEqual(0.15);
      expect(l.partZone).toBe(1);
    }
  });

  it('accepte un départ sur la bordure d\u2019une zone dessinée', () => {
    const d = 0.008;
    const zone = { kind: 'polygone' as const, points: [[45.9, 6.13], [45.9, 6.13 + d], [45.9 + d, 6.13 + d], [45.9 + d, 6.13]] as [number, number][] };
    const r = gen.generate({ ...depart, distanceKm: 3, dplusM: 60, terrain: 'mixte', zone });
    expect(r.loops.length).toBeGreaterThan(0);
    expect(r.message).not.toMatch(/presque aucun chemin/);
  });
});

describe('arrivée à distance du départ', () => {
  const g = grille(30, 100);
  const cout = Float64Array.from(g.len);
  const used = new Uint16Array(g.m);
  const t = 15 * 30 + 15;
  const ecart = (u: number) => Math.hypot(g.x[u] - g.x[t], g.y[u] - g.y[t]);

  it('s’arrête avant quand l’écart coûte moins que le chemin restant', () => {
    const r = new Router(g).route(0, t, cout, 1, used, 0, { rayon: 400, prixM: 0.5 })!;
    const fin = r.nodes[r.nodes.length - 1];
    expect(fin).not.toBe(t);
    expect(ecart(fin)).toBeLessThanOrEqual(400);
  });

  it('va jusqu’au départ quand l’écart coûte plus', () => {
    const r = new Router(g).route(0, t, cout, 1, used, 0, { rayon: 400, prixM: 2 })!;
    expect(r.nodes[r.nodes.length - 1]).toBe(t);
  });

  it('boucles : arrivée à 400 m au plus par défaut, fermées avec arriveeM 0', () => {
    const gen = new LoopGenerator(g);
    const req = { lat: g.lat[t], lon: g.lon[t], distanceKm: 4, terrain: 'mixte' as const, seed: 3 };
    for (const l of gen.generate(req).loops) verifierBoucle(g, l, 400);
    for (const l of gen.generate({ ...req, arriveeM: 0 }).loops) verifierBoucle(g, l, 0);
  });
});

describe('types de séance', () => {
  const g = grille(30, 100);
  const req = { lat: g.lat[15 * 30 + 15], lon: g.lon[15 * 30 + 15], distanceKm: 4, terrain: 'mixte' as const, seed: 5 };
  // Ordre des boucles compris : la n°1 doit être la même.
  const ensembles = (r: ReturnType<LoopGenerator['generate']>) => r.loops.map((l) => [...l.edges].sort((a, b) => a - b).join(','));

  it('sans séance, aucune mesure de séance ; footing et sortie longue : mêmes boucles que sans séance', () => {
    const sans = new LoopGenerator(g).generate(req);
    expect(sans.loops.every((l) => l.seance === undefined)).toBe(true);
    const footing = new LoopGenerator(g).generate({ ...req, seance: { type: 'footing' } });
    expect(ensembles(footing)).toEqual(ensembles(sans));
    const longue = new LoopGenerator(g).generate({ ...req, seance: { type: 'sortie-longue' } });
    expect(ensembles(longue)).toEqual(ensembles(sans));
  });

  it('chaque séance donne des boucles valides, avec leurs mesures', () => {
    for (const type of ['fractionne', 'seuil', 'cotes', 'recuperation'] as const) {
      const r = new LoopGenerator(g).generate({ ...req, seance: { type } });
      expect(r.ok).toBe(true);
      for (const l of r.loops) {
        verifierBoucle(g, l);
        expect(l.seance).toBeDefined();
        expect(l.seance!.tronconM).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('mesures : traversées, tronçon continu et côte', () => {
    // Grille sans classe de voie : aucune rue ouverte aux voitures, donc aucune traversée.
    const l = new LoopGenerator(g).generate({ ...req, seance: { type: 'cotes' } }).loops[0];
    const m = mesurerSeance(g, l.edges, l.dirs);
    expect(m.traversees).toBe(0);
    expect(m.tronconM).toBeLessThanOrEqual(l.distanceM);
    expect(m.dplusKm).toBeCloseTo(l.dplusM / (l.distanceM / 1000), 6);
  });
});

describe('types de voie le long de la boucle', () => {
  it('segments contigus, fusionnés, couvrant toute la boucle', async () => {
    const store = chargerStore();
    const r = (await store.graphFor(45.8992, 6.1294, 8))!;
    const l = new LoopGenerator(r.graph).generate({ lat: 45.8992, lon: 6.1294, distanceKm: 8, terrain: 'mixte', seed: 7 }).loops[0];
    const v = voiesBoucle(r.graph, l.edges);
    expect(v[0].debutM).toBe(0);
    for (let i = 1; i < v.length; i++) {
      expect(v[i].debutM).toBeCloseTo(v[i - 1].finM, 6);
      expect(v[i].voie).not.toBe(v[i - 1].voie);
    }
    const total = l.edges.reduce((s, e) => s + r.graph.len[e], 0);
    expect(v[v.length - 1].finM).toBeCloseTo(total, 3);
    // Les voies sans voitures et chemins couvrent la distance sans voitures annoncée.
    const libres = v.filter((x) => x.voie !== 'route').reduce((s, x) => s + x.finM - x.debutM, 0);
    expect(libres).toBeGreaterThanOrEqual(l.sansVoitureM - 1);
  });
});

describe('toGpx', () => {
  it('produit un GPX 1.1 avec un point par coordonnée', () => {
    const g = grille();
    const r = new LoopGenerator(g).generate({ lat: 45.9, lon: 6.13, distanceKm: 3, dplusM: 60, terrain: 'mixte' });
    const loop = r.loops[0];
    const gpx = toGpx(loop, 'Essai <&>');
    expect(gpx).toMatch(/^<\?xml version="1.0"/);
    expect(gpx).toContain('xmlns="http://www.topografix.com/GPX/1/1"');
    expect(gpx).toContain('Essai &lt;&amp;&gt;');
    expect(gpx.match(/<trkpt /g)).toHaveLength(loop.coords.length);
  });
});

describe('données réelles (tuiles d\u2019Annecy)', () => {
  const store = chargerStore();

  it('recolle les tuiles : un nœud partagé n\u2019apparaît qu\u2019une fois', async () => {
    const r = (await store.graphFor(45.8992, 6.1294, 20))!;
    expect(r.tiles.length).toBeGreaterThan(1);
    const g = r.graph;
    const vus = new Set<string>();
    let doublons = 0;
    for (let i = 0; i < g.n; i++) {
      const k = `${Math.round(g.lat[i] * 1e5)},${Math.round(g.lon[i] * 1e5)}`;
      if (vus.has(k)) doublons++;
      vus.add(k);
    }
    // Quelques nœuds distincts peuvent partager une position (pont au-dessus
    // d'une route) ; un recollage raté en donnerait des milliers.
    expect(doublons / g.n).toBeLessThan(0.01);
  });

  it('le graphe ne dépend que des tuiles, pas de la recherche précédente', async () => {
    // Annecy centre puis Sévrier couvrent les mêmes tuiles à 10 km : le
    // graphe réutilisé doit être celui qu'une recherche neuve depuis Sévrier construit.
    const reutilise = chargerStore();
    await reutilise.graphFor(45.8992, 6.1294, 10);
    const a = (await reutilise.graphFor(45.864, 6.14, 10))!;
    const b = (await chargerStore().graphFor(45.864, 6.14, 10))!;
    expect(a.neuf).toBe(false);
    expect(a.graph.meta.center).toEqual(b.graph.meta.center);
    expect(a.graph.x).toEqual(b.graph.x);
    expect(a.graph.y).toEqual(b.graph.y);
  });

  it('le graphe chargé est presque entièrement connexe, altitudes plausibles', async () => {
    const g = (await store.graphFor(45.8992, 6.1294, 20))!.graph;
    const vu = new Uint8Array(g.n);
    let max = 0;
    for (let s = 0; s < g.n; s++) {
      if (vu[s]) continue;
      vu[s] = 1;
      const pile = [s];
      let n = 1;
      while (pile.length) {
        const u = pile.pop()!;
        for (let k = g.adjStart[u]; k < g.adjStart[u + 1]; k++) {
          const v = g.adjTo[k];
          if (!vu[v]) {
            vu[v] = 1;
            n++;
            pile.push(v);
          }
        }
      }
      max = Math.max(max, n);
    }
    // Le bord des tuiles chargées peut isoler quelques morceaux de réseau.
    expect(max / g.n).toBeGreaterThan(0.97);
    const z = [...g.ele];
    expect(Math.min(...z)).toBeGreaterThan(250);
    expect(Math.max(...z)).toBeLessThan(2500);
  });

  it('trouve une boucle de 10 km / 300 m depuis Annecy', async () => {
    const g = (await store.graphFor(45.8992, 6.1294, 10))!.graph;
    const r = new LoopGenerator(g).generate({ lat: 45.8992, lon: 6.1294, distanceKm: 10, dplusM: 300, terrain: 'mixte' });
    expect(r.ok).toBe(true);
    for (const l of r.loops) verifierBoucle(g, l);
  });

  it('séance de fractionné : traversées comptées sur le vrai réseau, tronçon continu mesuré', async () => {
    const depart = { lat: 45.9010, lon: 6.1300, distanceKm: 6, terrain: 'mixte' as const, seed: 7 };
    const g = (await store.graphFor(depart.lat, depart.lon, depart.distanceKm))!.graph;
    const gen = new LoopGenerator(g);
    const sans = gen.generate(depart).loops[0];
    const avec = gen.generate({ ...depart, seance: { type: 'fractionne' } });
    expect(avec.ok).toBe(true);
    for (const l of avec.loops) verifierBoucle(g, l);
    expect(mesurerSeance(g, sans.edges, sans.dirs).traversees).toBeGreaterThan(0);
    expect(avec.loops[0].seance!.resume).toMatch(/tronçon continu/);
  });

  it('tour de parc : plus de distance dans les parcs, boucles valides', async () => {
    const depart = { lat: 45.9010, lon: 6.1300, distanceKm: 6, terrain: 'mixte' as const, seed: 7 };
    const g = (await store.graphFor(depart.lat, depart.lon, depart.distanceKm))!.graph;
    const gen = new LoopGenerator(g);
    const part = (r: ReturnType<LoopGenerator['generate']>) => r.loops.reduce((s, l) => s + l.parcM / l.distanceM, 0) / r.loops.length;
    const sans = gen.generate({ ...depart, tourParc: 'exclu' });
    const avec = gen.generate({ ...depart, tourParc: 'impose' });
    expect(avec.ok).toBe(true);
    for (const l of avec.loops) verifierBoucle(g, l);
    expect(part(avec)).toBeGreaterThan(part(sans));
  });

  it('hors des régions : pas de graphe', async () => {
    expect(await store.graphFor(45.764, 4.8357, 10)).toBeNull();
  });
});
