# 02 — Schema and Database Prompt

## Goal

Plan or create the first Supabase database schema based on Kabeeri VDF planning documents.

## Context for the AI coding assistant

This prompt handles tables, relationships, indexes, and first-release data structures. It must be based on product documents, not guesses.

## Information the user should provide before running this prompt

- What things does the product need to save? Example: users, profiles, projects, tasks, orders, bookings.
- Which of these are needed in the first release?
- Which can wait?
- Technical note: If unsure, ask ChatGPT to convert your product objects into Supabase/Postgres tables.

## Files and areas allowed for this prompt

```text
supabase/migrations/
supabase/seed.sql
README.md
schema notes
```

## Files and areas forbidden for this prompt

```text
Real production data
Production destructive SQL
Unrelated modules
```

## Tasks

1. Read the user's product and database notes.
2. Identify only first-release tables.
3. Define columns in beginner-readable language first.
4. Create SQL migration only for confirmed tables.
5. Add primary keys, timestamps, and important indexes where useful.
6. Add relationships only when clearly required.
7. Do not add future tables.
8. Leave RLS policy details for the RLS prompt unless simple policies are required immediately.


## Checks to run

```text
Review generated SQL manually.
Run migration on local/staging Supabase only.
Do not run destructive SQL in production.
```

## Acceptance criteria

- Tables match first-release product needs.
- Schema is not overbuilt.
- SQL is readable and reviewable.
- No production data is touched.


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
