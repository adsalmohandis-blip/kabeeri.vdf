# 10 — Migration and Seeding Prompt

## Goal

Add migration, import, export, or demo seed workflow for Firebase data if needed.

## Context for the AI coding assistant

This prompt helps keep data setup repeatable and reviewable.

## Information the user should provide before running this prompt

- Do you need demo data?
- What sample records would help test the app?
- Is this local, emulator, staging, or production?
- Technical note: Never use real customer data as seed data.

## Files and areas allowed for this prompt

```text
scripts/
README.md
firestore seed/demo files
emulator seed files
```

## Files and areas forbidden for this prompt

```text
Production destructive operations
Real user data
Secrets
```

## Tasks

1. Ask what data needs to be created, imported, exported, or migrated.
2. Define safe demo/seed data.
3. Do not include real user data.
4. Create scripts only for local/staging/demo use unless explicitly approved.
5. Avoid destructive operations by default.
6. Document backup and review steps.


## Checks to run

```text
Run seed/import locally or in emulator.
Test invalid data.
Confirm no real customer data is included.
```

## Acceptance criteria

- Seed/migration behavior is clear.
- Demo data is fake.
- Destructive operations are avoided by default.
- Workflow is documented.


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
