# Settings and Blob Storage

## Settings

```typescript
type ColorScheme = 'light' | 'dark' | 'system';

interface ShortcutBinding {
  action: string;
  keys: string;
}

interface AppSettings {
  id: 'singleton';
  /** App UI locale (distinct from CV content locale) */
  locale: Locale;
  /** Color scheme preference */
  colorScheme: ColorScheme;
  /** Editor panel position relative to preview */
  panelPosition: 'left' | 'right';
  /** Keyboard shortcut bindings */
  shortcuts: ShortcutBinding[];
  /** Maximum number of untagged snapshots to keep per CV. Tagged snapshots are always preserved. */
  maxSnapshots: number;
  /** Debounce interval for auto-save (ms) */
  autoSaveDelayMs: number;
}
```

### Changes from original design

- **`darkMode: boolean` → `colorScheme: ColorScheme`**: Supports three modes (`light`, `dark`, `system`) instead of a binary toggle.
- **`pruning: PruningConfig` → `maxSnapshots: number`**: Flattened. The `PruningConfig` wrapper added no value for a single field. Tagged snapshots are always preserved regardless of this limit (documented in the field description).
- **Added `autoSaveDelayMs`**: User-configurable auto-save delay. Default: 2000ms. Exposed in settings UI.

### Default Values

```typescript
const DEFAULT_SETTINGS: AppSettings = {
  id: 'singleton',
  locale: 'en',
  colorScheme: 'system',
  panelPosition: 'left',
  shortcuts: [],
  maxSnapshots: 50,
  autoSaveDelayMs: 2000,
};
```

---

## Blob Storage

```typescript
/**
 * Binary data stored in a dedicated object store.
 * Referenced by BlobReference from Profile and other entities.
 */
interface StoredBlob {
  id: EntityId;
  data: Blob;
  mimeType: string;
  fileName?: string;
  size: number;
  createdAt: ISODateTimeString;
}
```
