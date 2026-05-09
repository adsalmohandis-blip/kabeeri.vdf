# 08 — Handlers, Services, and Repositories Prompt

## Goal

Add a simple handlers/services/repositories pattern for first-release business actions.

## Context for the AI coding assistant

This prompt organizes business logic so it is not randomly placed inside Gin handlers.

## Information the user should provide before running this prompt

- What actions will users perform first?
- Which actions need rules or calculations?
- Is this a small API or a long-term backend?

## Files and areas allowed for this prompt

```text
internal/handlers/
internal/services/
internal/repositories/
internal/routes/
internal/models/
internal/dto/
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
2. Create handlers for HTTP request/response handling.
3. Create services for business logic.
4. Create repositories only if database access needs separation.
5. Keep route files thin.
6. Keep naming clear and beginner-friendly.
7. Add tests for services/handlers where useful.
8. Do not introduce unnecessary patterns.


## Checks to run

```bash
go test ./...
go vet ./...
```

## Acceptance criteria

- Business logic has a clear place.
- Handlers, services, and repositories are simple and testable.
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
