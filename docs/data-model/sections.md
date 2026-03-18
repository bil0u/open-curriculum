# Section System

All sections share a base shape and are distinguished by a `type` discriminant. Each predefined section type defines a typed `items` array with its own item schema.

There are 12 predefined section types.

## Section Type and Base

```typescript
/**
 * Discriminant values for all section types.
 */
type SectionType =
  | 'introduction'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'projects'
  | 'interests'
  | 'certifications'
  | 'publications'
  | 'references'
  | 'awards'
  | 'freeform';

/**
 * Fields shared by every section regardless of type.
 * Section order is determined by array position in CvDocument.sections,
 * not by an explicit field.
 */
interface SectionBase {
  id: EntityId;
  type: SectionType;
  title: Translatable;
  visible: boolean;
}
```

---

## Introduction Section

A short text introducing the candidate. Themes decide where to render this (under the header, as a sidebar block, as a tagline, etc.). Each CV can have its own introduction tailored to the target role.

```typescript
interface IntroductionSection extends SectionBase {
  type: 'introduction';
  /** Translatable text content -- can range from a short tagline to a full paragraph */
  content: Translatable;
}
```

---

## Experience Section

Covers work experience, volunteering, military service, etc. The `category` field lets themes render them differently if needed.

```typescript
type ExperienceCategory = 'work' | 'volunteer' | 'military' | 'freelance' | 'other';

interface ExperienceItem {
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

interface ExperienceSection extends SectionBase {
  type: 'experience';
  items: ExperienceItem[];
}
```

---

## Education Section

```typescript
interface EducationItem {
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

interface EducationSection extends SectionBase {
  type: 'education';
  items: EducationItem[];
}
```

---

## Skills Section

```typescript
interface Skill {
  id: EntityId;
  name: Translatable;
}

interface SkillCategory {
  id: EntityId;
  name: Translatable;
  skills: Skill[];
}

interface SkillsSection extends SectionBase {
  type: 'skills';
  categories: SkillCategory[];
}
```

---

## Languages Section

```typescript
interface LanguageItem {
  id: EntityId;
  language: Translatable;
  proficiency: Translatable;
  certification?: Translatable;
}

interface LanguagesSection extends SectionBase {
  type: 'languages';
  items: LanguageItem[];
}
```

---

## Projects Section

```typescript
interface ProjectItem {
  id: EntityId;
  name: Translatable;
  description: Translatable;
  url?: string;
  /** Generic tags -- could be technologies, tools, materials, techniques, etc. */
  tags: Translatable[];
  highlights: Translatable[];
}

interface ProjectsSection extends SectionBase {
  type: 'projects';
  items: ProjectItem[];
}
```

---

## Interests Section

Hobbies and interests, optionally grouped by category with descriptions. Supports both simple lists (e.g. "Piano, Hiking, Travel") and rich categorized entries (e.g. "Cuisine: Je sais faire un oeuf au plat...").

```typescript
interface InterestCategory {
  id: EntityId;
  name: Translatable;
  description?: Translatable;
  items: Translatable[];
}

interface InterestsSection extends SectionBase {
  type: 'interests';
  categories: InterestCategory[];
}
```

---

## Certifications Section

```typescript
interface CertificationItem {
  id: EntityId;
  name: Translatable;
  issuer: Translatable;
  date: ISODateString;
  url?: string;
}

interface CertificationsSection extends SectionBase {
  type: 'certifications';
  items: CertificationItem[];
}
```

---

## Publications Section

```typescript
interface PublicationItem {
  id: EntityId;
  title: Translatable;
  publisher: Translatable;
  date: ISODateString;
  url?: string;
  description?: Translatable;
  coAuthors?: Translatable[];
}

interface PublicationsSection extends SectionBase {
  type: 'publications';
  items: PublicationItem[];
}
```

---

## References Section

```typescript
interface ReferenceItem {
  id: EntityId;
  name: Translatable;
  company: Translatable;
  role: Translatable;
  contact?: Translatable;
  quote?: Translatable;
}

interface ReferencesSection extends SectionBase {
  type: 'references';
  items: ReferenceItem[];
}
```

---

## Awards Section

```typescript
interface AwardItem {
  id: EntityId;
  title: Translatable;
  awarder: Translatable;
  date: ISODateString;
  description?: Translatable;
  url?: string;
}

interface AwardsSection extends SectionBase {
  type: 'awards';
  items: AwardItem[];
}
```

---

## Freeform Section

```typescript
interface FreeformSection extends SectionBase {
  type: 'freeform';
  /** Markdown content, translatable per locale */
  content: Translatable;
}
```

---

## Section Union

```typescript
type Section =
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
```
