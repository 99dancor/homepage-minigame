// Einstieg: Spielstand laden, Oberfläche zeichnen, regelmäßig speichern.
import { createStore } from './storage.js';
import { registerVisit, dayKey, newState } from './state.js';
import {
  SPECIES, STATS, ACTIONS, CUDDLE_LOVE, tickAll, tickPet, mood, canDo, doAction, adopt, activePet,
  isUnlocked, unlockText, petSlots, nextSlotIn, cleanName,
} from './pets.js';
import { petSvg } from './art.js';

// Die Homepage kann Adressen vorgeben: <script>window.HAUSTIER_CONFIG = { savesUrl, loginUrl, registerUrl }</script>
const config = {
  savesUrl: '/api/saves/haustier',
  loginUrl: '/login',
  registerUrl: '/register',
  ...(window.HAUSTIER_CONFIG || {}),
};

const $ = (id) => document.getElementById(id);
const STATUS_TEXT = {
  local: '💾 Im Browser gespeichert',
  nostore: '⚠️ Speichern im Browser nicht möglich',
  pending: '💾 Ungespeicherte Änderungen …',
  saving: '💾 Speichere im Konto …',
  saved: '✅ Im Konto gespeichert',
  offline: '📴 Offline – wird später im Konto gespeichert',
  error: '⚠️ Speichern fehlgeschlagen – neuer Versuch folgt',
  loggedout: '⚠️ Abgemeldet – bitte neu anmelden, sonst geht Fortschritt verloren',
};

let state = newState();
let view = 'room';        // 'room' | 'adopt'
let picked = null;        // Tierart auf dem Adoptionsbildschirm
let bubble = null;        // Sprechblase über dem Tier: { text, until }
const lastAction = {};    // Abklingzeit je Tier und Aktion

const store = createStore({
  savesUrl: config.savesUrl,
  ls: (() => { try { return window.localStorage; } catch { return null; } })(),
  onStatus: ({ status }) => { $('save-status').textContent = STATUS_TEXT[status] || status; },
  onReplace: (s) => { state = s; render(); },
});

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = (ms) => new Date(ms).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---------- Dialog im Windows-Stil ----------
function dialog(title, html, buttons) {
  const dlg = $('dlg');
  $('dlg-title').textContent = title;
  $('dlg-body').innerHTML = html;
  const actions = $('dlg-actions');
  actions.innerHTML = '';
  for (const b of buttons) {
    const el = document.createElement('button');
    el.value = b.value; el.textContent = b.label;
    if (b.danger) el.className = 'danger';
    actions.append(el);
  }
  return new Promise((resolve) => {
    dlg.addEventListener('close', () => resolve(dlg.returnValue || buttons[buttons.length - 1].value), { once: true });
    dlg.returnValue = '';
    dlg.showModal();
    (dlg.querySelector('input') || actions.querySelector('button')).focus();
  });
}

// ---------- Oberfläche ----------
function render() {
  $('coins').textContent = state.coins;
  $('streak').textContent = `🔥 ${state.visits.streak} ${state.visits.streak === 1 ? 'Tag' : 'Tage'}`;
  $('account-status').textContent = store.mode === 'account' ? '👤 ' + store.user : '👤 Gast';
  if (!state.pets.length) view = 'adopt';
  $('screen').innerHTML = view === 'adopt' ? adoptHtml() : roomHtml();
  updateNotice();
}

function tabsHtml() {
  const free = state.pets.length < petSlots(state);
  if (state.pets.length < 2 && !free && view === 'room') return '';
  const cur = activePet(state);
  const tabs = state.pets.map((p) => `<button type="button" class="tab${view === 'room' && p === cur ? ' active' : ''}" data-pet="${p.id}">
      ${SPECIES[p.species].icon} ${esc(p.name)}</button>`).join('');
  const add = free && state.pets.length
    ? `<button type="button" class="tab${view === 'adopt' ? ' active' : ''}" data-view="adopt">➕ Adoptieren</button>` : '';
  if (!tabs && !add) return '';
  return `<div class="tabs" role="tablist">${tabs}${add}</div>`;
}

function statBars(pet) {
  return STATS.map(({ key, label, icon }) => {
    const v = Math.round(pet.stats[key]);
    return `<div class="stat"><span class="stat-label">${icon} ${label}</span>
      <span class="bar${v < 25 ? ' low' : ''}" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${v}"><i style="width:${v}%"></i></span>
      <span class="stat-val">${v}</span></div>`;
  }).join('');
}

