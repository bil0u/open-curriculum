import { db } from "@/lib/db";
import { debounce, generateISODateTime } from "@/lib/utils";

import { useCvStore, type CvState } from "./cv-store";

export function initAutoSave(delayMs: number): () => void {
  const saveToDb = debounce(async (state: CvState) => {
    if (!state.activeCvId || !state.document) return;
    await db.workingStates.put({
      cvId: state.activeCvId,
      state: state.document,
      lastModified: generateISODateTime(),
    });
  }, delayMs);

  const unsubscribe = useCvStore.subscribe(
    (state) => state.document,
    () => saveToDb(useCvStore.getState()),
    { equalityFn: Object.is },
  );

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      saveToDb.flush();
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    unsubscribe();
    saveToDb.cancel();
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}
