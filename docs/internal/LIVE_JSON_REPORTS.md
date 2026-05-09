# Live JSON Reports

Kabeeri keeps long Markdown reports for human review, release notes, and
historical traceability. Fast-changing operational status should live in derived
JSON files under `.kabeeri/` instead.

## Why

Live JSON reports reduce repeated manual edits after every task. Codex, VS Code
views, dashboard widgets, scripts, and future UI surfaces can read one compact
state file instead of scanning many Markdown reports.

## Source Of Truth

`.kabeeri` state files remain canonical. Live JSON reports are derived summaries.
If there is a conflict, update the source state or rerun the runtime command;
do not hand-edit the derived report unless debugging.

## Main File

```text
.kabeeri/reports/live_reports_state.json
```

It summarizes readiness, governance, package, upgrade, task tracker, dashboard
UX, security, migration, and next action items.

## Commands

```bash
kvdf reports live
kvdf reports live --json
kvdf reports state
kvdf reports show readiness
kvdf reports show governance
kvdf reports show task_tracker
```

The local dashboard also serves the same state at:

```text
/__kvdf/api/reports
```

## Update Policy

Use live JSON for frequently changing state:

- task tracker
- readiness/governance health
- policy gate status
- security/migration summaries
- dashboard UX status
- package/upgrade state
- action items

Use Markdown for stable human artifacts:

- implementation reports
- historical phase reports
- release notes
- handoff documents
- cleanup audits
- architecture decision explanations

After a feature, prefer refreshing live JSON:

```bash
kvdf reports live
kvdf validate runtime-schemas
```
