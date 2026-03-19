import { Liquid } from "liquidjs";

import { registerFilters } from "./filters";

function makeEngine(locale = "en") {
  const engine = new Liquid();
  registerFilters(engine, locale);
  return engine;
}

async function render(engine: Liquid, template: string, ctx: Record<string, unknown> = {}) {
  return engine.parseAndRender(template, ctx);
}

describe("format_date filter", () => {
  const engine = makeEngine("en");

  it("returns empty string for null/undefined value", async () => {
    expect(await render(engine, "{{ val | format_date }}", { val: null })).toBe("");
  });

  it("returns empty string for empty string value", async () => {
    expect(await render(engine, "{{ val | format_date }}", { val: "" })).toBe("");
  });

  it("formats a valid ISO date with pattern 'yyyy' to the year", async () => {
    const result = await render(engine, '{{ val | format_date: "yyyy" }}', { val: "2023-06-15" });
    expect(result).toBe("2023");
  });

  it("formats a valid ISO date with pattern 'MMM yyyy'", async () => {
    const result = await render(engine, '{{ val | format_date: "MMM yyyy" }}', { val: "2023-06-15" });
    expect(result).toContain("2023");
    // Month should be abbreviated
    expect(result.length).toBeGreaterThan(4);
  });

  it("returns fallback when value is empty", async () => {
    const result = await render(engine, '{{ val | format_date: "yyyy", "Present" }}', { val: "" });
    expect(result).toBe("Present");
  });

  it("returns fallback for invalid date string", async () => {
    const result = await render(engine, '{{ val | format_date: "yyyy", "N/A" }}', { val: "not-a-date" });
    expect(result).toBe("N/A");
  });

  it("returns the raw string as fallback when no fallback arg and date is invalid", async () => {
    const result = await render(engine, '{{ val | format_date: "yyyy" }}', { val: "not-a-date" });
    expect(result).toBe("not-a-date");
  });
});

describe("markdown filter", () => {
  const engine = makeEngine("en");

  it("returns empty string for empty value", async () => {
    expect(await render(engine, "{{ val | markdown }}", { val: "" })).toBe("");
  });

  it("returns empty string for null value", async () => {
    expect(await render(engine, "{{ val | markdown }}", { val: null })).toBe("");
  });

  it("converts bold markdown to <strong>", async () => {
    const result = await render(engine, "{{ val | markdown }}", { val: "**bold**" });
    expect(result).toContain("<strong>");
  });

  it("shifts h1 headings to h3", async () => {
    const result = await render(engine, "{{ val | markdown }}", { val: "# Heading" });
    expect(result).toContain("<h3>");
    expect(result).not.toContain("<h1>");
  });

  it("shifts h2 headings to h4", async () => {
    const result = await render(engine, "{{ val | markdown }}", { val: "## Subheading" });
    expect(result).toContain("<h4>");
    expect(result).not.toContain("<h2>");
  });

  it("sanitizes script tags from markdown output", async () => {
    const result = await render(engine, "{{ val | markdown }}", {
      val: 'text <script>alert("xss")</script>',
    });
    expect(result).not.toContain("<script>");
  });
});

describe("strip_protocol filter", () => {
  const engine = makeEngine("en");

  it("strips https:// prefix", async () => {
    const result = await render(engine, "{{ val | strip_protocol }}", { val: "https://example.com" });
    expect(result).toBe("example.com");
  });

  it("strips http:// prefix", async () => {
    const result = await render(engine, "{{ val | strip_protocol }}", { val: "http://foo.bar" });
    expect(result).toBe("foo.bar");
  });

  it("returns the value unchanged when no protocol present", async () => {
    const result = await render(engine, "{{ val | strip_protocol }}", { val: "example.com" });
    expect(result).toBe("example.com");
  });

  it("returns empty string for null", async () => {
    const result = await render(engine, "{{ val | strip_protocol }}", { val: null });
    expect(result).toBe("");
  });

  it("returns empty string for undefined", async () => {
    const result = await render(engine, "{{ val | strip_protocol }}", {});
    expect(result).toBe("");
  });
});

describe("initials filter", () => {
  const engine = makeEngine("en");

  it("extracts initials from a full name", async () => {
    const result = await render(engine, "{{ val | initials }}", { val: "John Doe" });
    expect(result).toBe("JD");
  });

  it("returns single initial for single word", async () => {
    const result = await render(engine, "{{ val | initials }}", { val: "Alice" });
    expect(result).toBe("A");
  });

  it("handles extra whitespace", async () => {
    const result = await render(engine, "{{ val | initials }}", { val: "  bob  smith  " });
    expect(result).toBe("BS");
  });

  it("returns empty string for empty value", async () => {
    const result = await render(engine, "{{ val | initials }}", { val: "" });
    expect(result).toBe("");
  });

  it("uppercases all initials", async () => {
    const result = await render(engine, "{{ val | initials }}", { val: "john doe" });
    expect(result).toBe("JD");
  });
});

describe("phone_href filter", () => {
  const engine = makeEngine("en");

  it("converts a formatted phone number to a tel URI", async () => {
    const result = await render(engine, "{{ val | phone_href }}", { val: "+1 (555) 123-4567" });
    expect(result).toBe("tel:+15551234567");
  });

  it("wraps a plain number in tel:", async () => {
    const result = await render(engine, "{{ val | phone_href }}", { val: "0123456789" });
    expect(result).toBe("tel:0123456789");
  });

  it("returns 'tel:' for empty string", async () => {
    const result = await render(engine, "{{ val | phone_href }}", { val: "" });
    expect(result).toBe("tel:");
  });

  it("strips spaces, dashes, dots, and parentheses", async () => {
    const result = await render(engine, "{{ val | phone_href }}", { val: "06 84.43-36(03)" });
    expect(result).toBe("tel:0684433603");
  });
});
