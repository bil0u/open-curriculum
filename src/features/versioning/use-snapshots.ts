import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@/lib/db";
import type { EntityId, Snapshot } from "@/lib/types";

export function useSnapshots(cvId: EntityId | null): Snapshot[] {
  return (
    useLiveQuery(
      async () => {
        if (!cvId) return [];
        const snapshots = await db.snapshots
          .where("cvId")
          .equals(cvId)
          .sortBy("timestamp");
        return snapshots.reverse().slice(0, 50);
      },
      [cvId],
      [],
    ) ?? []
  );
}
