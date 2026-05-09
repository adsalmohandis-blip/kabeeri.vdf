# 00 — Express.js Prompt Pack Index

## Framework

Kabeeri Vibe Developer Framework

## Prompt pack

Express.js

## Version

v0.1.1

## Goal

Provide a safe, beginner-friendly Express.js prompt pack that helps vibe developers build Node.js/Express API projects step by step after completing Kabeeri VDF planning documents.

## What this pack is

This pack is a set of structured prompts for AI coding assistants.

It helps AI work on Express.js projects in a controlled order.

## What this pack is not

This pack is not:

- an Express.js installer
- a Node.js installer
- a package manager
- a hosting setup tool
- a full backend codebase by itself
- a replacement for official Express.js documentation

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

For Lite projects, not all folders are required, but the API/backend goal and first release scope should be clear.

## Prompt order

Use the prompts in this order:

```text
01_PROJECT_CONTEXT_PROMPT.md
02_PROJECT_STRUCTURE_PROMPT.md
03_ENV_CONFIG_DATABASE_PROMPT.md
04_ROUTING_MIDDLEWARE_PROMPT.md
05_AUTH_USERS_PROMPT.md
06_ROLES_PERMISSIONS_PROMPT.md
07_CORE_MODELS_SCHEMAS_PROMPT.md
08_SERVICES_CONTROLLERS_PROMPT.md
09_VALIDATION_ERROR_HANDLING_PROMPT.md
10_INTEGRATIONS_JOBS_PROMPT.md
11_TESTING_REVIEW_PROMPT.md
12_RELEASE_HANDOFF_PROMPT.md
```

## What each prompt does

| Prompt | Purpose |
|---|---|
| 01 | Give AI the product and Express.js backend context. |
| 02 | Review or prepare a clean Express.js project structure. |
| 03 | Configure environment variables, database, and local setup rules. |
| 04 | Add routing and middleware foundation. |
| 05 | Add authentication and users foundation if needed. |
| 06 | Add simple roles and permissions foundation. |
| 07 | Add first product-specific models/schemas. |
| 08 | Add controllers and services foundation. |
| 09 | Add validation and error handling foundation. |
| 10 | Add integrations, background jobs, or external services if needed. |
| 11 | Review tests, quality, and security basics. |
| 12 | Prepare release handoff summary. |

## Important

These prompts are intentionally small. They should not be merged into one large prompt.
