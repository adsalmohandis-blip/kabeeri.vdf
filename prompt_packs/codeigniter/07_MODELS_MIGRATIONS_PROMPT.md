# 07 — Models and Migrations Prompt

## Goal

Create first product-specific CodeIgniter models and migrations based on Kabeeri VDF planning documents.

## Context for the AI coding assistant

This prompt should be based on the product documents, not AI guesses.

## Information the user should provide before running this prompt

- What things does the app need to save? Example: products, bookings, invoices, posts, projects, tasks.
- Which of these are needed in the first release?
- Which can wait until later?
- Technical note: If unsure, ask ChatGPT to convert product objects into CodeIgniter models and migrations.

## Files and areas allowed for this prompt

```text
app/Models/
app/Database/Migrations/
app/Database/Seeds/
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
2. Identify only the first-release objects the app needs to store or manage.
3. Create models only for first-release objects.
4. Create migrations for those models/tables.
5. Add relationships/foreign keys that are clearly needed now.
6. Add allowed fields and validation where useful.
7. Add basic model tests if appropriate.
8. Do not add future modules.


## Checks to run

```bash
php spark migrate
vendor/bin/phpunit
```

## Acceptance criteria

- Only first-release models/migrations were created.
- Models match product documents.
- Relationships and constraints are clear.
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
