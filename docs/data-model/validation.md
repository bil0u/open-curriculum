# Validation Rules

For each predefined section type, the following tables specify which fields are **required** (must be present and non-empty in the default locale) and which are **optional** (may be omitted or empty). Validation is non-blocking: missing required fields produce warnings, not errors, so users are never prevented from saving.

---

## Introduction Section

| Field | Required | Notes |
|-------|----------|-------|
| `content` | Yes | Translatable text; length should match theme's slot recommendation |

## Experience Section Items

| Field | Required | Notes |
|-------|----------|-------|
| `organization` | No | Company, NGO, military unit, etc. Optional for freelancers/self-employed |
| `role` | Yes | |
| `category` | Yes | Defaults to `'work'` |
| `startDate` | Yes | |
| `endDate` | No | Omitted for current/ongoing positions |
| `description` | Yes | |
| `location` | No | |
| `highlights` | No | Empty array is valid |

## Education Section Items

| Field | Required | Notes |
|-------|----------|-------|
| `institution` | Yes | |
| `degree` | Yes | |
| `field` | Yes | |
| `startDate` | Yes | |
| `endDate` | No | Omitted if still enrolled |
| `description` | No | |
| `grade` | No | |

## Skills Section Categories

| Field | Required | Notes |
|-------|----------|-------|
| `name` (category) | Yes | |
| `skills` | Yes | At least one skill per category |
| `skills[].name` | Yes | |

## Languages Section Items

| Field | Required | Notes |
|-------|----------|-------|
| `language` | Yes | |
| `proficiency` | Yes | E.g., "Native", "C1", "Fluent" |
| `certification` | No | E.g., "TOEFL 110", "DELF B2" |

## Projects Section Items

| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | |
| `description` | Yes | |
| `url` | No | |
| `tags` | No | Generic tags (technologies, tools, materials, etc.) |
| `highlights` | No | Empty array is valid |

## Interests Section Categories

| Field | Required | Notes |
|-------|----------|-------|
| `name` (category) | Yes | E.g., "Cuisine", "Sports" |
| `description` | No | Optional rich description per category |
| `items` | No | Simple list items within category; empty array valid if description provided |

## Certifications Section Items

| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | |
| `issuer` | Yes | |
| `date` | Yes | |
| `url` | No | |

## Publications Section Items

| Field | Required | Notes |
|-------|----------|-------|
| `title` | Yes | |
| `publisher` | Yes | |
| `date` | Yes | |
| `url` | No | |
| `description` | No | |
| `coAuthors` | No | Empty array is valid |

## References Section Items

| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | |
| `company` | Yes | |
| `role` | Yes | |
| `contact` | No | May be withheld ("available on request") |
| `quote` | No | |

## Freeform Section

| Field | Required | Notes |
|-------|----------|-------|
| `content` | Yes | Translatable markdown string; must be non-empty in default locale |

## Section Base (All Types)

| Field | Required | Notes |
|-------|----------|-------|
| `id` | Yes | Auto-generated |
| `type` | Yes | Discriminant |
| `title` | Yes | Must be non-empty in default locale |
| `order` | Yes | Non-negative integer |
| `visible` | Yes | Defaults to `true` |

## Profile

| Field | Required | Notes |
|-------|----------|-------|
| `id` | Yes | Auto-generated |
| `name` | Yes | |
| `title` | No | |
| `email` | No | |
| `phone` | No | |
| `website` | No | |
| `location` | No | |
| `photo` | No | |
| `socialLinks` | No | Empty array is valid |
| `meta` | No | Miscellaneous info (driving license, nationality, etc.) |
