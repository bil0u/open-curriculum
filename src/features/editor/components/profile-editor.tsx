import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import type { Translatable } from "@/lib/types";

import { TranslatableField } from "./translatable-field";

export function ProfileEditor() {
  const { t } = useTranslation("editor");
  const document = useCvStore((s) => s.document);
  const updateProfileOverride = useCvStore((s) => s.updateProfileOverride);

  if (!document) return null;

  const overrides = document.profileOverrides as Record<string, Translatable>;

  function getFieldValue(field: string): Translatable {
    return overrides[field] ?? {};
  }

  function handleChange(field: string) {
    return (val: Translatable) => updateProfileOverride(field, val);
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <h2 className="text-base font-semibold text-gray-900">
        {t("profile.heading")}
      </h2>
      <TranslatableField
        label={t("profile.full_name")}
        value={getFieldValue("name")}
        onChange={handleChange("name")}
        isRequired
      />
      <TranslatableField
        label={t("profile.job_title")}
        value={getFieldValue("title")}
        onChange={handleChange("title")}
      />
      <TranslatableField
        label={t("profile.email")}
        value={getFieldValue("email")}
        onChange={handleChange("email")}
      />
      <TranslatableField
        label={t("profile.phone")}
        value={getFieldValue("phone")}
        onChange={handleChange("phone")}
      />
      <TranslatableField
        label={t("profile.location")}
        value={getFieldValue("location")}
        onChange={handleChange("location")}
      />
      <TranslatableField
        label={t("profile.website")}
        value={getFieldValue("website")}
        onChange={handleChange("website")}
      />
    </div>
  );
}
