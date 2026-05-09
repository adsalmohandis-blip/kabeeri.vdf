# 07 — Core Entities and DTOs Prompt

## Goal

Create first product-specific entities/models and DTOs based on Kabeeri VDF planning documents.

## Context for the AI coding assistant

This prompt should be based on the product documents, not AI guesses.

## Information the user should provide before running this prompt

- What things does the API need to save? Example: products, bookings, invoices, posts, projects, tasks.
- Which of these are needed in the first release?
- Which can wait until later?
- Technical note: If you are not sure how to convert these things into NestJS entities/DTOs, ask ChatGPT for help.

## Files and areas allowed for this prompt

```text
src/modules/
src/common/
prisma/ or entity files if selected
test/
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
3. Create entities/models only for first-release objects.
4. Create DTOs for request/response objects.
5. Add validation decorators where useful.
6. Add relationships that are clearly needed now.
7. Add tests if suitable.
8. Do not add future modules.


## Checks to run

```bash
npm run lint
npm run test
npm run build
```

## Acceptance criteria

- Only first-release entities/DTOs were created.
- Entities and DTOs match product documents.
- Validation is clear.
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
