# 10 — Jobs, Events, and Integrations Prompt

## Goal

Add jobs, events, or external integration foundation if needed.

## Context for the AI coding assistant

This prompt is optional. Use it only if the first release needs background work, events, or external services.

## Information the user should provide before running this prompt

- Does the app need emails, webhooks, file processing, AI API calls, payments, or other integrations?
- Should background work be simple or production-grade?
- Technical note: If unsure, ask ChatGPT whether a simple service is enough or a queue is needed.

## Files and areas allowed for this prompt

```text
src/jobs/
src/events/
src/integrations/
src/modules/
src/config/
.env.example
test/
```

## Files and areas forbidden for this prompt

```text
Unrelated integrations
Real secrets
Large workflow engines unless requested
```

## Tasks

1. Ask whether the first release needs background jobs, events, or external integrations.
2. Use a simple provider/service pattern for confirmed integrations.
3. Suggest queues only if the project needs background processing.
4. Add event patterns only if there are clear business events.
5. Keep API keys in environment variables.
6. Add tests or mocks where useful.
7. Do not add integrations that are not in the first release.


## Checks to run

```bash
npm run lint
npm run test
npm run build
```

## Acceptance criteria

- Job/event/integration approach is clear.
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
