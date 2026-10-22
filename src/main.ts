import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './style.css';
import { toGpx } from './core/gpx';
import type { LoopResponse } from './core/loops';
import { TOL_DPLUS } from './core/regles';
import { TRONCON_DEFAUT_M, TYPES_SEANCE, type Seance, type TypeSeance } from './core/seances';
import type { Terrain } from './core/graph';
import type { Manifest, RegionMeta } from './core/tiles';
import type { BoucleAffichee, SegmentVoie } from './core/voies';
import type { Zone, ZoneRequest } from './core/zone';

type Reponse = Omit<LoopResponse, 'loops'> & { loops: BoucleAffichee[]; chargement?: { region: string; tuiles: number; ms: number } };

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const app = $('app');
const panel = $('panel');
const form = $<HTMLFormElement>('form');
const go = $<HTMLButtonElement>('go');
const statusEl = $('status');
const statusTexte = $('status-texte');
const results = $<HTMLOListElement>('results');
const points = $('points');
const essayer = $<HTMLButtonElement>('essayer');
const profilBox = $('profil-box');
const distanceInput = $<HTMLInputElement>('distance');
const dplusInput = $<HTMLInputElement>('dplus');
const rayonInput = $<HTMLInputElement>('rayon');
const boutonDessiner = $<HTMLButtonElement>('dessiner');
const allersRetours = $<HTMLInputElement>('allers-retours');
const troncon = $<HTMLInputElement>('troncon');
const hint = $('hint');
const consigne = $('consigne');
const ordinateur = window.matchMedia('(min-width: 900px)');

const couleur = (nom: string) => getComputedStyle(document.documentElement).getPropertyValue(nom).trim();
const km = (m: number) => (m / 1000).toFixed(1).replace('.', ',');
/** Écart signé en mètres, arrondi à 10 m : « +120 m », « −40 m ». */
const metres = (m: number) => `${m >= 0 ? '+' : '−'}${Math.round(Math.abs(m) / 10) * 10} m`;
const pct = (x: number) => `${x >= 0 ? '+' : '−'}${Math.abs(x * 100).toFixed(0)} %`;
const valeurRadio = (nom: string) => (form.querySelector<HTMLInputElement>(`input[name="${nom}"]:checked`)?.value ?? '');

/* ---------- Réglages ---------- */

// Séances proposées : la sortie longue et la récupération restent dans le
// moteur mais ne sont plus montrées (footing = boucle libre).
const SEANCES_PROPOSEES: TypeSeance[] = ['footing', 'fractionne', 'seuil', 'cotes'];
let seance: TypeSeance = 'footing';
const zoneSeances = $('seances');
for (const id of SEANCES_PROPOSEES) {
  const t = TYPES_SEANCE.find((x) => x.id === id)!;
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'puce seance';
  b.setAttribute('role', 'radio');
  b.dataset.seance = id;
  b.textContent = t.libelle;
  b.addEventListener('click', () => { seance = id; majSeance(); });
  zoneSeances.appendChild(b);
}
/** Séance choisie, en plus du calcul par défaut (null : boucle libre). */
function seanceChoisie(): Seance | null {
  if (seance === 'footing') return null;
  const v = Number(troncon.value);
  return TRONCON_DEFAUT_M[seance] != null && v > 0 ? { type: seance, tronconM: v } : { type: seance };
}
function majSeance() {
  for (const b of zoneSeances.querySelectorAll<HTMLElement>('.puce')) b.setAttribute('aria-checked', String(b.dataset.seance === seance));
  const avecTroncon = TRONCON_DEFAUT_M[seance] != null;
  $('troncon-label').hidden = !avecTroncon;
  if (avecTroncon) troncon.value = String(TRONCON_DEFAUT_M[seance]);
  $('seance-aide').textContent = TYPES_SEANCE.find((t) => t.id === seance)?.aide ?? '';
}
majSeance();

// Boutons − / + et valeurs toutes prêtes de la distance et du D+.
form.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-pas], [data-valeur]');
  if (!el) return;
  if (el.dataset.pas) {
    const [id, pas] = el.dataset.pas.split(':');
    const input = $<HTMLInputElement>(id);
    const v = Math.min(Number(input.max), Math.max(Number(input.min), (Number(input.value) || 0) + Number(pas)));
    input.value = String(Math.round(v * 10) / 10);
  } else {
    const cible = el.closest<HTMLElement>('[data-cible]')!.dataset.cible!;
    $<HTMLInputElement>(cible).value = el.dataset.valeur!;
  }
  majPuces();
});
function majPuces() {
  for (const groupe of form.querySelectorAll<HTMLElement>('[data-cible]')) {
    const v = Number($<HTMLInputElement>(groupe.dataset.cible!).value);
    for (const b of groupe.querySelectorAll<HTMLElement>('.puce')) b.setAttribute('aria-pressed', String(Number(b.dataset.valeur) === v));
  }
}
distanceInput.addEventListener('input', majPuces);
dplusInput.addEventListener('input', majPuces);
majPuces();
const dplusVise = () => valeurRadio('dplus-mode') === 'vise';
function majDplus() { $('dplus-bloc').hidden = !dplusVise(); }
form.querySelectorAll('input[name="dplus-mode"]').forEach((r) => r.addEventListener('change', majDplus));
majDplus();

