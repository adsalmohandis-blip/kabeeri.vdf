# 08 — Frontend Integration Prompt

## Goal

Connect Supabase to the frontend or app code safely.

## Context for the AI coding assistant

This prompt is used when the project has a frontend such as Next.js, React Native, Flutter, or another client.

## Information the user should provide before running this prompt

- What frontend/app is using Supabase?
- What is the first Supabase feature it needs?
- Is it auth, data, storage, or realtime?

## Files and areas allowed for this prompt

```text
src/lib/supabase*
app/
components/
hooks/
.env.example
README.md
```

## Files and areas forbidden for this prompt

```text
Service role key in frontend
Real secrets
Unrelated UI modules
```

## Tasks

1. Identify the frontend stack.
2. Create a Supabase client helper.
3. Use only anon/public client keys in frontend.
4. Add simple auth/data example only for one confirmed use case.
5. Add loading/error states where useful.
6. Do not build all app screens.
7. Do not expose service role key.


## Checks to run

```text
Run frontend checks.
Confirm .env.example uses placeholders.
Confirm real keys are not committed.
Test one basic Supabase operation.
```

## Acceptance criteria

- Supabase client is configured safely.
- Frontend uses only safe public keys.
- One basic integration works or is clearly documented.
- Scope stays focused.


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
