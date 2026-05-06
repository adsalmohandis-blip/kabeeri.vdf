# 04 — API Routing Foundation Prompt

## Goal

Add API routing, health checks, versioning, and response conventions.

## Context for the AI coding assistant

This prompt creates the first FastAPI access layer without building the whole product API.

## Information the user should provide before running this prompt

- Should APIs be versioned? Example: /api/v1
- What is the first endpoint needed?
- Is this internal API or public API?
- Should OpenAPI title/description mention the product name?

## Files and areas allowed for this prompt

```text
app/main.py
app/api/
app/core/
tests/
```

## Files and areas forbidden for this prompt

```text
Unrelated product modules
Advanced API gateway
Future features
```

## Tasks

1. Create or review FastAPI app entry point.
2. Add a health check endpoint.
3. Add API router organization.
4. Add version prefix such as `/api/v1` if appropriate.
5. Add simple response and error conventions.
6. Add OpenAPI metadata if useful.
7. Add tests for health endpoint.
8. Do not build all business endpoints yet.


## Checks to run

```bash
pytest
python -m compileall app
```

## Acceptance criteria

- FastAPI app starts cleanly.
- Health endpoint exists.
- API routing structure is clear.
- No extra future endpoints are added.


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
