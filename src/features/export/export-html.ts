import type { RenderResult } from "@/lib/template-engine";

/**
 * Serializes the rendered CV into a standalone HTML file with inlined CSS.
 * The output is a self-contained document that can be opened in any browser.
 * Expects pre-sanitized HTML from renderCv().
 */
export function exportHtml(result: RenderResult, profileName: string): string {
  return `<!DOCTYPE html>
<html lang="${result.context.locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(profileName)} - CV</title>
  <style>
${result.css}
  </style>
</head>
<body>
  ${result.html}
</body>
</html>`;
}

/**
 * Triggers a download of the HTML export in the browser.
 */
export function downloadHtml(
  result: RenderResult,
  profileName: string,
  fileName?: string,
): void {
  const html = exportHtml(result, profileName);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName ?? `${profileName}-cv.html`;
  link.click();

  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
