# Owner Development State

This file is the personal development checkpoint for the Kabeeri VDF repository owner and creator.
Use it to resume work after a disconnected session without guessing what happened last.

Important: this file is safe to commit to GitHub only if it contains no secrets, passphrases, tokens, private client data, or unpublished commercial details.

## Resume First

When starting a new development session:

1. Read this file first.
2. Run `git status --short`.
3. Run `npm test` before changing behavior, unless the next task is documentation-only.
4. Pick the first item in `Next Actions`.
5. Before ending the session, update `Current State`, `Last Session Notes`, and `Next Actions`.

## Current State

- Date: 2026-05-14
- Branch: `main`
- Latest known commit: `8b652d9 Finalize temp queue and CLI refactor`
- Package: `kabeeri-vdf`
- CLI binary: `kvdf`
- Test command: `npm test`
- Smoke command: `npm run test:smoke`
- Full local check: `npm run check`
- Latest session focus: The EVO batch execution queue now auto-assigns missing approved tasks to the active Multi-AI leader first, with `codex` as the fallback root AI tool.
- Latest session update: `kvdf batch-exe` now resolves the active leader from `.kabeeri/multi_ai_governance.json`, auto-fills missing EVO assignees with that leader or `codex`, persists the assignment into `.kabeeri/tasks.json`, and reports the batch as ready when no other blockers remain.

## Active Focus

Build Kabeeri VDF as a practical framework and CLI engine for:

- project intake and structured delivery
- task governance and Owner verification
- prompt packs and framework-specific execution
- adaptive questionnaires and capability coverage
- multi-AI governance, locks, sessions, and access tokens
- dashboards, GitHub sync, release readiness, handoff, security, migration, and AI cost control

## Last Session Notes

