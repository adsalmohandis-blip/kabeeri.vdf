# 06 — State Management Prompt

## Goal

Add simple state management only if needed.

## Context for the AI coding assistant

Organize shared state without overbuilding.

## Information the user should provide before running this prompt

- What state is shared?
- Does auth/user data need global access?
- Are server requests cached?

## Files and areas allowed for this prompt

```text
src/composables/
src/stores/
src/context/
src/lib/
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

1. Identify shared state.
2. Choose simplest approach: local state, Pinia, composables, provide/inject, TanStack Query, or other.
3. Do not create global state for future features.
4. Add one small pattern.

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
