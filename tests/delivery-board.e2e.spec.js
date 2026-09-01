import { expect, test } from "@playwright/test";

test("visitor can build a valid foundation plan without drag and drop", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Scenario").selectOption("foundation");
  const placements = [
    ["Solar pallet A", "Riverside School", "Riverside approval", "Monday", "Northstar crew", "Cargo van"],
    ["Battery cabinet", "North Library", "North approval", "Tuesday", "Oak crew", "Cargo van"],
    ["Inverter case", "Beacon Leisure Centre", "Beacon approval", "Wednesday", "Circuit crew", "Service van"],
  ];
  for (const [equipment, site, approval, day, crew, van] of placements) {
    await page.getByRole("button", { name: new RegExp(`^${equipment}`) }).click();
    await page.locator(".map-panel").getByRole("button", { name: new RegExp(`^${site}\\.`) }).click();
    await page.getByRole("button", { name: new RegExp(`^${approval}`) }).click();
    await page.locator(".map-panel").getByRole("button", { name: new RegExp(`^${site}\\.`) }).click();
    await page.locator(".queue-panel").getByRole("button", { name: new RegExp(`^${site}\\. Drag`) }).click();
    await page.locator(".day-lane", { hasText: day.slice(0, 3) }).click();
    await page.getByRole("button", { name: new RegExp(`^${crew}`) }).click();
    await page.locator(".day-lane", { hasText: day.slice(0, 3) }).click();
    await page.getByRole("button", { name: new RegExp(`^${van}`) }).click();
    await page.locator(".day-lane", { hasText: day.slice(0, 3) }).click();
  }
  await page.getByRole("button", { name: /Run week/ }).click();
  await expect(page.getByRole("heading", { name: "Objective met" })).toBeVisible({ timeout: 5000 });
});

test("an incomplete run explains its consequences", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^Riverside School\. Drag/ }).click();
  await page.locator(".day-lane").first().click();
  await page.getByRole("button", { name: /Run week/ }).click();
  await expect(page.getByRole("heading", { name: "Plan needs another pass" })).toBeVisible({ timeout: 5000 });
  await expect(page.locator(".result-blockers").getByText(/Needs Solar pallet A/)).toBeVisible();
});

test("pointer drag places a resource on its map site", async ({ page }) => {
  await page.goto("/");
  const source = await page.getByRole("button", { name: /^Solar pallet A/ }).boundingBox();
  const target = await page.locator(".site-pin", { hasText: "School" }).boundingBox();
  expect(source).not.toBeNull();
  expect(target).not.toBeNull();
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(source.x + source.width / 2 + 10, source.y + source.height / 2, { steps: 3 });
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 12 });
  await page.mouse.up();
  await expect(page.locator(".resource-dock").getByRole("button", { name: /^Solar pallet A/ })).toHaveClass(/is-assigned/);
  await expect(page.locator(".site-inspector").getByRole("button", { name: /Solar pallet A/ })).toBeVisible();
});

test("mobile tabs expose the complete click-to-place workflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Board views" })).toBeVisible();
  await page.getByRole("button", { name: "resources" }).click();
  await expect(page.getByRole("heading", { name: "People, kit and records" })).toBeVisible();
  await page.getByRole("button", { name: "map" }).click();
  await expect(page.getByRole("heading", { name: "Fictional Eastborough" })).toBeVisible();
});
