/* heart.js — Schematisches Herz mit animiertem Erregungsleitungssystem.
   Definiert das globale Objekt `Heart`. */
(function (global) {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';

  // Ablauf eines Herzzyklus, normiert auf 0..1.
  // Jede Phase kennt die beteiligten Strukturen und den EKG-Abschnitt.
  const PHASES = [
    { id: 'sa',     from: 0.00, to: 0.08, label: 'Sinusknoten',
      ekg: 'Noch Nulllinie',
      text: 'Der Sinusknoten im rechten Vorhof gibt den Takt vor — er ist der primäre Schrittmacher mit 60–100 Impulsen pro Minute.' },
    { id: 'atria',  from: 0.08, to: 0.24, label: 'Vorhoferregung',
      ekg: 'P-Welle',
      text: 'Die Erregung breitet sich über beide Vorhöfe aus. Genau das zeichnet das EKG als P-Welle auf.' },
    { id: 'av',     from: 0.24, to: 0.40, label: 'AV-Knoten',
      ekg: 'PQ-Strecke',
      text: 'Im AV-Knoten wird die Erregung bewusst verzögert. Diese Pause gibt den Vorhöfen Zeit, die Kammern zu füllen.' },
    { id: 'his',    from: 0.40, to: 0.50, label: 'His-Bündel & Tawara-Schenkel',
      ekg: 'Ende PQ-Strecke',
      text: 'Über das His-Bündel und die beiden Tawara-Schenkel rast die Erregung Richtung Herzspitze.' },
    { id: 'vent',   from: 0.50, to: 0.62, label: 'Kammererregung',
      ekg: 'QRS-Komplex',
      text: 'Die Purkinje-Fasern erregen die Kammermuskulatur blitzschnell — der große QRS-Ausschlag entsteht.' },
    { id: 'plateau',from: 0.62, to: 0.74, label: 'Plateauphase',
      ekg: 'ST-Strecke',
      text: 'Alle Kammerzellen sind erregt. Weil keine Spannungsunterschiede bestehen, liegt das EKG wieder auf der Nulllinie.' },
    { id: 'repol',  from: 0.74, to: 0.94, label: 'Erregungsrückbildung',
      ekg: 'T-Welle',
      text: 'Die Kammern repolarisieren sich, werden also wieder "scharf geschaltet". Das erzeugt die T-Welle.' },
    { id: 'rest',   from: 0.94, to: 1.00, label: 'Ruhephase',
      ekg: 'Nulllinie',
      text: 'Kurze Erholung — dann feuert der Sinusknoten erneut.' }
  ];

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function phaseAt(u) {
    for (const p of PHASES) if (u >= p.from && u < p.to) return p;
    return PHASES[PHASES.length - 1];
  }

  /**
   * Baut das Herz-Diagramm in `host` und liefert einen Controller.
   *
   * @param {HTMLElement} host
   * @param {Object} opts  cycle (s), running, onphase(phase), labels
   */
  function Diagram(host, opts) {
    this.o = Object.assign({ cycle: 3.2, running: true, onphase: null, labels: true }, opts || {});
    this.host = host;
    this.u = 0;
    this.raf = null;
    this.dead = false;
    this._lastPhase = null;
    this._build();
    if (this.o.running) this.start();
    else this._apply(0);
  }

  Diagram.prototype._build = function () {
    const svg = el('svg', {
      viewBox: '0 0 420 470', class: 'heart-svg',
      xmlns: NS, 'aria-label': 'Schematisches Herz mit Erregungsleitungssystem'
    });
    this.svg = svg;

    // Früh einhängen: getTotalLength() liefert nur an eingehängten Pfaden
    // zuverlässige Werte.
    this.host.innerHTML = '';
    this.host.appendChild(svg);

    const defs = el('defs', {}, svg);
    const g1 = el('radialGradient', { id: 'hg-atria', cx: '50%', cy: '40%' }, defs);
    el('stop', { offset: '0%', 'stop-color': '#ffd9e0' }, g1);
    el('stop', { offset: '100%', 'stop-color': '#f7b8c5' }, g1);
    const g2 = el('radialGradient', { id: 'hg-vent', cx: '50%', cy: '35%' }, defs);
    el('stop', { offset: '0%', 'stop-color': '#ffc2ce' }, g2);
    el('stop', { offset: '100%', 'stop-color': '#ef8fa4' }, g2);

    const glow = el('filter', { id: 'hg-glow', x: '-60%', y: '-60%', width: '220%', height: '220%' }, defs);
    el('feGaussianBlur', { stdDeviation: '5', result: 'b' }, glow);
    const merge = el('feMerge', {}, glow);
    el('feMergeNode', { in: 'b' }, merge);
    el('feMergeNode', { in: 'SourceGraphic' }, merge);

    // --- Herzkammern ------------------------------------------------------
    const body = el('g', {}, svg);

    // Große Gefäße hinter dem Herzen
    el('path', {
      d: 'M186 62 C182 22 150 12 128 20 C104 29 100 58 108 74',
      fill: 'none', stroke: '#9fb6d8', 'stroke-width': 15, 'stroke-linecap': 'round', opacity: '.55'
    }, body);
    el('path', {
      d: 'M232 58 C238 20 272 10 296 20 C320 30 322 60 312 76',
      fill: 'none', stroke: '#e08a9c', 'stroke-width': 13, 'stroke-linecap': 'round', opacity: '.5'
    }, body);

    this.ra = el('path', {
      d: 'M203 78 C203 54 178 44 143 46 C98 49 74 76 76 118 C78 158 102 180 146 181 L203 181 Z',
      fill: 'url(#hg-atria)', stroke: '#c9647c', 'stroke-width': 3, class: 'hp hp-ra'
    }, body);
    this.la = el('path', {
      d: 'M217 78 C217 54 242 44 277 46 C322 49 346 76 344 118 C342 158 318 180 274 181 L217 181 Z',
      fill: 'url(#hg-atria)', stroke: '#c9647c', 'stroke-width': 3, class: 'hp hp-la'
    }, body);
    this.rv = el('path', {
      d: 'M203 192 L128 192 C88 192 66 222 72 268 C80 330 122 386 172 410 C192 419 203 410 203 388 Z',
      fill: 'url(#hg-vent)', stroke: '#c9647c', 'stroke-width': 3, class: 'hp hp-rv'
    }, body);
    this.lv = el('path', {
      d: 'M217 192 L296 192 C340 192 362 226 354 274 C344 340 296 404 246 428 C222 439 217 424 217 398 Z',
      fill: 'url(#hg-vent)', stroke: '#c9647c', 'stroke-width': 3, class: 'hp hp-lv'
    }, body);

    // Septum
    el('path', {
      d: 'M210 70 L210 400', stroke: '#d98ba0', 'stroke-width': 9,
      'stroke-linecap': 'round', fill: 'none', opacity: '.7'
    }, body);
    // Klappenebene
    el('path', {
      d: 'M78 186 L344 186', stroke: '#c9647c', 'stroke-width': 3,
      'stroke-dasharray': '7 7', opacity: '.55'
    }, body);

    // --- Erregungsleitungssystem -----------------------------------------
    const cond = el('g', { class: 'cond' }, svg);

    // Internodale Bahnen durch die Vorhöfe
    this.pathAtria = [
      el('path', { d: 'M150 88 C130 108 118 134 122 164', fill: 'none' }, cond),
      el('path', { d: 'M150 88 C176 104 192 132 204 168', fill: 'none' }, cond),
      el('path', { d: 'M150 88 C200 74 260 78 296 104 C314 118 318 142 312 162', fill: 'none' }, cond)
    ];
    this.pathHis = el('path', { d: 'M207 186 L210 246', fill: 'none' }, cond);
    this.pathRbb = el('path', { d: 'M210 246 C196 286 176 322 152 348', fill: 'none' }, cond);
    this.pathLbb = el('path', { d: 'M210 246 C232 288 258 324 284 346', fill: 'none' }, cond);
    this.pathPurk = [
      el('path', { d: 'M152 348 C138 366 132 384 134 400', fill: 'none' }, cond),
      el('path', { d: 'M152 348 C160 372 168 390 178 404', fill: 'none' }, cond),
      el('path', { d: 'M284 346 C298 366 302 384 300 400', fill: 'none' }, cond),
      el('path', { d: 'M284 346 C276 374 266 394 254 410', fill: 'none' }, cond)
    ];

    const allCond = this.pathAtria.concat([this.pathHis, this.pathRbb, this.pathLbb], this.pathPurk);
    for (const p of allCond) {
      p.setAttribute('stroke', '#f6c344');
      p.setAttribute('stroke-width', '5');
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('class', 'cond-path');
      const L = p.getTotalLength ? p.getTotalLength() : 200;
      p._len = L;
      p.setAttribute('stroke-dasharray', L + ' ' + L);
      p.setAttribute('stroke-dashoffset', L);
    }

    // Ruhende Bahnen als blasse Spur darunter, damit der Verlauf immer sichtbar ist.
    const ghost = el('g', { class: 'cond-ghost' }, svg);
    svg.insertBefore(ghost, cond);
    for (const p of allCond) {
      el('path', {
        d: p.getAttribute('d'), fill: 'none', stroke: '#f6c344',
        'stroke-width': 5, 'stroke-linecap': 'round', opacity: '.20'
      }, ghost);
    }

    // Knotenpunkte
    this.nodeSa = el('circle', { cx: 150, cy: 88, r: 11, fill: '#f6c344',
      stroke: '#fff', 'stroke-width': 3, class: 'hnode' }, svg);
    this.nodeAv = el('circle', { cx: 207, cy: 184, r: 10, fill: '#f6c344',
      stroke: '#fff', 'stroke-width': 3, class: 'hnode' }, svg);

    if (this.o.labels) {
      // Erst alle Führungslinien, dann alle Beschriftungen — sonst zeichnen
      // die Linien über den Text.
      const lines = el('g', { class: 'hleaders' }, svg);
      const lab = el('g', { class: 'hlabels' }, svg);
      const line = (d) => el('path', { d: d, stroke: '#8a99b5', 'stroke-width': 1.6,
                                       fill: 'none', 'stroke-linecap': 'round' }, lines);
      const mk = (x, y, txt, anchor) => {
        const t = el('text', { x: x, y: y, 'text-anchor': anchor || 'start' }, lab);
        t.textContent = txt;
        return t;
      };
      line('M98 66 L140 83');
      mk(24, 60, 'Sinusknoten');
      line('M292 210 L217 189');
      mk(298, 215, 'AV-Knoten');
      line('M306 258 L215 243');
      mk(312, 263, 'His-Bündel');
      line('M78 334 L146 332');
      mk(14, 330, 'Tawara-');
      mk(14, 346, 'Schenkel');
      line('M318 400 L292 366');
      mk(336, 404, 'Purkinje-', 'middle');
      mk(336, 420, 'Fasern', 'middle');

      const ch = el('g', { class: 'hchambers' }, svg);
      const c = (x, y, txt) => { const t = el('text', { x: x, y: y, 'text-anchor': 'middle' }, ch); t.textContent = txt; };
      c(140, 130, 'RA'); c(282, 130, 'LA');
      c(136, 300, 'RV'); c(288, 300, 'LV');
    }

    if (this.o.caption !== false) {
      const cap = document.createElement('div');
      cap.className = 'heart-caption';
      cap.innerHTML = '<div class="hc-row"><span class="hc-dot"></span><strong class="hc-title">Sinusknoten</strong>' +
                      '<span class="hc-tag">Noch Nulllinie</span></div><p class="hc-text"></p>';
      this.host.appendChild(cap);
      this.cap = { title: cap.querySelector('.hc-title'), tag: cap.querySelector('.hc-tag'),
                   text: cap.querySelector('.hc-text') };
    }
  };

  // Setzt einen Pfad anteilig sichtbar (0 = leer, 1 = ganz gezeichnet).
  function drawTo(p, frac) {
    const L = p._len;
    p.setAttribute('stroke-dashoffset', L * (1 - Math.max(0, Math.min(1, frac))));
  }

  Diagram.prototype._apply = function (u) {
    const ph = phaseAt(u);
    const prog = (t) => (u - t.from) / (t.to - t.from);

    // Leitungsbahnen füllen sich nacheinander.
    const fAtria = u < 0.08 ? 0 : Math.min(1, prog(PHASES[1]) * 1.15);
    for (const p of this.pathAtria) drawTo(p, fAtria);
    drawTo(this.pathHis, u < 0.36 ? 0 : Math.min(1, (u - 0.36) / 0.07));
    const fBundle = u < 0.42 ? 0 : Math.min(1, (u - 0.42) / 0.07);
    drawTo(this.pathRbb, fBundle);
    drawTo(this.pathLbb, fBundle);
    const fPurk = u < 0.48 ? 0 : Math.min(1, (u - 0.48) / 0.06);
    for (const p of this.pathPurk) drawTo(p, fPurk);

    // Nach der Repolarisation alles zurücksetzen.
    if (u > 0.94) {
      const fade = 1 - (u - 0.94) / 0.06;
      for (const p of this.pathAtria.concat([this.pathHis, this.pathRbb, this.pathLbb], this.pathPurk)) {
        p.setAttribute('opacity', String(Math.max(0, fade)));
      }
    } else {
      for (const p of this.pathAtria.concat([this.pathHis, this.pathRbb, this.pathLbb], this.pathPurk)) {
        p.setAttribute('opacity', '1');
      }
    }

    // Knoten pulsieren, wenn sie aktiv sind.
    const saAct = u < 0.10;
    this.nodeSa.setAttribute('r', saAct ? 11 + 5 * Math.sin(Math.min(1, u / 0.10) * Math.PI) : 11);
    this.nodeSa.setAttribute('filter', saAct ? 'url(#hg-glow)' : '');
    const avAct = u >= 0.24 && u < 0.42;
    this.nodeAv.setAttribute('r', avAct ? 10 + 4 * Math.sin(prog(PHASES[2]) * Math.PI) : 10);
    this.nodeAv.setAttribute('filter', avAct ? 'url(#hg-glow)' : '');

    // Muskulatur einfärben: erregt = kräftiges Rot.
    const atriaLevel = u >= 0.08 && u < 0.30 ? Math.min(1, prog(PHASES[1]) * 1.4) : (u < 0.42 ? Math.max(0, 1 - (u - 0.30) / 0.12) : 0);
    const ventLevel = u >= 0.50 && u < 0.78 ? Math.min(1, (u - 0.50) / 0.09) : (u >= 0.78 ? Math.max(0, 1 - (u - 0.78) / 0.16) : 0);
    this.ra.style.fill = mixFill(atriaLevel);
    this.la.style.fill = mixFill(atriaLevel * 0.94);
    this.rv.style.fill = mixFill(ventLevel);
    this.lv.style.fill = mixFill(ventLevel);

    // Kammern ziehen sich sichtbar zusammen.
    const squeeze = ventLevel * 0.045;
    const tf = 'translate(210 300) scale(' + (1 - squeeze) + ' ' + (1 - squeeze * 1.5) + ') translate(-210 -300)';
    this.rv.setAttribute('transform', tf);
    this.lv.setAttribute('transform', tf);
    const asq = atriaLevel * 0.05;
    const atf = 'translate(210 120) scale(' + (1 - asq) + ') translate(-210 -120)';
    this.ra.setAttribute('transform', atf);
    this.la.setAttribute('transform', atf);

    if (this.cap && ph !== this._lastPhase) {
      this.cap.title.textContent = ph.label;
      this.cap.tag.textContent = ph.ekg;
      this.cap.text.textContent = ph.text;
    }
    if (ph !== this._lastPhase) {
      this._lastPhase = ph;
      if (this.o.onphase) this.o.onphase(ph, u);
    }
  };

  function mixFill(level) {
    // Von blassrosa (in Ruhe) nach kräftigem Rot (erregt).
    const l = Math.max(0, Math.min(1, level));
    const r = Math.round(247 + (214 - 247) * l);
    const g = Math.round(184 + (38 - 184) * l);
    const b = Math.round(197 + (72 - 197) * l);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  Diagram.prototype.setProgress = function (u) { this.u = u; this._apply(u); };

  Diagram.prototype.start = function () {
    if (this.raf || this.dead) return;
    this.o.running = true;
    let last = performance.now();
    const step = (now) => {
      if (this.dead) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      this.u = (this.u + dt / this.o.cycle) % 1;
      this._apply(this.u);
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  };

  Diagram.prototype.stop = function () {
    this.o.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  };

  Diagram.prototype.destroy = function () { this.dead = true; this.stop(); };

  global.Heart = { Diagram: Diagram, PHASES: PHASES };

})(window);
