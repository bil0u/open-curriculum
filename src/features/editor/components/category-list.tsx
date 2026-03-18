import { useState } from "react";

import { useTranslation } from "@/lib/i18n";
import { useCvStore } from "@/lib/store";
import type {
  EntityId,
  InterestCategory,
  InterestsSection,
  Section,
  Skill,
  SkillCategory,
  SkillsSection,
  Translatable,
} from "@/lib/types";
import { Button, ChevronDownIcon, ConfirmDialog, IconButton, TrashIcon } from "@/lib/ui";
import { generateId } from "@/lib/utils";

import { TranslatableField } from "./translatable-field";

interface CategoryListProps {
  section: SkillsSection | InterestsSection;
}

export function CategoryList({ section }: CategoryListProps) {
  const { t } = useTranslation("editor");
  const { t: tCommon } = useTranslation("common");
  const updateSection = useCvStore((s) => s.updateSection);
  const activeLocale = useCvStore((s) => s.activeLocale);

  const [expandedCategoryId, setExpandedCategoryId] = useState<EntityId | null>(null);
  const [confirmRemoveCategoryId, setConfirmRemoveCategoryId] = useState<EntityId | null>(null);

  const isSkills = section.type === "skills";

  if (isSkills) {
    const skillsSection = section as SkillsSection;
    const categories = skillsSection.categories;

    const updateCategories = (cats: SkillCategory[]) => {
      updateSection(section.id, { categories: cats } as Partial<Section>);
    };

    return (
      <div className="flex flex-col gap-2">
        {categories.map((cat) => {
          const isExpanded = cat.id === expandedCategoryId;
          return (
            <div key={cat.id} className="border border-gray-200 rounded-md">
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="flex-1 truncate text-sm text-gray-700">
                  {cat.name[activeLocale] ?? (
                    <span className="text-gray-400 italic">
                      {t("fields.category_name")}
                    </span>
                  )}
                </span>
                <IconButton
                  aria-label={t("fields.remove_category")}
                  variant="danger"
                  size="sm"
                  onPress={() => setConfirmRemoveCategoryId(cat.id)}
                >
                  <TrashIcon />
                </IconButton>
                <IconButton
                  aria-label={isExpanded ? t("sections.collapse") : t("sections.expand")}
                  size="sm"
                  onPress={() =>
                    setExpandedCategoryId(isExpanded ? null : cat.id)
                  }
                >
                  <ChevronDownIcon rotated={isExpanded} />
                </IconButton>
              </div>
              {isExpanded && (
                <div className="border-t border-gray-100 px-3 pb-3 pt-2 flex flex-col gap-3">
                  <TranslatableField
                    label={t("fields.category_name")}
                    value={cat.name}
                    onChange={(val) => {
                      updateCategories(
                        categories.map((c) =>
                          c.id === cat.id ? { ...c, name: val } : c,
                        ),
                      );
                    }}
                    isRequired

                  />
                  <div className="flex flex-col gap-1.5">
                    {cat.skills.map((skill) => (
                      <div key={skill.id} className="flex items-end gap-2">
                        <div className="flex-1">
                          <TranslatableField
                            label={t("fields.skill_name")}
                            value={skill.name}
                            onChange={(val) => {
                              updateCategories(
                                categories.map((c) =>
                                  c.id === cat.id
                                    ? {
                                        ...c,
                                        skills: c.skills.map((s) =>
                                          s.id === skill.id
                                            ? { ...s, name: val }
                                            : s,
                                        ),
                                      }
                                    : c,
                                ),
                              );
                            }}
        
                          />
                        </div>
                        <IconButton
                          aria-label={t("fields.remove_skill")}
                          variant="danger"
                          size="sm"
                          onPress={() => {
                            updateCategories(
                              categories.map((c) =>
                                c.id === cat.id
                                  ? {
                                      ...c,
                                      skills: c.skills.filter(
                                        (s) => s.id !== skill.id,
                                      ),
                                    }
                                  : c,
                              ),
                            );
                          }}
                        >
                          <TrashIcon />
                        </IconButton>
                      </div>
                    ))}
                    <Button
                      variant="secondary"
                      size="sm"
                      onPress={() => {
                        const newSkill: Skill = {
                          id: generateId(),
                          name: {} as Translatable,
                        };
                        updateCategories(
                          categories.map((c) =>
                            c.id === cat.id
                              ? { ...c, skills: [...c.skills, newSkill] }
                              : c,
                          ),
                        );
                      }}
                    >
                      {t("fields.add_skill")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <Button
          variant="secondary"
          size="sm"
          onPress={() => {
            const newCat: SkillCategory = {
              id: generateId(),
              name: {} as Translatable,
              skills: [],
            };
            updateCategories([...categories, newCat]);
            setExpandedCategoryId(newCat.id);
          }}
        >
          {t("fields.add_category")}
        </Button>

        <ConfirmDialog
          isOpen={confirmRemoveCategoryId !== null}
          onCancel={() => setConfirmRemoveCategoryId(null)}
          onConfirm={() => {
            if (confirmRemoveCategoryId) {
              updateCategories(
                categories.filter((c) => c.id !== confirmRemoveCategoryId),
              );
            }
          }}
          title={t("fields.remove_category")}
          message={t("sections.delete_confirm")}
          confirmLabel={tCommon("actions.delete")}
          cancelLabel={tCommon("actions.cancel")}
        />
      </div>
    );
  }

  // Interests section
  const interestsSection = section as InterestsSection;
  const categories = interestsSection.categories;

  const updateCategories = (cats: InterestCategory[]) => {
    updateSection(section.id, { categories: cats } as Partial<Section>);
  };

  return (
    <div className="flex flex-col gap-2">
      {categories.map((cat) => {
        const isExpanded = cat.id === expandedCategoryId;
        return (
          <div key={cat.id} className="border border-gray-200 rounded-md">
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="flex-1 truncate text-sm text-gray-700">
                {cat.name[activeLocale] ?? (
                  <span className="text-gray-400 italic">
                    {t("fields.category_name")}
                  </span>
                )}
              </span>
              <IconButton
                aria-label={t("fields.remove_category")}
                variant="danger"
                size="sm"
                onPress={() => setConfirmRemoveCategoryId(cat.id)}
              >
                <TrashIcon />
              </IconButton>
              <IconButton
                aria-label={isExpanded ? t("sections.collapse") : t("sections.expand")}
                size="sm"
                onPress={() =>
                  setExpandedCategoryId(isExpanded ? null : cat.id)
                }
              >
                <ChevronDownIcon rotated={isExpanded} />
              </IconButton>
            </div>
            {isExpanded && (
              <div className="border-t border-gray-100 px-3 pb-3 pt-2 flex flex-col gap-3">
                <TranslatableField
                  label={t("fields.category_name")}
                  value={cat.name}
                  onChange={(val) => {
                    updateCategories(
                      categories.map((c) =>
                        c.id === cat.id ? { ...c, name: val } : c,
                      ),
                    );
                  }}
                  isRequired
                />
                <TranslatableField
                  label={t("fields.category_description")}
                  value={cat.description ?? ({} as Translatable)}
                  onChange={(val) => {
                    updateCategories(
                      categories.map((c) =>
                        c.id === cat.id ? { ...c, description: val } : c,
                      ),
                    );
                  }}
                  multiline
                />
                <div className="flex flex-col gap-1.5">
                  {cat.items.map((item, idx) => (
                    <div key={idx} className="flex items-end gap-2">
                      <div className="flex-1">
                        <TranslatableField
                          label={t("fields.interest_item")}
                          value={item}
                          onChange={(val) => {
                            updateCategories(
                              categories.map((c) =>
                                c.id === cat.id
                                  ? {
                                      ...c,
                                      items: c.items.map((it, i) =>
                                        i === idx ? val : it,
                                      ),
                                    }
                                  : c,
                              ),
                            );
                          }}
      
                        />
                      </div>
                      <IconButton
                        aria-label={t("fields.remove_interest")}
                        variant="danger"
                        size="sm"
                        onPress={() => {
                          updateCategories(
                            categories.map((c) =>
                              c.id === cat.id
                                ? {
                                    ...c,
                                    items: c.items.filter((_, i) => i !== idx),
                                  }
                                : c,
                            ),
                          );
                        }}
                      >
                        <TrashIcon />
                      </IconButton>
                    </div>
                  ))}
                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={() => {
                      const newItem: Translatable = {} as Translatable;
                      updateCategories(
                        categories.map((c) =>
                          c.id === cat.id
                            ? { ...c, items: [...c.items, newItem] }
                            : c,
                        ),
                      );
                    }}
                  >
                    {t("fields.add_interest")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <Button
        variant="secondary"
        size="sm"
        onPress={() => {
          const newCat: InterestCategory = {
            id: generateId(),
            name: {} as Translatable,
            items: [],
          };
          updateCategories([...categories, newCat]);
          setExpandedCategoryId(newCat.id);
        }}
      >
        {t("fields.add_category")}
      </Button>

      <ConfirmDialog
        isOpen={confirmRemoveCategoryId !== null}
        onCancel={() => setConfirmRemoveCategoryId(null)}
        onConfirm={() => {
          if (confirmRemoveCategoryId) {
            updateCategories(
              categories.filter((c) => c.id !== confirmRemoveCategoryId),
            );
          }
        }}
        title={t("fields.remove_category")}
        message={t("sections.delete_confirm")}
        confirmLabel={tCommon("actions.delete")}
        cancelLabel={tCommon("actions.cancel")}
      />
    </div>
  );
}
