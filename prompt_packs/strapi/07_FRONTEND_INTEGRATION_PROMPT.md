# 07 — Frontend Integration Prompt

## Goal

Connect Strapi to frontend or app code safely.

## Context for the AI coding assistant

This prompt is used when the project has a frontend such as Next.js, Nuxt, mobile app, or another client.

## Information the user should provide before running this prompt

- What frontend/app is using Strapi?
- What is the first content type it needs?
- Is data public or authenticated?
- Should fetching happen server-side or client-side?

## Files and areas allowed for this prompt

```text
src/lib/strapi*
app/
components/
hooks/
.env.example
README.md
```

## Files and areas forbidden for this prompt

```text
Admin tokens in frontend
Real secrets
Unrelated UI modules
```

## Tasks

1. Identify the frontend/app stack.
2. Create a Strapi API client/helper.
3. Use only safe public access or server-side tokens where appropriate.
4. Add one sample data fetch for a confirmed content type.
5. Add loading/error/empty states where useful.
6. Do not build all app screens.
7. Do not expose private tokens in frontend/mobile.


## Checks to run

```text
Run frontend/app checks.
Confirm .env.example uses placeholders.
Confirm real tokens are not committed.
Test one basic Strapi fetch.
```

## Acceptance criteria

- Strapi client is configured safely.
- Frontend/app access is appropriate.
- One basic integration works or is documented.
- Scope stays focused.


## Important scope rule

Do not build features outside this prompt.  
Do not expose Strapi secrets or private credentials.  
Do not make private content public by default.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Strapi changes:
Checks to run:
Security/permissions notes:
Manual review notes:
Next recommended prompt:
```
