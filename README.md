# 🐾 Mein Haustier

Kleines Haustier-Browserspiel für die [Retro-Homepage](https://github.com/99dancor/retro-homepage):
Haustier aussuchen, jeden Tag versorgen, Münzen sammeln und im Shop gegen Futter, Spielzeug und
Accessoires tauschen.

Reines HTML/CSS/JavaScript ohne Build-Schritt und ohne eigene Abhängigkeiten.

## Stand

1. ✅ Grundgerüst und Spielstand
2. ✅ Tiere und Pflege
3. ✅ Münzen, Shop und Inventar
4. ⬜ Eigene Unterseite `/haustier` auf der Homepage

## Spielregeln

Grundlage ist das Konzept in der Projektablage (`haustier/konzept.md`), als „Mischung“ mit dem schon Gebauten.

- **Tiere:** Katze, Hund, Kaninchen, Hamster und Ratte gibt es von Anfang an, je in drei Farben.
  Besondere Tiere schaltet eine Besuchsserie frei: Fuchs ab 3, Axolotl ab 7, Drache ab 14 Tagen in Folge.
- **Werte** von 0 bis 100: Liebe, Spaß, Nahrung, Wasser, Ruhe und Erfüllung. Sie sinken mit der Zeit, auch
  wenn niemand spielt, aber durch Zeit allein nie unter 10. Erfüllung folgt langsam dem Durchschnitt der anderen
  Werte. Jede Art hat eigene Bedürfnisse. Ein Tier stirbt nie, es wird nur traurig.
- **Zuneigungsstufen 1–10:** Jede Pflege bringt Erfahrung, die nie verloren geht. Stufe 3 schaltet Kuscheln frei
  (zusammen mit 70 Liebe), Stufe 5 den zweiten Tierplatz und den Puzzle-Futterball, Stufe 8 die Krone.
  Jede neue Stufe bringt Stufe × 50 Münzen.
- **Tierplätze:** ein Tier zu Beginn, der zweite Platz ab Zuneigungsstufe 5, der dritte für 2.000 Münzen im Shop.
- **Pflege:** Streicheln (auch durch Streichen über das Tier), Kuscheln, Füttern (verbraucht Futter aus dem
  Inventar), Wasser geben (gratis), Spielen (mit einem Spielzeug), Bürsten (Bürste, alle 2 Std), Baden (Seife,
  einmal am Tag), Gassi/Ausflug (Leine für Hund und Fuchs, Laufball für Hamster und Ratte, alle 4 Std, mit Chance
  auf ein Fundstück), Schlafen legen und Aufwecken. Wer dasselbe oft hintereinander macht, bewirkt immer
  weniger; das erholt sich mit der Zeit. Jedes Spielzeug ermüdet für sich.
- **Lieblingssachen** (❤️) wirken 50 % stärker, z. B. Thunfisch für Katzen oder der Ball für Hunde.
- **Start:** ein Ball und 5 × Trockenfutter.

## Münzen und Shop

- **Pflege** bringt 1–5 Münzen je Aktion, höchstens 150 am Tag.
- **Login-Bonus** im 7-Tage-Rhythmus: 20, 25, 30, 35, 40, 50, 100 + Überraschung. Serien von 7/30/100 Tagen
  bringen einmalig 100/500/1.500 extra.
- **Tagesaufgaben:** jeden Tag drei, passend zur Ausrüstung (15–30 Münzen).
- **Konto-Geschenk:** einmalig 200 Münzen und das Homepage-Halstuch.
- **Shop** mit Futter, Spielzeug, Pflege, Accessoires (Kopf, Hals, Rücken) und Räumen, dazu jeden Tag ein Angebot
  mit 30 % Rabatt. Manches gibt es erst ab einer Stufe, einer Serie oder nur zu einer Jahreszeit.
- **Inventar** zum Benutzen, An- und Ablegen und Einrichten.

Noch nicht dabei (laut Konzept „später“): Tricks, Igel, Pinguin, Panda, Einhorn, Abzeichen und saisonale Events.
Gegenstände nur für diese Tiere (Bambus, Igelhandschuh, Eisscholle) fehlen deshalb noch.

Die Zahlen stehen oben in `src/js/pets.js`, `src/js/economy.js` und `src/js/items.js` und lassen sich dort anpassen.

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
src/js/items.js     alle Gegenstände (Futter, Spielzeug, Pflege, Accessoires, Räume)
src/js/economy.js   Münzen, Login-Bonus, Tagesaufgaben, Shop
src/js/art.js       Vektorgrafiken der Tiere, Accessoires und Räume
src/js/storage.js   Laden/Speichern für Gäste und Konten
src/js/main.js      Ablauf und Oberfläche
dev/server.js       lokaler Testserver
test/               Tests (node --test)
```
