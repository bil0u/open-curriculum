import type {
  PageFormat,
  ThemeDefinition,
  ThemeOverrideData,
  ThemeFont,
} from "@/lib/types";
import { getPageDimensionsCss, PAGE_GAP_PX } from "@/lib/utils";

const CSS_RESET = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
ul, ol { list-style: none; }
`;

/**
 * Shared page break hints applied to all themes.
 * These use standard CV class names and ensure Paged.js
 * can fragment content cleanly across pages.
 */
const PAGE_BREAK_CSS = `
.cv-section__title {
  break-after: avoid;
}

.cv-item,
.cv-project,
.cv-reference,
.cv-cert-item,
.cv-award-item,
.cv-pub-item,
.cv-skills-category,
.cv-language-item,
.cv-interests-category {
  break-inside: avoid;
}

.cv-item__description,
.cv-item__highlights,
.cv-freeform {
  orphans: 2;
  widows: 2;
}
`;

/**
 * Preview-only chrome: visual page separation (shadows, gaps).
 * Not included in export output.
 */
function buildPreviewChromeCss(): string {
  return `
.pagedjs_page {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  margin-block-end: ${PAGE_GAP_PX}px;
  background: #ffffff;
}
.pagedjs_page:last-child {
  margin-block-end: 0;
}
`;
}

function buildPageRules(pageFormat: PageFormat): string {
  const { width, height } = getPageDimensionsCss(pageFormat);
  return `@page { size: ${width} ${height}; margin: 0; }`;
}

/**
 * Assembles the complete CSS for rendering a CV inside the iframe.
 * Layers: reset → @page rules → page breaks → preview chrome → fonts → theme CSS → user overrides.
 */
export function assembleCss(
  theme: ThemeDefinition,
  overrides?: ThemeOverrideData,
  pageFormat?: PageFormat,
): string {
  const parts: string[] = [CSS_RESET];

  if (pageFormat) {
    parts.push(buildPageRules(pageFormat));
  }

  parts.push(PAGE_BREAK_CSS);
  parts.push(buildPreviewChromeCss());
  parts.push(buildFontFaceRules(theme.fonts));

  // Trust boundary: only bundled themes are allowed; validate source URLs before accepting user-supplied themes
  if (theme.iconLibrary?.type === "cdn") {
    parts.push(`@import url('${theme.iconLibrary.source}');`);
  }

  parts.push(theme.css);

  if (overrides?.simpleOverrides) {
    const overrideCss = Object.entries(overrides.simpleOverrides)
      .map(([prop, value]) => `  ${prop}: ${value};`)
      .join("\n");
    if (overrideCss) {
      parts.push(`:root {\n${overrideCss}\n}`);
    }
  }

  if (overrides?.rawCss) {
    parts.push(overrides.rawCss);
  }

  return parts.filter(Boolean).join("\n\n");
}

function buildFontFaceRules(fonts: ThemeFont[]): string {
  return fonts
    .filter((font) => font.url)
    .map((font) => `@import url('${font.url}');`)
    .join("\n");
}