/* ---------- Carte ---------- */

const map = L.map('map', { zoomControl: true });
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let depart: L.LatLng | null = null;
// Cercle plutôt que L.marker : l'icône par défaut de Leaflet pointe vers des
// images que le bundler ne résout pas.
const marqueur = L.circleMarker([0, 0], { radius: 9, color: '#ffffff', weight: 3, fillColor: couleur('--vert'), fillOpacity: 1 });
const arrivee = L.circleMarker([0, 0], { radius: 6, color: couleur('--vert'), weight: 3, fillColor: '#ffffff', fillOpacity: 1, interactive: false })
  .bindTooltip('Arrivée');
const curseurCarte = L.circleMarker([0, 0], { radius: 6, color: couleur('--encre'), weight: 2, fillColor: '#ffffff', fillOpacity: 1, interactive: false });
const calques = L.layerGroup().addTo(map);
// Zone choisie, à part : elle reste affichée entre deux calculs.
const calqueZone = L.layerGroup().addTo(map);
let dessin = false;
// D+ laissé libre : boucle de la distance demandée, D+ libre.
let dernierLibre = false;
let pointsZone: L.LatLng[] = [];
let lignes: L.Polyline[] = [];
let boucles: BoucleAffichee[] = [];
let choisie = 0;

const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
let idReq = 0;

$('status-fermer').addEventListener('click', () => setStatus(''));
/** Message au-dessus du panneau ; une alerte se ferme par sa croix. */
function setStatus(texte: string, alerte = false) {
  statusTexte.textContent = texte;
  statusEl.hidden = !texte;
  statusEl.classList.toggle('alerte', alerte);
}

function placerDepart(ll: L.LatLng) {
  depart = ll;
  marqueur.setLatLng(ll).addTo(map);
  hint.textContent = `${ll.lat.toFixed(4).replace('.', ',')} N · ${ll.lng.toFixed(4).replace('.', ',')} E. Touche la carte pour le déplacer.`;
  majZone();
}

// En cours de dessin, toucher la carte ajoute un sommet à la zone au lieu
// de déplacer le départ.
map.on('click', (e: L.LeafletMouseEvent) => {
  if (dessin) {
    pointsZone.push(e.latlng);
    majZone();
  } else if (app.dataset.vue === 'reglages') placerDepart(e.latlng);
});

/* ---------- Terrain et zone ---------- */

const zoneType = () => valeurRadio('zone-type');
const zoneActive = () => zoneType() !== 'aucune';

function majFormulaire() {
  $('rayon-label').hidden = zoneType() !== 'cercle';
  $('dessin-box').hidden = zoneType() !== 'polygone';
  $('allers-retours-label').hidden = !zoneActive();
  $('zone-note').hidden = !zoneActive();
  // La boucle en zone a sa propre construction : pas de type de séance.
  $('seance-box').hidden = zoneActive();
  if (zoneType() !== 'polygone') arreterDessin();
  const terrain = form.querySelector<HTMLInputElement>('input[name="terrain"]:checked')!.nextElementSibling!.textContent;
  const zone = { aucune: 'aucune zone', cercle: `cercle de ${rayonInput.value.replace('.', ',')} km`, polygone: 'zone dessinée' }[zoneType()];
  $('resume-options').textContent = `${terrain} · ${zone}`;
  majZone();
}

function arreterDessin() {
  const enCours = dessin;
  dessin = false;
  boutonDessiner.setAttribute('aria-pressed', 'false');
  boutonDessiner.textContent = pointsZone.length ? 'Redessiner' : 'Dessiner la zone';
  consigne.hidden = true;
  if (enCours && !ordinateur.matches) setEtat('moyen');
}

function majZone() {
  calqueZone.clearLayers();
  const style = { color: couleur('--vert'), weight: 2, dashArray: '6 6', fillOpacity: 0.08, interactive: false };
  if (zoneType() === 'cercle') {
    if (depart) L.circle(depart, { ...style, radius: Number(rayonInput.value) * 1000 }).addTo(calqueZone);
  } else if (zoneType() === 'polygone' && pointsZone.length >= 2) {
    L.polygon(pointsZone, style).addTo(calqueZone);
  }
  for (const p of dessin ? pointsZone : []) {
    L.circleMarker(p, { radius: 6, color: couleur('--vert'), weight: 3, fillColor: '#ffffff', fillOpacity: 1, interactive: false }).addTo(calqueZone);
  }
}

