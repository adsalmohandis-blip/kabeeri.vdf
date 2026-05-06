# 00 — Django Prompt Pack Index

## Framework

Kabeeri Vibe Developer Framework

## Prompt pack

Django

## Version

v0.1.1

## Goal

Provide a safe, beginner-friendly Django prompt pack that helps vibe developers build a Django project step by step after completing Kabeeri VDF planning documents.

## What this pack is

This pack is a set of structured prompts for AI coding assistants.

It helps AI work on a Django project in a controlled order.

## What this pack is not

This pack is not:

- a Django installer
- a Python installer
- a virtual environment manager
- a hosting setup tool
- a complete codebase by itself
- a replacement for official Django documentation

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
03_SETTINGS_ENV_DATABASE_PROMPT.md
04_USERS_AUTH_PROMPT.md
05_PERMISSIONS_ADMIN_PROMPT.md
06_APPS_MODELS_PROMPT.md
07_VIEWS_URLS_API_PROMPT.md
08_FORMS_VALIDATION_PROMPT.md
09_ADMIN_BACKOFFICE_PROMPT.md
10_MEDIA_STATIC_FILES_PROMPT.md
11_TESTING_REVIEW_PROMPT.md
12_RELEASE_HANDOFF_PROMPT.md
```

## What each prompt does

| Prompt | Purpose |
|---|---|
| 01 | Give AI the product context and first-release scope. |
| 02 | Review or prepare a clean Django project/app structure. |
| 03 | Configure settings, environment variables, database, and local setup rules. |
| 04 | Add users and authentication foundation. |
| 05 | Add permissions and admin foundation. |
| 06 | Add first Django apps and models based on product documents. |
| 07 | Add views, URLs, and API foundation if needed. |
| 08 | Add forms and validation foundation. |
| 09 | Add admin/backoffice foundation. |
| 10 | Add media/static files foundation. |
| 11 | Review tests, quality, and security basics. |
| 12 | Prepare release handoff summary. |

## Important

These prompts are intentionally small. They should not be merged into one large prompt.
