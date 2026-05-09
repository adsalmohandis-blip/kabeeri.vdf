# 12 — Release Handoff Prompt

## Goal

Prepare a release handoff summary for the current Strapi implementation state.

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
strapi notes
```

## Files and areas forbidden for this prompt

```text
New features
Large code changes
Production destructive changes
Real secrets
```

## Tasks

1. Summarize what has been implemented.
2. List content types, components, permissions, APIs, media, and custom code created.
3. List how to run/check locally or staging.
4. List manual checks to run.
5. List security and permission notes.
6. List known limitations.
7. List pending tasks.
8. List recommended next prompts or issues.
9. Do not add product features.


## Checks to run

```text
Manual review.
Confirm no secrets are committed.
Confirm permissions are documented.
Confirm frontend/API checks are listed.
```

## Acceptance criteria

- Handoff document is clear.
- User knows what was built.
- User knows what still needs work.
- Security/permission notes are included.
- Next steps are easy to follow.


## Important scope rule

Do not build features outside this prompt.  
Do not expose Strapi secrets or private credentials.  
Do not make private content public by default.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Strapi changes:
Checks to run:
Security/permissions notes:
Manual review notes:
Next recommended prompt:
```
