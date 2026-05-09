# 11 — Firebase Security Review Prompt

## Goal

Review Firebase security basics, including secrets, rules, Admin SDK usage, and access paths.

## Context for the AI coding assistant

This prompt is used after auth/data/storage/functions work. It should not add new product features.

## Information the user should provide before running this prompt

- Which Firebase services exist now?
- Which collections/buckets exist now?
- Are there Cloud Functions?
- What data is private?

## Files and areas allowed for this prompt

```text
firebase.json
firestore.rules
storage.rules
functions/
src/lib/firebase*
.env.example
README.md
```

## Files and areas forbidden for this prompt

```text
New product features
Production destructive changes
Real secrets
Service account JSON files
```

## Tasks

1. Review all environment variable usage.
2. Confirm no Admin SDK private key or service account JSON is in frontend/mobile.
3. Review Firestore/Realtime Database rules.
4. Review Storage rules.
5. Review Cloud Functions authorization and secrets.
6. Identify broad rules that need manual review.
7. Do not add new features.


## Checks to run

```text
Manual security review.
Test unauthenticated access.
Test authenticated access.
Test owner/non-owner access where relevant.
Review repo for secrets/service account files.
```

## Acceptance criteria

- Secrets are not exposed.
- Security rules are reviewed.
- Storage and functions access is reviewed.
- Risky rules are flagged.
- No new product scope is added.


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
