import type { CvDocument, ISODateTimeString, Profile } from "@/lib/types";
import { generateISODateTime } from "@/lib/utils";

import type { ExportContext, ExportFormat } from "../types";
import { resolveProfileName, triggerDownload } from "../utils";

export interface CvExportEnvelope {
  format: "cv-genius";
  version: "1.0.0";
  exportedAt: ISODateTimeString;
  cv: CvDocument;
  profile: Profile | null;
}

function JsonIcon() {
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
      <path d="M4.5 2C3.5 2 3 2.5 3 3.5v2c0 1-0.5 1.5-1.5 1.5 1 0 1.5 .5 1.5 1.5v2c0 1 .5 1.5 1.5 1.5" />
      <path d="M11.5 2c1 0 1.5 .5 1.5 1.5v2c0 1 .5 1.5 1.5 1.5-1 0-1.5 .5-1.5 1.5v2c0 1-.5 1.5-1.5 1.5" />
    </svg>
  );
}

export const jsonExporter: ExportFormat = {
  id: "json",
  labelKey: "export_json",
  descriptionKey: "export_json_description",
  icon: <JsonIcon />,
  fileExtension: "json",
  async export(context: ExportContext) {
    const envelope: CvExportEnvelope = {
      format: "cv-genius",
      version: "1.0.0",
      exportedAt: generateISODateTime(),
      cv: context.cv,
      profile: context.profile,
    };

    const json = JSON.stringify(envelope, null, 2);
    const name = resolveProfileName(context);
    triggerDownload(json, "application/json;charset=utf-8", `${name}-cv.json`);
  },
};
