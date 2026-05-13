# VS Code Command Palette Plan

| Command | CLI Equivalent | Notes |
| --- | --- | --- |
| Kabeeri: Open Dashboard | `kvdf dashboard serve` | Opens local dashboard/private route. |
| Kabeeri: Export Dashboard | `kvdf dashboard export` | Writes derived static dashboard files. |
| Kabeeri: GitHub Integration Report | `kvdf github report --json` | Read-only trace surface for GitHub sync state. |
| Kabeeri: VS Code Integration Report | `kvdf vscode report --json` | Read-only trace surface for the editor bridge. |
| Kabeeri: Sync GitHub Dry Run | `kvdf github issue sync --dry-run` | Safe default. |
| Kabeeri: Verify Task | `kvdf task verify TASK-ID --owner OWNER-ID` | Owner-only. |
| Kabeeri: Reject Task | `kvdf task reject TASK-ID --reason` | Requires reason and audit event. |
| Kabeeri: Show Token Usage | `kvdf usage summary` | Reads `.kabeeri/ai_usage`. |
| Kabeeri: Scaffold Workspace | `kvdf vscode scaffold` | Creates helper files. |

## UX Rules

- Show Owner-only actions disabled for non-owner sessions.
- Show dry-run preview before GitHub writes.
- Show dashboard data as derived state.
