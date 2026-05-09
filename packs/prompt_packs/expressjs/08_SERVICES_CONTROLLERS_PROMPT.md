# 08 — Services and Controllers Prompt

## Goal

Add a simple controllers/services pattern for first-release business actions.

## Context for the AI coding assistant

This prompt organizes business logic so it is not randomly placed inside route handlers.

## Information the user should provide before running this prompt

- What actions will users perform first?
- Which actions need rules or calculations?
- Is this a small API or a long-term backend?

## Files and areas allowed for this prompt

```text
src/controllers/
src/services/
src/routes/
src/models/
src/schemas/
tests/
```

## Files and areas forbidden for this prompt

```text
Complex enterprise architecture
Unrelated modules
Future extension features
```

## Tasks

1. Identify the first few business actions needed.
2. Create controllers for HTTP request/response handling.
3. Create services for business logic.
4. Keep route files thin.
5. Keep naming clear and beginner-friendly.
6. Add tests for services/controllers where useful.
7. Do not introduce unnecessary patterns.


## Checks to run

```bash
npm run lint
npm test
npm run build
```

## Acceptance criteria

- Business logic has a clear place.
- Controllers and services are simple and testable.
- The architecture matches project size.
- No unnecessary enterprise patterns are added.


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
