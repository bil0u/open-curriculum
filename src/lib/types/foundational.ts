/**
 * Locale identifier string following BCP 47 conventions.
 * Examples: 'en', 'fr', 'ar', 'zh-Hans'
 */
export type Locale = string;

/**
 * A value that supports per-locale translations.
 * At minimum, the CV's defaultLocale key should be present.
 */
export type Translatable<T = string> = Record<Locale, T>;

/**
 * Unique identifier for all entities. UUIDv4 format.
 */
export type EntityId = string;

/**
 * ISO 8601 date string (e.g., '2024-03-15').
 */
export type ISODateString = string;

/**
 * ISO 8601 datetime string with timezone (e.g., '2024-03-15T14:30:00Z').
 */
export type ISODateTimeString = string;

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zoom: number;
}

/**
 * Reference to a binary blob stored separately (e.g., profile photo).
 */
export interface BlobReference {
  id: EntityId;
  mimeType: string;
  fileName?: string;
  size: number;
  cropData?: CropData;
}