- 2026-05-14: Archived all closed tasks into `.kabeeri/task_trash.json` after closure, leaving `.kabeeri/tasks.json` empty and the tracker with no active tasks.
- 2026-05-13: Verified `task-119` by linking the evo-005 follow-up task chain in the task record and task-tracking governance docs so the next task in sequence can be resumed without chat memory. The task tracker now marks it owner_verified and the next approved task is `task-120`.
- 2026-05-13: Verified `task-120` by extending runtime schema coverage for task memory follow-up chains and validating the runtime schema registry so the next approved task is `task-121`.
- 2026-05-13: Verified `task-121` by refreshing live readiness/governance reports so update state and unfinished dependent work remain visible in the derived JSON surface. The task tracker now marks it owner_verified and the next approved task is `task-122`.
- 2026-05-13: Verified `task-122` by tightening README, README_AR, vibe UX, and prompt pack guidance so AI assistants see shorter direct commands, clearer owner/app/plugin lanes, and less repeated context. The task tracker now marks it owner_verified and the next approved task is `task-123`.
- 2026-05-13: Verified `task-123` by updating the human documentation and site surfaces so the capability, purpose, workflow, and source of truth are explained consistently in English and Arabic. The task tracker now marks it owner_verified and the next approved task is `task-124`.
- 2026-05-13: Verified `task-124`, `task-125`, and `task-126` by updating the capabilities reference, docs site, integration tests, changelog, and owner state so the evo-005 follow-up chain can continue from a consistent plugin-first CLI entry map. The next approved task is `kabeeri-077`.
- 2026-05-13: Verified `task-118` by confirming the CLI surface and help already document the capability and explain when to use it. The task tracker now marks it owner_verified and the next approved task is `task-119`.
- 2026-05-13: Verified `task-117` by tightening runtime resume, plugin loader, and token budget state so the first Evolution implementation slice now runs against live state and stays fully validated. The task tracker now marks it owner_verified and the next approved task is `task-118`.
- 2026-05-13: Verified `task-116` by publishing the intake implementation backlog with ordered implementation slices so the docs-first gate is complete and execution can begin from a clear plan. The task tracker now marks it owner_verified and the next approved task is `task-117`.
- 2026-05-13: Verified `task-115` by publishing the intake UI/UX direction document with journeys, key pages, design source, accessibility, responsive rules, and dashboard expectations so the docs-first gate can progress to backlog planning. The task tracker now marks it owner_verified and the next docs-first task is `task-116`.
- 2026-05-13: Verified `task-114` by publishing the intake data design document with core entities, relationships, snapshots, indexes, constraints, audit, and migration safety rules so the docs-first gate can progress to UI direction. The task tracker now marks it owner_verified and the next docs-first task is `task-115`.
- 2026-05-13: Verified `task-113` by publishing the intake architecture and stack decision report with backend, frontend, mobile, database, integrations, and delivery mode decisions so the docs-first gate can progress to data design. The task tracker now marks it owner_verified and the next docs-first task is `task-114`.
- 2026-05-13: Verified `task-112` by publishing the intake product scope statement with ecommerce goal, boundaries, users, modules, and exclusions so the docs-first gate can progress to stack decisions. The task tracker now marks it owner_verified and the next docs-first task is `task-113`.
- 2026-05-13: Added read-only GitHub and VS Code integration reports, wired them into the CLI help and source-truth docs, expanded the VS Code scaffold tasks and command palette with report actions, and kept the integration surfaces traceable without hidden writes.
- 2026-05-13: Verified `kabeeri-060` by confirming ADR create/list/show/approve/reject/supersede/report/trace flows already persist durable decision records. The task tracker now marks it owner_verified and the next approved task is `kabeeri-061`.
- 2026-05-13: Verified `kabeeri-059` by confirming owner login/logout, session state, and privileged command gates already enforce local session boundaries. The task tracker now marks it owner_verified and the next approved task is `kabeeri-060`.
- 2026-05-13: Verified `kabeeri-058` by confirming handoff package and reports surfaces already generate structured local artifacts from `.kabeeri` state. The task tracker now marks it owner_verified and the next approved task is `kabeeri-059`.
- 2026-05-13: Verified `kabeeri-057` by confirming app workspace scaffolding, registry state, and product boundary rules are already covered by the current CLI and tests. The task tracker now marks it owner_verified and the next approved task is `kabeeri-058`.
- 2026-05-13: Verified `kabeeri-056` by confirming release publish-gate and GitHub write policy surfaces already block unsafe confirmed publishing. The task tracker now marks it owner_verified and the next approved task is `kabeeri-057`.
- 2026-05-13: Verified `kabeeri-055` by confirming migration plan, rollback-plan, check, report, list, show, and audit outputs already track local migration state. The task tracker now marks it owner_verified and the next approved task is `kabeeri-056`.
- 2026-05-13: Verified `kabeeri-054` by confirming security scan, report, gate, list, and show outputs already write and read local security state. The task tracker now marks it owner_verified and the next approved task is `kabeeri-055`.
- 2026-05-13: Verified `kabeeri-053` by confirming GitHub, VS Code, sync, and release workflows are already callable from CLI and documented in the command surface. The task tracker now marks it owner_verified and the next approved task is `kabeeri-054`.
- 2026-05-13: Verified `kabeeri-052` by confirming generator, init, and questionnaire surfaces already produce governed scaffold and intake artifacts for supported profiles. The task tracker now marks it owner_verified and the next approved task is `kabeeri-053`.
- 2026-05-13: Verified `kabeeri-051` by confirming prompt-pack composition and questionnaire planning already share reusable compact guidance across AI flows. The task tracker now marks it owner_verified and the next approved task is `kabeeri-052`.
- 2026-05-13: Completed `kabeeri-033` by adding an AI run provenance report, wiring capture and usage evidence back to each run, and extending audit metadata so execution can be traced across runs, captures, usage events, and audit logs.
- 2026-05-13: Completed `kabeeri-034` by adding compact guidance to prompt-pack composition, surfacing prompt-pack recommendations in questionnaire planning, and documenting the short-path vibe runtime flow.
- 2026-05-13: Completed `kabeeri-035` by aligning the docs site, English docs, and Arabic docs with the current command surface and adding explicit docs validation and ai-run provenance coverage.
- 2026-05-13: Completed `kabeeri-037` by seeding deterministic `.kabeeri` workspace metadata, delivery-mode state, and startup guidance, then registering the new runtime files in the schema registry so init and validation stay green.
- 2026-05-13: Completed `kabeeri-038` by persisting session track decisions from resume, entry, and onboarding into durable state so later commands can read the current route consistently.
- 2026-05-13: Completed `kabeeri-036` by aligning generator profiles with governed intake scaffolds, adding architecture-guide and folder-questionnaire markdown files, and updating project-intake guidance and tests.
- 2026-05-13: Verified `kabeeri-040` by confirming the owner docs token gate and owner transfer lifecycle already exist in the CLI owner commands, are covered by integration tests, and are visible through the help and governance docs. The task tracker now marks it owner_verified and the next approved task is `kabeeri-041`.
- 2026-05-13: Verified `kabeeri-041` by confirming questionnaire coverage and missing-answer outputs already exist in the CLI questionnaire commands, emit usable reports, and are visible through help and tests. The task tracker now marks it owner_verified and the next approved task is `kabeeri-042`.
- 2026-05-13: Verified `kabeeri-042` by confirming the blueprint, data-design, and design commands already produce distinct CLI-driven reports and are visible through help and tests. The task tracker now marks it owner_verified and the next approved task is `kabeeri-043`.
- 2026-05-13: Verified `kabeeri-043` by confirming the structured and agile commands already expose distinct runtime artifacts and readiness outputs through CLI help and tests. The task tracker now marks it owner_verified and the next approved task is `kabeeri-044`.
- 2026-05-13: Verified `kabeeri-044` by confirming the dashboard state and dashboard help surfaces already expose consistent sections and refresh from `.kabeeri` source state. The task tracker now marks it owner_verified and the next approved task is `kabeeri-045`.
- 2026-05-13: Verified `kabeeri-050` by confirming docs generation and validation keep the docs site, command reference, and localized guidance in sync. The task tracker now marks it owner_verified and the next approved task is `kabeeri-051`.
- 2026-05-13: Verified `kabeeri-044` by confirming the dashboard state and dashboard help surfaces already expose consistent sections and refresh from `.kabeeri` source state. The task tracker now marks it owner_verified and the next approved task is `kabeeri-045`.
- 2026-05-13: Verified `kabeeri-043` by confirming the structured and agile commands already expose distinct runtime artifacts and readiness outputs through CLI help and tests. The task tracker now marks it owner_verified and the next approved task is `kabeeri-044`.
- 2026-05-13: Verified `kabeeri-042` by confirming the blueprint, data-design, and design commands already produce distinct CLI-driven reports and are visible through help and tests. The task tracker now marks it owner_verified and the next approved task is `kabeeri-043`.
- 2026-05-13: Verified `kabeeri-041` by confirming questionnaire coverage and missing-answer outputs already exist in the CLI questionnaire commands, emit usable reports, and are visible through help and tests. The task tracker now marks it owner_verified and the next approved task is `kabeeri-042`.
- 2026-05-13: Verified `kabeeri-040` by confirming the owner docs token gate and owner transfer lifecycle already exist in the CLI owner commands, are covered by integration tests, and are visible through the help and governance docs. The task tracker now marks it owner_verified and the next approved task is `kabeeri-041`.
- 2026-05-13: Completed `kabeeri-039` by deriving task token and lock scopes from task app/workstream boundaries, tightening the scope checks to fail closed on broader requests, and updating the governance docs and integration coverage.
- 2026-05-13: Added the CLI-first command and deprecation ledger in `docs/reports/KVDF_COMMAND_DEPRECATION_LEDGER.md`, linked it from the command reference and system capabilities reference, and captured the active, migrated, alias, and duplicated surfaces that still matter during migration.
- 2026-05-12: Moved `uniqueList` callers in `ai_run` and `vibe_interactions` onto the shared collections helper, and moved `summarizeBy` callers in `security` and `services/evolution` onto shared state utilities. `npm test` passes with 127 integration tests and `kvdf conflict scan` remains green.
- 2026-05-12: Moved `uniqueList` callers in `ai_run`, `vibe_interactions`, `prompt_pack`, and `project_profile` onto the shared collections helper, and kept `summarizeBy` callers in `security` and `services/evolution` on shared state utilities. `npm test` passes with 127 integration tests and `kvdf conflict scan` remains green.
- 2026-05-13: Approved all proposed tasks in `.kabeeri/tasks.json` so the backlog can enter execution planning, while keeping `task-015` in progress as the active work item.
- 2026-05-13: Verified `task-015` as `owner_verified` after confirming the durable execution-grade runtime implementation for `evo-004` was already present in the CLI services and evolution commands. `evo-004` itself remains in progress until the remaining follow-up tasks are completed.
- 2026-05-13: Completed `task-016` by documenting durable execution records in task-tracking guidance, aligning the task template with canonical task states, and normalizing multi-workstream follow-up tasks to `integration` so `kvdf validate tasks` passes again.
- 2026-05-12: Centralized the last `readStateArray` helper in `src/cli/commands/cost_control.js` onto shared state utilities, so `readStateArray` now lives only in `src/cli/services/state_utils.js`. `npm test` still passes with 127 integration tests and `kvdf conflict scan` remains green.
- 2026-05-12: Extended the shared `state_utils` helper to the remaining command-local readers in `change_control`, `traceability`, `migration`, `security`, `evolution`, and `services/evolution`, keeping runtime state reads centralized while preserving the existing report behavior. `npm test` passes with 127 integration tests and `kvdf conflict scan` stays green.
- 2026-05-12: Centralized the remaining JSONL helpers in `src/cli/services/jsonl.js`, moved local `readStateArray` calls in `ai_run`, `vibe_interactions`, and `usage_pricing` onto shared state utilities, and added coverage for `appendJsonLine` and `writeJsonLines`. `npm test` passes with 127 integration tests and `kvdf conflict scan` stays green.
- 2026-05-12: Added shared command suggestion helpers in `src/cli/services/command_suggestions.js` and shared git snapshot helpers in `src/cli/services/git_snapshot.js`, then reused them from `index` and `resume` so CLI fallback and local git status detection stay centralized in the runtime-services layer. `npm test` passes with 127 integration tests.
- 2026-05-12: Added `kvdf evolution report` and `docs/reports/EVO_AUTO_041_EXECUTION_REPORT.md` so the next open Evolution priority can be resumed from a durable report without chat history. `evo-auto-041-execution-reports` is done and `npm test` passes with 127 integration tests.
- 2026-05-12: Added `kvdf capability search` and `docs/reports/KVDF_CAPABILITY_SEARCH_INDEX.json` so the capability registry, CLI surface, documentation matrix, and roadmap views can be searched by track, capability, command, phase, and report type. `evo-auto-040-searchable-reference` is done and the next open priority is `evo-auto-041-execution-reports`. `npm test` passes with 126 integration tests.
- 2026-05-12: Added `kvdf validate blocked-scenarios` and the track-aware blocked-scenarios report so invalid or blocked runtime scenarios are reported clearly with next actions. `evo-auto-039-blocked-scenarios` is done and the next open priority is `evo-auto-040-searchable-reference`. `npm test` passes with 125 integration tests.
- 2026-05-12: Added `kvdf capability matrix` and `docs/reports/KVDF_CAPABILITY_DOC_MATRIX.json` so every capability now carries docs, CLI, runtime, tests, and report links in one traceable matrix. `evo-auto-036-capability-doc-matrix` is done and the next open priority is `evo-auto-037-source-normalization`. `npm test` passes with 122 integration tests.
- 2026-05-12: Added scale-specific prompt pack routing with `kvdf prompt-pack scale` and `.kabeeri/reports/scale_specific_packs_report.json`, and taught `kvdf project profile report` / `kvdf project profile status` to surface scale packs for large systems. `npm test` passes with 119 integration tests.
- 2026-05-12: Extended `kvdf onboarding` into a persisted first-session workflow with enter, route, and resume guidance plus `kvdf onboarding report`; the onboarding report now lives in `.kabeeri/reports/session_onboarding.json` and validation maps it as a runtime report. `npm test` passes with 121 integration tests.
- 2026-05-12: Extended `kvdf governance report` with a trust/safety/privacy/compliance/extensibility coverage view so the workspace governance report explains more than the basic owner/workstream/token/lock checks. `npm test` passes with 121 integration tests.
- 2026-05-12: Added `kvdf project profile report` and `.kabeeri/reports/project_profile_report.json` so the current Lite/Standard/Enterprise routing decision can be resumed without re-reading the live state file. `npm test` passes with 118 integration tests.
- 2026-05-12: Added docs-to-CLI synchronization with `kvdf docs build`, `kvdf docs preview`, and `kvdf docs sync`, plus a generated `DOCS_SITE_SYNC_REPORT.json` so the docs site can stay aligned with help text and runtime behavior. `npm test` passes with 118 integration tests.
- 2026-05-12: Added a capability CLI surface report with `kvdf capability surface` and `docs/reports/KVDF_CAPABILITY_CLI_SURFACE.json`, so every imported capability area is mapped to a clear command family and docs reference. `npm test` passes with 118 integration tests.
- 2026-05-12: Added docs site deep publishing coverage with `kvdf docs coverage` and a generated `DOCS_SITE_DEEP_PUBLISHING_COVERAGE.json` report, so the published pages are grouped into visible framework families and validation can confirm the site is fully covered. `npm test` passes with 117 integration tests.
- 2026-05-12: Added a change-control layer with `kvdf change report` and `kvdf risk report`, plus a traceability layer with `kvdf trace report`, so structured change requests, risk register entries, task assessments, ADRs, AI runs, and docs source-of-truth checks can be reviewed together before large framework releases or handoffs. `npm test` passes with the new report surfaces and validation wiring.
- 2026-05-12: Added `kvdf onboarding` as a dedicated first-session route for new and returning developers, wired it into CLI help and routing, added docs-site coverage, published `docs/reports/EVO_AUTO_034_DEVELOPER_ONBOARDING_REPORT.md`, and fixed the acceptance checklist syntax error that blocked the CLI during validation. `node bin/kvdf.js onboarding` and `node bin/kvdf.js onboarding --json` now pass.
- 2026-05-12: Closed `evo-auto-004` after syncing the runtime-services docs/state/report surfaces, running `npm test` and `kvdf conflict scan`, and marking the priority `done`. The next open priority is `evo-auto-005`.
- 2026-05-12: Started `evo-auto-005` (`Manual source package intake`) and added dedicated scope/dependency reports so the source package stays explicitly manual-only while remaining protected from automatic scans.
- 2026-05-12: Centralized the `KVDF_New_Features_Docs/` source-package rule in `src/cli/services/manual_feature_docs.js` and wired validation/task-memory checks to that shared helper so the source-package contract stays easy to maintain.
- 2026-05-12: Completed the runtime-services sync checkpoint for `evo-auto-004` by updating the capability reference, command reference, owner checkpoint, and dedicated scope/dependency reports so the current slice and shared service modules are visible in the docs layer. Validation is next.
- 2026-05-11: Continued the runtime services layer by moving Evolution temporary-priorities logic into `src/cli/services/evolution.js` and converting the `src/cli/index.js` temp-priority helpers into service wrappers. Validation passed with `npm test` and 86 integration tests.
- 2026-05-12: Continued the runtime services layer by extracting shared AI candidate planning into `src/cli/services/ai_planner.js`, moving relay watch behavior into `src/cli/services/multi_ai_relay.js`, and reusing the same planner from `multi_ai_governance` and `task_scheduler` so leader calls, queue assignment, and sync distribution agree on target selection. Validation passed with `npm test` and 99 integration tests.
- 2026-05-12: Synced the runtime-services checkpoint after the planner and relay extraction, updated the Evolution temporary queue state, and prepared the repo for the `sync` slice after keeping the test suite green. Validation remains passing with 99 integration tests.
- 2026-05-11: Continued the runtime services layer by making Evolution runtime state read from the current workspace only, fixing track detection so repo-root session files do not leak into temp workspaces, restoring `kvdf evolution --help` track gating, and returning the default active Evolution priority to `evo-auto-004`. Validation passed with `npm test` and `kvdf validate`.
- 2026-05-11: Activated the Task Trash System priority as the current `in_progress` Evolution slice, reopened its temporary queue, restored the missing `assertSafeName` import in `src/cli/workspace.js`, added a runtime schema for `.kabeeri/app_workspaces.json`, and verified the result with `npm test` and `npm run kvdf -- validate`.
- 2026-05-11: Implemented the Owner Plugin Packaging and Load Control priority. The owner track now carries explicit removable bundle metadata in `plugins/owner-track/plugin.json`, the shared plugin loader reports bundle metadata and load control state, the packaging contract is documented in `knowledge/governance/OWNER_PLUGIN_PACKAGING.md` and `docs/reports/KVDF_OWNER_PLUGIN_PACKAGING_REPORT.md`, and the integration tests verify plugin discovery and enable/disable behavior. Validation passed with `npm test` and `kvdf conflict scan`.
- 2026-05-11: Tightened Multi-AI governance so leader election only promotes leader-eligible agents by default. Gemini and other worker-only tools can still register in the hub for collaboration, but they no longer become leader automatically unless leadership is explicitly allowed.
- 2026-05-11: Implemented the Core Shared Layer and Plugin Loader priority. KVDF now reads plugin manifests from `plugins/*/plugin.json`, seeds `plugins/owner-track/plugin.json` during workspace init, persists enable/disable state in `.kabeeri/plugins.json`, and exposes `kvdf plugins status|list|show|enable|disable|reload`. Added a plugin-loader runtime schema mapping so validation passes cleanly, and verified the change with `npm test` and `kvdf conflict scan`.
- 2026-05-11: Implemented the Capability Partition Matrix priority. Evolution now exposes `kvdf evolution partition` as a full matrix report that classifies the current capability catalog into `kabeeri-core`, `plugins/owner-track`, and `workspaces/apps/<app-slug>`, with boundary rules, load rules, and docs/report references. Validation passed with 85 integration tests and conflict scan.
- 2026-05-11: Added `kvdf evolution roadmap` plus a canonical seven-step KVDF restructure roadmap so the source-study work order is explicit in Evolution priorities, summary, and docs. Also added durable task memory blocks plus `kvdf task memory <id>` so tasks can resume with detailed scope and verification context. Validation is pending after this change.
- 2026-05-11: Refined `kvdf evolution app ...` so app developers get app-friendly priority, temp, and deferred wording, plus app-mode next-action hints, while reusing the same underlying Evolution engine. Validation still passes with 76 integration tests.
- 2026-05-11: Made the Evolution placement gate explicit by adding an awaiting-decision state to placement reports, so new requests always show the ordered priorities and recommended placement before any change or follow-up task is created. Validation still passes with 76 integration tests.
- 2026-05-11: Reorganized KVDF into two primary tracks and added `docs/reports/KVDF_TWO_TRACK_RESTRUCTURE.md` plus track-aware `resume` output so framework-owner and vibe app-developer sessions start from the correct cycle. Validation still passes with 76 integration tests.
- 2026-05-11: Added `knowledge/governance/TRACK_ROUTING_GOVERNANCE.md` and track-aware activated/blocked feature reporting so entry routing is explicit and safe. Validation still passes with 76 integration tests.
- 2026-05-11: Added `.kabeeri/session_track.json` plus runtime schema support so the selected track persists between sessions and the next resume can recover the active context. Validation still passes with 76 integration tests.
- 2026-05-11: Added an automatic session entry router so `kvdf start` and `kvdf entry` auto-route to the correct track, while `kvdf resume` remains the detailed session state view. Validation still passes with 76 integration tests.
- 2026-05-11: Added `kvdf evolution app ...` as a developer-facing alias for the same Evolution lifecycle, with app-friendly priorities, temp, and deferred wording so vibe developers can manage app work without framework-owner language. Validation still passes with 76 integration tests.
- 2026-05-11: Cleaned more legacy Evolution helpers out of `src/cli/index.js` while preserving `compactTitle` and `nextRecordId` for the new command module dependencies. Validation still passes with 75 integration tests.
- 2026-05-11: Continued the runtime services layer by extracting Evolution command handling into `src/cli/commands/evolution.js`, while `src/cli/services/evolution.js` continues to own summary/state aggregation. Kept `evolution temp` advance/complete behavior intact and `npm test` green with 74 integration tests.
- 2026-05-11: Continued the runtime services layer by extracting Evolution command handling into `src/cli/commands/evolution.js`, while `src/cli/services/evolution.js` continues to own summary/state aggregation. Added a direct service-layer integration test, kept `evolution temp` advance/complete behavior intact, and `npm test` green with 75 integration tests.
- 2026-05-11: Converted the legacy `evolution` router in `src/cli/index.js` into a shim that forwards to `src/cli/commands/evolution.js`, so Evolution execution now has a single command module source of truth.
- 2026-05-11: Routed live reports to `src/cli/services/evolution.js` so the dashboard/report layer reads the new Evolution service directly instead of the old inline aggregator in `src/cli/index.js`.
- 2026-05-11: Continued the runtime services layer by extracting Evolution summary/state aggregation into `src/cli/services/evolution.js` and wiring `src/cli/index.js` to use the service for dashboard/runtime summaries. `npm test` still passes with 74 integration tests.
- 2026-05-11: Started Multi-AI Governance enhancement (evo-auto-017). Completed Slice 1 (Lock Scope Statement), Slice 2 (Dependency Map), and Slice 3 (Verified Implementation). Created scope statement in `docs/reports/EVO_AUTO_017_SCOPE_STATEMENT.md` and dependency map in `docs/reports/EVO_AUTO_017_DEPENDENCY_MAP.md`. Verified all surfaces are wired: runtime state, CLI commands, help text, schemas, validation, docs, capabilities reference, and integration tests. All 72 integration tests pass. Updated CHANGELOG with Multi-AI Governance verification notes. Ready for Slice 4 (Sync Docs) and Slice 5 (Validate & Close).
- 2026-05-11: Continued evo-auto-004 by extracting WordPress state persistence and WordPress task generation into `src/cli/services/wordpress.js`, leaving `src/cli/commands/wordpress.js` as the thinner command facade. Syntax checks passed for both files.
- 2026-05-11: Advanced evo-auto-004 map work by adding `docs/reports/EVO_AUTO_004_DEPENDENCY_MAP.md` and extracting WordPress planning/blueprint builders into `src/cli/services/wordpress_plans.js`. Command dispatch now uses the service module for plan and checklist generation.
- 2026-05-11: Added integration coverage for the new WordPress services modules so `wordpress` plan/state helpers are exercised directly, not only through the CLI facade. All 73 integration tests pass.
- 2026-05-11: Added a general `kvdf temp` command for application task execution that keeps `evolution temp` as the Evolution-specific compatibility path. All 74 integration tests pass.
- 2026-05-11: Synced evo-auto-004 documentation so the CLI reference and WordPress adoption guide now point at `src/cli/services/wordpress.js` and `src/cli/services/wordpress_plans.js` for governed runtime behavior.
- 2026-05-11: Began evo-auto-004 runtime services extraction by delegating WordPress command handling to `src/cli/commands/wordpress.js` from `src/cli/index.js`. Fixed the plugin architecture helper call in the module and kept all 72 integration tests green.
- 2026-05-11: Continued evo-auto-004 by extracting the questionnaire router into `src/cli/commands/questionnaire.js` and wiring `src/cli/index.js` to the new module. All 72 integration tests still pass.
- 2026-05-11: Continued evo-auto-004 by extracting blueprint and data-design routing into `src/cli/commands/blueprint.js` and wiring `src/cli/index.js` to the new module. All 72 integration tests still pass.
- 2026-05-11: Tightened Evolution and Multi-AI guidance so any AI tool starting work on an active priority must read `kvdf evolution temp` first and follow the current temporary slice before implementation.
- 2026-05-11: Classified `.kilo/` as `runtime_state` in the repository foldering map and documented it as local tooling/worktree state in the foldering guide.
- 2026-05-11: `npm run kvdf -- validate foldering` now passes, and `npm test` passed with all 71 integration tests.
- 2026-05-11: Resumed the framework-owner session, read the owner checkpoint, confirmed `kvdf resume` reports `framework_owner_development`, and verified the local dashboard serves successfully on `http://127.0.0.1:4177/__kvdf/dashboard`.
- 2026-05-11: Extracted the `init` command and docs-first intake seeding into `src/cli/commands/init.js`, keeping the CLI router slimmer while preserving workspace bootstrap behavior.
- 2026-05-11: Extracted release checklist, notes, scenario review, and issue counting helpers into `src/cli/commands/release.js`, then wired `github` and `release` paths to the shared module exports.
- 2026-05-11: Fixed Multi-AI leader auto-election fallback so command names like `status` cannot become leader identities. The active leader session was transferred to `codex` for the current workspace.
- 2026-05-11: Exposed `current_task` in Multi-AI governance status reports so worker tools can see the active Evolution slice directly instead of inferring it from the leader session.
- 2026-05-11: Added a direct next-action hint to `kvdf evolution next` so worker tools get an execution step instead of just the next priority title.
- 2026-05-11: Added `start_here`, `next_command`, and operator notes to `kvdf questionnaire flow`, and documented a direct start path in questionnaire activation rules so tools stop scanning unrelated folders.
- The repository already has a large `kvdf` Node CLI implementation under `src/cli/`.
- `.kabeeri/` is ignored by git and should be treated as local runtime state.
- Current local workspace has uncommitted changes in CLI, docs, reports, and integration tests.
- This file was added to solve the owner resume problem: disconnected sessions should restart from here.
- 2026-05-11: Added temporary execution priorities for the active `in_progress` evolution priority. `kvdf evolution temp`, `kvdf evolution temp advance`, and `kvdf evolution temp complete` now manage a short-lived slice queue that expires with the source priority.
- 2026-05-11: Added Multi-AI Governance with `kvdf multi-ai` status/leader/queue/merge commands, a repo-backed `.kabeeri/multi_ai_governance.json` state file, and Evolution-led leader orchestration for per-AI temporary queues and semantic merge bundles.
- 2026-05-11: Added Evolution sync for Multi-AI orchestration. `kvdf multi-ai sync` now aligns the Leader AI with the active Evolution temporary queue and `kvdf multi-ai sync distribute` can split slices across worker AIs with provenance metadata.
- 2026-05-11: Added Multi-AI queue lifecycle and merge commit support. Worker queues can now be claimed, advanced, completed, blocked, or handed off, and merge bundles can be committed with provenance after validation.
- 2026-05-11: Added integration coverage for Multi-AI sync distribution, queue advancement, and merge commit provenance so the lifecycle stays pinned down in tests.
- 2026-05-11: Added semantic merge preview and surface planning for Multi-AI bundles. Merge bundles now record file sections, contributor overlaps, surface risk, and owner-review-required semantics before commit.
- 2026-05-08: `npm test` passed with 37 integration tests.
- 2026-05-08: `npm run test:smoke` passed for version, doctor, validate, prompt pack list, and plan list.
- 2026-05-08: Policy Gates development started. Added policy status, policy validation, and policy schema files.
- 2026-05-08: Added `github_write_policy` so confirmed GitHub write operations are blocked before any `gh` command runs unless the policy gate passes.
- 2026-05-08: Added App Boundary Governance docs and runtime enforcement for same-product multi-app workspaces.
- 2026-05-08: Developed Live Dashboard runtime with linked workspace registry, app boundary visibility, and separate KVDF workspace summaries.
- 2026-05-08: Added Solo Developer Mode for one full-stack developer across all standard workstreams.
- 2026-05-08: Added `docs/SYSTEM_CAPABILITIES_REFERENCE.md` as the main documented map of Kabeeri VDF capabilities and linked it from `README.md`.
- 2026-05-08: Extracted durable rules from `codex_commands/` into `docs/internal/AI_DEVELOPMENT_WORKFLOW.md`, documented completion, and removed the temporary `codex_commands/` folder from the product surface.
- 2026-05-08: Added `docs/reports/DOCUMENTATION_CLEANUP_AUDIT.md` to identify duplicate, stale, archive-only, and consolidation-needed documentation.
- 2026-05-08: Deleted high-confidence cleanup reports listed under the cleanup audit's delete-after-review section.
- 2026-05-08: Deleted stale `docs/reports/OPEN_BLOCKERS.md`; current blockers should be regenerated instead of trusted from an old snapshot.
- 2026-05-08: Deleted stale `docs/reports/PUBLISH_DECISION.md`; publish decisions should be regenerated per release instead of reused from an old snapshot.
- 2026-05-08: Deleted stale `docs/reports/FINAL_DEEP_QA_REPORT.md`; final QA should be regenerated when needed.
- 2026-05-08: Deleted stale `docs/reports/FINAL_VALIDATION_REPORT.md`; validation should be rerun through CLI commands instead of reused from an old snapshot.
- 2026-05-08: Consolidated task governance into `governance/TASK_GOVERNANCE.md`, merged `ai_usage/README.md` into `ai_cost_control/`, and marked v2/v3 planning folders as historical mappings to current runtime docs.
- 2026-05-08: Added ADR and AI Run History runtime. Existing memory, sessions, and usage were not duplicated; ADRs now capture formal decisions, AI runs now capture accepted/rejected output quality and waste signals, and the dashboard/validation/docs were updated.
- 2026-05-08: Added Common Prompt Layer runtime. Existing stack prompt packs and context packs were not duplicated; `prompt_packs/common/` now stores shared rules and `kvdf prompt-pack compose` builds task-specific prompts with scope, acceptance, optional context packs, and dashboard/validation visibility.
- 2026-05-09: Added Runtime Schema Registry for `.kabeeri` JSON/JSONL state. `kvdf validate runtime-schemas` now checks registry coverage, schema JSON validity, and existing runtime files against mapped schemas.
- 2026-05-09: Finished task governance/tracking consolidation. `task_governance/` was removed, policy lives in `knowledge/task_tracking/TASK_GOVERNANCE.md`, and `task_tracking/` now owns task schemas, templates, intake, provenance schema, examples, states, reviews, AI logs, and governance policy.
- 2026-05-09: Added independent readiness and governance reports. `kvdf readiness report` and `kvdf governance report` export Markdown or JSON summaries without requiring dashboard, release, or handoff flows.
- 2026-05-09: Strengthened release/GitHub publish gates. `kvdf release publish --confirm` and `kvdf github release publish --confirm` now share the same publish-gate path: release policy first, GitHub write policy second, then `gh`.
- 2026-05-09: Added product packaging and upgrade guide support. `kvdf package check` validates npm package readiness, `kvdf upgrade check` compares workspace compatibility state to the current CLI version, and production guides now document packaging and upgrades.
- 2026-05-09: Implemented the React Native Expo prompt pack. `prompt_packs/react-native-expo/` now has a full Expo mobile prompt sequence, manifest, common-layer composition support, docs updates, and CLI tests for show/export/compose behavior.
- 2026-05-09: Unified Arabic and English documentation maps. `docs/ar/README.md`, `docs/en/README.md`, and `docs/BILINGUAL_DOCUMENTATION_PARITY.md` now define matching 01-20 canonical topics, with English counterparts added for the previously Arabic-only docs while preserving older English files as legacy links.
- 2026-05-09: Added Task Tracker live JSON for dashboard/editor use. `.kabeeri/dashboard/task_tracker_state.json` is now derived from tasks plus tokens, locks, sessions, apps, sprints, acceptance, usage, Vibe suggestions, and captures; `kvdf task tracker`, `kvdf dashboard task-tracker`, and `/__kvdf/api/tasks` expose it.
- 2026-05-09: Refreshed current reports to reflect reality. `CURRENT_REPOSITORY_ANALYSIS.md`, `GAP_REPORT.md`, `IMPLEMENTATION_PLAN.md`, `MISSING_REQUIREMENTS_BACKLOG.md`, `DOCUMENTATION_CLEANUP_AUDIT.md`, `REQUIREMENTS_TRACEABILITY_MATRIX.md`, `PHASE_TASK_BREAKDOWN.md`, and historical phase reports now distinguish current runtime status from old snapshots.
- 2026-05-09: Added Live Reports JSON. `.kabeeri/reports/live_reports_state.json`, `kvdf reports live`, `kvdf reports show <report>`, and `/__kvdf/api/reports` now expose derived readiness, governance, packaging, upgrade, task tracker, dashboard UX, security, migration, and action-item status without constantly rewriting Markdown reports.
- 2026-05-09: Deepened Agile into a Scrum-grade runtime. `kvdf agile health`, `kvdf agile forecast`, impediments, retrospectives, stronger DoR checks, `.kabeeri/dashboard/agile_state.json`, and `/__kvdf/api/agile` now support large-project Agile planning and resume context.
- 2026-05-09: Added Structured Delivery Runtime for Waterfall-style enterprise delivery. `kvdf structured` now manages approved requirements, phases, deliverables, risks, change requests, phase gates, requirement-to-task traceability, `.kabeeri/structured.json`, `.kabeeri/dashboard/structured_state.json`, and `/__kvdf/api/structured`.
- 2026-05-09: Added Delivery Mode Advisor. `kvdf delivery recommend` compares Agile vs Structured from the application description, `kvdf delivery choose` records the developer decision, and `.kabeeri/delivery_decisions.json` keeps recommendation/decision history.
- 2026-05-09: Added Product Blueprint Catalog. `kvdf blueprint` now maps market systems such as eCommerce, POS, ERP, CRM, booking, news, delivery/logistics, and mobile apps to compact AI context: channels, backend modules, frontend pages, database entities, workstreams, and risk flags.
- 2026-05-09: Added Data Design Blueprint. `kvdf data-design` now maps product blueprints to database modules, entities, integrity rules, snapshots, indexes, audit logs, transactions, idempotency, and migration-safety context in `.kabeeri/data_design.json`.
- 2026-05-09: Added UI/UX Advisor inside Design Governance. `kvdf design recommend <blueprint>` now maps product blueprints to frontend experience patterns, stacks, component groups, page templates, SEO/GEO rules, dashboard/mobile UX rules, and `.kabeeri/design_sources/ui_advisor.json`.
- 2026-05-09: Added Repository Foldering System. `kvdf structure` and `kvdf validate foldering` now expose a Laravel-like root map for Kabeeri itself, with current folders grouped into core, knowledge, packs, integrations, contracts, documentation, quality, and runtime state.
- 2026-05-09: Added adaptive questionnaire intake planning. `kvdf questionnaire plan` now combines application blueprints, framework prompt packs, data design, UI/UX advisor, and delivery mode advisor to generate focused questions that help choose Agile/Structured and the technical stack before task generation.
- 2026-05-10: Added `kvdf resume` / `kvdf start`, `kvdf guard`, and `kvdf sync` for the owner problem intake. Resume separates framework-owner work from user app work and npm roots; guard blocks framework-like paths in user workspaces; sync provides solo/team GitHub preflight.
- 2026-05-10: Integrated the framework boundary guard into post-work capture and AI session completion so user workspaces cannot record Kabeeri internals as app work unless `--allow-framework-edits` is explicit.
- 2026-05-10: Added `kvdf conflict scan` as a pre-development drift check for CLI router/help alignment, guard wiring, core/runtime schema validation, and workspace task/capture/session/lock conflicts.
- 2026-05-10: `npm test` passed with 65 integration tests after the conflict scan slice.
- 2026-05-10: Strengthened Evolution Steward as the single framework-development backlog. `kvdf evolution priorities` and `kvdf evolution next` now expose ordered development phases, `kvdf resume --scan` includes Evolution and conflict checks, and feature requests get duplicate-capability signals before being treated as new.
- 2026-05-10: `KVDF_New_Features_Docs/` is now a protected dual-purpose source package. It is not part of automatic scans. It contains reference software design systems and project-documentation generator systems; import must go through Evolution Steward and capability-map duplicate review before the contents are redistributed into Kabeeri folders and the folder is removed.
- 2026-05-10: `npm test` passed with 65 integration tests after the Evolution Steward backlog update.
- 2026-05-10: Enhanced `kvdf resume` for framework-owner sessions with Evolution priorities, parsed owner checkpoint, compact git summary, and one exact next development action. Direct integration test command `node tests/cli.integration.test.js` passed with 65 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `doctor` and `validate` routing into `src/cli/commands/health.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 65 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `delivery` routing and the shared delivery recommendation helper into `src/cli/commands/delivery.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 65 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `memory` routing and memory summary generation into `src/cli/commands/memory.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 65 tests.
- 2026-05-10: Added Evolution Steward placement gate so new feature requests during an `in_progress` priority show the unfinished work, full priority list, and recommended placement, then wait for explicit Owner confirmation before creating changes/tasks.
- 2026-05-10: Added Evolution deferred ideas store. `kvdf evolution defer` records ideas, `kvdf evolution deferred` reviews them, selected ideas restore only with explicit placement confirmation, and `kvdf evolution priorities` shows them as one final deferred-ideas bucket. The n8n integration analysis is stored as `deferred-001`.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `prompt-pack` routing, export handling, and prompt-pack catalog helpers into `src/cli/commands/prompt_pack.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `audit` routing and audit report reading into `src/cli/commands/audit.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `generator` / `create` routing, skeleton generation, and generator governance tasks into `src/cli/commands/generator.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `vscode` routing and VS Code scaffold builders into `src/cli/commands/vscode.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `docs` / `doc` site routing into `src/cli/commands/docs_site.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `budget` routing into `src/cli/commands/budget.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `context-pack`, `preflight`, and `model-route` cost-control routing into `src/cli/commands/cost_control.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `handoff` routing and handoff report builders into `src/cli/commands/handoff.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `security` routing and the latest security scan helper into `src/cli/commands/security.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `migration` routing and migration policy helpers into `src/cli/commands/migration.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `token` routing and execution-scope helpers into `src/cli/commands/token.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `lock` routing and lock-scope helpers into `src/cli/commands/lock.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `developer` / `agent` identity routing into `src/cli/commands/identity.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `owner` auth and transfer routing into `src/cli/commands/owner.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `acceptance` routing into `src/cli/commands/acceptance.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `usage` / `pricing` routing and AI cost helpers into `src/cli/commands/usage_pricing.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `sprint` routing into `src/cli/commands/sprint.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `readiness` / `governance` runtime report routing into `src/cli/commands/runtime_report.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `reports` routing into `src/cli/commands/reports.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `release` routing into `src/cli/commands/release.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `session` routing into `src/cli/commands/session.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `github` routing into `src/cli/commands/github.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.
- 2026-05-10: Continued `src/cli/index.js` modularization by extracting `adr` routing into `src/cli/commands/adr.js`. Direct integration test command `node tests/cli.integration.test.js` passed with 67 tests.

## Open Local Changes

These files were already modified before this checkpoint was created:

- `CHANGELOG.md`
- `cli/CLI_COMMAND_REFERENCE.md`
- `cli/README.md`
- `docs/reports/GAP_REPORT.md`
- `docs/reports/REQUIREMENTS_TRACEABILITY_MATRIX.md`
- `src/cli/index.js`
- `src/cli/ui.js`
- `src/cli/workspace.js`
- `tests/cli.integration.test.js`

Before committing, review these changes with:

```bash
git diff --stat
git diff
npm test
```

## Next Actions

0. Continue with the first approved implementation task `kabeeri-077` now that the evo-005 follow-up chain is closed and the migration can move to redistribution verification.
1. Keep the shared AI planner and relay surfaces under test while preserving the current green suite.
2. Continue safe `src/cli/index.js` modularization only after the active priority is stable.
3. Analyze `KVDF_New_Features_Docs/` only when explicitly requested, starting with duplicate review against `docs/SYSTEM_CAPABILITIES_REFERENCE.md` and then mapping the extracted content to the correct Kabeeri folders.
4. Import only missing core governance/reference-pack knowledge into existing Kabeeri systems, then clear the inbox contents.
5. Make UI/UX-questionnaire linkage visible in docs, resume output, and task generation so missing UI decisions become explicit before frontend work.
6. Add low-cost project start mode with compact context, focused packs, and cheap model-routing defaults.
7. Deepen team GitHub sync with issue/PR/status/comment integration and action-triggered feedback only when team mode is detected.
8. Expand conflict scan later with dashboard/docs/policy drift checks after the basic scan proves stable.

## Owner Problem Intake - 2026-05-10

These are current product risks discovered during owner review and should guide the next development slices:

1. Session intent ambiguity:
   - Problem: Natural phrases like "start development", "start Kabeeri", or "let's begin" can mean framework-owner development inside this repository, or user application work inside a project using Kabeeri.
   - Risk: AI may edit Kabeeri internals while acting as a user project assistant, or may start app implementation without reading `.kabeeri` state.
   - First fix: `kvdf resume` / `kvdf start` now detects session mode and root roles.
   - Next fix: integrate resume guidance into docs, dashboard, and AI workflow prompts.
2. npm root ambiguity:
   - Problem: Kabeeri is a Node CLI, while user apps may also be Next.js/React Node apps.
   - Risk: `npm install`, `npm test`, or `npm run dev` may run in the wrong root.
   - First fix: `kvdf resume` reports the current app npm root separately from the Kabeeri engine root.
   - Next fix: add stronger package/workspace root checks before package-sensitive commands.
3. Owner framework-development resume:
   - Problem: The framework owner may forget the previous development phase, plan, or half-finished slice.
   - Risk: duplicated work, abandoned refactors, or work starting without reviewing the checkpoint.
   - Current support: `kvdf resume` summarizes `OWNER_DEVELOPMENT_STATE.md`, Evolution priorities, git diff state, and one exact next action. `kvdf resume --scan` also runs Evolution priority review, conflict scan, workspace validation, and integration tests.
   - Next fix: continue reducing `src/cli/index.js` while keeping resume as the canonical first-session command.
4. Cross-feature logic conflicts:
   - Problem: New Kabeeri capabilities can conflict with older runtime logic.
   - Risk: feature drift that normal tests may not explain clearly.
   - Current support: `kvdf validate`, policy gates, runtime schemas, reports.
   - First fix: `kvdf conflict scan` now checks CLI router/help alignment, guard wiring, core/runtime schema validation, and local workspace task/capture/session/lock conflicts before new development starts.
   - Next fix: expand the scan with dashboard/docs/policy drift checks.
5. UI/UX-questionnaire linkage:
   - Problem: It is not obvious whether UI/UX guidance is connected to extracted questions and vibe-coder answers.
   - Current state: `kvdf questionnaire plan` already uses UI/UX advisor context, and UI decision answers can feed `kvdf design ui-decisions`.
   - Next fix: make this link visible in docs, resume output, and task generation so missing UI decisions become explicit questions before frontend work.
6. Token/cost pressure:
   - Problem: Developing new apps with Kabeeri can consume too many AI tokens.
   - Current support: context packs, preflight estimates, model routing, usage tracking.
   - Next fix: add a low-cost project start path that defaults to compact resume summaries, focused context packs, and cheap model routes for classification/question generation.
7. Team-local state versus GitHub coordination:
   - Problem: Kabeeri usage is local on each developer machine, but multi-developer coordination must stay synchronized through GitHub.
   - Risk: each developer's `.kabeeri` state can drift, causing stale task status, duplicate work, lock conflicts, or outdated understanding of what teammates already finished.
   - Next fix: design a GitHub-backed sync loop where local Kabeeri emits quick feedback after developer actions and pulls/refreshes current team state before new work starts.
   - First fix: `kvdf sync status`, `kvdf sync pull`, and `kvdf sync push` now provide a safe git/GitHub preflight, with pull/push as dry-runs unless `--confirm` is provided.
   - Scope rule: sync is optional for solo or single-developer local workspaces, and recommended for team workspaces with multiple active developers or agents.
   - Required next capabilities: GitHub issue/PR/comment/status integration, conflict detection, action-triggered feedback after task/session/capture changes, and clear offline behavior.
8. User access to framework internals:
   - Problem: Users need to use, understand, and possibly copy Kabeeri, but should not casually modify Kabeeri framework internals while building their own app.
   - Risk: user project work can corrupt the framework source, confuse app files with engine files, or create unsupported local forks by accident.
   - Next fix: define installation/usage profiles that separate `framework_source`, `installed_engine`, and `user_workspace`; make the default user experience read-only toward Kabeeri internals.
   - First fix: `kvdf guard` now reports framework boundary status and blocks framework-like paths inside user workspaces unless `--allow-framework-edits` is explicitly provided.
   - Second fix: post-work capture and AI session completion now enforce the same protected-path guard for changed-file lists.
   - Possible next implementation: publish/use Kabeeri as a package or linked CLI, keep project state in `.kabeeri`, expose docs and commands, and expand read-only usage profiles.
9. System-command-first operation:
   - Problem: AI assistants may bypass Kabeeri commands and inspect/edit directly before the runtime has classified the session.
   - Risk: work starts without current state, task scope, GitHub sync, cost controls, or owner checkpoint.
   - Owner rule: when entering Kabeeri, always use Kabeeri system commands first. Do not bypass them unless the Owner explicitly orders a bypass.
   - First command: `kvdf resume` / `kvdf start`.
   - Next fix: make `resume` the official preflight for Kabeeri-aware sessions, and add docs/prompt guidance that direct editing is only allowed after resume/context/task state is known.

## Decision Log

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-05-08 | Add an owner development checkpoint file. | The owner sometimes disconnects sessions and needs one durable place to resume from. |

## Session Handoff Template

Copy and update this section before ending any long session.

```md
### Session YYYY-MM-DD HH:MM

