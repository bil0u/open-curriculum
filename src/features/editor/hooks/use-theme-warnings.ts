import { useEffect, useMemo, useState } from "react";

import { useCvStore } from "@/lib/store";
import { getTheme } from "@/lib/theme-registry";
import type { EntityId, SectionType, ThemeDefinition } from "@/lib/types";

export interface ThemeWarning {
  type: "missing" | "hidden";
  sectionType: SectionType;
  /** Present when type === "hidden" — the id of the hidden section. */
  sectionId?: EntityId;
}

/**
 * Compares the CV's sections against the active theme's recommendedSectionTypes.
 * Returns non-blocking warnings for missing or hidden recommended sections.
 */
export function useThemeWarnings(): ThemeWarning[] {
  const sections = useCvStore((s) => s.document?.sections);
  const themeId = useCvStore((s) => s.document?.themeId);
  const [theme, setTheme] = useState<ThemeDefinition | null>(null);

  useEffect(() => {
    if (!themeId) {
      setTheme(null);
      return;
    }
    let cancelled = false;
    getTheme(themeId).then((t) => {
      if (!cancelled) setTheme((prev) => (prev === t ? prev : t));
    });
    return () => {
      cancelled = true;
    };
  }, [themeId]);

  return useMemo(() => {
    if (!sections || !theme?.recommendedSectionTypes?.length) return [];

    const warnings: ThemeWarning[] = [];

    for (const recType of theme.recommendedSectionTypes) {
      const matchingSections = sections.filter((s) => s.type === recType);

      if (matchingSections.length === 0) {
        warnings.push({ type: "missing", sectionType: recType });
      } else if (matchingSections.every((s) => !s.visible)) {
        const first = matchingSections[0];
        if (first) {
          warnings.push({
            type: "hidden",
            sectionType: recType,
            sectionId: first.id,
          });
        }
      }
    }

    return warnings;
  }, [sections, theme]);
}
