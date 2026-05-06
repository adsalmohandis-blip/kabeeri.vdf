# 06 — API, Data, and State Prompt

## Goal

Add API connection, data fetching, and state management foundation.

## Context for the AI coding assistant

This prompt creates the foundation for connecting mobile screens to data. It should not implement every product feature.

## Information the user should provide before running this prompt

- Where will data come from?
- Is there an existing backend API?
- What is the first screen that needs real data?
- Should the first version use mock data or real API?
- Technical note: If unsure about state management, ask ChatGPT to recommend the simplest option.

## Files and areas allowed for this prompt

```text
lib/services/
lib/api/
lib/state/
lib/models/
lib/features/
pubspec.yaml
```

## Files and areas forbidden for this prompt

```text
Unrelated product modules
Advanced integrations
Secrets
Full backend redesign
```

## Tasks

1. Identify where data comes from: Laravel API, .NET API, FastAPI, NestJS, Supabase, Firebase, mock data, or other.
2. Add a simple API client or data fetching helper.
3. Identify state management approach: setState, Provider, Riverpod, Bloc, GetX, or not sure.
4. Add loading, error, and empty-state patterns.
5. Add a sample integration for one confirmed endpoint or mock source.
6. Keep secrets out of the app.
7. Do not build all features or endpoints.


## Checks to run

```bash
flutter analyze
flutter test
```

## Acceptance criteria

- Data source strategy is clear.
- API client/helper is simple.
- State approach is clear and not overbuilt.
- Loading/error/empty states are handled.
- No secrets are exposed in the app.


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
