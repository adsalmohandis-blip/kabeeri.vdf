# 01 — Supabase Project Context Prompt

## Goal

Give the AI coding assistant the correct product and Supabase context before implementation.

## Context for the AI coding assistant

This prompt is used before implementation starts. Its goal is to make AI understand whether Supabase is used as the main backend, auth provider, database, storage, realtime layer, or support service.

## Information the user should provide before running this prompt

- What are you building?
- Will Supabase handle database, auth, storage, realtime, edge functions, or all?
- What frontend/backend will use Supabase?
- What should the first version do?
- What should wait until later?

## Files and areas allowed for this prompt

```text
README.md
.env.example
supabase/
src/
app/
lib/
```

## Files and areas forbidden for this prompt

```text
Real secrets
Production credentials
Unrelated future modules
prompt_packs/
```

## Tasks

1. Read the product summary provided by the user.
2. Identify how Supabase will be used: database, auth, storage, realtime, edge functions, or all.
3. Identify the frontend/backend stack that connects to Supabase.
4. Identify first release scope.
5. Identify what should not be built yet.
6. Produce an implementation context summary.
7. Do not write schema or code unless the user explicitly asks after this summary.


## Checks to run

```text
Review .env.example manually.
Confirm no real keys are committed.
Confirm frontend/backend relationship is clear.
```

## Acceptance criteria

- Supabase role is clear.
- First release scope is separated from future ideas.
- Security risks are identified early.
- No real secrets are exposed.


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
