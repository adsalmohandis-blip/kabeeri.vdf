# 01 — Mobile Project Context Prompt

## Goal

Give the AI coding assistant the correct product and Flutter app context before writing code.

## Context for the AI coding assistant

This prompt is used before implementation starts. Its goal is to make AI understand the app purpose, users, first release scope, backend relationship, target platforms, and what it must not build yet.

## Information the user should provide before running this prompt

- What mobile app are you building?
- Who will use it?
- What should the first version do?
- Is it iOS, Android, web, desktop, or multiple platforms?
- Does it connect to an API? If yes, what backend?

## Files and areas allowed for this prompt

```text
README.md
lib/
pubspec.yaml
analysis_options.yaml
```

## Files and areas forbidden for this prompt

```text
docs/
generators/
questionnaires/
prompt_packs/
Unrelated future modules
```

## Tasks

1. Read the product summary provided by the user.
2. Identify the first release mobile scope.
3. Identify whether this is a mobile-only app, companion app, customer app, admin app, or internal app.
4. Identify whether the app connects to a backend API.
5. Identify target platforms: iOS, Android, web, desktop, or a subset.
6. Identify what should not be built yet.
7. Produce an implementation context summary.
8. Do not write product code unless the user explicitly asks after this summary.


## Checks to run

```bash
flutter --version
flutter analyze
flutter test
```

## Acceptance criteria

- The AI clearly understands the mobile product.
- First release scope is separated from future ideas.
- Target platforms are clear.
- Backend/API relationship is clear.
- No unrelated features are added.


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
