import { db } from "@/lib/db";

import { useCvStore } from "./cv-store";

vi.mock("@/lib/db", () => ({
  db: {
    cvs: { get: vi.fn(), put: vi.fn(), delete: vi.fn() },
    workingStates: { get: vi.fn(), put: vi.fn(), delete: vi.fn() },
    profiles: { get: vi.fn() },
    snapshots: {
      put: vi.fn(),
      get: vi.fn(),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          sortBy: vi.fn().mockResolvedValue([]),
          delete: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    },
    transaction: vi.fn(
      (_mode: unknown, _tables: unknown, fn: () => Promise<void>) => fn(),
    ),
  },
}));

beforeEach(() => {
  useCvStore.setState({ activeCvId: null, document: null, activeLocale: "en" });
  vi.clearAllMocks();
});

describe("initial state", () => {
  it("has no active CV", () => {
    expect(useCvStore.getState().activeCvId).toBeNull();
  });

  it("has no document", () => {
    expect(useCvStore.getState().document).toBeNull();
  });

  it("defaults activeLocale to en", () => {
    expect(useCvStore.getState().activeLocale).toBe("en");
  });
});

describe("loadCv", () => {
  const workingDoc = {
    id: "cv-1",
    name: "My CV",
    profileId: null,
    profileOverrides: {},
    sections: [],
    themeId: "theme-1",
    defaultLocale: "fr",
    availableLocales: ["fr"],
    pageFormat: "A4",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  it("loads from workingStates when a working state exists", async () => {
    vi.mocked(db.workingStates.get).mockResolvedValue({
      cvId: "cv-1",
      state: workingDoc,
      lastModified: "2024-01-01T00:00:00Z",
    });

    await useCvStore.getState().loadCv("cv-1");

    const state = useCvStore.getState();
    expect(state.activeCvId).toBe("cv-1");
    expect(state.document).toEqual(workingDoc);
    expect(state.activeLocale).toBe("fr");
  });

  it("falls back to cvs table when no working state exists", async () => {
    vi.mocked(db.workingStates.get).mockResolvedValue(undefined);
    vi.mocked(db.cvs.get).mockResolvedValue(workingDoc);

    await useCvStore.getState().loadCv("cv-1");

    expect(db.cvs.get).toHaveBeenCalledWith("cv-1");
    expect(useCvStore.getState().document).toEqual(workingDoc);
  });

  it("throws when CV is not found in either store", async () => {
    vi.mocked(db.workingStates.get).mockResolvedValue(undefined);
    vi.mocked(db.cvs.get).mockResolvedValue(undefined);

    await expect(useCvStore.getState().loadCv("missing-id")).rejects.toThrow(
      "CV not found: missing-id",
    );
  });

  it("sets activeLocale from the document defaultLocale", async () => {
    vi.mocked(db.workingStates.get).mockResolvedValue({
      cvId: "cv-1",
      state: workingDoc,
      lastModified: "2024-01-01T00:00:00Z",
    });

    await useCvStore.getState().loadCv("cv-1");

    expect(useCvStore.getState().activeLocale).toBe("fr");
  });
});

describe("createCv", () => {
  it("creates a document with correct defaults", async () => {
    vi.mocked(db.cvs.put).mockResolvedValue(undefined as unknown as string);

    await useCvStore.getState().createCv({
      name: "New CV",
      themeId: "theme-modern",
      defaultLocale: "en",
    });

    const { document } = useCvStore.getState();
    expect(document).not.toBeNull();
    expect(document?.name).toBe("New CV");
    expect(document?.themeId).toBe("theme-modern");
    expect(document?.defaultLocale).toBe("en");
    expect(document?.availableLocales).toEqual(["en"]);
    expect(document?.pageFormat).toBe("A4");
    expect(document?.sections).toEqual([]);
    expect(document?.profileId).toBeNull();
    expect(document?.profileOverrides).toEqual({});
  });

  it("persists the document to the database", async () => {
    vi.mocked(db.cvs.put).mockResolvedValue(undefined as unknown as string);

    await useCvStore
      .getState()
      .createCv({ name: "Saved CV", themeId: "theme-1", defaultLocale: "en" });

    expect(db.cvs.put).toHaveBeenCalledOnce();
    expect(db.cvs.put).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Saved CV" }),
    );
  });

  it("sets activeCvId and activeLocale after creation", async () => {
    vi.mocked(db.cvs.put).mockResolvedValue(undefined as unknown as string);

    const id = await useCvStore
      .getState()
      .createCv({ name: "CV", themeId: "theme-1", defaultLocale: "fr" });

    const state = useCvStore.getState();
    expect(state.activeCvId).toBe(id);
    expect(state.activeLocale).toBe("fr");
  });

  it("uses the provided profileId when given", async () => {
    vi.mocked(db.cvs.put).mockResolvedValue(undefined as unknown as string);

    await useCvStore.getState().createCv({
      name: "CV",
      profileId: "profile-1",
      themeId: "theme-1",
      defaultLocale: "en",
    });

    expect(useCvStore.getState().document?.profileId).toBe("profile-1");
  });
});

