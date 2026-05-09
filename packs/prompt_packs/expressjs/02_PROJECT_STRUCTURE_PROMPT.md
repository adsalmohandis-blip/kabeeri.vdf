# 02 — Project Structure Prompt

## Goal

Review or prepare a clean Express.js project structure.

## Context for the AI coding assistant

This prompt organizes the Express.js codebase structure. It should not implement business features yet.

## Information the user should provide before running this prompt

- Project profile: Lite, Standard, or Enterprise
- JavaScript or TypeScript?
- Is this API-only or part of a larger system?
- Do you prefer simple structure or layered structure?

## Files and areas allowed for this prompt

```text
src/
routes/
controllers/
services/
middlewares/
config/
tests/
package.json
README.md
```

## Files and areas forbidden for this prompt

```text
docs/
generators/
questionnaires/
prompt_packs/
Advanced product features
```

## Tasks

1. Check whether an Express.js project already exists.
2. If it exists, inspect and summarize the structure.
3. If it does not exist, tell the user that setup should be done separately or by a future KVDF CLI.
4. Suggest a simple structure suitable for the selected profile: Lite, Standard, or Enterprise.
5. Prefer simple folders first: routes, controllers, services, middlewares, config, tests.
6. Avoid forcing complex enterprise structure on a Lite project.
7. Do not create product features in this prompt.


## Checks to run

```bash
npm run lint
npm test
npm run build
```

## Acceptance criteria

- Structure is clear and suitable for project size.
- No unnecessary architecture was forced.
- The user understands where routes, controllers, services, middleware, config, and tests should go.
- No product features were added.


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
