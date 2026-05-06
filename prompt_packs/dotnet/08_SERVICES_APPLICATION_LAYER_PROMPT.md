# 08 — Services and Application Layer Prompt

## Goal

Add a simple service/application layer for first-release business actions.

## Context for the AI coding assistant

This prompt organizes business logic so it is not randomly placed inside controllers or endpoints.

## Information the user should provide before running this prompt

- What actions will users perform first?
- Which actions need rules or calculations?
- Is this a small app or a long-term system?

## Files and areas allowed for this prompt

```text
src/
tests/
Application or Services folders if used
interfaces if needed
```

## Files and areas forbidden for this prompt

```text
Complex enterprise architecture
Unrelated modules
Future extension features
```

## Tasks

1. Identify the first few business actions needed.
2. Create simple service classes for those actions.
3. Keep naming clear and beginner-friendly.
4. Add dependency injection registrations if needed.
5. Keep controllers/endpoints thin if applicable.
6. Add tests for services where useful.
7. Do not introduce unnecessary patterns.


## Checks to run

```bash
dotnet build
dotnet test
```

## Acceptance criteria

- Business logic has a clear place.
- Services are simple and testable.
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
