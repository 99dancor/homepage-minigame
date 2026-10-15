// Tiere, Statuswerte und Pflege: reine Funktionen, damit sie unter Node testbar sind.
// Alle Werte laufen von 0 bis 100. Die Zeit läuft auch weiter, während niemand spielt.

export const STATS = [
  { key: 'love', label: 'Liebe', icon: '❤️' },
  { key: 'fun', label: 'Spaß', icon: '🎾' },
  { key: 'food', label: 'Nahrung', icon: '🍖' },
  { key: 'water', label: 'Wasser', icon: '💧' },
  { key: 'rest', label: 'Ruhe', icon: '💤' },
  { key: 'joy', label: 'Erfüllung', icon: '⭐' },
];
const NEEDS = ['love', 'fun', 'food', 'water', 'rest'];

// needs: Faktor auf das Absinken einzelner Werte (1 = normal)
// unlock: Besondere Tiere schaltet eine Besuchsserie frei (beste Serie zählt, bleibt also freigeschaltet)
export const SPECIES = {
  cat: {
    name: 'Katze', icon: '🐱', sound: 'schnurrt zufrieden', hint: 'Unabhängig, braucht etwas weniger Aufmerksamkeit.',
    needs: { love: 0.7 }, names: ['Mimi', 'Luna', 'Felix', 'Minka', 'Tiger'],
    colors: [
      { id: 'ginger', name: 'Rot getigert', main: '#e8a050', belly: '#f8e0c0', accent: '#f4a0a8' },
      { id: 'black', name: 'Schwarz', main: '#3c3c44', belly: '#5c5c66', accent: '#d88090', eye: '#e8c840', faceLine: '#e4e4ec' },
      { id: 'grey', name: 'Grau', main: '#9aa0a8', belly: '#dde0e4', accent: '#f4a0a8' },
    ],
  },
  dog: {
    name: 'Hund', icon: '🐶', sound: 'wedelt mit dem Schwanz', hint: 'Verspielt, will viel beschäftigt werden.',
    needs: { fun: 1.3 }, names: ['Bello', 'Luna', 'Rex', 'Balu', 'Sammy'],
    colors: [
      { id: 'brown', name: 'Braun', main: '#b07840', belly: '#f0d8b0', accent: '#7a4f28' },
      { id: 'spotted', name: 'Weiß-Schwarz', main: '#f4f4f4', belly: '#ffffff', accent: '#3a3a3a' },
      { id: 'golden', name: 'Golden', main: '#e0b060', belly: '#f8e8c0', accent: '#c08a40' },
    ],
  },
  rabbit: {
    name: 'Kaninchen', icon: '🐰', sound: 'mümmelt glücklich', hint: 'Frisst gern und viel.',
    needs: { food: 1.2 }, names: ['Hoppel', 'Flocke', 'Möhrchen', 'Stups', 'Lotte'],
    colors: [
      { id: 'white', name: 'Weiß', main: '#f6f6f6', belly: '#ffffff', accent: '#f4a0b4' },
      { id: 'grey', name: 'Grau', main: '#a8a8a8', belly: '#e2e2e2', accent: '#f4a0b4' },
      { id: 'brown', name: 'Braun', main: '#a0784f', belly: '#e8d4bc', accent: '#f0b0b8' },
    ],
  },
  hamster: {
    name: 'Hamster', icon: '🐹', sound: 'quiekt vergnügt', hint: 'Klein, aber hat immer Hunger.',
    needs: { food: 1.3, water: 0.8 }, names: ['Krümel', 'Pünktchen', 'Nugget', 'Erdnuss', 'Bommel'],
    colors: [
      { id: 'gold', name: 'Goldbraun', main: '#e0a860', belly: '#fbefd8', accent: '#f4a0a8' },
      { id: 'white', name: 'Weiß', main: '#f4f0ea', belly: '#ffffff', accent: '#f4a0a8' },
      { id: 'grey', name: 'Grau', main: '#b0a8a0', belly: '#ece6e0', accent: '#f4a0a8' },
    ],
  },
  rat: {
    name: 'Ratte', icon: '🐭', sound: 'putzt sich zufrieden', hint: 'Schlau und neugierig, langweilt sich schnell.',
    needs: { fun: 1.2 }, names: ['Ratatouille', 'Pip', 'Fips', 'Nala', 'Socke'],
    colors: [
      { id: 'white', name: 'Weiß', main: '#f4f4f0', belly: '#ffffff', accent: '#f0a0b0' },
      { id: 'grey', name: 'Grau', main: '#8c8c92', belly: '#d8d8dc', accent: '#f0a0b0' },
      { id: 'hooded', name: 'Schwarz-Weiß', main: '#44444e', belly: '#f0f0f0', accent: '#f0a0b0', faceLine: '#e4e4ec' },
    ],
  },
  fox: {
    name: 'Fuchs', icon: '🦊', sound: 'keckert fröhlich', hint: 'Besonders: verspielt und anhänglich.',
    needs: { fun: 1.2, love: 1.1 }, names: ['Foxi', 'Rubin', 'Ginger', 'Flinn', 'Kira'],
    unlock: { best: 3 },
    colors: [
      { id: 'red', name: 'Rotfuchs', main: '#e07030', belly: '#ffffff', accent: '#2e2420' },
      { id: 'arctic', name: 'Polarfuchs', main: '#e8eef4', belly: '#ffffff', accent: '#8a96a6' },
      { id: 'silver', name: 'Silberfuchs', main: '#6e737c', belly: '#e8e8e8', accent: '#2a2a30' },
    ],
  },
  axolotl: {
    name: 'Axolotl', icon: '🦎', sound: 'wedelt mit den Kiemen', hint: 'Besonders: braucht vor allem Wasser.',
    needs: { water: 1.5, fun: 0.8 }, names: ['Axel', 'Lotti', 'Blubb', 'Perle', 'Koralle'],
    unlock: { best: 7 },
    colors: [
      { id: 'pink', name: 'Rosa', main: '#f8b4c8', belly: '#fcd8e2', accent: '#e0607e' },
      { id: 'gold', name: 'Gold', main: '#f4d070', belly: '#fae8b0', accent: '#e09a30' },
      { id: 'wild', name: 'Wildfarben', main: '#7a8a68', belly: '#a8b898', accent: '#4a5a3c' },
    ],
  },
  dragon: {
    name: 'Drache', icon: '🐲', sound: 'brummt und pustet kleine Rauchwölkchen', hint: 'Besonders: frisst viel und schläft gern.',
    needs: { food: 1.4, rest: 1.2 }, names: ['Smaragd', 'Funke', 'Glut', 'Nebel', 'Zacke'],
    unlock: { best: 14 },
    colors: [
      { id: 'green', name: 'Grün', main: '#5cb85c', belly: '#d8f0a0', accent: '#f0e0a0' },
      { id: 'purple', name: 'Lila', main: '#9a6ad0', belly: '#e8d8ff', accent: '#f8d870' },
      { id: 'blue', name: 'Blau', main: '#4a90d0', belly: '#cfe8ff', accent: '#f0f0f0' },
    ],
  },
};

