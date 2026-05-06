# 06 — Apps and Models Prompt

## Goal

Create first product-specific Django apps and models based on Kabeeri VDF planning documents.

## Context for the AI coding assistant

This prompt should be based on the product documents, not AI guesses.

## Information the user should provide before running this prompt

- What things does the app need to save? Example: products, bookings, invoices, posts, projects, tasks.
- Which of these are needed in the first release?
- Which can wait until later?
- Technical note: If you are not sure how to convert these things into Django models, ask ChatGPT for help.

## Files and areas allowed for this prompt

```text
apps/
models.py
admin.py
migrations/
tests/
config/settings*
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
3. Create Django apps only where they are useful.
4. Create models for first-release objects.
5. Add relationships that are clearly needed now.
6. Register models in admin if helpful.
7. Add basic model tests.
8. Do not add future modules.


## Checks to run

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py test
```

## Acceptance criteria

- Only first-release apps/models were created.
- Models match the product documents.
- Migrations are clear.
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
