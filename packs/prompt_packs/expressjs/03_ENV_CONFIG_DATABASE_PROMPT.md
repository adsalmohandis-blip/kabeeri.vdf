# 03 — Environment, Configuration, and Database Prompt

## Goal

Configure environment variables, app config, database connection, and local setup rules.

## Context for the AI coding assistant

This prompt prepares configuration and database foundation before adding product features.

## Information the user should provide before running this prompt

- Database: PostgreSQL, MySQL, SQLite, MongoDB, or not decided
- ORM/tool: Prisma, Knex, Sequelize, Mongoose, TypeORM, or not sure
- Is this local-only for now or preparing for deployment?
- Technical note: If unsure, ask ChatGPT to compare database options for your product.

## Files and areas allowed for this prompt

```text
src/config/
.env.example
package.json
tsconfig.json
README.md
prisma/ or db files if selected
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
6. Prepare database tooling only if needed now: Prisma, Knex, Sequelize, Mongoose, TypeORM, or other.
7. Keep SQLite acceptable for Lite/local projects unless another database is selected.
8. Do not create product-specific models yet.


## Checks to run

```bash
npm run lint
npm test
npm run build
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
