import { useMemo } from "react";

import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import type { LayoutVariant } from "@/lib/types";

interface SectionSlotMapperProps {
  activeLayout: LayoutVariant;
}

export function SectionSlotMapper({ activeLayout }: SectionSlotMapperProps) {
  const { t } = useTranslation("themes");
  const document = useCvStore((s) => s.document);
  const activeLocale = useCvStore((s) => s.activeLocale);
  const updateDocument = useCvStore((s) => s.updateDocument);
  const sections = document?.sections ?? [];
  const visibleSections = useMemo(
    () => sections.filter((s) => s.visible),
    [sections],
  );

  if (!document) return null;

  function handleSlotChange(sectionId: string, slot: string) {
    if (!document) return;
    updateDocument({
      sectionSlotMapping: {
        ...document.sectionSlotMapping,
        [sectionId]: slot,
      },
    });
  }

  return (
    <div className="mt-4">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
        {t("editor.slot_mapping")}
      </p>
      <p className="mb-3 text-xs text-gray-400">{t("editor.slot_mapping_hint")}</p>
      <div className="flex flex-col gap-2">
        {visibleSections.map((section) => {
          const title =
            (section.title as Record<string, string>)[activeLocale] ??
            (section.title as Record<string, string>)[document.defaultLocale] ??
            section.type;
          const currentSlot = document.sectionSlotMapping?.[section.id] ?? "main";
          const selectId = `slot-${section.id}`;

          return (
            <div key={section.id} className="flex items-center gap-2">
              <label
                htmlFor={selectId}
                className="min-w-0 flex-1 truncate text-sm text-gray-700"
                title={title}
              >
                {title}
              </label>
              <select
                id={selectId}
                value={currentSlot}
                onChange={(e) => handleSlotChange(section.id, e.target.value)}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-2 focus:outline-blue-600"
              >
                {activeLayout.slots.map((slot) => {
                  const slotLabel =
                    t(`slot_names.${slot.name}`, { defaultValue: "" }) ||
                    slot.label ||
                    slot.name;
                  return (
                    <option key={slot.name} value={slot.name}>
                      {slotLabel}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
