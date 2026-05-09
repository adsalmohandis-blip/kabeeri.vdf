# 08 — Services and Repositories Prompt

## Goal

Add a simple service/repository layer if useful for the project size.

## Context for the AI coding assistant

This prompt organizes business logic so it is not randomly placed inside controllers.

## Information the user should provide before running this prompt

- What actions will users perform first?
- Which actions need rules or calculations?
- Is this a small API or a long-term backend?

## Files and areas allowed for this prompt

```text
src/modules/
src/common/
test/
```

## Files and areas forbidden for this prompt

```text
Complex enterprise architecture
Unrelated modules
Future extension features
```

## Tasks

1. Identify the first few business actions needed.
2. Decide whether service classes alone are enough or repository layer is also useful.
3. Create simple services for business actions.
4. Keep controllers thin.
5. Keep naming clear and beginner-friendly.
6. Add tests for services where useful.
7. Do not introduce unnecessary patterns.


## Checks to run

```bash
npm run lint
npm run test
npm run build
```

## Acceptance criteria

- Business logic has a clear place.
- Services/repositories are simple and testable.
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
