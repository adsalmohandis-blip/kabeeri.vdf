# 05 — Permissions and Admin Prompt

## Goal

Add a simple permissions and Django admin foundation.

## Context for the AI coding assistant

This prompt protects important areas and organizes basic admin management without overbuilding.

## Information the user should provide before running this prompt

- What types of users will use the system?
- What should only admins do?
- What should normal users not access?
- Which things should appear in Django admin?

## Files and areas allowed for this prompt

```text
apps/
admin.py
models.py
views.py
urls.py
tests/
config/settings*
```

## Files and areas forbidden for this prompt

```text
Advanced enterprise permissions
Unrelated features
Billing
Marketplace
```

## Tasks

1. Ask what user types exist.
2. Use Django groups/permissions where suitable.
3. Add simple role/group setup if needed.
4. Register important models in Django admin.
5. Protect restricted views or endpoints.
6. Add tests or manual checks.
7. Do not create a complex permission matrix unless the project requires it.


## Checks to run

```bash
python manage.py check
python manage.py test
```

## Acceptance criteria

- Permissions are simple and understandable.
- Admin management is useful but not overloaded.
- Restricted areas are protected.
- Role design matches first release scope.


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
