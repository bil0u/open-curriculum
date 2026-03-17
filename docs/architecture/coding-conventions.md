# Coding Conventions

---

## File Naming

| Kind | Convention | Example |
|------|-----------|---------|
| Component files | `kebab-case.tsx` | `section-editor.tsx` |
| Hook files | `kebab-case.ts` with `use-` prefix | `use-section-dnd.ts` |
| Store files | `kebab-case.ts` with `-store` suffix | `cv-store.ts` |
| Test files | Same name + `.test.ts(x)` | `cv-store.test.ts` |
| Type-only files | `types.ts` per feature/module | `src/features/editor/types.ts` |
| Utility files | `kebab-case.ts` | `debounce.ts` |
| Liquid templates | `kebab-case.liquid` | `experience.liquid` |

---

## Component Patterns

Functional components only. Named exports (no default exports). Props interface co-located.

```typescript
// section-editor.tsx

interface SectionEditorProps {
  sectionId: string;
  onDelete: (id: string) => void;
}

export function SectionEditor({ sectionId, onDelete }: SectionEditorProps) {
  // ...
}
```

No default exports -- named exports are greppable and refactor-safe:

```typescript
// index.ts (barrel)
export { SectionEditor } from './components/section-editor';
export { useSectionDnd } from './hooks/use-section-dnd';
export type { SectionEditorProps } from './components/section-editor';
```

---

## Hook Naming

All hooks use the `use` prefix. Hooks are co-located with the feature that owns them.

```typescript
// src/features/preview/hooks/use-rendered-cv.ts
export function useRenderedCv(cvId: string): RenderedCv { ... }

// src/features/editor/hooks/use-field-validation.ts
export function useFieldValidation(schema: SectionSchema): ValidationResult { ... }
```

---

## Store Naming

Stores follow `use[Name]Store` convention. The store definition and its types live in the same file.

```typescript
// src/lib/store/cv-store.ts
export const useCvStore = create<CvState & CvActions>()( ... );
```

---

## Type Naming

- **Interfaces** for object shapes (data models, props, state).
- **Type aliases** for unions, intersections, and computed types.
- PascalCase for all types.

```typescript
// Interfaces for objects
interface Profile {
  name: LocalizedString;
  title: LocalizedString;
  email: string;
  photo: string | null;
}

interface Section {
  id: string;
  type: SectionType;
  label: LocalizedString;
  items: SectionItem[];
  order: number;
}

// Type aliases for unions and utility types
type SectionType = 'experience' | 'education' | 'skills' | 'languages' | 'freeform';

type LocalizedString = Record<string, string>; // { en: "...", fr: "..." }

type PageFormat = {
  name: string;
  width: string;
  height: string;
};
```

---

## Import Order

Enforce with ESLint `import/order` rule. Four groups, separated by blank lines:

```typescript
// 1. React
import { useState, useEffect } from 'react';

// 2. External libraries
import { useTranslation } from 'react-i18next';
import { useSortable } from '@dnd-kit/sortable';

// 3. Internal absolute imports (from src/)
import { useCvStore } from '@/lib/store/cv-store';
import { Button } from '@/lib/ui';

// 4. Relative imports (same feature)
import { SectionItem } from './section-item';
import type { EditorPanelProps } from './types';
```

Path alias `@/` maps to `src/` via `tsconfig.json` paths and Vite resolve alias.

---

## Testing

Co-located test files. Test behavior, not implementation. Queries by role and accessible name (enforces a11y).

```typescript
// section-editor.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SectionEditor } from './section-editor';

describe('SectionEditor', () => {
  it('calls onDelete when the delete button is clicked', async () => {
    const onDelete = vi.fn();
    render(<SectionEditor sectionId="s1" onDelete={onDelete} />);

    await userEvent.click(screen.getByRole('button', { name: /delete section/i }));

    expect(onDelete).toHaveBeenCalledWith('s1');
  });

  it('displays a validation warning for missing required fields', () => {
    render(<SectionEditor sectionId="s1" onDelete={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent(/required/i);
  });
});
```

Store tests use the store directly, not through components:

```typescript
// cv-store.test.ts
import { useCvStore } from './cv-store';

describe('useCvStore', () => {
  beforeEach(() => {
    useCvStore.setState(initialState);
  });

  it('reorders sections correctly', () => {
    useCvStore.getState().reorderSections(0, 2);

    const types = useCvStore.getState().sections.map((s) => s.type);
    expect(types).toEqual(['education', 'skills', 'experience']);
  });
});
```

---

## Error Handling

**Expected errors** (validation failures, missing data, I/O errors) use the Result pattern. Never throw for expected failures.

```typescript
// src/lib/utils/result.ts

type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
```

Usage:

```typescript
async function importCvFromJson(file: File): Promise<Result<CvData, ImportError>> {
  const text = await file.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return err({ code: 'INVALID_JSON', message: 'File is not valid JSON' });
  }

  const validation = validateCvSchema(parsed);
  if (!validation.ok) {
    return err({ code: 'INVALID_SCHEMA', message: validation.message });
  }

  return ok(validation.data);
}
```

**Unexpected errors** (bugs, unrecoverable states) use React Error Boundaries at feature boundaries.

```typescript
// In app.tsx or feature-level layout
<ErrorBoundary fallback={<ErrorFallback />}>
  <EditorPanel />
</ErrorBoundary>

<ErrorBoundary fallback={<PreviewErrorFallback />}>
  <PreviewPanel />
</ErrorBoundary>
```

This isolates failures: a crash in the theme rendering pipeline does not take down the editor, and vice versa.
