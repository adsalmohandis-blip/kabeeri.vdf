# Go / Gin Prompt Pack

This directory contains the first Go / Gin prompt pack for **Kabeeri Vibe Developer Framework**.

The pack is designed for vibe developers and AI-powered builders who want to use Go with the Gin web framework as a backend/API implementation stack after completing Kabeeri VDF planning documents.

## Important clarification

This prompt pack is **not** a Go or Gin installer.

It does not install Go, initialize modules, install Gin, configure Docker, create a backend project, or deploy anything automatically.

It provides structured AI prompts that help an AI coding assistant work on an existing or separately prepared Go / Gin project.

## What Go / Gin can support

This pack can help with:

- REST API structure
- routing
- middleware
- handlers
- services
- repositories
- database integration
- authentication
- roles and permissions
- validation
- error handling
- logging
- integrations
- testing and release review

## Core rule

Do not ask an AI coding tool to build the whole Go / Gin backend at once.

Use this flow:

```text
One prompt
→ one small backend task
→ review output
→ run checks/tests
→ commit
→ move to next prompt
```

## Included files

```text
00_GO_GIN_PROMPT_PACK_INDEX.md
00_PROMPT_USAGE_RULES.md
01_PROJECT_CONTEXT_PROMPT.md
02_PROJECT_STRUCTURE_PROMPT.md
03_ENV_CONFIG_DATABASE_PROMPT.md
04_ROUTING_MIDDLEWARE_PROMPT.md
05_AUTH_USERS_PROMPT.md
06_ROLES_PERMISSIONS_PROMPT.md
07_CORE_MODELS_DTOs_PROMPT.md
08_HANDLERS_SERVICES_REPOSITORIES_PROMPT.md
09_VALIDATION_ERROR_HANDLING_PROMPT.md
10_INTEGRATIONS_JOBS_PROMPT.md
11_TESTING_REVIEW_PROMPT.md
12_RELEASE_HANDOFF_PROMPT.md
prompt_pack_manifest.json
```

## Status

Foundation prompt pack for `v0.1.1`.
