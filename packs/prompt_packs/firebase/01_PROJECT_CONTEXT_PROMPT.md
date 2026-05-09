# 01 — Firebase Project Context Prompt

## Goal

Give the AI coding assistant the correct product and Firebase context before implementation.

## Context for the AI coding assistant

This prompt is used before implementation starts. Its goal is to make AI understand whether Firebase is used for auth, Firestore, storage, functions, hosting, analytics, or support services.

## Information the user should provide before running this prompt

- What are you building?
- Will Firebase handle Auth, Firestore, Storage, Functions, Hosting, or all?
- What frontend/mobile/backend will use Firebase?
- What should the first version do?
- What should wait until later?

## Files and areas allowed for this prompt

```text
README.md
.env.example
firebase.json
.firebaserc
src/
app/
lib/
functions/
```

## Files and areas forbidden for this prompt

```text
Real secrets
Service account JSON files
Production credentials
Unrelated future modules
prompt_packs/
```

## Tasks

1. Read the product summary provided by the user.
2. Identify how Firebase will be used: Auth, Firestore, Realtime Database, Storage, Functions, Hosting, Analytics, or all.
3. Identify the frontend/mobile/backend stack that connects to Firebase.
4. Identify first release scope.
5. Identify what should not be built yet.
6. Produce an implementation context summary.
7. Do not write rules or code unless the user explicitly asks after this summary.


## Checks to run

```text
Review .env.example manually.
Confirm no real keys or service account files are committed.
Confirm frontend/mobile/backend relationship is clear.
```

## Acceptance criteria

- Firebase role is clear.
- First release scope is separated from future ideas.
- Security risks are identified early.
- No real secrets or service accounts are exposed.


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
