# Kabeeri VDF System Capabilities Reference

This document is the main high-level reference for Kabeeri VDF capabilities.
Use it to quickly understand what the system can do, which layer owns each
capability, where the source files live, and which CLI commands or runtime
state are involved.

> Kabeeri VDF is a meta-framework for AI-driven software development. It does
> not replace Laravel, React, Next.js, Django, .NET, WordPress, or other coding
> frameworks. It governs how ideas become scoped tasks, prompts, code work,
> reviews, dashboards, handoffs, releases, and AI cost records.

## Operating Model

Kabeeri now presents itself through two primary tracks plus a shared platform
layer. This keeps framework development and application development distinct
without duplicating the core engine.

| Track | Who It Serves | Core Cycle | What It Owns |
| --- | --- | --- | --- |
| Framework Owner Track | Maintain and extend Kabeeri itself. | `resume -> evolution priorities -> evolution temp -> implement -> sync -> validate -> verify` | Evolution Steward, framework governance, release readiness, dependency mapping, and follow-up tasks for Kabeeri internals. |
| Vibe App Developer Track | Build real user applications with Kabeeri as the engine. | `resume -> vibe/ask -> blueprint/questionnaire -> temp -> tasks/capture -> validate -> handoff` | Vibe-first intake, app task execution, capture records, app blueprints, prompt packs, and app-facing task governance. |
| Shared Platform Layer | Both tracks. | `resume -> guard -> conflict scan -> validate -> dashboard/reports` | CLI engine, workspace state, task tracker, dashboard, sync preflight, security, tokens, locks, and runtime schemas. |

The tracks share the same CLI and workspace engine, but they do not share the
same purpose:

- Framework Owner Track changes Kabeeri.
- Vibe App Developer Track uses Kabeeri to build an app.
- Shared Platform Layer keeps both safe, visible, and resumable.

The same structure is summarized in `docs/reports/KVDF_TWO_TRACK_RESTRUCTURE.md`.

The workflow contract for all three roles is now documented separately and linked
from this index:

- AI Tool instructions: `docs/site/pages/en/ai-tool.html`
- System development docs site: `plugins/kvdf-dev/docs/site/index.html`
- Vibe developer instructions: `docs/site/pages/en/vibe-developer.html`
- Canonical workflow policy: `knowledge/governance/KVDF_WORKFLOW_INSTRUCTIONS.md`

## Quick Map

