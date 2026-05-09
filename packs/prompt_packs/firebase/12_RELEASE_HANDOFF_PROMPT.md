# 12 — Release Handoff Prompt

## Goal

Prepare a release handoff summary for the current Firebase implementation state.

## Context for the AI coding assistant

This prompt documents what was built, what remains, and what should be reviewed before release. It should not write new product code.

## Information the user should provide before running this prompt

- What version or milestone is this release for?
- Who will review it?
- Is it for local demo, staging, or production?

## Files and areas allowed for this prompt

```text
README.md
docs/implementation-notes.md if present
CHANGELOG.md if present
release_notes.md if needed
firebase notes
```

## Files and areas forbidden for this prompt

```text
New features
Large code changes
Production destructive operations
Real secrets
```

## Tasks

1. Summarize what has been implemented.
2. List Auth, Firestore, Storage, Functions, Hosting, rules, and integrations created.
3. List how to run/check locally or staging.
4. List manual checks to run.
5. List security notes.
6. List known limitations.
7. List pending tasks.
8. List recommended next prompts or issues.
9. Do not add product features.


## Checks to run

```text
Manual review.
Confirm no secrets are committed.
Confirm rules are documented.
Confirm emulator/staging checks are listed.
```

## Acceptance criteria

- Handoff document is clear.
- User knows what was built.
- User knows what still needs work.
- Security notes are included.
- Next steps are easy to follow.


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
