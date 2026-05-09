# 09 — Background Tasks and Integrations Prompt

## Goal

Add background tasks or external integration foundation if needed.

## Context for the AI coding assistant

This prompt is optional. Use it only if the first release needs background work or external services.

## Information the user should provide before running this prompt

- Does the app need emails, webhooks, file processing, AI API calls, payments, or other integrations?
- Should background work be simple or production-grade?
- Technical note: If unsure, ask ChatGPT whether FastAPI BackgroundTasks is enough for your use case.

## Files and areas allowed for this prompt

```text
app/tasks/
app/integrations/
app/services/
app/core/
tests/
.env.example
```

## Files and areas forbidden for this prompt

```text
Unrelated integrations
Real secrets
Large workflow engines unless requested
```

## Tasks

1. Ask whether the first release needs background tasks or external integrations.
2. Use FastAPI BackgroundTasks for simple local background work if enough.
3. Suggest Celery/RQ/Arq only if the project needs more serious background processing.
4. Add integration client structure only for confirmed external systems.
5. Keep API keys in environment variables.
6. Add tests or mock examples where useful.
7. Do not add integrations that are not in the first release.


## Checks to run

```bash
pytest
python -m compileall app
```

## Acceptance criteria

- Background/integration approach is clear.
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
