const { test, expect } = require("@playwright/test");
test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
});
test("SONO navigation, domain switcher and responsive layout", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?app=sono#/home");
  await expect(
    page.getByRole("heading", { name: "Sehen lernen. Sicher einordnen." }),
  ).toBeVisible();
  await expect(
    page.locator(".application-switcher a[aria-current]"),
  ).toHaveText("SONO");
  for (const [name, heading] of [
    ["Lernpfad", "Dein Lernpfad"],
    ["Simulator", "Dein Schallkopf. Deine Perspektive."],
    ["Fallbeispiele", "Fünf Fälle. Klare Fragestellungen."],
    ["Bildatlas", "Gezielt finden. Bewusst einordnen."],
    ["Wissen", "Nachschlagen mit Kontext."],
    ["Home", "Sehen lernen. Sicher einordnen."],
  ]) {
    await page.locator("#nav").getByRole("link", { name, exact: true }).click();
    await expect(page.locator("h1")).toHaveText(
      heading.replace("Sehen lernen. Sicher", "Sehen lernen.\nSicher"),
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
  await page.screenshot({
    path: "test-results/sono-home-" + test.info().project.name + ".png",
    fullPage: true,
  });
  await page
    .locator(".application-switcher")
    .getByRole("link", { name: "EKG", exact: true })
    .click();
  await expect(page.locator("h1")).toContainText("EKG verstehen");
});
test("lessons, progress, quiz grading and reload", async ({ page }) => {
  await page.goto("/?app=sono#/lektion/grundlagen-03");
  await expect(page.locator(".sono-wave svg")).toBeVisible();
  await page
    .getByRole("button", { name: "Lektion als gelesen markieren" })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "✓ Als gelesen gespeichert" }),
  ).toBeVisible();
  await page.goto("/?app=sono#/quiz/grundlagen");
  const q = page
    .locator("form")
    .filter({ hasText: "Welche Maßnahmen entsprechen ALARA?" });
  await q
    .getByLabel("Untersuchungszeit auf das Erforderliche begrenzen.")
    .check();
  await q.getByRole("button", { name: "Antwort prüfen" }).click();
  await expect(q.locator(".sono-feedback")).toContainText(
    "Noch nicht richtig.",
  );
  await q.getByLabel("TI und MI beachten.").check();
  await q.getByRole("button", { name: "Antwort prüfen" }).click();
  await expect(q.locator(".sono-feedback")).toContainText(
    "Richtig eingeordnet.",
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("sono-learning-v1")).passed["q-alara"],
    ),
  ).toBe(true);
});
test("atlas search, metadata and unavailable footage", async ({ page }) => {
  await page.goto("/?app=sono#/atlas");
  await expect(page.locator(".sono-atlas-card")).toHaveCount(5);
  await page.getByRole("searchbox").fill("Pneumothorax");
  await expect(page.locator(".sono-atlas-card")).toHaveCount(1);
  await page.locator(".sono-atlas-card").click();
  await expect(
    page.getByText("Klinischer Clip ausstehend", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Beschriftungen ausblenden" }).click();
  await expect(
    page.getByRole("heading", { name: "Geplante Einordnung" }),
  ).not.toBeVisible();
  await expect(
    page.getByText("Befundgrenzen bleiben sichtbar", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("video,img")).toHaveCount(0);
});
test("simulator controls, freeze, orientation and case switch", async ({
  page,
}) => {
  await page.goto("/?app=sono#/simulator");
  await expect(
    page.getByText("Demonstrationsmodus · anatomische Orientierung", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("Körperregion und Fenster").selectOption("luq");
  await expect(page.locator(".sono-sim-right")).toContainText(
    "Linker Oberbauch",
  );
  await page.getByLabel("Rotation (°)", { exact: true }).fill("90");
  await expect(page.locator(".sono-coordinate")).toContainText(
    "Marker [1.00, 0.00, 0.00]",
  );
  await page.getByRole("button", { name: "❚❚ Anzeige einfrieren" }).click();
  await expect(page.getByLabel("Rotation (°)", { exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "▶ Anzeige fortsetzen" }).click();
  await page.getByLabel("Schallkopfkontakt", { exact: true }).uncheck();
  await expect(page.locator(".sono-recording")).toContainText(
    "Kein Schallkopfkontakt",
  );
  await page
    .getByLabel("Lehrfall", { exact: true })
    .selectOption("case-trauma");
  await expect(page).toHaveURL(/simulator\/case-trauma/);
  await expect(page.getByLabel("Körperregion und Fenster")).toHaveValue("ruq");
  await page.screenshot({
    path: "test-results/sono-simulator-" + test.info().project.name + ".png",
    fullPage: true,
  });
});
test("all legacy EKG screens and initial lesson still render", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const route of [
    "pfad",
    "trainer",
    "bibliothek",
    "labor",
    "ableitungen",
    "challenge",
  ]) {
    await page.goto("/#/" + route);
    await expect(page.locator("#app")).not.toBeEmpty();
    await expect(
      page.locator(".application-switcher a[aria-current]"),
    ).toHaveText("EKG");
  }
  await page.goto("/#/pfad");
  await page.locator(".node").first().click();
  await expect(page).toHaveURL(/#\/lektion\//);
  await expect(page.locator(".lesson-top")).toBeVisible();
  expect(errors).toEqual([]);
});
test("SONO path URLs reload and unknown routes recover", async ({ page }) => {
  await page.goto("/sono/lektion/lunge-06");
  await expect(page.locator("h1")).toHaveText("Lung Sliding");
  await page.reload();
  await expect(page.locator("h1")).toHaveText("Lung Sliding");
  await page.goto("/?app=sono#/missing");
  await expect(page.locator("h1")).toHaveText(
    "Dieser Lerninhalt ist nicht verfügbar.",
  );
});
test("blocked local storage does not break learning", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("blocked");
      },
    });
  });
  await page.goto("/?app=sono#/lektion/grundlagen-01");
  await page
    .getByRole("button", { name: "Lektion als gelesen markieren" })
    .click();
  await expect(page.locator("#sono-storage")).toBeVisible();
});
test("production hostname selects app, branding and production switch targets", async ({
  page,
  request,
}) => {
  await page.route("https://sono.resqly.lu/**", async (route) => {
    const url = new URL(route.request().url());
    const response = await request.get(
      "http://127.0.0.1:8765" + url.pathname + url.search,
    );
    await route.fulfill({ response });
  });
  await page.goto("https://sono.resqly.lu/?app=ekg#/home");
  await expect(
    page.locator(".application-switcher a[aria-current]"),
  ).toHaveText("SONO");
  await expect(
    page.locator(".application-switcher a").filter({ hasText: "EKG" }),
  ).toHaveAttribute("href", "https://ekg.resqly.lu/#/pfad");
  await expect(page).toHaveTitle(/SONO by Resqly/);
  await expect(page.locator("meta[name=description]")).toHaveAttribute(
    "content",
    /Sonographie lernen/,
  );
});

test("existing direct file preview remains usable for EKG and SONO", async ({
  page,
}) => {
  const { pathToFileURL } = require("node:url");
  const path = require("node:path");
  const url = pathToFileURL(path.resolve(__dirname, "../index.html")).href;
  await page.goto(url + "#/pfad");
  await expect(page.locator("h1")).toContainText("EKG verstehen");
  await page.goto(url + "?app=sono#/home");
  await expect(page).toHaveTitle(/SONO by Resqly/);
});
