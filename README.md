# Deutsch-Trainer

Tägliche Abfrage-App (PWA) für das Grundwissen Deutsch Oberstufe – Stilmittel, Lyrik, Epik, Drama,
Literaturepochen, Sprache & Kommunikation, Argumentation/Aufsatz. Inhalt orientiert am
LehrplanPLUS Bayern, Deutsch 12/13 (Gymnasium).

## Lernprinzipien
- **Active Recall / Testing-Effekt:** Jede Karte wird abgefragt (Multiple Choice oder Aufdecken + Selbsteinschätzung), nicht gelesen.
- **Spaced Repetition:** vereinfachtes SM-2. Bewertung 1–4 bestimmt das nächste Intervall (0 / 1 / 3 / … Tage, Faktor „Ease“). Karten mit Intervall ≥ 21 Tage gelten als „sitzt“.
- **Interleaving:** Neue Karten werden reihum über die Themen verteilt, fällige Karten gemischt.
- **Wenn-Dann-Plan (Gollwitzer):** Beim ersten Start wird ein konkreter Auslöser festgelegt und auf der Startseite angezeigt.
- **Kleine Dosis:** Standard 5 neue Karten/Tag, Tagesziel 12 Antworten – ca. 5 Minuten.

## Dateien
- `index.html`, `app.css`, `app.js` – App (Vanilla JS, kein Build)
- `data.js` – alle Karten (`DECKS`, `CARDS`); neue Karte = neues Objekt mit eindeutiger `id`
- `sw.js` – Service Worker (offline). Bei Änderungen `CACHE`-Version hochzählen.
- `manifest.webmanifest`, `icons/` – Installation auf dem Home-Bildschirm

Fortschritt liegt ausschließlich in `localStorage` (Schlüssel `dt_state_v1`); Export/Import als JSON unter „Mehr“.

## Lokal testen
```bash
python3 -m http.server 8765
```
Dann http://localhost:8765 öffnen.
