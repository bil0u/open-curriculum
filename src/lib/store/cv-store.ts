import { temporal } from "zundo";
import { create, useStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { db } from "@/lib/db";
import { validateCvDocument } from "@/lib/db/integrity";
import type {
  CvDocument,
  EntityId,
  Locale,
  Section,
  SectionType,
} from "@/lib/types";
import { generateId, generateISODateTime, isOk } from "@/lib/utils";

import { arrayMove, updateDocSection, updateDocSectionItem } from "./helpers";

export interface CvState {
  activeCvId: EntityId | null;
  document: CvDocument | null;
  activeLocale: Locale;
}

export interface CreateCvOptions {
  name: string;
  profileId?: EntityId;
  themeId: EntityId;
  defaultLocale: Locale;
}

export interface CvActions {
  loadCv: (id: EntityId) => Promise<void>;
  createCv: (options: CreateCvOptions) => Promise<EntityId>;
  deleteCv: (id: EntityId) => Promise<void>;
  updateDocument: (updates: Partial<CvDocument>) => void;
  updateProfileOverride: (field: string, value: unknown) => void;
  clearProfileOverride: (field: string) => void;
  updateThemeOverride: (property: string, value: string | null) => void;
  switchTheme: (themeId: EntityId) => void;
  switchLayout: (layoutId: EntityId) => void;
  addSection: (type: SectionType) => EntityId | undefined;
  removeSection: (sectionId: EntityId) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  updateSection: (sectionId: EntityId, updates: Partial<Section>) => void;
  addSectionItem: (
    sectionId: EntityId,
    item: { id: EntityId } & Record<string, unknown>,
  ) => void;
  removeSectionItem: (sectionId: EntityId, itemId: EntityId) => void;
  updateSectionItem: (
    sectionId: EntityId,
    itemId: EntityId,
    data: Record<string, unknown>,
  ) => void;
  reorderSectionItems: (
    sectionId: EntityId,
    fromIndex: number,
    toIndex: number,
  ) => void;
  setActiveLocale: (locale: Locale) => void;
  createSnapshot: () => Promise<void>;
  restoreSnapshot: (snapshotId: EntityId) => Promise<void>;
  discardChanges: () => Promise<void>;
}

function withTimestamp(
  doc: CvDocument,
  updates: Partial<CvDocument>,
): CvDocument {
  return { ...doc, ...updates, updatedAt: generateISODateTime() };
}

export const useCvStore = create<CvState & CvActions>()(
  subscribeWithSelector(
    temporal(
      (set, get) => ({
        activeCvId: null,
        document: null,
        activeLocale: "en",

        loadCv: async (id) => {
          // Try working state first, validate its integrity (DS-06)
          const working = await db.workingStates.get(id);
          let doc: CvDocument | undefined;
          let recoveredFromCorruption = false;

          if (working?.state) {
            const result = validateCvDocument(working.state);
            if (isOk(result)) {
              doc = result.value;
            } else {
              // Working state corrupted — try last snapshot
              const snapshots = await db.snapshots
                .where("cvId")
                .equals(id)
                .sortBy("timestamp");
              const snapshot = snapshots[snapshots.length - 1];

              if (snapshot?.state) {
                const snapshotResult = validateCvDocument(snapshot.state);
                if (isOk(snapshotResult)) {
                  doc = snapshotResult.value;
                  recoveredFromCorruption = true;
                }
              }

              // Clear corrupted working state
              await db.workingStates.delete(id);
            }
          }

          // Fall back to stored CV document
          if (!doc) {
            const stored = await db.cvs.get(id);
            if (!stored) throw new Error(`CV not found: ${id}`);
            const storeResult = validateCvDocument(stored);
            if (!isOk(storeResult)) {
              throw new Error(`CV data is corrupted: ${storeResult.error}`);
            }
            doc = storeResult.value;
          }

          useCvStore.temporal.getState().clear();
          set({
            activeCvId: id,
            document: doc,
            activeLocale: doc.defaultLocale,
          });

          if (recoveredFromCorruption) {
            console.warn(
              `CV ${id}: working state was corrupted, recovered from last snapshot`,
            );
          }
        },

        createCv: async (options) => {
          const now = generateISODateTime();
          const newCv: CvDocument = {
            id: generateId(),
            name: options.name,
            profileId: options.profileId ?? null,
            profileOverrides: {},
            sections: [],
            themeId: options.themeId,
            defaultLocale: options.defaultLocale,
            availableLocales: [options.defaultLocale],
            pageFormat: "A4",
            createdAt: now,
            updatedAt: now,
          };

          await db.cvs.put(newCv);
          useCvStore.temporal.getState().clear();
          set({
            activeCvId: newCv.id,
            document: newCv,
            activeLocale: newCv.defaultLocale,
          });
          return newCv.id;
        },

        deleteCv: async (id) => {
          await db.transaction(
            "rw",
            [db.cvs, db.workingStates, db.snapshots],
            async () => {
              await db.cvs.delete(id);
              await db.workingStates.delete(id);
              await db.snapshots.where("cvId").equals(id).delete();
            },
          );
          if (get().activeCvId === id) {
            useCvStore.temporal.getState().clear();
            set({ activeCvId: null, document: null });
          }
        },

        updateDocument: (updates) => {
          const { document } = get();
          if (!document) return;
          set({ document: withTimestamp(document, updates) });
        },

        updateProfileOverride: (field, value) => {
          const { document } = get();
          if (!document) return;
          set({
            document: withTimestamp(document, {
              profileOverrides: {
                ...document.profileOverrides,
                [field]: value,
              },
            }),
          });
        },

        updateThemeOverride: (property, value) => {
          const { document } = get();
          if (!document) return;
          const current = document.themeOverrides?.simpleOverrides ?? {};
          if (value === null) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [property]: _, ...rest } = current;
            const themeOverrides =
              Object.keys(rest).length > 0
                ? { ...document.themeOverrides, simpleOverrides: rest }
                : undefined;
            set({ document: withTimestamp(document, { themeOverrides }) });
          } else {
            set({
              document: withTimestamp(document, {
                themeOverrides: {
                  ...document.themeOverrides,
                  simpleOverrides: { ...current, [property]: value },
                },
              }),
            });
          }
        },

        switchTheme: (themeId) => {
          const { document } = get();
          if (!document) return;
          set({
            document: withTimestamp(document, {
              themeId,
              themeOverrides: undefined,
              sectionSlotMapping: undefined,
            }),
          });
        },

        switchLayout: (layoutId) => {
          const { document } = get();
          if (!document) return;
          set({
            document: withTimestamp(document, { selectedLayoutId: layoutId }),
          });
        },

        clearProfileOverride: (field) => {
          const { document } = get();
          if (!document) return;
          const overrides = document.profileOverrides as Record<
            string,
            unknown
          >;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [field]: _, ...rest } = overrides;
          set({
            document: withTimestamp(document, { profileOverrides: rest }),
          });
        },

        addSection: (type) => {
          const { document } = get();
          if (!document) return undefined;
          const sectionDefaults: Record<string, unknown> =
            type === "introduction" || type === "freeform"
              ? { content: {} }
              : type === "skills" || type === "interests"
                ? { categories: [] }
                : { items: [] };
          const newSection = {
            id: generateId(),
            type,
            title: {},
            visible: true,
            ...sectionDefaults,
          } as Section;
          set({
            document: withTimestamp(document, {
              sections: [...document.sections, newSection],
            }),
          });
          return newSection.id;
        },

        removeSection: (sectionId) => {
          const { document } = get();
          if (!document) return;
          const sections = document.sections.filter((s) => s.id !== sectionId);
          if (sections.length === document.sections.length) return;
          set({ document: withTimestamp(document, { sections }) });
        },

        reorderSections: (fromIndex, toIndex) => {
          const { document } = get();
          if (!document) return;
          set({
            document: withTimestamp(document, {
              sections: arrayMove(document.sections, fromIndex, toIndex),
            }),
          });
        },

        updateSection: (sectionId, updates) => {
          const { document } = get();
          if (!document) return;
          set({
            document: withTimestamp(
              updateDocSection(
                document,
                sectionId,
                (s) => ({ ...s, ...updates }) as Section,
              ),
              {},
            ),
          });
        },

        addSectionItem: (sectionId, item) => {
          const { document } = get();
          if (!document) return;
          set({
            document: withTimestamp(
              updateDocSection(document, sectionId, (s) => {
                if (!("items" in s)) return s;
                return { ...s, items: [...s.items, item] } as Section;
              }),
              {},
            ),
          });
        },

        removeSectionItem: (sectionId, itemId) => {
          const { document } = get();
          if (!document) return;
          set({
            document: withTimestamp(
              updateDocSection(document, sectionId, (s) => {
                if (!("items" in s)) return s;
                return {
                  ...s,
                  items: (s.items as Array<{ id: EntityId }>).filter(
                    (i) => i.id !== itemId,
                  ),
                } as Section;
              }),
              {},
            ),
          });
        },

        updateSectionItem: (sectionId, itemId, data) => {
          const { document } = get();
          if (!document) return;
          set({
            document: withTimestamp(
              updateDocSectionItem(document, sectionId, itemId, (item) => ({
                ...item,
                ...data,
              })),
              {},
            ),
          });
        },

        reorderSectionItems: (sectionId, fromIndex, toIndex) => {
          const { document } = get();
          if (!document) return;
          set({
            document: withTimestamp(
              updateDocSection(document, sectionId, (s) => {
                if (!("items" in s)) return s;
                return {
                  ...s,
                  items: arrayMove(
                    s.items as Array<{ id: EntityId }>,
                    fromIndex,
                    toIndex,
                  ),
                } as Section;
              }),
              {},
            ),
          });
        },

        setActiveLocale: (locale) => set({ activeLocale: locale }),

        createSnapshot: async () => {
          const { activeCvId, document } = get();
          if (!activeCvId || !document) return;
          const snapshot = {
            id: generateId(),
            cvId: activeCvId,
            state: document,
            commandLog: [],
            timestamp: generateISODateTime(),
          };
          await db.snapshots.put(snapshot);
          await db.cvs.put(document);
        },

        restoreSnapshot: async (snapshotId) => {
          const { activeCvId } = get();
          if (!activeCvId) return;
          const snapshot = await db.snapshots.get(snapshotId);
          if (!snapshot || snapshot.cvId !== activeCvId) return;
          useCvStore.temporal.getState().clear();
          set({
            document: snapshot.state,
            activeLocale: snapshot.state.defaultLocale,
          });
        },

        discardChanges: async () => {
          const { activeCvId } = get();
          if (!activeCvId) return;
          const snapshots = await db.snapshots
            .where("cvId")
            .equals(activeCvId)
            .sortBy("timestamp");
          const lastSnapshot = snapshots[snapshots.length - 1];
          if (!lastSnapshot) return;
          useCvStore.temporal.getState().clear();
          set({
            document: lastSnapshot.state,
            activeLocale: lastSnapshot.state.defaultLocale,
          });
        },
      }),
      {
        limit: 100,
        equality: (a, b) => a.document === b.document,
        partialize: (state) =>
          ({ document: state.document }) as CvState & CvActions,
      },
    ),
  ),
);

export function useUndoRedo() {
  return useStore(useCvStore.temporal, (state) => ({
    undo: state.undo,
    redo: state.redo,
    canUndo: state.pastStates.length > 0,
    canRedo: state.futureStates.length > 0,
  }));
}