| Area | What It Does | Main Runtime / Docs |
| --- | --- | --- |
| CLI Engine | Runs local workspace operations and governance commands. | `bin/kvdf.js`, `src/cli/`, `docs/cli/CLI_COMMAND_REFERENCE.md` |
| AI Entry And Track Split | Routes AI work through a single CLI entry path, then separates framework-owner, app-developer, and plugin-feature work so each feature can be added or removed without ambiguity. Plugin lanes stay optional and removable, so the system can be assembled by capability instead of by a monolithic bundle. | `bin/kvdf.js`, `src/cli/index.js`, `knowledge/vibe_ux/`, `packs/prompt_packs/`, `plugins/`, `.kabeeri/session_track.json` |
| Runtime Services Layer | Holds reusable orchestration logic extracted from command facades so command handlers stay thin and shared behavior can be reused by dashboard, relay, and internal helpers. | `src/cli/services/`, `src/cli/commands/` |
| Session Entry Router | Auto-routes a new session into the framework-owner track or vibe app-developer track without asking the human to choose first, then persists the selected track for later resume. | `kvdf entry`, `kvdf start`, `kvdf track route`, `src/cli/commands/resume.js`, `src/cli/commands/track.js`, `.kabeeri/session_track.json`, `knowledge/governance/TRACK_ROUTING_GOVERNANCE.md` |
| Repository Foldering System | Defines a Laravel-like root architecture so maintainers and AI tools know where runtime, knowledge, packs, plugins, schemas, docs, tests, and local state belong. The machine-readable map is the source of truth and the human guide explains the workflow for choosing the owning root before adding files. | `knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json`, `docs/architecture/REPOSITORY_FOLDERING_SYSTEM.md`, `docs/site/pages/en/repository-layout.html`, `kvdf structure` |
| AI/CLI Operating Contract | Defines the shared execution boundary for AI and CLI work so humans and agents can inspect the current next exact action, the command registry, and the architecture or track boundary view from one place. | `docs/cli/CLI_COMMAND_REFERENCE.md`, `docs/reports/KVDF_AI_CLI_OPERATING_CONTRACT.md`, `kvdf contract` |
| Workflow Instructions | Defines the shared planning gate, task slicing, approval rules, stop rules, and role behavior for AI Tool and vibe developer work. | `knowledge/governance/KVDF_WORKFLOW_INSTRUCTIONS.md`, `docs/site/pages/en/ai-tool.html`, `docs/site/pages/en/vibe-developer.html` |
| Workspace State | Stores the project truth under `.kabeeri/`. | `.kabeeri/`, `src/cli/workspace.js` |
| Session Resume Guard | Detects whether a new session belongs to the framework-owner track, the vibe app-developer track, or an uninitialized app folder, and separates app npm roots from the Kabeeri engine root. | `kvdf resume`, `kvdf start`, `kvdf track status` |
| Developer Onboarding Flow | Gives new developers a guided first-session path with enter, route, and resume steps, then persists the onboarding report so the safe opening path can be recalled later without chat history. | `kvdf onboarding`, `kvdf onboarding report`, `.kabeeri/reports/session_onboarding.json` |
| Session Track Status | Shows the active session track, the persisted route decision, and the recommended next command for the current workspace. | `kvdf track status`, `src/cli/commands/track.js`, `.kabeeri/session_track.json` |
| Framework Boundary Guard | Blocks accidental edits to Kabeeri framework internals from user workspaces unless an explicit framework-edit override is used, including capture and session file scopes. | `kvdf guard`, `kvdf capture`, `kvdf session` |
| Conflict Scan | Checks command/help alignment, guard wiring, core/runtime schema validation, and workspace task/capture/session/lock drift before new framework development. | `kvdf conflict scan` |
| Vibe App Developer Track | Converts natural language into governed suggestions, plans, captures, briefs, and next actions for application work. | `knowledge/vibe_ux/`, `.kabeeri/interactions/` |
| Delivery Mode Advisor | Recommends Agile or Structured from the requested application context and records the developer's final choice. | `knowledge/delivery_modes/`, `.kabeeri/delivery_decisions.json`, `kvdf delivery` |
| Product Blueprint Catalog | Maps real market systems to channels, backend modules, frontend pages, database entities, workstreams, and risk flags for compact AI planning. | `knowledge/standard_systems/PRODUCT_BLUEPRINT_CATALOG.json`, `.kabeeri/product_blueprints.json`, `kvdf blueprint` |
| Data Design Blueprint | Guides AI database modeling from business workflow to modules, entities, constraints, snapshots, indexes, audit, transactions, idempotency, and migration safety. | `knowledge/standard_systems/DATA_DESIGN_BLUEPRINT.json`, `.kabeeri/data_design.json`, `kvdf data-design` |
| Pipeline Enforcement Matrix | Locks the app-building pipeline into explicit guard conditions, state files, and failure messages before planning or execution can continue, including task-aware checks for token/lock start readiness, traceability-chain completeness, and verification/archive completion trails. The canonical stage contract lives in the pipeline spec. | `docs/reports/KVDF_PIPELINE_ENFORCEMENT_MATRIX.md`, `docs/reports/KVDF_PIPELINE_SPEC.md`, `.kabeeri/reports/pipeline_enforcement.json`, `kvdf pipeline strict [--task <task-id>]` |
| Agile Templates Runtime | Turns backlog, epic, story, sprint planning, impediments, retrospectives, velocity, forecast, and sprint reviews into executable workspace records. | `knowledge/agile_delivery/`, `.kabeeri/agile.json`, `.kabeeri/dashboard/agile_state.json` |
| Structured Delivery Runtime | Turns Waterfall-style requirements, phases, deliverables, risks, change requests, phase gates, and traceability into executable workspace records. | `knowledge/delivery_modes/`, `.kabeeri/structured.json`, `.kabeeri/dashboard/structured_state.json` |
| Project Intake | Starts new or existing projects with profile, user-language behavior, and delivery structure. | `knowledge/project_intake/`, `packs/generators/`, `packs/templates/`, `kvdf init` |
| Project Profile Router | Turns a project goal or current codebase signals into a durable Lite, Standard, or Enterprise profile, recommended prompt packs, scale packs, intake groups, and a resumable report before the workspace is created. | `.kabeeri/project_profile.json`, `.kabeeri/reports/project_profile_report.json`, `kvdf project profile`, `kvdf project route`, `kvdf project profile report`, `kvdf prompt-pack scale` |
| Source Package Intake | Treats `KVDF_New_Features_Docs/` as a dual-purpose source package containing the Software Design System reference library and the project documentation generator system, then exposes its study, inventory, destination map, source-capability map, normalization map, duplicate analysis, migration state, relocation manifest, cleanup plan, verification state, and redistribution targets through CLI. The source folder itself has now been decommissioned; the permanent reference folders and historical reports are the canonical record. | `KVDF_New_Features_Docs/` (historical), `knowledge/design_system/software_design_reference/`, `knowledge/documentation_generator/`, `docs/reports/KVDF_NEW_FEATURES_DOCS_STUDY.md`, `docs/reports/KVDF_NEW_FEATURES_DOCS_INVENTORY.md`, `docs/reports/KVDF_NEW_FEATURES_DOCS_DESTINATION_MAP.md`, `docs/reports/KVDF_SOURCE_CAPABILITY_MAPPING.md`, `docs/reports/KVDF_NEW_FEATURES_DOCS_NORMALIZATION_MAP.md`, `docs/reports/KVDF_NEW_FEATURES_DOCS_MIGRATION_STATE.md`, `docs/reports/KVDF_NEW_FEATURES_DOCS_RELOCATION_MANIFEST.json`, `docs/reports/KVDF_NEW_FEATURES_DOCS_CLEANUP_PLAN.md`, `kvdf source-package` |
| Source Folder Normalization | Preserves lowercase aliases and safe path mappings for the imported source package so every root and section can be normalized without losing the original relationship to the canonical content. | `kvdf source-package normalize`, `docs/reports/KVDF_NEW_FEATURES_DOCS_NORMALIZATION_MAP.md` |
| Software Design System Reference Library | Stores the analyzed software-design knowledge imported from source packages as permanent reusable system design guidance and duplicate-guardrails for avoiding capability-name collisions. | `knowledge/design_system/software_design_reference/`, `knowledge/design_system/software_design_reference/SOFTWARE_DESIGN_DUPLICATE_ANALYSIS.md`, `docs/reports/KVDF_NEW_FEATURES_DOCS_DUPLICATE_ANALYSIS.md`, `kvdf source-package compare`, `kvdf software-design compare` |
| Project Documentation Generator | Stores the reusable documentation lifecycle rules imported from source packages so every future app can generate the same docs flow through Kabeeri, with duplicate-analysis guardrails to avoid inventing a second docs lifecycle vocabulary. | `knowledge/documentation_generator/`, `knowledge/documentation_generator/DOCS_GENERATION_DUPLICATE_ANALYSIS.md`, `knowledge/task_tracking/`, `docs/reports/`, `kvdf source-package map`, `kvdf docs-generator compare` |
| Documentation Generation Workflow | Treats docs generation as a first-class workflow with a template catalog, generated site manifest, page contracts, coverage reporting, and sync validation so docs are not treated as loose files. | `docs/site/page-templates.json`, `docs/site/site-manifest.json`, `docs/site/page-contracts.json`, `docs/reports/DOCS_SITE_GENERATION_WORKFLOW.json`, `kvdf docs workflow` |
| Docs Consistency Control Plane | Keeps command metadata, human docs, capability pages, and live reports aligned through scorecards, the docs command reference, and the shared operating contract so developers do not have to reconcile drift by hand. | `docs/SYSTEM_CAPABILITIES_REFERENCE.md`, `docs/site/assets/js/app.js`, `docs/cli/CLI_COMMAND_REFERENCE.md`, `.kabeeri/reports/kabeeri_scorecards.json`, `kvdf contract`, `kvdf evolution scorecards` |
| Workflow Instructions | Defines the shared planning gate, task slicing, approval rules, stop rules, and role-specific behavior for AI Tool and vibe developer work. | `knowledge/governance/KVDF_WORKFLOW_INSTRUCTIONS.md`, `docs/site/pages/en/ai-tool.html`, `docs/site/pages/en/vibe-developer.html` |
| Scorecard Index | Provides the master map for thinking, module, flow-step, and relationship-pattern cards so the current review set is easy to navigate from one place. | `docs/reports/KVDF_SCORECARDS_INDEX.md`, `docs/reports/KVDF_SCORECARDS.md`, `.kabeeri/reports/kabeeri_scorecards.json` |
| Maintainability Control Plane | Exposes the shared-service extraction scorecard and live maintainability report so developers can see which CLI helpers were moved into shared services and what cleanup remains. | `.kabeeri/reports/maintainability.json`, `.kabeeri/reports/kabeeri_scorecards.json`, `kvdf maintainability`, `kvdf contract`, `kvdf pipeline strict` |
| Software Design Reference CLI | Lets developers inspect the permanent software design reference folder from CLI after the source package is migrated. | `kvdf software-design`, `knowledge/design_system/software_design_reference/` |
| Docs Generator Reference CLI | Lets developers inspect the permanent documentation generator reference folder from CLI after the source package is migrated. | `kvdf docs-generator`, `knowledge/documentation_generator/` |
| Docs Site Deep Publishing | Publishes a coverage report that groups the generated docs site pages into major framework families so the site stays traceable to capability, governance, intake, operations, example, and support coverage. | `docs/reports/DOCS_SITE_DEEP_PUBLISHING_COVERAGE.json`, `kvdf docs coverage`, `kvdf docs generate` |
| Generators | Creates Lite, Standard, and Enterprise project skeletons and proposed governance tasks when a `.kabeeri` workspace is active. | `packs/generators/*.json`, `kvdf create`, `kvdf generate` |
| Examples Library | Shows Lite, Standard, and Enterprise reference examples. | `packs/examples/`, `kvdf example` |
| Questionnaires | Collects structured product and technical answers; adaptive intake planning now uses blueprints, framework prompt packs, data design, UI/UX, delivery mode context, detected user language, explicit module plans, and delivery maps before asking, and the resulting planning pack must be reviewed and approved before task generation. | `knowledge/questionnaires/`, `knowledge/questionnaire_engine/`, `.kabeeri/questionnaires/adaptive_intake_plan.json`, `kvdf questionnaire plan`, `kvdf questionnaire review`, `kvdf questionnaire approve` |
| Capability Map | Maps project type to required, optional, deferred, or unknown system areas. | `knowledge/standard_systems/`, `kvdf capability`, `kvdf questionnaire coverage` |
| Prompt Packs And Common Prompt Layer | Provides stack-specific AI coding prompts plus shared scope, review, and AI-run rules. The scale pack router adds large-system bundles for enterprise or high-risk projects so prompts do not stay overly generic. | `packs/prompt_packs/`, `packs/prompt_packs/common/`, `.kabeeri/prompt_layer/`, `.kabeeri/reports/scale_specific_packs_report.json`, `kvdf prompt-pack` |
| Task Assessment System | Generates a structured pre-build assessment so scope, blockers, dependencies, allowed files, checks, and readiness gates are visible before large work starts. | `.kabeeri/task_assessments.json`, `kvdf task assessment`, `knowledge/task_tracking/TASK_INTAKE_TEMPLATE.md` |
| Task Coverage Report | Breaks a task into the full temporary execution path, records the materialized queue, and shows whether any slice remains open so the active task has no uncovered remainder. | `.kabeeri/reports/task_coverage_*.json`, `kvdf task coverage`, `src/cli/commands/task_coverage.js` |
| Task Lifecycle Engine | Tracks tasks through intake, ready, execution, validation, closure, blocked, and archived stages with visible next-action guidance, trash-aware status lookups, and full-task coverage reporting. | `.kabeeri/tasks.json`, `.kabeeri/task_trash.json`, `kvdf task lifecycle`, `kvdf task status`, `kvdf task coverage` |
| Traceability Layer | Links tasks, assessments, ADRs, AI runs, docs source-of-truth checks, verification commands, and derived trace edges so every change can be traced end to end. | `.kabeeri/reports/traceability_report.json`, `kvdf trace report`, `kvdf trace status`, `knowledge/task_tracking/TASK_ASSESSMENT.md` |
| Change Control Layer | Consolidates structured change requests, Evolution changes, and risk register entries into one visible control report so large improvements can be reviewed before release or handoff. | `.kabeeri/reports/change_control_report.json`, `kvdf change report`, `kvdf risk report`, `knowledge/task_tracking/TRACEABILITY.md` |
| Task Control Plane And Executor Boundary | Separates planning from implementation so the CLI first compiles a control-plane packet, then narrows it into a packet-only executor contract, and only then starts approved or ready tasks through batch-run in governed order. The packet report and executor-contract report are the source of truth for allowed actions and the next exact execution step. | `docs/reports/KVDF_TASK_CONTROL_PLANE_PACKET.json`, `docs/reports/KVDF_TASK_EXECUTOR_CONTRACT.json`, `kvdf task packet`, `kvdf task executor-contract`, `kvdf task batch-run` |
| Task Tracking And Governance | Manages approved app work from intake to verification, keeps task governance policy, exposes a visible lifecycle board from intake to ready, execution, validation, closure, and archived states, stores durable execution fields and task memory for resumable sessions, breaks active work into full-task-coverage queues, archives completed tasks into a 30-day trash bucket with restore and sweep support, and exposes a focused live task tracker JSON for dashboards and VS Code-style surfaces. | `knowledge/task_tracking/`, `knowledge/task_tracking/TASK_GOVERNANCE.md`, `.kabeeri/dashboard/task_tracker_state.json`, `.kabeeri/task_trash.json`, `kvdf task`, `kvdf task lifecycle`, `kvdf task coverage`, `kvdf task memory`, `kvdf task trash` |
| Live JSON Reports | Summarizes readiness, governance, task tracker, dashboard, package, upgrade, security, and next-action state as a derived live view. Historical reports explain the story; live reports show the current execution state. | `.kabeeri/reports/live_reports_state.json`, `docs/internal/LIVE_JSON_REPORTS.md`, `kvdf reports live`, `kvdf reports state` |
| Task Scheduler System | Orchestrates route decisions across active tasks, temporary queues, trash, deferred routing, and AI agent handoffs while preserving route history for later sessions. | `knowledge/task_tracking/TASK_SCHEDULER_GOVERNANCE.md`, `.kabeeri/task_scheduler.json`, `kvdf schedule` |
| Plugin Loader | Reads plugin manifests from `plugins/`, stores install/enable/uninstall/disable state in `.kabeeri/plugins.json`, and reports which removable bundles are active, how their bundle contracts resolve, and what next exact action the plugin loader suggests. Runtime completeness means `status`, `show`, install, enable, disable, and uninstall all point at the same live state and contract shape rather than chat memory. The manifest is the source of truth, and the docs should explain the bundle workflow instead of assuming it from history. | `.kabeeri/plugins.json`, `plugins/*/plugin.json`, `kvdf plugins` |
| App Plugin Suite | Provides installable app-track plugin bundles for company profiles, news websites, blogs, ecommerce mobile apps, CRM, and POS with strict runtime pipelines, plugin-state gating, bundle-contract status, and next-exact-action reporting. Each plugin family should keep its manifest, docs, and runtime shape aligned so operators can swap bundles without relearning the workflow. | `plugins/company-profile/`, `plugins/news-website/`, `plugins/blog/`, `plugins/ecommerce-mobile-app/`, `plugins/crm/`, `plugins/pos/`, `kvdf company-profile`, `kvdf news-website`, `kvdf blog`, `kvdf ecommerce-mobile-app`, `kvdf crm`, `kvdf pos` |
| Ecommerce Builder | Builds ecommerce systems through a strict runtime pipeline with installable/uninstallable plugin-state gating, a durable commerce workspace record, questionnaire intake, brief/design/module/task generation, approval batching, bundle-contract reporting, and release handoff. The business-type pack mirrors the booking pack structure so shared archetype guidance stays in parity across store, marketplace, digital product, subscription, and services modes. | `plugins/ecommerce-builder/`, `.kabeeri/ecommerce.json`, `kvdf ecommerce`, `kvdf plugins install ecommerce-builder`, `kvdf plugins uninstall ecommerce-builder` |
| Booking Builder | Builds booking and reservation products through a strict runtime pipeline with installable/uninstallable plugin-state gating, a durable booking workspace record, questionnaire intake, brief/design/module/task generation, approval batching, bundle-contract reporting, and release handoff. The business-type pack mirrors the ecommerce pack structure so shared archetype guidance stays in parity across appointments, services, classes, hotels, and events modes. | `plugins/booking-builder/`, `.kabeeri/booking.json`, `kvdf booking`, `kvdf plugins install booking-builder`, `kvdf plugins uninstall booking-builder` |
| Workstream Governance | Separates backend, frontend, mobile, admin, QA, security, docs, and integration work. | `knowledge/governance/WORKSTREAM_GOVERNANCE.md`, `kvdf workstream` |
| App Boundary Governance | Allows same-product multi-app workspaces while blocking unrelated products in one folder, and keeps the portable app-doc package inside the app root. | `knowledge/governance/APP_BOUNDARY_GOVERNANCE.md`, `knowledge/governance/APP_DOCS_STANDARD.md`, `kvdf app` |
| Portable App Docs Package | Stores the canonical app-folder docs package for UI/UX, system design, data design, delivery, operations, and enterprise notes so the app can move to another system without losing product knowledge. | `knowledge/governance/APP_DOCS_STANDARD.md`, `workspaces/apps/<app-slug>/docs/`, `workspaces/apps/<app-slug>/assets/`, `kvdf app workspace create`, `kvdf app workspace validate` |
| Developer App Workspace Layout | Scaffolds isolated developer apps under `workspaces/apps/<app-slug>/` with local `.kabeeri` state, tests, portable docs, package metadata, surface scopes, boundary status, and a strict validation contract. | `.kabeeri/app_workspaces.json`, `workspaces/apps/`, `kvdf app workspace`, `kvdf app workspace validate` |
| App Workspace Scorecards | Seeds and refreshes workspace-local app scorecards so planning, boundary status, task readiness, execution, validation, and release readiness stay visible in the vibe dashboard. | `.kabeeri/scorecards.json`, `kvdf app workspace scorecards`, `docs/site/pages/en/vibe-developer.html` |
| Execution Scope Governance | Derives allowed files, apps, and workstreams for task access tokens. | `knowledge/governance/EXECUTION_SCOPE_GOVERNANCE.md`, `kvdf token` |
| Multi-AI Governance | Controls Evolution-led session leadership, agent hub entries, leader leases, per-AI queues, sync/distribution of the active Evolution temporary queue, semantic merge bundles with surface planning, locks, tokens, audit, and Owner verification. The governance doc and live state file are the source of truth for who leads and which queue is active. | `knowledge/governance/`, `knowledge/governance/MULTI_AI_GOVERNANCE.md`, `.kabeeri/multi_ai_governance.json` |
| Policy Gates | Blocks unsafe verification, release, handoff, security, migration, and GitHub write operations. The policy result file is the source of truth for which gate failed and why. | `kvdf policy`, `schemas/policy*.json` |
| Runtime Schema Registry | Maps `.kabeeri/` JSON and JSONL runtime files to schemas for drift checks. | `schemas/runtime/`, `kvdf validate runtime-schemas` |
| KVDF Dev System / Framework Owner Track / Evolution Steward | Acts as the single framework-development backlog by recording requested framework changes, ordered priorities, a canonical KVDF restructure roadmap, temporary execution queues for the active priority, resumable execution reports, scorecards for review and comparison, an optional scorecard-to-Evolution materialization path when explicitly requested, a governed batch-exe queue for ready and approved tasks, auto-assigning missing EVO assignees to the active Multi-AI leader or codex fallback, plus the plugin-owned `kvdf task packet` surface for control-plane packet compilation, `kvdf task executor-contract` for packet-only AI boundary rules, and `kvdf task batch-run` for starting approved tasks in governed priority order or previewing packet/contract modes, duplicate-capability signals, impacted areas, follow-up tasks, and unfinished dependent work for dashboard/live reports. This bundle is packaged as a removable plugin so it stays separated from app-building plugins and app-track workflows. | `knowledge/governance/EVOLUTION_STEWARD.md`, `.kabeeri/evolution.json`, `kvdf evolution`, `kvdf evolution roadmap`, `kvdf evolution scorecards`, `kvdf evolution report`, `kvdf evolution batch-exe`, `kvdf batch-exe`, `kvdf task packet`, `kvdf task executor-contract`, `kvdf task batch-run`, `kvdf plugins install kvdf-dev`, `kvdf plugins uninstall kvdf-dev` |

