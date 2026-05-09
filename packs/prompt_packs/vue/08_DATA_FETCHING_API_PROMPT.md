# 08 — Data Fetching and API Prompt

## Goal

Add API/data fetching foundation.

## Context for the AI coding assistant

Connect UI to backend or mock data safely.

## Information the user should provide before running this prompt

- Data source?
- First page needing real data?
- Mock data or real API?

## Files and areas allowed for this prompt

```text
src/api/
src/lib/
src/composables/
src/views/pages/
src/components/
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

1. Identify data source.
2. Add API client/helper.
3. Add loading/error/empty patterns.
4. Add one sample integration.
5. Do not build all screens.

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
