# 00 — Ruby on Rails Prompt Pack Index

## Framework

Kabeeri Vibe Developer Framework

## Prompt pack

Ruby on Rails

## Version

v0.1.1

## Goal

Provide a safe, beginner-friendly Rails prompt pack that helps vibe developers build Rails applications step by step after completing Kabeeri VDF planning documents.

## What this pack is

This pack is a set of structured prompts for AI coding assistants.

It helps AI work on Rails projects in a controlled order.

## What this pack is not

This pack is not:

- a Rails installer
- a Ruby installer
- a package manager
- a hosting setup tool
- a full application by itself
- a replacement for official Rails documentation

## Before using this pack

The user should already have, or should ask AI to help create:

```text
01_STRATEGY_AND_BUSINESS
02_FOUNDATION_ARCHITECTURE
03_RELEASE_SPECS
04_DATABASE_ARCHITECTURE
05_EXECUTION_PLAN
06_ENGINEERING_STANDARDS
08_AI_CODE_PROMPTS
09_TASK_TRACKING
10_ACCEPTANCE_CHECKLISTS
```

For Lite projects, not all folders are required, but the product idea and first release scope should be clear.

## Prompt order

Use the prompts in this order:

```text
01_PROJECT_CONTEXT_PROMPT.md
02_APP_STRUCTURE_PROMPT.md
03_ENV_CONFIG_DATABASE_PROMPT.md
04_ROUTES_CONTROLLERS_VIEWS_PROMPT.md
05_AUTH_USERS_PROMPT.md
06_ROLES_AUTHORIZATION_PROMPT.md
07_CORE_MODELS_MIGRATIONS_PROMPT.md
08_SERVICES_JOBS_MAILERS_PROMPT.md
09_ADMIN_BACKOFFICE_PROMPT.md
10_VALIDATION_ERROR_HANDLING_PROMPT.md
11_TESTING_REVIEW_PROMPT.md
12_RELEASE_HANDOFF_PROMPT.md
```

## What each prompt does

| Prompt | Purpose |
|---|---|
| 01 | Give AI the product and Rails context. |
| 02 | Review or prepare a clean Rails app structure. |
| 03 | Configure environment, credentials, database, and local setup rules. |
| 04 | Add routes, controllers, views, and API response foundation. |
| 05 | Add authentication and users foundation if needed. |
| 06 | Add roles and authorization foundation if needed. |
| 07 | Add first product-specific models and migrations. |
| 08 | Add services, jobs, and mailers if needed. |
| 09 | Add admin/backoffice foundation if needed. |
| 10 | Add validation and error handling foundation. |
| 11 | Review tests, quality, and security basics. |
| 12 | Prepare release handoff summary. |

## Important

These prompts are intentionally small. They should not be merged into one large prompt.
