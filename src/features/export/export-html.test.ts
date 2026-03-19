import type { RenderResult } from "@/lib/template-engine";

import { exportHtml } from "./export-html";

function makeRenderResult(overrides: Partial<RenderResult> = {}): RenderResult {
  return {
    html: "<div>CV content here</div>",
    css: "body { font-family: sans-serif; }",
    context: {
      locale: "en",
      cv: { name: "Test CV" },
      page: { format: "A4", width: "210mm", height: "297mm" },
      profile: { name: "Test" },
      sections: [],
      slots: {},
      theme: { name: "Test Theme", version: "1.0.0" },
    } as unknown as RenderResult["context"],
    ...overrides,
  };
}

describe("exportHtml", () => {
  it("returns a string starting with <!DOCTYPE html>", () => {
    const result = exportHtml(makeRenderResult(), "John Doe");
    expect(result).toMatch(/^<!DOCTYPE html>/);
  });

  it("includes the locale in the html lang attribute", () => {
    const result = exportHtml(
      makeRenderResult({ context: { locale: "fr" } as unknown as RenderResult["context"] }),
      "Jean Dupont",
    );
    expect(result).toContain('<html lang="fr">');
  });

  it("includes the profile name in the title", () => {
    const result = exportHtml(makeRenderResult(), "John Doe");
    expect(result).toContain("<title>John Doe - CV</title>");
  });

  it("includes the CSS inside a <style> tag", () => {
    const css = "body { color: navy; }";
    const result = exportHtml(makeRenderResult({ css }), "Test");
    expect(result).toContain("<style>");
    expect(result).toContain(css);
  });

  it("includes the HTML body content", () => {
    const html = "<div>My CV body</div>";
    const result = exportHtml(makeRenderResult({ html }), "Test");
    expect(result).toContain(html);
  });

  it("escapes & and < in the profile name in the title", () => {
    const result = exportHtml(makeRenderResult(), "A & <B>");
    expect(result).toContain("A &amp; &lt;B&gt;");
  });

  it("escapes double quotes in the profile name in the title", () => {
    const result = exportHtml(makeRenderResult(), '"quoted"');
    expect(result).toContain("&quot;quoted&quot;");
  });
});
