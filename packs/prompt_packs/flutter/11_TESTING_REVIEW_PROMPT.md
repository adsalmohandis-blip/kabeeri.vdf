# 11 — Testing and Review Prompt

## Goal

Review the current Flutter implementation and improve basic quality checks.

## Context for the AI coding assistant

This prompt is used after several implementation prompts. It should not add new features.

## Information the user should provide before running this prompt

- Which screens/features have been implemented so far?
- Are there known bugs?
- Which flows feel risky?
- Is testing already installed?

## Files and areas allowed for this prompt

```text
test/
lib/ only for small fixes
README.md for test notes
pubspec.yaml only for scripts/packages if needed
```

## Files and areas forbidden for this prompt

```text
New product features
Large refactors
Unrelated architecture changes
```

## Tasks

1. Review current checks: analyze, test, formatting.
2. Add or improve basic widget/unit tests if test setup exists.
3. Check navigation flows.
4. Check loading, empty, and error states.
5. Check basic accessibility and text scaling where useful.
6. Check iOS/Android visual issues if possible.
7. Fix small issues discovered during review.
8. Do not add new features.


## Checks to run

```bash
dart format --set-exit-if-changed .
flutter analyze
flutter test
```

## Acceptance criteria

- App passes available checks or failures are explained.
- Important screens have basic review coverage.
- No new product scope is added.
- Review notes are clear.


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
