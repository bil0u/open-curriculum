import { validateCvDocument } from "./integrity";

const validDoc = {
  id: "cv-1",
  name: "My CV",
  profileOverrides: {},
  sections: [],
  themeId: "theme-classic",
  defaultLocale: "en",
  availableLocales: ["en"],
  pageFormat: "A4",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("validateCvDocument", () => {
  it("returns ok for a valid document", () => {
    const result = validateCvDocument(validDoc);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(validDoc);
    }
  });

  it("returns err for null", () => {
    const result = validateCvDocument(null);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/null|not an object/i);
    }
  });

  it("returns err for non-object primitive", () => {
    const result = validateCvDocument("a string");
    expect(result.ok).toBe(false);
  });

  it("returns err when id is missing", () => {
    const result = validateCvDocument({ ...validDoc, id: undefined });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/id/i);
    }
  });

  it("returns err when id is empty string", () => {
    const result = validateCvDocument({ ...validDoc, id: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/id/i);
    }
  });

  it("returns err when name is not a string", () => {
    const result = validateCvDocument({ ...validDoc, name: 42 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/name/i);
    }
  });

  it("accepts name as empty string", () => {
    const result = validateCvDocument({ ...validDoc, name: "" });
    expect(result.ok).toBe(true);
  });

  it("returns err when profileOverrides is not an object", () => {
    const result = validateCvDocument({ ...validDoc, profileOverrides: "bad" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/profileOverrides/i);
    }
  });

  it("accepts undefined profileOverrides", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { profileOverrides: _, ...docWithout } = validDoc;
    const result = validateCvDocument(docWithout);
    expect(result.ok).toBe(true);
  });

  it("returns err when sections is not an array", () => {
    const result = validateCvDocument({ ...validDoc, sections: "not-array" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/sections/i);
    }
  });

  it("returns err when themeId is missing", () => {
    const result = validateCvDocument({ ...validDoc, themeId: undefined });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/themeId/i);
    }
  });

  it("returns err when themeId is empty string", () => {
    const result = validateCvDocument({ ...validDoc, themeId: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/themeId/i);
    }
  });

  it("returns err when defaultLocale is not a string", () => {
    const result = validateCvDocument({ ...validDoc, defaultLocale: null });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/defaultLocale/i);
    }
  });

  it("returns err when availableLocales is empty array", () => {
    const result = validateCvDocument({ ...validDoc, availableLocales: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/availableLocales/i);
    }
  });

  it("returns err when availableLocales is not an array", () => {
    const result = validateCvDocument({ ...validDoc, availableLocales: "en" });
    expect(result.ok).toBe(false);
  });

  it("returns err when pageFormat is falsy", () => {
    const result = validateCvDocument({ ...validDoc, pageFormat: null });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/pageFormat/i);
    }
  });

  it("returns err when createdAt is not a string", () => {
    const result = validateCvDocument({ ...validDoc, createdAt: 12345 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/timestamp/i);
    }
  });

  it("returns err when updatedAt is not a string", () => {
    const result = validateCvDocument({ ...validDoc, updatedAt: undefined });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/timestamp/i);
    }
  });
});
