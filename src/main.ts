import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './style.css';
import { toGpx } from './core/gpx';
import type { Loop, LoopResponse } from './core/loops';
import type { Terrain } from './core/graph';
import type { Manifest, RegionMeta } from './core/tiles';

type Reponse = LoopResponse & { chargement?: { region: string; tuiles: number; ms: number } };

// Pas d'orange : réservé au départ décalé.
const COULEURS = ['#2563eb', '#dc2626', '#9333ea', '#a16207', '#0891b2'];
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const form = $<HTMLFormElement>('form');
const go = $<HTMLButtonElement>('go');
const statusEl = $<HTMLParagraphElement>('status');
const results = $<HTMLOListElement>('results');
const profileBox = $<HTMLElement>('profile-box');
const profile = $<HTMLElement>('profile') as unknown as SVGSVGElement;

const map = L.map('map', { zoomControl: true });
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let depart: L.LatLng | null = null;
// Cercle plutôt que L.marker : l'icône par défaut de Leaflet pointe vers des
// images que le bundler ne résout pas.
const marqueur = L.circleMarker([0, 0], { radius: 8, color: '#ffffff', weight: 3, fillColor: '#15803d', fillOpacity: 1 });
const calques = L.layerGroup().addTo(map);
let lignes: L.Polyline[] = [];
let boucles: Loop[] = [];

const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
let idReq = 0;

function setStatus(texte: string, warn = false) {
  statusEl.textContent = texte;
  statusEl.className = warn ? 'warn' : '';
}

function placerDepart(ll: L.LatLng) {
  depart = ll;
  marqueur.setLatLng(ll).addTo(map);
}

map.on('click', (e: L.LeafletMouseEvent) => placerDepart(e.latlng));

worker.onmessage = (ev: MessageEvent) => {
  const msg = ev.data;
  if (msg.type === 'loaded') {
    regions = (msg.manifest as Manifest).regions;
    for (const r of regions) {
      const [x0, y0, x1, y1] = r.bbox;
      L.rectangle([[y0, x0], [y1, x1]], { color: '#57534e', weight: 1, fill: false, dashArray: '4 6', interactive: false }).addTo(map);
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = r.name;
      selectRegion.appendChild(opt);
    }
    choisirRegion(regions[0].id);
    departDepuisAdresse();
    $('zone-info').textContent = `Régions couvertes : ${regions.map((r) => r.name).join(', ')}`;
    $('credits').innerHTML =
      `Réseau : ${regions[0].reseau}.<br>Altitude : ${regions[0].mnt}.<br>Fond : © contributeurs OpenStreetMap.`;
    go.disabled = false;
    setStatus('');
  } else if (msg.type === 'result') {
    if (msg.id !== idReq) return; // réponse d'une demande remplacée
    afficher(msg.res as Reponse);
    go.disabled = false;
  } else if (msg.type === 'error') {
    setStatus(msg.message, true);
    go.disabled = false;
  }
};

const base = new URL(`${import.meta.env.BASE_URL}data/`, location.href).href;
worker.postMessage({ type: 'load', base });

let regions: RegionMeta[] = [];
const selectRegion = $<HTMLSelectElement>('region');
selectRegion.addEventListener('change', () => choisirRegion(selectRegion.value));

/** `?depart=lat,lon` : départ posé à l'ouverture (lien partagé). */
function departDepuisAdresse() {
  const v = new URLSearchParams(location.search).get('depart');
  const [lat, lon] = (v ?? '').split(',').map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
  const r = regions.find(({ bbox: [x0, y0, x1, y1] }) => lon >= x0 && lon <= x1 && lat >= y0 && lat <= y1);
  if (r) selectRegion.value = r.id;
  map.setView([lat, lon], 13);
  placerDepart(L.latLng(lat, lon));
}

function choisirRegion(id: string) {
  const r = regions.find((x) => x.id === id);
  if (!r) return;
  selectRegion.value = id;
  const [x0, y0, x1, y1] = r.bbox;
  map.fitBounds([[y0, x0], [y1, x1]]);
  placerDepart(L.latLng(r.center[0], r.center[1]));
}
setStatus('Chargement du réseau de chemins…');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!depart) return;
  const distanceKm = Number($<HTMLInputElement>('distance').value);
  const dplusM = Number($<HTMLInputElement>('dplus').value);
  const terrain = $<HTMLSelectElement>('terrain').value as Terrain;
  go.disabled = true;
  setStatus('Calcul des boucles…');
  worker.postMessage({
    type: 'generate',
    id: ++idReq,
    req: { lat: depart.lat, lon: depart.lng, distanceKm, dplusM, terrain },
  });
});

function pct(x: number) {
  return `${x >= 0 ? '+' : '−'}${Math.abs(x * 100).toFixed(0)} %`;
}

