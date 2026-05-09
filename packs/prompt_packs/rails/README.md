# Ruby on Rails Prompt Pack

This directory contains the first Ruby on Rails prompt pack for **Kabeeri Vibe Developer Framework**.

The pack is designed for vibe developers and AI-powered builders who want to use Ruby on Rails as the implementation framework after completing Kabeeri VDF planning documents.

## Important clarification

This prompt pack is **not** a Rails installer.

It does not install Ruby, Rails, Bundler, databases, system packages, or create a Rails project automatically.

It provides structured AI prompts that help an AI coding assistant work on an existing or separately prepared Ruby on Rails project.

## What Ruby on Rails can support

This pack can help with:

- Rails app structure
- MVC foundation
- routes
- controllers
- models
- migrations
- Active Record relationships
- authentication
- authorization
- admin/backoffice
- background jobs
- mailers
- tests
- release handoff

## Core rule

Do not ask an AI coding tool to build the whole Rails application at once.

Use this flow:

```text
One prompt
→ one small Rails task
→ review output
→ run checks/tests
→ commit
→ move to next prompt
```

## Included files

```text
00_RAILS_PROMPT_PACK_INDEX.md
00_PROMPT_USAGE_RULES.md
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
prompt_pack_manifest.json
```

## Recommended tools

This prompt pack can be used with:

- ChatGPT
- Codex
- Cursor
- Claude Code
- Windsurf
- GitHub Copilot
- other AI coding assistants

## Status

Foundation prompt pack for `v0.1.1`.
