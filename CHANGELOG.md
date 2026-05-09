# Changelog

## [0.2.0] — Release 2

### Added

- Added the first executable `kvdf` CLI implementation with Node.js and no external runtime dependencies.
- Added local workspace initialization for `.kabeeri/` state files.
- Added validation for core repository files, generator JSON, prompt pack manifests, v3/v4 planning files, and local workspace state.
- Added CLI commands for generators, prompt packs, examples, questionnaires, v3/v4 plans, tasks, acceptance records, developers, AI agents, locks, task tokens, dashboard state generation, and GitHub dry-run/spec mode.
- Added smoke test script through `npm run test:smoke`.
- Added GitHub dry-run planning output for labels, milestones, issues, and release preparation.
- Added release check, release notes, and release checklist generation from v3/v4 planning files.
- Added AI usage recording, listing, summary rollups, cost breakdown files, and task budget warnings.
- Added workspace governance validation for single Owner, duplicate identities, active lock conflicts, audit JSONL, and AI usage JSONL.
- Added static dashboard export and a built-in local dashboard server.
- Added live dashboard refresh for the local private dashboard served at `/__kvdf/dashboard`, with multi-app summaries and optional linked KVDF workspace summaries.
- Added final verification report generation when a task is Owner-verified.
- Added project skeleton generation from `generators/*.json`.
- Added prompt pack export into local project folders.
- Added confirmed GitHub writes for label, milestone, issue, and release sync through GitHub CLI (`gh`), protected by `--confirm`.
- Added issue sync persistence into `.kabeeri/github/issue_map.json` when a workspace exists.
- Added local Owner auth with passphrase hashing, Owner login/logout/status, expiring sessions, and Owner-session enforcement for task verification when auth is configured.
- Added AI pricing rule management and automatic usage cost calculation when `--cost` is omitted.
- Added policy gates for task verification, release publish readiness, handoff readiness, security scan status, and migration safety, with audited Owner overrides, reports, and dashboard policy status.
- Added `kvdf policy status`, `kvdf validate policy`, and policy schema files for stronger policy-gate resume checks.
- Added `github_write_policy` to block confirmed GitHub write operations before any `gh` command runs.
- Added App Boundary Governance with app type/path/product metadata, app-scoped tasks, cross-app integration enforcement, session file boundary checks, validation, and documentation.
- Added Live Dashboard linked workspace registry, app boundary visibility, and clearer same-product-app versus separate-KVDF-workspace summaries.
- Added Solo Developer Mode with `kvdf developer solo`, developer mode validation, dashboard visibility, and documentation.
- Added Workstream Governance Runtime with `.kabeeri/workstreams.json`, `kvdf workstream` commands, known-workstream task enforcement, session file boundary checks, dashboard rollups, validation, and documentation.
- Added Execution Scope Governance tying task access tokens to app and workstream boundaries, with automatic token scopes, broad-scope blocking, dashboard visibility, and consolidated documentation.
- Added optional Vibe-first runtime commands (`kvdf vibe`, `kvdf ask`, `kvdf capture`) with intent records, suggested task cards, post-work captures, task conversion, dashboard visibility, and documentation.
- Expanded Vibe-first runtime with planning splits, Vibe sessions, compact context briefs, next-action recommendations, and dashboard visibility for lower-token team handoffs.
- Expanded post-work capture into a full lifecycle with git/manual changed-file details, scan previews, task matching, evidence updates, link/convert/reject/resolve commands, capture validation, missing-evidence tracking, and dashboard next actions.
- Added Agile Templates Runtime with `.kabeeri/agile.json`, backlog/epic/story/sprint planning/sprint review commands, story-to-task conversion, Agile validation, dashboard visibility, and documentation.
- Expanded Agile into a Scrum-grade operational runtime with stricter Definition of Ready checks, impediments, retrospectives, velocity/forecast health, `.kabeeri/dashboard/agile_state.json`, and `/__kvdf/api/agile`.
- Added Structured Delivery Runtime for Waterfall-style enterprise delivery with approved requirements, phases, deliverables, risks, change requests, phase gates, traceability, `.kabeeri/structured.json`, `.kabeeri/dashboard/structured_state.json`, and `/__kvdf/api/structured`.
- Added Delivery Mode Advisor with `kvdf delivery recommend`, `kvdf delivery choose`, and `.kabeeri/delivery_decisions.json` so Kabeeri/Codex can suggest Agile or Structured from the requested application context while leaving the final decision to the developer.
- Added Product Blueprint Catalog with `kvdf blueprint` commands and `.kabeeri/product_blueprints.json` so Kabeeri/Codex can map market systems to channels, backend modules, frontend pages, database entities, workstreams, and risks before task creation.
- Added Data Design Blueprint with `kvdf data-design` commands and `.kabeeri/data_design.json` so Kabeeri/Codex can design database models from business workflow, modules, entities, constraints, snapshots, audit, indexes, transactions, idempotency, and migration safety.
- Added UI/UX Advisor under `kvdf design recommend` with `.kabeeri/design_sources/ui_advisor.json` so Kabeeri/Codex can choose frontend experience patterns, stacks, component groups, page templates, SEO/GEO rules, dashboard rules, and mobile UX rules from the selected product blueprint.
- Added Repository Foldering System with `standard_systems/REPOSITORY_FOLDERING_MAP.json`, `docs/architecture/REPOSITORY_FOLDERING_SYSTEM.md`, `kvdf structure`, and `kvdf validate foldering` to organize Kabeeri's growing root folders into stable core, knowledge, packs, integrations, contracts, docs, quality, and runtime-state groups.
- Added adaptive questionnaire intake planning with `kvdf questionnaire plan`, combining Product Blueprints, framework prompt packs, Data Design, UI/UX Advisor, and Delivery Mode Advisor into focused developer questions stored in `.kabeeri/questionnaires/adaptive_intake_plan.json`.
- Added user-language runtime behavior for adaptive intake so generated plans record input/output language and follow the user's language unless explicitly overridden.
- Added init-time guided intake: interactive `kvdf init` can ask for the application goal, while `kvdf init --goal "..."` creates adaptive questions and docs-first tasks in non-interactive flows.
- Added a docs-first gate so implementation tasks cannot start while init-generated project documentation tasks are still open.
- Added Evolution Steward with `.kabeeri/evolution.json`, `kvdf evolution`, impact plans, follow-up task generation, dashboard/live reports visibility, schema coverage, and capability documentation for governing Kabeeri's own updates.
- Added the SaaS product branch foundation with `apps/saas/`, a dependency-free hosted dashboard preview, API health/workspace endpoints, SaaS architecture docs, and branch-specific roadmap.
- Added automatic generator governance tasks inside initialized workspaces so Next.js/Laravel or other skeleton generation cannot silently bypass the task tracker.
- Added non-task AI usage buckets through `kvdf usage inquiry`, `kvdf usage admin`, `kvdf usage question`, `kvdf usage planning`, and `kvdf usage docs`.
- Improved live dashboard refresh artifacts for task tracker, usage summaries, generated scaffold tasks, and dashboard section explanations.
- Strengthened readiness reporting for ungoverned post-work captures and clarified that warning-only readiness with open tasks is not a hard blocker.
- Added Dashboard UX Governance with `kvdf dashboard ux`, action center rendering, responsive/empty-state dashboard checks, UX audit reports, and dashboard validation support.
- Added `docs/SYSTEM_CAPABILITIES_REFERENCE.md` as the central capability map for CLI, Vibe-first, governance, dashboards, AI cost control, design governance, and release workflows.
- Extracted completed `codex_commands/` knowledge into `docs/internal/AI_DEVELOPMENT_WORKFLOW.md`, added a completion report, and removed the temporary command-pack folder from the product capability surface.
- Added cost-aware AI execution commands for task context packs, preflight estimates, and model route recommendations.
- Added client and Owner handoff package generation with business, technical, feature readiness, publish status, AI cost, and next roadmap reports.
- Added Security / Secrets Governance with local secret scanning, Markdown reports, security gate blocking, and dashboard scan status.
- Added Migration Safety with dry-run migration plans, rollback plans, checks, reports, audit events, and dashboard migration status.
- Added CLI integration test suite covering workspace init, Owner auth, task verify, pricing, AI usage, dashboard export, generators, prompt pack export, and GitHub dry-runs.
- Added GitHub Actions CI workflow for Node 20 test execution.
- Added local sprint management and sprint cost summaries linked to tasks and AI usage.
- Added AI Developer session tracking with session handoff report generation and validation.
- Added role-based permission enforcement for governed workspaces, including reviewer independence and actor checks.
- Added task access token expiry checks and allowed/forbidden file scope enforcement for AI session handoffs.
- Added `kvdf create --profile <name>` as a shortcut for project skeleton generation.
- Added command-specific help for common CLI groups, terminal-friendly command aliases, and typo suggestions for unknown commands.
- Implemented `questionnaire create`, `prompt-pack use`, `acceptance review`, and real `validate task` / `validate acceptance` checks.
- Implemented Owner transfer lifecycle commands with one-use transfer tokens and single Owner role migration.
- Implemented stronger lock conflict prevention for overlapping file and folder scopes.
- Implemented budget overrun approval commands and optional enforcement for guarded task tokens.
- Implemented workstream assignment governance and explicit integration-task rules for cross-workstream tasks.
- Enforced real task lookup, governed assignee matching, and explicit assignment before governed AI session execution.
- Added untracked AI usage recording and dashboard visibility for random/ad-hoc prompt cost.
- Added VS Code workspace scaffolding for common KVDF commands.
- Added audit list/report commands.
- Added `kvdf app` customer app management with public `username` routes and validation that rejects numeric customer app URLs like `/customer/apps/3`.
- Added detailed command help for sprint, session, acceptance, developer, agent, lock, pricing, usage, and release commands.
- Added first runtime `kvdf design` commands for design source intake, snapshots, approval, rejection, and audit gating.
- Added runtime design text spec creation, text spec approval, and missing design report records.
- Added runtime page spec and component contract records for approved design text specs.
- Added Design Governance visual acceptance runtime with visual review records, design gates, validation, and screenshot evidence before frontend visual verification.
- Added ADR and AI Run History runtime with `kvdf adr`, `kvdf ai-run`, accepted/rejected AI output records, waste signals, validation, dashboard visibility, and project intelligence documentation.
- Added Common Prompt Layer with `prompt_packs/common/`, `kvdf prompt-pack compose`, prompt composition records, validation, dashboard visibility, and shared scope/review/AI-run rules for all stack prompt packs.
- Added Runtime Schema Registry with `schemas/runtime/`, `.kabeeri` JSON/JSONL mappings, `kvdf validate runtime-schemas`, and full validation coverage for runtime state drift.
- Consolidated task governance by removing the old `task_governance/` pointer and keeping policy in `governance/TASK_GOVERNANCE.md` while `task_tracking/` remains the schema/template home.
- Added independent `kvdf readiness report` and `kvdf governance report` commands with Markdown/JSON output for standalone readiness and governance reviews.
- Strengthened release and GitHub publish gates so confirmed GitHub release publishing must pass both `release_policy` and `github_write_policy` before any `gh` write runs.
- Added product packaging and upgrade support with `package.json` package file coverage, `npm run pack:check`, `kvdf package check`, `kvdf upgrade check`, and production packaging/upgrade guides.
- Added the React Native Expo prompt pack with Expo-specific mobile prompts, manifest, export/compose support, safety rules for secrets/native permissions/EAS handoff, and CLI integration tests.
- Added bilingual documentation parity for the Arabic and English docs: matching 01-20 canonical topic files, Arabic/English indexes, and a bilingual maintenance guide.
- Added focused Task Tracker live JSON for dashboards and editor surfaces through `.kabeeri/dashboard/task_tracker_state.json`, `kvdf task tracker`, `kvdf dashboard task-tracker`, and `/__kvdf/api/tasks`.
- Added Live Reports JSON for fast-changing readiness, governance, package, upgrade, task tracker, dashboard UX, security, and migration summaries through `.kabeeri/reports/live_reports_state.json`, `kvdf reports live`, and `/__kvdf/api/reports`.
- Changed dashboard export/serve so the customer-facing page is public at `/`, app pages use `/customer/apps/<username>`, and the technical dashboard is kept on `/__kvdf/dashboard`.
- Added live dashboard state output through `kvdf dashboard state` and the local `/__kvdf/api/state` endpoint.
- Added local VS Code Webview extension scaffolding under `.vscode/kvdf-extension`.
- Added v5.0.0 project intelligence planning, including the adaptive questionnaire flow and 53-area system capability map.
- Implemented adaptive questionnaire runtime commands for answers, coverage matrix generation, missing-answer reports, and provenance task generation.
- Added project memory runtime commands for decisions, assumptions, constraints, risks, and deferred features.
- Added business feature readiness and user journey models with dashboard and validation support.
- Added local GitHub sync configuration commands.
- Made release checks run real repository validation and support strict failure mode.
- Enforced acceptance evidence before Owner verification.
- Enforced active lock coverage for governed AI session file changes.
- Added usage cost report export and developer efficiency analysis.
- Added v4 Multi-AI scenario review reports.
- Added limited task token reissue flow after Owner rejection.

