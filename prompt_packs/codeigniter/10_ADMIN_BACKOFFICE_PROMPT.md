# 10 — Admin and Backoffice Prompt

## Goal

Create a simple admin/backoffice foundation if the first release needs it.

## Context for the AI coding assistant

This prompt is optional and should be used only if an admin area is needed.

## Information the user should provide before running this prompt

- Does the first release need an admin area?
- What should admins manage first?
- Should it be views, API endpoints, or both?

## Files and areas allowed for this prompt

```text
app/Controllers/Admin/
app/Views/admin/
app/Filters/
app/Config/Routes.php
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
3. Protect admin routes/actions using authentication and filters.
4. Add simple index/show/edit placeholders only for confirmed models.
5. Keep UI simple.
6. Do not add advanced charts or analytics.


## Checks to run

```bash
php spark routes
vendor/bin/phpunit
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
