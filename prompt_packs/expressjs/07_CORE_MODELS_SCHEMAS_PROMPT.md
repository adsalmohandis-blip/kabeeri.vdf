# 07 — Core Models and Schemas Prompt

## Goal

Create first product-specific models and validation schemas based on Kabeeri VDF planning documents.

## Context for the AI coding assistant

This prompt should be based on the product documents, not AI guesses.

## Information the user should provide before running this prompt

- What things does the API need to save? Example: products, bookings, invoices, posts, projects, tasks.
- Which of these are needed in the first release?
- Which can wait until later?
- Technical note: If unsure, ask ChatGPT to convert product objects into database models/schemas.

## Files and areas allowed for this prompt

```text
src/models/
src/schemas/
src/db/
prisma/
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
4. Create validation schemas for request/response objects.
5. Add relationships that are clearly needed now.
6. Add migrations if migration tooling is present.
7. Add basic tests.
8. Do not add future modules.


## Checks to run

```bash
npm run lint
npm test
npm run build
```

## Acceptance criteria

- Only first-release models/schemas were created.
- Models and schemas match product documents.
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
