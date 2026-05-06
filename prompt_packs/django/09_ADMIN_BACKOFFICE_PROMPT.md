# 09 — Admin and Backoffice Prompt

## Goal

Create a simple Django admin/backoffice foundation if the first release needs it.

## Context for the AI coding assistant

This prompt is optional because Django admin may already cover many early backoffice needs.

## Information the user should provide before running this prompt

- Is Django admin enough for the first version?
- What should admins manage first?
- Do you need a custom dashboard or just admin model screens?

## Files and areas allowed for this prompt

```text
apps/
admin.py
templates/admin_custom/ if needed
views.py
urls.py
tests/
```

## Files and areas forbidden for this prompt

```text
Advanced analytics
Full custom backoffice
Unrelated modules
```

## Tasks

1. Ask whether Django admin is enough for the first release.
2. Improve admin configuration for important models.
3. Add list display, search, filters, and ordering where useful.
4. Create custom backoffice views only if Django admin is not enough.
5. Protect all backoffice views.
6. Do not build advanced analytics dashboards.


## Checks to run

```bash
python manage.py check
python manage.py test
python manage.py createsuperuser
```

## Acceptance criteria

- Admin/backoffice exists only if needed.
- Django admin is used effectively where appropriate.
- Restricted access is protected.
- Scope stays simple.


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
