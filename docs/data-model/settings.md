# Settings and Blob Storage

## Settings

```typescript
interface ShortcutBinding {
  action: string;
  keys: string;
}

interface PruningConfig {
  /** Maximum number of untagged snapshots to keep per CV */
  maxUntaggedSnapshots: number;
  /** Tagged snapshots are always preserved regardless of this limit */
}

interface AppSettings {
  id: 'singleton';
  /** App UI locale (distinct from CV content locale) */
  locale: Locale;
  darkMode: boolean;
  /** Editor panel position relative to preview */
  panelPosition: 'left' | 'right';
  shortcuts: ShortcutBinding[];
  pruning: PruningConfig;
}
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
