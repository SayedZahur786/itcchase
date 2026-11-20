import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  workers: 1,
  use: {
    baseURL: process.env.TEST_URL || "http://localhost:3107",
    viewport: { width: 1440, height: 1000 },
    permissions: ["clipboard-read", "clipboard-write"],
  },
  webServer: process.env.TEST_URL
    ? undefined
    : {
        command: "npm run start -- -p 3107",
        url: "http://localhost:3107",
        reuseExistingServer: true,
        timeout: 30000,
      },
});
