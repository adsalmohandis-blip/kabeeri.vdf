# 07 — Core Models and DTOs Prompt

## Goal

Create first product-specific models and DTOs based on Kabeeri VDF planning documents.

## Context for the AI coding assistant

This prompt should be based on the product documents, not AI guesses.

## Information the user should provide before running this prompt

- What things does the API need to save? Example: products, bookings, invoices, posts, projects, tasks.
- Which of these are needed in the first release?
- Which can wait until later?
- Technical note: If unsure, ask ChatGPT to convert product objects into Go models and DTOs.

## Files and areas allowed for this prompt

```text
internal/models/
internal/dto/
internal/db/
migrations/
tests/
```

## Files and areas forbidden for this prompt

```text
Unplanned future modules
Advanced extension features
Deployment files
```

## Tasks

1. Read the user's product and database notes.
2. Identify only the first-release objects the API needs to store or manage.
3. Create database models only for first-release objects.
4. Create request/response DTOs.
5. Add validation tags or helper validation only where useful.
6. Add relationships that are clearly needed now.
7. Add migrations if migration tooling is present.
8. Add basic tests.
9. Do not add future modules.


## Checks to run

```bash
go test ./...
go vet ./...
```

## Acceptance criteria

- Only first-release models/DTOs were created.
- Models and DTOs match product documents.
- Migrations are clear if used.
- No future features are added.


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
