import { useEffect, useState, type RefObject } from "react";

/**
 * Computes a CSS scale factor so a fixed-dimension page
 * fits within the available container space.
 */
export function usePreviewScale(
  containerRef: RefObject<HTMLDivElement | null>,
  pageWidthMm: number,
  pageHeightMm: number,
): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pageWidthPx = mmToPx(pageWidthMm);
    const pageHeightPx = mmToPx(pageHeightMm);

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width: availableWidth, height: availableHeight } =
        entry.contentRect;

      const scaleX = availableWidth / pageWidthPx;
      const scaleY = availableHeight / pageHeightPx;
      setScale(Math.min(scaleX, scaleY, 1));
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, pageWidthMm, pageHeightMm]);

  return scale;
}

export function mmToPx(mm: number): number {
  return mm * (96 / 25.4);
}
