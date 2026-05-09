# Strapi Prompt Pack

This directory contains the first Strapi prompt pack for **Kabeeri Vibe Developer Framework**.

The pack is designed for vibe developers and AI-powered builders who want to use Strapi as a headless CMS or backend content platform after completing Kabeeri VDF planning documents.

## Important clarification

This prompt pack is **not** a Strapi installer.

It does not install Node.js, create a Strapi project, run Strapi CLI commands, configure hosting, configure billing, or deploy anything automatically.

It provides structured AI prompts that help an AI coding assistant plan and implement Strapi-backed features safely after the project planning documents are ready.

## What Strapi can support

This pack can help with:

- Content types
- Components
- Dynamic zones
- Roles and permissions
- Admin content workflows
- API access
- Media library planning
- Frontend integration
- Custom controllers/services
- Webhooks
- Internationalization
- Security review
- Release handoff

## Core rule

Do not ask an AI coding tool to build the whole Strapi backend at once.

Use this flow:

```text
One prompt
→ one small Strapi task
→ review output
→ run checks
→ test locally/staging
→ commit
→ move to next prompt
```

## Included files

```text
00_STRAPI_PROMPT_PACK_INDEX.md
00_STRAPI_SAFETY_RULES.md
01_PROJECT_CONTEXT_PROMPT.md
02_CONTENT_MODELING_PROMPT.md
03_COMPONENTS_DYNAMIC_ZONES_PROMPT.md
04_ROLES_PERMISSIONS_PROMPT.md
05_API_ACCESS_PROMPT.md
06_MEDIA_LIBRARY_PROMPT.md
07_FRONTEND_INTEGRATION_PROMPT.md
08_CUSTOM_CONTROLLERS_SERVICES_PROMPT.md
09_WEBHOOKS_AUTOMATION_PROMPT.md
10_I18N_LOCALIZATION_PROMPT.md
11_TESTING_SECURITY_REVIEW_PROMPT.md
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
