import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import type { Section } from "@/lib/types";

import { CategoryList } from "./category-list";
import { ItemList } from "./item-list";
import { TranslatableField } from "./translatable-field";

interface SectionFormProps {
  section: Section;
}

export function SectionForm({ section }: SectionFormProps) {
  const { t } = useTranslation("editor");
  const updateSection = useCvStore((s) => s.updateSection);

  if (section.type === "introduction" || section.type === "freeform") {
    return (
      <TranslatableField
        label={t("fields.content")}
        value={section.content}
        onChange={(newValue) =>
          updateSection(section.id, { content: newValue } as Partial<Section>)
        }
        multiline
        isRequired
        description={
          section.type === "freeform"
            ? t("freeform.markdown_hint")
            : undefined
        }
      />
    );
  }

  if (section.type === "skills" || section.type === "interests") {
    return (
      <CategoryList section={section} />
    );
  }

  return <ItemList section={section} />;
}
