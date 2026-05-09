# Symfony Prompt Pack

This directory contains the first Symfony prompt pack for **Kabeeri Vibe Developer Framework**.

The pack is designed for vibe developers and AI-powered builders who want to use Symfony as a PHP backend or full-stack framework after completing Kabeeri VDF planning documents.

## Important clarification

This prompt pack is **not** a Symfony installer.

It does not install PHP, Composer, Symfony CLI, database servers, packages, or create a Symfony project automatically.

It provides structured AI prompts that help an AI coding assistant work on an existing or separately prepared Symfony project.

## What Symfony can support

This pack can help with:

- Symfony app structure
- controllers
- routes
- services
- dependency injection
- Doctrine entities
- migrations
- forms
- validation
- security
- roles and authorization
- APIs
- admin/backoffice
- tests
- release handoff

## Core rule

Do not ask an AI coding tool to build the whole Symfony application at once.

Use this flow:

```text
One prompt
→ one small Symfony task
→ review output
→ run checks/tests
→ commit
→ move to next prompt
```

## Included files

```text
00_SYMFONY_PROMPT_PACK_INDEX.md
00_PROMPT_USAGE_RULES.md
01_PROJECT_CONTEXT_PROMPT.md
02_APP_STRUCTURE_PROMPT.md
03_ENV_CONFIG_DATABASE_PROMPT.md
04_ROUTES_CONTROLLERS_API_PROMPT.md
05_SECURITY_USERS_PROMPT.md
06_ROLES_AUTHORIZATION_PROMPT.md
07_DOCTRINE_ENTITIES_MIGRATIONS_PROMPT.md
08_FORMS_VALIDATION_PROMPT.md
09_SERVICES_BUSINESS_LOGIC_PROMPT.md
10_ADMIN_BACKOFFICE_PROMPT.md
11_TESTING_REVIEW_PROMPT.md
12_RELEASE_HANDOFF_PROMPT.md
prompt_pack_manifest.json
```

## Status

Foundation prompt pack for `v0.1.1`.
