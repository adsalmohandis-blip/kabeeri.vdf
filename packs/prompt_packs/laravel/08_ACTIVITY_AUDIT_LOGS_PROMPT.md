# 08 — Activity and Audit Logs Prompt

## Goal

Add a simple activity and audit logging foundation.

## Context for the AI coding assistant

This prompt creates basic visibility into important actions without building a full monitoring system.

## Information the user should provide before running this prompt

- What actions are important to track?
- Who needs to see logs?
- Are there sensitive fields that must never appear in logs?

## Files and areas allowed for this prompt

```text
app/Models/
database/migrations/
app/Services/
app/Observers/
app/Listeners/
tests/
```

## Files and areas forbidden for this prompt

```text
Full observability stack
External logging platforms
Unrelated modules
```

## Tasks

1. Define what actions should be logged in the first release.
2. Create an activity log or audit log table if needed.
3. Log important actions such as login, create, update, delete, status change.
4. Store actor, action, target, timestamp, and optional metadata.
5. Add a simple admin view only if in scope.
6. Avoid logging sensitive data.


## Checks to run

```bash
php artisan migrate
php artisan test
```

## Acceptance criteria

- Important actions can be logged.
- Logs do not expose passwords, tokens, or sensitive fields.
- The structure can support future review and debugging.
- Scope stays simple.


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
