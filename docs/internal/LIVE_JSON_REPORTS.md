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

The command registry follows the same rule: the registry code and command help
describe the behavior, while the live JSON reports summarize the current state
of that behavior. Use the command registry and the operating contract as the
source of truth, then read live reports to see what is active right now.

Historical Markdown reports stay useful for narrative context, but they are not
the active execution state. Use them to explain why a decision happened, not to
replace the live state that the CLI and dashboard should read.

When a historical report and a live report disagree, the fix is to update the
source state and regenerate the derived surface, not to treat the historical
report as the runtime record.

The live report family should also stay aligned with the capability map and
command metadata. If a capability adds new live state, keep the report surface
concise and let the human docs explain the workflow in full.

## Main File

```text
.kabeeri/reports/live_reports_state.json
```

It summarizes readiness, governance, package, upgrade, task tracker, dashboard
UX, security, migration, and next action items. Readiness and governance
snapshots now include explicit actionable blocker lists so the next command is
visible without rereading the raw state files. Vibe context briefs are also
compiled as reusable artifacts with product, UI/UX, system, and data sections
so the next session can resume from one structured brief instead of re-reading
the whole history.

Task archival state is part of the live report family too. When tasks complete,
move into trash, or get restored, the live report surface should show the
archive trail and the unfinished dependent work so the next operator can see
both history and the next exact action in one place.

For scorecard-linked Evolution work, the same live report family also carries
the active readiness/governance slices and their unfinished dependent work so
the next operator can resume the queue without reconstructing the backlog from
chat history.

For AI usability work, these live reports should make the update state and the
remaining dependent work obvious in one glance, so an assistant can resume the
governed loop from the report instead of rereading the whole history.

Historical Markdown reports are still useful for narrative context, but they
should not be treated as the active execution state. Live JSON should point to
the next exact action; Markdown should explain how the state got there.

That includes the docs-consistency slice, which keeps the live report surface
aligned with the CLI command metadata and the source-of-truth documentation
without forcing operators to cross-check multiple Markdown files by hand.

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
- actionable blockers and next-command hints

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
