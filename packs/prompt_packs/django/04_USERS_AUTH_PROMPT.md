# 04 — Users and Authentication Prompt

## Goal

Create a simple users and authentication foundation for a Django project.

## Context for the AI coding assistant

This prompt adds the user foundation. Keep it suitable for the first release.

## Information the user should provide before running this prompt

- Does the first release need login?
- Who creates users: self-signup, admin invitation, or both?
- Does it need email verification?
- Are users customers, admins, team members, or all of these?
- Technical note: Ask ChatGPT for help if you are unsure about custom user model vs default user model.

## Files and areas allowed for this prompt

```text
apps/users/
config/settings*
urls.py
templates/
tests/
admin.py
models.py
```

## Files and areas forbidden for this prompt

```text
Advanced billing
Marketplace
Future extension features
Unrelated modules
```

## Tasks

1. Ask whether the project needs login in the first release.
2. Decide whether to use Django's built-in User model or a custom user model.
3. If the project may grow, recommend a custom user model early, but explain the choice.
4. Add login/logout/register/profile basics only if needed.
5. Add admin registration.
6. Add tests or manual check instructions.
7. Do not add complex roles yet; that belongs to the permissions prompt.


## Checks to run

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py test
```

## Acceptance criteria

- User/auth foundation matches the project scope.
- Login/registration behavior is clear if required.
- Admin user management works.
- The solution is not overbuilt.


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
