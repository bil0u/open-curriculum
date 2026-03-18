import type { EntityId, ISODateTimeString, Locale } from "./foundational";

export type ColorScheme = "light" | "dark" | "system";

export interface ShortcutBinding {
  action: string;
  keys: string;
}

export interface AppSettings {
  id: "singleton";
  locale: Locale;
  colorScheme: ColorScheme;
  panelPosition: "left" | "right";
  shortcuts: ShortcutBinding[];
  maxSnapshots: number;
  autoSaveDelayMs: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  id: "singleton",
  locale: "en",
  colorScheme: "system",
  panelPosition: "left",
  shortcuts: [],
  maxSnapshots: 50,
  autoSaveDelayMs: 2000,
};

export interface StoredBlob {
  id: EntityId;
  data: Blob;
  mimeType: string;
  fileName?: string;
  size: number;
  createdAt: ISODateTimeString;
}
