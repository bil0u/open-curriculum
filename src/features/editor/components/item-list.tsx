import { memo, useCallback, useMemo, useState } from "react";

import {
  Accessibility,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/dom";
import { isSortable } from "@dnd-kit/dom/sortable";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";

import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import { isItemSection } from "@/lib/types";
import type { EntityId, Section, SectionType, Translatable } from "@/lib/types";
import {
  Button,
  ChevronDownIcon,
  ConfirmDialog,
  DragHandle,
  IconButton,
  TrashIcon,
} from "@/lib/ui";
import { generateId } from "@/lib/utils";

import { resolveDragReorder } from "../utils/resolve-drag-reorder";

import { ItemForm } from "./item-form";

type ItemRecord = { id: EntityId } & Record<string, unknown>;

function getItemSummary(
  sectionType: SectionType,
  item: ItemRecord,
  locale: string,
): string {
  function resolveTranslatable(val: unknown): string {
    if (!val || typeof val !== "object") return "";
    const t = val as Translatable;
    return t[locale] ?? Object.values(t)[0] ?? "";
  }

  switch (sectionType) {
    case "experience":
      return resolveTranslatable(item["role"]);
    case "education":
      return resolveTranslatable(item["institution"]);
    case "languages":
      return resolveTranslatable(item["language"]);
    case "projects":
    case "certifications":
    case "references":
      return resolveTranslatable(item["name"]);
    case "publications":
    case "awards":
      return resolveTranslatable(item["title"]);
    default:
      return "";
  }
}

function buildDefaultItem(sectionType: SectionType): ItemRecord {
  const id = generateId();
  switch (sectionType) {
    case "experience":
      return { id, role: {}, category: "work", startDate: "", description: {}, highlights: [] };
    case "education":
      return { id, institution: {}, degree: {}, field: {}, startDate: "" };
    case "languages":
      return { id, language: {}, proficiency: {} };
    case "projects":
      return { id, name: {}, description: {}, tags: [], highlights: [] };
    case "certifications":
      return { id, name: {}, issuer: {}, date: "" };
    case "publications":
      return { id, title: {}, publisher: {}, date: "" };
    case "references":
      return { id, name: {}, company: {}, role: {} };
    case "awards":
      return { id, title: {}, awarder: {}, date: "" };
    default:
      return { id };
  }
}

interface SortableItemRowProps {
  item: ItemRecord;
  index: number;
  sectionType: SectionType;
  sectionId: EntityId;
  locale: string;
  isExpanded: boolean;
  onToggleExpand: (id: EntityId) => void;
  onRequestRemove: (id: EntityId) => void;
}

const SortableItemRow = memo(function SortableItemRow({
  item,
  index,
  sectionType,
  sectionId,
  locale,
  isExpanded,
  onToggleExpand,
  onRequestRemove,
}: SortableItemRowProps) {
  const { t } = useTranslation("editor");
  const updateSectionItem = useCvStore((s) => s.updateSectionItem);
  const { ref, handleRef, isDragSource } = useSortable({
    id: item.id,
    index,
  });
  const handleToggle = useCallback(
    () => onToggleExpand(item.id),
    [onToggleExpand, item.id],
  );
  const handleRemove = useCallback(
    () => onRequestRemove(item.id),
    [onRequestRemove, item.id],
  );
  const handleChange = useCallback(
    (updates: Record<string, unknown>) =>
      updateSectionItem(sectionId, item.id, updates),
    [updateSectionItem, sectionId, item.id],
  );

  const summary = getItemSummary(sectionType, item, locale);

  return (
    <div
      ref={ref}
      role="listitem"
      className={["border border-gray-200 rounded-md", isDragSource ? "opacity-50" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <DragHandle ref={handleRef} aria-label={t("drag.handle")} />
        <span className="flex-1 truncate text-sm text-gray-700">
          {summary || (
            <span className="text-gray-400 italic">{t("sections.untitled")}</span>
          )}
        </span>
        <IconButton
          aria-label={t("fields.remove_item")}
          variant="danger"
          size="sm"
          onPress={handleRemove}
        >
          <TrashIcon />
        </IconButton>
        <IconButton
          aria-label={isExpanded ? t("sections.collapse") : t("sections.expand")}
          size="sm"
          onPress={handleToggle}
        >
          <ChevronDownIcon rotated={isExpanded} />
        </IconButton>
      </div>
      {isExpanded && (
        <div className="border-t border-gray-100 px-3 pb-3 pt-2">
          <ItemForm
            sectionType={sectionType}
            item={item}
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
});

interface ItemListProps {
  section: Section;
}

export function ItemList({ section }: ItemListProps) {
  const { t } = useTranslation("editor");
  const { t: tCommon } = useTranslation("common");
  const addSectionItem = useCvStore((s) => s.addSectionItem);
  const removeSectionItem = useCvStore((s) => s.removeSectionItem);
  const reorderSectionItems = useCvStore((s) => s.reorderSectionItems);
  const activeLocale = useCvStore((s) => s.activeLocale);

  const [expandedItemId, setExpandedItemId] = useState<EntityId | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<EntityId | null>(null);

  const items = isItemSection(section)
    ? (section.items as unknown as ItemRecord[])
    : null;
  const itemIds = useMemo(() => items?.map((item) => item.id) ?? [], [items]);

  const handleToggleExpand = useCallback((id: EntityId) => {
    setExpandedItemId((prev) => (prev === id ? null : id));
  }, []);

  const handleRequestRemove = useCallback((id: EntityId) => {
    setConfirmRemoveId(id);
  }, []);

  if (!items) return null;

  return (
    <div className="flex flex-col gap-2">
      <DragDropProvider
        onDragEnd={(event) => {
          const result = resolveDragReorder(itemIds, event);
          if (result) reorderSectionItems(section.id, result.oldIndex, result.newIndex);
        }}
        plugins={(defaults) => [
          ...defaults,
          Accessibility.configure({
            announcements: {
              dragstart(event: Parameters<DragStartEvent>[0]) {
                if (!event.operation.source) return;
                return t("drag.item_grabbed");
              },
              dragend(event: Parameters<DragEndEvent>[0]) {
                const { source } = event.operation;
                if (!source) return;
                if (event.canceled) return t("drag.cancelled");
                if (isSortable(source)) {
                  return t("drag.item_dropped", {
                    position: source.index + 1,
                    total: items.length,
                  });
                }
                return undefined;
              },
            },
          }),
        ]}
      >
        <div role="list">
          {items.map((item, index) => (
            <SortableItemRow
              key={item.id}
              item={item}
              index={index}
              sectionType={section.type}
              sectionId={section.id}
              locale={activeLocale}
              isExpanded={item.id === expandedItemId}
              onToggleExpand={handleToggleExpand}
              onRequestRemove={handleRequestRemove}
            />
          ))}
        </div>
      </DragDropProvider>

      <Button
        variant="secondary"
        size="sm"
        onPress={() => {
          const newItem = buildDefaultItem(section.type);
          addSectionItem(section.id, newItem);
          setExpandedItemId(newItem.id);
        }}
      >
        {t("fields.add_item")}
      </Button>

      <ConfirmDialog
        isOpen={confirmRemoveId !== null}
        onCancel={() => setConfirmRemoveId(null)}
        onConfirm={() => {
          if (confirmRemoveId) {
            removeSectionItem(section.id, confirmRemoveId);
            setConfirmRemoveId(null);
          }
        }}
        title={t("fields.remove_item")}
        message={t("sections.delete_confirm")}
        confirmLabel={tCommon("actions.delete")}
        cancelLabel={tCommon("actions.cancel")}
        variant="danger"
      />
    </div>
  );
}
