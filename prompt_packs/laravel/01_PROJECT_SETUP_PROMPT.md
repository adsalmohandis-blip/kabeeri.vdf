# 01 — Laravel Project Setup Prompt

## Goal

Create or prepare the Laravel project foundation for a Kabeeri VDF-guided project.

## Context for the AI coding assistant

Use this prompt only at the beginning of implementation. The goal is to create a clean Laravel project foundation, not to build product features yet.

## Information the user should provide before running this prompt

- Project name
- Preferred Laravel version
- Local development environment: Herd, Sail, Laragon, Valet, Docker, or other

## Files and areas allowed for this prompt

```text
composer.json
package.json
.env.example
README.md
app/
bootstrap/
config/
routes/
resources/
tests/
```

## Files and areas forbidden for this prompt

```text
docs/
generators/
questionnaires/
prompt_packs/
LICENSE
GOVERNANCE.md
SECURITY.md
```

## Tasks

1. Check whether the Laravel project already exists.
2. If it does not exist, explain the Laravel creation command the user should run.
3. If it exists, inspect the structure.
4. Ensure `.env.example` is present.
5. Ensure basic Laravel app bootstraps correctly.
6. Add or update a short local development section in README if needed.
7. Do not add product modules yet.
8. Do not add authentication yet.


## Checks to run

```bash
php artisan --version
php artisan test
```

## Acceptance criteria

- Laravel project exists or clear setup commands are provided.
- The app can boot locally.
- No product-specific features were added.
- README includes basic development startup instructions.


## Important scope rule

Do not build features outside this prompt.  
Do not create advanced modules unless they are explicitly listed above.

If the user does not know which Laravel version to use, recommend the latest stable Laravel version supported by their environment.

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
