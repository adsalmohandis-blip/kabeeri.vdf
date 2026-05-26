# Case 1: IDE Leases

IDE leases are the scope boundary for local AI tools in one workspace.

## Lease Types

- `task`
- `file`
- `folder`

## Lease Fields

- `lease_id`
- `ide_window_id`
- `workspace_id`
- `project_id`
- `task_id`
- `agent_id`
- `tool_id`
- `lease_type`
- `scope`
- `allowed_paths`
- `denied_paths`
- `created_at`
- `expires_at`
- `status`

## Lease Rules

- A lease should describe the smallest useful scope.
- File and folder leases must not silently overlap another tool's active lease.
- Denied paths should be carried alongside the lease so policy checks can fail
  closed.
- Expired leases are not valid for further edits.

## Runtime State

- `.kabeeri/multi_ai_governance/ide_leases.json`
- `.kabeeri/multi_ai_governance/ide_conflicts.json`
