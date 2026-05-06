# 09 — Validation and Error Handling Prompt

## Goal

Add validation helpers and consistent error response style.

## Context for the AI coding assistant

This prompt improves API safety and consistency without adding product features.

## Information the user should provide before running this prompt

- What errors should API clients see clearly?
- Which fields need validation?
- Are there sensitive fields that must never appear in errors?

## Files and areas allowed for this prompt

```text
internal/validation/
internal/errors/
internal/middleware/
internal/handlers/
tests/
```

## Files and areas forbidden for this prompt

```text
New product features
Full observability stack
Unrelated modules
```

## Tasks

1. Review validation approach.
2. Add request validation pattern if needed.
3. Add consistent error response style.
4. Add not-found and global error handling middleware.
5. Avoid leaking sensitive error details.
6. Add tests for validation/error cases where useful.
7. Do not add product features.


## Checks to run

```bash
go test ./...
go vet ./...
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
