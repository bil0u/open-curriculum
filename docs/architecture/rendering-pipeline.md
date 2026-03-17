# Theme Rendering Pipeline

The pipeline transforms CV data into a rendered, paginated document. The same pipeline is used for both live preview and export, ensuring visual fidelity.

## Pipeline Overview

```
CV Data (Zustand)
  |
  v
[1] LiquidJS compiles theme template with CV data context
  |
  v
HTML string
  |
  v
[2] Base theme CSS + custom property overrides assembled
  |
  v
[3] HTML + CSS injected into Shadow DOM container
  |
  v
[4] Fixed-dimension wrapper applies A4 sizing + viewport scaling
  |
  v
[5] Paged.js processes content for pagination
  |
  v
Rendered pages (preview) or print output (PDF export)
```

---

## Stage 1: Template Compilation

LiquidJS receives the full CV data object as its rendering context. Theme templates use Liquid syntax to iterate sections, apply conditionals, and format data.

```typescript
import { Liquid } from 'liquidjs';

const engine = new Liquid({
  cache: true,                        // Cache parsed templates
  strictFilters: true,                // Error on unknown filters
  strictVariables: false,             // Graceful handling of missing data
  globals: {},
});

// Register custom filters for CV-specific formatting
engine.registerFilter('format_date', (dateStr: string, format: string) => {
  return formatDate(dateStr, format); // Locale-aware date formatting
});

engine.registerFilter('markdown', (text: string) => {
  return renderMarkdownSafe(text);    // marked + DOMPurify
});

// Render function
async function renderCvHtml(
  theme: Theme,
  cvData: CvRenderContext
): Promise<string> {
  const template = await engine.parseAndRender(theme.template, {
    profile: cvData.profile,
    sections: cvData.sections,
    locale: cvData.locale,
    theme: cvData.themeConfig,
  });
  return template;
}
```

Example theme template snippet:

```liquid
<header class="cv-header">
  <h1>{{ profile.name | default: "" }}</h1>
  <p class="cv-title">{{ profile.title | default: "" }}</p>
</header>

{% for section in sections %}
  <section class="cv-section cv-section--{{ section.type }}">
    <h2>{{ section.label }}</h2>
    {% render section.type, items: section.items %}
  </section>
{% endfor %}
```

---

## Stage 2: CSS Assembly

The final stylesheet is composed from three layers, in specificity order:

1. **Base theme CSS** (`themes/<id>/styles/base.css`) -- layout, typography, structure
2. **Theme variables** (`themes/<id>/styles/variables.css`) -- CSS custom properties defining the theme's defaults
3. **User overrides** (from `useThemeStore.overrides`) -- injected as a `<style>` block that redefines custom properties

```typescript
function assembleCss(theme: Theme, overrides: Record<string, string>): string {
  const overrideCss = Object.entries(overrides)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join('\n');

  return `
    ${theme.baseCSS}
    ${theme.variablesCSS}
    :host {
${overrideCss}
    }
  `;
}
```

Themes define their overridable properties with clear naming:

```css
/* variables.css */
:root {
  --cv-primary-color: #1a1a1a;
  --cv-accent-color: #2563eb;
  --cv-font-family-heading: 'Inter', sans-serif;
  --cv-font-family-body: 'Inter', sans-serif;
  --cv-font-size-base: 10pt;
  --cv-margin-page: 20mm;
  --cv-spacing-section: 1.5em;
}
```

---

## Stage 3: Shadow DOM Rendering

**Decision: Shadow DOM over sandboxed iframe.**

Trade-offs considered:

| Concern | Shadow DOM | Sandboxed iframe |
|---------|-----------|-----------------|
| CSS isolation | Full -- Shadow DOM encapsulates styles in both directions | Full -- iframe is a separate document |
| Script isolation | Partial -- shares JS context with host | Full -- `sandbox` attribute blocks scripts |
| DOM access | Direct -- host can query shadow root | Indirect -- requires `contentDocument` or `postMessage` |
| Performance | Better -- no separate document, no cross-frame overhead | Heavier -- separate browsing context |
| Print integration | Easier -- shadow root content participates in host print flow | Harder -- requires printing iframe content separately |
| Paged.js integration | Straightforward -- Paged.js operates on the shadow root's DOM | Requires running Paged.js inside the iframe |

