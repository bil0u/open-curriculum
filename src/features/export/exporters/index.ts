import type { ExportFormat } from "../types";

import { htmlExporter } from "./html-exporter";
import { jsonExporter } from "./json-exporter";
import { pdfExporter } from "./pdf-exporter";

export { htmlExporter, jsonExporter, pdfExporter };

export const defaultExporters: ExportFormat[] = [
  pdfExporter,
  htmlExporter,
  jsonExporter,
];
