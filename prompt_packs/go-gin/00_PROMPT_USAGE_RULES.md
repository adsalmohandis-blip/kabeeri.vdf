# 00 — Prompt Usage Rules

Use these rules with every Go / Gin prompt in this pack.

## Main rule

Do not let the AI coding assistant expand the scope.

Each prompt must produce one focused change.

## Required workflow

```text
1. Read the project documents.
2. Run one prompt.
3. Review changed files.
4. Run tests or basic checks.
5. Fix issues.
6. Commit.
7. Move to the next prompt.
```

## AI coding assistant instructions

When sending a prompt to an AI coding assistant, always include:

```text
You are working on a Go / Gin project.
Follow the prompt scope exactly.
Do not add unrelated features.
Do not modify unrelated files.
Explain what you changed.
List files changed.
List tests or checks to run.
Stop after completing this task.
```

## Files AI may usually modify

Depending on the prompt:

```text
cmd/
internal/
pkg/
api/
configs/
migrations/
tests/
go.mod
go.sum
.env.example
README.md
```

## Files AI should not modify unless explicitly asked

```text
LICENSE
GOVERNANCE.md
SECURITY.md
CONTRIBUTING.md
docs/
generators/
questionnaires/
prompt_packs/
```

## Beginner note

If you do not understand a technical instruction, ask an AI assistant such as ChatGPT to explain it before running the coding prompt.

## Commit style

Suggested commit format:

```bash
git add .
git commit -m "Implement <task name>"
```

Example:

```bash
git commit -m "Add Go Gin auth and users foundation"
```
