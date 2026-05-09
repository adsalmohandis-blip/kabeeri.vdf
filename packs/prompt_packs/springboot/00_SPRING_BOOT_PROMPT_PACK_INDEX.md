# 00 — Spring Boot Prompt Pack Index

## Framework

Kabeeri Vibe Developer Framework

## Prompt pack

Spring Boot

## Version

v0.1.1

## Goal

Provide a safe, beginner-friendly Spring Boot prompt pack that helps vibe developers build Spring Boot applications step by step after completing Kabeeri VDF planning documents.

## What this pack is

This pack is a set of structured prompts for AI coding assistants.

It helps AI work on Spring Boot projects in a controlled order.

## What this pack is not

This pack is not:

- a Spring Boot installer
- a Java installer
- a Maven or Gradle installer
- a hosting setup tool
- a full application by itself
- a replacement for official Spring documentation

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
04_CONTROLLERS_ROUTES_API_PROMPT.md
05_AUTH_USERS_PROMPT.md
06_ROLES_SECURITY_PROMPT.md
07_ENTITIES_DTOS_REPOSITORIES_PROMPT.md
08_SERVICES_BUSINESS_LOGIC_PROMPT.md
09_VALIDATION_ERROR_HANDLING_PROMPT.md
10_INTEGRATIONS_JOBS_EVENTS_PROMPT.md
11_TESTING_REVIEW_PROMPT.md
12_RELEASE_HANDOFF_PROMPT.md
```

## What each prompt does

| Prompt | Purpose |
|---|---|
| 01 | Give AI the product and Spring Boot context. |
| 02 | Review or prepare a clean Spring Boot app structure. |
| 03 | Configure environment, profiles, database, and local setup rules. |
| 04 | Add controllers, API routing, health checks, and response conventions. |
| 05 | Add authentication and users foundation if needed. |
| 06 | Add roles, authorization, and Spring Security foundation. |
| 07 | Add first product-specific entities, DTOs, and repositories. |
| 08 | Add services and business logic foundation. |
| 09 | Add validation and error handling foundation. |
| 10 | Add integrations, jobs, or events if needed. |
| 11 | Review tests, quality, and security basics. |
| 12 | Prepare release handoff summary. |

## Important

These prompts are intentionally small. They should not be merged into one large prompt.
