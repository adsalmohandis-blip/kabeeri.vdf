# 09 — Webhooks and Automation Prompt

## Goal

Add Strapi webhooks or automation planning if the first release needs it.

## Context for the AI coding assistant

This prompt is optional. Use it only when Strapi must notify another system or trigger an action.

## Information the user should provide before running this prompt

- What event should trigger action? Publish, update, delete, order, form submission?
- What external system should receive it?
- What should happen after the event?

## Files and areas allowed for this prompt

```text
config/
src/
README.md
webhook-notes.md
```

## Files and areas forbidden for this prompt

```text
Webhook secrets in frontend
Unrelated automations
Production secrets
```

## Tasks

1. Ask what event should trigger automation.
2. Identify destination system.
3. Add one webhook/automation plan or implementation only.
4. Keep secrets server-side.
5. Add retry/failure notes if relevant.
6. Do not add future automations.


## Checks to run

```text
Test webhook in local/staging if possible.
Confirm secret is not exposed.
Test failure behavior if possible.
```

## Acceptance criteria

- Webhook/automation has one clear purpose.
- Secret handling is safe.
- Failure behavior is documented.
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
