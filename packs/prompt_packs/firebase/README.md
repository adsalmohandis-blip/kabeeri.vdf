# Firebase Prompt Pack

This directory contains the first Firebase prompt pack for **Kabeeri Vibe Developer Framework**.

The pack is designed for vibe developers and AI-powered builders who want to use Firebase as a backend platform or backend-as-a-service after completing Kabeeri VDF planning documents.

## Important clarification

This prompt pack is **not** a Firebase installer.

It does not create a Firebase account, create a Firebase project, configure billing, install the Firebase CLI, deploy Cloud Functions, or change Google Cloud settings automatically.

It provides structured AI prompts that help an AI coding assistant plan and implement Firebase-backed features safely after the project planning documents are ready.

## What Firebase can support

This pack can help with:

- Firebase Authentication
- Firestore data modeling
- Realtime Database planning
- Security rules
- Cloud Storage
- Cloud Functions
- Hosting integration
- Frontend/mobile integration
- Emulator/testing workflows
- Security review
- Release handoff

## Core rule

Do not ask an AI coding tool to build the whole Firebase backend at once.

Use this flow:

```text
One prompt
→ one small Firebase task
→ review output
→ run checks
→ test locally/staging
→ commit
→ move to next prompt
```

## Included files

```text
00_FIREBASE_PROMPT_PACK_INDEX.md
00_FIREBASE_SAFETY_RULES.md
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
