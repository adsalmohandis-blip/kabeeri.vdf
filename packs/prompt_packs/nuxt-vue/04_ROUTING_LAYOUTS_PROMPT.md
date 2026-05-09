# 04 — Routing, Layouts, and Navigation Prompt

## Goal

Create routing, layouts, and navigation foundation for the first release.

## Context for the AI coding assistant

This prompt sets up visible structure without building every page.

## Information the user should provide before running this prompt

- What pages should exist in the first version?
- Is the product Arabic, English, or bilingual?
- Is RTL support needed?
- What should appear in the main navigation?

## Files and areas allowed for this prompt

```text
pages/
app/
layouts/
components/navigation/
components/layout/
router files if Vue SPA
assets/
```

## Files and areas forbidden for this prompt

```text
Unrelated features
Advanced dashboard logic
Backend/database changes
```

## Tasks

1. Review the required first-release pages from the user's project plan.
2. Create only the routes needed for the first release.
3. Add a base layout.
4. Add simple navigation.
5. Add empty states or placeholders for pages not ready yet.
6. Support Arabic/English direction only if required by scope.
7. Do not build advanced feature logic in this prompt.


## Checks to run

```bash
npm run lint
npm run build
```

## Acceptance criteria

- Required routes exist.
- Layout and navigation are clear.
- No extra future pages are added.
- The app builds successfully.


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
