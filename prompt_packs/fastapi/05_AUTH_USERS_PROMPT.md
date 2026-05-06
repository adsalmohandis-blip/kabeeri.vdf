# 05 — Authentication and Users Prompt

## Goal

Add authentication and users foundation if the first release needs login or API users.

## Context for the AI coding assistant

This prompt adds the user foundation. Keep it suitable for the first release.

## Information the user should provide before running this prompt

- Does the first release need login?
- Who logs in: customers, admins, team members, or external clients?
- Is auth handled by FastAPI or an external provider?
- Preferred auth approach, if any?
- Technical note: If you are not sure which auth approach to use, ask ChatGPT to compare options for your project.

## Files and areas allowed for this prompt

```text
app/api/
app/core/
app/models/
app/schemas/
app/services/
app/db/
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

1. Ask whether the project needs login/API authentication in the first release.
2. Choose an auth approach suitable for the project: JWT, session/cookie with frontend, API key, external auth provider, or none.
3. Do not choose a paid/external provider without user approval.
4. Add user model/schema only if needed.
5. Add password hashing/token helpers if JWT/local auth is selected.
6. Add login/me endpoints only if needed.
7. Add tests or manual check instructions.
8. Do not add complex roles yet; that belongs to the next prompt.


## Checks to run

```bash
pytest
python -m compileall app
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
