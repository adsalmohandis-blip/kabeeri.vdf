# 00 — Supabase Prompt Pack Index

## Framework

Kabeeri Vibe Developer Framework

## Prompt pack

Supabase

## Version

v0.1.1

## Goal

Provide a safe, beginner-friendly Supabase prompt pack that helps vibe developers build Supabase-backed products step by step after completing Kabeeri VDF planning documents.

## What this pack is

This pack is a set of structured prompts for AI coding assistants.

It helps AI plan and implement Supabase features in a controlled order.

## What this pack is not

This pack is not:

- a Supabase installer
- a Supabase account creator
- a billing setup tool
- a replacement for official Supabase documentation
- a full backend by itself
- a license/security bypass tool

## Before using this pack

The user should already have, or should ask AI to help create:

```text
01_STRATEGY_AND_BUSINESS
02_FOUNDATION_ARCHITECTURE
03_RELEASE_SPECS
04_DATABASE_ARCHITECTURE
05_EXECUTION_PLAN
06_ENGINEERING_STANDARDS
08_AI_CODE_PROMPTS
09_TASK_TRACKING
10_ACCEPTANCE_CHECKLISTS
```

For Lite projects, not all folders are required, but the product idea and first release scope should be clear.

## Prompt order

Use the prompts in this order when applicable:

```text
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
```

Not every Supabase project needs every prompt.

## What each prompt does

| Prompt | Purpose |
|---|---|
| 01 | Give AI the product context and Supabase role. |
| 02 | Plan database schema and tables. |
| 03 | Plan authentication and user profiles. |
| 04 | Add Row Level Security policies safely. |
| 05 | Add storage buckets and file rules if needed. |
| 06 | Add Edge Function foundation if needed. |
| 07 | Add Realtime feature foundation if needed. |
| 08 | Connect Supabase to frontend/app code. |
| 09 | Add seed data and migration workflow. |
| 10 | Review security, RLS, secrets, and access. |
| 11 | Review tests and manual checks. |
| 12 | Prepare release handoff summary. |

## Important

These prompts are intentionally small. They should not be merged into one large prompt.
