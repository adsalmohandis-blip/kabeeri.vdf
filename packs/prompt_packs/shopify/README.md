# Shopify Prompt Pack

This directory contains the first Shopify prompt pack for **Kabeeri Vibe Developer Framework**.

The pack is designed for vibe developers and AI-powered builders who want to use Shopify as an implementation platform after completing Kabeeri VDF planning documents.

## Important clarification

This prompt pack is **not** a Shopify installer.

It does not create a Shopify store, create a Partner account, install Shopify CLI, install apps, configure billing, or deploy anything automatically.

It provides structured AI prompts that help an AI coding assistant plan and implement Shopify-related work safely after the project planning documents are ready.

## What Shopify work can include

This pack can help with:

- Shopify theme customization
- Shopify sections and blocks
- Liquid templates
- Shopify app planning
- Admin API integration
- Storefront API integration
- Webhooks
- Product and collection structure
- Checkout-related planning
- Shopify Functions planning
- Hydrogen storefront planning
- Migration/import helpers
- Security and release review

## Core rule

Do not ask an AI coding tool to build the whole Shopify solution at once.

Use this flow:

```text
One prompt
→ one small Shopify task
→ review output
→ test in development store/theme
→ commit
→ move to next prompt
```

## Included files

```text
00_SHOPIFY_PROMPT_PACK_INDEX.md
00_SHOPIFY_SAFETY_RULES.md
01_PROJECT_CONTEXT_PROMPT.md
02_STORE_STRUCTURE_PROMPT.md
03_THEME_SECTIONS_BLOCKS_PROMPT.md
04_LIQUID_TEMPLATES_PROMPT.md
05_SHOPIFY_APP_STRUCTURE_PROMPT.md
06_ADMIN_API_INTEGRATION_PROMPT.md
07_STOREFRONT_API_PROMPT.md
08_WEBHOOKS_EVENTS_PROMPT.md
09_PRODUCTS_COLLECTIONS_METAFIELDS_PROMPT.md
10_CHECKOUT_FUNCTIONS_PROMPT.md
11_TESTING_REVIEW_PROMPT.md
12_RELEASE_HANDOFF_PROMPT.md
prompt_pack_manifest.json
```

## Recommended tools

This prompt pack can be used with:

- ChatGPT
- Codex
- Cursor
- Claude Code
- Windsurf
- GitHub Copilot
- other AI coding assistants

## Status

Foundation prompt pack for `v0.1.1`.
