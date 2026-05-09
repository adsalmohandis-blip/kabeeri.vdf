# 00 — Firebase Prompt Pack Index

## Framework

Kabeeri Vibe Developer Framework

## Prompt pack

Firebase

## Version

v0.1.1

## Goal

Provide a safe, beginner-friendly Firebase prompt pack that helps vibe developers build Firebase-backed products step by step after completing Kabeeri VDF planning documents.

## What this pack is

This pack is a set of structured prompts for AI coding assistants.

It helps AI plan and implement Firebase features in a controlled order.

## What this pack is not

This pack is not:

- a Firebase installer
- a Firebase account creator
- a Google Cloud billing setup tool
- a replacement for official Firebase documentation
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
02_AUTH_USERS_PROMPT.md
03_FIRESTORE_DATA_MODEL_PROMPT.md
04_SECURITY_RULES_PROMPT.md
05_STORAGE_PROMPT.md
06_CLOUD_FUNCTIONS_PROMPT.md
07_FRONTEND_MOBILE_INTEGRATION_PROMPT.md
08_EMULATORS_TESTING_PROMPT.md
09_HOSTING_DEPLOYMENT_PROMPT.md
10_MIGRATION_SEEDING_PROMPT.md
11_SECURITY_REVIEW_PROMPT.md
12_RELEASE_HANDOFF_PROMPT.md
```

Not every Firebase project needs every prompt.

## What each prompt does

| Prompt | Purpose |
|---|---|
| 01 | Give AI the product context and Firebase role. |
| 02 | Plan Firebase Auth and user profiles. |
| 03 | Plan Firestore collections/documents and data shape. |
| 04 | Add or review Firestore/Storage security rules. |
| 05 | Add Cloud Storage buckets/path rules if needed. |
| 06 | Add Cloud Functions foundation if needed. |
| 07 | Connect Firebase to frontend/mobile app code. |
| 08 | Use emulators and testing workflow. |
| 09 | Plan Firebase Hosting/deployment if needed. |
| 10 | Add migration/seed/demo data workflow if needed. |
| 11 | Review security, secrets, rules, and access. |
| 12 | Prepare release handoff summary. |

## Important

These prompts are intentionally small. They should not be merged into one large prompt.
