# 03 — Firestore Data Model Prompt

## Goal

Plan or create the first Firestore collections/documents based on Kabeeri VDF planning documents.

## Context for the AI coding assistant

This prompt handles Firestore data structure. It must be based on product documents, not guesses.

## Information the user should provide before running this prompt

- What things does the product need to save? Example: users, profiles, projects, tasks, orders, bookings.
- Which of these are needed in the first release?
- Which can wait?
- Who owns or can see each type of data?
- Technical note: If unsure, ask ChatGPT to convert your product objects into Firestore collections/documents.

## Files and areas allowed for this prompt

```text
firestore.rules
firestore.indexes.json
src/lib/firebase*
README.md
docs/schema-notes.md if present
```

## Files and areas forbidden for this prompt

```text
Real production data
Open security rules for private data
Unrelated modules
```

## Tasks

1. Read the user's product and database notes.
2. Identify only first-release collections.
3. Define documents and fields in beginner-readable language first.
4. Decide whether data is public, user-owned, team-owned, or admin-only.
5. Consider document paths carefully.
6. Add index notes if queries need them.
7. Do not add future collections.
8. Leave detailed security rules for the security rules prompt unless simple rules are required immediately.


## Checks to run

```text
Review data model manually.
Test with emulator/local/staging only.
Do not use real production data.
```

## Acceptance criteria

- Collections match first-release product needs.
- Firestore structure is not overbuilt.
- Query needs are identified.
- No production data is touched.


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
