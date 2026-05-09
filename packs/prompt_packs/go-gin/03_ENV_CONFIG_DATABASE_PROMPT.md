# 03 — Environment, Configuration, and Database Prompt

## Goal

Configure environment variables, app config, database connection, and local setup rules.

## Context for the AI coding assistant

This prompt prepares configuration and database foundation before adding product features.

## Information the user should provide before running this prompt

- Database: PostgreSQL, MySQL, SQLite, MongoDB, or not decided
- Database tool: database/sql, sqlc, GORM, Ent, Bun, or not sure
- Is this local-only for now or preparing for deployment?
- Technical note: If unsure, ask ChatGPT to compare Go database options for your product.

## Files and areas allowed for this prompt

```text
internal/config/
configs/
.env.example
go.mod
README.md
migrations/
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
4. Add a simple config loader if useful.
5. Configure database provider only if selected by the user.
6. Prepare database tooling only if needed now: database/sql, sqlc, GORM, Ent, Bun, or other.
7. Keep SQLite acceptable for Lite/local projects unless another database is selected.
8. Do not create product-specific models yet.


## Checks to run

```bash
go test ./...
go vet ./...
```

## Acceptance criteria

- Configuration is safe and beginner-friendly.
- `.env.example` is useful and contains no real secrets.
- Database choice is clear.
- Database foundation is ready only if needed.


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
