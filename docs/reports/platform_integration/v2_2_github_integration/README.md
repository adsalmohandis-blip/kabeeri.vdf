# v2.2.0 - GitHub CLI Integration

Goal: connect Kabeeri local tasks with GitHub Issues, Milestones, Labels, and Releases through CLI-safe workflows.

## Configuration

`.kabeeri/github/sync_config.json` defines the sync boundary.

```json
{
  "repository": "owner/repo",
  "default_branch": "main",
  "dry_run_default": true,
  "write_requires_confirmation": true,
  "sync": {
    "labels": true,
    "milestones": true,
    "issues": true,
    "releases": false
  },
  "conflict_policy": "manual",
  "issue_body_marker": "<!-- kabeeri-task-sync -->"
}
```

## Issue Map

`.kabeeri/github/issue_map.json` links local task IDs to GitHub issue numbers.

```json
{
  "tasks": [
    {
      "task_id": "task-001",
      "issue_number": 12,
      "milestone": "v2.2.0 - GitHub CLI Integration",
      "last_synced_at": "2026-05-07T00:00:00Z",
      "sync_status": "clean"
    }
  ],
  "conflicts": []
}
```

Valid sync statuses:

- `unmapped`
- `clean`
- `local_changed`
- `remote_changed`
- `conflict`
- `archived`

Conflicts must not be auto-resolved. CLI should show the local value, remote value, and suggested resolution, then require explicit approval.

## CLI Commands

```text
kvdf github label sync --dry-run
kvdf github milestone create --from ../milestones_and_issues.v3.0.0.json --dry-run
kvdf github milestone list
kvdf github issue create --task TASK-ID --dry-run
kvdf github issue list
kvdf github issue sync --dry-run
kvdf github release prepare v3.0.0 --dry-run
```

All write commands default to dry-run until the user passes an explicit confirmation option such as `--confirm`.

## Acceptance Criteria

- Sync config is documented.
- Issue mapping schema exists.
- Dry-run is supported for issue, milestone, label, and release operations.
- GitHub UI is optional for basic operation.
