# 10 — Logging and Error Handling Prompt

## Goal

Add simple logging and error handling foundation.

## Context for the AI coding assistant

This prompt creates visibility into errors and important actions without building a full monitoring platform.

## Information the user should provide before running this prompt

- What errors should users see clearly?
- What actions/errors are important to log?
- Are there sensitive fields that must never appear in logs?

## Files and areas allowed for this prompt

```text
app/core/
app/api/
app/middleware/
app/main.py
tests/
```

## Files and areas forbidden for this prompt

```text
Full observability stack
External monitoring tools unless requested
Unrelated modules
```

## Tasks

1. Add or review global error handling approach.
2. Add consistent error response style.
3. Add basic logging configuration.
4. Avoid logging sensitive data.
5. Add request ID or correlation ID only if appropriate.
6. Add tests for error responses where useful.
7. Do not add external monitoring platforms unless requested.


## Checks to run

```bash
pytest
python -m compileall app
```

## Acceptance criteria

- Errors have a consistent structure.
- Logs are useful but do not leak sensitive data.
- Basic failure cases are covered.
- No full monitoring stack is added.


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
