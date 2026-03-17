# Data Model Specification

This directory contains the complete data model for CV Genius. All TypeScript interfaces and types described here serve as the authoritative specification for implementation.

## Core Concepts

- **Profile** — Shared user identity (name, contacts, photo, social links). Reusable across CVs. All user-facing text fields are `Translatable`.
- **CV Document** — Central entity. References a Profile, contains ordered typed Sections, binds to a Theme, carries metadata (page format, locales).
- **Section** — Typed content block using a discriminated union on `type`. 11 predefined types + freeform. Each has `order` and `visible` fields.
- **Translatable Fields** — Per-locale translations at field level via `Record<Locale, T>`. CV's `defaultLocale` is the fallback.
- **Theme Configuration** — Base `ThemeDefinition` (templates, CSS, fonts, icons, layouts) + per-CV `ThemeOverride` (CSS custom properties, optional raw CSS).
- **Snapshot** — Immutable versioning entry (Cmd+S). Captures full CV state + command log since previous snapshot.
- **Command** — Named, reversible state mutation. Powers undo/redo and human-readable action history.

## Documents

| Document | Description |
|----------|-------------|
| [Foundational Types](./foundational-types.md) | Locale, Translatable, EntityId, dates, BlobReference, CropData |
| [Profile](./profile.md) | Profile, SocialLink, ProfileMeta |
| [CV Document](./cv-document.md) | CvDocument, PageFormat |
| [Sections](./sections.md) | All 11 section types, SectionBase, Section union |
| [Themes](./themes.md) | ThemeDefinition, layouts, fonts, icons, overrides |
| [Versioning](./versioning.md) | Command, Snapshot, WorkingState |
| [Settings](./settings.md) | AppSettings, ShortcutBinding, PruningConfig, StoredBlob |
| [Database](./database.md) | Dexie.js schema, indexes, migration strategy |
| [Validation](./validation.md) | Required/optional field rules per section type |
| [Relationships](./relationships.md) | ER diagram and relationship summary |

## See Also

- [Architecture](../architecture/) — Project structure, state management, rendering pipeline
- [Project Plan](../../.claude/plans/) — User stories, prioritization, roadmap
