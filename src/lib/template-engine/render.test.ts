import { describe, it, expect } from "vitest";

import type {
  CvDocument,
  Profile,
  ThemeDefinition,
} from "@/lib/types";

import { renderCv } from "./render";
import { buildRenderContext } from "./context";

const mockProfile: Profile = {
  id: "profile-1",
  name: { fr: "Ugo Popee", en: "Ugo Popee" },
  title: { fr: "Ingénieur Logiciel", en: "Software Engineer" },
  email: { fr: "ugo@p0p.ee" },
  phone: { fr: "06 84 43 36 03" },
  website: { fr: "https://github.com/bil0u" },
  location: { fr: "Toulouse, France" },
  socialLinks: [
    { platform: "github", url: "https://github.com/bil0u", label: { fr: "bil0u" } },
  ],
  meta: [
    { key: "nationality", label: { fr: "Nationalité" }, value: { fr: "Français" } },
  ],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const mockDoc: CvDocument = {
  id: "cv-1",
  name: "Test CV",
  profileId: "profile-1",
  profileOverrides: {},
  sections: [
    {
      id: "sec-intro",
      type: "introduction",
      title: { fr: "A propos de moi" },
      visible: true,
      content: { fr: "Passionné par l'informatique." },
    },
    {
      id: "sec-exp",
      type: "experience",
      title: { fr: "Expérience" },
      visible: true,
      items: [
        {
          id: "exp-1",
          organization: { fr: "Freelance" },
          role: { fr: "Développeur full-stack" },
          category: "freelance" as const,
          startDate: "2017-03",
          description: { fr: "Développement web et mobile." },
          highlights: [{ fr: "API REST en Go" }],
          location: { fr: "Toulouse" },
        },
      ],
    },
    {
      id: "sec-skills",
      type: "skills",
      title: { fr: "Compétences" },
      visible: true,
      categories: [
        {
          id: "cat-1",
          name: { fr: "Langages" },
          skills: [
            { id: "sk-1", name: { fr: "Python" } },
            { id: "sk-2", name: { fr: "Go" } },
          ],
        },
      ],
    },
    {
      id: "sec-hidden",
      type: "references",
      title: { fr: "Références" },
      visible: false,
      items: [],
    },
  ],
  themeId: "classic",
  defaultLocale: "fr",
  availableLocales: ["fr", "en"],
  pageFormat: "A4",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const mockTheme: ThemeDefinition = {
  id: "test-theme",
  name: "Test Theme",
  description: "A test theme",
  author: "Test",
  version: "0.1.0",
  layouts: [
    {
      id: "default",
      name: "Default",
      template: "layout",
      slots: [{ name: "main", label: "Main", acceptedSectionTypes: [] }],
    },
  ],
  defaultLayoutId: "default",
  css: `:root { --cv-accent-color: #2563eb; }
.cv-document { font-family: sans-serif; }
.cv-section { margin-block-end: 1em; }`,
  templates: {
    layout: `<div class="cv-document">
  <header><h1>{{ profile.name }}</h1><p>{{ profile.title }}</p></header>
  {% for section in sections %}
    <section class="cv-section cv-section--{{ section.type }}">
      <h2>{{ section.title }}</h2>
      {% render section.type, section: section %}
    </section>
  {% endfor %}
</div>`,
    introduction: `<p>{{ section.content }}</p>`,
    experience: `{% for item in section.items %}
<div class="cv-item">
  <strong>{{ item.role }}</strong> at {{ item.organization }}
  <span>{{ item.startDate | format_date: "MMM yyyy" }} – {{ item.endDate | format_date: "MMM yyyy", "Present" }}</span>
  <p>{{ item.description }}</p>
  {% if item.highlights.size > 0 %}
  <ul>{% for h in item.highlights %}<li>{{ h }}</li>{% endfor %}</ul>
  {% endif %}
</div>
{% endfor %}`,
    skills: `{% for cat in section.categories %}
<div class="cv-skills">
  <h3>{{ cat.name }}</h3>
  {% for skill in cat.skills %}<span class="cv-tag">{{ skill.name }}</span>{% endfor %}
</div>
{% endfor %}`,
    _default: `<p>{{ section.title }}</p>`,
  },
  fonts: [],
  customizableProperties: [],
};

describe("buildRenderContext", () => {
  it("resolves translatable fields to the active locale", () => {
    const ctx = buildRenderContext(mockDoc, mockProfile, "fr", {
      name: "Test",
      version: "0.1.0",
    });

    expect(ctx.profile.name).toBe("Ugo Popee");
    expect(ctx.profile.title).toBe("Ingénieur Logiciel");
    expect(ctx.profile.email).toBe("ugo@p0p.ee");
    expect(ctx.profile.location).toBe("Toulouse, France");
  });

  it("falls back to first available locale when active locale is missing", () => {
    const ctx = buildRenderContext(mockDoc, mockProfile, "de", {
      name: "Test",
      version: "0.1.0",
    });

    // Should fall back to 'fr' (first key)
    expect(ctx.profile.name).toBe("Ugo Popee");
    expect(ctx.profile.title).toBe("Ingénieur Logiciel");
  });

  it("filters out invisible sections", () => {
    const ctx = buildRenderContext(mockDoc, mockProfile, "fr", {
      name: "Test",
      version: "0.1.0",
    });

    expect(ctx.sections).toHaveLength(3);
    expect(ctx.sections.map((s) => s.type)).toEqual([
      "introduction",
      "experience",
      "skills",
    ]);
  });

  it("resolves section items correctly", () => {
    const ctx = buildRenderContext(mockDoc, mockProfile, "fr", {
      name: "Test",
      version: "0.1.0",
    });

    const expSection = ctx.sections.find((s) => s.type === "experience");
    const items = expSection?.items as Array<Record<string, unknown>>;
    expect(items).toHaveLength(1);
    expect(items[0]?.role).toBe("Développeur full-stack");
    expect(items[0]?.organization).toBe("Freelance");
    expect(items[0]?.endDate).toBe("");
  });

  it("resolves skill categories", () => {
    const ctx = buildRenderContext(mockDoc, mockProfile, "fr", {
      name: "Test",
      version: "0.1.0",
    });

    const skillsSection = ctx.sections.find((s) => s.type === "skills");
    const categories = skillsSection?.categories as Array<Record<string, unknown>>;
    expect(categories).toHaveLength(1);
    expect(categories[0]?.name).toBe("Langages");
  });

  it("puts all sections in 'main' slot when no slot mapping exists", () => {
    const ctx = buildRenderContext(mockDoc, mockProfile, "fr", {
      name: "Test",
      version: "0.1.0",
    });

    expect(ctx.slots.main).toHaveLength(3);
  });

  it("groups sections by slot mapping", () => {
    const docWithSlots = {
      ...mockDoc,
      sectionSlotMapping: {
        "sec-intro": "main",
        "sec-exp": "main",
        "sec-skills": "sidebar",
      },
    };

    const ctx = buildRenderContext(docWithSlots, mockProfile, "fr", {
      name: "Test",
      version: "0.1.0",
    });

    expect(ctx.slots.main).toHaveLength(2);
    expect(ctx.slots.sidebar).toHaveLength(1);
    expect(ctx.slots.sidebar![0]!.type).toBe("skills");
  });

  it("resolves page dimensions for A4", () => {
    const ctx = buildRenderContext(mockDoc, mockProfile, "fr", {
      name: "Test",
      version: "0.1.0",
    });

    expect(ctx.page.format).toBe("A4");
    expect(ctx.page.width).toBe("210mm");
    expect(ctx.page.height).toBe("297mm");
  });

  it("resolves profile social links", () => {
    const ctx = buildRenderContext(mockDoc, mockProfile, "fr", {
      name: "Test",
      version: "0.1.0",
    });

    expect(ctx.profile.socialLinks).toHaveLength(1);
    expect(ctx.profile.socialLinks[0]?.platform).toBe("github");
    expect(ctx.profile.socialLinks[0]?.label).toBe("bil0u");
  });

  it("resolves profile meta fields", () => {
    const ctx = buildRenderContext(mockDoc, mockProfile, "fr", {
      name: "Test",
      version: "0.1.0",
    });

    expect(ctx.profile.meta).toHaveLength(1);
    expect(ctx.profile.meta[0]?.key).toBe("nationality");
    expect(ctx.profile.meta[0]?.value).toBe("Français");
  });
});

describe("renderCv", () => {
  it("renders a CV document to HTML and CSS", async () => {
    const result = await renderCv(mockDoc, mockProfile, mockTheme, "fr");

    expect(result.html).toContain("Ugo Popee");
    expect(result.html).toContain("Ingénieur Logiciel");
    expect(result.html).toContain("Développeur full-stack");
    expect(result.html).toContain("Freelance");
    expect(result.css).toContain("--cv-accent-color");
  });

  it("sanitizes the output HTML", async () => {
    const themeWithScript = {
      ...mockTheme,
      templates: {
        ...mockTheme.templates,
        layout: `<div><script>alert('xss')</script>{{ profile.name }}</div>`,
      },
    };

    const result = await renderCv(mockDoc, mockProfile, themeWithScript, "fr");
    expect(result.html).not.toContain("<script>");
    expect(result.html).toContain("Ugo Popee");
  });

  it("uses the _default partial for unknown section types", async () => {
    // The test theme has no 'introduction' partial but has _default
    const themeWithoutIntro = {
      ...mockTheme,
      templates: {
        ...mockTheme.templates,
        introduction: undefined,
      },
    };
    // Remove the introduction template so it falls back to _default
    delete (themeWithoutIntro.templates as Record<string, string | undefined>)
      .introduction;

    const result = await renderCv(
      mockDoc,
      mockProfile,
      themeWithoutIntro,
      "fr",
    );

    // Should render without error, using _default partial
    expect(result.html).toContain("A propos de moi");
  });

  it("applies user theme overrides to CSS", async () => {
    const docWithOverrides = {
      ...mockDoc,
      themeOverrides: {
        simpleOverrides: { "--cv-accent-color": "#ff0000" },
      },
    };

    const result = await renderCv(
      docWithOverrides,
      mockProfile,
      mockTheme,
      "fr",
    );

    expect(result.css).toContain("--cv-accent-color: #ff0000");
  });

  it("renders experience dates with format_date filter", async () => {
    const result = await renderCv(mockDoc, mockProfile, mockTheme, "fr");
    // The date "2017-03" should be formatted
    expect(result.html).toContain("2017");
    // endDate is empty, should show "Present"
    expect(result.html).toContain("Present");
  });

  it("renders skill tags", async () => {
    const result = await renderCv(mockDoc, mockProfile, mockTheme, "fr");
    expect(result.html).toContain("Python");
    expect(result.html).toContain("Go");
    expect(result.html).toContain("cv-tag");
  });

  it("does not render hidden sections", async () => {
    const result = await renderCv(mockDoc, mockProfile, mockTheme, "fr");
    expect(result.html).not.toContain("Références");
  });
});
