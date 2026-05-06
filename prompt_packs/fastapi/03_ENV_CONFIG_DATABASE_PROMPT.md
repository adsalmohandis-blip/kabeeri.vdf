# 03 — Environment, Configuration, and Database Prompt

## Goal

Configure environment variables, settings, database connection, and local setup rules.

## Context for the AI coding assistant

This prompt prepares configuration and database foundation before adding product features.

## Information the user should provide before running this prompt

- Database: SQLite, PostgreSQL, MySQL, or not decided
- ORM choice: SQLAlchemy, SQLModel, Tortoise, or not sure
- Is this local-only for now or preparing for deployment?
- Technical note: If you are not sure which database or ORM to choose, ask ChatGPT to compare options for your project.

## Files and areas allowed for this prompt

```text
app/core/
app/db/
.env.example
pyproject.toml
requirements.txt
alembic/
README.md
```

## Files and areas forbidden for this prompt

```text
Real secrets
Unrelated modules
Advanced deployment infrastructure
```

## Tasks

1. Review configuration files.
2. Ensure no real secrets are committed.
3. Create or update `.env.example`.
4. Add a simple settings module if useful.
5. Configure database provider only if selected by the user.
6. Prepare SQLAlchemy/SQLModel/Alembic foundation only if needed now.
7. Keep SQLite acceptable for Lite/local projects unless another database is selected.
8. Do not create product-specific models yet.


## Checks to run

```bash
pytest
python -m compileall app
alembic current
```

## Acceptance criteria

- Settings are safe and beginner-friendly.
- `.env.example` is useful and contains no real secrets.
- Database choice is clear.
- Migration foundation is ready only if needed.


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
