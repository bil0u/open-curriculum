import { useEffect, useRef } from "react";

import type { RenderResult } from "@/lib/template-engine";

import { useIframeRenderer } from "./use-iframe-renderer";
import { mmToPx, usePreviewScale } from "./use-preview-scale";

const PAGE_DIMENSIONS = {
  A4: { widthMm: 210, heightMm: 297 },
  Letter: { widthMm: 215.9, heightMm: 279.4 },
} as const;

interface PreviewPaneProps {
  renderResult: RenderResult | null;
  pageFormat?: string;
}

export function PreviewPane({
  renderResult,
  pageFormat = "A4",
}: PreviewPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { iframeRef, render } = useIframeRenderer();

  const dims =
    PAGE_DIMENSIONS[pageFormat as keyof typeof PAGE_DIMENSIONS] ??
    PAGE_DIMENSIONS.A4;

  const scale = usePreviewScale(containerRef, dims.widthMm, dims.heightMm);

  useEffect(() => {
    if (renderResult) render(renderResult);
  }, [renderResult, render]);

  const pageWidthPx = mmToPx(dims.widthMm);
  const pageHeightPx = mmToPx(dims.heightMm);

  return (
    <div
      ref={containerRef}
      className="preview-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        overflow: "auto",
        height: "100%",
        width: "100%",
        padding: "1rem",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        className="preview-page-wrapper"
        style={{
          width: pageWidthPx,
          height: pageHeightPx,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          flexShrink: 0,
        }}
      >
        <iframe
          ref={iframeRef}
          title="CV Preview"
          sandbox="allow-same-origin"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            backgroundColor: "#ffffff",
          }}
        />
      </div>
    </div>
  );
}
