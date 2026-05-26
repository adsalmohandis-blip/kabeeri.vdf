# Case 2 Local Leases

Local leases protect the whole project across IDEs, terminals, scripts, and
local AI sessions.

## Lease Types

- `task`
- `file`
- `folder`
- `branch`

## Lease Fields

Each local lease can record:

- `lease_id`
- `machine_id`
- `project_id`
- `client_id`
- `session_id`
- `agent_id`
- `tool_id`
- `task_id`
- `lease_type`
- `scope`
- `allowed_paths`
- `denied_paths`
- `branch`
- `created_at`
- `expires_at`
- `status`

## Conflict Detection

The local lease layer detects:

- same-file conflicts across clients
- same-task conflicts without shared permission
- same-branch conflicts for different tasks
- denied-path conflicts
- expired lease usage
- ungoverned local changes

## Runtime Files

- `.kabeeri/multi_ai_governance/local_leases.json`
- `.kabeeri/multi_ai_governance/local_conflicts.json`
- `.kabeeri/multi_ai_governance/local_ungoverned_changes.json`

## Commands

- `kvdf multi-ai local lease status`
- `kvdf multi-ai local lease create`
- `kvdf multi-ai local release`
- `kvdf multi-ai local conflicts`
- `kvdf multi-ai local scan`
