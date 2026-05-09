# 02 — Solution Structure Prompt

## Goal

Review or create a clean .NET solution structure for the project.

## Context for the AI coding assistant

This prompt organizes the codebase structure. It should not implement business features yet.

## Information the user should provide before running this prompt

- Project profile: Lite, Standard, or Enterprise
- Type of .NET app: Web API, MVC, Razor Pages, Blazor, Worker Service
- Is this a small app or a long-term platform?

## Files and areas allowed for this prompt

```text
*.sln
src/
tests/
*.csproj
README.md
```

## Files and areas forbidden for this prompt

```text
docs/
generators/
questionnaires/
prompt_packs/
Advanced product features
```

## Tasks

1. Check whether a .NET solution already exists.
2. If it exists, inspect and summarize the structure.
3. If it does not exist, tell the user that .NET setup should be done separately or by a future KVDF CLI.
4. Suggest a simple solution structure suitable for the project.
5. For Web API projects, prefer a simple structure first.
6. For larger systems, suggest separation such as API, Application, Domain, Infrastructure, and Tests only if justified.
7. Do not create complex architecture for a small Lite project.


## Checks to run

```bash
dotnet build
dotnet test
```

## Acceptance criteria

- Solution structure is clear.
- The structure matches the project size.
- No unnecessary enterprise layers are forced on small projects.
- The user understands where future code should go.


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
