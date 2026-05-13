# KVDF Task Trash Implementation Report

## Purpose

KVDF keeps completed tasks available for recovery instead of deleting them
immediately. This report documents the task trash lifecycle, the runtime state
files that back it, the CLI commands that expose it, and the retention policy
that removes expired records automatically.

## Why Task Trash Exists

Completed tasks often remain useful after they are removed from the active task
list. A task may need to be reviewed again, restored after a mistaken close, or
used as evidence for a later session. The trash layer gives KVDF a safe
middle-ground between "active" and "gone forever".

The goals are:

- preserve the full task payload after final completion
- make recovery easy when a task was archived too early
- keep active task lists clean and focused
- remove stale trash automatically after a fixed retention period

## Runtime Storage

Task trash lives in:

```text
.kabeeri/task_trash.json
```

The file stores:

- `trash`: the archived task records
- `retention_days`: the configured retention window, default `30`
- `last_sweep_at`: the last automatic retention sweep timestamp

Each trashed task carries the full task record plus trash metadata:

- `trashed_at`
- `trash_expires_at`
- `trashed_reason`
- `trashed_by`
- `original_position`
- `original_status`
- `source_collection`
- `trash_retention_days`

## Lifecycle

### 1. Task completion

The active command flow keeps `task verify` intact. Verification still marks a
task as owner-verified and leaves it available for final review.

To archive the task, the owner runs:

```bash
kvdf task complete <task-id> --owner <owner-id>
```

The CLI moves the task out of `.kabeeri/tasks.json` and into
`.kabeeri/task_trash.json`.

### 2. Listing and inspection

The trash can be inspected with:

```bash
kvdf task trash list
kvdf task trash show <task-id>
```

These commands expose the trashed timestamp, expiry timestamp, original
position, and original status so the task can be recovered with context.

### 3. Restore

If the task was archived too early, it can be restored:

```bash
kvdf task trash restore <task-id>
```

The task returns to `.kabeeri/tasks.json` at its original position when that
position is still available, or at the end of the active list otherwise.

### 4. Automatic sweep

On `kvdf resume` and `kvdf entry`, KVDF sweeps expired trash records before the
session report is rendered. This keeps the trash bucket from growing forever.

Expired items are deleted when:

- `trash_expires_at` is in the past, or
- `trashed_at + retention_days` is already expired

The default retention period is 30 days.

## CLI Surface

The task command surface now includes:

- `kvdf task complete`
- `kvdf task close`
- `kvdf task finish`
- `kvdf task archive`
- `kvdf task trash list`
- `kvdf task trash show`
- `kvdf task trash restore`
- `kvdf task trash purge`
- `kvdf task trash sweep`

`close`, `finish`, and `archive` are aliases for the same finalization flow.

## Notes On Safety

- `task verify` still performs owner verification and does not delete work.
- Trash is a recovery layer, not a replacement for task history.
- The active task tracker remains the source of truth for live work.
- The trash bucket is intentionally time-limited so stale records do not remain
  in the workspace forever.

## Implementation Files

- `src/cli/services/task_trash.js`
- `src/cli/index.js`
- `src/cli/commands/resume.js`
- `src/cli/workspace.js`
- `tests/cli.integration.test.js`

## Validation

The implementation is covered by integration tests and workspace bootstrapping
checks. The expected behavior is:

- new workspaces create `.kabeeri/task_trash.json`
- task completion archives records into trash
- restore returns them to the active task list
- resume and entry sweep expired trash records automatically

