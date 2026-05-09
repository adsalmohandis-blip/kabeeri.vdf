# 11 — Testing and Review Prompt

## Goal

Review the current Supabase implementation and improve basic checks.

## Context for the AI coding assistant

This prompt is used after several implementation prompts. It should not add new features.

## Information the user should provide before running this prompt

- Which Supabase features have been implemented so far?
- Are there known bugs?
- Which data access rules feel risky?

## Files and areas allowed for this prompt

```text
supabase/
src/
tests/
README.md
```

## Files and areas forbidden for this prompt

```text
New product features
Large refactors
Production destructive changes
```

## Tasks

1. Review current Supabase-related changes.
2. Add or document manual test steps.
3. Test auth if implemented.
4. Test table access with RLS.
5. Test storage access if implemented.
6. Test frontend integration if implemented.
7. Fix small issues discovered during review.
8. Do not add new features.


## Checks to run

```text
Run local/staging checks.
Test anon/auth access.
Review browser console/server logs.
Confirm no secrets are committed.
```

## Acceptance criteria

- Current Supabase features have basic checks.
- Access control is tested.
- No new product scope is added.
- Review notes are clear.


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
