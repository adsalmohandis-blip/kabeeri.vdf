# 10 — Integrations and Jobs Prompt

## Goal

Add external integration or background job foundation if needed.

## Context for the AI coding assistant

This prompt is optional. Use it only if the first release needs background work or external services.

## Information the user should provide before running this prompt

- Does the API need emails, webhooks, file processing, AI API calls, payments, or other integrations?
- Should background work be simple or production-grade?
- Technical note: If unsure, ask ChatGPT whether a simple goroutine, worker, or queue is needed.

## Files and areas allowed for this prompt

```text
internal/jobs/
internal/integrations/
internal/services/
internal/config/
.env.example
tests/
```

## Files and areas forbidden for this prompt

```text
Unrelated integrations
Real secrets
Large workflow engines unless requested
```

## Tasks

1. Ask whether the first release needs emails, webhooks, payments, AI APIs, file processing, queues, or other integrations.
2. Add one integration client or job pattern only.
3. Keep API keys in environment variables.
4. Add mocks or test strategy where useful.
5. Add retry/failure notes if relevant.
6. Do not add integrations that are not in the first release.


## Checks to run

```bash
go test ./...
go vet ./...
```

## Acceptance criteria

- Integration/job approach is clear.
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
