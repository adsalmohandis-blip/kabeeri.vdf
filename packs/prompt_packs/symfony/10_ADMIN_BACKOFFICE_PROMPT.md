# 10 — Admin and Backoffice Prompt

## Goal

Create a simple admin/backoffice foundation if the first release needs it.

## Context for the AI coding assistant

This prompt is optional and should be used only if an admin area is needed.

## Information the user should provide before running this prompt

- Does the first release need an admin area?
- What should admins manage first?
- Should it be Twig pages, API endpoints, EasyAdmin, or custom?

## Files and areas allowed for this prompt

```text
src/Controller/Admin/
templates/admin/
src/Security/
config/routes.*
tests/
```

## Files and areas forbidden for this prompt

```text
Advanced analytics
Full ERP admin
Unrelated modules
```

## Tasks

1. Ask whether an admin/backoffice is needed in the first release.
2. Define the first admin sections.
3. Protect admin routes/actions using authentication and authorization.
4. Add simple index/show/edit placeholders only for confirmed entities.
5. Keep UI simple.
6. Do not add advanced charts or analytics.


## Checks to run

```bash
php bin/console debug:router
php bin/phpunit
```

## Acceptance criteria

- Admin/backoffice exists only if needed.
- Restricted access is protected.
- Structure is simple.
- No advanced admin scope is added.


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
