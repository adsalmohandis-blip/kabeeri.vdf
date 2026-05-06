# 03 — Environment, Configuration, and Database Prompt

## Goal

Configure environment, credentials, database, and local setup rules.

## Context for the AI coding assistant

This prompt prepares configuration and database foundation before adding product features.

## Information the user should provide before running this prompt

- Database: SQLite, PostgreSQL, MySQL, or not decided
- Is this local-only for now or preparing for deployment?
- Do you need email, storage, or background jobs now?
- Technical note: If unsure, ask ChatGPT to compare Rails database choices for your product.

## Files and areas allowed for this prompt

```text
config/
db/
Gemfile
.env.example
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
3. Create or update `.env.example` if the project uses env files.
4. Review credentials usage and explain safe handling.
5. Configure database provider only if selected by the user.
6. Keep SQLite acceptable for Lite/local projects unless another database is selected.
7. Do not create product-specific models yet.


## Checks to run

```bash
bin/rails db:prepare
bin/rails test
```

## Acceptance criteria

- Configuration is safe and beginner-friendly.
- Secrets are not committed.
- Database choice is clear.
- Local setup is documented.


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
