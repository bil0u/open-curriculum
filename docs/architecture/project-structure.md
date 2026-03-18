# Project Structure

Feature-based organization. Code is grouped by domain, not by type. Shared infrastructure lives in `src/lib/`, including UI primitives in `src/lib/ui/`.

```
cv-genius/
├── docs/                              # Project documentation
│   ├── architecture/                  # Technical architecture (this directory)
│   ├── data-model/                    # Schema definitions
│   └── theme-authoring.md             # Guide for theme creators
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── main.tsx                       # App entry point
│   ├── app.tsx                        # Root component, providers, layout
│   ├── vite-env.d.ts                  # Vite type declarations
│   │
│   ├── features/
│   │   ├── editor/                    # CV content editing
│   │   │   ├── components/
│   │   │   │   ├── editor-panel.tsx
│   │   │   │   ├── section-list.tsx
│   │   │   │   ├── section-editor.tsx
│   │   │   │   ├── field-renderer.tsx
│   │   │   │   ├── freeform-editor.tsx
│   │   │   │   └── profile-form.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-section-dnd.ts
│   │   │   │   └── use-field-validation.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── preview/                   # Live CV preview
│   │   │   ├── components/
│   │   │   │   ├── preview-panel.tsx
│   │   │   │   ├── preview-frame.tsx  # iframe container
│   │   │   │   ├── page-indicator.tsx
│   │   │   │   └── zoom-controls.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-rendered-cv.ts # Orchestrates data -> HTML pipeline
│   │   │   │   └── use-preview-scale.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── themes/                    # Theme selection and editor
│   │   │   ├── components/
│   │   │   │   ├── theme-picker.tsx
│   │   │   │   ├── theme-editor.tsx
│   │   │   │   ├── color-override-panel.tsx
│   │   │   │   └── font-override-panel.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-theme-overrides.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── versioning/                # Snapshots, history, undo/redo
│   │   │   ├── components/
│   │   │   │   ├── snapshot-list.tsx
│   │   │   │   ├── snapshot-detail.tsx
│   │   │   │   └── undo-redo-toolbar.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-undo-redo.ts
│   │   │   │   └── use-snapshots.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── settings/                  # App preferences
│   │   │   ├── components/
│   │   │   │   ├── settings-dialog.tsx
│   │   │   │   ├── locale-picker.tsx
│   │   │   │   └── storage-usage.tsx
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── export/                    # PDF and HTML export
│   │   │   ├── components/
│   │   │   │   └── export-menu.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-pdf-export.ts
│   │   │   │   └── use-html-export.ts
│   │   │   ├── utils/
│   │   │   │   ├── serialize-html.ts
│   │   │   │   └── inline-styles.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   └── cv-management/             # CV list, create, duplicate, import
│   │       ├── components/
│   │       │   ├── cv-list.tsx
│   │       │   ├── cv-card.tsx
│   │       │   ├── create-cv-dialog.tsx
│   │       │   └── import-dialog.tsx
│   │       ├── hooks/
│   │       │   └── use-cv-operations.ts
│   │       ├── types.ts
│   │       └── index.ts
│   │
│   ├── lib/                           # Shared infrastructure
│   │   ├── db/
│   │   │   ├── schema.ts             # Dexie table definitions, indexes
│   │   │   ├── database.ts           # Dexie instance, version migrations
│   │   │   ├── repositories.ts       # Data access helpers per entity
│   │   │   └── database.test.ts
│   │   │
│   │   ├── store/
│   │   │   ├── cv-store.ts           # useCvStore
│   │   │   ├── cv-store.test.ts
│   │   │   ├── ui-store.ts           # useUiStore
│   │   │   ├── ui-store.test.ts
│   │   │   ├── theme-store.ts        # useThemeStore
│   │   │   ├── theme-store.test.ts
│   │   │   ├── settings-store.ts     # useSettingsStore
│   │   │   ├── settings-store.test.ts
│   │   │   └── middleware/
│   │   │       ├── command-middleware.ts   # Command pattern wrapper
│   │   │       ├── persistence-middleware.ts  # Dexie auto-save
│   │   │       └── command-middleware.test.ts
│   │   │
│   │   ├── commands/
│   │   │   ├── types.ts              # Command interface
│   │   │   ├── command-registry.ts   # Command log, debouncing
│   │   │   ├── cv-commands.ts        # CV-specific command factories
│   │   │   └── command-registry.test.ts
│   │   │
│   │   ├── template-engine/
│   │   │   ├── engine.ts             # LiquidJS instance, custom filters/tags
│   │   │   ├── filters.ts            # date formatting, markdown, etc.
│   │   │   ├── render.ts             # Compile theme + data -> HTML string
│   │   │   └── engine.test.ts
│   │   │
│   │   ├── keyboard/
│   │   │   ├── shortcut-map.ts       # Keybinding definitions
│   │   │   └── use-keyboard-shortcuts.ts
│   │   │
│   │   ├── i18n/
│   │   │   └── config.ts             # react-i18next initialization
│   │   │
│   │   ├── ui/                        # Shared UI primitives (zero domain knowledge)
│   │   │   ├── button/
│   │   │   │   ├── button.tsx
│   │   │   │   └── button.test.tsx
│   │   │   ├── dialog/
│   │   │   │   ├── dialog.tsx
│   │   │   │   └── dialog.test.tsx
│   │   │   ├── dropdown-menu/
│   │   │   ├── icon/
│   │   │   ├── kbd/
│   │   │   ├── tooltip/
│   │   │   └── index.ts             # Barrel export for shared UI primitives
│   │   │
│   │   └── utils/
│   │       ├── result.ts             # Result<T, E> type
│   │       ├── debounce.ts
│   │       └── sanitize.ts           # DOMPurify wrapper
│   │
│   ├── themes/                        # Bundled default themes
│   │   ├── classic/
│   │   │   ├── manifest.json         # Theme metadata, supported sections, variants
│   │   │   ├── template.liquid       # Main Liquid template
│   │   │   ├── partials/
│   │   │   │   ├── header.liquid
│   │   │   │   ├── experience.liquid
│   │   │   │   ├── education.liquid
│   │   │   │   └── skills.liquid
│   │   │   ├── styles/
│   │   │   │   ├── base.css          # Core layout and typography
│   │   │   │   └── variables.css     # CSS custom properties (overridable)
│   │   │   └── assets/               # Icons, fonts bundled with the theme
│   │   │
│   │   └── modern/
│   │       ├── manifest.json
│   │       ├── template.liquid
│   │       ├── partials/
│   │       ├── styles/
│   │       └── assets/
│   │
│   ├── locales/                       # App UI i18n resources
│   │   ├── en/
│   │   │   ├── common.json           # Shared strings (buttons, labels)
│   │   │   ├── editor.json           # Editor feature strings
│   │   │   ├── settings.json
│   │   │   └── export.json
│   │   └── fr/
│   │       ├── common.json
│   │       ├── editor.json
│   │       ├── settings.json
│   │       └── export.json
│   │
│   └── styles/
│       ├── globals.css                # Tailwind directives, CSS reset
│       └── print.css                  # @media print overrides
│
├── e2e/                               # Playwright end-to-end tests
│   ├── cv-editing.spec.ts
│   ├── export.spec.ts
│   └── theme-preview.spec.ts
│
├── index.html                         # Vite HTML entry
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.ts
├── playwright.config.ts
├── bun.lock
└── package.json
```

## Key Principles

- **Feature folders own their components, hooks, and types.** A component used only by the editor lives in `src/features/editor/components/`, not in `src/lib/ui/`.
- **`src/lib/ui/` is reserved for truly generic primitives** -- components with zero domain knowledge (Button, Dialog, Icon). If it mentions "CV" or "section", it belongs in a feature.
- **`src/lib/` is shared infrastructure** -- stores, database, template engine, UI primitives, utilities. Features import from `lib/`, never the reverse.
- **Test files are co-located**, placed next to the source file they test: `cv-store.ts` and `cv-store.test.ts` in the same directory.
- **Barrel exports (`index.ts`)** at the feature root define the public API of each feature. Internal files should not be imported directly from other features.
