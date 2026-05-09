# 09 — Local Storage and Offline Prompt

## Goal

Add local storage or offline foundation if the first release needs it.

## Context for the AI coding assistant

This prompt is optional. Use it only when the app needs to remember data locally or work partially offline.

## Information the user should provide before running this prompt

- What should the app remember locally?
- Does the app need to work without internet?
- Is the data sensitive?
- Technical note: If unsure about secure storage vs normal storage, ask ChatGPT.

## Files and areas allowed for this prompt

```text
lib/storage/
lib/services/
lib/state/
lib/features/
pubspec.yaml if storage package is required
```

## Files and areas forbidden for this prompt

```text
Sensitive data storage without protection
Unrelated features
Complex offline sync unless required
```

## Tasks

1. Ask what data needs to be stored locally.
2. Choose a simple storage approach suitable for the data.
3. Avoid storing sensitive data unless required and protected.
4. Add helpers for reading/writing local data.
5. Add offline/empty state only if needed.
6. Do not build full offline sync unless explicitly required.
7. Add clear notes about limitations.


## Checks to run

```bash
flutter analyze
flutter test
```

## Acceptance criteria

- Local storage need is clear.
- Sensitive data is not stored carelessly.
- Offline behavior is simple and documented.
- No complex sync system is added.


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
