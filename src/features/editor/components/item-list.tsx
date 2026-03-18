import { useState } from "react";

import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import type { EntityId, Section, SectionType, Translatable } from "@/lib/types";
import { Button, ChevronDownIcon, ConfirmDialog, IconButton, TrashIcon } from "@/lib/ui";
import { generateId } from "@/lib/utils";

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

interface ItemListProps {
  section: Section;
}

export function ItemList({ section }: ItemListProps) {
  const { t } = useTranslation("editor");
  const { t: tCommon } = useTranslation("common");
  const addSectionItem = useCvStore((s) => s.addSectionItem);
  const removeSectionItem = useCvStore((s) => s.removeSectionItem);
  const updateSectionItem = useCvStore((s) => s.updateSectionItem);
  const activeLocale = useCvStore((s) => s.activeLocale);

  const [expandedItemId, setExpandedItemId] = useState<EntityId | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<EntityId | null>(null);

  if (!("items" in section)) return null;

  const items = (section as unknown as { items: ItemRecord[] }).items;

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const isExpanded = item.id === expandedItemId;
        const summary = getItemSummary(section.type, item, activeLocale);

        return (
          <div key={item.id} className="border border-gray-200 rounded-md">
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="flex-1 truncate text-sm text-gray-700">
                {summary || (
                  <span className="text-gray-400 italic">{t("sections.untitled")}</span>
                )}
              </span>
              <IconButton
                aria-label={t("fields.remove_item")}
                variant="danger"
                size="sm"
                onPress={() => setConfirmRemoveId(item.id)}
              >
                <TrashIcon />
              </IconButton>
              <IconButton
                aria-label={isExpanded ? t("sections.collapse") : t("sections.expand")}
                size="sm"
                onPress={() =>
                  setExpandedItemId(isExpanded ? null : item.id)
                }
              >
                <ChevronDownIcon rotated={isExpanded} />
              </IconButton>
            </div>
            {isExpanded && (
              <div className="border-t border-gray-100 px-3 pb-3 pt-2">
                <ItemForm
                  sectionType={section.type}
                  item={item}
                  onChange={(updates) =>
                    updateSectionItem(section.id, item.id, updates)
                  }
                />
              </div>
            )}
          </div>
        );
      })}

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
