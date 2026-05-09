# 03 — Environment, Config, and API Prompt

## Goal

Configure environment and API settings safely.

## Context for the AI coding assistant

Prepare config before features.

## Information the user should provide before running this prompt

- API base URL?
- Local/staging/production config needed?
- Any auth/CMS/storage provider?

## Files and areas allowed for this prompt

```text
src/environments/
src/app/core/config/
README.md
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

1. Review environment files.
2. Add API URL placeholder.
3. Explain public frontend config rules.
4. Do not commit secrets.
5. Add README notes.

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
