# 11 — Testing and Review Prompt

## Goal

Review current Angular implementation and improve checks.

## Context for the AI coding assistant

No new features.

## Information the user should provide before running this prompt

- Implemented features?
- Known bugs?
- Risky pages?

## Files and areas allowed for this prompt

```text
src/
README.md
package.json only for scripts
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

1. Review lint/build/test.
2. Check accessibility basics.
3. Check loading/empty/error states.
4. Fix small issues.
5. Document checks.

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
