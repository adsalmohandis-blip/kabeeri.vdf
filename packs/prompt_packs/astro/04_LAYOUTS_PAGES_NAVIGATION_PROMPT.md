# 04 — Layouts, Pages, and Navigation Prompt

## Goal

Create layouts, pages, and navigation foundation for the first release.

## Context for the AI coding assistant

This prompt sets up visible site structure without building every section.

## Information the user should provide before running this prompt

- What pages should exist in the first version?
- Is the site Arabic, English, or bilingual?
- Is RTL support needed?
- What should appear in the main navigation?

## Files and areas allowed for this prompt

```text
src/pages/
src/layouts/
src/components/
src/assets/
public/
```

## Files and areas forbidden for this prompt

```text
Unrelated features
Backend/database changes
Advanced integrations
```

## Tasks

1. Review the required first-release pages from the user's project plan.
2. Create only the pages needed for the first release.
3. Add a base layout.
4. Add header/footer/navigation.
5. Add empty states or placeholders for pages not ready yet.
6. Support Arabic/English direction only if required by scope.
7. Do not build advanced feature logic in this prompt.


## Checks to run

```bash
npm run build
```

## Acceptance criteria

- Required pages exist.
- Layout and navigation are clear.
- No extra future pages are added.
- The site builds successfully.


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
