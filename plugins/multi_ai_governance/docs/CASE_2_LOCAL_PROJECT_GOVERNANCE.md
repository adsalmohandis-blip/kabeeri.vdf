# Case 2 Local Project Governance

Case 2 governs AI and automation activity across the whole local project on the
same machine, not just a single IDE window.

## Scope

This layer covers:

- multiple IDE windows
- multiple IDEs
- terminal sessions
- local AI agents
- local scripts
- local CLI runs

## Authority

- `multi_ai_governance` is the authority layer
- `.kabeeri` is the local runtime source of truth
- Git remains the source-control source of truth
- `ai_tool_adapters` is a translator boundary, not the authority

## Identity Model

The Case 2 registry records:

- `machine_id`
- `project_id`
- `repo_root`
- `runtime_root`
- `git_remote`
- `default_branch`
- `current_branch`
- `owner_id`
- `created_at`
- `last_seen_at`
- `status`

Local clients and sessions are tracked separately from IDE-window state so the
project-wide view stays stable even when tools come from different editors or
terminals.

## Reuse From Case 1

Case 2 reuses Case 1 where helpful:

- a local client may reference an IDE window when that is the origin
- a local policy decision may reference an IDE lease as supporting evidence
- audit and approval records use the same machine-readable pattern

## Runtime Files

Case 2 writes to the following `.kabeeri/multi_ai_governance/` files:

- `local_project.json`
- `local_machine.json`
- `local_clients.json`
- `local_sessions.json`
- `local_heartbeats.json`
- `local_leases.json`
- `local_conflicts.json`
- `local_ungoverned_changes.json`
- `local_policy_decisions.json`
- `local_approval_requests.json`
- `local_audit_log.json`

## Commands

Case 2 is exposed through the same `multi-ai` surface:

- `kvdf multi-ai local status`
- `kvdf multi-ai local register`
- `kvdf multi-ai local client status`
- `kvdf multi-ai local client register`
- `kvdf multi-ai local session status`
- `kvdf multi-ai local session register`
- `kvdf multi-ai local heartbeat`
- `kvdf multi-ai local lease status`
- `kvdf multi-ai local lease create`
- `kvdf multi-ai local release`
- `kvdf multi-ai local conflicts`
- `kvdf multi-ai local scan`
- `kvdf multi-ai local policy check`

## Out Of Scope

Case 2 does not include:

- Wi-Fi/LAN governance
- GitHub repo governance
- cloud governance
- a new plugin
- duplicate authority outside `multi_ai_governance`
