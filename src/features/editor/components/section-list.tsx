import { useState } from "react";

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
import type { EntityId, Section, SectionType } from "@/lib/types";
import { Button } from "@/lib/ui";

import { resolveDragReorder } from "../utils/resolve-drag-reorder";

import { SectionCard } from "./section-card";
import { SectionTypePicker } from "./section-type-picker";

interface SortableSectionProps {
  section: Section;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function SortableSection({
  section,
  index,
  isExpanded,
  onToggleExpand,
}: SortableSectionProps) {
  const { ref, handleRef, isDragSource } = useSortable({
    id: section.id,
    index,
  });

  return (
    <div
      ref={ref}
      role="listitem"
      className={isDragSource ? "opacity-50" : ""}
    >
      <SectionCard
        section={section}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        dragHandleRef={handleRef}
      />
    </div>
  );
}

export function SectionList() {
  const { t } = useTranslation("editor");
  const document = useCvStore((s) => s.document);
  const reorderSections = useCvStore((s) => s.reorderSections);
  const addSection = useCvStore((s) => s.addSection);

  const [expandedSectionId, setExpandedSectionId] = useState<EntityId | null>(
    null,
  );
  const [showTypePicker, setShowTypePicker] = useState(false);

  if (!document) return null;

  const handleToggleExpand = (id: EntityId) => {
    setExpandedSectionId((prev) => (prev === id ? null : id));
  };

  const handleSelectType = (type: SectionType) => {
    const newId = addSection(type);
    if (newId) setExpandedSectionId(newId);
  };

  const sections = document.sections;
  const sectionIds = sections.map((s) => s.id);

  return (
    <div className="flex flex-col gap-2 p-4">
      <h2 className="text-sm font-semibold text-gray-800">
        {t("sections.heading")}
      </h2>

      <DragDropProvider
        onDragEnd={(event) => {
          const result = resolveDragReorder(sectionIds, event);
          if (result) reorderSections(result.oldIndex, result.newIndex);
        }}
        plugins={(defaults) => [
          ...defaults,
          Accessibility.configure({
            announcements: {
              dragstart(event: Parameters<DragStartEvent>[0]) {
                if (!event.operation.source) return;
                return t("drag.section_grabbed");
              },
              dragend(event: Parameters<DragEndEvent>[0]) {
                const { source } = event.operation;
                if (!source) return;
                if (event.canceled) return t("drag.cancelled");
                if (isSortable(source)) {
                  return t("drag.section_dropped", {
                    position: source.index + 1,
                    total: sections.length,
                  });
                }
                return undefined;
              },
            },
          }),
        ]}
      >
        <div
          className="flex flex-col gap-2"
          role="list"
          aria-label={t("sections.heading")}
        >
          {sections.map((section, index) => (
            <SortableSection
              key={section.id}
              section={section}
              index={index}
              isExpanded={section.id === expandedSectionId}
              onToggleExpand={() => handleToggleExpand(section.id)}
            />
          ))}
        </div>
      </DragDropProvider>

      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onPress={() => setShowTypePicker(true)}
      >
        {t("sections.add")}
      </Button>

      <SectionTypePicker
        isOpen={showTypePicker}
        onClose={() => setShowTypePicker(false)}
        onSelect={handleSelectType}
      />
    </div>
  );
}
