# Independent Readiness And Governance Reports

Kabeeri provides two standalone reports that can be generated without running
the dashboard, creating a handoff package, or starting a release command.

They read `.kabeeri` state directly and produce Markdown or JSON snapshots for
Owner review, AI agents, CI scripts, VS Code views, and handoff/release notes.

## Readiness Report

Readiness answers:

```text
Can this workspace be shown, handed off, released, or reviewed for publish?
```

```bash
kvdf readiness report
kvdf readiness report --json
kvdf readiness report --target demo
kvdf readiness report --target handoff
kvdf readiness report --target release --strict
kvdf readiness report --target publish --strict --output .kabeeri/reports/readiness_report.md
```

It checks repository validation, task state, feature and journey readiness,
policy blockers, security scan state, migration blockers, handoff packages,
unreviewed AI runs, unresolved post-work captures, and changed files captured
without a linked task. The report now emits explicit action items for each
blocker or warning so the next safe command is visible in the report itself.

## Governance Report

Governance answers:

```text
Is the control model healthy enough for safe development?
```

```bash
kvdf governance report
kvdf governance report --json
kvdf governance report --target workspace
kvdf governance report --target release --strict
kvdf governance report --target publish --strict --output .kabeeri/reports/governance_report.md
```

It checks Owner identity, developers, AI agents, workstreams, active task
tokens, expired tokens, active locks, lock conflicts, missing assignees, unknown
task workstreams, policy blockers, and workspace governance validation. The
report also surfaces actionable items that point at the specific follow-up
command or fix for each blocker class.

## Targets

Supported targets:

```text
workspace
demo
handoff
release
publish
```

The target changes report metadata, interpretation, and next actions. It does
not change the `.kabeeri` source of truth.

## Strict Mode

Use `--strict` when warnings should block the selected review target.

Recommended use:

- daily work: normal mode
- demo: normal mode unless the demo is contractual
- handoff: strict when final client evidence is expected
- release: strict recommended
- publish: strict recommended

## Relationship To Live Reports

Independent reports are review snapshots. Live reports are compact operational
state:

```bash
kvdf reports live
kvdf reports live --json
kvdf reports show readiness
kvdf reports show governance
```

Live reports are written to:

```text
.kabeeri/reports/live_reports_state.json
```

## Source Of Truth

The source of truth remains:

```text
.kabeeri/
```

Reports are derived snapshots. Regenerate after task, policy, security,
migration, AI-run, capture, lock, token, Owner, or workstream changes.
