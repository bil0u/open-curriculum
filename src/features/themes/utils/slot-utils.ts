/**
 * Returns true if any section is currently mapped to a slot name
 * that does not exist in the provided set of available slot names.
 */
export function hasSlotConflict(
  sectionSlotMapping: Record<string, string> | undefined,
  availableSlotNames: Set<string>,
): boolean {
  if (!sectionSlotMapping) return false;
  return Object.values(sectionSlotMapping).some(
    (slot) => !availableSlotNames.has(slot),
  );
}
