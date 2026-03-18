import { useTranslation } from "@/lib/i18n";
import type { SectionType } from "@/lib/types";
import { Button, Dialog } from "@/lib/ui";

const ALL_SECTION_TYPES: SectionType[] = [
  "introduction",
  "experience",
  "education",
  "skills",
  "languages",
  "projects",
  "interests",
  "certifications",
  "publications",
  "references",
  "awards",
  "freeform",
];

interface SectionTypePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: SectionType) => void;
}

export function SectionTypePicker({
  isOpen,
  onClose,
  onSelect,
}: SectionTypePickerProps) {
  const { t } = useTranslation("editor");

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }} title={t("sections.add")}>
      <div className="grid grid-cols-2 gap-2">
        {ALL_SECTION_TYPES.map((type) => (
          <Button
            key={type}
            variant="secondary"
            size="sm"
            onPress={() => {
              onSelect(type);
              onClose();
            }}
          >
            {t("section_types." + type)}
          </Button>
        ))}
      </div>
    </Dialog>
  );
}
