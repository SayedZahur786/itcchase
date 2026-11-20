import { test, expect } from "@playwright/test";
test("real file upload yields four missing invoices, copied draft, isolated report and deletion", async ({
  page,
  browser,
}) => {
  await page.goto("/reconcile");
  await page
    .getByLabel("Purchase register", { exact: true })
    .setInputFiles("public/demo/purchase-register.csv");
  await page
    .getByLabel("GSTR-2B", { exact: true })
    .setInputFiles("public/demo/gstr-2b.xlsx");
  await page
    .getByRole("button", { name: "Run reconciliation", exact: true })
    .click();
  await expect(page.getByTestId("missing-count")).toHaveText("4");
  await expect(page.getByTestId("present-count")).toHaveText("46");
  await page
    .getByRole("button", { name: "Copy follow-up", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Copied message" }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "INV-2107",
  );
  const url = page.url();
  const outsider = await browser.newContext();
  const denied = await outsider.newPage();
  const response = await denied.goto(url);
  expect(response?.status()).toBe(404);
  await outsider.close();
  await page.goto("/dashboard");
  await expect(page.getByRole("link", { name: "View report" })).toBeVisible();
  await page.getByRole("button", { name: "Delete my reports" }).click();
  await page.getByRole("button", { name: "Yes, delete reports" }).click();
  await expect(
    page.getByText("Your first clear picture starts here."),
  ).toBeVisible();
  expect((await page.goto(url))?.status()).toBe(404);
});
test("mutation endpoints reject cross-origin and missing sessions", async ({
  request,
  baseURL,
}) => {
  expect(
    (
      await request.post("/api/session", {
        headers: { origin: "https://unauthorized.invalid" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/reconcile", { headers: { origin: baseURL! } })
    ).status(),
  ).toBe(401);
  expect(
    (
      await request.delete("/api/reports", { headers: { origin: baseURL! } })
    ).status(),
  ).toBe(401);
});
test("main routes render on mobile without horizontal page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of [
    "/",
    "/dashboard",
    "/dashboard?demo=1",
    "/reconcile",
    "/reports/demo",
    "/privacy",
    "/terms",
    "/contact",
  ]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  expect((await page.goto("/missing-page"))?.status()).toBe(404);
});
