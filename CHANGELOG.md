# Changelog

## [0.2.0] — Release 2

### Added

- Verified `kabeeri-075` by confirming the command reference and capability reference already document the command lifecycle ledger plus the important folder ownership map and remaining migration gaps.

- Verified `kabeeri-074` by confirming docs and site surfaces already direct readers to the correct owner-track and app-track entry points.

- Verified `kabeeri-073` by confirming prompt-pack, questionnaire, and vibe surfaces already support owner-track and app-track contexts.

- Verified `kabeeri-072` by confirming dashboard state, live reports, and resume summaries separate owner-track and app-track context.

- Verified `kabeeri-071` by confirming task tracker, token scope, and lock scope derive from workstream and app boundaries.

- Verified `kabeeri-070` by confirming workspace bootstrap and app workspace commands already keep owner and developer app state separated.

- Verified `kabeeri-069` by confirming help and docs already separate owner-track and app-track command groups by workspace type.

- Verified `kabeeri-068` by confirming the existing resume, app, task, and questionnaire surfaces already support the app-developer track.

- Verified `kabeeri-067` by confirming owner-only controls, policy gates, and evolution commands already compose the owner-track surface.

- Verified `kabeeri-066` by confirming the CLI help and routing guidance already separate Framework Owner and Vibe App Developer tracks.

- Verified `kabeeri-065` by confirming release, handoff, and reports surfaces already produce linked local artifacts from the same state.

- Verified `kabeeri-064` by confirming the command lifecycle ledger documents active, migrated, compatibility, and duplicated surfaces.

- Verified `kabeeri-063` by confirming `docs generate` already keeps command reference, changelog, owner state, and release notes in sync.

- Verified `kabeeri-062` by confirming `kvdf structure` already provides normalized repository foldering maps, validation, and navigation guidance.

- Verified `kabeeri-061` by confirming `kvdf design` already captures design intelligence, visual reviews, and UI advisor outputs as durable CLI records.

- Verified `kabeeri-060` by confirming ADR create/list/show/approve/reject/supersede/report/trace flows already persist durable decision records.

- Verified `kabeeri-059` by confirming owner login/logout, session state, and privileged command gates already enforce local session boundaries.

- Verified `kabeeri-058` by confirming handoff package and reports surfaces already generate structured local artifacts from `.kabeeri` state.

- Verified `kabeeri-057` by confirming app workspace scaffolding, registry state, and product boundary rules are already covered by the current CLI and tests.

- Verified `kabeeri-056` by confirming release publish-gate and GitHub write policy surfaces already block unsafe confirmed publishing.

- Verified `kabeeri-055` by confirming migration plan, rollback-plan, check, report, list, show, and audit outputs already track local migration state.

- Verified `kabeeri-054` by confirming security scan, report, gate, list, and show outputs already write and read local security state.

- Verified `kabeeri-053` by confirming GitHub, VS Code, sync, and release workflows are already callable from CLI and documented in the command surface.

- Verified `kabeeri-052` by confirming generator, init, and questionnaire surfaces already produce governed scaffold and intake artifacts for supported profiles.

- Verified `kabeeri-051` by confirming prompt-pack composition and questionnaire planning already share reusable compact guidance across AI flows.

- Verified `kabeeri-050` by confirming docs generation and validation keep the docs site, command reference, and localized guidance in sync.

- Verified `kabeeri-049` by confirming AI run, capture, and audit surfaces already trace a task through provenance without relying on chat history.

- Verified `kabeeri-048` by confirming multi-AI status, leader calls, queue dispatch, and relay inbox surfaces already separate leader and worker behavior cleanly.

- Verified `kabeeri-047` by confirming usage summary and cost-control surfaces already expose spend, approvals, and budget pressure from `.kabeeri` state.

- Verified `kabeeri-046` by confirming release checks already surface policy, security, and migration blockers before confirmed publish steps and keep the release gate blocked while warnings remain.

