import { downloadHtml } from "../export-html";
import type { ExportContext, ExportFormat } from "../types";
import { resolveProfileName } from "../utils";

function HtmlIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="5.5 4 2 8 5.5 12" />
      <polyline points="10.5 4 14 8 10.5 12" />
      <line x1="9" y1="2.5" x2="7" y2="13.5" />
    </svg>
  );
}

export const htmlExporter: ExportFormat = {
  id: "html",
  labelKey: "export_html",
  descriptionKey: "export_html_description",
  icon: <HtmlIcon />,
  fileExtension: "html",
  async export(context: ExportContext) {
    if (!context.renderResult) {
      throw new Error("No render result available for HTML export");
    }
    const name = resolveProfileName(context);
    downloadHtml(context.renderResult, name);
  },
};
