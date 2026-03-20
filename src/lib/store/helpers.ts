import type { CvDocument, EntityId, Section } from "@/lib/types";
import { isCategorySection, isItemSection } from "@/lib/types";
import { generateId, generateISODateTime } from "@/lib/utils";

/**
 * Reorder an array element from one index to another.
 */
export function arrayMove<T>(
  arr: readonly T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  const result = [...arr];
  const moved = result.splice(fromIndex, 1)[0] as T;
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
    if (!isItemSection(section)) return section;
    return {
      ...section,
      items: section.items.map((item) =>
        item.id === itemId
          ? (updater(item as unknown as Record<string, unknown>) as unknown as typeof item)
          : item,
      ),
    } as Section;
  });
}

/**
 * Deep-clones a CvDocument with fresh IDs for the CV, all sections, items, and categories.
 * Uses structuredClone + structural patching to avoid fighting TS discriminated unions.
 */
export function regenerateIds(cv: CvDocument): CvDocument {
  const now = generateISODateTime();
  const clonedSections = structuredClone(cv.sections);

  for (const section of clonedSections) {
    section.id = generateId();

    if (isItemSection(section)) {
      for (const item of section.items) {
        item.id = generateId();
      }
    }

    if (isCategorySection(section)) {
      for (const cat of section.categories) {
        cat.id = generateId();
        if ("skills" in cat) {
          for (const skill of cat.skills) {
            skill.id = generateId();
          }
        }
      }
    }
  }

  return {
    ...cv,
    id: generateId(),
    sections: clonedSections,
    createdAt: now,
    updatedAt: now,
  };
}
