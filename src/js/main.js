// Einstieg: Spielstand laden, Oberfläche zeichnen, regelmäßig speichern.
import { createStore } from './storage.js';
import { registerVisit, dayKey, newState } from './state.js';

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

const store = createStore({
  savesUrl: config.savesUrl,
  ls: (() => { try { return window.localStorage; } catch { return null; } })(),
  onStatus: ({ status }) => { $('save-status').textContent = STATUS_TEXT[status] || status; },
  onReplace: (s) => { state = s; render(); },
});

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
    actions.querySelector('button').focus();
  });
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = (ms) => new Date(ms).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });

// ---------- Oberfläche ----------
function render() {
  $('coins').textContent = state.coins;
  const v = state.visits;
  $('screen').innerHTML = `
    <div class="welcome">
      <div class="big" aria-hidden="true">🏠</div>
      <h1>Willkommen${store.user ? ', ' + esc(store.user) : ''}!</h1>
      <p>Hier zieht bald dein erstes Haustier ein. Schau jeden Tag vorbei, um es zu versorgen.</p>
    </div>
    <div class="stats">
      <div class="sunken"><b>${v.streak}</b>Tage in Folge</div>
      <div class="sunken"><b>${v.best}</b>Beste Serie</div>
      <div class="sunken"><b>${v.total}</b>Besuchstage</div>
    </div>`;
  $('account-status').textContent = store.mode === 'account' ? '👤 ' + store.user : '👤 Gast';
  updateNotice();
}

function updateNotice() {
  const p = store.prefs();
  $('guest-notice').hidden = store.mode !== 'guest' || p.noticeHiddenDay === dayKey(Date.now());
}

function wire() {
  $('login-link').href = config.loginUrl;
  $('register-link').href = config.registerUrl;
  $('notice-later').addEventListener('click', () => { store.setPrefs({ noticeHiddenDay: dayKey(Date.now()) }); updateNotice(); });

  document.querySelector('[data-open=help]').addEventListener('click', () => dialog('Hilfe',
    `<p>Kümmere dich jeden Tag um dein Haustier. Für Pflege bekommst du Münzen, die du im Shop gegen Futter,
     Spielzeug und Accessoires tauschen kannst.</p>
     <p>${store.mode === 'account'
       ? 'Dein Spielstand wird automatisch in deinem Konto gespeichert und ist auf allen Geräten verfügbar.'
       : 'Als Gast wird dein Spielstand nur in diesem Browser gespeichert. Mit einem Konto ist er dauerhaft gesichert und auf allen Geräten verfügbar.'}</p>`,
    [{ label: 'OK', value: 'ok' }]));

  document.querySelector('[data-open=settings]').addEventListener('click', async () => {
    const where = store.mode === 'account' ? `im Konto <b>${esc(store.user)}</b>` : 'nur in diesem Browser (Gast)';
    const r = await dialog('Einstellungen',
      `<fieldset class="groupbox"><legend>Spielstand</legend>
        <p>Gespeichert ${where}.<br>Angefangen am ${fmtDate(state.createdAt)}.</p></fieldset>`,
      [{ label: 'Spielstand zurücksetzen …', value: 'reset', danger: true }, { label: 'Schließen', value: 'close' }]);
    if (r !== 'reset') return;
    const sure = await dialog('Spielstand zurücksetzen',
      '<p>⚠️ Dein ganzer Fortschritt geht verloren. Das kann nicht rückgängig gemacht werden.</p>',
      [{ label: 'Ja, alles löschen', value: 'yes', danger: true }, { label: 'Abbrechen', value: 'no' }]);
    if (sure !== 'yes') return;
    state = store.reset();
    registerVisit(state);
    store.save(state);
    render();
  });
}

// ---------- Ablauf ----------
async function start() {
  wire();
  const r = await store.load();
  state = r.state;

  if (r.conflict) {
    const g = r.conflict.guest, a = r.conflict.account;
    const choice = await dialog('Zwei Spielstände gefunden',
      `<p>In diesem Browser gibt es noch einen Gast-Spielstand. Welchen möchtest du behalten?</p>
       <p><b>Konto:</b> zuletzt gespielt ${fmtDate(a.updatedAt)}<br><b>Gast:</b> zuletzt gespielt ${fmtDate(g.updatedAt)}</p>
       <p><small>Der andere wird gelöscht.</small></p>`,
      [{ label: 'Gast-Spielstand', value: 'guest' }, { label: 'Konto-Spielstand', value: 'account' }]);
    state = await store.resolveConflict(choice);
  } else if (r.imported) {
    dialog('Spielstand übernommen', '<p>✅ Dein Gast-Spielstand ist jetzt in deinem Konto gesichert und auf allen Geräten verfügbar.</p>',
      [{ label: 'Prima', value: 'ok' }]);
  }

  if (registerVisit(state)) store.save(state);
  render();

  // Speichern beim Verlassen, Abgleich beim Zurückkehren (z. B. nach Spielen auf dem Handy)
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden') { store.flush(true); return; }
    const newer = await store.refresh();
    if (newer) state = newer;
    if (registerVisit(state)) store.save(state);
    render();
  });
  window.addEventListener('pagehide', () => { store.flush(true); });
  // Fehlgeschlagenes Speichern regelmäßig wiederholen
  setInterval(() => { if (store.dirty) store.flush(); }, 30000);
}

start().catch((e) => {
  console.error(e);
  $('screen').innerHTML = '<p>⚠️ Das Spiel konnte nicht gestartet werden. Bitte lade die Seite neu.</p>';
});
