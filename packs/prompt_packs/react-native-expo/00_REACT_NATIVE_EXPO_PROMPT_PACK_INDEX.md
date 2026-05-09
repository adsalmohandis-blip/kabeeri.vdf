# 00 - React Native Expo Prompt Pack Index

## Framework

Kabeeri Vibe Developer Framework

## Prompt pack

React Native Expo

## Version

v0.1.1

## Goal

Provide a safe, beginner-friendly prompt sequence for building an Expo mobile app with AI assistance after Kabeeri planning is ready.

## What this pack is

This pack gives an AI coding assistant small, reviewable tasks for React Native Expo apps.

## What this pack is not

This pack is not:

- an Expo installer
- an EAS account setup guide
- an App Store or Play Store publishing bot
- a replacement for official Expo, React Native, Apple, or Google documentation
- permission to build an entire mobile app in one AI run

## Before using this pack

The Kabeeri workspace should have a clear first mobile release scope, app boundary, target users, API/data relationship, and acceptance criteria.

Useful Kabeeri areas:

```text
project_intake/
governance/APP_BOUNDARY_GOVERNANCE.md
governance/EXECUTION_SCOPE_GOVERNANCE.md
prompt_packs/common/
design_system/
frontend_specs/
acceptance_checklists/
```

## Prompt order

Use the prompts in this order:

```text
01_MOBILE_PROJECT_CONTEXT_PROMPT.md
02_EXPO_PROJECT_STRUCTURE_ROUTING_PROMPT.md
03_ENV_CONFIG_API_PROMPT.md
04_THEME_DESIGN_SYSTEM_PROMPT.md
05_AUTH_ONBOARDING_PROMPT.md
06_API_DATA_STATE_PROMPT.md
07_CORE_SCREENS_FEATURES_PROMPT.md
08_FORMS_VALIDATION_KEYBOARD_PROMPT.md
09_LOCAL_STORAGE_OFFLINE_PROMPT.md
10_DEVICE_PERMISSIONS_NOTIFICATIONS_PROMPT.md
11_TESTING_REVIEW_PROMPT.md
12_EAS_RELEASE_HANDOFF_PROMPT.md
```

## What each prompt does

| Prompt | Purpose |
| --- | --- |
| 01 | Give AI the product and mobile app context. |
| 02 | Review or prepare Expo project structure and routing. |
| 03 | Configure environment, public API config, and secret boundaries. |
| 04 | Create theme, tokens, typography, spacing, and reusable UI foundation. |
| 05 | Add authentication and onboarding foundation if needed. |
| 06 | Add API/data fetching and state management foundation. |
| 07 | Add first release screens and mobile features. |
| 08 | Add forms, validation, keyboard, and touch ergonomics. |
| 09 | Add local storage, cache, and offline behavior if needed. |
| 10 | Add permissions, media, location, notifications, or device features if needed. |
| 11 | Review tests, accessibility, device behavior, and quality. |
| 12 | Prepare EAS/release handoff without publishing automatically. |

## Important

Expo apps can touch sensitive mobile surfaces such as permissions, tokens, push notifications, stores, and native config. Treat those as high-risk changes and require explicit task acceptance before editing them.
