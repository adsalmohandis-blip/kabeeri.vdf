# 10 — Device Permissions and Notifications Prompt

## Goal

Add device permission or notification foundation if needed.

## Context for the AI coding assistant

This prompt is optional. Use it only if the first release needs notifications, camera, location, files, contacts, or other device permissions.

## Information the user should provide before running this prompt

- Does the app need camera, location, files, contacts, notifications, or other permissions?
- Why does it need each permission?
- Are push or local notifications needed in the first release?
- Technical note: If unsure, ask ChatGPT to identify permissions from your app features.

## Files and areas allowed for this prompt

```text
lib/permissions/
lib/notifications/
android/
ios/
pubspec.yaml
```

## Files and areas forbidden for this prompt

```text
Unrelated native modules
Advanced notification campaigns
Real production keys
```

## Tasks

1. Ask which device permissions are needed.
2. Ask whether push/local notifications are needed in the first release.
3. Add permission request flow only for confirmed permissions.
4. Explain why the app asks for each permission.
5. Add notification setup only as a foundation, not full campaign system.
6. Do not add native platform changes unless required and approved.
7. Do not commit real production keys.


## Checks to run

```bash
flutter analyze
flutter test
Test permission flow on emulator/device if possible.
```

## Acceptance criteria

- Permissions are only requested when needed.
- User-facing permission explanation is clear.
- Notification foundation exists only if needed.
- No real production secrets are committed.


## Important scope rule

Do not build features outside this prompt.  
Do not create advanced modules unless they are explicitly listed above.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Commands run:
Device/emulator checks:
Manual review notes:
Next recommended prompt:
```
