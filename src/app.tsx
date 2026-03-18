import { useState } from "react";

import { useAppInit } from "@/lib/hooks";
import { useTranslation } from "@/lib/i18n";

import { AppShell } from "./app-shell";

export function App() {
  const { t } = useTranslation("common");
  const { isReady, error, storageWarning } = useAppInit();
  const [dismissedWarning, setDismissedWarning] = useState(false);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-base font-medium text-red-600">
            {t("status.error")}
          </p>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      </main>
    );
  }

  if (!isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">{t("status.loading")}</p>
      </main>
    );
  }

  return (
    <>
      {storageWarning && !dismissedWarning && (
        <div
          role="alert"
          className="flex items-center justify-between bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800"
        >
          <span>{t("storage.not_persisted_warning")}</span>
          <button
            type="button"
            onClick={() => setDismissedWarning(true)}
            className="ms-4 shrink-0 text-amber-600 hover:text-amber-800 font-medium"
            aria-label={t("actions.close")}
          >
            {t("actions.close")}
          </button>
        </div>
      )}
      <AppShell />
    </>
  );
}
