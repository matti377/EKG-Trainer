/* ekg.js — Signalerzeugung und Darstellung von EKG-Kurven.
   Keine Abhängigkeiten, kein Build-Schritt: definiert das globale Objekt `EKG`. */
(function (global) {
  'use strict';

  /* ---------------------------------------------------------------- Zufall */

  // Deterministischer Zufallsgenerator (mulberry32), damit eine Rhythmus-ID
  // immer dieselbe Kurve erzeugt und Aufgaben reproduzierbar bleiben.
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ------------------------------------------------------------ Wellenform */

  // Alle Zeiten in Sekunden relativ zum QRS-Beginn, Amplituden in mV.
  const V_DEFAULT = {
    q:  { c: 0.010, w: 0.008, a: -0.08 },
    r:  { c: 0.030, w: 0.012, a:  1.10 },
    s:  { c: 0.057, w: 0.011, a: -0.25 },
    r2: { c: 0.075, w: 0.013, a:  0.00 },  // R' für Schenkelblöcke
    d:  { c: 0.005, w: 0.020, a:  0.00 },  // Delta-Welle bei Präexzitation
    t:  { c: 0.245, w: 0.060, a:  0.30 },
    u:  { c: 0.400, w: 0.045, a:  0.00 },
    st: 0,          // ST-Verschiebung in mV
    stEnd: 0.185,   // bis hierhin wirkt die ST-Verschiebung
    spike: 0        // Schrittmacher-Spike in mV
  };

  const P_DEFAULT = { w: 0.026, a: 0.14 };

  function vTemplate(over) {
    const t = {};
    for (const k in V_DEFAULT) {
      const v = V_DEFAULT[k];
      t[k] = typeof v === 'object' ? Object.assign({}, v) : v;
    }
    for (const k in (over || {})) {
      const v = over[k];
      t[k] = (typeof v === 'object' && t[k]) ? Object.assign(t[k], v) : v;
    }
    return t;
  }

  function bump(dt, c) {
    if (!c || !c.a) return 0;
    const z = (dt - c.c) / c.w;
    if (z < -4 || z > 4) return 0;
    return c.a * Math.exp(-z * z);
  }

  function smoothstep(x, a, b) {
    if (x <= a) return 0;
    if (x >= b) return 1;
    const t = (x - a) / (b - a);
    return t * t * (3 - 2 * t);
  }

  // Ein QRST-Komplex ab dt = 0 (QRS-Beginn).
  function evalV(tp, dt) {
    if (dt < -0.06 || dt > 0.75) return 0;
    let v = 0;
    v += bump(dt, tp.q) + bump(dt, tp.r) + bump(dt, tp.s) + bump(dt, tp.r2);
    v += bump(dt, tp.d) + bump(dt, tp.t) + bump(dt, tp.u);
    if (tp.st) {
      // Hebung/Senkung setzt am J-Punkt ein und läuft in die T-Welle aus.
      const on = smoothstep(dt, tp.stEnd - 0.09, tp.stEnd - 0.03);
      const off = 1 - smoothstep(dt, tp.t.c + tp.t.w, tp.t.c + tp.t.w * 2.4);
      v += tp.st * on * off;
    }
    if (tp.spike) {
      // Schrittmacher-Spike: sehr schmaler Ausschlag kurz vor dem QRS.
      const z = (dt + 0.012) / 0.0022;
      if (z > -4 && z < 4) v += tp.spike * Math.exp(-z * z);
    }
    return v;
  }

  function evalP(pt, dt) {
    if (dt < -0.12 || dt > 0.12) return 0;
    return bump(dt, { c: 0, w: pt.w, a: pt.a });
  }

  /* ------------------------------------------------- Rhythmus-Definitionen */

  // Jeder Generator liefert { p: [{t, tpl}], v: [{t, tpl}], base: fn(t) }.
  // p = Vorhofaktionen, v = Kammeraktionen — bewusst getrennt, damit
  // AV-Blöcke und Dissoziationen sich natürlich abbilden lassen.

  function sinusLike(opts) {
    const o = Object.assign({ rate: 70, pq: 0.16, jitter: 0, pTpl: P_DEFAULT, vTpl: {} }, opts);
    return function (dur, rand) {
      const p = [], v = [];
      const tpl = vTemplate(o.vTpl);
      const rr = 60 / o.rate;
      let t = 0.35;
      while (t < dur) {
        p.push({ t: t, tpl: o.pTpl });
        v.push({ t: t + o.pq - 0.045, tpl: tpl });
        t += rr * (1 + o.jitter * (rand() * 2 - 1));
      }
      return { p: p, v: v };
    };
  }

  function noPLike(opts) {
    const o = Object.assign({ rate: 160, jitter: 0, vTpl: {}, base: null }, opts);
    return function (dur, rand) {
      const v = [];
      const tpl = vTemplate(o.vTpl);
      const rr = 60 / o.rate;
      let t = 0.3;
      while (t < dur) {
        v.push({ t: t, tpl: tpl });
        t += rr * (1 + o.jitter * (rand() * 2 - 1));
      }
      return { p: [], v: v, base: o.base };
    };
  }

  // Flimmerwellen: Summe leicht verstimmter Sinusanteile ≈ unregelmäßige Grundlinie.
  function fibBaseline(rand) {
    const parts = [];
    for (let i = 0; i < 5; i++) {
      parts.push({ f: 5.5 + rand() * 5, a: 0.018 + rand() * 0.03, ph: rand() * 6.283 });
    }
    return function (t) {
      let s = 0;
      for (const q of parts) s += q.a * Math.sin(2 * Math.PI * q.f * t + q.ph);
      return s;
    };
  }

  // Sägezahnförmige Flatterwellen mit fester Frequenz.
  function flutterBaseline(rate, amp) {
    const f = rate / 60;
    return function (t) {
      const ph = (t * f) % 1;
      // Langsamer Anstieg, steiler Abfall — die typische Sägezahnform.
      return amp * (ph < 0.75 ? (ph / 0.75) * 2 - 1 : 1 - ((ph - 0.75) / 0.25) * 2);
    };
  }

  const GEN = {

    sinus: sinusLike({ rate: 70, pq: 0.16 }),

    sinusbradykardie: sinusLike({ rate: 44, pq: 0.17 }),

    sinustachykardie: sinusLike({ rate: 130, pq: 0.14,
      vTpl: { t: { c: 0.205, w: 0.048 } } }),

    // Respiratorische Sinusarrhythmie: RR schwankt mit der Atmung.
    sinusarrhythmie: function (dur, rand) {
      const p = [], v = [], tpl = vTemplate({});
      let t = 0.35;
      while (t < dur) {
        p.push({ t: t, tpl: P_DEFAULT });
        v.push({ t: t + 0.115, tpl: tpl });
        t += (60 / 72) * (1 + 0.22 * Math.sin(t * 1.3));
      }
      return { p: p, v: v };
    },

    // Absolute Arrhythmie ohne P-Wellen, dazu grobe Flimmerwellen.
    vorhofflimmern: function (dur, rand) {
      const v = [], tpl = vTemplate({});
      let t = 0.3;
      while (t < dur) {
        v.push({ t: t, tpl: tpl });
        t += 0.42 + rand() * 0.62;
      }
      return { p: [], v: v, base: fibBaseline(rand) };
    },

    // Typisches Flattern mit 300/min und 2:1-Überleitung → 150/min Kammerfrequenz.
    vorhofflattern: function (dur, rand) {
      const v = [], tpl = vTemplate({ t: { a: 0.16, c: 0.23 } });
      let t = 0.3;
      while (t < dur) { v.push({ t: t, tpl: tpl }); t += 0.4; }
      return { p: [], v: v, base: flutterBaseline(300, 0.13) };
    },

    avnrt: noPLike({ rate: 180, vTpl: { t: { c: 0.185, w: 0.040, a: 0.18 } } }),

    // SA-Block II° Typ 1 (Wenckebach): Die Überleitung vom Sinusknoten ins
    // Vorhofmyokard wird träger. Weil der Zuwachs der Verzögerung abnimmt,
    // werden die PP-Abstände vor der Pause paradoxerweise *kürzer*.
    // Dann fällt eine komplette Aktion aus — P-Welle *und* QRS.
    sa_block_wenckebach: function (dur, rand) {
      const p = [], v = [], tpl = vTemplate({});
      const pp = [0.98, 0.90, 0.85];   // wird kürzer
      let t = 0.3, i = 0;
      while (t < dur) {
        p.push({ t: t, tpl: P_DEFAULT });
        v.push({ t: t + 0.115, tpl: tpl });
        const step = pp[i % pp.length];
        // Nach dem letzten Schlag der Periode bleibt eine Aktion ganz aus.
        t += (i % pp.length === pp.length - 1) ? step + 0.80 : step;
        i++;
      }
      return { p: p, v: v };
    },

    // SA-Block II° Typ 2 (Mobitz): PP-Abstände völlig regelmäßig, dann fällt
    // eine komplette Aktion aus. Die Pause ist genau doppelt so lang.
    sa_block_mobitz: function (dur, rand) {
      const p = [], v = [], tpl = vTemplate({});
      const pp = 0.86;
      let t = 0.3, i = 0;
      while (t < dur) {
        p.push({ t: t, tpl: P_DEFAULT });
        v.push({ t: t + 0.115, tpl: tpl });
        t += (i % 4 === 3) ? pp * 2 : pp;   // jede 4. Aktion entfällt
        i++;
      }
      return { p: p, v: v };
    },

    // WPW: kurze PQ-Zeit *und* Delta-Welle — die Kammer wird über ein
    // akzessorisches Bündel vorzeitig erregt, der QRS wird dadurch breiter.
    wpw: sinusLike({
      rate: 72, pq: 0.10,
      vTpl: {
        q: { a: 0 },
        d: { c: 0.014, w: 0.021, a: 0.34 },   // träger Anstieg = Delta-Welle
        r: { c: 0.058, w: 0.014, a: 1.05 },
        s: { c: 0.086, w: 0.012, a: -0.20 },
        t: { c: 0.265, w: 0.062, a: -0.22 },  // diskordante T-Welle
        stEnd: 0.215
      }
    }),

    // LGL: ebenfalls kurze PQ-Zeit, aber der QRS bleibt schmal —
    // die Bahn umgeht den AV-Knoten und mündet vor der Kammer.
    lgl: sinusLike({ rate: 70, pq: 0.10 }),

    // AV-Block I°: jede P-Welle wird übergeleitet, aber verzögert.
    avblock1: sinusLike({ rate: 68, pq: 0.30 }),

    // Wenckebach: PQ wird von Schlag zu Schlag länger, dann fällt ein QRS aus.
    avblock2_wenckebach: function (dur, rand) {
      const p = [], v = [], tpl = vTemplate({});
      const pqs = [0.16, 0.24, 0.34, null];   // null = Ausfall
      const rr = 60 / 78;
      let t = 0.35, i = 0;
      while (t < dur) {
        p.push({ t: t, tpl: P_DEFAULT });
        const pq = pqs[i % pqs.length];
        if (pq !== null) v.push({ t: t + pq - 0.045, tpl: tpl });
        i++; t += rr;
      }
      return { p: p, v: v };
    },

    // Mobitz II: PQ konstant, jede 3. P-Welle wird plötzlich blockiert.
    avblock2_mobitz: function (dur, rand) {
      const p = [], v = [], tpl = vTemplate({});
      const rr = 60 / 84;
      let t = 0.35, i = 0;
      while (t < dur) {
        p.push({ t: t, tpl: P_DEFAULT });
        if (i % 3 !== 2) v.push({ t: t + 0.135, tpl: tpl });
        i++; t += rr;
      }
      return { p: p, v: v };
    },

    // Totaler Block: Vorhöfe und Kammern laufen völlig unabhängig.
    avblock3: function (dur, rand) {
      const p = [], v = [];
      const tpl = vTemplate({
        q: { a: -0.04 }, r: { c: 0.045, w: 0.030, a: 0.85 },
        s: { c: 0.105, w: 0.026, a: -0.30 },
        t: { c: 0.320, w: 0.075, a: -0.24 }
      });
      let t = 0.2;
      while (t < dur) { p.push({ t: t, tpl: P_DEFAULT }); t += 60 / 88; }
      t = 0.55;
      while (t < dur) { v.push({ t: t, tpl: tpl }); t += 60 / 37; }
      return { p: p, v: v };
    },

    // Ventrikuläre Extrasystole mit kompensatorischer Pause.
    ves: function (dur, rand) {
      const p = [], v = [];
      const norm = vTemplate({});
      const wide = vTemplate({
        q: { a: 0 }, r: { c: 0.055, w: 0.038, a: 1.45 },
        s: { c: 0.130, w: 0.030, a: -0.55 },
        t: { c: 0.330, w: 0.080, a: -0.45 }
      });
      const rr = 60 / 72;
      let t = 0.35, i = 0;
      while (t < dur) {
        if (i % 4 === 3) {
          // Vorzeitig, ohne vorangehende P-Welle, danach volle Pause.
          v.push({ t: t - rr * 0.42, tpl: wide });
          t += rr;
        } else {
          p.push({ t: t, tpl: P_DEFAULT });
          v.push({ t: t + 0.115, tpl: norm });
        }
        i++; t += rr;
      }
      return { p: p, v: v };
    },

    // Supraventrikuläre Extrasystole: vorzeitig, aber schmaler Kammerkomplex.
    sves: function (dur, rand) {
      const p = [], v = [], norm = vTemplate({});
      const rr = 60 / 70;
      let t = 0.35, i = 0;
      while (t < dur) {
        if (i % 5 === 4) {
          const te = t - rr * 0.38;
          p.push({ t: te, tpl: { w: 0.024, a: -0.09 } });  // abweichende P'-Welle
          v.push({ t: te + 0.115, tpl: norm });
          t += rr * 0.62 + rr * 0.5;
        } else {
          p.push({ t: t, tpl: P_DEFAULT });
          v.push({ t: t + 0.115, tpl: norm });
          t += rr;
        }
        i++;
      }
      return { p: p, v: v };
    },

    kammertachykardie: noPLike({
      rate: 190,
      vTpl: {
        q: { a: 0 }, r: { c: 0.060, w: 0.042, a: 1.30 },
        s: { c: 0.145, w: 0.034, a: -0.70 },
        t: { c: 0.250, w: 0.055, a: -0.30 }
      }
    }),

    // Torsade de pointes: undulierende Achse um die Grundlinie.
    torsade: function (dur, rand) {
      const v = [];
      let t = 0.3, i = 0;
      while (t < dur) {
        const env = Math.sin(i * 0.34);
        v.push({ t: t, tpl: vTemplate({
          q: { a: 0 },
          r: { c: 0.055, w: 0.040, a: 1.25 * env },
          s: { c: 0.130, w: 0.032, a: -0.55 * env },
          t: { a: 0 }
        }) });
        i++; t += 0.245;
      }
      return { p: [], v: v };
    },

    // Kammerflimmern: keine abgrenzbaren Komplexe, nur chaotische Aktivität.
    kammerflimmern: function (dur, rand) {
      const parts = [];
      for (let i = 0; i < 7; i++) {
        parts.push({ f: 3.5 + rand() * 6.5, a: 0.12 + rand() * 0.30, ph: rand() * 6.283 });
      }
      return { p: [], v: [], base: function (t) {
        let s = 0;
        for (const q of parts) s += q.a * Math.sin(2 * Math.PI * q.f * t + q.ph);
        return s * (0.75 + 0.25 * Math.sin(t * 0.9));
      } };
    },

    asystolie: function (dur, rand) {
      return { p: [], v: [], base: function (t) {
        return 0.012 * Math.sin(t * 21.3) + 0.008 * Math.sin(t * 7.1);
      } };
    },

    // Rechtsschenkelblock: rSR' in V1, QRS ≥ 0,12 s.
    rechtsschenkelblock: sinusLike({
      rate: 70, pq: 0.16,
      vTpl: {
        q: { a: -0.05 }, r: { c: 0.028, w: 0.013, a: 0.55 },
        s: { c: 0.058, w: 0.013, a: -0.35 },
        r2: { c: 0.095, w: 0.020, a: 0.95 },
        t: { c: 0.280, w: 0.062, a: -0.22 },
        stEnd: 0.220
      }
    }),

    // Linksschenkelblock: breites, plumpes R mit diskordanter T-Welle.
    linksschenkelblock: sinusLike({
      rate: 70, pq: 0.16,
      vTpl: {
        q: { a: 0 }, r: { c: 0.058, w: 0.040, a: 1.15 },
        s: { c: 0.120, w: 0.022, a: -0.18 },
        t: { c: 0.310, w: 0.075, a: -0.42 },
        st: -0.06, stEnd: 0.230
      }
    }),

    // STEMI: Die Hebung geht direkt aus dem *absteigenden R-Schenkel* hervor —
    // die Kurve erreicht die Nulllinie gar nicht erst, eine S-Zacke fehlt.
    stemi: sinusLike({
      rate: 88, pq: 0.16,
      vTpl: {
        s: { a: -0.04 },
        st: 0.42, stEnd: 0.135,
        t: { c: 0.255, w: 0.070, a: 0.34 }
      }
    }),

    // Ausgeprägte Hebung mit beginnender Q-Zacke (späteres Infarktstadium).
    stemi_spaet: sinusLike({
      rate: 82, pq: 0.16,
      vTpl: {
        q: { c: 0.014, w: 0.014, a: -0.42 }, r: { a: 0.55 },
        st: 0.30, t: { c: 0.260, w: 0.072, a: 0.20 }
      }
    }),

    // NSTEMI-Bild: horizontale ST-Senkung plus präterminal negatives T.
    nstemi: sinusLike({
      rate: 92, pq: 0.16,
      vTpl: { st: -0.22, t: { c: 0.255, w: 0.062, a: -0.32 } }
    }),

    // Hyperkaliämie: hohe, spitze, "zeltförmige" T-Wellen, flache P-Welle.
    hyperkaliaemie: sinusLike({
      rate: 66, pq: 0.20, pTpl: { w: 0.030, a: 0.04 },
      vTpl: {
        r: { w: 0.016 }, s: { c: 0.065, w: 0.015 },
        t: { c: 0.235, w: 0.030, a: 0.95 }
      }
    }),

    // Hypokaliämie: flaches T, deutliche U-Welle nach dem T.
    hypokaliaemie: sinusLike({
      rate: 74, pq: 0.17,
      vTpl: {
        t: { c: 0.245, w: 0.055, a: 0.07 },
        u: { c: 0.365, w: 0.050, a: 0.20 },
        st: -0.06
      }
    }),

    // Verlängerte QT-Zeit — Substrat für Torsade de pointes.
    langes_qt: sinusLike({
      rate: 62, pq: 0.16,
      vTpl: { t: { c: 0.420, w: 0.085, a: 0.26 } }
    }),

    // Digitalis: muldenförmige ST-Senkung ("Lyszeichen").
    digitalis: sinusLike({
      rate: 60, pq: 0.21,
      vTpl: { st: -0.13, t: { c: 0.230, w: 0.048, a: -0.06 } }
    }),

    // Perikarditis: Die S-Zacke ist voll ausgebildet, die Hebung entsteht erst
    // aus dem *aufsteigenden S-Schenkel* — konkav, wie eine Hängematte.
    perikarditis: sinusLike({
      rate: 96, pq: 0.15,
      vTpl: {
        s: { c: 0.058, w: 0.012, a: -0.34 },
        st: 0.15, stEnd: 0.205,
        t: { c: 0.270, w: 0.065, a: 0.26 }
      }
    }),

    // Kammerstimulation: Spike vor jedem breiten Komplex.
    schrittmacher: sinusLike({
      rate: 72, pq: 0.16, pTpl: { w: 0.026, a: 0.05 },
      vTpl: {
        spike: 1.05,
        q: { a: 0 }, r: { c: 0.058, w: 0.038, a: 1.05 },
        s: { c: 0.128, w: 0.026, a: -0.30 },
        t: { c: 0.320, w: 0.075, a: -0.38 }
      }
    })
  };

  /* --------------------------------------------------------- Signal-Objekt */

  const SIG_CACHE = {};

  // Erzeugt ein abgetastetes Signal fester Länge und legt es im Cache ab.
  function signal(rhythm, opts) {
    opts = opts || {};
    const dur = opts.duration || 30;
    const key = rhythm + '|' + dur + '|' + (opts.seed || 1);
    if (SIG_CACHE[key]) return SIG_CACHE[key];

    const gen = GEN[rhythm] || GEN.sinus;
    const rand = rng(hash(rhythm) + (opts.seed || 1) * 7919);
    const parts = gen(dur, rand);

    const SR = 500;                       // Abtastrate in Hz
    const n = Math.ceil(dur * SR);
    const data = new Float32Array(n);

    for (let i = 0; i < n; i++) {
      const t = i / SR;
      let val = parts.base ? parts.base(t) : 0;
      for (const e of parts.p) {
        const dt = t - e.t;
        if (dt > -0.12 && dt < 0.12) val += evalP(e.tpl, dt);
      }
      for (const e of parts.v) {
        const dt = t - e.t;
        if (dt > -0.06 && dt < 0.75) val += evalV(e.tpl, dt);
      }
      data[i] = val;
    }

    const out = { data: data, sr: SR, duration: dur, rhythm: rhythm, events: parts };
    SIG_CACHE[key] = out;
    return out;
  }

  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  // Legt einen frei parametrierbaren Rhythmus an (für das Labor) und verwirft
  // die zwischengespeicherten Signale dieser ID.
  function defineCustom(id, cfg) {
    GEN[id] = sinusLike(cfg);
    for (const k in SIG_CACHE) {
      if (k.indexOf(id + '|') === 0) delete SIG_CACHE[k];
    }
  }

  function sampleAt(sig, t) {
    // Signale sind zyklisch: das Band läuft am Ende wieder von vorn los.
    let x = t % sig.duration;
    if (x < 0) x += sig.duration;
    const i = x * sig.sr;
    const i0 = Math.floor(i);
    const i1 = (i0 + 1) % sig.data.length;
    const f = i - i0;
    return sig.data[i0] * (1 - f) + sig.data[i1] * f;
  }

  /* ------------------------------------------------------------- Zeichnung */

  const THEMES = {
    monitor: { bg: '#08131f', fine: 'rgba(90,175,220,.11)', bold: 'rgba(90,175,220,.24)',
               trace: '#3ef58f', glow: 'rgba(62,245,143,.55)', text: 'rgba(190,225,245,.75)' },
    paper:   { bg: '#fff6f6', fine: 'rgba(232,120,130,.32)', bold: 'rgba(226,80,95,.55)',
               trace: '#16202e', glow: 'rgba(0,0,0,0)', text: 'rgba(60,75,95,.8)' }
  };

  /**
   * Zeichnet ein durchlaufendes EKG-Band auf ein Canvas.
   *
   * @param {HTMLCanvasElement} canvas
   * @param {Object} opts  rhythm, speed (mm/s), gain (mm/mV), theme, running,
   *                       height (mV sichtbar), showLabels
   */
  function Scope(canvas, opts) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.o = Object.assign({
      rhythm: 'sinus', speed: 25, gain: 10, theme: 'monitor',
      running: true, mvRange: 3.2, seed: 1, duration: 30, cursor: true
    }, opts || {});
    this.sig = signal(this.o.rhythm, { seed: this.o.seed, duration: this.o.duration });
    this.t = 0;
    this.raf = null;
    this.last = 0;
    this.dead = false;
    this.onbeat = null;
    this._lastBeatIdx = -1;
    this.resize();
    this._boundResize = this.resize.bind(this);
    global.addEventListener('resize', this._boundResize);
    if (this.o.running) this.start(); else this.draw();
  }

  Scope.prototype.setRhythm = function (r) {
    if (r === this.o.rhythm) return;
    this.o.rhythm = r;
    this.sig = signal(r, { seed: this.o.seed, duration: this.o.duration });
    this.t = 0;
    this._lastBeatIdx = -1;
    if (!this.o.running) this.draw();
  };

  Scope.prototype.set = function (k, v) {
    this.o[k] = v;
    if (!this.o.running) this.draw();
  };

  // Signal neu aufbauen, ohne die Rhythmus-ID zu wechseln (nach defineCustom).
  Scope.prototype.refresh = function () {
    this.sig = signal(this.o.rhythm, { seed: this.o.seed, duration: this.o.duration });
    this._lastBeatIdx = -1;
    if (!this.o.running) this.draw();
  };

  Scope.prototype.resize = function () {
    const dpr = Math.min(global.devicePixelRatio || 1, 2.5);
    const r = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    if (this._w === w && this._h === h && this._dpr === dpr) return;
    this._w = w; this._h = h; this._dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  };

  Scope.prototype.start = function () {
    if (this.raf || this.dead) return;
    this.o.running = true;
    this.last = performance.now();
    const step = (now) => {
      if (this.dead) return;
      const dt = Math.min((now - this.last) / 1000, 0.1);
      this.last = now;
      this.t += dt;
      this._fireBeats();
      this.draw();
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  };

  Scope.prototype.stop = function () {
    this.o.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  };

  Scope.prototype.destroy = function () {
    this.dead = true;
    this.stop();
    global.removeEventListener('resize', this._boundResize);
  };

  // Meldet R-Zacken, sobald sie den Cursor passieren (für Ton & Herz-Animation).
  Scope.prototype._fireBeats = function () {
    if (!this.onbeat) return;
    const ev = this.sig.events.v;
    if (!ev.length) return;
    const cycle = Math.floor(this.t / this.sig.duration);
    const local = this.t - cycle * this.sig.duration;
    for (let i = 0; i < ev.length; i++) {
      const bt = ev[i].t + 0.03;
      const idx = cycle * 100000 + i;
      if (local >= bt && local < bt + 0.15 && idx !== this._lastBeatIdx) {
        this._lastBeatIdx = idx;
        this.onbeat(ev[i]);
        break;
      }
    }
  };

  Scope.prototype.draw = function () {
    const ctx = this.ctx, w = this._w, h = this._h;
    if (!w || !h) return;
    const th = THEMES[this.o.theme] || THEMES.monitor;

    // Maßstab: 1 mm entspricht mmPx Pixeln, abgeleitet aus der Höhe.
    const mmPx = h / (this.o.mvRange * this.o.gain);
    const pxPerSec = this.o.speed * mmPx;
    const mid = h * 0.55;

    ctx.fillStyle = th.bg;
    ctx.fillRect(0, 0, w, h);

    // Das Raster wandert mit dem Papier mit.
    const off = -(this.t * pxPerSec) % (mmPx * 5);
    ctx.lineWidth = 1;
    ctx.strokeStyle = th.fine;
    ctx.beginPath();
    for (let x = off % mmPx; x < w; x += mmPx) {
      ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, h);
    }
    for (let y = mid % mmPx; y < h; y += mmPx) {
      ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(w, Math.round(y) + 0.5);
    }
    ctx.stroke();

    ctx.strokeStyle = th.bold;
    ctx.beginPath();
    for (let x = off; x < w; x += mmPx * 5) {
      ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, h);
    }
    for (let y = mid % (mmPx * 5); y < h; y += mmPx * 5) {
      ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(w, Math.round(y) + 0.5);
    }
    ctx.stroke();

    // Kurve
    const t0 = this.t;
    ctx.lineWidth = this.o.theme === 'paper' ? 1.9 : 2.1;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    if (th.glow !== 'rgba(0,0,0,0)') {
      ctx.shadowColor = th.glow;
      ctx.shadowBlur = 9;
    }
    ctx.strokeStyle = th.trace;
    ctx.beginPath();
    for (let x = 0; x <= w; x++) {
      const t = t0 + x / pxPerSec;
      const y = mid - sampleAt(this.sig, t) * this.o.gain * mmPx;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (this.o.label) {
      ctx.fillStyle = th.text;
      ctx.font = '600 11px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(this.o.label, 10, 16);
    }
  };

  /* ------------------------------------------- Einzelschlag (statisch, groß) */

  /**
   * Zeichnet genau einen Herzzyklus formatfüllend — für Anatomie-Erklärungen
   * und die Beschriftungs-Aufgaben. Liefert die Pixelgrenzen der Abschnitte.
   */
  function drawSingleBeat(canvas, opts) {
    opts = Object.assign({ theme: 'paper', tpl: {}, pq: 0.16, pAmp: 0.14,
                           highlight: null, dim: false }, opts || {});
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(global.devicePixelRatio || 1, 2.5);
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const th = THEMES[opts.theme] || THEMES.paper;
    const tpl = vTemplate(opts.tpl);

    // Zeitfenster: von vor der P-Welle bis hinter die T-Welle.
    const pAt = -(opts.pq - 0.045);
    const tFrom = pAt - 0.10, tTo = 0.50;
    const beatSpan = tTo - tFrom;

    const val = (t) => evalV(tpl, t) + evalP({ w: 0.026, a: opts.pAmp }, t - pAt);

    // Amplituden abtasten, damit sich die Kurve immer formatfüllend einpasst.
    let vMin = 0, vMax = 0;
    for (let t = tFrom; t <= tTo; t += 0.002) {
      const v = val(t);
      if (v < vMin) vMin = v;
      if (v > vMax) vMax = v;
    }
    const vSpan = Math.max(0.8, vMax - vMin);

    // Erst die Höhe ausnutzen, dann prüfen, ob der Schlag auch in die Breite passt.
    // Das Raster bleibt dabei quadratisch — sonst stimmten die Kästchen nicht mehr.
    let gain = (h * 0.80) / vSpan;             // Pixel pro mV
    let pxPerSec = (gain / 10) * 25;           // 10 mm/mV bei 25 mm/s
    if (w / pxPerSec < beatSpan) {
      pxPerSec = w / beatSpan;
      gain = (pxPerSec / 25) * 10;
    }
    const mmPx = gain / 10;
    const mid = h * 0.10 + vMax * gain;
    const visSpan = w / pxPerSec;
    const tLeft = tFrom - (visSpan - beatSpan) / 2;

    ctx.fillStyle = th.bg; ctx.fillRect(0, 0, w, h);

    const xOf = (t) => (t - tLeft) * pxPerSec;

    ctx.lineWidth = 1;
    ctx.strokeStyle = th.fine; ctx.beginPath();
    for (let x = xOf(0) % mmPx; x < w; x += mmPx) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
    for (let y = mid % mmPx; y < h; y += mmPx) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
    ctx.stroke();
    ctx.strokeStyle = th.bold; ctx.beginPath();
    for (let x = xOf(0) % (mmPx * 5); x < w; x += mmPx * 5) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
    for (let y = mid % (mmPx * 5); y < h; y += mmPx * 5) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
    ctx.stroke();

    // Anatomische Abschnitte in Sekunden — Grundlage für Beschriftung & Treffer.
    const zones = {
      p:   { from: pAt - 0.055, to: pAt + 0.055, name: 'P-Welle' },
      pq:  { from: pAt + 0.055, to: -0.002,      name: 'PQ-Strecke' },
      qrs: { from: -0.002,      to: 0.082,       name: 'QRS-Komplex' },
      st:  { from: 0.082,       to: 0.175,       name: 'ST-Strecke' },
      t:   { from: 0.175,       to: 0.345,       name: 'T-Welle' }
    };

    if (opts.highlight && zones[opts.highlight]) {
      const z = zones[opts.highlight];
      ctx.fillStyle = 'rgba(124,92,255,.16)';
      ctx.fillRect(xOf(z.from), 4, (z.to - z.from) * pxPerSec, h - 8);
      ctx.strokeStyle = 'rgba(124,92,255,.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(xOf(z.from), 4, (z.to - z.from) * pxPerSec, h - 8);
    }

    ctx.lineWidth = 2.6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = th.trace;
    ctx.beginPath();
    for (let x = 0; x <= w; x++) {
      const t = tLeft + x / pxPerSec;
      const y = mid - val(t) * gain;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const keys = Object.keys(zones);
    const px = {}, hit = {};
    keys.forEach(function (k, i) {
      px[k] = { x0: xOf(zones[k].from), x1: xOf(zones[k].to), name: zones[k].name };
      // Für Klicks reichen die äußeren Abschnitte bis an den Rand — so landet
      // jeder Tipp auf der Fläche in einem Abschnitt.
      hit[k] = {
        x0: i === 0 ? 0 : xOf(zones[k].from),
        x1: i === keys.length - 1 ? w : xOf(zones[k].to),
        name: zones[k].name
      };
    });
    return { zones: px, hit: hit, width: w, height: h, xOf: xOf, mid: mid, gain: gain, mmPx: mmPx };
  }

  /* ------------------------------------------- Streifen mit festem Maßstab */

  /**
   * Zeichnet mehrere Schläge eines regelmäßigen Rhythmus mit *fest
   * vorgegebenem* Amplitudenmaßstab. Genau das braucht man beim Vergleich
   * mehrerer Ableitungen: Nur wenn alle Felder denselben Maßstab haben,
   * ist der R-Aufbau von V1 nach V6 überhaupt ablesbar.
   */
  function drawStrip(canvas, opts) {
    opts = Object.assign({
      theme: 'paper', tpl: {}, pq: 0.16, pAmp: 0.14, rate: 70,
      seconds: 1.9, mvTop: 1.8, mvBot: -1.6, label: null
    }, opts || {});

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(global.devicePixelRatio || 1, 2.5);
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const th = THEMES[opts.theme] || THEMES.paper;
    const tpl = vTemplate(opts.tpl);
    const pAt = -(opts.pq - 0.045);
    const rr = 60 / opts.rate;

    const gain = h / (opts.mvTop - opts.mvBot);      // Pixel pro mV
    const mid = opts.mvTop * gain;                    // Nulllinie
    const pxPerSec = w / opts.seconds;
    const mmPx = gain / 10;

    // Etwas vor dem ersten Schlag beginnen, damit dessen P-Welle nicht
    // am linken Rand abgeschnitten wird.
    const t0 = pAt - 0.10;
    const nBeats = Math.ceil(opts.seconds / rr);

    const val = function (t) {
      let v = 0;
      // Nachbarschläge mitrechnen, damit die Ränder stimmen.
      for (let k = -2; k <= nBeats + 2; k++) {
        const b = k * rr;
        v += evalV(tpl, t - b);
        v += evalP({ w: 0.026, a: opts.pAmp }, t - b - pAt);
      }
      return v;
    };

    ctx.fillStyle = th.bg; ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 1;
    ctx.strokeStyle = th.fine; ctx.beginPath();
    for (let x = 0; x < w; x += mmPx) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
    for (let y = mid % mmPx; y < h; y += mmPx) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
    ctx.stroke();
    ctx.strokeStyle = th.bold; ctx.beginPath();
    for (let x = 0; x < w; x += mmPx * 5) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
    for (let y = mid % (mmPx * 5); y < h; y += mmPx * 5) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
    ctx.stroke();

    ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = th.trace;
    ctx.beginPath();
    for (let x = 0; x <= w; x++) {
      const t = t0 + x / pxPerSec;
      const y = Math.max(-40, Math.min(h + 40, mid - val(t) * gain));
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    if (opts.label) {
      ctx.fillStyle = 'rgba(20,36,63,.82)';
      ctx.font = '900 12px ui-rounded, system-ui, sans-serif';
      ctx.fillText(opts.label, 7, 16);
    }
    return { gain: gain, mid: mid, mmPx: mmPx };
  }

  /* ---------------------------------------- Brustwand-Ableitungssätze V1–V6 */

  // Jeder Satz beschreibt, wie derselbe Herzschlag in V1 bis V6 aussieht.
  const LEAD_SETS = {

    // Normaler R-Aufbau: R wächst von V1 nach V5, S wird flacher.
    // Umschlagzone (R = S) liegt normal in V3/V4.
    normal: [
      { id: 'V1', tpl: { q: { a: 0 }, r: { a: 0.16 }, s: { a: -1.05 }, t: { a: 0.14 } } },
      { id: 'V2', tpl: { q: { a: 0 }, r: { a: 0.40 }, s: { a: -1.40 }, t: { a: 0.48 } } },
      { id: 'V3', tpl: { q: { a: 0 }, r: { a: 0.80 }, s: { a: -0.85 }, t: { a: 0.44 } } },
      { id: 'V4', tpl: { q: { a: -0.04 }, r: { a: 1.35 }, s: { a: -0.45 }, t: { a: 0.38 } } },
      { id: 'V5', tpl: { q: { a: -0.07 }, r: { a: 1.55 }, s: { a: -0.22 }, t: { a: 0.32 } } },
      { id: 'V6', tpl: { q: { a: -0.09 }, r: { a: 1.25 }, s: { a: -0.10 }, t: { a: 0.26 } } }
    ],

    // Benennung der Ausschläge: Großbuchstabe = großer Ausschlag,
    // Kleinbuchstabe = kleiner Ausschlag.
    nomenklatur: [
      { id: 'qRs', tpl: { q: { a: -0.12 }, r: { a: 1.40 }, s: { a: -0.22 }, t: { a: 0.30 } } },
      { id: 'Rs',  tpl: { q: { a: 0 }, r: { a: 1.50 }, s: { a: -0.20 }, t: { a: 0.30 } } },
      { id: 'rS',  tpl: { q: { a: 0 }, r: { a: 0.22 }, s: { a: -1.35 }, t: { a: 0.22 } } },
      { id: 'QS',  tpl: { q: { c: 0.048, w: 0.032, a: -1.45 }, r: { a: 0 }, s: { a: 0 }, t: { a: 0.24 } } },
      { id: 'rSR\'', tpl: { q: { a: 0 }, r: { c: 0.026, w: 0.013, a: 0.45 }, s: { c: 0.056, w: 0.013, a: -0.42 },
                            r2: { c: 0.096, w: 0.021, a: 1.05 }, t: { c: 0.285, a: -0.26 }, stEnd: 0.225 } },
      { id: 'QR',  tpl: { q: { c: 0.016, w: 0.016, a: -0.62 }, r: { c: 0.048, w: 0.014, a: 1.10 },
                          s: { a: 0 }, t: { a: 0.26 } } }
    ],

    // Gestörter R-Aufbau mit Q-Zacken — Bild nach abgelaufenem Vorderwandinfarkt.
    r_verlust: [
      { id: 'V1', tpl: { q: { c: 0.014, w: 0.014, a: -0.55 }, r: { a: 0.04 }, s: { a: -0.55 }, t: { a: -0.16 } } },
      { id: 'V2', tpl: { q: { c: 0.014, w: 0.015, a: -0.70 }, r: { a: 0.08 }, s: { a: -0.60 }, t: { a: -0.22 } } },
      { id: 'V3', tpl: { q: { c: 0.014, w: 0.015, a: -0.65 }, r: { a: 0.12 }, s: { a: -0.50 }, t: { a: -0.26 } } },
      { id: 'V4', tpl: { q: { c: 0.014, w: 0.014, a: -0.50 }, r: { a: 0.22 }, s: { a: -0.35 }, t: { a: -0.20 } } },
      { id: 'V5', tpl: { q: { a: -0.12 }, r: { a: 0.95 }, s: { a: -0.20 }, t: { a: 0.18 } } },
      { id: 'V6', tpl: { q: { a: -0.10 }, r: { a: 1.10 }, s: { a: -0.10 }, t: { a: 0.22 } } }
    ],

    // Rechtsschenkelblock: rSR' ("M") in V1/V2, breites plumpes S in V5/V6.
    rsb: [
      { id: 'V1', tpl: { q: { a: 0 }, r: { c: 0.026, w: 0.013, a: 0.50 }, s: { c: 0.056, w: 0.013, a: -0.40 },
                         r2: { c: 0.096, w: 0.021, a: 1.00 }, t: { c: 0.285, a: -0.30 }, stEnd: 0.225 } },
      { id: 'V2', tpl: { q: { a: 0 }, r: { c: 0.026, w: 0.013, a: 0.42 }, s: { c: 0.056, w: 0.013, a: -0.55 },
                         r2: { c: 0.096, w: 0.021, a: 0.80 }, t: { c: 0.285, a: -0.20 }, stEnd: 0.225 } },
      { id: 'V3', tpl: { q: { a: 0 }, r: { a: 0.80 }, s: { c: 0.078, w: 0.026, a: -0.75 }, t: { c: 0.275, a: 0.30 }, stEnd: 0.225 } },
      { id: 'V4', tpl: { q: { a: -0.05 }, r: { a: 1.20 }, s: { c: 0.082, w: 0.028, a: -0.60 }, t: { c: 0.275, a: 0.30 }, stEnd: 0.225 } },
      { id: 'V5', tpl: { q: { a: -0.07 }, r: { a: 1.35 }, s: { c: 0.086, w: 0.030, a: -0.52 }, t: { c: 0.275, a: 0.26 }, stEnd: 0.225 } },
      { id: 'V6', tpl: { q: { a: -0.08 }, r: { a: 1.15 }, s: { c: 0.090, w: 0.032, a: -0.48 }, t: { c: 0.275, a: 0.24 }, stEnd: 0.225 } }
    ],

    // Linksschenkelblock: tiefes QS in V1–V3, breites plumpes R in V5/V6.
    lsb: [
      { id: 'V1', tpl: { q: { c: 0.050, w: 0.036, a: -1.40 }, r: { a: 0 }, s: { a: 0 },
                         t: { c: 0.310, w: 0.075, a: 0.40 }, st: 0.10, stEnd: 0.235 } },
      { id: 'V2', tpl: { q: { c: 0.050, w: 0.038, a: -1.55 }, r: { a: 0 }, s: { a: 0 },
                         t: { c: 0.310, w: 0.075, a: 0.44 }, st: 0.12, stEnd: 0.235 } },
      { id: 'V3', tpl: { q: { c: 0.052, w: 0.038, a: -1.30 }, r: { a: 0.10 }, s: { a: 0 },
                         t: { c: 0.310, w: 0.075, a: 0.38 }, st: 0.10, stEnd: 0.235 } },
      { id: 'V4', tpl: { q: { a: 0 }, r: { c: 0.056, w: 0.038, a: 0.75 }, s: { c: 0.118, w: 0.020, a: -0.30 },
                         t: { c: 0.310, w: 0.075, a: -0.30 }, stEnd: 0.235 } },
      { id: 'V5', tpl: { q: { a: 0 }, r: { c: 0.058, w: 0.040, a: 1.30 }, r2: { c: 0.098, w: 0.026, a: 0.35 },
                         s: { a: 0 }, t: { c: 0.315, w: 0.078, a: -0.42 }, st: -0.07, stEnd: 0.240 } },
      { id: 'V6', tpl: { q: { a: 0 }, r: { c: 0.058, w: 0.042, a: 1.20 }, r2: { c: 0.100, w: 0.028, a: 0.30 },
                         s: { a: 0 }, t: { c: 0.315, w: 0.078, a: -0.40 }, st: -0.07, stEnd: 0.240 } }
    ]
  };

  /* ------------------------------------------------ Lagetyp → Ableitungen */

  // Blickrichtung der Extremitätenableitungen in der Frontalebene.
  const LIMB_ANGLE = { I: 0, II: 60, III: 120, aVR: -150, aVL: -30, aVF: 90 };

  /**
   * Erzeugt aus einer elektrischen Herzachse die passenden QRS-Formen.
   *
   * Jede Ableitung misst nur den Anteil des Hauptvektors, der auf sie zuläuft:
   * Ausschlag = cos(Achse − Ableitungswinkel). Steht der Vektor senkrecht auf
   * einer Ableitung, wird deren Komplex gleichschenklig (isoelektrisch).
   *
   * @param {number} alpha  Herzachse in Grad (positiv = nach unten)
   * @param {string[]} ids  z. B. ['I','II','III']
   */
  function axisLeads(alpha, ids) {
    ids = ids || ['I', 'II', 'III'];
    return ids.map(function (id) {
      const net = Math.cos((alpha - LIMB_ANGLE[id]) * Math.PI / 180);
      const pos = Math.max(0, net), neg = Math.max(0, -net);
      return {
        id: id,
        pAmp: 0.06 + 0.11 * net,          // die P-Achse läuft meist mit
        tpl: {
          q: { a: -0.04 * pos },
          r: { a: 0.20 + 1.45 * pos },
          s: { a: -(0.20 + 1.45 * neg) },
          t: { a: 0.10 + 0.24 * net }     // konkordant zum QRS-Komplex
        }
      };
    });
  }

  /* ---------------------------------------------------------------- Export */

  global.EKG = {
    drawStrip: drawStrip,
    LEAD_SETS: LEAD_SETS,
    axisLeads: axisLeads,
    LIMB_ANGLE: LIMB_ANGLE,
    Scope: Scope,
    signal: signal,
    defineCustom: defineCustom,
    sampleAt: sampleAt,
    drawSingleBeat: drawSingleBeat,
    vTemplate: vTemplate,
    rhythms: Object.keys(GEN),
    THEMES: THEMES
  };

})(window);
