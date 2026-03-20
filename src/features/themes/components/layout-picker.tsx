import { useState } from "react";

import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import type { ThemeDefinition } from "@/lib/types";
import { ConfirmDialog } from "@/lib/ui";

import { hasSlotConflict } from "../utils/slot-utils";

interface LayoutPickerProps {
  theme: ThemeDefinition;
}

export function LayoutPicker({ theme }: LayoutPickerProps) {
  const { t } = useTranslation("themes");
  const document = useCvStore((s) => s.document);
  const switchLayout = useCvStore((s) => s.switchLayout);
  const updateDocument = useCvStore((s) => s.updateDocument);
  const [pendingLayoutId, setPendingLayoutId] = useState<string | null>(null);

  if (!document) return null;

  const currentLayoutId = document.selectedLayoutId ?? theme.defaultLayoutId;

  function handleLayoutSelect(layoutId: string) {
    if (layoutId === currentLayoutId) return;
    const newLayout = theme.layouts.find((l) => l.id === layoutId);
    const newSlotNames = new Set(newLayout?.slots.map((s) => s.name) ?? []);
    if (hasSlotConflict(document?.sectionSlotMapping, newSlotNames)) {
      setPendingLayoutId(layoutId);
    } else {
      switchLayout(layoutId);
    }
  }

  function handleConfirm() {
    if (!pendingLayoutId) return;
    updateDocument({ selectedLayoutId: pendingLayoutId, sectionSlotMapping: undefined });
    setPendingLayoutId(null);
  }

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
        {t("editor.layout")}
      </p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("editor.layout")}>
        {theme.layouts.map((layout) => {
          const isSelected = layout.id === currentLayoutId;
          return (
            <button
              key={layout.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleLayoutSelect(layout.id)}
              className={[
                "rounded border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
                isSelected
                  ? "border-blue-600 bg-blue-50 text-blue-900"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50",
              ].join(" ")}
            >
              {layout.name}
            </button>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={pendingLayoutId !== null}
        title={t("slot_change_confirm.title")}
        message={t("slot_change_confirm.description")}
        confirmLabel={t("slot_change_confirm.confirm")}
        cancelLabel={t("slot_change_confirm.cancel")}
        onConfirm={handleConfirm}
        onCancel={() => setPendingLayoutId(null)}
      />
    </div>
  );
}