The current runtime-services migration focuses on keeping `src/cli/services/evolution.js`,
`src/cli/services/ai_planner.js`, and `src/cli/services/multi_ai_relay.js` as the
shared logic layer behind the owner and Multi-AI command facades.
| Owner docs token gate | Issues a fresh 50-character mixed token when the owner opens the owner docs surface, keeps it valid for one minute, and revokes it when the session closes. | `knowledge/governance/OWNER_DOCS_TOKEN_GATE.md`, `docs/reports/KVDF_OWNER_DOCS_TOKEN_GATE_REPORT.md`, `kvdf owner docs` |
| Owner session auto-close | Ends the owner session explicitly or through expiry, and revokes any active owner docs token so the next session starts fresh. | `knowledge/governance/OWNER_SESSION_AUTO_CLOSE.md`, `docs/reports/KVDF_OWNER_SESSION_AUTO_CLOSE_REPORT.md`, `kvdf owner session|logout` |
| Capability Partition Matrix | Classifies the complete KVDF capability catalog into `kabeeri-core`, `plugins/kvdf-dev`, and `workspaces/apps/<app-slug>` ownership buckets, then publishes the authoritative split and boundary rules. | `docs/reports/KVDF_CORE_PLUGIN_CAPABILITY_SPLIT_STUDY.md`, `kvdf evolution partition` |
| Design Governance | Converts design sources into approved text specs before frontend implementation. | `knowledge/design_sources/`, `knowledge/design_system/`, `knowledge/frontend_specs/`, `kvdf design` |
| UI/UX Advisor | Recommends frontend experience pattern, component groups, page templates, stacks, SEO/GEO rules, dashboard/mobile UX rules, theme presets, screen compositions, framework adapters, UI decisions, playbooks, and creative variants from the product blueprint. | `knowledge/standard_systems/UI_UX_DESIGN_BLUEPRINT.json`, `knowledge/design_system/`, `.kabeeri/design_sources/ui_advisor.json`, `kvdf design recommend` |
| UI/UX Reference Library | Stores approved UI/UX rules and reference patterns, then generates design questions, screen plans, module plans, and governed frontend/design tasks from them. | `knowledge/design_system/ui_ux_reference/`, `.kabeeri/design_sources/ui_ux_reference.json`, `kvdf design reference-*` |
| ADR And AI Run History | Records formal architecture decisions and accepted/rejected AI prompt runs. | `knowledge/project_intelligence/ADR_AI_RUN_HISTORY_RUNTIME.md`, `.kabeeri/adr/`, `.kabeeri/ai_runs/`, `kvdf adr`, `kvdf ai-run` |
| AI Cost Control | Tracks usage, budgets, context packs, preflight estimates, and model routing. | `knowledge/ai_cost_control/`, `kvdf usage`, `kvdf preflight` |
| Live Dashboard | Shows live state for tasks, governance, apps, costs, policies, linked workspaces, and dashboard UX audits. | `docs/reports/dashboard/`, `kvdf dashboard` |
| VS Code Integration | Scaffolds workspace tasks and command helpers, and reports the editor bridge state without becoming the source of truth. | `plugins/vscode_extension/`, `kvdf vscode`, `kvdf vscode report` |
| GitHub Sync | Plans and optionally confirms labels, milestones, issues, and releases through `gh`, with a local trace report for the sync adapter. The GitHub planning bundle and sync bundle are installable and uninstallable as removable plugins. | `plugins/github_sync/`, `plugins/github/`, `kvdf github`, `kvdf github report`, `kvdf plugins install github`, `kvdf plugins uninstall github`, `kvdf plugins install github_sync`, `kvdf plugins uninstall github_sync` |
| GitHub Team Sync Preflight | Reports branch, remote, upstream, ahead/behind, local changes, dry-run pull/push commands, and whether sync is optional for solo work or recommended for team work. | `kvdf sync` |
| Security Governance | Scans local files for common secret patterns and blocks high-risk readiness gates. | `kvdf security`, `.kabeeri/security/` |
| Migration Safety | Records migration plans, rollback plans, checks, reports, and approval state. | `kvdf migration`, `.kabeeri/migrations/` |
| Handoff Packages | Generates Owner/client reports from local state and keeps the handoff bundle aligned with the actual workspace evidence. | `kvdf handoff`, `.kabeeri/handoff/` |
| Independent Reports | Exports standalone readiness/governance reports, a blocked-scenarios summary, and a compact live JSON report state for Codex, dashboard, VS Code, and automation, with governance coverage for trust, safety, privacy, compliance, and extensibility. Live JSON is the current execution view; Markdown reports explain the historical path. | `kvdf readiness report`, `kvdf governance report`, `kvdf reports live`, `kvdf reports blocked`, `.kabeeri/reports/live_reports_state.json`, `.kabeeri/reports/blocked_scenarios_report.json` |
| Blocked Scenarios Report | Collects the current blocked and warning-level scenarios into one concise report so developers can see what cannot proceed, why, and what governed action should happen next. | `.kabeeri/reports/blocked_scenarios_report.json`, `kvdf reports blocked` |
| Release Readiness | Checks validation, policy, notes, checklist, and publish gates. Release docs should point operators to the exact state files, not only to narrative summaries. | `kvdf release`, `docs/production/` |
| Command Lifecycle Ledger | Tracks active canonical command families, migrated surfaces, compatibility aliases, deprecated entries, and still-duplicating older entry points so CLI-first migration stays visible. It also explains how to keep alias noise from hiding the canonical command path. | `docs/cli/CLI_COMMAND_REFERENCE.md`, `docs/reports/KVDF_COMMAND_DEPRECATION_LEDGER.md` |
| Folder Ownership Ledger | Tracks the important command, service, kvdf-dev, app-track, and bridge folders plus remaining migration gaps so folder ownership stays visible during CLI migration. | `docs/cli/CLI_COMMAND_REFERENCE.md`, `src/cli/index.js`, `src/cli/commands/`, `src/cli/services/`, `plugins/kvdf-dev/`, `workspaces/apps/<app-slug>/`, `docs/reports/` |
| Product Packaging And Upgrade | Checks npm packaging readiness and workspace upgrade compatibility. | `kvdf package`, `kvdf upgrade`, `docs/production/` |
| Validation And Doctor | Checks repository health, JSON/state integrity, scoped governance rules, docs source-of-truth, and historical source clarity. | `kvdf doctor`, `kvdf validate`, `kvdf validate historical-source-clarity` |
| Capability Registry | Exposes the 53 imported system areas as named, traceable units with owner/workstream and source mapping. | `kvdf capability registry`, `knowledge/standard_systems/CAPABILITY_REGISTRY.md`, `knowledge/standard_systems/SYSTEM_AREAS_INDEX.md` |
| Capability CLI Surface | Maps each imported capability area to a discoverable CLI command family and docs reference so the operational entry point is obvious before a developer starts work. | `kvdf capability surface`, `docs/reports/KVDF_CAPABILITY_CLI_SURFACE.json` |
| Capability-to-Documentation Matrix | Requires every capability to carry docs, CLI, runtime, tests, and report links in one traceable matrix so capability coverage stays complete. | `kvdf capability matrix`, `docs/reports/KVDF_CAPABILITY_DOC_MATRIX.json` |
| Capability Search Surface | Builds a searchable index across the registry, CLI surface, documentation matrix, and roadmap views so developers can filter by track, capability, command, phase, and report type. | `kvdf capability search`, `docs/reports/KVDF_CAPABILITY_SEARCH_INDEX.json` |
| Source-To-Capability Mapping | Connects the imported source study branches to capability surfaces, runtime targets, docs pages, and CLI commands. | `kvdf source-package source-map`, `docs/reports/KVDF_SOURCE_CAPABILITY_MAPPING.md` |
| Docs Site Synchronization | Regenerates, validates, and publishes the docs site while keeping CLI help, runtime behavior, and documentation in sync through a single report. | `kvdf docs build`, `kvdf docs preview`, `kvdf docs sync`, `docs/reports/DOCS_SITE_SYNC_REPORT.json` |
| Roadmap And Plan Inspection | Reads packaged v3/v4 milestone plans and source roadmap material as historical input, not current implementation truth. | `docs/reports/platform_integration/`, `plugins/multi_ai_governance/`, `docs/codex_context/`, `kvdf plan` |
| Reports And Traceability | Keeps audit, gap, implementation, requirement, and validation reports. The report family should explain both the historical story and the current source of truth. | `docs/reports/` |
| Repository Governance | Defines contribution, security, license, and project governance rules. | `CONTRIBUTING.md`, `SECURITY.md`, `GOVERNANCE.md`, `LICENSE` |

