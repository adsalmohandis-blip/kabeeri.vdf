# 00 — NestJS Prompt Pack Index

## Framework

Kabeeri Vibe Developer Framework

## Prompt pack

NestJS

## Version

v0.1.1

## Goal

Provide a safe, beginner-friendly NestJS prompt pack that helps vibe developers build a NestJS project step by step after completing Kabeeri VDF planning documents.

## What this pack is

This pack is a set of structured prompts for AI coding assistants.

It helps AI work on a NestJS project in a controlled order.

## What this pack is not

This pack is not:

- a NestJS installer
- a Node.js installer
- a package manager
- a hosting setup tool
- a full backend codebase by itself
- a replacement for official NestJS documentation

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
02_PROJECT_STRUCTURE_PROMPT.md
03_ENV_CONFIG_DATABASE_PROMPT.md
04_MODULES_CONTROLLERS_PROVIDERS_PROMPT.md
05_AUTH_USERS_PROMPT.md
06_ROLES_GUARDS_PERMISSIONS_PROMPT.md
07_CORE_ENTITIES_DTOS_PROMPT.md
08_SERVICES_REPOSITORIES_PROMPT.md
09_VALIDATION_ERROR_HANDLING_PROMPT.md
10_JOBS_EVENTS_INTEGRATIONS_PROMPT.md
11_TESTING_REVIEW_PROMPT.md
12_RELEASE_HANDOFF_PROMPT.md
```

## What each prompt does

| Prompt | Purpose |
|---|---|
| 01 | Give AI the product context and first-release backend scope. |
| 02 | Review or prepare a clean NestJS project structure. |
| 03 | Configure environment variables, config module, database, and local setup rules. |
| 04 | Add module/controller/provider foundation. |
| 05 | Add authentication, users, and token/session foundation if needed. |
| 06 | Add simple roles, guards, and permission checks. |
| 07 | Add first entities/models and DTOs based on project documents. |
| 08 | Add service/repository layer foundation if useful. |
| 09 | Add validation pipes, exception filters, and error response style. |
| 10 | Add jobs, events, and external integration foundation if needed. |
| 11 | Review tests, quality, and security basics. |
| 12 | Prepare release handoff summary. |

## Important

These prompts are intentionally small. They should not be merged into one large prompt.
