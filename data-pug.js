/* Politik und Gesellschaft (PuG 12) – Karteninhalt
 * Grundlage: 2-Seiten-Übersicht zur Kurzarbeit am 27.10.2026 („Leitlinien der deutschen Außenpolitik im 21. Jh.“ und
 * „Kann man globalen Terrorismus effektiv bekämpfen?“), Lösungsvorschläge Gruppe 1/2, M2/M3, Buch S. 42 f., 49, 58 f.
 * Auswahl nach Jonas' Blurtings vom 24.10.2026: nur, was gefehlt hat bzw. was er erklären können muss (★).
 *
 * Felder wie in data.js. IDs mit Präfix `pol-`, nie ändern. Alles Karten zum Aufdecken (kein Multiple Choice).
 */
const DECKS_PG = [
  { id: 'ga', name: 'Motive & Faktoren der dt. Außenpolitik', short: 'Motive', color: '#c85a17', q: 'Erkläre', def: 2 },
  { id: 'gm', name: 'Mindmap 1: Organisationen, Mittel, Motive, Ziele', short: 'Mindmap 1', color: '#e67700', q: 'Nenne', def: 2 },
  { id: 'gl', name: 'Mindmap 2 & Grundgesetz', short: 'Mindmap 2 / GG', color: '#a61e4d', q: 'Wiedergeben', def: 2 },
  { id: 'gn', name: 'Narrative Elemente des IS', short: 'IS-Narrative', color: '#2f9e44', q: 'Nennen / erklären', def: 2 },
  { id: 'gd', name: 'Rolle der (westlichen) Medien', short: 'Medien', color: '#1971c2', q: 'Nennen / erklären', def: 2 },
  { id: 'gs', name: 'Umfassende Sicherheit', short: 'Sicherheit', color: '#5f3dc4', q: 'Einordnen', def: 2 },
  { id: 'go', name: 'OSZE und ihre Schwerpunkte', short: 'OSZE', color: '#087f5b', q: 'Nennen', def: 2 },
];

