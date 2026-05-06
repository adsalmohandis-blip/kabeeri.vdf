# 10 — Validation and Error Handling Prompt

## Goal

Add model validation, controller error handling, and user/API feedback patterns.

## Context for the AI coding assistant

This prompt improves safety and consistency without adding product features.

## Information the user should provide before running this prompt

- What errors should users/API clients see clearly?
- Which fields need validation?
- Is the app full-stack HTML, API-only, or both?

## Files and areas allowed for this prompt

```text
app/models/
app/controllers/
app/views/
app/errors/
test/
spec/
```

## Files and areas forbidden for this prompt

```text
New product features
Full observability stack
Unrelated modules
```

## Tasks

1. Review model validations.
2. Add useful validation messages.
3. Add consistent handling for not found, unauthorized, invalid input, and failed saves.
4. For API-only apps, standardize JSON error responses.
5. For full-stack apps, improve form error display.
6. Avoid leaking sensitive error details.
7. Add tests for validation/error cases where useful.
8. Do not add product features.


## Checks to run

```bash
bin/rails test
```

## Acceptance criteria

- Validation is consistent.
- Error responses/messages are understandable.
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
