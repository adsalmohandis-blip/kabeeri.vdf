# 04 — Controllers, Routes, and API Prompt

## Goal

Add controllers, API routing, health checks, and response conventions.

## Context for the AI coding assistant

This prompt creates the first access layer without building the whole product API.

## Information the user should provide before running this prompt

- What endpoints are needed first?
- Is this REST API, MVC, or both?
- Should APIs be versioned? Example: /api/v1
- Should endpoints be public, logged-in only, or admin-only?

## Files and areas allowed for this prompt

```text
src/main/java/**/controller/
src/main/java/**/config/
src/main/java/**/common/
src/test/java/
```

## Files and areas forbidden for this prompt

```text
Unrelated product modules
Advanced API gateway
Future features
```

## Tasks

1. Review the app style: REST API, MVC, or hybrid.
2. Add a health/status endpoint if useful.
3. Add only first-release routes/endpoints.
4. Add simple response conventions.
5. Add API version prefix such as `/api/v1` if appropriate.
6. Add tests for health endpoint if test setup exists.
7. Do not build all business endpoints yet.


## Checks to run

```bash
./mvnw test
./gradlew test
```

## Acceptance criteria

- Required endpoints exist.
- Controller/API style is clear.
- No extra future endpoints are added.
- Tests/checks pass or issues are explained.


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
