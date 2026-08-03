/* ui.js — Medien-Bausteine, Aufgabentypen und Töne.
   Definiert das globale Objekt `UI`. */
(function (global) {
  'use strict';

  /* --------------------------------------------------------------- Helfer */

  function h(tag, attrs, kids) {
    const n = document.createElement(tag);
    for (const k in (attrs || {})) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    }
    for (const c of (kids || [])) {
      if (c === null || c === undefined) continue;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return n;
  }

  function shuffle(arr, seed) {
    const a = arr.slice();
    let s = seed || 12345;
    for (let i = a.length - 1; i > 0; i--) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const j = s % (i + 1);
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ------------------------------------------------------- Aktive Objekte */

  // Alle laufenden Scopes/Diagramme, damit beim Seitenwechsel nichts weiterläuft.
  let live = [];
  function track(obj) { live.push(obj); return obj; }
  function clearLive() {
    for (const o of live) { try { o.destroy(); } catch (e) { /* egal */ } }
    live = [];
  }

  // Anhalten und Fortsetzen, ohne die Objekte wegzuwerfen — nötig beim
  // Tabwechsel, denn ein Neuaufbau des Bildschirms würde den Fortschritt
  // in der laufenden Lektion verlieren.
  function pauseLive() {
    for (const o of live) {
      const running = typeof o.stop === 'function' && o.o && o.o.running;
      o._wasRunning = !!running;
      if (running) { try { o.stop(); } catch (e) { /* egal */ } }
    }
  }

  function resumeLive() {
    for (const o of live) {
      if (o._wasRunning && typeof o.start === 'function') {
        o._wasRunning = false;
        try { o.start(); } catch (e) { /* egal */ }
      }
    }
  }

  /* ----------------------------------------------------------------- Töne */

  const Sound = {
    on: true,
    ctx: null,
    _ctx: function () {
      if (!this.ctx) {
        const AC = global.AudioContext || global.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    tone: function (freq, dur, type, vol, delay) {
      if (!this.on) return;
      const c = this._ctx();
      if (!c) return;
      const t0 = c.currentTime + (delay || 0);
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol || 0.16, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g); g.connect(c.destination);
      osc.start(t0); osc.stop(t0 + dur + 0.03);
    },
    right: function () { this.tone(660, 0.12, 'sine', 0.15); this.tone(990, 0.20, 'sine', 0.13, 0.09); },
    wrong: function () { this.tone(190, 0.20, 'square', 0.09); this.tone(140, 0.26, 'square', 0.08, 0.10); },
    tap:   function () { this.tone(520, 0.05, 'sine', 0.06); },
    beat:  function () { this.tone(880, 0.055, 'sine', 0.07); },
    win:   function () {
      const notes = [523, 659, 784, 1046];
      notes.forEach((f, i) => this.tone(f, 0.28, 'triangle', 0.13, i * 0.11));
    },
    fail:  function () { this.tone(330, 0.22, 'sine', 0.11); this.tone(247, 0.34, 'sine', 0.10, 0.16); }
  };

  /* --------------------------------------------------------------- Medien */

  // Baut das Medien-Element einer Lernkarte oder Aufgabe.
  function media(spec) {
    if (!spec) return null;

    if (spec.k === 'scope') {
      const wrap = h('div', { class: 'scope h-' + (spec.h || 'md') });
      const cv = h('canvas');
      wrap.appendChild(cv);
      if (spec.label) wrap.appendChild(h('span', { class: 'tag', text: spec.label }));
      if (spec.theme === 'paper') wrap.classList.add('paper');
      // Das Canvas braucht erst eine Größe im Layout, bevor gezeichnet wird.
      requestAnimationFrame(function () {
        track(new EKG.Scope(cv, {
          rhythm: spec.rhythm, theme: spec.theme || 'monitor',
          speed: spec.speed || 25, mvRange: spec.mvRange || 3.2,
          gain: spec.gain || 10
        }));
      });
      return wrap;
    }

    if (spec.k === 'beat') {
      const wrap = h('div', { class: 'scope paper beatbox' });
      const cv = h('canvas');
      wrap.appendChild(cv);
      requestAnimationFrame(function () {
        drawBeatWithLabels(cv, spec);
      });
      // Bei Größenänderung neu zeichnen — das Canvas ist statisch.
      const ro = { destroy: function () { global.removeEventListener('resize', fn); } };
      const fn = function () { drawBeatWithLabels(cv, spec); };
      global.addEventListener('resize', fn);
      track(ro);
      return wrap;
    }

    // Mehrere Ableitungen nebeneinander, alle im selben Maßstab.
    // Quelle wahlweise: fertiger Satz (`set`), eine Herzachse (`axis`)
    // oder eine ausformulierte Liste (`leads`).
    if (spec.k === 'leads') {
      const set = spec.leads ? spec.leads
                : (spec.axis !== undefined ? EKG.axisLeads(spec.axis, spec.ids)
                : (EKG.LEAD_SETS[spec.set] || EKG.LEAD_SETS.normal));
      const grid = h('div', { class: 'leadgrid' +
        (set.length === 3 ? ' three' : (set.length === 4 ? ' four' : '')) });
      const cans = [];
      set.forEach(function (L) {
        const cv = h('canvas');
        cans.push({ cv: cv, tpl: L.tpl, id: L.id, pAmp: L.pAmp });
        grid.appendChild(h('div', { class: 'leadcell' }, [cv]));
      });
      const paint = function () {
        for (const c of cans) {
          EKG.drawStrip(c.cv, {
            tpl: c.tpl, label: c.id,
            seconds: spec.seconds || 1.7, speed: spec.speed || null,
            pAmp: c.pAmp === undefined ? 0.14 : c.pAmp,
            mvTop: spec.mvTop || 1.9, mvBot: spec.mvBot || -1.75
          });
        }
      };
      requestAnimationFrame(paint);
      global.addEventListener('resize', paint);
      track({ destroy: function () { global.removeEventListener('resize', paint); } });
      return grid;
    }

    if (spec.k === 'heart') {
      const wrap = h('div', { class: 'heart-host' });
      requestAnimationFrame(function () {
        track(new Heart.Diagram(wrap, { cycle: 4.2 }));
      });
      return wrap;
    }

    return null;
  }

  // Einzelschlag mit anatomischer Beschriftung darüber.
  function drawBeatWithLabels(cv, spec) {
    const r = EKG.drawSingleBeat(cv, {
      theme: 'paper', tpl: spec.tpl || {}, pq: spec.pq || 0.16,
      pAmp: spec.pAmp === undefined ? 0.14 : spec.pAmp
    });
    const ctx = cv.getContext('2d');
    const marks = [
      { k: 'p', t: 'P', c: '#12b3a6' },
      { k: 'qrs', t: 'QRS', c: '#ff4d6d' },
      { k: 't', t: 'T', c: '#7c5cff' }
    ];
    ctx.font = '900 12px ui-rounded, system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (const m of marks) {
      const z = r.zones[m.k];
      const cx = (z.x0 + z.x1) / 2;
      ctx.fillStyle = m.c;
      ctx.globalAlpha = 0.14;
      ctx.fillRect(z.x0, 6, z.x1 - z.x0, r.height - 12);
      ctx.globalAlpha = 1;
      ctx.fillRect(cx - 15, 8, 30, 17);
      ctx.fillStyle = '#fff';
      ctx.fillText(m.t, cx, 20.5);
    }
  }

  /* ---------------------------------------------------- Aufgaben-Renderer */

  /**
   * Baut eine Aufgabe in `host` und liefert ein Objekt mit
   *   ready  — hat der Nutzer geantwortet?
   *   check()— prüft, färbt ein und liefert true/false
   *   onready— Callback, wird von aussen gesetzt
   */
  function buildExercise(step, host, seed) {
    const kicker = { mc: 'Wähle die richtige Antwort', tf: 'Richtig oder falsch?',
                     multi: 'Wähle alle zutreffenden Antworten', order: 'Bringe in die richtige Reihenfolge',
                     match: 'Ordne einander zu', num: 'Rechne nach', label: 'Zeig auf die Kurve',
                     rhythm: 'Erkenne den Befund' }[step.t] || '';

    host.appendChild(h('div', { class: 'q-kicker', text: kicker }));
    host.appendChild(h('h2', { class: 'q-title', html: step.q }));
    if (step.sub) host.appendChild(h('p', { class: 'q-sub', html: step.sub }));

    const m = media(step.media);
    if (m) host.appendChild(h('div', { class: 'q-media' }, [m]));

    const body = h('div', {});
    host.appendChild(body);

    const api = { ready: false, onready: null, check: null };
    const setReady = function (v) {
      api.ready = v;
      if (api.onready) api.onready(v);
    };

    switch (step.t) {

      /* ---- Multiple Choice, Rhythmuserkennung, Richtig/Falsch ---- */
      case 'mc':
      case 'rhythm':
      case 'tf': {
        const opts = step.t === 'tf' ? ['Richtig', 'Falsch'] : step.opts;
        const correct = step.t === 'tf' ? (step.a ? 0 : 1) : step.a;
        const list = h('div', { class: 'opts' + (step.t === 'tf' ? ' two' : '') });
        let picked = -1;
        const btns = [];
        opts.forEach(function (o, i) {
          const b = h('button', { class: 'opt', type: 'button' }, [
            step.t === 'tf' ? null : h('span', { class: 'key', text: String(i + 1) }),
            h('span', { html: o })
          ]);
          b.addEventListener('click', function () {
            if (b.classList.contains('locked')) return;
            btns.forEach(function (x) { x.classList.remove('sel'); });
            b.classList.add('sel');
            picked = i;
            Sound.tap();
            setReady(true);
          });
          btns.push(b);
          list.appendChild(b);
        });
        body.appendChild(list);
        api.check = function () {
          const ok = picked === correct;
          btns.forEach(function (b, i) {
            b.classList.add('locked');
            b.classList.remove('sel');
            if (i === correct) b.classList.add('right');
            else if (i === picked) b.classList.add('wrong');
          });
          return ok;
        };
        break;
      }

      /* ---- Mehrfachauswahl ---- */
      case 'multi': {
        const list = h('div', { class: 'opts' });
        const chosen = new Set();
        const btns = [];
        step.opts.forEach(function (o, i) {
          const b = h('button', { class: 'opt', type: 'button' }, [
            h('span', { class: 'key', text: '' }),
            h('span', { html: o })
          ]);
          b.addEventListener('click', function () {
            if (b.classList.contains('locked')) return;
            if (chosen.has(i)) { chosen.delete(i); b.classList.remove('sel'); b.querySelector('.key').textContent = ''; }
            else { chosen.add(i); b.classList.add('sel'); b.querySelector('.key').textContent = '✓'; }
            Sound.tap();
            setReady(chosen.size > 0);
          });
          btns.push(b);
          list.appendChild(b);
        });
        body.appendChild(list);
        api.check = function () {
          const want = new Set(step.a);
          let ok = chosen.size === want.size;
          if (ok) { for (const v of want) if (!chosen.has(v)) { ok = false; break; } }
          btns.forEach(function (b, i) {
            b.classList.add('locked'); b.classList.remove('sel');
            const k = b.querySelector('.key');
            if (want.has(i)) { b.classList.add('right'); k.textContent = '✓'; }
            else if (chosen.has(i)) { b.classList.add('wrong'); k.textContent = '✕'; }
            else k.textContent = '';
          });
          return ok;
        };
        break;
      }

      /* ---- Reihenfolge ---- */
      case 'order': {
        const bank = h('div', { class: 'bank' });
        const line = h('div', { class: 'slotline' });
        body.appendChild(h('p', { class: 'q-sub', text: 'Tippe die Begriffe in der richtigen Reihenfolge an.' }));
        body.appendChild(line);
        body.appendChild(bank);
        const placed = [];
        shuffle(step.items, seed).forEach(function (it) {
          const c = h('button', { class: 'chip', type: 'button', text: it });
          c.addEventListener('click', function () {
            if (bank.contains(c)) {
              placed.push(it);
              c.classList.add('num');
              c.setAttribute('data-n', String(placed.length));
              line.appendChild(c);
            } else {
              const i = placed.indexOf(it);
              if (i >= 0) placed.splice(i, 1);
              c.classList.remove('num');
              c.removeAttribute('data-n');
              bank.appendChild(c);
              // Nummerierung der verbleibenden Elemente auffrischen.
              Array.prototype.forEach.call(line.children, function (el, k) {
                el.setAttribute('data-n', String(k + 1));
              });
            }
            Sound.tap();
            setReady(placed.length === step.items.length);
          });
          bank.appendChild(c);
        });
        api.check = function () {
          let ok = true;
          Array.prototype.forEach.call(line.children, function (el, i) {
            const good = placed[i] === step.items[i];
            el.classList.add(good ? 'right' : 'wrong');
            el.style.pointerEvents = 'none';
            if (!good) ok = false;
          });
          Array.prototype.forEach.call(bank.children, function (el) { el.style.pointerEvents = 'none'; });
          return ok;
        };
        break;
      }

      /* ---- Zuordnung ---- */
      case 'match': {
        const wrap = h('div', { class: 'match' });
        const colL = h('div', { class: 'col' });
        const colR = h('div', { class: 'col' });
        wrap.appendChild(colL); wrap.appendChild(colR);
        body.appendChild(wrap);

        const lefts = step.pairs.map(function (p, i) { return { txt: p[0], i: i }; });
        const rights = shuffle(step.pairs.map(function (p, i) { return { txt: p[1], i: i }; }), seed + 7);

        let selL = null, done = 0, errors = 0;
        const mk = function (item, col, side) {
          const b = h('button', { class: 'mitem', type: 'button', html: item.txt });
          b._i = item.i; b._side = side;
          b.addEventListener('click', function () {
            if (b.classList.contains('paired')) return;
            if (side === 'l') {
              if (selL) selL.classList.remove('sel');
              selL = b; b.classList.add('sel'); Sound.tap();
            } else {
              if (!selL) return;
              if (selL._i === b._i) {
                selL.classList.remove('sel');
                selL.classList.add('paired'); b.classList.add('paired');
                selL = null; done++;
                Sound.tap();
                setReady(done === step.pairs.length);
              } else {
                errors++;
                b.classList.add('err');
                selL.classList.add('err');
                const bad = selL;
                Sound.wrong();
                setTimeout(function () { b.classList.remove('err'); bad.classList.remove('err'); }, 380);
              }
            }
          });
          col.appendChild(b);
          return b;
        };
        lefts.forEach(function (it) { mk(it, colL, 'l'); });
        rights.forEach(function (it) { mk(it, colR, 'r'); });

        api.check = function () { return errors === 0; };
        api.summary = function () {
          return errors === 0 ? null : 'Du hast ' + errors + ' Mal danebengegriffen.';
        };
        break;
      }

      /* ---- Zahleneingabe ---- */
      case 'num': {
        const inp = h('input', { type: 'text', inputmode: 'decimal',
                                 placeholder: '?', 'aria-label': 'Antwort' });
        const row = h('div', { class: 'numrow' }, [
          inp, step.unit ? h('span', { class: 'unit', text: step.unit }) : null
        ]);
        body.appendChild(row);
        inp.addEventListener('input', function () {
          setReady(inp.value.trim().length > 0);
        });
        api.focus = function () { try { inp.focus(); } catch (e) { /* egal */ } };
        api.check = function () {
          const v = parseFloat(inp.value.replace(',', '.'));
          const ok = !isNaN(v) && Math.abs(v - step.a) <= (step.tol || 0);
          inp.disabled = true;
          inp.style.borderColor = ok ? 'var(--ok)' : 'var(--bad)';
          inp.style.background = ok ? 'var(--ok-lt)' : 'var(--bad-lt)';
          inp.style.color = ok ? 'var(--ok-dk)' : 'var(--bad-dk)';
          if (!ok) {
            row.appendChild(h('div', { class: 'stat gold',
              html: '<span class="ic">✅</span> ' + fmt(step.a) + ' ' + (step.unit || '') }));
          }
          return ok;
        };
        break;
      }

      /* ---- Beschriftung: auf die Kurve tippen ---- */
      case 'label': {
        const wrap = h('div', { class: 'labelwrap' });
        const cv = h('canvas');
        wrap.appendChild(cv);
        body.appendChild(wrap);
        let picked = null, zones = null;

        let hits = null;
        const render = function (hl) {
          const r = EKG.drawSingleBeat(cv, { theme: 'paper', tpl: step.tpl || {},
                                             pq: 0.16, highlight: hl });
          zones = r.zones;
          hits = r.hit;
        };
        requestAnimationFrame(function () { render(null); });
        const onResize = function () { render(picked); };
        global.addEventListener('resize', onResize);
        track({ destroy: function () { global.removeEventListener('resize', onResize); } });

        wrap.addEventListener('click', function (e) {
          if (wrap.classList.contains('locked') || !hits) return;
          const rect = cv.getBoundingClientRect();
          const x = e.clientX - rect.left;
          for (const k in hits) {
            if (x >= hits[k].x0 && x < hits[k].x1) {
              picked = k;
              render(k);
              Sound.tap();
              setReady(true);
              return;
            }
          }
        });

        api.check = function () {
          wrap.classList.add('locked');
          const ok = picked === step.target;
          render(step.target);
          const ctx = cv.getContext('2d');
          const z = zones[step.target];
          ctx.fillStyle = ok ? 'rgba(53,199,89,.9)' : 'rgba(255,75,75,.9)';
          const w = Math.max(60, z.x1 - z.x0);
          const cx = (z.x0 + z.x1) / 2;
          ctx.fillRect(cx - w / 2, 6, w, 20);
          ctx.fillStyle = '#fff';
          ctx.font = '900 12px ui-rounded, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(z.name, cx, 20);
          return ok;
        };
        break;
      }
    }

    return api;
  }

  function fmt(n) {
    return String(n).replace('.', ',');
  }

  /* ------------------------------------------------- Suchfeld mit Vorschlag */

  // Umlaute und Sonderzeichen raus, damit „AV-Block II°" auch als
  // „avblockii" gefunden wird.
  function norm(s) {
    return String(s).toLowerCase()
      .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u')
      .replace(/ß/g, 'ss').replace(/[^a-z0-9]/g, '');
  }

  /**
   * Tippfeld mit Auswahlliste (Combobox).
   *
   * @param {Object} o  items: [{id, label, hint, alias[]}], placeholder,
   *                    onpick(id|null), onenter()
   * @returns {Object}  el, value(), setDisabled(), focus(), reset()
   */
  function combo(o) {
    const items = o.items.map(function (it) {
      return Object.assign({}, it, {
        _n: norm(it.label),
        _a: (it.alias || []).map(norm)
      });
    });

    const inp = h('input', {
      type: 'text', class: 'combo-input', placeholder: o.placeholder || '',
      autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off',
      spellcheck: 'false', role: 'combobox', 'aria-expanded': 'false',
      'aria-autocomplete': 'list', 'aria-label': o.placeholder || 'Diagnose'
    });
    const list = h('div', { class: 'combo-list', role: 'listbox' });
    const el = h('div', { class: 'combo' }, [inp, list]);

    let chosen = null, shown = [], active = -1;

    // Kleinere Zahl = besserer Treffer.
    function rank(it, q) {
      if (it._n.indexOf(q) === 0) return 0;
      if (it._n.indexOf(q) > 0) return 1;
      for (const a of it._a) {
        if (a.indexOf(q) === 0) return 2;
        if (a.indexOf(q) > 0) return 3;
      }
      return -1;
    }

    function close() {
      list.classList.remove('open');
      inp.setAttribute('aria-expanded', 'false');
      active = -1;
    }

    function render() {
      const q = norm(inp.value);
      const hits = [];
      for (const it of items) {
        const r = q ? rank(it, q) : 0;
        if (r >= 0) hits.push({ it: it, r: r });
      }
      hits.sort(function (a, b) {
        return a.r - b.r || a.it.label.localeCompare(b.it.label, 'de');
      });
      shown = hits.slice(0, 8).map(function (x) { return x.it; });

      list.innerHTML = '';
      if (!shown.length) {
        list.appendChild(h('div', { class: 'combo-empty', text: 'Kein Treffer' }));
      }
      shown.forEach(function (it, i) {
        const row = h('div', {
          class: 'combo-item' + (i === active ? ' on' : ''),
          role: 'option', 'aria-selected': i === active ? 'true' : 'false'
        }, [
          h('span', { class: 'ci-label', text: it.label }),
          it.hint ? h('span', { class: 'ci-hint', text: it.hint }) : null
        ]);
        // mousedown statt click: sonst schließt der Blur die Liste zuerst.
        row.addEventListener('mousedown', function (e) { e.preventDefault(); pick(i); });
        list.appendChild(row);
      });
      list.classList.add('open');
      inp.setAttribute('aria-expanded', 'true');
    }

    function pick(i) {
      const it = shown[i];
      if (!it) return;
      chosen = it.id;
      inp.value = it.label;
      close();
      Sound.tap();
      if (o.onpick) o.onpick(chosen);
    }

    inp.addEventListener('input', function () {
      chosen = null;
      active = -1;
      render();
      if (o.onpick) o.onpick(null);
    });
    inp.addEventListener('focus', function () { if (!chosen) render(); });
    inp.addEventListener('blur', function () { setTimeout(close, 120); });

    inp.addEventListener('keydown', function (e) {
      // Ältere Browser melden „Down"/„Up"/„Esc" statt der ArrowX-Namen.
      const k = { Down: 'ArrowDown', Up: 'ArrowUp', Esc: 'Escape' }[e.key] || e.key;
      const isOpen = list.classList.contains('open');

      if (k === 'ArrowDown' || k === 'ArrowUp') {
        e.preventDefault();
        const down = k === 'ArrowDown';
        if (!isOpen) {
          render();                                   // füllt `shown`
          active = down ? 0 : Math.max(0, shown.length - 1);
        } else {
          active += down ? 1 : -1;
          if (active < 0) active = shown.length - 1;
          if (active >= shown.length) active = 0;
        }
        render();
        const on = list.querySelector('.combo-item.on');
        if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest' });
      } else if (k === 'Enter') {
        e.preventDefault();
        if (isOpen && shown.length) pick(active >= 0 ? active : 0);
        else if (o.onenter) o.onenter();
      } else if (k === 'Escape') {
        close();
      }
    });

    return {
      el: el,
      // Auch ohne Auswahl aus der Liste akzeptieren, wenn der getippte Text
      // eindeutig auf einen Eintrag passt.
      value: function () {
        if (chosen) return chosen;
        const q = norm(inp.value);
        if (!q) return null;
        const exact = items.filter(function (it) {
          return it._n === q || it._a.indexOf(q) >= 0;
        });
        if (exact.length === 1) return exact[0].id;
        const part = items.filter(function (it) { return rank(it, q) >= 0; });
        return part.length === 1 ? part[0].id : null;
      },
      hasText: function () { return inp.value.trim().length > 0; },
      setDisabled: function (v) { inp.disabled = !!v; if (v) close(); },
      focus: function () { try { inp.focus(); } catch (e) { /* egal */ } },
      reset: function () { chosen = null; inp.value = ''; inp.disabled = false; close(); }
    };
  }

  /* ------------------------------------------------------------ Lehrfolie */

  function buildTeach(step, host) {
    const wrap = h('div', { class: 'teach' });
    wrap.appendChild(h('h2', { html: step.h }));
    if (step.lead) wrap.appendChild(h('p', { class: 'lead', html: step.lead }));

    const m = media(step.media);
    if (m) wrap.appendChild(h('div', { class: 'q-media' }, [m]));

    if (step.bullets) {
      const ul = h('ul', { class: 'bullets' });
      for (const b of step.bullets) {
        ul.appendChild(h('li', {}, [
          h('span', { class: 'bi', text: b.i }),
          h('span', { html: b.x })
        ]));
      }
      wrap.appendChild(ul);
    }

    if (step.table) {
      const tb = h('table', { class: 'normtab' });
      const heads = step.thead || ['Abschnitt', 'Dauer', 'Amplitude'];
      tb.appendChild(h('tr', {}, heads.map(function (t) { return h('th', { text: t }); })));
      for (const row of step.table) {
        tb.appendChild(h('tr', {}, row.map(function (c) { return h('td', { html: c }); })));
      }
      wrap.appendChild(tb);
    }

    if (step.key) {
      wrap.appendChild(h('div', { class: 'keybox' }, [
        h('h4', { text: step.key.h }),
        h('p', { html: step.key.p })
      ]));
    }

    host.appendChild(wrap);
  }

  /* ---------------------------------------------------------------- Export */

  global.UI = {
    h: h,
    shuffle: shuffle,
    media: media,
    combo: combo,
    norm: norm,
    buildExercise: buildExercise,
    buildTeach: buildTeach,
    Sound: Sound,
    track: track,
    clearLive: clearLive,
    pauseLive: pauseLive,
    resumeLive: resumeLive,
    fmt: fmt
  };

})(window);
