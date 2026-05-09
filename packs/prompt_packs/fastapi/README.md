# FastAPI Prompt Pack

This directory contains the first FastAPI prompt pack for **Kabeeri Vibe Developer Framework**.

The pack is designed for vibe developers and AI-powered builders who want to use FastAPI as the implementation framework after completing Kabeeri VDF planning documents.

## Important clarification

This prompt pack is **not** a FastAPI installer.

It does not download Python, install FastAPI, create a virtual environment, configure Docker, or create a FastAPI project automatically.

It provides structured AI prompts that help an AI coding assistant work on a FastAPI-based implementation after the project planning documents are ready.

## Purpose

This prompt pack helps the user move from planning to implementation in small, controlled AI coding tasks.

Each prompt should be used one at a time.

## Core rule

Do not ask an AI coding tool to build the whole FastAPI project at once.

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
00_FASTAPI_PROMPT_PACK_INDEX.md
00_PROMPT_USAGE_RULES.md
01_PROJECT_CONTEXT_PROMPT.md
02_PROJECT_STRUCTURE_PROMPT.md
03_ENV_CONFIG_DATABASE_PROMPT.md
04_API_ROUTING_FOUNDATION_PROMPT.md
05_AUTH_USERS_PROMPT.md
06_ROLES_PERMISSIONS_PROMPT.md
07_CORE_MODELS_SCHEMAS_PROMPT.md
08_SERVICES_REPOSITORIES_PROMPT.md
09_BACKGROUND_TASKS_INTEGRATIONS_PROMPT.md
10_LOGGING_ERROR_HANDLING_PROMPT.md
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
