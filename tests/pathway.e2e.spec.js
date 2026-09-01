import { expect, test } from "@playwright/test";

test("completes the pathway while preventing premature actions", async ({ page }) => {
  await page.addInitScript(() => {
    window.__pathwayMessages = [];
    window.addEventListener("message", (event) => {
      if (event.data?.type === "clean-heat-pathway") window.__pathwayMessages.push(event.data);
    });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /One heat-pump installation/ })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__pathwayMessages.at(-1)?.height)).toBeGreaterThan(640);
  const embedHeight = await page.evaluate(() => window.__pathwayMessages.at(-1).height);
  const shellHeight = await page.locator(".app-shell").evaluate((element) => Math.ceil(element.getBoundingClientRect().height));
  expect(Math.abs(embedHeight - shellHeight)).toBeLessThanOrEqual(1);

  await page.getByRole("button", { name: "Confirm survey evidence" }).click();
  await page.getByRole("button", { name: "Confirm planning evidence" }).click();
  await expect(page.getByRole("heading", { name: "Service rating evidence is missing" })).toBeVisible();

  await page.getByRole("button", { name: "Continue anyway" }).click();
  await expect(page.getByRole("status")).toContainText("stays at Grid");
  await page.getByRole("button", { name: "Request evidence" }).click();
  await page.getByRole("button", { name: "Continue to parts" }).click();

  await page.getByRole("button", { name: "Hold and correct order" }).click();
  await page.getByRole("button", { name: "Continue to install" }).click();
  await page.getByRole("button", { name: "Release to install" }).click();

  await page.getByRole("button", { name: "Close anyway" }).click();
  await expect(page.getByRole("status")).toContainText("stays open");
  await page.getByRole("button", { name: "Chase certificate" }).click();
  await page.getByRole("button", { name: "Complete handover" }).click();

  await expect(page.getByRole("heading", { name: "The handover pack is complete." })).toBeVisible();
  await expect(page.getByText(/caught 3 operational blockers/)).toBeVisible();
});

test("is keyboard reachable and has no mobile horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport);
  await expect(page.getByRole("button", { name: "Confirm survey evidence" })).toBeVisible();
});
