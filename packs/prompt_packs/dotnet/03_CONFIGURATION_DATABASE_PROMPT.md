# 03 — Configuration and Database Prompt

## Goal

Configure app settings, database connection, EF Core foundation, and environment basics.

## Context for the AI coding assistant

This prompt prepares configuration and database foundation before adding product features.

## Information the user should provide before running this prompt

- Database: SQL Server, PostgreSQL, MySQL, SQLite, or not decided
- Do you want EF Core?
- Will this start local-only or prepare for deployment later?
- Technical note: If you are not sure which database/provider to choose, ask ChatGPT to compare options for your project.

## Files and areas allowed for this prompt

```text
appsettings.json
appsettings.Development.json
Program.cs
src/
tests/
*.csproj
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
3. Add clear environment configuration if needed.
4. Configure database provider only if selected by the user.
5. Prepare EF Core foundation if the project uses EF Core.
6. Add a basic DbContext only if needed now.
7. Do not create product-specific tables unless required by the next domain prompt.


## Checks to run

```bash
dotnet build
dotnet test
```

## Acceptance criteria

- Configuration is safe and beginner-friendly.
- Database choice is clear.
- No real credentials are stored.
- EF Core foundation is ready if selected.


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
