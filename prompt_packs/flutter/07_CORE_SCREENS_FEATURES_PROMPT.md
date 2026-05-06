# 07 — Core Screens and Features Prompt

## Goal

Create the first product-specific Flutter screens and features based on Kabeeri VDF planning documents.

## Context for the AI coding assistant

This prompt touches actual product features. It must be based on planning documents, not guesses.

## Information the user should provide before running this prompt

- What is the first feature users must use?
- What data does it show or collect?
- What should happen when there is no data?
- Which features should wait until later?

## Files and areas allowed for this prompt

```text
lib/features/
lib/screens/
lib/widgets/
lib/services/
lib/state/
test/
```

## Files and areas forbidden for this prompt

```text
Unplanned future modules
Advanced extension features
Native platform code unless required
Unrelated UI rewrites
```

## Tasks

1. Read the user's product and release notes.
2. Identify only the first-release mobile screens/features.
3. Implement one small feature area, not the whole app.
4. Use existing navigation, theme, widgets, and data helpers.
5. Add loading, empty, and error states where needed.
6. Add simple tests if the project has a test setup.
7. Do not add future or optional modules.


## Checks to run

```bash
flutter analyze
flutter test
```

## Acceptance criteria

- Only first-release mobile features were created.
- Feature matches product documents.
- UI states are handled.
- No future features are added.


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
