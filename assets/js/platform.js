/* Shared application selection. Production hostnames take priority over overrides. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Resqly = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const domains = { ekg: "ekg.resqly.lu", sono: "sono.resqly.lu" };
  function detect(location) {
    const host = location.hostname.toLowerCase();
    for (const [app, domain] of Object.entries(domains))
      if (host === domain) return app;
    const override = new URLSearchParams(location.search).get("app");
    if (override === "sono" || override === "ekg") return override;
    return /^\/sono(?:\/|$)/.test(location.pathname) ||
      host === "sono.localhost"
      ? "sono"
      : "ekg";
  }
  function switchURL(app, location) {
    if (!domains[app]) throw new Error("Unknown application");
    const route = app === "sono" ? "home" : "pfad";
    if (Object.values(domains).includes(location.hostname.toLowerCase()))
      return "https://" + domains[app] + "/#/" + route;
    return "?app=" + app + "#/" + route;
  }
  function route(location, app) {
    const hash = location.hash.replace(/^#\/?/, "");
    if (hash) return hash;
    const path = location.pathname
      .replace(/^\/(sono|ekg)(\/|$)/, "/")
      .replace(/^\/|\/$/g, "");
    return path && path !== "index.html"
      ? path
      : app === "sono"
        ? "home"
        : "pfad";
  }
  return { domains, detect, switchURL, route };
});
