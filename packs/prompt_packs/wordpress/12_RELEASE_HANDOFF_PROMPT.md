# 12 — WordPress Release Handoff Prompt

## Goal

Prepare a release handoff summary for the current WordPress implementation state.

## Context for the AI coding assistant

This prompt documents what was built, what remains, and what should be reviewed before release. It should not write new product code.

## Information the user should provide before running this prompt

- What version or milestone is this release for?
- Who will review it?
- Is it for local demo, staging, or production?

## Files and areas allowed for this prompt

```text
wp-content/plugins/<plugin-folder>/README.md
wp-content/themes/<child-theme>/README.md
CHANGELOG.md if present
release_notes.md if needed
```

## Files and areas forbidden for this prompt

```text
wp-admin/
wp-includes/
WordPress core files
New features
Large code changes
```

## Tasks

1. Summarize what has been implemented.
2. List the main plugin/theme files created.
3. List how to install or activate locally.
4. List manual checks to run.
5. List security notes.
6. List known limitations.
7. List pending tasks.
8. List recommended next prompts or issues.
9. Do not add product features.


## Checks to run

```text
Activate plugin/theme locally.
Run basic admin/frontend checks.
Check debug.log if enabled.
```

## Acceptance criteria

- Handoff document is clear.
- User knows what was built.
- User knows what still needs work.
- Security notes are included.
- Next steps are easy to follow.


## Important scope rule

Do not build features outside this prompt.  
Do not modify WordPress core files.  
Do not create advanced modules unless they are explicitly listed above.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Checks to run:
Manual review notes:
Security notes:
Next recommended prompt:
```
