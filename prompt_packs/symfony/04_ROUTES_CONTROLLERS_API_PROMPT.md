# 04 — Routes, Controllers, and API Prompt

## Goal

Add routes, controllers, and API response foundation for the first release.

## Context for the AI coding assistant

This prompt creates access structure without building the whole product.

## Information the user should provide before running this prompt

- What pages or endpoints are needed first?
- Is this HTML, JSON API, or both?
- Should routes be public, logged-in only, or admin-only?

## Files and areas allowed for this prompt

```text
src/Controller/
config/routes.*
templates/
tests/
```

## Files and areas forbidden for this prompt

```text
Unrelated product modules
Advanced API gateway
Future features
```

## Tasks

1. Review the app style: full-stack Symfony, API-only, or hybrid.
2. Add only first-release routes.
3. Add simple controller structure.
4. Add Twig views only if full-stack/server-rendered.
5. Add JSON response conventions only if API-style.
6. Add empty states/placeholders where useful.
7. Do not build all business features yet.


## Checks to run

```bash
php bin/console debug:router
php bin/phpunit
```

## Acceptance criteria

- Required routes exist.
- Controller/view/API style is clear.
- No extra future endpoints/pages are added.
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
