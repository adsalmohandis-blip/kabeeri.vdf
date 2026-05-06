# 08 — Custom Controllers and Services Prompt

## Goal

Add Strapi custom controllers/services only when default Strapi behavior is not enough.

## Context for the AI coding assistant

This prompt is optional. Use it only for confirmed business logic or custom API behavior.

## Information the user should provide before running this prompt

- What custom behavior is needed?
- Why is default Strapi not enough?
- Who can use this custom action?
- What input does it receive?

## Files and areas allowed for this prompt

```text
src/api/
src/extensions/
config/
tests if present
README.md
```

## Files and areas forbidden for this prompt

```text
Unrelated custom logic
Secrets
Overriding core behavior without reason
```

## Tasks

1. Ask what default Strapi behavior cannot handle.
2. Define one custom action only.
3. Add a custom controller/service with clear input validation.
4. Avoid exposing private data.
5. Add permission/access notes.
6. Do not create multiple unrelated custom APIs.


## Checks to run

```text
Run Strapi locally.
Test custom endpoint/action.
Test unauthorized access.
Review logs/errors.
```

## Acceptance criteria

- Custom code has one clear reason.
- Default Strapi behavior was not enough.
- Access and validation are handled.
- No unrelated custom logic is added.


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
