# Task States

This file defines the task states used by Kabeeri VDF and the visible lifecycle
engine that maps those states into a human-readable flow.

## Status values

Use these exact values in JSON and task files:

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

## Lifecycle stages

The lifecycle engine groups the status values into visible stages:

```text
intake
ready
execution
validation
closure
blocked
archived
```

### intake

The task has been proposed, suggested, or created, but it has not yet been
approved for execution.

Use when:

```text
- The source is still being refined.
- Scope or acceptance criteria need confirmation.
- The task is waiting for approval.
```

### ready

The task is approved and ready to be assigned or started.

Use when:

```text
- The task has been approved.
- The assignee has been selected.
- The task can move into execution.
```

### execution

Work is actively happening on the task.

Use when:

```text
- A contributor is working on the task.
- AI is generating or editing files.
- Files are being reviewed locally.
```

### validation

The task output exists and needs evidence review or Owner verification.

Use when:

```text
- Files have been created or edited.
- The contributor needs to review the output.
- Checks/tests need to be run.
- Owner verification is pending.
```

### closure

The task is complete and can be archived or closed.

Use when:

```text
- Acceptance criteria are met.
- Owner verification has passed.
- The task can be moved to trash or marked closed.
```

### blocked

The task cannot continue until something is resolved.

Use when:

```text
- Required information is missing.
- A decision is needed.
- Another task must finish first.
- There is a technical issue.
- The task was rejected and needs a clearer replacement.
```

### archived

The task has been moved to trash or otherwise archived.

Use when:

```text
- The task was completed and moved to `.kabeeri/task_trash.json`.
- The task has been restored or purged.
- The task is no longer active in `.kabeeri/tasks.json`.
```

## Minimum flow

```text
proposed
-> approved
-> assigned
-> in_progress
-> review
-> owner_verified
-> done
-> trashed
```

## Recommended mature flow

```text
proposed
-> approved
-> ready
-> assigned
-> in_progress
-> review
-> owner_verified
-> done
-> trashed
```

## GitHub Project mapping

```text
proposed      -> Todo
approved      -> Todo or Ready
ready         -> Ready
assigned      -> In Progress
in_progress   -> In Progress
review        -> Review
owner_verified -> Review or Done
blocked       -> Blocked
rejected      -> Blocked or Closed
done          -> Done
closed        -> Closed issue state
trashed       -> Archived or removed from active board
```

## Lifecycle command

```bash
kvdf task lifecycle
kvdf task lifecycle task-001
```

Use `kvdf task lifecycle` when you want to see the visible flow from intake to
archived state without digging through raw status codes.
