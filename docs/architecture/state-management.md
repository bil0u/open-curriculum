# State Management

Two Zustand stores for MVP, each with a single responsibility. Stores are independent -- no store imports another store. Cross-store coordination happens in React components or hooks that subscribe to multiple stores.

Additional stores (`useThemeStore`, `useSettingsStore`) will be introduced when their respective features are built (theme engine, settings UI).

---

## `useCvStore`

Owns the active CV document. The store holds the `CvDocument` directly -- no denormalization, no merge/unmerge on load/save. The resolved profile (shared profile + per-CV overrides) is computed outside the store via a `useResolvedProfile()` hook.

```typescript
interface CvState {
  activeCvId: EntityId | null;
  document: CvDocument | null;
  activeLocale: Locale;
}

interface CvActions {
  loadCv: (id: EntityId) => Promise<void>;
  createCv: (options: CreateCvOptions) => Promise<EntityId>;
  updateDocument: (updates: Partial<CvDocument>) => void;
  updateProfileOverride: (field: string, value: unknown) => void;
  clearProfileOverride: (field: string) => void;
  addSection: (type: SectionType) => void;
  removeSection: (sectionId: EntityId) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  updateSection: (sectionId: EntityId, updates: Partial<SectionBase>) => void;
  addSectionItem: (sectionId: EntityId, item: unknown) => void;
  removeSectionItem: (sectionId: EntityId, itemId: EntityId) => void;
  updateSectionItem: (sectionId: EntityId, itemId: EntityId, data: Record<string, unknown>) => void;
  reorderSectionItems: (sectionId: EntityId, fromIndex: number, toIndex: number) => void;
  setActiveLocale: (locale: Locale) => void;
}
```

### Middleware Stack (MVP)

```typescript
import { create } from 'zustand';
import { temporal } from 'zundo';
import { subscribeWithSelector } from 'zustand/middleware';

export const useCvStore = create<CvState & CvActions>()(
  subscribeWithSelector(
    temporal(
      (set, get) => ({
        // ... store definition
      }),
      {
        limit: 100,
        equality: (a, b) => a.document === b.document,
        partialize: (state) => ({
          document: state.document,
          // activeLocale excluded: locale switching is navigation, not editing
          // activeCvId excluded: switching CVs clears history
        }),
      }
    )
  )
);
```

Key design decisions:
- **No `persist` middleware**: Zustand's `persist` is designed for localStorage. We use subscription-based auto-save to Dexie instead.
- **No command middleware for MVP**: Undo/redo is handled entirely by Zundo. The command middleware (for action history logging) will be added in V1.1 when building the snapshot/history UI.
- **`subscribeWithSelector`**: Enables selective subscriptions for auto-save (only trigger when `document` changes).
- **`partialize` excludes navigation state**: Only `document` is tracked by Zundo. `activeCvId` and `activeLocale` are navigation concerns; undoing should not switch CVs or locales.

### Resolved Profile (External Hook)

The shared `Profile` is a separate entity in Dexie, referenced by `CvDocument.profileId`. The merged profile (shared + overrides) is not stored in the Zustand store. Instead, it is computed reactively:

```typescript
// React hook — for components that need the merged profile
function useResolvedProfile(): Profile | null {
  const profileId = useCvStore((s) => s.document?.profileId ?? null);
  const overrides = useCvStore((s) => s.document?.profileOverrides ?? {});

  const sharedProfile = useLiveQuery(
    () => (profileId ? db.profiles.get(profileId) : undefined),
    [profileId]
  );

  return useMemo(
    () => (sharedProfile ? mergeProfile(sharedProfile, overrides) : null),
    [sharedProfile, overrides]
  );
}

// Imperative function — for the rendering pipeline (LiquidJS)
async function getResolvedProfile(doc: CvDocument): Promise<Profile | null> {
  if (!doc.profileId) return null;
  const shared = await db.profiles.get(doc.profileId);
  if (!shared) return null;
  return mergeProfile(shared, doc.profileOverrides);
}
```

### Deep Immutable Updates

Updating deeply nested fields (e.g., `document.sections[2].items[1].role.en`) requires multiple levels of spread. Helper functions keep store actions clean:

```typescript
function updateDocSection(
  doc: CvDocument,
  sectionId: EntityId,
  updater: (section: Section) => Section
): CvDocument {
  return {
    ...doc,
    sections: doc.sections.map((s) => (s.id === sectionId ? updater(s) : s)),
    updatedAt: new Date().toISOString(),
  };
}

function updateDocSectionItem(
  doc: CvDocument,
  sectionId: EntityId,
  itemId: EntityId,
  updater: (item: Record<string, unknown>) => Record<string, unknown>
): CvDocument {
  return updateDocSection(doc, sectionId, (section) => {
    if (!('items' in section)) return section;
    return {
      ...section,
      items: section.items.map((item: { id: EntityId }) =>
        item.id === itemId ? updater(item) : item
      ),
    };
  });
}
```

