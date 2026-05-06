# 04 — Roles and Permissions Prompt

## Goal

Configure Strapi roles and permissions safely for first-release content and API access.

## Context for the AI coding assistant

This prompt protects content access and avoids accidentally exposing private data.

## Information the user should provide before running this prompt

- Which content should be public?
- Which content should require login?
- Who can create/edit/delete content?
- Does the frontend need public read access?

## Files and areas allowed for this prompt

```text
config/
src/
README.md
permissions-notes.md
```

## Files and areas forbidden for this prompt

```text
Making all content public by default
Real credentials
Unrelated features
```

## Tasks

1. List each first-release content type.
2. Decide which content is public, private, admin-only, or authenticated-user-only.
3. Plan permissions for public, authenticated, and custom roles if needed.
4. Keep API access minimal.
5. Do not expose private content publicly.
6. Document manual permission settings if changes must be made in Strapi admin.
7. Do not create complex role systems unless required.


## Checks to run

```text
Review Strapi admin permissions manually.
Test public API access.
Test authenticated access if available.
Confirm private content is not public.
```

## Acceptance criteria

- Permissions match first-release access rules.
- Private content is protected.
- Public API exposure is intentional.
- Manual admin settings are documented.


## Important scope rule

Do not build features outside this prompt.  
Do not expose Strapi secrets or private credentials.  
Do not make private content public by default.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Strapi changes:
Checks to run:
Security/permissions notes:
Manual review notes:
Next recommended prompt:
```
