# 02 — Environment and Database Prompt

## Goal

Configure environment, database, queue, cache, mail, and basic local settings.

## Context for the AI coding assistant

This prompt prepares the Laravel environment for development before adding business features.

## Information the user should provide before running this prompt

- Database choice: MySQL, PostgreSQL, SQLite
- Local environment
- Whether queues will start as database queues or sync

## Files and areas allowed for this prompt

```text
.env.example
config/
database/migrations/
database/seeders/
README.md
```

## Files and areas forbidden for this prompt

```text
docs/
generators/
questionnaires/
prompt_packs/
routes/web.php product routes
resources/views product pages
```

## Tasks

1. Review `.env.example`.
2. Add clean example values for app name, database, mail, queue, cache, and filesystem.
3. Ensure database connection settings are beginner-friendly.
4. Add notes for MySQL and SQLite local setup if helpful.
5. Do not commit real secrets.
6. Create a simple database health check only if appropriate.
7. Do not create product tables yet unless they are required by Laravel defaults.


## Checks to run

```bash
php artisan config:clear
php artisan migrate
php artisan test
```

## Acceptance criteria

- `.env.example` is safe and useful.
- No real credentials are stored.
- Migrations can run.
- The app can use the selected database locally.


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
