const { test } = require("node:test");
const assert = require("node:assert/strict");
const P = require("../assets/js/platform.js");
const loc = (url) => new URL(url);
test("production hosts take precedence over query overrides", () => {
  assert.equal(P.detect(loc("https://sono.resqly.lu/?app=ekg#/pfad")), "sono");
  assert.equal(P.detect(loc("https://ekg.resqly.lu/?app=sono#/pfad")), "ekg");
  assert.equal(P.detect(loc("https://SONO.RESQLY.LU/")), "sono");
});
test("local development works with query, paths and hostname", () => {
  for (const url of [
    "http://localhost:8000/?app=sono",
    "http://localhost:8000/sono/simulator",
    "http://sono.localhost:8000/",
  ])
    assert.equal(P.detect(loc(url)), "sono");
  for (const url of [
    "http://localhost:8000/",
    "http://localhost:8000/?app=invalid",
    "file:///tmp/index.html",
  ])
    assert.equal(P.detect(loc(url)), "ekg");
});
test("switcher targets independent production domains and local previews", () => {
  assert.equal(
    P.switchURL("sono", loc("https://ekg.resqly.lu/")),
    "https://sono.resqly.lu/#/home",
  );
  assert.equal(
    P.switchURL("ekg", loc("https://sono.resqly.lu/")),
    "https://ekg.resqly.lu/#/pfad",
  );
  assert.equal(
    P.switchURL("sono", loc("http://localhost:8000/")),
    "?app=sono#/home",
  );
  assert.throws(() => P.switchURL("other", loc("http://localhost/")));
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
      P.route(loc("https://ekg.resqly.lu/#/" + route), "ekg"),
      route,
    );
});
test("SONO deep links, empty root and hash precedence", () => {
  assert.equal(
    P.route(loc("http://localhost/sono/lektion/lunge-06"), "sono"),
    "lektion/lunge-06",
  );
  assert.equal(P.route(loc("https://sono.resqly.lu/"), "sono"), "home");
  assert.equal(
    P.route(loc("https://sono.resqly.lu/atlas#/simulator"), "sono"),
    "simulator",
  );
});
