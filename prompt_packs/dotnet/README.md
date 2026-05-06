# .NET Prompt Pack

This directory contains the first .NET prompt pack for **Kabeeri Vibe Developer Framework**.

The pack is designed for vibe developers and AI-powered builders who want to use .NET as the implementation framework after completing Kabeeri VDF planning documents.

## Important clarification

This prompt pack is **not** a .NET installer.

It does not download .NET, install SDKs, create a .NET project automatically, or replace official .NET tooling.

It provides structured AI prompts that help an AI coding assistant work on a .NET-based implementation after the project planning documents are ready.

## Purpose

This prompt pack helps the user move from planning to implementation in small, controlled AI coding tasks.

Each prompt should be used one at a time.

## Core rule

Do not ask an AI coding tool to build the whole project at once.

Use this flow:

```text
One prompt
→ one small task
→ review output
→ run checks/tests
→ commit
→ move to next prompt
```

## Included files

```text
00_DOTNET_PROMPT_PACK_INDEX.md
00_PROMPT_USAGE_RULES.md
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