### CV Switching

When switching CVs or creating a new one, the Zundo undo history must be cleared:

```typescript
function switchActiveCv(newCvId: EntityId, newDoc: CvDocument, locale: Locale) {
  useCvStore.temporal.getState().clear();
  useCvStore.setState({
    activeCvId: newCvId,
    document: newDoc,
    activeLocale: locale,
  });
}
```

---

## `useUiStore`

Transient UI state. Not persisted to Dexie -- cheap to lose on reload. `panelPosition` is excluded here; it is a persistent setting that lives in `AppSettings` (Dexie).

```typescript
interface UiState {
  selectedSectionId: EntityId | null;
  previewZoom: number;          // 0.5 to 2.0
  activePanel: 'editor' | 'theme' | 'versions';
  isExportDialogOpen: boolean;
  isSettingsDialogOpen: boolean;
}

interface UiActions {
  selectSection: (id: EntityId | null) => void;
  setPreviewZoom: (zoom: number) => void;
  setActivePanel: (panel: UiState['activePanel']) => void;
  toggleExportDialog: () => void;
  toggleSettingsDialog: () => void;
}

export const useUiStore = create<UiState & UiActions>()(
  (set) => ({
    selectedSectionId: null,
    previewZoom: 1.0,
    activePanel: 'editor',
    isExportDialogOpen: false,
    isSettingsDialogOpen: false,
    selectSection: (id) => set({ selectedSectionId: id }),
    setPreviewZoom: (zoom) => set({ previewZoom: zoom }),
    setActivePanel: (panel) => set({ activePanel: panel }),
    toggleExportDialog: () => set((s) => ({ isExportDialogOpen: !s.isExportDialogOpen })),
    toggleSettingsDialog: () => set((s) => ({ isSettingsDialogOpen: !s.isSettingsDialogOpen })),
  })
);
```

---

## Deferred Stores

### `useThemeStore` (theme engine step)

Will hold the *resolved* theme definition (CSS, templates, layout) for the active CV's theme. Theme identity (`themeId`, `selectedLayoutId`) lives on `CvDocument`. The theme store caches the loaded/resolved theme definition for rendering.

### `useSettingsStore` (settings UI step)

Will wrap `AppSettings` from Dexie. Until then, a simple `getSettings()` / `updateSettings()` pair of async functions is sufficient.

---

## Dexie Persistence (Auto-Save)

A subscription-based approach using `subscribeWithSelector`. The store notifies Dexie after state changes, debounced for performance. This is **not** a Zustand middleware -- it is a side-effect subscription initialized at app startup.

```typescript
import { db } from '@/lib/db/database';
import { debounce } from '@/lib/utils/debounce';

export function initAutoSave(delayMs: number): () => void {
  const saveToDb = debounce(async (state: CvState) => {
    if (!state.activeCvId || !state.document) return;
    await db.workingStates.put({
      cvId: state.activeCvId,
      state: state.document,
      lastModified: new Date().toISOString(),
    });
  }, delayMs);

  // Subscribe to document changes only
  const unsubscribe = useCvStore.subscribe(
    (state) => state.document,
    () => saveToDb(useCvStore.getState()),
    { equalityFn: Object.is }
  );

  // Also save on tab close / visibility change
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      saveToDb.flush();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    unsubscribe();
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
```

Key points:
- Auto-save writes the `CvDocument` directly to `WorkingState` -- no transformation needed.
- `delayMs` is configurable via `AppSettings.autoSaveDelayMs`.
- Uses `Object.is` (reference equality) since every `set()` call produces a new `document` reference.

---

## Zundo Integration (Undo/Redo)

Zundo's `temporal` middleware wraps the store to maintain a history of state snapshots in memory.

```typescript
// Expose undo/redo from the temporal store
export const useUndoRedo = () => {
  const { undo, redo, pastStates, futureStates } = useCvStore.temporal.getState();
  return {
    undo,
    redo,
    canUndo: pastStates.length > 0,
    canRedo: futureStates.length > 0,
  };
};
```

Zundo handles undo/redo exclusively for MVP. The command middleware and command registry (for human-readable action history and snapshot descriptions) will be added in V1.1. See `command-pattern.md` for the deferred design.

---

## Boot Sequence

App initialization flow at startup:

1. Open Dexie database (triggers migrations if needed).
2. Read `AppSettings` from Dexie (or use defaults if none).
3. Initialize i18n with `settings.locale`.
4. Determine which CV to load (last opened, or none).
5. If a CV exists, call `loadCv(id)`.
6. Start auto-save subscription with `settings.autoSaveDelayMs`.