## Repository Layout At A Glance

Kabeeri's physical repository layout is now organized around a small number of
top-level architectural folders. This is the default mental model for
maintainers, AI agents, packaging, and documentation.

| Root Folder | Owns |
| --- | --- |
| `bin/` | CLI binary entrypoints. |
| `src/` | Executable runtime and CLI implementation. |
| `cli/` | CLI reference documentation and command guidance. |
| `knowledge/` | Governance, product intelligence, delivery systems, questionnaires, data design, UI/UX design, Vibe UX, and reusable operating rules. |
| `packs/` | Prompt packs, generators, templates, and examples that can be exported into customer projects. |
| `plugins/` | Dashboard, GitHub, VS Code, and multi-AI plugin bundles and integration material. |
| `docs/` | Human documentation, reports, architecture docs, bilingual docs, docs site, deep publishing coverage reports, and Codex context. |
| `schemas/` | JSON schemas and runtime contracts. |
| `tests/` | Automated tests and integration coverage. |
| `.kabeeri/` | Live workspace state, task records, dashboard JSON, reports, audit, policies, and local runtime data. |

Legacy root paths such as `prompt_packs/`, `standard_systems/`, `dashboard/`,
and `governance/` remain readable through CLI asset aliases for compatibility,
but new files should be added to the physical folders above.

## 1. CLI Engine

The executable command is `kvdf`.

Core entrypoints:

```bash
kvdf --help
kvdf --version
kvdf doctor
kvdf validate
```

The CLI is the runtime engine behind the framework. Chat, dashboard, VS Code,
and future UI surfaces can call the CLI or read `.kabeeri/` state, but the local
workspace files remain the source of truth.

Main references:

- `docs/cli/CLI_COMMAND_REFERENCE.md`
- `cli/README.md`
- `src/cli/index.js`
- `src/cli/ui.js`
- `src/cli/validate.js`

## 2. Workspace State

Kabeeri stores runtime state under `.kabeeri/`.

Common state areas:

- `.kabeeri/tasks.json`
- `.kabeeri/sprints.json`
- `.kabeeri/agile.json`
- `.kabeeri/developers.json`
- `.kabeeri/agents.json`
- `.kabeeri/apps.json`
- `.kabeeri/workstreams.json`
- `.kabeeri/locks.json`
- `.kabeeri/access_tokens/`
- `.kabeeri/ai_usage/`
- `.kabeeri/prompt_layer/`
- `.kabeeri/interactions/`
- `.kabeeri/policies/`
- `.kabeeri/reports/`

Main commands:

```bash
kvdf init
kvdf resume
kvdf start
kvdf conflict scan
kvdf validate
kvdf dashboard state
```

`kvdf resume` is the safe first command for a new session. It prevents ambiguous
phrases such as "start development" from mixing framework-owner work with user
application work. It reports the session mode, current root, Kabeeri engine
root, app npm root when a Next.js/React-style app is detected, warnings, next
actions, and optional `--scan` checks.

`kvdf conflict scan` is the next pre-development check. It catches simple drift
between command routing, help text, guard wiring, schemas, and local workspace
records before a new framework slice starts.

## 3. Evolution Steward

Evolution Steward controls changes to Kabeeri itself. It is the single
framework-development backlog: when the Owner requests a new framework feature
or improvement, this capability stores the request, keeps the ordered
development priorities, checks possible duplicate capability matches, and
creates an impact plan so implementation, CLI help, task tracking, schemas,
dashboard, reports, documentation, capability map, tests, changelog, and release
guidance are not forgotten.

Main commands:

```bash
kvdf evolution plan "Add a new Kabeeri capability"
kvdf evolution plan "Add a new Kabeeri capability" --confirm-placement --priority-position 4
kvdf evolution list
kvdf evolution status
kvdf evolution priorities
kvdf evolution next
kvdf evolution batch-exe
kvdf batch-exe
kvdf evolution defer "Future idea"
kvdf evolution deferred
kvdf evolution deferred restore deferred-001 --confirm-placement --priority-position 8
kvdf evolution priority evo-auto-001 --status in_progress
kvdf evolution show evo-001
kvdf evolution impact evo-001
kvdf evolution tasks evo-001
kvdf evolution verify evo-001
```