export const MAX_PETS = 4;
// Weitere Tierplätze nach so vielen Besuchstagen
const SLOT_DAYS = [5, 15, 30];

export function isUnlocked(speciesId, state) {
  const u = SPECIES[speciesId].unlock;
  return !u || state.visits.best >= u.best;
}

export function unlockText(speciesId) {
  const u = SPECIES[speciesId].unlock;
  return u ? `Ab ${u.best} Tagen in Folge` : '';
}

export function petSlots(state) {
  return Math.min(MAX_PETS, 1 + SLOT_DAYS.filter((d) => state.visits.total >= d).length);
}

// Besuchstage bis zum nächsten Tierplatz, oder null
export function nextSlotIn(state) {
  const next = SLOT_DAYS.find((d) => state.visits.total < d);
  return next === undefined || petSlots(state) >= MAX_PETS ? null : next - state.visits.total;
}

let idCounter = 0;
export function newPet(speciesId, colorId, name, now = Date.now()) {
  const sp = SPECIES[speciesId];
  const color = sp.colors.find((c) => c.id === colorId) ? colorId : sp.colors[0].id;
  return {
    id: `p${now.toString(36)}${(idCounter++).toString(36)}`,
    species: speciesId, color, name: cleanName(name) || sp.names[0], adoptedAt: now,
    stats: { love: 30, fun: 60, food: 60, water: 60, rest: 80, joy: 40 },
    sleeping: false, tickAt: now, fatigue: {},
  };
}

export function cleanName(name) {
  return String(name || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 20);
}

// ---------- Zeit ----------
// Absinken pro Stunde, wach und schlafend. Ruhe steigt im Schlaf.
const RATE_AWAKE = { food: 3.5, water: 4.5, fun: 3, rest: 2, love: 0.5 };
const RATE_ASLEEP = { food: 1.5, water: 2, fun: 0.5, rest: -30, love: 0.2 };
const JOY_PULL = 0.08;        // Erfüllung nähert sich pro Stunde um 8 % dem Durchschnitt der anderen Werte
const FATIGUE_RECOVER = 4;    // so viele "Wiederholungen" baut ein Tier pro Stunde wieder ab
const STEP_MS = 10 * 60 * 1000;

