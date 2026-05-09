# 04 — Routing and Middleware Prompt

## Goal

Add Express routing, middleware, health checks, and response conventions.

## Context for the AI coding assistant

This prompt creates the first Express access layer without building the whole product API.

## Information the user should provide before running this prompt

- Should APIs be versioned? Example: /api/v1
- What is the first endpoint needed?
- Is this internal API or public API?
- Does the API need CORS for a frontend?

## Files and areas allowed for this prompt

```text
src/
routes/
middlewares/
controllers/
tests/
```

## Files and areas forbidden for this prompt

```text
Unrelated product modules
Advanced API gateway
Future features
```

## Tasks

1. Create or review Express app entry point.
2. Add a health check endpoint.
3. Add routing organization.
4. Add API version prefix such as `/api/v1` if appropriate.
5. Add standard middleware only if useful: JSON parsing, CORS, request logging, security headers.
6. Add simple response and error conventions.
7. Add tests for health endpoint if test setup exists.
8. Do not build all business endpoints yet.


## Checks to run

```bash
npm run lint
npm test
npm run build
```

## Acceptance criteria

- Express app starts cleanly.
- Health endpoint exists.
- Routing/middleware structure is clear.
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
