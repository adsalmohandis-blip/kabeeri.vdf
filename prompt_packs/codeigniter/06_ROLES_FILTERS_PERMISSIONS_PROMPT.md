# 06 — Roles, Filters, and Permissions Prompt

## Goal

Add simple roles, filters, and permission checks.

## Context for the AI coding assistant

This prompt protects important actions without overbuilding enterprise access control.

## Information the user should provide before running this prompt

- What types of users will use the system?
- What should only admins do?
- What should normal users not access?
- Technical note: If unsure, ask ChatGPT to help define a simple role list for your product.

## Files and areas allowed for this prompt

```text
app/Filters/
app/Controllers/
app/Models/
app/Config/
app/Database/Migrations/
tests/
```

## Files and areas forbidden for this prompt

```text
Advanced enterprise permissions
Unrelated features
Billing
Marketplace
```

## Tasks

1. Ask what user types exist.
2. Create simple roles such as owner, admin, manager, member, viewer if suitable.
3. Use CodeIgniter filters to protect routes where appropriate.
4. Protect admin or management actions.
5. Add tests or clear manual checks.
6. Do not create a complex permission matrix unless the project requires it.


## Checks to run

```bash
php spark routes
vendor/bin/phpunit
```

## Acceptance criteria

- Roles are simple and understandable.
- Restricted actions/routes are protected.
- Unauthorized users cannot access protected actions.
- Role design matches first release scope.


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
