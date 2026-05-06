# 07 — Auth and Users Prompt

## Goal

Add frontend auth/user foundation if V1 needs login.

## Context for the AI coding assistant

Use only if login/protected UI is needed.

## Information the user should provide before running this prompt

- Does V1 need login?
- Who logs in?
- Auth source: backend API, Supabase, Firebase, Auth0, Clerk, custom JWT?

## Files and areas allowed for this prompt

```text
src/auth/
src/hooks/
src/pages/
src/components/
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

1. Identify auth source.
2. Add protected route pattern if needed.
3. Add minimal user/session display.
4. Do not add complex roles unless required.

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