form.querySelectorAll('input[name="zone-type"], input[name="terrain"]').forEach((r) => r.addEventListener('change', majFormulaire));
rayonInput.addEventListener('input', majFormulaire);
boutonDessiner.addEventListener('click', () => {
  if (dessin) return arreterDessin();
  dessin = true;
  pointsZone = [];
  // Les boucles précédentes sont cliquables et intercepteraient les touches.
  effacerBoucles();
  boutonDessiner.setAttribute('aria-pressed', 'true');
  boutonDessiner.textContent = 'Terminer le dessin';
  consigne.textContent = 'Touche la carte pour ajouter les coins de la zone, puis « Terminer le dessin ».';
  consigne.hidden = false;
  // Téléphone : panneau réduit aux boutons du dessin, la carte libre au-dessus.
  if (!ordinateur.matches) {
    setEtat('reduit', 118);
    requestAnimationFrame(() => { panel.scrollTop = $('dessin-box').offsetTop - 30; });
  }
  majZone();
});
$<HTMLButtonElement>('effacer').addEventListener('click', () => {
  pointsZone = [];
  majZone();
  if (!dessin) arreterDessin();
});
majFormulaire();

/* ---------- Vues du panneau ---------- */

type Vue = 'reglages' | 'boucles' | 'detail';
function setVue(v: Vue) {
  app.dataset.vue = v;
  for (const id of ['reglages', 'boucles', 'detail'] as const) $(`vue-${id}`).hidden = id !== v;
  panel.scrollTop = 0;
  if (!ordinateur.matches) setEtat('moyen');
  placerProfil();
  profilBox.hidden = v !== 'detail';
  // Le message du calcul concerne la liste, pas une boucle ouverte.
  if (v === 'detail') statusEl.hidden = true;
  else statusEl.hidden = !statusTexte.textContent;
  if (v !== 'detail') curseurCarte.remove();
  // La carte change de taille quand le profil apparaît sous elle.
  requestAnimationFrame(() => map.invalidateSize());
}
/** Profil sous la carte sur ordinateur, dans le détail sur téléphone. */
function placerProfil() {
  const cible = ordinateur.matches ? app : $('profil-mobile');
  if (profilBox.parentElement !== cible) cible.appendChild(profilBox);
}
ordinateur.addEventListener('change', () => {
  placerProfil();
  if (app.dataset.vue === 'detail') dessinerProfil(boucles[choisie]);
  requestAnimationFrame(() => map.invalidateSize());
});
/* ---------- Panneau du bas (téléphone) ----------
   Trois hauteurs : réduit (la poignée et le titre), moyen (la carte visible
   au-dessus), plein. On le fait glisser par la poignée ; un toucher bascule
   entre réduit et moyen. */
type Etat = 'reduit' | 'moyen' | 'plein';
const ETATS: Etat[] = ['reduit', 'moyen', 'plein'];
function hauteurEtat(e: Etat): number {
  const H = app.clientHeight;
  if (e === 'reduit') return 92;
  if (e === 'plein') return H - 64;
  return Math.round(H * (app.dataset.vue === 'detail' ? 0.5 : 0.64));
}
function setEtat(e: Etat, px = hauteurEtat(e)) {
  panel.dataset.etat = e;
  panel.style.setProperty('--h', `${px}px`);
  if (e === 'reduit') panel.scrollTop = 0;
}
const basculer = () => setEtat(panel.dataset.etat === 'reduit' ? 'moyen' : 'reduit');
const poignee = $('poignee');
let glisse: { y: number; h: number; bouge: boolean } | null = null;
poignee.addEventListener('pointerdown', (e) => {
  glisse = { y: e.clientY, h: panel.getBoundingClientRect().height, bouge: false };
  poignee.setPointerCapture(e.pointerId);
  panel.classList.add('glisse');
});
poignee.addEventListener('pointermove', (e) => {
  if (!glisse) return;
  const dy = e.clientY - glisse.y;
  if (Math.abs(dy) > 6) glisse.bouge = true;
  const h = Math.min(hauteurEtat('plein'), Math.max(hauteurEtat('reduit'), glisse.h - dy));
  panel.style.setProperty('--h', `${h}px`);
});
const lacher = () => {
  if (!glisse) return;
  panel.classList.remove('glisse');
  if (!glisse.bouge) basculer();
  else {
    const h = panel.getBoundingClientRect().height;
    setEtat(ETATS.reduce((a, b) => (Math.abs(hauteurEtat(b) - h) < Math.abs(hauteurEtat(a) - h) ? b : a)));
  }
  glisse = null;
};
poignee.addEventListener('pointerup', lacher);
poignee.addEventListener('pointercancel', lacher);
// Clavier (Entrée, Espace) : pas d'événement de pointeur.
poignee.addEventListener('click', (e) => { if (e.detail === 0) basculer(); });
if (!ordinateur.matches) setEtat('moyen');
$('retour-reglages').addEventListener('click', () => setVue('reglages'));
$('retour-boucles').addEventListener('click', () => { setVue('boucles'); selectionner(choisie); cadrer(); });

/* ---------- Données ---------- */

