# 06 — Admin API Integration Prompt

## Goal

Add a focused Shopify Admin API integration safely.

## Context for the AI coding assistant

This prompt is used when the app/backend needs to read or write Shopify admin data.

## Information the user should provide before running this prompt

- What Admin API action is needed?
- What data should be read or written?
- Who triggers this action?
- What scopes are required?

## Files and areas allowed for this prompt

```text
server/
app/
lib/shopify*
routes/
.env.example
README.md
tests/
```

## Files and areas forbidden for this prompt

```text
Admin API token in frontend
Unrelated API features
Broad scopes without reason
Real customer data export
```

## Tasks

1. Identify the exact Admin API action needed.
2. Confirm required scopes.
3. Keep secrets server-side only.
4. Add one focused integration.
5. Add pagination/error handling if relevant.
6. Add rate-limit awareness notes.
7. Do not add multiple unrelated Admin API features.


## Checks to run

```text
Run local/staging check.
Confirm token is server-side only.
Test success and failure cases.
Review scopes.
```

## Acceptance criteria

- Integration has one clear purpose.
- Admin API secrets are not exposed.
- Scopes are minimal.
- Error handling is clear.


## Important scope rule

Do not build features outside this prompt.  
Do not expose Shopify secrets.  
Do not modify live production themes/stores without backup and approval.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Shopify changes:
Checks to run:
Security notes:
Manual review notes:
Next recommended prompt:
```
