# Technical Architecture

This directory contains the technical architecture specification for CV Genius, split by concern for focused reading.

## Documents

| Document | Description |
|----------|-------------|
| [Project Structure](./project-structure.md) | Feature-based folder layout, key principles |
| [State Management](./state-management.md) | Zustand stores, command middleware, Zundo undo/redo, auto-save |
| [Rendering Pipeline](./rendering-pipeline.md) | 3-part pipeline: Core Render (LiquidJS + CSS assembly) → iframe Preview (Paged.js) → Exporters (PDF/HTML) |
| [Command Pattern](./command-pattern.md) | Command interface, factories, debouncing, registry, Zundo integration |
| [Coding Conventions](./coding-conventions.md) | File naming, components, hooks, imports, testing, error handling |

## See Also

- [Data Model](../data-model/) — TypeScript interfaces, database schema, validation
- [Project Plan](../../.claude/plans/) — User stories, prioritization, roadmap