**Shadow DOM wins** because:
- Print flow integration with `window.print()` is simpler and more reliable.
- Paged.js can operate directly on the DOM without cross-frame messaging.
- Performance is better for real-time preview updates.
- Theme security is achieved through HTML sanitization (DOMPurify) and CSS-only templates (no `<script>` allowed). LiquidJS is sandboxed by design.

```typescript
function PreviewFrame({ html, css }: { html: string; css: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    if (hostRef.current && !shadowRef.current) {
      shadowRef.current = hostRef.current.attachShadow({ mode: 'open' });
    }
  }, []);

  useEffect(() => {
    if (!shadowRef.current) return;

    const sanitizedHtml = DOMPurify.sanitize(html, {
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick'],
    });

    shadowRef.current.innerHTML = `
      <style>${css}</style>
      <div class="cv-document">${sanitizedHtml}</div>
    `;
  }, [html, css]);

  return <div ref={hostRef} className="preview-host" />;
}
```

---

## Stage 4: Fixed-Dimension Container with CSS Scaling

The CV is rendered at its actual print dimensions (e.g., A4 = 210mm x 297mm). The preview viewport scales this container to fit the available screen space using a CSS `transform: scale()`.

```typescript
function usePreviewScale(
  containerRef: RefObject<HTMLDivElement>,
  pageFormat: PageFormat
): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width: availableWidth, height: availableHeight } = entry.contentRect;
      const pageWidthPx = mmToPx(parseFloat(pageFormat.width));
      const pageHeightPx = mmToPx(parseFloat(pageFormat.height));

      const scaleX = availableWidth / pageWidthPx;
      const scaleY = availableHeight / pageHeightPx;
      setScale(Math.min(scaleX, scaleY, 1)); // Never scale above 1:1
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [pageFormat]);

  return scale;
}
```

```css
.cv-page-container {
  width: 210mm;
  height: 297mm;
  transform-origin: top left;
  /* scale applied via inline style from usePreviewScale */
}
```

---

## Stage 5: Paged.js Pagination

Paged.js is a W3C Paged Media polyfill. It processes the rendered HTML and automatically fragments content into pages with proper page breaks, headers, footers, and page counters.

```typescript
import { Previewer } from 'pagedjs';

async function paginateContent(shadowRoot: ShadowRoot): Promise<void> {
  const previewer = new Previewer();
  const content = shadowRoot.querySelector('.cv-document');
  if (!content) return;

  await previewer.preview(
    content.innerHTML,
    [/* stylesheets already in shadow root */],
    shadowRoot.querySelector('.cv-pages-container') as HTMLElement
  );
}
```

Themes can hint at page break behavior via CSS:

```css
.cv-section {
  break-inside: avoid;    /* Prefer keeping sections together */
}

.cv-section-item {
  break-inside: avoid;    /* Never split an experience entry mid-page */
}
```

---

## Stage 6: PDF Export

PDF export reuses the exact same rendered output via `window.print()` with a print-specific stylesheet.

```typescript
async function exportPdf(): Promise<void> {
  // Trigger browser print dialog with @media print styles active
  window.print();
}
```

```css
/* print.css */
@media print {
  /* Hide app chrome */
  body > *:not(.print-target) {
    display: none !important;
  }

  .print-target {
    position: static;
    width: auto;
    transform: none !important;  /* Remove preview scaling */
  }

  @page {
    size: A4;
    margin: 0;  /* Theme controls its own margins */
  }
}
```

---

## Stage 7: HTML Export

Serialize the rendered CV into a standalone HTML file with all CSS inlined.

```typescript
async function exportHtml(
  html: string,
  css: string,
  theme: Theme
): Promise<string> {
  const sanitizedHtml = DOMPurify.sanitize(html, {
    FORBID_TAGS: ['script'],
  });

  // Inline any external fonts referenced in the theme
  const inlinedCss = await inlineExternalResources(css, theme);

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${profileName} - CV</title>
  <style>${inlinedCss}</style>
</head>
<body>
  ${sanitizedHtml}
</body>
</html>`;
}
```