- Verified `kabeeri-045` by confirming readiness, governance, and release report surfaces already derive from `.kabeeri` state, expose blockers, and export clean markdown outputs; the task tracker now marks the task `owner_verified`.

- Verified `kabeeri-044` by confirming dashboard state and dashboard help surfaces already expose consistent sections and refresh from `.kabeeri` source state; the task tracker now marks the task `owner_verified`.

- Verified `kabeeri-043` by confirming structured and agile delivery commands already expose distinct runtime artifacts and readiness outputs through help and tests; the task tracker now marks the task `owner_verified`.

- Verified `kabeeri-042` by confirming blueprint, data-design, and design commands already produce distinct CLI-driven reports and are surfaced through help and tests; the task tracker now marks the task `owner_verified`.

- Verified `kabeeri-041` by confirming questionnaire coverage, missing-answer reports, and adaptive intake outputs are already implemented in the CLI questionnaire commands and are surfaced through help and tests; the task tracker now marks the task `owner_verified`.

- Verified `kabeeri-040` by confirming the owner docs token gate and owner transfer lifecycle are already implemented in the CLI owner commands, covered by integration tests, and surfaced through the help and governance docs; the task tracker now marks the task `owner_verified`.

- Completed `kabeeri-039` by deriving task token and lock scopes from task app and workstream boundaries, tightening the scope checks to fail closed on broader requests, and updating the governance docs and integration coverage.

- Completed `kabeeri-038` by persisting session track decisions from resume, entry, and onboarding into durable state so later commands can read the current route consistently.

- Completed `kabeeri-037` by seeding deterministic `.kabeeri` workspace metadata, delivery-mode state, and startup guidance, then registering the new runtime files in the schema registry so init and validation stay green.

- Completed `kabeeri-036` by aligning generator profiles with governed intake scaffolds, adding architecture-guide and folder-questionnaire markdown files, and updating project-intake guidance and tests.

- Completed `kabeeri-035` by aligning the docs site, English docs, and Arabic docs with the current command surface through explicit docs validation, ai-run provenance, and localized parity notes.

- Completed `kabeeri-034` by adding compact guidance to prompt-pack composition, surfacing prompt-pack recommendations in questionnaire planning, and documenting the short-path vibe runtime flow.

- Completed `kabeeri-033` by adding an AI run provenance model that links execution, usage, captures, and audit events through durable trace records and a CLI provenance report.

- Completed `kabeeri-024` by adding read-only GitHub and VS Code integration reports, wiring the new report actions into CLI help and source-truth docs, and surfacing the editor bridge as explicit tasks and palette items so the integration surfaces stay traceable without hidden writes.

- Completed `task-020` by updating the changelog and owner checkpoint so the `evo-004` follow-up work remains documented after the human docs, capability reference, and automated tests slices.

- Completed `task-016` by adding durable execution-record guidance to task tracking docs, aligning task template statuses with canonical tracker states, and normalizing multi-workstream follow-up tasks to `integration` so task validation passes again.

- Marked `task-015` as `owner_verified` after confirming the durable runtime implementation for `evo-004` is already present in the CLI evolution services and commands, while leaving the source change open for its remaining follow-up tasks.

- Moved `uniqueList` callers in `ai_run`, `vibe_interactions`, `prompt_pack`, and `project_profile` onto the shared collections helper, reducing another class of duplicate command-local utilities.

- Moved `uniqueList` callers in `ai_run` and `vibe_interactions` onto the shared collections helper, and moved `summarizeBy` callers in `security` and `services/evolution` onto shared state utilities so those helper patterns stay centralized.

- Centralized the last `readStateArray` helper in `src/cli/commands/cost_control.js` onto shared state utilities, leaving `src/cli/services/state_utils.js` as the single source of truth for this state-loading pattern.

- Extended the shared `state_utils` helper to the remaining command-local readers in `change_control`, `traceability`, `migration`, `security`, `evolution`, and `services/evolution`, so the broader runtime-services cleanup stays centralized without changing report behavior.