function actionButtons(pet) {
  const list = pet.sleeping ? ['wake'] : ['pet', 'cuddle', 'feed', 'water', 'play', 'sleep'];
  return list.map((a) => {
    const c = canDo(pet, a, state);
    const locked = a === 'cuddle' && pet.stats.love < CUDDLE_LOVE;
    return `<button type="button" class="act${c.ok ? '' : ' unavailable'}" data-act="${a}" title="${esc(c.ok ? ACTIONS[a].label : c.reason)}">
      <span class="act-icon" aria-hidden="true">${locked ? '🔒' : ACTIONS[a].icon}</span>${ACTIONS[a].label}</button>`;
  }).join('');
}

function roomHtml() {
  const pet = activePet(state);
  const m = mood(pet);
  const sp = SPECIES[pet.species];
  const say = bubble && bubble.until > Date.now() ? bubble.text : m.text;
  return `${tabsHtml()}
    <div class="room-layout">
      <div class="room${pet.sleeping ? ' night' : ''}">
        <div class="bubble" id="bubble" aria-live="polite">${esc(say)}</div>
        <div class="stage" id="stage" title="Mit gedrückter Maus oder dem Finger über ${esc(pet.name)} streichen zum Streicheln">
          ${petSvg(pet.species, pet.color, m.face, { title: `${pet.name}, ${sp.name}` })}
        </div>
        <div class="petname"><b>${esc(pet.name)}</b> <button type="button" class="small" data-rename title="Umbenennen">✏️</button>
          <br><small>${sp.name} · ${m.label || 'schläft'}</small></div>
      </div>
      <div class="side">
        <fieldset class="groupbox"><legend>Werte</legend>${statBars(pet)}</fieldset>
        <fieldset class="groupbox"><legend>Pflege</legend><div class="actions">${actionButtons(pet)}</div></fieldset>
      </div>
    </div>`;
}

function adoptHtml() {
  const first = state.pets.length === 0;
  const full = state.pets.length >= petSlots(state);
  const intro = first
    ? '<h1>Wähle dein erstes Haustier</h1><p>Um dein Tier musst du dich jeden Tag kümmern. Besondere Tiere schaltest du frei, wenn du oft vorbeischaust.</p>'
    : `<h1>Ein weiteres Tier adoptieren</h1><p>Du hast ${state.pets.length} von ${petSlots(state)} Plätzen belegt.</p>`;
  if (full) {
    const n = nextSlotIn(state);
    return `${tabsHtml()}<h1>Kein Platz frei</h1><p>${n ? `Noch ${n} Besuchstage bis zum nächsten Tierplatz.` : 'Du hast schon die größtmögliche Tierfamilie.'}</p>`;
  }
  if (picked) {
    const sp = SPECIES[picked];
    const colors = sp.colors.map((c, i) => `<label class="color-pick"><input type="radio" name="color" value="${c.id}"${i === 0 ? ' checked' : ''}>
        ${petSvg(picked, c.id, 'happy')}<span>${c.name}</span></label>`).join('');
    return `${tabsHtml()}<h1>${sp.icon} ${sp.name} adoptieren</h1>
      <form id="adopt-form">
        <fieldset class="groupbox"><legend>Fellfarbe</legend><div class="colors">${colors}</div></fieldset>
        <fieldset class="groupbox"><legend>Name</legend>
          <input id="pet-name" maxlength="20" value="${esc(pick(sp.names))}" required>
          <button type="button" class="small" id="name-dice" title="Anderer Name">🎲</button></fieldset>
        <div class="dlg-actions"><button type="button" id="adopt-back">« Zurück</button><button type="submit">🏠 Adoptieren</button></div>
      </form>`;
  }
  const cards = Object.entries(SPECIES).map(([id, sp]) => {
    const open = isUnlocked(id, state);
    return `<button type="button" class="card${open ? '' : ' locked'}" data-species="${id}"${open ? '' : ' aria-disabled="true"'}>
      ${petSvg(id, sp.colors[0].id, open ? 'happy' : 'sleep')}
      <b>${open ? '' : '🔒 '}${sp.name}</b><small>${open ? sp.hint : unlockText(id)}</small></button>`;
  }).join('');
  return `${tabsHtml()}${intro}<div class="cards">${cards}</div>`;
}

function updateNotice() {
  const p = store.prefs();
  $('guest-notice').hidden = store.mode !== 'guest' || p.noticeHiddenDay === dayKey(Date.now());
}

function say(text, ms = 4000) {
  bubble = { text, until: Date.now() + ms };
  const el = $('bubble');
  if (el) el.textContent = text;
}

