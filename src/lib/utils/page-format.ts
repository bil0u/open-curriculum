import type { PageFormat } from "@/lib/types";

export interface PageDimensionsMm {
  widthMm: number;
  heightMm: number;
}

const PREDEFINED_DIMENSIONS: Record<string, PageDimensionsMm> = {
  A4: { widthMm: 210, heightMm: 297 },
  Letter: { widthMm: 215.9, heightMm: 279.4 },
};

const DEFAULT_DIMENSIONS: PageDimensionsMm = { widthMm: 210, heightMm: 297 };

/**
 * Resolves a PageFormat to numeric millimetre dimensions.
 */
export function getPageDimensions(format: PageFormat): PageDimensionsMm {
  if (typeof format === "string") {
    return PREDEFINED_DIMENSIONS[format] ?? DEFAULT_DIMENSIONS;
  }
  return { widthMm: format.widthMm, heightMm: format.heightMm };
}

/**
 * Resolves a PageFormat to CSS dimension strings (e.g. "210mm").
 */
export function getPageDimensionsCss(
  format: PageFormat,
): { width: string; height: string } {
  const { widthMm, heightMm } = getPageDimensions(format);
  return { width: `${widthMm}mm`, height: `${heightMm}mm` };
}

/** Gap between pages in pixels (at 1:1 scale), used by both CSS and layout. */
export const PAGE_GAP_PX = 24;
