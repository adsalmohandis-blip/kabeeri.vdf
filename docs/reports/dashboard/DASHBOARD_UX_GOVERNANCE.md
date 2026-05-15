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
kvdf dashboard state
kvdf dashboard serve --port auto
kvdf dashboard workspace add --path ../store-a --name "Store A"
kvdf validate dashboard
```

The command:

- refreshes dashboard state
- evaluates the generated dashboard HTML and state
- writes `.kabeeri/dashboard/ux_audits.json`
- writes `.kabeeri/reports/dashboard_ux_report.md`
- records an audit event

## Workspace Model

Dashboard UX Governance supports two operating models:

1. Multiple related apps in one KVDF workspace.
   Use this when the apps are one product, such as a Laravel backend, Blade storefront, admin panel, worker, or mobile app for the same store. These apps appear in Applications, App Boundary Governance, Workstreams, Task Tracker, and app filters.

2. Multiple KVDF workspaces.
   Use this when the developer works on separate products, clients, repositories, or release lifecycles. These folders are linked as summaries through `--workspaces`, `KVDF_WORKSPACES`, or `kvdf dashboard workspace add`. Their source state is never merged into the current workspace.

The dashboard must always make this distinction visible. A user should not confuse "four apps in one product" with "four unrelated projects".

## Role Visibility

Role visibility is guidance for what each person or AI should inspect first. It does not replace `.kabeeri` permissions or policy gates.

| Role | Primary widgets | Allowed dashboard behavior |
| --- | --- | --- |
| Owner | Action Center, Policy Results, Security Scans, Migration Safety, Handoff, AI cost | approve, reject, verify, request evidence |
| Maintainer | Task Tracker, Workstream Governance, Execution Scopes, Live Reports | triage, assign, review, prepare handoff |
| Developer | Assigned tasks, Active Locks, Execution Scopes, Post-work Captures | continue scoped work, attach evidence, avoid locked paths |
| AI Agent | Task Tracker, Execution Scopes, Common Prompt Layer, AI Usage | read context, obey token scope, report changed files and usage |
| QA Reviewer | Feature Readiness, User Journeys, Security, Migration | validate acceptance evidence and risks |
| Client Viewer | Client home, Applications, Feature Readiness, User Journeys, Handoff | review visible readiness without internal controls |

## Widget Registry Rules

Every dashboard widget should have:

- a stable name
- intended roles
- purpose
- source files
- empty state
- next action
- risk if hidden

Use `DASHBOARD_WIDGET_SPEC_TEMPLATE.md` before adding new widgets.

## Live State UX Rules

- Served dashboards poll `/__kvdf/api/state`.
- Static exports remain readable without a server.
- `generated_at` must stay visible.
- Stale data must not pretend to be live.
- Empty sections must say what to run next.
- Linked workspaces are summaries only.
- App filters only filter apps inside the current KVDF workspace.

## Controls

Required dashboard controls:

- app filter for current-workspace apps
- role guidance filter or role visibility table
- linked workspace summary table
- live API status indicator
- responsive table wrapping
- clear generated/export timestamp

Future controls can include saved views and date ranges, but they must remain derived from `.kabeeri` state.

## Governance Checks

The audit checks:

- source-of-truth notice: dashboard says `.kabeeri` remains the source of truth
- action center: high-signal next actions appear near the top
- live status: local dashboard exposes `/__kvdf/api/state`
- responsive tables: wide tables can scroll on small screens
- empty states: empty sections do not render broken placeholder rows
- workspace boundary clarity: same-product apps and linked KVDF workspaces are visibly different
- dashboard UX governance: the dashboard shows role visibility, widget registry, controls, and workspace strategy
- multi-app/multi-workspace strategy: one product workspace is separated from linked workspace summaries
- live state UX rules: live refresh, stale/static export behavior, and empty/error rules are visible
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
- `docs/cli/CLI_COMMAND_REFERENCE.md`
