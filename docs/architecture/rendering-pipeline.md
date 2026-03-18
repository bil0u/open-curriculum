# Theme Rendering Pipeline

The pipeline transforms CV data into a rendered, paginated document. The same pipeline is used for both live preview and export, ensuring visual fidelity.

## Pipeline Overview

The pipeline has three core parts:

1. **Core Render** — pure function: `(cvData, theme, overrides, locale) → { html, css }`
2. **Preview Renderer** — injects html+css into an iframe, runs Paged.js, scales to viewport
3. **Exporters** — separate utilities for PDF (`iframe.contentWindow.print()`) and standalone HTML

```
CV Data (Zustand)  +  ThemeDefinition  +  ThemeOverride  +  Locale
                                  |
                                  v
              [1] Core Render: LiquidJS + CSS assembly
                                  |
                          { html, css }
                         /              \
                        v                v
          [2] Preview Renderer      [3] Exporters
          iframe @ A4 dimensions    PDF: iframe.contentWindow.print()
          Paged.js pagination       HTML: standalone file with inlined CSS
          CSS scale() for viewport
```

---

## Part 1: Core Render

The core render function is a pure transformation. It has no side effects and no DOM dependency — it only returns strings.

### Template Compilation

LiquidJS compiles layout and partial templates using a custom filesystem adapter that resolves partials from `ThemeDefinition.templates`. Templates receive a locale-resolved, nil-safe data context (missing fields become `""` or `[]`).

```typescript
async function renderCvHtml(
  theme: ThemeDefinition,
  cvData: CvRenderContext,
  locale: Locale
): Promise<string> {
  const engine = new Liquid({
    cache: true,
    strictFilters: true,
    strictVariables: false,
    fs: buildThemeFsAdapter(theme.templates), // resolves partials from ThemeDefinition
  });

  engine.registerFilter('format_date', (dateStr: string, format: string) =>
    formatDate(dateStr, format, locale)
  );
  engine.registerFilter('markdown', (text: string) =>
    renderMarkdownSafe(text) // marked + DOMPurify
  );

  return engine.renderFile('layout', {
    profile: cvData.profile,
    sections: cvData.sections,
    locale,
    theme: cvData.themeConfig,
  });
}
```

The custom fs adapter resolves partials by section type. If a partial named `experience.liquid` is not found in `ThemeDefinition.templates`, it falls back to `_default.liquid` with a console warning.

Example layout template using partials:

```liquid
<header class="cv-header">
  <h1>{{ profile.name | default: "" }}</h1>
  <p class="cv-title">{{ profile.title | default: "" }}</p>
</header>

{% for section in sections %}
  <section class="cv-section cv-section--{{ section.type }}">
    <h2>{{ section.title }}</h2>
    {% render section.type, section: section %}
  </section>
{% endfor %}
```

### CSS Assembly

The final stylesheet is composed from three layers, applied in order:

1. **Minimal CSS reset** — provided by the engine before all theme styles
2. **Base theme CSS** (`styles/base.css`) — layout, typography, structure
3. **Theme variables** (`styles/variables.css`) — CSS custom properties with `--cv-` prefix on `:root`
4. **User overrides** (from `ThemeOverride.simpleOverrides`) — injected as a `:root` block

```typescript
function assembleCss(theme: ThemeDefinition, overrides: Record<string, string>): string {
  const overrideCss = Object.entries(overrides)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join('\n');

  return `
    ${CSS_RESET}
    ${theme.baseCSS}
    ${theme.variablesCSS}
    :root {
${overrideCss}
    }
  `;
}
```

Theme variables use the `--cv-` prefix and `:root`:

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

## Part 2: Preview Renderer

The preview renderer injects the compiled `{ html, css }` into a sandboxed `<iframe>`. Paged.js runs inside the iframe's `document.body`. Font loading uses standard `<link>` / `@font-face` in the iframe `<head>`.

The iframe is fixed at A4 dimensions (210mm × 297mm). A `ResizeObserver` on the surrounding container calculates a CSS `transform: scale()` to fit the iframe within the available viewport.

```typescript
function PreviewFrame({ html, css, fonts }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    const fontLinks = fonts
      .filter((f) => f.url)
      .map((f) => `<link rel="stylesheet" href="${f.url}">`)
      .join('\n');

    doc.open();
    doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${fontLinks}
  <style>${css}</style>
</head>
<body>
  ${html}
</body>
</html>`);
    doc.close();

    // Run Paged.js inside the iframe
    const Previewer = iframeRef.current!.contentWindow!.Paged.Previewer;
    new Previewer().preview();
  }, [html, css, fonts]);

  return (
    <div className="preview-scaler" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
      <iframe
        ref={iframeRef}
        sandbox="allow-same-origin allow-scripts"
        style={{ width: '210mm', height: '297mm', border: 'none' }}
      />
    </div>
  );
}
```

### Viewport Scaling

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

### Paged.js

Paged.js is a W3C Paged Media polyfill. It runs inside the iframe and automatically fragments content into pages with proper page breaks, headers, footers, and page counters. Because it runs in a real document context inside the iframe, `:root` works naturally and `@page` rules are respected.

Themes hint at page break behavior via CSS:

```css
.cv-section {
  break-inside: avoid;
}

.cv-section-item {
  break-inside: avoid;
}
```

---

## Part 3: Exporters

### PDF Export

PDF export calls `print()` on the iframe's window directly. This avoids printing the host app chrome and uses `@media print` styles active within the iframe.

```typescript
async function exportPdf(iframeRef: RefObject<HTMLIFrameElement>): Promise<void> {
  iframeRef.current?.contentWindow?.print();
}
```

```css
/* Inside the iframe — @media print */
@media print {
  @page {
    size: A4;
    margin: 0; /* Theme controls its own margins */
  }
}
```

### HTML Export

Serialize the rendered CV into a standalone HTML file with all CSS inlined.

```typescript
async function exportHtml(
  html: string,
  css: string,
  theme: ThemeDefinition,
  locale: Locale,
  profileName: string
): Promise<string> {
  const sanitizedHtml = DOMPurify.sanitize(html, {
    FORBID_TAGS: ['script'],
  });

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
