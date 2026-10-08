/* Pure SONO domain logic, usable in browsers and Node without dependencies. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SONO = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const statuses = {
    draft: "Entwurf",
    "awaiting-medical-review": "Fachprüfung ausstehend",
    "medically-reviewed": "Medizinisch geprüft",
    "revision-required": "Überarbeitung erforderlich",
  };
  const navigation = [
    ["home", "Home", "⌂"],
    ["pfad", "Lernpfad", "≋"],
    ["simulator", "Simulator", "◎"],
    ["faelle", "Fallbeispiele", "⊞"],
    ["atlas", "Bildatlas", "▧"],
    ["wissen", "Wissen", "◇"],
  ];
  const modes = {
    demo: "Demonstrationsmodus · anatomische Orientierung",
    recording: "Originalaufnahme · endlicher Datensatz",
    simplified: "Vereinfachte Simulation · nicht implementiert",
  };
  const coordinateSystem =
    "Normierter Patientenkörper: +x = Patienten-rechts, +y = kranial, +z = anterior. Frontalansicht: Patienten-rechts liegt links im Diagramm. Einheiten sind keine Zentimeter.";
  const positions = [
    [
      "lung-right",
      "Rechter anteriorer Thorax",
      "Thorax",
      0.3,
      0.48,
      "Sagittal",
      ["linear", "convex"],
      "Pleuralinie zwischen Rippen aufsuchen; systematisch weitere Interkostalräume untersuchen.",
      ["Thoraxwand", "Rippen", "Pleuralinie"],
    ],
    [
      "lung-left",
      "Linker anteriorer Thorax",
      "Thorax",
      -0.3,
      0.48,
      "Sagittal",
      ["linear", "convex"],
      "Links anterior ein interkostales Fenster suchen; Herzgrenze nicht als Lung Point fehlinterpretieren.",
      ["Thoraxwand", "Rippen", "Pleuralinie"],
    ],
    [
      "pleural-right",
      "Rechte laterale Thoraxbasis",
      "Thorax",
      0.67,
      0.1,
      "Koronar-oblique",
      ["convex", "phased"],
      "Rechts lateral Zwerchfell und Leber identifizieren, dann kranial nach pleuraler Flüssigkeit suchen.",
      ["Leber", "Zwerchfell", "Thoraxraum"],
    ],
    [
      "ruq",
      "Rechter Oberbauch",
      "Abdomen",
      0.6,
      -0.12,
      "Koronar-oblique",
      ["convex", "phased"],
      "Rechts lateral Marker kranial; Leber, Niere, hepatorenalen Rezess, Leberunterrand und subphrenischen Raum durchmustern.",
      ["Leber", "Rechte Niere", "Hepatorenaler Rezess"],
    ],
    [
      "luq",
      "Linker Oberbauch",
      "Abdomen",
      -0.6,
      -0.12,
      "Koronar-oblique",
      ["convex", "phased"],
      "Links dorsal-lateral Marker kranial; Milz, Niere, perisplenische und subphrenische Räume aufsuchen.",
      ["Milz", "Linke Niere", "Subphrenischer Raum"],
    ],
    [
      "pelvis",
      "Suprapubisch",
      "Becken",
      0,
      -0.68,
      "Sagittal",
      ["convex"],
      "Oberhalb der Symphyse Blase und abhängige Beckenräume längs und zusätzlich quer untersuchen.",
      ["Harnblase", "Abhängige Beckenräume"],
    ],
    [
      "cardiac",
      "Subkostales Herzfenster",
      "Herz",
      0,
      0.08,
      "Oblique",
      ["phased", "convex"],
      "Subkostal zum Herzen richten. Reale kardiale Bildorientierung gerätespezifisch prüfen; hier kein validiertes kardiales Scanmodell.",
      ["Leberfenster", "Herz", "Perikard"],
    ],
  ].map(([id, title, region, x, y, plane, probes, instruction, labels]) => ({
    id,
    title,
    region,
    coordinateSystem: "patient-normalized-v1",
    position: { x, y, z: 1 },
    orientation: { rotation: 0, tilt: 0, rock: 0 },
    markerDirection: "cranial",
    contact: true,
    plane,
    modes: ["B"],
    probes,
    instruction,
    labels,
    recordingIds: [],
  }));
  function evaluate(question, selected) {
    if (
      !Array.isArray(selected) ||
      !selected.length ||
      new Set(selected).size !== selected.length
    )
      return false;
    return (
      selected.length === question.correctAnswers.length &&
      selected.every((id) => question.correctAnswers.includes(id))
    );
  }
  function loadProgress(storage) {
    try {
      const s = JSON.parse(storage.getItem("sono-learning-v1"));
      if (s && s.version === 1)
        return {
          version: 1,
          read: cleanMap(s.read),
          passed: cleanMap(s.passed),
        };
    } catch (_) {
      /* Private browsing or corrupt state: use in-memory progress. */
    }
    return { version: 1, read: {}, passed: {} };
  }
  function cleanMap(value) {
    return Object.fromEntries(
      Object.entries(
        value && typeof value === "object" && !Array.isArray(value)
          ? value
          : {},
      ).filter(([k, v]) => /^[a-z0-9-]+$/.test(k) && v === true),
    );
  }
  function saveProgress(storage, state) {
    try {
      storage.setItem("sono-learning-v1", JSON.stringify(state));
      return true;
    } catch (_) {
      return false;
    }
  }
  function markRead(state, id, content) {
    if (content.lessons.some((l) => l.id === id)) state.read[id] = true;
  }
  function recordAnswer(state, id, answers, content) {
    const q = content.quizzes.find((q) => q.id === id);
    const ok = !!q && evaluate(q, answers);
    if (ok) state.passed[id] = true;
    return ok;
  }
  function moduleProgress(module, state) {
    const read = module.lessons.filter((id) => state.read[id]).length;
    const passed = module.quizRefs.filter((id) => state.passed[id]).length;
    return {
      read,
      total: module.lessons.length,
      passed,
      quizTotal: module.quizRefs.length,
      complete:
        read === module.lessons.length && passed === module.quizRefs.length,
    };
  }
  const rad = (a) => (a * Math.PI) / 180;
  function probeFrame(pose) {
    // Intrinsic rotations: tilt around patient x, rock around y, rotation toward patient right.
    function rotate(v) {
      let [x, y, z] = v;
      const a = rad(pose.tilt),
        b = rad(pose.rock),
        c = rad(-pose.rotation);
      [y, z] = [
        y * Math.cos(a) - z * Math.sin(a),
        y * Math.sin(a) + z * Math.cos(a),
      ];
      [x, z] = [
        x * Math.cos(b) + z * Math.sin(b),
        -x * Math.sin(b) + z * Math.cos(b),
      ];
      return {
        x: x * Math.cos(c) - y * Math.sin(c),
        y: x * Math.sin(c) + y * Math.cos(c),
        z,
      };
    }
    return {
      marker: rotate([0, 1, 0]),
      beam: rotate([0, 0, -1]),
      normal: rotate([1, 0, 0]),
    };
  }
  function patientToScreen(p) {
    return { x: 50 - p.x * 38, y: 50 - p.y * 40 };
  }
  function screenToPatient(p) {
    return {
      x: Math.max(-1, Math.min(1, (50 - p.x) / 38)),
      y: Math.max(-1, Math.min(1, (50 - p.y) / 40)),
      z: 1,
    };
  }
  function angularDistance(a, b) {
    return Math.abs(((((a - b) % 360) + 540) % 360) - 180);
  }
  function validDate(value) {
    return (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Number.isFinite(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value
    );
  }
  function reviewed(item) {
    return (
      item.reviewStatus === "medically-reviewed" &&
      typeof item.reviewer === "string" &&
      !!item.reviewer.trim() &&
      validDate(item.lastReviewed) &&
      validDate(item.lastUpdated) &&
      item.lastReviewed >= item.lastUpdated
    );
  }
  function reviewLabel(item) {
    if (item.reviewStatus === "medically-reviewed" && !reviewed(item))
      return "Ungültige Prüfmetadaten · nicht freigegeben";
    return statuses[item.reviewStatus] || "Unbekannter Prüfstatus";
  }
  function validRecording(r) {
    return !!(
      r &&
      r.pose &&
      r.patientPosition &&
      r.screenMarker === "left" &&
      Number.isFinite(r.depthCm) &&
      r.depthCm > 0 &&
      Number.isFinite(r.positionTolerance) &&
      r.positionTolerance >= 0 &&
      Number.isFinite(r.angleTolerance) &&
      r.angleTolerance >= 0 &&
      ["rotation", "tilt", "rock"].every((k) => Number.isFinite(r.pose[k])) &&
      ["x", "y", "z"].every((k) => Number.isFinite(r.patientPosition[k]))
    );
  }
  function authorizedMedia(m) {
    return !!(
      m &&
      m.kind === "clinical-recording" &&
      m.status === "available" &&
      validRecording(m.recording) &&
      /^\/assets\/media\/[\w./-]+$/.test(m.url || "") &&
      !m.url.includes("..") &&
      ["video/mp4", "video/webm", "image/jpeg", "image/png"].includes(
        m.mimeType,
      ) &&
      reviewed(m) &&
      m.license?.status === "verified" &&
      m.license.name &&
      /^https:\/\//.test(m.license.url || "") &&
      m.license.redistribution === true &&
      m.license.verifiedBy &&
      validDate(m.license.verifiedAt) &&
      m.attribution &&
      /^https:\/\//.test(m.provenance?.sourceURL || "") &&
      m.provenance.rightsEvidence &&
      m.provenance.patientPrivacyVerified === true
    );
  }
  function resolveRecording(state, clinicalCase, media) {
    if (
      ["x", "y", "z", "rotation", "tilt", "rock", "depth"].some(
        (k) => !Number.isFinite(state[k]),
      )
    )
      return {
        status: "unavailable",
        reason: "Ungültige Positionsdaten. Keine Aufnahme zugeordnet.",
      };
    if (!state.contact)
      return {
        status: "unavailable",
        reason: "Kein Schallkopfkontakt. Es wird keine Aufnahme angezeigt.",
      };
    const window = positions.find((p) => p.id === state.positionId);
    if (!window || window.id !== clinicalCase.positionId)
      return {
        status: "unavailable",
        reason:
          "Für dieses Fallfenster ist keine passende Aufnahme hinterlegt.",
      };
    if (!window.probes.includes(state.probe))
      return {
        status: "unavailable",
        reason: "Schallkopf passt nicht zum hinterlegten Fenster.",
      };
    const candidates = media.filter(
      (m) => clinicalCase.mediaRefs.includes(m.id) && authorizedMedia(m),
    );
    let depthUnavailable = false;
    for (const m of candidates) {
      const r = m.recording;
      if (
        !r ||
        !r.pose ||
        !r.patientPosition ||
        m.positionId !== window.id ||
        m.probe !== state.probe ||
        m.mode !== state.mode
      )
        continue;
      const distance = Math.hypot(
        state.x - r.patientPosition.x,
        state.y - r.patientPosition.y,
        state.z - r.patientPosition.z,
      );
      if (
        distance > r.positionTolerance ||
        ["rotation", "tilt", "rock"].some(
          (k) => angularDistance(state[k], r.pose[k]) > r.angleTolerance,
        )
      )
        continue;
      if (state.depth !== r.depthCm) {
        depthUnavailable = true;
        continue;
      }
      return { status: "available", media: m };
    }
    if (depthUnavailable)
      return {
        status: "unavailable",
        reason:
          "Die gewünschte Tiefe ist nicht aufgezeichnet. Zusätzliche Anatomie kann nicht rekonstruiert werden.",
      };
    return {
      status: "pending",
      reason:
        "Für diese Position, Orientierung und Einstellung fehlt eine freigegebene Originalaufnahme. Klinischer Clip ausstehend.",
    };
  }
  function validate(content, publication = false) {
    const errors = [];
    const ids = new Set();
    const sourceIds = new Set(content.sources.map((s) => s.id));
    const quizIds = new Set(content.quizzes.map((q) => q.id));
    const moduleIds = new Set(content.modules.map((m) => m.id));
    const lessonIds = new Set(content.lessons.map((l) => l.id));
    const mediaIds = new Set(content.media.map((m) => m.id));
    const signIds = new Set(content.signs.map((s) => s.id));
    const fail = (id, msg) => errors.push(id + ": " + msg);
    for (const group of [
      "sources",
      "modules",
      "lessons",
      "quizzes",
      "signs",
      "cases",
      "media",
    ])
      for (const item of content[group]) {
        if (!item.id || ids.has(item.id))
          fail(item.id, "missing or duplicate identifier");
        ids.add(item.id);
        if (!item.title) fail(item.id, "missing title");
        if (group === "sources") {
          for (const key of [
            "organization",
            "url",
            "accessDate",
            "section",
            "verification",
          ])
            if (!item[key]) fail(item.id, "missing source " + key);
          if (!("publicationDate" in item))
            fail(item.id, "missing publication date field");
          if (!validDate(item.accessDate))
            fail(item.id, "invalid source access date");
          if (!/^https:\/\//.test(item.url || ""))
            fail(item.id, "invalid source URL");
          continue;
        }
        if (group === "modules") {
          for (const id of item.lessons)
            if (!lessonIds.has(id))
              fail(item.id, "broken lesson reference " + id);
          for (const id of item.quizRefs)
            if (!quizIds.has(id)) fail(item.id, "broken quiz reference " + id);
          continue;
        }
        if (!item.sources?.length) fail(item.id, "missing references");
        for (const id of item.sources || [])
          if (!sourceIds.has(id)) fail(item.id, "broken source " + id);
        if (!item.objectives?.length) fail(item.id, "missing objectives");
        if (
          !item.limitations?.length ||
          item.limitations.some((x) => !x.trim())
        )
          fail(item.id, "missing limitations");
        if (!statuses[item.reviewStatus])
          fail(item.id, "invalid review status");
        if (!validDate(item.lastUpdated)) fail(item.id, "invalid updated date");
        if (item.reviewStatus === "medically-reviewed" && !reviewed(item))
          fail(item.id, "invalid review metadata");
        if (
          item.reviewStatus !== "medically-reviewed" &&
          (item.reviewer || item.lastReviewed)
        )
          fail(item.id, "unreviewed content claims reviewer/date");
        if (publication && item.reviewStatus !== "medically-reviewed")
          fail(item.id, "medical review required before publication");
        if (!Array.isArray(item.relatedModules) || !item.relatedModules.length)
          fail(item.id, "missing related modules");
        if (!Array.isArray(item.quizRefs))
          fail(item.id, "missing quiz references field");
        for (const id of item.relatedModules || [])
          if (!moduleIds.has(id)) fail(item.id, "broken module " + id);
        for (const id of item.quizRefs || [])
          if (!quizIds.has(id)) fail(item.id, "broken quiz " + id);
        for (const block of item.content || []) {
          if (!block.text) fail(item.id, "empty content block");
          if (block.kind !== "history" && !block.sources?.length)
            fail(item.id, "missing block citations");
          for (const id of block.sources || [])
            if (!sourceIds.has(id)) fail(item.id, "broken block source " + id);
        }
        if (
          ["lessons", "signs", "cases"].includes(group) &&
          !item.content?.length
        )
          fail(item.id, "missing structured content");
        if (group === "cases") {
          for (const id of item.mediaRefs || [])
            if (!mediaIds.has(id)) fail(item.id, "broken media " + id);
          for (const id of item.signRefs || [])
            if (!signIds.has(id)) fail(item.id, "broken sign " + id);
        }
        if (group === "quizzes") {
          const optionIds = item.options?.map((o) => o.id) || [];
          if (
            optionIds.length < 2 ||
            new Set(optionIds).size !== optionIds.length
          )
            fail(item.id, "invalid answer options");
          if (
            !item.correctAnswers?.length ||
            new Set(item.correctAnswers).size !== item.correctAnswers.length ||
            item.correctAnswers.some((a) => !optionIds.includes(a))
          )
            fail(item.id, "invalid correct answers");
          if (item.options?.some((o) => !o.explanation?.trim()))
            fail(item.id, "missing answer explanation");
        }
        if (group === "media") {
          if (!item.attribution) fail(item.id, "missing attribution");
          if (!item.license?.status || !item.provenance)
            fail(item.id, "missing licensing/provenance");
          if (!["pending", "verified"].includes(item.license?.status))
            fail(item.id, "invalid license status");
          for (const key of [
            "name",
            "url",
            "redistribution",
            "derivatives",
            "verifiedBy",
            "verifiedAt",
          ])
            if (!item.license || !(key in item.license))
              fail(item.id, "missing license field " + key);
          for (const key of [
            "sourceURL",
            "rightsEvidence",
            "patientPrivacyVerified",
          ])
            if (!item.provenance || !(key in item.provenance))
              fail(item.id, "missing provenance field " + key);
          for (const id of item.signs || [])
            if (!signIds.has(id)) fail(item.id, "broken media sign " + id);
          if (!["pending", "available"].includes(item.status))
            fail(item.id, "invalid media status");
          if (item.status === "pending" && item.url)
            fail(item.id, "pending footage must not have a playable URL");
          if (item.status === "available" && !authorizedMedia(item))
            fail(item.id, "unauthorized available recording");
          if (item.status === "available") {
            const r = item.recording;
            if (
              !r?.pose ||
              !r?.patientPosition ||
              !Number.isFinite(r.depthCm) ||
              r.depthCm <= 0 ||
              !Number.isFinite(r.positionTolerance) ||
              r.positionTolerance < 0 ||
              !Number.isFinite(r.angleTolerance) ||
              r.angleTolerance < 0
            )
              fail(item.id, "invalid recording mapping");
            else if (
              ["rotation", "tilt", "rock"].some(
                (k) => !Number.isFinite(r.pose[k]),
              ) ||
              ["x", "y", "z"].some(
                (k) => !Number.isFinite(r.patientPosition[k]),
              )
            )
              fail(item.id, "invalid recording coordinates");
          }
          if (!positions.some((p) => p.id === item.positionId))
            fail(item.id, "unknown scan position");
        }
      }
    return errors;
  }
  return {
    statuses,
    navigation,
    modes,
    positions,
    coordinateSystem,
    evaluate,
    loadProgress,
    saveProgress,
    markRead,
    recordAnswer,
    moduleProgress,
    probeFrame,
    patientToScreen,
    screenToPatient,
    angularDistance,
    reviewLabel,
    authorizedMedia,
    resolveRecording,
    validate,
  };
});
