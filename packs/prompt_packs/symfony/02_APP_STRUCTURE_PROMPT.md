# 02 — App Structure Prompt

## Goal

Review or prepare a clean Symfony app structure.

## Context for the AI coding assistant

This prompt organizes the Symfony codebase. It should not implement business features yet.

## Information the user should provide before running this prompt

- Project profile: Lite, Standard, or Enterprise
- Full-stack Symfony or API-only?
- Twig, API Platform, or custom controllers?
- PHPUnit or another test setup?

## Files and areas allowed for this prompt

```text
src/
config/
templates/
migrations/
tests/
composer.json
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

1. Check whether a Symfony project already exists.
2. If it exists, inspect and summarize the structure.
3. If it does not exist, tell the user that Symfony setup should be done separately or by a future KVDF CLI.
4. Suggest a simple structure suitable for Lite, Standard, or Enterprise profile.
5. Explain where controllers, entities, repositories, services, forms, security, templates, and tests should go.
6. Avoid forcing complex enterprise structure on a Lite project.
7. Do not create product features in this prompt.


## Checks to run

```bash
php bin/console lint:container
php bin/phpunit
```

## Acceptance criteria

- Structure is clear and suitable for project size.
- The user understands where Symfony files should go.
- No unnecessary architecture was forced.
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
