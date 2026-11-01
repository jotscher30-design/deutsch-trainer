# Abi-Trainer (ehemals Deutsch-Trainer)

Tägliche Abfrage-App (PWA) für die Oberstufe, vier Fächer:

- **Deutsch** – seit 01.11.2026 nur Lyrik: Decks `gint` (Gedichtinterpretation: Aufbau, Methode, Schreibhilfe) und
  `lyfb` (Fachbegriffe vom Nachschlageblatt), beide aus den Blättern der Lehrkraft (ByCS `26-28 D3 (Amler)/02 Schreibformate/Lyrik`).
  Stilmittel, Argumentation, Epochen, Drama usw. bleiben in `data.js`, sind aber per Migration `mig = 10` aus (Fortschritt bleibt).
- **Physik** (205 Karten) – nach LehrplanPLUS Bayern, Physik 12 (grundlegendes Niveau): Konstanten & Größenordnungen,
  Werkzeuge (Einheiten, Zehnerpotenzen, Formeln umstellen, Mechanik-Basics), elektrisches Feld, Kondensator,
  Teilchen im Feld & Relativistik, Magnetfeld & Lorentzkraft; Induktion/Schwingkreis (12.2) und Wellen (12.3)
  sind vorbereitet, aber standardmäßig aus. Zufallsaufgaben erzeugen bei jeder Abfrage neue Zahlen. Ex am 10.11.2026 (`exam`).
- **Englisch** (174 Vokabeln, seit 01.11.2026) – aus den Vocab sheets der Lehrkraft (ByCS `Q12 Englisch - 12e5 (gob)`),
  ein Deck pro Blatt, Abfrage Deutsch → Englisch nur Aufdecken (`direct`, `mc: 0`). Neues Blatt = neues Deck in `data-en.js`.
- **Religion** (seit 01.11.2026) – Klausur am 13.11.2026, Startkarten aus den ByCS-Dateien „Klausur Schwerpunkte“ und
  „Beispiel für Klausur“ (30.10.) sowie S12–S21. Ausbau übernimmt der Religion-Chat. IDs `rel-`.
- Wirtschaft und PuG wurden am 01.11.2026 entfernt (Dateien in der Git-Historie, Verlauf bleibt in der Serie).

## Lernprinzipien
- **Active Recall / Testing-Effekt:** Jede Karte wird abgefragt (Multiple Choice oder Aufdecken + Selbsteinschätzung), nicht gelesen.
- **Spaced Repetition:** vereinfachtes SM-2. Bewertung 1–4 bestimmt das nächste Intervall. Karten mit Intervall ≥ 21 Tage gelten als „sitzt“.
- **Interleaving mit Gewichtung:** Neue Karten werden über die Themen verteilt; Themen im Status „Fokus“ kommen dreimal so oft wie „Normal“, „Aus“ pausiert ein Thema.
- **Wenn-Dann-Plan (Gollwitzer):** Beim ersten Start wird ein konkreter Auslöser festgelegt.

## Dateien
- `index.html`, `app.css`, `app.js` – App (Vanilla JS, kein Build)
- `data.js` – Deutsch (`DECKS`, `CARDS`); `data-physik.js` – Physik (`DECKS_PH`, `CARDS_PH`); `data-en.js` – Englisch (`DECKS_EN`, `CARDS_EN`); `data-rel.js` – Religion (`DECKS_REL`, `CARDS_REL`)
- `vendor/katex/` – KaTeX für Formeln (lokal, damit die App offline läuft)
- `sw.js` – Service Worker (offline). Bei Änderungen `CACHE`-Version hochzählen.
- `manifest.webmanifest`, `icons/` – Installation auf dem Home-Bildschirm

### Karten-Felder
`id` (eindeutig, Physik mit Präfix `ph-`, Englisch `en-`, Religion `rel-`; neues Fach = Eintrag in `SUBJ`, Präfix = Fach-Schlüssel), `deck`, `term`, `def`, `ex`, `exs` (weitere Beispiele), `fx` (Wirkung/Merke),
`q` (eigene Frage, `term` ist dann die Antwort), `ql` (Fragezeile), `wrong` (falsche MC-Antworten), `grp` (feste Antwortgruppe),
`cf` (Verwechslungsgruppe), `noMC` (nur Aufdecken), `gen()` (Zufallsaufgabe). Formeln in `$…$` (KaTeX, Brüche mit `\dfrac`).

Fortschritt liegt ausschließlich in `localStorage` (Schlüssel `dt_state_v2`; der alte Schlüssel `dt_state_v1` wird beim
ersten Start übernommen und als Sicherung liegen gelassen). Export/Import als JSON unter „Mehr“.

## Lokal testen
```bash
python3 -m http.server 8765
```
Dann http://localhost:8765 öffnen.
