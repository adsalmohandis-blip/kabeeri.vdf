# 00 — Strapi Prompt Pack Index

## Framework

Kabeeri Vibe Developer Framework

## Prompt pack

Strapi

## Version

v0.1.1

## Goal

Provide a safe, beginner-friendly Strapi prompt pack that helps vibe developers build Strapi-backed CMS/backend projects step by step after completing Kabeeri VDF planning documents.

## What this pack is

This pack is a set of structured prompts for AI coding assistants.

It helps AI work on Strapi-related tasks in a controlled order.

## What this pack is not

This pack is not:

- a Strapi installer
- a Node.js installer
- a hosting setup tool
- a license bypass tool
- a full CMS project by itself
- a replacement for official Strapi documentation

## Strapi work types supported

```text
Content type planning
Components
Dynamic zones
Roles and permissions
API access
Media library
Frontend integration
Custom controllers/services
Webhooks
Internationalization
Security review
Release handoff
```

## Before using this pack

The user should already have, or should ask AI to help create:

```text
01_STRATEGY_AND_BUSINESS
02_FOUNDATION_ARCHITECTURE
03_RELEASE_SPECS
04_DATABASE_ARCHITECTURE or content model plan
05_EXECUTION_PLAN
06_ENGINEERING_STANDARDS
08_AI_CODE_PROMPTS
09_TASK_TRACKING
10_ACCEPTANCE_CHECKLISTS
```

For Lite projects, not all folders are required, but the content/backend goal and first release scope should be clear.

## Prompt order

Use the prompts in this order when applicable:

```text
01_PROJECT_CONTEXT_PROMPT.md
02_CONTENT_MODELING_PROMPT.md
03_COMPONENTS_DYNAMIC_ZONES_PROMPT.md
04_ROLES_PERMISSIONS_PROMPT.md
05_API_ACCESS_PROMPT.md
06_MEDIA_LIBRARY_PROMPT.md
07_FRONTEND_INTEGRATION_PROMPT.md
08_CUSTOM_CONTROLLERS_SERVICES_PROMPT.md
09_WEBHOOKS_AUTOMATION_PROMPT.md
10_I18N_LOCALIZATION_PROMPT.md
11_TESTING_SECURITY_REVIEW_PROMPT.md
12_RELEASE_HANDOFF_PROMPT.md
```

Not every Strapi project needs every prompt.

## What each prompt does

| Prompt | Purpose |
|---|---|
| 01 | Give AI the product and Strapi context. |
| 02 | Plan content types and relationships. |
| 03 | Plan reusable components and dynamic zones. |
| 04 | Configure roles and permissions safely. |
| 05 | Plan API access and response exposure. |
| 06 | Plan media library and file handling. |
| 07 | Connect Strapi to frontend/app code. |
| 08 | Add custom controllers/services only if needed. |
| 09 | Add webhooks and automation if needed. |
| 10 | Plan i18n/localization if needed. |
| 11 | Review tests, security, permissions, and quality. |
| 12 | Prepare release handoff summary. |

## Important

These prompts are intentionally small. They should not be merged into one large prompt.
