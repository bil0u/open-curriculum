import DOMPurify from "dompurify";

import type {
  CvDocument,
  Locale,
  Profile,
  ThemeDefinition,
} from "@/lib/types";

import { assembleCss } from "./css";
import { buildRenderContext, type CvRenderContext } from "./context";
import { createLiquidEngine } from "./engine";
import { registerFilters } from "./filters";

export interface RenderResult {
  html: string;
  css: string;
  context: CvRenderContext;
}

/**
 * Core render function: transforms CV data + theme into sanitized HTML + assembled CSS.
 * This is stage 1 of the pipeline — pure data transformation, no DOM.
 */
export async function renderCv(
  doc: CvDocument,
  profile: Profile | null,
  theme: ThemeDefinition,
  locale: Locale,
): Promise<RenderResult> {
  const context = buildRenderContext(doc, profile, locale, {
    name: theme.name,
    version: theme.version,
  });

  const engine = createLiquidEngine(theme);
  registerFilters(engine, locale);

  const layoutId = doc.selectedLayoutId ?? theme.defaultLayoutId;
  const layout = theme.layouts.find((l) => l.id === layoutId);
  const layoutTemplate = layout?.template ?? "layout";

  const templateSource = theme.templates[layoutTemplate];
  if (!templateSource) {
    throw new Error(`Layout template not found: ${layoutTemplate}`);
  }

  const rawHtml = await engine.parseAndRender(templateSource, context);

  const html = DOMPurify.sanitize(rawHtml, {
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  });

  const css = assembleCss(theme, doc.themeOverrides);

  return { html, css, context };
}
