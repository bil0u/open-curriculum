# Foundational Types

```typescript
/**
 * Locale identifier string following BCP 47 conventions.
 * Examples: 'en', 'fr', 'ar', 'zh-Hans'
 */
type Locale = string;

/**
 * A value that supports per-locale translations.
 * The key is a Locale, the value is the translated content.
 * At minimum, the CV's defaultLocale key should be present.
 */
type Translatable<T = string> = Record<Locale, T>;

/**
 * Unique identifier for all entities. UUIDv4 format.
 */
type EntityId = string;

/**
 * ISO 8601 date string (e.g., '2024-03-15').
 */
type ISODateString = string;

/**
 * ISO 8601 datetime string with timezone (e.g., '2024-03-15T14:30:00Z').
 */
type ISODateTimeString = string;

/**
 * Reference to a binary blob stored separately (e.g., profile photo).
 * The actual blob is stored in a dedicated IndexedDB object store.
 */
interface BlobReference {
  /** Unique identifier for the stored blob */
  id: EntityId;
  /** MIME type (e.g., 'image/jpeg', 'image/png') */
  mimeType: string;
  /** Original file name, if available */
  fileName?: string;
  /** File size in bytes */
  size: number;
  /** Crop/transform coordinates applied to the original */
  cropData?: CropData;
}

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zoom: number;
}
```
