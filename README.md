# CV Genius

> Build beautiful, professional resumes — entirely in your browser.

CV Genius is a **free, open-source CV/resume builder** that runs 100% client-side. No accounts, no servers, no data collection. Your data stays in your browser, under your control.

## Features

- **Flexible editor** — Dynamic form with predefined section types (experience, education, skills...) and freeform markdown sections. Drag & drop reordering.
- **Real-time preview** — See your CV update live as you type, in a pixel-accurate A4/Letter view.
- **Themeable** — Choose from built-in themes or customize colors, fonts, and layout. Import/export themes to share with the community.
- **Multilingual** — Manage translations for every field. Switch languages instantly and export in any locale.
- **PDF & HTML export** — Export as PDF (via browser print) or as a standalone HTML file you can host anywhere.
- **Version history** — Undo/redo, auto-save, manual snapshots (Cmd+S), and named tags. Never lose your work.
- **Offline-first** — Works without internet. All data stored locally in your browser (IndexedDB).
- **Accessible** — WCAG 2.1 AA compliant. Full keyboard navigation, screen reader support.
- **AI assistant** *(coming soon)* — Bring your own API key for rephrasing suggestions, ATS optimization, translation help, and cover letter guidance.

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd cv-genius

# Install dependencies
bun install

# Start development server
bun dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React + TypeScript + Vite |
| Runtime/PM | Bun |
| State | Zustand + Zundo |
| Storage | Dexie.js (IndexedDB) |
| Templates | LiquidJS |
| PDF/Pagination | Paged.js |
| Styling | Tailwind CSS v4 (app) + CSS custom properties (themes) |
| Drag & Drop | dnd-kit |
| Accessibility | React Aria |
| Testing | Vitest + Playwright |

## Documentation

- [Architecture](docs/architecture/) — Project structure, rendering pipeline, state management, coding conventions
- [Data Model](docs/data-model/) — TypeScript interfaces, database schema, validation, relationships
- [Project Plan](.claude/plans/) — User stories, prioritization, roadmap

## Contributing

Contributions are welcome! Please read the architecture and data model docs before starting.

This project follows WCAG 2.1 AA accessibility standards. All UI interactions must have keyboard alternatives and proper ARIA labels.

## License

[AGPL-3.0](LICENSE) — Free and open source forever. All derivative works must remain open source.

---

Made with care by the CV Genius contributors