### Notes

- This is the first real runtime slice. It now includes confirmed GitHub CLI writes, local VS Code extension scaffolding, live dashboard state, and role/session enforcement for governed workspaces.

---

## [Unreleased] — v4.0.0 Multi-AI Governance Plan

### Added

- Added the v4.0.0 updated planning track for Multi-AI Developer Governance, single Owner authority, scoped access tokens, locks, budgets, and audit reports.
- Added `multi_ai_governance/` as the documentation home for the 9 milestones and 28 planned GitHub issues.
- Added machine-readable GitHub planning source at `multi_ai_governance/milestones_and_issues.v4.0.0.json`.
- Added governance specs for collaboration identity, role permissions, workstream ownership, Owner transfer, task tokens, conflict locks, assignment flow, AI session output contracts, token budgets, and final verification audit reports.

### Changed

- Extended the roadmap with the v3.1.0 through v4.0.0 Multi-AI Governance track.

---

## [Unreleased] — v3.0.0 Platform Integration Plan

### Added

- Added the v3.0.0 updated planning track for GitHub CLI, VS Code, live dashboards, Owner Verify, and AI token cost analytics.
- Added `platform_integration/` as the documentation home for the 9 milestones and 28 planned GitHub issues.
- Added machine-readable GitHub planning source at `platform_integration/milestones_and_issues.v3.0.0.json`.
- Added local `.kabeeri/` source-of-truth specification, dashboard state rules, GitHub sync rules, VS Code integration rules, owner-only verification rules, token cost dashboard rules, and sprint cost analytics rules.

