# 10 — Checkout and Shopify Functions Prompt

## Goal

Plan checkout-related customization or Shopify Functions only when needed and allowed.

## Context for the AI coding assistant

This prompt is optional and should be used carefully because checkout changes can affect revenue and user trust.

## Information the user should provide before running this prompt

- What checkout behavior do you need?
- Is it discount, delivery, payment, validation, upsell, or something else?
- Is this for development, staging, or production?
- Technical note: If unsure, ask ChatGPT to explain Shopify Functions vs checkout extensions.

## Files and areas allowed for this prompt

```text
extensions/
functions/
app/
server/
README.md
.env.example
```

## Files and areas forbidden for this prompt

```text
Checkout hacks
Unsupported checkout modifications
Secrets in frontend
Unapproved production changes
```

## Tasks

1. Ask what checkout behavior is needed.
2. Confirm whether the store plan/platform supports the requested customization.
3. Identify whether Shopify Functions, checkout extensions, discounts, delivery customization, or payment customization are relevant.
4. Keep the scope to one checkout behavior.
5. Add safe planning notes before code.
6. Do not bypass Shopify rules or platform limitations.
7. Do not deploy checkout changes to production without manual approval.


## Checks to run

```text
Review platform support manually.
Test in development/staging store.
Confirm no unsupported checkout hack is used.
Document rollback plan.
```

## Acceptance criteria

- Checkout customization need is clear.
- Platform limitations are respected.
- One behavior is handled.
- Production deployment is not automatic.


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
