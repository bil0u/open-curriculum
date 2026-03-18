import type { ThemeDefinition, ThemeOverrideData, ThemeFont } from "@/lib/types";

const CSS_RESET = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
ul, ol { list-style: none; }
`;

/**
 * Assembles the complete CSS for rendering a CV inside the iframe.
 * Layers: reset → font-face declarations → theme CSS → user overrides.
 */
export function assembleCss(
  theme: ThemeDefinition,
  overrides?: ThemeOverrideData,
): string {
  const parts: string[] = [CSS_RESET];

  parts.push(buildFontFaceRules(theme.fonts));
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
