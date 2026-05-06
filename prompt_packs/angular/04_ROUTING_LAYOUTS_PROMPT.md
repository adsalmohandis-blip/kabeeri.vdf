# 04 — Routing, Layouts, and Navigation Prompt

## Goal

Create Angular routing, layouts, and navigation foundation.

## Context for the AI coding assistant

Set visible structure without building all pages.

## Information the user should provide before running this prompt

- What pages are needed in V1?
- Arabic, English, or bilingual?
- Is RTL needed?
- What nav items?

## Files and areas allowed for this prompt

```text
src/app/app.routes.*
src/app/layouts/
src/app/shared/
src/app/features/
```

## Files and areas forbidden for this prompt

```text
docs/
generators/
questionnaires/
prompt_packs/
Unrelated future modules
Real secrets
```

## Tasks

1. Add only V1 routes.
2. Add base layout.
3. Add navigation.
4. Add placeholders/empty states.
5. Do not add future pages.

## Checks to run

```bash
npm run lint
npm run build
npm test
```

## Acceptance criteria

- The change is focused and matches first-release scope.
- No unrelated features are added.
- Real secrets are not committed.
- Checks pass or issues are clearly explained.

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
