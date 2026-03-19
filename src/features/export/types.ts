import type { ReactNode } from "react";

import type { RenderResult } from "@/lib/template-engine";
import type { CvDocument, Profile } from "@/lib/types";

export interface ExportContext {
  cv: CvDocument;
  profile: Profile | null;
  renderResult: RenderResult | null;
  iframe: HTMLIFrameElement | null;
}

export interface ExportFormat {
  id: string;
  labelKey: string;
  descriptionKey?: string;
  icon: ReactNode;
  fileExtension?: string;
  export(context: ExportContext): Promise<void>;
}
