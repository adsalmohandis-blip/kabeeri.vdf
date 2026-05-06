# v2.4.0 - Live Technical Dashboard

Goal: show technical delivery status from `.kabeeri` and GitHub sync state.

## State File

`.kabeeri/dashboard/technical_state.json` is a regenerated view.

Suggested top-level shape:

```json
{
  "generated_at": "2026-05-07T00:00:00Z",
  "project_version": "v3.0.0",
  "tasks": {},
  "github": {},
  "branches": [],
  "build": {},
  "tests": {},
  "progress": {},
  "developers": []
}
```

## Sections

| Section | Source |
|---|---|
| Tasks | `.kabeeri/tasks.json` |
| GitHub Issues | `.kabeeri/github/issue_map.json` |
| Branches | Git metadata or GitHub sync output |
| Build status | CLI-generated state |
| Test status | CLI-generated state |
| Database tables | project-specific scan result |
| Backend progress | task/workstream progress |
| Public frontend progress | task/workstream progress |
| Admin frontend progress | task/workstream progress |

## Progress Model

Standard technical progress buckets:

- `backend`
- `public_frontend`
- `admin_frontend`
- `database`
- `docs`
- `testing`

Each bucket should include:

- `status`
- `percent_complete`
- `tasks_total`
- `tasks_done`
- `tasks_blocked`
- `current_owner`
- `last_activity_at`

## Developer Progress

Each developer/agent row should include:

- `developer_id`
- `display_name`
- `role`
- `current_task_id`
- `locks`
- `last_activity_at`
- `status`
- `token_cost_so_far`

## Acceptance Criteria

- Technical dashboard sections are documented.
- Every section has a source file or generation source.
- Developer progress is separated by developer/agent.
- Secrets are excluded.

