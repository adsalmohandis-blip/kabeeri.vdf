# 08 — Forms and Validation Prompt

## Goal

Add forms and validation foundation for Django.

## Context for the AI coding assistant

This prompt helps prevent messy form handling across the app.

## Information the user should provide before running this prompt

- What forms are needed first? Contact, login, create item, edit profile, etc.
- What fields are required?
- What should happen after submit?
- Technical note: If unsure about validation rules, ask ChatGPT to help write them from product requirements.

## Files and areas allowed for this prompt

```text
apps/
forms.py
views.py
templates/
tests/
```

## Files and areas forbidden for this prompt

```text
Unrelated features
Advanced workflow engines
Secrets
```

## Tasks

1. Identify which first-release forms are needed.
2. Use Django forms or DRF serializers depending on project style.
3. Add validation rules.
4. Show useful error messages.
5. Add success/redirect behavior if server-rendered.
6. Add tests for validation where useful.
7. Do not build all future forms.


## Checks to run

```bash
python manage.py check
python manage.py test
```

## Acceptance criteria

- Form/validation pattern is clear.
- Errors are understandable.
- Scope is limited to first-release forms.
- Tests or manual checks are included.


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
