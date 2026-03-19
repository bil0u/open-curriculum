import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "@/locales/en/common.json";
import enCvManagement from "@/locales/en/cv-management.json";
import enEditor from "@/locales/en/editor.json";
import enExport from "@/locales/en/export.json";
import enOnboarding from "@/locales/en/onboarding.json";
import enPreview from "@/locales/en/preview.json";
import enThemes from "@/locales/en/themes.json";
import enVersioning from "@/locales/en/versioning.json";
import frCommon from "@/locales/fr/common.json";
import frCvManagement from "@/locales/fr/cv-management.json";
import frEditor from "@/locales/fr/editor.json";
import frExport from "@/locales/fr/export.json";
import frOnboarding from "@/locales/fr/onboarding.json";
import frPreview from "@/locales/fr/preview.json";
import frThemes from "@/locales/fr/themes.json";
import frVersioning from "@/locales/fr/versioning.json";

export const SUPPORTED_LOCALES = ["en", "fr"] as const;
export const DEFAULT_LOCALE = "en" as const;
export const DEFAULT_NS = "common" as const;

export const NAMESPACES = [
  "common",
  "editor",
  "cv-management",
  "preview",
  "export",
  "versioning",
  "themes",
  "onboarding",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export type Namespace = (typeof NAMESPACES)[number];

export const i18n = createInstance();

i18n.use(initReactI18next).init({
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,

  ns: NAMESPACES,
  defaultNS: DEFAULT_NS,

  resources: {
    en: {
      common: enCommon,
      editor: enEditor,
      "cv-management": enCvManagement,
      preview: enPreview,
      export: enExport,
      versioning: enVersioning,
      themes: enThemes,
      onboarding: enOnboarding,
    },
    fr: {
      common: frCommon,
      editor: frEditor,
      "cv-management": frCvManagement,
      preview: frPreview,
      export: frExport,
      versioning: frVersioning,
      themes: frThemes,
      onboarding: frOnboarding,
    },
  },

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: true,
  },

  debug: import.meta.env.DEV,
});

export { useTranslation } from "react-i18next";
