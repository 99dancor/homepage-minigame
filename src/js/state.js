// Spielstand: reine Funktionen ohne Browser-Abhängigkeiten, damit sie auch unter Node testbar sind.

export const VERSION = 1;

// Kalendertag in lokaler Zeit als "JJJJ-MM-TT"
export function dayKey(ms) {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Ganze Kalendertage zwischen zwei Tagesschlüsseln (unabhängig von Sommerzeit)
export function daysBetween(fromKey, toKey) {
  const utc = (k) => { const [y, m, d] = k.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((utc(toKey) - utc(fromKey)) / 86400000);
}

export function newState(now = Date.now()) {
  return {
    version: VERSION,
    createdAt: now,
    updatedAt: now,
    coins: 0,
    pets: [],          // kommt in Schritt 2
    activePet: null,
    inventory: {},     // kommt in Schritt 3
    visits: { total: 0, streak: 0, best: 0, lastDay: null },
  };
}

// Alte oder unvollständige Spielstände auf den aktuellen Aufbau bringen.
// Gibt null zurück, wenn die Daten kein Spielstand sind.
export function migrate(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  if (typeof raw.version !== 'number' || raw.version > VERSION) return null;
  const base = newState(typeof raw.createdAt === 'number' ? raw.createdAt : Date.now());
  const s = { ...base, ...raw, visits: { ...base.visits, ...(raw.visits || {}) } };
  if (!Array.isArray(s.pets)) s.pets = [];
  if (!s.inventory || typeof s.inventory !== 'object') s.inventory = {};
  if (typeof s.coins !== 'number' || !(s.coins >= 0)) s.coins = 0;
  if (typeof s.updatedAt !== 'number') s.updatedAt = s.createdAt;
  s.version = VERSION;
  return s;
}

export function parse(text) {
  if (typeof text !== 'string' || !text) return null;
  try { return migrate(JSON.parse(text)); } catch { return null; }
}

export function serialize(state) {
  return JSON.stringify(state);
}

// Ein Spielstand ohne jeden Fortschritt muss beim Anmelden nicht nachgefragt werden
export function isEmpty(state) {
  return !state || (state.pets.length === 0 && state.coins === 0 && Object.keys(state.inventory).length === 0);
}

// Täglichen Besuch zählen. Gibt zurück, ob heute der erste Besuch ist.
export function registerVisit(state, now = Date.now()) {
  const today = dayKey(now);
  const v = state.visits;
  if (v.lastDay === today) return false;
  const gap = v.lastDay ? daysBetween(v.lastDay, today) : null;
  v.streak = gap === 1 ? v.streak + 1 : 1;
  v.best = Math.max(v.best, v.streak);
  v.total += 1;
  v.lastDay = today;
  return true;
}
