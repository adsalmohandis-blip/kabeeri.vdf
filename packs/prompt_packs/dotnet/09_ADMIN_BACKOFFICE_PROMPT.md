# 09 — Admin / Backoffice Prompt

## Goal

Create a simple admin or backoffice foundation if the project needs it.

## Context for the AI coding assistant

This prompt is optional and should be used only if the first release needs an admin area.

## Information the user should provide before running this prompt

- Does the first release need an admin area?
- What should admins manage first?
- Should it be UI pages, API endpoints, or both?

## Files and areas allowed for this prompt

```text
src/
controllers/pages/endpoints
tests/
README.md
```

## Files and areas forbidden for this prompt

```text
Full analytics dashboard
Advanced CMS
Unrelated modules
```

## Tasks

1. Ask whether an admin/backoffice is needed in the first release.
2. Define the first admin sections.
3. Protect admin routes/endpoints using authentication and authorization.
4. Add simple list/detail placeholders only for confirmed modules.
5. Keep the UI/API minimal.
6. Do not add advanced charts or analytics.


## Checks to run

```bash
dotnet build
dotnet test
```

## Acceptance criteria

- Admin/backoffice exists only if needed.
- Restricted access is protected.
- The admin structure is simple.
- Navigation or endpoint grouping is clear.


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
