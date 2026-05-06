# 07 — Views, URLs, and API Prompt

## Goal

Add views, URLs, and API foundation if needed.

## Context for the AI coding assistant

This prompt creates the first user-facing or API access layer without building the whole product.

## Information the user should provide before running this prompt

- Is the app server-rendered, API-only, or both?
- What pages or endpoints are needed first?
- Does the project need Django REST Framework now?

## Files and areas allowed for this prompt

```text
apps/
views.py
urls.py
templates/
serializers.py if DRF is used
tests/
```

## Files and areas forbidden for this prompt

```text
Unrelated modules
Advanced API gateway
Future features
```

## Tasks

1. Ask whether the project needs server-rendered pages, API endpoints, or both.
2. Create only first-release routes/views.
3. If using templates, add simple pages and empty states.
4. If using DRF, add serializers/viewsets only for confirmed models.
5. Add URL names and route organization.
6. Add tests or manual checks.
7. Do not build all endpoints or pages.


## Checks to run

```bash
python manage.py check
python manage.py test
```

## Acceptance criteria

- Required views/routes exist.
- Server-rendered/API style is clear.
- No extra future endpoints or pages are added.
- Basic tests/checks are present.


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