Done:
-

Changed files:
-

Checks run:
-

Known risks:
-

Next exact step:
-
```

### Session 2026-05-08

Done:
- Added `OWNER_DEVELOPMENT_STATE.md` as the owner-only resume checkpoint.
- Confirmed the working tree has a large uncommitted governance/runtime CLI slice.
- Ran integration and smoke checks successfully.
- Added `kvdf policy status` and `kvdf policy status --json`.
- Added `kvdf validate policy` semantic validation for policy definitions and policy results.
- Added `schemas/policy.schema.json` and `schemas/policy-result.schema.json`.
- Added `github_write_policy` and wired confirmed `kvdf github ... --confirm` writes through it before `gh` runs.
- Added App Boundary Governance with app product/type/path metadata.
- Added app-scoped tasks and blocked cross-app tasks unless `--type integration`.
- Added AI session file boundary enforcement against the task's registered app path.
- Added validation for app path overlap, missing app references, and cross-app tasks without integration type.
- Added `governance/APP_BOUNDARY_GOVERNANCE.md`.
- Added Live Dashboard linked workspace registry via `kvdf dashboard workspace add/list/remove`.
- Added `KVDF_WORKSPACES` and configured workspace support for dashboard state.
- Added dashboard App Boundary Governance visibility and clearer separate workspace summaries.
- Added `dashboard/LIVE_DASHBOARD_RUNTIME.md`.
- Added `kvdf developer solo` and `kvdf developer owner-developer`.
- Added `.kabeeri/developer_mode.json` runtime state.
- Added Solo Developer Mode dashboard visibility and validation.
- Added `governance/SOLO_DEVELOPER_MODE.md`.
- Added Workstream Governance Runtime with `.kabeeri/workstreams.json` defaults.
- Added `kvdf workstream list/show/add/update/validate`.
- Added known-workstream checks for tasks, identities, and apps.
- Added AI session file boundary enforcement against task workstream path rules.
- Added Live Dashboard workstream rollups and `governance/WORKSTREAM_GOVERNANCE.md`.
- Added `governance/EXECUTION_SCOPE_GOVERNANCE.md` to unify Workstream Governance and Task Access Tokens.
- Updated `kvdf token issue` to derive `allowed_files`, `workstreams`, and `app_usernames` from task app/workstream boundaries.
- Added broad token scope blocking unless `--allow-broad-scope` is used.
- Added dashboard Execution Scopes visibility and validation for token/task boundary drift.
- Removed obsolete split docs `governance/TASK_ACCESS_TOKENS.md` and `governance/ACCESS_TOKEN_LIFECYCLE.md`.
- Added optional Vibe-first runtime commands: `kvdf vibe`, `kvdf ask`, and `kvdf capture`.
- Added `.kabeeri/interactions/user_intents.jsonl`, `suggested_tasks.json`, and `post_work_captures.json`.
- Added suggested task conversion into normal governed tasks.
- Added Live Dashboard visibility for Vibe-first suggestions and post-work captures.
- Added `vibe_ux/VIBE_FIRST_RUNTIME.md`.
- Expanded Vibe-first with `vibe plan`, `vibe session`, `vibe brief`, and `vibe next`.
- Added ecommerce planning split template for database/backend/storefront/admin/QA cards.
- Added `.kabeeri/interactions/vibe_sessions.json` and `context_briefs.json` runtime state.
- Added dashboard Vibe Sessions and Briefs visibility.

Changed files:
- `OWNER_DEVELOPMENT_STATE.md`
- `src/cli/index.js`
- `src/cli/ui.js`
- `src/cli/validate.js`
- `src/cli/workspace.js`
- `tests/cli.integration.test.js`
- `governance/APP_BOUNDARY_GOVERNANCE.md`
- `dashboard/LIVE_DASHBOARD_RUNTIME.md`
- `dashboard/TECHNICAL_DASHBOARD_SPEC.md`
- `dashboard/BUSINESS_DASHBOARD_SPEC.md`
- `governance/SOLO_DEVELOPER_MODE.md`
- `governance/WORKSTREAM_GOVERNANCE.md`
- `governance/EXECUTION_SCOPE_GOVERNANCE.md`
- `vibe_ux/VIBE_FIRST_RUNTIME.md`
- `schemas/policy.schema.json`
- `schemas/policy-result.schema.json`
- `cli/CLI_COMMAND_REFERENCE.md`
- `cli/README.md`
- `CHANGELOG.md`

Checks run:
- `npm test` passed: 42 integration tests.
- `npm run test:smoke` passed.
- Manual check: `node bin/kvdf.js vibe plan "Build ecommerce store with products cart checkout admin and tests" --json`.
- Manual check: `node bin/kvdf.js vibe brief`.

Known risks:
- The main pending diff is large, especially `src/cli/index.js`; review before commit.
- `.kabeeri/` is ignored local state and should not be treated as publishable repo source.

Next exact step:
- Finish verifying the post-work capture lifecycle work, then review dashboard HTML visually or add dashboard tabs/filters for app/workstream/developer views as the next slice.

## 2026-05-08 - Post-Work Capture Runtime Upgrade

Current slice:
- Implemented full post-work capture lifecycle: record, list, show, link, convert, resolve.
- Capture now records file details, task matches, app scope, missing evidence, Owner review requirement, and next action.
- `kvdf validate capture` validates capture records and task references.
- Live dashboard now shows missing evidence and recommended next action for captures.
- Updated Vibe docs, CLI reference, central capability map, changelog, and integration tests.

Next exact step:
- Run final validation and tests for this slice.

## Session 2026-05-11

Done:
- Resumed framework-owner development and confirmed the repo is in `framework_owner_development` mode.
- Verified `kvdf resume` and `kvdf doctor` on the local workspace.
- Confirmed the dashboard server responds successfully at `/__kvdf/dashboard` and `/__kvdf/api/state`.
- Classified `.kilo/` as local runtime tooling state in the repository foldering map.
- Updated the repository foldering guide to describe `.kilo/` alongside `.kabeeri/`.
- Re-ran `npm run kvdf -- validate foldering` and `npm test`; both passed.
- Extracted `init` bootstrap and intake handling into `src/cli/commands/init.js`.
- Kept the `init` CLI behavior and tests green after the extraction.
- Extracted release reporting helpers into `src/cli/commands/release.js`.
- Kept `github` and `release` CLI behavior and tests green after the extraction.

Changed files:
- `knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json`
- `docs/architecture/REPOSITORY_FOLDERING_SYSTEM.md`
- `src/cli/commands/release.js`
- `src/cli/commands/dashboard_state.js`
- `src/cli/commands/init.js`
- `src/cli/index.js`
- `OWNER_DEVELOPMENT_STATE.md`

Checks run:
- `npm run kvdf -- resume`
- `npm run kvdf -- doctor`
- `npm run kvdf -- validate foldering`
- `npm test`
- `node -c src/cli/commands/init.js`
- `node -c src/cli/commands/release.js`
- `node -c src/cli/index.js`

Known risks:
- The tree still contains a large existing uncommitted diff from previous slices, so the next edit should stay tightly scoped.

Next exact step:
- Continue safe `src/cli/index.js` modularization, likely by extracting one more isolated command cluster.

## 2026-05-08 - Agile Templates Runtime Upgrade

Current slice:
- Reviewed the existing Agile template docs: backlog, epic, user story, sprint planning, sprint review, and sprint cost schema.
- Implemented `kvdf agile` runtime for backlog, epics, stories, sprint planning, and sprint review.
- Added `.kabeeri/agile.json` workspace state.
- Added story Definition of Ready checks and story-to-governed-task conversion.
- Added Agile dashboard visibility and `kvdf validate agile`.
- Added `agile_delivery/AGILE_RUNTIME.md` and linked the runtime from Agile docs, CLI reference, central capabilities, and changelog.

Next exact step:
- Run integration tests and fix any Agile runtime edge cases before moving to the next feature.

## 2026-05-08 - Dashboard UX Governance

Current slice:
- Confirmed Dashboard UX Governance is useful because the dashboard is now a major resume surface for the Owner, Codex, and vibe developers.
- Added `kvdf dashboard ux` to audit action center, source-of-truth notice, live state, responsive tables, empty states, governance visibility, cost visibility, Vibe/Agile visibility, workspace boundaries, and common secret leakage.
- Added dashboard Action Center near the top of the private dashboard.
- Added `.kabeeri/dashboard/ux_audits.json` and Markdown UX report output.
- Added `dashboard/DASHBOARD_UX_GOVERNANCE.md` and linked it from runtime docs and capability reference.

Next exact step:
- Run tests and full validation for the dashboard UX slice.

## 2026-05-08 - Design Governance Visual Acceptance

Current slice:
- Reviewed existing Design Governance and avoided duplicating intake/snapshot/text spec/page spec/component contract runtime.
- Added the missing post-implementation layer: visual review records and design gates.
- Added `kvdf design visual-review`, `kvdf design visual-review-list`, and `kvdf design gate`.
- Added `.kabeeri/design_sources/visual_reviews.json`.
- Added `validate design` checks for sources, page specs, component contracts, and visual reviews.
- Added `design_sources/VISUAL_ACCEPTANCE_RUNTIME.md` and updated design docs, CLI reference, capability map, changelog, and tests.
- Added owner docs token gate and owner session auto-close support: `kvdf owner docs open|status|close`, `kvdf owner session status|close`, `.kabeeri/owner_docs_tokens.json`, and owner plugin docs under `plugins/owner-track/docs/index.md`.

Next exact step:
- Continue with `kabeeri-075` to complete the migration ledger for commands, folders, and track ownership.

## Owner Rules

- Do not store credentials, GitHub tokens, owner passphrases, or private client information here.
- Keep this file short enough to read in two minutes.
- Link to detailed reports instead of pasting long reports.
- If a task becomes implementation-ready, create or update a `.kabeeri` task through the CLI.
- If the repo is public and this file becomes too private, move sensitive notes into an ignored local file under `.kabeeri/owner/`.

## Useful Commands

```bash
npm test
npm run test:smoke
npm run check
node bin/kvdf.js doctor
node bin/kvdf.js validate
node bin/kvdf.js task list
node bin/kvdf.js memory summary
node bin/kvdf.js dashboard state
```

