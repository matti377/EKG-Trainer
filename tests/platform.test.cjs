const { test } = require("node:test");
const assert = require("node:assert/strict");
const P = require("../assets/js/platform.js");
const loc = (url) => new URL(url);
test("the root page is the academy unless an old entry point names a course", () => {
  for (const url of [
    "https://academy.resqly.lu/",
    "http://localhost:8000/",
    "http://localhost:8000/?app=academy",
    "http://localhost:8000/?app=constructor",
    "file:///tmp/index.html",
  ])
    assert.equal(P.legacy(loc(url)), null);
  assert.equal(P.legacyURL(loc("http://localhost:8000/#/pfad")), null);
});
test("course domains take precedence over query overrides", () => {
  assert.equal(P.legacy(loc("https://sono.resqly.lu/?app=ekg#/pfad")), "sono");
  assert.equal(P.legacy(loc("https://ekg.resqly.lu/?app=sono#/pfad")), "ekg");
  assert.equal(P.legacy(loc("https://SONO.RESQLY.LU/")), "sono");
});
test("old entry points are forwarded to the course folder with their route", () => {
  assert.equal(
    P.legacyURL(loc("https://ekg.resqly.lu/#/lektion/l1_1")),
    "https://ekg.resqly.lu/ekg/#/lektion/l1_1",
  );
  assert.equal(
    P.legacyURL(loc("https://ekg.resqly.lu/")),
    "https://ekg.resqly.lu/ekg/#/pfad",
  );
  assert.equal(
    P.legacyURL(loc("http://localhost:8000/?app=sono#/quiz/lunge")),
    "/sono/#/quiz/lunge",
  );
  assert.equal(
    P.legacyURL(loc("http://sono.localhost:8000/")),
    "/sono/#/home",
  );
  assert.equal(
    P.legacyURL(loc("file:///tmp/index.html?app=sono#/home")),
    "sono/index.html#/home",
  );
});
test("course links use folders, the dedicated domains and file previews", () => {
  assert.equal(
    P.switchURL("ekg", loc("https://academy.resqly.lu/"), "academy"),
    "/ekg/#/pfad",
  );
  assert.equal(
    P.switchURL("sono", loc("http://localhost:8000/ekg/"), "ekg"),
    "/sono/#/home",
  );
  assert.equal(
    P.switchURL("sono", loc("https://ekg.resqly.lu/ekg/"), "ekg"),
    "https://sono.resqly.lu/sono/#/home",
  );
  assert.equal(
    P.switchURL("ekg", loc("https://sono.resqly.lu/sono/"), "sono"),
    "https://ekg.resqly.lu/ekg/#/pfad",
  );
  assert.equal(
    P.switchURL("ekg", loc("file:///tmp/index.html"), "academy"),
    "ekg/index.html#/pfad",
  );
  assert.equal(
    P.switchURL("sono", loc("file:///tmp/ekg/index.html"), "ekg"),
    "../sono/index.html#/home",
  );
  assert.throws(() => P.switchURL("other", loc("http://localhost/"), "ekg"));
});
test("every existing EKG hash route remains untouched", () => {
  for (const route of [
    "pfad",
    "trainer",
    "bibliothek",
    "labor",
    "ableitungen",
    "challenge",
    "lektion/test",
  ])
    assert.equal(
      P.route(loc("https://ekg.resqly.lu/ekg/#/" + route), "ekg"),
      route,
    );
  assert.equal(P.route(loc("http://localhost/ekg/"), "ekg"), "pfad");
  assert.equal(P.route(loc("http://localhost/ekg/index.html"), "ekg"), "pfad");
});
test("SONO deep links, empty folder and hash precedence", () => {
  assert.equal(
    P.route(loc("http://localhost/sono/lektion/lunge-06"), "sono"),
    "lektion/lunge-06",
  );
  assert.equal(P.route(loc("https://sono.resqly.lu/sono/"), "sono"), "home");
  assert.equal(
    P.route(loc("https://sono.resqly.lu/sono/atlas#/simulator"), "sono"),
    "simulator",
  );
});
