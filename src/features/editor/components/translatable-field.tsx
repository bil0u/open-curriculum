import { memo } from "react";

import { DEFAULT_LOCALE, useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import type { Translatable } from "@/lib/types";
import { TextArea, TextField } from "@/lib/ui";

export interface TranslatableFieldProps {
  value: Translatable;
  onChange: (value: Translatable) => void;
  label: string;
  isRequired?: boolean;
  multiline?: boolean;
  placeholder?: string;
  description?: string;
  errorMessage?: string;
}

export const TranslatableField = memo(function TranslatableField({
  value,
  onChange,
  label,
  isRequired,
  multiline,
  placeholder,
  description,
  errorMessage,
}: TranslatableFieldProps) {
  const { t } = useTranslation("editor");
  const activeLocale = useCvStore((s) => s.activeLocale);
  const defaultLocale = useCvStore((s) => s.document?.defaultLocale ?? DEFAULT_LOCALE);

  const activeValue = value[activeLocale] ?? "";
  const defaultValue = value[defaultLocale] ?? "";

  const isUntranslated = activeValue === "" && defaultValue !== "";

  const displayPlaceholder = isUntranslated ? defaultValue : placeholder;

  function handleChange(newText: string) {
    onChange({ ...value, [activeLocale]: newText });
  }

  const fieldProps = {
    label,
    value: activeValue,
    onChange: handleChange,
    placeholder: displayPlaceholder,
    isRequired,
    description,
    errorMessage,
  };

  return (
    <div className="flex flex-col gap-1">
      {multiline ? <TextArea {...fieldProps} /> : <TextField {...fieldProps} />}
      {isUntranslated && (
        <div className="flex items-center gap-2 text-xs text-amber-600">
          <span>{t("translation.showing_fallback", { locale: defaultLocale })}</span>
          <button
            type="button"
            onClick={() =>
              onChange({ ...value, [activeLocale]: defaultValue })
            }
            className="underline hover:no-underline"
          >
            {t("translation.use_as_is")}
          </button>
        </div>
      )}
    </div>
  );
});
