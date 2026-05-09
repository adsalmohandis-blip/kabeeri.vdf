# 05 — Security and Users Prompt

## Goal

Add Symfony security, users, and authentication foundation if the first release needs login.

## Context for the AI coding assistant

This prompt adds the user foundation. Keep it suitable for the first release.

## Information the user should provide before running this prompt

- Does the first release need login?
- Who logs in: customers, admins, team members, or all?
- Should users self-register or be invited by admin?
- Preferred auth approach, if any?
- Technical note: If unsure, ask ChatGPT to compare simple Symfony auth options.

## Files and areas allowed for this prompt

```text
src/Entity/
src/Repository/
src/Security/
src/Controller/
config/packages/security.yaml
migrations/
tests/
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
2. Choose an auth approach suitable for the project: Symfony Security login form, API token/JWT, OAuth, external provider, or none.
3. Do not choose a paid/external provider without user approval.
4. Add user entity/profile foundation only if needed.
5. Add login/logout/register flows only if required.
6. Add password hashing if local auth is selected.
7. Add tests or manual check instructions.
8. Do not add complex roles yet; that belongs to the authorization prompt.


## Checks to run

```bash
php bin/console doctrine:migrations:migrate --no-interaction
php bin/phpunit
```

## Acceptance criteria

- Auth approach is clear.
- User foundation matches first release scope.
- No real secrets are committed.
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
