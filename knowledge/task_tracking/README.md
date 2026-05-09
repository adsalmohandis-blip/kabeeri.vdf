# Task Tracking

This directory defines the task tracking layer for **Kabeeri Vibe Developer Framework**.

The current folder started as a simple framework asset placeholder. This improved version turns it into a practical workflow for tracking AI-assisted development tasks from idea to review and completion.

## Purpose

The purpose of `task_tracking/` is to help vibe developers and AI coding assistants work in small, reviewable tasks instead of asking AI to build a whole product at once.

It connects:

```text
Project documents
→ prompt packs
→ implementation tasks
→ AI execution
→ human review
→ acceptance
→ commit
→ GitHub Issue closure
```

## What this folder is

This folder provides:

- a simple task format
- task states
- a JSON task example
- a reusable task schema
- a review checklist
- an AI execution log template
- an example task for GitHub Issue usage

## Relationship to governance

Use `task_tracking/` for task schemas, task templates, examples, task states,
review checklists, provenance schema, intake template, and AI execution log
formats.

Use [../governance/TASK_GOVERNANCE.md](../governance/TASK_GOVERNANCE.md) for
the canonical rules about whether a task is valid, ready, traceable, scoped,
assigned, reviewable, and safe to execute.

## Live task tracker state

Runtime task state lives in `.kabeeri/tasks.json`.

The dashboard also generates a smaller live task tracker file for UI surfaces:

```text
.kabeeri/dashboard/task_tracker_state.json
```

It is derived from tasks, tokens, locks, sessions, acceptance records, app
links, sprint links, AI usage, Vibe suggestions, and post-work captures.

Use:

```bash
kvdf task tracker
kvdf task tracker --json
kvdf dashboard task-tracker
kvdf dashboard serve
```

When served locally, the focused live JSON is available at:

```text
/__kvdf/api/tasks
```

The old `task_governance/` folder has been removed. Do not recreate it; add new
task policy only to `governance/TASK_GOVERNANCE.md`.

## What this folder is not

This folder is not a replacement for:

- GitHub Issues
- GitHub Projects
- Jira
- Linear
- Trello
- project management software

It is a framework-level task format that can be copied into those tools.

## Recommended GitHub workflow

```text
1. Create or open a GitHub Issue.
2. Add the correct label.
3. Add the issue to the milestone.
4. Add the issue to the GitHub Project board.
5. Move the card to Todo.
6. When work starts, move it to In Progress.
7. Use TASK_TEMPLATE.md to define the work.
8. Use the matching prompt pack if implementation is needed.
9. Use AI_EXECUTION_LOG_TEMPLATE.md after AI generates or edits files.
10. Use TASK_REVIEW_CHECKLIST.md before closing the issue.
11. Commit and push.
12. Move the card to Done.
13. Close the issue.
```

## Minimum task object

A task should include at least:

```json
{
  "id": "T001",
  "title": "Example task",
  "status": "todo",
  "prompt_id": "P001",
  "folder": "05_EXECUTION_PLAN",
  "depends_on": [],
  "tests": [],
  "review_notes": ""
}
```

## Recommended task object

For real framework work, use the fuller structure in:

```text
task.schema.json
task.schema.example.json
```

## Task status values

Use these status values:

```text
todo
in_progress
blocked
review
done
closed
```

Avoid mixing similar values such as:

```text
pending
started
complete
finished
```

Use one consistent vocabulary so tasks are easy to track.

## Folder contents

```text
README.md
README_AR.md
TASK_TEMPLATE.md
TASK_STATES.md
TASK_INTAKE_TEMPLATE.md
TASK_PROVENANCE_SCHEMA.json
TASK_REVIEW_CHECKLIST.md
AI_EXECUTION_LOG_TEMPLATE.md
EXAMPLE_TASK.md
task.schema.json
task.schema.example.json
task_tracking_manifest.json
```

## Standard task flow

```text
todo
→ in_progress
→ review
→ done
→ closed
```

For a very simple GitHub Project board, use:

```text
todo
→ in_progress
→ done
```

## AI usage rule

When using an AI coding assistant for a task, always include:

```text
You are working inside Kabeeri Vibe Developer Framework.
Implement only this task.
Do not expand scope.
Do not add future features.
Do not modify unrelated files.
Do not commit real secrets.
List changed files.
List checks/tests to run.
Stop after completing this task.
```

## Commit example

```bash
git add task_tracking
git commit -m "Define first task tracking format for v0.1.1

Closes #6"
git push
```

## Status

Foundation task tracking format for `v0.1.1`.
