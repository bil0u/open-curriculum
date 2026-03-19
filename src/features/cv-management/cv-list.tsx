import { useState } from "react";

import { useLiveQuery } from "dexie-react-hooks";

import { importCvFromFile, triggerFileInput } from "@/features/export";
import { db } from "@/lib/db";
import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import { PlusIcon, UploadIcon } from "@/lib/ui";
import { isOk } from "@/lib/utils";

import { CreateCvDialog } from "./create-cv-dialog";
import { CvListItem } from "./cv-list-item";

export function CvList() {
  const { t } = useTranslation("cv-management");
  const { t: tExport } = useTranslation("export");
  const activeCvId = useCvStore((s) => s.activeCvId);
  const loadCv = useCvStore((s) => s.loadCv);
  const [showCreate, setShowCreate] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const cvs = useLiveQuery(
    () => db.cvs.orderBy("updatedAt").reverse().toArray(),
    [],
  );

  const handleImport = async () => {
    setImportError(null);
    const file = await triggerFileInput(".json");
    if (!file) return;

    const result = await importCvFromFile(file);
    if (isOk(result)) {
      void loadCv(result.value.cvId);
    } else {
      setImportError(result.error);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {t("list.title")}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => void handleImport()}
            title={tExport("import_button")}
            aria-label={tExport("import_button")}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <UploadIcon />
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <PlusIcon />
            {t("list.create_new")}
          </button>
        </div>
      </div>

      {importError && (
        <div role="alert" className="mx-3 mb-2 rounded bg-red-50 px-2 py-1.5">
          <p className="text-xs text-red-600">
            {tExport("import_error", { error: importError })}
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2">
        {cvs === undefined && (
          <p className="px-2 py-4 text-center text-xs text-gray-400">…</p>
        )}
        {cvs !== undefined && cvs.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-gray-400">
            {t("list.empty")}
          </p>
        )}
        {cvs !== undefined && cvs.length > 0 && (
          <ul className="space-y-0.5">
            {cvs.map((cv) => (
              <li key={cv.id}>
                <CvListItem cv={cv} isActive={cv.id === activeCvId} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <CreateCvDialog
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
}
