import type {
  CvDocument,
  EntityId,
  Locale,
  Profile,
  Section,
  Translatable,
} from "@/lib/types";
import { getPageDimensionsCss } from "@/lib/utils";

/**
 * The rendering context passed to LiquidJS templates.
 * All Translatable fields are resolved to plain strings.
 */
export interface CvRenderContext {
  profile: ResolvedProfile;
  sections: ResolvedSection[];
  slots: Record<string, ResolvedSection[]>;
  locale: Locale;
  page: { format: string; width: string; height: string };
  theme: { name: string; version: string };
}

export interface ResolvedProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  photo: string;
  socialLinks: Array<{ platform: string; url: string; label: string }>;
  meta: Array<{ key: string; label: string; value: string }>;
}

export type ResolvedSection = {
  type: string;
  title: string;
  [key: string]: unknown;
};

/**
 * Builds the full rendering context for LiquidJS templates.
 * Resolves all Translatable fields to the active locale.
 */
export function buildRenderContext(
  doc: CvDocument,
  profile: Profile | null,
  locale: Locale,
  themeMeta: { name: string; version: string },
): CvRenderContext {
  const mergedProfile = mergeProfile(profile, doc.profileOverrides);
  const resolvedProfile = resolveProfile(mergedProfile, locale);

  const visibleSections = doc.sections.filter((s) => s.visible);
  const resolvedSections = visibleSections.map((s) =>
    resolveSection(s, locale),
  );

  const slots = buildSlots(
    visibleSections,
    resolvedSections,
    doc.sectionSlotMapping,
  );

  const pageDims = getPageDimensionsCss(doc.pageFormat);

  return {
    profile: resolvedProfile,
    sections: resolvedSections,
    slots,
    locale,
    page: {
      format: typeof doc.pageFormat === "string" ? doc.pageFormat : "custom",
      ...pageDims,
    },
    theme: themeMeta,
  };
}

function mergeProfile(
  profile: Profile | null,
  overrides: Partial<Omit<Profile, "id" | "createdAt" | "updatedAt">>,
): Profile {
  const base: Profile = profile ?? {
    id: "",
    name: {},
    title: {},
    email: {},
    phone: {},
    website: {},
    location: {},
    socialLinks: [],
    meta: [],
    createdAt: "",
    updatedAt: "",
  };
  return { ...base, ...overrides } as Profile;
}

function resolveTranslatable(
  value: Translatable | undefined,
  locale: Locale,
): string {
  if (!value) return "";
  return value[locale] ?? Object.values(value)[0] ?? "";
}

function resolveProfile(profile: Profile, locale: Locale): ResolvedProfile {
  return {
    name: resolveTranslatable(profile.name, locale),
    title: resolveTranslatable(profile.title, locale),
    email: resolveTranslatable(profile.email, locale),
    phone: resolveTranslatable(profile.phone, locale),
    website: resolveTranslatable(profile.website, locale),
    location: resolveTranslatable(profile.location, locale),
    photo: profile.photo ? resolvePhotoUrl(profile.photo) : "",
    socialLinks: profile.socialLinks.map((link) => ({
      platform: link.platform,
      url: link.url,
      label: resolveTranslatable(link.label, locale),
    })),
    meta: profile.meta.map((m) => ({
      key: m.key,
      label: resolveTranslatable(m.label, locale),
      value: resolveTranslatable(m.value, locale),
    })),
  };
}

function resolvePhotoUrl(photo: { id: string }): string {
  // Photo resolution will be implemented when blob storage is wired up.
  // For now, return the blob ID as a placeholder.
  return photo.id;
}

