# 08 — Forms and Validation Prompt

## Goal

Add reusable Flutter form and validation foundation.

## Context for the AI coding assistant

This prompt helps prevent messy form handling across the app.

## Information the user should provide before running this prompt

- What forms are needed first? Login, signup, contact, create item, edit profile, etc.
- What fields are required?
- What should happen after submit?
- Technical note: If unsure about validation rules, ask ChatGPT to help write them from product requirements.

## Files and areas allowed for this prompt

```text
lib/widgets/forms/
lib/core/validation/
lib/features/
test/
pubspec.yaml if validation package is required
```

## Files and areas forbidden for this prompt

```text
Unrelated features
Advanced workflow engines
Secrets
```

## Tasks

1. Identify which first-release forms are needed.
2. Add a simple reusable form pattern.
3. Add validation using the selected approach.
4. Show useful error messages.
5. Add loading/success states.
6. Make keyboard behavior reasonable for mobile.
7. Do not build all future forms.
8. Do not add heavy packages unless justified.


## Checks to run

```bash
flutter analyze
flutter test
```

## Acceptance criteria

- Form pattern is clear.
- Validation is understandable.
- Error and success states are handled.
- Mobile keyboard behavior is considered.
- Scope is limited to first-release forms.


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
