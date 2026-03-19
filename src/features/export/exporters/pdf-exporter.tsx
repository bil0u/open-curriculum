import type { ExportContext, ExportFormat } from "../types";

function PdfIcon() {
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
      <path d="M4 1.5h5.5L13 5v9a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 14V3A1.5 1.5 0 0 1 4 1.5Z" />
      <path d="M9.5 1.5V5H13" />
      <path d="M5.5 9h5M5.5 11.5h3" />
    </svg>
  );
}

export const pdfExporter: ExportFormat = {
  id: "pdf",
  labelKey: "export_pdf",
  descriptionKey: "export_pdf_description",
  icon: <PdfIcon />,
  async export(context: ExportContext) {
    if (!context.iframe?.contentWindow) {
      throw new Error("Preview iframe is not available for printing");
    }
    context.iframe.contentWindow.print();
  },
};