function resolveSection(section: Section, locale: Locale): ResolvedSection {
  const base = {
    type: section.type,
    title: resolveTranslatable(section.title, locale),
  };

  switch (section.type) {
    case "introduction":
    case "freeform":
      return { ...base, content: resolveTranslatable(section.content, locale) };

    case "skills":
      return {
        ...base,
        categories: section.categories.map((cat) => ({
          name: resolveTranslatable(cat.name, locale),
          skills: cat.skills.map((s) => ({
            name: resolveTranslatable(s.name, locale),
          })),
        })),
      };

    case "interests":
      return {
        ...base,
        categories: section.categories.map((cat) => ({
          name: resolveTranslatable(cat.name, locale),
          description: resolveTranslatable(cat.description, locale),
          items: cat.items.map((item) => resolveTranslatable(item, locale)),
        })),
      };

    case "experience":
      return {
        ...base,
        items: section.items.map((item) => ({
          organization: resolveTranslatable(item.organization, locale),
          role: resolveTranslatable(item.role, locale),
          category: item.category,
          startDate: item.startDate,
          endDate: item.endDate ?? "",
          description: resolveTranslatable(item.description, locale),
          location: resolveTranslatable(item.location, locale),
          highlights: item.highlights.map((h) =>
            resolveTranslatable(h, locale),
          ),
          url: item.url ?? "",
        })),
      };

    case "education":
      return {
        ...base,
        items: section.items.map((item) => ({
          institution: resolveTranslatable(item.institution, locale),
          degree: resolveTranslatable(item.degree, locale),
          field: resolveTranslatable(item.field, locale),
          startDate: item.startDate,
          endDate: item.endDate ?? "",
          description: resolveTranslatable(item.description, locale),
          grade: resolveTranslatable(item.grade, locale),
          url: item.url ?? "",
        })),
      };

    case "languages":
      return {
        ...base,
        items: section.items.map((item) => ({
          language: resolveTranslatable(item.language, locale),
          proficiency: resolveTranslatable(item.proficiency, locale),
          certification: resolveTranslatable(item.certification, locale),
        })),
      };

    case "projects":
      return {
        ...base,
        items: section.items.map((item) => ({
          name: resolveTranslatable(item.name, locale),
          description: resolveTranslatable(item.description, locale),
          url: item.url ?? "",
          tags: item.tags.map((t) => resolveTranslatable(t, locale)),
          highlights: item.highlights.map((h) =>
            resolveTranslatable(h, locale),
          ),
        })),
      };

    case "certifications":
      return {
        ...base,
        items: section.items.map((item) => ({
          name: resolveTranslatable(item.name, locale),
          issuer: resolveTranslatable(item.issuer, locale),
          date: item.date,
          url: item.url ?? "",
        })),
      };

    case "publications":
      return {
        ...base,
        items: section.items.map((item) => ({
          title: resolveTranslatable(item.title, locale),
          publisher: resolveTranslatable(item.publisher, locale),
          date: item.date,
          url: item.url ?? "",
          description: resolveTranslatable(item.description, locale),
          coAuthors: (item.coAuthors ?? []).map((a) =>
            resolveTranslatable(a, locale),
          ),
        })),
      };

    case "references":
      return {
        ...base,
        items: section.items.map((item) => ({
          name: resolveTranslatable(item.name, locale),
          company: resolveTranslatable(item.company, locale),
          role: resolveTranslatable(item.role, locale),
          contact: resolveTranslatable(item.contact, locale),
          quote: resolveTranslatable(item.quote, locale),
        })),
      };

    case "awards":
      return {
        ...base,
        items: section.items.map((item) => ({
          title: resolveTranslatable(item.title, locale),
          awarder: resolveTranslatable(item.awarder, locale),
          date: item.date,
          description: resolveTranslatable(item.description, locale),
          url: item.url ?? "",
        })),
      };
  }
}

function buildSlots(
  sections: Section[],
  resolved: ResolvedSection[],
  mapping?: Record<EntityId, string>,
): Record<string, ResolvedSection[]> {
  if (!mapping) {
    return { main: resolved };
  }

  const slots: Record<string, ResolvedSection[]> = {};
  sections.forEach((section, index) => {
    const slotName = mapping[section.id] ?? "main";
    if (!slots[slotName]) slots[slotName] = [];
    slots[slotName].push(resolved[index]!);
  });
  return slots;
}
