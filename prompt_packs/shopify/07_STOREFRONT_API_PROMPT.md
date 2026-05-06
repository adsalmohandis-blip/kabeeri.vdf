# 07 — Storefront API Prompt

## Goal

Add a focused Shopify Storefront API integration for frontend/headless storefront use.

## Context for the AI coding assistant

This prompt is used for headless storefronts, custom product listing, product detail pages, cart flows, or content access.

## Information the user should provide before running this prompt

- What frontend/headless app uses Storefront API?
- What is the first data needed? Products, collections, cart, pages, etc.
- Is this a full storefront or one embedded feature?

## Files and areas allowed for this prompt

```text
src/lib/shopify*
app/
components/
routes/
.env.example
README.md
```

## Files and areas forbidden for this prompt

```text
Admin API tokens in frontend
App secrets
Unrelated storefront features
```

## Tasks

1. Identify the first Storefront API use case.
2. Add a safe Storefront API client/helper.
3. Query only the data needed for the first feature.
4. Add loading/error/empty states in frontend if applicable.
5. Keep tokens/config in environment variables.
6. Do not build the entire storefront.


## Checks to run

```text
Run frontend checks.
Test one Storefront API query.
Confirm no Admin API secrets are used.
Check empty/error states.
```

## Acceptance criteria

- Storefront API integration is focused.
- No Admin API secrets are exposed.
- First use case works or is documented.
- Scope stays limited.


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
