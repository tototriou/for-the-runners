import type { Loop } from './loops';

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** GPX 1.1 d'une boucle : un tracé avec altitudes, lisible par les montres GPS. */
export function toGpx(loop: Loop, name: string): string {
  const pts = loop.coords
    .map(([lat, lon, ele]) => `      <trkpt lat="${lat.toFixed(6)}" lon="${lon.toFixed(6)}"><ele>${ele.toFixed(0)}</ele></trkpt>`)
    .join('\n');
  const desc = `${(loop.distanceM / 1000).toFixed(2)} km, ${Math.round(loop.dplusM)} m D+`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Boucle D+" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${esc(name)}</name>
    <desc>${esc(desc)}</desc>
  </metadata>
  <trk>
    <name>${esc(name)}</name>
    <desc>${esc(desc)}</desc>
    <type>running</type>
    <trkseg>
${pts}
    </trkseg>
  </trk>
</gpx>
`;
}
