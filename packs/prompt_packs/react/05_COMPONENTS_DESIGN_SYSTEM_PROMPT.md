# 05 — Components and Design System Prompt

## Goal

Create simple reusable UI components and visual rules.

## Context for the AI coding assistant

Make UI consistent without huge design system.

## Information the user should provide before running this prompt

- Desired style?
- Brand colors?
- RTL/Arabic?
- Custom components or UI library?

## Files and areas allowed for this prompt

```text
src/components/
src/styles/
src/assets/
tailwind.config.*
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

1. Add Button, Card, Input, Badge, EmptyState, LoadingState, PageHeader if useful.
2. Add accessibility-friendly defaults.
3. Keep components simple.
4. Do not change business logic.

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
