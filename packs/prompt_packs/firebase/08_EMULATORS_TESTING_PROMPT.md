# 08 — Firebase Emulators and Testing Prompt

## Goal

Add or document Firebase emulator/testing workflow for safer local development.

## Context for the AI coding assistant

This prompt helps avoid testing directly against production Firebase resources.

## Information the user should provide before running this prompt

- Which Firebase services are used? Auth, Firestore, Storage, Functions?
- Do you want local emulator testing now?
- What demo data would help testing?

## Files and areas allowed for this prompt

```text
firebase.json
.firebaserc
README.md
tests/
functions/
emulator docs
```

## Files and areas forbidden for this prompt

```text
Production credentials
Production destructive changes
Real user data
```

## Tasks

1. Check whether Firebase emulators are already configured.
2. Add or document emulator workflow for selected Firebase services.
3. Document how to run local checks safely.
4. Add simple test data only for local/demo use.
5. Do not use real customer data.
6. Do not require every emulator if the project only uses one service.


## Checks to run

```text
Run Firebase emulators if available.
Test auth/data/rules locally if possible.
Confirm no production data is used.
```

## Acceptance criteria

- Local testing workflow is clear.
- Emulator usage is documented.
- No production data or secrets are required for basic testing.
- Setup matches services actually used.


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
