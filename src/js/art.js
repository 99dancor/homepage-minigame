// Einfache Vektorgrafiken der Tiere, sitzend von vorn. Alle teilen sich Körper, Kopf und Gesicht;
// Ohren, Schwanz und Besonderheiten kommen je Tierart dazu.
//   petSvg(species, colorId, face)   face: 'happy' | 'ok' | 'sad' | 'sleep'
import { SPECIES } from './pets.js';

const LINE = '#2a2a2a';
const rot = (deg, x, y) => `transform="rotate(${deg} ${x} ${y})"`;
const mirror = 'transform="translate(200 0) scale(-1 1)"';

// Teil links zeichnen und gespiegelt rechts wiederholen
const both = (svg) => `<g>${svg}</g><g ${mirror}>${svg}</g>`;

function eyes(face, c, y, dx = 16) {
  const xl = 100 - dx, xr = 100 + dx;
  if (face === 'happy') return `<path d="M${xl - 7},${y + 2} Q${xl},${y - 7} ${xl + 7},${y + 2}" fill="none" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M${xr - 7},${y + 2} Q${xr},${y - 7} ${xr + 7},${y + 2}" fill="none" stroke-width="3.5" stroke-linecap="round"/>`;
  if (face === 'sleep') return `<path d="M${xl - 7},${y} Q${xl},${y + 6} ${xl + 7},${y}" fill="none" stroke-width="3" stroke-linecap="round"/>
    <path d="M${xr - 7},${y} Q${xr},${y + 6} ${xr + 7},${y}" fill="none" stroke-width="3" stroke-linecap="round"/>`;
  const eye = c.eye || '#222';
  const pupil = c.eye ? `<ellipse cx="${xl}" cy="${y}" rx="2" ry="5" fill="#111" stroke="none"/><ellipse cx="${xr}" cy="${y}" rx="2" ry="5" fill="#111" stroke="none"/>` : '';
  const brows = face === 'sad'
    ? `<path d="M${xl - 8},${y - 9} L${xl + 6},${y - 14}" stroke-width="2.5" stroke-linecap="round"/><path d="M${xr + 8},${y - 9} L${xr - 6},${y - 14}" stroke-width="2.5" stroke-linecap="round"/>`
    : '';
  return `${brows}<circle cx="${xl}" cy="${y}" r="7" fill="${eye}" stroke-width="1.5"/><circle cx="${xr}" cy="${y}" r="7" fill="${eye}" stroke-width="1.5"/>${pupil}
    <circle cx="${xl + 2.5}" cy="${y - 2.5}" r="2.2" fill="#fff" stroke="none"/><circle cx="${xr + 2.5}" cy="${y - 2.5}" r="2.2" fill="#fff" stroke="none"/>`;
}

function mouth(face, y) {
  if (face === 'happy') return `<path d="M90,${y} Q100,${y + 10} 110,${y}" fill="none" stroke-width="3" stroke-linecap="round"/>`;
  if (face === 'sad') return `<path d="M91,${y + 6} Q100,${y - 2} 109,${y + 6}" fill="none" stroke-width="3" stroke-linecap="round"/>`;
  if (face === 'sleep') return `<ellipse cx="100" cy="${y + 2}" rx="3.5" ry="2.5" fill="#6a3a3a" stroke-width="1.5"/>`;
  return `<path d="M93,${y + 1} Q100,${y + 5} 107,${y + 1}" fill="none" stroke-width="3" stroke-linecap="round"/>`;
}

const blush = (face, y, dx = 30) => (face === 'happy'
  ? `<ellipse cx="${100 - dx}" cy="${y}" rx="7" ry="4" fill="#ff8fa3" opacity=".55" stroke="none"/><ellipse cx="${100 + dx}" cy="${y}" rx="7" ry="4" fill="#ff8fa3" opacity=".55" stroke="none"/>`
  : '');

const tear = (face, y, dx = 16) => (face === 'sad'
  ? `<path d="M${100 - dx - 4},${y + 8} q-4,8 0,11 q4,-3 0,-11z" fill="#6ec6ff" stroke-width="1"/>`
  : '');

const zzz = (face) => (face === 'sleep'
  ? `<g class="zzz" stroke="none" fill="#334" font-family="Tahoma, sans-serif" font-weight="bold"><text x="150" y="40" font-size="20">Z</text><text x="166" y="24" font-size="14">z</text><text x="178" y="12" font-size="10">z</text></g>`
  : '');

// Standard-Körper: sitzend, Bauch, Pfoten
function body(c, { cy = 145, rx = 48, ry = 40 } = {}) {
  return `<ellipse cx="100" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c.main}"/>
    <ellipse cx="100" cy="${cy + 8}" rx="${rx * 0.62}" ry="${ry * 0.66}" fill="${c.belly}" stroke="none"/>
    <ellipse cx="78" cy="${cy + ry - 3}" rx="14" ry="8" fill="${c.main}"/><ellipse cx="122" cy="${cy + ry - 3}" rx="14" ry="8" fill="${c.main}"/>`;
}

