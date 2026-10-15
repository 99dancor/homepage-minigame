// Lokaler Testserver: liefert das Spiel aus und spielt die Spielstand-Schnittstelle der Homepage nach.
//   npm run dev  ->  http://localhost:8080
// Anmelden/Abmelden geht über /login (beliebiger Name, kein Passwort). Spielstände liegen nur im Speicher.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const PORT = Number(process.env.PORT) || 8080;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
const MAX_BYTES = 5 * 1024 * 1024;
const saves = new Map(); // "user/app/slot" -> { data, updated_at }

function userOf(req) {
  const m = /(?:^|;\s*)dev_user=([^;]+)/.exec(req.headers.cookie || '');
  return m ? decodeURIComponent(m[1]) : null;
}
function json(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > MAX_BYTES + 1024) { reject(new Error('size')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function page(res, html) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html><meta charset="utf-8"><link rel="stylesheet" href="/css/game.css">
    <div class="window" style="max-width:360px;margin:40px auto"><div class="titlebar">🔑 Testserver</div><div class="body">${html}</div></div>`);
}

async function api(req, res, user, app, slot) {
  if (!user) return json(res, 401, { error: 'login' });
  const prefix = `${user}/${app}/`;
  if (!slot) {
    const slots = [...saves.entries()].filter(([k]) => k.startsWith(prefix))
      .map(([k, v]) => ({ slot: k.slice(prefix.length), size: Buffer.byteLength(v.data), updated_at: v.updated_at }));
    return json(res, 200, { user, slots });
  }
  if (!/^[A-Za-z0-9_.-]{1,40}$/.test(slot)) return json(res, 400, { error: 'slot' });
  const key = prefix + slot;
  if (req.method === 'GET') return saves.has(key) ? json(res, 200, { slot, ...saves.get(key) }) : json(res, 404, { error: 'empty' });
  if (req.method === 'DELETE') { saves.delete(key); return json(res, 200, { ok: true }); }
  if (req.method === 'PUT') {
    if (!/^application\/json/.test(req.headers['content-type'] || '')) return json(res, 415, { error: 'json' });
    let body;
    try { body = JSON.parse(await readBody(req)); } catch { return json(res, 400, { error: 'request' }); }
    if (typeof body.data !== 'string') return json(res, 400, { error: 'data' });
    const updated_at = new Date().toISOString();
    saves.set(key, { data: body.data, updated_at });
    return json(res, 200, { ok: true, slot, updated_at });
  }
  json(res, 405, { error: 'method' });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const user = userOf(req);
  const m = /^\/api\/saves\/([^/]+)(?:\/([^/]+))?$/.exec(url.pathname);
  if (m) return api(req, res, user, m[1], m[2]);

  if (url.pathname === '/login' || url.pathname === '/register') {
    if (req.method === 'POST') {
      const name = new URLSearchParams(await readBody(req)).get('name') || 'test';
      res.writeHead(303, { 'Set-Cookie': `dev_user=${encodeURIComponent(name)}; Path=/; SameSite=Lax`, Location: '/' });
      return res.end();
    }
    return page(res, `<form method="post"><p>Angemeldet: <b>${user || '–'}</b></p>
      <p><label>Name <input name="name" value="test"></label></p><button>Anmelden</button></form>
      <form method="post" action="/logout"><p><button>Abmelden</button> <a href="/">Zum Spiel</a></p></form>`);
  }
  if (url.pathname === '/logout') {
    res.writeHead(303, { 'Set-Cookie': 'dev_user=; Path=/; Max-Age=0', Location: '/' });
    return res.end();
  }
  if (url.pathname === '/theme.css') { res.writeHead(200, { 'Content-Type': 'text/css' }); return res.end(''); }

  const file = path.join(ROOT, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); return res.end('Nicht gefunden');
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Testserver: http://localhost:${PORT}`));
