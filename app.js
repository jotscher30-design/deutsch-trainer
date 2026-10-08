/* Abi-Trainer – Logik (Deutsch + Physik)
 * Spaced Repetition (vereinfachtes SM-2), Active Recall, Interleaving, Wenn-Dann-Plan.
 * Themen-Status pro Fach: 0 = aus, 1 = normal, 2 = Fokus (neue Karten kommen dreimal so oft).
 * Alles lokal in localStorage – keine Server, keine Accounts.
 */
(() => {
  const KEY = 'dt_state_v2', OLD_KEY = 'dt_state_v1'; // v1 bleibt als Sicherung unangetastet liegen
  const NEWS = 2;
  const $ = sel => document.querySelector(sel);
  const app = $('#app');
  const tabbar = $('#tabbar');

  const SUBJ = {
    de: { id: 'de', name: 'Deutsch', decks: DECKS, cards: CARDS, mc: 0.65, npd: 5, goal: 12 },
    ph: { id: 'ph', name: 'Physik', decks: DECKS_PH, cards: CARDS_PH, mc: 0.55, npd: 6, goal: 15 },
  };
  const ALL_DECKS = [...DECKS, ...DECKS_PH];

  /* ───────── Hilfen ───────── */
  const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // Text mit Formeln in $…$ (KaTeX) und Zeilenumbrüchen
  const rich = s => {
    if (s == null) return '';
    return String(s).split('$').map((p, i) => {
      if (i % 2 && window.katex) { try { return katex.renderToString(p, { throwOnError: false, strict: 'ignore' }); } catch (e) { return esc(p); } }
      return esc(p).replace(/\n/g, '<br>');
    }).join('');
  };
  const deckOf = id => ALL_DECKS.find(d => d.id === id);
  const subjOf = card => card.id.startsWith('ph-') ? 'ph' : 'de';
  const K = () => S.set.cur;
  const cur = () => SUBJ[K()];
  const conf = (k = K()) => S.set[k];

  /* ───────── State ───────── */
  const subjDefaults = k => ({ newPerDay: SUBJ[k].npd, goal: SUBJ[k].goal, decks: Object.fromEntries(SUBJ[k].decks.map(d => [d.id, d.def])) });
  const defaults = () => ({ v: 2, news: 0, cards: {}, hist: { de: {}, ph: {} }, set: { ifthen: '', onboarded: false, cur: 'de', de: subjDefaults('de'), ph: subjDefaults('ph') } });
  function normalize(s) {
    const d = defaults();
    s.v = 2; s.cards = s.cards || {}; s.hist = Object.assign({ de: {}, ph: {} }, s.hist || {});
    s.set = Object.assign({}, d.set, s.set || {});
    for (const k of Object.keys(SUBJ)) { s.set[k] = Object.assign({}, d.set[k], s.set[k] || {}); s.set[k].decks = Object.assign({}, d.set[k].decks, s.set[k].decks || {}); }
    if (!SUBJ[s.set.cur]) s.set.cur = 'de';
    return s;
  }
  // Fortschritt aus Version 1 (nur Deutsch) übernehmen; neue Schwerpunkte setzen
  function migrate(o) {
    const s = defaults(), os = o.set || {};
    s.cards = o.cards || {}; s.hist.de = o.hist || {};
    s.set.ifthen = os.ifthen || ''; s.set.onboarded = !!os.onboarded;
    if (os.newPerDay) s.set.de.newPerDay = os.newPerDay;
    if (os.goal) s.set.de.goal = os.goal;
    for (const id of ['lyrik', 'epik', 'drama']) if (os.decks && os.decks[id] === false) s.set.de.decks[id] = 0;
    return s;
  }
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) return normalize(JSON.parse(raw)); } catch (e) {}
    try { const old = localStorage.getItem(OLD_KEY); if (old) return migrate(JSON.parse(old)); } catch (e) {}
    return defaults();
  }
  let S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  save();
  const H = (day, k = K()) => (S.hist[k][day] = S.hist[k][day] || { r: 0, c: 0, n: 0 });
  const dayTotal = d => Object.keys(SUBJ).reduce((a, k) => a + ((S.hist[k][d] || {}).r || 0), 0);

  /* ───────── Scheduling (SM-2 light) ─────────
   * rating: 1 = nicht gewusst, 2 = schwer, 3 = gut, 4 = leicht
   */
  function rate(id, rating, { extra = false } = {}) {
    const t = today();
    const c = S.cards[id] || (S.cards[id] = { e: 2.5, i: 0, due: t, n: 0, l: 0 });
    if (extra && rating >= 3) { c.n++; c.last = t; return; } // Extra-Runde: Erfolg verändert den Plan nicht
    c.n++; c.last = t;
    if (rating === 1) { c.i = 0; c.e = Math.max(1.3, c.e - 0.2); c.l++; }
    else if (rating === 2) { c.i = c.i < 1 ? 1 : Math.round(c.i * 1.2); c.e = Math.max(1.3, c.e - 0.15); }
    else if (rating === 3) { c.i = c.i < 1 ? 1 : c.i === 1 ? 3 : Math.round(c.i * c.e); }
    else { c.i = c.i < 1 ? 3 : Math.round(c.i * c.e * 1.3); c.e = Math.min(3, c.e + 0.1); }
    c.i = Math.min(c.i, 180);
    c.due = addDays(t, c.i);
  }
  const enabled = (k = K()) => SUBJ[k].cards.filter(c => conf(k).decks[c.deck] > 0);
  const dueCards = (k = K()) => enabled(k).filter(c => S.cards[c.id] && S.cards[c.id].due <= today());
  const newCards = (k = K()) => enabled(k).filter(c => !S.cards[c.id]);
  const newAllowed = (k = K()) => Math.max(0, conf(k).newPerDay - H(today(), k).n);
  const todo = (k = K()) => dueCards(k).length + Math.min(newAllowed(k), newCards(k).length);
  const mastered = (k = K()) => enabled(k).filter(c => S.cards[c.id] && S.cards[c.id].i >= 21).length;

  function streak() {
    let d = today(), n = 0;
    if (!dayTotal(d)) d = addDays(d, -1);
    while (dayTotal(d)) { n++; d = addDays(d, -1); }
    return n;
  }

  /* ───────── Fragen ───────── */
  // Verrät der Fragetext den Begriff? Dann taugt er nicht als Frage.
  function leaks(card, text) {
    const t = text.toLowerCase();
    return card.term.toLowerCase().replace(/[^a-zäöüß ]/g, ' ').split(/\s+/).filter(w => w.length >= 4)
      .some(w => t.includes(w.slice(0, 5)));
  }
  // Fragetexte: eigene Frage; Stilmittel → Beispiele; mit Beispielen → Definition oder Beispiel; Epochen → Werke oder Kennzeichen; sonst Definition
  function questionTexts(card) {
    if (card.q) return [card.q];
    const exs = [card.ex, ...(card.exs || [])];
    const cand = card.deck === 'stil' ? exs : card.exs ? [card.def, ...exs] : card.deck === 'epochen' ? [card.ex, card.def] : [card.def];
    return cand.filter(t => t && !leaks(card, t));
  }
  const questionText = card => { const q = questionTexts(card); return q[Math.floor(Math.random() * q.length)]; };
  const cfOf = c => [].concat(c.cf || []);
  // Falsche Antworten aus anderen Karten: gleiche Gruppe, bei Stilmitteln bevorzugt die typischen Verwechslungen
  function distractors(card) {
    const pool = SUBJ[subjOf(card)].cards.filter(c => c.deck === card.deck && c.id !== card.id && c.term !== card.term && !c.noMC && !c.gen && !c.wrong);
    const main = card.grp ? pool.filter(c => c.grp === card.grp) : pool.filter(c => !c.grp && !c.q);
    const cf = cfOf(card);
    const pref = cf.length ? shuffle(main.filter(c => cfOf(c).some(x => cf.includes(x)))) : [];
    const out = [], seen = new Set([card.term]);
    const add = c => { if (out.length < 3 && !seen.has(c.term)) { seen.add(c.term); out.push(c.term); } };
    pref.slice(0, 2).forEach(add);
    shuffle(main.slice()).forEach(add);
    return out;
  }
  function canMC(card) {
    if (card.noMC) return false;
    if (card.gen) return true;
    if (card.wrong) return card.wrong.length >= 2;
    if (card.q && !card.grp) return false;
    return questionTexts(card).length > 0 && distractors(card).length >= 3;
  }
  const modeFor = (card, k) => card.gen ? 'mc' : canMC(card) && Math.random() < SUBJ[k].mc ? 'mc' : 'flash';
  // Frage einmal pro Abfrage-Schritt festlegen (Zufallsaufgaben: neue Zahlen)
  function prep(it) {
    if (it.ready) return;
    const c = it.card; it.ready = true;
    if (c.gen) { const g = c.gen(); Object.assign(it, { q: g.q, svg: g.svg, right: g.term, why: g.def || c.def, opts: g.fixed ? g.fixed.slice() : shuffle([g.term, ...g.wrong]) }); return; }
    it.q = it.mode === 'mc' ? questionText(c) : c.q;
    it.right = c.term;
    if (it.mode === 'mc') it.opts = shuffle([c.term, ...(c.wrong ? shuffle(c.wrong.slice()).slice(0, 3) : distractors(c))]);
  }

  /* ───────── Session ───────── */
  let sess = null;
  function buildSession({ extra = false, deck = null } = {}) {
    const k = K(), items = [];
    if (deck) { // nur ein Thema üben (z. B. vor der Klausur)
      const all = SUBJ[k].cards.filter(c => c.deck === deck);
      shuffle(all.filter(c => S.cards[c.id])).slice(0, 12).forEach(card => items.push({ card, mode: modeFor(card, k), extra: true }));
      const fresh = all.filter(c => !S.cards[c.id]).slice(0, Math.min(6, Math.max(0, 12 - items.length)));
      fresh.forEach((card, idx) => items.splice(Math.min(items.length, idx * 3), 0, { card, mode: 'learn' }));
    } else if (extra) {
      const seen = enabled(k).filter(c => S.cards[c.id]);
      const pool = seen.length >= 6 ? seen : enabled(k);
      shuffle(pool.slice()).slice(0, 10).forEach(card => items.push({ card, mode: modeFor(card, k), extra: true }));
    } else {
      shuffle(dueCards(k)).slice(0, 30).forEach(card => items.push({ card, mode: modeFor(card, k) }));
      // Neue Karten gewichtet über die Themen verteilt: Fokus-Themen dreimal so oft (Interleaving)
      const by = {}; newCards(k).forEach(c => (by[c.deck] = by[c.deck] || []).push(c));
      const fresh = [];
      while (fresh.length < newAllowed(k)) {
        const ds = Object.keys(by).filter(d => by[d].length); if (!ds.length) break;
        const w = ds.map(d => conf(k).decks[d] === 2 ? 3 : 1);
        let r = Math.random() * w.reduce((a, b) => a + b, 0), i = 0;
        while (r >= w[i]) { r -= w[i]; i++; }
        fresh.push(by[ds[i]].shift());
      }
      fresh.forEach((card, idx) => items.splice(Math.min(items.length, idx * 3), 0, { card, mode: 'learn' }));
    }
    sess = { items, pos: 0, done: 0, correct: 0, requeued: {}, k, deck };
  }
  function requeue(it) {
    const card = it.card, n = sess.requeued[card.id] || 0;
    if (n >= 2) return;
    sess.requeued[card.id] = n + 1;
    sess.items.push({ card, mode: card.gen || (n === 0 && canMC(card)) ? 'mc' : 'flash', extra: it.extra });
  }
  function record(it, rating) {
    const card = it.card, h = H(today(), sess.k);
    h.r++; if (rating >= 3) { h.c++; sess.correct++; }
    sess.done++;
    rate(card.id, rating, { extra: it.extra });
    if (rating === 1) requeue(it);
    save();
  }

  /* ───────── Views ───────── */
  let view = 'home';
  function go(v) { view = v; sess = null; document.body.classList.remove('session'); tabbar.classList.remove('hidden'); render(); window.scrollTo(0, 0); }
  tabbar.addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(b.dataset.view); });
  function setSubject(k) { if (!SUBJ[k] || k === K()) return; S.set.cur = k; save(); render(); }

  function render() {
    tabbar.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    document.body.dataset.subj = K();
    if (!S.set.onboarded) return renderOnboarding();
    if (sess) return renderSession();
    ({ home: renderHome, lex: renderLex, stats: renderStats, settings: renderSettings })[view]();
    app.querySelectorAll('[data-subj]').forEach(b => b.onclick = () => setSubject(b.dataset.subj));
  }
  const subjSwitch = (badges = true) => `<div class="seg subj">${Object.values(SUBJ).map(s => {
    const n = badges ? todo(s.id) : 0;
    return `<button class="${K() === s.id ? 'on' : ''}" data-subj="${s.id}">${s.name}${n ? `<span class="badge">${n}</span>` : ''}</button>`;
  }).join('')}</div>`;

  /* Onboarding: Wenn-Dann-Plan (Gollwitzer) */
  function renderOnboarding() {
    tabbar.classList.add('hidden');
    const presets = ['Wenn ich morgens im Bus sitze', 'Wenn ich das Mathe-Blatt fertig habe', 'Wenn ich abends die Zähne geputzt habe', 'Wenn ich in der Pause aufs Handy schaue'];
    app.innerHTML = `
      <h1>Abi-Trainer</h1>
      <p class="muted">Deutsch (${CARDS.length} Karten: Stilmittel, Argumentation, Epochen …) und Physik (${CARDS_PH.length} Karten: Konstanten, Felder, Kondensator …). Nach dem Lehrplan der 12.</p>
      <div class="box">
        <p><b>So funktioniert es</b></p>
        <p class="muted">Jeden Tag ein paar Minuten pro Fach. Die App fragt dich ab (nicht du liest nach) und zeigt dir jede Karte genau dann wieder, wenn du sie fast vergessen hättest. Das ist der Unterschied zwischen „vor der Schulaufgabe neu lernen“ und „sitzt“.</p>
      </div>
      <div class="box">
        <p><b>Dein Wenn-Dann-Plan</b></p>
        <p class="muted">Ein fester Auslöser verdoppelt die Chance, dass du es wirklich machst (Gollwitzer). Wähle oder tippe deinen:</p>
        <div class="opts" id="presets">${presets.map(p => `<button class="opt">${p}</button>`).join('')}</div>
        <p style="margin-top:12px"><input type="text" id="ifthen" placeholder="Wenn ich … " value="${esc(S.set.ifthen)}"></p>
        <p class="muted small">… dann mache ich meine Abfrage.</p>
      </div>
      <button class="btn primary" id="start">Los geht's</button>`;
    $('#presets').addEventListener('click', e => { const b = e.target.closest('.opt'); if (b) $('#ifthen').value = b.textContent; });
    $('#start').onclick = () => { S.set.ifthen = $('#ifthen').value.trim(); S.set.onboarded = true; S.news = NEWS; save(); go('home'); };
  }

  function ring(cur, goal) {
    const r = 52, C = 2 * Math.PI * r, p = Math.min(1, goal ? cur / goal : 0);
    return `<div class="ring"><svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--soft)" stroke-width="10"/>
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--accent)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - p)}"/>
      </svg><div class="lbl"><b>${cur}</b><span>von ${goal}</span></div></div>`;
  }

  function heatmap(weeks) {
    const t = today(); const cells = []; const total = weeks * 7;
    // Spalte = Woche, Zeile = Wochentag (Mo oben); zählt beide Fächer
    const dow = (new Date(t + 'T12:00:00').getDay() + 6) % 7; // Mo=0
    const start = addDays(t, -(total - 1) + (6 - dow)); // so dass heute in der letzten Spalte steht
    for (let i = 0; i < total; i++) {
      const d = addDays(start, i); if (d > t) { cells.push('<i style="visibility:hidden"></i>'); continue; }
      const r = dayTotal(d);
      const lvl = r === 0 ? '' : r < 8 ? 'l1' : r < 20 ? 'l2' : r < 35 ? 'l3' : 'l4';
      cells.push(`<i class="${lvl}${d === t ? ' today' : ''}" title="${d}: ${r}"></i>`);
    }
    setTimeout(() => document.querySelectorAll('.heat').forEach(h => { h.scrollLeft = h.scrollWidth; }), 0);
    return `<div class="heat">${cells.join('')}</div>`;
  }

  function renderHome() {
    const k = K(), t = today(), h = H(t), due = dueCards().length, fresh = Math.min(newAllowed(), newCards().length);
    const st = streak(), total = due + fresh, goal = conf().goal;
    const wd = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][new Date().getDay()];
    const focus = cur().decks.filter(d => conf().decks[d.id] === 2).map(d => d.short);
    const other = Object.keys(SUBJ).find(x => x !== k);
    app.innerHTML = `
      ${subjSwitch()}
      <div class="row between" style="margin-top:14px"><div><h1>${cur().name} heute</h1><p class="muted">${wd}, ${t.split('-').reverse().join('.')}</p></div>
        <div class="stat" style="min-width:86px"><b>${st}</b><span>Tage in Folge</span></div></div>
      ${S.news !== NEWS ? `<div class="box news"><p style="margin:0 0 6px"><b>Neu: Physik + neuer Deutsch-Schwerpunkt</b></p>
        <p class="muted small" style="margin:0 0 6px">Physik: ${CARDS_PH.length} Karten nach Lehrplan 12 – Konstanten, E-Feld, Kondensator zuerst, dazu Zufallsaufgaben mit immer neuen Zahlen. Oben zwischen den Fächern wechseln.</p>
        <p class="muted small" style="margin:0 0 10px">Deutsch: Stilmittel, Argumentation und Epochen stark ausgebaut und im Fokus, Sprachtheorie pausiert. Dein Fortschritt ist übernommen. Ändern unter „Mehr“.</p>
        <button class="btn ghost" id="newsok" style="padding:10px">Verstanden</button></div>` : ''}
      <div class="box center">
        ${ring(h.r, goal)}
        <p class="muted">${h.r >= goal ? 'Tagesziel erreicht. Stark.' : h.r > 0 ? `Noch ${goal - h.r} bis zum Tagesziel.` : 'Noch nichts gemacht heute.'}</p>
        ${total > 0
          ? `<button class="btn primary" id="start">Abfrage starten <span style="font-weight:400;opacity:.85">· ${due} fällig${fresh ? ` + ${fresh} neu` : ''}</span></button>`
          : `<button class="btn" id="extra">Extra-Runde (10 Karten)</button><p class="muted small" style="margin-top:8px">Nichts mehr fällig. Morgen geht's weiter.</p>`}
        ${total > 0 && h.r > 0 ? `<button class="btn ghost" id="extra">Extra-Runde</button>` : ''}
        ${total === 0 && todo(other) ? `<button class="btn ghost" data-subj="${other}">Weiter mit ${SUBJ[other].name} · ${todo(other)}</button>` : ''}
      </div>
      <div class="stats3">
        <div class="stat"><b>${due}</b><span>fällig</span></div>
        <div class="stat"><b>${enabled().filter(c => S.cards[c.id]).length}</b><span>gesehen</span></div>
        <div class="stat"><b>${mastered()}</b><span>sitzen</span></div>
      </div>
      ${focus.length ? `<p class="muted small" style="margin-top:12px">Fokus: <b>${focus.join(' · ')}</b> – <a href="#" id="chg">ändern</a></p>` : ''}
      ${S.set.ifthen ? `<div class="box ifthen"><p class="small muted" style="margin:0">Dein Plan</p><p style="margin:0"><b>${esc(S.set.ifthen)}</b>, dann mache ich meine Abfrage.</p></div>` : ''}
      <h2>Letzte 12 Wochen</h2>
      ${heatmap(12)}`;
    const s = $('#start'); if (s) s.onclick = () => startSession();
    const x = $('#extra'); if (x) x.onclick = () => startSession({ extra: true });
    const n = $('#newsok'); if (n) n.onclick = () => { S.news = NEWS; save(); render(); };
    const c = $('#chg'); if (c) c.onclick = e => { e.preventDefault(); go('settings'); };
  }

  function startSession(opts) {
    buildSession(opts);
    if (!sess.items.length) { sess = null; return; }
    document.body.classList.add('session'); tabbar.classList.add('hidden');
    render(); window.scrollTo(0, 0);
  }

  const lab = (l, v, cls = 'def') => v ? `<div class="lab">${l}</div><div class="${cls}">${rich(v)}</div>` : '';
  function renderSession() {
    const it = sess.items[sess.pos];
    if (!it) return renderDone();
    prep(it);
    const card = it.card, deck = deckOf(card.deck), isPh = subjOf(card) === 'ph';
    const prog = Math.round(sess.pos / sess.items.length * 100);
    const head = `<div class="topbar"><button class="x" id="quit">×</button><div class="grow"><div class="progress"><i style="width:${prog}%"></i></div></div><span class="muted small">${sess.pos + 1}/${sess.items.length}</span></div>`;
    const tag = `<span class="pill deck" style="background:${deck.color}">${deck.short}</span>`;
    const qLabel = card.ql || deck.q;

    if (it.mode === 'learn') {
      const ex = card.gen ? null : card.ex;
      app.innerHTML = head + `
        <div class="qcard"><div class="q"><span class="newtag">Neu</span> · ${deck.name}</div>
          ${card.q || card.gen ? `<div class="qtext">${rich(it.q)}</div>${it.svg || ''}` : `<div class="big">${rich(card.term)}</div>`}
          <div class="answer">
          ${card.q || card.gen ? lab(card.gen ? 'Lösung' : 'Antwort', it.right, 'ans') : ''}
          ${lab(card.q || card.gen ? 'Erklärung' : 'Definition', card.gen ? it.why : card.def)}
          ${lab('Beispiel', ex, 'ex')}
          ${card.exs ? lab('Weitere Beispiele', card.exs.join('\n'), 'ex') : ''}
          ${lab(isPh ? 'Merke' : 'Wirkung / Merke', card.fx)}</div></div>
        <button class="btn primary" id="ok">Gemerkt – gleich abfragen</button>`;
      $('#ok').onclick = () => {
        S.cards[card.id] = { e: 2.5, i: 0, due: today(), n: 0, l: 0 }; H(today(), sess.k).n++; save();
        sess.items.push({ card, mode: card.gen || canMC(card) ? 'mc' : 'flash' }); sess.pos++; render(); window.scrollTo(0, 0);
      };
    } else if (it.mode === 'mc') {
      const isEx = !card.q && !card.gen && it.q !== card.def;
      app.innerHTML = head + `
        <div class="qcard"><div class="q">${esc(qLabel)} ${tag}</div>
          <div class="${card.q || card.gen ? 'qtext' : isEx ? 'ex' : 'def'}">${rich(it.q)}</div>${it.svg || ''}</div>
        <div class="opts">${it.opts.map((o, i) => `<button class="opt" data-i="${i}">${rich(o)}</button>`).join('')}</div>
        <div id="after"></div>`;
      $('.opts').addEventListener('click', e => {
        const b = e.target.closest('.opt'); if (!b || b.disabled) return;
        const ok = it.opts[+b.dataset.i] === it.right;
        document.querySelectorAll('.opt').forEach(o => { o.disabled = true; if (it.opts[+o.dataset.i] === it.right) o.classList.add('correct'); else if (o === b) o.classList.add('wrong'); });
        record(it, ok ? 3 : 1);
        let rest;
        if (card.gen) rest = [['Lösungsweg', it.why], ['Merke', card.fx]];
        else if (card.q) rest = [['Erklärung', card.def], ['Merke', card.fx]];
        else rest = [isEx ? ['Definition', card.def] : ['Beispiel', card.ex], [isPh ? 'Merke' : 'Wirkung / Merke', card.fx]];
        rest = rest.filter(r => r[1]);
        $('#after').innerHTML = `<div class="box" style="margin-top:14px"><p style="margin:0 0 6px"><b>${ok ? 'Richtig.' : card.q || card.gen ? 'Nein.' : 'Nein – ' + esc(card.term) + '.'}</b></p>
          ${rest.map(([l, v]) => `<div class="lab sm">${l}</div><div class="def">${rich(v)}</div>`).join('')}</div>
          <button class="btn primary" id="next">Weiter</button>`;
        $('#next').onclick = () => { sess.pos++; render(); window.scrollTo(0, 0); };
        $('#after').scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    } else { // flash: erst im Kopf antworten, dann aufdecken und selbst bewerten
      const prompt = card.q ? `<div class="qtext">${rich(card.q)}</div>` : `<div class="big">${rich(card.term)}</div>`;
      // ql gilt beim Aufdecken nur für Frage-Karten und reine Aufdeck-Karten – sonst passt die MC-Frage nicht zum gezeigten Begriff
      const askLine = (card.q || card.noMC) && card.ql ? card.ql : card.q ? 'Antwort?' : card.deck === 'stil' ? 'Definition + Beispiel + Wirkung?' : 'Was bedeutet das?';
      app.innerHTML = head + `
        <div class="qcard" id="qc"><div class="q">${esc(askLine)} ${tag}</div>
          ${prompt}
          <div class="answer" id="ans" style="display:none">
          ${card.q ? lab('Antwort', card.term, 'ans') : ''}
          ${lab(card.q ? 'Erklärung' : 'Definition', card.def)}
          ${lab('Beispiel', card.ex, 'ex')}
          ${lab(isPh ? 'Merke' : 'Wirkung / Merke', card.fx)}</div></div>
        <div id="ctl"><button class="btn primary" id="reveal">Aufdecken</button><p class="muted small center" style="margin-top:10px">Erst im Kopf antworten${isPh ? ' (oder auf Papier)' : ''}. Dann aufdecken.</p></div>`;
      $('#reveal').onclick = () => {
        $('#ans').style.display = '';
        $('#ctl').innerHTML = `<p class="muted small center" style="margin-bottom:8px">Wie gut wusstest du es?</p><div class="rate">
          <button class="r1" data-r="1">Nicht<small>nochmal</small></button><button class="r2" data-r="2">Schwer<small>bald</small></button>
          <button class="r3" data-r="3">Gut<small>später</small></button><button class="r4" data-r="4">Leicht<small>viel später</small></button></div>`;
        $('.rate').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; record(it, +b.dataset.r); sess.pos++; render(); window.scrollTo(0, 0); });
      };
    }
    $('#quit').onclick = () => { if (sess.done === 0 || confirm('Abfrage beenden? Bisherige Antworten sind gespeichert.')) go('home'); };
  }

  const FACTS = [
    ['Testing-Effekt', 'Sich abfragen lassen bringt deutlich mehr als nochmal lesen – auch wenn es sich schwerer anfühlt. (Roediger & Karpicke, 2006)'],
    ['Spacing-Effekt', 'Wiederholung mit Abstand hält viel länger als dieselbe Zeit am Stück. Genau deshalb kommt jede Karte erst wieder, wenn du sie fast vergessen hättest. (Cepeda et al., 2006)'],
    ['Interleaving', 'Gemischte Themen in einer Runde trainieren das Unterscheiden – Metapher oder Metonymie? Influenz oder Polarisation? – besser als Blöcke. (Rohrer & Taylor, 2007)'],
    ['Fehler sind Training', 'Ein falscher Abrufversuch schwächt nichts. Er macht die richtige Antwort danach haltbarer. (Kornell, Hays & Bjork, 2009)'],
    ['Vergessenskurve', 'Ohne Wiederholung ist nach einem Tag ein Großteil weg. Jede Wiederholung flacht die Kurve ab – dauerhaft. (Ebbinghaus, 1885)'],
    ['Wenn-Dann-Pläne', 'Ein konkreter Auslöser („Wenn ich im Bus sitze …“) verdoppelt die Umsetzungsquote gegenüber einem bloßen Vorsatz. (Gollwitzer & Sheeran, 2006)'],
    ['Kleine Dosis', 'Zehn Minuten täglich schlagen zwei Stunden am Sonntag – für Gedächtnis UND Gewohnheit. Die Gewohnheit entsteht durch Wiederholung des Auslösers, nicht durch Willenskraft. (Lally et al., 2010)'],
    ['Rechnen statt lesen', 'Physik lernt man wie Mathe: Aufgaben selbst lösen, nicht Lösungen anschauen. Die Zufallsaufgaben haben jedes Mal neue Zahlen – auswendig lernen geht nicht.'],
  ];
  function renderDone() {
    const pct = sess.done ? Math.round(sess.correct / sess.done * 100) : 0;
    const f = FACTS[Math.floor(Math.random() * FACTS.length)];
    const k = sess.k, h = H(today(), k), other = Object.keys(SUBJ).find(x => x !== k);
    const msg = pct >= 90 ? 'Sauber.' : pct >= 70 ? 'Solide. Die Wackler kommen morgen wieder.' : pct >= 50 ? 'Okay – die Hälfte sitzt noch nicht. Morgen nochmal.' : 'Schwerer Tag. Genau dafür ist die App da: Die Karten kommen wieder, bis sie sitzen.';
    app.innerHTML = `
      <div class="box center"><div class="emoji">${pct >= 70 ? '✅' : '🔁'}</div>
        <h1>${sess.done} Karten</h1><p class="muted">${pct} % richtig · ${msg}</p>
        <div class="stats3" style="margin-top:14px"><div class="stat"><b>${h.r}</b><span>heute</span></div><div class="stat"><b>${streak()}</b><span>Serie</span></div><div class="stat"><b>${dueCards(k).length}</b><span>noch fällig</span></div></div>
      </div>
      <div class="fact"><b>${f[0]}</b>${f[1]}</div>
      <div style="margin-top:14px">
        ${todo(k) ? `<button class="btn primary" id="more">Weiter abfragen</button>` : todo(other) ? `<button class="btn primary" id="switch">Weiter mit ${SUBJ[other].name} · ${todo(other)}</button>` : `<button class="btn" id="extra">Extra-Runde</button>`}
        <button class="btn ghost" id="home">Fertig für heute</button></div>`;
    const m = $('#more'); if (m) m.onclick = () => startSession();
    const sw = $('#switch'); if (sw) sw.onclick = () => { S.set.cur = other; save(); sess = null; startSession(); };
    const x = $('#extra'); if (x) x.onclick = () => startSession({ extra: true });
    $('#home').onclick = () => go('home');
  }

  /* Lexikon – auch als Formelsammlung */
  let lexQ = '', lexOpen = {};
  const STATE_NAME = ['aus', '', 'Fokus'];
  function renderLex() {
    const k = K(), cs = cur().cards;
    app.innerHTML = `${subjSwitch(false)}<h1 style="margin-top:14px">Lexikon</h1><p class="muted">Alle ${cs.length} ${cur().name}-Karten zum Nachschlagen – auch vor der Klausur.</p>
      <p><input type="search" id="q" placeholder="${k === 'ph' ? 'Suchen … (z. B. Kapazität, Elektron, Lorentz)' : 'Suchen … (z. B. Chiasmus, Brecht, Faktenargument)'}" value="${esc(lexQ)}"></p><div id="list"></div>`;
    const list = $('#list');
    const hay = c => [c.term, c.q, c.def, c.ex, (c.exs || []).join(' '), c.fx].join(' ').toLowerCase();
    const draw = () => {
      const q = lexQ.trim().toLowerCase();
      list.innerHTML = cur().decks.map(d => {
        const cards = cs.filter(c => c.deck === d.id && (!q || hay(c).includes(q)));
        if (!cards.length) return '';
        const open = q || lexOpen[d.id];
        const all = cs.filter(c => c.deck === d.id), seen = all.filter(c => S.cards[c.id]).length, ms = all.filter(c => S.cards[c.id] && S.cards[c.id].i >= 21).length;
        const st = conf().decks[d.id];
        return `<div class="box decklist"><div class="row between" data-deck="${d.id}" style="cursor:pointer"><div><b>${d.name}</b>${STATE_NAME[st] ? ` <span class="pill${st === 2 ? ' focus' : ''}">${STATE_NAME[st]}</span>` : ''}<div class="muted small">${all.length} Karten · ${seen} gesehen · ${ms} sitzen</div></div><span class="muted">${open ? '▾' : '▸'}</span></div>
          ${open ? `${q ? '' : `<button class="btn ghost practice" data-practice="${d.id}">Nur dieses Thema üben</button>`}<div style="margin-top:8px">${cards.map(c => {
            const s = S.cards[c.id]; const cls = !s ? '' : s.i >= 21 ? 's2' : 's1';
            const short = c.q && !c.gen && c.term.length < 110 && !c.term.includes('\n');
            const title = c.q ? `<span>${rich(c.q)}${short ? `<span class="sub">${rich(c.term)}</span>` : ''}</span>` : `<span>${rich(c.term)}</span>`;
            return `<div class="cardrow${q ? ' open' : ''}" data-id="${c.id}"><div class="t">${title}<span class="dot ${cls}"></span></div>
            <div class="body">${c.gen ? `<div class="muted small">Zufallsaufgabe – jedes Mal neue Zahlen.</div>` : ''}${c.q && !c.gen && !short ? `<div class="ans">${rich(c.term)}</div>` : ''}${c.def && !c.q ? `<div>${rich(c.def)}</div>` : c.def ? `<div class="muted">${rich(c.def)}</div>` : ''}${c.ex ? `<div class="muted" style="margin-top:4px"><i>${rich(c.ex)}</i></div>` : ''}${c.exs && c.exs.length ? `<div class="muted small" style="margin-top:4px">Weitere Beispiele: ${c.exs.map(rich).join(' · ')}</div>` : ''}${c.fx ? `<div class="muted" style="margin-top:4px">${rich(c.fx)}</div>` : ''}${s ? `<div class="small muted" style="margin-top:6px">Nächste Abfrage: ${s.due.split('-').reverse().join('.')} · Intervall ${s.i} Tage</div>` : ''}</div></div>`;
          }).join('')}</div>` : ''}</div>`;
      }).join('') || '<p class="muted center">Nichts gefunden.</p>';
    };
    draw();
    $('#q').addEventListener('input', e => { lexQ = e.target.value; draw(); });
    list.addEventListener('click', e => {
      const p = e.target.closest('[data-practice]'); if (p) { startSession({ deck: p.dataset.practice }); return; }
      const dh = e.target.closest('[data-deck]'); if (dh) { lexOpen[dh.dataset.deck] = !lexOpen[dh.dataset.deck]; draw(); return; }
      const r = e.target.closest('.cardrow'); if (r) r.classList.toggle('open');
    });
  }

  /* Verlauf */
  function renderStats() {
    const k = K();
    const days = [...new Set(Object.keys(SUBJ).flatMap(x => Object.keys(S.hist[x])))].filter(d => dayTotal(d) > 0).sort();
    const sub = d => S.hist[k][d] || { r: 0, c: 0 };
    const last7 = [...Array(7)].map((_, i) => sub(addDays(today(), -i)));
    const r7 = last7.reduce((a, h) => a + h.r, 0), c7 = last7.reduce((a, h) => a + h.c, 0);
    const totalR = Object.values(S.hist[k]).reduce((a, h) => a + h.r, 0);
    let best = 0, cur_ = 0, prev = null;
    days.forEach(d => { cur_ = prev && addDays(prev, 1) === d ? cur_ + 1 : 1; best = Math.max(best, cur_); prev = d; });
    app.innerHTML = `${subjSwitch(false)}<h1 style="margin-top:14px">Verlauf</h1>
      <div class="stats3"><div class="stat"><b>${streak()}</b><span>aktuelle Serie</span></div><div class="stat"><b>${best}</b><span>längste Serie</span></div><div class="stat"><b>${days.length}</b><span>Lerntage</span></div></div>
      <div class="stats3" style="margin-top:10px"><div class="stat"><b>${totalR}</b><span>Antworten ${cur().name}</span></div><div class="stat"><b>${r7 ? Math.round(c7 / r7 * 100) : 0} %</b><span>richtig · 7 Tage</span></div><div class="stat"><b>${mastered()}</b><span>sitzen</span></div></div>
      <h2>Letzte 26 Wochen</h2>${heatmap(26)}
      <p class="muted small">Ein Feld = ein Tag, beide Fächer zusammen. Dunkler = mehr Karten. Lücken sind kein Drama – die Karten warten.</p>
      <h2>${cur().name} nach Thema</h2>
      ${cur().decks.map(d => { const all = cur().cards.filter(c => c.deck === d.id); const seen = all.filter(c => S.cards[c.id]).length; const ms = all.filter(c => S.cards[c.id] && S.cards[c.id].i >= 21).length; const st = conf().decks[d.id];
        return `<div class="box" style="padding:12px 16px${st ? '' : ';opacity:.55'}"><div class="row between"><b>${d.name}</b><span class="muted small">${ms}/${all.length} sitzen${st ? '' : ' · aus'}</span></div>
          <div class="progress" style="margin-top:8px;position:relative"><i style="width:${seen / all.length * 100}%;background:${d.color};opacity:.35;position:absolute"></i><i style="width:${ms / all.length * 100}%;background:${d.color};position:absolute"></i></div></div>`; }).join('')}
      <p class="muted small">Blass = gesehen, kräftig = sitzt (Intervall ≥ 21 Tage).</p>`;
  }

  /* Einstellungen */
  function renderSettings() {
    const k = K(), c = conf();
    const standalone = window.navigator.standalone || matchMedia('(display-mode: standalone)').matches;
    const npd = [...new Set([3, 5, 6, 8, 12, c.newPerDay])].sort((a, b) => a - b), goals = [...new Set([8, 12, 15, 20, 30, c.goal])].sort((a, b) => a - b);
    app.innerHTML = `${subjSwitch(false)}<h1 style="margin-top:14px">Mehr</h1>
      ${!standalone ? `<div class="box" style="border-color:var(--accent)"><b>Als App installieren</b><p class="muted small" style="margin:4px 0 0">iPhone: Teilen-Symbol → „Zum Home-Bildschirm“. Dann läuft sie offline wie eine echte App.</p></div>` : ''}
      <div class="box"><b>${cur().name}: neue Karten pro Tag</b><p class="muted small">Weniger ist mehr: Was du neu lernst, kommt in den nächsten Tagen mehrfach zurück.</p>
        <div class="seg" id="npd">${npd.map(n => `<button class="${c.newPerDay === n ? 'on' : ''}" data-v="${n}">${n}</button>`).join('')}</div></div>
      <div class="box"><b>${cur().name}: Tagesziel (Antworten)</b><div class="seg" id="goal" style="margin-top:8px">${goals.map(n => `<button class="${c.goal === n ? 'on' : ''}" data-v="${n}">${n}</button>`).join('')}</div></div>
      <div class="box"><b>${cur().name}: Themen</b><p class="muted small">Fokus = neue Karten kommen dreimal so oft. Aus = Thema pausiert (auch keine Wiederholungen), Fortschritt bleibt erhalten.</p>
        <div id="decks">${cur().decks.map(d => `<div class="toggle col"><span>${d.name} <span class="muted small">(${cur().cards.filter(x => x.deck === d.id).length})</span></span>
          <div class="seg tri" data-d="${d.id}">${['Aus', 'Normal', 'Fokus'].map((l, i) => `<button class="${c.decks[d.id] === i ? 'on' : ''}" data-v="${i}">${l}</button>`).join('')}</div></div>`).join('')}</div></div>
      <div class="box"><b>Wenn-Dann-Plan</b><p style="margin:8px 0"><input type="text" id="ifthen" placeholder="Wenn ich …" value="${esc(S.set.ifthen)}"></p><p class="muted small">… dann mache ich meine Abfrage. Tipp: Dazu eine tägliche Erinnerung in der Erinnerungen-App zur gleichen Uhrzeit.</p></div>
      <div class="box"><b>Daten</b><p class="muted small">Alles liegt nur auf diesem Gerät. Export = Sicherung als Textdatei (beide Fächer).</p>
        <button class="btn" id="exp">Fortschritt exportieren</button>
        <button class="btn" id="impBtn">Fortschritt importieren</button><input type="file" id="imp" accept="application/json" style="display:none">
        <button class="btn ghost" id="reset" style="color:var(--bad)">Fortschritt zurücksetzen</button></div>
      <p class="muted small center">Abi-Trainer · Deutsch ${CARDS.length} + Physik ${CARDS_PH.length} Karten · Lehrplan Bayern 12/13 · Spaced Repetition (SM-2)</p>`;
    $('#npd').onclick = e => { const b = e.target.closest('button'); if (b) { c.newPerDay = +b.dataset.v; save(); render(); } };
    $('#goal').onclick = e => { const b = e.target.closest('button'); if (b) { c.goal = +b.dataset.v; save(); render(); } };
    $('#decks').onclick = e => {
      const b = e.target.closest('button'), g = e.target.closest('.tri'); if (!b || !g) return;
      const v = +b.dataset.v, d = g.dataset.d, prev = c.decks[d];
      c.decks[d] = v;
      if (!Object.values(c.decks).some(x => x > 0)) c.decks[d] = prev; // mindestens ein Thema bleibt an
      save(); render();
    };
    $('#ifthen').addEventListener('change', e => { S.set.ifthen = e.target.value.trim(); save(); });
    $('#exp').onclick = () => { const blob = new Blob([JSON.stringify(S)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `abi-trainer-${today()}.json`; a.click(); };
    $('#impBtn').onclick = () => $('#imp').click();
    $('#imp').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(txt => { try { const s = JSON.parse(txt); if (!s.cards || !s.hist) throw 0; S = s.v === 2 ? normalize(s) : migrate(s); S.set.onboarded = true; S.news = NEWS; save(); alert('Import fertig.'); render(); } catch { alert('Datei nicht lesbar.'); } }); };
    $('#reset').onclick = () => { if (confirm('Wirklich alles zurücksetzen – beide Fächer? Serie und Karten-Fortschritt gehen verloren.')) { const s = defaults(); s.set.ifthen = S.set.ifthen; s.set.onboarded = true; s.news = NEWS; S = s; save(); render(); } };
  }

  /* ───────── Start ───────── */
  render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