Runtime state:

- `.kabeeri/evolution.json`
- `.kabeeri/tasks.json`
- `.kabeeri/dashboard/*.json`
- `.kabeeri/reports/live_reports_state.json`

Main reference:

- `knowledge/governance/EVOLUTION_STEWARD.md`

## 4. Agile Templates Runtime

Agile templates turn product backlog, epics, user stories, sprint planning, and
sprint review into executable records.

It supports:

- backlog item creation
- epic creation and story grouping
- user story Definition of Ready checks
- conversion from story to governed task
- sprint planning with capacity checks
- sprint planning with not-ready and open-impediment blockers
- sprint review with accepted and rework points
- impediment tracking
- retrospectives and improvement actions
- release planning and readiness checks
- velocity and remaining-work forecast
- live dashboard visibility
- `kvdf validate agile`

Main commands:

```bash
kvdf agile summary
kvdf agile backlog add --id BL-001 --title "Checkout MVP" --type epic --priority high --source "vision"
kvdf agile epic create --id epic-checkout --title "Checkout" --goal "Customers can place orders" --source "vision"
kvdf agile story create --id story-checkout-001 --epic epic-checkout --title "Cart checkout" --points 5 --workstream backend --acceptance "Order is created,Payment result is stored" --reviewer owner-001
kvdf agile story task story-checkout-001 --task task-001
kvdf agile sprint plan sprint-001 --stories story-checkout-001 --capacity-points 10
kvdf agile sprint review sprint-001 --accepted story-checkout-001 --goal-met yes --decision accepted
kvdf validate agile
```

Main state:

- `.kabeeri/agile.json`
- `.kabeeri/sprints.json`
- `.kabeeri/tasks.json`

Main references:

- `knowledge/agile_delivery/README.md`
- `knowledge/agile_delivery/AGILE_RUNTIME.md`
- `knowledge/agile_delivery/PRODUCT_BACKLOG_TEMPLATE.md`
- `knowledge/agile_delivery/EPIC_TEMPLATE.md`
- `knowledge/agile_delivery/USER_STORY_TEMPLATE.md`
- `knowledge/agile_delivery/SPRINT_PLANNING_TEMPLATE.md`
- `knowledge/agile_delivery/SPRINT_REVIEW_TEMPLATE.md`

## 3A. Structured Delivery Runtime

Structured Delivery is the Waterfall-style runtime for projects that need
approved requirements, formal phase planning, traceability, change control,
phase gates, and enterprise handoff discipline.

It supports:

- requirement creation and approval
- phase planning from approved requirements
- requirement-to-task traceability
- deliverable creation and approval
- risk tracking and mitigation
- controlled change requests
- phase gate checks
- phase completion gates
- live dashboard state
- `kvdf validate structured`

Main commands:

```bash
kvdf structured health
kvdf structured requirement add --id REQ-001 --title "Email login" --source questionnaire --acceptance "User can login"
kvdf structured requirement approve REQ-001
kvdf structured phase plan phase-001 --requirements REQ-001 --goal "Authentication foundation"
kvdf structured task REQ-001 --task task-001
kvdf structured gate check phase-001
kvdf validate structured
```

Main state:

- `.kabeeri/structured.json`
- `.kabeeri/dashboard/structured_state.json`
- `.kabeeri/tasks.json`

Main references:

- `knowledge/delivery_modes/STRUCTURED_DELIVERY.md`
- `knowledge/delivery_modes/STRUCTURED_RUNTIME.md`

## 4. Vibe-first UX

Vibe-first is the human interaction layer. Its purpose is to let the developer
talk naturally, while Kabeeri converts intent into governed records instead of
silent execution.

It supports:

- intent classification
- vague request detection
- suggested task cards
- large request planning splits
- ecommerce-style plan templates
- post-work capture
- capture linking, conversion, resolution, and validation
- Vibe sessions
- compiled context briefs with product, UI/UX, system, and data sections
- next-action recommendations

Main commands:

```bash
kvdf vibe "Add admin settings page"
kvdf vibe suggest "Add checkout API"
kvdf ask "Improve the dashboard"
kvdf vibe plan "Build ecommerce store with products cart checkout admin and tests"
kvdf vibe approve suggestion-001 --actor owner-001
kvdf vibe session start --title "Store planning"
kvdf vibe brief
kvdf vibe next
kvdf capture --summary "Updated dashboard filters" --files src/cli/index.js
kvdf capture list
kvdf capture convert capture-001
kvdf validate capture
```

Main state:

- `.kabeeri/interactions/user_intents.jsonl`
- `.kabeeri/interactions/suggested_tasks.json`
- `.kabeeri/interactions/post_work_captures.json`
- `.kabeeri/interactions/vibe_sessions.json`
- `.kabeeri/interactions/context_briefs.json`

Main references:

- `knowledge/vibe_ux/README.md`
- `knowledge/vibe_ux/VIBE_FIRST_RUNTIME.md`
- `knowledge/vibe_ux/NATURAL_LANGUAGE_TASK_CREATION.md`
- `knowledge/vibe_ux/INTENT_CLASSIFICATION_RULES.md`
- `knowledge/vibe_ux/VAGUE_REQUEST_DETECTION.md`
- `knowledge/vibe_ux/SUGGESTED_TASK_CARD.md`
- `knowledge/vibe_ux/POST_WORK_CAPTURE.md`

## 5. Project Intake And Generation

Kabeeri can start a project from profiles and templates, then guide the user
through structured questions and output folders.

Profiles:

- `lite`
- `standard`
- `enterprise`

Main commands:

```bash
kvdf create --profile lite --output my-project
kvdf generate --profile standard --output my-project
kvdf generator list
kvdf generator show standard
```

Main references:

- `knowledge/project_intake/`
- `packs/generators/`
- `packs/templates/`
- `packs/examples/`
- `knowledge/delivery_modes/`

## 6. Examples Library

The examples layer gives reference project structures and task examples for
different project sizes.

Main commands:

```bash
kvdf example list
kvdf example show lite
kvdf example show standard
kvdf example show enterprise
```

Main references:

- `packs/examples/README.md`
- `packs/examples/lite/`
- `packs/examples/standard/`
- `packs/examples/enterprise/`
- `packs/examples/EXAMPLE_SELECTION_GUIDE.md`

## 7. Questionnaires And Capability Coverage

The questionnaire layer helps the owner explain the product in structured
answers. The capability map then shows which system areas are required,
optional, deferred, unknown, or need follow-up.

Capability groups include:

- Product and Business
- Users, Access, and Journeys
- Frontend Experience
- Backend, Data, and APIs
- Admin, Settings, and Customization
- Engagement, Content, and Growth
- Commerce and Plugins
- Quality, Security, and Compliance
- Operations and Release
- Kabeeri Control Layer

Main commands:

```bash
kvdf capability list
kvdf capability show payments_billing
kvdf capability map
kvdf questionnaire flow
kvdf questionnaire answer entry.project_type --value saas
kvdf questionnaire coverage
kvdf questionnaire missing
kvdf questionnaire generate-tasks
kvdf validate questionnaire
```

Main references:

- `knowledge/questionnaires/`
- `knowledge/questionnaire_engine/`
- `knowledge/standard_systems/SYSTEM_CAPABILITY_MAP.md`
- `knowledge/project_intelligence/README.md`

## 8. Prompt Packs And Common Prompt Layer

Prompt packs give AI coding tools structured prompts for a specific stack.
They reduce random prompting and keep implementation aligned with Kabeeri task
governance.

The common prompt layer adds shared rules once and composes them with any stack
pack, instead of duplicating the same safety text in every framework folder. It
includes task scope, testing/review, AI run history, cost/context discipline,
policy gates, design safety, security, migration safety, release/handoff, and
traceability expectations.

Implemented pack families include:

- Laravel
- React
- Vue
- Nuxt/Vue
- Angular
- Next.js
- Astro
- SvelteKit
- Django
- FastAPI
- Flask-style adjacent backend prompts through backend packs
- Rails
- Spring Boot
- .NET
- Symfony
- CodeIgniter
- WordPress
- Shopify
- Supabase
- Firebase
- Strapi
- React Native Expo
- Flutter
- Express.js
- NestJS
- Go Gin

Main commands:

```bash
kvdf prompt-pack list
kvdf prompt-pack show laravel
kvdf prompt-pack export react --output my-project/07_AI_CODE_PROMPTS/react
kvdf prompt-pack use nextjs
kvdf prompt-pack common
kvdf prompt-pack compose react --task task-001 --context ctx-001
kvdf prompt-pack compose react-native-expo --task task-mobile-001
kvdf prompt-pack compositions
kvdf prompt-pack validate fastapi
```

`kvdf vibe brief` now compiles a deterministic brief artifact from the latest vibe intent plus the current questionnaire plan and answers. The JSON and rendered output include explicit product, UI/UX, system, and data sections, a questionnaire coverage summary, and a reusable next-step command.

`kvdf questionnaire plan` now also compiles a persisted module plan and delivery map so task generation can consume named modules, boundaries, and phase/sprint batches without rereading raw chat. The planning pack is fail-closed until it is explicitly reviewed with `kvdf questionnaire review` and approved with `kvdf questionnaire approve --confirm`.

The React Native Expo pack includes a manifest keyword map so composed prompts
can select mobile-specific guidance for routing/deep links, public environment
config, backend API contracts, auth, data/state, forms/keyboard behavior,
offline cache, permissions/notifications, accessibility/performance, testing,
and EAS release handoff.

Main references:

