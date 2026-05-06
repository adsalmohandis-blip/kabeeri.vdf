# 03 — Environment, Configuration, and API Prompt

## Goal

Configure app environment, API URL, and safe configuration rules.

## Context for the AI coding assistant

This prompt prepares configuration before adding product features.

## Information the user should provide before running this prompt

- Does the app connect to an API?
- What is the API base URL?
- Does the app need local/staging/production configuration?
- Technical note: If you are unsure what should not be stored in a mobile app, ask ChatGPT.

## Files and areas allowed for this prompt

```text
lib/config/
lib/core/
.env.example
pubspec.yaml
README.md
```

## Files and areas forbidden for this prompt

```text
Real secrets
Unrelated modules
Native platform config unless requested
```

## Tasks

1. Review app configuration files.
2. Create or update `.env.example` if the project uses environment files.
3. Add API URL placeholder if the app connects to a backend.
4. Clearly explain that mobile apps must not contain private server secrets.
5. Add a simple config helper if useful.
6. Add README notes for local configuration.
7. Do not add unrelated packages unless required and explained.


## Checks to run

```bash
flutter analyze
flutter test
```

## Acceptance criteria

- `.env.example` is safe and useful if used.
- No real secrets are committed.
- API/config strategy is clear.
- Beginner can understand what to set locally.


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
