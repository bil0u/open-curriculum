import type { DragEndEvent } from "@dnd-kit/dom";
import { move } from "@dnd-kit/helpers";

/**
 * Given an array of IDs and a dnd-kit drag event, compute the old and new indices.
 * Returns null if the drag was canceled, the source is unknown, or the item didn't move.
 */
export function resolveDragReorder(
  ids: string[],
  event: Parameters<DragEndEvent>[0],
): { oldIndex: number; newIndex: number } | null {
  if (event.canceled) return null;

  const rawId = event.operation?.source?.id;
  if (!rawId) return null;
  const sourceId = String(rawId);

  const oldIndex = ids.indexOf(sourceId);
  if (oldIndex === -1) return null;

  const updated = move(ids, event);
  const newIndex = updated.indexOf(sourceId);

  if (newIndex === -1 || oldIndex === newIndex) return null;

  return { oldIndex, newIndex };
}
