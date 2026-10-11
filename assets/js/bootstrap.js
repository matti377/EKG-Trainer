/* Shared start-up for the academy page and the course folders. Each index.html
   declares its application; this adds the course switcher and loads the scripts. */
(async function () {
  "use strict";
  const app = document.documentElement.dataset.application;
  const switcher = document.createElement("nav");
  switcher.className = "application-switcher";
  switcher.setAttribute("aria-label", "Resqly Anwendungen");
  for (const name of ["ekg", "sono"]) {
    const link = document.createElement("a");
    link.href = Resqly.switchURL(name, location, app);
    link.textContent = name.toUpperCase();
    if (name === app) link.setAttribute("aria-current", "true");
    switcher.append(link);
  }
  document.querySelector(".brand").after(switcher);
  if (app !== "academy") {
    // Path links such as /sono/lektion/lunge-06 become bookmarkable hash routes.
    const route = Resqly.route(location, app);
    const folder = "/" + app + "/";
    if (
      location.protocol !== "file:" &&
      location.pathname !== folder &&
      location.pathname !== folder + "index.html"
    )
      history.replaceState(null, "", folder + location.search + "#/" + route);
    else if (!location.hash)
      history.replaceState(
        null,
        "",
        location.pathname + location.search + "#/" + route,
      );
  }
  try {
    const accountScript = document.createElement("script");
    accountScript.src = resqlyAssetRoot + "assets/js/account.js?v=1";
    await new Promise((resolve, reject) => {
      accountScript.onload = resolve;
      accountScript.onerror = reject;
      document.body.append(accountScript);
    });
    await ResqlyAccount.init(app);
  } catch (_) {
    // The lessons remain available without account sync.
  }
  const files = {
    academy: ["ui.js", "academy/quiz.js", "academy/app.js"],
    sono: [
      "ui.js",
      "sono/content.js",
      "sono/core.js",
      "sono/illustrations.js",
      "sono/app.js",
    ],
    ekg: [
      "ekg.js?v=25",
      "heart.js?v=25",
      "content.js?v=25",
      "ui.js?v=25",
      "challenge.js?v=1",
      "app.js?v=31",
    ],
  }[app];
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
