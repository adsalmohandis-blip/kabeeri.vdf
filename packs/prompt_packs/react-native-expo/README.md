# React Native Expo Prompt Pack

This directory contains the React Native Expo prompt pack for **Kabeeri Vibe Developer Framework**.

Use this pack when a Kabeeri project includes an iOS/Android app built with React Native and Expo.

## Important clarification

This prompt pack is **not** an Expo installer.

It does not install Node.js, Expo CLI, Xcode, Android Studio, EAS CLI, dependencies, or create an Expo project by itself.

It gives AI coding assistants a controlled sequence of small mobile implementation prompts for an existing or separately prepared Expo project.

## When this pack is useful

Use it for:

- customer mobile apps
- internal mobile tools
- companion apps connected to an API
- Expo Router apps
- React Native apps using Expo modules
- mobile apps paired with Laravel, Node, Supabase, Firebase, or another backend

Do not use it for:

- Flutter apps
- web-only React apps
- native iOS/Android projects without React Native
- unrelated second products in the same Kabeeri workspace

## Core rule

Use one prompt at a time.

```text
One prompt
-> one small mobile task
-> review changed files
-> run checks
-> test on Expo Go, simulator, emulator, or device
-> record/capture the work
-> move to the next prompt
```

## Common layer

This pack is designed to work with:

```bash
kvdf prompt-pack compose react-native-expo --task <task-id>
```

Composition adds the shared Kabeeri common prompt layer, task scope, acceptance criteria, and optional context pack before the Expo-specific prompt.

## Included files

```text
00_REACT_NATIVE_EXPO_PROMPT_PACK_INDEX.md
00_PROMPT_USAGE_RULES.md
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
13_BACKEND_API_CONTRACT_PROMPT.md
14_ACCESSIBILITY_PERFORMANCE_PROMPT.md
prompt_pack_manifest.json
```

## Status

Mobile prompt pack for `v0.2.0`.

## Recommended beginner path

1. Confirm the mobile app boundary in Kabeeri.
2. Confirm whether the app is a standalone product or a channel connected to a backend.
3. Compose one prompt for the current task.
4. Let the AI work only inside the allowed files.
5. Run available checks and test on a real device, simulator, emulator, or Expo Go.
6. Record the AI run and connect useful work to ADRs when decisions were made.

For backend-connected apps, use the backend API contract prompt before screens that depend on server behavior. For apps close to demo or release, use the accessibility/performance prompt before EAS handoff.
