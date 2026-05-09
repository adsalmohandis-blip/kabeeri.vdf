# Dashboard UX Governance

Dashboard UX Governance keeps the private dashboard useful as an operational cockpit, not just a long HTML dump of project state.

The feature is useful for Kabeeri, Codex, and vibe developers because it answers the first resume question quickly:

```text
What should I look at next, and is the dashboard itself trustworthy enough to guide me?
```

## Runtime Command

```bash
kvdf dashboard ux
kvdf dashboard ux --json
kvdf validate dashboard
```

The command:

- refreshes dashboard state
- evaluates the generated dashboard HTML and state
- writes `.kabeeri/dashboard/ux_audits.json`
- writes `.kabeeri/reports/dashboard_ux_report.md`
- records an audit event

## Governance Checks

The audit checks:

- source-of-truth notice: dashboard says `.kabeeri` remains the source of truth
- action center: high-signal next actions appear near the top
- live status: local dashboard exposes `/__kvdf/api/state`
- responsive tables: wide tables can scroll on small screens
- empty states: empty sections do not render broken placeholder rows
- workspace boundary clarity: same-product apps and linked KVDF workspaces are visibly different
- governance visibility: policy, security, and migration blockers are visible
- cost visibility: tracked and untracked AI usage are visible
- Vibe visibility: suggestions and post-work captures are visible
- Agile visibility: Agile stories and sprint reviews are visible
- common secret leakage: generated dashboard HTML is scanned for common secret patterns

## Action Center

The dashboard now renders an Action Center before detailed tables.

Action items are derived from runtime state:

- blocked policies
- blocked security scans
- blocked migration checks
- unresolved post-work captures
- ready Agile stories that are not converted into tasks
- active locks
- active task tokens
- untracked AI cost

This helps a returning developer or AI session avoid reading every table before choosing the next safe action.

## Status Model

`kvdf dashboard ux` returns:

- `pass`: no high-impact dashboard UX blockers detected
- `needs_attention`: at least one weighted UX check failed or operational blockers are visible

The status does not mean the project is ready to publish. It only says whether the dashboard experience is clear and safe enough to guide work.

## Source Of Truth Rule

Dashboard UX issues should usually be fixed in source state first.

Examples:

- Wrong task count: fix `.kabeeri/tasks.json` or the task command that wrote it.
- Missing post-work evidence: resolve the capture record.
- Blocked policy: resolve the policy blocker or record an Owner override.
- Broken layout or missing empty state: fix dashboard rendering.

## Related Docs

- `dashboard/LIVE_DASHBOARD_RUNTIME.md`
- `dashboard/TECHNICAL_DASHBOARD_SPEC.md`
- `dashboard/BUSINESS_DASHBOARD_SPEC.md`
- `cli/CLI_COMMAND_REFERENCE.md`
