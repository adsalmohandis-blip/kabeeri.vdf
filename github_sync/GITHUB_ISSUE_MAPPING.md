# GitHub Issue Mapping

Kabeeri task IDs map to GitHub issue numbers through `.kabeeri/github/issue_map.json`.

## Mapping Fields

| Field | Purpose |
| --- | --- |
| `task_id` | Local Kabeeri task identifier. |
| `github_issue_number` | GitHub issue number. |
| `sync_status` | mapped, pending, conflict, closed, or ignored. |
| `last_synced_at` | Last sync time. |
| `conflict` | Manual conflict details if any. |

## Conflict Rules

- If GitHub says closed but Kabeeri task is not Owner verified, mark conflict.
- If Kabeeri task changed scope after GitHub issue creation, require manual review.
- If a task is deleted locally, do not close GitHub automatically.
- If GitHub issue is edited externally, record diff and ask for confirmation before applying locally.
