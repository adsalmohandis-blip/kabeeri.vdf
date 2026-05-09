# 09 — Core Features Prompt

## Goal

Create first product-specific React feature based on KVDF docs.

## Context for the AI coding assistant

Build one small V1 feature area.

## Information the user should provide before running this prompt

- First feature users must use?
- What data shown/collected?
- What waits until later?

## Files and areas allowed for this prompt

```text
src/pages/
src/components/
src/hooks/
src/lib/
src/api/
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

1. Read product docs.
2. Implement one V1 feature.
3. Use existing UI/data patterns.
4. Add states.
5. Do not add future modules.

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