const clamp = (v) => Math.max(0, Math.min(100, v));

function step(pet, hours, sp) {
  const s = pet.stats;
  const rate = pet.sleeping ? RATE_ASLEEP : RATE_AWAKE;
  for (const k of NEEDS) {
    let r = rate[k];
    if (r > 0) r *= (sp.needs && sp.needs[k]) || 1;
    // Hungrige oder durstige Tiere fühlen sich schneller vernachlässigt
    if (k === 'love' && (s.food < 20 || s.water < 20)) r *= 2;
    s[k] = clamp(s[k] - r * hours);
  }
  const mean = NEEDS.reduce((a, k) => a + s[k], 0) / NEEDS.length;
  s.joy = clamp(s.joy + (mean - s.joy) * Math.min(1, JOY_PULL * hours));
  if (pet.sleeping && s.rest >= 100) pet.sleeping = false;
  else if (!pet.sleeping && s.rest <= 0) pet.sleeping = true; // schläft vor Erschöpfung von selbst ein
  for (const k of Object.keys(pet.fatigue)) {
    pet.fatigue[k] = Math.max(0, pet.fatigue[k] - FATIGUE_RECOVER * hours);
    if (pet.fatigue[k] === 0) delete pet.fatigue[k];
  }
}

// Bringt ein Tier auf den Stand von "now". Gibt die vergangenen Stunden zurück.
export function tickPet(pet, now = Date.now()) {
  const sp = SPECIES[pet.species];
  const from = pet.tickAt || now;
  if (now <= from) { pet.tickAt = Math.max(from, now); return 0; }
  let t = from;
  while (t < now) {
    const dt = Math.min(STEP_MS, now - t);
    step(pet, dt / 3600000, sp);
    t += dt;
  }
  pet.tickAt = now;
  return (now - from) / 3600000;
}

export function tickAll(state, now = Date.now()) {
  let away = 0;
  for (const p of state.pets) away = Math.max(away, tickPet(p, now));
  return away;
}

// ---------- Stimmung ----------
const NEED_TEXT = {
  food: ['hungrig', 'hat Hunger'], water: ['durstig', 'hat Durst'], fun: ['gelangweilt', 'langweilt sich'],
  rest: ['müde', 'ist müde'], love: ['einsam', 'fühlt sich einsam'],
};

export function mood(pet) {
  const s = pet.stats;
  if (pet.sleeping) return { face: 'sleep', key: 'sleep', text: `${pet.name} schläft tief und fest.` };
  const lowest = NEEDS.reduce((a, k) => (s[k] < s[a] ? k : a), NEEDS[0]);
  if (s[lowest] < 25) return { face: 'sad', key: lowest, label: NEED_TEXT[lowest][0], text: `${pet.name} ${NEED_TEXT[lowest][1]}.` };
  const avg = (NEEDS.reduce((a, k) => a + s[k], 0) + s.joy) / (NEEDS.length + 1);
  if (avg >= 70) return { face: 'happy', key: 'happy', label: 'glücklich', text: `${pet.name} ist rundum glücklich!` };
  if (s[lowest] < 45) return { face: 'ok', key: lowest, label: NEED_TEXT[lowest][0], text: `${pet.name} ${NEED_TEXT[lowest][1]} – ein bisschen zumindest.` };
  return { face: 'ok', key: 'ok', label: 'zufrieden', text: `${pet.name} ist zufrieden.` };
}

// ---------- Aktionen ----------
export const CUDDLE_LOVE = 70;

// effect: Änderungen der Werte; tiring: wiederholt sich die Aktion schnell, wirkt sie schwächer
export const ACTIONS = {
  pet: { label: 'Streicheln', icon: '✋', cooldown: 1500, tiring: true, effect: { love: 6, fun: 2, joy: 1 } },
  cuddle: { label: 'Kuscheln', icon: '🤗', cooldown: 4000, tiring: true, effect: { love: 10, rest: 4, joy: 3 } },
  feed: { label: 'Füttern', icon: '🍖', cooldown: 2000, effect: { food: 35, joy: 1 } },
  water: { label: 'Wasser geben', icon: '💧', cooldown: 2000, effect: { water: 40 } },
  play: { label: 'Spielen', icon: '🎾', cooldown: 3000, tiring: true, effect: { fun: 25, love: 3, rest: -6, food: -4, water: -5, joy: 2 } },
  sleep: { label: 'Schlafen legen', icon: '🛏️', cooldown: 1000, effect: {} },
  wake: { label: 'Aufwecken', icon: '⏰', cooldown: 1000, effect: {} },
};

