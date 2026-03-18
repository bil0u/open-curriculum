import { useMemo } from "react";

import { useCvStore } from "@/lib/store";
import type { Section } from "@/lib/types";

export interface ValidationWarning {
  fieldKey: string;
  messageKey: string;
}

export function useSectionValidation(section: Section): ValidationWarning[] {
  const activeLocale = useCvStore((s) => s.activeLocale);

  return useMemo(() => {
    const warnings: ValidationWarning[] = [];

    if (!section.title[activeLocale]) {
      warnings.push({ fieldKey: "title", messageKey: "validation.required_field" });
    }

    if (section.type === "introduction" || section.type === "freeform") {
      if (!section.content[activeLocale]) {
        warnings.push({ fieldKey: "content", messageKey: "validation.required_field" });
      }
    } else if (section.type === "skills" || section.type === "interests") {
      if (section.categories.length === 0) {
        warnings.push({ fieldKey: "categories", messageKey: "validation.required_field" });
      }
    } else {
      if (section.items.length === 0) {
        warnings.push({ fieldKey: "items", messageKey: "validation.required_field" });
      }
    }

    return warnings;
  }, [section, activeLocale]);
}