- `packs/prompt_packs/`
- `packs/prompt_packs/common/`
- `packs/prompt_packs/react-native-expo/`
- `packs/prompt_packs/prompt_packs_README.md`
- `.kabeeri/prompt_layer/compositions.json`

## 9. Task Tracking And Delivery

Tasks turn ideas into traceable execution units. They can be linked to sprints,
apps, workstreams, issues, assignees, acceptance records, sessions, usage, and
Owner verification.

Main commands:

```bash
kvdf task create --title "Build product API" --workstream backend
kvdf task create --title "Wire API to storefront" --type integration --workstreams backend,public_frontend
kvdf task list
kvdf task status --id task-001
kvdf task assign task-001 --assignee agent-001
kvdf task start task-001 --actor agent-001
kvdf task tracker --json
kvdf task review task-001 --actor reviewer-001
kvdf task verify task-001 --owner owner-001
```

Related commands:

```bash
kvdf sprint create --id sprint-001 --name "Sprint 1"
kvdf sprint summary sprint-001
kvdf acceptance create --type task-completion
kvdf acceptance review acceptance-001 --result pass
kvdf audit list
kvdf audit report --task task-001
```

Main references:

- `knowledge/task_tracking/`
- `knowledge/task_tracking/TASK_GOVERNANCE.md`
- `.kabeeri/tasks.json`
- `.kabeeri/dashboard/task_tracker_state.json`
- `knowledge/acceptance_checklists/`
- `knowledge/agile_delivery/`

## 10. Workstream Governance

Workstreams describe responsibility boundaries such as backend, public
frontend, mobile, admin frontend, database, QA, security, DevOps, docs, and
integration.

They help Kabeeri:

- reject unknown workstreams
- check assignee capability
- enforce integration tasks for cross-workstream work
- validate AI session files against workstream path rules
- summarize workstream status in the dashboard

Main commands:

```bash
kvdf workstream list
kvdf workstream show backend
kvdf workstream show mobile
kvdf workstream add --id payments --name "Payments" --paths src/payments,app/Payments
kvdf workstream update backend --paths src/api,app/Http,routes/api.php
kvdf workstream validate
kvdf validate workstream
```

Main reference:

- `knowledge/governance/WORKSTREAM_GOVERNANCE.md`

## 11. App Boundary Governance

App Boundary Governance decides whether multiple apps can live in one Kabeeri
workspace.

Allowed in one workspace:

- one product with multiple related apps
- Laravel backend plus React/Vue/Angular storefront
- admin panel and public frontend for the same product
- workers, APIs, mobile apps, and dashboards for the same product

Not allowed in one workspace:

- two unrelated products
- two clients with separate delivery lifecycles
- separate businesses that should have separate tasks, releases, costs, and
  governance

Main commands:

```bash
kvdf app create --username backend-api --name "Laravel API" --type backend --path apps/api-laravel --product "Store"
kvdf app create --username storefront --name "React Storefront" --type frontend --path apps/storefront-react --product "Store"
kvdf app list
kvdf app show storefront
kvdf app status storefront --status ready_to_publish --workstreams public_frontend
kvdf validate routes
```

Main reference:

- `knowledge/governance/APP_BOUNDARY_GOVERNANCE.md`

## 12. Execution Scope Governance

Execution Scope Governance connects tasks, apps, workstreams, and task access
tokens into one permission model.

It helps Kabeeri:

- derive allowed files from task boundaries
- keep token scope narrower than or equal to app/workstream boundaries
- block broad manual scopes unless explicitly audited
- connect AI sessions to task permissions
- detect boundary drift during validation

Main commands:

```bash
kvdf token issue --task task-001 --assignee agent-001
kvdf token issue --task task-001 --assignee agent-001 --allowed-files src/api/
kvdf token issue --task task-001 --assignee agent-001 --allowed-files src/ --allow-broad-scope
kvdf token show task-token-001
kvdf token revoke task-token-001
kvdf token reissue task-token-001 --reason "Rework only"
```

Main reference:

- `knowledge/governance/EXECUTION_SCOPE_GOVERNANCE.md`

## 13. Multi-AI Governance

This layer makes AI-assisted work traceable and safer across one developer,
many developers, one AI agent, or multiple AI agents. Evolution is the global
priority governor, the first leader-eligible AI to enter a development
session becomes the Leader for that session, workers execute only inside
temporary queues, the communications relay layer lets agents exchange durable
topic-based messages without relying on chat history, and the Merger layer
combines workspace copies or patch bundles back into the original files under
validation.

Worker-only tools such as Gemini can still join the hub for collaboration, but
they remain non-leader participants unless leadership is explicitly allowed.

It covers:

- Evolution-led priority governance
- single active Owner
- Owner sessions and Owner transfer
- developer identities
- AI agent identities
- role permissions
- session leadership and leader transfer
- per-AI temporary queues
- durable agent-to-agent conversation relay threads and inboxes
- Evolution sync and worker distribution
- semantic merge bundles, semantic surface plans, and provenance
- locks
- task access tokens
- AI sessions
- audit reports
- Owner-only final verification

Main commands:

```bash
kvdf owner init --id owner-001 --name "Project Owner"
kvdf owner login --id owner-001
kvdf owner transfer issue --to owner-002 --name "New Owner"
kvdf developer add --id dev-001 --name "Backend Dev" --role Developer
kvdf developer solo --id dev-main --name "Main Developer"
kvdf agent add --id agent-001 --name "AI Backend Agent" --role "AI Developer" --workstreams backend
kvdf multi-ai agent register --ai gemini-001 --provider gemini --name "Gemini" --worker-only
kvdf multi-ai conversation start --from agent-001 --to agent-002 --topic "Scope" --message "Please review the scope"
kvdf multi-ai conversation reply --agent agent-002 --message-id multi-ai-message-001 --reply "Reviewed"
kvdf lock create --type folder --scope src/api --task task-001 --owner agent-001
kvdf session start --task task-001 --developer agent-001 --provider openai --model gpt
kvdf multi-ai status
kvdf multi-ai leader start --ai agent-001 --name "Claude Sonnet"
kvdf multi-ai sync distribute --leader-ai agent-001 --workers agent-002,agent-003
kvdf multi-ai queue add --ai agent-002 --priority evo-auto-017-multi-ai-governance --title "Schema slice" --files src/cli/index.js
kvdf multi-ai queue start multi-ai-queue-001
kvdf multi-ai queue advance multi-ai-queue-001
kvdf multi-ai queue complete multi-ai-queue-001
kvdf multi-ai merge add --sources multi-ai-queue-001,multi-ai-queue-002 --title "Leader merge"
kvdf multi-ai merge preview multi-ai-merge-001
kvdf multi-ai merge validate multi-ai-merge-001
kvdf multi-ai merge commit multi-ai-merge-001
kvdf session end session-001 --files src/api/users.ts --summary "Implemented endpoint"
```

Main references:

- `knowledge/governance/README.md`
- `knowledge/governance/MULTI_AI_GOVERNANCE.md`
- `knowledge/governance/SINGLE_OWNER_RULE.md`
- `knowledge/governance/ROLE_PERMISSION_MATRIX.md`
- `knowledge/governance/ASSIGNMENT_EXECUTION_GOVERNANCE.md`
- `knowledge/governance/SOLO_DEVELOPER_MODE.md`
- `knowledge/governance/AI_DEVELOPER_OUTPUT_CONTRACT.md`
- `knowledge/governance/LOCKING_RULES.md`
- `knowledge/governance/OWNER_VERIFY_TOKEN_REVOCATION_AUDIT.md`

## 14. Policy Gates

Policy Gates are executable checks that protect critical operations.

Current policy scopes include:

- task verification
- release readiness
- handoff readiness
- security readiness
- migration safety
- confirmed GitHub writes

Main commands:

```bash
kvdf policy list
kvdf policy show task_verification_policy
kvdf policy evaluate --task task-001
kvdf policy gate --task task-001 --stage verify --actor owner-001
kvdf policy gate --scope release --version v4.0.0
kvdf policy status
kvdf policy status --json
kvdf policy report --output .kabeeri/reports/policy_report.md
kvdf validate policy
```

Main files:

- `.kabeeri/policies/policy_results.json`
- `schemas/policy.schema.json`
- `schemas/policy-result.schema.json`

## 15. Design Governance

Design Governance prevents raw design sources from becoming unreviewed frontend
code. A source must become an approved text spec, then approved page specs and
component contracts can guide implementation.

It covers:

- Figma links
- screenshots
- PDFs
- reference websites
- manual design notes
- extracted text specs
- design tokens
- page specs
- component contracts
- missing design reports
- visual reviews
- design gates

Main commands:

```bash
kvdf design add --id design-source-001 --type figma --location "https://figma.com/file/..." --use "Checkout"
kvdf design snapshot design-source-001 --reference figma-export-v1 --captured-by designer-001
kvdf design spec-create --source design-source-001 --title "Checkout page" --output knowledge/frontend_specs/checkout.page.md
kvdf design spec-approve text-spec-001 --tokens knowledge/design_system/tokens.json --actor owner-001
kvdf design page-create --spec text-spec-001 --name "Checkout page"
kvdf design component-create --page page-spec-001 --name CheckoutSummary
kvdf design visual-review --page page-spec-001 --task task-001 --screenshots desktop.png,mobile.png --decision pass
kvdf design gate --task task-001 --page page-spec-001 --json
kvdf design governance --json
kvdf design missing-report --source design-source-001 --items responsive,empty-state --risk high
kvdf design theme-presets
kvdf design theme-recommend ecommerce --json
kvdf design composition-list
kvdf design composition-recommend erp --page "invoice approval table" --json
kvdf design framework-adapters
kvdf design framework-plan bootstrap --blueprint erp --composition crud_table_workspace --json
kvdf design ui-questions ecommerce --json
kvdf design ui-decisions ecommerce --page checkout --json
kvdf design playbooks
kvdf design playbook erp --json
kvdf design variant-archetypes
kvdf design variants ecommerce --page checkout --count 3 --json
kvdf design reference-list
kvdf design reference-show ADMIT-ADB01
kvdf design reference-recommend "admin ecommerce dashboard with orders and revenue"
kvdf design reference-questions ADMIT-ADB02
kvdf design reference-tasks ADMIT-ADB02 --scope "ecommerce admin dashboard"
kvdf design audit
```

