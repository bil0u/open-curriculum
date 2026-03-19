import { useRef, useState } from "react";

import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import type { Section } from "@/lib/types";
import {
  ChevronDownIcon,
  ConfirmDialog,
  DragHandle,
  EyeIcon,
  EyeOffIcon,
  IconButton,
  TrashIcon,
} from "@/lib/ui";

import { SectionForm } from "./section-form";

interface SectionCardProps {
  section: Section;
  isExpanded: boolean;
  onToggleExpand: () => void;
  dragHandleRef?: (element: Element | null) => void;
}

export function SectionCard({
  section,
  isExpanded,
  onToggleExpand,
  dragHandleRef,
}: SectionCardProps) {
  const { t } = useTranslation("editor");
  const { t: tCommon } = useTranslation("common");
  const updateSection = useCvStore((s) => s.updateSection);
  const removeSection = useCvStore((s) => s.removeSection);
  const activeLocale = useCvStore((s) => s.activeLocale);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const titleValue = section.title[activeLocale] ?? "";

  const handleTitleCommit = (value: string) => {
    if (value !== titleValue) {
      updateSection(section.id, {
        title: { ...section.title, [activeLocale]: value },
      } as Partial<Section>);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleCommit(e.currentTarget.value);
      inputRef.current?.blur();
    }
  };

  return (
    <div
      className={[
        "border border-gray-200 rounded-lg",
        !section.visible ? "opacity-50" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <DragHandle ref={dragHandleRef} aria-label={t("drag.handle")} />
        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full shrink-0">
          {t(`section_types.${section.type}`)}
        </span>
        <input
          ref={inputRef}
          type="text"
          defaultValue={titleValue}
          key={`${section.id}-${activeLocale}`}
          onBlur={(e) => handleTitleCommit(e.currentTarget.value)}
          onKeyDown={handleTitleKeyDown}
          placeholder={t("sections.untitled")}
          aria-label={t("sections.untitled")}
          className="flex-1 min-w-0 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 border-0 border-b border-transparent focus:border-gray-300 focus:outline-none"
        />
        <IconButton
          aria-label={
            section.visible
              ? t("sections.visibility_hide")
              : t("sections.visibility_show")
          }
          size="sm"
          onPress={() =>
            updateSection(section.id, {
              visible: !section.visible,
            } as Partial<Section>)
          }
        >
          {section.visible ? <EyeIcon /> : <EyeOffIcon />}
        </IconButton>
        <IconButton
          aria-label={tCommon("actions.delete")}
          variant="danger"
          size="sm"
          onPress={() => setShowDeleteConfirm(true)}
        >
          <TrashIcon />
        </IconButton>
        <IconButton
          aria-label={isExpanded ? t("sections.collapse") : t("sections.expand")}
          size="sm"
          onPress={onToggleExpand}
        >
          <ChevronDownIcon rotated={isExpanded} />
        </IconButton>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-3 pb-3 pt-2">
          <SectionForm section={section} />
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          removeSection(section.id);
          setShowDeleteConfirm(false);
        }}
        title={t("sections.remove")}
        message={t("sections.delete_confirm")}
        confirmLabel={tCommon("actions.delete")}
        cancelLabel={tCommon("actions.cancel")}
        variant="danger"
      />
    </div>
  );
}