const CARDS_PG = (() => {
  const L = (...a) => a.join('\n');
  const c = [];
  const add = (id, deck, q, term, more = {}) => c.push({ id: 'pol-' + id, deck, q, term, noMC: true, ...more });

  /* ───────────── MOTIVE & FAKTOREN (grüne Mindmap) ───────────── */
  add('a00', 'ga', 'Nenne alle 8 Motive & Faktoren der deutschen Außenpolitik (grüne Mindmap).', L(
    '1 Verantwortung aus der Vergangenheit',
    '2 Abhängigkeiten – wirtschaftlich',
    '3 Abhängigkeiten – militärisch',
    '4 Moralische / demokratische Aspekte',
    '5 Wirtschaftliche Interessen',
    '6 Partnerschaften',
    '7 Bündnisse (z. B. NATO)',
    '8 Krisen'), { fx: '5–8: „Wer paukt, besteht KA“ = Wirtschaft, Partner, Bündnisse, Krisen' });
  const MF = [
    ['a01', 'Verantwortung aus der Vergangenheit', 'NS-Zeit → „Nie wieder Krieg“: Frieden, Zusammenarbeit statt Alleingang', 'militärische Zurückhaltung'],
    ['a02', 'Abhängigkeiten – wirtschaftlich', 'D. ist Exportnation und braucht Rohstoffe und Energie von außen', 'russisches Gas bis 2022, China als Handelspartner'],
    ['a03', 'Abhängigkeiten – militärisch', 'D. kann sich nicht allein verteidigen → Schutz nur im Bündnis', 'NATO, Schutz durch die USA'],
    ['a04', 'Moralische / demokratische Aspekte', 'Die Werte des Grundgesetzes leiten das Handeln: Frieden, Demokratie, Menschenrechte', 'Unterstützung der Ukraine'],
    ['a05', 'Wirtschaftliche Interessen', 'offene Märkte, sichere Handelswege, Arbeitsplätze in D.', 'Wirtschaftsminister reist 2023 mit nach Japan (M28)'],
    ['a06', 'Partnerschaften', 'enge Beziehungen zu wichtigen Staaten', 'Frankreich, USA, Japan'],
    ['a07', 'Bündnisse (z. B. NATO)', 'bringen Pflichten und kollektive Sicherheit', 'NATO-Beistandspflicht, EU-Beschlüsse'],
    ['a08', 'Krisen', 'wirken weltweit und sind auch in D. spürbar', 'Ukrainekrieg, Nahost, Klimakrise'],
  ];
  for (const [id, name, what, ex] of MF) add(id, 'ga', `Motiv / Faktor: ${name} – was heißt das?`, what, { ex });

  /* ───────────── MINDMAP 1 (getippt) ───────────── */
  add('m01', 'gm', 'Mindmap 1: In welche internationalen Organisationen ist D. eingebunden – und wofür steht jede?', L(
    'NATO – gemeinsame Verteidigung',
    'UNO – Weltfrieden, Völkerrecht',
    'EU – europäische Zusammenarbeit',
    'OSZE – Friedenssicherung',
    '(u. v. m.: CERN, G7, WTO, OECD)'), { fx: 'Oberbegriff: „Einbindung in internationale Organisationen“' });
  add('m02', 'gm', 'Mindmap 1: Mittel der deutschen Außenpolitik (wie?) – nenne 5.', L(
    'Parlamentsarmee (Bundeswehr)',
    'zivile Instrumente mit Vorrang',
    'multilaterale Einbindung',
    'internationale Zusammenarbeit',
    'Nationale Sicherheitsstrategie'), { fx: 'Buch S. 49 zusätzlich: Diplomatie, Entwicklungshilfe' });
  add('m03', 'gm', 'Was heißt „Parlamentsarmee“?', 'Der Bundestag entscheidet über bewaffnete Auslandseinsätze der Bundeswehr (Mandat).',
    { def: 'Nicht die Soldaten und nicht die Regierung allein.' });
  add('m04', 'gm', 'Mindmap 1: Motive (warum?) – nenne 6.', L(
    'historische Verantwortung',
    'eigenes Sicherheitsinteresse',
    'globale Stabilität',
    'europäische Integration',
    'völkerrechtliche Verpflichtungen',
    '+ wirtschaftliche Interessen'));
  add('m05', 'gm', 'Sind die Motive aus Mindmap 1 dieselben wie in der grünen Mindmap?', 'Nein – große Schnittmenge, aber nicht gleich.', {
    def: L('In beiden: Verantwortung, wirtschaftliche Interessen (Bündnisse ≈ völkerrechtliche Verpflichtungen, Krisen ≈ globale Stabilität).',
      'Nur Mindmap 1: eigenes Sicherheitsinteresse, europäische Integration.',
      'Nur grün: Abhängigkeiten, Partnerschaften, moralische Aspekte.'),
    fx: 'Frage nach Motiven → grüne Liste + europäische Integration + Sicherheitsinteresse.' });
  add('m06', 'gm', 'Mindmap 1: Ziele (wozu?) – nenne 6.', L(
    'Friedenssicherung, Krisenprävention',
    'Schutz von Menschenrechten und Minderheiten',
    'multilaterale Zusammenarbeit',
    'Abrüstung, Rüstungskontrolle',
    'Klimasicherheit, nachhaltige Entwicklung',
    'Cybersicherheit'), { fx: 'Nicht „wirtschaftliche“, sondern „multilaterale“ Zusammenarbeit.' });

  /* ───────────── MINDMAP 2 + GRUNDGESETZ ───────────── */
  add('l01', 'gl', 'Leitlinien der Bundesregierung seit 2017 – wie lautet der Satz?', '„Krisen verhindern, Konflikte bewältigen, Frieden fördern.“');
  add('l02', 'gl', 'Mindmap 2: Neue Herausforderungen – und welche Lösung?', L(
    'Klimakrise',
    'Sicherheit im Cyberraum',
    '⇒ Lösung: Nationale Sicherheitsstrategie (mit Aspekten der menschlichen Sicherheit)'), { fx: '2023: erste Nationale Sicherheitsstrategie Deutschlands.' });
  add('l03', 'gl', 'Mindmap 2: Grundwerte – und wo stehen sie?', 'Frieden, Sicherheit, Menschenrechte, Schutz von Minderheiten ⇒ im Grundgesetz',
    { fx: 'Verbindung zu „Warum handeln?“: „Früh handeln, Eskalation verhindern“' });
  add('l04', 'gl', 'Vorgaben des Grundgesetzes für die Außenpolitik – nenne alle 4 (mit Eselsbrücke).', L(
    'Präambel – Europa + Weltfrieden',
    'Art. 1 (2) – Menschenrechte',
    'Art. 24 (2) – Bündnisse erlaubt',
    'Art. 26 (1) – Verbot des Angriffskriegs'), { fx: 'Europa → Mensch → Bündnis → kein Angriff. 24 und 26 nebeneinander: erst erlaubt, dann verboten.' });
  add('l05', 'gl', 'GG, Präambel – was sagt sie zur Außenpolitik?', 'D. will als gleichberechtigtes Glied in einem vereinten Europa dem Frieden der Welt dienen.', { fx: 'Schlagwort: Europa + Weltfrieden' });
  add('l06', 'gl', 'Art. 1 (2) GG – Inhalt?', 'Bekenntnis zu unverletzlichen und unveräußerlichen Menschenrechten als Grundlage von Frieden und Gerechtigkeit in der Welt.', { fx: 'Schlagwort: Menschenrechte' });
  add('l07', 'gl', 'Art. 24 (2) GG – Inhalt?', 'Zur Wahrung des Friedens darf sich D. einem System kollektiver Sicherheit anschließen (z. B. UN, NATO) und dafür Hoheitsrechte abgeben.', { fx: 'Schlagwort: Bündnisse erlaubt' });
  add('l08', 'gl', 'Art. 26 (1) GG – Inhalt?', 'Handlungen, die das friedliche Zusammenleben der Völker stören, v. a. die Vorbereitung eines Angriffskriegs, sind verfassungswidrig und strafbar.', { fx: 'Schlagwort: Verbot des Angriffskriegs' });

  /* ───────────── IS-NARRATIVE (Gruppe 1, M2) ───────────── */
  add('n00', 'gn', 'Nenne alle 8 narrativen Elemente des IS (Eselsbrücke!).', L(
    '1 Core Story',
    '2 Mythos und Heiligkeit',
    '3 David gegen Goliath',
    '4 Identifikation und Zugehörigkeit',
    '5 Sinnstiftung',
    '6 Frustration → Handlung (Transformation von Frustration in Handlung)',
    '7 Apokalyptische Vision',
    '8 Versprechen von Belohnung und Unsterblichkeit'), { fx: '„Ciao Mama, Dienstag ist Stress, fucking anstrengend, versprochen!“' });
  add('n01', 'gn', '★ Core Story des IS – erkläre.', 'Antwort auf das Warum (Daseinszweck): Mohammeds Sieg in der Schlacht bei Badr 624 = Beweis, dass Allah durch die Hand der Muslime kämpft → Prinzip des „Heiligen Krieges“.', { ex: 'M2, Z. 49–69' });
  add('n03', 'gn', '★ David gegen Goliath – erkläre.', 'Badr war ein Sieg der Unterlegenen. So sieht sich der IS heute: klein, aber gottgewollt gegen den übermächtigen Westen → spricht Heldentum und Gerechtigkeitsgefühl an.', { ex: 'M2, Z. 79–85' });
  add('n06', 'gn', '★ Frustration → Handlung – erkläre.', '„Spirale der Radikalisierung“: Demütigung → Frust → Wut → Hass.', {
    def: 'Zielgruppe: junge, meist muslimische Menschen im Westen – ausgegrenzt, diskriminiert, chancenlos. Der IS lockt: „Kommt zu uns … euer Leben bekommt Bedeutung.“', ex: 'M2, Z. 89–107' });

  /* ───────────── ROLLE DER MEDIEN (Gruppe 1) ───────────── */
  add('d00', 'gd', 'Rolle der (westlichen) Medien: nenne alle 7 Punkte – und das Fazit.', L(
    '1 Sensationalismus und Angstverbreitung',
    '2 Vereinfachung und Stereotypisierung',
    '3 Narrative und Frames',
    '4 Fokus auf Gewalt und Konflikt',
    '5 Verstärkung extremistischer Narrative',
    '6 Rolle der sozialen Medien',
    '7 Verantwortung der Medien',
    'Fazit: Die Rolle ist ambivalent.'), { fx: 'Logik: 4 Darstellungsprobleme (1–4) → 1 Folge (5) → 1 neue Arena (6) → 1 Lösung (7)' });
  add('d01', 'gd', '★ Sensationalismus und Angstverbreitung – erkläre.', 'Dramatische Berichte schüren Angst, die Bedrohung wirkt größer, die Ursachen fehlen.', { fx: 'Pointe: Terror will Angst – Sensation liefert sie ihm.' });
  add('d02', 'gd', '★ Vereinfachung und Stereotypisierung – erkläre.', 'Muslime werden pauschal für die Taten Einzelner stigmatisiert → Diskriminierung, Ausgrenzung, Spaltung.', { fx: 'Link zu M2: Genau diese Ausgrenzung nutzt der IS aus (Teufelskreis).' });
  add('d05', 'gd', '★ Verstärkung extremistischer Narrative – erkläre.', 'Wird der IS als mächtig und unbesiegbar dargestellt, stärkt das seine Story und zieht Frustrierte an.');

  /* ───────────── UMFASSENDE SICHERHEIT (Gruppe 2, Buch S. 42 f.) ───────────── */
  add('s01', 'gs', 'Was bedeutet „umfassende Sicherheit“?', 'Politische, militärische, polizeiliche, diplomatische, entwicklungspolitische und humanitäre Mittel werden ressortübergreifend abgestimmt und gebündelt, um Frieden und Sicherheit zu sichern – lokal, national und international.', { ex: 'Buch S. 42' });
  add('s02', 'gs', 'Sicherheitsbegriff früher vs. heute: Stell die 4 Vergleichsfragen und beantworte sie.', '', { tbl: [
    ['', 'früher (bis ca. 1990)', 'heute (umfassend)'],
    ['Wessen Sicherheit?', 'Staat, Territorium', 'auch Gesellschaft und einzelner Mensch („menschliche Sicherheit“)'],
    ['Welche Gefahren?', 'militärischer Angriff eines Staates', 'Terrorismus, Umweltkatastrophen, Armut, Migration, Cyberangriffe, KI'],
    ['Welche Mittel?', 'Militär, Abschreckung', 'alle Mittel, abgestimmt und nachhaltig'],
    ['Welche Ebene?', 'national', 'lokal + national + international'],
  ] });
  const SV = [
    ['s03', 'Wessen Sicherheit?', 'früher: Staat, Territorium', 'heute: auch Gesellschaft und der einzelne Mensch („menschliche Sicherheit“)'],
    ['s04', 'Welche Gefahren?', 'früher: militärischer Angriff eines Staates', 'heute: Terrorismus, Umweltkatastrophen, Armut, Migration, Cyberangriffe, KI'],
    ['s05', 'Welche Mittel?', 'früher: Militär, Abschreckung', 'heute: militärische, polizeiliche, diplomatische, entwicklungspolitische, humanitäre Mittel – abgestimmt und nachhaltig'],
    ['s06', 'Welche Ebene?', 'früher: national', 'heute: lokal + national + international – globale Probleme sind nur gemeinsam lösbar'],
  ];
  for (const [id, frage, alt, neu] of SV) add(id, 'gs', `Sicherheitsbegriff früher vs. heute: ${frage}`, L(alt, neu));
  add('s07', 'gs', 'Warum hat sich der Sicherheitsbegriff gewandelt?', 'Ende des Kalten Kriegs, Globalisierung, nichtstaatliche Akteure – globale Probleme sind nur gemeinsam lösbar.', { fx: 'Fachbegriff: „erweiterter Sicherheitsbegriff“' });
  add('s08', 'gs', 'Wie ordnest du den internationalen Terrorismus in die umfassende Sicherheit ein?', 'Paradebeispiel der neuen Gefahr: nichtstaatlich, grenzüberschreitend, militärisch allein nicht zu besiegen → braucht alle Mittel und alle Ebenen.', {
    def: L('Lokal: Prävention, Deradikalisierung', 'National: Polizei, Geheimdienste', 'International: OSZE, UN, Geldflüsse stoppen'),
    fx: 'Die OSZE bekämpft Anschläge UND Ursachen = umfassende Sicherheit (M3, Aufg. 2).' });

  /* ───────────── OSZE (Gruppe 2, M3) ───────────── */
  add('o01', 'go', 'Was ist die OSZE?', 'Organisation für Sicherheit und Zusammenarbeit in Europa: 57 Teilnehmerstaaten (Nordamerika, Europa, Asien), größte regionale Sicherheitsorganisation der Welt.');
  add('o02', 'go', 'Was tut die OSZE gegen Terrorismus? (Haltung + Ansatz)', L(
    'Terror = schweres Verbrechen ohne Rechtfertigung, nicht an Religion, Volk oder Nationalität gekoppelt.',
    'Unter UN-Führung gegen Erscheinungsformen UND Ursachen (sozial, wirtschaftlich, politisch).',
    'Kooperativ: Staaten, Organisationen, Wirtschaft, Zivilgesellschaft, Medien.'));
  add('o03', 'go', 'OSZE: Wie lautet der Merksatz – und welche 7 Schwerpunkte stecken drin?', L(
    '„Vier Esel fressen immer dienstags rote Möhren“',
    'V – Völkerrechtlichen Rahmen umsetzen',
    'E – gewaltbereiten Extremismus und Radikalisierung bekämpfen',
    'F – Finanzierung des Terrorismus unterbinden',
    'I – Nutzung des Internets für Terror bekämpfen',
    'D – Dialog und Zusammenarbeit fördern',
    'R – Sicherheit von Reisedokumenten verbessern',
    'M – Menschenrechte und Grundfreiheiten schützen'));
  const OS = [
    ['o11', 'Vier', 'V', 'Völkerrechtlichen Rahmen umsetzen, Zusammenarbeit in Strafsachen', 'nationale Behörden schulen; bewährte Praktiken austauschen'],
    ['o12', 'Esel', 'E', 'gewaltbereiten Extremismus und Radikalisierung bekämpfen', 'Präventionsprogramme an Schulen; Dialog der Zivilgesellschaft'],
    ['o13', 'fressen', 'F', 'Finanzierung des Terrorismus unterbinden', 'Finanzüberwachung; Banken schulen, verdächtige Transaktionen zu melden'],
    ['o14', 'immer', 'I', 'Nutzung des Internets für terroristische Zwecke bekämpfen', 'mit Tech-Firmen gegen Online-Rekrutierung; Aufklärungskampagnen'],
    ['o15', 'dienstags', 'D', 'Dialog und Zusammenarbeit fördern (öffentlich-private Partnerschaften)', 'Partnerschaften Staat–Wirtschaft–Zivilgesellschaft; internationale Konferenzen'],
    ['o16', 'rote', 'R', 'Sicherheit von Reisedokumenten verbessern', 'fälschungssichere Pässe; Grenzbeamte schulen'],
    ['o17', 'Möhren', 'M', 'Menschenrechte und Grundfreiheiten schützen', 'alle Maßnahmen im Einklang mit den Menschenrechten; Monitoring'],
  ];
  for (const [id, word, letter, sp, mass] of OS) add(id, 'go', `OSZE-Merksatz: „${word}“ (${letter}) – welcher Schwerpunkt? Und eine Maßnahme.`, sp, { def: 'Maßnahme: ' + mass });

  return c;
})();
