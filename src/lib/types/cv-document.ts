import type { EntityId, ISODateTimeString, Locale } from "./foundational";
import type { Profile } from "./profile";
import type { Section } from "./sections";
import type { ThemeOverrideData } from "./themes";

export type PredefinedPageFormat = "A4" | "Letter";

export interface CustomPageFormat {
  type: "custom";
  widthMm: number;
  heightMm: number;
}

export type PageFormat = PredefinedPageFormat | CustomPageFormat;

export interface CvDocument {
  id: EntityId;
  name: string;
  profileId: EntityId | null;
  profileOverrides: Partial<Omit<Profile, "id" | "createdAt" | "updatedAt">>;
  sections: Section[];
  themeId: EntityId;
  themeOverrides?: ThemeOverrideData;
  defaultLocale: Locale;
  availableLocales: Locale[];
  pageFormat: PageFormat;
  selectedLayoutId?: EntityId;
  sectionSlotMapping?: Record<EntityId, string>;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}
