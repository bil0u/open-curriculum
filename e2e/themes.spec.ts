import { expect, test } from "@playwright/test";

import { clearDatabase, createCv, skipOnboarding } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await clearDatabase(page);
  await page.reload();
  await skipOnboarding(page);
  await createCv(page);
});

test("switching to Theme tab shows the theme picker", async ({ page }) => {
  await page.getByRole("button", { name: "Theme" }).click();

  // The theme picker is a radiogroup with the aria-label from themes.json editor.title = "Theme"
  await expect(page.getByRole("radiogroup", { name: "Theme" })).toBeVisible();
});

test("theme picker shows available themes as radio buttons", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Theme" }).click();

  const radiogroup = page.getByRole("radiogroup", { name: "Theme" });
  await expect(radiogroup).toBeVisible();

  // There should be at least one radio (theme option)
  const radios = radiogroup.getByRole("radio");
  await expect(radios.first()).toBeVisible();
  expect(await radios.count()).toBeGreaterThan(0);
});

test("selecting a different theme updates the active selection", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Theme" }).click();

  const radiogroup = page.getByRole("radiogroup", { name: "Theme" });
  const radios = radiogroup.getByRole("radio");
  const count = await radios.count();

  if (count >= 2) {
    // Record which radio is currently checked
    const checked = radiogroup.getByRole("radio", { checked: true }).first();
    const checkedText = await checked.textContent();

    // Find the currently unchecked radio and click it
    const unchecked = radiogroup.getByRole("radio", { checked: false }).first();
    await unchecked.click();

    // Handle potential slot conflict confirmation dialog
    const confirmDialog = page.getByRole("dialog", { name: "Some sections will become hidden" });
    if (await confirmDialog.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmDialog.getByRole("button", { name: "Switch anyway" }).click();
    }

    // After clicking (and confirming if needed), the previously-checked radio should be unchecked
    // and a different radio should now be checked
    await expect(radiogroup.getByRole("radio", { checked: true })).toHaveCount(1);
    const nowCheckedText = await radiogroup.getByRole("radio", { checked: true }).first().textContent();
    expect(nowCheckedText).not.toBe(checkedText);
  } else {
    // Only one theme available — verify it is checked
    await expect(radios.first()).toHaveAttribute("aria-checked", "true");
  }
});
