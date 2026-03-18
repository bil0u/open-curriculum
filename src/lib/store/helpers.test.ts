import type { CvDocument } from "@/lib/types";

import { arrayMove, updateDocSection, updateDocSectionItem } from "./helpers";

const mockDoc: CvDocument = {
  id: "cv-1",
  name: "Test CV",
  profileId: null,
  profileOverrides: {},
  sections: [
    {
      id: "s1",
      type: "experience",
      title: {},

      visible: true,
      items: [
        {
          id: "i1",
          role: { en: "Dev" },
          category: "work",
          startDate: "2024-01-01",
          description: {},
          highlights: [],
        },
        {
          id: "i2",
          role: { en: "PM" },
          category: "work",
          startDate: "2024-06-01",
          description: {},
          highlights: [],
        },
      ],
    },
    {
      id: "s2",
      type: "introduction",
      title: {},

      visible: true,
      content: { en: "Hello" },
    },
  ],
  themeId: "theme-1",
  defaultLocale: "en",
  availableLocales: ["en"],
  pageFormat: "A4",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("arrayMove", () => {
  it("moves an element forward in the array", () => {
    const result = arrayMove(["a", "b", "c", "d"], 0, 2);
    expect(result).toEqual(["b", "c", "a", "d"]);
  });

  it("moves an element backward in the array", () => {
    const result = arrayMove(["a", "b", "c", "d"], 3, 1);
    expect(result).toEqual(["a", "d", "b", "c"]);
  });

  it("returns a new array and does not mutate the original", () => {
    const original = ["x", "y", "z"];
    const result = arrayMove(original, 0, 1);
    expect(result).not.toBe(original);
    expect(original).toEqual(["x", "y", "z"]);
  });

  it("returns a copy when moving to the same index", () => {
    const result = arrayMove([1, 2, 3], 1, 1);
    expect(result).toEqual([1, 2, 3]);
  });

  it("handles a single-element array", () => {
    expect(arrayMove(["only"], 0, 0)).toEqual(["only"]);
  });
});

describe("updateDocSection", () => {
  it("applies the updater to the matching section", () => {
    const result = updateDocSection(mockDoc, "s2", (s) => ({
      ...s,
      visible: false,
    }));
    const updated = result.sections.find((s) => s.id === "s2");
    expect(updated?.visible).toBe(false);
  });

  it("leaves other sections unchanged", () => {
    const result = updateDocSection(mockDoc, "s2", (s) => ({
      ...s,
      visible: false,
    }));
    const untouched = result.sections.find((s) => s.id === "s1");
    expect(untouched).toBe(mockDoc.sections[0]);
  });

  it("returns a new document object", () => {
    const result = updateDocSection(mockDoc, "s1", (s) => s);
    expect(result).not.toBe(mockDoc);
  });

  it("preserves the original updatedAt (timestamp is caller's responsibility)", () => {
    const result = updateDocSection(mockDoc, "s1", (s) => s);
    expect(result.updatedAt).toBe(mockDoc.updatedAt);
  });

  it("does not modify any section when the id is not found", () => {
    const result = updateDocSection(mockDoc, "nonexistent", (s) => ({
      ...s,
      visible: false,
    }));
    result.sections.forEach((s, i) => {
      expect(s).toBe(mockDoc.sections[i]);
    });
  });
});

describe("updateDocSectionItem", () => {
  it("applies the updater to the matching item within the section", () => {
    const result = updateDocSectionItem(mockDoc, "s1", "i1", (item) => ({
      ...item,
      role: { en: "Senior Dev" },
    }));
    const section = result.sections.find((s) => s.id === "s1");
    expect(section).toBeDefined();
    if (section && "items" in section) {
      const item = section.items.find(
        (i: { id: string }) => i.id === "i1",
      ) as unknown as { role: { en: string } } | undefined;
      expect(item?.role).toEqual({ en: "Senior Dev" });
    }
  });

  it("leaves other items in the section unchanged", () => {
    const result = updateDocSectionItem(mockDoc, "s1", "i1", (item) => ({
      ...item,
      role: { en: "Changed" },
    }));
    const section = result.sections.find((s) => s.id === "s1");
    if (section && "items" in section) {
      const otherItem = section.items.find(
        (i: { id: string }) => i.id === "i2",
      );
      const firstSection = mockDoc.sections[0];
      expect(otherItem).toBe(
        firstSection && "items" in firstSection
          ? firstSection.items[1]
          : undefined,
      );
    }
  });

  it("returns the section unchanged if it has no items array", () => {
    const originalIntroSection = mockDoc.sections[1];
    const result = updateDocSectionItem(mockDoc, "s2", "i1", (item) => item);
    const introSection = result.sections.find((s) => s.id === "s2");
    expect(introSection).toBe(originalIntroSection);
  });

  it("preserves the original updatedAt (timestamp is caller's responsibility)", () => {
    const result = updateDocSectionItem(mockDoc, "s1", "i1", (item) => item);
    expect(result.updatedAt).toBe(mockDoc.updatedAt);
  });
});
