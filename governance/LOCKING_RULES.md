# Locking Rules

Locks prevent unsafe overlap across task, file, folder, workstream, database, and prompt-pack scopes.

## Lock Types

- `task`
- `file`
- `folder`
- `workstream`
- `database_table`
- `prompt_pack`

## Lock Shape

```json
{
  "lock_id": "lock-001",
  "type": "file",
  "scope": "src/api/users.ts",
  "owner_id": "agent-001",
  "task_id": "task-001",
  "reason": "Implementing user endpoint",
  "created_at": "2026-05-08T00:00:00Z",
  "expires_at": "2026-05-08T04:00:00Z",
  "status": "active"
}
```

## Conflict Rules

- A new assignment cannot overlap active file or folder locks unless an Owner or Maintainer records an override.
- A workstream lock blocks new work in that workstream.
- Database table locks block schema-changing work on the same table.
- Prompt pack locks block concurrent edits to the same prompt pack.
- Conflicts are resolved manually. The system can recommend options but must not auto-resolve risky conflicts.

## Dashboard Requirements

Dashboard lock views should show active locks, owner, task, scope, expiry, and conflict warnings.

