# 04 — Theme and Design System Prompt

## Goal

Create a simple Flutter theme and reusable widget foundation.

## Context for the AI coding assistant

This prompt makes the mobile app visually consistent without overbuilding a full design system.

## Information the user should provide before running this prompt

- What style should the app feel like? Simple, modern, enterprise, playful, luxury, etc.
- Are there brand colors?
- Is Arabic/RTL important?
- Do you want custom widgets or a UI package?

## Files and areas allowed for this prompt

```text
lib/theme/
lib/widgets/
lib/core/
assets/
pubspec.yaml
```

## Files and areas forbidden for this prompt

```text
Product logic
API/database changes
Unrelated screens
```

## Tasks

1. Identify the desired visual style from the user's answers.
2. Add or organize a basic app theme.
3. Add reusable widgets such as AppButton, AppCard, AppTextField, EmptyState, LoadingState, AppScaffold.
4. Add spacing, typography, and color tokens if useful.
5. Add accessibility-friendly defaults where possible.
6. Add RTL-friendly structure if needed.
7. Do not create a large component library.
8. Do not change business logic.


## Checks to run

```bash
flutter analyze
flutter test
```

## Acceptance criteria

- Basic theme and reusable widgets exist or are organized.
- Visual style is consistent.
- Widgets are beginner-friendly.
- App still runs/analyzes.


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
