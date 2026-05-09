# 08 — Webhooks and Events Prompt

## Goal

Add Shopify webhook handling foundation for one confirmed event.

## Context for the AI coding assistant

This prompt is used when the app/backend needs to react to Shopify events.

## Information the user should provide before running this prompt

- What event should the app react to? Order created, product updated, app uninstalled, customer created, etc.
- What should happen after the event?
- Does this require storing data?

## Files and areas allowed for this prompt

```text
server/
app/
webhooks/
routes/
.env.example
README.md
tests/
```

## Files and areas forbidden for this prompt

```text
Webhook secrets in frontend
Unverified webhooks
Unrelated webhook handlers
```

## Tasks

1. Identify the exact Shopify webhook topic needed.
2. Add one webhook handler only.
3. Verify webhook signatures.
4. Keep webhook secrets server-side.
5. Add idempotency/deduplication notes if relevant.
6. Log important events without exposing private data.
7. Do not add handlers for future topics.


## Checks to run

```text
Send test webhook if possible.
Test invalid signature.
Confirm secret is server-side only.
Review logs.
```

## Acceptance criteria

- Webhook handler has one clear event.
- Signature verification exists.
- Secret is not exposed.
- Invalid webhooks are rejected.


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