`kvdf design governance` produces a unified design governance report for
sources, text specs, design tokens, page specs, component contracts, visual
reviews, UI advisor context, UI/UX reference selections, missing design reports,
and frontend-task readiness.

`kvdf design reference-recommend` now stores a reusable recommendation bundle,
including the selected reference matches, a screen plan, a module plan, and the
software design reference paths needed to resume without rescanning the catalog.

The modern UI/UX Advisor is made of smaller governed catalogs rather than one
large prompt. Theme Token Intelligence picks product-aware palette presets;
Component Composition Intelligence picks screen structures; Framework Adapter
Intelligence maps those decisions into Bootstrap, Tailwind, Bulma, Foundation,
MUI, Ant Design, daisyUI, or shadcn/ui; UI Decision Intake converts
developer/client answers into density, tone, navigation, and surface choices;
Project UI Playbooks gives every product blueprint a default UI direction; and
Creative Variant Intelligence keeps similar products visually distinct without
breaking accessibility, performance, RTL, content, motion, or governance rules.

Main references:

- `knowledge/design_sources/`
- `knowledge/design_system/`
- `knowledge/design_system/ui_ux_reference/`
- `knowledge/design_system/theme_token_intelligence/`
- `knowledge/design_system/component_composition_intelligence/`
- `knowledge/design_system/framework_adapter_intelligence/`
- `knowledge/design_system/ui_decision_intake/`
- `knowledge/design_system/project_ui_playbooks/`
- `knowledge/design_system/creative_variant_intelligence/`
- `knowledge/design_system/business_ui_patterns/`
- `knowledge/frontend_specs/`
- `knowledge/design_sources/VISUAL_ACCEPTANCE_RUNTIME.md`
- `docs/reports/V7_DESIGN_SOURCE_GOVERNANCE_IMPLEMENTATION_REPORT.md`

UI/UX Reference Library adds a stronger practical layer on top of design
governance. It contains general UI/UX system rules plus approved admin
dashboard patterns such as dark governance dashboards, multi-module e-commerce
dashboards, enterprise app shells, billing pages, and minimal shadcn-style
dashboards. Kabeeri can recommend a pattern from a short brief, generate
developer/client discovery questions, and create governed design tasks before
frontend code starts.

## 16. ADR And AI Run History

ADR and AI Run History preserve the reasoning that should survive beyond chat
history.

They cover:

- formal architecture decision records
- linked task and AI-run references
- accepted AI output records
- rejected AI output records
- unreviewed run and waste signals
- dashboard warnings for high-impact proposed ADRs and unreviewed AI runs

Main commands:

```bash
kvdf adr create --title "Use PostgreSQL" --context "Need relational consistency" --decision "Use PostgreSQL for v1"
kvdf adr list
kvdf adr approve adr-001
kvdf adr report
kvdf adr trace --json
kvdf ai-run record --task task-001 --developer agent-001 --provider openai --model gpt-4 --input-tokens 1000 --output-tokens 500
kvdf ai-run accept ai-run-001 --reviewer reviewer-001 --evidence tests-pass
kvdf ai-run reject ai-run-001 --reason "Wrong scope"
kvdf ai-run link ai-run-001 --adr adr-001
kvdf ai-run report --json
kvdf validate adr
kvdf validate ai-run
```

Main references:

- `knowledge/project_intelligence/ADR_AI_RUN_HISTORY_RUNTIME.md`
- `.kabeeri/adr/records.json`
- `.kabeeri/ai_runs/prompt_runs.jsonl`
- `.kabeeri/ai_runs/accepted_runs.jsonl`
- `.kabeeri/ai_runs/rejected_runs.jsonl`

## 17. AI Cost Control

AI Cost Control makes AI usage visible and governable.

It covers:

- pricing rules
- usage recording
- random or untracked usage
- sprint cost summaries
- context packs
- preflight estimates
- model routing
- budget approvals
- efficiency reports

Main commands:

```bash
kvdf pricing set --provider openai --model gpt --unit 1M --input 5 --output 15 --cached 1
kvdf usage record --task task-001 --developer agent-001 --input-tokens 1000 --output-tokens 500
kvdf usage record --untracked --input-tokens 1000 --output-tokens 500 --source ad-hoc-prompt
kvdf usage inquiry --input-tokens 300 --output-tokens 120 --operation owner-question
kvdf usage admin --input-tokens 500 --output-tokens 200 --operation dashboard-review
kvdf usage summary
kvdf usage efficiency
kvdf usage report --output usage-report.md
kvdf context-pack create --task task-001 --allowed-files src/api/,tests/api/
kvdf preflight estimate --task task-001 --context ctx-001 --provider openai --model gpt-4
kvdf model-route recommend --kind implementation --risk medium
kvdf budget approve --task task-001 --tokens 5000 --reason "Owner approved extra work"
```

Non-task AI operations are recorded under `admin:<operation>` buckets so owner questions, planning, documentation, dashboard reviews, and other administrative usage remain visible without pretending they belong to a feature task.

Main references:

- `knowledge/ai_cost_control/README.md`
- `knowledge/governance/TOKEN_BUDGET_RULES.md`

## 18. Live Dashboard

The Live Dashboard is a view over `.kabeeri/` state.

It can show:

- tasks
- apps
- app boundaries
- workstreams
- execution scopes
- Vibe suggestions
- Vibe captures
- Vibe sessions and briefs
- ADRs and AI run history
- AI usage and costs
- policies
- security status
- migration status
- business features
- journeys
- linked workspace summaries

Main commands:

```bash
kvdf dashboard state
kvdf dashboard export
kvdf dashboard ux
kvdf dashboard serve --port auto
kvdf dashboard serve --port 4177 --workspaces ../store-a,../store-b
kvdf dashboard workspace add --path ../store-a --name "Store A"
kvdf dashboard workspace list
kvdf dashboard workspace remove --path ../store-a
```

Dashboard UX Governance records role visibility, widget registry rules,
app/workspace strategy, live refresh behavior, and empty/error/responsive rules
inside dashboard state. Same-product apps stay inside the current workspace;
separate products, clients, or release lifecycles are linked as KVDF workspace
summaries instead of being merged.

Main reference:

- `docs/reports/dashboard/LIVE_DASHBOARD_RUNTIME.md`
- `docs/reports/dashboard/DASHBOARD_UX_GOVERNANCE.md`

## 19. VS Code Integration

The VS Code layer helps developers run common Kabeeri commands from editor
tasks and workspace files.

Main commands:

```bash
kvdf vscode scaffold
kvdf vscode status
```

Main references:

- `plugins/vscode_extension/`
- `.vscode/tasks.json`
- `.vscode/extensions.json`
- `.vscode/kvdf.commands.json`

## 20. GitHub Sync

GitHub sync can run as dry-run by default or write through GitHub CLI when
confirmed. Confirmed writes are protected by policy gates.

The `plugins/github/` bundle is installable and uninstallable through the
standard plugin loader, so the planning/reference bundle can be toggled
without changing the runtime command surface.

Main commands:

```bash
kvdf github status
kvdf github feedback list
kvdf github feedback record --type status --subject task-001 --message "Ready for review"
kvdf github plan --version v4.0.0 --dry-run
kvdf github label sync --version v4.0.0 --dry-run
kvdf github milestone sync --version v4.0.0 --dry-run
kvdf github issue sync --version v4.0.0 --dry-run
kvdf github config set --repo owner/repo --branch main --default-version v4.0.0
kvdf github label sync --version v4.0.0 --confirm
kvdf github issue sync --version v4.0.0 --confirm
kvdf github release publish --version v4.0.0 --confirm
```

Main references:

- `plugins/github_sync/`
- `plugins/github/`

`plugins/github_sync/` is the sync-policy bundle. It is installable and
uninstallable through the plugin loader, so the sync rules can be toggled
without changing the CLI runtime surface.

`kvdf github status` and `kvdf github feedback` stay local but summarize issue/PR/status/comment feedback records when the workspace is in team mode.

## 21. Security Governance

Security Governance provides a lightweight local scan for common secret patterns
and a gate for high-risk findings.

Main commands:

```bash
kvdf security scan
kvdf security scan --include app/,routes/,config/
kvdf security report
kvdf security gate
kvdf security list
kvdf security show security-scan-001
```

Main state:

- `.kabeeri/security/security_scans.json`
- `.kabeeri/security/latest_security_scan.json`
- `.kabeeri/security/latest_security_report.md`

## 22. Migration Safety

Migration Safety records migration planning and rollback readiness. It does not
execute database migrations; it governs readiness.

Main commands:

