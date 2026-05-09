# Live Dashboard Runtime

The Live Dashboard is a derived runtime view over `.kabeeri` state.

It has two levels:

- current workspace apps: same-product apps inside the current KVDF folder
- linked workspaces: separate KVDF folders for separate products, clients, or release lifecycles

## Commands

```bash
kvdf dashboard state
kvdf dashboard task-tracker
kvdf dashboard export
kvdf dashboard ux
kvdf dashboard serve --port auto
kvdf dashboard serve --port 4177 --workspaces ../store-a,../store-b
kvdf dashboard workspace add --path ../store-a --name "Store A"
kvdf dashboard workspace list
kvdf dashboard workspace remove --path ../store-a
```

## Workspace Sources

Linked workspace summaries can come from:

- `--workspaces ../a,../b`
- `KVDF_WORKSPACES=../a,../b`
- `.kabeeri/dashboard/workspaces.json` through `kvdf dashboard workspace add`

The current workspace is always included.

## Boundary Behavior

The dashboard must make same-product apps and separate KVDF folders visibly different.

Same-product apps are shown in the Applications and App Boundary Governance sections.

Separate KVDF folders are shown in the KVDF Workspaces section and are summarized only. The dashboard does not merge their tasks, policies, costs, or approvals into the current workspace.

## Live API

When served locally, the dashboard exposes:

```text
/__kvdf/dashboard
/__kvdf/api/state
/__kvdf/api/tasks
/__kvdf/api/reports
```

The browser polls the API and reloads when state changes.

## Task Tracker Live JSON

The dashboard writes a focused task tracker JSON file:

```text
.kabeeri/dashboard/task_tracker_state.json
```

This file is derived from `.kabeeri/tasks.json` plus task-adjacent state:

- active task tokens
- active locks
- AI sessions
- app links
- sprint links
- acceptance records
- AI usage by task
- Vibe suggestions and post-work captures linked to tasks

Use it when a VS Code view, local dashboard widget, or external tool needs a
small task board without reading the full dashboard state.

Runtime commands:

```bash
kvdf task tracker
kvdf task tracker --json
kvdf dashboard task-tracker
```

## Live Reports JSON

The dashboard and automation can also read:

```text
.kabeeri/reports/live_reports_state.json
```

Refresh it with:

```bash
kvdf reports live
kvdf reports live --json
```

When served locally, the same derived state is available at:

```text
/__kvdf/api/reports
```

This file keeps readiness, governance, package, upgrade, task tracker, dashboard
UX, security, and migration summaries fresh without editing Markdown reports
after every task.

## UX Governance

`kvdf dashboard ux` audits whether the dashboard is usable as a resume surface for owners, developers, vibe coders, and AI sessions.

It checks the action center, source-of-truth notice, live state, responsive tables, empty states, governance visibility, cost visibility, Vibe/Agile visibility, workspace boundaries, and common secret leakage.

The audit writes:

- `.kabeeri/dashboard/ux_audits.json`
- `.kabeeri/reports/dashboard_ux_report.md`

See `DASHBOARD_UX_GOVERNANCE.md`.

## Decision And AI Run Visibility

The dashboard also surfaces ADR and AI run history because these records help
developers resume without rereading chat history.

It shows:

- total ADRs
- proposed high-impact ADR warnings
- total AI runs
- unreviewed AI runs
- AI run waste signals
- latest AI runs with task, developer, model, tokens, and cost

Use:

```bash
kvdf adr list
kvdf adr report
kvdf ai-run report
kvdf ai-run report --json
```

## Source Of Truth

The dashboard is not source of truth. `.kabeeri` state remains source of truth.
