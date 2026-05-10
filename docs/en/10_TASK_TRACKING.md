# 10 - Task Tracking

Task tracking keeps AI work small, accountable, and reviewable.

## Task Purpose

A task should describe one clear piece of work, its source, its acceptance
criteria, and its execution boundaries.

## Typical States

- proposed
- approved
- in_progress
- review_needed
- verified
- rejected
- blocked

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
