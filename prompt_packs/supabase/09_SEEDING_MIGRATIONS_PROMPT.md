# 09 — Seeding and Migrations Prompt

## Goal

Add seed data and migration workflow for local/staging development.

## Context for the AI coding assistant

This prompt helps keep Supabase database changes repeatable and reviewable.

## Information the user should provide before running this prompt

- Do you need demo data?
- What sample records would help test the app?
- Is this local-only, staging, or production?
- Technical note: Never use real customer data as seed data.

## Files and areas allowed for this prompt

```text
supabase/migrations/
supabase/seed.sql
README.md
```

## Files and areas forbidden for this prompt

```text
Production destructive SQL
Real user data
Secrets
```

## Tasks

1. Review existing migrations.
2. Add seed data only for demo/local/staging use.
3. Do not include real user data.
4. Make seed data small and understandable.
5. Document how to apply migrations and seed data.
6. Avoid destructive SQL unless explicitly approved and clearly documented.


## Checks to run

```text
Run migrations locally/staging.
Apply seed data locally/staging.
Review generated demo records.
```

## Acceptance criteria

- Migrations are reviewable.
- Seed data is fake/demo only.
- Workflow is documented.
- No production data is included.


## Important scope rule

Do not build features outside this prompt.  
Do not expose service role keys in frontend or mobile code.  
Do not commit real secrets.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Supabase changes:
Checks to run:
Security notes:
Manual review notes:
Next recommended prompt:
```
