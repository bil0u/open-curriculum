import { type MutableRefObject, useCallback, useEffect, useRef, useState } from "react";

import type { RenderResult } from "@/lib/template-engine";
import { type PageDimensionsMm, getPageDimensions, PAGE_GAP_PX } from "@/lib/utils";

import { useIframeRenderer } from "./use-iframe-renderer";
import { mmToPx, usePreviewScale } from "./use-preview-scale";

interface PreviewPaneProps {
  renderResult: RenderResult | null;
  pageFormat?: string;
  iframeRefOut?: MutableRefObject<HTMLIFrameElement | null>;
}

export function PreviewPane({
  renderResult,
  pageFormat = "A4",
  iframeRefOut,
}: PreviewPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { iframeRef, render } = useIframeRenderer();
  const [pageCount, setPageCount] = useState(1);

  const iframeCallbackRef = useCallback(
    (node: HTMLIFrameElement | null) => {
      iframeRef.current = node;
      if (iframeRefOut) iframeRefOut.current = node;
    },
    [iframeRef, iframeRefOut],
  );

  const dims: PageDimensionsMm = getPageDimensions(pageFormat as "A4" | "Letter");

  const scale = usePreviewScale(containerRef, dims.widthMm, dims.heightMm);

  useEffect(() => {
    if (!renderResult) return;
    let cancelled = false;
    render(renderResult).then(({ pageCount }) => {
      if (!cancelled) setPageCount(pageCount);
    });
    return () => {
      cancelled = true;
    };
  }, [renderResult, render]);

  const pageWidthPx = mmToPx(dims.widthMm);
  const pageHeightPx = mmToPx(dims.heightMm);

  const totalIframeHeight =
    pageHeightPx * pageCount + PAGE_GAP_PX * (pageCount - 1);

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
          minHeight: pageHeightPx,
          height: totalIframeHeight,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          flexShrink: 0,
        }}
      >
        <iframe
          ref={iframeCallbackRef}
          title="CV Preview"
          sandbox="allow-same-origin"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            backgroundColor: "#ffffff",
          }}
        />
      </div>
    </div>
  );
}
