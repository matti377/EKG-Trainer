const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Q = require("../assets/js/academy/quiz.js");

const csv = fs.readFileSync(
  path.join(__dirname, "../assets/data/fragen.csv"),
  "utf8",
);
const bank = Q.load(csv);

test("question bank: every record is a valid three-option single-choice question", () => {
  assert.deepEqual(bank.errors, []);
  assert.ok(bank.questions.length >= 300, "around 300 questions expected");
  const rows = Q.parseCSV(csv);
  assert.deepEqual(rows[0], Q.COLUMNS);
  assert.equal(rows.length - 1, bank.questions.length);
  const texts = new Set();
  for (const q of bank.questions) {
    assert.equal(q.options.length, 3, q.id);
    assert.equal(new Set(q.options).size, 3, q.id + ": options differ");
    assert.ok([0, 1, 2].includes(q.answer), q.id);
    assert.ok(q.why.length > 20, q.id + ": explanation");
    assert.ok(!texts.has(q.text), q.id + ": duplicate question text");
    texts.add(q.text);
    for (const part of [q.text, q.why, ...q.options])
      assert.ok(!/<\/?[a-z][^>]*>/i.test(part), q.id + ": plain text, no markup");
  }
});

test("question bank: themes are large enough and answers are spread over A, B, C", () => {
  const themes = Q.themes(bank.questions);
  assert.ok(themes.length >= 10);
  for (const theme of themes) {
    assert.match(theme.id, /^[a-z0-9-]+$/);
    assert.ok(theme.questions.length >= 2 * Q.DAILY_SIZE, theme.name);
  }
  assert.equal(new Set(themes.map((t) => t.id)).size, themes.length);
  for (const position of [0, 1, 2]) {
    const share =
      bank.questions.filter((q) => q.answer === position).length /
      bank.questions.length;
    assert.ok(share > 0.25 && share < 0.42, "position " + position);
  }
});

test("CSV parsing: quotes, embedded separators and line breaks, semicolon files, BOM", () => {
  assert.deepEqual(Q.parseCSV('a,b\r\n"x, ""y""","line\nbreak"\n\n'), [
    ["a", "b"],
    ['x, "y"', "line\nbreak"],
  ]);
  assert.deepEqual(Q.parseCSV("﻿a;b\n1,5;2\n"), [
    ["a", "b"],
    ["1,5", "2"],
  ]);
  const head = Q.COLUMNS.join(";");
  const loaded = Q.load(
    head +
      "\nX-1;EKG;Thema;1;Frage?;eins;zwei;drei;b;Weil zwei stimmt.\n" +
      "X-1;EKG;Thema;1;Doppelte id?;eins;zwei;drei;A;Text\n" +
      "X-2;EKG;Thema;1;Nur zwei?;eins;zwei;;A;Text\n" +
      "X-3;EKG;Thema;1;Gleiche?;eins;eins;drei;A;Text\n" +
      "X-4;EKG;Thema;1;Zwei richtig?;eins;zwei;drei;AB;Text\n" +
      "X-5;EKG;Thema;4;Stufe?;eins;zwei;drei;C;Text\n",
  );
  assert.equal(loaded.questions.length, 1);
  assert.equal(loaded.questions[0].answer, 1);
  assert.equal(loaded.errors.length, 5);
  assert.match(Q.load("id,frage\n1,x\n").errors[0], /Spalte fehlt/);
});

test("quiz of the day: one theme, five questions, same for everyone, changes daily", () => {
  const themes = Q.themes(bank.questions);
  const first = Q.daily(bank.questions, "2026-10-11");
  assert.deepEqual(first, Q.daily(bank.questions, "2026-10-11"));
  assert.equal(first.questions.length, Q.DAILY_SIZE);
  assert.ok(first.questions.every((q) => q.theme === first.theme.name));
  assert.equal(new Set(first.questions.map((q) => q.id)).size, Q.DAILY_SIZE);
  // Consecutive days walk through all themes before one repeats.
  const seen = [];
  for (let n = 0; n < themes.length; n++)
    seen.push(Q.daily(bank.questions, Q.addDays("2026-10-11", n)).theme.id);
  assert.equal(new Set(seen).size, themes.length);
  // A theme returns with fresh questions until all its sets were asked.
  const sets = Math.floor(first.theme.questions.length / Q.DAILY_SIZE);
  const asked = new Set();
  for (let visit = 0; visit < sets; visit++) {
    const again = Q.daily(
      bank.questions,
      Q.addDays("2026-10-11", visit * themes.length),
    );
    assert.equal(again.theme.id, first.theme.id);
    for (const q of again.questions) {
      assert.ok(!asked.has(q.id), "no repeat within one pass");
      asked.add(q.id);
    }
  }
  assert.equal(Q.daily([], "2026-10-11"), null);
});

test("calendar helpers use local days and cross month, year and DST borders", () => {
  assert.equal(Q.dayKey(new Date(2026, 9, 11, 23, 59)), "2026-10-11");
  assert.equal(Q.addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(Q.addDays("2027-01-01", -1), "2026-12-31");
  assert.equal(Q.addDays("2026-10-25", 1), "2026-10-26");
  assert.equal(Q.dayNumber("2026-10-26") - Q.dayNumber("2026-10-25"), 1);
});

test("progress: streak, first daily result, Wissens-Score and practice order", () => {
  const state = Q.restore("not json");
  assert.deepEqual(state, Q.emptyState());
  assert.equal(Q.streak(state, "2026-10-11"), 0);
  Q.finishDaily(state, "2026-10-09", { correct: 3, total: 5 });
  Q.finishDaily(state, "2026-10-10", { correct: 5, total: 5 });
  assert.equal(Q.streak(state, "2026-10-11"), 2, "yesterday keeps it alive");
  Q.finishDaily(state, "2026-10-11", { correct: 4, total: 5 });
  assert.equal(Q.streak(state, "2026-10-11"), 3);
  assert.equal(Q.streak(state, "2026-10-13"), 0, "a missed day ends it");
  const kept = Q.finishDaily(state, "2026-10-11", { correct: 0, total: 5 });
  assert.equal(kept.correct, 4, "repeating does not overwrite the result");

  const qs = bank.questions.slice(0, 10);
  Q.record(state, qs[0].id, true);
  Q.record(state, qs[1].id, true);
  Q.record(state, qs[1].id, false);
  Q.record(state, qs[2].id, false);
  Q.record(state, qs[2].id, true);
  assert.deepEqual(Q.mastery(state, qs), {
    total: 10,
    seen: 3,
    right: 2,
    percent: 20,
  });
  const round = Q.practice(qs, state, 9, 7);
  assert.equal(round.length, 9);
  assert.equal(round[7].id, qs[1].id, "last answered wrong before mastered");
  assert.ok(round.slice(0, 7).every((q) => !state.answers[q.id]));
  assert.deepEqual(Q.restore(JSON.stringify(state)), state);

  const order = Q.optionOrder(qs[0], 3);
  assert.deepEqual([...order].sort(), [0, 1, 2]);
  assert.deepEqual(order, Q.optionOrder(qs[0], 3));
});
