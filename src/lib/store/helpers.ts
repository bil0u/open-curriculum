import type { CvDocument, EntityId, Section } from "@/lib/types";

/**
 * Reorder an array element from one index to another.
 */
export function arrayMove<T>(
  arr: readonly T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  const result = [...arr];
  const [moved] = result.splice(fromIndex, 1) as [T];
  result.splice(toIndex, 0, moved);
  return result;
}

/**
 * Update a section within a CvDocument by id.
 * Does NOT set updatedAt — callers are responsible for timestamping via withTimestamp.
 */
export function updateDocSection(
  doc: CvDocument,
  sectionId: EntityId,
  updater: (section: Section) => Section,
): CvDocument {
  return {
    ...doc,
    sections: doc.sections.map((s) => (s.id === sectionId ? updater(s) : s)),
  };
}

/**
 * Update an item within a section that has an `items` array.
 */
export function updateDocSectionItem(
  doc: CvDocument,
  sectionId: EntityId,
  itemId: EntityId,
  updater: (item: Record<string, unknown>) => Record<string, unknown>,
): CvDocument {
  return updateDocSection(doc, sectionId, (section) => {
    if (!("items" in section)) return section;
    return {
      ...section,
      items: (section.items as Array<{ id: EntityId }>).map((item) =>
        item.id === itemId ? updater(item as Record<string, unknown>) : item,
      ),
    } as Section;
  });
}
