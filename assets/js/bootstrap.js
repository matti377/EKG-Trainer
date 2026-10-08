(async function () {
  "use strict";
  const app = Resqly.detect(location);
  document.documentElement.dataset.application = app;
  const switcher = document.createElement("nav");
  switcher.className = "application-switcher";
  switcher.setAttribute("aria-label", "Resqly Anwendungen");
  for (const name of ["ekg", "sono"]) {
    const link = document.createElement("a");
    link.href = Resqly.switchURL(name, location);
    link.textContent = name.toUpperCase();
    if (name === app) link.setAttribute("aria-current", "true");
    switcher.append(link);
  }
  document.querySelector(".brand").after(switcher);
  if (app === "sono") {
    document.title = "SONO by Resqly — Sonographie verstehen";
    document.querySelector('meta[name="description"]').content =
      "Sonographie lernen: sechs Module, klinische Lehrfälle, Bildatlas und ein transparenter Simulator für Schallkopforientierung.";
    document.querySelector('meta[name="theme-color"]').content = "#e2f7f5";
    document.querySelector('link[rel="icon"]').href =
      "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="#0a8d83"/><path d="M20 25Q50 10 80 25L65 80Q50 90 35 80Z" fill="none" stroke="white" stroke-width="7"/></svg>',
      );
    document.querySelector(".brand").href = "#/home";
    document.querySelector(".brand > span:last-child").textContent =
      "SONO by Resqly";
    document.querySelector(".brand-mark svg").innerHTML =
      '<path d="M8 4h8v5H8zM8 9L3 19q9 5 18 0L16 9M6 15q6 4 12 0"/>';
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = resqlyAssetRoot + "assets/css/sono.css";
    document.head.append(css);
    document.getElementById("nav").innerHTML = "";
  }
  const route = Resqly.route(location, app);
  if (
    location.protocol !== "file:" &&
    location.pathname !== "/" &&
    location.pathname !== "/index.html"
  ) {
    const query = new URLSearchParams(location.search);
    if (!Object.values(Resqly.domains).includes(location.hostname))
      query.set("app", app);
    history.replaceState(
      null,
      "",
      "/" + (query.size ? "?" + query.toString() : "") + "#/" + route,
    );
  } else if (!location.hash)
    history.replaceState(
      null,
      "",
      location.pathname + location.search + "#/" + route,
    );
  const files =
    app === "sono"
      ? [
          "ui.js",
          "sono/content.js",
          "sono/core.js",
          "sono/illustrations.js",
          "sono/app.js",
        ]
      : [
          "ekg.js?v=25",
          "heart.js?v=25",
          "content.js?v=25",
          "ui.js?v=25",
          "challenge.js?v=1",
          "app.js?v=30",
        ];
  try {
    for (const file of files)
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = resqlyAssetRoot + "assets/js/" + file;
        script.onload = resolve;
        script.onerror = reject;
        document.body.append(script);
      });
  } catch (_) {
    document.getElementById("app").textContent =
      "Die Anwendung konnte nicht geladen werden. Bitte die Seite neu laden.";
  }
})();