- Centralized the remaining JSONL helpers in `src/cli/services/jsonl.js`, moved the last local `readStateArray` callers in `ai_run`, `vibe_interactions`, and `usage_pricing` onto shared state utilities, and added direct tests for `appendJsonLine` and `writeJsonLines` so the runtime-services extraction stays covered.

- Added a shared JSONL reader in `src/cli/services/jsonl.js` and reused it from the CLI façade and dashboard/AI-memory services so line-delimited state reads stay centralized.

- Added shared report item and output helpers in `src/cli/services/report_items.js` and `src/cli/services/report_output.js`, plus shared state readers in `src/cli/services/state_utils.js`, so dashboard, readiness, governance, package, and usage reports reuse the same formatting and file-loading logic.

- Added a shared session handoff builder in `src/cli/services/session_handoff.js` and reused it from `kvdf session` so the resumable markdown handoff report stays centralized in the runtime-services layer.
- Added shared collections helpers in `src/cli/services/collections.js` and reused them from the CLI façade so CSV parsing, de-duplication, path matching, expiry checks, and title casing stay centralized in the runtime-services layer.

- Added shared text helpers in `src/cli/services/text.js` and reused them from the CLI façade so language detection, output-language routing, and keyword matching stay centralized in the runtime-services layer.

- Added shared command suggestion helpers in `src/cli/services/command_suggestions.js` so unknown CLI commands can use a reusable suggestion engine instead of keeping the Levenshtein lookup in the façade.
- Added shared git snapshot helpers in `src/cli/services/git_snapshot.js` and reused them from `resume` so local git status detection stays centralized in the runtime-services layer.
- Added `kvdf evolution report` and `docs/reports/EVO_AUTO_041_EXECUTION_REPORT.md` so the next open Evolution priority can be resumed from a durable report without chat history.
- Added `kvdf capability search` and `docs/reports/KVDF_CAPABILITY_SEARCH_INDEX.json` so the capability registry, CLI surface, documentation matrix, and roadmap views can be searched by track, capability, command, phase, and report type.
- Added `kvdf validate blocked-scenarios` and the track-aware blocked-scenarios report so invalid or blocked runtime scenarios are surfaced clearly with next actions while keeping `validate all` stable.
- Added `kvdf task coverage` with `.kabeeri/reports/task_coverage_board.json` and per-task task coverage reports so each task can be broken into full temporary execution slices and the remaining slices stay visible before the queue closes.
- Extended `kvdf governance report` with a governance coverage view for trust, safety, privacy, compliance, and extensibility so the workspace governance snapshot explains the broader operating model, not only owner/workstream/token/lock health.
- Added persisted developer onboarding with `kvdf onboarding report` and `.kabeeri/reports/session_onboarding.json` so the first-session enter/route/resume guidance can be recalled later without re-reading chat history.
- Added `kvdf capability matrix` and `.kabeeri/reports/KVDF_CAPABILITY_DOC_MATRIX.json` so every capability now points at docs, CLI, runtime, tests, and report links in one traceable matrix.
- Added `kvdf source-package normalize` and `.kabeeri/reports/KVDF_NEW_FEATURES_DOCS_NORMALIZATION_MAP.md` so the imported source roots and sections have lowercase aliases with preserved mappings before redistribution.
- Added a docs-generation workflow report with `kvdf docs workflow`, a `page-templates.json` template catalog, and generated docs workflow validation so docs generation is treated as a resumable workflow with templates, manifests, page contracts, and coverage instead of loose files.
- Added scale-specific prompt pack routing with `kvdf prompt-pack scale` and the `scale_specific_packs_report.json` report so enterprise and high-risk projects can receive larger prompt bundles than the default stack pack.
- Added `kvdf project profile report` and `.kabeeri/reports/project_profile_report.json` so the current Lite/Standard/Enterprise routing decision can be resumed without re-reading the live state file.
- Added docs-to-CLI synchronization with `kvdf docs build`, `kvdf docs preview`, and `kvdf docs sync`, plus a generated `DOCS_SITE_SYNC_REPORT.json` so the docs site can stay aligned with help text and runtime behavior.
- Added a capability CLI surface report with `kvdf capability surface` and `docs/reports/KVDF_CAPABILITY_CLI_SURFACE.json` so every imported capability area is mapped to a clear command family and docs reference.
- Added docs site deep publishing coverage with `kvdf docs coverage`, a generated `DOCS_SITE_DEEP_PUBLISHING_COVERAGE.json` report, and validation hooks so the site can show which developer-facing families are fully published.
- Added a change-control layer with `kvdf change report` and `kvdf risk report` so structured change requests, Evolution changes, and risk register entries appear together in one consolidated report, backed by `change_control_report.json`, schema registry entries, and integration tests.
- Added a traceability layer with `kvdf trace report` so task assessments, ADRs, AI runs, docs source-of-truth checks, and verification commands can be reviewed together before change control decisions.
- Strengthened Multi-AI Governance integration with Evolution Steward. The active Leader now always knows the current Evolution temporary slice from `kvdf multi-ai status`, Worker queues are scoped to the active priority with automatic expiry, merge bundles include Evolution priority tracking, and the scope/dependency map documents how Multi-AI respects Evolution as the global priority governor without circular dependencies.
- Verified Multi-AI Governance completeness: runtime state, CLI commands, help text, schemas, validation, docs, capabilities reference, and integration tests are all wired together, so multiple AI tools can work safely across devices with provenance tracking.
- Added semantic merge preview and surface planning for Multi-AI bundles, so merge bundles now record file sections, surface risk, and owner-review-required overlaps before commit.
- Added integration coverage for Multi-AI sync distribution, queue advancement, and merge commit provenance.
- Added queue lifecycle and merge commit operations for Multi-AI Governance so distributed slices can be claimed, advanced, completed, and merged with provenance.
- Added Evolution-to-Multi-AI sync so the active Leader can mirror the current Evolution temporary queue and distribute slices to worker AIs with provenance tracking.
- Added Multi-AI Governance with `kvdf multi-ai` status/leader/queue/merge commands, a repo-backed `.kabeeri/multi_ai_governance.json` runtime state, semantic merge bundle validation, and Evolution-led leader orchestration.
- Added temporary execution priorities for the active `in_progress` Evolution priority, with `kvdf evolution temp`, `kvdf evolution temp advance`, and `kvdf evolution temp complete` managing a short-lived slice queue that expires with the source priority.
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
- Strengthened the Vibe-first command flow so `kvdf vibe approve` records approval separately from `kvdf vibe convert`, and high-risk suggestions must be approved before conversion unless explicitly forced.
- Expanded post-work capture into a full lifecycle with git/manual changed-file details, scan previews, task matching, evidence updates, link/convert/reject/resolve commands, capture validation, missing-evidence tracking, and dashboard next actions.
- Deepened Dashboard UX Governance with runtime role visibility, widget registry, app/workspace strategy, live/stale state rules, and stronger `kvdf dashboard ux` checks for same-product multi-app and linked-workspace workflows.
- Added Agile Templates Runtime with `.kabeeri/agile.json`, backlog/epic/story/sprint planning/sprint review commands, story-to-task conversion, Agile validation, dashboard visibility, and documentation.
- Deepened Agile templates with release planning/readiness, Definition of Done, story splitting, release plan templates, release validation, and Agile dashboard release readiness.
- Expanded Agile into a Scrum-grade operational runtime with stricter Definition of Ready checks, impediments, retrospectives, velocity/forecast health, `.kabeeri/dashboard/agile_state.json`, and `/__kvdf/api/agile`.
- Added Structured Delivery Runtime for Waterfall-style enterprise delivery with approved requirements, phases, deliverables, risks, change requests, phase gates, traceability, `.kabeeri/structured.json`, `.kabeeri/dashboard/structured_state.json`, and `/__kvdf/api/structured`.
- Added Delivery Mode Advisor with `kvdf delivery recommend`, `kvdf delivery choose`, and `.kabeeri/delivery_decisions.json` so Kabeeri/Codex can suggest Agile or Structured from the requested application context while leaving the final decision to the developer.
- Added Product Blueprint Catalog with `kvdf blueprint` commands and `.kabeeri/product_blueprints.json` so Kabeeri/Codex can map market systems to channels, backend modules, frontend pages, database entities, workstreams, and risks before task creation.
- Added UI/UX Reference Library with governed design rules, admin dashboard reference patterns, `.kabeeri/design_sources/ui_ux_reference.json`, and `kvdf design reference-*` commands for pattern recommendation, design questions, and frontend task generation.
- Added unified Design Governance reports through `kvdf design governance`, covering source snapshots, approved specs, tokens, page/component contracts, visual evidence, accessibility/contrast checks, UI advisor context, missing design reports, and next actions.
- Added Bootstrap 5.3.8 as an installed dependency and approved UI/UX design-system foundation, including `BOOT-UI01` reference guidance, design questions, task templates, and UI advisor recommendation output.
- Added Tailwind CSS 4.3.0 and `@tailwindcss/cli` 4.3.0 as installed dev dependencies and approved UI/UX design-system foundations, including `TAIL-UI01` reference guidance, design questions, task templates, and UI advisor recommendation output.
- Added approved UI/UX library foundations for Bulma 1.0.4, Foundation Sites 6.9.0, MUI 9.0.1, Ant Design 6.3.7, daisyUI 5.5.19, and shadcn/ui CLI 4.7.0, including reference guidance, compatibility rules, questions, and task templates.
- Added Kabeeri UI Execution Kit with low-token UI contracts, semantic color system, controlled creative variation rules, icon map, button presets, component decision map, page recipes, templates, UI review checklist, and static UI checker.
- Added KVDF-inspired business UI patterns, user flow references, reusable UI template metadata schema, and motion/microinteraction guidance so Kabeeri can combine governed UI execution with product-specific creative variation.
- Added framework boundary enforcement to post-work captures and AI session file scopes so user application workspaces cannot accidentally record Kabeeri framework internals as app work.
- Added priority business UI template packs for eCommerce, SaaS, admin panels, dashboards, CRM, ERP, booking, and AI products, including reusable HTML snippets, template metadata, dashboard-style recommendations, and compact implementation prompts in UI advisor output.
- Added full business UI reference libraries, five files per priority business pack, modeled after the existing admin dashboard references and returned by UI advisor recommendations.
- Expanded detailed business UI references to include landing pages, corporate websites, marketplaces, delivery, LMS/EdTech, FinTech, HealthTech, and real estate, bringing the governed business reference library to 80 full reference files.
- Strengthened `MOTION_MICROINTERACTIONS.md` into a full motion design system with decision workflow, business motion map, library decision matrix, tokens, CSS presets, component recipes, reduced-motion rules, performance guidance, accessibility rules, assessment template, and review checklist.
- Added an RTL Arabic UI Reference Pack and wired it into UI recommendations, implementation prompts, component rules, acceptance checks, and the design blueprint so Arabic, bilingual, MENA, and RTL surfaces receive typography, direction, layout, forms, tables, numbers, dates, icons, accessibility, and review guidance automatically.
- Added an Accessibility and Inclusive UI Reference Pack and wired it into UI recommendations, implementation prompts, UI review, component rules, acceptance checks, and the design blueprint so every generated interface gets an accessibility level plus semantic HTML, keyboard, focus, forms, tables, dialogs, contrast, readable content, and inclusive state guidance.
- Added a Performance and Core Web Vitals UI Pack and wired it into UI recommendations, implementation prompts, UI review, component rules, acceptance checks, and the design blueprint so every generated interface gets a performance level plus LCP, INP, CLS, image/media, font, CSS, JavaScript, data rendering, skeleton, and loading-state guidance.
- Added a Content and Microcopy UX Pack and wired it into UI recommendations, implementation prompts, UI review, component rules, acceptance checks, and the design blueprint so generated interfaces get product-aware action labels, empty/error state copy, validation messages, onboarding help, confirmations, status labels, and tone guidance.
- Added Framework Adapter Intelligence with adapter catalog, compatibility rules, review checklist, `kvdf design framework-adapters`, `kvdf design framework-plan`, and UI advisor wiring so Kabeeri can translate tokens and screen compositions into Bootstrap, Tailwind CSS, Bulma, Foundation, MUI, Ant Design, daisyUI, or shadcn/ui implementation plans without repeating long framework instructions.
- Added Creative Variant Intelligence with bounded variant archetypes, generation contract, review checklist, `kvdf design variant-archetypes`, `kvdf design variants`, and UI advisor wiring so similar product requests can produce distinct professional directions while preserving tokens, composition, adapter, accessibility, performance, motion, content, and RTL rules.
- Added UI Decision Intake with compact UI questions, answer mapping rules, review checklist, `kvdf design ui-questions`, `kvdf design ui-decisions`, and UI advisor wiring so developer/client answers choose variant, palette, density, navigation, surface style, tone, adapter, and composition instead of leaving visual direction to generic AI invention.
- Added Project UI Playbooks for all 25 product blueprints with default variant archetype, composition, adapter preferences, density, navigation pattern, focus areas, critical UI questions, and avoid rules, plus `kvdf design playbooks`, `kvdf design playbook`, and UI advisor wiring.
- Added Data Design Blueprint with `kvdf data-design` commands and `.kabeeri/data_design.json` so Kabeeri/Codex can design database models from business workflow, modules, entities, constraints, snapshots, audit, indexes, transactions, idempotency, and migration safety.
- Added UI/UX Advisor under `kvdf design recommend` with `.kabeeri/design_sources/ui_advisor.json` so Kabeeri/Codex can choose frontend experience patterns, stacks, component groups, page templates, SEO/GEO rules, dashboard rules, and mobile UX rules from the selected product blueprint.
- Added Repository Foldering System with `standard_systems/REPOSITORY_FOLDERING_MAP.json`, `docs/architecture/REPOSITORY_FOLDERING_SYSTEM.md`, `kvdf structure`, and `kvdf validate foldering` to organize Kabeeri's growing root folders into stable core, knowledge, packs, integrations, contracts, docs, quality, and runtime-state groups.
- Added adaptive questionnaire intake planning with `kvdf questionnaire plan`, combining Product Blueprints, framework prompt packs, Data Design, UI/UX Advisor, and Delivery Mode Advisor into focused developer questions stored in `.kabeeri/questionnaires/adaptive_intake_plan.json`.
- Added user-language runtime behavior for adaptive intake so generated plans record input/output language and follow the user's language unless explicitly overridden.
- Added init-time guided intake: interactive `kvdf init` can ask for the application goal, while `kvdf init --goal "..."` creates adaptive questions and docs-first tasks in non-interactive flows.
- Added a docs-first gate so implementation tasks cannot start while init-generated project documentation tasks are still open.
- Added Evolution Steward with `.kabeeri/evolution.json`, `kvdf evolution`, impact plans, follow-up task generation, dashboard/live reports visibility, schema coverage, and capability documentation for governing Kabeeri's own updates.
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
- Expanded ADR / AI Run History with two-way ADR/run linking, `kvdf ai-run link`, `kvdf adr trace`, acceptance-rate reporting, by-ADR AI run summaries, and decision trace reports with cost/token evidence.
- Added Common Prompt Layer with `prompt_packs/common/`, `kvdf prompt-pack compose`, prompt composition records, validation, dashboard visibility, and shared scope/review/AI-run rules for all stack prompt packs.
- Expanded Common Prompt Layer to v0.3.0 with shared cost/context, policy gate, design, security, migration, and traceability rules embedded in composed prompt metadata.
- Added Runtime Schema Registry with `schemas/runtime/`, `.kabeeri` JSON/JSONL mappings, `kvdf validate runtime-schemas`, and full validation coverage for runtime state drift.
- Unified task tracking and task governance under `knowledge/task_tracking/`, with `TASK_GOVERNANCE.md` as the canonical policy and `knowledge/governance/TASK_GOVERNANCE.md` kept only as a compatibility pointer.
- Added independent `kvdf readiness report` and `kvdf governance report` commands with Markdown/JSON output for standalone readiness and governance reviews.
- Strengthened independent readiness/governance reports with target-aware snapshots, strict mode, standalone metadata, source-of-truth notes, and a dedicated internal operating guide.
- Strengthened release and GitHub publish gates so confirmed GitHub release publishing must pass both `release_policy` and `github_write_policy` before any `gh` write runs.
- Added product packaging and upgrade support with `package.json` package file coverage, `npm run pack:check`, `kvdf package check`, `kvdf upgrade check`, and production packaging/upgrade guides.
- Added `kvdf resume` / `kvdf start` as a session resume guard that separates Kabeeri framework-owner development from user app workspaces and clarifies app npm roots versus the Kabeeri engine root.
- Added `kvdf guard` as a framework boundary guard that blocks accidental Kabeeri-internal edits from user application workspaces unless framework edits are explicitly allowed.
- Added `kvdf sync` as a GitHub/team sync preflight with read-only status and dry-run pull/push guidance unless `--confirm` is provided.
- Added `kvdf conflict scan` as a pre-development drift check for command/help alignment, guard wiring, validation health, and workspace task/capture/session/lock conflicts.
- Strengthened Evolution Steward as the single framework-development backlog with ordered priorities, `kvdf evolution priorities`, `kvdf evolution next`, duplicate-capability signals, and resume-scan visibility.
- Added Evolution priority status updates through `kvdf evolution priority <id> --status ...` and made resume output include the top development priorities for every framework-owner session.
- Enhanced `kvdf resume` for framework-owner sessions with a parsed owner checkpoint, compact git summary, and one exact next development action before new work starts.
- Continued CLI modularization by moving `doctor` and `validate` command handling into `src/cli/commands/health.js`.
- Continued CLI modularization by moving `delivery` command handling and the shared delivery recommendation helper into `src/cli/commands/delivery.js`.
- Continued CLI modularization by moving `memory` command handling and memory summary generation into `src/cli/commands/memory.js`.
- Continued CLI modularization by moving `prompt-pack` command handling and prompt-pack catalog helpers into `src/cli/commands/prompt_pack.js`.
- Continued CLI modularization by moving `audit` command handling and audit report reading into `src/cli/commands/audit.js`.
- Continued CLI modularization by moving `generator` / `create` command handling and skeleton governance task creation into `src/cli/commands/generator.js`.
- Continued CLI modularization by moving `vscode` command handling and VS Code scaffold builders into `src/cli/commands/vscode.js`.
- Continued CLI modularization by moving `docs` / `doc` site command handling into `src/cli/commands/docs_site.js`.
- Continued CLI modularization by moving `budget` command handling into `src/cli/commands/budget.js`.
- Continued CLI modularization by moving `context-pack`, `preflight`, and `model-route` cost-control command handling into `src/cli/commands/cost_control.js`.
- Continued CLI modularization by moving `handoff` command handling and handoff report builders into `src/cli/commands/handoff.js`.
- Continued CLI modularization by moving `security` command handling and the latest security scan helper into `src/cli/commands/security.js`.
- Continued CLI modularization by moving `migration` command handling and migration policy helpers into `src/cli/commands/migration.js`.
- Continued CLI modularization by moving `token` command handling and execution-scope helpers into `src/cli/commands/token.js`.
- Continued CLI modularization by moving `lock` command handling and lock-scope helpers into `src/cli/commands/lock.js`.
- Continued CLI modularization by moving `developer` / `agent` identity command handling into `src/cli/commands/identity.js`.
- Continued CLI modularization by moving `owner` auth and transfer command handling into `src/cli/commands/owner.js`.
- Continued CLI modularization by moving `acceptance` command handling into `src/cli/commands/acceptance.js`.
- Continued CLI modularization by moving `usage` / `pricing` command handling and AI cost helpers into `src/cli/commands/usage_pricing.js`.
- Continued CLI modularization by moving `sprint` command handling into `src/cli/commands/sprint.js`.
- Continued CLI modularization by moving `readiness` / `governance` runtime report routing into `src/cli/commands/runtime_report.js`.
- Continued CLI modularization by moving `reports` command handling into `src/cli/commands/reports.js`.
- Continued CLI modularization by moving `release` command handling into `src/cli/commands/release.js`.
- Continued CLI modularization by moving `session` command handling into `src/cli/commands/session.js`.
- Continued CLI modularization by moving `github` command handling into `src/cli/commands/github.js`.
- Continued CLI modularization by moving `adr` command handling into `src/cli/commands/adr.js`.
- Added an Evolution Steward placement gate: new feature requests during an `in_progress` priority now show a recommended order and require explicit Owner confirmation before creating changes or tasks.
- Added an Evolution deferred ideas store with `kvdf evolution defer`, `kvdf evolution deferred`, restore gating, schema coverage, and a single final deferred-ideas bucket in development priorities.
- Added the React Native Expo prompt pack with Expo-specific mobile prompts, manifest, export/compose support, safety rules for secrets/native permissions/EAS handoff, and CLI integration tests.
- Expanded the React Native Expo prompt pack with backend API contract and accessibility/performance prompts plus manifest-driven prompt selection keywords for more accurate `prompt-pack compose` output.
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

