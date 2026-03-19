import { useEffect, useState } from "react";

import { useTranslation } from "@/lib/i18n";
import { useCvStore, useUndoRedo } from "@/lib/store";
import { Button, IconButton, RedoIcon, UndoIcon } from "@/lib/ui";

import { formatRelativeTime } from "../../versioning/format-relative-time";
import { useLastSaved } from "../../versioning/use-last-saved";

export function EditorToolbar() {
  const { t } = useTranslation("editor");
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  const activeCvId = useCvStore((s) => s.activeCvId);
  const createSnapshot = useCvStore((s) => s.createSnapshot);
  const lastSaved = useLastSaved(activeCvId);

  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const savedLabel = lastSaved
    ? t("toolbar.last_saved", { time: formatRelativeTime(lastSaved) })
    : t("toolbar.no_saves_yet");

  return (
    <div className="flex shrink-0 items-center gap-1 border-b border-gray-200 px-3 py-1.5">
      <IconButton
        aria-label={t("toolbar.undo")}
        size="sm"
        variant="ghost"
        isDisabled={!canUndo}
        onPress={() => undo()}
      >
        <UndoIcon />
      </IconButton>
      <IconButton
        aria-label={t("toolbar.redo")}
        size="sm"
        variant="ghost"
        isDisabled={!canRedo}
        onPress={() => redo()}
      >
        <RedoIcon />
      </IconButton>
      <div
        role="separator"
        aria-orientation="vertical"
        className="mx-1 h-4 w-px bg-gray-200"
      />
      <Button
        size="sm"
        variant="secondary"
        onPress={() => void createSnapshot()}
      >
        {t("toolbar.save_snapshot")}
      </Button>
      <div className="flex-1" />
      <span className="text-xs text-gray-400">{savedLabel}</span>
    </div>
  );
}
