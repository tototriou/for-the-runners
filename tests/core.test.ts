import { describe, expect, it } from 'vitest';
import { decodeGraph, type Graph, type ZoneDoc } from '../src/core/graph';
import { LoopGenerator, type Loop } from '../src/core/loops';
import { toGpx } from '../src/core/gpx';
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
function verifierBoucle(g: Graph, loop: Loop) {
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
  expect(noeud).toBe(depart);
  expect(loop.distanceM).toBeCloseTo(distance, 6);
  expect(loop.dplusM).toBeCloseTo(dplus, 6);
  expect(loop.coords[0]).toEqual(loop.coords[loop.coords.length - 1]);
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

  it('hors des régions : pas de graphe', async () => {
    expect(await store.graphFor(45.764, 4.8357, 10)).toBeNull();
  });
});
