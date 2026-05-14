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

## Durable Execution Records

For work that may span more than one session, a task should also carry durable
execution details so it can resume without chat history:

- execution summary
- resume steps
- required inputs
- expected outputs
- do not change
- verification commands

These fields are mirrored into task memory so the next session can recover the
task state, scope, and checks directly from the record.

Evolution-linked follow-up tasks should keep the source change, impacted area,
and acceptance criteria visible in the task record so the next task in the
chain can be created or resumed without guessing.

When a source task creates a follow-up chain, record the linked task IDs in a
`follow_up_tasks` field so the chain stays visible in both task memory and the
task tracker record.

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
The same live view also exposes a lifecycle board that groups tasks into
intake, ready, execution, validation, closure, blocked, and archived stages.
Structured pre-build assessment records live in:

```text
.kabeeri/task_assessments.json
```

Use:

```bash
kvdf task tracker
kvdf task tracker --json
kvdf task assessment
kvdf task lifecycle
kvdf trace report
kvdf change report
kvdf dashboard task-tracker
kvdf dashboard serve
```

The task scheduler report also explains durable task lineage and trash
recovery:

```bash
kvdf schedule status --json
kvdf schedule history --json
```

When a task is in trash, the report includes a restore hint and the exact
recovery command to use.

When served locally, the focused live JSON is available at:

```text
/__kvdf/api/tasks
```

## Recommended Flow

```text
1. Capture the source.
2. Create or approve a governed task.
3. Confirm scope, exclusions, workstream, app boundary, and acceptance criteria.
4. Move the task into the ready stage and assign the developer or AI agent.
5. Issue a scoped token or start a tracked session when needed.
6. Execute only the task scope.
7. Record changed files, checks, screenshots, logs, and risks.
8. Review independently where possible.
9. Owner verifies or rejects.
10. Archive the task into trash when closure is final.
11. Dashboard and reports show the final state.
```

## Status Values

Use the canonical task status values from `TASK_STATES.md`:

```text
proposed
approved
ready
assigned
in_progress
review
owner_verified
rejected
blocked
done
closed
trashed
```

Avoid mixing similar values such as `pending`, `started`, `complete`, or
`finished`.

## Minimum Task Object

A task should include at least:

```json
{
  "id": "T001",
  "title": "Example task",
  "status": "proposed",
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
TASK_ASSESSMENT.md
TRACEABILITY.md
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
kvdf task assessment
kvdf task lifecycle
kvdf trace report
kvdf change report
kvdf task tracker
kvdf dashboard task-tracker
kvdf validate task
```

## Status

Unified task tracking and governance layer for Kabeeri VDF.
