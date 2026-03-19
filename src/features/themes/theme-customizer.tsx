import { useMemo, useRef } from "react";

import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import type { ThemeCustomizableProperty, ThemeDefinition } from "@/lib/types";
import { IconButton } from "@/lib/ui";
import { debounce } from "@/lib/utils";

const SYSTEM_FONTS = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Helvetica", value: "Helvetica, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
];

function buildFontOptions(theme: ThemeDefinition) {
  const themeFonts = theme.fonts.map((f) => ({
    label: f.family,
    value: `'${f.family}', sans-serif`,
  }));
  const themeLabels = new Set(themeFonts.map((f) => f.label));
  const systemFonts = SYSTEM_FONTS.filter((f) => !themeLabels.has(f.label));
  return [...themeFonts, ...systemFonts];
}

interface PropertyControlProps {
  property: ThemeCustomizableProperty;
  currentValue: string;
  hasOverride: boolean;
  fontOptions: { label: string; value: string }[];
  onChange: (value: string) => void;
  onReset: () => void;
}

function PropertyControl({
  property,
  currentValue,
  hasOverride,
  fontOptions,
  onChange,
  onReset,
}: PropertyControlProps) {
  const { t } = useTranslation("themes");
  const inputId = `theme-prop-${property.property.replace(/^--/, "")}`;
  const label =
    property.inputType === "font-family"
      ? t("editor.font_family.label")
      : property.label;

  // Stable ref so the debounced function doesn't recreate on every render
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const debouncedColorChange = useMemo(
    () => debounce((v: string) => onChangeRef.current(v), 150),
    [],
  );

  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <label htmlFor={inputId} className="mb-1 block text-xs text-gray-600">
          {label}
        </label>
        {property.inputType === "color" && (
          <input
            id={inputId}
            type="color"
            value={currentValue}
            onChange={(e) => debouncedColorChange(e.target.value)}
            className="h-8 w-full cursor-pointer rounded border border-gray-300 p-0.5"
          />
        )}
        {property.inputType === "font-family" && (
          <select
            id={inputId}
            value={currentValue}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-2 focus:outline-blue-600"
          >
            {fontOptions.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
        {property.inputType === "select" && property.options && (
          <select
            id={inputId}
            value={currentValue}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-2 focus:outline-blue-600"
          >
            {property.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
        {(property.inputType === "length" || property.inputType === "number") && (
          <input
            id={inputId}
            type="text"
            value={currentValue}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-2 focus:outline-blue-600"
          />
        )}
      </div>
      {hasOverride && (
        <IconButton
          aria-label={t("editor.reset_property")}
          size="sm"
          variant="ghost"
          className="mt-5 shrink-0"
          onPress={onReset}
        >
          ↺
        </IconButton>
      )}
    </div>
  );
}

interface ThemeCustomizerProps {
  theme: ThemeDefinition;
}

export function ThemeCustomizer({ theme }: ThemeCustomizerProps) {
  const { t } = useTranslation("themes");
  const document = useCvStore((s) => s.document);
  const updateThemeOverride = useCvStore((s) => s.updateThemeOverride);
  const fontOptions = useMemo(() => buildFontOptions(theme), [theme]);

  if (!document) return null;

  const simpleOverrides = document.themeOverrides?.simpleOverrides ?? {};

  return (
    <div className="mt-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
        {t("editor.customization")}
      </p>
      <div className="flex flex-col gap-3">
        {theme.customizableProperties.map((prop) => {
          const currentValue = simpleOverrides[prop.property] ?? prop.defaultValue;
          const hasOverride =
            prop.property in simpleOverrides &&
            simpleOverrides[prop.property] !== prop.defaultValue;

          return (
            <PropertyControl
              key={prop.property}
              property={prop}
              currentValue={currentValue}
              hasOverride={hasOverride}
              fontOptions={fontOptions}
              onChange={(value) => updateThemeOverride(prop.property, value)}
              onReset={() => updateThemeOverride(prop.property, null)}
            />
          );
        })}
      </div>
    </div>
  );
}
