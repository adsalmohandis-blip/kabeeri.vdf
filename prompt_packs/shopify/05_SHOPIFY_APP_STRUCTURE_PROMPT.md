# 05 — Shopify App Structure Prompt

## Goal

Plan or organize a Shopify app structure for first-release app functionality.

## Context for the AI coding assistant

This prompt is used when the project needs a Shopify app, not just theme customization.

## Information the user should provide before running this prompt

- What should the app do?
- Is it for one store, multiple stores, or public distribution?
- What Shopify data does it need to read/write?
- What is the first feature?

## Files and areas allowed for this prompt

```text
app/
server/
routes/
webhooks/
.env.example
README.md
package.json if relevant
```

## Files and areas forbidden for this prompt

```text
Admin API tokens in frontend
App secrets in public files
Billing changes without approval
Unrelated app features
```

## Tasks

1. Identify app purpose.
2. Identify whether it is embedded app, private/custom app, or public app planning.
3. Identify required Shopify API scopes and keep them minimal.
4. Define app folder/module structure.
5. Add environment placeholders only, not real secrets.
6. Add install/auth flow notes if needed.
7. Do not build all app features in this prompt.


## Checks to run

```text
Review .env.example.
Confirm no secrets are committed.
Confirm scopes are minimal.
Run existing app checks if available.
```

## Acceptance criteria

- App purpose is clear.
- App structure is simple.
- Required scopes are identified and minimal.
- No secrets are exposed.


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
