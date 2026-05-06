# Django Prompt Pack

This directory contains the first Django prompt pack for **Kabeeri Vibe Developer Framework**.

The pack is designed for vibe developers and AI-powered builders who want to use Django as the implementation framework after completing Kabeeri VDF planning documents.

## Important clarification

This prompt pack is **not** a Django installer.

It does not download Python, install Django, create a virtual environment, run `django-admin startproject`, or create a Django project automatically.

It provides structured AI prompts that help an AI coding assistant work on a Django-based implementation after the project planning documents are ready.

## Purpose

This prompt pack helps the user move from planning to implementation in small, controlled AI coding tasks.

Each prompt should be used one at a time.

## Core rule

Do not ask an AI coding tool to build the whole Django project at once.

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
00_DJANGO_PROMPT_PACK_INDEX.md
00_PROMPT_USAGE_RULES.md
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
