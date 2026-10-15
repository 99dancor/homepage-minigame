# 🐾 Mein Haustier

Kleines Haustier-Browserspiel für die [Retro-Homepage](https://github.com/99dancor/retro-homepage):
Haustier aussuchen, jeden Tag versorgen, Münzen sammeln und im Shop gegen Futter, Spielzeug und
Accessoires tauschen.

Reines HTML/CSS/JavaScript ohne Build-Schritt und ohne eigene Abhängigkeiten.

## Stand

1. ✅ Grundgerüst und Spielstand
2. ⬜ Tiere und Pflege
3. ⬜ Münzen, Shop und Inventar
4. ⬜ Eigene Unterseite `/haustier` auf der Homepage

## Spielstand

| Wer | Wo gespeichert |
| --- | --- |
| Gast | nur im Browser (`localStorage`). Das Spiel zeigt einen Hinweis, dass ein Konto den Stand dauerhaft und geräteübergreifend sichert. |
| Angemeldet | im Konto über die Spielstand-Schnittstelle der Homepage (`/api/saves/haustier/main`), dazu eine lokale Kopie für kurze Verbindungsabbrüche |

- Meldet sich jemand an, der vorher als Gast gespielt hat, wird der Gast-Stand ins Konto übernommen.
  Haben beide Stände Fortschritt, fragt das Spiel, welcher bleiben soll.
- Änderungen werden gebündelt hochgeladen und spätestens beim Verlassen der Seite gesichert.
- Kehrt man zum Tab zurück, holt das Spiel einen neueren Stand von einem anderen Gerät.
- Nach einem Start ohne Netz gewinnt beim späteren Abgleich der Kontostand, falls er sich inzwischen
  geändert hat, damit nie echter Fortschritt überschrieben wird.

Die Adressen lassen sich von der einbettenden Seite vorgeben:

```html
<script>window.HAUSTIER_CONFIG = { savesUrl: '/api/saves/haustier', loginUrl: '/login', registerUrl: '/register' };</script>
```

## Lokal ausprobieren

```bash
npm run dev     # http://localhost:8080, spielt die Spielstand-Schnittstelle der Homepage nach
npm test        # Tests für Spielstand und Speichern
```

Auf dem Testserver meldet man sich unter `/login` mit einem beliebigen Namen an (ohne Passwort).
Spielstände im Konto liegen dort nur im Arbeitsspeicher.

## Aufbau

```
src/index.html      Oberfläche
src/css/game.css    Windows-98-Look, übernimmt die Farben aus /theme.css der Homepage
src/js/state.js     Spielstand (reine Funktionen)
src/js/storage.js   Laden/Speichern für Gäste und Konten
src/js/main.js      Ablauf und Oberfläche
dev/server.js       lokaler Testserver
test/               Tests (node --test)
```
