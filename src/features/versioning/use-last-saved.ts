import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@/lib/db";
import type { EntityId, ISODateTimeString } from "@/lib/types";

export function useLastSaved(cvId: EntityId | null): ISODateTimeString | null {
  return (
    useLiveQuery(
      async () => {
        if (!cvId) return null;
        const working = await db.workingStates.get(cvId);
        return working?.lastModified ?? null;
      },
      [cvId],
      null,
    ) ?? null
  );
}

export function useHasUnsavedChanges(cvId: EntityId | null): boolean {
  return (
    useLiveQuery(
      async () => {
        if (!cvId) return false;
        const working = await db.workingStates.get(cvId);
        if (!working) return false;

        const snapshots = await db.snapshots
          .where("cvId")
          .equals(cvId)
          .sortBy("timestamp");
        const lastSnapshot = snapshots[snapshots.length - 1];

        if (!lastSnapshot) return true;

        return working.lastModified > lastSnapshot.timestamp;
      },
      [cvId],
      false,
    ) ?? false
  );
}
