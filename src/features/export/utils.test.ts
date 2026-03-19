import type { CvDocument, Profile } from "@/lib/types";

import type { ExportContext } from "./types";
import { resolveProfileName } from "./utils";

const baseCv: CvDocument = {
  id: "cv-1",
  name: "My CV Name",
  profileId: null,
  profileOverrides: {},
  sections: [],
  themeId: "classic",
  defaultLocale: "en",
  availableLocales: ["en"],
  pageFormat: "A4",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const baseProfile: Profile = {
  id: "profile-1",
  name: { en: "Profile Name" },
  title: {},
  email: {},
  phone: {},
  website: {},
  location: {},
  socialLinks: [],
  meta: [],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

function makeContext(cv: Partial<CvDocument> = {}, profile: Profile | null = null): ExportContext {
  return {
    cv: { ...baseCv, ...cv },
    profile,
    renderResult: null,
    iframe: null,
  };
}

describe("resolveProfileName", () => {
  it("uses profileOverrides.name if present", () => {
    const ctx = makeContext(
      { profileOverrides: { name: { en: "Override Name" } } },
      baseProfile,
    );
    expect(resolveProfileName(ctx)).toBe("Override Name");
  });

  it("falls back to profile.name if no override", () => {
    const ctx = makeContext({ profileOverrides: {} }, baseProfile);
    expect(resolveProfileName(ctx)).toBe("Profile Name");
  });

  it("falls back to cv.name when profile is null", () => {
    const ctx = makeContext({ profileOverrides: {} }, null);
    expect(resolveProfileName(ctx)).toBe("My CV Name");
  });

  it("skips empty string values in Translatable and uses first non-empty", () => {
    const profileWithEmpty: Profile = {
      ...baseProfile,
      name: { en: "", fr: "Nom Français" },
    };
    const ctx = makeContext({ profileOverrides: {} }, profileWithEmpty);
    expect(resolveProfileName(ctx)).toBe("Nom Français");
  });

  it("falls back to cv.name when profileOverrides.name contains only empty strings", () => {
    const ctx = makeContext(
      { profileOverrides: { name: { en: "" } } },
      null,
    );
    expect(resolveProfileName(ctx)).toBe("My CV Name");
  });

  it("works when profile is null and there is no override", () => {
    const ctx = makeContext({ profileOverrides: {}, name: "Fallback CV" }, null);
    expect(resolveProfileName(ctx)).toBe("Fallback CV");
  });

  it("prefers override over profile.name", () => {
    const ctx = makeContext(
      { profileOverrides: { name: { en: "Override" } } },
      { ...baseProfile, name: { en: "Should Not Be Used" } },
    );
    expect(resolveProfileName(ctx)).toBe("Override");
  });
});
