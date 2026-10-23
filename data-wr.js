/* Wirtschaft und Recht (WR 12/1 BWL) – Karteninhalt
 * Grundlage: Skript der Lehrerin S. 6–10 „1.6 Kosten, Erträge und Gewinne als Einflussfaktoren auf unternehmerische
 * Entscheidungen“ (AMA AG, Fishy AG Aufg. 3/4, Abi-Aufgabe S. 9, Abitur WR 2014 3.1/3.2) und Jonas' Mitschrift vom 7.10.2026.
 * Ex am 28.10.2026. ⚠-Karten = Fehler aus der Mitschrift.
 *
 * Felder wie in data.js / data-physik.js. IDs mit Präfix `wr-`, nie ändern.
 */
const DECKS_WR = [
  // Check-up: manuell (nicht in der Tagesabfrage), feste Reihenfolge – erst aufs Blatt, dann aufdecken
  { id: 'rc', name: 'Check-up: aus dem Kopf aufs Blatt', short: 'Check-up', color: '#212529', q: 'Aufs Blatt', def: 1, manual: true, seq: true },
  { id: 'rb', name: 'Kostenbegriffe', short: 'Begriffe', color: '#1971c2', q: 'Welcher Begriff?', def: 2 },
  { id: 'rf', name: 'Formeln', short: 'Formeln', color: '#5f3dc4', q: 'Formel?', def: 2 },
  { id: 'rv', name: 'Was passiert, wenn …? (Verschiebungen)', short: 'Verschiebungen', color: '#e67700', q: 'Was passiert?', def: 2 },
  { id: 'rx', name: 'Fix oder variabel?', short: 'Fix/variabel', color: '#2f9e44', q: 'Fix oder variabel?', def: 2 },
  { id: 'rr', name: 'Rechnen (Zufallsaufgaben)', short: 'Rechnen', color: '#c92a2a', q: 'Rechne', def: 2 },
];

