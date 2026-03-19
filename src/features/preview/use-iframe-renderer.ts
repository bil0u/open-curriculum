import { useCallback, useEffect, useRef } from "react";

import { Previewer } from "pagedjs";

import type { RenderResult } from "@/lib/template-engine";

export interface IframeRenderResult {
  pageCount: number;
}

/**
 * Manages the iframe lifecycle: injects HTML/CSS and runs Paged.js pagination.
 * Returns a ref to attach to an <iframe> element and an update function.
 */
export function useIframeRenderer() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const previewerRef = useRef<Previewer | null>(null);

  useEffect(() => {
    return () => {
      previewerRef.current = null;
    };
  }, []);

  const render = useCallback(
    async (result: RenderResult): Promise<IframeRenderResult> => {
      const iframe = iframeRef.current;
      if (!iframe) return { pageCount: 1 };

      const iframeDoc =
        iframe.contentDocument ?? iframe.contentWindow?.document;
      if (!iframeDoc) return { pageCount: 1 };

      // Write a minimal document — CSS goes in <head>, content in <body>
      iframeDoc.open();
      iframeDoc.write(`<!DOCTYPE html>
<html lang="${result.context.locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${result.css}</style>
</head>
<body></body>
</html>`);
      iframeDoc.close();

      // Wait for fonts to load before paginating
      await iframeDoc.fonts.ready;

      // Run Paged.js pagination — it replaces body content with paginated output
      const previewer = new Previewer();
      previewerRef.current = previewer;

      await previewer.preview(result.html, [], iframeDoc.body);

      // Count pages created by Paged.js
      const pages = iframeDoc.querySelectorAll(".pagedjs_page");
      const pageCount = Math.max(pages.length, 1);

      return { pageCount };
    },
    [],
  );

  const printPdf = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.print();
  }, []);

  return { iframeRef, render, printPdf };
}
