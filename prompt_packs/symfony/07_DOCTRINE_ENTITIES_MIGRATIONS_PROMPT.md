# 07 — Doctrine Entities and Migrations Prompt

## Goal

Create first product-specific Doctrine entities and migrations based on Kabeeri VDF planning documents.

## Context for the AI coding assistant

This prompt should be based on the product documents, not AI guesses.

## Information the user should provide before running this prompt

- What things does the app need to save? Example: products, bookings, invoices, posts, projects, tasks.
- Which of these are needed in the first release?
- Which can wait until later?
- Technical note: If unsure, ask ChatGPT to convert product objects into Symfony/Doctrine entities.

## Files and areas allowed for this prompt

```text
src/Entity/
src/Repository/
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
2. Identify only the first-release objects the app needs to store or manage.
3. Create Doctrine entities only for first-release objects.
4. Create migrations for those entities.
5. Add relationships that are clearly needed now.
6. Add validation constraints where useful.
7. Add basic entity/repository tests if appropriate.
8. Do not add future modules.


## Checks to run

```bash
php bin/console doctrine:migrations:migrate --no-interaction
php bin/phpunit
```

## Acceptance criteria

- Only first-release entities/migrations were created.
- Entities match product documents.
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
