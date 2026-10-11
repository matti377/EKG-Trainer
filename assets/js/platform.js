/* Shared site layout: the root page is the academy, every course lives in its own folder. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Resqly = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  // Course folders, their start routes and the domains that predate the folders.
  const domains = { ekg: "ekg.resqly.lu", sono: "sono.resqly.lu" };
  const homes = { ekg: "pfad", sono: "home" };
  const known = (app) => Object.prototype.hasOwnProperty.call(domains, app);
  function courseHost(location) {
    const host = location.hostname.toLowerCase();
    return Object.keys(domains).find((app) => domains[app] === host) || null;
  }
  // The root page used to be the course itself. Old entry points (a course
  // domain, ?app= links) name the folder they now belong to; null is the academy.
  function legacy(location) {
    const host = courseHost(location);
    if (host) return host;
    const override = new URLSearchParams(location.search).get("app");
    if (known(override)) return override;
    return location.hostname.toLowerCase() === "sono.localhost" ? "sono" : null;
  }
  // Link to a course folder. `from` is the application showing the link.
  function switchURL(app, location, from) {
    if (!known(app)) throw new Error("Unknown application");
    const target = app + "/";
    const hash = "#/" + homes[app];
    if (courseHost(location)) return "https://" + domains[app] + "/" + target + hash;
    if (location.protocol === "file:")
      return (known(from) ? "../" : "") + target + "index.html" + hash;
    return "/" + target + hash;
  }
  // Where an old entry point should go instead, keeping the requested route.
  function legacyURL(location) {
    const app = legacy(location);
    if (!app) return null;
    const url = switchURL(app, location);
    return location.hash ? url.slice(0, url.indexOf("#")) + location.hash : url;
  }
  function route(location, app) {
    const hash = location.hash.replace(/^#\/?/, "");
    if (hash) return hash;
    const path = location.pathname
      .replace(/^\/(sono|ekg)(\/|$)/, "/")
      .replace(/^\/|\/$/g, "");
    return path && path !== "index.html" ? path : homes[app] || "pfad";
  }
  return { domains, legacy, legacyURL, switchURL, route };
});
