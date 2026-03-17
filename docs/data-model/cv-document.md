# CV Document

## Page Format

```typescript
type PredefinedPageFormat = 'A4' | 'Letter';

interface CustomPageFormat {
  type: 'custom';
  /** Width in millimeters */
  widthMm: number;
  /** Height in millimeters */
  heightMm: number;
}

type PageFormat = PredefinedPageFormat | CustomPageFormat;
```

## CV Document

```typescript
interface CvDocument {
  id: EntityId;

  /** Internal label for the user to distinguish CVs (not rendered) */
  name: string;

  /**
   * Reference to the shared Profile.
   * Null when the CV uses fully inline profile data (no shared profile).
   */
  profileId: EntityId | null;

  /**
   * Partial profile overrides for per-CV customization.
   * Merged on top of the referenced Profile at render time.
   * Allows, for example, a different title or email per CV.
   */
  profileOverrides: Partial<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>>;

  /** Ordered array of content sections */
  sections: Section[];

  /** ID of the base theme applied to this CV */
  themeId: EntityId;

  /** Per-CV theme customizations (inline, not a separate entity) */
  themeOverrides?: ThemeOverrideData;

  /** The primary locale for this CV; used as fallback for missing translations */
  defaultLocale: Locale;

  /** All locales available for this CV */
  availableLocales: Locale[];

  /** Page dimensions for rendering and export */
  pageFormat: PageFormat;

  /** ID of the selected layout variant within the theme */
  selectedLayoutId?: EntityId;

  /**
   * Mapping of section IDs to layout slot names.
   * Determines which section renders in which template zone.
   */
  sectionSlotMapping?: Record<EntityId, string>;

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}
```
