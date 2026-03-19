import { useEffect } from "react";

import { useCvStore } from "@/lib/store";

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

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
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
