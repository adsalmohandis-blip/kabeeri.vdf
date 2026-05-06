# 11 — Testing and Security Review Prompt

## Goal

Review the current Strapi implementation for permissions, secrets, API exposure, and quality.

## Context for the AI coding assistant

This prompt is used after several implementation prompts. It should not add new product features.

## Information the user should provide before running this prompt

- Which content types exist now?
- Which APIs are public?
- Are there custom controllers/services?
- What data is private?

## Files and areas allowed for this prompt

```text
src/
config/
.env.example
README.md
review notes
```

## Files and areas forbidden for this prompt

```text
New product features
Production destructive changes
Real secrets
```

## Tasks

1. Review environment variable usage.
2. Confirm no real tokens/secrets are committed.
3. Review public/authenticated/admin permissions.
4. Review API exposure.
5. Review media access.
6. Review custom controllers/services if any.
7. Document manual test steps.
8. Do not add new features.


## Checks to run

```text
Run Strapi locally.
Test public API access.
Test authenticated/admin access if available.
Confirm no secrets are committed.
```

## Acceptance criteria

- Permissions are reviewed.
- Secrets are not exposed.
- API exposure is intentional.
- No new product scope is added.


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
