# Abi-Trainer (ehemals Deutsch-Trainer)

Tägliche Abfrage-App (PWA) für die Oberstufe, vier Fächer:

- **Deutsch** (291 Karten) – Schwerpunkt Stilmittel (inkl. Verwechslungspaare und mehrere Beispiele pro Mittel),
  Argumentation & Sachtext (Argumenttypen, Konnektoren, Fehlschlüsse, Erörterungsaufbau) und Literaturepochen
  (Werke, Leitbegriffe, Zeiträume, Hintergrund). Dazu Lyrik, Epik, Drama. Sprach-/Kommunikationstheorie ist pausiert.
  Grundlage: LehrplanPLUS Bayern, Deutsch 12/13.
- **Physik** (205 Karten) – nach LehrplanPLUS Bayern, Physik 12 (grundlegendes Niveau): Konstanten & Größenordnungen,
  Werkzeuge (Einheiten, Zehnerpotenzen, Formeln umstellen, Mechanik-Basics), elektrisches Feld, Kondensator,
  Teilchen im Feld & Relativistik, Magnetfeld & Lorentzkraft; Induktion/Schwingkreis (12.2) und Wellen (12.3)
  sind vorbereitet, aber standardmäßig aus. Zufallsaufgaben erzeugen bei jeder Abfrage neue Zahlen.
- **Wirtschaft** (52 Karten, seit 23.10.2026) – WR 12/1 BWL, Ex „Kosten, Erlös, Gewinn, Break-even“ am 28.10.2026:
  Kostenbegriffe, Formeln, Verschiebungen im Kosten-Erlös-Diagramm, Fix oder variabel, Rechnen (Zufallsaufgaben
  Break-even, Gewinnmaximum, Stückkosten, neuer Break-even nach Änderung). Grundlage: Skript S. 6–10 + Mitschrift.
  Deck „Check-up“ (`manual`, `seq`): Aufgaben fürs Blatt in fester Reihenfolge, nur per Knopf, Lösung ggf. mit `tbl`;
  `!!…!!` in Texten = gelb markierte Lücke, `miss: true` = Karte mit ⚠-Hinweis, Deck-Feld `nl` = neue Karten pro Einzelrunde.
  `exam` in `SUBJ.wr`: bis zum Vortag kommt jede Karte nochmal, was am Vortag schwer war, am Prüfungstag.
  (Das W-Seminar-Fach „Arbeitslosigkeit“ lief vom 17.–21.10.2026 und ist seit 23.10. entfernt – `data-wseminar.js` steht in der Git-Historie.)

- **PuG** (49 Karten, seit 24.10.2026) – Kurzarbeit am 27.10.2026: Motive & Faktoren der deutschen Außenpolitik,
  Mindmap 1 (Organisationen, Mittel, Motive, Ziele), Mindmap 2 + Vorgaben des Grundgesetzes, IS-Narrative, Rolle der Medien,
  umfassende Sicherheit, OSZE mit Merksatz. Auswahl nach den Blurtings vom 24.10. Fach-Flag `direct` in `SUBJ.pol`:
  neue Karten ohne Lern-Ansicht sofort zum Aufdecken (eine Runde ≈ 20 Min). IDs `pol-` (Fach-Schlüssel nicht `pg`,
  weil es in Physik ein Deck `pg` gibt).

## Lernprinzipien
- **Active Recall / Testing-Effekt:** Jede Karte wird abgefragt (Multiple Choice oder Aufdecken + Selbsteinschätzung), nicht gelesen.
- **Spaced Repetition:** vereinfachtes SM-2. Bewertung 1–4 bestimmt das nächste Intervall. Karten mit Intervall ≥ 21 Tage gelten als „sitzt“.
- **Interleaving mit Gewichtung:** Neue Karten werden über die Themen verteilt; Themen im Status „Fokus“ kommen dreimal so oft wie „Normal“, „Aus“ pausiert ein Thema.
- **Wenn-Dann-Plan (Gollwitzer):** Beim ersten Start wird ein konkreter Auslöser festgelegt.

## Dateien
- `index.html`, `app.css`, `app.js` – App (Vanilla JS, kein Build)
- `data.js` – Deutsch (`DECKS`, `CARDS`); `data-physik.js` – Physik (`DECKS_PH`, `CARDS_PH`); `data-wr.js` – Wirtschaft (`DECKS_WR`, `CARDS_WR`); `data-pug.js` – PuG (`DECKS_PG`, `CARDS_PG`)
- `vendor/katex/` – KaTeX für Formeln (lokal, damit die App offline läuft)
- `sw.js` – Service Worker (offline). Bei Änderungen `CACHE`-Version hochzählen.
- `manifest.webmanifest`, `icons/` – Installation auf dem Home-Bildschirm

### Karten-Felder
`id` (eindeutig, Physik mit Präfix `ph-`, Wirtschaft mit `wr-`; neues Fach = Eintrag in `SUBJ`, Präfix = Fach-Schlüssel), `deck`, `term`, `def`, `ex`, `exs` (weitere Beispiele), `fx` (Wirkung/Merke),
`q` (eigene Frage, `term` ist dann die Antwort), `ql` (Fragezeile), `wrong` (falsche MC-Antworten), `grp` (feste Antwortgruppe),
`cf` (Verwechslungsgruppe), `noMC` (nur Aufdecken), `gen()` (Zufallsaufgabe). Formeln in `$…$` (KaTeX, Brüche mit `\dfrac`).

Fortschritt liegt ausschließlich in `localStorage` (Schlüssel `dt_state_v2`; der alte Schlüssel `dt_state_v1` wird beim
ersten Start übernommen und als Sicherung liegen gelassen). Export/Import als JSON unter „Mehr“.

## Lokal testen
```bash
python3 -m http.server 8765
```
Dann http://localhost:8765 öffnen.
