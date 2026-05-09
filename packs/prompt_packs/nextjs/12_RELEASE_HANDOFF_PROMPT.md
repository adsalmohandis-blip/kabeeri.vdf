# 12 — Release Handoff Prompt

## Goal

Prepare a release handoff summary for the current Next.js implementation state.

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
```

## Files and areas forbidden for this prompt

```text
New features
Large code changes
Database redesign
Unrelated files
```

## Tasks

1. Summarize what has been implemented.
2. List the main pages, components, and modules created.
3. List how to run the project locally.
4. List checks/tests to run.
5. List known limitations.
6. List pending tasks.
7. List recommended next prompts or issues.
8. Do not add product features.


## Checks to run

```bash
npm run lint
npm run build
npm test
```

## Acceptance criteria

- Handoff document is clear.
- User knows what was built.
- User knows what still needs work.
- Next steps are easy to follow.


## Important scope rule

Do not build features outside this prompt.  
Do not create advanced modules unless they are explicitly listed above.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Commands run:
Tests/checks result:
Manual review notes:
Next recommended prompt:
```
