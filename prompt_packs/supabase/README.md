# Supabase Prompt Pack

This directory contains the first Supabase prompt pack for **Kabeeri Vibe Developer Framework**.

The pack is designed for vibe developers and AI-powered builders who want to use Supabase as a backend platform or backend-as-a-service after completing Kabeeri VDF planning documents.

## Important clarification

This prompt pack is **not** a Supabase installer.

It does not create a Supabase account, create a Supabase project, run the Supabase CLI, configure billing, or deploy anything automatically.

It provides structured AI prompts that help an AI coding assistant plan and implement Supabase-backed features safely after the project planning documents are ready.

## What Supabase can support

This pack can help with:

- Database tables
- Row Level Security policies
- Authentication
- Storage buckets
- Edge Functions
- Realtime features
- API/data access patterns
- Frontend integration
- Security review
- Release handoff

## Core rule

Do not ask an AI coding tool to build the whole Supabase backend at once.

Use this flow:

```text
One prompt
→ one small Supabase task
→ review output
→ run checks
→ test locally/staging
→ commit
→ move to next prompt
```

## Included files

```text
00_SUPABASE_PROMPT_PACK_INDEX.md
00_SUPABASE_SAFETY_RULES.md
01_PROJECT_CONTEXT_PROMPT.md
02_SCHEMA_DATABASE_PROMPT.md
03_AUTH_USERS_PROMPT.md
04_RLS_POLICIES_PROMPT.md
05_STORAGE_PROMPT.md
06_EDGE_FUNCTIONS_PROMPT.md
07_REALTIME_PROMPT.md
08_FRONTEND_INTEGRATION_PROMPT.md
09_SEEDING_MIGRATIONS_PROMPT.md
10_SECURITY_REVIEW_PROMPT.md
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