### Changed

- Updated the roadmap so v2.1.0 through v3.0.0 now represent the Stable Platform Integration path instead of a generic future app/SaaS track.

---

## [1.5.0] — AI Usage Accounting Foundation

**Released:** May 2026

### Added

- **AI Usage Accounting System**
  - New `.kabeeri/ai_usage/` folder specification
  - AI usage event schema (`usage_events.jsonl`)
  - Pricing rules schema (user-configurable, not hard-coded)
  - Cost breakdown and sprint cost tracking
  - Untracked AI usage rules and monitoring

- **AI Token Tracking**
  - Per-task token estimation and tracking
  - Per-sprint cost accumulation
  - Provider-agnostic token counting
  - Rework cost separation from clean work
  - Budget forecasting capabilities

### Key Features

- Enable AI cost accounting from day 1
- Track Structured and Agile token usage uniformly
- Support for untracked exploration/learning budget
- Foundation for future dashboards and analytics

### Files Added

- [ai_cost_control/README.md](ai_cost_control/README.md)

---

## [1.4.0] — Agile Delivery Core and Sprint Cost Metadata

**Released:** May 2026

### Added

- **Agile Delivery Foundation**
  - Product backlog management concepts
  - Epic and user story definitions
  - Sprint planning and review processes
  - Sprint-based task execution
  - Velocity tracking and capacity planning

