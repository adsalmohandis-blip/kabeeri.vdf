# 07 — Core Domain Models Prompt

## Goal

Create first product-specific domain models based on Kabeeri VDF planning documents.

## Context for the AI coding assistant

This prompt should be based on the product documents, not AI guesses.

## Information the user should provide before running this prompt

- What things does the app need to save? Example: products, bookings, invoices, posts, projects, tasks.
- Which of these are needed in the first release?
- Which can wait until later?
- Technical note: If you are not sure how to convert these things into models/tables, ask ChatGPT for help.

## Files and areas allowed for this prompt

```text
src/
tests/
EF Core migrations if used
Domain/Application/Infrastructure layers if present
```

## Files and areas forbidden for this prompt

```text
Unplanned future modules
Advanced extension features
Deployment files
```

## Tasks

1. Read the user's product and database notes.
2. Identify only the first-release objects the app needs to store or manage.
3. Create domain models/entities for those objects.
4. Add database mappings/migrations if EF Core is used.
5. Add simple validation where needed.
6. Add basic tests.
7. Do not add future modules.


## Checks to run

```bash
dotnet build
dotnet test
```

## Acceptance criteria

- Only first-release models were created.
- Models match the product documents.
- Database changes are clear if used.
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
