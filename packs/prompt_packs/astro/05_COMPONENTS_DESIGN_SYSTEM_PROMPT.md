# 05 — Components and Design System Prompt

## Goal

Create a simple UI foundation and reusable component rules.

## Context for the AI coding assistant

This prompt makes the site visually consistent without overbuilding a full design system.

## Information the user should provide before running this prompt

- What style should the site feel like? Simple, modern, enterprise, playful, luxury, etc.
- Are there brand colors?
- Is Arabic/RTL important?
- Do you want custom components or a UI library?

## Files and areas allowed for this prompt

```text
src/components/
src/styles/
src/assets/
src/layouts/
public/
tailwind.config.* if used
```

## Files and areas forbidden for this prompt

```text
Product logic
API/database changes
Unrelated pages
```

## Tasks

1. Identify the desired visual style from the user's answers.
2. Add or organize basic UI components such as Button, Card, Input, Badge, EmptyState, SectionHeader, CTASection.
3. Keep components simple and reusable.
4. Add accessibility-friendly defaults where possible.
5. Add RTL-friendly structure if needed.
6. Do not create a large component library.
7. Do not change business logic.


## Checks to run

```bash
npm run build
```

## Acceptance criteria

- Basic UI components exist or are organized.
- Visual style is consistent.
- Components are beginner-friendly.
- Site still builds.


## Important scope rule

Do not build features outside this prompt.  
Do not create advanced modules unless they are explicitly listed above.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Commands run:
Tests/checks result:
Manual review notes:
Next recommended prompt:
```
