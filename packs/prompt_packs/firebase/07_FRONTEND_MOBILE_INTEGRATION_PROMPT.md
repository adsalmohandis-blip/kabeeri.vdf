# 07 — Frontend/Mobile Integration Prompt

## Goal

Connect Firebase to frontend or mobile app code safely.

## Context for the AI coding assistant

This prompt is used when the project has a frontend or mobile client such as Next.js, React Native, Flutter, or another client.

## Information the user should provide before running this prompt

- What frontend/mobile app is using Firebase?
- What is the first Firebase feature it needs?
- Is it auth, data, storage, or functions?

## Files and areas allowed for this prompt

```text
src/lib/firebase*
app/
components/
hooks/
lib/
.env.example
README.md
```

## Files and areas forbidden for this prompt

```text
Admin SDK private keys in frontend/mobile
Service account JSON files
Real secrets
Unrelated UI modules
```

## Tasks

1. Identify the frontend/mobile stack.
2. Create a Firebase client helper.
3. Use only client-safe Firebase config in frontend/mobile.
4. Add simple auth/data/storage example only for one confirmed use case.
5. Add loading/error states where useful.
6. Do not build all app screens.
7. Do not expose Admin SDK credentials.


## Checks to run

```text
Run frontend/mobile checks.
Confirm .env.example uses placeholders.
Confirm real secrets are not committed.
Test one basic Firebase operation.
```

## Acceptance criteria

- Firebase client is configured safely.
- Frontend/mobile uses only client-safe config.
- One basic integration works or is clearly documented.
- Scope stays focused.


## Important scope rule

Do not build features outside this prompt.  
Do not expose Firebase Admin credentials in frontend or mobile code.  
Do not commit real secrets.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Firebase changes:
Checks to run:
Security notes:
Manual review notes:
Next recommended prompt:
```
