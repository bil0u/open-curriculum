export const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

export type ShortcutCategory = "general" | "editing";

export interface ShortcutDefinition {
  id: string;
  displayKeys: string;
  category: ShortcutCategory;
  labelKey: string;
}

function displayModKey(key: string, shift = false): string {
  const parts = [isMac ? "\u2318" : "Ctrl"];
  if (shift) parts.push("Shift");
  parts.push(key);
  return parts.join("+");
}

export const SHORTCUTS: ShortcutDefinition[] = [
  {
    id: "undo",
    displayKeys: displayModKey("Z"),
    category: "editing",
    labelKey: "shortcuts.undo",
  },
  {
    id: "redo",
    displayKeys: displayModKey("Z", true),
    category: "editing",
    labelKey: "shortcuts.redo",
  },
  {
    id: "save-snapshot",
    displayKeys: displayModKey("S"),
    category: "general",
    labelKey: "shortcuts.save_snapshot",
  },
  {
    id: "new-cv",
    displayKeys: displayModKey("N"),
    category: "general",
    labelKey: "shortcuts.new_cv",
  },
  {
    id: "show-shortcuts",
    displayKeys: displayModKey("?"),
    category: "general",
    labelKey: "shortcuts.show_shortcuts",
  },
];

export function getShortcutsByCategory(
  category: ShortcutCategory,
): ShortcutDefinition[] {
  return SHORTCUTS.filter((s) => s.category === category);
}
