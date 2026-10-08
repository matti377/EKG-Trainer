const { test } = require("node:test");
const assert = require("node:assert/strict");
const K = require("../assets/js/sono/core.js");
const C = require("../assets/js/sono/content.js");
const baseline = require("./fixtures/medical-baseline.json");
const clone = () => structuredClone(C);
test("complete requested curriculum and navigation", () => {
  assert.deepEqual(
    C.modules.map((m) => m.lessons.length),
    [16, 15, 12, 12, 8, 10],
  );
  assert.deepEqual(
    K.navigation.map((n) => n[0]),
    ["home", "pfad", "simulator", "faelle", "atlas", "wissen"],
  );
  assert.equal(C.cases.length, 5);
  assert.equal(K.validate(C).length, 0);
});
test("quiz grading rejects unsafe extra answers and incomplete multi-select", () => {
  const q = C.quizzes.find((q) => q.id === "q-alara");
  assert.equal(K.evaluate(q, ["0", "1"]), true);
  assert.equal(K.evaluate(q, ["1", "0"]), true);
  for (const answer of [[], ["0"], ["0", "1", "2"], ["0", "0"], ["x"], null])
    assert.equal(K.evaluate(q, answer), false);
  for (const q of C.quizzes)
    assert.equal(
      K.evaluate(
        q,
        q.options.map((o) => o.id),
      ),
      false,
    );
});
test("lesson reading and module quiz mastery are separate and idempotent", () => {
  const state = K.loadProgress(null),
    m = C.modules[0];
  K.markRead(state, "unknown", C);
  assert.deepEqual(state.read, {});
  for (const id of m.lessons) K.markRead(state, id, C);
  assert.equal(K.moduleProgress(m, state).complete, false);
  for (const id of m.quizRefs) {
    const q = C.quizzes.find((q) => q.id === id);
    assert.equal(K.recordAnswer(state, id, q.correctAnswers, C), true);
  }
  assert.equal(K.moduleProgress(m, state).complete, true);
  K.markRead(state, m.lessons[0], C);
  assert.equal(Object.keys(state.read).length, 16);
  assert.equal(K.recordAnswer(state, "unknown", ["0"], C), false);
});
test("progress storage handles corrupt data, denied access, persistence and EKG isolation", () => {
  const map = { "ekg-lernen-v1": '{"xp":300}' };
  const store = { getItem: (k) => map[k], setItem: (k, v) => (map[k] = v) };
  const state = K.loadProgress(store);
  K.markRead(state, "lunge-01", C);
  assert.equal(K.saveProgress(store, state), true);
  assert.deepEqual(K.loadProgress(store), state);
  assert.equal(map["ekg-lernen-v1"], '{"xp":300}');
  assert.equal(K.saveProgress(null, state), false);
  for (const raw of [
    "not json",
    "null",
    "[]",
    '{"version":1,"read":null,"passed":[]}',
  ])
    assert.deepEqual(K.loadProgress({ getItem: () => raw }), {
      version: 1,
      read: {},
      passed: {},
    });
});
test("schema catches missing references, broken IDs, attribution, licensing, limitations and duplicate IDs", () => {
  const mutations = [
    (c) => (c.lessons[0].sources = []),
    (c) => (c.lessons[0].sources = ["missing"]),
    (c) => (c.lessons[0].content[0].sources = []),
    (c) => (c.media[0].attribution = ""),
    (c) => delete c.media[0].license,
    (c) => (c.lessons[0].limitations = []),
    (c) => (c.lessons[1].id = c.lessons[0].id),
    (c) => (c.cases[0].mediaRefs = ["missing"]),
    (c) => (c.modules[0].quizRefs = ["missing"]),
    (c) => (c.quizzes[0].options[0].explanation = ""),
  ];
  for (const mutate of mutations) {
    const c = clone();
    mutate(c);
    assert.ok(K.validate(c).length > 0);
  }
});
test("medical review cannot be automatically inferred or faked", () => {
  assert.ok(
    C.lessons.every(
      (l) =>
        l.reviewStatus === "awaiting-medical-review" &&
        l.lastReviewed === null &&
        l.reviewer === null,
    ),
  );
  const c = clone();
  c.lessons[0].reviewStatus = "medically-reviewed";
  assert.match(K.validate(c).join(" "), /invalid review metadata/);
  assert.match(K.reviewLabel(c.lessons[0]), /nicht freigegeben/);
  assert.ok(K.validate(C, true).length > 0);
});
test("anatomical landmarks and screen transformations are invertible", () => {
  const right = K.patientToScreen({ x: 1, y: 0 });
  const left = K.patientToScreen({ x: -1, y: 0 });
  assert.ok(right.x < left.x);
  assert.ok(
    K.patientToScreen({ x: 0, y: 1 }).y < K.patientToScreen({ x: 0, y: -1 }).y,
  );
  for (const p of K.positions) {
    const back = K.screenToPatient(K.patientToScreen(p.position));
    assert.ok(Math.abs(back.x - p.position.x) < 1e-10);
    assert.ok(Math.abs(back.y - p.position.y) < 1e-10);
  }
});
test("marker cranial at 0 degrees and patient right at 90 degrees; beam and marker orthogonal", () => {
  let f = K.probeFrame({ rotation: 0, tilt: 0, rock: 0 });
  assert.deepEqual(f.marker, { x: 0, y: 1, z: 0 });
  assert.equal(f.beam.z, -1);
  f = K.probeFrame({ rotation: 90, tilt: 0, rock: 0 });
  assert.ok(Math.abs(f.marker.x - 1) < 1e-10);
  for (const rotation of [0, 90, 180, 270, 360])
    for (const tilt of [-45, 0, 45]) {
      const f = K.probeFrame({ rotation, tilt, rock: 25 });
      const dot =
        f.marker.x * f.beam.x + f.marker.y * f.beam.y + f.marker.z * f.beam.z;
      assert.ok(Math.abs(dot) < 1e-10);
      assert.ok(Math.abs(Math.hypot(...Object.values(f.beam)) - 1) < 1e-10);
    }
  assert.equal(K.angularDistance(355, 5), 10);
});
const scan = () => ({
  positionId: "lung-right",
  x: 0.3,
  y: 0.48,
  z: 1,
  rotation: 0,
  tilt: 0,
  rock: 0,
  contact: true,
  probe: "linear",
  depth: 6,
  mode: "B",
});
function licensed() {
  const m = structuredClone(C.media.find((m) => m.id === "media-normal"));
  Object.assign(m, {
    status: "available",
    url: "/assets/media/test.mp4",
    mimeType: "video/mp4",
    reviewStatus: "medically-reviewed",
    reviewer: "Test fixture only",
    lastReviewed: "2026-10-08",
  });
  Object.assign(m.license, {
    status: "verified",
    name: "Test fixture license",
    url: "https://example.test/license",
    redistribution: true,
    verifiedBy: "Test fixture",
    verifiedAt: "2026-10-08",
  });
  Object.assign(m.provenance, {
    sourceURL: "https://example.test/source",
    rightsEvidence: "test-only",
    patientPrivacyVerified: true,
  });
  Object.assign(m.recording, {
    screenMarker: "left",
    pose: { rotation: 0, tilt: 0, rock: 0 },
    patientPosition: { x: 0.3, y: 0.48, z: 1 },
    positionTolerance: 0.01,
    angleTolerance: 1,
    depthCm: 6,
  });
  return m;
}
test("missing footage never becomes a fabricated diagnostic image", () => {
  assert.equal(C.media.filter(K.authorizedMedia).length, 7);
  assert.equal(C.media.find((m) => m.id === "media-trauma").url, null);
  assert.equal(
    K.resolveRecording(scan(), C.cases[0], C.media).status,
    "pending",
  );
  assert.equal(
    K.resolveRecording({ ...scan(), contact: false }, C.cases[0], C.media)
      .status,
    "unavailable",
  );
  assert.equal(
    K.resolveRecording({ ...scan(), positionId: "luq" }, C.cases[0], C.media)
      .status,
    "unavailable",
  );
});
test("recordings require exact acquisition compatibility and rights", () => {
  const m = licensed();
  assert.equal(K.authorizedMedia(m), true);
  assert.equal(K.resolveRecording(scan(), C.cases[0], [m]).status, "available");
  for (const patch of [
    { depth: 12 },
    { x: 0.8 },
    { rotation: 90 },
    { tilt: 15 },
    { rock: 15 },
    { probe: "convex" },
    { mode: "M" },
    { z: 0 },
    { x: NaN },
    { tilt: undefined },
  ])
    assert.notEqual(
      K.resolveRecording({ ...scan(), ...patch }, C.cases[0], [m]).status,
      "available",
    );
  for (const mutate of [
    (m) => (m.license.redistribution = false),
    (m) => (m.provenance.patientPrivacyVerified = false),
    (m) => (m.license.verifiedBy = null),
    (m) => (m.url = "https://unlicensed.test/clip.mp4"),
  ]) {
    const m = licensed();
    mutate(m);
    assert.equal(K.authorizedMedia(m), false);
  }
});
test("simulator modes explicitly identify demonstration, originals and teaching diagrams", () => {
  assert.match(K.modes.demo, /Demonstration/);
  assert.match(K.modes.recording, /Originalaufnahme/);
  assert.match(K.modes.simplified, /Lehrdiagramm/);
});
for (const rule of baseline.rules)
  test(
    "medical content regression (not clinical validation): " + rule.lesson,
    () => {
      const l = C.lessons.find((l) => l.id === rule.lesson);
      const body = l.content
        .map((b) => b.text)
        .concat(l.limitations)
        .join(" ");
      assert.ok(l.sources.includes(rule.source));
      for (const expected of rule.patterns)
        assert.ok(body.includes(expected), expected);
      assert.equal(baseline.status, "awaiting-medical-review");
    },
  );

