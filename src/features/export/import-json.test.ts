import { parseImportFile } from "./import-json";

const validCv = {
  id: "cv-1",
  name: "Test CV",
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

const validProfile = {
  id: "profile-1",
  name: { en: "John Doe" },
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

function makeEnvelope(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    format: "cv-genius",
    version: "1.0.0",
    cv: validCv,
    profile: null,
    ...overrides,
  });
}

describe("parseImportFile", () => {
  it("returns err for invalid JSON", () => {
    const result = parseImportFile("not json {{");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Invalid JSON");
  });

  it("returns err for non-object JSON (array)", () => {
    const result = parseImportFile("[1, 2, 3]");
    // Arrays pass the object check but fail the format check
    expect(result.ok).toBe(false);
  });

  it("returns err for non-object JSON (null)", () => {
    const result = parseImportFile("null");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/object/i);
  });

  it("returns err for wrong format field", () => {
    const result = parseImportFile(JSON.stringify({ format: "other-app", version: "1.0.0" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/CV Genius/i);
  });

  it("returns err when version field is missing", () => {
    const result = parseImportFile(JSON.stringify({ format: "cv-genius" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/version/i);
  });

  it("returns err for unsupported version", () => {
    const result = parseImportFile(
      JSON.stringify({ format: "cv-genius", version: "2.0.0", cv: validCv, profile: null }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("Unsupported version: 2.0.0");
  });

  it("returns err containing 'Invalid CV data' when CV is invalid", () => {
    const result = parseImportFile(
      JSON.stringify({ format: "cv-genius", version: "1.0.0", cv: { id: "" }, profile: null }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Invalid CV data/i);
  });

  it("returns ok with null profile when profile is null", () => {
    const result = parseImportFile(makeEnvelope());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.profile).toBeNull();
      expect(result.value.cv.id).toBe("cv-1");
    }
  });

  it("returns ok with valid profile when profile is present", () => {
    const result = parseImportFile(makeEnvelope({ profile: validProfile }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.profile).not.toBeNull();
      expect(result.value.profile?.id).toBe("profile-1");
    }
  });

  it("returns err when profile is missing required fields (id)", () => {
    const badProfile = { ...validProfile, id: undefined };
    const result = parseImportFile(makeEnvelope({ profile: badProfile }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Profile missing required fields/i);
  });

  it("returns err when profile name is not an object", () => {
    const badProfile = { ...validProfile, name: "John Doe" };
    const result = parseImportFile(makeEnvelope({ profile: badProfile }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Profile missing required fields/i);
  });

  it("returns err when profile is a non-object primitive", () => {
    const result = parseImportFile(makeEnvelope({ profile: "bad-profile" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/profile/i);
  });
});