// Kleine aufsteigende Symbole und Zahlen nach einer Aktion
function floaters(delta) {
  const stage = $('stage');
  if (!stage) return;
  const icons = Object.fromEntries(STATS.map((s) => [s.key, s.icon]));
  let i = 0;
  for (const [k, v] of Object.entries(delta)) {
    if (!v) continue;
    const el = document.createElement('span');
    el.className = 'floater' + (v < 0 ? ' minus' : '');
    el.textContent = `${icons[k]} ${v > 0 ? '+' : ''}${v}`;
    el.style.left = `${20 + ((i * 27) % 60)}%`;
    el.style.animationDelay = `${i * 120}ms`;
    stage.append(el);
    setTimeout(() => el.remove(), 1800 + i * 120);
    i++;
  }
  const svg = stage.querySelector('svg');
  if (svg) { svg.classList.remove('bounce'); void svg.getBoundingClientRect(); svg.classList.add('bounce'); }
}

function act(action) {
  const pet = activePet(state);
  if (!pet) return;
  const key = pet.id + ':' + action;
  const now = Date.now();
  if (lastAction[key] && now - lastAction[key] < ACTIONS[action].cooldown) return;
  tickPet(pet, now);
  const r = doAction(pet, action, state, now);
  if (!r.ok) { say(r.text, 3500); return; }
  lastAction[key] = now;
  store.save(state);
  bubble = { text: r.text, until: now + 4000 };
  render();
  floaters(r.delta);
}

async function rename() {
  const pet = activePet(state);
  const r = await dialog('Umbenennen', `<p><label>Neuer Name für ${esc(pet.name)}:<br><input id="rename-input" maxlength="20" value="${esc(pet.name)}"></label></p>`,
    [{ label: 'OK', value: 'ok' }, { label: 'Abbrechen', value: 'cancel' }]);
  const name = cleanName($('rename-input').value);
  if (r !== 'ok' || !name) return;
  pet.name = name;
  store.save(state);
  render();
}

function wire() {
  $('login-link').href = config.loginUrl;
  $('register-link').href = config.registerUrl;
  $('notice-later').addEventListener('click', () => { store.setPrefs({ noticeHiddenDay: dayKey(Date.now()) }); updateNotice(); });

  const screen = $('screen');
  screen.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.act) return act(t.dataset.act);
    if (t.dataset.pet) { state.activePet = t.dataset.pet; view = 'room'; picked = null; bubble = null; store.save(state); return render(); }
    if (t.dataset.view === 'adopt') { view = 'adopt'; picked = null; return render(); }
    if (t.dataset.species) {
      if (!isUnlocked(t.dataset.species, state)) return dialog('Noch gesperrt', `<p>🔒 ${SPECIES[t.dataset.species].name}: ${unlockText(t.dataset.species)} freigeschaltet. Schau jeden Tag vorbei!</p>`, [{ label: 'OK', value: 'ok' }]);
      picked = t.dataset.species; return render();
    }
    if (t.id === 'adopt-back') { picked = null; return render(); }
    if (t.id === 'name-dice') { $('pet-name').value = pick(SPECIES[picked].names); return; }
    if ('rename' in t.dataset) return rename();
  });
  screen.addEventListener('submit', (e) => {
    e.preventDefault();
    const color = screen.querySelector('input[name=color]:checked');
    const r = adopt(state, picked, color && color.value, $('pet-name').value);
    if (!r.ok) { dialog('Adoptieren', `<p>${esc(r.text)}</p>`, [{ label: 'OK', value: 'ok' }]); return; }
    view = 'room'; picked = null;
    store.save(state);
    bubble = { text: `${r.pet.name} ist bei dir eingezogen! Streichle ${r.pet.name}, damit ihr euch kennenlernt.`, until: Date.now() + 8000 };
    render();
  });

  // Streicheln durch Streichen über das Tier, wie bei Nintendogs
  let stroke = null;
  screen.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('#stage')) return;
    stroke = { x: e.clientX, y: e.clientY, dist: 0 };
    e.target.closest('#stage').setPointerCapture?.(e.pointerId);
  });
  screen.addEventListener('pointermove', (e) => {
    if (!stroke) return;
    stroke.dist += Math.hypot(e.clientX - stroke.x, e.clientY - stroke.y);
    stroke.x = e.clientX; stroke.y = e.clientY;
    if (stroke.dist > 140) { stroke.dist = 0; act('pet'); }
  });
  const end = () => { stroke = null; };
  screen.addEventListener('pointerup', end);
  screen.addEventListener('pointercancel', end);

  document.querySelector('[data-open=help]').addEventListener('click', () => dialog('Hilfe',
    `<p>Kümmere dich jeden Tag um dein Haustier. Die Werte sinken mit der Zeit, auch wenn du nicht da bist.
     Krank wird dein Tier nicht, aber es wird traurig, wenn du es vernachlässigst.</p>
     <ul><li><b>Streicheln</b> geht auch, indem du mit der Maus oder dem Finger über dein Tier streichst.</li>
     <li><b>Kuscheln</b> mag dein Tier erst ab ${CUDDLE_LOVE} Liebe.</li>
     <li>Zu oft hintereinander dasselbe wirkt schwächer. Lieber öfter am Tag vorbeischauen.</li>
     <li><b>Erfüllung</b> steigt langsam, wenn es deinem Tier rundum gut geht.</li></ul>
     <p>${store.mode === 'account'
       ? 'Dein Spielstand wird automatisch in deinem Konto gespeichert und ist auf allen Geräten verfügbar.'
       : 'Als Gast wird dein Spielstand nur in diesem Browser gespeichert. Mit einem Konto ist er dauerhaft gesichert und auf allen Geräten verfügbar.'}</p>`,
    [{ label: 'OK', value: 'ok' }]));

  document.querySelector('[data-open=settings]').addEventListener('click', async () => {
    const where = store.mode === 'account' ? `im Konto <b>${esc(store.user)}</b>` : 'nur in diesem Browser (Gast)';
    const r = await dialog('Einstellungen',
      `<fieldset class="groupbox"><legend>Spielstand</legend>
        <p>Gespeichert ${where}.<br>Angefangen am ${fmtDate(state.createdAt)}.<br>
        Besuchstage: ${state.visits.total} · beste Serie: ${state.visits.best}</p></fieldset>`,
      [{ label: 'Spielstand zurücksetzen …', value: 'reset', danger: true }, { label: 'Schließen', value: 'close' }]);
    if (r !== 'reset') return;
    const sure = await dialog('Spielstand zurücksetzen',
      '<p>⚠️ Dein ganzer Fortschritt geht verloren, auch deine Tiere. Das kann nicht rückgängig gemacht werden.</p>',
      [{ label: 'Ja, alles löschen', value: 'yes', danger: true }, { label: 'Abbrechen', value: 'no' }]);
    if (sure !== 'yes') return;
    state = store.reset();
    registerVisit(state);
    store.save(state);
    view = 'adopt'; picked = null; bubble = null;
    render();
  });
}

