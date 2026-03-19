import { describe, expect, it, vi } from "vitest";

import {
  BUNDLED_THEMES,
  getDefaultThemeId,
  getTheme,
} from "./theme-registry";

vi.mock("@/lib/db", () => ({
  db: {
    themes: { get: vi.fn().mockResolvedValue(undefined) },
  },
}));

describe("theme-registry", () => {
  describe("BUNDLED_THEMES", () => {
    it("contains at least classic and minimal themes", () => {
      const ids = BUNDLED_THEMES.map((t) => t.id);
      expect(ids).toContain("classic");
      expect(ids).toContain("minimal");
    });

    it("each theme has required fields", () => {
      for (const theme of BUNDLED_THEMES) {
        expect(theme.id).toBeTruthy();
        expect(theme.name).toBeTruthy();
        expect(theme.layouts.length).toBeGreaterThan(0);
        expect(theme.defaultLayoutId).toBeTruthy();
        expect(theme.css).toBeTruthy();
        expect(theme.templates["layout"]).toBeTruthy();
      }
    });
  });

  describe("getTheme", () => {
    it("returns a bundled theme by id", async () => {
      const theme = await getTheme("classic");
      expect(theme).not.toBeNull();
      expect(theme?.id).toBe("classic");
    });

    it("returns minimal theme by id", async () => {
      const theme = await getTheme("minimal");
      expect(theme).not.toBeNull();
      expect(theme?.id).toBe("minimal");
    });

    it("returns null for unknown theme id", async () => {
      const theme = await getTheme("nonexistent-theme-xyz");
      expect(theme).toBeNull();
    });
  });

  describe("getDefaultThemeId", () => {
    it("returns classic", () => {
      expect(getDefaultThemeId()).toBe("classic");
    });
  });

  describe("theme structural differences", () => {
    it("classic has sidebar and main slots", async () => {
      const theme = await getTheme("classic");
      expect(theme).not.toBeNull();
      const layout = theme?.layouts.find(
        (l) => l.id === theme.defaultLayoutId,
      );
      expect(layout).toBeDefined();
      const slotNames = layout?.slots.map((s) => s.name);
      expect(slotNames).toContain("sidebar");
      expect(slotNames).toContain("main");
    });

    it("minimal has only main slot", async () => {
      const theme = await getTheme("minimal");
      expect(theme).not.toBeNull();
      const layout = theme?.layouts.find(
        (l) => l.id === theme.defaultLayoutId,
      );
      expect(layout).toBeDefined();
      const slotNames = layout?.slots.map((s) => s.name);
      expect(slotNames).toEqual(["main"]);
    });

    it("themes have different accent colors", async () => {
      const classic = await getTheme("classic");
      const minimal = await getTheme("minimal");
      const classicAccent = classic?.customizableProperties.find(
        (p) => p.property === "--cv-accent-color",
      )?.defaultValue;
      const minimalAccent = minimal?.customizableProperties.find(
        (p) => p.property === "--cv-accent-color",
      )?.defaultValue;
      expect(classicAccent).not.toBe(minimalAccent);
    });
  });
});
