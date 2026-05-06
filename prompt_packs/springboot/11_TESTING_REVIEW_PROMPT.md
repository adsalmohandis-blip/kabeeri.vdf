# 11 — Testing and Review Prompt

## Goal

Review the current Spring Boot implementation and improve basic tests and quality checks.

## Context for the AI coding assistant

This prompt is used after several implementation prompts. It should not add new features.

## Information the user should provide before running this prompt

- Which features have been implemented so far?
- Are there known bugs?
- Which endpoints/services feel risky?
- Are you using JUnit, Mockito, Testcontainers, or not sure?

## Files and areas allowed for this prompt

```text
src/test/java/
src/main/java/ only for small fixes
README.md for test notes
pom.xml or build.gradle only if test tooling is required
```

## Files and areas forbidden for this prompt

```text
New product features
Large refactors
Unrelated architecture changes
```

## Tasks

1. Review current tests.
2. Add missing basic tests for current features.
3. Check controllers, services, repositories, auth, security, validation, and error cases where useful.
4. Check application startup.
5. Fix small issues discovered during tests.
6. Add a short testing/checks section in README if needed.
7. Do not add new features.


## Checks to run

```bash
./mvnw test
./gradlew test
```

## Acceptance criteria

- Current features have basic tests.
- Tests pass or known failures are explained.
- No new product scope is added.
- Review notes are clear.


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
