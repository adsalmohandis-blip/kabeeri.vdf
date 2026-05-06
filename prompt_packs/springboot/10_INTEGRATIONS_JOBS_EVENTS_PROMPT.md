# 10 — Integrations, Jobs, and Events Prompt

## Goal

Add integrations, scheduled jobs, events, or external services if needed.

## Context for the AI coding assistant

This prompt is optional. Use it only if the first release needs background work or external systems.

## Information the user should provide before running this prompt

- Does the app need emails, webhooks, file processing, AI API calls, payments, scheduled jobs, or other integrations?
- Which one is needed first?
- Technical note: If unsure, ask ChatGPT whether a simple service, scheduled job, or event is appropriate.

## Files and areas allowed for this prompt

```text
src/main/java/**/integration/
src/main/java/**/job/
src/main/java/**/event/
src/main/java/**/service/
src/main/resources/
src/test/java/
```

## Files and areas forbidden for this prompt

```text
Unrelated integrations
Real secrets
Large workflow engines unless requested
```

## Tasks

1. Ask whether the first release needs emails, webhooks, payments, AI APIs, file processing, scheduled jobs, or other integrations.
2. Add one integration/job/event pattern only.
3. Keep API keys in environment variables or secure config.
4. Add mocks or test strategy where useful.
5. Add retry/failure notes if relevant.
6. Do not add integrations that are not in the first release.


## Checks to run

```bash
./mvnw test
./gradlew test
```

## Acceptance criteria

- Integration/job/event approach is clear.
- No real secrets are committed.
- Only confirmed integrations are added.
- Scope is not overbuilt.


## Important scope rule

Do not build features outside this prompt.  
Do not create advanced modules unless they are explicitly listed above.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Commands run:
Tests/checks result:
Manual review notes:
Next recommended prompt:
```
