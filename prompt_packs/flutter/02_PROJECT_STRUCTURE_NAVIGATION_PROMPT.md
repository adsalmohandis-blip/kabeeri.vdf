# 02 — Project Structure and Navigation Prompt

## Goal

Review or prepare a clean Flutter project structure and navigation foundation.

## Context for the AI coding assistant

This prompt organizes the mobile codebase structure. It should not implement business features yet.

## Information the user should provide before running this prompt

- Project profile: Lite, Standard, or Enterprise
- Preferred navigation: Navigator, go_router, auto_route, or not sure?
- What screens are needed in the first release?
- Do you prefer simple structure or feature-based folders?

## Files and areas allowed for this prompt

```text
lib/
test/
pubspec.yaml
README.md
```

## Files and areas forbidden for this prompt

```text
docs/
generators/
questionnaires/
prompt_packs/
Advanced product features
```

## Tasks

1. Check whether a Flutter project already exists.
2. If it exists, inspect and summarize the structure.
3. If it does not exist, tell the user that Flutter setup should be done separately or by a future KVDF CLI.
4. Suggest a simple structure suitable for Lite, Standard, or Enterprise profile.
5. Identify the navigation approach: Navigator, go_router, auto_route, or not decided.
6. Add basic navigation only for first-release screens.
7. Do not create product features in this prompt.


## Checks to run

```bash
flutter analyze
flutter test
```

## Acceptance criteria

- Structure is clear and suitable for project size.
- Navigation approach is clear.
- No unnecessary architecture is forced.
- No product features were added.


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
