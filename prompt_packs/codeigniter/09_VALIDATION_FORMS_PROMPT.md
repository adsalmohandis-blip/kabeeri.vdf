# 09 — Validation and Forms Prompt

## Goal

Add validation and forms foundation where needed.

## Context for the AI coding assistant

This prompt helps prevent messy input handling across the app.

## Information the user should provide before running this prompt

- What forms or API inputs are needed first? Contact, login, create item, edit profile, etc.
- What fields are required?
- What should happen after submit?
- Technical note: If unsure, ask ChatGPT to write validation rules from product requirements.

## Files and areas allowed for this prompt

```text
app/Controllers/
app/Views/
app/Models/
app/Config/
tests/
```

## Files and areas forbidden for this prompt

```text
Unrelated features
Advanced workflow engines
Secrets
```

## Tasks

1. Identify which first-release forms or API inputs are needed.
2. Add CodeIgniter validation rules.
3. Show useful error messages in views or JSON responses.
4. Add success/loading/redirect behavior where appropriate.
5. Keep validation beginner-friendly.
6. Add tests where useful.
7. Do not build all future forms.


## Checks to run

```bash
vendor/bin/phpunit
```

## Acceptance criteria

- Validation pattern is clear.
- Errors are understandable.
- Scope is limited to first-release forms/API inputs.
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
