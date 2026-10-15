import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newState, parse, serialize } from '../src/js/state.js';
import { SPECIES, adopt, tickPet, doAction, canDo, mood, isUnlocked, petSlots, nextSlotIn, CUDDLE_LOVE } from '../src/js/pets.js';
import { petSvg } from '../src/js/art.js';

const H = 3600000;
const T0 = Date.UTC(2026, 9, 1, 12);

function withPet(species = 'cat') {
  const s = newState(T0);
  const r = adopt(s, species, null, 'Testi', T0);
  assert.ok(r.ok);
  return { s, pet: r.pet };
}

test('Adoption: Starttier, Startspielzeug, gesperrte Tiere und Plätze', () => {
  const s = newState(T0);
  assert.equal(adopt(s, 'dragon', null, 'X', T0).ok, false);
  assert.ok(adopt(s, 'dog', 'golden', '<b>Bello</b>', T0).ok);
  assert.equal(s.pets[0].name, 'bBello/b');
  assert.equal(s.pets[0].color, 'golden');
  assert.equal(s.inventory.toy_ball, 1);
  assert.equal(adopt(s, 'cat', null, 'Mimi', T0).ok, false, 'nur ein Platz am Anfang');
  s.visits.total = 5;
  assert.equal(petSlots(s), 2);
  assert.ok(adopt(s, 'cat', null, 'Mimi', T0).ok);
  assert.equal(nextSlotIn(s), 10);
  s.visits.best = 3;
  assert.ok(isUnlocked('fox', s));
  assert.ok(!isUnlocked('axolotl', s));
});

test('Zeit: Werte sinken, auch über Tage, aber nie unter 0', () => {
  const { pet } = withPet();
  const before = { ...pet.stats };
  tickPet(pet, T0 + 4 * H);
  assert.ok(pet.stats.food < before.food && pet.stats.water < before.water && pet.stats.fun < before.fun);
  tickPet(pet, T0 + 30 * 24 * H);
  for (const v of Object.values(pet.stats)) assert.ok(v >= 0 && v <= 100);
  assert.equal(pet.stats.food, 0);
  assert.equal(mood(pet).face === 'sad' || pet.sleeping, true);
});

test('Zeit: rückwärts laufende Uhr ändert nichts', () => {
  const { pet } = withPet();
  const before = JSON.stringify(pet.stats);
  assert.equal(tickPet(pet, T0 - H), 0);
  assert.equal(JSON.stringify(pet.stats), before);
});

test('Schlaf: erholt sich und wacht von selbst auf; erschöpft schläft es ein', () => {
  const { s, pet } = withPet();
  pet.stats.rest = 20;
  assert.ok(doAction(pet, 'sleep', s, T0).ok);
  assert.equal(canDo(pet, 'feed', s).ok, false);
  tickPet(pet, T0 + 4 * H);
  assert.equal(pet.sleeping, false);
  assert.ok(pet.stats.rest > 90, String(pet.stats.rest));
  pet.stats.rest = 1;
  tickPet(pet, T0 + 5 * H);
  assert.equal(pet.sleeping, true);
});

test('Kuscheln erst ab hoher Liebe', () => {
  const { s, pet } = withPet();
  pet.stats.love = CUDDLE_LOVE - 1;
  assert.equal(doAction(pet, 'cuddle', s, T0).ok, false);
  pet.stats.love = CUDDLE_LOVE;
  assert.equal(doAction(pet, 'cuddle', s, T0).ok, true);
});

test('Satt und ohne Durst wird abgelehnt', () => {
  const { s, pet } = withPet();
  pet.stats.food = 96; pet.stats.water = 99;
  assert.equal(doAction(pet, 'feed', s, T0).ok, false);
  assert.equal(doAction(pet, 'water', s, T0).ok, false);
  pet.stats.food = 40;
  const r = doAction(pet, 'feed', s, T0);
  assert.equal(r.delta.food, 35);
});

test('Wiederholtes Streicheln wirkt schwächer und erholt sich mit der Zeit', () => {
  const { s, pet } = withPet();
  const gains = [];
  for (let i = 0; i < 6; i++) { const before = pet.stats.love; doAction(pet, 'pet', s, T0); gains.push(pet.stats.love - before); }
  assert.ok(gains[5] < gains[0] / 2, gains.join(','));
  tickPet(pet, T0 + 2 * H);
  const before = pet.stats.love;
  doAction(pet, 'pet', s, T0 + 2 * H);
  assert.ok(pet.stats.love - before >= 5.9);
});

test('Spielen braucht Spielzeug und Ruhe', () => {
  const { s, pet } = withPet();
  s.inventory = {};
  assert.equal(canDo(pet, 'play', s).ok, false);
  s.inventory.toy_ball = 1;
  pet.stats.rest = 10;
  assert.equal(canDo(pet, 'play', s).ok, false);
  pet.stats.rest = 60;
  const r = doAction(pet, 'play', s, T0);
  assert.ok(r.ok && r.delta.fun > 0 && r.delta.rest < 0);
});

test('Erfüllung folgt langsam dem Wohlbefinden', () => {
  const { pet } = withPet();
  Object.assign(pet.stats, { love: 100, fun: 100, food: 100, water: 100, rest: 100, joy: 0 });
  tickPet(pet, T0 + 2 * H);
  assert.ok(pet.stats.joy > 5 && pet.stats.joy < 30, String(pet.stats.joy));
});

test('Spielstand mit Tieren übersteht Speichern und Laden; kaputte Tiere fliegen raus', () => {
  const { s } = withPet('rabbit');
  s.pets.push({ id: 'x', species: 'einhorn' });
  const back = parse(serialize(s));
  assert.equal(back.pets.length, 1);
  assert.equal(back.pets[0].species, 'rabbit');
  assert.equal(back.activePet, back.pets[0].id);
});

test('Jede Tierart lässt sich in jeder Farbe und Stimmung zeichnen', () => {
  for (const [id, sp] of Object.entries(SPECIES)) {
    for (const c of sp.colors) for (const f of ['happy', 'ok', 'sad', 'sleep']) {
      const svg = petSvg(id, c.id, f);
      assert.match(svg, /^<svg[\s\S]*<\/svg>$/);
      assert.doesNotMatch(svg, /undefined|NaN/);
    }
  }
});
