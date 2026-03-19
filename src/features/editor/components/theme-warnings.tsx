import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import type { Section } from "@/lib/types";

import type { ThemeWarning } from "../hooks/use-theme-warnings";

interface ThemeWarningsProps {
  warnings: ThemeWarning[];
}

export function ThemeWarnings({ warnings }: ThemeWarningsProps) {
  const { t } = useTranslation("editor");
  const updateSection = useCvStore((s) => s.updateSection);

  if (warnings.length === 0) return null;

  return (
    <div
      className="mx-4 mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2"
      role="status"
    >
      <p className="text-xs font-medium text-amber-800">
        {t("theme_warnings.title")}
      </p>
      <ul className="mt-1 flex flex-col gap-1">
        {warnings.map((warning) => {
          const sectionLabel = t(`section_types.${warning.sectionType}`);
          const sectionId = warning.sectionId;
          return (
            <li
              key={`${warning.type}-${warning.sectionType}`}
              className="flex items-center gap-2 text-xs text-amber-700"
            >
              <span>
                {warning.type === "hidden"
                  ? t("theme_warnings.hidden_section", {
                      sectionType: sectionLabel,
                    })
                  : t("theme_warnings.missing_section", {
                      sectionType: sectionLabel,
                    })}
              </span>
              {warning.type === "hidden" && sectionId && (
                <button
                  type="button"
                  className="underline hover:no-underline"
                  onClick={() =>
                    updateSection(sectionId, {
                      visible: true,
                    } as Partial<Section>)
                  }
                >
                  {t("theme_warnings.show_section")}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