const CARDS_WR = (() => {
  const L = (...a) => a.join('\n');
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  // Zahlen deutsch: 1.440.000 bzw. 38,5 – im Text und in $…$ (Komma dort als {,}, sonst setzt KaTeX ein Leerzeichen)
  const r1 = n => Math.round(n * 10) / 10;
  const f = n => r1(n).toLocaleString('de-DE', { maximumFractionDigits: 1 });
  const m = n => f(n).replace(',', '{,}');
  const approx = n => (Math.abs(n - r1(n)) < 1e-9 ? '' : '≈ ');
  // Drei verschiedene falsche Antworten, keine gleich der richtigen
  const three = (right, cands, fill) => {
    const out = [], seen = new Set([right]);
    for (const c of [...cands, ...fill]) if (out.length < 3 && c && !seen.has(c)) { seen.add(c); out.push(c); }
    return out;
  };

  // Szenarien für Zufallsaufgaben: k_v-Werte, Differenz p − k_v, Break-even-Mengen
  const CTX = [
    { firm: 'Die Fishy AG (Fischfutter)', u: 't', ud: 't', one: 'Tonne', per: 'pro Tag', kv: [300, 320, 330, 350, 380], d: [150, 200, 250, 300], x: [20, 40], cap: 50 },
    { firm: 'Ein Fahrradhersteller', u: 'Räder', ud: 'Rädern', one: 'Rad', per: 'pro Woche', kv: [200, 250, 300, 350], d: [100, 150, 200, 250], x: [30, 80], cap: 120 },
    { firm: 'Eine Schreinerei', u: 'Tische', ud: 'Tischen', one: 'Tisch', per: 'pro Monat', kv: [120, 150, 180], d: [60, 80, 100, 120], x: [20, 50], cap: 70 },
    { firm: 'Die AMA AG (Reisebusse)', u: 'Busse', ud: 'Bussen', one: 'Bus', per: 'pro Woche', kv: [50000, 60000, 70000], d: [120000, 150000, 180000, 200000], x: [5, 12], cap: 18 },
  ];
  const scen = () => {
    const c = pick(CTX), kv = pick(c.kv), d = pick(c.d), x = rnd(c.x[0], c.x[1]);
    return { c, kv, d, p: kv + d, x, Kf: d * x, cap: Math.max(c.cap, x + 5) };
  };
  const kfun = (Kf, kv) => `$K(x) = ${m(Kf)} + ${m(kv)}x$`;

  // Beispiele für „Fix oder variabel?“
  const FV = [
    ['fix', 'Miete für die Produktionshalle', 'Wird jeden Monat fällig – egal, wie viel produziert wird.'],
    ['fix', 'Gehälter der Verwaltungsangestellten', 'Monatsgehalt, unabhängig von der Stückzahl (Abi 2014: Lohnanstieg nur in den Fixkosten).'],
    ['fix', 'Versicherung für das Firmengebäude', 'Jahresbeitrag, unabhängig von der Produktion.'],
    ['fix', 'Zinsen für einen Bankkredit', 'Hängen vom Kredit ab, nicht von der Menge.'],
    ['fix', 'Leasingrate für eine Maschine', 'Feste Monatsrate – auch wenn die Maschine stillsteht.'],
    ['fix', 'Grundsteuer für das Betriebsgelände', 'Feste Abgabe pro Jahr.'],
    ['fix', 'Gehalt der Geschäftsführerin', 'Festes Gehalt, unabhängig von der Stückzahl.'],
    ['fix', 'Heizung des Bürogebäudes', 'Fällt an, auch wenn nichts produziert wird.'],
    ['fix', 'Abschreibung auf die Maschinen (pro Jahr)', 'Zeitabhängige Wertminderung – unabhängig von der Menge.'],
    ['variabel', 'Stahl für die Busse der AMA AG', 'Rohstoff: Jeder weitere Bus braucht mehr Stahl (S. 8: Stahlpreise → K steiler).'],
    ['variabel', 'Rohstoffe für das Fischfutter', 'Mehr Tonnen Futter → mehr Rohstoffe.'],
    ['variabel', 'Verpackung für jeden Sack Futter', 'Fällt pro Stück an.'],
    ['variabel', 'Strom für die laufenden Produktionsmaschinen', 'Je mehr produziert wird, desto länger laufen die Maschinen.'],
    ['variabel', 'Akkordlohn (Bezahlung pro gefertigtem Stück)', 'Lohn pro Stück – steigt mit der Menge. Anders als ein Monatsgehalt!'],
    ['variabel', 'Transportkosten pro Lieferung', 'Mehr Absatz → mehr Lieferungen.'],
    ['variabel', 'Mehl in einer Bäckerei', 'Jedes Brot braucht Mehl.'],
    ['variabel', 'Provision für Vertreter pro verkauftem Stück', 'Wird pro Stück gezahlt.'],
    ['variabel', 'Reifen und Sitze für jeden Bus', 'Material, das in jedes Stück eingeht.'],
  ];

  const cards = [
    /* ───────────── CHECK-UP: AUS DEM KOPF AUFS BLATT ───────────── */
    { id: 'wr-c01', deck: 'rc', noMC: true, nolearn: true,
      q: L('Kostenbegriffe – aufs Blatt.', 'Den Baum „Kosten“ zeichnen: Gesamtkosten und Stückkosten, je fix und variabel.', 'Zu jedem Begriff: Zeichen + ein Satz Definition.'),
      term: '', tbl: [
        ['', 'Gesamtkosten $K$', 'Stückkosten $k$'],
        ['Definition', 'Alle Kosten der Produktion zusammen', 'Kosten pro produziertem Stück: $k = \\dfrac{K}{x}$'],
        ['fix', L('$K_f$: fallen immer an – egal ob und wie viel produziert wird', 'Diagramm: waagrecht'), L('$k_f = \\dfrac{K_f}{x}$: sinken mit der Menge', '(Fixkostendegression)')],
        ['variabel', L('$K_v = k_v \\cdot x$: steigen mit der Menge', 'Diagramm: Ursprungsgerade'), L('$k_v$: bei linearem Verlauf konstant', '= Steigung der Kostengeraden')],
      ], fx: 'Jede Zelle mit deinem Blatt vergleichen, Fehlendes in Rot nachtragen.' },
    { id: 'wr-c02', deck: 'rc', noMC: true, nolearn: true,
      q: L('Die sechs Formeln – aufs Blatt, je mit einem Satz, was sie bedeuten.', 'Gesamtkosten · Stückkosten · Erlös · Gewinn · Break-even-point · Gewinnmaximum'),
      term: L('$K(x) = K_f + k_v \\cdot x$ – Gerade: Achsenabschnitt $K_f$, Steigung $k_v$',
        '$k(x) = \\dfrac{K(x)}{x} = k_v + \\dfrac{K_f}{x}$',
        '$E(x) = p \\cdot x$ – Ursprungsgerade, Steigung = Preis',
        '$G(x) = E(x) - K(x)$ – senkrechter Abstand E über K',
        'Break-even: $K(x) = E(x)$ → nach x auflösen (Kontrolle: $x = \\dfrac{K_f}{p - k_v}$)',
        'Gewinnmaximum: an der Kapazitätsgrenze, $G(x_{max}) = E(x_{max}) - K(x_{max})$') },
    { id: 'wr-c03', deck: 'rc', noMC: true, nolearn: true,
      q: L('Kosten-Erlös-Diagramm der AMA AG skizzieren.', '$K(x) = 1.440.000 + 60.000x$, Preis 240.000 €, Kapazität 18 Busse.', 'Alles einzeichnen, was dazugehört.'),
      term: L('☐ x-Achse: Menge (Busse), y-Achse: !!Kosten, Erlöse in €!!',
        '☐ !!K startet bei den Fixkosten!! ($K_f$ = 1,44 Mio. €), E im Ursprung',
        '☐ Fixkosten als waagrechte gestrichelte Linie',
        '☐ Schnittpunkt = Break-even-point bei x = 8, senkrecht runter zur x-Achse',
        '☐ links „Verlustzone“, rechts „Gewinnzone“',
        '☐ Kapazitätsgrenze x = 18 als senkrechte Linie',
        '☐ Gewinnmaximum = senkrechter Abstand E – K bei x = 18: 1,8 Mio. €'),
      fx: 'Gelb = auf deinen Blättern vom 7.10. nicht richtig.' },
    { id: 'wr-c04', deck: 'rc', noMC: true, nolearn: true,
      q: L('Verschiebungstabelle – aufs Blatt.', 'Spalten: Was ändert sich? · Beispiel · Was macht der Graph? · Break-even-point', 'Zeilen: Fixkosten ↑ · Fixkosten ↓ · variable Kosten ↑ · variable Kosten ↓ · Preis ↑ · Preis ↓ · Absatz ↓'),
      term: '', tbl: [
        ['', 'Beispiel', 'Graph', 'Break-even'],
        ['Fixkosten ↑', 'Hallenmiete, Verwaltungsgehälter', 'K parallel nach oben', 'nach rechts'],
        ['Fixkosten ↓', 'Rationalisierung', 'K parallel nach unten', 'nach links'],
        ['var. Kosten ↑', 'Stahl, Rohstoffe teurer', 'K steiler (Start bleibt bei $K_f$)', 'nach rechts'],
        ['var. Kosten ↓', 'billigerer Lieferant', 'K flacher', 'nach links'],
        ['Preis ↑', '–', 'E steiler', 'nach links'],
        ['Preis ↓', 'Konkurrenz', 'E flacher', 'nach rechts'],
        ['Absatz ↓', 'Nachfrage bricht ein', 'nichts verschiebt sich – x rutscht nach links', 'bleibt; Gewinn sinkt, evtl. Verlust'],
      ] },
    { id: 'wr-c05', deck: 'rc', noMC: true, nolearn: true,
      q: L('Abitur 2014, 3.2 – in vier Sätzen aufs Blatt:', 'Lohnkosten steigen (nur Fixkosten). Wie erreicht das Unternehmen den Break-even trotzdem bei gleicher Stückzahl?'),
      term: L('1. Die höheren Lohnkosten erhöhen die Fixkosten → K verschiebt sich parallel nach oben.',
        '2. Dadurch wandert die !!Gewinnschwelle (Break-even-point)!! nach rechts.',
        '3. Gegenmaßnahme: Preis erhöhen → E wird steiler, bis E die neue K-Gerade wieder beim alten x schneidet.',
        '   (oder: variable Stückkosten senken → K flacher)',
        '4. Haken: Die Preiserhöhung klappt nur, wenn die Kunden mitgehen – sonst sinkt der Absatz.'),
      fx: 'Gelb: auf deinem Blatt stand „Gesamtkostenschwelle“ – den Begriff gibt es nicht.' },
    { id: 'wr-c06', deck: 'rc', noMC: true, nolearn: true,
      q: L('Fix oder variabel – aufs Blatt (Abitur 2014, 3.1):', 'Beide Begriffe definieren, je 3 Beispiele aus EINEM Betrieb, dazu die Stück-Sicht.'),
      term: L('Fix: fallen unabhängig von der Menge an – Hallenmiete, Verwaltungsgehälter, Versicherung, Zinsen.',
        'Variabel: steigen mit der Produktionsmenge – Rohstoffe/Material, Energie für die Maschinen, Verpackung.',
        'Stück-Sicht: $k_f$ sinkt mit der Menge, $k_v$ bleibt gleich.',
        'Lohn kann beides sein: Monatsgehalt = fix, Akkordlohn = variabel.') },

    /* ───────────── BEGRIFFE ───────────── */
    { id: 'wr-b01', deck: 'rb', term: 'Gesamtkosten $K(x)$', def: 'Alle Kosten, die bei der Produktion zusammen anfallen – fixe plus variable.',
      ex: 'AMA AG: K(10) = 60.000 · 10 + 1.440.000 = 2.040.000 €', fx: '$K = K_f + K_v$' },
    { id: 'wr-b02', deck: 'rb', term: 'Fixkosten $K_f$', def: 'Fallen immer an – unabhängig davon, ob und in welcher Menge produziert wird.',
      ex: 'Hallenmiete, Gehälter der Verwaltung, Versicherung, Zinsen', fx: 'Im Diagramm: waagrechte Linie = Achsenabschnitt der Kostengeraden.' },
    { id: 'wr-b03', deck: 'rb', term: 'Variable Kosten $K_v(x)$', def: 'Hängen von der Produktionsmenge ab und steigen mit ihr.',
      ex: 'Rohstoffe, Material, Energie für die Maschinen, Verpackung', fx: '$K_v(x) = k_v \\cdot x$' },
    { id: 'wr-b04', deck: 'rb', term: 'Stückkosten $k(x)$', def: 'Kosten bezogen auf eine einzelne produzierte Einheit: Gesamtkosten geteilt durch die Menge.',
      ex: 'AMA AG: k(10) = 2.040.000 € : 10 = 204.000 €', fx: '$k(x) = \\dfrac{K(x)}{x}$ – kleines k = pro Stück.' },
    { id: 'wr-b05', deck: 'rb', term: 'Variable Stückkosten $k_v$', def: 'Kosten, die mit jeder weiteren Einheit neu anfallen – bei linearem Verlauf konstant; im Diagramm die Steigung der Kostengeraden.',
      ex: 'AMA AG: 60.000 € pro Bus', fx: 'Fishy AG: 330 € pro Tonne – immer mit „pro Einheit“ angeben.' },
    { id: 'wr-b06', deck: 'rb', term: 'Fixe Stückkosten $k_f$', def: 'Fixkosten geteilt durch die Menge – werden kleiner, je mehr produziert wird.',
      ex: 'AMA AG: 1.440.000 € : 10 = 144.000 € pro Bus', fx: '$k_f = \\dfrac{K_f}{x}$' },
    { id: 'wr-b07', deck: 'rb', term: 'Fixkostendegression', def: 'Je größer die Menge, desto stärker verteilen sich die festen Kosten auf die einzelnen Einheiten – die Kosten pro Einheit sinken.',
      ex: 'Der Mietanteil pro Bus ist bei 10 Bussen doppelt so hoch wie bei 20.', fx: 'Darum fällt die Stückkostenkurve.' },
    { id: 'wr-b08', deck: 'rb', term: 'Kapazitätsgrenze $x_{max}$', def: 'Höchstmögliche Produktionsmenge – begrenzt durch Platz, Maschinen und Personal.',
      ex: 'AMA AG: 18 Busse pro Woche · Fishy AG: 50 t pro Tag', fx: 'Nur durch eine Investition (neue Maschine, größere Halle) erweiterbar.' },
    { id: 'wr-b09', deck: 'rb', term: 'Erlös $E(x)$', def: 'Preis mal verkaufte Menge (Umsatz).',
      ex: 'AMA AG: E(x) = 240.000 · x', fx: 'Ursprungsgerade – Steigung = Preis p.' },
    { id: 'wr-b10', deck: 'rb', term: 'Gewinn $G(x)$', def: 'Erlös minus Kosten; im Diagramm der senkrechte Abstand zwischen den beiden Geraden.',
      ex: 'AMA AG: G(18) = 4.320.000 − 2.520.000 = 1.800.000 €', fx: '$G(x) = E(x) - K(x)$' },
    { id: 'wr-b11', deck: 'rb', term: 'Break-even-point $x_{BE}$', def: 'Menge, ab der die Erlöse die Kosten decken: E = K, also G = 0.',
      ex: 'AMA AG: 8 Busse · Fishy AG: 34 t', fx: 'Andere Namen: Nutzenschwelle, Gewinnschwelle. Im Diagramm: Schnittpunkt von K und E.' },
    { id: 'wr-b12', deck: 'rb', term: 'Gewinnmaximum $G_{max}$', def: 'Höchster erreichbarer Überschuss – bei linearem Kosten- und Erlösverlauf immer an der Kapazitätsgrenze.',
      ex: 'AMA AG: G(18) = 1,8 Mio. € · Fishy AG: G(50) = 4.000 €', fx: 'Grund: Die Stückkosten sinken mit der Menge, der Erlös steigt weiter.' },
    { id: 'wr-b13', deck: 'rb', term: 'Verlustzone', def: 'Mengenbereich links vom Schnittpunkt: Die Kosten liegen über den Erlösen.', ex: 'AMA AG: weniger als 8 Busse' },
    { id: 'wr-b14', deck: 'rb', term: 'Gewinnzone', def: 'Mengenbereich rechts vom Schnittpunkt bis zur Kapazitätsgrenze: E liegt über K.', ex: 'AMA AG: 8 bis 18 Busse' },
    { id: 'wr-b15', deck: 'rb', q: 'Zwei andere Namen für den Break-even-point?', term: 'Nutzenschwelle und Gewinnschwelle',
      wrong: ['Gesamtkostenschwelle und Kostengrenze', 'Kapazitätsgrenze und Gewinnmaximum', 'Fixkostenschwelle und Erlösgrenze'],
      def: 'Skript S. 7: „Nutzenschwelle oder Break-even-point“. Abitur 2014: „Gewinnschwelle (break-even)“.' },

    /* ───────────── ⚠ FEHLER AUS DER MITSCHRIFT ───────────── */
    { id: 'wr-x01', deck: 'rb', miss: true, q: 'Wie heißt der Schnittpunkt von Kosten- und Erlösgerade?', term: 'Break-even-point (= Nutzenschwelle, Gewinnschwelle)',
      wrong: ['Gesamtkostenschwelle', 'Kapazitätsgrenze', 'Gewinnmaximum'],
      def: 'Auf deinem Blatt (Abi 2014, 3.2) stand „Gesamtkostenschwelle“ – den Begriff gibt es nicht.' },
    { id: 'wr-x02', deck: 'rf', miss: true, q: 'Wo beginnt die Kostengerade $K(x)$ auf der y-Achse?', term: 'Bei den Fixkosten $K_f$ (Achsenabschnitt)',
      wrong: ['Im Ursprung', 'Bei den variablen Stückkosten $k_v$', 'Beim Preis $p$'],
      def: 'Fishy AG Aufg. 4: K neu beginnt bei 7.700 €, K alt bei 8.500 €. Auf deinem Blatt starten beide bei etwa 14.000 €.' },
    { id: 'wr-x03', deck: 'rf', miss: true, q: 'Wie beschriftest du die y-Achse im Kosten-Erlös-Diagramm?', term: 'Kosten, Erlöse in €',
      wrong: ['Kosten in €', 'Preis in €', 'Menge in Stück'],
      def: 'Im Diagramm stehen beide Geraden – K und E. Auf deinem Blatt S. 9 stand nur „Kosten in €“.' },
    { id: 'wr-x04', deck: 'rb', miss: true, q: 'Fishy AG: $K(x) = 8.500 + 330x$ (€ pro Tag, x in Tonnen). Was ist 330?', term: 'Variable Stückkosten: 330 € pro Tonne',
      wrong: ['Variable Kosten: 330 €', 'Fixkosten: 330 € pro Tag', 'Preis: 330 € pro Tonne'],
      def: 'Die Zahl vor dem x gilt pro Einheit – darum gehört „pro Tonne“ dazu. Die variablen Gesamtkosten sind $330x$.' },

    /* ───────────── FORMELN ───────────── */
    { id: 'wr-f01', deck: 'rf', q: 'Gesamtkosten in Abhängigkeit von der Menge x?', term: '$K(x) = K_f + k_v \\cdot x$',
      wrong: ['$K(x) = k_v + K_f \\cdot x$', '$K(x) = p \\cdot x$', '$K(x) = \\dfrac{K_f}{x} + k_v$'],
      def: 'Fixkosten plus variable Stückkosten mal Menge. Gerade: Achsenabschnitt $K_f$, Steigung $k_v$.' },
    { id: 'wr-f02', deck: 'rf', q: 'Stückkosten $k(x)$?', term: '$k(x) = \\dfrac{K(x)}{x} = k_v + \\dfrac{K_f}{x}$',
      wrong: ['$k(x) = K(x) \\cdot x$', '$k(x) = K_f + k_v \\cdot x$', '$k(x) = \\dfrac{x}{K(x)}$'],
      def: 'Gesamtkosten durch Menge. Der Fixanteil $\\dfrac{K_f}{x}$ wird mit jeder Einheit kleiner.' },
    { id: 'wr-f03', deck: 'rf', q: 'Erlös $E(x)$?', term: '$E(x) = p \\cdot x$',
      wrong: ['$E(x) = p + x$', '$E(x) = \\dfrac{p}{x}$', '$E(x) = k_v \\cdot x$'],
      def: 'Preis mal Menge. Ursprungsgerade.' },
    { id: 'wr-f04', deck: 'rf', q: 'Gewinn $G(x)$?', term: '$G(x) = E(x) - K(x)$',
      wrong: ['$G(x) = K(x) - E(x)$', '$G(x) = E(x) + K(x)$', '$G(x) = p - k_v$'],
      def: 'Im Diagramm: senkrechter Abstand. Liegt E über K → Gewinn, darunter → Verlust.' },
    { id: 'wr-f05', deck: 'rf', q: 'Bedingung für den Break-even-point?', term: '$K(x) = E(x)$, also $G(x) = 0$',
      wrong: ['$G(x) = G_{max}$', '$K_f = K_v(x)$', '$k(x) = k_v$'],
      def: 'Gleichsetzen und nach x auflösen. AMA AG: 60.000x + 1.440.000 = 240.000x → 1.440.000 = 180.000x → x = 8.' },
    { id: 'wr-f06', deck: 'rf', q: 'Abkürzung, um den Break-even-point zu kontrollieren?', term: '$x_{BE} = \\dfrac{K_f}{p - k_v}$',
      wrong: ['$x_{BE} = \\dfrac{K_f}{p}$', '$x_{BE} = \\dfrac{K_f}{p + k_v}$', '$x_{BE} = \\dfrac{p - k_v}{K_f}$'],
      def: 'Fixkosten geteilt durch das, was jedes Stück über seine variablen Kosten hinaus einbringt. AMA AG: 1.440.000 : 180.000 = 8.',
      fx: 'In der Ex trotzdem den Weg über K(x) = E(x) hinschreiben.' },
    { id: 'wr-f07', deck: 'rf', q: 'Wo liegt bei linearem Verlauf das Gewinnmaximum – und wie rechnest du es?', term: 'An der Kapazitätsgrenze: $G(x_{max}) = E(x_{max}) - K(x_{max})$',
      wrong: ['Am Break-even-point', 'In der Mitte zwischen Break-even-point und Kapazitätsgrenze', 'Bei x = 0'],
      def: 'Rechts vom Break-even-point wächst der Abstand E – K mit jeder Einheit. Am größten ist er an der Kapazitätsgrenze.' },
    { id: 'wr-f08', deck: 'rf', q: 'Lineare Kostenfunktion $K(x) = m \\cdot x + t$: Was ist m, was ist t?', term: 'm = variable Stückkosten $k_v$ (Steigung), t = Fixkosten $K_f$ (Achsenabschnitt)',
      wrong: ['m = Fixkosten, t = variable Stückkosten', 'm = Preis, t = Fixkosten', 'm = Stückkosten k, t = Gewinn'] },
    { id: 'wr-f09', deck: 'rf', q: 'Wie hoch sind die Stückkosten genau am Break-even-point?', term: 'So hoch wie der Preis: $k(x_{BE}) = p$',
      wrong: ['So hoch wie die variablen Stückkosten', 'Null', 'So hoch wie die Fixkosten'],
      def: 'Am Break-even-point gilt p · x = K(x), also K(x) : x = p. AMA AG: k(8) = 1.920.000 € : 8 = 240.000 € = Preis.' },
    { id: 'wr-f10', deck: 'rf', q: 'Wie verläuft die Stückkostenkurve $k(x)$?', term: 'Fallend und immer flacher – sie nähert sich $k_v$ an',
      wrong: ['Steigende Gerade', 'Waagrechte Linie', 'Fallende Gerade bis 0'],
      def: 'Der Fixanteil $\\dfrac{K_f}{x}$ wird immer kleiner (Fixkostendegression), $k_v$ bleibt. AMA AG: 780.000 € bei 2 Bussen, 140.000 € bei 18.' },

    /* ───────────── WAS PASSIERT, WENN …? ───────────── */
    { id: 'wr-v01', deck: 'rv', q: 'Die Hallenmiete steigt. Was passiert im Kosten-Erlös-Diagramm?', term: 'K verschiebt sich parallel nach oben → Break-even-point nach rechts',
      wrong: ['K wird steiler → Break-even-point nach rechts', 'E wird flacher → Break-even-point nach rechts', 'K verschiebt sich parallel nach unten → Break-even-point nach links'],
      def: 'Miete = Fixkosten. Bei jeder Menge kommt derselbe Betrag dazu, die Steigung bleibt. AMA AG: K₁ = 60.000x + 1.440.000 → K₂ = 60.000x + 2.005.000.' },
    { id: 'wr-v02', deck: 'rv', q: 'Die Stahlpreise (Rohstoffe) steigen. Was passiert?', term: 'K wird steiler (Start bleibt bei $K_f$) → Break-even-point nach rechts',
      wrong: ['K verschiebt sich parallel nach oben → Break-even-point nach rechts', 'E wird steiler → Break-even-point nach links', 'K wird flacher → Break-even-point nach links'],
      def: 'Rohstoffe = variable Kosten → $k_v$ steigt = Steigung. AMA AG: K₂ = 60.000x + 2.005.000 → K₃ = 70.000x + 2.005.000.' },
    { id: 'wr-v03', deck: 'rv', q: 'Das Unternehmen erhöht den Preis. Was passiert?', term: 'E wird steiler → Break-even-point nach links, Gewinn steigt',
      wrong: ['K wird steiler → Break-even-point nach rechts', 'E verschiebt sich parallel nach oben → Break-even-point nach links', 'E wird flacher → Break-even-point nach rechts'],
      def: 'Der Preis ist die Steigung der Erlösgeraden. E bleibt eine Ursprungsgerade.' },
    { id: 'wr-v04', deck: 'rv', q: 'Der Absatz geht zurück (weniger verkaufte Stück, gleicher Preis). Was passiert?', term: 'Keine Gerade verschiebt sich – x rutscht nach links: Gewinn sinkt, unter dem Break-even-point Verlust',
      wrong: ['E wird flacher → Break-even-point nach rechts', 'K verschiebt sich nach oben → Break-even-point nach rechts', 'Der Break-even-point wandert nach links'],
      def: 'Absatzrückgang = weniger Menge, nicht anderer Preis oder andere Kosten. Abi-Aufgabe S. 9, Aufg. 2 – auf deinem Blatt richtig.' },
    { id: 'wr-v05', deck: 'rv', q: 'Die Fixkosten sinken (z. B. Rationalisierung in der Verwaltung). Was passiert?', term: 'K verschiebt sich parallel nach unten → Break-even-point nach links',
      wrong: ['K wird flacher → Break-even-point nach links', 'K verschiebt sich parallel nach oben → Break-even-point nach rechts', 'E wird steiler → Break-even-point nach links'] },
    { id: 'wr-v06', deck: 'rv', q: 'Die variablen Kosten sinken (günstigerer Lieferant). Was passiert?', term: 'K wird flacher → Break-even-point nach links',
      wrong: ['K verschiebt sich parallel nach unten → Break-even-point nach links', 'K wird steiler → Break-even-point nach rechts', 'E wird flacher → Break-even-point nach rechts'] },
    { id: 'wr-v07', deck: 'rv', q: 'Die Fixkosten sind gestiegen. Wie erreicht das Unternehmen den Break-even trotzdem bei gleicher Stückzahl? (Abi 2014, 3.2)',
      term: 'Preis erhöhen (E steiler) oder variable Stückkosten senken (K flacher) – bis sich die Geraden wieder beim alten x schneiden',
      wrong: ['Mehr produzieren, bis die Kapazitätsgrenze erreicht ist', 'Die Kapazitätsgrenze erhöhen', 'Den Preis senken, damit mehr verkauft wird'],
      def: 'Gefragt ist „eine Möglichkeit“ – beide zu kennen bringt Sicherheit. Haken der Preiserhöhung: Die Kunden müssen mitgehen, sonst sinkt der Absatz.' },
    { id: 'wr-v08', deck: 'rv', noMC: true, q: 'Warum verschiebt sich K bei steigenden Fixkosten parallel – und wird nicht steiler?',
      term: 'Fixkosten hängen nicht von der Menge ab: Bei jeder Menge kommt derselbe Betrag dazu. Die Steigung $k_v$ bleibt gleich.' },
    { id: 'wr-v09', deck: 'rv', noMC: true, q: 'Lohnkosten – fix oder variabel?',
      term: L('Beides möglich:', 'Monatsgehälter (z. B. Verwaltung) = fix', 'Akkord-/Stücklohn = variabel', 'Im Abitur 2014 laut Aufgabentext: Lohnanstieg nur in den Fixkosten.') },
    { id: 'wr-v10', deck: 'rv', q: 'Fishy AG: Fixkosten −800 €, variable Kosten 330 → 380 € pro Tonne. Wohin wandert der Break-even-point?',
      term: 'Nach rechts: von 34 t auf 38,5 t',
      wrong: ['Nach links: von 34 t auf 29,5 t', 'Er bleibt bei 34 t', 'Nach rechts: von 34 t auf 50 t'],
      def: L('$7.700 + 380x = 580x$ → $7.700 = 200x$ → $x = 38{,}5$', 'Die höheren variablen Kosten fressen die Fixkosten-Ersparnis auf. Gewinnmaximum sinkt von 4.000 € auf 2.300 €.') },
    { id: 'wr-v11', deck: 'rv', noMC: true, q: 'Ein Unternehmen kauft eine neue Abfüllanlage. Wie wirkt das typischerweise auf die Kostenkurve?',
      term: L('Fixkosten steigen (Anschaffung, Abschreibung, Zinsen) → K beginnt höher', 'Oft sinken die variablen Stückkosten (Automatisierung) → K flacher', 'Die Kapazitätsgrenze steigt → höheres Gewinnmaximum möglich'),
      fx: 'Für die Diskussion (S. 9, Aufg. 3) dazu die Unternehmensziele aus M4: Pro/Contra abwägen, Fazit mit Bedingung.' },

    /* ───────────── FIX ODER VARIABEL? ───────────── */
    { id: 'wr-r01', deck: 'rx', q: 'Fix oder variabel?', gn: 'Zufallsaufgabe – jedes Mal eine andere Kostenart.',
      gen() { const [a, t, w] = pick(FV); return { q: `Fix oder variabel?\n${t}`, term: a, fixed: ['fix', 'variabel'], def: w }; },
      fx: 'Test: Fällt die Kostenart auch an, wenn die Produktion eine Woche stillsteht? Ja → fix.' },
    { id: 'wr-r02', deck: 'rx', q: 'Fix oder variabel?', gn: 'Zufallsaufgabe – jedes Mal eine andere Kostenart.',
      gen() { const k = pick(['fix', 'variabel']), [a, t, w] = pick(FV.filter(e => e[0] === k)); return { q: `Fix oder variabel?\n${t}`, term: a, fixed: ['fix', 'variabel'], def: w }; },
      fx: 'Test: Fällt die Kostenart auch an, wenn die Produktion eine Woche stillsteht? Ja → fix.' },

    /* ───────────── RECHNEN (ZUFALLSAUFGABEN) ───────────── */
    { id: 'wr-z01', deck: 'rr', q: 'Break-even-point berechnen', gn: 'Zufallsaufgabe – jedes Mal neue Zahlen.',
      gen() {
        const s = scen(), { c, kv, p, Kf, x } = s;
        const right = `${f(x)} ${c.u}`, w = v => `${approx(v)}${f(v)} ${c.u}`;
        return { q: L(`${c.firm}: ${kfun(Kf, kv)} (in € ${c.per}), Preis ${f(p)} € pro ${c.one}.`, 'Ab welcher Menge erzielt das Unternehmen Gewinn?'),
          term: right, wrong: three(right, [w(Kf / p), w(Kf / kv), w(Kf / (p + kv))], [w(x * 2), w(x + 5)]),
          def: L(`$K(x) = E(x)$`, `$${m(Kf)} + ${m(kv)}x = ${m(p)}x$`, `$${m(Kf)} = ${m(p - kv)}x$`, `$x = ${m(x)}$ → ab ${f(x)} ${c.ud} ${c.per} Gewinn`) };
      },
      fx: 'Antwortsatz mit Einheit. Kontrolle: $\\dfrac{K_f}{p - k_v}$.' },
    { id: 'wr-z02', deck: 'rr', q: 'Gewinnmaximum berechnen', gn: 'Zufallsaufgabe – jedes Mal neue Zahlen.',
      gen() {
        const s = scen(), { c, kv, p, Kf, cap } = s, G = (p - kv) * cap - Kf;
        const e = v => `${f(v)} €`, right = e(G);
        return { q: L(`${c.firm}: ${kfun(Kf, kv)} (in € ${c.per}), Preis ${f(p)} € pro ${c.one}, Kapazitätsgrenze ${f(cap)} ${c.u} ${c.per}.`, 'Wie hoch ist der maximale Gewinn?'),
          term: right, wrong: three(right, [e(p * cap - Kf), e((p - kv) * cap), e(p * cap)], [e(G + Kf / 2), e(G * 2)]),
          def: L(`Gewinnmaximum an der Kapazitätsgrenze x = ${f(cap)}:`, `$G(${m(cap)}) = E(${m(cap)}) - K(${m(cap)})$`, `$= ${m(p * cap)} - ${m(Kf + kv * cap)} = ${m(G)}$ €`) };
      },
      fx: 'Typische Fehler: Fixkosten vergessen, variable Kosten vergessen, Erlös statt Gewinn.' },
    { id: 'wr-z03', deck: 'rr', q: 'Stückkosten berechnen', gn: 'Zufallsaufgabe – jedes Mal neue Zahlen.',
      gen() {
        const s = scen(), { c, kv, Kf, cap } = s;
        const xs = [2, 4, 5, 8, 10, 12, 15, 16, 20, 25, 30, 40, 50, 60, 80, 100].filter(n => n <= cap && Kf % n === 0);
        const x = xs.length ? pick(xs) : s.x, k = kv + Kf / x, e = v => `${f(v)} €`, right = e(k);
        return { q: L(`${c.firm}: ${kfun(Kf, kv)} (in € ${c.per}).`, `Wie hoch sind die Stückkosten bei ${f(x)} ${c.ud}?`),
          term: right, wrong: three(right, [e(Kf / x), e(kv), e(Kf + kv * x)], [e(k * 2), e(k + kv)]),
          def: L(`$k(x) = k_v + \\dfrac{K_f}{x}$`, `$k(${m(x)}) = ${m(kv)} + \\dfrac{${m(Kf)}}{${m(x)}} = ${m(kv)} + ${m(Kf / x)} = ${m(k)}$ €`) };
      },
      fx: 'Gesamtkosten durch Menge – nicht die Gesamtkosten selbst.' },
    { id: 'wr-z04', deck: 'rr', q: 'Neuer Break-even-point nach einer Änderung', gn: 'Zufallsaufgabe – jedes Mal eine andere Änderung, neue Zahlen.',
      gen() {
        const s = scen(), { c, kv, p, Kf, x } = s, d = p - kv;
        const steps = (c.kv[0] >= 10000 ? [5000, 10000, 20000] : [10, 20, 30, 50]).filter(v => v <= d / 2);
        const t = pick(['kf', 'kv', 'p']), dd = pick(steps);
        let Kf2 = Kf, kv2 = kv, p2 = p, txt;
        if (t === 'kf') { const k = rnd(1, 4); Kf2 = Kf + d * k; txt = `Die Miete steigt: Die Fixkosten erhöhen sich um ${f(d * k)} € ${c.per}.`; }
        else if (t === 'kv') { kv2 = kv + dd; txt = `Rohstoffe werden teurer: Die variablen Kosten steigen um ${f(dd)} € pro ${c.one}.`; }
        else { p2 = p + dd; txt = `Das Unternehmen erhöht den Preis um ${f(dd)} € pro ${c.one}.`; }
        const nx = Kf2 / (p2 - kv2), w = v => `${approx(v)}${f(v)} ${c.u}`, right = w(nx);
        const wrongs = t === 'kf' ? [w((Kf - (Kf2 - Kf)) / d), w(Kf2 / p2), w(x)]
          : t === 'kv' ? [w(Kf / (d + dd)), w(Kf2 / p2), w(x)]
          : [w(Kf / (d - dd)), w(Kf / p2), w(x)];
        return { q: L(`${c.firm}: ${kfun(Kf, kv)} (in € ${c.per}), Preis ${f(p)} € pro ${c.one} – Break-even-point bisher bei ${f(x)} ${c.ud}.`, txt, 'Wo liegt der neue Break-even-point?'),
          term: right, wrong: three(right, wrongs, [w(nx + 5), w(nx * 2), w(nx / 2)]),
          def: L(`$${m(Kf2)} + ${m(kv2)}x = ${m(p2)}x$`, `$${m(Kf2)} = ${m(p2 - kv2)}x$`, `$x ${approx(nx) ? '\\approx' : '='} ${m(nx)}$${approx(nx) ? ` → Gewinn ab ${Math.ceil(nx)} ${c.ud}` : ''}`, `Break-even-point wandert nach ${nx > x ? 'rechts (ungünstiger)' : 'links (günstiger)'}`) };
      },
      fx: 'Fixkosten ↑ / variable Kosten ↑ → nach rechts. Preis ↑ → nach links.' },
  ];
  for (const c of cards) if (c.deck === 'rc') c.ql = 'Aus dem Kopf aufs Blatt';
  return cards;
})();
