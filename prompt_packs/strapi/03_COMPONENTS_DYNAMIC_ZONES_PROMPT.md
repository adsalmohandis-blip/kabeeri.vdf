# 03 — Components and Dynamic Zones Prompt

## Goal

Plan reusable Strapi components and dynamic zones if the content model needs flexible page/content building.

## Context for the AI coding assistant

This prompt is optional. Use it when content editors need reusable sections or flexible pages.

## Information the user should provide before running this prompt

- Do content editors need reusable sections?
- What sections appear repeatedly? Hero, FAQ, gallery, CTA, features, pricing?
- Is flexible page building needed now or later?

## Files and areas allowed for this prompt

```text
src/components/
src/api/
content-model-notes.md
README.md
```

## Files and areas forbidden for this prompt

```text
Unrelated content types
Overly complex page builder
Production data
```

## Tasks

1. Ask whether editors need reusable blocks/sections.
2. Identify components such as hero, FAQ, gallery, CTA, feature list, SEO fields, image block.
3. Use dynamic zones only if flexible page composition is required.
4. Keep components simple and reusable.
5. Avoid building a full page builder unless required.
6. Document where each component is used.


## Checks to run

```text
Run Strapi locally if available.
Create a test entry using components.
Check API response shape.
```

## Acceptance criteria

- Components are reusable and simple.
- Dynamic zones are used only when needed.
- Editors can understand what each component is for.
- Scope is not overbuilt.


## Important scope rule

Do not build features outside this prompt.  
Do not expose Strapi secrets or private credentials.  
Do not make private content public by default.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Strapi changes:
Checks to run:
Security/permissions notes:
Manual review notes:
Next recommended prompt:
```
