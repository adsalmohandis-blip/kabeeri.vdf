# v2.1.0 - Local Project State and Source of Truth

Goal: make Dashboard, CLI, VS Code, and GitHub sync read from a unified local state.

## Source of Truth

The canonical state lives under `.kabeeri/`.

```text
.kabeeri/
  project.json
  tasks.json
  developers.json
  locks.json
  acceptance.json
  audit_log.jsonl
  dashboard/
    technical_state.json
    business_state.json
  github/
    sync_config.json
    issue_map.json
  ai_usage/
    usage_events.jsonl
    usage_summary.json
    pricing_rules.json
    cost_breakdown.json
    sprint_costs.json
```

## File Responsibilities

| File | Responsibility |
|---|---|
| `project.json` | Project identity, version, delivery mode, owner, repository links. |
| `tasks.json` | Canonical task list, status, provenance, assignee, acceptance references. |
| `developers.json` | Developer/agent registry, roles, active status, public metadata. |
| `locks.json` | Task/file/workstream locks and expiration. |
| `acceptance.json` | Acceptance criteria, review recommendations, owner verification state. |
| `audit_log.jsonl` | Append-only record of meaningful project events. |
| `dashboard/technical_state.json` | Regenerated technical dashboard view. |
| `dashboard/business_state.json` | Regenerated business dashboard view. |

Dashboard files are derived views. If they conflict with canonical files, canonical files win.

## Audit Events

`audit_log.jsonl` uses one JSON object per line.

Required event fields:

- `event_id`
- `timestamp`
- `actor_id`
- `actor_role`
- `event_type`
- `entity_type`
- `entity_id`
- `summary`
- `metadata`

Required event types:

- `task.created`
- `task.assigned`
- `task.status_changed`
- `task.verified`
- `task.rejected`
- `task.reopened`
- `lock.created`
- `lock.released`
- `access_token.issued`
- `access_token.revoked`
- `github.sync_started`
- `github.sync_completed`
- `ai_usage.recorded`

## Acceptance Criteria

- `.kabeeri` structure is documented.
- Dashboard state is clearly marked as non-canonical.
- Secrets are excluded from dashboard files.
- Important events are traceable through `audit_log.jsonl`.

