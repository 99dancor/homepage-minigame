# 🐾 Mein Haustier

Kleines Haustier-Browserspiel für die [Retro-Homepage](https://github.com/99dancor/retro-homepage):
Haustier aussuchen, jeden Tag versorgen, Münzen sammeln und im Shop gegen Futter, Spielzeug und
Accessoires tauschen.

Reines HTML/CSS/JavaScript ohne Build-Schritt und ohne eigene Abhängigkeiten.

## Stand

1. ✅ Grundgerüst und Spielstand
2. ✅ Tiere und Pflege
3. ⬜ Münzen, Shop und Inventar
4. ⬜ Eigene Unterseite `/haustier` auf der Homepage

## Spielregeln

- **Tiere:** Katze, Hund, Kaninchen, Hamster und Ratte gibt es von Anfang an, je in drei Farben.
  Besondere Tiere schaltet eine Besuchsserie frei: Fuchs ab 3, Axolotl ab 7, Drache ab 14 Tagen in Folge.
- **Tierplätze:** Am Anfang ein Tier, weitere Plätze nach 5, 15 und 30 Besuchstagen (höchstens 4 Tiere).
- **Werte** von 0 bis 100: Liebe, Spaß, Nahrung, Wasser, Ruhe und Erfüllung. Sie sinken mit der Zeit, auch
  wenn niemand spielt. Erfüllung folgt langsam dem Durchschnitt der anderen Werte. Jede Art hat eigene
  Bedürfnisse (Hunde wollen mehr Spaß, Hamster mehr Futter …). Ein Tier stirbt nie, es wird nur traurig.
- **Pflege:** Streicheln (auch durch Streichen mit Maus oder Finger über das Tier), Kuscheln ab 70 Liebe,
  Füttern, Wasser geben, Spielen (braucht Spielzeug, zum Start gibt es einen Ball), Schlafen legen und
  Aufwecken. Wer dasselbe oft hintereinander macht, bewirkt immer weniger; das erholt sich mit der Zeit.
- **Schlaf:** Im Schlaf steigt Ruhe und alles andere sinkt langsamer. Ausgeschlafen wacht das Tier von selbst
  auf, erschöpft schläft es von selbst ein.

Die Zahlen stehen oben in `src/js/pets.js` und lassen sich dort anpassen.

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
src/js/pets.js      Tierarten, Werte, Zeit und Pflege (reine Funktionen)
src/js/art.js       Vektorgrafiken der Tiere
src/js/storage.js   Laden/Speichern für Gäste und Konten
src/js/main.js      Ablauf und Oberfläche
dev/server.js       lokaler Testserver
test/               Tests (node --test)
```
