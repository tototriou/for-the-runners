import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './style.css';
import { toGpx } from './core/gpx';
import type { Loop, LoopResponse } from './core/loops';
import type { Terrain, ZoneDoc } from './core/graph';

const COULEURS = ['#2563eb', '#dc2626', '#9333ea', '#ea580c', '#0891b2'];
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
    const meta = msg.info.meta as ZoneDoc['meta'];
    const [lat, lon] = meta.center;
    map.setView([lat, lon], 12);
    L.circle([lat, lon], { radius: meta.radiusKm * 1000, color: '#57534e', weight: 1, fill: false, dashArray: '4 6', interactive: false }).addTo(map);
    placerDepart(L.latLng(lat, lon));
    $('zone-info').textContent = `Zone : ${meta.zone}, ${meta.radiusKm} km autour du centre`;
    $('credits').innerHTML =
      `Réseau : ${meta.reseau}.<br>Altitude : ${meta.mnt}.<br>Fond : © contributeurs OpenStreetMap.`;
    go.disabled = false;
    setStatus('');
  } else if (msg.type === 'result') {
    if (msg.id !== idReq) return; // réponse d'une demande remplacée
    afficher(msg.res as LoopResponse);
    go.disabled = false;
  } else if (msg.type === 'error') {
    setStatus(msg.message, true);
    go.disabled = false;
  }
};

const dataUrl = new URL(`${import.meta.env.BASE_URL}data/zone.json.gz`, location.href).href;
worker.postMessage({ type: 'load', url: dataUrl });
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

function afficher(res: LoopResponse) {
  calques.clearLayers();
  results.replaceChildren();
  lignes = [];
  boucles = res.loops;
  profileBox.hidden = true;
  setStatus(`${res.message} (${(res.stats.ms / 1000).toFixed(1)} s)`, !res.ok);
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
  map.fitBounds(L.featureGroup(lignes).getBounds(), { padding: [20, 20] });
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
