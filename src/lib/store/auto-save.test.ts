import { db } from "@/lib/db";

import { initAutoSave } from "./auto-save";
import { useCvStore } from "./cv-store";

vi.mock("@/lib/db", () => ({
  db: {
    workingStates: { put: vi.fn() },
  },
}));

const mockDocument = {
  id: "cv-1",
  name: "My CV",
  profileId: null,
  profileOverrides: {},
  sections: [],
  themeId: "theme-1",
  defaultLocale: "en" as const,
  availableLocales: ["en" as const],
  pageFormat: "A4" as const,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

let cleanup: (() => void) | null = null;

beforeEach(() => {
  useCvStore.setState({ activeCvId: null, document: null, activeLocale: "en" });
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup?.();
  cleanup = null;
  vi.useRealTimers();
});

describe("initAutoSave", () => {
  it("returns a cleanup function", () => {
    cleanup = initAutoSave(500);
    expect(typeof cleanup).toBe("function");
  });

  it("writes to db after the debounce delay when document changes", async () => {
    cleanup = initAutoSave(500);

    useCvStore.setState({ activeCvId: "cv-1", document: mockDocument });

    expect(db.workingStates.put).not.toHaveBeenCalled();

    await vi.runAllTimersAsync();

    expect(db.workingStates.put).toHaveBeenCalledOnce();
    expect(db.workingStates.put).toHaveBeenCalledWith(
      expect.objectContaining({ cvId: "cv-1", state: mockDocument }),
    );
  });

  it("does not write when activeCvId is null", async () => {
    cleanup = initAutoSave(500);

    useCvStore.setState({ activeCvId: null, document: mockDocument });
    await vi.runAllTimersAsync();

    expect(db.workingStates.put).not.toHaveBeenCalled();
  });

  it("does not write when document is null", async () => {
    cleanup = initAutoSave(500);

    useCvStore.setState({ activeCvId: "cv-1", document: null });
    await vi.runAllTimersAsync();

    expect(db.workingStates.put).not.toHaveBeenCalled();
  });

  it("flushes immediately on visibilitychange to hidden", async () => {
    cleanup = initAutoSave(500);

    useCvStore.setState({ activeCvId: "cv-1", document: mockDocument });

    Object.defineProperty(document, "visibilityState", {
      value: "hidden",
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));

    expect(db.workingStates.put).toHaveBeenCalledOnce();
  });

  it("stops writing after cleanup is called", async () => {
    const stop = initAutoSave(500);
    stop();

    useCvStore.setState({ activeCvId: "cv-1", document: mockDocument });
    await vi.runAllTimersAsync();

    expect(db.workingStates.put).not.toHaveBeenCalled();
  });

  it("coalesces rapid document changes into a single write", async () => {
    cleanup = initAutoSave(500);

    useCvStore.setState({ activeCvId: "cv-1", document: mockDocument });
    useCvStore.setState({
      document: { ...mockDocument, name: "Updated 1" },
    });
    useCvStore.setState({
      document: { ...mockDocument, name: "Updated 2" },
    });

    await vi.runAllTimersAsync();

    expect(db.workingStates.put).toHaveBeenCalledOnce();
  });
});
