/* Deutsch-Trainer – Logik
 * Spaced Repetition (vereinfachtes SM-2), Active Recall, Interleaving, Wenn-Dann-Plan.
 * Alles lokal in localStorage – keine Server, keine Accounts.
 */
(() => {
  const KEY = 'dt_state_v1';
  const $ = sel => document.querySelector(sel);
  const app = $('#app');
  const tabbar = $('#tabbar');

  /* ───────── Hilfen ───────── */
  const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const deckOf = id => DECKS.find(d => d.id === id);
  const cardById = id => CARDS.find(c => c.id === id);

  /* ───────── State ───────── */
  const defaults = () => ({
    v: 1, cards: {}, hist: {},
    set: { newPerDay: 5, goal: 12, decks: Object.fromEntries(DECKS.map(d => [d.id, true])), ifthen: '', onboarded: false },
  });
  let S = load();
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw); const d = defaults(); s.set = Object.assign(d.set, s.set || {}); s.set.decks = Object.assign(d.set.decks, s.set.decks || {}); s.cards = s.cards || {}; s.hist = s.hist || {}; return s; } } catch (e) {}
    return defaults();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  const H = day => (S.hist[day] = S.hist[day] || { r: 0, c: 0, n: 0 });

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
  const enabled = () => CARDS.filter(c => S.set.decks[c.deck]);
  const dueCards = () => enabled().filter(c => S.cards[c.id] && S.cards[c.id].due <= today());
  const newCards = () => enabled().filter(c => !S.cards[c.id]);
  const newAllowed = () => Math.max(0, S.set.newPerDay - H(today()).n);
  const mastered = () => enabled().filter(c => S.cards[c.id] && S.cards[c.id].i >= 21).length;

  function streak() {
    let d = today(), n = 0;
    if (!(S.hist[d] && S.hist[d].r > 0)) d = addDays(d, -1);
    while (S.hist[d] && S.hist[d].r > 0) { n++; d = addDays(d, -1); }
    return n;
  }

  /* ───────── Fragen ───────── */
  // Verrät der Fragetext den Begriff? Dann keine Multiple Choice.
  function leaks(card, text) {
    const t = text.toLowerCase();
    return card.term.toLowerCase().replace(/[^a-zäöüß ]/g, ' ').split(/\s+/).filter(w => w.length >= 4)
      .some(w => t.includes(w.slice(0, 5)));
  }
  // Mögliche Fragetexte: Stilmittel → Beispiel; Epochen → Autoren/Werke oder Kennzeichen; sonst Definition
  function questionTexts(card) {
    const cand = card.deck === 'stil' ? [card.ex] : card.deck === 'epochen' ? [card.ex, card.def] : [card.def];
    return cand.filter(t => t && !leaks(card, t));
  }
  function questionText(card) { const q = questionTexts(card); return q[Math.floor(Math.random() * q.length)]; }
  function canMC(card) {
    const pool = CARDS.filter(c => c.deck === card.deck && c.id !== card.id);
    return pool.length >= 3 && questionTexts(card).length > 0;
  }
  function mcOptions(card) {
    const pool = shuffle(CARDS.filter(c => c.deck === card.deck && c.id !== card.id)).slice(0, 3);
    return shuffle([card, ...pool]);
  }

  /* ───────── Session ───────── */
  let sess = null;
  function buildSession({ extra = false } = {}) {
    const items = [];
    if (extra) {
      const seen = enabled().filter(c => S.cards[c.id]);
      const pool = seen.length >= 6 ? seen : enabled();
      shuffle(pool).slice(0, 10).forEach(card => items.push({ card, mode: canMC(card) && Math.random() < 0.7 ? 'mc' : 'flash' }));
    } else {
      shuffle(dueCards()).slice(0, 25).forEach(card => items.push({ card, mode: canMC(card) && Math.random() < 0.65 ? 'mc' : 'flash' }));
      // Neue Karten reihum über die Decks verteilt (Interleaving)
      const byDeck = {}; newCards().forEach(c => (byDeck[c.deck] = byDeck[c.deck] || []).push(c));
      const decks = shuffle(Object.keys(byDeck)); const fresh = [];
      let k = 0; while (fresh.length < newAllowed() && decks.some(d => byDeck[d].length)) { const d = decks[k++ % decks.length]; if (byDeck[d].length) fresh.push(byDeck[d].shift()); }
      fresh.forEach((card, idx) => items.splice(Math.min(items.length, idx * 3), 0, { card, mode: 'learn' }));
    }
    sess = { items, pos: 0, done: 0, correct: 0, extra, requeued: {} };
  }
  function requeue(card) {
    const n = sess.requeued[card.id] || 0;
    if (n >= 2) return;
    sess.requeued[card.id] = n + 1;
    sess.items.push({ card, mode: n === 0 && canMC(card) ? 'mc' : 'flash' });
  }
  function record(card, rating) {
    const t = today(), h = H(t);
    h.r++; if (rating >= 3) { h.c++; sess.correct++; }
    sess.done++;
    rate(card.id, rating, { extra: sess.extra });
    if (rating === 1) requeue(card);
    save();
  }

  /* ───────── Views ───────── */
  let view = 'home';
  function go(v) { view = v; sess = null; document.body.classList.remove('session'); tabbar.classList.remove('hidden'); render(); window.scrollTo(0, 0); }
  tabbar.addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(b.dataset.view); });

  function render() {
    tabbar.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    if (!S.set.onboarded) return renderOnboarding();
    if (sess) return renderSession();
    ({ home: renderHome, lex: renderLex, stats: renderStats, settings: renderSettings })[view]();
  }

  /* Onboarding: Wenn-Dann-Plan (Gollwitzer) */
  function renderOnboarding() {
    tabbar.classList.add('hidden');
    const presets = ['Wenn ich morgens im Bus sitze', 'Wenn ich das Mathe-Blatt fertig habe', 'Wenn ich abends die Zähne geputzt habe', 'Wenn ich in der Pause aufs Handy schaue'];
    app.innerHTML = `
      <h1>Deutsch-Trainer</h1>
      <p class="muted">${CARDS.length} Karten: Stilmittel, Lyrik, Epik, Drama, Epochen, Kommunikation, Aufsatz. Nach dem Lehrplan Deutsch 12/13.</p>
      <div class="box">
        <p><b>So funktioniert es</b></p>
        <p class="muted">Jeden Tag ein paar Minuten. Die App fragt dich ab (nicht du liest nach) und zeigt dir jede Karte genau dann wieder, wenn du sie fast vergessen hättest. Das ist der Unterschied zwischen „vor der Schulaufgabe neu lernen“ und „sitzt“.</p>
      </div>
      <div class="box">
        <p><b>Dein Wenn-Dann-Plan</b></p>
        <p class="muted">Ein fester Auslöser verdoppelt die Chance, dass du es wirklich machst (Gollwitzer). Wähle oder tippe deinen:</p>
        <div class="opts" id="presets">${presets.map(p => `<button class="opt">${p}</button>`).join('')}</div>
        <p style="margin-top:12px"><input type="text" id="ifthen" placeholder="Wenn ich … " value="${esc(S.set.ifthen)}"></p>
        <p class="muted small">… dann mache ich meine Deutsch-Abfrage.</p>
      </div>
      <button class="btn primary" id="start">Los geht's</button>`;
    $('#presets').addEventListener('click', e => { const b = e.target.closest('.opt'); if (b) $('#ifthen').value = b.textContent; });
    $('#start').onclick = () => { S.set.ifthen = $('#ifthen').value.trim(); S.set.onboarded = true; save(); go('home'); };
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
    // Spalte = Woche, Zeile = Wochentag (Mo oben)
    const dow = (new Date(t + 'T12:00:00').getDay() + 6) % 7; // Mo=0
    const start = addDays(t, -(total - 1) + (6 - dow)); // so dass heute in der letzten Spalte steht
    for (let i = 0; i < total; i++) {
      const d = addDays(start, i); if (d > t) { cells.push('<i style="visibility:hidden"></i>'); continue; }
      const h = S.hist[d]; const r = h ? h.r : 0;
      const lvl = r === 0 ? '' : r < 5 ? 'l1' : r < 12 ? 'l2' : r < 20 ? 'l3' : 'l4';
      cells.push(`<i class="${lvl}${d === t ? ' today' : ''}" title="${d}: ${r}"></i>`);
    }
    setTimeout(() => document.querySelectorAll('.heat').forEach(h => { h.scrollLeft = h.scrollWidth; }), 0);
    return `<div class="heat">${cells.join('')}</div>`;
  }

  function renderHome() {
    const t = today(), h = H(t), due = dueCards().length, fresh = Math.min(newAllowed(), newCards().length);
    const st = streak(); const total = due + fresh;
    const wd = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][new Date().getDay()];
    app.innerHTML = `
      <div class="row between"><div><h1>Heute</h1><p class="muted">${wd}, ${t.split('-').reverse().join('.')}</p></div>
        <div class="stat" style="min-width:86px"><b>${st}</b><span>Tage in Folge</span></div></div>
      <div class="box center">
        ${ring(h.r, S.set.goal)}
        <p class="muted">${h.r >= S.set.goal ? 'Tagesziel erreicht. Stark.' : h.r > 0 ? `Noch ${S.set.goal - h.r} bis zum Tagesziel.` : 'Noch nichts gemacht heute.'}</p>
        ${total > 0
          ? `<button class="btn primary" id="start">Abfrage starten <span style="font-weight:400;opacity:.85">· ${due} fällig${fresh ? ` + ${fresh} neu` : ''}</span></button>`
          : `<button class="btn" id="extra">Extra-Runde (10 Karten)</button><p class="muted small" style="margin-top:8px">Nichts mehr fällig. Morgen geht's weiter.</p>`}
        ${total > 0 && h.r > 0 ? `<button class="btn ghost" id="extra">Extra-Runde</button>` : ''}
      </div>
      <div class="stats3">
        <div class="stat"><b>${due}</b><span>fällig</span></div>
        <div class="stat"><b>${Object.keys(S.cards).length}</b><span>gesehen</span></div>
        <div class="stat"><b>${mastered()}</b><span>sitzen</span></div>
      </div>
      ${S.set.ifthen ? `<div class="box ifthen"><p class="small muted" style="margin:0">Dein Plan</p><p style="margin:0"><b>${esc(S.set.ifthen)}</b>, dann mache ich meine Deutsch-Abfrage.</p></div>` : ''}
      <h2>Letzte 12 Wochen</h2>
      ${heatmap(12)}`;
    const s = $('#start'); if (s) s.onclick = () => startSession();
    const x = $('#extra'); if (x) x.onclick = () => startSession({ extra: true });
  }

  function startSession(opts) {
    buildSession(opts);
    if (!sess.items.length) { sess = null; return; }
    document.body.classList.add('session'); tabbar.classList.add('hidden');
    render(); window.scrollTo(0, 0);
  }

  function renderSession() {
    const it = sess.items[sess.pos];
    if (!it) return renderDone();
    const card = it.card, deck = deckOf(card.deck);
    const prog = Math.round(sess.pos / sess.items.length * 100);
    const head = `<div class="topbar"><button class="x" id="quit">×</button><div class="grow"><div class="progress"><i style="width:${prog}%"></i></div></div><span class="muted small">${sess.pos + 1}/${sess.items.length}</span></div>`;
    const tag = `<span class="pill deck" style="background:${deck.color}">${deck.short}</span>`;

    if (it.mode === 'learn') {
      app.innerHTML = head + `
        <div class="qcard"><div class="q"><span class="newtag">Neu</span> · ${deck.name}</div>
          <div class="big">${esc(card.term)}</div>
          <div class="answer"><div class="lab">Definition</div><div class="def">${esc(card.def)}</div>
          ${card.ex ? `<div class="lab">Beispiel</div><div class="ex">${esc(card.ex)}</div>` : ''}
          ${card.fx ? `<div class="lab">Wirkung / Merke</div><div class="def">${esc(card.fx)}</div>` : ''}</div></div>
        <button class="btn primary" id="ok">Gemerkt – gleich abfragen</button>`;
      $('#ok').onclick = () => { S.cards[card.id] = { e: 2.5, i: 0, due: today(), n: 0, l: 0 }; H(today()).n++; save(); sess.items.push({ card, mode: canMC(card) ? 'mc' : 'flash' }); sess.pos++; render(); };
    } else if (it.mode === 'mc') {
      const opts = mcOptions(card);
      it.q = it.q || questionText(card);
      const isEx = it.q === card.ex;
      app.innerHTML = head + `
        <div class="qcard"><div class="q">${deck.q} ${tag}</div>
          <div class="${isEx ? 'ex' : 'def'}">${esc(it.q)}</div></div>
        <div class="opts">${opts.map(o => `<button class="opt" data-id="${o.id}">${esc(o.term)}</button>`).join('')}</div>
        <div id="after"></div>`;
      $('.opts').addEventListener('click', e => {
        const b = e.target.closest('.opt'); if (!b || b.disabled) return;
        const ok = b.dataset.id === card.id;
        document.querySelectorAll('.opt').forEach(o => { o.disabled = true; if (o.dataset.id === card.id) o.classList.add('correct'); else if (o === b) o.classList.add('wrong'); });
        record(card, ok ? 3 : 1);
        const rest = [isEx ? ['Definition', card.def] : card.ex ? ['Beispiel', card.ex] : null, card.fx ? ['Wirkung / Merke', card.fx] : null].filter(Boolean);
        $('#after').innerHTML = `<div class="box" style="margin-top:14px"><p style="margin:0 0 6px"><b>${ok ? 'Richtig.' : 'Nein – ' + esc(card.term) + '.'}</b></p>
          ${rest.map(([l, v]) => `<div class="lab" style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-top:8px">${l}</div><div class="def">${esc(v)}</div>`).join('')}</div>
          <button class="btn primary" id="next">Weiter</button>`;
        $('#next').onclick = () => { sess.pos++; render(); window.scrollTo(0, 0); };
        if (!ok) $('#after').scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    } else { // flash
      const stil = card.deck === 'stil';
      app.innerHTML = head + `
        <div class="qcard" id="qc"><div class="q">${stil ? 'Definition + Beispiel + Wirkung?' : 'Was bedeutet das?'} ${tag}</div>
          <div class="big">${esc(card.term)}</div>
          <div class="answer" id="ans" style="display:none"><div class="lab">Definition</div><div class="def">${esc(card.def)}</div>
          ${card.ex ? `<div class="lab">Beispiel</div><div class="ex">${esc(card.ex)}</div>` : ''}
          ${card.fx ? `<div class="lab">Wirkung / Merke</div><div class="def">${esc(card.fx)}</div>` : ''}</div></div>
        <div id="ctl"><button class="btn primary" id="reveal">Aufdecken</button><p class="muted small center" style="margin-top:10px">Erst im Kopf antworten. Dann aufdecken.</p></div>`;
      $('#reveal').onclick = () => {
        $('#ans').style.display = '';
        $('#ctl').innerHTML = `<p class="muted small center" style="margin-bottom:8px">Wie gut wusstest du es?</p><div class="rate">
          <button class="r1" data-r="1">Nicht<small>nochmal</small></button><button class="r2" data-r="2">Schwer<small>bald</small></button>
          <button class="r3" data-r="3">Gut<small>später</small></button><button class="r4" data-r="4">Leicht<small>viel später</small></button></div>`;
        $('.rate').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; record(card, +b.dataset.r); sess.pos++; render(); window.scrollTo(0, 0); });
      };
    }
    $('#quit').onclick = () => { if (sess.done === 0 || confirm('Abfrage beenden? Bisherige Antworten sind gespeichert.')) go('home'); };
  }

  const FACTS = [
    ['Testing-Effekt', 'Sich abfragen lassen bringt deutlich mehr als nochmal lesen – auch wenn es sich schwerer anfühlt. (Roediger & Karpicke, 2006)'],
    ['Spacing-Effekt', 'Wiederholung mit Abstand hält viel länger als dieselbe Zeit am Stück. Genau deshalb kommt jede Karte erst wieder, wenn du sie fast vergessen hättest. (Cepeda et al., 2006)'],
    ['Interleaving', 'Gemischte Themen in einer Runde trainieren das Unterscheiden – Metapher oder Metonymie? – besser als Blöcke. (Rohrer & Taylor, 2007)'],
    ['Fehler sind Training', 'Ein falscher Abrufversuch schwächt nichts. Er macht die richtige Antwort danach haltbarer. (Kornell, Hays & Bjork, 2009)'],
    ['Vergessenskurve', 'Ohne Wiederholung ist nach einem Tag ein Großteil weg. Jede Wiederholung flacht die Kurve ab – dauerhaft. (Ebbinghaus, 1885)'],
    ['Wenn-Dann-Pläne', 'Ein konkreter Auslöser („Wenn ich im Bus sitze …“) verdoppelt die Umsetzungsquote gegenüber einem bloßen Vorsatz. (Gollwitzer & Sheeran, 2006)'],
    ['Kleine Dosis', 'Fünf Minuten täglich schlagen zwei Stunden am Sonntag – für Gedächtnis UND Gewohnheit. Die Gewohnheit entsteht durch Wiederholung des Auslösers, nicht durch Willenskraft. (Lally et al., 2010)'],
  ];
  function renderDone() {
    const pct = sess.done ? Math.round(sess.correct / sess.done * 100) : 0;
    const f = FACTS[Math.floor(Math.random() * FACTS.length)];
    const h = H(today());
    const msg = pct >= 90 ? 'Sauber.' : pct >= 70 ? 'Solide. Die Wackler kommen morgen wieder.' : pct >= 50 ? 'Okay – die Hälfte sitzt noch nicht. Morgen nochmal.' : 'Schwerer Tag. Genau dafür ist die App da: Die Karten kommen wieder, bis sie sitzen.';
    app.innerHTML = `
      <div class="box center"><div class="emoji">${pct >= 70 ? '✅' : '🔁'}</div>
        <h1>${sess.done} Karten</h1><p class="muted">${pct} % richtig · ${msg}</p>
        <div class="stats3" style="margin-top:14px"><div class="stat"><b>${h.r}</b><span>heute</span></div><div class="stat"><b>${streak()}</b><span>Serie</span></div><div class="stat"><b>${dueCards().length}</b><span>noch fällig</span></div></div>
      </div>
      <div class="fact"><b>${f[0]}</b>${f[1]}</div>
      <div style="margin-top:14px">
        ${dueCards().length || newAllowed() && newCards().length ? `<button class="btn primary" id="more">Weiter abfragen</button>` : `<button class="btn" id="extra">Extra-Runde</button>`}
        <button class="btn ghost" id="home">Fertig für heute</button></div>`;
    const m = $('#more'); if (m) m.onclick = () => startSession();
    const x = $('#extra'); if (x) x.onclick = () => startSession({ extra: true });
    $('#home').onclick = () => go('home');
  }

  /* Lexikon */
  let lexQ = '', lexOpen = {};
  function renderLex() {
    app.innerHTML = `<h1>Lexikon</h1><p class="muted">Alle ${CARDS.length} Karten zum Nachschlagen – auch vor der Schulaufgabe.</p>
      <p><input type="search" id="q" placeholder="Suchen … (z. B. Chiasmus, Brecht, abab)" value="${esc(lexQ)}"></p><div id="list"></div>`;
    const list = $('#list');
    const draw = () => {
      const q = lexQ.trim().toLowerCase();
      list.innerHTML = DECKS.map(d => {
        const cards = CARDS.filter(c => c.deck === d.id && (!q || [c.term, c.def, c.ex, c.fx].join(' ').toLowerCase().includes(q)));
        if (!cards.length) return '';
        const open = q || lexOpen[d.id];
        const seen = CARDS.filter(c => c.deck === d.id && S.cards[c.id]).length, ms = CARDS.filter(c => c.deck === d.id && S.cards[c.id] && S.cards[c.id].i >= 21).length, n = CARDS.filter(c => c.deck === d.id).length;
        return `<div class="box decklist"><div class="row between" data-deck="${d.id}" style="cursor:pointer"><div><b>${d.name}</b><div class="muted small">${n} Karten · ${seen} gesehen · ${ms} sitzen</div></div><span class="muted">${open ? '▾' : '▸'}</span></div>
          ${open ? `<div style="margin-top:8px">${cards.map(c => { const st = S.cards[c.id]; const cls = !st ? '' : st.i >= 21 ? 's2' : 's1'; return `<div class="cardrow${q ? ' open' : ''}" data-id="${c.id}"><div class="t"><span>${esc(c.term)}</span><span class="dot ${cls}"></span></div>
            <div class="body"><div>${esc(c.def)}</div>${c.ex ? `<div class="muted" style="margin-top:4px"><i>${esc(c.ex)}</i></div>` : ''}${c.fx ? `<div class="muted" style="margin-top:4px">${esc(c.fx)}</div>` : ''}${st ? `<div class="small muted" style="margin-top:6px">Nächste Abfrage: ${st.due.split('-').reverse().join('.')} · Intervall ${st.i} Tage</div>` : ''}</div></div>`; }).join('')}</div>` : ''}</div>`;
      }).join('') || '<p class="muted center">Nichts gefunden.</p>';
    };
    draw();
    $('#q').addEventListener('input', e => { lexQ = e.target.value; draw(); });
    list.addEventListener('click', e => {
      const dh = e.target.closest('[data-deck]'); if (dh) { lexOpen[dh.dataset.deck] = !lexOpen[dh.dataset.deck]; draw(); return; }
      const r = e.target.closest('.cardrow'); if (r) r.classList.toggle('open');
    });
  }

  /* Verlauf */
  function renderStats() {
    const days = Object.keys(S.hist).filter(d => S.hist[d].r > 0).sort();
    const last7 = [...Array(7)].map((_, i) => S.hist[addDays(today(), -i)]).filter(Boolean);
    const r7 = last7.reduce((a, h) => a + h.r, 0), c7 = last7.reduce((a, h) => a + h.c, 0);
    const totalR = days.reduce((a, d) => a + S.hist[d].r, 0);
    let best = 0, cur = 0, prev = null;
    days.forEach(d => { cur = prev && addDays(prev, 1) === d ? cur + 1 : 1; best = Math.max(best, cur); prev = d; });
    app.innerHTML = `<h1>Verlauf</h1>
      <div class="stats3"><div class="stat"><b>${streak()}</b><span>aktuelle Serie</span></div><div class="stat"><b>${best}</b><span>längste Serie</span></div><div class="stat"><b>${days.length}</b><span>Lerntage</span></div></div>
      <div class="stats3" style="margin-top:10px"><div class="stat"><b>${totalR}</b><span>Antworten</span></div><div class="stat"><b>${r7 ? Math.round(c7 / r7 * 100) : 0} %</b><span>richtig · 7 Tage</span></div><div class="stat"><b>${mastered()}</b><span>sitzen</span></div></div>
      <h2>Letzte 26 Wochen</h2>${heatmap(26)}
      <p class="muted small">Ein Feld = ein Tag. Dunkler = mehr Karten. Lücken sind kein Drama – die Karten warten.</p>
      <h2>Nach Thema</h2>
      ${DECKS.map(d => { const all = CARDS.filter(c => c.deck === d.id); const seen = all.filter(c => S.cards[c.id]).length; const ms = all.filter(c => S.cards[c.id] && S.cards[c.id].i >= 21).length;
        return `<div class="box" style="padding:12px 16px"><div class="row between"><b>${d.name}</b><span class="muted small">${ms}/${all.length} sitzen</span></div>
          <div class="progress" style="margin-top:8px;position:relative"><i style="width:${seen / all.length * 100}%;background:${d.color};opacity:.35;position:absolute"></i><i style="width:${ms / all.length * 100}%;background:${d.color};position:absolute"></i></div></div>`; }).join('')}
      <p class="muted small">Blass = gesehen, kräftig = sitzt (Intervall ≥ 21 Tage).</p>`;
  }

  /* Einstellungen */
  function renderSettings() {
    const standalone = window.navigator.standalone || matchMedia('(display-mode: standalone)').matches;
    app.innerHTML = `<h1>Mehr</h1>
      ${!standalone ? `<div class="box" style="border-color:var(--accent)"><b>Als App installieren</b><p class="muted small" style="margin:4px 0 0">iPhone: Teilen-Symbol → „Zum Home-Bildschirm“. Dann läuft sie offline wie eine echte App.</p></div>` : ''}
      <div class="box"><b>Neue Karten pro Tag</b><p class="muted small">Weniger ist mehr: Was du neu lernst, kommt in den nächsten Tagen mehrfach zurück.</p>
        <div class="seg" id="npd">${[3, 5, 8, 12].map(n => `<button class="${S.set.newPerDay === n ? 'on' : ''}" data-v="${n}">${n}</button>`).join('')}</div></div>
      <div class="box"><b>Tagesziel (Antworten)</b><div class="seg" id="goal" style="margin-top:8px">${[8, 12, 20, 30].map(n => `<button class="${S.set.goal === n ? 'on' : ''}" data-v="${n}">${n}</button>`).join('')}</div></div>
      <div class="box"><b>Themen</b><div id="decks" style="margin-top:6px">${DECKS.map(d => `<div class="toggle"><span>${d.name} <span class="muted small">(${CARDS.filter(c => c.deck === d.id).length})</span></span><button class="sw ${S.set.decks[d.id] ? 'on' : ''}" data-d="${d.id}"></button></div>`).join('')}</div></div>
      <div class="box"><b>Wenn-Dann-Plan</b><p style="margin:8px 0"><input type="text" id="ifthen" placeholder="Wenn ich …" value="${esc(S.set.ifthen)}"></p><p class="muted small">… dann mache ich meine Deutsch-Abfrage. Tipp: Dazu eine tägliche Erinnerung in der Erinnerungen-App zur gleichen Uhrzeit.</p></div>
      <div class="box"><b>Daten</b><p class="muted small">Alles liegt nur auf diesem Gerät. Export = Sicherung als Textdatei.</p>
        <button class="btn" id="exp">Fortschritt exportieren</button>
        <button class="btn" id="impBtn">Fortschritt importieren</button><input type="file" id="imp" accept="application/json" style="display:none">
        <button class="btn ghost" id="reset" style="color:var(--bad)">Fortschritt zurücksetzen</button></div>
      <p class="muted small center">Deutsch-Trainer · ${CARDS.length} Karten · Lehrplan Bayern D12/13 · Spaced Repetition (SM-2)</p>`;
    $('#npd').onclick = e => { const b = e.target.closest('button'); if (b) { S.set.newPerDay = +b.dataset.v; save(); render(); } };
    $('#goal').onclick = e => { const b = e.target.closest('button'); if (b) { S.set.goal = +b.dataset.v; save(); render(); } };
    $('#decks').onclick = e => { const b = e.target.closest('.sw'); if (b) { S.set.decks[b.dataset.d] = !S.set.decks[b.dataset.d]; if (!Object.values(S.set.decks).some(Boolean)) S.set.decks[b.dataset.d] = true; save(); render(); } };
    $('#ifthen').addEventListener('change', e => { S.set.ifthen = e.target.value.trim(); save(); });
    $('#exp').onclick = () => { const blob = new Blob([JSON.stringify(S)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `deutsch-trainer-${today()}.json`; a.click(); };
    $('#impBtn').onclick = () => $('#imp').click();
    $('#imp').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(txt => { try { const s = JSON.parse(txt); if (!s.cards || !s.hist) throw 0; S = s; S.set = Object.assign(defaults().set, S.set); save(); alert('Import fertig.'); render(); } catch { alert('Datei nicht lesbar.'); } }); };
    $('#reset').onclick = () => { if (confirm('Wirklich alles zurücksetzen? Streak und Karten-Fortschritt gehen verloren.')) { const s = defaults(); s.set.ifthen = S.set.ifthen; s.set.onboarded = true; S = s; save(); render(); } };
  }

  /* ───────── Start ───────── */
  render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
