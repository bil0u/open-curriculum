import { move } from "@dnd-kit/helpers";

/**
 * Given an array of IDs and a dnd-kit drag event, compute the old and new indices.
 * Returns null if the drag was canceled, the source is unknown, or the item didn't move.
 */
export function resolveDragReorder(
  ids: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event: any,
): { oldIndex: number; newIndex: number } | null {
  if (event.canceled) return null;

  const sourceId = event.operation?.source?.id as string | undefined;
  if (!sourceId) return null;

  const oldIndex = ids.indexOf(sourceId);
  if (oldIndex === -1) return null;

  const updated = move(ids, event);
  const newIndex = updated.indexOf(sourceId);

  if (newIndex === -1 || oldIndex === newIndex) return null;

  return { oldIndex, newIndex };
}
