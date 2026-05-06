# 01 — Project Context Prompt

## Goal

Give the AI coding assistant the correct product and Spring Boot context before writing code.

## Context for the AI coding assistant

This prompt is used before implementation starts. Its goal is to make AI understand the product, first release scope, Spring Boot role, frontend/backend relationship, and what it must not build yet.

## Information the user should provide before running this prompt

- What are you building?
- Who will use it?
- What should the first version do?
- Is Spring Boot the main backend, API service, monolith, or microservice?
- What frontend or client will consume the API?

## Files and areas allowed for this prompt

```text
README.md
src/
pom.xml
build.gradle
settings.gradle
```

## Files and areas forbidden for this prompt

```text
docs/
generators/
questionnaires/
prompt_packs/
Unrelated future modules
```

## Tasks

1. Read the product summary provided by the user.
2. Identify the first release backend/API scope.
3. Identify whether Spring Boot is the main backend, API service, monolith, microservice, or admin backend.
4. Identify whether there is a frontend client such as Next.js, mobile app, or external system.
5. Identify what should not be built yet.
6. Produce an implementation context summary.
7. Do not write product code unless the user explicitly asks after this summary.


## Checks to run

```bash
./mvnw test
./gradlew test
```

## Acceptance criteria

- The AI clearly understands the product.
- First release scope is separated from future ideas.
- Spring Boot role is clear.
- No unrelated features are added.


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