// ---------- Ablauf ----------
function arrive() {
  const away = tickAll(state);
  if (registerVisit(state)) store.save(state);
  const pet = activePet(state);
  if (pet && away >= 3 && !pet.sleeping) bubble = { text: `${pet.name} hat dich vermisst! ${mood(pet).text}`, until: Date.now() + 6000 };
}

async function start() {
  wire();
  const r = await store.load();
  state = r.state;

  if (r.conflict) {
    const g = r.conflict.guest, a = r.conflict.account;
    const desc = (s) => `${s.pets.length ? s.pets.map((p) => esc(p.name)).join(', ') : 'noch kein Tier'}, zuletzt gespielt ${fmtDate(s.updatedAt)}`;
    const choice = await dialog('Zwei Spielstände gefunden',
      `<p>In diesem Browser gibt es noch einen Gast-Spielstand. Welchen möchtest du behalten?</p>
       <p><b>Konto:</b> ${desc(a)}<br><b>Gast:</b> ${desc(g)}</p>
       <p><small>Der andere wird gelöscht.</small></p>`,
      [{ label: 'Gast-Spielstand', value: 'guest' }, { label: 'Konto-Spielstand', value: 'account' }]);
    state = await store.resolveConflict(choice);
  } else if (r.imported) {
    dialog('Spielstand übernommen', '<p>✅ Dein Gast-Spielstand ist jetzt in deinem Konto gesichert und auf allen Geräten verfügbar.</p>',
      [{ label: 'Prima', value: 'ok' }]);
  }

  arrive();
  render();

  // Speichern beim Verlassen, Abgleich beim Zurückkehren (z. B. nach Spielen auf dem Handy)
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden') { store.flush(true); return; }
    const newer = await store.refresh();
    if (newer) state = newer;
    arrive();
    if (!$('dlg').open && !picked) render();
  });
  window.addEventListener('pagehide', () => { store.flush(true); });
  // Werte sinken weiter, solange das Spiel offen ist; Fehlgeschlagenes Speichern wiederholen
  setInterval(() => {
    tickAll(state);
    if (view === 'room' && state.pets.length && !$('dlg').open) render();
  }, 60000);
  setInterval(() => { if (store.dirty) store.flush(); }, 30000);
}

start().catch((e) => {
  console.error(e);
  $('screen').innerHTML = '<p>⚠️ Das Spiel konnte nicht gestartet werden. Bitte lade die Seite neu.</p>';
});