- **Sprint Metrics**
  - Story points for estimation
  - Velocity tracking (points per sprint)
  - Burndown concepts
  - Defect rate and rework metrics
  - Cost per point calculation

- **Integration with Task Governance**
  - User stories follow task governance rules
  - Acceptance criteria enforcement in stories
  - Source tracing for Agile mode
  - Definition of Ready for sprint tasks

### Key Features

- Agile mode fully operable with sprints
- Backlog prioritization (MoSCoW method)
- Sprint ceremonies documented (planning, standup, review, retro)
- Cost tracking per sprint and per story

### Files Added

- [agile_delivery/SPRINT_AND_BACKLOG_CORE.md](agile_delivery/SPRINT_AND_BACKLOG_CORE.md)

---

## [1.3.0] — Task Creation Governance and Provenance

**Released:** May 2026

### Added

- **Strict Task Governance Rules**
  - Required fields for every task
  - Task validation rules
  - Roles and permissions matrix
  - Task state machine and transitions
  - Prohibited task patterns

- **Task Definition of Ready (DoR)**
  - Comprehensive readiness checklist
  - Pre-development requirements
  - Blocker identification
  - Type-specific DoR (feature/bug/tech-debt/documentation/security)

- **Task Provenance & Source Tracing**
  - 12 valid source types (questionnaire, bug_report, user_story, etc.)
  - 5 source modes (direct, indirect, derived, suggested, required)
  - Provenance chain documentation
  - Source validation rules
  - Tracing tasks back to original decisions

