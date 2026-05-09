# 07 — Entities, DTOs, and Repositories Prompt

## Goal

Create first product-specific entities, DTOs, and repositories based on Kabeeri VDF planning documents.

## Context for the AI coding assistant

This prompt should be based on the product documents, not AI guesses.

## Information the user should provide before running this prompt

- What things does the app need to save? Example: products, bookings, invoices, posts, projects, tasks.
- Which of these are needed in the first release?
- Which can wait until later?
- Technical note: If unsure, ask ChatGPT to convert product objects into Spring Boot entities/DTOs.

## Files and areas allowed for this prompt

```text
src/main/java/**/entity/
src/main/java/**/dto/
src/main/java/**/repository/
src/main/resources/db/migration/
src/test/java/
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
3. Create entities only for first-release objects.
4. Create DTOs for request/response objects.
5. Add repositories only where needed.
6. Add relationships that are clearly needed now.
7. Add migrations if Flyway/Liquibase is used.
8. Add basic tests.
9. Do not add future modules.


## Checks to run

```bash
./mvnw test
./gradlew test
```

## Acceptance criteria

- Only first-release entities/DTOs/repositories were created.
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
