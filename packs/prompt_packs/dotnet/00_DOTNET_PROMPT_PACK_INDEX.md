# 00 — .NET Prompt Pack Index

## Framework

Kabeeri Vibe Developer Framework

## Prompt pack

.NET

## Version

v0.1.1

## Goal

Provide a safe, beginner-friendly .NET prompt pack that helps vibe developers build a .NET project step by step after completing Kabeeri VDF planning documents.

## What this pack is

This pack is a set of structured prompts for AI coding assistants.

It helps AI work on a .NET project in a controlled order.

## What this pack is not

This pack is not:

- a .NET installer
- a replacement for Visual Studio, Rider, or VS Code
- a replacement for official .NET templates
- a full architecture generator
- a codebase by itself

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

For small Lite projects, not all folders are required, but the product idea and first release scope should be clear.

## Prompt order

Use the prompts in this order:

```text
01_PROJECT_CONTEXT_PROMPT.md
02_SOLUTION_STRUCTURE_PROMPT.md
03_CONFIGURATION_DATABASE_PROMPT.md
04_AUTH_USERS_PROMPT.md
05_ROLES_AUTHORIZATION_PROMPT.md
06_API_FOUNDATION_PROMPT.md
07_CORE_DOMAIN_MODELS_PROMPT.md
08_SERVICES_APPLICATION_LAYER_PROMPT.md
09_ADMIN_BACKOFFICE_PROMPT.md
10_LOGGING_AUDIT_PROMPT.md
11_TESTING_REVIEW_PROMPT.md
12_RELEASE_HANDOFF_PROMPT.md
```

## What each prompt does

| Prompt | Purpose |
|---|---|
| 01 | Give AI the project context and scope before coding. |
| 02 | Review or create a clean .NET solution structure. |
| 03 | Configure app settings, database, EF Core, and environment basics. |
| 04 | Add authentication, users, and profile foundation. |
| 05 | Add simple roles and authorization foundation. |
| 06 | Add first API foundation and response conventions. |
| 07 | Create first domain models based on project documents. |
| 08 | Add service/application layer foundation. |
| 09 | Add simple admin/backoffice foundation if needed. |
| 10 | Add logging and audit foundation. |
| 11 | Review tests, quality, and safety. |
| 12 | Prepare release handoff summary. |

## Important

These prompts are intentionally small. They should not be merged into one large prompt.
