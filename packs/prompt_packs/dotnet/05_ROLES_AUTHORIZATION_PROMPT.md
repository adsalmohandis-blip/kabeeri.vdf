# 05 — Roles and Authorization Prompt

## Goal

Add a simple roles and authorization foundation.

## Context for the AI coding assistant

This prompt protects important areas without overbuilding enterprise access control.

## Information the user should provide before running this prompt

- What types of users will use the system?
- What should only admins do?
- What should normal users not access?
- Technical note: If unsure, ask ChatGPT to help define a simple role list for your product.

## Files and areas allowed for this prompt

```text
src/
tests/
Program.cs
authorization policies
controllers/endpoints if needed
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
2. Create simple roles such as Owner, Admin, Manager, Member, Viewer if suitable.
3. Add basic authorization policies where needed.
4. Protect admin or management endpoints.
5. Add tests or clear manual checks.
6. Do not create a complex permission matrix unless the project requires it.


## Checks to run

```bash
dotnet build
dotnet test
```

## Acceptance criteria

- Roles are simple and understandable.
- Restricted areas are protected.
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
