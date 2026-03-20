import { expect, test } from "@playwright/test";

import { clearDatabase, skipOnboarding } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await clearDatabase(page);
  await page.reload();
  await skipOnboarding(page);
});

test("pressing Ctrl+? opens the Keyboard Shortcuts dialog", async ({
  page,
}) => {
  await page.keyboard.press("Control+?");

  await expect(
    page.getByRole("dialog", { name: "Keyboard Shortcuts" }),
  ).toBeVisible();
});

test("pressing Escape closes the Keyboard Shortcuts dialog", async ({
  page,
}) => {
  await page.keyboard.press("Control+?");

  const dialog = page.getByRole("dialog", { name: "Keyboard Shortcuts" });
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");

  await expect(dialog).not.toBeVisible();
});
