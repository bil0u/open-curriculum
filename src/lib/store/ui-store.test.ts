import { useUiStore } from "./ui-store";

beforeEach(() => {
  useUiStore.setState({
    selectedSectionId: null,
    previewZoom: 1.0,
    activePanel: "editor",
    isExportDialogOpen: false,
    isSettingsDialogOpen: false,
  });
});

describe("initial state", () => {
  it("has no selected section", () => {
    expect(useUiStore.getState().selectedSectionId).toBeNull();
  });

  it("has a preview zoom of 1.0", () => {
    expect(useUiStore.getState().previewZoom).toBe(1.0);
  });

  it("defaults active panel to editor", () => {
    expect(useUiStore.getState().activePanel).toBe("editor");
  });

  it("has export dialog closed", () => {
    expect(useUiStore.getState().isExportDialogOpen).toBe(false);
  });

  it("has settings dialog closed", () => {
    expect(useUiStore.getState().isSettingsDialogOpen).toBe(false);
  });
});

describe("selectSection", () => {
  it("sets the selected section id", () => {
    useUiStore.getState().selectSection("section-abc");
    expect(useUiStore.getState().selectedSectionId).toBe("section-abc");
  });

  it("clears the selected section when called with null", () => {
    useUiStore.getState().selectSection("section-abc");
    useUiStore.getState().selectSection(null);
    expect(useUiStore.getState().selectedSectionId).toBeNull();
  });
});

describe("setPreviewZoom", () => {
  it("updates the preview zoom level", () => {
    useUiStore.getState().setPreviewZoom(0.75);
    expect(useUiStore.getState().previewZoom).toBe(0.75);
  });

  it("accepts zoom values greater than 1", () => {
    useUiStore.getState().setPreviewZoom(1.5);
    expect(useUiStore.getState().previewZoom).toBe(1.5);
  });
});

describe("setActivePanel", () => {
  it("switches to the theme panel", () => {
    useUiStore.getState().setActivePanel("theme");
    expect(useUiStore.getState().activePanel).toBe("theme");
  });

  it("switches to the versions panel", () => {
    useUiStore.getState().setActivePanel("versions");
    expect(useUiStore.getState().activePanel).toBe("versions");
  });

  it("switches back to the editor panel", () => {
    useUiStore.getState().setActivePanel("theme");
    useUiStore.getState().setActivePanel("editor");
    expect(useUiStore.getState().activePanel).toBe("editor");
  });
});

describe("toggleExportDialog", () => {
  it("opens the export dialog when it is closed", () => {
    useUiStore.getState().toggleExportDialog();
    expect(useUiStore.getState().isExportDialogOpen).toBe(true);
  });

  it("closes the export dialog when it is open", () => {
    useUiStore.getState().toggleExportDialog();
    useUiStore.getState().toggleExportDialog();
    expect(useUiStore.getState().isExportDialogOpen).toBe(false);
  });

  it("does not affect the settings dialog state", () => {
    useUiStore.getState().toggleExportDialog();
    expect(useUiStore.getState().isSettingsDialogOpen).toBe(false);
  });
});

describe("toggleSettingsDialog", () => {
  it("opens the settings dialog when it is closed", () => {
    useUiStore.getState().toggleSettingsDialog();
    expect(useUiStore.getState().isSettingsDialogOpen).toBe(true);
  });

  it("closes the settings dialog when it is open", () => {
    useUiStore.getState().toggleSettingsDialog();
    useUiStore.getState().toggleSettingsDialog();
    expect(useUiStore.getState().isSettingsDialogOpen).toBe(false);
  });

  it("does not affect the export dialog state", () => {
    useUiStore.getState().toggleSettingsDialog();
    expect(useUiStore.getState().isExportDialogOpen).toBe(false);
  });
});
