import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import { BUNDLED_THEMES } from "@/lib/theme-registry";

import { LayoutPicker } from "./layout-picker";
import { SectionSlotMapper } from "./section-slot-mapper";
import { ThemeCustomizer } from "./theme-customizer";
import { ThemePicker } from "./theme-picker";

export function ThemeEditor() {
  const { t } = useTranslation("themes");
  const document = useCvStore((s) => s.document);

  if (!document) return null;

  const theme = BUNDLED_THEMES.find((th) => th.id === document.themeId) ?? null;
  if (!theme) {
    console.error(
      `ThemeEditor: theme "${document.themeId}" not found. Available: ${BUNDLED_THEMES.map((t) => t.id).join(", ")}`,
    );
    return null;
  }

  const activeLayoutId = document.selectedLayoutId ?? theme.defaultLayoutId;
  const activeLayout = theme.layouts.find((l) => l.id === activeLayoutId);

  return (
    <div className="p-3">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {t("editor.title")}
      </h2>

      <ThemePicker />

      {theme.layouts.length > 1 && <LayoutPicker theme={theme} />}

      {theme.customizableProperties.length > 0 && (
        <ThemeCustomizer theme={theme} />
      )}

      {activeLayout && activeLayout.slots.length > 1 && (
        <SectionSlotMapper activeLayout={activeLayout} />
      )}
    </div>
  );
}
