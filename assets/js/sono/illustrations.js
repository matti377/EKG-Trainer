/* Deterministic, editable teaching diagrams. These are NOT diagnostic ultrasound images. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SONO_ILLUSTRATIONS = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const titles = {
    normal: "Pleuralbewegung & A-Linien",
    interstitial: "B-Linien: Artefaktprinzip",
    pneumothorax: "Lung Point: Übergang verstehen",
    pleural: "Pleuraerguss: anatomische Grenzen",
    trauma: "eFAST: hepatorenaler Flüssigkeitsraum",
  };
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const escapeXML = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const label = (x, y, t, color = "#b9d4df") =>
    `<text x="${x}" y="${y}" fill="${color}" font-size="14">${escapeXML(t)}</text>`;
  function frame(id, state = {}, time = 0) {
    id = id.replace(/^case-/, "");
    if (!titles[id]) id = "normal";
    const labels = state.labels !== false,
      gain = clamp(state.gain ?? 50, 0, 100),
      depth = clamp(state.depth ?? 6, 2, 24);
    const phase = Math.sin((time * 2 * Math.PI) / 4),
      slide = phase * 10,
      bline = id === "interstitial",
      ptx = id === "pneumothorax";
    const opacity = 0.25 + (0.75 * gain) / 100;
    let art = "",
      notes = "";
    if (["normal", "interstitial", "pneumothorax"].includes(id)) {
      art +=
        '<rect x="35" y="70" width="570" height="58" rx="13" fill="#685a69"/><path d="M35 91H605M35 113H605" stroke="#a8808d" stroke-width="3"/>';
      art +=
        '<ellipse cx="105" cy="125" rx="29" ry="21" fill="#dccbab"/><ellipse cx="535" cy="125" rx="29" ry="21" fill="#dccbab"/><path d="M76 146L60 360H149L134 146M506 146L490 360H579L564 146" fill="#071924" opacity=".65"/>';
      art += '<path d="M146 160H493" stroke="#f4d4b0" stroke-width="4"/>';
      const edge = ptx ? 320 + phase * 55 : 493;
      art += `<path d="M146 169H${edge}" stroke="#55ddc4" stroke-width="4"/>`;
      if (ptx)
        art += `<path d="M${edge} 169Q430 190 493 196" stroke="#ee91af" fill="none" stroke-width="4"/><path d="M${edge} 163L493 163V191Z" fill="#a4436844"/><line x1="${edge}" y1="152" x2="${edge}" y2="220" stroke="#efb766" stroke-width="2" stroke-dasharray="4 4"/>`;
      for (let x = 160; x < edge - 12; x += 22)
        art += `<path d="M${x + slide} 171l7 7" stroke="#55ddc4" stroke-width="2"/>`;
      if (state.mode === "M") {
        art +=
          '<rect x="155" y="212" width="330" height="130" fill="#0e2230"/>';
        for (let y = 220; y < 252; y += 8)
          art += `<path d="M155 ${y}H485" stroke="#9bb9c4" opacity=".6"/>`;
        for (let y = 266; y < 340; y += 12) {
          let d = "";
          for (let x = 155; x <= 485; x += 5)
            d +=
              (x === 155 ? "M" : "L") +
              x +
              "," +
              (y + (ptx ? 0 : Math.sin(x / 13 + y + time) * 4));
          art += `<path d="${d}" fill="none" stroke="${ptx ? "#ee91af" : "#55ddc4"}" opacity=".7"/>`;
        }
        if (labels)
          notes += label(
            161,
            370,
            ptx
              ? "Fehlende Bewegung: paralleles Zeitmuster"
              : "Bewegung: wechselndes Zeitmuster",
          );
      } else {
        for (let y = 222; y < 355; y += 58)
          art += `<path d="M151 ${y}H488" stroke="#8bb8cb" opacity=".65" stroke-width="2" stroke-dasharray="8 7"/>`;
        if (bline)
          for (const x of [218, 315, 423])
            art += `<path d="M${x + slide} 172L${x + slide - 7} 358L${x + slide + 7} 358Z" fill="#73dfff" opacity=".9"/>`;
        if (labels)
          notes += label(
            163,
            380,
            bline
              ? "Vertikale Artefakte · keine sichtbaren Bronchien"
              : "Gestrichelt: A-Linien als Artefakte, keine Gewebeschichten",
          );
      }
      if (labels) {
        notes +=
          label(39, 53, "Thoraxwand", "#dcc4cf") +
          label(45, 151, "Rippe") +
          label(530, 151, "Rippe") +
          label(168, 151, "Pleuralinie", "#f4d4b0");
        if (ptx) notes += label(334, 206, "Übergang (Lung Point)", "#efb766");
        else notes += label(177, 198, "Pleuralbewegung ↔", "#55ddc4");
      }
    } else if (id === "pleural") {
      const water = clamp(state.amount ?? 55, 10, 85);
      art +=
        '<path d="M60 238Q240 174 570 269L563 352Q337 390 105 333Z" fill="#ad756b" stroke="#e3afa0" stroke-width="2"/>';
      art += `<path d="M75 222Q240 ${210 - water} 558 245Q430 190 434 100Q330 63 224 105Q190 168 75 222Z" fill="#419aca" opacity=".75"/>`;
      art += `<path d="M215 84Q315 45 434 93Q435 ${145 + water / 3 + phase * 5} 354 193Q266 214 215 84Z" fill="#b4a4c0" stroke="#e0cfdf" stroke-width="3"/>`;
      art +=
        '<path d="M65 237Q238 169 573 265" fill="none" stroke="#f4d4b0" stroke-width="6"/>';
      if (labels)
        notes +=
          label(306, 320, "Leber", "#ffe0d5") +
          label(277, 131, "Lunge", "#fff") +
          label(114, 195, "Pleuralflüssigkeit", "#9cddff") +
          label(420, 281, "Zwerchfell", "#f4d4b0");
    } else {
      const water = clamp(state.amount ?? 55, 0, 100);
      art +=
        '<path d="M55 95Q180 45 369 106Q412 177 316 237Q168 264 73 217Z" fill="#b97d6f" stroke="#e4b4a1" stroke-width="3"/>';
      art +=
        '<path d="M443 191C540 154 578 283 506 331C435 378 360 318 372 261C378 232 410 215 443 191Z" fill="#997faa" stroke="#d6beda" stroke-width="3"/><path d="M445 228C484 208 522 269 481 302C450 324 406 294 416 263Z" fill="#e4c9b5"/>';
      if (water > 0)
        art += `<path d="M309 198Q${367 + water / 4} 226 425 205Q378 244 368 291Q${363 - water / 4} 239 283 248Z" fill="#4ca9d1" opacity=".9"/>`;
      if (labels)
        notes +=
          label(162, 157, "Leber", "#ffe0d5") +
          label(421, 350, "Rechte Niere", "#e7d8f0") +
          label(75, 297, "Hepatorenaler Rezess", "#8cd8ff") +
          '<path d="M252 288L350 248" stroke="#8cd8ff" fill="none"/>';
    }
    const zoom = 6 / depth;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440" role="img" aria-label="Lehrdiagramm: ${escapeXML(titles[id])}"><defs><clipPath id="scene-crop"><rect x="0" y="0" width="640" height="395"/></clipPath></defs><rect width="640" height="440" rx="16" fill="#102c3c"/><g font-family="system-ui,sans-serif"><g clip-path="url(#scene-crop)"><g transform="translate(320 60) scale(${zoom}) translate(-320 -60)"><g opacity="${opacity}">${art}</g>${labels ? notes : ""}</g></g><path d="M615 70V360" stroke="#5f8697"/>${[0, 1, 2, 3, 4].map((i) => '<path d="M609 ' + (70 + i * 72) + 'h12" stroke="#5f8697"/>').join("")}${label(26, 418, "LEHRDIAGRAMM · schematisch · keine diagnostische Aufnahme", "#85abba")}</g></svg>`;
  }
  function create(container, id) {
    let state = {},
      elapsed = 0,
      last = null,
      raf = null,
      dead = false;
    const stage = document.createElement("div");
    stage.className = "sono-diagram-stage";
    container.replaceChildren(stage);
    function paint() {
      stage.innerHTML = frame(id, state, elapsed);
      stage.dataset.phase = elapsed.toFixed(2);
    }
    function tick(now) {
      if (dead) return;
      if (last !== null && !state.frozen && !document.hidden)
        elapsed += Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!state.frozen && !document.hidden) paint();
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return {
      update(next) {
        state = { ...next };
        paint();
      },
      destroy() {
        dead = true;
        cancelAnimationFrame(raf);
      },
    };
  }
  function available(state, position) {
    if (!state.contact)
      return "Kein Schallkopfkontakt. Kontakt aktivieren, um die Demonstration fortzusetzen.";
    if (
      state.positionId !== position.id ||
      Math.hypot(state.x - position.position.x, state.y - position.position.y) >
        0.18
    )
      return "Startfenster verlassen. Schallkopf zum markierten Lernfenster zurückführen.";
    if (!position.probes.includes(state.probe))
      return "Für dieses Lehrfenster einen passenden Schallkopf wählen.";
    const angle = Math.min(state.rotation % 360, 360 - (state.rotation % 360));
    if (angle > 20 || Math.abs(state.tilt) > 20 || Math.abs(state.rock) > 20)
      return "Diese Schnittebene ist nicht modelliert. Mit „Startposition“ zur Demonstration zurückkehren.";
    return null;
  }
  return { titles, frame, create, available };
});
