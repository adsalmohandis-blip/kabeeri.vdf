# 06 — State and Composables Prompt

## Goal

Add composables and state management foundation where useful.

## Context for the AI coding assistant

This prompt organizes shared frontend logic without adding product features everywhere.

## Information the user should provide before running this prompt

- What logic repeats across pages?
- Does the app need global state?
- Should auth/user data be shared across the app?
- Technical note: If unsure, ask ChatGPT whether composables alone are enough or Pinia is needed.

## Files and areas allowed for this prompt

```text
composables/
stores/
plugins/
lib/
components/
```

## Files and areas forbidden for this prompt

```text
Unrelated features
Large architecture rewrites
Backend changes
```

## Tasks

1. Identify shared logic needed in the first release.
2. Create composables for repeated logic such as API calls, auth state, UI state, filters, or forms.
3. Use Pinia or other state management only if needed.
4. Keep state simple and readable.
5. Do not create global stores for every possible future feature.
6. Add small usage examples only where helpful.


## Checks to run

```bash
npm run lint
npm run build
npm test
```

## Acceptance criteria

- Shared logic has a clear place.
- State/composables are simple.
- No unnecessary global state is created.
- App still builds.


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
