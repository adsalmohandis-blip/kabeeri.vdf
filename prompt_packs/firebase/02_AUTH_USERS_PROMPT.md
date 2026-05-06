# 02 — Firebase Auth and Users Prompt

## Goal

Plan or implement Firebase Authentication and user profile foundation if the first release needs login.

## Context for the AI coding assistant

This prompt handles user authentication and profile data. It should stay simple for the first release.

## Information the user should provide before running this prompt

- Does the first release need login?
- How should users log in? Email/password, Google, Apple, phone, anonymous, or other?
- Does each user need a profile document?
- What profile fields are needed first?

## Files and areas allowed for this prompt

```text
src/lib/firebase*
app/
components/
lib/
.env.example
README.md
firestore.rules if profile access is included
```

## Files and areas forbidden for this prompt

```text
Admin SDK keys in frontend
Service account JSON files
Real secrets
Unrelated modules
```

## Tasks

1. Ask whether the first release needs login.
2. Identify auth methods: email/password, magic link, Google, Apple, phone, anonymous, or other.
3. Do not add providers not requested.
4. Plan profile document structure only if the app needs profile data.
5. Explain how Firebase Auth user IDs relate to profile documents.
6. Add frontend/mobile integration only if a client stack exists.
7. Do not add complex organization/team logic unless first-release scope requires it.


## Checks to run

```text
Create a test user in local/staging only.
Confirm no Admin SDK private key is in frontend/mobile.
Confirm auth flow manually.
Review relevant security rules.
```

## Acceptance criteria

- Auth method is clear.
- Profile handling is clear if needed.
- No Admin SDK credentials are exposed.
- The solution is not overbuilt.


## Important scope rule

Do not build features outside this prompt.  
Do not expose Firebase Admin credentials in frontend or mobile code.  
Do not commit real secrets.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Firebase changes:
Checks to run:
Security notes:
Manual review notes:
Next recommended prompt:
```
