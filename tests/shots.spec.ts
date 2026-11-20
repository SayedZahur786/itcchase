import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
test("capture every main route on desktop and mobile", async ({ page }) => {
  mkdirSync("docs/screenshots", { recursive: true });
  for (const [label, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ] as const) {
    await page.setViewportSize(viewport);
    for (const [slug, path] of [
      ["home", "/"],
      ["dashboard", "/dashboard?demo=1"],
      ["upload", "/reconcile"],
      ["results", "/reports/demo"],
      ["privacy", "/privacy"],
      ["terms", "/terms"],
      ["contact", "/contact"],
      ["empty", "/dashboard"],
      ["404", "/not-here"],
    ]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      await page.screenshot({
        path: `docs/screenshots/${slug}-${label}.png`,
        fullPage: true,
        animations: "disabled",
      });
    }
    await page.goto("/reports/demo");
    await page.locator(".supplier-card").first().screenshot({path:`docs/screenshots/followup-${label}.png`, animations:"disabled"});
  }
});
