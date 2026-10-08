/* SONO views reuse the existing UI.h, UI.shuffle and shared Resqly theme. */
(function () {
  "use strict";
  const C = SONO_CONTENT,
    K = SONO,
    h = UI.h;
  const root = document.getElementById("app");
  let storage;
  try {
    storage = window.localStorage;
  } catch (_) {
    storage = null;
  }
  const state = K.loadProgress(storage);
  let transient = null;
  const find = (group, id) => C[group].find((x) => x.id === id);
  const text = (tag, value, cls) => h(tag, { text: value, class: cls || "" });
  const link = (label, to, cls = "sono-link") =>
    h("a", { href: "#/" + to, text: label, class: cls });
  function persist() {
    const ok = K.saveProgress(storage, state);
    document.getElementById("sono-storage").hidden = ok;
    renderStats();
  }
  function renderStats() {
    const completed = C.modules.filter(
      (m) => K.moduleProgress(m, state).complete,
    ).length;
    document
      .getElementById("top-stats")
      .replaceChildren(text("span", completed + "/6 Module", "sono-stat"));
  }
  function badge(item) {
    return text("span", K.reviewLabel(item), "sono-badge review");
  }
  function review(item) {
    return h("div", { class: "sono-review" }, [
      badge(item),
      text(
        "span",
        "Aktualisiert: " +
          item.lastUpdated +
          " · Fachprüfung: " +
          (item.lastReviewed || "noch nicht erfolgt"),
      ),
    ]);
  }
  function refs(ids, expanded = false) {
    const box = h(
      "details",
      { class: "sono-references", ...(expanded ? { open: "" } : {}) },
      [text("summary", "Quellen und Fundstellen (" + ids.length + ")")],
    );
    for (const id of ids) {
      const s = find("sources", id);
      if (!s) continue;
      box.append(
        h("div", {}, [
          h("a", {
            href: s.url,
            target: "_blank",
            rel: "noopener noreferrer",
            text: s.title,
          }),
          text(
            "p",
            s.organization +
              " · " +
              (s.publicationDate || "Publikationsdatum nicht verifiziert") +
              " · Zugriff " +
              s.accessDate,
          ),
          text("p", s.section),
          ...(s.verification !== "accessed"
            ? [
                text(
                  "p",
                  "Volltextverifikation ausstehend. Diese Quelle ist als ergänzende Prüfaufgabe verzeichnet.",
                  "sono-muted",
                ),
              ]
            : []),
        ]),
      );
    }
    return box;
  }
  function notice(title, body, cls = "") {
    return h("aside", { class: "sono-notice " + cls }, [
      text("strong", title),
      text("p", body),
    ]);
  }
  function heading(kicker, title, desc, level = "h1") {
    return h("header", { class: "sono-heading" }, [
      text("p", kicker, "sono-kicker"),
      text(level, title),
      desc ? text("p", desc, "sono-lead") : null,
    ]);
  }
  function button(label, onclick, cls = "btn") {
    return h("button", { type: "button", class: cls, text: label, onclick });
  }
  function panel(title, children) {
    return h("section", { class: "sono-card" }, [
      text("h2", title),
      ...children,
    ]);
  }
  function footer() {
    return h("footer", { class: "sono-footer" }, [
      text(
        "p",
        "Medizinische Bildung · ersetzt weder beaufsichtigtes praktisches Training noch klinische Beurteilung.",
      ),
      h("div", {}, [
        link("Methodik & Prüfstatus", "methodik"),
        link("Quellen", "quellen"),
      ]),
    ]);
  }
  function grid(children) {
    return h("div", { class: "sono-grid" }, children);
  }
  function heroDiagram() {
    return h("div", {
      class: "sono-hero-art",
      html: '<svg viewBox="0 0 380 280" role="img" aria-label="Abstrakte Illustration eines Schallfelds, kein medizinisches Ultraschallbild"><defs><linearGradient id="sono-beam" x2="0" y2="1"><stop stop-color="#15b9a8" stop-opacity=".32"/><stop offset="1" stop-color="#15b9a8" stop-opacity=".04"/></linearGradient></defs><path d="M171 44L57 226Q190 309 323 226L209 44Z" fill="url(#sono-beam)"/><g fill="none" stroke="#0a8d83" stroke-width="2" opacity=".45"><path d="M156 76Q190 95 224 76M134 112Q190 149 246 112M111 152Q190 204 269 152M85 192Q190 260 295 192"/></g><rect x="161" y="21" width="58" height="37" rx="12" fill="#14243f"/><circle cx="174" cy="36" r="4" fill="#5cf0d7"/><path d="M190 21V2" stroke="#14243f" stroke-width="7"/><circle cx="110" cy="152" r="7" fill="#12b3a6"/><path d="M105 146L74 100H25" fill="none" stroke="#0a8d83"/><text x="16" y="88" fill="#0a8d83" font-size="13" font-family="sans-serif">Verstehen.</text><text x="207" y="273" fill="#526582" font-size="11" font-family="sans-serif">Illustration · kein Ultraschallbild</text></svg>',
    });
  }
  function home() {
    root.append(
      h("section", { class: "sono-hero" }, [
        h("div", {}, [
          text("p", "RESQLY ACADEMY / SONOGRAPHIE", "sono-kicker"),
          text("h1", "Sehen lernen.\nSicher einordnen."),
          text(
            "p",
            "Dein Einstieg in die Sonographie. Von der ersten Schallwelle bis zur fokussierten Untersuchung – mit klaren Lernschritten und ehrlichen Befundgrenzen.",
            "sono-lead",
          ),
          h("div", { class: "sono-actions" }, [
            link("Lernpfad starten →", "pfad", "btn"),
            link("Simulator erkunden", "simulator", "btn gray"),
          ]),
        ]),
        heroDiagram(),
      ]),
    );
    root.append(
      h("div", { class: "sono-metrics" }, [
        metric("06", "Lernmodule"),
        metric("73", "Kurze Lektionen"),
        metric("05", "Klinische Lehrfälle"),
        metric(String(C.quizzes.length), "Wissensfragen"),
      ]),
    );
    root.append(
      notice(
        "In fachlicher Vorbereitung",
        "Alle medizinischen Inhalte warten auf unabhängige Fachprüfung. Originalclips sind noch nicht freigegeben. Du kannst bereits Theorie, Fragen und Schallkopforientierung erkunden.",
      ),
    );
    root.append(
      heading(
        "DEIN LERNPFAD",
        "Ein Fundament. Sechs Perspektiven.",
        "Starte mit den Grundlagen oder vertiefe eine Region.",
        "h2",
      ),
    );
    root.append(grid(C.modules.map(moduleCard)));
    root.append(
      h("section", { class: "sono-feature" }, [
        h("div", {}, [
          text("p", "VOM WISSEN ZUR ORIENTIERUNG", "sono-kicker"),
          text("h2", "Jedes Bild beginnt\nmit einer guten Frage."),
          text(
            "p",
            "Bewege den Schallkopf, verändere seine Ausrichtung und lerne die Untersuchungsfenster kennen. Fehlende Aufnahmen bleiben sichtbar als solche gekennzeichnet.",
          ),
        ]),
        link("Zum Simulator →", "simulator", "btn"),
      ]),
    );
  }
  function metric(value, label) {
    return h("div", {}, [text("strong", value), text("span", label)]);
  }
  function moduleCard(m) {
    const p = K.moduleProgress(m, state);
    return h(
      "a",
      {
        class: "sono-module",
        href: "#/modul/" + m.id,
        style: "--module-color:" + m.color,
      },
      [
        h("div", { class: "sono-card-top" }, [
          text("span", m.number, "sono-number"),
          text(
            "span",
            p.complete ? "Abgeschlossen" : m.lessons.length + " Lektionen",
            "sono-muted",
          ),
        ]),
        text("h2", m.title),
        text("p", m.description),
        h("progress", {
          max: p.total,
          value: p.read,
          "aria-label": m.title + ": gelesene Lektionen",
        }),
        h("div", { class: "sono-card-top" }, [
          text(
            "small",
            p.read +
              "/" +
              p.total +
              " gelesen · " +
              p.passed +
              "/" +
              p.quizTotal +
              " Fragen",
          ),
          text("span", "→"),
        ]),
      ],
    );
  }
  function path() {
    root.append(
      heading(
        "SCHRITT FÜR SCHRITT",
        "Dein Lernpfad",
        "Gelesene Lektionen und bestandene Wissensfragen werden auf diesem Gerät gespeichert. Ein Modul zählt erst nach beiden Schritten als abgeschlossen.",
      ),
    );
    root.append(grid(C.modules.map(moduleCard)));
    root.append(
      notice(
        "Lernfortschritt ist keine Qualifikation",
        "Diese Anzeige dokumentiert Selbststudium, keine klinische Befähigung oder Zertifizierung.",
      ),
    );
  }
  function moduleView(id) {
    const m = find("modules", id);
    if (!m) return notFound();
    const p = K.moduleProgress(m, state);
    root.append(link("← Alle Module", "pfad"));
    root.append(heading("MODUL " + m.number, m.title, m.description));
    root.append(
      text(
        "p",
        p.read +
          "/" +
          p.total +
          " Lektionen gelesen · " +
          p.passed +
          "/" +
          p.quizTotal +
          " Wissensfragen bestanden",
        "sono-muted",
      ),
    );
    const list = h("ol", { class: "sono-lessons" });
    for (const [i, lid] of m.lessons.entries()) {
      const l = find("lessons", lid);
      list.append(
        h("li", {}, [
          h("a", { href: "#/lektion/" + lid }, [
            text(
              "span",
              state.read[lid] ? "✓" : String(i + 1).padStart(2, "0"),
              "sono-step",
            ),
            h("div", {}, [
              text("strong", l.title),
              text("small", "Ca. " + l.minutes + " Min. · " + K.reviewLabel(l)),
            ]),
            text("span", "→"),
          ]),
        ]),
      );
    }
    root.append(list, link("Wissenscheck zum Modul →", "quiz/" + m.id, "btn"));
  }
  function lesson(id) {
    const l = find("lessons", id);
    if (!l) return notFound();
    const m = find("modules", l.relatedModules[0]);
    root.append(link("← " + m.title, "modul/" + m.id));
    root.append(heading("LEKTION · " + m.title.toUpperCase(), l.title));
    root.append(review(l));
    root.append(
      panel(
        "Dein Lernziel",
        l.objectives.map((s) => text("p", s)),
      ),
    );
    for (const block of l.content)
      root.append(
        panel(block.heading, [
          text("p", block.text, "sono-body-copy"),
          refs(block.sources),
        ]),
      );
    if (l.diagram)
      root.append(l.diagram === "wave" ? waveDiagram() : orientationDiagram());
    root.append(
      notice("Grenzen & mögliche Fehlinterpretation", l.limitations.join(" ")),
    );
    const i = m.lessons.indexOf(l.id);
    const readButton = button(
      state.read[id]
        ? "✓ Als gelesen gespeichert"
        : "Lektion als gelesen markieren",
      () => {
        K.markRead(state, id, C);
        persist();
        readButton.textContent = "✓ Als gelesen gespeichert";
      },
    );
    root.append(
      h("div", { class: "sono-actions" }, [
        readButton,
        i < m.lessons.length - 1
          ? link("Nächste Lektion →", "lektion/" + m.lessons[i + 1], "btn gray")
          : link("Zum Wissenscheck →", "quiz/" + m.id, "btn gray"),
      ]),
    );
    root.append(
      text(
        "p",
        "Die Wissensfragen werden am Ende des Moduls geprüft.",
        "sono-muted",
      ),
      refs(l.sources, true),
    );
  }
  function waveDiagram() {
    const out = text("output", "");
    const svg = h("div", { class: "sono-wave" });
    const input = h("input", {
      type: "range",
      min: 1,
      max: 8,
      value: 3,
      step: 1,
      "aria-label": "Relative Frequenz",
    });
    function draw() {
      const f = Number(input.value);
      let d = "";
      for (let x = 0; x <= 600; x += 2)
        d +=
          (x ? "L" : "M") +
          x +
          "," +
          (70 - 38 * Math.sin((x / 600) * f * 2 * Math.PI));
      svg.innerHTML =
        '<svg viewBox="0 0 600 140" role="img" aria-label="Idealisierte Welle: höhere Frequenz verkürzt die Wellenlänge bei gleicher Geschwindigkeit"><path d="M0 70H600" stroke="#dfe7f3"/><path d="' +
        d +
        '" fill="none" stroke="#0a8d83" stroke-width="3"/></svg>';
      out.textContent =
        "Relative Frequenz " +
        f +
        " · relative Wellenlänge " +
        (1 / f).toFixed(2);
    }
    input.addEventListener("input", draw);
    draw();
    return panel("Frequenz erkunden", [
      text(
        "p",
        "Lehrdiagramm · konstante Ausbreitungsgeschwindigkeit, frei gewählte Einheiten. Kein Ultraschallbild.",
      ),
      svg,
      h("label", {}, [text("span", "Frequenz"), input]),
      out,
      text(
        "p",
        "Die Darstellung zeigt nur die Beziehung λ = c / f. Sie simuliert weder Gewebe noch Bildauflösung.",
        "sono-muted",
      ),
    ]);
  }
  function orientationDiagram() {
    let angle = 0;
    const display = h("div", { class: "sono-orientation" });
    const label = text("p", "");
    function draw() {
      const p = K.probeFrame({ rotation: angle, tilt: 0, rock: 0 });
      display.innerHTML =
        '<svg viewBox="0 0 400 180" role="img" aria-label="Lehrdiagramm: Schallkopfmarkierung und Patientenachsen"><text x="15" y="30">Patienten-rechts</text><text x="265" y="30">Patienten-links</text><path d="M200 45V155M75 100H325" stroke="#bdcbdc"/><g transform="translate(200 100) rotate(' +
        -angle +
        ')"><rect x="-12" y="-40" width="24" height="80" rx="10" fill="#14243f"/><circle cy="-29" r="6" fill="#12b3a6"/></g></svg>';
      label.textContent =
        "Marker: " +
        (Math.abs(p.marker.y) > 0.9 ? "kranial" : "Patienten-rechts") +
        " · Marker-seitige Echos werden in dieser Lehrkonvention links dargestellt.";
    }
    draw();
    return panel("Orientierung ausprobieren", [
      text(
        "p",
        "Anatomisches Lehrdiagramm, Frontalansicht. Allgemeine B-Mode-Konvention; kardiale Gerätekonventionen separat prüfen.",
      ),
      display,
      button(
        "Längs / quer wechseln",
        () => {
          angle = angle === 0 ? 90 : 0;
          draw();
        },
        "btn gray",
      ),
      label,
    ]);
  }
  function quizView(id) {
    const m = find("modules", id);
    if (!m) return notFound();
    root.append(link("← " + m.title, "modul/" + id));
    root.append(
      heading(
        "WISSENSCHECK",
        m.title,
        "Bei mehreren richtigen Antworten musst du alle richtigen und keine falsche Option auswählen. Jede Antwort wird erläutert.",
      ),
    );
    for (const qid of m.quizRefs) root.append(quizCard(find("quizzes", qid)));
  }
  function quizCard(q) {
    const form = h("form", { class: "sono-card sono-quiz" });
    const field = h("fieldset", {}, [text("legend", q.prompt)]);
    const multiple = q.correctAnswers.length > 1;
    const feedback = h("div", {
      class: "sono-feedback",
      "aria-live": "polite",
    });
    const seed = Array.from(q.id).reduce((a, c) => a + c.charCodeAt(0), 0);
    for (const o of UI.shuffle(q.options, seed)) {
      field.append(
        h("label", { class: "sono-option" }, [
          h("input", {
            type: multiple ? "checkbox" : "radio",
            name: q.id,
            value: o.id,
          }),
          text("span", o.text),
        ]),
      );
    }
    const submit = h("button", {
      type: "submit",
      class: "btn sm",
      text: "Antwort prüfen",
    });
    form.append(field, submit, feedback, review(q), refs(q.sources));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const selected = [...form.querySelectorAll("input:checked")].map(
        (x) => x.value,
      );
      if (!selected.length) {
        feedback.replaceChildren(text("p", "Bitte wähle eine Antwort."));
        return;
      }
      const ok = K.recordAnswer(state, q.id, selected, C);
      persist();
      feedback.replaceChildren(
        text("h3", ok ? "Richtig eingeordnet." : "Noch nicht richtig."),
      );
      feedback.classList.toggle("correct", ok);
      for (const o of q.options)
        feedback.append(
          text(
            "p",
            (q.correctAnswers.includes(o.id) ? "✓ " : "○ ") +
              o.text +
              " — " +
              o.explanation,
          ),
        );
    });
    return form;
  }
  function cases() {
    root.append(
      heading(
        "KLINISCH DENKEN",
        "Fünf Fälle. Klare Fragestellungen.",
        "Fiktive Lehrfälle mit Anamnese, Akquisition und differenzierter Interpretation. Die klinischen Originalclips stehen noch aus.",
      ),
    );
    root.append(
      grid(
        C.cases.map((c, i) =>
          h("a", { class: "sono-module", href: "#/fall/" + c.id }, [
            text("p", "FALL " + String(i + 1).padStart(2, "0"), "sono-kicker"),
            text("h2", c.title),
            text("p", c.history),
            badge(c),
            text("small", "Originalclip ausstehend · Fall öffnen →"),
          ]),
        ),
      ),
    );
  }
  function caseView(id) {
    const c = find("cases", id);
    if (!c) return notFound();
    root.append(
      link("← Alle Fallbeispiele", "faelle"),
      heading("FIKTIVER LEHRFALL", c.title),
      review(c),
    );
    root.append(
      panel("Ausgangssituation", [
        text("p", c.history),
        text("p", c.vitals, "sono-vitals"),
        text(
          "small",
          "Frei erfundene Lehrfallwerte; keine Daten einer realen Person.",
        ),
      ]),
      panel(
        "Lernziele",
        c.objectives.map((s) => text("p", s)),
      ),
    );
    const pos = K.positions.find((p) => p.id === c.positionId);
    root.append(
      panel("Akquisition", [
        text("p", pos.instruction),
        text("p", c.acquisition),
        link(
          "Dieses Fenster im Simulator öffnen →",
          "simulator/" + c.id,
          "btn sm",
        ),
      ]),
    );
    root.append(panel("Bildinterpretation", [text("p", c.interpretation)]));
    for (const sid of c.signRefs) {
      const s = find("signs", sid);
      root.append(
        panel(s.title, [
          ...s.content.map((b) => text("p", b.text)),
          notice("Aussagegrenze", s.limitations.join(" ")),
          review(s),
          refs(s.sources),
        ]),
      );
    }
    root.append(
      notice("Differenzialdiagnosen & Grenzen", c.differentials),
      quizCard(find("quizzes", c.quizRefs[0])),
      refs(c.sources, true),
    );
  }
  function mediaElement(m) {
    if (!K.authorizedMedia(m))
      return h("div", { class: "sono-missing" }, [
        text("span", "◎", "sono-missing-icon"),
        text("strong", "Klinischer Clip ausstehend"),
        text(
          "p",
          "Keine lizenzierte, fachlich freigegebene Aufnahme hinterlegt.",
        ),
      ]);
    if (m.mimeType.startsWith("video/"))
      return h("video", {
        controls: "",
        playsinline: "",
        preload: "metadata",
        src: m.url,
        "aria-label": m.title,
      });
    return h("img", { src: m.url, alt: m.title, loading: "lazy" });
  }
  function atlas() {
    root.append(
      heading(
        "BILD- UND VIDEOATLAS",
        "Gezielt finden. Bewusst einordnen.",
        "Fünf vorbereitete Medieneinträge. Aktuell sind keine klinischen Aufnahmen freigegeben. Metadaten beschreiben den geplanten Lehrinhalt.",
      ),
    );
    const filters = h("div", { class: "sono-filters" });
    const search = h("input", {
      type: "search",
      placeholder: "Zeichen, Region oder Titel suchen",
      "aria-label": "Atlas durchsuchen",
    });
    filters.append(h("label", {}, [text("span", "Suche"), search]));
    const configs = [
      ["region", "Körperregion", (m) => m.region],
      ["finding", "Befund", (m) => m.finding],
      ["sign", "Zeichen", (m) => m.signs.map((id) => find("signs", id).title)],
      ["mode", "Bildmodus", (m) => m.mode],
      ["probe", "Schallkopf", (m) => m.probe],
      ["module", "Lernmodul", (m) => m.relatedModules],
      ["difficulty", "Schwierigkeit", (m) => m.difficulty],
    ];
    const selects = {};
    for (const [key, label, get] of configs) {
      const sel = h("select", { "aria-label": label }, [
        h("option", { value: "", text: "Alle" }),
      ]);
      const values = [...new Set(C.media.flatMap((m) => get(m)))];
      for (const value of values)
        sel.append(
          h("option", {
            value,
            text: key === "module" ? find("modules", value).title : value,
          }),
        );
      selects[key] = sel;
      filters.append(h("label", {}, [text("span", label), sel]));
      sel.addEventListener("change", update);
    }
    const count = text("p", "", "sono-muted");
    count.setAttribute("aria-live", "polite");
    const results = grid([]);
    function update() {
      const query = search.value.toLocaleLowerCase("de");
      const matches = C.media.filter(
        (m) =>
          (
            m.title +
            " " +
            m.region +
            " " +
            m.signs.map((id) => find("signs", id).title).join(" ")
          )
            .toLocaleLowerCase("de")
            .includes(query) &&
          configs.every(
            ([key, _, get]) =>
              !selects[key].value ||
              [].concat(get(m)).includes(selects[key].value),
          ),
      );
      count.textContent =
        matches.length +
        " Einträge · " +
        matches.filter(K.authorizedMedia).length +
        " freigegebene Originalaufnahmen";
      results.replaceChildren(
        ...matches.map((m) =>
          h("a", { href: "#/atlas/" + m.id, class: "sono-atlas-card" }, [
            mediaElement(m),
            h("div", {}, [
              text("h2", m.title),
              text("p", m.region + " · " + m.mode + "-Mode · " + m.probe),
              badge(m),
            ]),
          ]),
        ),
      );
      if (!matches.length)
        results.append(
          notice("Keine Treffer", "Passe Suchbegriff oder Filter an."),
        );
    }
    search.addEventListener("input", update);
    root.append(filters, count, results);
    update();
  }
  function atlasDetail(id) {
    const m = find("media", id);
    if (!m) return notFound();
    root.append(
      link("← Zum Bildatlas", "atlas"),
      heading("MEDIENEINTRAG", m.title),
      review(m),
      mediaElement(m),
    );
    const labels = h("div", {}, [
      panel("Geplante Einordnung", [
        text(
          "p",
          m.region +
            " · " +
            m.finding +
            " · " +
            m.probe +
            " · " +
            m.mode +
            "-Mode",
        ),
        text("p", m.orientation),
        text("p", m.interpretation),
        text("p", "Artefakte: " + m.artifacts),
      ]),
    ]);
    const toggle = button(
      "Beschriftungen ausblenden",
      () => {
        labels.hidden = !labels.hidden;
        toggle.textContent = labels.hidden
          ? "Beschriftungen anzeigen"
          : "Beschriftungen ausblenden";
        toggle.setAttribute("aria-pressed", String(labels.hidden));
      },
      "btn gray",
    );
    toggle.setAttribute("aria-pressed", "false");
    root.append(
      toggle,
      labels,
      notice("Befundgrenzen bleiben sichtbar", m.limitations.join(" ")),
      panel("Herkunft und Nutzungsrechte", [
        text("p", "Medientyp: reale klinische Aufnahme (noch ausstehend)."),
        text(
          "p",
          "Lizenz: " +
            (m.license.name || "nicht geklärt") +
            " · Weiterverbreitung: " +
            (m.license.redistribution ? "erlaubt" : "nicht freigegeben"),
        ),
        text("p", "Attribution: " + m.attribution),
        text(
          "p",
          "Quelle der Aufnahme: " +
            (m.provenance.sourceURL || "noch nicht hinterlegt"),
        ),
      ]),
      refs(m.sources, true),
    );
  }
  function knowledge() {
    root.append(
      heading(
        "WISSEN & VERANTWORTUNG",
        "Nachschlagen mit Kontext.",
        "Quellen, Zeichen und die Grenzen dieses Lernangebots.",
      ),
    );
    root.append(
      grid([
        panel("Quellenverzeichnis", [
          text(
            "p",
            "Jeder Inhalt verweist auf konkrete Quellen und Fundstellen.",
          ),
          link("Alle Quellen →", "quellen"),
        ]),
        panel("Methodik & Prüfstatus", [
          text(
            "p",
            "Wie Lehrtexte, Medien und Simulator voneinander getrennt werden.",
          ),
          link("Methodik lesen →", "methodik"),
        ]),
      ]),
    );
    for (const s of C.signs)
      root.append(
        panel(s.title, [
          ...s.content.map((b) => text("p", b.text)),
          notice("Grenzen", s.limitations.join(" ")),
          review(s),
          refs(s.sources),
        ]),
      );
  }
  function sources() {
    root.append(
      heading(
        "TRANSPARENTE GRUNDLAGE",
        "Quellenverzeichnis",
        "Zugriffsdaten dokumentieren die Recherche, keine medizinische Freigabe. Fehlende Publikationsdaten und Volltextabgleiche bleiben als Prüfaufgaben sichtbar.",
      ),
    );
    root.append(
      refs(
        C.sources.map((s) => s.id),
        true,
      ),
    );
  }
  function methodology() {
    root.append(
      heading(
        "METHODIK",
        "Was diese Plattform leisten kann.",
        "Stand: " +
          C.updated +
          " · unabhängige medizinische Prüfung ausstehend.",
      ),
    );
    root.append(
      notice(
        "Bildung, keine klinische Entscheidungssoftware",
        "Die Plattform ersetzt weder beaufsichtigtes praktisches Training noch klinische Beurteilung. Bei eingeschränkter Bildqualität bleibt eine Frage gegebenenfalls unbeantwortbar.",
      ),
    );
    for (const [title, body] of [
      [
        "Medizinische Prüfung",
        "Alle 73 Lektionen, 16 Fragen, 6 Zeichen, 5 Fälle und 5 geplanten Medieneinträge warten auf Fachprüfung. Es wurde keine ärztliche Freigabe vergeben. Quellenzugriff und technische Tests sind kein Ersatz dafür.",
      ],
      [
        "Quellen & Aktualität",
        "ACEP Sonoguide liefert konkrete Fundstellen. EFSUMB-Empfehlungen und das Kursbuch sind für den weiterführenden Leitlinienabgleich verzeichnet. Abstract oder Übersichtsseite allein verifizieren keinen Volltext. Nicht verifizierte Publikationsdaten sind ausdrücklich offen.",
      ],
      [
        "Vier unterschiedliche Bildarten",
        "Reale klinische Aufnahmen benötigen belegte Rechte, anonymisierte Herkunft und Fachprüfung. Anatomische Illustrationen zeigen Orientierung. Lehrdiagramme vereinfachen Beziehungen. Simulierte diagnostische Ultraschallbilder sind hier nicht implementiert.",
      ],
      [
        "Demonstrationsmodus",
        "Der Torso ist eine schematische Ortskarte, kein anatomisch validiertes 3D-Modell. Positionen und Winkel sind explizite Lerndaten. Seitliche und dorsale Fenster sind in der Frontkarte nur projiziert, kein realer Schallweg.",
      ],
      [
        "Originalaufnahmen",
        "Ein endlicher Datensatz kann keine kontinuierliche Untersuchung reproduzieren. Nur passende, freigegebene Aufnahmen dürfen erscheinen. Zwischen Positionen werden keine klinischen Bilder interpoliert. Aktuell sind alle Aufnahmen ausstehend.",
      ],
      [
        "Tiefe, Gain und Freeze",
        "Tiefe wählt eine aufgezeichnete Tiefe; nicht verfügbare Tiefen bleiben ohne Bild. Gain kann bei ausdrücklich erlaubter Bearbeitung die Anzeigehelligkeit verändern, kein Beamforming. Freeze hält die Anzeige und ihre Akquisitionsregler an. Ohne Originalclip haben diese Regler keine medizinische Bildwirkung.",
      ],
      [
        "Orientierung",
        "Allgemeine Lehrkonvention: Schallkopfmarker entspricht dem linken Bildschirmmarker; längs kranial, transversal Patienten-rechts. Kardiale Konventionen können abweichen und müssen je Aufnahme dokumentiert werden. " +
          K.coordinateSystem,
      ],
      [
        "Fortschritt & Datenschutz",
        "Lernstand wird getrennt vom EKG unter sono-learning-v1 lokal gespeichert. Es gibt keine Cloud-Synchronisierung und keine Übertragung von Quizantworten. Blockierter Speicher erlaubt Selbststudium mit temporärem Lernstand.",
      ],
      [
        "Technische Validierung",
        "Tests prüfen Referenzen, Statusregeln, Orientierung und konservative Kernaussagen gegen einen versionierten Quellenabgleich. Dieser Abgleich ist selbst noch nicht klinisch freigegeben und beweist keine medizinische Richtigkeit.",
      ],
    ])
      root.append(panel(title, [text("p", body)]));
    root.append(refs(["training", "guidelines", "alara"], true));
  }
  function notFound() {
    root.append(
      heading("SEITE NICHT GEFUNDEN", "Dieser Lerninhalt ist nicht verfügbar."),
      link("Zum Lernpfad", "pfad", "btn"),
    );
  }
  function simulator(caseId) {
    let clinicalCase = find("cases", caseId) || C.cases[0];
    const initial = K.positions.find((p) => p.id === clinicalCase.positionId);
    const s = {
      positionId: initial.id,
      x: initial.position.x,
      y: initial.position.y,
      z: initial.position.z,
      rotation: 0,
      tilt: 0,
      rock: 0,
      contact: true,
      probe: clinicalCase.probe,
      depth: 6,
      gain: 50,
      mode: "B",
      frozen: false,
    };
    root.append(
      heading(
        "INTERAKTIVES LERNLABOR",
        "Dein Schallkopf. Deine Perspektive.",
        "Erkunde Position und Orientierung. Reale Bildinterpretation wird erst mit freigegebenen Aufnahmen möglich.",
      ),
    );
    const modeLabel = text("span", K.modes.demo, "sono-badge");
    root.append(
      h("div", { class: "sono-sim-status" }, [modeLabel, badge(clinicalCase)]),
    );
    const controls = h("section", { class: "sono-card sono-controls" }, [
      text("h2", "Untersuchung"),
    ]);
    const caseSelect = h("select", { "aria-label": "Lehrfall" });
    for (const c of C.cases)
      caseSelect.append(
        h("option", {
          value: c.id,
          text: c.title,
          ...(c.id === clinicalCase.id ? { selected: "" } : {}),
        }),
      );
    controls.append(field("Lehrfall", caseSelect));
    const positionSelect = h("select", {
      "aria-label": "Körperregion und Fenster",
    });
    for (const p of K.positions)
      positionSelect.append(
        h("option", {
          value: p.id,
          text: p.title,
          ...(p.id === s.positionId ? { selected: "" } : {}),
        }),
      );
    controls.append(field("Körperregion / Startfenster", positionSelect));
    const probeSelect = h(
      "select",
      { "aria-label": "Schallkopf" },
      [
        ["linear", "Linear"],
        ["convex", "Konvex"],
        ["phased", "Phased Array"],
      ].map(([v, t]) =>
        h("option", {
          value: v,
          text: t,
          ...(v === s.probe ? { selected: "" } : {}),
        }),
      ),
    );
    controls.append(field("Schallkopf", probeSelect));
    const torso = h("div", {
      class: "sono-torso",
      tabindex: 0,
      role: "group",
      "aria-label":
        "Schallkopfposition: per Ziehen oder Pfeiltasten verschieben. Position auch über Schieberegler einstellbar.",
    });
    torso.innerHTML =
      '<svg viewBox="0 0 300 340" role="img" aria-label="Schematische frontale Körperkarte, keine maßgetreue Anatomie"><path d="M122 22Q150 40 178 22L184 53Q202 59 224 63L245 142L220 156L211 117L209 243L218 302L162 319L150 280L138 319L82 302L91 243L89 117L80 156L55 142L76 63Q98 59 116 53Z" fill="#e6f0f1" stroke="#91b5b4" stroke-width="2"/><path d="M150 60V263M95 183H205" stroke="#abc5c7" stroke-dasharray="4 5"/><text x="16" y="43">R</text><text x="274" y="43">L</text><text x="94" y="333" font-size="10">Patientenansicht von vorn</text></svg>';
    const dot = h("div", { class: "sono-probe-dot", "aria-hidden": "true" }, [
      text("span", "●"),
    ]);
    torso.append(dot);
    const coordinate = text("p", "", "sono-coordinate");
    controls.append(
      torso,
      coordinate,
      text(
        "p",
        "Ziehen oder Pfeiltasten · R/L = Patientenseite. Schematische Projektion, kein anatomisch validiertes Schallwegmodell.",
        "sono-muted",
      ),
    );
    const sliders = {};
    for (const [key, label, min, max, step] of [
      ["x", "Position rechts (+) / links (−)", -1, 1, 0.01],
      ["y", "Position kranial (+) / kaudal (−)", -1, 1, 0.01],
      ["rotation", "Rotation (°)", 0, 360, 5],
      ["tilt", "Kippen (°)", -45, 45, 5],
      ["rock", "Abwinkeln (°)", -45, 45, 5],
      ["depth", "Gewünschte Tiefe (cm)", 2, 24, 1],
      ["gain", "Anzeige-Gain (%)", 0, 100, 1],
    ]) {
      const input = h("input", {
        type: "range",
        min,
        max,
        step,
        value: s[key],
        "aria-label": label,
      });
      const output = text("output", String(s[key]));
      input.addEventListener("input", () => {
        s[key] = Number(input.value);
        output.textContent = input.value;
        refresh();
      });
      sliders[key] = { input, output };
      controls.append(field(label, input, output));
    }
    const contact = h("input", {
      type: "checkbox",
      checked: "",
      "aria-label": "Schallkopfkontakt",
    });
    contact.addEventListener("change", () => {
      s.contact = contact.checked;
      refresh();
    });
    controls.append(
      h("label", { class: "sono-check" }, [
        contact,
        text("span", "Schallkopfkontakt"),
      ]),
    );
    const modeSelect = h("select", { "aria-label": "Bildmodus" }, [
      h("option", { value: "B", text: "B-Mode" }),
      h("option", {
        value: "M",
        text: "M-Mode · noch nicht verfügbar",
        disabled: "",
      }),
      h("option", {
        value: "Doppler",
        text: "Doppler · noch nicht verfügbar",
        disabled: "",
      }),
    ]);
    controls.append(field("Bildmodus", modeSelect));
    const right = h("div", { class: "sono-sim-right" });
    const viewer = h("section", {
      class: "sono-viewer",
      "aria-label": "Ultraschallanzeige",
    });
    const screen = h("div", { class: "sono-recording" });
    const viewerStatus = text("p", "", "sono-viewer-status");
    const marker = text("span", "● MARKER LINKS", "sono-screen-marker");
    viewer.append(marker, screen, viewerStatus);
    const freeze = button(
      "❚❚ Anzeige einfrieren",
      () => {
        s.frozen = !s.frozen;
        freeze.textContent = s.frozen
          ? "▶ Anzeige fortsetzen"
          : "❚❚ Anzeige einfrieren";
        freeze.setAttribute("aria-pressed", String(s.frozen));
        for (const input of controls.querySelectorAll("input,select"))
          input.disabled = s.frozen;
        torso.setAttribute("aria-disabled", String(s.frozen));
        if (video) {
          if (s.frozen) {
            wasPlaying = !video.paused;
            video.pause();
          } else if (wasPlaying) {
            video.play().catch(() => {});
          }
        }
        refresh();
      },
      "btn gray",
    );
    freeze.setAttribute("aria-pressed", "false");
    const instruction = panel("Akquisition & Orientierung", []);
    const anatomy = panel("Anatomische Orientierung", []);
    const labelsToggle = button(
      "Anatomische Hinweise ausblenden",
      () => {
        anatomy.hidden = !anatomy.hidden;
        labelsToggle.textContent = anatomy.hidden
          ? "Anatomische Hinweise anzeigen"
          : "Anatomische Hinweise ausblenden";
        labelsToggle.setAttribute("aria-pressed", String(!anatomy.hidden));
      },
      "btn gray",
    );
    labelsToggle.setAttribute("aria-pressed", "true");
    right.append(
      viewer,
      h("div", { class: "sono-actions" }, [freeze, labelsToggle]),
      instruction,
      anatomy,
      notice(
        "Was die Regler tatsächlich verändern",
        "Ohne Aufnahme ändern Gain und Tiefe nur die Auswahlparameter. Tiefe zeigt keine nicht aufgezeichnete Anatomie. Helligkeitsänderungen an freigegebenen Medien sind keine echte Signalverstärkung oder Ultraschallrekonstruktion.",
      ),
    );
    const layout = h("div", { class: "sono-simulator" }, [controls, right]);
    root.append(layout);
    const caseInfo = panel("Lernfrage zum Fall", [
      text("p", clinicalCase.history),
      text("p", clinicalCase.vitals),
      quizCard(find("quizzes", clinicalCase.quizRefs[0])),
      link("Vollständigen Fall lesen →", "fall/" + clinicalCase.id),
    ]);
    root.append(caseInfo);
    let activeMedia = null,
      video = null,
      wasPlaying = false;
    function sync() {
      for (const [key, control] of Object.entries(sliders)) {
        control.input.value = s[key];
        control.output.textContent = String(s[key]);
      }
    }
    function preset() {
      const p = K.positions.find((p) => p.id === positionSelect.value);
      s.positionId = p.id;
      Object.assign(s, p.position, p.orientation);
      sync();
      refresh();
    }
    positionSelect.addEventListener("change", preset);
    probeSelect.addEventListener("change", () => {
      s.probe = probeSelect.value;
      refresh();
    });
    caseSelect.addEventListener("change", () => {
      location.hash = "#/simulator/" + caseSelect.value;
    });
    function move(event) {
      if (s.frozen) return;
      const rect = torso.getBoundingClientRect();
      Object.assign(
        s,
        K.screenToPatient({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
        }),
      );
      sync();
      refresh();
    }
    torso.addEventListener("pointerdown", (e) => {
      if (s.frozen) return;
      torso.setPointerCapture(e.pointerId);
      move(e);
    });
    torso.addEventListener("pointermove", (e) => {
      if (torso.hasPointerCapture(e.pointerId)) move(e);
    });
    torso.addEventListener("pointerup", (e) => {
      if (torso.hasPointerCapture(e.pointerId))
        torso.releasePointerCapture(e.pointerId);
    });
    torso.addEventListener("keydown", (e) => {
      if (
        s.frozen ||
        !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      )
        return;
      e.preventDefault();
      s.x = Math.max(
        -1,
        Math.min(
          1,
          s.x +
            (e.key === "ArrowLeft" ? 0.02 : e.key === "ArrowRight" ? -0.02 : 0),
        ),
      );
      s.y = Math.max(
        -1,
        Math.min(
          1,
          s.y +
            (e.key === "ArrowUp" ? 0.02 : e.key === "ArrowDown" ? -0.02 : 0),
        ),
      );
      sync();
      refresh();
    });
    function refresh() {
      const p = K.positions.find((p) => p.id === s.positionId);
      const xy = K.patientToScreen(s);
      dot.style.left = xy.x + "%";
      dot.style.top = xy.y + "%";
      dot.style.transform =
        "translate(-50%,-50%) rotate(" + -s.rotation + "deg)";
      const frame = K.probeFrame(s);
      coordinate.textContent =
        "x " +
        s.x.toFixed(2) +
        " · y " +
        s.y.toFixed(2) +
        " · z " +
        s.z.toFixed(2) +
        " | Marker [" +
        [frame.marker.x, frame.marker.y, frame.marker.z]
          .map((n) => n.toFixed(2))
          .join(", ") +
        "]";
      const result = K.resolveRecording(s, clinicalCase, C.media);
      modeLabel.textContent =
        (result.status === "available" ? K.modes.recording : K.modes.demo) +
        (s.frozen ? " · eingefroren" : "");
      viewerStatus.textContent =
        "B-Mode angefragt · " +
        s.depth +
        " cm · Anzeige-Gain " +
        s.gain +
        " %" +
        (s.frozen ? " · FREEZE" : "");
      if (result.status === "available") {
        if (activeMedia !== result.media.id) {
          screen.replaceChildren(
            mediaElement(result.media),
            text("small", result.media.attribution),
            h("a", {
              href: result.media.provenance.sourceURL,
              target: "_blank",
              rel: "noopener noreferrer",
              text: "Originalquelle",
            }),
            h("a", {
              href: result.media.license.url,
              target: "_blank",
              rel: "noopener noreferrer",
              text: result.media.license.name,
            }),
          );
          activeMedia = result.media.id;
          video = screen.querySelector("video");
          if (video)
            video.addEventListener("play", () => {
              if (s.frozen) video.pause();
            });
          if (video)
            video.addEventListener("error", () => {
              screen.replaceChildren(
                text(
                  "p",
                  "Aufnahme konnte nicht geladen werden. Keine Bildinterpretation möglich.",
                ),
              );
            });
        }
        sliders.gain.input.disabled =
          s.frozen || !result.media.license.derivatives;
        const element = screen.querySelector("video,img");
        if (element)
          element.style.filter = result.media.license.derivatives
            ? "brightness(" + s.gain / 50 + ")"
            : "none";
      } else {
        sliders.gain.input.disabled = s.frozen;
        if (video) video.pause();
        activeMedia = null;
        video = null;
        screen.replaceChildren(
          text("span", "◎", "sono-missing-icon"),
          text("h2", "Kein klinisches Bild verfügbar"),
          text("p", result.reason),
          text("small", "Keine synthetische Ersatzaufnahme."),
        );
      }
      instruction.replaceChildren(
        text("h2", p.title),
        text("p", p.instruction),
        text(
          "p",
          "Start-Schnittebene: " +
            p.plane +
            " · Marker im Startfenster kranial. Freies Drehen verändert die Lehrorientierung, erzeugt aber keine neue Anatomie.",
        ),
      );
      anatomy.replaceChildren(
        text("h2", "Anatomische Orientierung"),
        text("p", p.labels.join(" · ")),
        text(
          "p",
          "Dies sind gesuchte Strukturen im Startfenster, keine Befunde des aktuellen Bildes.",
        ),
        text("p", K.coordinateSystem),
        text(
          "p",
          "Bildschirmmarker links. Echte kardiale Orientierung muss gesondert geprüft werden.",
        ),
      );
    }
    refresh();
    transient = () => {
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    };
  }
  function field(label, input, output) {
    return h("label", { class: "sono-field" }, [
      h("span", {}, [text("span", label), output || null]),
      input,
    ]);
  }
  function route() {
    if (transient) {
      transient();
      transient = null;
    }
    UI.clearLive();
    root.replaceChildren();
    const [r, id] = Resqly.route(location, "sono").split("/");
    document.querySelectorAll("#nav a").forEach((a) => {
      const active =
        a.dataset.r === r ||
        (a.dataset.r === "pfad" && ["modul", "lektion", "quiz"].includes(r)) ||
        (a.dataset.r === "faelle" && r === "fall") ||
        (a.dataset.r === "wissen" && ["quellen", "methodik"].includes(r));
      a.classList.toggle("on", active);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    const views = {
      home,
      pfad: path,
      modul: moduleView,
      lektion: lesson,
      quiz: quizView,
      faelle: cases,
      fall: caseView,
      atlas: id ? () => atlasDetail(id) : atlas,
      simulator,
      wissen: knowledge,
      quellen: sources,
      methodik: methodology,
    };
    (views[r] || notFound)(id);
    root.append(footer());
    const title = root.querySelector("h1");
    document.title =
      (title ? title.textContent.replace(/\n/g, " ") : "Lernen") +
      " — SONO by Resqly";
    if (title) {
      title.tabIndex = -1;
      title.focus({ preventScroll: true });
    }
    window.scrollTo(0, 0);
  }
  const nav = document.getElementById("nav");
  nav.append(
    h(
      "div",
      { class: "nav-in" },
      K.navigation.map(([route, label, icon]) =>
        h("a", { href: "#/" + route, "data-r": route, "aria-label": label }, [
          h("span", { text: icon, class: "ni", "aria-hidden": "true" }),
          text("span", label),
        ]),
      ),
    ),
  );
  const storageNote = text(
    "p",
    "Dein Browser erlaubt derzeit keinen dauerhaften Speicher. Der Lernstand bleibt nur in dieser Sitzung erhalten.",
    "sono-storage",
  );
  storageNote.id = "sono-storage";
  storageNote.hidden = true;
  document.querySelector("main").prepend(storageNote);
  renderStats();
  persist();
  window.addEventListener("hashchange", route);
  route();
  function devNotice() {
    const close = () => overlay.remove();
    const ok = h("button", { type: "button", text: "Verstanden" });
    const overlay = h(
      "div",
      { class: "sono-dev-overlay", role: "dialog", "aria-modal": "true" },
      [
        h("div", { class: "sono-dev-modal" }, [
          text("h2", "Seite in Entwicklung"),
          text(
            "p",
            "Dieser Sono-Bereich befindet sich noch in der Entwicklung. Inhalte sind unvollständig und noch nicht medizinisch geprüft.",
          ),
          ok,
        ]),
      ],
    );
    ok.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape") {
        close();
        document.removeEventListener("keydown", esc);
      }
    });
    document.body.append(overlay);
    ok.focus();
  }
  devNotice();
})();
