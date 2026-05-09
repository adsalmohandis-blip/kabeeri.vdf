# 04 — Roles and Permissions Prompt

## Goal

Add a simple roles and permissions foundation suitable for the first release.

## Context for the AI coding assistant

This prompt creates a safe first permission layer. It should not become an enterprise access-control system unless the project requires it.

## Information the user should provide before running this prompt

- Who can manage the system?
- What types of users exist?
- What should normal users not be able to access?
- If unsure, ask ChatGPT to help define simple roles for your product.

## Files and areas allowed for this prompt

```text
app/Models/
database/migrations/
database/seeders/
app/Policies/
app/Http/Middleware/
routes/
tests/
```

## Files and areas forbidden for this prompt

```text
Billing
Marketplace
Unrelated business modules
Production deployment files
```

## Tasks

1. Ask whether the project needs simple roles or detailed permissions.
2. If simple roles are enough, implement a simple role field or role table.
3. If detailed permissions are required, suggest a known Laravel package or a minimal custom structure.
4. Add beginner-friendly default roles such as owner, admin, manager, member, viewer if suitable.
5. Add middleware or policies for protecting admin areas.
6. Add tests for restricted access.
7. Do not overbuild complex enterprise permissions unless explicitly required.


## Checks to run

```bash
php artisan migrate
php artisan test
```

## Acceptance criteria

- Roles or permissions are clearly defined.
- Admin-only routes are protected.
- Unauthorized users cannot access restricted areas.
- The solution is appropriate for the first release.


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
