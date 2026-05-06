# 10 — Logging and Audit Prompt

## Goal

Add a simple logging and audit foundation.

## Context for the AI coding assistant

This prompt creates visibility into important actions without building a full observability platform.

## Information the user should provide before running this prompt

- What actions are important to track?
- Who needs to review logs?
- Are there private fields that must never appear in logs?

## Files and areas allowed for this prompt

```text
src/
tests/
logging configuration
DbContext/migrations if audit storage is needed
```

## Files and areas forbidden for this prompt

```text
Full monitoring stack
External observability tools unless requested
Unrelated modules
```

## Tasks

1. Identify what actions should be logged.
2. Use built-in logging patterns where possible.
3. Add audit records only if needed.
4. Avoid logging sensitive data.
5. Add simple review instructions for logs.
6. Do not add external monitoring platforms unless requested.


## Checks to run

```bash
dotnet build
dotnet test
```

## Acceptance criteria

- Important actions can be logged.
- Sensitive data is not logged.
- Audit structure is simple and useful.
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