describe("updateDocument", () => {
  beforeEach(() => {
    useCvStore.setState({
      activeCvId: "cv-1",
      document: {
        id: "cv-1",
        name: "Original",
        profileId: null,
        profileOverrides: {},
        sections: [],
        themeId: "theme-1",
        defaultLocale: "en",
        availableLocales: ["en"],
        pageFormat: "A4",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      activeLocale: "en",
    });
  });

  it("updates specified document fields", () => {
    useCvStore.getState().updateDocument({ name: "Updated" });
    expect(useCvStore.getState().document?.name).toBe("Updated");
  });

  it("does nothing when document is null", () => {
    useCvStore.setState({ document: null });
    expect(() =>
      useCvStore.getState().updateDocument({ name: "X" }),
    ).not.toThrow();
  });
});

describe("updateProfileOverride / clearProfileOverride", () => {
  beforeEach(() => {
    useCvStore.setState({
      activeCvId: "cv-1",
      document: {
        id: "cv-1",
        name: "CV",
        profileId: null,
        profileOverrides: {},
        sections: [],
        themeId: "theme-1",
        defaultLocale: "en",
        availableLocales: ["en"],
        pageFormat: "A4",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      activeLocale: "en",
    });
  });

  it("sets a profile override field", () => {
    useCvStore.getState().updateProfileOverride("firstName", { en: "Alice" });
    const overrides = useCvStore.getState().document?.profileOverrides as
      | Record<string, unknown>
      | undefined;
    expect(overrides?.["firstName"]).toEqual({ en: "Alice" });
  });

  it("merges with existing overrides", () => {
    useCvStore.getState().updateProfileOverride("firstName", { en: "Alice" });
    useCvStore.getState().updateProfileOverride("lastName", { en: "Smith" });
    const overrides = useCvStore.getState().document?.profileOverrides as
      | Record<string, unknown>
      | undefined;
    expect(overrides?.["firstName"]).toEqual({ en: "Alice" });
    expect(overrides?.["lastName"]).toEqual({ en: "Smith" });
  });

  it("removes a specific override field", () => {
    useCvStore.getState().updateProfileOverride("firstName", { en: "Alice" });
    useCvStore.getState().clearProfileOverride("firstName");
    expect(useCvStore.getState().document?.profileOverrides).not.toHaveProperty(
      "firstName",
    );
  });

  it("does not remove unrelated override fields when clearing one", () => {
    useCvStore.getState().updateProfileOverride("firstName", { en: "Alice" });
    useCvStore.getState().updateProfileOverride("lastName", { en: "Smith" });
    useCvStore.getState().clearProfileOverride("firstName");
    const overrides = useCvStore.getState().document?.profileOverrides as
      | Record<string, unknown>
      | undefined;
    expect(overrides?.["lastName"]).toEqual({ en: "Smith" });
  });
});

describe("addSection", () => {
  beforeEach(() => {
    useCvStore.setState({
      activeCvId: "cv-1",
      document: {
        id: "cv-1",
        name: "CV",
        profileId: null,
        profileOverrides: {},
        sections: [],
        themeId: "theme-1",
        defaultLocale: "en",
        availableLocales: ["en"],
        pageFormat: "A4",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      activeLocale: "en",
    });
  });

  it("adds an experience section with an items array", () => {
    useCvStore.getState().addSection("experience");
    const sections = useCvStore.getState().document?.sections;
    expect(sections).toHaveLength(1);
    expect(sections?.[0]?.type).toBe("experience");
    expect(sections?.[0]).toHaveProperty("items", []);
  });

  it("adds an introduction section with a content field", () => {
    useCvStore.getState().addSection("introduction");
    const section = useCvStore.getState().document?.sections[0];
    expect(section?.type).toBe("introduction");
    expect(section).toHaveProperty("content", {});
  });

  it("adds a freeform section with a content field", () => {
    useCvStore.getState().addSection("freeform");
    const section = useCvStore.getState().document?.sections[0];
    expect(section?.type).toBe("freeform");
    expect(section).toHaveProperty("content", {});
  });

  it("adds a skills section with a categories array", () => {
    useCvStore.getState().addSection("skills");
    const section = useCvStore.getState().document?.sections[0];
    expect(section?.type).toBe("skills");
    expect(section).toHaveProperty("categories", []);
  });

  it("adds an interests section with a categories array", () => {
    useCvStore.getState().addSection("interests");
    const section = useCvStore.getState().document?.sections[0];
    expect(section?.type).toBe("interests");
    expect(section).toHaveProperty("categories", []);
  });

  it("uses array position as ordering (no order field)", () => {
    useCvStore.getState().addSection("experience");
    useCvStore.getState().addSection("education");
    const sections = useCvStore.getState().document?.sections;
    expect(sections).toHaveLength(2);
    expect(sections?.[0]?.type).toBe("experience");
    expect(sections?.[1]?.type).toBe("education");
  });

  it("sets visible to true by default", () => {
    useCvStore.getState().addSection("experience");
    expect(useCvStore.getState().document?.sections[0]?.visible).toBe(true);
  });

  it("sets title to an empty object by default", () => {
    useCvStore.getState().addSection("experience");
    expect(useCvStore.getState().document?.sections[0]?.title).toEqual({});
  });
});

describe("removeSection", () => {
  beforeEach(() => {
    useCvStore.setState({
      activeCvId: "cv-1",
      document: {
        id: "cv-1",
        name: "CV",
        profileId: null,
        profileOverrides: {},
        sections: [
          {
            id: "s1",
            type: "experience",
            title: {},

            visible: true,
            items: [],
          },
          {
            id: "s2",
            type: "introduction",
            title: {},

            visible: true,
            content: {},
          },
        ],
        themeId: "theme-1",
        defaultLocale: "en",
        availableLocales: ["en"],
        pageFormat: "A4",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      activeLocale: "en",
    });
  });

  it("removes the section with the given id", () => {
    useCvStore.getState().removeSection("s1");
    const sections = useCvStore.getState().document?.sections;
    expect(sections).toHaveLength(1);
    expect(sections?.[0]?.id).toBe("s2");
  });

  it("leaves other sections intact", () => {
    useCvStore.getState().removeSection("s1");
    expect(useCvStore.getState().document?.sections[0]?.id).toBe("s2");
  });

  it("does nothing when the section id does not exist", () => {
    useCvStore.getState().removeSection("nonexistent");
    expect(useCvStore.getState().document?.sections).toHaveLength(2);
  });
});

describe("reorderSections", () => {
  beforeEach(() => {
    useCvStore.setState({
      activeCvId: "cv-1",
      document: {
        id: "cv-1",
        name: "CV",
        profileId: null,
        profileOverrides: {},
        sections: [
          {
            id: "s1",
            type: "experience",
            title: {},

            visible: true,
            items: [],
          },
          {
            id: "s2",
            type: "introduction",
            title: {},

            visible: true,
            content: {},
          },
          {
            id: "s3",
            type: "education",
            title: {},

            visible: true,
            items: [],
          },
        ],
        themeId: "theme-1",
        defaultLocale: "en",
        availableLocales: ["en"],
        pageFormat: "A4",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      activeLocale: "en",
    });
  });

  it("moves a section from one position to another", () => {
    useCvStore.getState().reorderSections(0, 2);
    const ids = useCvStore.getState().document?.sections.map((s) => s.id);
    expect(ids).toEqual(["s2", "s3", "s1"]);
  });

  it("does not mutate sections that are not involved", () => {
    const originalS2 = useCvStore.getState().document?.sections[1];
    useCvStore.getState().reorderSections(0, 2);
    const sections = useCvStore.getState().document?.sections;
    expect(sections?.find((s) => s.id === "s2")).toBe(originalS2);
  });
});

describe("setActiveLocale", () => {
  it("updates the active locale", () => {
    useCvStore.getState().setActiveLocale("fr");
    expect(useCvStore.getState().activeLocale).toBe("fr");
  });

  it("can be changed back to the original locale", () => {
    useCvStore.getState().setActiveLocale("fr");
    useCvStore.getState().setActiveLocale("en");
    expect(useCvStore.getState().activeLocale).toBe("en");
  });
});

const baseDoc = {
  id: "cv-1",
  name: "CV",
  profileId: null,
  profileOverrides: {},
  sections: [
    {
      id: "s1",
      type: "experience" as const,
      title: {},
      visible: true,
      items: [
        {
          id: "i1",
          role: { en: "Dev" },
          startDate: "2024-01-01",
          description: {},
          highlights: [],
          category: "work",
        },
        {
          id: "i2",
          role: { en: "PM" },
          startDate: "2024-06-01",
          description: {},
          highlights: [],
          category: "work",
        },
      ],
    },
  ],
  themeId: "theme-1",
  defaultLocale: "en" as const,
  availableLocales: ["en" as const],
  pageFormat: "A4" as const,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("duplicateCv", () => {
  it("creates a duplicate with suffixed name and regenerated ids", async () => {
    vi.mocked(db.cvs.get).mockResolvedValue(baseDoc);
    vi.mocked(db.cvs.put).mockResolvedValue(undefined as unknown as string);

    const newId = await useCvStore.getState().duplicateCv("cv-1", "(copy)");

    expect(db.cvs.put).toHaveBeenCalledOnce();
    const saved = vi.mocked(db.cvs.put).mock.calls[0]?.[0] as typeof baseDoc;
    expect(saved.name).toBe("CV (copy)");
    expect(saved.id).not.toBe("cv-1");
    expect(newId).toBe(saved.id);
  });

  it("sets the duplicated CV as the active document", async () => {
    vi.mocked(db.cvs.get).mockResolvedValue(baseDoc);
    vi.mocked(db.cvs.put).mockResolvedValue(undefined as unknown as string);

    const newId = await useCvStore.getState().duplicateCv("cv-1", "(copy)");

    const state = useCvStore.getState();
    expect(state.activeCvId).toBe(newId);
    expect(state.document?.id).toBe(newId);
    expect(state.activeLocale).toBe(baseDoc.defaultLocale);
  });

  it("throws when source CV is not found", async () => {
    vi.mocked(db.cvs.get).mockResolvedValue(undefined);

    await expect(
      useCvStore.getState().duplicateCv("missing", "(copy)"),
    ).rejects.toThrow("CV not found: missing");
  });
});

describe("deleteCv", () => {
  it("deletes cvs, workingStates, and snapshots in a transaction", async () => {
    await useCvStore.getState().deleteCv("cv-99");

    expect(db.transaction).toHaveBeenCalledOnce();
    expect(db.cvs.delete).toHaveBeenCalledWith("cv-99");
    expect(db.workingStates.delete).toHaveBeenCalledWith("cv-99");
    expect(db.snapshots.where).toHaveBeenCalledWith("cvId");
  });

  it("clears state when the deleted CV is the active one", async () => {
    useCvStore.setState({ activeCvId: "cv-1", document: baseDoc });

    await useCvStore.getState().deleteCv("cv-1");

    const state = useCvStore.getState();
    expect(state.activeCvId).toBeNull();
    expect(state.document).toBeNull();
  });

  it("leaves state unchanged when deleting a non-active CV", async () => {
    useCvStore.setState({ activeCvId: "cv-1", document: baseDoc });

    await useCvStore.getState().deleteCv("cv-other");

    const state = useCvStore.getState();
    expect(state.activeCvId).toBe("cv-1");
    expect(state.document).toEqual(baseDoc);
  });
});

describe("updateThemeOverride", () => {
  beforeEach(() => {
    useCvStore.setState({ activeCvId: "cv-1", document: baseDoc, activeLocale: "en" });
  });

  it("sets a new theme override property", () => {
    useCvStore.getState().updateThemeOverride("--color-primary", "#ff0000");
    const overrides = useCvStore.getState().document?.themeOverrides;
    expect(overrides?.simpleOverrides?.["--color-primary"]).toBe("#ff0000");
  });

  it("merges with existing overrides", () => {
    useCvStore.getState().updateThemeOverride("--color-primary", "#ff0000");
    useCvStore.getState().updateThemeOverride("--font-size", "16px");
    const overrides = useCvStore.getState().document?.themeOverrides?.simpleOverrides;
    expect(overrides?.["--color-primary"]).toBe("#ff0000");
    expect(overrides?.["--font-size"]).toBe("16px");
  });

  it("removes the property when value is null", () => {
    useCvStore.getState().updateThemeOverride("--color-primary", "#ff0000");
    useCvStore.getState().updateThemeOverride("--font-size", "14px");
    useCvStore.getState().updateThemeOverride("--color-primary", null);
    const overrides = useCvStore.getState().document?.themeOverrides?.simpleOverrides ?? {};
    expect(overrides).not.toHaveProperty("--color-primary");
    expect(overrides["--font-size"]).toBe("14px");
  });

  it("sets themeOverrides to undefined when the last override is removed", () => {
    useCvStore.getState().updateThemeOverride("--color-primary", "#ff0000");
    useCvStore.getState().updateThemeOverride("--color-primary", null);
    expect(useCvStore.getState().document?.themeOverrides).toBeUndefined();
  });
});

describe("switchTheme", () => {
  beforeEach(() => {
    useCvStore.setState({
      activeCvId: "cv-1",
      document: {
        ...baseDoc,
        themeOverrides: { simpleOverrides: { "--color-primary": "#f00" } },
        sectionSlotMapping: { s1: "main" },
      },
      activeLocale: "en",
    });
  });

  it("sets the new themeId", () => {
    useCvStore.getState().switchTheme("theme-modern");
    expect(useCvStore.getState().document?.themeId).toBe("theme-modern");
  });

  it("clears themeOverrides when switching theme", () => {
    useCvStore.getState().switchTheme("theme-modern");
    expect(useCvStore.getState().document?.themeOverrides).toBeUndefined();
  });

  it("clears sectionSlotMapping when switching theme", () => {
    useCvStore.getState().switchTheme("theme-modern");
    expect(useCvStore.getState().document?.sectionSlotMapping).toBeUndefined();
  });

  it("does nothing when document is null", () => {
    useCvStore.setState({ document: null });
    expect(() => useCvStore.getState().switchTheme("theme-modern")).not.toThrow();
  });
});

describe("switchLayout", () => {
  beforeEach(() => {
    useCvStore.setState({ activeCvId: "cv-1", document: baseDoc, activeLocale: "en" });
  });

  it("sets the selectedLayoutId", () => {
    useCvStore.getState().switchLayout("layout-two-col");
    expect(useCvStore.getState().document?.selectedLayoutId).toBe("layout-two-col");
  });

  it("does nothing when document is null", () => {
    useCvStore.setState({ document: null });
    expect(() => useCvStore.getState().switchLayout("layout-two-col")).not.toThrow();
  });
});

describe("updateSection", () => {
  beforeEach(() => {
    useCvStore.setState({ activeCvId: "cv-1", document: baseDoc, activeLocale: "en" });
  });

  it("merges updates into the matching section", () => {
    useCvStore.getState().updateSection("s1", { visible: false });
    expect(useCvStore.getState().document?.sections[0]?.visible).toBe(false);
  });

  it("does nothing for an unknown sectionId", () => {
    useCvStore.getState().updateSection("nonexistent", { visible: false });
    expect(useCvStore.getState().document?.sections[0]?.visible).toBe(true);
  });

  it("does nothing when document is null", () => {
    useCvStore.setState({ document: null });
    expect(() =>
      useCvStore.getState().updateSection("s1", { visible: false }),
    ).not.toThrow();
  });
});

describe("addSectionItem", () => {
  beforeEach(() => {
    useCvStore.setState({ activeCvId: "cv-1", document: baseDoc, activeLocale: "en" });
  });

  it("appends an item to the section's items array", () => {
    const newItem = {
      id: "i3",
      role: { en: "Lead" },
      startDate: "2025-01-01",
      description: {},
      highlights: [],
      category: "work",
    };
    useCvStore.getState().addSectionItem("s1", newItem);
    const items = useCvStore.getState().document?.sections[0] as {
      items: Array<{ id: string }>;
    };
    expect(items.items).toHaveLength(3);
    expect(items.items[2]?.id).toBe("i3");
  });

  it("is a no-op on sections without an items field", () => {
    useCvStore.setState({
      activeCvId: "cv-1",
      document: {
        ...baseDoc,
        sections: [
          { id: "s-intro", type: "introduction", title: {}, visible: true, content: {} },
        ],
      },
      activeLocale: "en",
    });
    expect(() =>
      useCvStore.getState().addSectionItem("s-intro", { id: "x" }),
    ).not.toThrow();
    const section = useCvStore.getState().document?.sections[0];
    expect(section).not.toHaveProperty("items");
  });
});

describe("removeSectionItem", () => {
  beforeEach(() => {
    useCvStore.setState({ activeCvId: "cv-1", document: baseDoc, activeLocale: "en" });
  });

  it("removes the item with the given id", () => {
    useCvStore.getState().removeSectionItem("s1", "i1");
    const section = useCvStore.getState().document?.sections[0] as {
      items: Array<{ id: string }>;
    };
    expect(section.items).toHaveLength(1);
    expect(section.items[0]?.id).toBe("i2");
  });

  it("leaves other items intact", () => {
    useCvStore.getState().removeSectionItem("s1", "i1");
    const section = useCvStore.getState().document?.sections[0] as {
      items: Array<{ id: string }>;
    };
    expect(section.items.find((i) => i.id === "i2")).toBeDefined();
  });
});

describe("updateSectionItem", () => {
  beforeEach(() => {
    useCvStore.setState({ activeCvId: "cv-1", document: baseDoc, activeLocale: "en" });
  });

  it("merges data into the matching item", () => {
    useCvStore.getState().updateSectionItem("s1", "i1", { role: { en: "Senior Dev" } });
    const section = useCvStore.getState().document?.sections[0] as {
      items: Array<{ id: string; role: Record<string, string> }>;
    };
    const item = section.items.find((i) => i.id === "i1");
    expect(item?.role).toEqual({ en: "Senior Dev" });
  });

  it("does not affect other items", () => {
    useCvStore.getState().updateSectionItem("s1", "i1", { role: { en: "Senior Dev" } });
    const section = useCvStore.getState().document?.sections[0] as {
      items: Array<{ id: string; role: Record<string, string> }>;
    };
    const other = section.items.find((i) => i.id === "i2");
    expect(other?.role).toEqual({ en: "PM" });
  });
});

describe("reorderSectionItems", () => {
  beforeEach(() => {
    useCvStore.setState({ activeCvId: "cv-1", document: baseDoc, activeLocale: "en" });
  });

  it("reorders items within the section", () => {
    useCvStore.getState().reorderSectionItems("s1", 0, 1);
    const section = useCvStore.getState().document?.sections[0] as {
      items: Array<{ id: string }>;
    };
    expect(section.items[0]?.id).toBe("i2");
    expect(section.items[1]?.id).toBe("i1");
  });
});

describe("createSnapshot", () => {
  beforeEach(() => {
    useCvStore.setState({ activeCvId: "cv-1", document: baseDoc, activeLocale: "en" });
    vi.mocked(db.snapshots.put).mockResolvedValue(undefined as unknown as string);
    vi.mocked(db.cvs.put).mockResolvedValue(undefined as unknown as string);
  });

  it("puts a snapshot and the current document to the database", async () => {
    await useCvStore.getState().createSnapshot();

    expect(db.snapshots.put).toHaveBeenCalledOnce();
    const snapshot = vi.mocked(db.snapshots.put).mock.calls[0]?.[0] as {
      cvId: string;
      state: typeof baseDoc;
      commandLog: unknown[];
    };
    expect(snapshot.cvId).toBe("cv-1");
    expect(snapshot.state).toEqual(baseDoc);
    expect(snapshot.commandLog).toEqual([]);

    expect(db.cvs.put).toHaveBeenCalledWith(baseDoc);
  });

  it("is a no-op when activeCvId is null", async () => {
    useCvStore.setState({ activeCvId: null, document: null });
    await useCvStore.getState().createSnapshot();
    expect(db.snapshots.put).not.toHaveBeenCalled();
  });

  it("is a no-op when document is null", async () => {
    useCvStore.setState({ activeCvId: "cv-1", document: null });
    await useCvStore.getState().createSnapshot();
    expect(db.snapshots.put).not.toHaveBeenCalled();
  });
});

describe("restoreSnapshot", () => {
  const snapshotDoc = { ...baseDoc, name: "CV from snapshot", defaultLocale: "fr" as const };
  const snapshot = {
    id: "snap-1",
    cvId: "cv-1",
    state: snapshotDoc,
    commandLog: [],
    timestamp: "2024-06-01T00:00:00Z",
  };

  beforeEach(() => {
    useCvStore.setState({ activeCvId: "cv-1", document: baseDoc, activeLocale: "en" });
  });

  it("sets document and locale from the snapshot", async () => {
    vi.mocked(db.snapshots.get).mockResolvedValue(snapshot);

    await useCvStore.getState().restoreSnapshot("snap-1");

    const state = useCvStore.getState();
    expect(state.document).toEqual(snapshotDoc);
    expect(state.activeLocale).toBe("fr");
  });

  it("is a no-op when the snapshot does not belong to the active CV", async () => {
    vi.mocked(db.snapshots.get).mockResolvedValue({
      ...snapshot,
      cvId: "cv-other",
    });

    await useCvStore.getState().restoreSnapshot("snap-1");

    expect(useCvStore.getState().document).toEqual(baseDoc);
  });

  it("is a no-op when the snapshot is not found", async () => {
    vi.mocked(db.snapshots.get).mockResolvedValue(undefined);

    await useCvStore.getState().restoreSnapshot("snap-1");

    expect(useCvStore.getState().document).toEqual(baseDoc);
  });

  it("is a no-op when activeCvId is null", async () => {
    useCvStore.setState({ activeCvId: null });
    await useCvStore.getState().restoreSnapshot("snap-1");
    expect(db.snapshots.get).not.toHaveBeenCalled();
  });
});

describe("discardChanges", () => {
  const snapshotDoc = { ...baseDoc, name: "Snapshot state", defaultLocale: "fr" as const };
  const snapshot = {
    id: "snap-1",
    cvId: "cv-1",
    state: snapshotDoc,
    commandLog: [],
    timestamp: "2024-06-01T00:00:00Z",
  };

  beforeEach(() => {
    useCvStore.setState({ activeCvId: "cv-1", document: baseDoc, activeLocale: "en" });
  });

  it("restores document and locale from the last snapshot", async () => {
    vi.mocked(db.snapshots.where).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        sortBy: vi.fn().mockResolvedValue([snapshot]),
        delete: vi.fn(),
      }),
    } as unknown as ReturnType<typeof db.snapshots.where>);

    await useCvStore.getState().discardChanges();

    const state = useCvStore.getState();
    expect(state.document).toEqual(snapshotDoc);
    expect(state.activeLocale).toBe("fr");
  });

  it("is a no-op when there are no snapshots", async () => {
    vi.mocked(db.snapshots.where).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        sortBy: vi.fn().mockResolvedValue([]),
        delete: vi.fn(),
      }),
    } as unknown as ReturnType<typeof db.snapshots.where>);

    await useCvStore.getState().discardChanges();

    expect(useCvStore.getState().document).toEqual(baseDoc);
  });

  it("is a no-op when activeCvId is null", async () => {
    useCvStore.setState({ activeCvId: null });
    await useCvStore.getState().discardChanges();
    expect(db.snapshots.where).not.toHaveBeenCalled();
  });
});
