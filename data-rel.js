/* Religion 12k2 – Klausur Fr 13.11.2026 „Der Mensch und die Frage: Wer bin ich?“
 * Grundlage: ByCS 12k2 Religion – „Klausur Schwerpunkte.pdf“ und „Beispiel für Klausur.pdf“ (30.10.), Buchseiten S12–S21.
 * Startbestand vom 01.11.2026: nur, was in diesen Dateien steht. Ausbau (Identität, Generationsbegriff, SINUS-Milieus,
 * Hurrelmann, Sex/Gender, christliches Menschenbild, Schöpfungstexte) übernimmt der Religion-Chat mit Heft und Lernplan.
 *
 * Felder wie in data.js. IDs mit Präfix `rel-`, nie ändern.
 */
const DECKS_REL = [
  { id: 'rl_gen', name: 'Generation & Identität', short: 'Generation', color: '#e8590c', q: 'Welcher Begriff?', def: 2 },
  { id: 'rl_fam', name: 'Familie', short: 'Familie', color: '#a61e4d', q: 'Welcher Begriff?', def: 1 },
  { id: 'rl_ges', name: 'Gesellschaft & Engagement', short: 'Gesellschaft', color: '#1971c2', q: 'Welcher Begriff?', def: 2 },
  { id: 'rl_sex', name: 'Geschlecht', short: 'Geschlecht', color: '#5f3dc4', q: 'Welcher Begriff?', def: 2 },
  { id: 'rl_kl', name: 'Klausur', short: 'Klausur', color: '#495057', q: 'Welcher Begriff?', def: 1 },
];

