# 07 — Settings and Feature Flags Prompt

## Goal

Add a simple settings and feature flags foundation.

## Context for the AI coding assistant

This prompt helps the project control options and future features without hardcoding everything.

## Information the user should provide before running this prompt

- What settings should the owner control without editing code?
- Which features may need to be turned on/off later?
- Are there language, timezone, or branding settings?

## Files and areas allowed for this prompt

```text
app/Models/
database/migrations/
config/
app/Services/
resources/views/admin/settings/
tests/
```

## Files and areas forbidden for this prompt

```text
Complex billing entitlements
Marketplace features
Unrelated modules
```

## Tasks

1. Add a simple settings structure for app-level options.
2. Add a simple feature flag structure if useful.
3. Allow admin users to view or edit safe settings if in scope.
4. Keep sensitive settings out of the database unless encrypted and required.
5. Add examples such as site name, default language, registration enabled.
6. Do not build a full subscription entitlement system yet.


## Checks to run

```bash
php artisan migrate
php artisan test
```

## Acceptance criteria

- Basic settings can be stored and retrieved.
- Feature flags are simple and safe.
- Sensitive information is not exposed.
- No complex pricing or billing logic is added.


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
