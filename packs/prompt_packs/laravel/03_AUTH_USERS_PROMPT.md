# 03 — Authentication, Users, and Profiles Prompt

## Goal

Create a clean authentication and user profile foundation.

## Context for the AI coding assistant

This prompt adds the user foundation. Keep it simple and suitable for future roles, permissions, teams, and organizations.

## Information the user should provide before running this prompt

- Does the app need public registration?
- Who creates users: self-signup, admin invitation, or both?
- Does the app need email verification?

## Files and areas allowed for this prompt

```text
app/Models/User.php
app/Models/UserProfile.php
database/migrations/
database/factories/
database/seeders/
routes/
resources/views or selected starter kit files
tests/
```

## Files and areas forbidden for this prompt

```text
Unrelated modules
Advanced billing
Advanced ERP
Marketplace
Extension folders
```

## Tasks

1. Confirm the selected Laravel auth approach: Breeze, Jetstream, Fortify, custom, or existing app auth.
2. Add or verify users table.
3. Add a simple user profile foundation if needed.
4. Ensure user names, email, password, and verification rules are clear.
5. Add basic profile fields only if required by project scope.
6. Add tests for registration/login if the stack supports it.
7. Do not add complex roles yet; that belongs to the next prompt.


## Checks to run

```bash
php artisan migrate
php artisan test
```

## Acceptance criteria

- Users can register or be created according to project scope.
- Users can log in and log out.
- Profile foundation is simple and clear.
- No advanced permission system is added in this prompt.


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
