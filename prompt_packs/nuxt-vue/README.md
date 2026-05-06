# Nuxt / Vue Prompt Pack

This directory contains the first Nuxt / Vue prompt pack for **Kabeeri Vibe Developer Framework**.

The pack is designed for vibe developers and AI-powered builders who want to use Nuxt or Vue as the implementation stack after completing Kabeeri VDF planning documents.

## Important clarification

This prompt pack is **not** a Nuxt or Vue installer.

It does not install Node.js, create a Nuxt/Vue project, run package manager commands, configure hosting, or deploy anything automatically.

It provides structured AI prompts that help an AI coding assistant work on an existing or separately prepared Nuxt/Vue project.

## What Nuxt / Vue can support

This pack can help with:

- Nuxt app structure
- Vue app structure
- Routing and layouts
- Components and composables
- State management
- API/data fetching
- Authentication
- Forms and validation
- Content pages
- Admin dashboards
- SSR/SPA/static rendering decisions
- Testing and release review

## Core rule

Do not ask an AI coding tool to build the whole Nuxt/Vue app at once.

Use this flow:

```text
One prompt
→ one small task
→ review output
→ run checks
→ test locally
→ commit
→ move to next prompt
```

## Included files

```text
00_NUXT_VUE_PROMPT_PACK_INDEX.md
00_PROMPT_USAGE_RULES.md
01_PROJECT_CONTEXT_PROMPT.md
02_APP_STRUCTURE_PROMPT.md
03_ENV_CONFIG_API_PROMPT.md
04_ROUTING_LAYOUTS_PROMPT.md
05_COMPONENTS_DESIGN_SYSTEM_PROMPT.md
06_STATE_COMPOSABLES_PROMPT.md
07_AUTH_USERS_PROMPT.md
08_DATA_FETCHING_API_PROMPT.md
09_CORE_PAGES_FEATURES_PROMPT.md
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
