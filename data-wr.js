/* Wirtschaft und Recht (WR 12/1 BWL) – Karteninhalt
 * Grundlage: Skript der Lehrerin S. 6–10 „1.6 Kosten, Erträge und Gewinne als Einflussfaktoren auf unternehmerische
 * Entscheidungen“ (Beispiel AMA AG). Ex am 28.10.2026.
 * Seit 24.10.2026 bewusst minimal (Jonas' Wunsch): eine Karte pro Fachbegriff, eine pro Formel – sonst nichts.
 * 25.10.2026: Unternehmensziele + Zielbeziehungen (S. 3–4) ergänzt, weil S. 9 Aufg. 3 sie braucht.
 *
 * Felder wie in data.js / data-physik.js. IDs mit Präfix `wr-`, nie ändern.
 */
const DECKS_WR = [
  { id: 'rb', name: 'Fachbegriffe', short: 'Begriffe', color: '#1971c2', q: 'Welcher Begriff?', def: 2 },
  { id: 'rf', name: 'Formeln', short: 'Formeln', color: '#5f3dc4', q: 'Formel?', def: 2 },
];

const CARDS_WR = [
  /* ───────────── FACHBEGRIFFE ───────────── */
  { id: 'wr-b01', deck: 'rb', term: 'Gesamtkosten $K(x)$', def: 'Alle Kosten, die bei der Produktion zusammen anfallen – fixe plus variable.',
    ex: 'AMA AG: K(10) = 2.040.000 €' },
  { id: 'wr-b02', deck: 'rb', term: 'Fixkosten $K_f$', def: 'Fallen immer an – unabhängig davon, ob und in welcher Menge produziert wird.',
    ex: 'Hallenmiete, Gehälter der Verwaltung · AMA AG: 1.440.000 €' },
  { id: 'wr-b03', deck: 'rb', term: 'Variable Kosten $K_v(x)$', def: 'Hängen von der Produktionsmenge ab und steigen mit ihr.',
    ex: 'Rohstoffe, Material · AMA AG: 60.000 € · x' },
  { id: 'wr-b04', deck: 'rb', term: 'Stückkosten $k(x)$', def: 'Kosten bezogen auf eine einzelne produzierte Einheit.',
    ex: 'AMA AG: k(10) = 204.000 €' },
  { id: 'wr-b05', deck: 'rb', term: 'Variable Stückkosten $k_v$', def: 'Kosten, die mit jeder weiteren Einheit neu anfallen – bei linearem Verlauf konstant.',
    ex: 'AMA AG: 60.000 € pro Bus' },
  { id: 'wr-b06', deck: 'rb', term: 'Fixe Stückkosten $k_f$', def: 'Fixkosten pro Einheit – werden kleiner, je mehr produziert wird.',
    ex: 'AMA AG bei 10 Bussen: 144.000 € pro Bus' },
  { id: 'wr-b07', deck: 'rb', term: 'Fixkostendegression', def: 'Die festen Kosten verteilen sich auf immer mehr Einheiten – die Kosten pro Einheit sinken.',
    ex: 'Der Mietanteil pro Bus sinkt, je mehr Busse gebaut werden.' },
  { id: 'wr-b08', deck: 'rb', term: 'Kapazitätsgrenze $x_{max}$', def: 'Höchstmögliche Produktionsmenge – begrenzt durch Platz, Maschinen und Personal.',
    ex: 'AMA AG: 18 Busse pro Woche' },
  { id: 'wr-b09', deck: 'rb', term: 'Erlös $E(x)$', def: 'Preis mal verkaufte Menge (Umsatz).',
    ex: 'AMA AG: 240.000 € · x' },
  { id: 'wr-b10', deck: 'rb', term: 'Gewinn $G(x)$', def: 'Erlös minus Kosten.',
    ex: 'AMA AG: G(18) = 1.800.000 €' },
  { id: 'wr-b11', deck: 'rb', term: 'Break-even-point $x_{BE}$', def: 'Menge, ab der die Erlöse die Kosten decken (E = K, G = 0). Auch: Nutzenschwelle, Gewinnschwelle.',
    ex: 'AMA AG: 8 Busse' },
  { id: 'wr-b12', deck: 'rb', term: 'Gewinnmaximum $G_{max}$', def: 'Höchster erreichbarer Überschuss – bei linearem Verlauf an der Kapazitätsgrenze.',
    ex: 'AMA AG: G(18) = 1.800.000 €' },

  /* ───────────── UNTERNEHMENSZIELE (Skript S. 3–4, nötig für S. 9 Aufg. 3) ───────────── */
  { id: 'wr-u01', deck: 'rb', grp: 'ziel', term: 'Ökonomische Ziele', def: 'Hoher Umsatz, hoher Gewinn, Erhalt der Unternehmensstruktur, Marktanteile sichern.' },
  { id: 'wr-u02', deck: 'rb', grp: 'ziel', term: 'Ökologische Ziele', def: 'Umweltschutz, Ressourcenschonung, Klimaschutz.' },
  { id: 'wr-u03', deck: 'rb', grp: 'ziel', term: 'Soziale Ziele', def: 'Faire Löhne, faire Arbeitsbedingungen, Mitarbeiterzufriedenheit, gesellschaftliches Engagement.' },
  { id: 'wr-u04', deck: 'rb', grp: 'ziel', term: 'Ethische Ziele', def: 'Gleichberechtigung, Toleranz, Gerechtigkeit, Verantwortung für die Welt.' },
  { id: 'wr-u05', deck: 'rb', grp: 'bez', term: 'Konkurrierende Ziele', def: 'Die Verwirklichung des einen geht auf Kosten des anderen.',
    ex: 'Faire Löhne ↔ hoher Gewinn (kurzfristig)' },
  { id: 'wr-u06', deck: 'rb', grp: 'bez', term: 'Komplementäre Ziele', def: 'Die Verwirklichung des einen fördert das andere.',
    ex: 'Hoher Umsatz → hoher Gewinn' },
  { id: 'wr-u07', deck: 'rb', grp: 'bez', term: 'Indifferente Ziele', def: 'Die Verwirklichung des einen hat keinen Einfluss auf das andere.',
    ex: 'Faire Löhne / Umweltschutz' },

  /* ───────────── FORMELN (nur Aufdecken: aus dem Kopf hinschreiben) ───────────── */
  { id: 'wr-f01', deck: 'rf', noMC: true, ql: 'Formel aus dem Kopf', q: 'Gesamtkosten $K(x)$', term: '$K(x) = K_f + k_v \\cdot x$',
    def: 'Fixkosten plus variable Kosten. Gerade $m \\cdot x + t$ mit $m = k_v$, $t = K_f$.' },
  { id: 'wr-f02', deck: 'rf', noMC: true, ql: 'Formel aus dem Kopf', q: 'Stückkosten $k(x)$', term: '$k(x) = \\dfrac{K(x)}{x} = k_v + \\dfrac{K_f}{x}$',
    def: 'Gesamtkosten durch Menge = variable plus fixe Stückkosten.' },
  { id: 'wr-f03', deck: 'rf', noMC: true, ql: 'Formel aus dem Kopf', q: 'Erlös $E(x)$', term: '$E(x) = p \\cdot x$',
    def: 'Preis mal Menge.' },
  { id: 'wr-f04', deck: 'rf', noMC: true, ql: 'Formel aus dem Kopf', q: 'Gewinn $G(x)$', term: '$G(x) = E(x) - K(x)$',
    def: 'Erlös minus Kosten.' },
  { id: 'wr-f05', deck: 'rf', noMC: true, ql: 'Formel aus dem Kopf', q: 'Break-even-point', term: '$K(x) = E(x)$',
    def: 'Gleichsetzen, nach x auflösen. AMA AG: 60.000x + 1.440.000 = 240.000x → x = 8.' },
  { id: 'wr-f07', deck: 'rf', noMC: true, ql: 'Formel aus dem Kopf', q: 'Gewinnmaximum', term: '$G(x_{max}) = E(x_{max}) - K(x_{max})$',
    def: 'Kapazitätsgrenze einsetzen. AMA AG: G(18) = 1.800.000 €.' },
];
