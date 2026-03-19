import { useTranslation } from "@/lib/i18n";
import { getShortcutsByCategory } from "@/lib/keyboard";
import type { ShortcutCategory } from "@/lib/keyboard";
import { useUiStore } from "@/lib/store";
import { Dialog, Kbd } from "@/lib/ui";

const CATEGORIES: ShortcutCategory[] = ["general", "editing"];

export function ShortcutCheatsheet() {
  const { t } = useTranslation("common");
  const isOpen = useUiStore((s) => s.isShortcutCheatsheetOpen);
  const setOpen = useUiStore((s) => s.setShortcutCheatsheetOpen);

  return (
    <Dialog
      title={t("shortcuts.title")}
      isOpen={isOpen}
      onOpenChange={setOpen}
    >
      <div className="space-y-6">
        {CATEGORIES.map((category) => {
          const shortcuts = getShortcutsByCategory(category);
          if (shortcuts.length === 0) return null;

          return (
            <section key={category} aria-labelledby={`shortcuts-${category}`}>
              <h3
                id={`shortcuts-${category}`}
                className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                {t(`shortcuts.categories.${category}`)}
              </h3>
              <dl className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                {shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.id}
                    className="flex items-center justify-between px-3 py-2"
                  >
                    <dt className="text-sm text-gray-700">
                      {t(shortcut.labelKey)}
                    </dt>
                    <dd>
                      <Kbd keys={shortcut.displayKeys} />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
      </div>
    </Dialog>
  );
}