test("recording lookup searches multiple depths; review metadata does not gate preview", () => {
  const first = licensed(),
    second = licensed();
  first.recording.depthCm = 12;
  assert.equal(
    K.resolveRecording(scan(), C.cases[0], [first, second]).status,
    "available",
  );
  for (const date of ["2026-02-31", "2025-01-01", "unknown"]) {
    const m = licensed();
    m.lastReviewed = date;
    assert.equal(K.authorizedMedia(m), true);
    assert.match(K.reviewLabel(m), /nicht freigegeben/);
  }
  const pending = licensed();
  pending.reviewStatus = "awaiting-medical-review";
  pending.reviewer = null;
  pending.lastReviewed = null;
  assert.equal(K.authorizedMedia(pending), true);
  const unmapped = licensed();
  unmapped.recording.pose.rotation = undefined;
  assert.equal(
    K.resolveRecording(scan(), C.cases[0], [unmapped]).status,
    "pending",
  );
  const c = clone();
  delete c.media[0].license.redistribution;
  assert.match(K.validate(c).join(" "), /missing license field redistribution/);
  assert.equal(K.angularDistance(-1000, 80), 0);
});

const I = require("../assets/js/sono/illustrations.js");
test("all five diagrams are labelled, deterministic and react to teaching controls", () => {
  for (const id of Object.keys(I.titles)) {
    const still = I.frame(id, { gain: 50, depth: 6 }, 0);
    assert.match(still, /LEHRDIAGRAMM/);
    assert.match(still, /<svg/);
    assert.equal(still, I.frame(id, { gain: 50, depth: 6 }, 0));
    assert.notEqual(still, I.frame(id, { gain: 80, depth: 2 }, 0));
  }
  assert.notEqual(I.frame("normal", {}, 0), I.frame("normal", {}, 1));
  assert.match(I.frame("normal", { mode: "M" }), /Zeitmuster/);
  assert.doesNotMatch(I.frame("normal", { labels: false }), /Thoraxwand/);
  assert.equal(I.available(scan(), K.positions[0]), null);
  assert.match(
    I.available({ ...scan(), contact: false }, K.positions[0]),
    /Kontakt/,
  );
  assert.match(
    I.available({ ...scan(), rotation: 90 }, K.positions[0]),
    /nicht modelliert/,
  );
});
test("media files and posters exist; clinical reference clips have no invented probe calibration", () => {
  const fs = require("node:fs"),
    path = require("node:path");
  for (const m of C.media.filter((m) => m.status === "available")) {
    assert.ok(fs.statSync(path.join(__dirname, "..", m.url)).size > 100);
    if (m.poster)
      assert.ok(fs.existsSync(path.join(__dirname, "..", m.poster)));
    if (m.kind === "clinical-recording") {
      assert.equal(m.recording.mappingStatus, "reference-only");
      assert.equal(m.recording.pose, null);
      assert.equal(m.reviewStatus, "awaiting-medical-review");
    }
  }
});
