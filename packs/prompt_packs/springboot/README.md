# Spring Boot Prompt Pack

This directory contains the first Spring Boot prompt pack for **Kabeeri Vibe Developer Framework**.

The pack is designed for vibe developers and AI-powered builders who want to use Spring Boot as the implementation framework after completing Kabeeri VDF planning documents.

## Important clarification

This prompt pack is **not** a Spring Boot installer.

It does not install Java, Maven, Gradle, Spring Initializr, databases, system packages, or create a Spring Boot project automatically.

It provides structured AI prompts that help an AI coding assistant work on an existing or separately prepared Spring Boot project.

## What Spring Boot can support

This pack can help with:

- REST API structure
- controllers
- services
- repositories
- entities
- DTOs
- validation
- Spring Security
- roles and permissions
- database migrations
- background jobs
- integrations
- testing
- release handoff

## Core rule

Do not ask an AI coding tool to build the whole Spring Boot application at once.

Use this flow:

```text
One prompt
→ one small Spring Boot task
→ review output
→ run checks/tests
→ commit
→ move to next prompt
```

## Included files

```text
00_SPRING_BOOT_PROMPT_PACK_INDEX.md
00_PROMPT_USAGE_RULES.md
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
prompt_pack_manifest.json
```

## Status

Foundation prompt pack for `v0.1.1`.
