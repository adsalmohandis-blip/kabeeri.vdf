# 09 — Validation and Error Handling Prompt

## Goal

Add validation pipes, exception filters, and consistent error response style.

## Context for the AI coding assistant

This prompt improves API safety and consistency without adding product features.

## Information the user should provide before running this prompt

- What errors should users/API clients see clearly?
- Which fields need validation?
- Are there sensitive fields that must never appear in errors?

## Files and areas allowed for this prompt

```text
src/common/
src/main.ts
src/modules/ only for small validation fixes
test/
```

## Files and areas forbidden for this prompt

```text
New product features
Full observability stack
Unrelated modules
```

## Tasks

1. Review validation approach.
2. Add global validation pipe if suitable.
3. Add DTO validation where needed.
4. Add consistent error response style.
5. Add exception filter only if useful.
6. Avoid leaking sensitive error details.
7. Add tests for validation/error cases where useful.
8. Do not add product features.


## Checks to run

```bash
npm run lint
npm run test
npm run build
```

## Acceptance criteria

- Validation is consistent.
- Error responses are understandable.
- Sensitive data is not exposed.
- No product scope was added.


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