// Jede Art: back (ganz hinten), ears (hinter dem Kopf), body, head, front (vor dem Kopf), face
const PARTS = {
  cat(c, face) {
    return {
      back: `<path class="tail" d="M140,170 C178,168 182,120 168,104" fill="none" stroke="${LINE}" stroke-width="16" stroke-linecap="round"/>
             <path class="tail" d="M140,170 C178,168 182,120 168,104" fill="none" stroke="${c.main}" stroke-width="11" stroke-linecap="round"/>`,
      body: body(c),
      head: `<circle cx="100" cy="85" r="42" fill="${c.main}"/>`,
      ears: both(`<path d="M64,64 L66,26 L96,48 Z" fill="${c.main}" stroke-linejoin="round"/><path d="M70,56 L71,36 L87,48 Z" fill="${c.accent}" stroke="none"/>`),
      face: `${eyes(face, c, 82)}<path d="M95,95 L105,95 L100,101 Z" fill="${c.accent}" stroke-width="1.5"/>${mouth(face, 104)}
             ${both('<path d="M58,96 L82,99 M58,106 L82,103" stroke-width="1.5" fill="none"/>')}${blush(face, 98, 32)}`,
    };
  },
  dog(c, face) {
    return {
      back: `<path class="tail wag" d="M142,160 Q172,150 170,124" fill="none" stroke="${LINE}" stroke-width="15" stroke-linecap="round"/>
             <path class="tail wag" d="M142,160 Q172,150 170,124" fill="none" stroke="${c.main}" stroke-width="10" stroke-linecap="round"/>`,
      body: body(c) + (c.id === 'spotted' ? `<ellipse cx="128" cy="132" rx="12" ry="9" fill="${c.accent}" stroke="none"/>` : ''),
      head: `<circle cx="100" cy="85" r="42" fill="${c.main}"/>` + (c.id === 'spotted' ? `<ellipse cx="117" cy="76" rx="15" ry="13" fill="${c.accent}" stroke="none"/>` : ''),
      ears: '',
      front: both(`<ellipse cx="60" cy="86" rx="13" ry="28" fill="${c.accent}" ${rot(18, 60, 86)}/>`),
      face: `${eyes(face, c, 80)}<ellipse cx="100" cy="102" rx="19" ry="13" fill="${c.belly}"/>
             <ellipse cx="100" cy="96" rx="7.5" ry="5.5" fill="#222"/>${mouth(face, 104)}
             ${face === 'happy' ? '<path d="M96,110 q4,12 8,0 z" fill="#ff7a8a" stroke-width="1.5"/>' : ''}${blush(face, 96, 31)}`,
    };
  },
  rabbit(c, face) {
    return {
      back: `<circle cx="148" cy="168" r="13" fill="#fff"/>`,
      body: body(c),
      head: `<circle cx="100" cy="88" r="40" fill="${c.main}"/>`,
      ears: both(`<ellipse cx="80" cy="32" rx="12" ry="34" fill="${c.main}" ${rot(-10, 80, 32)}/><ellipse cx="80" cy="34" rx="6" ry="25" fill="${c.accent}" stroke="none" ${rot(-10, 80, 34)}/>`),
      face: `${eyes(face, c, 86)}<ellipse cx="100" cy="99" rx="5" ry="3.5" fill="${c.accent}" stroke-width="1.5"/>
             ${face === 'sleep' ? '' : '<rect x="95" y="106" width="10" height="9" rx="1.5" fill="#fff" stroke-width="1.5"/><path d="M100,106 v9" stroke-width="1"/>'}
             ${mouth(face === 'sleep' ? 'sleep' : face, 103)}${blush(face, 102, 28)}`,
    };
  },
  hamster(c, face) {
    return {
      back: '',
      body: `<ellipse cx="100" cy="128" rx="64" ry="60" fill="${c.main}"/>
             <ellipse cx="100" cy="146" rx="40" ry="36" fill="${c.belly}" stroke="none"/>
             <ellipse cx="80" cy="185" rx="13" ry="7" fill="${c.accent}"/><ellipse cx="120" cy="185" rx="13" ry="7" fill="${c.accent}"/>
             <ellipse cx="82" cy="150" rx="9" ry="6" fill="${c.accent}"/><ellipse cx="118" cy="150" rx="9" ry="6" fill="${c.accent}"/>`,
      head: '',
      ears: both(`<circle cx="60" cy="74" r="14" fill="${c.main}"/><circle cx="60" cy="74" r="8" fill="${c.accent}" stroke="none"/>`),
      face: `${both(`<ellipse cx="66" cy="118" rx="18" ry="14" fill="${c.belly}" stroke="none"/>`)}
             ${eyes(face, c, 100, 18)}<ellipse cx="100" cy="112" rx="5" ry="3.5" fill="${c.accent}" stroke-width="1.5"/>${mouth(face, 117)}
             ${blush(face, 118, 34)}`,
    };
  },
  rat(c, face) {
    return {
      back: `<path d="M140,172 C185,175 190,135 172,120" fill="none" stroke="${LINE}" stroke-width="8" stroke-linecap="round"/>
             <path d="M140,172 C185,175 190,135 172,120" fill="none" stroke="${c.accent}" stroke-width="4.5" stroke-linecap="round"/>`,
      body: body(c, { cy: 148, rx: 44, ry: 38 }),
      head: `<ellipse cx="100" cy="88" rx="38" ry="36" fill="${c.main}"/><ellipse cx="100" cy="108" rx="20" ry="14" fill="${c.main}"/>`,
      ears: both(`<circle cx="64" cy="58" r="20" fill="${c.main}"/><circle cx="64" cy="58" r="12" fill="${c.accent}" stroke="none"/>`),
      face: `${eyes(face, c, 84, 15)}<circle cx="100" cy="114" r="5" fill="${c.accent}" stroke-width="1.5"/>
             ${both('<path d="M66,108 L88,111 M66,118 L88,115" stroke-width="1.3" fill="none"/>')}${mouth(face, 120)}${blush(face, 100, 28)}`,
    };
  },
  fox(c, face) {
    return {
      back: `<ellipse cx="156" cy="140" rx="22" ry="44" fill="${c.main}" ${rot(35, 156, 140)}/>
             <ellipse cx="176" cy="112" rx="11" ry="15" fill="#fff" ${rot(35, 176, 112)}/>`,
      body: body(c),
      head: `<circle cx="100" cy="86" r="42" fill="${c.main}"/><path d="M60,96 Q100,74 140,96 Q130,124 100,128 Q70,124 60,96 Z" fill="${c.belly}" stroke="none"/>`,
      ears: both(`<path d="M62,66 L60,18 L98,46 Z" fill="${c.main}"/><path d="M61,30 L60,18 L72,27 Z" fill="${c.accent}" stroke="none"/>`),
      face: `${eyes(face, c, 84)}<ellipse cx="100" cy="104" rx="6" ry="4.5" fill="#222"/>${mouth(face, 110)}${blush(face, 100, 30)}`,
    };
  },
  axolotl(c, face) {
    const frond = (y, deg) => `<ellipse cx="44" cy="${y}" rx="14" ry="6" fill="${c.accent}" ${rot(deg, 56, y)}/>`;
    return {
      back: `<path class="tail wag" d="M138,170 C175,175 190,150 186,128 C170,140 160,150 138,152 Z" fill="${c.main}"/>`,
      body: body(c, { cy: 150, rx: 44, ry: 36 }),
      head: `<ellipse cx="100" cy="92" rx="54" ry="40" fill="${c.main}"/>`,
      ears: both(frond(70, 25) + frond(88, 0) + frond(106, -25)),
      face: `${eyes(face, c, 88, 26)}<path d="M74,${face === 'sad' ? 112 : 104} Q100,${face === 'sad' ? 102 : 120} 126,${face === 'sad' ? 112 : 104}" fill="none" stroke-width="3" stroke-linecap="round"/>
             ${blush(face, 102, 38)}`,
    };
  },
  dragon(c, face) {
    return {
      back: `${both(`<path d="M62,120 C30,92 14,104 18,130 C30,124 38,130 40,140 C48,132 56,136 62,146 Z" fill="${c.belly}"/>`)}
             <path d="M140,170 C178,172 186,140 176,118" fill="none" stroke="${LINE}" stroke-width="16" stroke-linecap="round"/>
             <path d="M140,170 C178,172 186,140 176,118" fill="none" stroke="${c.main}" stroke-width="11" stroke-linecap="round"/>
             <path d="M168,110 L186,104 L180,122 Z" fill="${c.main}"/>`,
      body: body(c) + `<path d="M84,128 h32 M82,142 h36 M84,156 h32" stroke-width="1.5" opacity=".5"/>`,
      head: `<circle cx="100" cy="86" r="42" fill="${c.main}"/>`,
      ears: both(`<path d="M74,52 L66,22 L88,46 Z" fill="${c.accent}"/>`) + `<path d="M94,44 L100,32 L106,44 Z" fill="${c.accent}"/>`,
      face: `${eyes(face, c, 82)}<ellipse cx="100" cy="104" rx="20" ry="12" fill="${c.belly}"/>
             <circle cx="93" cy="101" r="2" fill="#222" stroke="none"/><circle cx="107" cy="101" r="2" fill="#222" stroke="none"/>${mouth(face, 108)}${blush(face, 96, 31)}`,
    };
  },
};

export function petSvg(speciesId, colorId, face = 'ok', { title = '' } = {}) {
  const sp = SPECIES[speciesId];
  const c = sp.colors.find((x) => x.id === colorId) || sp.colors[0];
  const p = PARTS[speciesId](c, face);
  return `<svg class="pet-svg species-${speciesId} face-${face}" viewBox="0 0 200 200" role="img" aria-label="${title || sp.name}" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="190" rx="58" ry="7" fill="rgba(0,0,0,.15)"/>
    <g stroke="${LINE}" stroke-width="2.5" stroke-linejoin="round">
      ${p.back}${p.ears}${p.body}${p.head}${p.front || ''}<g class="face" stroke="${c.faceLine || LINE}">${p.face}${tear(face, 82)}</g>
    </g>${zzz(face)}</svg>`;
}