worker.onmessage = (ev: MessageEvent) => {
  const msg = ev.data;
  if (msg.type === 'loaded') {
    regions = (msg.manifest as Manifest).regions;
    for (const r of regions) {
      const [x0, y0, x1, y1] = r.bbox;
      L.rectangle([[y0, x0], [y1, x1]], { color: couleur('--gris'), weight: 1, fill: false, dashArray: '4 6', interactive: false }).addTo(map);
      selectRegion.add(new Option(r.name, r.id));
    }
    choisirRegion(regions[0].id);
    // Un lien ?depart= l'emporte ; sinon, la position du coureur.
    if (!departDepuisAdresse()) allerAMaPosition(false);
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
    results.replaceChildren();
    go.disabled = false;
  }
};

const base = new URL(`${import.meta.env.BASE_URL}data/`, location.href).href;
worker.postMessage({ type: 'load', base });

let regions: RegionMeta[] = [];
const selectRegion = $<HTMLSelectElement>('region');
selectRegion.addEventListener('change', () => choisirRegion(selectRegion.value));

const regionDe = (lat: number, lon: number) =>
  regions.find(({ bbox: [x0, y0, x1, y1] }) => lon >= x0 && lon <= x1 && lat >= y0 && lat <= y1);

/** `?depart=lat,lon` : départ posé à l'ouverture (lien partagé). Vrai si appliqué. */
function departDepuisAdresse(): boolean {
  const v = new URLSearchParams(location.search).get('depart');
  const [lat, lon] = (v ?? '').split(',').map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
  const r = regionDe(lat, lon);
  if (r) selectRegion.value = r.id;
  map.setView([lat, lon], 14);
  placerDepart(L.latLng(lat, lon));
  return true;
}

/**
 * Départ à la position du coureur, si le navigateur la donne et qu'elle est
 * dans une région couverte ; sinon le départ par défaut reste. `demande` :
 * clic sur « Ma position » (on signale alors un refus ou une erreur).
 */
function allerAMaPosition(demande: boolean) {
  if (!('geolocation' in navigator)) {
    if (demande) setStatus('Ce navigateur ne donne pas la position.', true);
    return;
  }
  if (demande) setStatus('Recherche de ta position…');
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const { latitude: lat, longitude: lon } = coords;
      const r = regionDe(lat, lon);
      if (!r) {
        const noms = regions.map((x) => x.name).join(', ');
        setStatus(`Ta position est hors des régions couvertes (${noms}) : choisis un départ sur la carte.`, true);
        return;
      }
      selectRegion.value = r.id;
      map.setView([lat, lon], 14);
      placerDepart(L.latLng(lat, lon));
      setStatus('');
    },
    () => {
      if (demande) setStatus('Position indisponible : autorise la localisation pour ce site, ou touche la carte.', true);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
  );
}
$<HTMLButtonElement>('ma-position').addEventListener('click', () => {
  if (app.dataset.vue !== 'reglages') setVue('reglages');
  allerAMaPosition(true);
});

function choisirRegion(id: string) {
  const r = regions.find((x) => x.id === id);
  if (!r) return;
  selectRegion.value = id;
  const [x0, y0, x1, y1] = r.bbox;
  map.fitBounds([[y0, x0], [y1, x1]]);
  placerDepart(L.latLng(r.center[0], r.center[1]));
}
setStatus('Chargement du réseau de chemins…');

/* ---------- Calcul ---------- */

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!depart || go.disabled) return;
  const distanceKm = Number(distanceInput.value);
  if (!(distanceKm > 0)) return setStatus('Choisis une distance.', true);
  const dplusM = dplusVise() && dplusInput.value.trim() !== '' ? Number(dplusInput.value) : undefined;
  dernierLibre = dplusM === undefined;
  const terrain = valeurRadio('terrain') as Terrain;
  const s = zoneActive() ? null : seanceChoisie();
  $('resume-demande').textContent = `${zoneActive() ? 'Zone' : TYPES_SEANCE.find((t) => t.id === seance)!.libelle} · ${km(distanceKm * 1000).replace(',0', '')} km`;
  $('resume-detail').textContent = dplusM === undefined ? 'D+ libre' : `${dplusM} m de D+ visés`;
  let message: Record<string, unknown>;
  if (zoneActive()) {
    let zone: Zone;
    if (zoneType() === 'cercle') {
      zone = { kind: 'cercle', rayonM: Number(rayonInput.value) * 1000 };
    } else {
      if (pointsZone.length < 3) {
        $<HTMLDetailsElement>('options').open = true;
        return setStatus('Dessine d’abord la zone : au moins 3 points sur la carte.', true);
      }
      arreterDessin();
      zone = { kind: 'polygone', points: pointsZone.map((p) => [p.lat, p.lng]) };
    }
    const req: ZoneRequest = {
      lat: depart.lat, lon: depart.lng, distanceKm, dplusM, terrain, zone, allersRetours: allersRetours.checked,
    };
    message = { type: 'generateZone', id: ++idReq, req };
  } else {
    message = { type: 'generate', id: ++idReq, req: { lat: depart.lat, lon: depart.lng, distanceKm, dplusM, terrain, ...(s ? { seance: s } : {}) } };
  }
  go.disabled = true;
  essayer.hidden = true;
  effacerBoucles();
  setVue('boucles');
  setStatus(zoneActive() ? 'Calcul des boucles dans la zone…' : 'Calcul des boucles…');
  const sq = document.createElement('li');
  sq.className = 'boucle squelette';
  sq.setAttribute('aria-hidden', 'true');
  sq.innerHTML = '<i style="width:40%"></i><i></i><i style="height:44px"></i><i style="width:70%"></i>';
  results.replaceChildren(sq);
  worker.postMessage(message);
});

