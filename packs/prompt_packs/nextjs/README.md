# Next.js Prompt Pack

This directory contains the first Next.js prompt pack for **Kabeeri Vibe Developer Framework**.

The pack is designed for vibe developers and AI-powered builders who want to use Next.js as the implementation framework after completing Kabeeri VDF planning documents.

## Important clarification

This prompt pack is **not** a Next.js installer.

It does not download Node.js, install packages, run `create-next-app`, or create a Next.js project automatically.

It provides structured AI prompts that help an AI coding assistant work on a Next.js-based implementation after the project planning documents are ready.

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
00_NEXTJS_PROMPT_PACK_INDEX.md
00_PROMPT_USAGE_RULES.md
01_PROJECT_CONTEXT_PROMPT.md
02_APP_STRUCTURE_PROMPT.md
03_ENV_CONFIG_PROMPT.md
04_ROUTING_LAYOUTS_PROMPT.md
05_DESIGN_SYSTEM_UI_PROMPT.md
06_AUTH_USERS_PROMPT.md
07_DATA_API_INTEGRATION_PROMPT.md
08_CORE_FEATURES_PROMPT.md
09_ADMIN_DASHBOARD_PROMPT.md
10_FORMS_VALIDATION_PROMPT.md
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