const CARDS_REL = [
  /* ───────────── GENERATION (Stoff 25.09., S12–S13) ───────────── */
  { id: 'rel-g01', deck: 'rl_gen', ql: 'Wann geboren – und welcher andere Name?', noMC: true, term: 'Generation Z',
    def: 'Geboren kurz vor oder nach der Jahrtausendwende bis etwa 2012.\nAufgewachsen in den ersten Jahrzehnten des 21. Jahrhunderts.\nAuch: Post-Millennials. Danach folgt die Generation Alpha.' },
  { id: 'rel-g02', deck: 'rl_gen', ql: 'Welche Entwicklungen prägen sie?', noMC: true, term: 'Prägende Erfahrungen der Generation Z',
    def: 'Klimawandel\nFinanzkrise am Anfang des 21. Jahrhunderts\nMigrationsbewegungen und Flüchtlingskrisen\nFolgen der Coronapandemie\nKrieg in der Ukraine ab 2022' },
  { id: 'rel-g03', deck: 'rl_gen', ql: 'Welche Merkmale werden ihr zugeschrieben? (M1)', noMC: true, term: 'Merkmale der Generation Z',
    def: 'Selbstverständlicher Umgang mit digitalen Medien von klein auf\nIntensive Nutzung sozialer Medien\nGeringerer Leistungsdruck wegen Fachkräftemangel\nSelbstbestimmung und Selbstverwirklichung als höchste Werte\nKlare Trennung von Privatleben und Beruf (Work-Life-Balance)\nMehr politisches Engagement, v. a. beim Klima („Generation Greta“)\nMehr psychische Probleme, auch durch Corona\nEher pessimistisch beim Blick in die Zukunft' },
  { id: 'rel-g04', deck: 'rl_gen', ql: 'Welche Generationen unterscheidet Mohr (M2)?', noMC: true, term: 'Generationenfolge nach Reinhard Mohr',
    def: '68er: revoltierten gegen die Eltern und die Kriegsgeneration\n78er: „alternative Etappe“ der 70er, Spiel mit Ideen und Visionen\n89er: „Generation Berlin“, „Internet-Generation“, „Generation Golf“ – „Madonna und nicht Marx“, Glanzzeit 90er\nDanach Mittdreißiger vor Existenzfragen: Börsenkrise, Arbeitslosigkeit, 11. September',
    fx: 'Reinhard Mohr, „Generation Z oder Von der Zumutung, älter zu werden“, 2004. Aufgabe: eigene Generation auf dieser Zeitleiste einordnen.' },

  /* ───────────── FAMILIE (S14–S15) ───────────── */
  { id: 'rel-f01', deck: 'rl_fam', ql: 'Welche Rollenerwartungen erlebt Hildegard (M3/M4)?', noMC: true, term: 'Ulla Hahn: „Das verborgene Wort“',
    def: 'Autobiografischer Roman (2001), 1950er-Jahre, katholisches Dorf im Rheinland\nKind sein = schuldig, sündig sein; Gebote kommen direkt von Gott\nZiel der Frau: Heirat mit Anfang zwanzig\nFrauen in der Küche, Männer „politisieren“ im Wohnzimmer\nHildegard zieht sich zurück und liest Hildegard von Bingen',
    fx: 'Romanfigur Hildegard ≠ Hildegard von Bingen. Laut Schwerpunkten zählt aus „Familie“ nur Hildegard von Bingen (Mittelalter) als historisches Beispiel – Rest weniger wichtig.' },

  /* ───────────── GESELLSCHAFT (Stoff 16.10., S18–S19) ───────────── */
  { id: 'rel-s01', deck: 'rl_ges', ql: 'Was sind die zentralen Ergebnisse?', noMC: true, term: 'Shell-Jugendstudie 2019 (18.): „Eine Generation meldet sich zu Wort“',
    def: 'Eigene Ansprüche an die Zukunft, Weichen sollen schon heute gestellt werden\nUmweltschutz und Klimawandel deutlich wichtiger\nForderung nach mehr Mitsprache\nPragmatische Grundorientierung\nHohe Orientierung an Leistungsnormen\nWunsch nach stabilen sozialen Beziehungen im Nahbereich\nChancen ergreifen, sich den Gegebenheiten anpassen\nBewusstere, nachhaltige Lebensführung' },
  { id: 'rel-s02', deck: 'rl_ges', ql: 'Welche Beispiele für Engagement Jugendlicher kennst du?', noMC: true, term: 'Gesellschaftliches Engagement Jugendlicher',
    def: 'Fridays for Future\n„Letzte Generation“ (Klimaaktivismus)\nKirchliche Jugendarbeit: Ferienfreizeiten und Zeltlager in der Pfarrgemeinde\nBDKJ und seine Mitgliedsverbände',
    fx: 'Tipp der Lehrkraft: Arbeit der BDKJ-Mitgliedsverbände im Internet anschauen.' },
  { id: 'rel-s03', deck: 'rl_ges', term: 'BDKJ', def: 'Bund der Deutschen Katholischen Jugend – Dachverband der katholischen Jugendverbände.',
    ex: 'Mitgliedsverbände z. B. DPSG (Pfadfinder), KjG, Kolpingjugend, KLJB · bekannteste Aktion: 72-Stunden-Aktion', fx: 'Beispiele ergänzt, nicht vom Blatt.' },

  /* ───────────── GESCHLECHT (Stoff 23.10., S20–S21) ───────────── */
  { id: 'rel-x01', deck: 'rl_sex', ql: 'Wer ist das – und worum geht es im Roman?', noMC: true, term: 'Kim de l’Horizon: „Blutbuch“',
    def: 'Pseudonym, geboren 1992 in der Schweiz, sieht sich weder als Mann noch als Frau (nicht binär)\n„Blutbuch“ (2022): Deutscher und Schweizer Buchpreis\nThema: Geschlechtsidentität, die sich der eindeutigen Zuordnung verweigert; Selbstbild und Fremdbild klaffen auseinander\nAnlass: Demenz der Großmutter → Fragen nach der Rolle der Frauen in der Familie' },
  { id: 'rel-x02', deck: 'rl_sex', term: 'Binär (Geschlechtsidentität)', def: 'Klare Zuordnung entweder zu einer männlichen oder zu einer weiblichen Geschlechtsidentität.',
    ex: 'von lat. bina „doppelt, paarweise“' },
  { id: 'rel-x03', deck: 'rl_sex', term: 'Nicht binär', def: 'Eine Person sieht sich selbst weder als Mann noch als Frau.', ex: 'Kim de l’Horizon' },

  /* ───────────── KLAUSUR (Muster 30.10.) ───────────── */
  { id: 'rel-k01', deck: 'rl_kl', ql: 'Wie ist die Klausur aufgebaut?', noMC: true, term: 'Klausurmuster (40 BE)',
    def: '1. Begriff darlegen und abgrenzen – 4 BE\n2a. Rolle einer Person im Text darstellen und wie sie sich verändert – 6 BE\n2b. Mit Hurrelmanns Entwicklungsaufgaben charakterisieren – 14 BE\n3. Erörtern: christliches Menschenbild auf das Fallbeispiel beziehen – 16 BE',
    fx: '30 von 40 BE hängen an Hurrelmann und am christlichen Menschenbild.' },
];
