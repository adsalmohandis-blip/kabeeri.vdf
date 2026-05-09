# 06 — API Foundation Prompt

## Goal

Create a clean first API foundation for a .NET Web API project.

## Context for the AI coding assistant

This prompt applies only if the project uses an API. It defines simple response and error conventions.

## Information the user should provide before running this prompt

- Is the project API-first?
- Will there be frontend/mobile clients?
- Should responses be JSON only?
- What is the first endpoint needed?

## Files and areas allowed for this prompt

```text
src/
controllers or minimal API endpoints
DTOs if used
tests/
README.md
```

## Files and areas forbidden for this prompt

```text
Unrelated product modules
Advanced API gateway
External integrations
```

## Tasks

1. Confirm whether the project uses Web API.
2. Define a simple endpoint organization style.
3. Add a health endpoint if useful.
4. Add simple response conventions.
5. Add validation and error response style if needed.
6. Add a first sample endpoint only if it supports current scope.
7. Do not build all business endpoints yet.


## Checks to run

```bash
dotnet build
dotnet test
```

## Acceptance criteria

- API structure is clear.
- Error and response style is understandable.
- No unrelated endpoints are added.
- Future endpoints have a clear pattern to follow.


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
