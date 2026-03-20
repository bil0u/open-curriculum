import { useState } from "react";

import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import { BUNDLED_THEMES } from "@/lib/theme-registry";
import { ConfirmDialog } from "@/lib/ui";

import { hasSlotConflict } from "../utils/slot-utils";

export function ThemePicker() {
  const { t } = useTranslation("themes");
  const document = useCvStore((s) => s.document);
  const switchTheme = useCvStore((s) => s.switchTheme);
  const [pendingThemeId, setPendingThemeId] = useState<string | null>(null);

  if (!document) return null;

  function handleThemeSelect(themeId: string) {
    if (themeId === document?.themeId) return;
    const newTheme = BUNDLED_THEMES.find((th) => th.id === themeId);
    const newDefaultLayout = newTheme?.layouts.find(
      (l) => l.id === newTheme.defaultLayoutId,
    );
    const newSlotNames = new Set(newDefaultLayout?.slots.map((s) => s.name) ?? []);
    if (hasSlotConflict(document?.sectionSlotMapping, newSlotNames)) {
      setPendingThemeId(themeId);
    } else {
      switchTheme(themeId);
    }
  }

  function handleConfirm() {
    if (!pendingThemeId) return;
    switchTheme(pendingThemeId);
    setPendingThemeId(null);
  }

  return (
    <div>
      <div
        className="grid grid-cols-2 gap-2"
        role="radiogroup"
        aria-label={t("editor.title")}
      >
        {BUNDLED_THEMES.map((theme) => {
          const isSelected = theme.id === document.themeId;
          return (
            <button
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleThemeSelect(theme.id)}
              className={[
                "rounded border p-3 text-start text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
                isSelected
                  ? "border-blue-600 bg-blue-50 text-blue-900"
                  : "border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50",
              ].join(" ")}
            >
              <span className="block font-medium">{theme.name}</span>
              <span className="mt-0.5 block text-xs text-gray-500">
                {theme.description}
              </span>
            </button>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={pendingThemeId !== null}
        title={t("slot_change_confirm.title")}
        message={t("slot_change_confirm.description")}
        confirmLabel={t("slot_change_confirm.confirm")}
        cancelLabel={t("slot_change_confirm.cancel")}
        onConfirm={handleConfirm}
        onCancel={() => setPendingThemeId(null)}
      />
    </div>
  );
}
