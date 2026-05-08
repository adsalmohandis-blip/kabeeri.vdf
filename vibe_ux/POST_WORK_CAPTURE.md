# Post-Work Capture

Post-work capture turns free coding into governed records after the work happens.

## Flow

```text
detect changed files
-> summarize changeset
-> classify workstream and risk
-> link to existing task or suggest a new task
-> collect acceptance evidence
-> flag unapproved work when needed
```

## Changed File Detection

Use git status, changed file lists, timestamps, and workspace state to detect changed scope. Never revert user work during capture.

## Classifications

- `matches_existing_task`
- `needs_new_task`
- `unapproved_scope`
- `exploration`
- `urgent_fix`
- `documentation_only`

## Acceptance Review

Captured work should produce review notes: files changed, purpose, checks run, risks, missing tests, cost, and whether Owner verify is required.

