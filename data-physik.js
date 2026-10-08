/* Physik – Karteninhalt
 * Grundlage: LehrplanPLUS Bayern, Physik 12 (grundlegendes Anforderungsniveau, 3 Wochenstunden),
 * dazu Jonas’ Heft und Arbeitsblätter zu „Elektrische Felder“ (Stand 08.10.2026).
 *
 * Felder: id, deck, q (Frage), term (Antwort), def (Erklärung), fx (Merke / Falle),
 *         wrong (falsche Antworten für Multiple Choice), noMC (nur Aufdecken),
 *         gen (Zufallsaufgabe: liefert bei jedem Aufruf neue Zahlen → {q, term, wrong, def, svg?})
 * Formeln stehen in $…$ und werden mit KaTeX gesetzt (gestapelte Brüche via \dfrac).
 * Mehrzeilige Antworten: Zeilen mit L(…) verbinden – eine Regel pro Zeile.
 */
const DECKS_PH = [
  { id: 'pk', name: 'Konstanten & Größenordnungen',     short: 'Konstanten', color: '#c92a2a', q: 'Wert?', def: 2 },
  { id: 'pe', name: 'Elektrisches Feld',                short: 'E-Feld',     color: '#1971c2', q: 'Frage', def: 2 },
  { id: 'pc', name: 'Kondensator',                      short: 'Kondensator', color: '#0c8599', q: 'Frage', def: 2 },
  { id: 'pg', name: 'Werkzeuge: Einheiten, Potenzen, Basics', short: 'Werkzeuge', color: '#5c6370', q: 'Frage', def: 1 },
  { id: 'pt', name: 'Teilchen im E-Feld & Relativistik', short: 'Teilchen',  color: '#5f3dc4', q: 'Frage', def: 1 },
  { id: 'pm', name: 'Magnetfeld & Lorentzkraft',        short: 'B-Feld',     color: '#e8590c', q: 'Frage', def: 1 },
  { id: 'pi', name: 'Induktion & Schwingkreis (12.2)',  short: 'Induktion',  color: '#2f9e44', q: 'Frage', def: 0 },
  { id: 'pw', name: 'Elektromagnetische Wellen (12.3)', short: 'Wellen',     color: '#9c36b5', q: 'Frage', def: 0 },
];

