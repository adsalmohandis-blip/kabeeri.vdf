# 12 — Shopify Release Handoff Prompt

## Goal

Prepare a release handoff summary for the current Shopify implementation state.

## Context for the AI coding assistant

This prompt documents what was built, what remains, and what should be reviewed before release. It should not write new product code.

## Information the user should provide before running this prompt

- What version or milestone is this release for?
- Who will review it?
- Is it for development store, staging, or production?

## Files and areas allowed for this prompt

```text
README.md
CHANGELOG.md if present
release_notes.md if needed
store/theme/app notes
```

## Files and areas forbidden for this prompt

```text
New features
Production deployment without approval
Secrets
```

## Tasks

1. Summarize what has been implemented.
2. List theme/app/API/webhook/metafield changes.
3. List how to test in development store/theme.
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
Confirm preview/staging checks are listed.
Confirm rollback/backup notes exist if needed.
```

## Acceptance criteria

- Handoff document is clear.
- User knows what was built.
- User knows what still needs work.
- Security and store safety notes are included.
- Next steps are easy to follow.


## Important scope rule

Do not build features outside this prompt.  
Do not expose Shopify secrets.  
Do not modify live production themes/stores without backup and approval.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Shopify changes:
Checks to run:
Security notes:
Manual review notes:
Next recommended prompt:
```
