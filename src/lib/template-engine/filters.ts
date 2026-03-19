import DOMPurify from "dompurify";
import type { Liquid } from "liquidjs";
import { Marked } from "marked";

/**
 * Marked instance with heading-level shift.
 * h1→h3, h2→h4, etc. — h1/h2 are reserved for CV document structure
 * (profile name and section titles), so user content starts at h3.
 */
const cvMarked = new Marked({
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      const shifted = Math.min(depth + 2, 6);
      return `<h${shifted}>${text}</h${shifted}>\n`;
    },
  },
});

/**
 * Registers all CV-specific custom filters on a LiquidJS engine.
 */
export function registerFilters(engine: Liquid, locale: string): void {
  engine.registerFilter("format_date", formatDate(locale));
  engine.registerFilter("markdown", renderMarkdown);
  engine.registerFilter("strip_protocol", stripProtocol);
  engine.registerFilter("initials", extractInitials);
  engine.registerFilter("phone_href", phoneHref);
}

/**
 * Formats an ISO date string using Intl.DateTimeFormat.
 * Supports patterns: "yyyy", "MMM yyyy", "MMMM yyyy", "MMM dd, yyyy", etc.
 * Returns the fallback string if the value is empty/nil.
 */
function formatDate(locale: string) {
  const formatterCache = new Map<string, Intl.DateTimeFormat>();

  return (value: unknown, pattern?: string, fallback?: string): string => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return fallback ?? "";
    }

    const dateStr = String(value);
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return fallback ?? dateStr;
    }

    const fmt = pattern ?? "MMM yyyy";

    let formatter = formatterCache.get(fmt);
    if (!formatter) {
      const options: Intl.DateTimeFormatOptions = {};
      if (fmt.includes("dd")) options.day = "2-digit";
      if (fmt.includes("MMMM")) options.month = "long";
      else if (fmt.includes("MMM")) options.month = "short";
      else if (fmt.includes("MM")) options.month = "2-digit";
      if (fmt.includes("yyyy")) options.year = "numeric";
      formatter = new Intl.DateTimeFormat(locale, options);
      formatterCache.set(fmt, formatter);
    }

    return formatter.format(date);
  };
}

/**
 * Renders Markdown to sanitized HTML.
 */
function renderMarkdown(value: unknown): string {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return "";
  }
  const html = cvMarked.parse(String(value), { async: false }) as string;
  return DOMPurify.sanitize(html, {
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "style"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  });
}

/**
 * Removes protocol prefix from URLs for cleaner display.
 */
function stripProtocol(value: unknown): string {
  return String(value ?? "").replace(/^https?:\/\//, "");
}

/**
 * Extracts initials from a name string.
 */
function extractInitials(value: unknown): string {
  return String(value ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

/**
 * Converts a phone number to a tel: URI.
 */
function phoneHref(value: unknown): string {
  const cleaned = String(value ?? "").replace(/[\s\-().]/g, "");
  return `tel:${cleaned}`;
}
