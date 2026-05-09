# 00 — Shopify Prompt Pack Index

## Framework

Kabeeri Vibe Developer Framework

## Prompt pack

Shopify

## Version

v0.1.1

## Goal

Provide a safe, beginner-friendly Shopify prompt pack that helps vibe developers plan and implement Shopify stores, themes, apps, and integrations step by step after completing Kabeeri VDF planning documents.

## What this pack is

This pack is a set of structured prompts for AI coding assistants.

It helps AI work on Shopify-related tasks in a controlled order.

## What this pack is not

This pack is not:

- a Shopify installer
- a Shopify store creator
- a Shopify Partner account setup tool
- a billing setup tool
- a license bypass tool
- a full theme or app by itself
- a replacement for official Shopify documentation

## Shopify work types supported

```text
Theme customization
Liquid sections and templates
Shopify app planning
Admin API integration
Storefront API integration
Webhooks
Products, collections, and metafields
Checkout-related planning
Shopify Functions planning
Hydrogen storefront planning
Migration/import helpers
Security and release review
```

## Before using this pack

The user should already have, or should ask AI to help create:

```text
01_STRATEGY_AND_BUSINESS
02_FOUNDATION_ARCHITECTURE
03_RELEASE_SPECS
04_DATABASE_ARCHITECTURE or commerce data plan
05_EXECUTION_PLAN
06_ENGINEERING_STANDARDS
08_AI_CODE_PROMPTS
09_TASK_TRACKING
10_ACCEPTANCE_CHECKLISTS
```

For Lite projects, not all folders are required, but the store goal and first release scope should be clear.

## Prompt order

Use the prompts in this order when applicable:

```text
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
```

Not every Shopify project needs every prompt.

Examples:

- Theme customization may need prompts 01, 02, 03, 04, 11, 12.
- App integration may need prompts 01, 05, 06, 08, 11, 12.
- Storefront/headless project may need prompts 01, 07, 09, 11, 12.
- Product catalog setup may need prompts 01, 02, 09, 11, 12.

## Important

These prompts are intentionally small. They should not be merged into one large prompt.
