# 03 — Settings, Environment, and Database Prompt

## Goal

Configure Django settings, environment variables, database, and local setup rules.

## Context for the AI coding assistant

This prompt prepares configuration and database foundation before adding product features.

## Information the user should provide before running this prompt

- Database: SQLite, PostgreSQL, MySQL, or not decided
- Is this local-only for now or preparing for deployment?
- Do you need email, storage, or cache settings now?
- Technical note: If you are not sure which database to choose, ask ChatGPT to compare options for your project.

## Files and areas allowed for this prompt

```text
settings.py
config/settings/
.env.example
requirements.txt
pyproject.toml
README.md
```

## Files and areas forbidden for this prompt

```text
Real secrets
Unrelated modules
Advanced deployment infrastructure
```

## Tasks

1. Review settings files.
2. Ensure no real secrets are committed.
3. Create or update `.env.example`.
4. Clearly separate local development settings from production assumptions.
5. Configure database provider only if selected by the user.
6. Keep SQLite acceptable for Lite/local projects unless another database is selected.
7. Do not create product-specific models yet.


## Checks to run

```bash
python manage.py check
python manage.py migrate
python manage.py test
```

## Acceptance criteria

- Settings are safe and beginner-friendly.
- `.env.example` is useful and contains no real secrets.
- Database choice is clear.
- Migrations/checks can run.


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
