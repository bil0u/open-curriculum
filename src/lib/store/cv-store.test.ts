import { db } from "@/lib/db";

import { useCvStore } from "./cv-store";

vi.mock("@/lib/db", () => ({
  db: {
    cvs: { get: vi.fn(), put: vi.fn() },
    workingStates: { get: vi.fn(), put: vi.fn() },
    profiles: { get: vi.fn() },
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
            order: 0,
            visible: true,
            items: [],
          },
          {
            id: "s2",
            type: "introduction",
            title: {},
            order: 1,
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
            order: 0,
            visible: true,
            items: [],
          },
          {
            id: "s2",
            type: "introduction",
            title: {},
            order: 1,
            visible: true,
            content: {},
          },
          {
            id: "s3",
            type: "education",
            title: {},
            order: 2,
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
