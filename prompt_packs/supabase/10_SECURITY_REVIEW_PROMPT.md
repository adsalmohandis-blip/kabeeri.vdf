# 10 — Supabase Security Review Prompt

## Goal

Review Supabase security basics, including secrets, RLS, policies, and storage access.

## Context for the AI coding assistant

This prompt is used after schema/auth/storage/functions work. It should not add new product features.

## Information the user should provide before running this prompt

- Which tables exist now?
- Which buckets exist now?
- Are there Edge Functions?
- What data is private?

## Files and areas allowed for this prompt

```text
supabase/
.env.example
src/lib/supabase*
README.md
security notes
```

## Files and areas forbidden for this prompt

```text
New product features
Production destructive changes
Real secrets
```

## Tasks

1. Review all environment variable usage.
2. Confirm no service role key is used in frontend/mobile.
3. Review RLS status for every table.
4. Review storage buckets and policies.
5. Review Edge Function secrets and authorization.
6. Identify broad policies that need manual review.
7. Do not add new features.


## Checks to run

```text
Manual security review.
Test anon access.
Test authenticated access.
Test owner/non-owner access where relevant.
```

## Acceptance criteria

- Secrets are not exposed.
- RLS is reviewed.
- Storage access is reviewed.
- Risky policies are flagged.
- No new product scope is added.


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
