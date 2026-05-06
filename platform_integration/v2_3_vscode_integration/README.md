# v2.3.0 - VS Code Integration Foundation

Goal: make Kabeeri usable from VS Code without making VS Code the source of truth.

## Architecture

```text
VS Code Extension/Webview
  -> invokes kvdf CLI commands
  -> reads generated dashboard state
  -> writes only through CLI-controlled actions
  -> never owns canonical state

kvdf CLI
  -> validates .kabeeri files
  -> updates canonical state
  -> writes audit events
  -> triggers GitHub sync

.kabeeri/
  -> source of truth
```

## Planned Panels

| Panel | Reads From | Purpose |
|---|---|---|
| Tasks | `.kabeeri/tasks.json` | List, filter, inspect, and open tasks. |
| Dashboard | `.kabeeri/dashboard/*.json` | Show technical and business status. |
| Usage | `.kabeeri/ai_usage/*.json*` | Show token usage and cost. |
| GitHub Sync | `.kabeeri/github/*.json` | Show mappings, conflicts, and dry-run results. |

## Command Palette

```text
Kabeeri: Open Dashboard
Kabeeri: Show Tasks
Kabeeri: Verify Task
Kabeeri: Reject Task
Kabeeri: Reopen Task
Kabeeri: Sync GitHub (Dry Run)
Kabeeri: Show Token Usage
Kabeeri: Validate Project State
```

Every command maps to a CLI command. The extension is a UI layer, not a separate execution engine.

## Editor-Agnostic Rule

Any editor integration should use the same contract:

- read `.kabeeri` state files
- call `kvdf` for mutations
- respect owner-only verify
- avoid storing secrets
- avoid creating editor-only state that cannot be reproduced by CLI

## Acceptance Criteria

- VS Code architecture is documented.
- Command palette is documented and CLI-backed.
- Future editor integrations can reuse the same state and command contract.

