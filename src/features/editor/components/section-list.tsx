import { useState } from "react";

import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import type { EntityId, SectionType } from "@/lib/types";
import { Button } from "@/lib/ui";

import { SectionCard } from "./section-card";
import { SectionTypePicker } from "./section-type-picker";

export function SectionList() {
  const { t } = useTranslation("editor");
  const document = useCvStore((s) => s.document);
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

  return (
    <div className="flex flex-col gap-2 p-4">
      <h2 className="text-sm font-semibold text-gray-800">
        {t("sections.heading")}
      </h2>

      {document.sections.map((section) => (
        <SectionCard
          key={section.id}
          section={section}
          isExpanded={section.id === expandedSectionId}
          onToggleExpand={() => handleToggleExpand(section.id)}
        />
      ))}

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
