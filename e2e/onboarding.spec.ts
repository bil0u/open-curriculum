import { expect, test } from "@playwright/test";

import { clearDatabase } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await clearDatabase(page);
  await page.reload();
});

test("shows onboarding dialog with step 1 content on first load", async ({
  page,
}) => {
  await expect(
    page.getByRole("dialog", { name: "Welcome to CV Genius" }),
  ).toBeVisible();
  await expect(
    page.getByText("Build professional CVs, right in your browser"),
  ).toBeVisible();
});

test("Skip button dismisses the onboarding dialog", async ({ page }) => {
  const dialog = page.getByRole("dialog", { name: "Welcome to CV Genius" });
  await expect(dialog).toBeVisible();

  await page.getByRole("button", { name: "Skip" }).click();

  await expect(dialog).not.toBeVisible();
});

test("completing all 3 steps creates a CV and shows the editor", async ({
  page,
}) => {
  // Step 1: welcome screen
  await expect(
    page.getByRole("dialog", { name: "Welcome to CV Genius" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();

  // Step 2: create CV
  await expect(
    page.getByRole("heading", { name: "Create your first CV" }),
  ).toBeVisible();
  await page.getByLabel("CV name").fill("My Onboarding CV");
  await page.getByRole("button", { name: "Create & continue" }).click();

  // Step 3: tips
  await expect(page.getByText("You're all set!")).toBeVisible();
  await page.getByRole("button", { name: "Get started" }).click();

  // Dialog should be dismissed
  await expect(
    page.getByRole("dialog", { name: "Welcome to CV Genius" }),
  ).not.toBeVisible();

  // The CV should appear in the sidebar list
  await expect(page.getByText("My Onboarding CV")).toBeVisible();

  // Editor panel should be visible
  await expect(page.getByRole("region", { name: "Editor" })).toBeVisible();
});

test("after completing onboarding CV appears in list", async ({ page }) => {
  // Navigate through all steps
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("CV name").fill("Wizard CV");
  await page.getByRole("button", { name: "Create & continue" }).click();
  await page.getByRole("button", { name: "Get started" }).click();

  // CV must appear in sidebar
  await expect(page.getByText("Wizard CV")).toBeVisible();
});