```bash
kvdf migration plan --id migration-001 --title "Upgrade schema" --from v1 --to v2 --scope database,migrations --backup backup-2026-05-08 --risk high
kvdf migration rollback-plan --plan migration-001 --backup backup-2026-05-08 --steps "restore backup,run rollback,verify app"
kvdf migration check migration-001 --owner-approved
kvdf migration report migration-001 --output .kabeeri/migrations/migration-001.report.md
kvdf migration audit
```

Main state:

- `.kabeeri/migrations/`

## 23. Business Features, Journeys, And Handoff

Kabeeri can model business-facing readiness separately from low-level tasks.

Main commands:

```bash
kvdf feature create --title "Public signup" --readiness needs_review --tasks task-001
kvdf feature status feature-001 --readiness ready_to_demo
kvdf journey create --name "Signup journey" --audience Visitors --steps Landing,Signup,Welcome
kvdf journey status journey-001 --status ready_to_show --ready-to-show
kvdf handoff package --id client-mvp --audience client --output .kabeeri/handoff/client-mvp
kvdf handoff list
kvdf handoff show handoff-001
```

Handoff packages can include:

- business summary
- technical summary
- feature readiness report
- production vs publish status
- AI token cost summary
- next roadmap report

## 24. Release Readiness

Release commands produce checks, notes, checklists, scenarios, and optional
publish actions.

Main commands:

```bash
kvdf release check
kvdf release check --version v4.0.0 --strict
kvdf release gate --version v4.0.0
kvdf release publish-gate --version v4.0.0
kvdf release scenario --version v4.0.0
kvdf release notes --version v4.0.0 --output RELEASE_NOTES.md
kvdf release checklist --version v4.0.0 --output RELEASE_CHECKLIST.md
kvdf release publish --version v4.0.0
kvdf release publish --version v4.0.0 --confirm
```

Confirmed publish paths are double-gated. `release_policy` checks repository
validation, security scan presence/status, migration safety, unresolved policy
blockers, and Owner actor evidence. `github_write_policy` checks explicit
confirmation, repository validation, security readiness, unresolved blockers,
and Owner actor evidence before any `gh` write runs.

Main references:

- `docs/production/`
- `docs/reports/`
- `CHANGELOG.md`

## 25. Independent Readiness And Governance Reports

Kabeeri can export standalone readiness and governance reports without requiring
the live dashboard, release command, or handoff package.

Main commands:

```bash
kvdf readiness report
kvdf readiness report --json
kvdf readiness report --target demo
kvdf readiness report --target release --strict
kvdf readiness report --output .kabeeri/reports/readiness_report.md
kvdf governance report
kvdf governance report --json
kvdf governance report --target workspace
kvdf governance report --target publish --strict
kvdf governance report --output .kabeeri/reports/governance_report.md
```

Readiness reports answer: "Can this workspace be shown, handed off, or reviewed
for release?" Governance reports answer: "Is the control model healthy enough
for safe development?"

Both reports are standalone snapshots derived from `.kabeeri`, with no
dashboard server requirement. Supported targets are `workspace`, `demo`,
`handoff`, `release`, and `publish`. `--strict` escalates warnings into blockers
for final review scenarios.

Main reference:

- `docs/internal/INDEPENDENT_READINESS_GOVERNANCE_REPORTS.md`

## 26. Product Packaging And Upgrade

Product packaging and upgrade commands make distribution and workspace
compatibility reviewable before npm packing, release, or team adoption.

Main commands:

```bash
kvdf package check
kvdf package check --json
kvdf package guide
kvdf upgrade guide
kvdf upgrade check
kvdf upgrade check --json
```

`package check` validates the npm package contract and reports required files,
package metadata, forbidden package-file risks, blockers, warnings, and next
actions. `upgrade check` compares the current CLI against workspace compatibility
and migration state, then reports whether migration is required or blocked.

Packaging does not publish. Upgrade does not silently mutate `.kabeeri` state.

Main references:

- `docs/production/PACKAGING_GUIDE.md`
- `docs/production/UPGRADE_GUIDE.md`

## 27. Validation And Doctor

Validation and doctor commands are the basic health checks for the repository
and local workspace state.

They cover:

- environment and repository status
- generator JSON validity
- prompt pack manifests
- task and acceptance records
- policy definitions and results
- runtime schema registry coverage for `.kabeeri/` JSON and JSONL files
- questionnaire state
- business feature and journey state
- app routes
- workstream governance
- local workspace JSON/JSONL state
- blocked and invalid scenario reporting

Main commands:

```bash
kvdf doctor
kvdf validate
kvdf validate task
kvdf validate acceptance
kvdf validate prompt-packs
kvdf validate generators
kvdf validate runtime-schemas
kvdf validate policy
kvdf validate questionnaire
kvdf validate business
kvdf validate routes
kvdf validate workstream
kvdf validate adr
kvdf validate ai-run
kvdf validate blocked-scenarios
```

Main references:

- `src/cli/validate.js`
- `cli/CLI_SAFETY_RULES.md`
- `schemas/RUNTIME_SCHEMA_REGISTRY.md`

## 28. Roadmap And Plan Inspection

Kabeeri keeps planning packages and roadmap sources in the repository, then
lets the CLI inspect packaged plans.

Main commands:

```bash
kvdf plan list
kvdf plan show v3.0.0
kvdf plan show v4.0.0
```

Main references:

- `ROADMAP.md`
- `docs/reports/platform_integration/`
- `plugins/multi_ai_governance/`
- `knowledge/project_intelligence/`
- `docs/codex_context/roadmap_sources/`
- `docs/reports/ROADMAP_SOURCE_INDEX.md`
- `docs/reports/REQUIREMENTS_TRACEABILITY_MATRIX.md`

## 29. Reports And Traceability

The reports folder records repository analysis, implementation reports, gap
reports, validation results, roadmap ingestion, requirement traceability, and
publish decisions.

Important references:

- `docs/reports/GAP_REPORT.md`
- `docs/reports/REQUIREMENTS_TRACEABILITY_MATRIX.md`
- `docs/reports/CURRENT_REPOSITORY_ANALYSIS.md`
- `docs/reports/IMPLEMENTATION_PLAN.md`
- `docs/reports/MISSING_REQUIREMENTS_BACKLOG.md`

## 30. Repository Governance

Repository governance describes how people should contribute to Kabeeri VDF and
how the open-source project is managed.

Main references:

- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `GOVERNANCE.md`
- `SECURITY.md`
- `LICENSE`

## 31. Documentation Site

The repository includes a static documentation site with Arabic and English
pages, plus generated site manifest, page contract artifacts, and deep
publishing coverage artifacts.

Main references:

- `docs/site/README.md`
- `docs/site/pages/en/`
- `docs/site/pages/ar/`
- `docs/site/generate-pages.js`
- `docs/site/site-manifest.json`
- `docs/site/page-contracts.json`
- `docs/reports/DOCS_SITE_DEEP_PUBLISHING_COVERAGE.json`

## 32. Where To Start By Goal

| Goal | Start Here |
| --- | --- |
| Know every command | `docs/cli/CLI_COMMAND_REFERENCE.md` |
| Understand the repository layout | `knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json` and `docs/architecture/REPOSITORY_FOLDERING_SYSTEM.md` |
| Understand Kabeeri in 4 parts | `docs/site/pages/en/kabeeri-4-parts.html` and `docs/site/pages/ar/kabeeri-4-parts.html` |
| Start a new project | `kvdf create --profile standard --output my-project` |
| See example projects | `kvdf example list` |
| Talk naturally and create governed tasks | `knowledge/vibe_ux/VIBE_FIRST_RUNTIME.md` |
| Govern multiple apps in one product | `knowledge/governance/APP_BOUNDARY_GOVERNANCE.md` |
| Prevent scope creep during AI execution | `knowledge/governance/EXECUTION_SCOPE_GOVERNANCE.md` |
| Control team and AI work boundaries | `knowledge/governance/WORKSTREAM_GOVERNANCE.md` |
| Control design-to-frontend flow | `knowledge/design_sources/README.md` |
| Reduce AI tokens and cost | `knowledge/ai_cost_control/README.md` |
| Preserve durable architecture decisions | `knowledge/project_intelligence/ADR_AI_RUN_HISTORY_RUNTIME.md` |
| See live project status | `docs/reports/dashboard/LIVE_DASHBOARD_RUNTIME.md` |
| Check repository/workspace health | `kvdf doctor` and `kvdf validate` |
| Inspect roadmap plans | `kvdf plan list` |
| Prepare Owner/client delivery | `kvdf handoff package` |
| Prepare release | `kvdf release check --strict` |

## 33. Source Of Truth Rules

- `.kabeeri/` is the runtime source of truth for a project workspace.
- CLI commands mutate or validate `.kabeeri/` state.
- The physical repository root is grouped into `src/`, `knowledge/`, `packs/`,
  `plugins/`, `docs/`, `schemas/`, `tests/`, `cli/`, and `bin/`.
- Legacy root paths are compatibility aliases only; new source files should use
  the new physical layout.
- Dashboard, VS Code, docs site, and chat are surfaces over that state.
- Vibe-first creates reviewable suggestions before execution.
- Task access tokens govern permission; AI usage tokens measure cost.
- Owner verification is the final authority for task completion.
- GitHub confirmed writes require explicit confirmation and policy gates.
- Separate products should use separate KVDF folders.
| Scale-Specific Packs | Recommends large-system prompt bundle combinations for enterprise, regulated, and high-risk projects so Kabeeri can scale beyond a single stack prompt pack. | `.kabeeri/reports/scale_specific_packs_report.json`, `kvdf prompt-pack scale` |
