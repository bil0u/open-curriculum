import type { EntityId } from "./foundational";
import type { SectionType } from "./sections";

export interface ThemeIconLibrary {
  type: "cdn" | "inline-svg" | "embedded-font";
  source: string;
  name: string;
}

export interface ThemeFont {
  family: string;
  weights: number[];
  styles: ("normal" | "italic")[];
  url?: string;
}

export interface ThemeCustomizableProperty {
  property: string;
  label: string;
  inputType: "color" | "font-family" | "length" | "number" | "select";
  defaultValue: string;
  options?: string[];
}

export interface LayoutSlot {
  name: string;
  label: string;
  acceptedSectionTypes: SectionType[];
}

export interface LayoutVariant {
  id: EntityId;
  name: string;
  template: string;
  slots: LayoutSlot[];
}

export interface ThemeDefinition {
  id: EntityId;
  name: string;
  description: string;
  author: string;
  version: string;
  layouts: LayoutVariant[];
  defaultLayoutId: EntityId;
  css: string;
  templates: Record<string, string>;
  iconLibrary?: ThemeIconLibrary;
  fonts: ThemeFont[];
  customizableProperties: ThemeCustomizableProperty[];
  /** Section types the theme was designed to showcase. Used for non-blocking "missing section" hints. */
  recommendedSectionTypes?: SectionType[];
}

/**
 * Per-CV theme customization data.
 * Stored inline on CvDocument, not as a separate entity.
 */
export interface ThemeOverrideData {
  simpleOverrides: Record<string, string>;
  rawCss?: string;
}
