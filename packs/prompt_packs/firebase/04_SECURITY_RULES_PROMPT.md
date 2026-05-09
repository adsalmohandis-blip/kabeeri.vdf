# 04 — Firebase Security Rules Prompt

## Goal

Add or review Firestore, Realtime Database, and Storage security rules for first-release data.

## Context for the AI coding assistant

This is one of the most important Firebase prompts. It protects data access.

## Information the user should provide before running this prompt

- Which data should be public?
- Which data belongs to a user?
- Which data should only admins see?
- Can users edit/delete their own records?
- Technical note: If unsure, ask ChatGPT to explain safe Firebase rules for your collections.

## Files and areas allowed for this prompt

```text
firestore.rules
storage.rules
database.rules.json
README.md
security notes
```

## Files and areas forbidden for this prompt

```text
Permanently open rules for private data
Real production destructive changes
Service account files
```

## Tasks

1. List each first-release collection/bucket/path.
2. Decide if the data is public, private, user-owned, team-owned, or admin-only.
3. Write simple rules for read/write only as required.
4. Avoid broad open rules for private data.
5. Add comments explaining each rule in plain language.
6. Separate local/testing rules from real release rules if needed.
7. Do not create rules for future data structures.


## Checks to run

```text
Test rules with emulator if available.
Test unauthenticated access.
Test authenticated owner vs non-owner access where relevant.
Review every allow rule manually.
```

## Acceptance criteria

- Rules match the product's access rules.
- Private data is not publicly readable/writable.
- Each rule is understandable.
- Risky broad access is flagged.


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
