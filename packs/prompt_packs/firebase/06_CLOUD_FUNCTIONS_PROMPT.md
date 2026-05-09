# 06 — Cloud Functions Prompt

## Goal

Add Firebase Cloud Functions foundation if the first release needs trusted server-side logic.

## Context for the AI coding assistant

This prompt is optional. Use it only when a feature should not run in frontend/mobile code.

## Information the user should provide before running this prompt

- What action must run server-side?
- Does it call an external API?
- What inputs does it receive?
- Who can call it?

## Files and areas allowed for this prompt

```text
functions/
.env.example
README.md
src/lib/
```

## Files and areas forbidden for this prompt

```text
Real secrets in frontend
Service account JSON files
Unrelated functions
Production secrets
```

## Tasks

1. Ask what server-side action is needed.
2. Use Cloud Functions only if needed.
3. Keep each function small and focused.
4. Add environment variable placeholders for secrets.
5. Validate input.
6. Return clear success/error responses.
7. Do not create multiple unrelated functions.


## Checks to run

```text
Run/test function locally with emulator if possible.
Confirm secrets are not in frontend/mobile.
Test valid and invalid input.
```

## Acceptance criteria

- Cloud Function has one clear purpose.
- Secrets are server-side only.
- Inputs are validated.
- No unrelated functions are added.


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