// Darf die Aktion gerade ausgeführt werden? { ok, reason }
export function canDo(pet, action, state) {
  const s = pet.stats, n = pet.name;
  if (action === 'wake') return pet.sleeping ? { ok: true } : { ok: false, reason: `${n} ist wach.` };
  if (pet.sleeping) return { ok: false, reason: `${n} schläft gerade. Psst!` };
  switch (action) {
    case 'cuddle': return s.love >= CUDDLE_LOVE ? { ok: true } : { ok: false, reason: `${n} vertraut dir noch nicht genug zum Kuscheln. Ab ${CUDDLE_LOVE} Liebe geht es.` };
    case 'feed': return s.food < 95 ? { ok: true } : { ok: false, reason: `${n} ist satt.` };
    case 'water': return s.water < 95 ? { ok: true } : { ok: false, reason: `${n} hat keinen Durst.` };
    case 'play':
      if (!hasToy(state)) return { ok: false, reason: 'Du hast noch kein Spielzeug.' };
      return s.rest >= 15 ? { ok: true } : { ok: false, reason: `${n} ist zu müde zum Spielen.` };
    case 'sleep': return s.rest < 80 ? { ok: true } : { ok: false, reason: `${n} ist noch gar nicht müde.` };
    case 'pet': return { ok: true };
    default: return { ok: false, reason: '?' };
  }
}

export function hasToy(state) {
  return Object.keys(state.inventory || {}).some((k) => k.startsWith('toy_') && state.inventory[k] > 0);
}

// Führt eine Aktion aus (vorher tickPet aufrufen). Gibt { ok, text, delta } zurück.
export function doAction(pet, action, state, now = Date.now()) {
  const check = canDo(pet, action, state);
  if (!check.ok) return { ok: false, text: check.reason, delta: {} };
  const a = ACTIONS[action], sp = SPECIES[pet.species], n = pet.name;
  const reps = a.tiring ? pet.fatigue[action] || 0 : 0;
  const factor = a.tiring ? Math.max(0.2, 1 - 0.15 * reps) : 1;
  const delta = {};
  for (const [k, v] of Object.entries(a.effect)) {
    const before = pet.stats[k];
    // Nur das Gute lässt nach, der Aufwand (z. B. Ruhe beim Spielen) bleibt gleich
    pet.stats[k] = clamp(before + (v > 0 ? v * factor : v));
    delta[k] = Math.round(pet.stats[k] - before);
  }
  if (a.tiring) pet.fatigue[action] = reps + 1;
  pet.tickAt = now;
  let text;
  switch (action) {
    case 'pet': text = factor < 0.5 ? `${n} hat erstmal genug gestreichelt.` : `${n} ${sp.sound}.`; break;
    case 'cuddle': text = factor < 0.5 ? `${n} möchte gerade lieber etwas Abstand.` : `${n} kuschelt sich ganz fest an dich.`; break;
    case 'feed': text = `${n} frisst genüsslich.`; break;
    case 'water': text = `${n} trinkt ein paar Schlucke.`; break;
    case 'play': text = factor < 0.5 ? `${n} spielt nur noch halbherzig mit.` : `${n} jagt begeistert dem Ball hinterher!`; break;
    case 'sleep': pet.sleeping = true; text = `${n} rollt sich ein und schläft ein. Gute Nacht!`; break;
    case 'wake': {
      pet.sleeping = false;
      if (pet.stats.rest < 50) { pet.stats.love = clamp(pet.stats.love - 3); delta.love = -3; text = `${n} ist noch ganz verschlafen und etwas grummelig.`; }
      else text = `${n} streckt sich und ist wach.`;
      break;
    }
  }
  return { ok: true, text, delta, factor };
}

// Startausstattung, damit "Spielen" von Anfang an geht
export function starterInventory(state) {
  state.inventory = state.inventory || {};
  if (!state.inventory.toy_ball) state.inventory.toy_ball = 1;
}

export function adopt(state, speciesId, colorId, name, now = Date.now()) {
  if (!SPECIES[speciesId]) return { ok: false, text: 'Unbekanntes Tier.' };
  if (!isUnlocked(speciesId, state)) return { ok: false, text: `${SPECIES[speciesId].name}: ${unlockText(speciesId)} freigeschaltet.` };
  if (state.pets.length >= petSlots(state)) return { ok: false, text: 'Kein freier Platz für ein weiteres Tier.' };
  const pet = newPet(speciesId, colorId, name, now);
  state.pets.push(pet);
  state.activePet = pet.id;
  starterInventory(state);
  return { ok: true, pet };
}

export function activePet(state) {
  return state.pets.find((p) => p.id === state.activePet) || state.pets[0] || null;
}
