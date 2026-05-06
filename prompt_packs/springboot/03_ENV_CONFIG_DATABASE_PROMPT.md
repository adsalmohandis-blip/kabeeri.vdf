# 03 — Environment, Configuration, and Database Prompt

## Goal

Configure profiles, environment settings, database connection, and local setup rules.

## Context for the AI coding assistant

This prompt prepares configuration and database foundation before adding product features.

## Information the user should provide before running this prompt

- Database: H2, PostgreSQL, MySQL, MariaDB, SQL Server, or not decided
- ORM/access: Spring Data JPA, JDBC, MyBatis, or not sure
- Is this local-only for now or preparing for deployment?
- Technical note: If unsure, ask ChatGPT to compare Spring Boot database options for your product.

## Files and areas allowed for this prompt

```text
src/main/resources/
src/main/java/**/config/
pom.xml
build.gradle
README.md
.env.example
```

## Files and areas forbidden for this prompt

```text
Real secrets
Unrelated modules
Advanced deployment infrastructure
```

## Tasks

1. Review application configuration files.
2. Ensure no real secrets are committed.
3. Create or update `.env.example` if useful.
4. Add local/dev profile notes if needed.
5. Configure database provider only if selected by the user.
6. Prepare JPA/Hibernate or JDBC foundation only if needed now.
7. Keep H2 acceptable for Lite/local projects unless another database is selected.
8. Do not create product-specific entities yet.


## Checks to run

```bash
./mvnw test
./gradlew test
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
