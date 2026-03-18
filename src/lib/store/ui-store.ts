import { create } from "zustand";

import type { EntityId } from "@/lib/types";

export interface UiState {
  selectedSectionId: EntityId | null;
  previewZoom: number;
  activePanel: "editor" | "theme" | "versions";
  isExportDialogOpen: boolean;
  isSettingsDialogOpen: boolean;
}

export interface UiActions {
  selectSection: (id: EntityId | null) => void;
  setPreviewZoom: (zoom: number) => void;
  setActivePanel: (panel: UiState["activePanel"]) => void;
  toggleExportDialog: () => void;
  toggleSettingsDialog: () => void;
}

export const useUiStore = create<UiState & UiActions>()((set) => ({
  selectedSectionId: null,
  previewZoom: 1.0,
  activePanel: "editor",
  isExportDialogOpen: false,
  isSettingsDialogOpen: false,

  selectSection: (id) => set({ selectedSectionId: id }),
  setPreviewZoom: (zoom) => set({ previewZoom: zoom }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  toggleExportDialog: () =>
    set((s) => ({ isExportDialogOpen: !s.isExportDialogOpen })),
  toggleSettingsDialog: () =>
    set((s) => ({ isSettingsDialogOpen: !s.isSettingsDialogOpen })),
}));
