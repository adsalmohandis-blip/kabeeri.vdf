# 05 — Design System and UI Foundation Prompt

## Goal

Create a simple UI foundation and reusable component rules.

## Context for the AI coding assistant

This prompt makes the app visually consistent without overbuilding a full design system.

## Information the user should provide before running this prompt

- What style should the app feel like? Simple, modern, enterprise, playful, luxury, etc.
- Are there brand colors?
- Is Arabic/RTL important?
- Do you want a ready UI library, custom components, or not sure?

## Files and areas allowed for this prompt

```text
components/
styles/
app/globals.*
tailwind.config.*
public/
```

## Files and areas forbidden for this prompt

```text
Product logic
Database/API changes
Unrelated pages
```

## Tasks

1. Identify the desired visual style from the user's answers.
2. Add or organize basic UI components such as Button, Card, Input, Badge, EmptyState, PageHeader.
3. Keep components simple and reusable.
4. Add accessibility-friendly defaults where possible.
5. Add RTL-friendly structure if needed.
6. Do not create a large component library.
7. Do not change business logic.


## Checks to run

```bash
npm run lint
npm run build
```

## Acceptance criteria

- Basic UI components exist or are organized.
- Visual style is consistent.
- Components are beginner-friendly.
- App still builds.


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
