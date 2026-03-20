import { expect, test } from "@playwright/test";

import { clearDatabase, createCv, skipOnboarding } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await clearDatabase(page);
  await page.reload();
  await skipOnboarding(page);
});

test("creating a CV via New CV button shows it in the sidebar list", async ({
  page,
}) => {
  await createCv(page, "My New CV");

  await expect(page.getByText("My New CV")).toBeVisible();
});

test("renaming a CV via the Rename button updates the name", async ({
  page,
}) => {
  // Create two CVs — the second one will be active, leaving the first inactive
  await createCv(page, "Original Name");
  await createCv(page, "Active CV");

  // Find the list item containing "Original Name" and hover over it
  const cvListItem = page.locator("li").filter({ hasText: "Original Name" });
  await cvListItem.hover();

  // Click the Rename button (force: true bypasses the opacity-0 visibility check)
  await cvListItem.getByRole("button", { name: "Rename" }).click({ force: true });

  // The inline input should be visible
  const input = page.getByLabel("CV name");
  await expect(input).toBeVisible();

  // Clear and type a new name, then commit with Enter
  await input.fill("Renamed CV");
  await input.press("Enter");

  // For an inactive CV, the name is written directly to IndexedDB → LiveQuery updates
  await expect(page.getByText("Renamed CV")).toBeVisible();
  await expect(page.getByText("Original Name")).not.toBeVisible();
});

test("duplicating a CV creates a copy with (copy) suffix", async ({ page }) => {
  await createCv(page, "Source CV");

  // Hover to reveal actions
  await page.getByText("Source CV").hover();
  await page.getByRole("button", { name: "Duplicate" }).click();

  await expect(page.getByText("Source CV (copy)")).toBeVisible();
});

test("deleting a CV removes it from the list", async ({ page }) => {
  await createCv(page, "CV to Delete");

  // Find the list item and click the Delete button (force: true bypasses opacity-0)
  const cvListItem = page.locator("li").filter({ hasText: "CV to Delete" });
  await cvListItem.hover();
  await cvListItem.getByRole("button", { name: "Delete", exact: true }).click({ force: true });

  // Confirm deletion dialog
  const deleteDialog = page.getByRole("dialog", { name: "Delete CV" });
  await expect(deleteDialog).toBeVisible();
  await deleteDialog.getByRole("button", { name: "Delete CV" }).click();
  await expect(deleteDialog).not.toBeVisible();

  // The CV should no longer appear in the sidebar list
  await expect(page.locator("li").filter({ hasText: "CV to Delete" })).toHaveCount(0);
});
