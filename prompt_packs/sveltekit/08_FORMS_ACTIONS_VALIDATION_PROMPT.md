# 08 — Forms, Actions, and Validation Prompt

## Goal

Add reusable form, SvelteKit actions, and validation foundation.

## Context for the AI coding assistant

This prompt helps prevent messy form handling across the app.

## Information the user should provide before running this prompt

- What forms are needed first? Contact, login, create item, edit profile, etc.
- What fields are required?
- What should happen after submit?
- Technical note: If unsure about validation rules, ask ChatGPT to help write them from product requirements.

## Files and areas allowed for this prompt

```text
src/routes/
src/lib/components/forms/
src/lib/validation*
src/lib/server/
tests/
package.json if validation package is required
```

## Files and areas forbidden for this prompt

```text
Unrelated features
Advanced workflow engines
Secrets
```

## Tasks

1. Identify which first-release forms are needed.
2. Decide whether forms should use SvelteKit form actions, client-side submit, or API calls.
3. Add a simple reusable form pattern.
4. Add validation using the selected approach.
5. Show useful error messages.
6. Add loading/success states.
7. Do not build all future forms.
8. Do not add heavy libraries unless justified.


## Checks to run

```bash
npm run check
npm run build
npm test
```

## Acceptance criteria

- Form/action pattern is clear.
- Validation is understandable.
- Error and success states are handled.
- Scope is limited to first-release forms.


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
