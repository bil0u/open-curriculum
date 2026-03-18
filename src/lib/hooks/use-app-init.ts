import { useEffect, useRef, useState } from "react";

import { db } from "@/lib/db";
import { requestPersistentStorage } from "@/lib/db/storage";
import { i18n } from "@/lib/i18n";
import { initAutoSave } from "@/lib/store";
import { DEFAULT_SETTINGS } from "@/lib/types";

export interface AppInitState {
  isReady: boolean;
  error: string | null;
  storageWarning: boolean;
}

export function useAppInit(): AppInitState {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        await db.open();

        const [persisted, stored] = await Promise.all([
          requestPersistentStorage(),
          db.settings.get("singleton"),
        ]);
        if (!persisted && !cancelled) {
          setStorageWarning(true);
        }
        const settings = stored ?? DEFAULT_SETTINGS;

        if (settings.locale !== i18n.language) {
          await i18n.changeLanguage(settings.locale);
        }

        cleanupRef.current = initAutoSave(settings.autoSaveDelayMs);

        if (!cancelled) {
          setIsReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to initialise");
        }
      }
    }

    void boot();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  return { isReady, error, storageWarning };
}
