# 10 - Device Permissions and Notifications Prompt

## Goal

Add mobile device capabilities only when explicitly required and approved.

## Information the user should provide before running this prompt

- Which capability is needed: camera, media library, location, contacts, notifications, deep links, biometrics, or another device API?
- Why is the permission needed?
- What fallback should users see if permission is denied?
- Are push notifications local only or remote?

## Files and areas allowed for this prompt

```text
app/
src/device/
src/permissions/
src/notifications/
src/screens/
app.json
app.config.*
package.json
README.md
```

## Files and areas forbidden for this prompt

```text
EAS credentials
Store publishing credentials
Private push provider secrets
Native ios/ or android/ changes unless explicitly approved
Unrelated feature screens
```

## Tasks

1. Confirm the requested device capability.
2. Add only required Expo modules or reuse existing ones.
3. Add permission request flow with denied and unavailable states.
4. Keep permission copy honest and minimal.
5. Avoid collecting data beyond the task need.
6. Document manual testing on iOS and Android.
7. Do not enable production push notification infrastructure without approval.

## Checks to run

```bash
npm run lint
npm test
npx expo-doctor
```

Run only checks that exist.

## Acceptance criteria

- Permission use is justified.
- Denied/unavailable states are handled.
- No private credentials are committed.
- Manual device test notes are included.
