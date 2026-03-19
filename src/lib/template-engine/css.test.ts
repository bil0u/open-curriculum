import type { ThemeDefinition } from "@/lib/types";

import { assembleCss } from "./css";

const minimalTheme: ThemeDefinition = {
  id: "test-theme",
  name: "Test Theme",
  description: "",
  author: "Test",
  version: "1.0.0",
  layouts: [],
  defaultLayoutId: "default",
  css: ".cv-document { color: black; }",
  templates: {},
  fonts: [],
  customizableProperties: [],
};

describe("assembleCss", () => {
  it("always includes the CSS reset (box-sizing: border-box)", () => {
    const result = assembleCss(minimalTheme);
    expect(result).toContain("box-sizing: border-box");
  });

  it("includes the theme CSS", () => {
    const result = assembleCss(minimalTheme);
    expect(result).toContain(".cv-document { color: black; }");
  });

  it("includes @page rule with A4 dimensions when pageFormat is 'A4'", () => {
    const result = assembleCss(minimalTheme, undefined, "A4");
    expect(result).toContain("@page");
    expect(result).toContain("210mm");
    expect(result).toContain("297mm");
  });

  it("includes @page rule with Letter dimensions when pageFormat is 'Letter'", () => {
    const result = assembleCss(minimalTheme, undefined, "Letter");
    expect(result).toContain("@page");
    expect(result).toContain("215.9mm");
  });

  it("does not include @page rule when pageFormat is omitted", () => {
    const result = assembleCss(minimalTheme);
    expect(result).not.toContain("@page");
  });

  it("includes :root block with simpleOverrides", () => {
    const result = assembleCss(minimalTheme, { simpleOverrides: { "--cv-color": "#fff" } });
    expect(result).toContain(":root");
    expect(result).toContain("--cv-color: #fff");
  });

  it("includes rawCss when provided", () => {
    const result = assembleCss(minimalTheme, { simpleOverrides: {}, rawCss: "body { color: red; }" });
    expect(result).toContain("body { color: red; }");
  });

  it("includes @import for font URLs", () => {
    const themeWithFonts: ThemeDefinition = {
      ...minimalTheme,
      fonts: [
        { family: "Inter", weights: [400], styles: ["normal"], url: "https://fonts.googleapis.com/css2?family=Inter" },
      ],
    };
    const result = assembleCss(themeWithFonts);
    expect(result).toContain("@import url('https://fonts.googleapis.com/css2?family=Inter')");
  });

  it("does not include font @import when font has no url", () => {
    const themeWithNoUrlFont: ThemeDefinition = {
      ...minimalTheme,
      fonts: [{ family: "LocalFont", weights: [400], styles: ["normal"] }],
    };
    const result = assembleCss(themeWithNoUrlFont);
    // Should not have a broken @import
    expect(result).not.toContain("@import url('undefined')");
  });

  it("includes CDN icon library @import when iconLibrary type is cdn", () => {
    const themeWithIcons: ThemeDefinition = {
      ...minimalTheme,
      iconLibrary: {
        type: "cdn",
        source: "https://cdn.example.com/icons.css",
        name: "Icons",
      },
    };
    const result = assembleCss(themeWithIcons);
    expect(result).toContain("@import url('https://cdn.example.com/icons.css')");
  });

  it("places CSS reset before the theme CSS", () => {
    const result = assembleCss(minimalTheme);
    const resetIndex = result.indexOf("box-sizing: border-box");
    const themeIndex = result.indexOf(".cv-document { color: black; }");
    expect(resetIndex).toBeLessThan(themeIndex);
  });

  it("places rawCss after theme CSS", () => {
    const raw = "body { margin: 0; }";
    const result = assembleCss(minimalTheme, { simpleOverrides: {}, rawCss: raw });
    const themeIndex = result.indexOf(minimalTheme.css);
    const rawIndex = result.indexOf(raw);
    expect(rawIndex).toBeGreaterThan(themeIndex);
  });
});
