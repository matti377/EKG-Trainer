const { defineConfig, devices } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "tests",
  testMatch: "browser.spec.cjs",
  fullyParallel: true,
  timeout: 30000,
  use: { baseURL: "http://127.0.0.1:8765", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: {
    command: "PORT=8765 HOST=127.0.0.1 python3 server.py",
    url: "http://127.0.0.1:8765",
    reuseExistingServer: false,
  },
});
