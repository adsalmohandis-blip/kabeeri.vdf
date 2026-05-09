# 04 — Row Level Security Policies Prompt

## Goal

Add or review Supabase Row Level Security policies for first-release tables.

## Context for the AI coding assistant

This is one of the most important Supabase prompts. It protects data access.

## Information the user should provide before running this prompt

- Which data should be public?
- Which data belongs to a user?
- Which data should only admins see?
- Can users edit/delete their own records?
- Technical note: If unsure, ask ChatGPT to explain safe RLS policies for your tables.

## Files and areas allowed for this prompt

```text
supabase/migrations/
supabase/policies.sql
README.md
security notes
```

## Files and areas forbidden for this prompt

```text
Disabling RLS without reason
Broad public policies for private data
Real production destructive changes
```

## Tasks

1. List each first-release table.
2. Decide if the table is public, private, user-owned, team-owned, or admin-only.
3. Enable RLS where private/user-owned access is needed.
4. Write simple policies for select/insert/update/delete only as required.
5. Avoid broad `using (true)` policies unless data is intentionally public.
6. Add comments explaining each policy in plain language.
7. Do not create policies for future tables.


## Checks to run

```text
Review policies manually.
Test as anon user.
Test as authenticated user.
Test owner vs non-owner access where relevant.
```

## Acceptance criteria

- RLS is enabled where needed.
- Policies match the product's access rules.
- Private data is not publicly readable.
- Each policy is understandable.


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
