import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import { BUNDLED_THEMES } from "@/lib/theme-registry";
import type { EntityId } from "@/lib/types";

const THEME_ACCENT_COLORS: Record<EntityId, string> = Object.fromEntries(
  BUNDLED_THEMES.map((theme) => [
    theme.id,
    theme.customizableProperties.find((p) => p.property === "--cv-accent-color")
      ?.defaultValue ?? "#6b7280",
  ]),
);

export function ThemePicker() {
  const { t } = useTranslation("preview");
  const document = useCvStore((s) => s.document);
  const updateDocument = useCvStore((s) => s.updateDocument);

  if (!document) return null;

  return (
    <div className="p-3">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {t("theme_picker.title")}
      </h3>
      <div className="flex flex-col gap-2">
        {BUNDLED_THEMES.map((theme) => {
          const isActive = document.themeId === theme.id;
          const accent = THEME_ACCENT_COLORS[theme.id] ?? "#6b7280";

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => {
                if (!isActive) {
                  updateDocument({ themeId: theme.id });
                }
              }}
              aria-pressed={isActive}
              className={[
                "flex items-center gap-3 rounded-md border px-3 py-2 text-start transition-colors",
                isActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
              ].join(" ")}
            >
              <span
                className="h-4 w-4 shrink-0 rounded-full"
                style={{ backgroundColor: accent }}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <span
                  className={[
                    "block text-sm font-medium",
                    isActive ? "text-blue-700" : "text-gray-900",
                  ].join(" ")}
                >
                  {theme.name}
                </span>
                <span className="block truncate text-xs text-gray-500">
                  {theme.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
