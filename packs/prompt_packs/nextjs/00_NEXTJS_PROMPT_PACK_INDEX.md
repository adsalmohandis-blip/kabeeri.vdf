# 00 — Next.js Prompt Pack Index

## Framework

Kabeeri Vibe Developer Framework

## Prompt pack

Next.js

## Version

v0.1.1

## Goal

Provide a safe, beginner-friendly Next.js prompt pack that helps vibe developers build a Next.js project step by step after completing Kabeeri VDF planning documents.

## What this pack is

This pack is a set of structured prompts for AI coding assistants.

It helps AI work on a Next.js project in a controlled order.

## What this pack is not

This pack is not:

- a Next.js installer
- a Node.js installer
- a replacement for official Next.js documentation
- a complete app by itself
- a package manager
- a full product generator

## Before using this pack

The user should already have, or should ask AI to help create:

```text
01_STRATEGY_AND_BUSINESS
02_FOUNDATION_ARCHITECTURE
03_RELEASE_SPECS
04_DATABASE_ARCHITECTURE or data/API plan
05_EXECUTION_PLAN
06_ENGINEERING_STANDARDS
08_AI_CODE_PROMPTS
09_TASK_TRACKING
10_ACCEPTANCE_CHECKLISTS
```

For Lite frontend-only projects, not all folders are required, but the product idea and first release scope should be clear.

## Prompt order

Use the prompts in this order:

```text
01_PROJECT_CONTEXT_PROMPT.md
02_APP_STRUCTURE_PROMPT.md
03_ENV_CONFIG_PROMPT.md
04_ROUTING_LAYOUTS_PROMPT.md
05_DESIGN_SYSTEM_UI_PROMPT.md
06_AUTH_USERS_PROMPT.md
07_DATA_API_INTEGRATION_PROMPT.md
08_CORE_FEATURES_PROMPT.md
09_ADMIN_DASHBOARD_PROMPT.md
10_FORMS_VALIDATION_PROMPT.md
11_TESTING_REVIEW_PROMPT.md
12_RELEASE_HANDOFF_PROMPT.md
```

## What each prompt does

| Prompt | Purpose |
|---|---|
| 01 | Give AI the product context and first-release scope. |
| 02 | Review or prepare a clean Next.js app structure. |
| 03 | Configure environment variables and app configuration rules. |
| 04 | Create routing, layouts, and navigation foundation. |
| 05 | Create design system and UI component foundation. |
| 06 | Add authentication/users foundation if needed. |
| 07 | Add data fetching, API integration, or backend connection foundation. |
| 08 | Add first core product features based on project documents. |
| 09 | Add simple admin/dashboard foundation if needed. |
| 10 | Add forms and validation foundation. |
| 11 | Review tests, quality, performance, and accessibility. |
| 12 | Prepare release handoff summary. |

## Important

These prompts are intentionally small. They should not be merged into one large prompt.
