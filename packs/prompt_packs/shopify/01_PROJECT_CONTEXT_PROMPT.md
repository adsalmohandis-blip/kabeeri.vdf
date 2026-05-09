# 01 — Shopify Project Context Prompt

## Goal

Give the AI coding assistant the correct Shopify project context before implementation.

## Context for the AI coding assistant

This prompt is used before implementation starts. Its goal is to make AI understand whether the work is for a store, theme, app, storefront, integration, product catalog, migration, or checkout-related customization.

## Information the user should provide before running this prompt

- What are you building or customizing?
- Is this a theme, app, storefront, integration, product setup, or migration?
- Is there a development store/theme?
- What should the first version do?
- What should wait until later?

## Files and areas allowed for this prompt

```text
README.md
theme files if present
app files if present
.env.example
docs/notes if present
```

## Files and areas forbidden for this prompt

```text
Production secrets
Live theme changes without backup
Unrelated future modules
prompt_packs/
```

## Tasks

1. Read the store/product summary provided by the user.
2. Identify the Shopify work type: theme customization, app, storefront, Admin API, Storefront API, webhook, product catalog, checkout-related work, or migration.
3. Identify first release scope.
4. Identify what should not be built yet.
5. Identify whether work should happen in a development store/theme/app.
6. Produce an implementation context summary.
7. Do not write code unless the user explicitly asks after this summary.


## Checks to run

```text
Review project files manually.
Confirm no Shopify secrets are committed.
Confirm the work type and safe working environment.
```

## Acceptance criteria

- Shopify work type is clear.
- First release scope is separated from future ideas.
- Safe working area is identified.
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
