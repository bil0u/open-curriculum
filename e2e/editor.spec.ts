import { expect, test } from "@playwright/test";

import { addExpandedSection, addSection, clearDatabase, createCv, skipOnboarding } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await clearDatabase(page);
  await page.reload();
  await skipOnboarding(page);
  await createCv(page);
});

test("adding an Experience section makes it appear in the section list", async ({
  page,
}) => {
  await addSection(page, "Experience");

  // The experience section type badge should be visible in the section list
  await expect(page.getByText("Experience")).toBeVisible();
});

test("expanding a section reveals form fields", async ({ page }) => {
  await addExpandedSection(page, "Experience");

  await expect(page.getByRole("button", { name: "Add item" })).toBeVisible();
});

test("adding an item to an experience section shows the item row", async ({
  page,
}) => {
  await addExpandedSection(page, "Experience");
  await page.getByRole("button", { name: "Add item" }).click();

  // A new item row should appear — identified by the expand/collapse button
  await expect(
    page.getByRole("button", { name: "Collapse section" }).first(),
  ).toBeVisible();
});

test("filling the Role field in an experience item persists the value", async ({
  page,
}) => {
  await addExpandedSection(page, "Experience");
  await page.getByRole("button", { name: "Add item" }).click();

  await page.getByLabel("Role").fill("Software Engineer");
  // Tab away to trigger blur / auto-save, then verify the value persists
  await page.getByLabel("Role").press("Tab");
  await expect(page.getByLabel("Role")).toHaveValue("Software Engineer");
});
