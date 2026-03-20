import type { EntityId, ISODateString, Translatable } from "./foundational";

export type SectionType =
  | "introduction"
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "projects"
  | "interests"
  | "certifications"
  | "publications"
  | "references"
  | "awards"
  | "freeform";

export interface SectionBase {
  id: EntityId;
  type: SectionType;
  title: Translatable;
  visible: boolean;
}

export interface IntroductionSection extends SectionBase {
  type: "introduction";
  content: Translatable;
}

export type ExperienceCategory =
  | "work"
  | "volunteer"
  | "military"
  | "freelance"
  | "other";

export interface ExperienceItem {
  id: EntityId;
  organization?: Translatable;
  role: Translatable;
  category: ExperienceCategory;
  startDate: ISODateString;
  endDate?: ISODateString;
  description: Translatable;
  location?: Translatable;
  highlights: Translatable[];
  url?: string;
}

export interface ExperienceSection extends SectionBase {
  type: "experience";
  items: ExperienceItem[];
}

export interface EducationItem {
  id: EntityId;
  institution: Translatable;
  degree: Translatable;
  field: Translatable;
  startDate: ISODateString;
  endDate?: ISODateString;
  description?: Translatable;
  grade?: Translatable;
  url?: string;
}

export interface EducationSection extends SectionBase {
  type: "education";
  items: EducationItem[];
}

export interface Skill {
  id: EntityId;
  name: Translatable;
}

export interface SkillCategory {
  id: EntityId;
  name: Translatable;
  skills: Skill[];
}

export interface SkillsSection extends SectionBase {
  type: "skills";
  categories: SkillCategory[];
}

export interface LanguageItem {
  id: EntityId;
  language: Translatable;
  proficiency: Translatable;
  certification?: Translatable;
}

export interface LanguagesSection extends SectionBase {
  type: "languages";
  items: LanguageItem[];
}

export interface ProjectItem {
  id: EntityId;
  name: Translatable;
  description: Translatable;
  url?: string;
  tags: Translatable[];
  highlights: Translatable[];
}

export interface ProjectsSection extends SectionBase {
  type: "projects";
  items: ProjectItem[];
}

export interface InterestCategory {
  id: EntityId;
  name: Translatable;
  description?: Translatable;
  items: Translatable[];
}

export interface InterestsSection extends SectionBase {
  type: "interests";
  categories: InterestCategory[];
}

export interface CertificationItem {
  id: EntityId;
  name: Translatable;
  issuer: Translatable;
  date: ISODateString;
  url?: string;
}

export interface CertificationsSection extends SectionBase {
  type: "certifications";
  items: CertificationItem[];
}

export interface PublicationItem {
  id: EntityId;
  title: Translatable;
  publisher: Translatable;
  date: ISODateString;
  url?: string;
  description?: Translatable;
  coAuthors?: Translatable[];
}

export interface PublicationsSection extends SectionBase {
  type: "publications";
  items: PublicationItem[];
}

export interface ReferenceItem {
  id: EntityId;
  name: Translatable;
  company: Translatable;
  role: Translatable;
  contact?: Translatable;
  quote?: Translatable;
}

export interface ReferencesSection extends SectionBase {
  type: "references";
  items: ReferenceItem[];
}

export interface AwardItem {
  id: EntityId;
  title: Translatable;
  awarder: Translatable;
  date: ISODateString;
  description?: Translatable;
  url?: string;
}

export interface AwardsSection extends SectionBase {
  type: "awards";
  items: AwardItem[];
}

export interface FreeformSection extends SectionBase {
  type: "freeform";
  content: Translatable;
}

export type Section =
  | IntroductionSection
  | ExperienceSection
  | EducationSection
  | SkillsSection
  | LanguagesSection
  | ProjectsSection
  | InterestsSection
  | CertificationsSection
  | PublicationsSection
  | ReferencesSection
  | AwardsSection
  | FreeformSection;

/** Union of all section types that have an `items` array. */
export type ItemSection =
  | ExperienceSection
  | EducationSection
  | LanguagesSection
  | ProjectsSection
  | CertificationsSection
  | PublicationsSection
  | ReferencesSection
  | AwardsSection;

/** Union of all item types across ItemSection variants. */
export type SectionItem =
  | ExperienceItem
  | EducationItem
  | LanguageItem
  | ProjectItem
  | CertificationItem
  | PublicationItem
  | ReferenceItem
  | AwardItem;

/** Union of section types that have a `categories` array. */
export type CategorySection = SkillsSection | InterestsSection;

/** Narrows a Section to ItemSection (has an `items` array). */
export function isItemSection(section: Section): section is ItemSection {
  return "items" in section;
}

/** Narrows a Section to CategorySection (has a `categories` array). */
export function isCategorySection(section: Section): section is CategorySection {
  return "categories" in section;
}
