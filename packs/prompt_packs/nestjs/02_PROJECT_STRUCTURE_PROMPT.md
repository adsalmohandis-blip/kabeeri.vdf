# 02 — Project Structure Prompt

## Goal

Review or prepare a clean NestJS project structure.

## Context for the AI coding assistant

This prompt organizes the NestJS codebase structure. It should not implement business features yet.

## Information the user should provide before running this prompt

- Project profile: Lite, Standard, or Enterprise
- Is this API-only or part of a larger system?
- Do you prefer simple modules or layered structure?
- Are you using REST, GraphQL, or not sure?

## Files and areas allowed for this prompt

```text
src/
test/
package.json
tsconfig.json
nest-cli.json
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

1. Check whether a NestJS project already exists.
2. If it exists, inspect and summarize the structure.
3. If it does not exist, tell the user that NestJS setup should be done separately or by a future KVDF CLI.
4. Suggest a simple structure suitable for the selected profile: Lite, Standard, or Enterprise.
5. Prefer simple modules first: core, common, users, auth, and first domain modules only if needed.
6. Avoid forcing complex enterprise structure on a Lite project.
7. Do not create product features in this prompt.


## Checks to run

```bash
npm run lint
npm run test
npm run build
```

## Acceptance criteria

- Structure is clear and suitable for project size.
- No unnecessary architecture was forced.
- The user understands where modules, controllers, providers, DTOs, guards, and tests should go.
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
