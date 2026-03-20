import { expect, type Page } from "@playwright/test";

export async function clearDatabase(page: Page): Promise<void> {
  await page.evaluate((): Promise<void> =>
    new Promise((resolve) => {
      const req = indexedDB.deleteDatabase("cv-genius");
      req.onsuccess = req.onerror = () => resolve();
    }),
  );
}

export async function skipOnboarding(page: Page): Promise<void> {
  const dialog = page.getByRole("dialog", { name: "Welcome to CV Genius" });
  const isVisible = await dialog.isVisible({ timeout: 5000 }).catch(() => false);
  if (isVisible) {
    await page.getByRole("button", { name: "Skip" }).click();
    // Wait for the dialog to fully close
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
  }
}

export async function createCv(page: Page, name = "Test CV"): Promise<void> {
  const newCvBtn = page.getByRole("button", { name: "New CV" });
  await newCvBtn.waitFor({ state: "visible" });
  // Use force:true to bypass any lingering React Aria ModalOverlay backdrop that
  // still intercepts pointer events even after the dialog is no longer visible.
  await newCvBtn.click({ force: true });

  // Wait for the create dialog to appear
  const createDialog = page.getByRole("dialog", { name: "Create a new CV" });
  await expect(createDialog).toBeVisible();
  await page.getByLabel("CV name").fill(name);
  await page.getByRole("button", { name: "Create" }).click();
  // Wait for the dialog to close
  await expect(createDialog).not.toBeVisible();
  // Wait for the editor to be ready — the document is loaded from IndexedDB
  // via a LiveQuery, so the editor panel may not be mounted yet when the dialog closes.
  await page.getByRole("button", { name: "Add section" }).waitFor({ state: "visible" });
}

export async function addSection(page: Page, sectionType: string): Promise<void> {
  await page.getByRole("button", { name: "Add section" }).click();
  await page.getByRole("button", { name: sectionType }).click();
  await expect(page.getByRole("dialog", { name: "Add section" })).not.toBeVisible();
}

export async function addExpandedSection(
  page: Page,
  sectionType: string,
): Promise<void> {
  await addSection(page, sectionType);
  // Section may auto-expand on creation; if still collapsed, expand it now.
  const expandBtn = page.getByRole("button", { name: "Expand section" });
  if (await expandBtn.isVisible({ timeout: 0 }).catch(() => false)) {
    await expandBtn.click();
  }
}
