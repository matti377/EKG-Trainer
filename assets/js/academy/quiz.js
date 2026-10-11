/* Academy quiz engine: CSV question bank, quiz of the day and local progress.
   No DOM access, so the Node tests and the browser share one implementation. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.AcademyQuiz = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const COLUMNS = [
    "id",
    "fach",
    "thema",
    "schwierigkeit",
    "frage",
    "antwort_a",
    "antwort_b",
    "antwort_c",
    "richtig",
    "erklaerung",
  ];
  const DAILY_SIZE = 5;

  /* RFC 4180 with quoted cells; a file re-saved by a German spreadsheet
     (semicolon separated, BOM) is read the same way. */
  function parseCSV(text) {
    const src = String(text).replace(/^﻿/, "");
    const head = src.split(/\r?\n/, 1)[0];
    const sep = head.split(";").length > head.split(",").length ? ";" : ",";
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    const endRow = () => {
      row.push(cell);
      cell = "";
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
    };
    for (let i = 0; i < src.length; i++) {
      const c = src[i];
      if (quoted) {
        if (c !== '"') cell += c;
        else if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else if (c === '"' && cell === "") quoted = true;
      else if (c === sep) {
        row.push(cell);
        cell = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && src[i + 1] === "\n") i++;
        endRow();
      } else cell += c;
    }
    endRow();
    return rows;
  }

  /* Invalid records are reported and skipped, so one bad row never takes the
     whole bank down. */
  function load(text) {
    const rows = parseCSV(text);
    const questions = [];
    const errors = [];
    const head = (rows.shift() || []).map((name) => name.trim().toLowerCase());
    const col = {};
    for (const name of COLUMNS) {
      col[name] = head.indexOf(name);
      if (col[name] < 0) errors.push("Spalte fehlt: " + name);
    }
    if (errors.length) return { questions, errors };
    const seen = new Set();
    rows.forEach((row, n) => {
      const get = (name) => (row[col[name]] || "").trim();
      const id = get("id");
      const options = [get("antwort_a"), get("antwort_b"), get("antwort_c")];
      const right = get("richtig").toUpperCase();
      const level = Number(get("schwierigkeit"));
      const problem = !id
        ? "id fehlt"
        : seen.has(id)
          ? "id ist doppelt vergeben"
          : !get("fach") || !get("thema") || !get("frage")
            ? "fach, thema oder frage fehlt"
            : options.some((option) => !option)
              ? "es braucht genau drei Antworten"
              : new Set(options).size < 3
                ? "die drei Antworten müssen verschieden sein"
                : !/^[ABC]$/.test(right)
                  ? "richtig muss A, B oder C sein"
                  : ![1, 2, 3].includes(level)
                    ? "schwierigkeit muss 1, 2 oder 3 sein"
                    : !get("erklaerung")
                      ? "erklaerung fehlt"
                      : "";
      if (problem) {
        errors.push(
          "Datensatz " + (n + 1) + (id ? " (" + id + ")" : "") + ": " + problem,
        );
        return;
      }
      seen.add(id);
      questions.push({
        id,
        subject: get("fach"),
        theme: get("thema"),
        level,
        text: get("frage"),
        options,
        answer: "ABC".indexOf(right),
        why: get("erklaerung"),
      });
    });
    return { questions, errors };
  }

  const slug = (value) =>
    value
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  /* Themes keep the order of their first question in the file. */
  function themes(questions) {
    const map = new Map();
    for (const q of questions) {
      const id = slug(q.subject + "-" + q.theme);
      if (!map.has(id))
        map.set(id, { id, name: q.theme, subject: q.subject, questions: [] });
      map.get(id).questions.push(q);
    }
    return [...map.values()];
  }

  function hash(value) {
    let n = 2166136261;
    for (let i = 0; i < value.length; i++)
      n = Math.imul(n ^ value.charCodeAt(i), 16777619);
    return n >>> 0;
  }
  function shuffle(list, seed) {
    const out = list.slice();
    let s = seed >>> 0;
    for (let i = out.length - 1; i > 0; i--) {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      const j = ((t ^ (t >>> 14)) >>> 0) % (i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  /* Days are the learner's local calendar days, written YYYY-MM-DD. */
  const pad = (n) => String(n).padStart(2, "0");
  const dayKey = (date) =>
    date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  const utc = (key, offset) => {
    const [y, m, d] = key.split("-").map(Number);
    return Date.UTC(y, m - 1, d + (offset || 0));
  };
  const dayNumber = (key) => Math.round(utc(key) / 86400000);
  function addDays(key, offset) {
    const date = new Date(utc(key, offset));
    return (
      date.getUTCFullYear() +
      "-" +
      pad(date.getUTCMonth() + 1) +
      "-" +
      pad(date.getUTCDate())
    );
  }

  /* Quiz of the day: one theme per day in file order, the same questions for
     everyone. A theme is dealt out in sets, so a question only returns once
     every other set of that theme has had its day. */
  function daily(questions, key, size) {
    size = size || DAILY_SIZE;
    const list = themes(questions).filter((t) => t.questions.length >= size);
    if (!list.length) return null;
    const day = dayNumber(key);
    const theme = list[day % list.length];
    const round = Math.floor(day / list.length);
    const sets = Math.floor(theme.questions.length / size);
    const dealt = shuffle(theme.questions, hash(theme.id) + Math.floor(round / sets));
    const start = (round % sets) * size;
    return { key, theme, questions: dealt.slice(start, start + size) };
  }

  /* Display order of the three options; `order[i]` is the original index. */
  const optionOrder = (question, seed) =>
    shuffle([0, 1, 2], hash(question.id) + (seed >>> 0));

  /* ------------------------------------------------------------ progress */

  const emptyState = () => ({ v: 1, answers: {}, daily: {} });
  function restore(raw) {
    const state = emptyState();
    let data = null;
    try {
      data = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch (_) {
      return state;
    }
    if (!data || typeof data !== "object") return state;
    for (const part of ["answers", "daily"])
      if (data[part] && typeof data[part] === "object" && !Array.isArray(data[part]))
        for (const [key, value] of Object.entries(data[part]))
          if (value && typeof value === "object") state[part][key] = value;
    return state;
  }
  function record(state, id, correct) {
    const old = state.answers[id] || { n: 0, ok: 0 };
    state.answers[id] = {
      n: (old.n || 0) + 1,
      ok: (old.ok || 0) + (correct ? 1 : 0),
      last: !!correct,
    };
  }
  /* The first result of a day stands; repeating the quiz is practice. */
  function finishDaily(state, key, result) {
    if (!state.daily[key]) state.daily[key] = result;
    return state.daily[key];
  }
  /* A streak survives until the end of the following day. */
  function streak(state, today) {
    let key = state.daily[today] ? today : addDays(today, -1);
    let n = 0;
    while (state.daily[key]) {
      n++;
      key = addDays(key, -1);
    }
    return n;
  }
  /* Wissens-Score: share of questions whose latest answer was correct. */
  function mastery(state, questions) {
    let seen = 0;
    let right = 0;
    for (const q of questions) {
      const answer = state.answers[q.id];
      if (!answer) continue;
      seen++;
      if (answer.last) right++;
    }
    const total = questions.length;
    return { total, seen, right, percent: total ? Math.round((right / total) * 100) : 0 };
  }
  /* Practice round: unseen questions first, then the ones last answered wrong. */
  function practice(questions, state, size, seed) {
    const rank = (q) => {
      const answer = state.answers[q.id];
      return !answer ? 0 : answer.last ? 2 : 1;
    };
    return shuffle(questions, seed)
      .sort((a, b) => rank(a) - rank(b))
      .slice(0, size);
  }

  return {
    COLUMNS,
    DAILY_SIZE,
    parseCSV,
    load,
    themes,
    shuffle,
    dayKey,
    dayNumber,
    addDays,
    daily,
    optionOrder,
    emptyState,
    restore,
    record,
    finishDaily,
    streak,
    mastery,
    practice,
  };
});
