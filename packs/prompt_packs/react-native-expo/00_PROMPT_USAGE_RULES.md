# 00 - React Native Expo Prompt Usage Rules

## Main rule

Use one prompt at a time.

Do not ask AI to build the full mobile app in one run.

## Kabeeri scope rule

Before editing, confirm:

- the task exists or the user approved the suggested task
- the app boundary points to the Expo app folder
- allowed files and forbidden files are clear
- the mobile app belongs to the same product as any linked backend

## Safe mobile rules

- Do not commit real secrets, private API keys, service role keys, signing keys, keystores, certificates, or provisioning profiles.
- Do not place server-only credentials inside the mobile app.
- Do not add permissions unless the feature needs them.
- Do not modify native iOS/Android folders unless the task explicitly approves it.
- Do not publish to App Store, Play Store, or EAS production channels without Owner approval.
- Do not silently add analytics, tracking, crash reporting, or push notifications.

## Expo-specific rules

- Prefer Expo-managed APIs when they satisfy the requirement.
- Treat `app.json`, `app.config.*`, `eas.json`, `ios/`, and `android/` as high-impact files.
- Explain every dependency added to `package.json`.
- Keep Expo Router, navigation, and folder structure consistent with the existing project.
- Check Android and iOS behavior when the change affects platform-specific behavior.

## Final response required from AI

After completing a prompt, respond with:

```text
Summary:
Files changed:
Commands run:
Device checks:
Risk notes:
Next recommended prompt:
```
