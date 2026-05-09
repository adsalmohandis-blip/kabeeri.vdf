# 09 — Admin Dashboard Prompt

## Goal

Create a simple admin/dashboard foundation if the first release needs it.

## Context for the AI coding assistant

This prompt is optional and should be used only if an admin or dashboard area is needed.

## Information the user should provide before running this prompt

- Does the product need an admin/dashboard?
- Who can access it?
- What are the first 3–5 dashboard sections?
- Should it be simple cards, tables, forms, or all?

## Files and areas allowed for this prompt

```text
app/
pages/
components/admin/
components/dashboard/
lib/
middleware.*
```

## Files and areas forbidden for this prompt

```text
Advanced analytics
Full backoffice system
Unrelated modules
```

## Tasks

1. Ask whether the first release needs an admin/dashboard.
2. Create a simple dashboard route.
3. Protect dashboard route if authentication exists.
4. Add simple dashboard layout and navigation.
5. Add placeholder cards only for confirmed sections.
6. Do not build advanced charts, analytics, or full admin modules.


## Checks to run

```bash
npm run lint
npm run build
```

## Acceptance criteria

- Dashboard exists only if needed.
- Access protection is clear if needed.
- Layout is simple.
- No advanced admin scope is added.


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
