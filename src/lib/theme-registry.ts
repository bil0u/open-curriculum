import { db } from "@/lib/db";
import type { EntityId, ThemeDefinition } from "@/lib/types";
import { classicTheme } from "@/themes/classic/theme";
import { minimalTheme } from "@/themes/minimal/theme";

export const BUNDLED_THEMES: readonly ThemeDefinition[] = [
  classicTheme,
  minimalTheme,
];

const bundledThemesMap = new Map<EntityId, ThemeDefinition>(
  BUNDLED_THEMES.map((theme) => [theme.id, theme]),
);

export async function getTheme(id: EntityId): Promise<ThemeDefinition | null> {
  const bundled = bundledThemesMap.get(id);
  if (bundled !== undefined) return bundled;

  const stored = await db.themes.get(id);
  return stored ?? null;
}

export function getDefaultThemeId(): EntityId {
  return classicTheme.id;
}