function afficher(res: Reponse) {
  calques.clearLayers();
  results.replaceChildren();
  lignes = [];
  boucles = res.loops;
  profileBox.hidden = true;
  const ch = res.chargement;
  const duree = ((res.stats.ms + (ch?.ms ?? 0)) / 1000).toFixed(1);
  setStatus(`${res.message} (${duree} s${ch ? `, ${ch.tuiles} tuile${ch.tuiles > 1 ? 's' : ''}` : ''})`, !res.ok);
  if (res.loops.length === 0) return;

  res.loops.forEach((loop, i) => {
    const couleur = COULEURS[i % COULEURS.length];
    const ligne = L.polyline(
      loop.coords.map(([la, lo]) => [la, lo] as [number, number]),
      { color: couleur, weight: 4, opacity: 0.55 },
    ).addTo(calques);
    ligne.on('click', () => selectionner(i));
    lignes.push(ligne);

    const li = document.createElement('li');
    li.className = 'loop';
    li.setAttribute('role', 'option');
    li.innerHTML = `
      <span class="swatch" style="background:${couleur}"></span>
      <span class="main">${(loop.distanceM / 1000).toFixed(1)} km · ${Math.round(loop.dplusM)} m D+</span>
      <span class="gaps">
        <span class="${Math.abs(loop.ecartDistance) <= 0.05 ? 'ok' : 'ko'}">dist. ${pct(loop.ecartDistance)}</span> ·
        <span class="${Math.abs(loop.ecartDplus) <= 0.15 ? 'ok' : 'ko'}">D+ ${pct(loop.ecartDplus)}</span> ·
        aller-retour ${(loop.allerRetour * 100).toFixed(0)} %
      </span>`;
    const bouton = document.createElement('button');
    bouton.className = 'gpx';
    bouton.type = 'button';
    bouton.textContent = 'GPX';
    bouton.addEventListener('click', (e) => {
      e.stopPropagation();
      telecharger(loop, i);
    });
    li.appendChild(bouton);
    li.addEventListener('click', () => selectionner(i));
    results.appendChild(li);
  });
  const cadre = L.featureGroup(lignes);
  if (res.depart && depart) {
    // Départ déplacé faute de boucle depuis le point demandé : le relier au
    // point demandé pour que le coureur voie où aller.
    const nouveau = L.latLng(res.depart.lat, res.depart.lon);
    L.polyline([depart, nouveau], { color: '#ea580c', weight: 2, dashArray: '6 6', interactive: false }).addTo(calques).addTo(cadre);
    L.circleMarker(nouveau, { radius: 8, color: '#ffffff', weight: 3, fillColor: '#ea580c', fillOpacity: 1 })
      .bindTooltip(`Départ décalé de ${(res.depart.decalageM / 1000).toFixed(1).replace('.', ',')} km`)
      .addTo(calques).addTo(cadre);
  }
  map.fitBounds(cadre.getBounds(), { padding: [20, 20] });
  selectionner(0);
}

function selectionner(i: number) {
  lignes.forEach((l, k) => l.setStyle({ opacity: k === i ? 0.95 : 0.35, weight: k === i ? 5 : 3 }));
  lignes[i].bringToFront();
  [...results.children].forEach((li, k) => li.setAttribute('aria-selected', String(k === i)));
  dessinerProfil(boucles[i]);
}

function dessinerProfil(loop: Loop) {
  const W = 320;
  const H = 120;
  const z = loop.coords.map((c) => c[2]);
  const zmin = Math.min(...z);
  const zmax = Math.max(...z);
  const dz = Math.max(zmax - zmin, 20);
  const D = loop.cumul[loop.cumul.length - 1] || 1;
  const pts = loop.cumul.map((d, k) => `${((d / D) * W).toFixed(1)},${(H - 6 - ((z[k] - zmin) / dz) * (H - 16)).toFixed(1)}`);
  profile.innerHTML =
    `<polygon class="area" points="0,${H} ${pts.join(' ')} ${W},${H}"/>` +
    `<polyline class="lineP" points="${pts.join(' ')}"/>`;
  $('profile-legend').textContent =
    `${(D / 1000).toFixed(1)} km · altitude ${Math.round(zmin)} à ${Math.round(zmax)} m`;
  profileBox.hidden = false;
}

function telecharger(loop: Loop, i: number) {
  const nom = `Boucle D+ ${(loop.distanceM / 1000).toFixed(1)} km ${Math.round(loop.dplusM)} m (${i + 1})`;
  const blob = new Blob([toGpx(loop, nom)], { type: 'application/gpx+xml' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `boucle-${(loop.distanceM / 1000).toFixed(1)}km-${Math.round(loop.dplusM)}m-${i + 1}.gpx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
