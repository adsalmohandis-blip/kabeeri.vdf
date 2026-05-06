# 12 — Release Handoff Prompt

## Goal

Prepare a release handoff summary for the current Flutter implementation state.

## Context for the AI coding assistant

This prompt documents what was built, what remains, and what should be reviewed before release. It should not write new product code.

## Information the user should provide before running this prompt

- What version or milestone is this release for?
- Who will review it?
- Is it for local demo, internal testing, TestFlight, Play testing, or production?

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
Unrelated files
```

## Tasks

1. Summarize what has been implemented.
2. List the main screens, widgets, navigation, services, and config created.
3. List how to run the app locally.
4. List checks/tests to run.
5. List device/emulator checks to perform.
6. List known limitations.
7. List pending tasks.
8. List recommended next prompts or issues.
9. Do not add product features.


## Checks to run

```bash
flutter analyze
flutter test
```

## Acceptance criteria

- Handoff document is clear.
- User knows what was built.
- User knows what still needs work.
- Device review steps are included.
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
Device/emulator checks:
Manual review notes:
Next recommended prompt:
```
