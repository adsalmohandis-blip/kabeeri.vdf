# 04 — Modules, Controllers, and Providers Prompt

## Goal

Add a clean NestJS module/controller/provider foundation.

## Context for the AI coding assistant

This prompt creates the first NestJS structure pattern without building the whole product.

## Information the user should provide before running this prompt

- Should APIs be versioned? Example: /api/v1
- What is the first module needed?
- Is this internal API or public API?

## Files and areas allowed for this prompt

```text
src/
src/common/
src/modules/
test/
```

## Files and areas forbidden for this prompt

```text
Unrelated product modules
Advanced microservices
Future features
```

## Tasks

1. Review existing modules.
2. Define a simple module pattern for the project.
3. Add a health or status module if useful.
4. Add controller/provider naming conventions.
5. Add simple dependency injection examples only if needed.
6. Add basic tests for the health/status endpoint if created.
7. Do not build all business modules yet.


## Checks to run

```bash
npm run lint
npm run test
npm run build
```

## Acceptance criteria

- Module/controller/provider pattern is clear.
- Health/status route exists if useful.
- No extra future modules are added.
- Build and tests pass or issues are explained.


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
