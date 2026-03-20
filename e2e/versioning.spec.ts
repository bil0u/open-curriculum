import { expect, test } from "@playwright/test";

import { addSection, clearDatabase, createCv, skipOnboarding } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await clearDatabase(page);
  await page.reload();
  await skipOnboarding(page);
  await createCv(page);
});

test("undo removes an added section and redo brings it back", async ({
  page,
}) => {
  const sectionList = page.getByRole("list", { name: "Sections" });

  // Add an experience section
  await addSection(page, "Experience");
  await expect(sectionList).toContainText("Experience");

  // Undo — the section should disappear from the list
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(sectionList).not.toContainText("Experience");

  // Redo — the section should reappear
  await page.getByRole("button", { name: "Redo" }).click();
  await expect(sectionList).toContainText("Experience");
});

test("saving a snapshot via toolbar button shows it in Versions panel", async ({
  page,
}) => {
  // Save a snapshot from the editor toolbar
  await page.getByRole("button", { name: "Save snapshot" }).click();

  // Switch to Versions panel
  await page.getByRole("button", { name: "Versions" }).click();

  // At least one snapshot row with a Restore button should appear
  await expect(
    page.getByRole("button", { name: "Restore" }).first(),
  ).toBeVisible();
});

test("restoring a snapshot reverts to the earlier state after confirmation", async ({
  page,
}) => {
  const sectionList = page.getByRole("list", { name: "Sections" });

  // Save a snapshot in the initial state (no sections)
  await page.getByRole("button", { name: "Save snapshot" }).click();

  // Now add a section (new state)
  await addSection(page, "Experience");
  await expect(sectionList).toContainText("Experience");

  // Switch to Versions panel
  await page.getByRole("button", { name: "Versions" }).click();

  // Click Restore on the snapshot
  await page.getByRole("button", { name: "Restore" }).first().click();

  // Confirm the restore dialog
  await expect(
    page.getByRole("dialog", { name: "Restore snapshot?" }),
  ).toBeVisible();
  await page.getByRole("dialog", { name: "Restore snapshot?" })
    .getByRole("button", { name: "Restore" })
    .click();

  // Switch back to Editor panel — the Experience section should be gone
  await page.getByRole("button", { name: "Editor" }).click();
  await expect(sectionList).not.toContainText("Experience");
});
