# 02 — App Structure Prompt

## Goal

Review or prepare a clean Vue project structure.

## Context for the AI coding assistant

Organize the Vue codebase without implementing business features.

## Information the user should provide before running this prompt

- Lite, Standard, or Enterprise?
- TypeScript or JavaScript?
- Vite, CRA, custom, or unknown?
- Tailwind, CSS modules, plain CSS, or UI library?

## Files and areas allowed for this prompt

```text
src/
src/components/
src/views/pages/
src/layouts/
src/composables/
src/lib/
src/assets/
public/
package.json
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

1. Inspect current structure.
2. Suggest simple folders for project size.
3. Explain where views/pages, components, composables, services, and tests go.
4. Do not add features.

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
