# 01 — Project Context Prompt

## Goal

Give the AI coding assistant the correct project context before writing .NET code.

## Context for the AI coding assistant

This prompt is used before implementation starts. Its goal is to make the AI understand the product, first release scope, preferred .NET style, and what it must not build yet.

## Information the user should provide before running this prompt

- What are you building?
- Who will use it?
- What should the first version do?
- What should wait until later?
- Do you want Web API, MVC, Razor Pages, Blazor, or are you not sure?

## Files and areas allowed for this prompt

```text
README.md
src/
tests/
*.sln
*.csproj
architecture notes if they exist
```

## Files and areas forbidden for this prompt

```text
docs/
generators/
questionnaires/
prompt_packs/
Unrelated future modules
```

## Tasks

1. Read the product summary provided by the user.
2. Identify the first release scope.
3. Identify what should not be built yet.
4. Identify the chosen .NET style if provided: Web API, MVC, Razor Pages, Blazor, Worker Service, or other.
5. Produce an implementation context summary.
6. Do not write product code unless the user explicitly asks after this summary.
7. If the project already exists, summarize its current structure.


## Checks to run

```bash
dotnet --info
dotnet build
dotnet test
```

## Acceptance criteria

- The AI clearly understands the product.
- First release scope is separated from future ideas.
- The chosen .NET implementation style is clear or flagged as undecided.
- No unrelated features are added.


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
