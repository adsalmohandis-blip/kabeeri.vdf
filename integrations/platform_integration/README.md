# Platform Integration

This folder is now a historical roadmap and plan-inspection source for platform
integration.

The active runtime and product documentation has moved to:

- `cli/CLI_COMMAND_REFERENCE.md`
- `dashboard/LIVE_DASHBOARD_RUNTIME.md`
- `github_sync/`
- `vscode_extension/`
- `governance/`
- `ai_cost_control/`

## Core Rule

`.kabeeri/` is the source of truth.

Dashboards, VS Code panels, GitHub Issues, and CLI output are views or sync targets. They must not become the canonical project state.

## Merged Runtime Status

The old `v2_*` planning folders have been merged conceptually into current
runtime documentation:

| Historical folder | Current reference |
| --- | --- |
| `v2_1_local_state/` | `.kabeeri/`, `src/cli/workspace.js`, `kvdf init` |
| `v2_2_github_integration/` | `github_sync/`, `github/`, `kvdf github` |
| `v2_3_vscode_integration/` | `vscode_extension/`, `kvdf vscode` |
| `v2_4_technical_dashboard/` | `dashboard/LIVE_DASHBOARD_RUNTIME.md`, `kvdf dashboard` |
| `v2_5_business_dashboard/` | `kvdf feature`, `kvdf journey`, dashboard state |
| `v2_6_owner_verify/` | `governance/`, `kvdf owner`, `kvdf task verify` |
| `v2_7_token_costs/` | `ai_cost_control/`, `kvdf pricing`, `kvdf usage` |
| `v2_8_sprint_analytics/` | `agile_delivery/`, `kvdf sprint`, AI usage summaries |
| `v3_0_release/` | `kvdf release`, `docs/production/` |

Keep the milestone JSON file for `kvdf plan` inspection. Do not treat the
historical `v2_*` folders as active product documentation.

## Planned Labels

| Label | Color | Description |
|---|---:|---|
| `delivery-mode` | `#5319E7` | Delivery modes: Structured and Agile |
| `structured-delivery` | `#0075CA` | Structured/sequential delivery |
| `agile` | `#0E8A16` | Backlog, sprint, and story work |
| `project-intake` | `#1D76DB` | New or adopted project intake |
| `task-governance` | `#D93F0B` | Task creation and management rules |
| `provenance` | `#FBCA04` | Task source tracing |
| `ai-usage` | `#7057FF` | AI token usage and cost records |
| `dashboard` | `#C5DEF5` | Project dashboard work |
| `github` | `#0075CA` | GitHub integration |
| `vscode` | `#5319E7` | VS Code integration |
| `cli` | `#5319E7` | CLI commands |
| `permissions` | `#D93F0B` | Roles and permissions |
| `token-access` | `#B60205` | Access token lifecycle |
| `priority-high` | `#B60205` | High priority |
| `priority-medium` | `#FBCA04` | Medium priority |
| `good-first-issue` | `#7057FF` | Good first contributor task |
| `owner-verify` | `#B60205` | Owner-only final verification |
| `business-dashboard` | `#0E8A16` | Business status and value dashboard |
| `technical-dashboard` | `#0075CA` | Technical progress dashboard |
| `cost-analytics` | `#FBCA04` | Token cost analytics |

## Milestones

| Milestone | Issues | Goal |
|---|---:|---|
| `v2.1.0 - Local Project State and Source of Truth` | 3 | Make Dashboard, CLI, and GitHub read from one local state. |
| `v2.2.0 - GitHub CLI Integration` | 3 | Sync Kabeeri tasks with GitHub Issues and Milestones. |
| `v2.3.0 - VS Code Integration Foundation` | 3 | Run Kabeeri from VS Code through CLI and panels. |
| `v2.4.0 - Live Technical Dashboard` | 3 | Show technical development status from `.kabeeri` and GitHub sync. |
| `v2.5.0 - Business Dashboard` | 3 | Show product capabilities, value, user journey, and audience. |
| `v2.6.0 - Owner-Only Task Verification` | 3 | Prevent final task completion without Owner verification. |
| `v2.7.0 - AI Token Cost Dashboard` | 4 | Turn AI token usage into pricing and quality analytics. |
| `v2.8.0 - Agile Sprint Cost Analytics` | 3 | Price and learn from each sprint increment. |
| `v3.0.0 - Stable Platform Integration Release` | 3 | Stabilize GitHub, VS Code, dashboards, verify, and token analytics. |

Total: 9 milestones, 28 issues.

## Historical Files

- [V3_0_UPDATED_PLAN.md](V3_0_UPDATED_PLAN.md) - human-readable planning document.
- [milestones_and_issues.v3.0.0.json](milestones_and_issues.v3.0.0.json) - machine-readable GitHub planning source.
- [v2_1_local_state/README.md](v2_1_local_state/README.md) - local source-of-truth files.
- [v2_2_github_integration/README.md](v2_2_github_integration/README.md) - GitHub sync configuration and CLI commands.
- [v2_3_vscode_integration/README.md](v2_3_vscode_integration/README.md) - VS Code extension architecture.
- [v2_4_technical_dashboard/README.md](v2_4_technical_dashboard/README.md) - technical dashboard state.
- [v2_5_business_dashboard/README.md](v2_5_business_dashboard/README.md) - business dashboard state.
- [v2_6_owner_verify/README.md](v2_6_owner_verify/README.md) - owner-only verify flow.
- [v2_7_token_costs/README.md](v2_7_token_costs/README.md) - AI token cost analytics.
- [v2_8_sprint_analytics/README.md](v2_8_sprint_analytics/README.md) - sprint cost analytics.
- [v3_0_release/README.md](v3_0_release/README.md) - v3.0.0 release checklist and notes.
