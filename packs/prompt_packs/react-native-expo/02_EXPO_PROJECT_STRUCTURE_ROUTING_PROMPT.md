# 02 - Expo Project Structure and Routing Prompt

## Goal

Review or prepare the Expo app structure, routing, and navigation foundation without adding product features.

## Information the user should provide before running this prompt

- Is the project using Expo Router, React Navigation, or another routing approach?
- What first-release screens are planned?
- Are there public, authenticated, admin, or onboarding areas?

## Files and areas allowed for this prompt

```text
app/
src/
components/
navigation/
package.json
README.md
```

## Files and areas forbidden for this prompt

```text
ios/
android/
EAS credentials
Unrelated backend folders
Product feature implementation
```

## Tasks

1. Detect the current routing/navigation approach.
2. Keep the existing approach unless there is no structure yet.
3. Create a minimal folder structure if needed.
4. Add placeholder routes/screens only when required to make navigation coherent.
5. Separate shared components, screens, services, and config in a simple way.
6. Do not implement real business features.
7. Document how to add the next screen.

## Checks to run

```bash
npm run lint
npm test
npx expo-doctor
```

Run only checks that are available.

## Acceptance criteria

- Navigation structure is understandable.
- The app can still start.
- No unrelated dependencies were added.
- No product feature scope was expanded.
