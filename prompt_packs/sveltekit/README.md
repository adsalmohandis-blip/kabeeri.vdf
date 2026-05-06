# SvelteKit Prompt Pack

This directory contains the first SvelteKit prompt pack for **Kabeeri Vibe Developer Framework**.

The pack is designed for vibe developers and AI-powered builders who want to use SvelteKit as the implementation stack after completing Kabeeri VDF planning documents.

## Important clarification

This prompt pack is **not** a SvelteKit installer.

It does not install Node.js, create a SvelteKit project, run package manager commands, configure hosting, or deploy anything automatically.

It provides structured AI prompts that help an AI coding assistant work on an existing or separately prepared SvelteKit project.

## What SvelteKit can support

This pack can help with:

- SvelteKit app structure
- Routing and layouts
- Components
- Server load functions
- Form actions
- API routes
- Authentication
- Data fetching
- State management
- UI foundation
- Testing and review
- Release handoff

## Core rule

Do not ask an AI coding tool to build the whole SvelteKit app at once.

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
00_SVELTEKIT_PROMPT_PACK_INDEX.md
00_PROMPT_USAGE_RULES.md
01_PROJECT_CONTEXT_PROMPT.md
02_APP_STRUCTURE_PROMPT.md
03_ENV_CONFIG_API_PROMPT.md
04_ROUTING_LAYOUTS_PROMPT.md
05_COMPONENTS_DESIGN_SYSTEM_PROMPT.md
06_LOAD_FUNCTIONS_DATA_PROMPT.md
07_AUTH_USERS_PROMPT.md
08_FORMS_ACTIONS_VALIDATION_PROMPT.md
09_API_ROUTES_SERVER_LOGIC_PROMPT.md
10_CORE_FEATURES_PROMPT.md
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