- [knowledge/task_tracking/TASK_GOVERNANCE.md](knowledge/task_tracking/TASK_GOVERNANCE.md)
- [knowledge/task_tracking/README.md](knowledge/task_tracking/README.md)
- [knowledge/task_tracking/TASK_INTAKE_TEMPLATE.md](knowledge/task_tracking/TASK_INTAKE_TEMPLATE.md)
- [knowledge/task_tracking/TASK_PROVENANCE_SCHEMA.json](knowledge/task_tracking/TASK_PROVENANCE_SCHEMA.json)
- [knowledge/task_tracking/task.schema.json](knowledge/task_tracking/task.schema.json)
- [knowledge/task_tracking/TASK_REVIEW_CHECKLIST.md](knowledge/task_tracking/TASK_REVIEW_CHECKLIST.md)

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

## [Unreleased] - UI Design Intelligence

- Added Visual Quality Governance reference pack with scored design QA rubric, evidence rules, rework decisions, and integration notes.
- Enhanced design visual reviews with runtime quality scoring and governance warnings for weak review evidence.
- Added Theme Token Intelligence reference pack for product-aware token presets and shorter UI implementation prompts.
- Added Component Composition Intelligence reference pack for screen-level component composition IDs and low-token implementation prompts.
- Expanded `kvdf validate ui-design` to verify the modern design-system runtime catalogs, including UI/UX references, theme presets, screen compositions, framework adapters, creative variants, UI decision questions, project playbooks, business UI patterns, business references, and template packs.
- Updated the CLI command reference so the UI/UX Advisor section now documents theme presets, composition recommendations, framework adapter plans, UI decision intake, project playbooks, and creative variants alongside UI/UX references.
- Expanded the UI design advisor integration test so it asserts the deeper `validate ui-design` checks for theme presets, screen compositions, framework adapters, creative variants, project playbooks, and business UI references.
- Updated the main system capabilities reference so UI/UX Advisor now lists theme token intelligence, component composition intelligence, framework adapters, UI decision intake, project playbooks, creative variants, and business UI pattern references as first-class design-system capabilities.
