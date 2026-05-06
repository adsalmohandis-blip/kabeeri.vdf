# 10 — Forms and Validation Prompt

## Goal

Add reusable form and validation foundation.

## Context for the AI coding assistant

Prevent messy forms.

## Information the user should provide before running this prompt

- What forms are needed?
- Required fields?
- What happens after submit?

## Files and areas allowed for this prompt

```text
src/components/forms/
src/lib/validation*
src/pages/
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

1. Identify V1 forms.
2. Add form pattern.
3. Add validation and error messages.
4. Add loading/success states.

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
