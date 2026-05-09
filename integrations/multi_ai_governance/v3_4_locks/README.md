# v3.4.0 - Locks and Conflict Prevention

Goal: prevent unsafe overlap across tasks, files, folders, workstreams, database tables, and prompt packs.

## Lock Types

- Task Lock
- File Lock
- Folder Lock
- Workstream Lock
- Database Table Lock
- Prompt Pack Lock

## Lock Shape

```json
{
  "lock_id": "lock-001",
  "type": "file",
  "scope": "src/api/users.ts",
  "owner_id": "agent-001",
  "task_id": "task-001",
  "reason": "Implementing user endpoint",
  "created_at": "2026-05-07T00:00:00Z",
  "expires_at": "2026-05-07T04:00:00Z",
  "status": "active"
}
```

## Conflict Rules

- A new task cannot be assigned when its allowed files overlap active file/folder locks.
- A workstream lock blocks new tasks in that workstream unless Owner/Maintainer approves.
- Database Table Locks block schema-changing tasks touching the same table.
- Prompt Pack Locks block concurrent edits to prompt packs.
- Conflicts are resolved manually. The system may suggest options but must not auto-resolve risky conflicts.

## Dashboard View

The lock dashboard should show:

- active locks
- lock owner
- task ID
- lock scope
- expiry time
- conflict warnings

## Acceptance Criteria

- Lock types are documented.
- Each lock has owner, expiry, and reason.
- Conflict rules prevent overlap.
- Dashboard shows who locked what.

