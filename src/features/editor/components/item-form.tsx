import { memo, useMemo } from "react";

import { useTranslation } from "@/lib/i18n";
import type { SectionType, Translatable } from "@/lib/types";
import { Select, TextField } from "@/lib/ui";

import { TranslatableField } from "./translatable-field";

interface FieldDef {
  key: string;
  labelKey: string;
  type: "text" | "textarea" | "date" | "select";
  required: boolean;
  translatable: boolean;
  options?: Array<{ id: string; label: string }>;
}

type FieldSchemas = Partial<Record<SectionType, FieldDef[]>>;

function buildSchemas(
  tExp: (key: string) => string,
): FieldSchemas {
  return {
    experience: [
      { key: "organization", labelKey: "fields.organization", type: "text", required: false, translatable: true },
      { key: "role", labelKey: "fields.role", type: "text", required: true, translatable: true },
      {
        key: "category",
        labelKey: "fields.category",
        type: "select",
        required: true,
        translatable: false,
        options: [
          { id: "work", label: tExp("experience_categories.work") },
          { id: "volunteer", label: tExp("experience_categories.volunteer") },
          { id: "military", label: tExp("experience_categories.military") },
          { id: "freelance", label: tExp("experience_categories.freelance") },
          { id: "other", label: tExp("experience_categories.other") },
        ],
      },
      { key: "startDate", labelKey: "fields.start_date", type: "date", required: true, translatable: false },
      { key: "endDate", labelKey: "fields.end_date", type: "date", required: false, translatable: false },
      { key: "description", labelKey: "fields.description", type: "textarea", required: true, translatable: true },
      { key: "location", labelKey: "fields.location", type: "text", required: false, translatable: true },
      { key: "url", labelKey: "fields.url", type: "text", required: false, translatable: false },
    ],
    education: [
      { key: "institution", labelKey: "fields.institution", type: "text", required: true, translatable: true },
      { key: "degree", labelKey: "fields.degree", type: "text", required: true, translatable: true },
      { key: "field", labelKey: "fields.field_of_study", type: "text", required: true, translatable: true },
      { key: "startDate", labelKey: "fields.start_date", type: "date", required: true, translatable: false },
      { key: "endDate", labelKey: "fields.end_date", type: "date", required: false, translatable: false },
      { key: "description", labelKey: "fields.description", type: "textarea", required: false, translatable: true },
      { key: "grade", labelKey: "fields.grade", type: "text", required: false, translatable: true },
      { key: "url", labelKey: "fields.url", type: "text", required: false, translatable: false },
    ],
    languages: [
      { key: "language", labelKey: "fields.language", type: "text", required: true, translatable: true },
      { key: "proficiency", labelKey: "fields.proficiency", type: "text", required: true, translatable: true },
      { key: "certification", labelKey: "fields.certification", type: "text", required: false, translatable: true },
    ],
    projects: [
      { key: "name", labelKey: "fields.name", type: "text", required: true, translatable: true },
      { key: "description", labelKey: "fields.description", type: "textarea", required: true, translatable: true },
      { key: "url", labelKey: "fields.url", type: "text", required: false, translatable: false },
    ],
    certifications: [
      { key: "name", labelKey: "fields.name", type: "text", required: true, translatable: true },
      { key: "issuer", labelKey: "fields.issuer", type: "text", required: true, translatable: true },
      { key: "date", labelKey: "fields.date", type: "date", required: true, translatable: false },
      { key: "url", labelKey: "fields.url", type: "text", required: false, translatable: false },
    ],
    publications: [
      { key: "title", labelKey: "fields.title", type: "text", required: true, translatable: true },
      { key: "publisher", labelKey: "fields.publisher", type: "text", required: true, translatable: true },
      { key: "date", labelKey: "fields.date", type: "date", required: true, translatable: false },
      { key: "url", labelKey: "fields.url", type: "text", required: false, translatable: false },
      { key: "description", labelKey: "fields.description", type: "textarea", required: false, translatable: true },
    ],
    references: [
      { key: "name", labelKey: "fields.name", type: "text", required: true, translatable: true },
      { key: "company", labelKey: "fields.company", type: "text", required: true, translatable: true },
      { key: "role", labelKey: "fields.role", type: "text", required: true, translatable: true },
      { key: "contact", labelKey: "fields.contact", type: "text", required: false, translatable: true },
      { key: "quote", labelKey: "fields.quote", type: "textarea", required: false, translatable: true },
    ],
    awards: [
      { key: "title", labelKey: "fields.title", type: "text", required: true, translatable: true },
      { key: "awarder", labelKey: "fields.awarder", type: "text", required: true, translatable: true },
      { key: "date", labelKey: "fields.date", type: "date", required: true, translatable: false },
      { key: "description", labelKey: "fields.description", type: "textarea", required: false, translatable: true },
      { key: "url", labelKey: "fields.url", type: "text", required: false, translatable: false },
    ],
  };
}

interface ItemFormProps {
  sectionType: SectionType;
  item: Record<string, unknown>;
  onChange: (updates: Record<string, unknown>) => void;
}

export const ItemForm = memo(function ItemForm({ sectionType, item, onChange }: ItemFormProps) {
  const { t } = useTranslation("editor");
  const schemas = useMemo(() => buildSchemas(t), [t]);
  const fields = schemas[sectionType] ?? [];

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field) => {
        if (field.translatable) {
          return (
            <TranslatableField
              key={field.key}
              label={t(field.labelKey)}
              value={(item[field.key] as Translatable | undefined) ?? {}}
              onChange={(val) => onChange({ [field.key]: val })}
              isRequired={field.required}
              multiline={field.type === "textarea"}

            />
          );
        }

        if (field.type === "select" && field.options) {
          return (
            <Select
              key={field.key}
              label={t(field.labelKey)}
              items={field.options}
              selectedKey={(item[field.key] as string | undefined) ?? (field.options[0]?.id ?? "")}
              onSelectionChange={(key) => onChange({ [field.key]: key })}
              isRequired={field.required}
            />
          );
        }

        return (
          <TextField
            key={field.key}
            label={t(field.labelKey)}
            value={(item[field.key] as string | undefined) ?? ""}
            onChange={(val) => onChange({ [field.key]: val })}
            isRequired={field.required}
            type={field.type === "date" ? "date" : "text"}
          />
        );
      })}
    </div>
  );
});
