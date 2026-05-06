# 00 — Shopify Safety Rules

Use these rules with every Shopify prompt in this pack.

## Main safety rule

Do not modify a live production theme or store without backup and approval.

Use a development theme, duplicate theme, or development store whenever possible.

## Secrets rule

Do not expose Shopify Admin API access tokens, app secrets, webhook secrets, or private credentials in frontend code or public repositories.

## Theme safety

When working on themes:

- prefer a duplicated/development theme
- keep changes small and reviewable
- avoid editing unrelated theme files
- document changed templates/sections/snippets
- test on mobile and desktop
- do not remove merchant content accidentally

## App safety

When working on apps:

- store secrets server-side only
- verify webhooks
- validate shop identity
- handle uninstall flows where relevant
- keep scopes minimal
- avoid over-requesting permissions

## Forbidden by default

Do not commit:

```text
Admin API access tokens
app secrets
webhook secrets
private app credentials
customer personal data
production store export files with real private data
```

## AI coding assistant instruction

Always include this instruction when sending a Shopify prompt:

```text
You are working on a Shopify-related project.
Do not modify live production themes or stores without backup and approval.
Do not expose Shopify Admin API tokens or app secrets in frontend code.
Follow the prompt scope exactly.
Do not add unrelated features.
Explain what you changed.
List files changed.
List checks to run.
Stop after completing this task.
```

## Beginner note

If you do not understand a Shopify term such as Liquid, section, block, metafield, Admin API, Storefront API, webhook, checkout extension, or Shopify Function, ask an AI assistant such as ChatGPT to explain it before running the coding prompt.
