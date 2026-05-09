# 06 — Core Models Prompt

## Goal

Create the first product-specific models based on the project planning documents.

## Context for the AI coding assistant

This is the first prompt that touches the actual product domain. It must be based on the Kabeeri VDF planning documents, not guesses.

## Information the user should provide before running this prompt

- What things does the app need to save? Example: products, bookings, invoices, posts, projects, tasks.
- Which of these are needed in the first release?
- Which can wait until later?
- Technical note: If you are not sure how to convert these things into database tables, ask ChatGPT for help.

## Files and areas allowed for this prompt

```text
app/Models/
database/migrations/
database/factories/
database/seeders/
app/Policies/
tests/
```

## Files and areas forbidden for this prompt

```text
Unplanned modules
Future extension features
Production infrastructure
Unrelated UI
```

## Tasks

1. Read the product summary and database planning notes provided by the user.
2. Identify only the minimum models needed for the first release.
3. Create migrations for those models.
4. Add relationships that are clearly needed now.
5. Add factories and seeders if useful.
6. Add basic model tests.
7. Do not add future modules or optional features.


## Checks to run

```bash
php artisan migrate:fresh --seed
php artisan test
```

## Acceptance criteria

- Only first-release models were created.
- Models match the product documents.
- Migrations are clear and reversible.
- Tests or simple checks exist.


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
