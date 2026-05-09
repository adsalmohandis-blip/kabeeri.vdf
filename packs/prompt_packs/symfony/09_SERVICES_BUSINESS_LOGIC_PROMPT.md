# 09 — Services and Business Logic Prompt

## Goal

Add service classes and business logic foundation for first-release actions.

## Context for the AI coding assistant

This prompt organizes business logic so it is not randomly placed inside controllers.

## Information the user should provide before running this prompt

- What actions will users perform first?
- Which actions need rules or calculations?
- Is this a small app or a long-term backend?

## Files and areas allowed for this prompt

```text
src/Service/
src/Controller/
src/Repository/
src/Entity/
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
2. Create service classes for business rules.
3. Keep controllers thin.
4. Use dependency injection cleanly.
5. Keep naming clear and beginner-friendly.
6. Add tests for services where useful.
7. Do not introduce unnecessary patterns.


## Checks to run

```bash
php bin/phpunit
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
