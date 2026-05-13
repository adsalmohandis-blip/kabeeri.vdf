# 10 - Task Tracking

Task tracking keeps AI work small, accountable, reviewable, and resumable.

## Task Purpose

A task should describe one clear piece of work, its source, its acceptance
criteria, and its execution boundaries. For longer work, it should also carry
durable execution details so a later session can resume without chat history.

## Canonical States

- proposed
- approved
- ready
- assigned
- in_progress
- review
- owner_verified
- rejected
- blocked
- done
- closed
- trashed

## Durable Execution Fields

When a task may span more than one session, include:

- execution summary
- resume steps
- required inputs
- expected outputs
- do not change
- verification commands

These fields should stay in the task record and task memory so the next
session can recover the task state, scope, and checks directly from the source
of truth.

## Runtime

```bash
kvdf task create --title "Build product API" --workstream backend
kvdf task approve task-001
kvdf task assign task-001 --assignee agent-001
kvdf task verify task-001
```

## References

- `task_tracking/`
- `knowledge/task_tracking/TASK_GOVERNANCE.md`
