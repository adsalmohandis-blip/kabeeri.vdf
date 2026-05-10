# Task Tracking And Governance

This directory is the unified task layer for **Kabeeri Vibe Developer Framework**.

It combines what used to be discussed separately as task tracking and task
governance:

- task tracking: the practical task records, schemas, states, templates, review
  checklists, and AI execution logs
- task governance: the rules that decide whether a task is valid, ready,
  traceable, scoped, assigned, reviewable, and safe to execute

## Purpose

The purpose of `knowledge/task_tracking/` is to help developers and AI coding
assistants work in small, reviewable, source-backed tasks instead of asking AI
to build or change a whole product in one broad prompt.

It connects:

```text
Owner request / questionnaire / Vibe intent / issue / design source / scan
-> governed task
-> scoped token or assignment
-> AI or developer execution
-> review evidence
-> Owner verification
-> dashboard visibility
-> commit / issue / release handoff
```

## Canonical Location

This folder is now the single canonical home for task tracking and task
governance.

Use this folder for:

- task schemas
- task templates
- task states
- task intake
- task provenance
- task governance policy
- Owner verification rules
- review checklists
- AI execution logs
- examples
- runtime task-tracker guidance

The old `task_governance/` folder has been removed. Do not recreate it.

`knowledge/governance/TASK_GOVERNANCE.md` remains only as a compatibility
pointer to:

```text
knowledge/task_tracking/TASK_GOVERNANCE.md
```

## What A Governed Task Is

A governed task is a small unit of executable work with enough context and
controls for a human developer, Codex, Claude, Copilot, or another AI agent to
execute it without guessing.

A governed task must explain:

- what will be done
- why it exists
- where it came from
- which app, workstream, files, or feature it affects
- what is included
- what is excluded
- what acceptance criteria prove completion
- who or which agent is assigned
- what evidence must be produced
- which gates apply before completion

## Runtime State

Runtime task state lives in:

```text
.kabeeri/tasks.json
```

The focused live task tracker state lives in:

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

## Recommended Flow

```text
1. Capture the source.
2. Create or approve a governed task.
3. Confirm scope, exclusions, workstream, app boundary, and acceptance criteria.
4. Assign the developer or AI agent.
5. Issue a scoped token or start a tracked session when needed.
6. Execute only the task scope.
7. Record changed files, checks, screenshots, logs, and risks.
8. Review independently where possible.
9. Owner verifies or rejects.
10. Dashboard and reports show the final state.
```

## Status Values

Use consistent task status values:

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

## Minimum Task Object

A task should include at least:

```json
{
  "id": "T001",
  "title": "Example task",
  "status": "todo",
  "source": "owner_request",
  "workstream": "backend",
  "acceptance": ["Validation passes"],
  "review_notes": ""
}
```

For real framework work, use the fuller structure in:

```text
task.schema.json
task.schema.example.json
```

## AI Usage Rule

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

## Folder Contents

```text
README.md
README_AR.md
TASK_GOVERNANCE.md
TASK_TEMPLATE.md
TASK_STATES.md
TASK_INTAKE_TEMPLATE.md
TASK_PROVENANCE_SCHEMA.json
TASK_REVIEW_CHECKLIST.md
AI_EXECUTION_LOG_TEMPLATE.md
EXAMPLE_TASK.md
OWNER_VERIFY_RULES.md
task.schema.json
task.schema.example.json
task_tracking_manifest.json
```

## Main Commands

```bash
kvdf task create
kvdf task assign
kvdf task start
kvdf task review
kvdf task verify
kvdf task tracker
kvdf dashboard task-tracker
kvdf validate task
```

## Status

Unified task tracking and governance layer for Kabeeri VDF.
