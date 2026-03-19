import type { ThemeDefinition } from "@/lib/types";

import layoutTemplate from "./layout.liquid?raw";
import defaultPartial from "./partials/_default.liquid?raw";
import awardsPartial from "./partials/awards.liquid?raw";
import certificationsPartial from "./partials/certifications.liquid?raw";
import educationPartial from "./partials/education.liquid?raw";
import experiencePartial from "./partials/experience.liquid?raw";
import freeformPartial from "./partials/freeform.liquid?raw";
import interestsPartial from "./partials/interests.liquid?raw";
import introductionPartial from "./partials/introduction.liquid?raw";
import languagesPartial from "./partials/languages.liquid?raw";
import projectsPartial from "./partials/projects.liquid?raw";
import publicationsPartial from "./partials/publications.liquid?raw";
import referencesPartial from "./partials/references.liquid?raw";
import skillsPartial from "./partials/skills.liquid?raw";
import baseCss from "./styles/base.css?raw";
import variablesCss from "./styles/variables.css?raw";

export const minimalTheme: ThemeDefinition = {
  id: "minimal",
  name: "Minimal",
  description: "A clean, single-column CV layout with a timeline-inspired design",
  author: "CV Genius",
  version: "0.1.0",
  layouts: [
    {
      id: "default",
      name: "Default",
      template: "layout",
      slots: [
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
      family: "Georgia",
      weights: [400, 700],
      styles: ["normal", "italic"],
    },
  ],
  customizableProperties: [
    {
      property: "--cv-accent-color",
      label: "Accent Color",
      inputType: "color",
      defaultValue: "#059669",
    },
    {
      property: "--cv-font-family",
      label: "Font",
      inputType: "font-family",
      defaultValue: '"Georgia", serif',
    },
    {
      property: "--cv-font-size",
      label: "Base Font Size",
      inputType: "select",
      defaultValue: "10pt",
      options: ["9pt", "10pt", "11pt", "12pt"],
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
