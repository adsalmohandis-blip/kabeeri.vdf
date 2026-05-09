# 00 — Nuxt / Vue Prompt Pack Index

## Framework

Kabeeri Vibe Developer Framework

## Prompt pack

Nuxt / Vue

## Version

v0.1.1

## Goal

Provide a safe, beginner-friendly Nuxt/Vue prompt pack that helps vibe developers build frontend or full-stack Nuxt/Vue apps step by step after completing Kabeeri VDF planning documents.

## What this pack is

This pack is a set of structured prompts for AI coding assistants.

It helps AI work on Nuxt/Vue projects in a controlled order.

## What this pack is not

This pack is not:

- a Nuxt installer
- a Vue installer
- a Node.js installer
- a package manager
- a hosting setup tool
- a full app by itself
- a replacement for official Nuxt or Vue documentation

## Before using this pack

The user should already have, or should ask AI to help create:

```text
01_STRATEGY_AND_BUSINESS
02_FOUNDATION_ARCHITECTURE
03_RELEASE_SPECS
04_DATABASE_ARCHITECTURE or API/data plan
05_EXECUTION_PLAN
06_ENGINEERING_STANDARDS
08_AI_CODE_PROMPTS
09_TASK_TRACKING
10_ACCEPTANCE_CHECKLISTS
```

For Lite frontend projects, not all folders are required, but the first release scope should be clear.

## Prompt order

Use the prompts in this order:

```text
01_PROJECT_CONTEXT_PROMPT.md
02_APP_STRUCTURE_PROMPT.md
03_ENV_CONFIG_API_PROMPT.md
04_ROUTING_LAYOUTS_PROMPT.md
05_COMPONENTS_DESIGN_SYSTEM_PROMPT.md
06_STATE_COMPOSABLES_PROMPT.md
07_AUTH_USERS_PROMPT.md
08_DATA_FETCHING_API_PROMPT.md
09_CORE_PAGES_FEATURES_PROMPT.md
10_FORMS_VALIDATION_PROMPT.md
11_TESTING_REVIEW_PROMPT.md
12_RELEASE_HANDOFF_PROMPT.md
```

## What each prompt does

| Prompt | Purpose |
|---|---|
| 01 | Give AI the product and Nuxt/Vue context. |
| 02 | Review or prepare app structure. |
| 03 | Configure environment variables, runtime config, and API rules. |
| 04 | Add routing, layouts, and navigation foundation. |
| 05 | Add design system and reusable component foundation. |
| 06 | Add composables and state management foundation. |
| 07 | Add authentication/users foundation if needed. |
| 08 | Add data fetching and API integration foundation. |
| 09 | Add first product-specific pages/features. |
| 10 | Add forms and validation foundation. |
| 11 | Review tests, quality, accessibility, and performance. |
| 12 | Prepare release handoff summary. |

## Important

These prompts are intentionally small. They should not be merged into one large prompt.
