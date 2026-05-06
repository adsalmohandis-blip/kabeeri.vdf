# 03 — Auth and Users Prompt

## Goal

Plan or implement Supabase Auth and user profile foundation if the first release needs login.

## Context for the AI coding assistant

This prompt handles user authentication and profile data. It should stay simple for the first release.

## Information the user should provide before running this prompt

- Does the first release need login?
- How should users log in? Email/password, magic link, Google, phone, or other?
- Does each user need a profile?
- What profile fields are needed first?

## Files and areas allowed for this prompt

```text
supabase/migrations/
src/lib/supabase*
app/
lib/
.env.example
README.md
```

## Files and areas forbidden for this prompt

```text
Service role key in frontend
Real secrets
Unrelated modules
```

## Tasks

1. Ask whether the first release needs login.
2. Identify auth methods: email/password, magic link, OAuth, phone, or external auth.
3. Do not add providers not requested.
4. Create profile table only if the app needs profile data.
5. Plan how auth users relate to public profiles.
6. Add frontend/client integration only if a frontend stack exists.
7. Do not add complex organization/team logic unless first-release scope requires it.


## Checks to run

```text
Create a test user in local/staging only.
Confirm no service role key is in frontend.
Confirm auth flow manually.
```

## Acceptance criteria

- Auth method is clear.
- Profile handling is clear if needed.
- No service role key is exposed.
- The solution is not overbuilt.


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
