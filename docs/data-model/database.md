# IndexedDB Schema (Dexie.js)

## Database Class

```typescript
import Dexie, { type Table } from 'dexie';

class CvGeniusDatabase extends Dexie {
  profiles!: Table<Profile, EntityId>;
  cvs!: Table<CvDocument, EntityId>;
  snapshots!: Table<Snapshot, EntityId>;
  workingStates!: Table<WorkingState, EntityId>;
  themes!: Table<ThemeDefinition, EntityId>;
  settings!: Table<AppSettings, string>;
  blobs!: Table<StoredBlob, EntityId>;

  constructor() {
    super('cv-genius');

    this.version(1).stores({
      // Primary key + indexed fields only.
      // Non-indexed fields are stored but not listed here.
      profiles: 'id, updatedAt',
      cvs: 'id, profileId, themeId, updatedAt',
      snapshots: 'id, cvId, timestamp',
      workingStates: 'cvId',
      themes: 'id, name',
      settings: 'id',
      blobs: 'id, createdAt',
    });
  }
}
```

### Changes from original design

- **Removed `themeOverrides` table**: Theme overrides are stored inline on `CvDocument.themeOverrides` (`ThemeOverrideData`). This avoids dual storage and keeps overrides co-located with the CV they customize. A separate table can be added in a future version if indexed queries on overrides become necessary.
- **Removed `tag` index on `snapshots`**: Tagged versions are a V1.1 feature. The index can be added via a schema migration when needed. Dexie handles optional/undefined fields in indexes correctly (records where the field is undefined won't appear in index queries), but deferring avoids unnecessary index maintenance.

---

## Index Design Rationale

| Table | Index | Purpose |
|-------|-------|---------|
| `profiles` | `id` (PK) | Direct lookup |
| `profiles` | `updatedAt` | Sort profiles by recency |
| `cvs` | `id` (PK) | Direct lookup |
| `cvs` | `profileId` | Find all CVs for a given profile |
| `cvs` | `themeId` | Find all CVs using a given theme |
| `cvs` | `updatedAt` | Sort CVs by recency |
| `snapshots` | `id` (PK) | Direct lookup |
| `snapshots` | `cvId` | Retrieve snapshot history for a CV |
| `snapshots` | `timestamp` | Chronological ordering |
| `workingStates` | `cvId` (PK) | One working state per CV, direct lookup |
| `themes` | `id` (PK) | Direct lookup |
| `themes` | `name` | Theme search/listing |
| `settings` | `id` (PK) | Singleton lookup (`id: 'singleton'`) |
| `blobs` | `id` (PK) | Direct lookup |
| `blobs` | `createdAt` | Cleanup of orphaned blobs by age |

---

## Migration Strategy

Dexie handles schema migrations through its versioning system. Each `.version(n)` call defines the schema for that version, and Dexie runs upgrade functions in sequence when the database is opened at a higher version than what exists on disk.

Guidelines for future migrations:

1. **Never modify a released version.** Always increment: `.version(2).stores({...}).upgrade(...)`.
2. **Upgrade functions** transform existing data. They receive a `Transaction` and must be synchronous within that transaction.
3. **Additive changes** (new tables, new indexes) are safe and need no upgrade function.
4. **Destructive changes** (removing a field, changing a field type) require an upgrade function to transform existing records.
5. **Test migrations** with seeded databases from each prior version before release.
6. **Integrity check on load**: after opening the database, run a lightweight validation pass. If the working state for any CV fails validation, surface an "unsaved changes may be corrupted" prompt and offer to fall back to the last valid snapshot (per DS-06).
