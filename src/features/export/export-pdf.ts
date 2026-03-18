/**
 * Triggers the browser's print dialog for the preview iframe.
 * Paged.js has already paginated the content, so the print output
 * matches the preview exactly.
 */
export function exportPdf(iframe: HTMLIFrameElement | null): void {
  if (!iframe?.contentWindow) {
    throw new Error("Preview iframe is not available for printing");
  }
  iframe.contentWindow.print();
}
