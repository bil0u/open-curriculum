import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import type { PredefinedPageFormat } from "@/lib/types";

import { PreviewPane } from "./preview-pane";
import { usePreviewRender } from "./use-preview-render";

const PAGE_FORMAT_OPTIONS: PredefinedPageFormat[] = ["A4", "Letter"];

export function PreviewPanel() {
  const { t } = useTranslation("preview");
  const { renderResult, isRendering, error, theme } = usePreviewRender();
  const updateDocument = useCvStore((s) => s.updateDocument);
  const pageFormat = useCvStore(
    (s) => s.document?.pageFormat ?? "A4",
  );
  const pageFormatStr =
    typeof pageFormat === "string" ? pageFormat : "A4";

  return (
    <div
      className="flex h-full flex-col"
      aria-label={t("panel_label")}
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
        <div className="flex items-center gap-2">
          {theme && (
            <span className="text-xs text-gray-500">
              {theme.name}
            </span>
          )}
          {isRendering && (
            <span className="text-xs text-gray-400" aria-live="polite">
              {t("rendering")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="page-format-select"
            className="text-xs text-gray-500"
          >
            {t("page_format")}
          </label>
          <select
            id="page-format-select"
            value={pageFormatStr}
            onChange={(e) =>
              updateDocument({
                pageFormat: e.target.value as PredefinedPageFormat,
              })
            }
            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {PAGE_FORMAT_OPTIONS.map((fmt) => (
              <option key={fmt} value={fmt}>
                {fmt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="flex flex-1 items-center justify-center p-4"
        >
          <div className="text-center">
            <p className="text-sm font-medium text-red-600">
              {t("render_error")}
            </p>
            <p className="mt-1 text-xs text-gray-500">{error}</p>
          </div>
        </div>
      ) : (
        <PreviewPane
          renderResult={renderResult}
          pageFormat={pageFormatStr}
        />
      )}
    </div>
  );
}
