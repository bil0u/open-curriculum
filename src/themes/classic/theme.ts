import type { ThemeDefinition } from "@/lib/types";

// Layout template
import layoutTemplate from "./layout.liquid?raw";

// Partials (one per section type + fallback)
import introductionPartial from "./partials/introduction.liquid?raw";
import experiencePartial from "./partials/experience.liquid?raw";
import educationPartial from "./partials/education.liquid?raw";
import skillsPartial from "./partials/skills.liquid?raw";
import languagesPartial from "./partials/languages.liquid?raw";
import projectsPartial from "./partials/projects.liquid?raw";
import certificationsPartial from "./partials/certifications.liquid?raw";
import publicationsPartial from "./partials/publications.liquid?raw";
import awardsPartial from "./partials/awards.liquid?raw";
import referencesPartial from "./partials/references.liquid?raw";
import interestsPartial from "./partials/interests.liquid?raw";
import freeformPartial from "./partials/freeform.liquid?raw";
import defaultPartial from "./partials/_default.liquid?raw";

// Styles
import variablesCss from "./styles/variables.css?raw";
import baseCss from "./styles/base.css?raw";

export const classicTheme: ThemeDefinition = {
  id: "classic",
  name: "Classic",
  description: "A clean, professional 50/50 two-column CV layout",
  author: "bil0u",
  version: "0.1.0",
  layouts: [
    {
      id: "default",
      name: "Default",
      template: "layout",
      slots: [
        {
          name: "sidebar",
          label: "Sidebar",
          acceptedSectionTypes: [],
        },
        {
          name: "main",
          label: "Main",
          acceptedSectionTypes: [],
        },
      ],
    },
  ],
  defaultLayoutId: "default",
  fonts: [
    {
      family: "Inter",
      weights: [400, 500, 600, 700],
      styles: ["normal"],
      url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    },
  ],
  customizableProperties: [
    {
      property: "--cv-accent-color",
      label: "Accent Color",
      inputType: "color",
      defaultValue: "#2563eb",
    },
    {
      property: "--cv-font-family",
      label: "Font",
      inputType: "font-family",
      defaultValue: "'Inter', sans-serif",
    },
    {
      property: "--cv-font-size",
      label: "Base Font Size",
      inputType: "select",
      defaultValue: "9.5pt",
      options: ["8pt", "9pt", "9.5pt", "10pt", "11pt"],
    },
  ],
  css: `${variablesCss}\n${baseCss}`,
  templates: {
    layout: layoutTemplate,
    introduction: introductionPartial,
    experience: experiencePartial,
    education: educationPartial,
    skills: skillsPartial,
    languages: languagesPartial,
    projects: projectsPartial,
    certifications: certificationsPartial,
    publications: publicationsPartial,
    awards: awardsPartial,
    references: referencesPartial,
    interests: interestsPartial,
    freeform: freeformPartial,
    _default: defaultPartial,
  },
};
