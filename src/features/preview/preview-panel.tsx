import { useTranslation } from "@/lib/i18n";

import { PreviewPane } from "./preview-pane";

export function PreviewPanel() {
  const { t } = useTranslation("common");

  return (
    <div className="flex h-full flex-col" aria-label={t("panels.preview")}>
      <PreviewPane renderResult={null} />
    </div>
  );
}
