/* app.js — Zustand, Navigation und alle Bildschirme. */
(function (global) {
  'use strict';

  const h = UI.h;
  const S = UI.Sound;

  /* ------------------------------------------------------- Fortschritt -- */

  const KEY = 'ekg-lernen-v1';
  const DEFAULT_STATE = {
    xp: 0, streak: 0, lastDay: null, done: {}, sound: true, unlockAll: false
  };
  let state = load();

  function load() {
    try {
      const raw = global.localStorage.getItem(KEY);
      if (raw) return Object.assign({}, DEFAULT_STATE, JSON.parse(raw));
    } catch (e) { /* Speicher nicht verfügbar — dann eben ohne */ }
    return Object.assign({}, DEFAULT_STATE);
  }

  function save() {
    try { global.localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { /* egal */ }
  }

  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function bumpStreak() {
    const t = today();
    if (state.lastDay === t) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yd = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate();
    state.streak = (state.lastDay === yd) ? state.streak + 1 : 1;
    state.lastDay = t;
  }

  // Eine Lektion ist offen, wenn die vorherige abgeschlossen ist.
  function unlocked(lessonId) {
    if (state.unlockAll) return true;
    const i = CONTENT.lessonIndex(lessonId);
    if (i <= 0) return true;
    return !!state.done[CONTENT.ALL_LESSONS[i - 1].id];
  }

  function firstOpenLesson() {
    for (const l of CONTENT.ALL_LESSONS) if (!state.done[l.id]) return l.id;
    return CONTENT.ALL_LESSONS[CONTENT.ALL_LESSONS.length - 1].id;
  }

  /* ------------------------------------------------------------- Gerüst -- */

  const app = document.getElementById('app');
  const topStats = document.getElementById('top-stats');
  const nav = document.getElementById('nav');

  // Begleitskript zum Kurs — liegt neben der index.html.
  const SKRIPT_PDF = 'EKG-Skript.pdf';

  function renderTop() {
    topStats.innerHTML = '';
    topStats.appendChild(h('span', { class: 'stat fire',
      html: '<span class="ic">🔥</span>' + state.streak, title: 'Tage in Folge' }));
    topStats.appendChild(h('span', { class: 'stat gold',
      html: '<span class="ic">⭐</span>' + state.xp, title: 'Erfahrungspunkte' }));
    topStats.appendChild(h('button', {
      class: 'iconbtn', title: 'Einstellungen', 'aria-label': 'Einstellungen',
      html: '⚙️', onclick: openSettings
    }));
  }

  function setNav(route) {
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) {
      a.classList.toggle('on', a.getAttribute('data-r') === route);
    });
    nav.style.display = route === 'lektion' ? 'none' : '';
  }

  function screen(cls) {
    UI.clearLive();
    app.innerHTML = '';
    document.body.querySelectorAll('.feedback, .actionbar').forEach(function (e) { e.remove(); });
    const s = h('div', { class: cls || '' });
    app.appendChild(s);
    global.scrollTo(0, 0);
    return s;
  }

  /* ------------------------------------------------------------ Lernpfad */

  function viewPath() {
    setNav('pfad');
    const root = screen();

    const totalDone = Object.keys(state.done).length;
    const total = CONTENT.ALL_LESSONS.length;

    const hero = h('section', { class: 'hero' }, [
      h('h1', { text: totalDone === 0 ? 'EKG verstehen — Schritt für Schritt' : 'Weiter geht\'s!' }),
      h('p', { text: totalDone === 0
        ? 'Von der ersten Welle bis zum Infarkt-EKG: kurze Lektionen, echte Kurven und Übungen, die hängen bleiben.'
        : 'Du hast ' + totalDone + ' von ' + total + ' Lektionen geschafft. Bleib dran — die Streak zählt.' }),
      h('div', { class: 'hero-strip' }, [h('canvas', { id: 'hero-cv' })]),
      h('div', { class: 'hero-actions' }, [
        h('button', { class: 'btn heart', text: totalDone === 0 ? 'Lernen starten' : 'Weiterlernen',
          onclick: function () { location.hash = '#/lektion/' + firstOpenLesson(); } }),
        h('a', { class: 'btn gray', href: SKRIPT_PDF, target: '_blank',
                 rel: 'noopener', style: 'text-decoration:none', html: '📄 Skript (PDF)' }),
        h('button', { class: 'btn gray', text: 'Zum Labor',
          onclick: function () { location.hash = '#/labor'; } })
      ])
    ]);
    root.appendChild(hero);
    requestAnimationFrame(function () {
      const cv = document.getElementById('hero-cv');
      if (cv) UI.track(new EKG.Scope(cv, { rhythm: 'sinus', speed: 25, mvRange: 2.8 }));
    });

    for (const u of CONTENT.UNITS) {
      const doneCount = u.lessons.filter(function (l) { return state.done[l.id]; }).length;
      const unit = h('section', { class: 'unit' });
      unit.style.setProperty('--u', u.color);
      unit.style.setProperty('--u-dk', u.dark);
      unit.style.setProperty('--u-lt', u.light);

      unit.appendChild(h('div', { class: 'unit-head' }, [
        h('div', { class: 'unit-badge', text: u.icon }),
        h('div', {}, [
          h('h3', { text: u.title }),
          h('p', { text: u.sub })
        ]),
        h('div', { class: 'unit-prog', text: doneCount + '/' + u.lessons.length })
      ]));

      const path = h('div', { class: 'path' });
      const sides = ['', 'fr', 'r', 'fr', '', 'fl', 'l', 'fl'];
      u.lessons.forEach(function (l, i) {
        const isDone = !!state.done[l.id];
        const open = unlocked(l.id);
        const isCurrent = open && !isDone;
        const row = h('div', { class: 'path-row', 'data-side': sides[i % sides.length] });
        const btn = h('button', {
          class: 'node' + (isDone ? ' done' : '') + (!open ? ' locked' : '') + (isCurrent ? ' current' : ''),
          type: 'button',
          'aria-label': l.title + (open ? '' : ' (gesperrt)'),
          text: !open ? '🔒' : (isDone ? '⭐' : l.icon)
        });
        btn.addEventListener('click', function () {
          if (!open) { toast('Schließe zuerst die vorherige Lektion ab.'); return; }
          location.hash = '#/lektion/' + l.id;
        });
        row.appendChild(btn);
        btn.appendChild(h('span', { class: 'node-label', text: l.title }));
        path.appendChild(row);
      });
      unit.appendChild(path);
      root.appendChild(unit);
    }

    root.appendChild(h('div', { class: 'sec-head' }, [
      h('h2', { text: 'Zum Mitnehmen' }),
      h('span', { text: 'Das Begleitskript als PDF' })
    ]));
    root.appendChild(h('div', { class: 'pdfcard' }, [
      h('div', { class: 'pdfcover' }, [
        h('span', { class: 'pc-kicker', text: 'KURSSKRIPT' }),
        h('span', { class: 'pc-title', text: 'EKG ++' }),
        h('canvas', { id: 'pdf-cv' })
      ]),
      h('div', { class: 'pdfbody' }, [
        h('h3', { text: 'EKG ++ — das komplette Skript' }),
        h('p', { text: '22 Seiten im selben Design wie diese Seite: alle Bausteine der ' +
                       'Kurve, Rhythmus- und Blockbilder, Ischämiezeichen und eine ' +
                       'Normwert-Übersicht zum Nachschlagen. Zum Ausdrucken und Verteilen.' }),
        h('div', { class: 'taglist' }, [
          h('span', { class: 'tag2 ok', text: '22 Seiten' }),
          h('span', { class: 'tag2', text: '15 Abbildungen' }),
          h('span', { class: 'tag2', text: 'A4, druckfertig' })
        ]),
        h('a', { class: 'btn heart', href: SKRIPT_PDF, target: '_blank', rel: 'noopener',
                 style: 'text-decoration:none;margin-top:16px', html: '📄 Skript öffnen' })
      ])
    ]));
    requestAnimationFrame(function () {
      const cv = document.getElementById('pdf-cv');
      if (cv) UI.track(new EKG.Scope(cv, { rhythm: 'sinus', speed: 25, mvRange: 3.0 }));
    });

    root.appendChild(h('div', { class: 'footer', html:
      'Diese Seite ist ein <b>Lernwerkzeug</b> und ersetzt keine medizinische Ausbildung, ' +
      'Leitlinie oder ärztliche Beurteilung. Die dargestellten Kurven sind rechnerisch erzeugt ' +
      'und idealisiert.' }));
  }

  /* -------------------------------------------------------------- Lektion */

  function viewLesson(id) {
    const lesson = CONTENT.lessonById(id);
    if (!lesson) { location.hash = '#/pfad'; return; }
    if (!unlocked(id)) { location.hash = '#/pfad'; return; }

    setNav('lektion');
    const root = screen();

    let idx = 0, hearts = 5, correct = 0, questions = 0;
    const seedBase = CONTENT.lessonIndex(id) * 101 + 3;

    const bar = h('i');
    const heartsEl = h('div', { class: 'hearts' });
    const top = h('div', { class: 'lesson-top' }, [
      h('button', { class: 'iconbtn', html: '✕', 'aria-label': 'Lektion verlassen',
        onclick: confirmQuit }),
      h('div', { class: 'pbar' }, [bar]),
      heartsEl
    ]);
    root.appendChild(top);

    const stage = h('div', {});
    root.appendChild(stage);

    // Aktionsleiste und Rückmeldung leben ausserhalb des Scroll-Bereichs.
    const actionBtn = h('button', { class: 'btn wide', text: 'Weiter', disabled: 'disabled' });
    const actionBar = h('div', { class: 'actionbar' }, [
      h('div', { class: 'ab-in' }, [
        h('button', { class: 'btn-ghost', text: 'Überspringen', onclick: function () { next(); } }),
        actionBtn
      ])
    ]);
    document.body.appendChild(actionBar);

    const fbIcon = h('div', { class: 'fb-icon' });
    const fbTitle = h('h4', {});
    const fbText = h('p', {});
    const fbBtn = h('button', { class: 'btn ok', text: 'Weiter' });
    const fb = h('div', { class: 'feedback' }, [
      h('div', { class: 'fb-in' }, [
        fbIcon,
        h('div', { class: 'fb-txt' }, [fbTitle, fbText]),
        fbBtn
      ])
    ]);
    document.body.appendChild(fb);

    function drawHearts() {
      heartsEl.innerHTML = '';
      for (let i = 0; i < 5; i++) {
        heartsEl.appendChild(h('b', { class: i < hearts ? '' : 'gone', text: '❤️' }));
      }
    }

    function progress() {
      bar.style.width = Math.round((idx / lesson.steps.length) * 100) + '%';
    }

    let current = null;

    function render() {
      UI.clearLive();
      stage.innerHTML = '';
      fb.classList.remove('show', 'good', 'bad');
      actionBar.style.display = '';
      progress();
      drawHearts();

      const step = lesson.steps[idx];
      const wrap = h('div', { class: 'q-wrap' });
      stage.appendChild(wrap);

      if (step.t === 'teach') {
        current = null;
        UI.buildTeach(step, wrap);
        actionBtn.textContent = 'Verstanden';
        actionBtn.disabled = false;
        actionBtn.className = 'btn wide violet';
        actionBtn.onclick = function () { next(); };
      } else {
        questions++;
        current = UI.buildExercise(step, wrap, seedBase + idx * 17);
        actionBtn.textContent = 'Prüfen';
        actionBtn.disabled = !current.ready;
        actionBtn.className = 'btn wide';
        current.onready = function (r) { actionBtn.disabled = !r; };
        actionBtn.onclick = doCheck;
        if (current.focus) setTimeout(current.focus, 120);
      }
    }

    function doCheck() {
      const step = lesson.steps[idx];
      const ok = current.check();
      actionBar.style.display = 'none';

      if (ok) {
        correct++;
        state.xp += 2;
        S.right();
        fb.classList.add('show', 'good');
        fbIcon.textContent = ['🎉', '💪', '🧠', '⚡', '✨'][Math.floor(Math.random() * 5)];
        fbTitle.textContent = ['Richtig!', 'Sitzt!', 'Sehr gut!', 'Genau!', 'Perfekt!'][Math.floor(Math.random() * 5)];
        fbBtn.className = 'btn ok';
        flyXp('+2');
      } else {
        hearts--;
        drawHearts();
        S.wrong();
        fb.classList.add('show', 'bad');
        fbIcon.textContent = '💡';
        fbTitle.textContent = 'Nicht ganz';
        fbBtn.className = 'btn bad';
      }
      let why = step.why || '';
      if (ok && current.summary) {
        const s = current.summary();
        if (s) why = s + ' ' + why;
      }
      fbText.innerHTML = why;
      fbBtn.textContent = (hearts <= 0) ? 'Weiter' : 'Weiter';
      fbBtn.onclick = function () {
        if (hearts <= 0) { failScreen(); return; }
        next();
      };
      save();
      renderTop();
    }

    function next() {
      idx++;
      if (idx >= lesson.steps.length) { finish(); return; }
      render();
    }

    function finish() {
      const perfect = correct === questions && questions > 0;
      const gain = 10 + (perfect ? 5 : 0);
      state.xp += gain;
      const wasNew = !state.done[lesson.id];
      const prev = state.done[lesson.id] || { best: 0 };
      const acc = questions ? Math.round((correct / questions) * 100) : 100;
      state.done[lesson.id] = { best: Math.max(prev.best || 0, acc) };
      bumpStreak();
      save();
      renderTop();
      S.win();

      UI.clearLive();
      stage.innerHTML = '';
      actionBar.remove();
      fb.remove();
      bar.style.width = '100%';

      const done = h('div', { class: 'done-wrap' }, [
        h('div', { class: 'done-emoji', text: perfect ? '🏆' : '🎉' }),
        h('h1', { text: perfect ? 'Fehlerfrei!' : 'Lektion geschafft!' }),
        h('p', { text: perfect
          ? 'Alle Aufgaben auf Anhieb richtig. Stark.'
          : 'Gut gemacht — Wiederholen festigt das Wissen.' }),
        h('div', { class: 'done-stats' }, [
          dstat('Erfahrung', '+' + gain, '#ffb703'),
          dstat('Treffer', correct + '/' + questions, '#35c759'),
          dstat('Genauigkeit', acc + '%', '#7c5cff')
        ]),
        h('div', { style: 'margin-top:26px; display:flex; gap:10px; justify-content:center; flex-wrap:wrap' }, [
          h('button', { class: 'btn heart', text: 'Weiter zum Pfad',
            onclick: function () { location.hash = '#/pfad'; } }),
          h('button', { class: 'btn gray', text: 'Nochmal üben',
            onclick: function () { idx = 0; hearts = 5; correct = 0; questions = 0; viewLesson(id); } })
        ])
      ]);
      if (wasNew) done.insertBefore(h('div', { class: 'pill-note',
        style: 'max-width:420px;margin:0 auto 18px', html:
        '<span class="bi">🔓</span><span>Die nächste Lektion ist jetzt freigeschaltet.</span>' }), done.children[3]);
      stage.appendChild(done);
    }

    function failScreen() {
      UI.clearLive();
      stage.innerHTML = '';
      actionBar.style.display = 'none';
      fb.classList.remove('show');
      S.fail();
      stage.appendChild(h('div', { class: 'done-wrap' }, [
        h('div', { class: 'done-emoji', text: '💔' }),
        h('h1', { text: 'Herzen aufgebraucht' }),
        h('p', { text: 'Kein Problem — schau dir die Erklärungen noch einmal an und starte neu.' }),
        h('div', { style: 'margin-top:12px; display:flex; gap:10px; justify-content:center; flex-wrap:wrap' }, [
          h('button', { class: 'btn heart', text: 'Lektion neu starten',
            onclick: function () { viewLesson(id); } }),
          h('button', { class: 'btn gray', text: 'Zurück zum Pfad',
            onclick: function () { location.hash = '#/pfad'; } })
        ])
      ]));
    }

    function confirmQuit() {
      if (idx === 0) { location.hash = '#/pfad'; return; }
      modal('Lektion verlassen?', 'Dein Fortschritt in dieser Lektion geht verloren.',
        [{ t: 'Weiterlernen', c: 'btn', f: null },
         { t: 'Verlassen', c: 'btn gray', f: function () { location.hash = '#/pfad'; } }]);
    }

    // Tastatur: Zahlen wählen aus, Enter bestätigt.
    function onKey(e) {
      if (!document.body.contains(stage)) { document.removeEventListener('keydown', onKey); return; }
      if (e.key === 'Enter') {
        if (fb.classList.contains('show')) { e.preventDefault(); fbBtn.click(); }
        else if (!actionBtn.disabled) { e.preventDefault(); actionBtn.click(); }
      } else if (/^[1-9]$/.test(e.key) && document.activeElement.tagName !== 'INPUT') {
        const opts = stage.querySelectorAll('.opt');
        const i = parseInt(e.key, 10) - 1;
        if (opts[i]) opts[i].click();
      }
    }
    document.addEventListener('keydown', onKey);

    render();
  }

  function dstat(label, value, color) {
    const d = h('div', { class: 'dstat' }, [
      h('div', { class: 'in' }, [
        h('div', { class: 't', text: label }),
        h('div', { class: 'v', text: value })
      ])
    ]);
    d.style.setProperty('--c', color);
    return d;
  }

  function flyXp(txt) {
    const e = h('div', { class: 'xp-fly', text: txt });
    e.style.left = (global.innerWidth / 2 - 20) + 'px';
    e.style.top = (global.innerHeight * 0.42) + 'px';
    document.body.appendChild(e);
    setTimeout(function () { e.remove(); }, 1000);
  }

  /* ----------------------------------------------------------- Bibliothek */

  function viewLibrary() {
    setNav('bibliothek');
    const root = screen();
    root.appendChild(h('div', { class: 'sec-head' }, [
      h('h2', { text: 'Nachschlagewerk' }),
      h('span', { text: CONTENT.LIBRARY.length + ' Befunde, alle in Bewegung' })
    ]));

    let active = 'Alle';
    const bar = h('div', { class: 'filterbar' });
    const grid = h('div', { class: 'libgrid' });

    CONTENT.LIB_CATS.forEach(function (c) {
      const b = h('button', { class: 'fchip' + (c === active ? ' on' : ''), text: c });
      b.addEventListener('click', function () {
        active = c;
        Array.prototype.forEach.call(bar.children, function (x) { x.classList.toggle('on', x.textContent === c); });
        fill();
      });
      bar.appendChild(b);
    });

    function fill() {
      UI.clearLive();
      grid.innerHTML = '';
      const items = CONTENT.LIBRARY.filter(function (i) { return active === 'Alle' || i.cat === active; });
      items.forEach(function (item) {
        const cv = h('canvas');
        const card = h('article', { class: 'libcard' }, [
          h('div', { class: 'scope h-sm' }, [cv]),
          h('div', { class: 'body' }, [
            h('div', { class: 'cat', text: item.cat }),
            h('h3', { text: item.name }),
            h('p', { text: item.desc }),
            h('div', { class: 'taglist' }, item.tags.map(function (t) {
              return h('span', { class: 'tag2 ' + (t[1] || ''), text: t[0] });
            }))
          ])
        ]);
        grid.appendChild(card);
        requestAnimationFrame(function () {
          UI.track(new EKG.Scope(cv, { rhythm: item.id, speed: 25, mvRange: 3.4 }));
        });
      });
    }

    root.appendChild(bar);
    root.appendChild(grid);
    fill();
  }

  /* ---------------------------------------------------------------- Labor */

  function viewLab() {
    setNav('labor');
    const root = screen();

    root.appendChild(h('div', { class: 'sec-head' }, [
      h('h2', { text: 'EKG-Labor' }),
      h('span', { text: 'Dreh an den Reglern und sieh zu, was passiert' })
    ]));

    const p = { rate: 70, pq: 0.16, qrs: 1.0, st: 0, t: 0.30, p: 0.14, speed: 25 };

    const cv = h('canvas');
    const scopeBox = h('div', { class: 'scope h-lg' }, [cv]);
    const readout = h('div', { class: 'readout' });

    const controls = h('div', { class: 'card' });
    const left = h('div', {}, [
      scopeBox,
      h('div', { class: 'card', style: 'margin-top:14px' }, [
        h('h3', { style: 'font-size:15px;margin-bottom:10px', text: 'Automatische Auswertung' }),
        readout
      ])
    ]);

    let scope = null;

    function rebuild() {
      const k = p.qrs;
      // QRS-Anteile mitskalieren, T-Welle entsprechend nach hinten schieben.
      const shift = (k - 1) * 0.075;
      EKG.defineCustom('lab', {
        rate: p.rate, pq: p.pq,
        pTpl: { w: 0.026, a: p.p },
        vTpl: {
          q: { c: 0.010 * k, w: 0.008 * k, a: -0.08 },
          r: { c: 0.030 * k, w: 0.012 * k, a: 1.10 },
          s: { c: 0.057 * k, w: 0.011 * k, a: -0.25 },
          t: { c: 0.245 + shift, w: 0.060, a: p.t },
          st: p.st, stEnd: 0.185 + shift
        }
      });
      if (scope) { scope.o.speed = p.speed; scope.refresh(); }
      updateReadout();
    }

    function updateReadout() {
      const qrsMs = Math.round(0.075 * p.qrs * 1000);
      const pqMs = Math.round(p.pq * 1000);
      const qt = 0.245 + (p.qrs - 1) * 0.075 + 0.060 * 1.9;
      const rr = 60 / p.rate;
      const qtc = qt / Math.sqrt(rr);

      const cls = function (v, lo, hi) { return v < lo || v > hi ? 'bad' : 'ok'; };
      readout.innerHTML = '';
      readout.appendChild(ro('Frequenz', p.rate + '/min', cls(p.rate, 60, 100)));
      readout.appendChild(ro('PQ-Zeit', pqMs + ' ms', cls(pqMs, 120, 200)));
      readout.appendChild(ro('QRS', qrsMs + ' ms', qrsMs >= 120 ? 'bad' : (qrsMs > 100 ? 'warn' : 'ok')));
      readout.appendChild(ro('QTc', Math.round(qtc * 1000) + ' ms', qtc > 0.44 ? 'bad' : 'ok'));

      const notes = [];
      if (p.rate < 60) notes.push('Bradykardie');
      if (p.rate > 100) notes.push('Tachykardie');
      if (pqMs > 200) notes.push('AV-Block I°');
      if (pqMs < 120) notes.push('Kurze PQ-Zeit — an Präexzitation denken');
      if (qrsMs >= 120) notes.push('Schenkelblock-Bild (QRS ≥ 120 ms)');
      if (p.st >= 0.15) notes.push('ST-Hebung — Infarktverdacht');
      if (p.st <= -0.12) notes.push('ST-Senkung — Ischämiezeichen');
      if (p.t >= 0.7) notes.push('Hohe spitze T-Welle — an Hyperkaliämie denken');
      if (p.t < 0) notes.push('T-Negativierung');
      if (p.p <= 0.02) notes.push('Keine erkennbare P-Welle');
      if (qtc > 0.44) notes.push('Verlängerte QT-Zeit — Torsade-Risiko');

      const nb = h('div', { style: 'grid-column:1/-1; margin-top:4px' });
      if (notes.length) {
        nb.appendChild(h('div', { class: 'taglist' }, notes.map(function (n) {
          return h('span', { class: 'tag2 warn', text: n });
        })));
      } else {
        nb.appendChild(h('span', { class: 'tag2 ok', text: 'Alle Messwerte im Normbereich' }));
      }
      readout.appendChild(nb);
    }

    function ro(t, v, c) {
      return h('div', { class: 'ro ' + (c || '') }, [
        h('div', { class: 't', text: t }), h('div', { class: 'v', text: v })
      ]);
    }

    const sliderRefs = [];

    function slider(label, key, min, max, stepv, fmt, hint) {
      const val = h('span', { text: fmt(p[key]) });
      const inp = h('input', { type: 'range', min: min, max: max, step: stepv, value: p[key] });
      inp.addEventListener('input', function () {
        p[key] = parseFloat(inp.value);
        val.textContent = fmt(p[key]);
        rebuild();
      });
      sliderRefs.push({ key: key, inp: inp, val: val, fmt: fmt });
      return h('div', { class: 'slider' }, [
        h('label', {}, [h('span', { text: label }), val]),
        inp,
        hint ? h('div', { class: 'hint', text: hint }) : null
      ]);
    }

    // Regler an die aktuellen Werte in `p` angleichen (nach einer Voreinstellung).
    function syncSliders() {
      for (const s of sliderRefs) {
        s.inp.value = p[s.key];
        s.val.textContent = s.fmt(p[s.key]);
      }
    }

    controls.appendChild(h('h3', { style: 'font-size:15px;margin-bottom:14px', text: 'Regler' }));
    controls.appendChild(slider('Herzfrequenz', 'rate', 30, 200, 1, function (v) { return v + '/min'; }));
    controls.appendChild(slider('PQ-Zeit', 'pq', 0.08, 0.40, 0.01,
      function (v) { return Math.round(v * 1000) + ' ms'; }, 'Über 200 ms entsteht ein AV-Block I°'));
    controls.appendChild(slider('QRS-Breite', 'qrs', 1, 2.6, 0.05,
      function (v) { return Math.round(0.075 * v * 1000) + ' ms'; }, 'Ab 120 ms sieht es aus wie ein Schenkelblock'));
    controls.appendChild(slider('ST-Strecke', 'st', -0.35, 0.6, 0.01,
      function (v) { return (v > 0 ? '+' : '') + UI.fmt(v.toFixed(2)) + ' mV'; }, 'Hebung nach oben, Senkung nach unten'));
    controls.appendChild(slider('T-Welle', 't', -0.6, 1.2, 0.02,
      function (v) { return UI.fmt(v.toFixed(2)) + ' mV'; }, 'Sehr hoch = Hyperkaliämie, negativ = Ischämie'));
    controls.appendChild(slider('P-Welle', 'p', 0, 0.35, 0.01,
      function (v) { return UI.fmt(v.toFixed(2)) + ' mV'; }, 'Auf 0 stellen: so sieht Vorhofflimmern aus'));

    const speedRow = h('div', { style: 'display:flex;gap:8px;margin-top:6px' });
    [25, 50].forEach(function (sp) {
      const b = h('button', { class: 'leadbtn' + (p.speed === sp ? ' on' : ''), text: sp + ' mm/s' });
      b.addEventListener('click', function () {
        p.speed = sp;
        Array.prototype.forEach.call(speedRow.children, function (x) {
          x.classList.toggle('on', x.textContent === sp + ' mm/s');
        });
        rebuild();
      });
      speedRow.appendChild(b);
    });
    controls.appendChild(h('div', { class: 'slider' }, [
      h('label', {}, [h('span', { text: 'Papiergeschwindigkeit' })]), speedRow
    ]));

    const presets = h('div', { style: 'margin-top:16px' }, [
      h('div', { style: 'font-size:13px;font-weight:800;margin-bottom:8px', text: 'Voreinstellungen' }),
      h('div', { class: 'taglist' }, [
        preset('Normal', { rate: 70, pq: 0.16, qrs: 1, st: 0, t: 0.30, p: 0.14 }),
        preset('AV-Block I°', { rate: 68, pq: 0.30, qrs: 1, st: 0, t: 0.30, p: 0.14 }),
        preset('Schenkelblock', { rate: 70, pq: 0.16, qrs: 1.9, st: -0.05, t: -0.35, p: 0.14 }),
        preset('STEMI', { rate: 88, pq: 0.16, qrs: 1, st: 0.42, t: 0.34, p: 0.14 }),
        preset('Hyperkaliämie', { rate: 66, pq: 0.20, qrs: 1.35, st: 0, t: 1.0, p: 0.02 }),
        preset('Tachykardie', { rate: 145, pq: 0.13, qrs: 1, st: 0, t: 0.26, p: 0.12 })
      ])
    ]);

    function preset(name, vals) {
      const b = h('button', { class: 'fchip', text: name });
      b.addEventListener('click', function () {
        Object.assign(p, vals);
        syncSliders();
        rebuild();
        S.tap();
      });
      return b;
    }

    controls.appendChild(presets);

    root.appendChild(h('div', { class: 'lab-grid' }, [left, controls]));
    root.appendChild(h('div', { class: 'pill-note', style: 'margin-top:18px' }, [
      h('span', { class: 'bi', text: '🧪' }),
      h('span', { html: 'Die Kurven werden aus mathematischen Modellen erzeugt. Sie zeigen die typische Form eines Befundes — ein echtes Patienten-EKG ist immer unruhiger und vielgestaltiger.' })
    ]));

    requestAnimationFrame(function () {
      rebuild();
      scope = UI.track(new EKG.Scope(cv, { rhythm: 'lab', speed: p.speed, mvRange: 3.4 }));
      updateReadout();
    });
  }

  /* ----------------------------------------------------------- Ableitungen */

  function viewLeads() {
    setNav('ableitungen');
    const root = screen();

    root.appendChild(h('div', { class: 'sec-head' }, [
      h('h2', { text: 'Ableitungen verstehen' }),
      h('span', { text: '12 Blickwinkel auf ein Herz' })
    ]));

    let sel = CONTENT.LEADS[1];   // Ableitung II als Startpunkt

    const info = h('div', { class: 'card' });
    const svgBox = h('div', { class: 'card' });

    // Cabrera-Kreis: 0° zeigt nach links am Patienten (auf dem Schirm nach rechts),
    // positive Winkel laufen nach unten.
    function drawCircle() {
      const NS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 360 360');
      svg.setAttribute('class', 'cabrera');

      const cx = 180, cy = 180, R = 118;
      const mk = function (tag, attrs) {
        const n = document.createElementNS(NS, tag);
        for (const k in attrs) n.setAttribute(k, attrs[k]);
        svg.appendChild(n);
        return n;
      };

      mk('circle', { cx: cx, cy: cy, r: R, fill: '#f7fafd', stroke: '#e3ebf5', 'stroke-width': 2 });
      mk('circle', { cx: cx, cy: cy, r: R * 0.62, fill: 'none', stroke: '#eef3f9', 'stroke-width': 2 });
      mk('line', { x1: cx - R, y1: cy, x2: cx + R, y2: cy, class: 'axis' });
      mk('line', { x1: cx, y1: cy - R, x2: cx, y2: cy + R, class: 'axis' });

      // Herz-Silhouette in der Mitte als Orientierung
      mk('ellipse', { cx: cx, cy: cy + 4, rx: 26, ry: 30, fill: '#ffd9e0', stroke: '#f0a8b8', 'stroke-width': 2 });

      CONTENT.LEADS.forEach(function (L) {
        const rad = L.angle * Math.PI / 180;
        const x = cx + Math.cos(rad) * R;
        const y = cy + Math.sin(rad) * R;
        const on = L.id === sel.id;
        const line = mk('line', {
          x1: cx, y1: cy, x2: x, y2: y, class: 'lead-line',
          stroke: on ? L.color : '#c9d6e8',
          'stroke-width': on ? 6 : 4
        });
        line.style.cursor = 'pointer';
        line.addEventListener('click', function () { sel = L; refresh(); });

        // Pfeilspitze in Blickrichtung
        mk('circle', { cx: x, cy: y, r: on ? 8 : 6, fill: on ? L.color : '#c9d6e8',
                       stroke: '#fff', 'stroke-width': 2 });

        const lx = cx + Math.cos(rad) * (R + 26);
        const ly = cy + Math.sin(rad) * (R + 26) + 5;
        const t = mk('text', { x: lx, y: ly, 'text-anchor': 'middle', fill: on ? L.color : '#8a99b5' });
        t.textContent = L.id;
        t.style.cursor = 'pointer';
        t.addEventListener('click', function () { sel = L; refresh(); });

        const t2 = mk('text', { x: lx, y: ly + 14, 'text-anchor': 'middle', fill: '#aab7cc' });
        t2.setAttribute('style', 'font-size:10px;font-weight:700');
        t2.textContent = (L.angle > 0 ? '+' : '') + L.angle + '°';
      });

      return svg;
    }

    function refresh() {
      svgBox.innerHTML = '';
      svgBox.appendChild(h('div', { class: 'leadbtns' }, CONTENT.LEADS.map(function (L) {
        const b = h('button', { class: 'leadbtn' + (L.id === sel.id ? ' on' : ''), text: L.id });
        b.addEventListener('click', function () { sel = L; refresh(); });
        return b;
      })));
      svgBox.appendChild(drawCircle());
      svgBox.appendChild(h('p', { style: 'text-align:center;font-size:12px;color:var(--muted);font-weight:700;margin-top:8px',
        text: 'Cabrera-Kreis — Frontalebene' }));

      info.innerHTML = '';
      info.appendChild(h('div', { class: 'cat', style: 'font-size:11px;font-weight:900;letter-spacing:.09em;text-transform:uppercase;color:var(--muted)', text: sel.grp }));
      info.appendChild(h('h3', { style: 'font-size:26px;margin:4px 0 2px', text: 'Ableitung ' + sel.id }));
      info.appendChild(h('div', { class: 'taglist' }, [
        h('span', { class: 'tag2', text: (sel.angle > 0 ? '+' : '') + sel.angle + '°' }),
        h('span', { class: 'tag2 warn', text: sel.wall })
      ]));
      info.appendChild(h('p', { style: 'margin-top:12px;font-size:14.5px;line-height:1.6;color:var(--muted);font-weight:600', text: sel.desc }));
    }

    root.appendChild(h('div', { class: 'leads-wrap' }, [svgBox, info]));
    refresh();

    /* Brustwandableitungen */
    root.appendChild(h('div', { class: 'sec-head' }, [
      h('h2', { text: 'Brustwandableitungen' }),
      h('span', { text: 'Horizontalebene, V1 bis V6' })
    ]));
    const chest = h('div', { class: 'libgrid' });
    CONTENT.CHEST_LEADS.forEach(function (c) {
      chest.appendChild(h('article', { class: 'libcard' }, [
        h('div', { class: 'body' }, [
          h('div', { class: 'cat', text: c.wall }),
          h('h3', { text: c.id }),
          h('p', { style: 'font-weight:800;color:var(--ink);margin-bottom:6px', text: c.pos }),
          h('p', { text: c.desc })
        ])
      ]));
    });
    root.appendChild(chest);

    /* Infarktlokalisation */
    root.appendChild(h('div', { class: 'sec-head' }, [
      h('h2', { text: 'Infarkt lokalisieren' }),
      h('span', { text: 'Vom EKG-Muster zum verschlossenen Gefäß' })
    ]));
    const reg = h('div', { class: 'libgrid' });
    CONTENT.REGIONS.forEach(function (r) {
      const card = h('article', { class: 'libcard' }, [
        h('div', { class: 'body' }, [
          h('h3', { text: r.name }),
          h('div', { class: 'taglist', style: 'margin:8px 0 10px' }, [
            h('span', { class: 'tag2 crit', text: r.leads })
          ]),
          h('p', { html: '<b>Gefäß:</b> ' + r.vessel })
        ])
      ]);
      card.style.borderLeft = '6px solid ' + r.color;
      reg.appendChild(card);
    });
    root.appendChild(reg);
  }

  /* ------------------------------------------------------ Dialoge & Toast */

  function modal(title, text, buttons) {
    const bg = h('div', { class: 'modal-bg' });
    const box = h('div', { class: 'modal' }, [
      h('h3', { text: title }),
      h('p', { text: text }),
      h('div', { class: 'row' }, buttons.map(function (b) {
        return h('button', { class: b.c, text: b.t, onclick: function () {
          bg.remove();
          if (b.f) b.f();
        } });
      }))
    ]);
    bg.appendChild(box);
    bg.addEventListener('click', function (e) { if (e.target === bg) bg.remove(); });
    document.body.appendChild(bg);
  }

  function toast(msg) {
    const t = h('div', {
      text: msg,
      style: 'position:fixed;left:50%;transform:translateX(-50%);bottom:88px;z-index:95;' +
             'background:#14243f;color:#fff;padding:12px 20px;border-radius:999px;' +
             'font-weight:800;font-size:13.5px;box-shadow:0 8px 26px rgba(0,0,0,.25);'
    });
    document.body.appendChild(t);
    setTimeout(function () { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; }, 1700);
    setTimeout(function () { t.remove(); }, 2100);
  }

  function openSettings() {
    const bg = h('div', { class: 'modal-bg' });
    const soundBtn = h('button', { class: 'btn wide ' + (state.sound ? '' : 'gray'),
      text: state.sound ? '🔊 Töne an' : '🔇 Töne aus' });
    soundBtn.addEventListener('click', function () {
      state.sound = !state.sound;
      S.on = state.sound;
      soundBtn.textContent = state.sound ? '🔊 Töne an' : '🔇 Töne aus';
      soundBtn.className = 'btn wide ' + (state.sound ? '' : 'gray');
      save();
    });
    const unlockBtn = h('button', { class: 'btn wide ' + (state.unlockAll ? 'violet' : 'gray'),
      text: state.unlockAll ? '🔓 Alle Lektionen offen' : '🔒 Der Reihe nach' });
    unlockBtn.addEventListener('click', function () {
      state.unlockAll = !state.unlockAll;
      unlockBtn.textContent = state.unlockAll ? '🔓 Alle Lektionen offen' : '🔒 Der Reihe nach';
      unlockBtn.className = 'btn wide ' + (state.unlockAll ? 'violet' : 'gray');
      save();
    });

    const box = h('div', { class: 'modal' }, [
      h('h3', { text: 'Einstellungen' }),
      h('p', { text: 'Fortschritt: ' + Object.keys(state.done).length + ' von ' +
                     CONTENT.ALL_LESSONS.length + ' Lektionen, ' + state.xp + ' XP.' }),
      h('div', { style: 'display:grid;gap:10px' }, [
        soundBtn, unlockBtn,
        h('button', { class: 'btn wide bad', text: 'Fortschritt zurücksetzen', onclick: function () {
          bg.remove();
          modal('Wirklich zurücksetzen?', 'Alle Lektionen, XP und die Streak werden gelöscht. Das lässt sich nicht rückgängig machen.', [
            { t: 'Abbrechen', c: 'btn gray', f: null },
            { t: 'Löschen', c: 'btn bad', f: function () {
              state = Object.assign({}, DEFAULT_STATE);
              save(); renderTop(); route();
            } }
          ]);
        } }),
        h('button', { class: 'btn wide gray', text: 'Schließen', onclick: function () { bg.remove(); } })
      ])
    ]);
    bg.appendChild(box);
    bg.addEventListener('click', function (e) { if (e.target === bg) bg.remove(); });
    document.body.appendChild(bg);
  }

  /* ---------------------------------------------------------------- Router */

  function route() {
    const hash = location.hash.replace(/^#\/?/, '') || 'pfad';
    const parts = hash.split('/');
    renderTop();
    if (parts[0] === 'lektion' && parts[1]) viewLesson(parts[1]);
    else if (parts[0] === 'bibliothek') viewLibrary();
    else if (parts[0] === 'labor') viewLab();
    else if (parts[0] === 'ableitungen') viewLeads();
    else viewPath();
  }

  global.addEventListener('hashchange', route);

  // Bei verstecktem Tab die Animationen anhalten — spart Akku spürbar.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) UI.clearLive();
    else route();
  });

  S.on = state.sound;
  route();

})(window);