/* ---------- Boucles proposées ---------- */

const ICONES: Record<string, string> = {
  fractionne: '<path d="M3 19h18"/><path d="M6 19V11M10 19V6M14 19V11M18 19V6"/>',
  seuil: '<path d="M3 16h18"/><path d="M14 10l4 6"/><path d="M3 8h8"/>',
  cotes: '<path d="M3 19l6-9 4 5 3-4 5 8z"/>',
  gpx: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
};
const icone = (nom: string) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONES[nom] ?? ''}</svg>`;
const part = (m: number, l: BoucleAffichee) => Math.round((m / l.distanceM) * 100);
const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function effacerBoucles() {
  calques.clearLayers();
  arrivee.remove();
  curseurCarte.remove();
  lignes = [];
  boucles = [];
  results.replaceChildren();
  points.replaceChildren();
}

/** Étiquettes d'une boucle, dans l'ordre d'importance. */
function etiquettes(l: BoucleAffichee, avecParts = true): string {
  const t: string[] = [];
  if (avecParts && l.eauM >= 0.05 * l.distanceM) t.push(`<span class="tag eau">${part(l.eauM, l)} % au bord de l'eau</span>`);
  if (avecParts && l.parcM >= 0.05 * l.distanceM) t.push(`<span class="tag parc">${part(l.parcM, l)} % dans les parcs</span>`);
  if (l.itinM >= 0.05 * l.distanceM) t.push(`<span class="tag parc">${part(l.itinM, l)} % sur sentier balisé</span>`);
  if (l.partZone != null) t.push(`<span class="tag">${Math.round(l.partZone * 100)} % dans la zone</span>`);
  if (l.ecartArriveeM >= 50) t.push(`<span class="tag">Arrivée à ${Math.round(l.ecartArriveeM / 10) * 10} m</span>`);
  t.push(`<span class="tag ${l.distanceOk ? '' : 'alerte'}">Distance ${metres(l.distanceM - l.distanceM / (1 + l.ecartDistance))}</span>`);
  if (l.allerRetour >= 0.01) t.push(`<span class="tag">Aller-retour ${(l.allerRetour * 100).toFixed(0)} %</span>`);
  if (l.rapideM >= 200) t.push(`<span class="tag alerte">${km(l.rapideM)} km le long d'une voie rapide</span>`);
  if (l.grandesRoutesM >= 100) t.push(`<span class="tag ${l.grandesRoutesM >= 1000 ? 'alerte' : ''}">${km(l.grandesRoutesM)} km sur grande route</span>`);
  return `<div class="etiquettes">${t.join('')}</div>`;
}

function chiffres(l: BoucleAffichee, classe = ''): string {
  const ecartDplus = !dernierLibre && Math.abs(l.ecartDplus) > TOL_DPLUS;
  return `<div class="chiffres ${classe}">
    <div class="chiffre"><b>${km(l.distanceM)}<small> km</small></b><span>Distance</span></div>
    <div class="chiffre ${ecartDplus ? 'alerte' : ''}"><b>${Math.round(l.dplusM)}<small> m</small></b><span>${dernierLibre ? 'D+' : `D+ ${pct(l.ecartDplus)}`}</span></div>
    <div class="chiffre"><b>${part(l.sansVoitureM, l)}<small> %</small></b><span>Sans voitures</span></div>
  </div>`;
}

