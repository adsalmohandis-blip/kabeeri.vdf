# Task States

This file defines the task states used by Kabeeri VDF.

## Status values

Use these exact values in JSON and task files:

```text
todo
in_progress
blocked
review
done
closed
```

## todo

The task exists, but work has not started yet.

Use when:

```text
- The issue has been created.
- The task is planned.
- The project card is waiting in Todo.
```

## in_progress

Work has started.

Use when:

```text
- A contributor is working on the task.
- AI is generating or editing files.
- Files are being reviewed locally.
```

## blocked

The task cannot continue until something is resolved.

Use when:

```text
- Required information is missing.
- A decision is needed.
- Another task must finish first.
- There is a technical issue.
```

## review

The task output exists and needs human review.

Use when:

```text
- Files have been created or edited.
- The contributor needs to review the output.
- Checks/tests need to be run.
- The task is not ready to close yet.
```

## done

The task is complete in the project board.

Use when:

```text
- Output has been reviewed.
- Acceptance criteria are met.
- Commit has been pushed.
- The card can move to Done.
```

## closed

The GitHub Issue is closed.

Use when:

```text
- The issue is closed manually.
- The issue is closed automatically by a commit.
- The task is no longer active.
```

## GitHub Project mapping

```text
todo        → Todo
in_progress → In Progress
review      → In Progress or Review
done        → Done
closed      → Closed issue state
blocked     → Add blocked label and keep in Todo or In Progress
```

## v0.1.1 minimum flow

```text
todo
→ in_progress
→ done
```

## Recommended mature flow

```text
todo
→ in_progress
→ review
→ done
→ closed
```
