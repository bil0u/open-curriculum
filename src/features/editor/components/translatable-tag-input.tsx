import { DEFAULT_LOCALE } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import type { Translatable } from "@/lib/types";
import { TagInput } from "@/lib/ui";

export interface TranslatableTagInputProps {
  value: Translatable[];
  onChange: (value: Translatable[]) => void;
  label: string;
  isRequired?: boolean;
  placeholder?: string;
  description?: string;
}

export function TranslatableTagInput({
  value,
  onChange,
  label,
  isRequired,
  placeholder,
  description,
}: TranslatableTagInputProps) {
  const activeLocale = useCvStore((s) => s.activeLocale);
  const defaultLocale = useCvStore((s) => s.document?.defaultLocale ?? DEFAULT_LOCALE);

  const tags = value
    .map((t) => t[activeLocale] ?? t[defaultLocale] ?? "")
    .filter(Boolean);

  function handleChange(newTags: string[]) {
    const added = newTags.length > tags.length;

    if (added) {
      const newTag = newTags[newTags.length - 1] ?? "";
      const entry: Translatable = Object.fromEntries([[activeLocale, newTag]]);
      onChange([...value, entry]);
    } else {
      // A tag was removed — find which index changed
      const removedIndex = tags.findIndex((tag, i) => tag !== newTags[i]);
      const index = removedIndex === -1 ? tags.length - 1 : removedIndex;
      onChange(value.filter((_, i) => i !== index));
    }
  }

  return (
    <TagInput
      label={label}
      tags={tags}
      onChange={handleChange}
      placeholder={placeholder}
      isRequired={isRequired}
      description={description}
    />
  );
}