const CARDS_PH = (() => {
  const T = String.raw;
  const L = (...a) => a.join('\n');
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const dz = x => String(x).replace('.', '{,}');
  // Zahl in wissenschaftlicher Schreibweise als TeX (deutsches Komma)
  const sci = (x, sig = 2) => {
    if (x === 0) return '0';
    let e = Math.floor(Math.log10(Math.abs(x)));
    let m = +(x / Math.pow(10, e)).toPrecision(sig);
    if (Math.abs(m) >= 10) { m = +(m / 10).toPrecision(sig); e++; }
    return e === 0 ? dz(m) : `${dz(m)} \\cdot 10^{${e}}`;
  };
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const red = ([n, d]) => { const g = gcd(n, d); return [n / g, d / g]; };
  const fac = p => { const [n, d] = red(p); return n === d ? 'bleibt gleich' : d === 1 ? `$\\times\\,${n}$` : `$\\times\\,\\dfrac{${n}}{${d}}$`; };
  // Antwortoptionen eindeutig machen und auf 3 falsche begrenzen
  const opts = (right, cands) => { const seen = new Set([right]); const out = []; for (const c of cands) if (!seen.has(c)) { seen.add(c); out.push(c); } return out.slice(0, 3); };
  const facOpts = (right, cands) => {
    const [n, d] = right; // Ersatz-Optionen, falls die typischen Fehler zufällig mit der Lösung zusammenfallen
    return opts(fac(right), [...cands, [d, n], [2 * n, d], [n, 2 * d], [n * n, d * d], [1, 1], [3 * n, d]].map(fac));
  };
  const Vm = T`\,\dfrac{\mathrm{V}}{\mathrm{m}}`;
  const DIRS = ['↑ nach oben', '↓ nach unten', '← nach links', '→ nach rechts'];
  const dirName = ([x, y]) => y > 0 ? DIRS[0] : y < 0 ? DIRS[1] : x < 0 ? DIRS[2] : DIRS[3];
  const arrowDefs = id => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--ink)"/></marker></defs>`;
  const particle = (cx, cy, p) => `<circle cx="${cx}" cy="${cy}" r="14" style="fill:${p === 'e' ? '#1971c2' : '#e03131'}"/><text x="${cx}" y="${cy + 6}" text-anchor="middle" style="fill:#fff;font:700 18px -apple-system,sans-serif">${p === 'e' ? '−' : '+'}</text>`;

  // Lorentzkraft: Teilchen, Geschwindigkeit, B senkrecht zur Zeichenebene
  function lorentzSVG(v, bz, p) {
    const id = 'ah' + Math.random().toString(36).slice(2, 7), cx = 130, cy = 88;
    let sym = '';
    for (let x = 30; x <= 230; x += 40) for (let y = 22; y <= 140; y += 32) {
      if (Math.hypot(x - cx, y - cy) < 48 || Math.hypot(x - (cx + v[0] * 62), y - (cy - v[1] * 62)) < 22) continue;
      sym += `<circle cx="${x}" cy="${y}" r="7" style="fill:none;stroke:var(--muted);stroke-width:1.4"/>` +
        (bz < 0 ? `<path d="M${x - 4},${y - 4} L${x + 4},${y + 4} M${x + 4},${y - 4} L${x - 4},${y + 4}" style="stroke:var(--muted);stroke-width:1.4"/>` : `<circle cx="${x}" cy="${y}" r="2" style="fill:var(--muted)"/>`);
    }
    const x1 = cx + v[0] * 17, y1 = cy - v[1] * 17, x2 = cx + v[0] * 70, y2 = cy - v[1] * 70;
    return `<svg viewBox="0 0 260 176" class="fig" role="img" aria-label="Skizze">${arrowDefs(id)}${sym}
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:var(--ink);stroke-width:3" marker-end="url(#${id})"/>
      <text x="${x2 + (v[0] ? v[0] * 10 : 12)}" y="${y2 + (v[1] ? -v[1] * 12 : -8) + 5}" text-anchor="middle" style="fill:var(--ink);font:italic 700 17px Georgia,serif">v</text>
      ${particle(cx, cy, p)}
      <text x="8" y="170" style="fill:var(--muted);font:13px -apple-system,sans-serif">B ${bz < 0 ? '⊗ in die Ebene hinein' : '⊙ aus der Ebene heraus'}</text></svg>`;
  }
  // Plattenkondensator mit Ladungsvorzeichen
  function plateSVG(orient, plusFirst, p) {
    const s1 = plusFirst ? '+' : '−', s2 = plusFirst ? '−' : '+';
    const signs = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');
    const txt = (x, y, s) => `<text x="${x}" y="${y}" text-anchor="middle" style="fill:var(--ink);font:700 16px -apple-system,sans-serif">${s}</text>`;
    let g = '';
    if (orient === 'h') {
      g = `<rect x="40" y="20" width="12" height="136" rx="2" style="fill:var(--muted)"/><rect x="208" y="20" width="12" height="136" rx="2" style="fill:var(--muted)"/>` +
        signs(5, i => txt(28, 40 + i * 26, s1)) + signs(5, i => txt(234, 40 + i * 26, s2));
    } else {
      g = `<rect x="40" y="16" width="180" height="12" rx="2" style="fill:var(--muted)"/><rect x="40" y="148" width="180" height="12" rx="2" style="fill:var(--muted)"/>` +
        signs(6, i => txt(56 + i * 30, 12, s1)) + signs(6, i => txt(56 + i * 30, 176, s2));
    }
    return `<svg viewBox="0 0 260 182" class="fig" role="img" aria-label="Skizze">${g}${p ? particle(130, 88, p) : ''}</svg>`;
  }

  return [
    /* ───────────── KONSTANTEN & GRÖSSENORDNUNGEN ───────────── */
    { id:'ph-k01', deck:'pk', q:T`Elementarladung $e$`, term:T`$e = 1{,}602 \cdot 10^{-19}\,\mathrm{C}$`,
      wrong:[T`$e = 1{,}602 \cdot 10^{-31}\,\mathrm{C}$`, T`$e = 9{,}11 \cdot 10^{-19}\,\mathrm{C}$`, T`$e = 1{,}602 \cdot 10^{19}\,\mathrm{C}$`, T`$e = 6{,}24 \cdot 10^{-18}\,\mathrm{C}$`],
      def:T`Kleinste frei vorkommende Ladung. Elektron: $-e$, Proton: $+e$. Jede Ladung ist ein Vielfaches: $Q = N \cdot e$.`, fx:T`Kehrwert: $1\,\mathrm{C}$ sind $6{,}24 \cdot 10^{18}$ Elementarladungen (Aufgabe aus deinem Heft).` },
    { id:'ph-k02', deck:'pk', q:T`Masse des Elektrons $m_e$`, term:T`$m_e = 9{,}11 \cdot 10^{-31}\,\mathrm{kg}$`,
      wrong:[T`$m_e = 1{,}67 \cdot 10^{-27}\,\mathrm{kg}$`, T`$m_e = 9{,}11 \cdot 10^{-27}\,\mathrm{kg}$`, T`$m_e = 1{,}602 \cdot 10^{-31}\,\mathrm{kg}$`, T`$m_e = 9{,}11 \cdot 10^{-13}\,\mathrm{kg}$`],
      def:'Rund 1836-mal leichter als ein Proton.', fx:'Merkhilfe: 9-1-1 wie der US-Notruf, Exponent minus 31.' },
    { id:'ph-k03', deck:'pk', q:T`Masse des Protons $m_p$`, term:T`$m_p = 1{,}67 \cdot 10^{-27}\,\mathrm{kg}$`,
      wrong:[T`$m_p = 6{,}67 \cdot 10^{-27}\,\mathrm{kg}$`, T`$m_p = 9{,}11 \cdot 10^{-31}\,\mathrm{kg}$`, T`$m_p = 1{,}67 \cdot 10^{-31}\,\mathrm{kg}$`, T`$m_p = 1{,}67 \cdot 10^{-24}\,\mathrm{kg}$`],
      def:T`Etwa 1836-mal so schwer wie ein Elektron. Neutron fast gleich: $1{,}675 \cdot 10^{-27}\,\mathrm{kg}$.`,
      fx:T`Falle: NICHT 6,67 – das ist die Gravitationskonstante. Genau das steht in deinem Heft bei der Proton-Aufgabe ($m_p = 6{,}67 \cdot 10^{-27}$ kg) – dadurch wird die Gravitationskraft 16-mal zu groß.` },
    { id:'ph-k04', deck:'pk', q:T`Elektrische Feldkonstante $\varepsilon_0$`, term:T`$\varepsilon_0 = 8{,}85 \cdot 10^{-12}\,\dfrac{\mathrm{As}}{\mathrm{Vm}}$`,
      wrong:[T`$\varepsilon_0 = 8{,}85 \cdot 10^{12}\,\dfrac{\mathrm{As}}{\mathrm{Vm}}$`, T`$\varepsilon_0 = 8{,}99 \cdot 10^{9}\,\dfrac{\mathrm{As}}{\mathrm{Vm}}$`, T`$\varepsilon_0 = 6{,}67 \cdot 10^{-11}\,\dfrac{\mathrm{As}}{\mathrm{Vm}}$`, T`$\varepsilon_0 = 1{,}26 \cdot 10^{-6}\,\dfrac{\mathrm{As}}{\mathrm{Vm}}$`],
      def:T`Steht im Coulomb-Gesetz und in der Kapazität: $C = \varepsilon_0 \varepsilon_r \dfrac{A}{d}$. Genauer: $8{,}854 \cdot 10^{-12}$.`, fx:T`Einheit $\dfrac{\mathrm{As}}{\mathrm{Vm}} = \dfrac{\mathrm{C}^2}{\mathrm{N\,m^2}} = \dfrac{\mathrm{F}}{\mathrm{m}}$.` },
    { id:'ph-k05', deck:'pk', q:T`Coulomb-Konstante $k = \dfrac{1}{4\pi\varepsilon_0}$`, term:T`$k = 8{,}99 \cdot 10^{9}\,\dfrac{\mathrm{N\,m^2}}{\mathrm{C^2}}$`,
      wrong:[T`$k = 8{,}85 \cdot 10^{-12}\,\dfrac{\mathrm{N\,m^2}}{\mathrm{C^2}}$`, T`$k = 8{,}99 \cdot 10^{-9}\,\dfrac{\mathrm{N\,m^2}}{\mathrm{C^2}}$`, T`$k = 6{,}67 \cdot 10^{-11}\,\dfrac{\mathrm{N\,m^2}}{\mathrm{C^2}}$`],
      def:T`Abkürzung fürs Rechnen: $F = k \cdot \dfrac{Q_1 Q_2}{r^2}$ – spart den Bruch mit $4\pi\varepsilon_0$ im Taschenrechner.`, fx:T`Merke: ungefähr $9 \cdot 10^{9}$.` },
    { id:'ph-k06', deck:'pk', q:T`Gravitationskonstante $G$`, term:T`$G = 6{,}67 \cdot 10^{-11}\,\dfrac{\mathrm{m^3}}{\mathrm{kg\,s^2}}$`,
      wrong:[T`$G = 6{,}67 \cdot 10^{-27}\,\dfrac{\mathrm{m^3}}{\mathrm{kg\,s^2}}$`, T`$G = 9{,}81\,\dfrac{\mathrm{m^3}}{\mathrm{kg\,s^2}}$`, T`$G = 6{,}67 \cdot 10^{11}\,\dfrac{\mathrm{m^3}}{\mathrm{kg\,s^2}}$`, T`$G = 8{,}85 \cdot 10^{-12}\,\dfrac{\mathrm{m^3}}{\mathrm{kg\,s^2}}$`],
      def:T`Im Gravitationsgesetz $F = G \cdot \dfrac{m_1 m_2}{r^2}$.` },
    { id:'ph-k07', deck:'pk', q:T`Fallbeschleunigung $g$`, term:T`$g = 9{,}81\,\dfrac{\mathrm{m}}{\mathrm{s^2}}$`,
      wrong:[T`$g = 9{,}81\,\dfrac{\mathrm{m}}{\mathrm{s}}$`, T`$g = 98{,}1\,\dfrac{\mathrm{m}}{\mathrm{s^2}}$`, T`$g = 0{,}981\,\dfrac{\mathrm{m}}{\mathrm{s^2}}$`],
      def:T`Auch als Ortsfaktor: $9{,}81\,\dfrac{\mathrm{N}}{\mathrm{kg}}$.` },
    { id:'ph-k08', deck:'pk', q:T`Lichtgeschwindigkeit $c$`, term:T`$c = 3{,}00 \cdot 10^{8}\,\dfrac{\mathrm{m}}{\mathrm{s}}$`,
      wrong:[T`$c = 3{,}00 \cdot 10^{5}\,\dfrac{\mathrm{m}}{\mathrm{s}}$`, T`$c = 3{,}00 \cdot 10^{8}\,\dfrac{\mathrm{km}}{\mathrm{s}}$`, T`$c = 3{,}00 \cdot 10^{6}\,\dfrac{\mathrm{m}}{\mathrm{s}}$`],
      def:T`$= 300\,000\,\mathrm{km/s}$. Genauer: $2{,}998 \cdot 10^{8}\,\mathrm{m/s}$.`, fx:'Nichts mit Masse erreicht c – wichtig für die Relativistik.' },
    { id:'ph-k09', deck:'pk', q:T`Magnetische Feldkonstante $\mu_0$`, term:T`$\mu_0 = 4\pi \cdot 10^{-7}\,\dfrac{\mathrm{Vs}}{\mathrm{Am}} \approx 1{,}26 \cdot 10^{-6}\,\dfrac{\mathrm{Vs}}{\mathrm{Am}}$`,
      wrong:[T`$\mu_0 = 4\pi \cdot 10^{-12}\,\dfrac{\mathrm{Vs}}{\mathrm{Am}}$`, T`$\mu_0 = 8{,}85 \cdot 10^{-12}\,\dfrac{\mathrm{Vs}}{\mathrm{Am}}$`, T`$\mu_0 = 4\pi \cdot 10^{7}\,\dfrac{\mathrm{Vs}}{\mathrm{Am}}$`],
      def:T`Für das Feld einer langen Spule: $B = \mu_0 \mu_r \dfrac{N I}{l}$.` },
    { id:'ph-k10', deck:'pk', q:T`Planck’sches Wirkungsquantum $h$`, term:T`$h = 6{,}63 \cdot 10^{-34}\,\mathrm{Js}$`,
      wrong:[T`$h = 6{,}63 \cdot 10^{-31}\,\mathrm{Js}$`, T`$h = 6{,}67 \cdot 10^{-34}\,\mathrm{Js}$`, T`$h = 1{,}602 \cdot 10^{-34}\,\mathrm{Js}$`, T`$h = 6{,}63 \cdot 10^{34}\,\mathrm{Js}$`],
      def:T`Photonenenergie $E = h \cdot f$. Brauchst du bei Röntgenstrahlung (12.3).` },
    { id:'ph-k11', deck:'pk', q:T`$1$ Elektronvolt in Joule`, term:T`$1\,\mathrm{eV} = 1{,}602 \cdot 10^{-19}\,\mathrm{J}$`,
      wrong:[T`$1\,\mathrm{eV} = 9{,}11 \cdot 10^{-31}\,\mathrm{J}$`, T`$1\,\mathrm{eV} = 1{,}602 \cdot 10^{19}\,\mathrm{J}$`, T`$1\,\mathrm{eV} = 6{,}24 \cdot 10^{18}\,\mathrm{J}$`],
      def:T`Energie, die ein Teilchen mit Ladung $e$ beim Durchlaufen von $1\,\mathrm{V}$ gewinnt: $W = e \cdot U$.`, fx:'Gleiche Ziffern wie e – nur die Einheit J statt C.' },
    { id:'ph-k12', deck:'pk', q:T`Spezifische Ladung des Elektrons $\dfrac{e}{m_e}$`, term:T`$1{,}76 \cdot 10^{11}\,\dfrac{\mathrm{C}}{\mathrm{kg}}$`,
      wrong:[T`$1{,}76 \cdot 10^{-11}\,\dfrac{\mathrm{C}}{\mathrm{kg}}$`, T`$9{,}58 \cdot 10^{7}\,\dfrac{\mathrm{C}}{\mathrm{kg}}$`, T`$1{,}76 \cdot 10^{8}\,\dfrac{\mathrm{C}}{\mathrm{kg}}$`],
      def:T`Wird im Fadenstrahlrohr gemessen: $\dfrac{e}{m} = \dfrac{2U}{B^2 r^2}$. Proton zum Vergleich: $9{,}58 \cdot 10^{7}\,\mathrm{C/kg}$.`, fx:T`Selbst prüfen: $1{,}602 \cdot 10^{-19} : 9{,}11 \cdot 10^{-31} \approx 1{,}76 \cdot 10^{11}$.` },
    { id:'ph-k13', deck:'pk', q:T`Ruheenergie des Elektrons $m_e c^2$`, term:T`$511\,\mathrm{keV} \approx 8{,}19 \cdot 10^{-14}\,\mathrm{J}$`,
      wrong:[T`$511\,\mathrm{eV}$`, T`$511\,\mathrm{MeV}$`, T`$938\,\mathrm{keV}$`],
      def:'Liegt die Bewegungsenergie in dieser Größenordnung, muss relativistisch gerechnet werden. Proton: 938 MeV.' },
    { id:'ph-k14', deck:'pk', q:T`Atomare Masseneinheit $u$`, term:T`$1\,u = 1{,}66 \cdot 10^{-27}\,\mathrm{kg}$`,
      wrong:[T`$1\,u = 1{,}66 \cdot 10^{-24}\,\mathrm{kg}$`, T`$1\,u = 9{,}11 \cdot 10^{-31}\,\mathrm{kg}$`, T`$1\,u = 6{,}02 \cdot 10^{23}\,\mathrm{kg}$`],
      def:T`Ungefähr die Masse eines Protons oder Neutrons. Im Massenspektrometer werden Massen oft in $u$ angegeben (Kohlenstoff-12: genau 12 u).` },
    { id:'ph-k20', deck:'pk', q:T`Wie viele Elementarladungen ergeben $1\,\mathrm{C}$?`, term:T`$6{,}24 \cdot 10^{18}$`,
      wrong:[T`$1{,}602 \cdot 10^{-19}$`, T`$6{,}02 \cdot 10^{23}$`, T`$6{,}24 \cdot 10^{19}$`],
      def:T`$N = \dfrac{Q}{e} = \dfrac{1\,\mathrm{C}}{1{,}602 \cdot 10^{-19}\,\mathrm{C}} = 6{,}24 \cdot 10^{18}$` },
    { id:'ph-k21', deck:'pk', ql:'Was ist das?', q:T`$9{,}11 \cdot 10^{-31}\,\mathrm{kg}$`, term:T`Masse des Elektrons $m_e$`,
      wrong:[T`Masse des Protons $m_p$`, T`atomare Masseneinheit $u$`, T`Masse des Neutrons $m_n$`] },
    { id:'ph-k22', deck:'pk', ql:'Was ist das?', q:T`$1{,}67 \cdot 10^{-27}\,\mathrm{kg}$`, term:T`Masse des Protons $m_p$`,
      wrong:[T`Masse des Elektrons $m_e$`, T`Gravitationskonstante $G$`, T`Masse eines Wasserstoffmoleküls`] },
    { id:'ph-k23', deck:'pk', ql:'Was ist das?', q:T`$8{,}85 \cdot 10^{-12}\,\dfrac{\mathrm{As}}{\mathrm{Vm}}$`, term:T`elektrische Feldkonstante $\varepsilon_0$`,
      wrong:[T`magnetische Feldkonstante $\mu_0$`, T`Coulomb-Konstante $k$`, T`Gravitationskonstante $G$`] },
    { id:'ph-k24', deck:'pk', ql:'Was ist das?', q:T`$6{,}67 \cdot 10^{-11}\,\dfrac{\mathrm{m^3}}{\mathrm{kg\,s^2}}$`, term:T`Gravitationskonstante $G$`,
      wrong:[T`elektrische Feldkonstante $\varepsilon_0$`, T`Masse des Protons $m_p$`, T`Planck’sches Wirkungsquantum $h$`] },
    { id:'ph-k15', deck:'pk', q:'Größenordnung: Durchmesser eines Atoms', term:T`$\approx 10^{-10}\,\mathrm{m}$ (1 Ångström)`,
      wrong:[T`$\approx 10^{-15}\,\mathrm{m}$`, T`$\approx 10^{-6}\,\mathrm{m}$`, T`$\approx 10^{-20}\,\mathrm{m}$`], def:'Der Atomkern ist rund 10 000- bis 100 000-mal kleiner.' },
    { id:'ph-k16', deck:'pk', q:'Größenordnung: Durchmesser eines Atomkerns', term:T`$\approx 10^{-15}$ bis $10^{-14}\,\mathrm{m}$`,
      wrong:[T`$\approx 10^{-10}\,\mathrm{m}$`, T`$\approx 10^{-6}\,\mathrm{m}$`, T`$\approx 10^{-24}\,\mathrm{m}$`], def:T`Deshalb rechnet man bei zwei Protonen im Kern mit $r \approx 10^{-14}\,\mathrm{m}$ wie in deiner Heft-Aufgabe.` },
    { id:'ph-k17', deck:'pk', q:'Größenordnung: Durchschlagfeldstärke trockener Luft', term:T`$\approx 3 \cdot 10^{6}\,\dfrac{\mathrm{V}}{\mathrm{m}}$ (3 kV pro mm)`,
      wrong:[T`$\approx 3 \cdot 10^{3}\,\dfrac{\mathrm{V}}{\mathrm{m}}$`, T`$\approx 3 \cdot 10^{9}\,\dfrac{\mathrm{V}}{\mathrm{m}}$`, T`$\approx 3\,\dfrac{\mathrm{V}}{\mathrm{m}}$`],
      def:'Darüber springen Funken über (Blitz, Zündkerze).', fx:T`Plausibilitäts-Check: Kommt im Schul-Kondensator $10^{9}\,\mathrm{V/m}$ heraus, ist irgendwo eine Einheit falsch umgerechnet.` },
    { id:'ph-k18', deck:'pk', q:'Größenordnung: Erdmagnetfeld', term:T`$\approx 5 \cdot 10^{-5}\,\mathrm{T}$ (50 µT)`,
      wrong:[T`$\approx 5\,\mathrm{T}$`, T`$\approx 5 \cdot 10^{-2}\,\mathrm{T}$`, T`$\approx 5 \cdot 10^{-9}\,\mathrm{T}$`],
      def:'Zum Vergleich: Fadenstrahlrohr (Helmholtz-Spulen) ≈ 1 mT, Kühlschrankmagnet ≈ 5 mT, MRT 1,5 bis 3 T.' },
    { id:'ph-k19', deck:'pk', q:T`Größenordnung: Kapazität eines Schul-Plattenkondensators ($A \approx 0{,}04\,\mathrm{m^2}$, $d \approx 3\,\mathrm{mm}$)`, term:T`$\approx 10^{-10}\,\mathrm{F}$ (rund 100 pF)`,
      wrong:[T`$\approx 10^{-4}\,\mathrm{F}$`, T`$\approx 1\,\mathrm{F}$`, T`$\approx 10^{-16}\,\mathrm{F}$`],
      def:T`$C = 8{,}85 \cdot 10^{-12} \cdot \dfrac{0{,}04}{0{,}003}\,\mathrm{F} \approx 1{,}2 \cdot 10^{-10}\,\mathrm{F}$.`, fx:'1 F ist riesig – das schaffen nur Superkondensatoren.' },

    /* ───────────── ELEKTRISCHES FELD ───────────── */
    { id:'ph-e01', deck:'pe', noMC:true, q:'Wann besteht an einem Ort ein elektrisches Feld?', term:'Wenn dort auf einen elektrisch geladenen Körper eine Kraft wirkt.',
      def:'Nachweis immer über die Kraft auf eine kleine, positive Probeladung.' },
    { id:'ph-e02', deck:'pe', q:'Wie ist die Richtung des elektrischen Feldes festgelegt?', term:'Als Richtung der Kraft auf eine POSITIVE Probeladung.',
      wrong:['Als Richtung der Kraft auf eine negative Probeladung.', 'Als Flugrichtung der Elektronen.', 'Immer vom Minuspol zum Pluspol.'],
      fx:'Folge: Elektronen erfahren eine Kraft ENTGEGEN der Feldrichtung.' },
    { id:'ph-e03', deck:'pe', noMC:true, q:'Vier Eigenschaften elektrischer Feldlinien', term:L('Beginnen bei positiven, enden bei negativen Ladungen (Quellen und Senken).', 'Schneiden sich nie.', 'Stehen senkrecht auf Leiteroberflächen.', 'Ihre Dichte zeigt die Feldstärke.'),
      fx:'Außerdem: Sie geben die Kraftrichtung auf positive Ladungen an (dein Heft).' },
    { id:'ph-e04', deck:'pe', q:'Homogenes Feld – Kennzeichen und Beispiel', term:'Überall gleiche Stärke und Richtung, Feldlinien parallel und gleich dicht. Beispiel: Inneres eines Plattenkondensators.',
      wrong:['Feldlinien laufen sternförmig auseinander. Beispiel: Punktladung.', 'Feldlinien sind geschlossene Kreise. Beispiel: stromdurchflossener Leiter.', 'Feldlinien laufen in Bögen von + nach −. Beispiel: zwei entgegengesetzte Ladungen.'],
      fx:'Am Rand des Kondensators ist das Feld nicht mehr homogen (Randfeld).' },
    { id:'ph-e05', deck:'pe', q:'Radialfeld – Kennzeichen und Beispiel', term:T`Feldlinien laufen sternförmig nach außen (bzw. innen); inhomogen, die Stärke nimmt mit $\dfrac{1}{r^2}$ ab. Beispiel: Punktladung, geladene Kugel.`,
      wrong:['Überall gleich stark. Beispiel: Plattenkondensator.', 'Geschlossene Feldlinien. Beispiel: Spule.', 'Feldlinien in Bögen von + nach −. Beispiel: Dipol.'] },
    { id:'ph-e06', deck:'pe', q:'Feld zweier entgegengesetzt gleich großer Ladungen', term:'Dipolfeld',
      wrong:['homogenes Feld', 'Radialfeld', 'Quellenfreies Feld'],
      def:'Feldlinien laufen in Bögen von + nach −, zwischen den Ladungen am dichtesten.', fx:'Zwei GLEICHnamige Ladungen: Die Feldlinien weichen einander aus, genau in der Mitte ist ein feldfreier Punkt.' },
    { id:'ph-e07', deck:'pe', noMC:true, q:'Gibt es elektrische Monopole? Und magnetische?', term:L('Elektrisch: ja – eine einzelne Ladung.', 'Magnetisch: nein – Nord- und Südpol treten immer gemeinsam auf.'),
      def:'Steht so in deinem Heft. Deshalb sind magnetische Feldlinien immer geschlossen.' },
    { id:'ph-e08', deck:'pe', q:'Definition der elektrischen Feldstärke', term:T`$\vec{E} = \dfrac{\vec{F}}{q}$`,
      wrong:[T`$\vec{E} = \vec{F} \cdot q$`, T`$\vec{E} = \dfrac{q}{\vec{F}}$`, T`$E = \dfrac{W}{q}$`],
      def:T`Kraft pro Probeladung. Weil $F \sim q$, hängt $E$ nicht von der Probeladung ab. Vektor: Betrag UND Richtung.`, fx:T`Einheit: $1\,\dfrac{\mathrm{N}}{\mathrm{C}} = 1\,\dfrac{\mathrm{V}}{\mathrm{m}}$.` },
    { id:'ph-e10', deck:'pe', q:T`Kraft auf eine Ladung $q$ im Feld $E$`, term:T`$F = q \cdot E$`,
      wrong:[T`$F = \dfrac{E}{q}$`, T`$F = \dfrac{q}{E}$`, T`$F = q \cdot U$`],
      fx:'Im homogenen Feld ist die Kraft überall gleich groß – egal, wo die Ladung zwischen den Platten sitzt (Plattenkondensator-Blatt, Aufgabe e).' },
    { id:'ph-e11', deck:'pe', q:'Coulomb-Gesetz', term:T`$F = \dfrac{1}{4\pi\varepsilon_0} \cdot \dfrac{Q_1 \, Q_2}{r^2}$`,
      wrong:[T`$F = \dfrac{1}{4\pi\varepsilon_0} \cdot \dfrac{Q_1 \, Q_2}{r}$`, T`$F = 4\pi\varepsilon_0 \cdot \dfrac{Q_1 \, Q_2}{r^2}$`, T`$F = \dfrac{1}{4\pi\varepsilon_0} \cdot \dfrac{Q_1 + Q_2}{r^2}$`],
      def:T`Kraft zwischen zwei Punktladungen. Gleichnamig → abstoßend, ungleichnamig → anziehend. $r$ = Abstand der Mittelpunkte.`, fx:'Gleicher Bau wie das Gravitationsgesetz – nur mit Ladungen statt Massen.' },
    { id:'ph-e12', deck:'pe', q:T`Feldstärke im Abstand $r$ von einer Punktladung $Q$`, term:T`$E = \dfrac{1}{4\pi\varepsilon_0} \cdot \dfrac{Q}{r^2}$`,
      wrong:[T`$E = \dfrac{1}{4\pi\varepsilon_0} \cdot \dfrac{Q^2}{r^2}$`, T`$E = \dfrac{1}{4\pi\varepsilon_0} \cdot \dfrac{Q}{r}$`, T`$E = \dfrac{Q}{\varepsilon_0 \, A}$`],
      def:T`Folgt aus dem Coulomb-Gesetz mit $E = \dfrac{F}{q}$.`, fx:'Doppelter Abstand → nur noch ein Viertel der Feldstärke.' },
    { id:'ph-e13', deck:'pe', noMC:true, q:'Coulomb-Kraft vs. Gravitationskraft: Gemeinsamkeit und Unterschiede', term:L(T`Gemeinsam: beide $\sim \dfrac{1}{r^2}$ und $\sim$ Produkt der Ladungen bzw. Massen.`, 'Unterschied 1: Coulomb-Kraft anziehend ODER abstoßend, Gravitation nur anziehend.', T`Unterschied 2: Zwischen zwei Protonen ist die Coulomb-Kraft rund $10^{36}$-mal größer.`),
      fx:T`In deinem Heft steht als Ergebnis $0{,}77 \cdot 10^{35}$ – mit der richtigen Protonenmasse $1{,}67 \cdot 10^{-27}\,\mathrm{kg}$ kommt $F_G \approx 1{,}9 \cdot 10^{-36}\,\mathrm{N}$ und damit ein Verhältnis von etwa $1{,}2 \cdot 10^{36}$ heraus.` },
    { id:'ph-e14', deck:'pe', noMC:true, q:T`Analogie Gravitationsfeld ↔ elektrisches Feld: Was entspricht $m$, $g$, $F_G = m g$ und $m g h$?`,
      term:L(T`$m \;\leftrightarrow\; q$`, T`$g \;\leftrightarrow\; E$`, T`$F_G = m \, g \;\leftrightarrow\; F = q \, E$`, T`$m \, g \, h \;\leftrightarrow\; q \, E \, x$ (potentielle Energie)`, T`$g \, h \;\leftrightarrow\; \varphi$ (Potential)`),
      fx:'Unterschied: Es gibt zwei Ladungsarten, aber nur eine Art Masse.' },
    { id:'ph-e15', deck:'pe', q:'Wie überlagern sich die Felder mehrerer Ladungen?', term:T`Vektoriell: $\vec{E}_\text{res} = \vec{E}_1 + \vec{E}_2 + \ldots$ (Pfeiladdition)`,
      wrong:['Die Beträge werden einfach addiert.', 'Der stärkere Feldpfeil setzt sich durch.', 'Die Feldstärken werden multipliziert.'],
      def:L('Superpositionsprinzip: Die Felder stören sich gegenseitig nicht.', 'Gleiche Richtung → Beträge addieren.', 'Entgegengesetzt → Beträge subtrahieren.', T`Senkrecht → $E_\text{res} = \sqrt{E_1^2 + E_2^2}$.`) },
    { id:'ph-e16', deck:'pe', q:T`Zwei Feldstärken stehen senkrecht aufeinander: $E_A = 30\,\dfrac{\mathrm{N}}{\mathrm{C}}$, $E_B = 40\,\dfrac{\mathrm{N}}{\mathrm{C}}$. Resultierende Feldstärke?`, term:T`$50\,\dfrac{\mathrm{N}}{\mathrm{C}}$`,
      wrong:[T`$70\,\dfrac{\mathrm{N}}{\mathrm{C}}$`, T`$10\,\dfrac{\mathrm{N}}{\mathrm{C}}$`, T`$35\,\dfrac{\mathrm{N}}{\mathrm{C}}$`],
      def:T`Pythagoras: $\sqrt{30^2 + 40^2} = 50$. Winkel zu $E_A$: $\tan\alpha = \dfrac{40}{30}$, also $\alpha \approx 53^\circ$.` },
    { id:'ph-e17', deck:'pe', q:'Ladungstrennung in einem LEITER durch ein äußeres elektrisches Feld heißt …', term:'Influenz',
      wrong:['Polarisation', 'Induktion', 'Ionisation'],
      def:'Die frei beweglichen Elektronen verschieben sich: Eine Seite wird negativ, die andere positiv.', fx:'In einem Isolator gibt es keine freien Elektronen – dort richten sich nur die Moleküle aus: Polarisation.' },
    { id:'ph-e18', deck:'pe', noMC:true, q:'Warum ist das Innere einer geschlossenen Metallhülle feldfrei?', term:'Influenz: Die Ladungen auf der Hülle verschieben sich so, dass ihr eigenes Feld das äußere Feld im Inneren genau aufhebt (Faraday’scher Käfig).',
      fx:'Deshalb ist man bei Gewitter im Auto sicher.' },
    { id:'ph-e19', deck:'pe', q:'Wo sitzen die Ladungen eines geladenen Leiters?', term:'Nur auf der Oberfläche – an Spitzen besonders dicht (dort ist die Feldstärke am größten).',
      wrong:['Gleichmäßig im ganzen Inneren verteilt.', 'Im Mittelpunkt konzentriert.', 'Nur an glatten, ebenen Flächen.'],
      fx:'Spitzenwirkung → Blitzableiter.' },
    { id:'ph-e20', deck:'pe', noMC:true, q:'Ladungsnachweis: Elektroskop und Glimmlampe', term:L('Elektroskop: Zeiger schlägt aus, weil sich gleichnamige Ladungen abstoßen – zeigt Ladung, aber nicht ihr Vorzeichen.', 'Glimmlampe: leuchtet ab ca. 50 V an der NEGATIVEN Elektrode – zeigt also die Polarität.') },
    { id:'ph-e32', deck:'pe', q:T`Ladung $Q$ aus $N$ Elementarladungen`, term:T`$Q = N \cdot e$`,
      wrong:[T`$Q = \dfrac{N}{e}$`, T`$Q = \dfrac{e}{N}$`, T`$Q = N + e$`], def:'Ladung ist gequantelt: Es gibt nur ganzzahlige Vielfache von e.' },
    { id:'ph-e21', deck:'pe', q:T`Änderung der potentiellen Energie einer Ladung $q$ im homogenen Feld bei Verschiebung um $\Delta x$ entlang der Feldlinie`, term:T`$\Delta E_\text{pot} = q \cdot E \cdot \Delta x$`,
      wrong:[T`$\Delta E_\text{pot} = \dfrac{q \, E}{\Delta x}$`, T`$\Delta E_\text{pot} = \dfrac{1}{2} q \, E \, \Delta x^2$`, T`$\Delta E_\text{pot} = q \, U \, \Delta x$`],
      def:T`Analog zur Höhenenergie $\Delta E_H = m \, g \, \Delta h$. Das Nullniveau ist frei wählbar.`, fx:'Eine positive Ladung gewinnt potentielle Energie, wenn man sie GEGEN die Feldrichtung (Richtung Plus-Platte) schiebt.' },
    { id:'ph-e22', deck:'pe', q:T`Elektrisches Potential $\varphi$ – Definition`, term:T`$\varphi = \dfrac{E_\text{pot}}{q}$ – potentielle Energie pro Ladung`,
      wrong:[T`$\varphi = E_\text{pot} \cdot q$`, T`$\varphi = \dfrac{F}{q}$`, T`$\varphi = \dfrac{q}{E_\text{pot}}$`],
      def:T`Unabhängig von der Probeladung – wie das Gravitationspotential $g \, h$. Nullpunkt frei wählbar (oft: Minus-Platte oder Erde).` },
    { id:'ph-e23', deck:'pe', q:'Was ist die Spannung im Feldbild?', term:T`Die Potentialdifferenz zwischen zwei Punkten: $U_{AB} = \varphi_B - \varphi_A$`,
      wrong:['Die Summe zweier Potentiale.', 'Die Kraft pro Ladung.', 'Das Potential am Pluspol.'],
      fx:'Schreibweise wie in eurem Buch. Anders als das Potential hängt die Spannung nicht vom gewählten Nullniveau ab.' },
    { id:'ph-e24', deck:'pe', q:'Definition der Spannung über die Arbeit', term:T`$U = \dfrac{W}{Q}$`,
      wrong:[T`$U = W \cdot Q$`, T`$U = \dfrac{Q}{W}$`, T`$U = \dfrac{F}{Q}$`],
      def:T`Arbeit, die das Feld an einer Ladung verrichtet, pro Ladung. $1\,\mathrm{V} = 1\,\dfrac{\mathrm{J}}{\mathrm{C}}$.`, fx:T`Umgekehrt: $W = q \cdot U$ – Arbeit beim Transport von $q$ von Platte zu Platte (Plattenkondensator-Blatt, Aufgabe d).` },
    { id:'ph-e25', deck:'pe', q:'Zusammenhang zwischen Spannung und Feldstärke im Plattenkondensator', term:T`$E = \dfrac{U}{d}$`,
      wrong:[T`$E = U \cdot d$`, T`$E = \dfrac{d}{U}$`, T`$E = \dfrac{U}{d^2}$`],
      def:L(T`Herleitung: $W = F \cdot d = q \, E \, d$ und $W = q \, U$.`, T`Gleichsetzen: $U = E \cdot d$.`), fx:'Gilt nur im homogenen Feld.' },
    { id:'ph-e26', deck:'pe', noMC:true, q:'Äquipotentiallinien – drei Eigenschaften', term:L('Verbinden Punkte gleichen Potentials.', 'Stehen überall senkrecht auf den Feldlinien.', 'Entlang einer Äquipotentiallinie wird keine Arbeit verrichtet.') },
    { id:'ph-e27', deck:'pe', noMC:true, q:'Form der Äquipotentialflächen: Plattenkondensator und Punktladung', term:L('Plattenkondensator: Ebenen parallel zu den Platten (gleiche Abstände bei gleichen Spannungsschritten).', 'Punktladung: konzentrische Kugelschalen.') },
    { id:'ph-e28', deck:'pe', q:'Höhenlinien-Analogie: Was bedeuten eng beieinanderliegende Äquipotentiallinien?', term:'Großes Potentialgefälle, also große Feldstärke – wie steiles Gelände bei engen Höhenlinien.',
      wrong:['Kleine Feldstärke.', 'Dort ist das Feld null.', 'Dort verlaufen die Feldlinien parallel zu den Äquipotentiallinien.'],
      fx:'Das stärkste Gefälle liegt senkrecht zu den Linien – genau dort verlaufen die Feldlinien (Arbeitsblatt, Aufgabe 2).' },
    { id:'ph-e29', deck:'pe', noMC:true, q:'Warum stehen Feldlinien senkrecht auf Leiteroberflächen?', term:'Die Oberfläche eines Leiters ist eine Äquipotentialfläche: Gäbe es eine Feldkomponente parallel zur Oberfläche, würden sich die freien Elektronen so lange verschieben, bis sie verschwindet.' },
    { id:'ph-e30', deck:'pe', q:'Ein geladenes Teilchen schwebt im Plattenkondensator. Ansatz?', term:T`$q \cdot E = m \cdot g$ (elektrische Kraft = Gewichtskraft)`,
      wrong:[T`$q \cdot E = \dfrac{1}{2} m v^2$`, T`$q \cdot U = m \cdot g$`, T`$q = E \cdot m \cdot g$`],
      def:L(T`→ $q = \dfrac{m \, g}{E}$ (Blattgold-Aufgabe: $7{,}6 \cdot 10^{-9}\,\mathrm{C}$).`, T`Mit $E = \dfrac{U}{d}$: $q = \dfrac{m \, g \, d}{U}$.`), fx:'Die elektrische Kraft muss nach OBEN zeigen – beim negativen Blattgold also Feld nach unten.' },
    { id:'ph-e31', deck:'pe', q:T`Geladene Kugel am Faden wird im Kondensator um den Winkel $\alpha$ ausgelenkt. Zusammenhang?`, term:T`$\tan\alpha = \dfrac{F_\text{el}}{F_G} = \dfrac{q \, E}{m \, g}$`,
      wrong:[T`$\sin\alpha = \dfrac{m \, g}{q \, E}$`, T`$\tan\alpha = \dfrac{m \, g}{q \, E}$`, T`$\cos\alpha = \dfrac{q \, E}{m \, g}$`],
      def:'Kräfteparallelogramm: waagrecht die elektrische Kraft, senkrecht die Gewichtskraft, die Fadenkraft hält beide im Gleichgewicht (deine Hausaufgabe).' },
    { id:'ph-e40', deck:'pe', ql:'Rechnen', q:'Zufallsaufgabe: Feldstärke aus Spannung und Plattenabstand', term:T`$E = \dfrac{U}{d}$`, def:'Plattenabstand immer zuerst in Meter umrechnen.',
      gen() {
        const U = pick([100, 150, 200, 240, 300, 400, 500, 600, 900, 1200, 1500, 2000, 3000]), dmm = pick([2, 3, 4, 5, 6, 8, 10, 15, 20, 25, 30]);
        const E = U / (dmm / 1000), right = `$${sci(E)}${Vm}$`;
        return { q: T`Plattenkondensator: $U = ${U}\,\mathrm{V}$, $d = ${dmm}\,\mathrm{mm}$. Feldstärke $E$?`, term: right,
          wrong: opts(right, [`$${sci(E / 1000)}${Vm}$`, `$${sci(U * dmm / 1000)}${Vm}$`, `$${sci(E * 10)}${Vm}$`, `$${sci(E / 10)}${Vm}$`]),
          def: T`$E = \dfrac{U}{d} = \dfrac{${U}\,\mathrm{V}}{${sci(dmm / 1000)}\,\mathrm{m}} = ${sci(E)}` + Vm + '$' };
      } },
    { id:'ph-e41', deck:'pe', ql:'Je–desto', q:'Zufallsaufgabe: Wie ändert sich die Coulomb-Kraft?', term:T`$F \sim \dfrac{Q_1 \, Q_2}{r^2}$`, def:'Faktoren der Ladungen multiplizieren, Faktor des Abstands QUADRIERT in den Nenner.',
      gen() {
        let a, b, r;
        do { a = pick([1, 2, 3]); b = pick([1, 2, 3]); r = pick([[1, 1], [2, 1], [3, 1], [1, 2]]); } while (a === 1 && b === 1 && r[0] === r[1]);
        const w = { 1: 'bleibt gleich', 2: 'wird verdoppelt', 3: 'wird verdreifacht' };
        const rw = r[0] === r[1] ? 'bleibt gleich' : r[1] === 2 ? 'wird halbiert' : r[0] === 2 ? 'wird verdoppelt' : 'wird verdreifacht';
        const right = [a * b * r[1] * r[1], r[0] * r[0]];
        return { q: T`$Q_1$ ${w[a]}, $Q_2$ ${w[b]}, der Abstand $r$ ${rw}. Wie ändert sich die Coulomb-Kraft $F$?`, term: fac(right),
          wrong: facOpts(right, [[a * b * r[1], r[0]], [r[0] * r[0], a * b * r[1] * r[1]], [a * b, 1], [a * b * r[0] * r[0], r[1] * r[1]], [a + b, 1]]),
          def: T`$F \sim \dfrac{Q_1 Q_2}{r^2}$: Faktor $\dfrac{${a} \cdot ${b}}{\left(${r[1] === 1 ? r[0] : T`\dfrac{${r[0]}}{${r[1]}}`}\right)^2}$ → ` + fac(right) };
      } },
    { id:'ph-e42', deck:'pe', ql:'Richtung', q:'Zufallsaufgabe: Feld- und Kraftrichtung im Plattenkondensator', term:'Feld von + nach −; Elektronen gegen das Feld', def:'Feldlinien zeigen von der Plus- zur Minus-Platte. Positive Ladung: Kraft in Feldrichtung. Elektron: Kraft gegen die Feldrichtung, also zur Plus-Platte.',
      gen() {
        const o = pick(['h', 'v']), pf = Math.random() < 0.5, askE = Math.random() < 0.3, p = askE ? null : pick(['e', 'p']);
        // Feldrichtung (Physik-Koordinaten, y nach oben): h: + links → rechts; v: + oben → unten
        const E = o === 'h' ? [pf ? 1 : -1, 0] : [0, pf ? -1 : 1];
        const F = p === 'e' ? [-E[0], -E[1]] : E;
        const right = dirName(askE ? E : F);
        return { q: askE ? T`Richtung der elektrischen Feldstärke $\vec E$ zwischen den Platten?` : `${p === 'e' ? 'Elektron' : 'Proton'} zwischen den Platten. Richtung der elektrischen Kraft?`,
          svg: plateSVG(o, pf, p), term: right, fixed: DIRS,
          def: askE ? 'Feldlinien zeigen von der Plus- zur Minus-Platte.' : p === 'e' ? 'Elektron: Kraft GEGEN die Feldrichtung – zur Plus-Platte hin.' : 'Positive Ladung: Kraft in Feldrichtung – zur Minus-Platte hin.' };
      } },

    /* ───────────── KONDENSATOR ───────────── */
    { id:'ph-c01', deck:'pc', q:T`Kapazität $C$ – Definition`, term:T`$C = \dfrac{Q}{U}$`,
      wrong:[T`$C = Q \cdot U$`, T`$C = \dfrac{U}{Q}$`, T`$C = \dfrac{1}{2} Q \, U$`],
      def:T`Wie viel Ladung ein Kondensator pro Volt speichert. Für einen gegebenen Kondensator gilt $Q \sim U$.`, fx:T`Einheit: $1\,\mathrm{F} = 1\,\dfrac{\mathrm{C}}{\mathrm{V}}$.` },
    { id:'ph-c03', deck:'pc', q:'Kapazität eines Plattenkondensators', term:T`$C = \varepsilon_0 \, \varepsilon_r \, \dfrac{A}{d}$`,
      wrong:[T`$C = \varepsilon_0 \, \varepsilon_r \, \dfrac{d}{A}$`, T`$C = \varepsilon_0 \, \varepsilon_r \, A \, d$`, T`$C = \dfrac{A}{\varepsilon_0 \, \varepsilon_r \, d}$`],
      def:'Größere Fläche → mehr Platz für Ladung. Kleinerer Abstand → stärkere Anziehung der Ladungen, mehr Ladung bei gleicher Spannung.' },
    { id:'ph-c19', deck:'pc', noMC:true, q:'Wovon hängt die gespeicherte Ladung eines Plattenkondensators ab?', term:L(T`$Q = C \, U = \varepsilon_0 \varepsilon_r \dfrac{A}{d} \, U$, also:`, T`$Q \sim U$`, T`$Q \sim A$`, T`$Q \sim \dfrac{1}{d}$`, T`$Q \sim \varepsilon_r$`),
      fx:'Genau diese Hypothesen sollt ihr laut Lehrplan aufstellen und experimentell prüfen.' },
    { id:'ph-c04', deck:'pc', q:T`Was gibt die Dielektrizitätszahl $\varepsilon_r$ an?`, term:'Um welchen Faktor die Kapazität steigt, wenn statt Luft ein Isolator (Dielektrikum) zwischen den Platten ist.',
      wrong:['Um welchen Faktor die Leitfähigkeit steigt.', 'Die Spannung, bei der der Isolator durchschlägt.', 'Den Plattenabstand in Millimetern.'],
      def:L('Vakuum: 1, Luft: ≈ 1', 'Glas: ≈ 5 bis 10', 'Wasser: ≈ 80'), fx:'Einheitenlos.' },
    { id:'ph-c05', deck:'pc', noMC:true, q:'Warum erhöht ein Dielektrikum die Kapazität?', term:'Die Moleküle werden polarisiert (richten sich als Dipole aus) und erzeugen ein Gegenfeld. Das Feld und damit die Spannung sinken bei gleicher Ladung – also ist C = Q/U größer.' },
    { id:'ph-c06', deck:'pc', q:'Energie im geladenen Kondensator', term:T`$W = \dfrac{1}{2} \, C \, U^2$`,
      wrong:[T`$W = C \, U^2$`, T`$W = \dfrac{1}{2} \, C \, U$`, T`$W = \dfrac{1}{2} \, Q \, U^2$`],
      def:T`Gleichwertig: $W = \dfrac{1}{2} Q \, U = \dfrac{Q^2}{2C}$.`, fx:'Warum ½? Beim Laden steigt die Spannung von 0 auf U – im Mittel transportiert man gegen U/2. Im Q-U-Diagramm ist W die Dreiecksfläche.' },
    { id:'ph-c08', deck:'pc', q:T`Feldstärke im Plattenkondensator aus Ladung $Q$ und Fläche $A$`, term:T`$E = \dfrac{Q}{\varepsilon_0 \, \varepsilon_r \, A}$`,
      wrong:[T`$E = \dfrac{Q \, A}{\varepsilon_0 \, \varepsilon_r}$`, T`$E = \dfrac{\varepsilon_0 \, \varepsilon_r \, A}{Q}$`, T`$E = \dfrac{Q}{\varepsilon_0 \, \varepsilon_r \, d}$`],
      def:T`$E = \dfrac{U}{d} = \dfrac{Q}{C \, d} = \dfrac{Q}{\varepsilon_0 \varepsilon_r A}$`, fx:'Hängt NICHT vom Plattenabstand ab (Formeltraining a auf deinem Blatt).' },
    { id:'ph-c09', deck:'pc', q:T`Ladung $Q$ aus $U$, $d$ und $A$`, term:T`$Q = \varepsilon_0 \, \varepsilon_r \, \dfrac{A}{d} \, U$`,
      wrong:[T`$Q = \varepsilon_0 \, \varepsilon_r \, A \, d \, U$`, T`$Q = \dfrac{\varepsilon_0 \, \varepsilon_r \, U}{A \, d}$`, T`$Q = \varepsilon_0 \, \varepsilon_r \, \dfrac{d}{A} \, U$`] },
    { id:'ph-c10', deck:'pc', noMC:true, q:T`Plattenabstand $d$ wird verdoppelt, die Quelle bleibt ANGESCHLOSSEN. Was passiert mit $C$, $Q$, $U$, $E$?`,
      term:L(T`$U$ bleibt (die Quelle hält sie fest).`, T`$C$ halbiert sich.`, T`$Q = C\,U$ halbiert sich – Ladung fließt zur Quelle zurück.`, T`$E = \dfrac{U}{d}$ halbiert sich.`),
      fx:'Faustregel: angeschlossen → U fest; abgetrennt → Q fest. Immer zuerst fragen, was festgehalten wird.' },
    { id:'ph-c11', deck:'pc', noMC:true, q:T`Plattenabstand $d$ wird verdoppelt, die Quelle wurde vorher ABGETRENNT. Was passiert mit $C$, $Q$, $U$, $E$?`,
      term:L(T`$Q$ bleibt (kann nicht abfließen).`, T`$C$ halbiert sich.`, T`$U = \dfrac{Q}{C}$ verdoppelt sich.`, T`$E = \dfrac{Q}{\varepsilon_0 \varepsilon_r A}$ bleibt gleich.`) },
    { id:'ph-c12', deck:'pc', noMC:true, q:T`Ein Dielektrikum ($\varepsilon_r$) wird eingeschoben, die Quelle ist ABGETRENNT. Was passiert mit $C$, $Q$, $U$, $E$?`,
      term:L(T`$C$ steigt auf das $\varepsilon_r$-Fache.`, T`$Q$ bleibt.`, T`$U$ sinkt auf $\dfrac{1}{\varepsilon_r}$.`, T`$E$ sinkt auf $\dfrac{1}{\varepsilon_r}$.`),
      fx:T`Angeschlossen wäre es anders: $U$ und $E$ bleiben, $C$ und $Q$ steigen auf das $\varepsilon_r$-Fache.` },
    { id:'ph-c13', deck:'pc', q:'Zeitlicher Verlauf des Entladestroms eines Kondensators über einen Widerstand', term:T`$I(t) = I_0 \cdot e^{-\frac{t}{R C}}$ mit $I_0 = \dfrac{U_0}{R}$`,
      wrong:[T`$I(t) = I_0 \left(1 - e^{-\frac{t}{RC}}\right)$`, T`$I(t) = I_0 \cdot e^{-R C t}$`, T`$I(t) = I_0 - \dfrac{t}{R C}$`],
      def:'Exponentieller Abfall: Je weniger Ladung noch auf dem Kondensator ist, desto kleiner die Spannung und damit der Strom.' },
    { id:'ph-c14', deck:'pc', q:T`Zeitkonstante $\tau$ eines RC-Glieds und ihre Bedeutung`, term:T`$\tau = R \cdot C$ – nach $\tau$ ist der Strom auf $\dfrac{1}{e} \approx 37\,\%$ gefallen`,
      wrong:[T`$\tau = \dfrac{R}{C}$ – nach $\tau$ ist der Strom auf 50 % gefallen`, T`$\tau = R \cdot C$ – nach $\tau$ ist der Kondensator ganz leer`, T`$\tau = \dfrac{C}{R}$ – nach $\tau$ ist der Strom auf 37 % gefallen`],
      def:L(T`Nach etwa $5\tau$ gilt der Kondensator als entladen.`, T`Halbwertszeit: $t_H = R C \cdot \ln 2 \approx 0{,}69 \, R C$.`) },
    { id:'ph-c15', deck:'pc', noMC:true, q:T`Wie verändert sich die Entladekurve bei größerem $R$ oder größerem $C$?`, term:T`Sie wird flacher und länger: $\tau = RC$ steigt, der Kondensator entlädt sich langsamer. Ein größeres $R$ senkt außerdem den Anfangsstrom $I_0 = \dfrac{U_0}{R}$.` },
    { id:'ph-c16', deck:'pc', q:'Wie bestimmt man die gespeicherte Ladung aus dem I-t-Diagramm der Entladung?', term:'Als Fläche unter der Kurve (graphische Integration).',
      wrong:['Aus der Steigung der Kurve.', 'Anfangsstrom mal Messdauer.', 'Am höchsten Punkt der Kurve ablesen.'],
      def:T`Kästchen zählen oder Software nutzen. Kontrolle: $Q = C \cdot U_0$.`, fx:'Typische Gründe für Abweichungen: Messung zu früh abgebrochen (Restfläche fehlt), Leckströme, Toleranz der Bauteile.' },
    { id:'ph-c17', deck:'pc', q:'Spannung am Kondensator beim AUFLADEN über einen Widerstand', term:T`$U_C(t) = U_0 \left(1 - e^{-\frac{t}{RC}}\right)$`,
      wrong:[T`$U_C(t) = U_0 \cdot e^{-\frac{t}{RC}}$`, T`$U_C(t) = U_0 \cdot \dfrac{t}{RC}$`, T`$U_C(t) = U_0 \left(1 + e^{-\frac{t}{RC}}\right)$`],
      def:'Steigt anfangs schnell und nähert sich U₀ immer langsamer. Der Ladestrom fällt dabei exponentiell ab.' },
    { id:'ph-c18', deck:'pc', q:'Fließt nach dem Aufladen noch Gleichstrom durch einen Kondensator?', term:'Nein – zwischen den Platten ist ein Isolator. Strom fließt nur während des Lade- bzw. Entladevorgangs.',
      wrong:['Ja, konstant weiter.', 'Ja, aber nur halb so viel.', 'Nur wenn die Kapazität groß ist.'] },
    { id:'ph-c07', deck:'pc', noMC:true, q:'Technische Anwendungen des Kondensators als Energiespeicher', term:L('Kamerablitz', 'Defibrillator', 'Superkondensatoren (z. B. Bremsenergie zurückgewinnen, Pufferspeicher)', 'Glättung der Spannung in Netzteilen') },
    { id:'ph-c22', deck:'pc', ql:'Rechnen', q:T`Luftkondensator: $A = 200\,\mathrm{cm^2}$, $d = 2{,}0\,\mathrm{mm}$, $U = 300\,\mathrm{V}$. Ladung $Q$?`, term:T`$Q \approx 2{,}7 \cdot 10^{-8}\,\mathrm{C}$`,
      wrong:[T`$Q \approx 2{,}7 \cdot 10^{-4}\,\mathrm{C}$`, T`$Q \approx 2{,}7 \cdot 10^{-11}\,\mathrm{C}$`, T`$Q \approx 8{,}9 \cdot 10^{-11}\,\mathrm{C}$`],
      def:L(T`$A = 2{,}0 \cdot 10^{-2}\,\mathrm{m^2}$, $d = 2{,}0 \cdot 10^{-3}\,\mathrm{m}$`, T`$C = \varepsilon_0 \dfrac{A}{d} = 8{,}85 \cdot 10^{-11}\,\mathrm{F}$`, T`$Q = C \, U \approx 2{,}7 \cdot 10^{-8}\,\mathrm{C}$`),
      fx:'Die falschen Antworten sind die typischen Fehler: cm² nicht umgerechnet, mm nicht umgerechnet, C statt Q angegeben.' },
    { id:'ph-c20', deck:'pc', ql:'Je–desto', q:'Zufallsaufgabe: Kondensator verändern – Quelle bleibt ANGESCHLOSSEN', term:'U bleibt fest', def:T`Angeschlossen → $U$ fest. $C = \varepsilon_0\varepsilon_r\dfrac{A}{d}$, $Q = C\,U$, $E = \dfrac{U}{d}$, $W = \dfrac{1}{2} C U^2$.`,
      gen() { return capGen(true); } },
    { id:'ph-c21', deck:'pc', ql:'Je–desto', q:'Zufallsaufgabe: Kondensator verändern – Quelle vorher ABGETRENNT', term:'Q bleibt fest', def:T`Abgetrennt → $Q$ fest. $U = \dfrac{Q}{C}$, $E = \dfrac{Q}{\varepsilon_0\varepsilon_r A}$, $W = \dfrac{Q^2}{2C}$.`,
      gen() { return capGen(false); } },

    /* ───────────── WERKZEUGE ───────────── */
    { id:'ph-g04', deck:'pg', q:'Vorsatz m (Milli)', term:T`$10^{-3}$`, wrong:[T`$10^{-6}$`, T`$10^{-2}$`, T`$10^{6}$`] },
    { id:'ph-g03', deck:'pg', q:'Vorsatz µ (Mikro)', term:T`$10^{-6}$`, wrong:[T`$10^{-9}$`, T`$10^{-3}$`, T`$10^{-12}$`], fx:T`$10\,\mathrm{\mu m} = 10^{-5}\,\mathrm{m}$ (Neuronen-Aufgabe).` },
    { id:'ph-g02', deck:'pg', q:'Vorsatz n (Nano)', term:T`$10^{-9}$`, wrong:[T`$10^{-6}$`, T`$10^{-12}$`, T`$10^{9}$`], fx:T`$150\,\mathrm{nC} = 1{,}5 \cdot 10^{-7}\,\mathrm{C}$ (deine Pendel-Hausaufgabe).` },
    { id:'ph-g01', deck:'pg', q:'Vorsatz p (Piko)', term:T`$10^{-12}$`, wrong:[T`$10^{-9}$`, T`$10^{-15}$`, T`$10^{-6}$`], fx:T`$49\,\mathrm{pC} = 4{,}9 \cdot 10^{-11}\,\mathrm{C}$ (Plattenkondensator-Blatt).` },
    { id:'ph-g06', deck:'pg', q:'Vorsatz k (Kilo)', term:T`$10^{3}$`, wrong:[T`$10^{6}$`, T`$10^{-3}$`, T`$10^{2}$`] },
    { id:'ph-g07', deck:'pg', q:'Vorsatz M (Mega)', term:T`$10^{6}$`, wrong:[T`$10^{9}$`, T`$10^{3}$`, T`$10^{-6}$`] },
    { id:'ph-g08', deck:'pg', q:'Vorsatz G (Giga)', term:T`$10^{9}$`, wrong:[T`$10^{6}$`, T`$10^{12}$`, T`$10^{-9}$`] },
    { id:'ph-g05', deck:'pg', q:'Vorsatz c (Zenti)', term:T`$10^{-2}$`, wrong:[T`$10^{-1}$`, T`$10^{-3}$`, T`$10^{2}$`] },
    { id:'ph-g09', deck:'pg', q:T`$1\,\mathrm{cm^2}$ in $\mathrm{m^2}$`, term:T`$10^{-4}\,\mathrm{m^2}$`, wrong:[T`$10^{-2}\,\mathrm{m^2}$`, T`$10^{-6}\,\mathrm{m^2}$`, T`$10^{-3}\,\mathrm{m^2}$`],
      def:T`Fläche → Umrechnungsfaktor quadrieren: $(10^{-2})^2 = 10^{-4}$.`, fx:T`$400\,\mathrm{cm^2} = 4 \cdot 10^{-2}\,\mathrm{m^2}$ (Kondensator-Aufgabe 3).` },
    { id:'ph-g10', deck:'pg', q:T`$1\,\mathrm{mm^2}$ in $\mathrm{m^2}$`, term:T`$10^{-6}\,\mathrm{m^2}$`, wrong:[T`$10^{-3}\,\mathrm{m^2}$`, T`$10^{-9}\,\mathrm{m^2}$`, T`$10^{-4}\,\mathrm{m^2}$`] },
    { id:'ph-g11', deck:'pg', q:T`$1\,\mathrm{cm^3}$ in $\mathrm{m^3}$`, term:T`$10^{-6}\,\mathrm{m^3}$`, wrong:[T`$10^{-3}\,\mathrm{m^3}$`, T`$10^{-2}\,\mathrm{m^3}$`, T`$10^{-9}\,\mathrm{m^3}$`],
      fx:T`$1\,\mathrm{dm^3} = 1\,\mathrm{L} = 10^{-3}\,\mathrm{m^3}$.` },
    { id:'ph-g12', deck:'pg', q:T`$1\,\dfrac{\mathrm{g}}{\mathrm{cm^3}}$ in $\dfrac{\mathrm{kg}}{\mathrm{m^3}}$`, term:T`$1000\,\dfrac{\mathrm{kg}}{\mathrm{m^3}}$`, wrong:[T`$0{,}001\,\dfrac{\mathrm{kg}}{\mathrm{m^3}}$`, T`$1\,\dfrac{\mathrm{kg}}{\mathrm{m^3}}$`, T`$100\,\dfrac{\mathrm{kg}}{\mathrm{m^3}}$`],
      def:'Gold: 19,3 g/cm³ = 19 300 kg/m³ – hast du in der Blattgold-Aufgabe richtig gemacht.' },
    { id:'ph-g13', deck:'pg', q:T`$1\,\dfrac{\mathrm{km}}{\mathrm{h}}$ in $\dfrac{\mathrm{m}}{\mathrm{s}}$`, term:T`$\dfrac{1}{3{,}6}\,\dfrac{\mathrm{m}}{\mathrm{s}}$`, wrong:[T`$3{,}6\,\dfrac{\mathrm{m}}{\mathrm{s}}$`, T`$\dfrac{1}{60}\,\dfrac{\mathrm{m}}{\mathrm{s}}$`, T`$1000\,\dfrac{\mathrm{m}}{\mathrm{s}}$`] },
    { id:'ph-g24', deck:'pg', ql:'Umrechnen', q:'Zufallsaufgabe: Vorsätze in Grundeinheit umrechnen', term:'Vorsatz durch Zehnerpotenz ersetzen', def:'p = 10⁻¹², n = 10⁻⁹, µ = 10⁻⁶, m = 10⁻³, k = 10³, M = 10⁶. Ergebnis normiert schreiben (eine Ziffer vor dem Komma).',
      gen() {
        const P = { p: -12, n: -9, 'µ': -6, m: -3, k: 3, M: 6 };
        const [pre, un] = pick([['p', 'F'], ['n', 'F'], ['µ', 'F'], ['p', 'C'], ['n', 'C'], ['µ', 'C'], ['m', 'V'], ['k', 'V'], ['M', 'V'], ['m', 'A'], ['µ', 'A'], ['n', 'm'], ['µ', 'm'], ['m', 'm'], ['k', 'm']]);
        const v = pick([1.2, 2.5, 4.7, 4.9, 12, 33, 49, 70, 150, 350, 470, 680]), e = P[pre];
        const U = `\\,\\mathrm{${un}}`, plain = `${String(v).replace('.', ',')} ${pre}${un}`;
        const right = `$${sci(v * Math.pow(10, e))}${U}$`;
        return { q: `${plain} in ${un}?`, term: right,
          wrong: opts(right, [`$${sci(v * Math.pow(10, e + 3))}${U}$`, `$${sci(v * Math.pow(10, e - 3))}${U}$`, `$${sci(v * Math.pow(10, e + 1))}${U}$`, `$${sci(v * Math.pow(10, -e))}${U}$`]),
          def: `${plain} = $${dz(v)} \\cdot 10^{${e}}${U}` + (right === `$${dz(v)} \\cdot 10^{${e}}${U}$` ? '$' : ' = ' + right.slice(1)) };
      } },
    { id:'ph-g25', deck:'pg', ql:'Umrechnen', q:'Zufallsaufgabe: Längen, Flächen, Volumen in SI umrechnen', term:'Bei Flächen quadrieren, bei Volumen hoch drei', def:'cm → m: 10⁻². cm² → m²: 10⁻⁴. cm³ → m³: 10⁻⁶. mm → m: 10⁻³. mm² → m²: 10⁻⁶. dm³ → m³: 10⁻³.',
      gen() {
        const [from, to, e, vals, wr] = pick([
          ['cm^2', 'm^2', -4, [400, 250, 50, 1200, 80], [-2, -6, -3]],
          ['mm', 'm', -3, [3, 5, 1.5, 0.8, 12], [-2, -6, -1]],
          ['mm^2', 'm^2', -6, [2, 50, 0.5, 100], [-3, -4, -9]],
          ['cm^3', 'm^3', -6, [2.6, 50, 0.4, 250], [-3, -2, -9]],
          ['dm^3', 'm^3', -3, [2.6, 5, 0.8, 40], [-1, -6, -2]],
          ['cm', 'm', -2, [1.5, 15, 4, 0.5], [-1, -3, -4]],
        ]);
        const v = pick(vals), right = `$${sci(v * Math.pow(10, e))}\\,\\mathrm{${to}}$`;
        return { q: T`$${dz(v)}\,\mathrm{${from}}$ in $\mathrm{${to}}$?`, term: right, wrong: opts(right, wr.map(x => `$${sci(v * Math.pow(10, x))}\\,\\mathrm{${to}}$`)),
          def: T`$1\,\mathrm{${from}} = 10^{${e}}\,\mathrm{${to}}$` };
      } },
    { id:'ph-g14', deck:'pg', q:T`$1\,\mathrm{C}$ (Coulomb) in Basiseinheiten`, term:T`$1\,\mathrm{As}$`, wrong:[T`$1\,\dfrac{\mathrm{A}}{\mathrm{s}}$`, T`$1\,\dfrac{\mathrm{V}}{\mathrm{A}}$`, T`$1\,\mathrm{Ws}$`], def:T`Folgt aus $I = \dfrac{Q}{t}$, also $Q = I \cdot t$.` },
    { id:'ph-g15', deck:'pg', q:T`$1\,\mathrm{V}$ = ?`, term:T`$1\,\dfrac{\mathrm{J}}{\mathrm{C}}$`, wrong:[T`$1\,\mathrm{J \cdot C}$`, T`$1\,\dfrac{\mathrm{C}}{\mathrm{J}}$`, T`$1\,\dfrac{\mathrm{N}}{\mathrm{C}}$`], def:T`Spannung = Energie pro Ladung: $U = \dfrac{W}{Q}$.` },
    { id:'ph-g16', deck:'pg', q:T`$1\,\dfrac{\mathrm{N}}{\mathrm{C}}$ = ?`, term:T`$1\,\dfrac{\mathrm{V}}{\mathrm{m}}$`, wrong:[T`$1\,\mathrm{V \cdot m}$`, T`$1\,\dfrac{\mathrm{J}}{\mathrm{m}}$`, T`$1\,\dfrac{\mathrm{C}}{\mathrm{N}}$`],
      def:T`$1\,\dfrac{\mathrm{N}}{\mathrm{C}} = 1\,\dfrac{\mathrm{N\,m}}{\mathrm{C\,m}} = 1\,\dfrac{\mathrm{J}}{\mathrm{C\,m}} = 1\,\dfrac{\mathrm{V}}{\mathrm{m}}$ – deine Hausaufgaben-Herleitung.` },
    { id:'ph-g17', deck:'pg', q:T`$1\,\mathrm{F}$ (Farad) = ?`, term:T`$1\,\dfrac{\mathrm{C}}{\mathrm{V}} = 1\,\dfrac{\mathrm{As}}{\mathrm{V}}$`, wrong:[T`$1\,\dfrac{\mathrm{V}}{\mathrm{C}}$`, T`$1\,\mathrm{C \cdot V}$`, T`$1\,\dfrac{\mathrm{A}}{\mathrm{V}}$`] },
    { id:'ph-g18', deck:'pg', q:T`$1\,\mathrm{T}$ (Tesla) = ?`, term:T`$1\,\dfrac{\mathrm{N}}{\mathrm{A\,m}} = 1\,\dfrac{\mathrm{Vs}}{\mathrm{m^2}}$`, wrong:[T`$1\,\mathrm{N \cdot A \cdot m}$`, T`$1\,\dfrac{\mathrm{V}}{\mathrm{m}}$`, T`$1\,\dfrac{\mathrm{A}}{\mathrm{m}}$`] },
    { id:'ph-g19', deck:'pg', q:T`$1\,\mathrm{J}$ = ?`, term:T`$1\,\mathrm{Nm} = 1\,\mathrm{VAs} = 1\,\mathrm{Ws}$`, wrong:[T`$1\,\dfrac{\mathrm{N}}{\mathrm{m}}$`, T`$1\,\dfrac{\mathrm{V}}{\mathrm{A}}$`, T`$1\,\dfrac{\mathrm{W}}{\mathrm{s}}$`] },
    { id:'ph-g20', deck:'pg', q:'Auf wie viele gültige Ziffern rundest du ein Ergebnis?', term:'So viele wie die ungenaueste Angabe (kleinste Anzahl gültiger Ziffern).',
      wrong:['So viele wie die genaueste Angabe.', 'Immer auf zwei Nachkommastellen.', 'Immer auf drei gültige Ziffern.'],
      def:L('Führende Nullen zählen nicht: 0,00043 hat 2 gültige Ziffern.', 'Nullen am Ende hinter dem Komma zählen: 0,37800 hat 5.', 'Zwischenergebnisse genauer lassen, erst am Ende runden.') },
    { id:'ph-g21', deck:'pg', ql:'Zählen', q:'Zufallsaufgabe: gültige Ziffern zählen', term:'Führende Nullen zählen nicht', def:'Ab der ersten Ziffer ungleich null wird gezählt – auch Nullen dazwischen und am Ende hinter dem Komma.',
      gen() {
        const digs = pick(['43', '317', '5', '27', '908', '61', '1205', '2', '75']), lead = ri(0, 3), trail = ri(0, 2);
        const s = lead > 0 ? '0,' + '0'.repeat(lead - 1) + digs + '0'.repeat(trail) : digs.length + trail > 1 ? digs[0] + ',' + digs.slice(1) + '0'.repeat(trail) : digs;
        const n = digs.length + trail;
        return { q: `Wie viele gültige Ziffern hat die Zahl ${s}?`, term: String(n), wrong: opts(String(n), [n + 1, n - 1, n + lead, s.replace(',', '').length, n + 2].filter(x => x > 0).map(String)),
          def: `${s}: ${lead ? 'Die führenden Nullen zählen nicht. ' : ''}${trail ? 'Die Nullen am Ende zählen mit. ' : ''}→ ${n} gültige Ziffer${n > 1 ? 'n' : ''}.` };
      } },
    { id:'ph-g22', deck:'pg', ql:'Kopfrechnen', q:'Zufallsaufgabe: Rechnen mit Zehnerpotenzen', term:'Exponenten addieren bzw. subtrahieren', def:L(T`$10^a \cdot 10^b = 10^{a+b}$`, T`$\dfrac{10^a}{10^b} = 10^{a-b}$`, T`$(10^a)^2 = 10^{2a}$`),
      gen() {
        const nz = () => { let x; do { x = ri(-15, 12); } while (x === 0 || x === 1); return x; };
        const a = nz(), b = nz(), t = ri(0, 4), P = e => `$10^{${e}}$`;
        let q, right, cands;
        if (t === 0) { q = T`$10^{${a}} \cdot 10^{${b}} = \;?$`; right = P(a + b); cands = [P(a * b), P(a - b), P(b - a), P(a + b + 1)]; }
        else if (t === 1) { q = T`$\dfrac{10^{${a}}}{10^{${b}}} = \;?$`; right = P(a - b); cands = [P(a + b), P(b - a), P(-(a + b)), P(a - b - 1)]; }
        else if (t === 2) { q = T`$\left(10^{${a}}\right)^2 = \;?$`; right = P(2 * a); cands = [P(a * a), P(a + 2), P(-2 * a), P(2 * a + 1)]; }
        else if (t === 3) { const [m1, m2] = pick([[2, 3], [2, 4], [3, 3], [2, 2], [4, 2]]); q = T`$(${m1} \cdot 10^{${a}}) \cdot (${m2} \cdot 10^{${b}}) = \;?$`;
          right = T`$${m1 * m2} \cdot 10^{${a + b}}$`; cands = [T`$${m1 + m2} \cdot 10^{${a + b}}$`, T`$${m1 * m2} \cdot 10^{${a * b}}$`, T`$${m1 * m2} \cdot 10^{${a - b}}$`, T`$${m1 * m2} \cdot 10^{${a + b + 1}}$`]; }
        else { const [m1, m2] = pick([[8, 2], [6, 3], [9, 3], [8, 4]]); q = T`$\dfrac{${m1} \cdot 10^{${a}}}{${m2} \cdot 10^{${b}}} = \;?$`;
          right = T`$${m1 / m2} \cdot 10^{${a - b}}$`; cands = [T`$${m1 / m2} \cdot 10^{${a + b}}$`, T`$${m1 - m2} \cdot 10^{${a - b}}$`, T`$${m1 / m2} \cdot 10^{${b - a}}$`, T`$${m1 / m2} \cdot 10^{${a - b - 1}}$`]; }
        return { q, term: right, wrong: opts(right, cands) };
      } },
    { id:'ph-g23', deck:'pg', q:T`Normiert schreiben: $0{,}77 \cdot 10^{35}$`, term:T`$7{,}7 \cdot 10^{34}$`, wrong:[T`$7{,}7 \cdot 10^{36}$`, T`$0{,}77 \cdot 10^{34}$`, T`$7{,}7 \cdot 10^{35}$`],
      def:'Komma eine Stelle nach rechts → Exponent eins kleiner. Die Zahl vor der Zehnerpotenz liegt immer zwischen 1 und 10. (Aus deiner Proton-Aufgabe.)' },
    { id:'ph-g26', deck:'pg', q:T`$E = \dfrac{U}{d}$ nach $d$ umstellen`, term:T`$d = \dfrac{U}{E}$`, wrong:[T`$d = E \cdot U$`, T`$d = \dfrac{E}{U}$`, T`$d = U - E$`] },
    { id:'ph-g27', deck:'pg', q:T`$q \, U = \dfrac{1}{2} m v^2$ nach $v$ umstellen`, term:T`$v = \sqrt{\dfrac{2 q U}{m}}$`, wrong:[T`$v = \dfrac{2 q U}{m}$`, T`$v = \sqrt{\dfrac{q U}{2 m}}$`, T`$v = \sqrt{\dfrac{m}{2 q U}}$`] },
    { id:'ph-g28', deck:'pg', q:T`$\dfrac{m v^2}{r} = q v B$ nach $r$ umstellen`, term:T`$r = \dfrac{m v}{q B}$`, wrong:[T`$r = \dfrac{q B}{m v}$`, T`$r = \dfrac{m v^2}{q B}$`, T`$r = \dfrac{q v B}{m}$`] },
    { id:'ph-g29', deck:'pg', q:T`$C = \varepsilon_0 \varepsilon_r \dfrac{A}{d}$ nach $A$ umstellen`, term:T`$A = \dfrac{C \, d}{\varepsilon_0 \, \varepsilon_r}$`, wrong:[T`$A = \dfrac{\varepsilon_0 \, \varepsilon_r \, d}{C}$`, T`$A = \dfrac{C}{\varepsilon_0 \, \varepsilon_r \, d}$`, T`$A = C \, d \, \varepsilon_0 \, \varepsilon_r$`], def:'Brauchst du z. B. für Aufgabe 3c auf dem Arbeitsblatt.' },
    { id:'ph-g30', deck:'pg', q:T`Coulomb-Gesetz nach $r$ umstellen`, term:T`$r = \sqrt{\dfrac{Q_1 \, Q_2}{4\pi\varepsilon_0 \, F}}$`, wrong:[T`$r = \dfrac{Q_1 \, Q_2}{4\pi\varepsilon_0 \, F}$`, T`$r = \sqrt{\dfrac{4\pi\varepsilon_0 \, F}{Q_1 \, Q_2}}$`, T`$r = \sqrt{4\pi\varepsilon_0 \, F \, Q_1 Q_2}$`] },
    { id:'ph-g31', deck:'pg', q:'Zweites Newton’sches Gesetz', term:T`$F = m \cdot a$`, wrong:[T`$F = \dfrac{m}{a}$`, T`$F = m \cdot v$`, T`$F = \dfrac{1}{2} m a^2$`], def:T`Konstante Kraft → konstante Beschleunigung. Im homogenen E-Feld: $a = \dfrac{q \, E}{m}$.` },
    { id:'ph-g32', deck:'pg', q:'Mechanische Arbeit', term:T`$W = F \cdot s$`, wrong:[T`$W = \dfrac{F}{s}$`, T`$W = \dfrac{1}{2} F s^2$`, T`$W = m \cdot s$`], fx:'Nur wenn F konstant und parallel zum Weg s ist (steht so in deinem Heft).' },
    { id:'ph-g33', deck:'pg', q:'Kinetische Energie', term:T`$E_\text{kin} = \dfrac{1}{2} m v^2$`, wrong:[T`$E_\text{kin} = m v^2$`, T`$E_\text{kin} = \dfrac{1}{2} m v$`, T`$E_\text{kin} = m g h$`] },
    { id:'ph-g34', deck:'pg', q:'Höhenenergie', term:T`$E_H = m \, g \, h$`, wrong:[T`$E_H = \dfrac{1}{2} m g h$`, T`$E_H = \dfrac{m g}{h}$`, T`$E_H = m \, v$`] },
    { id:'ph-g35', deck:'pg', q:'Gleichmäßig beschleunigte Bewegung aus der Ruhe: Weg', term:T`$s = \dfrac{1}{2} a t^2$`, wrong:[T`$s = a \, t$`, T`$s = \dfrac{1}{2} a t$`, T`$s = a \, t^2$`], def:L(T`Geschwindigkeit: $v = a \, t$`, T`Ohne Zeit: $v^2 = 2 a s$`) },
    { id:'ph-g36', deck:'pg', q:'Zentripetalkraft', term:T`$F_Z = \dfrac{m v^2}{r}$`, wrong:[T`$F_Z = \dfrac{m v}{r}$`, T`$F_Z = m v^2 r$`, T`$F_Z = \dfrac{m r}{v^2}$`], def:T`Hält einen Körper auf der Kreisbahn. Im Magnetfeld übernimmt das die Lorentzkraft: $q v B = \dfrac{m v^2}{r}$.` },
    { id:'ph-g37', deck:'pg', q:'Bahngeschwindigkeit auf der Kreisbahn', term:T`$v = \dfrac{2\pi r}{T}$`, wrong:[T`$v = \dfrac{2\pi T}{r}$`, T`$v = \dfrac{\pi r^2}{T}$`, T`$v = \dfrac{r}{T}$`], def:T`Winkelgeschwindigkeit $\omega = \dfrac{2\pi}{T} = 2\pi f$, und $v = \omega \, r$.` },
    { id:'ph-g38', deck:'pg', q:'Stromstärke', term:T`$I = \dfrac{\Delta Q}{\Delta t}$`, wrong:[T`$I = Q \cdot t$`, T`$I = \dfrac{t}{Q}$`, T`$I = U \cdot R$`], def:T`$1\,\mathrm{A} = 1\,\dfrac{\mathrm{C}}{\mathrm{s}}$. Umgekehrt: Ladung = Fläche unter dem I-t-Diagramm.` },
    { id:'ph-g39', deck:'pg', q:'Elektrischer Widerstand', term:T`$R = \dfrac{U}{I}$`, wrong:[T`$R = U \cdot I$`, T`$R = \dfrac{I}{U}$`, T`$R = U^2 \cdot I$`] },
    { id:'ph-g40', deck:'pg', q:'Elektrische Leistung', term:T`$P = U \cdot I$`, wrong:[T`$P = \dfrac{U}{I}$`, T`$P = U \cdot t$`, T`$P = Q \cdot U$`] },
    { id:'ph-g41', deck:'pg', q:'Wie werden Spannungs- und Strommessgerät geschaltet?', term:'Spannungsmesser parallel (sehr großer Innenwiderstand), Strommesser in Reihe (sehr kleiner Innenwiderstand).',
      wrong:['Spannungsmesser in Reihe (kleiner Innenwiderstand), Strommesser parallel (großer Innenwiderstand).', 'Beide parallel, beide mit großem Innenwiderstand.', 'Beide in Reihe, beide mit kleinem Innenwiderstand.'] },
    { id:'ph-g42', deck:'pg', q:'Technische und tatsächliche Stromrichtung', term:'Technisch: von + nach −. Die Elektronen fließen tatsächlich von − nach +.',
      wrong:['Technisch: von − nach +. Die Elektronen fließen von + nach −.', 'Beide von + nach −.', 'Beide von − nach +.'], fx:'In Schaltplänen immer die technische Stromrichtung.' },

    /* ───────────── TEILCHEN IM E-FELD & RELATIVISTIK ───────────── */
    { id:'ph-t01', deck:'pt', noMC:true, q:'Wie erzeugt eine Elektronenkanone freie Elektronen?', term:'Glühkathode: Ein geheizter Draht gibt Elektronen ab (glühelektrischer Effekt). Die Anodenspannung beschleunigt sie zur Anode, durch deren Loch sie als Strahl austreten.' },
    { id:'ph-t02', deck:'pt', q:'Ein Elektron startet parallel zu den Feldlinien in ein homogenes Feld (Längsfeld). Bewegung?', term:T`Gleichmäßig beschleunigt (oder gebremst), weil $F = e E$ konstant ist, also auch $a = \dfrac{e E}{m}$.`,
      wrong:['Auf einer Kreisbahn.', 'Mit konstanter Geschwindigkeit.', 'Auf einer Parabelbahn.'] },
    { id:'ph-t03', deck:'pt', q:T`Endgeschwindigkeit nach Beschleunigung durch $U$ aus der Ruhe (nichtrelativistisch)`, term:T`$e U = \dfrac{1}{2} m v^2 \;\Rightarrow\; v = \sqrt{\dfrac{2 e U}{m}}$`,
      wrong:[T`$v = \dfrac{2 e U}{m}$`, T`$v = \sqrt{\dfrac{e U}{2 m}}$`, T`$v = \dfrac{e U}{m}$`],
      def:'Energieerhaltung: Die Arbeit des Feldes wird zu Bewegungsenergie.', fx:'Gilt nur, solange v deutlich kleiner als c ist.' },
    { id:'ph-t05', deck:'pt', q:'Ein Elektron fliegt SENKRECHT zu den Feldlinien in einen Plattenkondensator (Querfeld). Bahnform im Kondensator?', term:'Parabel – wie beim waagrechten Wurf: parallel zu den Platten konstante Geschwindigkeit, senkrecht dazu gleichmäßig beschleunigt.',
      wrong:['Kreisbahn', 'Gerade', 'Schraubenlinie'], fx:'Ablenkung zur Plus-Platte. Nach dem Kondensator fliegt es geradlinig weiter.' },
    { id:'ph-t06', deck:'pt', noMC:true, q:'Wodurch wird die Ablenkung im Querfeld größer?', term:L('Größere Ablenkspannung bzw. kleinerer Plattenabstand (stärkeres Feld).', 'Längere Platten (längere Verweildauer).', 'Kleinere Geschwindigkeit, also kleinere Beschleunigungsspannung.') },
    { id:'ph-t07', deck:'pt', noMC:true, q:'Wozu dienen die Ablenkplatten einer Braun’schen Röhre (Oszilloskop)?', term:'Zwei Querfelder lenken den Elektronenstrahl waagrecht und senkrecht ab – der Leuchtpunkt auf dem Schirm zeichnet so den Spannungsverlauf.' },
    { id:'ph-t16', deck:'pt', q:'Was ist die spezifische Ladung eines Teilchens?', term:T`Das Verhältnis $\dfrac{q}{m}$ – es bestimmt, wie stark das Teilchen in Feldern beschleunigt bzw. abgelenkt wird.`,
      wrong:[T`Das Produkt $q \cdot m$`, T`Das Verhältnis $\dfrac{m}{q}$`, T`Die Ladung pro Volumen`] },
    { id:'ph-t08', deck:'pt', noMC:true, q:T`Wann versagt $v = \sqrt{\dfrac{2eU}{m}}$?`, term:'Bei Geschwindigkeiten nahe c – Faustregel ab etwa 10 % von c, beim Elektron also ab einigen kV. Die Formel liefert dann sogar v > c, was unmöglich ist.' },
    { id:'ph-t09', deck:'pt', q:T`Lorentzfaktor $\gamma$`, term:T`$\gamma = \dfrac{1}{\sqrt{1 - \dfrac{v^2}{c^2}}}$`,
      wrong:[T`$\gamma = \sqrt{1 - \dfrac{v^2}{c^2}}$`, T`$\gamma = \dfrac{1}{1 - \dfrac{v}{c}}$`, T`$\gamma = \dfrac{1}{\sqrt{1 + \dfrac{v^2}{c^2}}}$`],
      def:T`Immer $\geq 1$. Bei $v = 0{,}87\,c$ ist $\gamma \approx 2$.` },
    { id:'ph-t10', deck:'pt', q:'Relativistischer Impuls', term:T`$p = \gamma \, m_0 \, v$`, wrong:[T`$p = m_0 \, v$`, T`$p = \gamma \, m_0 \, c$`, T`$p = \dfrac{m_0 c^2}{v}$`] },
    { id:'ph-t11', deck:'pt', q:'Relativistische Gesamtenergie und Ruheenergie', term:T`$E = \gamma \, m_0 c^2$ und $E_0 = m_0 c^2$`,
      wrong:[T`$E = \dfrac{1}{2} \gamma \, m_0 v^2$ und $E_0 = 0$`, T`$E = m_0 c^2$ und $E_0 = \gamma m_0 c^2$`, T`$E = \gamma \, m_0 v^2$ und $E_0 = m_0 v^2$`] },
    { id:'ph-t12', deck:'pt', q:'Relativistische Bewegungsenergie', term:T`$E_\text{kin} = E - E_0 = (\gamma - 1) \, m_0 c^2$`,
      wrong:[T`$E_\text{kin} = \dfrac{1}{2} m_0 v^2$`, T`$E_\text{kin} = \gamma \, m_0 c^2$`, T`$E_\text{kin} = (\gamma + 1) \, m_0 c^2$`],
      fx:T`Beim Beschleunigen durch $U$: $(\gamma - 1) \, m_0 c^2 = e U$.` },
    { id:'ph-t13', deck:'pt', q:'Energie-Impuls-Beziehung', term:T`$E^2 = (p c)^2 + (m_0 c^2)^2$`,
      wrong:[T`$E = p c + m_0 c^2$`, T`$E^2 = (p c)^2 - (m_0 c^2)^2$`, T`$E = \dfrac{p^2}{2 m_0}$`] },
    { id:'ph-t14', deck:'pt', q:T`Ein Elektron durchläuft $511\,\mathrm{kV}$. Wie groß ist $\gamma$?`, term:T`$\gamma = 2$, also $v \approx 0{,}87\,c$`,
      wrong:[T`$\gamma = 1$, also $v = c$`, T`$\gamma = 1{,}5$, also $v \approx 0{,}5\,c$`, T`$\gamma = 511$`],
      def:L(T`Bewegungsenergie = Ruheenergie ⇒ $E = 2 E_0$ ⇒ $\gamma = 2$.`, T`$v = c \sqrt{1 - \dfrac{1}{4}} \approx 0{,}87\,c$`) },
    { id:'ph-t20', deck:'pt', ql:'Rechnen', q:'Zufallsaufgabe: Bewegungsenergie nach Durchlaufen einer Spannung', term:T`$E_\text{kin} = q \cdot U$`, def:'Für Ladung e: so viele eV wie Volt. Die Masse spielt für die Energie keine Rolle.',
      gen() {
        const U = pick([50, 100, 250, 400, 500, 1000, 2000, 5000]), p = pick(['e', 'p', 'a']), z = p === 'a' ? 2 : 1, inJ = Math.random() < 0.5;
        const name = { e: 'Ein Elektron', p: 'Ein Proton', a: T`Ein Alphateilchen (Ladung $2e$)` }[p];
        const ev = x => x >= 1000 ? T`$${dz(x / 1000)}\,\mathrm{keV}$` : T`$${x}\,\mathrm{eV}$`, J = x => `$${sci(x, 3)}\\,\\mathrm{J}$`;
        const E = z * U, right = inJ ? J(E * 1.602e-19) : ev(E);
        const cands = inJ ? [J(E * 1.602e-16), J(E * 1.602e-22), J((z === 2 ? U : 2 * U) * 1.602e-19), J(E * 9.11e-31)] : [ev(z === 2 ? U : 2 * U), ev(E * 1000), ev(E / 10), ev(E * 2)];
        return { q: T`${name} durchläuft aus der Ruhe die Spannung $U = ${U}\,\mathrm{V}$. Bewegungsenergie in ${inJ ? 'Joule' : 'eV'}?`, term: right, wrong: opts(right, cands),
          def: T`$E_\text{kin} = q \cdot U = ${z === 2 ? '2' : ''}e \cdot ${U}\,\mathrm{V} = ${E}\,\mathrm{eV}$` + (inJ ? T` $= ${E} \cdot 1{,}602 \cdot 10^{-19}\,\mathrm{J}$` : '') + (p !== 'e' ? ' – die Masse spielt dafür keine Rolle.' : '') };
      } },
    { id:'ph-t21', deck:'pt', ql:'Je–desto', q:'Zufallsaufgabe: Beschleunigungsspannung ändern → Geschwindigkeit', term:T`$v \sim \sqrt{U}$`, def:T`$v = \sqrt{\dfrac{2 e U}{m}} \sim \sqrt{U}$ (nichtrelativistisch).`,
      gen() {
        const [n, w] = pick([[[4, 1], 'vervierfacht'], [[9, 1], 'verneunfacht'], [[16, 1], 'versechzehnfacht'], [[1, 4], 'auf ein Viertel gesenkt'], [[1, 9], 'auf ein Neuntel gesenkt']]);
        const r = [Math.sqrt(n[0]), Math.sqrt(n[1])];
        return { q: T`Die Beschleunigungsspannung wird ${w}. Wie ändert sich die Endgeschwindigkeit $v$ (nichtrelativistisch)?`, term: fac(r),
          wrong: facOpts(r, [n, [n[0] * n[0], n[1] * n[1]], [r[1], r[0]], [1, 1]]), def: T`$v \sim \sqrt{U}$: Spannung ${w} → Geschwindigkeit ` + fac(r) + '.' };
      } },

    /* ───────────── MAGNETFELD & LORENTZKRAFT ───────────── */
    { id:'ph-m01', deck:'pm', noMC:true, q:'Eigenschaften magnetischer Feldlinien', term:L('Geschlossene Linien – ohne Anfang und Ende (keine Monopole).', 'Außerhalb des Magneten von N nach S, innen von S nach N.', 'Schneiden sich nie.') },
    { id:'ph-m02', deck:'pm', noMC:true, q:'Magnetfeld um einen geraden stromdurchflossenen Leiter und Richtungsregel', term:'Konzentrische Kreise um den Leiter. Rechte-Faust-Regel: Daumen in technische Stromrichtung, die gekrümmten Finger zeigen die Feldrichtung.', fx:'Für die Elektronenflussrichtung entsprechend die linke Hand.' },
    { id:'ph-m03', deck:'pm', q:'Magnetfeld einer langgestreckten Spule', term:'Innen nahezu homogen (parallele Feldlinien), außen wie ein Stabmagnet.', wrong:['Innen feldfrei, außen homogen.', 'Konzentrische Kreise um die Spulenachse.', 'Radial nach außen gerichtet.'] },
    { id:'ph-m04', deck:'pm', q:T`Definition der magnetischen Flussdichte $B$`, term:T`$B = \dfrac{F}{I \cdot l}$ (Leiter senkrecht zum Feld)`, wrong:[T`$B = F \cdot I \cdot l$`, T`$B = \dfrac{I \cdot l}{F}$`, T`$B = \dfrac{F \cdot I}{l}$`],
      def:T`Kraft auf einen stromdurchflossenen Leiter pro Stromstärke und Leiterlänge. Einheit: $1\,\mathrm{T} = 1\,\dfrac{\mathrm{N}}{\mathrm{A\,m}}$.` },
    { id:'ph-m05', deck:'pm', q:T`Kraft auf einen Leiter (Länge $l$, Strom $I$) senkrecht zum Magnetfeld`, term:T`$F = I \cdot l \cdot B$`, wrong:[T`$F = \dfrac{I \cdot B}{l}$`, T`$F = \dfrac{I \cdot l}{B}$`, T`$F = \dfrac{B}{I \cdot l}$`],
      fx:'Leiter parallel zum Feld: keine Kraft. Richtung mit der Drei-Finger-Regel (Stromrichtung statt v).' },
    { id:'ph-m06', deck:'pm', q:'Flussdichte im Inneren einer langen Spule', term:T`$B = \mu_0 \, \mu_r \, \dfrac{N \cdot I}{l}$`, wrong:[T`$B = \mu_0 \, \mu_r \, \dfrac{N \cdot l}{I}$`, T`$B = \mu_0 \, N \, I \, l$`, T`$B = \mu_0 \, \mu_r \, \dfrac{I}{N \cdot l}$`],
      def:'N: Windungszahl, l: Spulenlänge. Hängt NICHT vom Querschnitt der Spule ab.' },
    { id:'ph-m07', deck:'pm', noMC:true, q:'Was bewirkt ein Eisenkern in einer Spule?', term:T`Er verstärkt das Magnetfeld um den Faktor $\mu_r$ (Permeabilitätszahl; bei Eisen einige 100 bis einige 1000) → Elektromagnet.` },
    { id:'ph-m08', deck:'pm', q:T`Lorentzkraft auf eine Ladung $q$ mit $v \perp B$`, term:T`$F_L = q \cdot v \cdot B$`, wrong:[T`$F_L = \dfrac{q \, B}{v}$`, T`$F_L = q \, v^2 B$`, T`$F_L = \dfrac{v \, B}{q}$`],
      def:T`Wirkt nur auf BEWEGTE Ladungen. Allgemein: $F = q v B \sin\alpha$ ($\alpha$: Winkel zwischen $v$ und $B$).` },
    { id:'ph-m09', deck:'pm', noMC:true, q:'Drei-Finger-Regel (UVW) für die Lorentzkraft', term:L('Rechte Hand für positive Ladungen:', T`Daumen = Ursache: Bewegungsrichtung $v$`, T`Zeigefinger = Vermittlung: Magnetfeld $B$`, T`Mittelfinger = Wirkung: Kraft $F$`, 'Elektronen: linke Hand – oder Ergebnis umdrehen.'),
      fx:'Prüf im Buch, welche Hand euer Lehrer als Standard nimmt. Die Physik ist dieselbe.' },
    { id:'ph-m10', deck:'pm', q:'Ändert die Lorentzkraft den Betrag der Geschwindigkeit?', term:T`Nein. Sie steht immer senkrecht auf $v$ und verrichtet keine Arbeit – nur die Richtung ändert sich, die Bewegungsenergie bleibt gleich.`,
      wrong:['Ja, sie beschleunigt das Teilchen.', 'Ja, sie bremst das Teilchen ab.', 'Nur bei Elektronen.'] },
    { id:'ph-m11', deck:'pm', q:'Geladenes Teilchen fliegt senkrecht in ein homogenes Magnetfeld. Ansatz für den Bahnradius?', term:T`Lorentzkraft = Zentripetalkraft: $q v B = \dfrac{m v^2}{r} \;\Rightarrow\; r = \dfrac{m v}{q B}$`,
      wrong:[T`$q E = \dfrac{m v^2}{r} \;\Rightarrow\; r = \dfrac{m v^2}{q E}$`, T`$q v B = m g$`, T`$q v B = \dfrac{1}{2} m v^2$`] },
    { id:'ph-m12', deck:'pm', q:'Umlaufdauer auf der Kreisbahn im Magnetfeld', term:T`$T = \dfrac{2\pi m}{q B}$ – unabhängig von $v$ und $r$`, wrong:[T`$T = \dfrac{2\pi r}{q B}$`, T`$T = \dfrac{q B}{2\pi m}$`, T`$T = \dfrac{2\pi m v}{q B}$`],
      fx:'Schnellere Teilchen laufen auf größeren Kreisen, brauchen aber genauso lang. Darauf beruht das Zyklotron.' },
    { id:'ph-m13', deck:'pm', q:'Ein Teilchen fliegt PARALLEL zu den Feldlinien ins Magnetfeld. Bahn?', term:T`Gerade – keine Lorentzkraft, weil $v \parallel B$.`, wrong:['Kreis', 'Parabel', 'Schraubenlinie'],
      fx:'Schräg zum Feld: Schraubenbahn (Kreisbewegung plus gleichförmige Bewegung entlang B).' },
    { id:'ph-m14', deck:'pm', noMC:true, q:'Elektron und Proton mit gleicher Geschwindigkeit im selben Magnetfeld: Unterschied der Kreisbahnen?', term:L('Entgegengesetzter Umlaufsinn (entgegengesetzte Ladung).', T`Das Elektron läuft auf einem rund 1836-mal kleineren Kreis ($r \sim m$).`) },
    { id:'ph-m15', deck:'pm', q:T`Fadenstrahlrohr: Formel für die spezifische Ladung $\dfrac{e}{m}$`, term:T`$\dfrac{e}{m} = \dfrac{2U}{B^2 r^2}$`, wrong:[T`$\dfrac{e}{m} = \dfrac{2U}{B r^2}$`, T`$\dfrac{e}{m} = \dfrac{U}{2 B^2 r^2}$`, T`$\dfrac{e}{m} = \dfrac{B^2 r^2}{2U}$`],
      def:L(T`$v = \sqrt{\dfrac{2 e U}{m}}$ in $r = \dfrac{m v}{e B}$ einsetzen und quadrieren.`, 'Die Bahn wird sichtbar, weil die Elektronen Gasatome zum Leuchten anregen.') },
    { id:'ph-m16', deck:'pm', noMC:true, q:'Wozu dient das Helmholtz-Spulenpaar?', term:'Zwei gleiche Spulen im Abstand ihres Radius erzeugen dazwischen ein großräumig homogenes Magnetfeld (z. B. beim Fadenstrahlrohr).' },
    { id:'ph-m17', deck:'pm', q:'Geschwindigkeitsfilter (Wien-Filter): Welche Teilchen fliegen gerade hindurch?', term:T`Die mit $v = \dfrac{E}{B}$ – dann ist $q E = q v B$, unabhängig von Ladung und Masse.`,
      wrong:[T`Die mit $v = \dfrac{B}{E}$`, T`Die mit $v = E \cdot B$`, T`Die mit $v = \dfrac{q E}{m B}$`], def:'Elektrisches und magnetisches Feld stehen senkrecht zueinander, die Kräfte entgegengesetzt.' },
    { id:'ph-m18', deck:'pm', noMC:true, q:'Prinzip eines Massenspektrometers', term:L(T`1. Wien-Filter: Nur Teilchen mit $v = \dfrac{E}{B_1}$ kommen durch.`, T`2. Im Magnetfeld $B_2$ Kreisbahn mit $r = \dfrac{m v}{q B_2}$.`, T`3. Verschiedene Massen (Isotope) → verschiedene Radien: $m = \dfrac{q B_2 r}{v}$.`) },
    { id:'ph-m19', deck:'pm', noMC:true, q:'Hall-Effekt: Wie entsteht die Hall-Spannung?', term:L('Ladungsträger in einem stromdurchflossenen Plättchen im Magnetfeld werden durch die Lorentzkraft zu einer Seite abgelenkt.', T`Es baut sich ein Querfeld auf, bis $q E_H = q v B$ (Gleichgewicht).`, T`Hall-Spannung: $U_H = B \cdot v \cdot b$ ($b$: Breite), also $U_H \sim B$.`) },
    { id:'ph-m20', deck:'pm', q:'Wozu dient eine Hall-Sonde?', term:T`Zum Messen der magnetischen Flussdichte $B$, weil $U_H \sim B$ (bei konstantem Steuerstrom).`, wrong:['Zum Messen von Ladungen.', 'Zum Messen von Kapazitäten.', 'Zum Erzeugen eines Magnetfelds.'] },
    { id:'ph-m21', deck:'pm', noMC:true, q:'Linearbeschleuniger – Prinzip', term:'Die Teilchen durchlaufen Driftröhren; in den Spalten dazwischen beschleunigt sie eine Wechselspannung immer wieder. Die Röhren werden länger, weil die Teilchen schneller werden, aber pro Röhre gleich lang brauchen sollen.' },
    { id:'ph-m22', deck:'pm', noMC:true, q:'Zyklotron – Prinzip', term:L('Zwei D-förmige Hohlelektroden in einem Magnetfeld.', 'Im Spalt beschleunigt eine Wechselspannung, das Magnetfeld zwingt die Teilchen auf Halbkreise mit wachsendem Radius.', T`Eine feste Frequenz reicht, weil $T = \dfrac{2\pi m}{q B}$ nicht von $v$ abhängt (nichtrelativistisch).`) },
    { id:'ph-m23', deck:'pm', noMC:true, q:'E-Feld und B-Feld: Auf welche Ladungen wirken sie?', term:L(T`E-Feld: auf ruhende UND bewegte Ladungen, $F = q E$ entlang der Feldlinien.`, T`B-Feld: nur auf bewegte Ladungen, $F = q v B$ senkrecht zu $v$ und $B$.`) },
    { id:'ph-m24', deck:'pm', q:'Wo liegt der magnetische Südpol der Erde?', term:'In der Nähe des geografischen Nordpols – deshalb zeigt der Nordpol der Kompassnadel nach Norden.', wrong:['Am geografischen Südpol.', 'Am Äquator.', 'Die Erde hat keine Magnetpole.'] },
    { id:'ph-m30', deck:'pm', ql:'Richtung', q:'Zufallsaufgabe: Richtung der Lorentzkraft', term:'Drei-Finger-Regel', def:'Rechte Hand (positive Ladung): Daumen v, Zeigefinger B, Mittelfinger F. Elektron: linke Hand oder Ergebnis umdrehen.',
      gen() {
        const v = pick([[1, 0], [-1, 0], [0, 1], [0, -1]]), bz = pick([-1, 1]), p = pick(['e', 'p']), s = p === 'e' ? -1 : 1;
        const F = [s * v[1] * bz, -s * v[0] * bz]; // F = q·(v × B) mit B = (0,0,bz)
        return { q: `${p === 'e' ? 'Elektron' : 'Proton'} fliegt mit v durch das Magnetfeld. Richtung der Lorentzkraft im gezeichneten Moment?`, svg: lorentzSVG(v, bz, p), term: dirName(F), fixed: DIRS,
          def: `${p === 'e' ? 'Elektron → linke Hand' : 'Proton → rechte Hand'}: Daumen in Richtung v, Zeigefinger ${bz < 0 ? 'in die Ebene hinein' : 'aus der Ebene heraus'} (B), Mittelfinger zeigt die Kraft.` };
      } },
    { id:'ph-m31', deck:'pm', ql:'Je–desto', q:'Zufallsaufgabe: Wie ändert sich der Bahnradius im Magnetfeld?', term:T`$r = \dfrac{m v}{q B}$`, def:T`$r = \dfrac{m v}{q B}$. Bei Beschleunigung durch $U$ gilt $v \sim \sqrt{U}$, also $r \sim \sqrt{U}$.`,
      gen() {
        const n = pick([2, 3]);
        const [q, r] = pick([
          [`Die Geschwindigkeit des Teilchens wird ${n === 2 ? 'verdoppelt' : 'verdreifacht'}.`, [n, 1]],
          [`Die magnetische Flussdichte B wird ${n === 2 ? 'verdoppelt' : 'verdreifacht'}.`, [1, n]],
          [`Die Beschleunigungsspannung wird ${n === 2 ? 'vervierfacht' : 'verneunfacht'} (B bleibt).`, [n, 1]],
          ['Statt eines Protons fliegt ein Alphateilchen (4-fache Masse, doppelte Ladung) mit gleicher Geschwindigkeit.', [2, 1]],
          [`Ein Teilchen mit ${n === 2 ? 'doppelter' : 'dreifacher'} Masse, aber gleicher Ladung und Geschwindigkeit.`, [n, 1]],
        ]);
        return { q: T`${q} Wie ändert sich der Bahnradius $r$?`, term: fac(r), wrong: facOpts(r, [[r[1], r[0]], [r[0] * r[0], r[1] * r[1]], [1, 1], [r[1] * r[1], r[0] * r[0]]]) };
      } },

    /* ───────────── INDUKTION & SCHWINGKREIS (12.2) ───────────── */
    { id:'ph-i01', deck:'pi', q:T`Magnetischer Fluss $\Phi$`, term:T`$\Phi = B \cdot A$ ($A$ senkrecht zu $B$)`, wrong:[T`$\Phi = \dfrac{B}{A}$`, T`$\Phi = B \cdot A \cdot t$`, T`$\Phi = B \cdot l$`],
      def:T`Einheit $1\,\mathrm{Wb} = 1\,\mathrm{Vs} = 1\,\mathrm{T\,m^2}$. Anschaulich: Zahl der Feldlinien durch die Fläche.` },
    { id:'ph-i02', deck:'pi', q:'Induktionsgesetz', term:T`$U_\text{ind} = -N \cdot \dot{\Phi} = -N \cdot \dfrac{\Delta \Phi}{\Delta t}$`, wrong:[T`$U_\text{ind} = N \cdot \Phi$`, T`$U_\text{ind} = -N \cdot \Delta\Phi \cdot \Delta t$`, T`$U_\text{ind} = -\dfrac{\Phi}{N}$`],
      def:'Nur die ÄNDERUNG des Flusses induziert eine Spannung. Konstanter Fluss → 0 V.' },
    { id:'ph-i03', deck:'pi', noMC:true, q:'Zwei Wege, den magnetischen Fluss zu ändern', term:L(T`$B$ ändert sich: $\dot\Phi = A \cdot \dot B$ (Strom in der Feldspule ändern, Magnet nähern).`, T`$A$ ändert sich: $\dot\Phi = B \cdot \dot A$ (Leiterschleife hinein- oder herausziehen, Spule drehen).`) },
    { id:'ph-i04', deck:'pi', q:T`Spannung an einem Leiterstab (Länge $l$), der mit $v$ senkrecht durch ein Magnetfeld $B$ bewegt wird`, term:T`$U = B \cdot l \cdot v$`, wrong:[T`$U = \dfrac{B \, l}{v}$`, T`$U = B \cdot l \cdot v^2$`, T`$U = \dfrac{B \, v}{l}$`] },
    { id:'ph-i05', deck:'pi', q:'Lenz’sche Regel', term:'Der Induktionsstrom ist so gerichtet, dass sein Magnetfeld der Ursache seiner Entstehung entgegenwirkt.',
      wrong:['Der Induktionsstrom verstärkt immer die Ursache seiner Entstehung.', 'Der Induktionsstrom fließt immer im Uhrzeigersinn.', 'Der Induktionsstrom ist immer so groß wie der Erregerstrom.'],
      def:'Folge der Energieerhaltung. Beispiele: Thomson’scher Ringversuch (Ring springt weg), Wirbelstrombremse, fallender Magnet im Kupferrohr.' },
    { id:'ph-i06', deck:'pi', q:'Spannung eines Generators (Spule dreht sich gleichmäßig im Magnetfeld)', term:T`$U(t) = U_0 \cdot \sin(\omega t)$ mit $U_0 = N B A \omega$`, wrong:[T`$U(t) = U_0 \cdot \omega t$`, T`$U(t) = U_0 \cdot e^{-\omega t}$`, T`$U(t) = N B A$ (konstant)`] },
    { id:'ph-i07', deck:'pi', q:'Haushaltsnetz: Frequenz und Spannung', term:T`$f = 50\,\mathrm{Hz}$, $U_\text{eff} = 230\,\mathrm{V}$, Scheitelwert $U_0 = \sqrt{2} \cdot 230\,\mathrm{V} \approx 325\,\mathrm{V}$`,
      wrong:[T`$f = 60\,\mathrm{Hz}$, $U_\text{eff} = 110\,\mathrm{V}$`, T`$f = 50\,\mathrm{Hz}$, $U_\text{eff} = 325\,\mathrm{V}$`, T`$f = 230\,\mathrm{Hz}$, $U_\text{eff} = 50\,\mathrm{V}$`] },
    { id:'ph-i08', deck:'pi', noMC:true, q:'Selbstinduktion', term:T`Ändert sich der Strom in einer Spule, ändert sich ihr eigenes Magnetfeld – das induziert in ihr selbst eine Gegenspannung: $U = -L \cdot \dot I$.` },
    { id:'ph-i09', deck:'pi', noMC:true, q:'Einschalten: Lampe mit Spule vs. Lampe mit Widerstand (parallel)', term:'Die Lampe im Spulenzweig leuchtet verzögert auf: Die Selbstinduktionsspannung wirkt dem Stromanstieg entgegen (Lenz).' },
    { id:'ph-i10', deck:'pi', noMC:true, q:'Ausschalten einer Spule: Was passiert und warum ist das wichtig?', term:L('Der Strom bricht schnell zusammen → sehr große Induktionsspannung (Funken, Glimmlampe blitzt auf).', 'Nutzen: Zündspule, Weidezaun.', 'Risiko: Funken am Schalter, Bauteile gehen kaputt → Schutzdiode.') },
    { id:'ph-i11', deck:'pi', q:'Induktivität einer langen Spule', term:T`$L = \mu_0 \, \mu_r \, \dfrac{N^2 A}{l}$`, wrong:[T`$L = \mu_0 \, \mu_r \, \dfrac{N A}{l}$`, T`$L = \mu_0 \, \mu_r \, \dfrac{N^2 l}{A}$`, T`$L = \mu_0 \, N^2 A \, l$`], def:T`Einheit: $1\,\mathrm{H} = 1\,\dfrac{\mathrm{Vs}}{\mathrm{A}}$.` },
    { id:'ph-i12', deck:'pi', q:'Energie im Magnetfeld einer Spule', term:T`$W = \dfrac{1}{2} \, L \, I^2$`, wrong:[T`$W = \dfrac{1}{2} \, C \, U^2$`, T`$W = L \, I^2$`, T`$W = \dfrac{1}{2} \, L \, I$`], fx:T`Gegenstück zum Kondensator mit $W = \dfrac{1}{2} C U^2$.` },
    { id:'ph-i13', deck:'pi', noMC:true, q:'Elektromagnetischer Schwingkreis: Was passiert?', term:L('Der geladene Kondensator entlädt sich über die Spule.', T`Die Energie pendelt periodisch zwischen dem elektrischen Feld des Kondensators ($\dfrac{1}{2} C U^2$) und dem Magnetfeld der Spule ($\dfrac{1}{2} L I^2$).`) },
    { id:'ph-i14', deck:'pi', q:'Thomson-Gleichung (Schwingungsdauer)', term:T`$T = 2\pi \sqrt{L \, C}$`, wrong:[T`$T = 2\pi \sqrt{\dfrac{L}{C}}$`, T`$T = 2\pi \, L \, C$`, T`$T = \dfrac{1}{2\pi \sqrt{L C}}$`], fx:T`Frequenz: $f = \dfrac{1}{2\pi\sqrt{L C}}$.` },
    { id:'ph-i15', deck:'pi', q:'Schwingkreis: Der Strom ist maximal, wenn …', term:'… der Kondensator gerade ungeladen ist (U = 0). Strom und Spannung sind um eine Viertelperiode verschoben.',
      wrong:['… die Spannung am Kondensator maximal ist.', '… die Spule keine Energie enthält.', '… die Schwingung gerade beginnt.'] },
    { id:'ph-i16', deck:'pi', noMC:true, q:'Analogie Federpendel ↔ Schwingkreis', term:L(T`Auslenkung $x$ ↔ Ladung $Q$`, T`Geschwindigkeit $v$ ↔ Stromstärke $I$`, T`Masse $m$ ↔ Induktivität $L$ (Trägheit)`, T`Federhärte $D$ ↔ $\dfrac{1}{C}$`, 'Spannenergie ↔ Energie im Kondensator', 'Bewegungsenergie ↔ Energie in der Spule') },
    { id:'ph-i17', deck:'pi', q:'Schwingungsdauer des Federpendels', term:T`$T = 2\pi \sqrt{\dfrac{m}{D}}$`, wrong:[T`$T = 2\pi \sqrt{\dfrac{D}{m}}$`, T`$T = 2\pi \sqrt{\dfrac{l}{g}}$`, T`$T = 2\pi \dfrac{m}{D}$`], fx:T`Fadenpendel: $T = 2\pi \sqrt{\dfrac{l}{g}}$ (aus der 11).` },
    { id:'ph-i18', deck:'pi', noMC:true, q:'Warum ist eine reale elektromagnetische Schwingung gedämpft?', term:'Der ohmsche Widerstand von Spule und Leitungen wandelt bei jedem Durchgang Energie in Wärme um – die Amplitude nimmt ab.' },
    { id:'ph-i19', deck:'pi', noMC:true, q:'Technische Anwendungen der Induktion', term:L('Generator, Dynamo', T`Transformator ($\dfrac{U_1}{U_2} = \dfrac{N_1}{N_2}$)`, 'Induktionsherd', 'Wirbelstrombremse', 'kabelloses Laden', 'Metalldetektor') },
    { id:'ph-i30', deck:'pi', ql:'Je–desto', q:'Zufallsaufgabe: Thomson-Gleichung', term:T`$T \sim \sqrt{L C}$`, def:T`$T = 2\pi\sqrt{LC}$, also $T \sim \sqrt{L}$ und $T \sim \sqrt{C}$; die Frequenz verhält sich umgekehrt.`,
      gen() {
        const [n, w] = pick([[[4, 1], 'vervierfacht'], [[9, 1], 'verneunfacht'], [[1, 4], 'auf ein Viertel verkleinert']]), what = pick(['L', 'C']), askF = Math.random() < 0.4;
        let r = [Math.sqrt(n[0]), Math.sqrt(n[1])]; if (askF) r = [r[1], r[0]];
        return { q: T`Die ${what === 'L' ? 'Induktivität $L$' : 'Kapazität $C$'} wird ${w}. Wie ändert sich die ${askF ? 'Frequenz $f$' : 'Schwingungsdauer $T$'}?`, term: fac(r),
          wrong: facOpts(r, [askF ? [n[1], n[0]] : n, [r[1], r[0]], [1, 1], [r[0] * r[0] * r[0], r[1] * r[1] * r[1]]]) };
      } },

    /* ───────────── ELEKTROMAGNETISCHE WELLEN (12.3) ───────────── */
    { id:'ph-w01', deck:'pw', q:'Zusammenhang von Ausbreitungsgeschwindigkeit, Wellenlänge und Frequenz', term:T`$c = \lambda \cdot f$`, wrong:[T`$c = \dfrac{\lambda}{f}$`, T`$c = \dfrac{f}{\lambda}$`, T`$c = \lambda + f$`] },
    { id:'ph-w02', deck:'pw', noMC:true, q:'Was schwingt bei einer elektromagnetischen Welle?', term:L('Elektrisches und magnetisches Feld – senkrecht zueinander und senkrecht zur Ausbreitungsrichtung (transversal).', T`Kein Medium nötig; im Vakuum Ausbreitung mit $c$.`) },
    { id:'ph-w03', deck:'pw', q:'Wodurch entstehen elektromagnetische Wellen?', term:'Durch beschleunigte Ladungen – z. B. Elektronen, die im Hertz’schen Dipol hin- und herschwingen.', wrong:['Durch ruhende Ladungen.', 'Durch konstante Gleichströme.', 'Nur durch glühende Körper.'] },
    { id:'ph-w04', deck:'pw', q:'Länge eines Hertz’schen Dipols in der Grundschwingung', term:T`$l = \dfrac{\lambda}{2}$`, wrong:[T`$l = \lambda$`, T`$l = 2\lambda$`, T`$l = \dfrac{\lambda}{4}$`],
      def:T`Im Fernfeld lösen sich die Feldlinien ab und breiten sich als Welle aus. $\vec E$ schwingt parallel zum Dipolstab.` },
    { id:'ph-w05', deck:'pw', q:'Was beweist die Polarisierbarkeit von Dipol- und Mikrowellenstrahlung?', term:'Dass es Transversalwellen sind – Longitudinalwellen lassen sich nicht polarisieren.', wrong:['Dass es Longitudinalwellen sind.', 'Dass es Teilchen sind.', 'Dass sie eine Masse haben.'],
      fx:'Empfangsdipol quer zum Sender → kein Empfang.' },
    { id:'ph-w06', deck:'pw', noMC:true, q:'Welche Wellenphänomene zeigt Mikrowellenstrahlung?', term:L('Reflexion', 'Brechung', 'Beugung', 'Interferenz', 'Polarisation') },
    { id:'ph-w07', deck:'pw', q:'Wann ist Beugung an einem Spalt deutlich zu sehen?', term:'Wenn die Spaltbreite in der Größenordnung der Wellenlänge liegt (oder kleiner ist).', wrong:['Wenn der Spalt viel breiter als die Wellenlänge ist.', 'Nur bei sichtbarem Licht.', 'Nur im Vakuum.'] },
    { id:'ph-w08', deck:'pw', q:T`Bedingungen für konstruktive und destruktive Interferenz (Gangunterschied $\Delta s$)`, term:L(T`Maximum: $\Delta s = k \cdot \lambda$`, T`Minimum: $\Delta s = (2k + 1) \cdot \dfrac{\lambda}{2}$`),
      wrong:[L(T`Maximum: $\Delta s = (2k + 1) \cdot \dfrac{\lambda}{2}$`, T`Minimum: $\Delta s = k \cdot \lambda$`), L(T`Maximum: $\Delta s = k \cdot \dfrac{\lambda}{2}$`, T`Minimum: $\Delta s = k \cdot \lambda$`), L(T`Maximum: $\Delta s = 2k \cdot \lambda$`, T`Minimum: $\Delta s = k \cdot \dfrac{\lambda}{4}$`)] },
    { id:'ph-w09', deck:'pw', q:T`Gangunterschied am Doppelspalt (Spaltabstand $d$, Winkel $\alpha$)`, term:T`$\Delta s = d \cdot \sin\alpha$`, wrong:[T`$\Delta s = d \cdot \cos\alpha$`, T`$\Delta s = \dfrac{d}{\sin\alpha}$`, T`$\Delta s = \lambda \cdot \sin\alpha$`] },
    { id:'ph-w10', deck:'pw', q:'Wellenlänge aus einer Doppelspalt-Messung (kleine Winkel)', term:T`$\lambda = \dfrac{d \cdot a_k}{k \cdot e}$`, wrong:[T`$\lambda = \dfrac{k \cdot e}{d \cdot a_k}$`, T`$\lambda = \dfrac{d \cdot e}{k \cdot a_k}$`, T`$\lambda = d \cdot a_k \cdot k$`],
      def:L(T`$a_k$: Abstand des k-ten Maximums von der Mitte, $e$: Abstand Spalt–Schirm.`, T`Für kleine Winkel gilt $\sin\alpha \approx \tan\alpha = \dfrac{a_k}{e}$.`), fx:'Die Buchstaben können in eurem Buch anders heißen – die Idee bleibt.' },
    { id:'ph-w11', deck:'pw', q:'Gitter: Bedingung für das k-te Maximum', term:T`$g \cdot \sin\alpha_k = k \cdot \lambda$`, wrong:[T`$g \cdot \cos\alpha_k = k \cdot \lambda$`, T`$\lambda \cdot \sin\alpha_k = k \cdot g$`, T`$g \cdot \sin\alpha_k = (2k+1)\dfrac{\lambda}{2}$`],
      def:'g: Gitterkonstante (Abstand benachbarter Spalte). 500 Striche pro mm → g = 2 µm. Viele Spalte → schärfere, hellere Maxima als beim Doppelspalt.' },
    { id:'ph-w12', deck:'pw', q:'Weißes Licht am Gitter: Welche Farbe wird am stärksten abgelenkt?', term:'Rot (größte Wellenlänge → größter Winkel). Das Maximum 0. Ordnung bleibt weiß.', wrong:['Violett', 'Grün', 'Alle Farben gleich stark.'], fx:'Beim Prisma ist es umgekehrt: Dort wird Violett am stärksten gebrochen.' },
    { id:'ph-w13', deck:'pw', q:'Wellenlängenbereich des sichtbaren Lichts', term:'ca. 380 nm (violett) bis 780 nm (rot)', wrong:['ca. 380 µm bis 780 µm', 'ca. 38 nm bis 78 nm', 'ca. 3,8 mm bis 7,8 mm'] },
    { id:'ph-w14', deck:'pw', q:'Elektromagnetisches Spektrum nach steigender Frequenz', term:'Radiowellen → Mikrowellen → Infrarot → sichtbares Licht → UV → Röntgen → Gamma',
      wrong:['Gamma → Röntgen → UV → sichtbares Licht → Infrarot → Mikrowellen → Radiowellen', 'Radiowellen → Infrarot → Mikrowellen → sichtbares Licht → Röntgen → UV → Gamma', 'Mikrowellen → Radiowellen → sichtbares Licht → Infrarot → UV → Gamma → Röntgen'] },
    { id:'ph-w15', deck:'pw', q:'Stehende Welle durch Reflexion: Abstand zweier benachbarter Knoten', term:T`$\dfrac{\lambda}{2}$`, wrong:[T`$\lambda$`, T`$\dfrac{\lambda}{4}$`, T`$2\lambda$`], def:'So lässt sich die Wellenlänge messen: Knotenabstand verdoppeln.' },
    { id:'ph-w16', deck:'pw', noMC:true, q:'Aufbau und Prinzip einer Röntgenröhre', term:L('Glühkathode setzt Elektronen frei.', 'Hochspannung (einige 10 kV) beschleunigt sie zur Anode.', 'Beim Abbremsen in der Anode entsteht Röntgen-Bremsstrahlung (fast die ganze Energie wird aber zu Wärme).') },
    { id:'ph-w17', deck:'pw', noMC:true, q:'Warum hat das Röntgen-Bremsspektrum eine kürzeste Wellenlänge?', term:L(T`Ein Elektron kann höchstens seine gesamte Energie $e U$ an EIN Photon abgeben:`, T`$e U = h f_\text{max} = \dfrac{h c}{\lambda_\text{min}} \;\Rightarrow\; \lambda_\text{min} = \dfrac{h c}{e U}$`) },
    { id:'ph-w18', deck:'pw', q:'Energie eines Photons', term:T`$E = h \cdot f = \dfrac{h \, c}{\lambda}$`, wrong:[T`$E = \dfrac{h}{f}$`, T`$E = \dfrac{h \, \lambda}{c}$`, T`$E = h \, c \, \lambda$`] },
    { id:'ph-w19', deck:'pw', q:T`Die Röhrenspannung wird erhöht. Was passiert mit $\lambda_\text{min}$?`, term:T`Sie wird kleiner ($\lambda_\text{min} \sim \dfrac{1}{U}$) – die Strahlung wird härter.`, wrong:['Sie wird größer.', 'Sie bleibt gleich.', 'Nur die Intensität ändert sich.'] },
    { id:'ph-w20', deck:'pw', noMC:true, q:'Röntgenstrahlung in der Medizin: Abwägung', term:L('Nutzen: Diagnose – Knochen absorbieren stärker als Gewebe.', 'Risiko: ionisierende Strahlung kann Zellen und Erbgut schädigen.', '→ Nur bei medizinischem Grund, so niedrig dosiert wie möglich, Bleischutz.') },
    { id:'ph-w21', deck:'pw', noMC:true, q:'Mobilfunkstrahlung: physikalische Einordnung', term:L('Mikrowellen (etwa 0,7 bis 3,6 GHz).', 'Nicht ionisierend – die Photonenenergie ist dafür viel zu klein.', 'Nachgewiesene Wirkung: Erwärmung (begrenzt über den SAR-Wert).') },
    { id:'ph-w30', deck:'pw', ql:'Rechnen', q:T`Zufallsaufgabe: $c = \lambda \cdot f$`, term:T`$\lambda = \dfrac{c}{f}$`, def:T`$\lambda = \dfrac{c}{f}$ mit $c = 3{,}00 \cdot 10^{8}\,\mathrm{m/s}$.`,
      gen() {
        const [ft, f, what] = pick([[T`100\,\mathrm{MHz}`, 1e8, 'UKW-Radio'], [T`2{,}4\,\mathrm{GHz}`, 2.4e9, 'WLAN'], [T`50\,\mathrm{Hz}`, 50, 'Netzfrequenz'], [T`6 \cdot 10^{14}\,\mathrm{Hz}`, 6e14, 'sichtbares Licht'], [T`900\,\mathrm{MHz}`, 9e8, 'Mobilfunk'], [T`3 \cdot 10^{18}\,\mathrm{Hz}`, 3e18, 'Röntgen']]);
        const l = 3e8 / f, M = x => `$${sci(x)}\\,\\mathrm{m}$`, right = M(l);
        return { q: T`Elektromagnetische Welle (${what}) mit $f = ${ft}$. Wellenlänge $\lambda$?`, term: right, wrong: opts(right, [M(l * 1000), M(l / 1000), M(3e8 * f), M(l * 10)]),
          def: T`$\lambda = \dfrac{c}{f} = \dfrac{3{,}00 \cdot 10^{8}\,\mathrm{m/s}}{${ft}} = ${sci(l)}\,\mathrm{m}$` };
      } },
  ];

  // Kondensator-Zufallsaufgabe: angeschlossen (U fest) oder abgetrennt (Q fest)
  function capGen(con) {
    const n = pick([2, 3, 4]), ch = pick(['d+', 'd-', 'A+', 'er']), what = pick(['C', 'Q', 'U', 'E', 'W']);
    const part = { 2: 'die Hälfte', 3: 'ein Drittel', 4: 'ein Viertel' }[n], mult = { 2: 'doppelt', 3: 'dreimal', 4: 'viermal' }[n];
    const text = { 'd+': `Der Plattenabstand d wird ${mult} so groß.`, 'd-': `Der Plattenabstand d wird auf ${part} verkleinert.`, 'A+': `Die Plattenfläche A wird ${mult} so groß.`, er: T`Ein Dielektrikum mit $\varepsilon_r = ${n}$ wird eingeschoben (füllt den Raum ganz).` }[ch];
    const fC = ch === 'd+' ? [1, n] : [n, 1], inv = p => [p[1], p[0]], one = [1, 1];
    const E = con ? (ch === 'd+' ? [1, n] : ch === 'd-' ? [n, 1] : one) : (ch === 'd+' || ch === 'd-' ? one : [1, n]);
    const res = con ? { C: fC, Q: fC, U: one, E, W: fC } : { C: fC, Q: one, U: inv(fC), E, W: inv(fC) };
    const name = { C: 'die Kapazität $C$', Q: 'die Ladung $Q$', U: 'die Spannung $U$', E: 'die Feldstärke $E$', W: 'die gespeicherte Energie $W$' }[what];
    const r = res[what];
    return { q: `Plattenkondensator, Quelle ${con ? 'bleibt ANGESCHLOSSEN' : 'wurde vorher ABGETRENNT'}. ${text} Wie ändert sich ${name}?`, term: fac(r),
      wrong: facOpts(r, [[n, 1], [1, n], one, [n * n, 1], [1, n * n]]),
      def: con ? T`Angeschlossen → $U$ fest. $C = \varepsilon_0\varepsilon_r\dfrac{A}{d}$, $Q = C\,U$, $E = \dfrac{U}{d}$, $W = \dfrac{1}{2} C U^2$.` : T`Abgetrennt → $Q$ fest. $U = \dfrac{Q}{C}$, $E = \dfrac{Q}{\varepsilon_0\varepsilon_r A}$, $W = \dfrac{Q^2}{2C}$.` };
  }
})();
