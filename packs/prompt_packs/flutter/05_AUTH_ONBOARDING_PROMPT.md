# 05 — Authentication and Onboarding Prompt

## Goal

Add authentication and onboarding foundation if the first release needs it.

## Context for the AI coding assistant

This prompt is optional. Use it only if the mobile app needs login, signup, or first-use onboarding.

## Information the user should provide before running this prompt

- Does the first release need login?
- Who logs in: customers, admins, employees, or all?
- Is auth handled by an API or external provider?
- Does the app need onboarding screens?
- Technical note: If unsure, ask ChatGPT to compare simple auth options for Flutter apps.

## Files and areas allowed for this prompt

```text
lib/features/auth/
lib/features/onboarding/
lib/router/
lib/services/
lib/state/
pubspec.yaml
```

## Files and areas forbidden for this prompt

```text
Unrelated product modules
Advanced subscriptions
Marketplace
Future extension features
```

## Tasks

1. Ask whether login is required in the first release.
2. Identify auth approach: backend API auth, Firebase, Supabase, custom JWT, or none.
3. Do not choose a paid/external provider without user approval.
4. Add minimal auth screens only if needed.
5. Add onboarding screens only if required by the first release.
6. Add protected navigation behavior if needed.
7. Do not build complex roles or advanced account settings yet.


## Checks to run

```bash
flutter analyze
flutter test
```

## Acceptance criteria

- Auth/onboarding approach is clear.
- Protected navigation is clear if needed.
- No real secrets are committed.
- The solution is not overbuilt.


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
