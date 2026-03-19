// @vitest-environment jsdom
import type { DOMPurify } from "dompurify";
import createDOMPurify from "dompurify";
import { beforeAll, describe, expect, it } from "vitest";

const DOMPURIFY_CONFIG = {
  FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
  FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
};

let purify: DOMPurify;

beforeAll(() => {
  purify = createDOMPurify(window);
});

function sanitize(html: string): string {
  return purify.sanitize(html, DOMPURIFY_CONFIG);
}

describe("DOMPurify sanitization (TH-15)", () => {
  it("removes <script> tags", () => {
    const result = sanitize("<script>alert('xss')</script><p>hello</p>");
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("alert");
    expect(result).toContain("<p>hello</p>");
  });

  it("removes onerror event attribute from img tags", () => {
    const result = sanitize('<img onerror="alert(1)" src="x" alt="test">');
    expect(result).not.toContain("onerror");
    expect(result).toContain("<img");
    expect(result).toContain('src="x"');
  });

  it("removes <iframe> tags", () => {
    const result = sanitize('<iframe src="https://evil.com"></iframe><p>ok</p>');
    expect(result).not.toContain("<iframe");
    expect(result).toContain("<p>ok</p>");
  });

  it("removes <object> tags", () => {
    const result = sanitize('<object data="evil.swf"></object><p>ok</p>');
    expect(result).not.toContain("<object");
    expect(result).toContain("<p>ok</p>");
  });

  it("removes <embed> tags", () => {
    const result = sanitize('<embed src="evil.swf"><p>ok</p>');
    expect(result).not.toContain("<embed");
    expect(result).toContain("<p>ok</p>");
  });

  it("removes onload event attribute", () => {
    const result = sanitize(
      '<img onload="alert(1)" src="photo.jpg" alt="photo">',
    );
    expect(result).not.toContain("onload");
    expect(result).toContain("<img");
  });

  it("removes onclick event attribute", () => {
    const result = sanitize('<div onclick="evil()">click me</div>');
    expect(result).not.toContain("onclick");
    expect(result).toContain("click me");
  });

  it("removes onmouseover event attribute", () => {
    const result = sanitize('<p onmouseover="evil()">hover me</p>');
    expect(result).not.toContain("onmouseover");
    expect(result).toContain("hover me");
  });

  it("allows safe HTML elements through", () => {
    const safe = '<div><h1>Name</h1><p class="title">Engineer</p></div>';
    const result = sanitize(safe);
    expect(result).toContain("<h1>Name</h1>");
    expect(result).toContain("<p");
    expect(result).toContain("Engineer");
  });
});
