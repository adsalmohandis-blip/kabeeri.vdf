# 08 — Forms and Validation Prompt

## Goal

Add Symfony forms and validation foundation where needed.

## Context for the AI coding assistant

This prompt helps prevent messy input handling across the app.

## Information the user should provide before running this prompt

- What forms are needed first? Contact, login, create item, edit profile, etc.
- What fields are required?
- What should happen after submit?
- Technical note: If unsure, ask ChatGPT to write validation rules from product requirements.

## Files and areas allowed for this prompt

```text
src/Form/
src/Entity/
src/Controller/
templates/
tests/
```

## Files and areas forbidden for this prompt

```text
Unrelated features
Advanced workflow engines
Secrets
```

## Tasks

1. Identify which first-release forms are needed.
2. Add Symfony forms only where useful.
3. Add validation constraints and clear error messages.
4. Show form errors in Twig if full-stack.
5. For API-only apps, add request DTO/validation approach if preferred.
6. Add tests where useful.
7. Do not build all future forms.


## Checks to run

```bash
php bin/phpunit
```

## Acceptance criteria

- Form/validation pattern is clear.
- Errors are understandable.
- Scope is limited to first-release forms.
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
