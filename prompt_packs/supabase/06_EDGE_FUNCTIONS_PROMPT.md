# 06 — Edge Functions Prompt

## Goal

Add Supabase Edge Function foundation if the first release needs server-side logic.

## Context for the AI coding assistant

This prompt is optional. Use it only when a feature should not run in frontend code.

## Information the user should provide before running this prompt

- What action must run server-side?
- Does it call an external API?
- What inputs does it receive?
- Who can call it?

## Files and areas allowed for this prompt

```text
supabase/functions/
.env.example
README.md
src/lib/
```

## Files and areas forbidden for this prompt

```text
Real secrets in frontend
Unrelated functions
Production secrets
```

## Tasks

1. Ask what server-side action is needed.
2. Use Edge Functions only if needed.
3. Keep function small and focused.
4. Add environment variable placeholders for secrets.
5. Validate input.
6. Return clear success/error responses.
7. Do not create multiple unrelated functions.


## Checks to run

```text
Run/test function locally or staging if possible.
Confirm secrets are not in frontend.
Test valid and invalid input.
```

## Acceptance criteria

- Edge Function has one clear purpose.
- Secrets are server-side only.
- Inputs are validated.
- No unrelated functions are added.


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
