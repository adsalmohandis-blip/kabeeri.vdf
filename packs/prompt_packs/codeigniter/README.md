# CodeIgniter Prompt Pack

This directory contains the first CodeIgniter prompt pack for **Kabeeri Vibe Developer Framework**.

The pack is designed for vibe developers and AI-powered builders who want to use CodeIgniter as a lightweight PHP backend or full-stack framework after completing Kabeeri VDF planning documents.

## Important clarification

This prompt pack is **not** a CodeIgniter installer.

It does not install PHP, Composer, CodeIgniter, database servers, packages, or create a CodeIgniter project automatically.

It provides structured AI prompts that help an AI coding assistant work on an existing or separately prepared CodeIgniter project.

## What CodeIgniter can support

This pack can help with:

- CodeIgniter app structure
- routes
- controllers
- models
- services
- filters
- validation
- database migrations
- authentication
- roles and permissions
- APIs
- admin/backoffice
- tests
- release handoff

## Core rule

Do not ask an AI coding tool to build the whole CodeIgniter application at once.

Use this flow:

```text
One prompt
→ one small CodeIgniter task
→ review output
→ run checks/tests
→ commit
→ move to next prompt
```

## Included files

```text
00_CODEIGNITER_PROMPT_PACK_INDEX.md
00_PROMPT_USAGE_RULES.md
01_PROJECT_CONTEXT_PROMPT.md
02_APP_STRUCTURE_PROMPT.md
03_ENV_CONFIG_DATABASE_PROMPT.md
04_ROUTES_CONTROLLERS_API_PROMPT.md
05_AUTH_USERS_PROMPT.md
06_ROLES_FILTERS_PERMISSIONS_PROMPT.md
07_MODELS_MIGRATIONS_PROMPT.md
08_SERVICES_BUSINESS_LOGIC_PROMPT.md
09_VALIDATION_FORMS_PROMPT.md
10_ADMIN_BACKOFFICE_PROMPT.md
11_TESTING_REVIEW_PROMPT.md
12_RELEASE_HANDOFF_PROMPT.md
prompt_pack_manifest.json
```

## Status

Foundation prompt pack for `v0.1.1`.