### Key Features

- Every task must have a source (no random tasks)
- Every task must be "ready" before execution
- Clear governance prevents task chaos
- Applies to both Structured and Agile modes
- AI-suggested tasks require approval before execution

### Files Added

- [governance/TASK_GOVERNANCE.md](governance/TASK_GOVERNANCE.md)
- [task_tracking/README.md](task_tracking/README.md)
- [task_tracking/TASK_CREATION_RULES.md](task_tracking/TASK_CREATION_RULES.md)
- [task_tracking/TASK_INTAKE_TEMPLATE.md](task_tracking/TASK_INTAKE_TEMPLATE.md)
- [task_tracking/TASK_DEFINITION_OF_READY.md](task_tracking/TASK_DEFINITION_OF_READY.md)
- [task_tracking/TASK_SOURCE_RULES.md](task_tracking/TASK_SOURCE_RULES.md)

---

## [1.2.0] — Project Intake and Existing System Adoption

**Released:** May 2026

### Added

- **Three Project Intake Modes**
  - New Project Initialization
  - Existing Kabeeri Project Upgrade
  - Non-Kabeeri Project Adoption

- **New Project Initialization**
  - Step-by-step setup rules
  - Project folder structure scaffolding
  - Initial metadata files creation
  - First git commit guidelines
  - Pre-initialization checklist

- **Existing Kabeeri Project Upgrade**
  - Compatibility report generation
  - Version upgrade process
  - Metadata updates
  - Verification steps
  - Rollback planning

- **Non-Kabeeri Project Adoption**
  - Project scanning and analysis
  - Technology stack detection
  - Feature mapping to workstreams
  - Adoption task generation
  - Team training guides
  - Phase-based adoption (scan, setup, training, execution)

### Key Features

- Supports three different entry points into Kabeeri
- Existing code never modified during adoption
- Clear workflows for each mode
- Comprehensive documentation for each stage

### Files Added

- [project_intake/README.md](project_intake/README.md)
- [project_intake/NEW_PROJECT_RULES.md](project_intake/NEW_PROJECT_RULES.md)
- [project_intake/EXISTING_PROJECT_ADOPTION.md](project_intake/EXISTING_PROJECT_ADOPTION.md)

---

## [1.1.0] — Delivery Modes Foundation

**Released:** May 2026

### Added

- **Two Official Delivery Modes**
  - Structured Delivery (comprehensive upfront planning)
  - Agile Delivery (iterative sprint-based)
  - Both built on v1.0.0 foundation
  - Neither replaces the other

- **Structured Delivery Mode**
  - Full workflow from questionnaires to documentation to implementation
  - 9-layer architecture integrated
  - Phase-based execution
  - Complete planning before coding
  - Extension layer for future features

- **Agile Delivery Mode**
  - Iterative sprint-based approach
  - Product backlog concept
  - User story and epic breakdown
  - Continuous stakeholder feedback
  - Adaptive planning

- **Mode Selection Guide**
  - Decision matrix for choosing mode
  - Detailed scenarios for each mode
  - Common misconceptions addressed
  - When to use each mode
  - Can't (or shouldn't) mix mid-project

### Key Features

- v1.0.0 is NOT "Waterfall-only" — it's the foundation for both modes
- Structured and Agile are equal first-class citizens
- Both modes share task governance, project intake, etc.
- Clear guidance on mode selection
- Terminology defined for each mode

### Files Added

- [delivery_modes/README.md](delivery_modes/README.md)
- [delivery_modes/SELECTION_GUIDE.md](delivery_modes/SELECTION_GUIDE.md)
- [delivery_modes/STRUCTURED_DELIVERY.md](delivery_modes/STRUCTURED_DELIVERY.md)
- [agile_delivery/README.md](agile_delivery/README.md)

---

## [0.1.0] — Initial Documentation Release

**Released:** January 2026

### Added

- Introduced Kabeeri Vibe Developer Framework concept
- Added Arabic and English documentation
- Added repository structure proposal
- Added governance, contributing, security, and roadmap files
- Added initial schemas and example generator placeholders
- Project profile definitions (Lite, Standard, Enterprise)
- Core workflow documentation
- Foundation layer architecture

### Files Added

- README.md (English)
- README_AR.md (Arabic)
- ROADMAP.md
- GOVERNANCE.md
- CONTRIBUTING.md
- SECURITY.md
- CODE_OF_CONDUCT.md
- CHANGELOG.md (this file)
