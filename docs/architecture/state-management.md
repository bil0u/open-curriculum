# State Management

Four Zustand stores, each with a single responsibility. Stores are independent -- no store imports another store. Cross-store coordination happens in React components or hooks that subscribe to multiple stores.

---

## `useCvStore`

Owns the active CV document: profile data, sections, section items, and the active locale for editing.

```typescript
interface CvState {
  activeCvId: string | null;
  profile: Profile;
  sections: Section[];
  activeLocale: string;
}

interface CvActions {
  loadCv: (id: string) => Promise<void>;
  updateProfile: (field: keyof Profile, value: LocalizedString) => void;
  addSection: (type: SectionType) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  updateSectionItem: (sectionId: string, itemId: string, data: Partial<SectionItem>) => void;
  addSectionItem: (sectionId: string, item: SectionItem) => void;
  removeSectionItem: (sectionId: string, itemId: string) => void;
  reorderSectionItems: (sectionId: string, fromIndex: number, toIndex: number) => void;
  setActiveLocale: (locale: string) => void;
}

export const useCvStore = create<CvState & CvActions>()(
  commandMiddleware(
    temporal(
      persist(
        (set, get) => ({
          // ... implementation
        }),
        { name: 'cv-store' }
      )
    )
  )
);
```

---

## `useUiStore`

Transient UI state. Not persisted to Dexie -- cheap to lose on reload.

```typescript
interface UiState {
  selectedSectionId: string | null;
  editorPanelPosition: 'left' | 'right';
  previewZoom: number;          // 0.5 to 2.0
  activePanel: 'editor' | 'theme' | 'versions';
  isExportDialogOpen: boolean;
  isSettingsDialogOpen: boolean;
}

interface UiActions {
  selectSection: (id: string | null) => void;
  setPreviewZoom: (zoom: number) => void;
  setActivePanel: (panel: UiState['activePanel']) => void;
  toggleExportDialog: () => void;
  toggleSettingsDialog: () => void;
}
```

---

## `useThemeStore`

Active theme identity and user overrides. Overrides are CSS custom property values.

```typescript
interface ThemeState {
  activeThemeId: string;
  activeVariant: string;
  overrides: Record<string, string>;  // e.g. { '--cv-primary-color': '#2563eb' }
  pageFormat: PageFormat;             // { width: '210mm', height: '297mm', name: 'A4' }
}

interface ThemeActions {
  setTheme: (themeId: string) => void;
  setVariant: (variantId: string) => void;
  setOverride: (property: string, value: string) => void;
  resetOverrides: () => void;
  setPageFormat: (format: PageFormat) => void;
}
```

---

## `useSettingsStore`

Persistent app-wide preferences. Persisted to Dexie on change.

```typescript
interface SettingsState {
  appLocale: string;            // App UI language (not CV content language)
  colorScheme: 'light' | 'dark' | 'system';
  maxSnapshots: number;         // Pruning threshold
  autoSaveDelayMs: number;      // Debounce interval for auto-save
}

interface SettingsActions {
  setAppLocale: (locale: string) => void;
  setColorScheme: (scheme: SettingsState['colorScheme']) => void;
  setMaxSnapshots: (n: number) => void;
}
```

---

## Command Pattern Middleware

A Zustand middleware that intercepts mutations and wraps them as named commands. This is the integration point between user actions, undo/redo, and the action history log.

```typescript
import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

type CommandMiddleware = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  creator: StateCreator<T, Mps, Mcs>
) => StateCreator<T, Mps, Mcs>;

const commandMiddleware: CommandMiddleware = (creator) => (set, get, api) => {
  const wrappedSet: typeof set = (partial, replace) => {
    // 1. Capture state before mutation
    const prev = get();

    // 2. Apply mutation
    set(partial, replace);

    // 3. Read active command context (set by the action that triggered this)
    const ctx = getActiveCommandContext();
    if (ctx) {
      commandRegistry.record({
        type: ctx.type,
        description: ctx.description,
        timestamp: Date.now(),
        before: prev,
        after: get(),
      });
    }
  };

  return creator(wrappedSet, get, api);
};
```

Actions set command context before mutating:

```typescript
const updateProfile: CvActions['updateProfile'] = (field, value) => {
  withCommand(
    { type: 'UPDATE_PROFILE', description: `Updated ${field}` },
    () => {
      set((state) => ({
        profile: { ...state.profile, [field]: value },
      }));
    }
  );
};
```

---

## Zundo Integration (Undo/Redo)

Zundo's `temporal` middleware wraps the store to maintain a history of state snapshots. It works alongside the command middleware.

```typescript
import { temporal } from 'zundo';

export const useCvStore = create<CvState & CvActions>()(
  commandMiddleware(
    temporal(
      (set, get) => ({
        // ... store definition
      }),
      {
        // Zundo options
        limit: 100,                    // Max undo steps in memory
        equality: (a, b) => deepEqual(a, b), // Skip no-op changes
        partialize: (state) => {
          // Only track data fields, not derived/transient state
          const { activeCvId, profile, sections, activeLocale } = state;
          return { activeCvId, profile, sections, activeLocale };
        },
      }
    )
  )
);

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

---

## Dexie Persistence (Auto-Save)

A subscription-based approach. The store notifies Dexie after state changes, debounced for performance. This is **not** a Zustand middleware -- it is a side-effect subscription initialized at app startup.

```typescript
import { db } from '@/lib/db/database';
import { debounce } from '@/lib/utils/debounce';

const AUTO_SAVE_DELAY = 2000; // ms

export function initAutoSave(): () => void {
  const saveToDb = debounce(async (state: CvState) => {
    if (!state.activeCvId) return;
    await db.workingState.put({
      cvId: state.activeCvId,
      data: {
        profile: state.profile,
        sections: state.sections,
        activeLocale: state.activeLocale,
      },
      savedAt: Date.now(),
    });
  }, AUTO_SAVE_DELAY);

  // Subscribe to store changes
  const unsubscribe = useCvStore.subscribe(
    (state) => ({ profile: state.profile, sections: state.sections }),
    (slice) => saveToDb(useCvStore.getState()),
    { equalityFn: shallow }
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
