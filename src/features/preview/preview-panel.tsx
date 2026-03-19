import { useRef, useState } from "react";

import { defaultExporters, type ExportContext } from "@/features/export";
import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import type { PredefinedPageFormat } from "@/lib/types";

import { PreviewPane } from "./preview-pane";
import { usePreviewRender } from "./use-preview-render";

const PAGE_FORMAT_OPTIONS: PredefinedPageFormat[] = ["A4", "Letter"];

export function PreviewPanel() {
  const { t } = useTranslation("preview");
  const { t: tExport } = useTranslation("export");
  const { renderResult, isRendering, error, theme, profile } = usePreviewRender();
  const updateDocument = useCvStore((s) => s.updateDocument);
  const document = useCvStore((s) => s.document);
  const pageFormat = useCvStore(
    (s) => s.document?.pageFormat ?? "A4",
  );
  const pageFormatStr =
    typeof pageFormat === "string" ? pageFormat : "A4";

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async (
    exportFn: (ctx: ExportContext) => Promise<void>,
  ) => {
    if (!document) return;
    setExportError(null);
    try {
      await exportFn({
        cv: document,
        profile,
        renderResult,
        iframe: iframeRef.current,
      });
    } catch (e) {
      setExportError(e instanceof Error ? e.message : tExport("error"));
    }
  };

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
          {defaultExporters.map((exporter) => (
            <button
              key={exporter.id}
              type="button"
              title={tExport(exporter.labelKey)}
              aria-label={tExport(exporter.labelKey)}
              onClick={() => void handleExport(exporter.export)}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {exporter.icon}
              <span className="hidden sm:inline">
                {tExport(exporter.labelKey)}
              </span>
            </button>
          ))}
          <div className="mx-1 h-4 w-px bg-gray-200" aria-hidden="true" />
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

      {exportError && (
        <div
          role="alert"
          className="border-b border-red-200 bg-red-50 px-3 py-1.5"
        >
          <p className="text-xs text-red-600">{exportError}</p>
        </div>
      )}

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
          iframeRefOut={iframeRef}
        />
      )}
    </div>
  );
}