function afficher(res: Reponse) {
  effacerBoucles();
  boucles = res.loops;
  // Alerte : demande impossible, départ décalé, ou objectif de séance manqué.
  const alerte = !res.ok || !!res.depart || /Aucun tronçon|Pas de vraie côte/.test(res.message);
  // Le résumé d'une réussite n'apporte rien : seules les alertes s'affichent.
  setStatus(alerte ? res.message : '', alerte);
  // Demande impossible : un D+ réalisable, à essayer en un clic.
  essayer.hidden = !res.suggestion;
  if (res.suggestion) {
    const dp = res.suggestion.dplusM;
    essayer.textContent = `Essayer ${dp} m de D+`;
    essayer.onclick = () => {
      form.querySelector<HTMLInputElement>('input[name="dplus-mode"][value="vise"]')!.checked = true;
      majDplus();
      dplusInput.value = String(dp);
      majPuces();
      form.requestSubmit();
    };
  }
  if (res.loops.length === 0) return;

  const n = res.loops.length;
  res.loops.forEach((loop, i) => {
    const ligne = L.polyline(loop.coords.map(([la, lo]) => [la, lo] as [number, number]), { weight: 4 }).addTo(calques);
    ligne.on('click', () => { selectionner(i); results.children[i]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' }); });
    lignes.push(ligne);

    const li = document.createElement('li');
    li.className = 'boucle';
    li.setAttribute('aria-selected', 'false');
    li.innerHTML = `
      <div class="boucle-tete"><span class="pastille"></span>Boucle ${i + 1} sur ${n}${
        loop.seance ? `<span class="badge">${TYPES_SEANCE.find((t) => t.id === seance)!.libelle}</span>` : ''}</div>
      ${chiffres(loop)}
      ${loop.seance?.resume ? `<div class="encadre">${icone(seance)}<span><strong>${majuscule(loop.seance.resume)}</strong></span></div>` : ''}
      ${etiquettes(loop)}
      <div class="rangee">
        <button type="button" class="bouton principal voir">Voir la boucle</button>
        <button type="button" class="bouton secondaire gpx">${icone('gpx')}GPX</button>
      </div>`;
    li.querySelector('.voir')!.addEventListener('click', (e) => { e.stopPropagation(); ouvrirDetail(i); });
    li.querySelector('.gpx')!.addEventListener('click', (e) => { e.stopPropagation(); telecharger(loop, i); });
    li.addEventListener('click', () => selectionner(i));
    results.appendChild(li);
    points.appendChild(document.createElement('span'));
  });
  if (res.depart && depart) {
    // Départ déplacé faute de boucle depuis le point demandé : le relier au
    // point demandé pour que le coureur voie où aller.
    const nouveau = L.latLng(res.depart.lat, res.depart.lon);
    L.polyline([depart, nouveau], { color: couleur('--orange'), weight: 2, dashArray: '6 6', interactive: false }).addTo(calques);
    L.circleMarker(nouveau, { radius: 9, color: '#ffffff', weight: 3, fillColor: couleur('--orange'), fillOpacity: 1 })
      .bindTooltip(`Départ conseillé, à ${km(res.depart.decalageM)} km`, { permanent: true, direction: 'right' })
      .addTo(calques);
  }
  selectionner(0);
  cadrer();
  // Téléphone : la carte de boucle centrée dans le défilement devient la boucle choisie.
  const obs = new IntersectionObserver((entrees) => {
    for (const en of entrees) if (en.isIntersecting && !ordinateur.matches) selectionner([...results.children].indexOf(en.target));
  }, { root: results, threshold: 0.6 });
  for (const li of results.children) obs.observe(li);
}

/** Cadre la carte sur les boucles, sans les cacher sous le panneau du téléphone. */
function cadrer(seule = false) {
  if (!lignes.length) return;
  const cadre = L.featureGroup(seule ? [lignes[choisie]] : lignes);
  if (depart) L.marker(depart).addTo(cadre);
  const bas = ordinateur.matches ? 20
    : (app.dataset.vue === 'boucles' ? panel.offsetHeight : hauteurEtat((panel.dataset.etat as Etat) ?? 'moyen')) + 16;
  map.fitBounds(cadre.getBounds(), { paddingTopLeft: [20, 72], paddingBottomRight: [20, bas] });
}

function selectionner(i: number) {
  if (i < 0 || !boucles[i]) return;
  choisie = i;
  const vert = couleur('--vert');
  const gris = couleur('--autre-boucle');
  lignes.forEach((l, k) => l.setStyle(k === i ? { color: vert, opacity: 1, weight: 5 } : { color: gris, opacity: 0.75, weight: 3 }));
  lignes[i].bringToFront();
  [...results.children].forEach((li, k) => {
    li.setAttribute('aria-selected', String(k === i));
    li.querySelector<HTMLElement>('.pastille')?.style.setProperty('background', k === i ? vert : gris);
  });
  [...points.children].forEach((p, k) => p.classList.toggle('actif', k === i));
  // Arrivée distincte du départ : marquée sur la carte.
  arrivee.remove();
  const loop = boucles[i];
  if (loop.ecartArriveeM >= 50) {
    const [la, lo] = loop.coords[loop.coords.length - 1];
    arrivee.setLatLng([la, lo]).addTo(map);
  }
}

/* ---------- Détail ---------- */

function ouvrirDetail(i: number) {
  selectionner(i);
  const l = boucles[i];
  const s = TYPES_SEANCE.find((t) => t.id === seance)!;
  $('detail-titre').innerHTML = `<strong>${km(l.distanceM)} km · ${Math.round(l.dplusM)} m D+</strong><span class="aide">Boucle ${i + 1} sur ${boucles.length}${
    l.seance ? ` · ${s.libelle}` : ''}</span>`;
  const barre = (nom: string, m: number, c: string) =>
    `<div class="barre"><div><span>${nom}</span><strong>${part(m, l)} %</strong></div><div class="piste"><i style="width:${part(m, l)}%;background:var(${c})"></i></div></div>`;
  $('detail').innerHTML = `
    ${chiffres(l, 'trait')}
    <p class="aide">${l.ecartArriveeM >= 50 ? `Arrivée à ${Math.round(l.ecartArriveeM / 10) * 10} m du départ.` : 'Arrivée au départ.'}</p>
    ${l.seance?.resume ? `<div class="seance-detail"><span class="icone">${icone(seance)}</span><div><small>TA SÉANCE</small><b>${majuscule(l.seance.resume)}</b><p>${s.aide}</p></div></div>` : ''}
    <div class="section"><h3>Le parcours</h3>${barre("Au bord de l'eau", l.eauM, '--eau')}${barre('Dans les parcs', l.parcM, '--parc')}${etiquettes(l, false)}</div>`;
  const actions = $('detail-actions');
  actions.innerHTML = `<button type="button" class="bouton principal">${icone('gpx')}Exporter le GPX</button><button type="button" class="bouton secondaire">Autres boucles</button>`;
  actions.children[0].addEventListener('click', () => telecharger(l, i));
  actions.children[1].addEventListener('click', () => { setVue('boucles'); selectionner(choisie); cadrer(); });
  setVue('detail');
  // Dans le détail, seule la boucle ouverte reste tracée.
  lignes.forEach((ln, k) => { if (k !== i) ln.setStyle({ opacity: 0 }); });
  dessinerProfil(l);
  requestAnimationFrame(() => cadrer(true));
}

/* ---------- Profil ---------- */

const PENTES: [number, string, string][] = [
  [5, '#e4ebc9', '< 5 %'], [10, '#f2c14e', '5-10 %'], [15, '#e8863a', '10-15 %'], [Infinity, '#c23b1e', '> 15 %'],
];
const VOIES: Record<SegmentVoie['voie'], [string, string]> = {
  'sans-voitures': ['#6fae5b', 'Sans voitures'], route: ['#4b5158', 'Route'], chemin: ['#c9a66b', 'Chemin'],
};
const couleurPente = (p: number) => PENTES.find(([s]) => Math.abs(p) < s)![1];

/** Altitude à la distance d (m), par interpolation sur le tracé. */
function altitudeA(l: BoucleAffichee, d: number): [number, number] {
  const c = l.cumul;
  let lo = 0, hi = c.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (c[m] <= d) lo = m; else hi = m; }
  const t = c[hi] > c[lo] ? Math.min(1, Math.max(0, (d - c[lo]) / (c[hi] - c[lo]))) : 0;
  return [l.coords[lo][2] + (l.coords[hi][2] - l.coords[lo][2]) * t, t < 0.5 ? lo : hi];
}

function dessinerProfil(l: BoucleAffichee) {
  if (!l) return;
  const D = l.cumul[l.cumul.length - 1] || 1;
  const z = l.coords.map((c) => c[2]);
  const zmin = Math.min(...z), zmax = Math.max(...z);
  // Pente par tranche de 100 m.
  const tranches: [number, number, number][] = [];
  for (let d = 0; d < D; d += 100) {
    const f = Math.min(D, d + 100);
    tranches.push([d, f, f > d ? ((altitudeA(l, f)[0] - altitudeA(l, d)[0]) / (f - d)) * 100 : 0]);
  }
  const monte = Math.max(0, ...tranches.map((t) => t[2]));
  const descend = Math.max(0, ...tranches.map((t) => -t[2]));
  // Axe : 3 à 4 lignes, au moins 30 m de hauteur pour qu'une boucle plate
  // reste plate à l'œil.
  const etendue = Math.max(zmax - zmin, 30);
  const pas = [5, 10, 20, 25, 50, 100, 200, 250, 500].find((p) => etendue / p <= 4) ?? 1000;
  const zbas = Math.floor(zmin / pas) * pas;
  const zhaut = Math.max(Math.ceil(zmax / pas) * pas, zbas + Math.ceil(30 / pas) * pas);
  const W = Math.max(300, Math.round(profilBox.clientWidth || panel.clientWidth - 40));
  const H = ordinateur.matches ? 130 : 120, X0 = 46;
  const X = (d: number) => X0 + (d / D) * (W - X0);
  const Y = (alt: number) => H - ((alt - zbas) / (zhaut - zbas)) * (H - 8);
  const f1 = (v: number) => v.toFixed(1);
  let svg = '';
  for (let a = zbas + pas; a <= zhaut; a += pas) svg += `<line class="grille" x1="${X0}" x2="${W}" y1="${f1(Y(a))}" y2="${f1(Y(a))}"/><text x="${X0 - 6}" y="${f1(Y(a) + 4)}" text-anchor="end">${a} m</text>`;
  for (const [d0, d1, p] of tranches) {
    const pts = [[d0, altitudeA(l, d0)[0]]];
    for (let k = 0; k < l.cumul.length; k++) if (l.cumul[k] > d0 && l.cumul[k] < d1) pts.push([l.cumul[k], z[k]]);
    pts.push([d1, altitudeA(l, d1)[0]]);
    svg += `<polygon fill="${couleurPente(p)}" points="${f1(X(d0))},${H} ${pts.map(([d, a]) => `${f1(X(d))},${f1(Y(a))}`).join(' ')} ${f1(X(d1))},${H}"/>`;
  }
  svg += `<polyline class="ligne" points="${l.cumul.map((d, k) => `${f1(X(d))},${f1(Y(z[k]))}`).join(' ')}"/>`;
  const voies = l.voies ?? [];
  const echelle = voies.length ? D / voies[voies.length - 1].finM : 1;
  for (const v of voies) svg += `<rect x="${f1(X(v.debutM * echelle))}" y="${H + 8}" width="${f1(Math.max(0.6, ((v.finM - v.debutM) * echelle / D) * (W - X0)))}" height="8" fill="${VOIES[v.voie][0]}"/>`;
  const pasKm = D > 30000 ? 5 : D > 12000 ? 2 : 1;
  for (let k = 0; k * 1000 <= D; k += pasKm) svg += `<text x="${f1(X(k * 1000))}" y="${H + 32}" text-anchor="${k === 0 ? 'start' : (k + pasKm) * 1000 > D ? 'end' : 'middle'}">${k}${(k + pasKm) * 1000 > D ? ' km' : ''}</text>`;
  svg += `<line class="curseur" id="curseur" x1="0" x2="0" y1="0" y2="${H}" visibility="hidden"/><circle id="curseur-point" r="4.5" fill="#ffffff" stroke="currentColor" stroke-width="2" visibility="hidden"/>`;

  const stat = (nom: string, v: string) => `<span class="stat"><em>${nom}</em> <strong>${v}</strong></span>`;
  const stats = [stat('Montée', `${Math.round(l.dplusM)} m`), stat('Point haut', `${Math.round(zmax)} m`), stat('Point bas', `${Math.round(zmin)} m`),
    stat('Plus raide ↑', `${Math.round(monte)} %`), stat('Plus raide ↓', `${Math.round(descend)} %`)];
  const voiesPresentes = (Object.keys(VOIES) as SegmentVoie['voie'][]).filter((v) => voies.some((s) => s.voie === v));
  profilBox.innerHTML = `
    <div class="profil-tete"><h3>Profil</h3>${stats.join('')}</div>
    <div class="profil-graphe"><svg viewBox="0 0 ${W} ${H + 40}" role="img" aria-label="Profil : altitude de ${Math.round(zmin)} à ${Math.round(zmax)} m sur ${km(l.distanceM)} km">${svg}</svg><div class="bulle" hidden></div></div>
    <div class="legende-profil">
      <span><em>Pente</em>${PENTES.map(([, c, t]) => `<span><i style="background:${c}"></i>${t}</span>`).join('')}</span>
      ${voiesPresentes.length ? `<span><em>Voie</em>${voiesPresentes.map((v) => `<span><i style="background:${VOIES[v][0]};height:6px"></i>${VOIES[v][1]}</span>`).join('')}</span>` : ''}
    </div>
    <div class="stats-profil">${stats.join('')}</div>`;

  // Survol (ou toucher) : altitude et pente au point, repéré aussi sur la carte.
  const el = profilBox.querySelector<SVGSVGElement>('svg')!;
  const bulle = profilBox.querySelector<HTMLElement>('.bulle')!;
  const ligne = el.querySelector('#curseur')!;
  const rond = el.querySelector('#curseur-point')!;
  const montrer = (ev: PointerEvent) => {
    const r = el.getBoundingClientRect();
    const x = ((ev.clientX - r.left) / r.width) * W;
    if (x < X0) return;
    const d = Math.min(D, ((x - X0) / (W - X0)) * D);
    const [alt, k] = altitudeA(l, d);
    const p = tranches[Math.min(tranches.length - 1, Math.floor(d / 100))][2];
    for (const n of [ligne, rond]) n.setAttribute('visibility', 'visible');
    ligne.setAttribute('x1', f1(X(d))); ligne.setAttribute('x2', f1(X(d)));
    rond.setAttribute('cx', f1(X(d))); rond.setAttribute('cy', f1(Y(alt)));
    bulle.hidden = false;
    bulle.innerHTML = `<strong>km ${km(d)}</strong><br>${Math.round(alt)} m · pente ${Math.round(Math.abs(p))} %`;
    const gauche = (X(d) / W) * r.width;
    bulle.style.left = `${gauche + 10 + 140 > r.width ? gauche - 150 : gauche + 10}px`;
    curseurCarte.setLatLng([l.coords[k][0], l.coords[k][1]]).addTo(map);
  };
  el.addEventListener('pointermove', montrer);
  el.addEventListener('pointerdown', montrer);
  el.addEventListener('pointerleave', () => {
    for (const n of [ligne, rond]) n.setAttribute('visibility', 'hidden');
    bulle.hidden = true;
    curseurCarte.remove();
  });
}
let attente = 0;
window.addEventListener('resize', () => {
  clearTimeout(attente);
  attente = window.setTimeout(() => {
    if (!ordinateur.matches) setEtat((panel.dataset.etat as Etat) ?? 'moyen');
    if (app.dataset.vue === 'detail') dessinerProfil(boucles[choisie]);
  }, 150);
});

function telecharger(loop: BoucleAffichee, i: number) {
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
