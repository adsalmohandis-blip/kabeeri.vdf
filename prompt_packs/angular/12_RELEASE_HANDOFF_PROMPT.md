# 12 — Release Handoff Prompt

## Goal

Prepare handoff summary for current Angular implementation.

## Context for the AI coding assistant

Document what was built and what remains.

## Information the user should provide before running this prompt

- Version/milestone?
- Reviewer?
- Local demo, staging, or production?

## Files and areas allowed for this prompt

```text
README.md
CHANGELOG.md
release_notes.md
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

1. Summarize implementation.
2. List modules/features/components/services/guards.
3. List run/check commands.
4. List limitations and pending tasks.

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
