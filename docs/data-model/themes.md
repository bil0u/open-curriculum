# Theme Types

```typescript
interface ThemeDefinition {
  id: EntityId;
  name: string;
  description: string;
  author: string;
  version: string;

  /** Available layout variants within this theme */
  layouts: LayoutVariant[];

  /** ID of the default layout variant */
  defaultLayoutId: EntityId;

  /**
   * Base CSS for the theme. Uses CSS custom properties for values
   * that can be overridden by users (colors, fonts, spacing).
   */
  css: string;

  /**
   * Template files keyed by name.
   * LiquidJS template strings for rendering CV sections.
   * Typical keys: 'main', 'header', 'footer', 'section-experience', etc.
   */
  templates: Record<string, string>;

  /**
   * Icon library specification.
   * Could be a CDN URL, inline SVG sprite, or embedded font reference.
   */
  iconLibrary?: ThemeIconLibrary;

  /**
   * Font specifications used by the theme.
   * Includes font family names and optional embedded font data or URLs.
   */
  fonts: ThemeFont[];

  /**
   * CSS custom properties defined by this theme that are available
   * for user override. Serves as the theme's public API for customization.
   */
  customizableProperties: ThemeCustomizableProperty[];
}

interface ThemeIconLibrary {
  /** How the icons are provided */
  type: 'cdn' | 'inline-svg' | 'embedded-font';
  /** CDN URL or inline content depending on type */
  source: string;
  /** Human-readable name (e.g., 'Font Awesome 6', 'Lucide') */
  name: string;
}

interface ThemeFont {
  /** CSS font-family name */
  family: string;
  /** Font weight(s) available */
  weights: number[];
  /** Font style(s) available */
  styles: ('normal' | 'italic')[];
  /** URL to load the font from, or null if system/embedded */
  url?: string;
}

interface ThemeCustomizableProperty {
  /** CSS custom property name (e.g., '--cv-primary-color') */
  property: string;
  /** Human-readable label for the UI */
  label: string;
  /** Type hint for the editor UI */
  inputType: 'color' | 'font-family' | 'length' | 'number' | 'select';
  /** Default value as defined in the theme's base CSS */
  defaultValue: string;
  /** Available options for 'select' inputType */
  options?: string[];
}

interface LayoutVariant {
  id: EntityId;
  name: string;
  /** LiquidJS template string defining the overall page structure */
  template: string;
  /**
   * Named slots where sections can be placed.
   * Each slot represents a zone in the layout (e.g., 'sidebar', 'main', 'header').
   */
  slots: LayoutSlot[];
}

interface LayoutSlot {
  /** Unique slot name within the layout (e.g., 'sidebar', 'main-body') */
  name: string;
  /** Human-readable label */
  label: string;
  /** Which section types are accepted in this slot, or empty for any */
  acceptedSectionTypes: SectionType[];
}
```

---

## Theme Override

```typescript
/**
 * Per-CV theme customization data.
 * Stored inline on CvDocument, not as a separate entity,
 * so it travels with the CV on export/import.
 */
interface ThemeOverrideData {
  /**
   * Simple overrides: CSS custom property name to value.
   * These are the primary customization mechanism (colors, fonts, spacing).
   */
  simpleOverrides: Record<string, string>;

  /**
   * Optional raw CSS appended after all other styles.
   * Expert/advanced mode only. Sanitized before rendering.
   */
  rawCss?: string;
}

/**
 * Persisted theme override entity for the database layer.
 * Links a CvDocument to its override data for indexed queries.
 */
interface ThemeOverride {
  id: EntityId;
  themeId: EntityId;
  cvId: EntityId;
  overrides: ThemeOverrideData;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}
```
