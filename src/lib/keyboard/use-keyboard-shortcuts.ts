import { useEffect } from "react";

import { useCvStore, useUiStore } from "@/lib/store";

import { isMac } from "./shortcuts";

export function useGlobalKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;

      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        const temporal = useCvStore.temporal.getState();
        if (temporal.pastStates.length > 0) {
          temporal.undo();
        }
        return;
      }

      if (e.key === "z" && e.shiftKey) {
        e.preventDefault();
        const temporal = useCvStore.temporal.getState();
        if (temporal.futureStates.length > 0) {
          temporal.redo();
        }
        return;
      }

      if (e.key === "s") {
        e.preventDefault();
        void useCvStore.getState().createSnapshot();
        return;
      }

      if (e.key === "n") {
        e.preventDefault();
        useUiStore.getState().setCreateCvDialogOpen(true);
        return;
      }

      // Cmd+? (which is Cmd+Shift+/ on most keyboards)
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        const ui = useUiStore.getState();
        ui.setShortcutCheatsheetOpen(!ui.isShortcutCheatsheetOpen);
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
