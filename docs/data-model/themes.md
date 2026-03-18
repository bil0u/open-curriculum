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

## Theme File Organization

Themes are stored as a folder with a defined structure. At runtime, the folder contents are loaded into `ThemeDefinition.templates` and related fields.

```
my-theme/
  theme.json              # Manifest (required)
  layout.liquid           # Default layout template (required)
  layout.two-col.liquid   # Additional layout variant (optional)
  partials/
    header.liquid
    introduction.liquid
    experience.liquid
    ... (one per section type)
    _default.liquid       # Fallback for missing section types
  styles/
    variables.css         # CSS custom properties (--cv-* on :root)
    base.css              # Layout, typography, structure
  assets/                 # Optional: fonts, icons
```

### Layout Naming

Additional layout variants follow the naming convention `layout.<variant>.liquid`. The variant slug becomes the `LayoutVariant.id`.

### Partial Resolution

Partials are named by `section.type` (e.g., `experience.liquid` for an `experience` section). The LiquidJS custom fs adapter auto-resolves partials from `ThemeDefinition.templates`. If a partial is not found, it falls back to `_default.liquid` with a console warning.

### `theme.json` Manifest

Minimal required fields:

```json
{
  "id": "my-theme",
  "name": "My Theme",
  "version": "1.0.0"
}
```

All other fields (`description`, `author`, `fonts`, `customizableProperties`, etc.) are optional. The manifest maps directly to `ThemeDefinition` at runtime.

### Template Data Context

Templates receive a locale-resolved context — translatable fields are already resolved to the active locale, so theme authors do not need to handle locale switching. All fields are nil-safe: missing strings resolve to `""` and missing arrays resolve to `[]`.

### CSS Custom Properties

All theme CSS custom properties use the `--cv-` prefix and are declared on `:root`:

```css
/* variables.css */
:root {
  --cv-primary-color: #1a1a1a;
  --cv-accent-color: #2563eb;
  --cv-font-family-heading: 'Inter', sans-serif;
  --cv-font-size-base: 10pt;
  --cv-margin-page: 20mm;
}
```

User overrides are injected as a `:root` block appended after `variables.css`, which naturally overrides the defaults via the cascade.

### Distribution

Themes are distributed as `.cvtheme` zip archives for sharing between users. This is a post-MVP feature.

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
