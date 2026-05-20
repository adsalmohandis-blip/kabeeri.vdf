# KVDF Full Repository Audit

Generated: 2026-05-18

## 1. Executive Summary

KVDF is a local-first command line governance and delivery engine for the Kabeeri VDF repository. In practical terms, it is not just a CLI wrapper: it is a full repository operating system for project state, validation, questionnaire intake, evolution/task governance, dashboards, handoff packages, docs generation, plugin loading, and workspace management.

The codebase now clearly separates two operating tracks:
- Owner Track / KVDF Core, which governs framework and repository-level work.
- App Track / Vibe Developer flow, which governs app/workspace delivery with local-first handoff and optional GitHub-backed delivery.

The repository is large and operationally mature:
- about 1,793 tracked files in the repo inventory
- 13 discovered plugins
- 92 schema files under `schemas/`
- 108 files under `docs/reports/`
- a CLI surface that fans into safety, build, report, ops, delivery, and governance command families
- runtime state heavily centered under `.kabeeri/`

The most important architectural facts from source are:
- the CLI entrypoint is intentionally thin
- actual routing lives in `src/cli/command_dispatcher.js`, `src/cli/dispatchers/*`, and `src/cli/commands/*`
- validation is deep and scope-driven
- plugin loading and mounting are real runtime systems, not just docs
- task trash/archive and evolution auto-closeout are implemented
- dashboard state explicitly separates owner-track and app-track views
- the direct-to-main policy for solo KVDF Core work is now the default, while branch/PR delivery is optional for team/protected/risky work

The main audit conclusion is that KVDF is already a multi-layered platform:
- native core CLI/runtime
- framework-owner delivery pipeline
- vibe/app delivery pipeline
- plugin subsystem
- docs generation/reporting layer
- `.kabeeri/` runtime governance layer
- file-first current-state / workspace-boundary / truth-reconciliation layer
- Roadmap Train / Evo Sprint queue for owner and app tracks

The main cleanup risks are not lack of capability, but rather:
- source/docs/report drift
- legacy wording around branch/PR vs direct-to-main
- stale roadmap and report claims that need current-state reconciliation before planning
- dirty generated report artifacts
- large and partially monolithic command routing
- mixed historical planning documents in `ROADMAP.md` and `CHANGELOG.md`
- README Arabic encoding quality
- plugin boundary clarity in a few areas

## 2. Repository Structure Overview

### Root
- `package.json`: defines scripts, bin entrypoint, dependencies, and validation/test commands.
- `bin/kvdf.js`: thin executable bootstrap that loads the CLI runner from `src/core/bootstrap`.
- `README.md`: canonical English repo introduction and operating model.
- `README_AR.md`: Arabic repo introduction; useful but currently encodes poorly in a few places.
- `ROADMAP.md`: historical/planning-heavy roadmap, not a source-of-truth runtime spec.
- `CHANGELOG.md`: long release/history log with a mix of releases, planning notes, and implementation history.

### `bin`
- Holds the executable entrypoint for the CLI.

### `src`
- Core implementation area for the CLI runtime, router, command modules, services, and shared bootstrap.

### `src/cli`
- CLI orchestration and behavior layer.
- Contains:
  - `command_dispatcher.js`
  - `dispatchers/`
  - `commands/`
  - `services/`
  - `workspace.js`
  - `validate.js`
  - `ui.js`
  - `fs_utils.js`

### `src/cli/commands`
- Implements the actual commands for:
  - evolution
  - task lifecycle
  - scheduler
  - questionnaire
  - dashboard state/site
  - handoff
  - GitHub sync/integration
  - plugin management
  - resume / vibe / ask / capture

### `src/cli/services`
- Shared service layer used by commands.
- Includes plugin loading, plugin mounts, task trash, questionnaire state, dashboard state, evolution state, handoff, JSONL, text helpers, report helpers, and git snapshot/state utilities.

### `src/cli/dispatchers`
- Secondary command routing split into family-specific dispatchers:
  - `ops.js`
  - `evolution_ops.js`
  - `delivery_ops.js`

### `plugins`
- Bundle-based plugin subsystem.
- Each plugin has its own manifest and, when present, runtime/docs/tests/schema surfaces.

### `knowledge`
- Governance, standard systems, workflow instructions, task tracking, design system, questionnaire engine, and delivery guidance.
- This folder is heavily source-like for policy and operating model, even though it is documentation.

### `packs`
- Prompt packs, generators, templates, and related pack-based artifacts.
- These are a real part of the delivery/runtime tooling, not just static docs.

### `schemas`
- Validation schemas for runtime and source packages.
- Includes `schemas/runtime/*.json` and many other schema files.

### `docs`
- User-facing docs, CLI reference, system capability reference, workflow docs, site assets, and generated report outputs.

### `docs/reports`
- Large generated/historical report surface.
- Useful for audit trails, capability matrices, workflow summaries, and docs-site artifacts.
- Generally not treated as source-of-truth for behavior unless a specific file is explicitly canonical.

### `tests`
- Top-level test entrypoints for unit and integration coverage.
- The repo also contains plugin-local tests in plugin folders.

### `.kabeeri`
- Runtime-only workspace state.
- This is the main operational state boundary and should not be committed unless a specific evolution explicitly requires it.

## 3. CLI Architecture

### Architecture summary
The CLI is layered rather than flat:
- `bin/kvdf.js` is only the launcher.
- `src/core/bootstrap` creates the runner.
- `src/cli/command_dispatcher.js` fans requests into dispatcher groups.
- `src/cli/dispatchers/*` route high-level families.
- `src/cli/commands/*` implement the commands.
- `src/cli/services/*` manage state, parsing, runtime files, plugin mounts, reports, and handoff.
- `src/cli/validate.js` performs scope-based repository validation.
- `src/cli/ui.js` is the help and output contract.

### Command family table

| Command Family | Dispatcher | Source File | Category | Notes |
|---|---|---|---|---|
| Safety / entry / lifecycle | `dispatchSafetyCommands` | `src/cli/command_dispatcher.js`, `src/cli/commands/*` | Core native | Includes resume, entry, track, onboarding, doctor, init, validate, guard, conflict |
| Build / blueprints / intake | `dispatchBuildCommands` | `src/cli/command_dispatcher.js`, `src/cli/commands/questionnaire.js`, `src/cli/commands/vibe.js` | Core native | Covers questionnaire, vibe, ask, capture, blueprint, data-design, prompt packs, generators |
| Reports / dashboards | `dispatchReportCommands` | `src/cli/dispatchers/*`, `src/cli/commands/dashboard_state.js`, `src/cli/commands/dashboard_site.js` | Core native | Live dashboard state, reporting, audit, memory, ADR, AI runs |
| Evolution ops | `dispatchOpsCommands` via `evolution_ops.js` | `src/cli/dispatchers/evolution_ops.js`, `src/cli/commands/evolution.js` | KVDF development pipeline | Evolutions, priorities, temp, batch execution, plugin-related ops |
| Delivery ops | `dispatchOpsCommands` via `delivery_ops.js` | `src/cli/dispatchers/delivery_ops.js`, `src/cli/commands/task_lifecycle.js`, `src/cli/commands/task_scheduler.js`, `src/cli/commands/handoff.js` | KVDF + app delivery | Tasks, plans, projects, delivery, agile, structured, traceability, handoff |
| Session ops | `dispatchOpsCommands` | `src/cli/commands/*` | Core native | Session tracking, multi-AI/session governance, lineage |
| Admin / GitHub / docs / release | `dispatchOpsCommands` | `src/cli/commands/github.js`, `src/cli/commands/plugin.js`, `src/cli/commands/handoff.js` | Core native / plugin-backed | GitHub, sync, package, release, docs, source-package, upgrade |
| Identity / access | `dispatchOpsCommands` | `src/cli/commands/*` | Core native | Owner, developer, agent, token, lock |
| Governance / policy | `dispatchOpsCommands` | `src/cli/commands/*` | Core native | Budget, pricing, usage, security, migration, policy, context packs |
| Plugin management | `dispatchOpsCommands` | `src/cli/commands/plugin.js`, `src/cli/services/plugin_loader.js`, `src/cli/services/plugin_mounts.js` | Plugin dev | Install, enable, disable, reload, mount, unmount, status |

### CLI layer observations
- The router is broad, but the command families are still readable.
- `src/cli/index.js` remains an important surface for track-specific summaries and command help.
- `src/cli/ui.js` is not just decoration: it encodes product policy in help text.
- The CLI surfaces now explicitly distinguish owner-track and app-track behavior.

## 4. Core Native System Capabilities

The following are the major native capability families found in source and docs. Some are purely source-backed, while others are source-backed with docs and runtime state.

| Capability | Commands | Source Files | Runtime Files | Tests | Category | Maturity | Notes |
|---|---|---|---|---|---|---|---|
| Resume / entry / track / onboarding | `resume`, `entry`, `track`, `onboarding` | `src/cli/commands/resume.js`, `src/cli/index.js` | `.kabeeri/project.json`, `.kabeeri/session_track.json`, `.kabeeri/sessions.json` | `tests/service.unit.test.js`, `tests/cli.integration.test.js` | Core native | working | Determines owner-track vs app-track and the next exact action |
| Validation / doctor / init | `validate`, `doctor`, `init` | `src/cli/validate.js`, `bin/kvdf.js` | `.kabeeri/*` depending on scope | `tests/cli.integration.test.js` | Core native | mature | Validation is scope-based and deep |
| Guard / conflict / safety | `guard`, `conflict` | `src/cli/commands/*`, `src/cli/index.js` | `.kabeeri/locks.json`, `.kabeeri/policies/*` | `tests/service.unit.test.js` | Core native | working | Safety gates and conflict detection exist |
| Questionnaire / vibe / ask / capture / blueprint / data-design | `questionnaire`, `vibe`, `ask`, `capture`, `blueprint`, `data-design` | `src/cli/commands/questionnaire.js`, `src/cli/commands/vibe.js` | `.kabeeri/questionnaires/*`, `.kabeeri/interactions/*` | `tests/service.unit.test.js`, CLI tests | Core native + vibe pipeline | working | File-based intake is real, not chat-only |
| Task lifecycle / scheduler / trash / coverage | `task`, `tasks`, `coverage`, `assessment`, `scheduler` | `src/cli/commands/task_lifecycle.js`, `src/cli/commands/task_scheduler.js`, `src/cli/services/task_trash.js` | `.kabeeri/tasks.json`, `.kabeeri/task_trash.json` | `tests/service.unit.test.js`, `tests/cli.integration.test.js` | Core native | mature | Task trash/archive is a first-class runtime feature |
| Evolution / priorities / temp / batch-exe | `evolution`, `priorities`, `temp`, `batch-exe` | `src/cli/commands/evolution.js`, `knowledge/governance/EVOLUTION_STEWARD.md` | `.kabeeri/evolution.json`, `.kabeeri/reports/*` | `tests/service.unit.test.js` | Core native + KVDF pipeline | mature | Milestone/change-layer behavior is implemented |
| Dashboard / reports / readiness / governance | `dashboard`, `report`, `reports`, `readiness`, `governance` | `src/cli/commands/dashboard_state.js`, `src/cli/commands/dashboard_site.js`, `src/cli/services/report_output.js` | `.kabeeri/dashboard/*`, `.kabeeri/reports/*` | CLI tests, dashboard checks | Core native | working | Owner/app dashboards are separated by default |
| Handoff / source-package / docs / structure / capability / adr / ai-run | `handoff`, `source-package`, `docs`, `structure`, `capability`, `adr`, `ai-run` | `src/cli/commands/handoff.js`, `docs/*`, `knowledge/*` | `.kabeeri/handoff/*`, `.kabeeri/reports/*` | unit/integration coverage | Core native | working | Produces deliverable handoff packages and report artifacts |
| Identity / access / token / lock / owner / developer / agent | `owner`, `developer`, `agent`, `token`, `lock` | `src/cli/index.js`, `src/cli/commands/*` | `.kabeeri/tokens.json`, `.kabeeri/locks.json`, `.kabeeri/developers.json`, `.kabeeri/agents.json` | unit coverage | Core native | working | Enforces track and access context |
| Policy / security / migration / preflight | `policy`, `security`, `migration`, `preflight` | `src/cli/commands/*`, `src/cli/validate.js` | `.kabeeri/policies/*`, `.kabeeri/security/*`, `.kabeeri/migrations/*` | validation tests | Core native | working | Rich governance layer with runtime policy results |
| Usage / pricing / budget | `usage`, `pricing`, `budget` | `src/cli/commands/*` | `.kabeeri/ai_usage/*`, `.kabeeri/reports/*` | coverage in service tests | Core native | working | AI cost and consumption governance exists |
| GitHub / sync / release / package / upgrade | `github`, `sync`, `release`, `package`, `upgrade` | `src/cli/commands/github.js`, `src/cli/commands/*` | `.kabeeri/plugins.json`, `.kabeeri/plugin-links/*`, `.kabeeri/reports/*` | CLI tests, package checks | Core native / plugin-backed | partial | Source surface exists; actual delivery is conditional and track-aware |
| Agile / structured / plan / project / feature / journey / delivery | `agile`, `structured`, `plan`, `project`, `feature`, `journey`, `delivery` | `src/cli/dispatchers/delivery_ops.js`, `src/cli/commands/task_*` | `.kabeeri/agile.json`, `.kabeeri/structured.json`, `.kabeeri/workstreams.json` | service tests | Core native | working | Task and delivery model is integrated |
| Plugin install / enable / disable / reload | `plugin`, `plugins` | `src/cli/commands/plugin.js`, `src/cli/services/plugin_loader.js`, `src/cli/services/plugin_mounts.js` | `.kabeeri/plugins.json`, `.kabeeri/plugin-links/*` | plugin loader tests in service unit | Core native | mature | Plugin bundles are runtime-mounted and removable |
| Prompt packs / context packs / model route / multi-AI | `prompt-pack`, `context-pack`, `model-route`, `multi-ai` | `src/cli/index.js`, `src/cli/commands/*` | `.kabeeri/reports/*`, `.kabeeri/ai_runs/*`, packs output | service tests | Core native | working | AI orchestration and prompt composition are represented |
| Workspace / app docs generation | `docs`, `source-package`, `create`, `generator` | `src/cli/workspace.js` | `.kabeeri/project.json`, generated app doc package | workspace tests | Core native | working | Portable app-doc package generation is implemented |

### Notes on maturity
- `mature`: broad, stable, and integrated across validation/runtime/help.
- `working`: implemented and actively used, but still subject to policy cleanup or docs drift.
- `partial`: source exists, but implementation is mixed with plugin-backed or legacy policy surfaces.
- `docs-only`: present only in docs or generated artifacts.
- `unclear`: not used heavily enough to be confidently classified from source evidence alone.

## 5. KVDF Development Pipeline Dev

### What this pipeline is
This is the framework-owner pipeline for developing KVDF itself. It is the Owner Track / KVDF Core lane.

### Implemented flow
Current owner-track development follows a loop like:
`resume -> validate -> inspect evolution/priorities/temp -> implement -> verify -> commit on main -> push origin main`

The source and governance now explicitly support:
- direct-to-main delivery as the default for solo owner KVDF Core work
- local-only handoff as valid when GitHub is not being used
- optional branch/PR handoff only for team/protected/risky cases
- a visible owner-track dashboard and owner-track task/evolution summaries

### Key files
- `src/cli/commands/resume.js`
- `src/cli/commands/evolution.js`
- `src/cli/commands/task_lifecycle.js`
- `src/cli/commands/task_scheduler.js`
- `src/cli/commands/dashboard_state.js`
- `src/cli/commands/dashboard_site.js`
- `src/cli/commands/plugin.js`
- `src/cli/commands/handoff.js`
- `knowledge/governance/KVDF_WORKFLOW_INSTRUCTIONS.md`
- `knowledge/governance/EVOLUTION_STEWARD.md`
- `docs/cli/CLI_COMMAND_REFERENCE.md`
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md`
- `plugins/kvdf-dev/*`

### State files used by this pipeline
- `.kabeeri/evolution.json`
- `.kabeeri/tasks.json`
- `.kabeeri/task_trash.json`
- `.kabeeri/reports/*`
- `.kabeeri/session_track.json`
- `.kabeeri/project.json`
- `.kabeeri/plugins.json`

### Direct-to-main status
The policy is now explicit:
- KVDF Core solo owner development defaults to `main`.
- Branch/PR is optional and only used when the repository/mode demands it.
- Runtime state should not be committed unless an evolution explicitly requires it.

### Remaining legacy metadata
Some docs and runtime surfaces still preserve legacy branch/PR vocabulary because the repo supports both solo owner and team/protected modes. That is intentional compatibility, but it is a drift risk if not kept aligned.

### Gaps
- Some generated report files can still become dirty after validation/checks.
- The repository still has mixed historical planning documents.
- There is still a lot of policy encoded across docs and help text rather than centralized in one canonical policy file.

## 6. Vibe Development Pipeline Dev

### What this pipeline is
This is the application/workspace delivery lane. It is the app-track / vibe developer flow.

### Implemented flow
The implemented intake-to-delivery flow is:
`request -> file-based questions -> answers one by one -> intake plan -> review -> approve -> evolution -> task slicing -> implementation -> verify -> complete -> trash/archive -> auto-close evolution -> handoff`

If GitHub-backed delivery is enabled, the optional extension is:
`... -> branch -> tests -> commit -> push -> PR prepare/create -> Owner review -> merge main -> pull latest main -> next evolution`

### Key files
- `src/cli/commands/questionnaire.js`
- `src/cli/commands/evolution.js` (app mode)
- `src/cli/commands/task_lifecycle.js`
- `src/cli/commands/task_scheduler.js`
- `src/cli/commands/dashboard_state.js`
- `src/cli/commands/dashboard_site.js`
- `src/cli/commands/handoff.js`
- `knowledge/governance/KVDF_WORKFLOW_INSTRUCTIONS.md`
- `docs/workflows/KVDF_LED_DELIVERY.md`
- `docs/workflows/PR_HANDOFF_TEMPLATE.md`
- `docs/site/assets/js/app.js`

### State files used by this pipeline
- `.kabeeri/questionnaires/questionnaire_questions.md`
- `.kabeeri/questionnaires/answers.json`
- `.kabeeri/questionnaires/adaptive_intake_plan.json`
- `.kabeeri/tasks.json`
- `.kabeeri/task_trash.json`
- `.kabeeri/evolution.json`
- `.kabeeri/dashboard/*`
- `.kabeeri/handoff/*`
- `.kabeeri/reports/*`

### Important implementation notes
- Questions are file-based, not chat-only.
- The system waits for complete answers before it generates the full plan/tasks.
- Task trash/archive is part of the normal closeout path.
- Parent evolutions auto-close when linked tasks are archived.
- Owner and app dashboards are separated by default.
- GitHub sync is optional and does not block local-only operation.

### Gaps
- The pipeline is strong, but the docs/site and CLI still need periodic wording normalization so branch/PR is not implied as the default in the app-track lane.
- More end-to-end tests around optional GitHub mode would be valuable.

## 7. Plugins Dev

### Plugin inventory
I found 13 plugins from `plugins/*/plugin.json`.

| Plugin | Track | Enabled by default | Removable | Command Surface | Runtime Entrypoint | Maturity | Gaps |
|---|---:|---:|---:|---|---|---|---|
| `blog` | app | no | yes | App builder bundle; manifest does not enumerate commands | `plugins/blog/runtime/blog.js` | working | Command surface is docs/runtime-driven, not manifest-explicit |
| `booking-builder` | app | no | yes | App builder bundle; manifest does not enumerate commands | `plugins/booking-builder/runtime/booking.js` | working | Sparse bundle docs/tests compared with framework bundles |
| `company-profile` | app | no | yes | App builder bundle; manifest does not enumerate commands | `plugins/company-profile/runtime/company_profile.js` | working | Bundle is light; command docs are limited |
| `crm` | app | no | yes | App builder bundle; manifest does not enumerate commands | `plugins/crm/runtime/crm.js` | working | Command/runtime docs are sparse |
| `ecommerce-builder` | app | no | yes | App builder bundle; manifest does not enumerate commands | `plugins/ecommerce-builder/runtime/ecommerce.js` | working | Light docs/test surface |
| `ecommerce-mobile-app` | app | no | yes | App builder bundle; manifest does not enumerate commands | `plugins/ecommerce-mobile-app/runtime/ecommerce_mobile_app.js` | working | Needs better docs/tests parity |
| `github` | shared | yes | yes | Integration bundle; surfaced through CLI GitHub commands | none declared in manifest | working | Manifest is thin; behavior is mostly routed by core commands |
| `github_sync` | shared | yes | yes | Sync rules bundle; surfaced through CLI GitHub/sync behavior | none declared in manifest | working | Very small surface, mostly policy/rules |
| `kvdf-dev` | framework_owner | yes | yes | Framework-owner bundle; CLI/evolution/task surfaces and governance docs | `plugins/kvdf-dev/runtime/index.js` | mature | Large surface area, some legacy wording and report drift risk |
| `multi_ai_governance` | shared | yes | yes | Governance bundle for multi-AI work | none declared in manifest | working | Small surface; documentation is lighter than core bundles |
| `news-website` | app | no | yes | App builder bundle; manifest does not enumerate commands | `plugins/news-website/runtime/news_website.js` | working | Docs/test surfaces are modest |
| `pos` | app | no | yes | App builder bundle; manifest does not enumerate commands | `plugins/pos/runtime/pos.js` | working | Docs/test surfaces are modest |
| `vibe-maintainer` | app | no | yes | App-maintenance bundle; surfaced through vibe-maintainer commands | `plugins/vibe-maintainer/runtime/vibe_maintainer.js` | working | App maintenance only; limited docs/tests/runtime footprint |

### Plugin loader behavior
- `src/cli/services/plugin_loader.js` scans manifests, resolves enabled/disabled state, and builds plugin bundle reports.
- `src/cli/services/plugin_mounts.js` creates and removes mount records under `.kabeeri/plugin-links/*`.
- Plugins are runtime-mounted when enabled; the loader can fall back to source/package paths when allowed.
- `.kabeeri/plugins.json` is the main runtime plugin state file.

### Manifest contract
The manifest appears to define:
- plugin identity
- track
- family/type
- enabled/default/removable flags
- runtime bundle metadata
- bundle contract / load strategy

### Mount behavior
- Mount records are runtime state, not repo source.
- Plugin bundles are removable.
- The framework-owner bundle and app-maintenance bundle are both runtime-controlled and appear to be intentional, not hard-coded immutable runtime pieces.

### Plugin gaps
- The manifest is fairly lean compared with the actual runtime/help surface.
- Several plugins have sparse docs and tests.
- Plugin surfaces are often inferred from CLI routing and bundle docs rather than from manifest declarations.

## 8. Pipeline Map

### 1) KVDF Development Pipeline Dev
- Purpose: develop KVDF Core itself.
- Current implementation: strong and explicit, with owner-track routing and direct-to-main policy.
- Important files: `src/cli/commands/evolution.js`, `src/cli/commands/resume.js`, `knowledge/governance/KVDF_WORKFLOW_INSTRUCTIONS.md`, `plugins/kvdf-dev/*`
- Missing pieces: fewer legacy policy references, tighter report cleanliness, more direct-to-main consistency in help/docs
- Recommended next evolution: normalize remaining owner-track wording everywhere and centralize the delivery policy contract

### 2) Vibe Development Pipeline Dev
- Purpose: build app/workspace projects with KVDF.
- Current implementation: questionnaire, blueprint, task slicing, dashboard state, local-first handoff, optional GitHub flow.
- Important files: `src/cli/commands/questionnaire.js`, `src/cli/commands/evolution.js`, `src/cli/commands/dashboard_state.js`, `docs/workflows/KVDF_LED_DELIVERY.md`
- Missing pieces: more end-to-end GitHub-backed tests, UI wording consistency, fewer generated-artifact surprises
- Recommended next evolution: harden the GitHub-backed handoff path and make the PR handoff template part of a commandable flow

### 3) Plugins Dev
- Purpose: install/uninstall and mount/remount plugin bundles cleanly.
- Current implementation: real manifest scanning, runtime mounts, enable/disable state, plugin reporting.
- Important files: `src/cli/services/plugin_loader.js`, `src/cli/services/plugin_mounts.js`, `src/cli/commands/plugin.js`, `plugins/*/plugin.json`
- Missing pieces: more explicit per-plugin command docs and stronger bundle test parity
- Recommended next evolution: standardize plugin bundle docs/tests/schema footprints

### 4) Core Native System Capabilities Dev
- Purpose: provide always-available CLI/runtime capabilities that do not depend on plugin install state.
- Current implementation: extensive native command surface with validation, governance, dashboards, question intake, task/evolution flows, handoff, and policy enforcement.
- Important files: `src/cli/index.js`, `src/cli/command_dispatcher.js`, `src/cli/dispatchers/*`, `src/cli/commands/*`, `src/cli/services/*`
- Missing pieces: a tighter canonical capability map and fewer duplicated/legacy labels across docs/help/runtime
- Recommended next evolution: build a definitive capability registry file with one source of truth for command family ownership

## 9. Data Model and Runtime State

The runtime model is heavily rooted in `.kabeeri/`.

### Major runtime files and categories
- `.kabeeri/project.json`: workspace/project identity and mode.
- `.kabeeri/tasks.json`: active task ledger.
- `.kabeeri/task_trash.json`: archived/trash task ledger.
- `.kabeeri/evolution.json`: evolution/milestone ledger.
- `.kabeeri/plugins.json`: plugin enablement and state.
- `.kabeeri/plugin-links/*/mount.json`: plugin mounts.
- `.kabeeri/dashboard/*`: dashboard state and rendered local site content.
- `.kabeeri/reports/*`: generated reports and execution summaries.
- `.kabeeri/interactions/*`: captured interactions and prompts.
- `.kabeeri/questionnaires/*`: questionnaire prompts, answers, and plan outputs.
- `.kabeeri/ai_usage/*`: AI usage and cost/reporting artifacts.
- `.kabeeri/security/*`: security scans and policy outputs.
- `.kabeeri/migrations/*`: migration plans and checks.
- `.kabeeri/adr/*`: architecture decision records and related outputs.
- `.kabeeri/ai_runs/*`: AI-run records.
- `.kabeeri/handoff/*`: handoff packages and final reports.
- `.kabeeri/locks.json`: lock state.
- `.kabeeri/tokens.json`: token state.
- `.kabeeri/developers.json`: developer ownership records.
- `.kabeeri/agents.json`: agent ownership records.
- `.kabeeri/session_track.json`: session/track lineage.
- `.kabeeri/sessions.json`: session records.
- `.kabeeri/structured.json`: structured workflow state.
- `.kabeeri/agile.json`: agile workflow state.
- `.kabeeri/workstreams.json`: workstream definitions and state.
- `.kabeeri/customer_apps.json`, `.kabeeri/features.json`, `.kabeeri/journeys.json`: app/workspace delivery state.
- `.kabeeri/policies/policy_results.json`: policy outcomes.

### Runtime boundary rules
- `.kabeeri/` is runtime-only and should not be committed unless a specific evolution explicitly requires it.
- Generated local reports are useful to inspect but should be treated as runtime output, not source-of-truth.
- Dashboard state, handoff packages, and plugin mount records are all runtime artifacts.

### Source-to-runtime relationship
- Source code writes to these files and reads from them.
- Validation intentionally uses them.
- They are necessary for runtime governance but should not become a substitute for explicit source documentation or source control.

## 10. Tests and Validation Coverage

### What `npm test` covers
From `package.json`, `npm test` runs:
- `node tests/service.unit.test.js`
- `node tests/cli.integration.test.js`

### What `npm run check` covers
From `package.json`, `npm run check` runs:
- `npm test`
- `npm run test:smoke`

### What smoke validation covers
`npm run test:smoke` runs:
- `node bin/kvdf.js --version`
- `node bin/kvdf.js doctor`
- `node bin/kvdf.js validate`
- `node bin/kvdf.js prompt-pack list`
- `node bin/kvdf.js plan list`

### Strong coverage areas
- service-layer unit behavior
- CLI integration behavior
- validation paths
- prompt-pack and plan list smoke behavior
- plugin loader and plugin mount contracts
- questionnaire helpers
- dashboard state and dashboard docs/site plumbing
- workspace/package generation helpers

### Missing / weaker areas
- full end-to-end test coverage for every plugin install/uninstall path
- complete team/protected GitHub delivery mode coverage
- more direct tests around direct-to-main policy wording in the docs site
- fewer generated report dirty-state surprises after check/validation
- broader app-track vs owner-track dashboard title consistency tests

## 11. Documentation System

### Docs site
- `docs/site/assets/js/app.js` is the main docs-site content source.
- It renders the vibe-developer pipeline, owner-track guidance, delivery mode text, and related docs pages.
- It is source-backed, not just generated static content.

### CLI reference
- `docs/cli/CLI_COMMAND_REFERENCE.md` describes the command families and their policy meanings.
- It now reflects solo owner direct-to-main default and optional branch/PR modes.

### System capabilities reference
- `docs/SYSTEM_CAPABILITIES_REFERENCE.md` is a major human-readable capability map.
- It is one of the best sources for understanding current runtime behavior.

### Workflow docs
- `knowledge/governance/KVDF_WORKFLOW_INSTRUCTIONS.md`
- `knowledge/governance/EVOLUTION_STEWARD.md`
- `docs/workflows/KVDF_LED_DELIVERY.md`
- `docs/workflows/PR_HANDOFF_TEMPLATE.md`

### Generated docs/reports
- `docs/reports/*` contains many historical and generated artifacts.
- These are useful but not all canonical.
- They should be treated carefully because `npm run check` can refresh them and leave the tree dirty.

### Docs drift risks
- Runtime policy and docs policy can diverge if direct-to-main vs branch/PR wording is not kept in sync.
- Some historical docs still carry older planning language.
- The Arabic README needs encoding cleanup.

## 12. Architecture Strengths

1. **Strong local-first runtime**
   - The CLI, runtime state, validation, dashboards, and handoff all work without needing a remote service as the source of truth.

2. **Clear owner/app track separation**
   - Source and docs now explicitly distinguish KVDF Core owner work from app-track work.

3. **Real plugin system**
   - Plugins are manifest-driven, mountable, removable, and tracked in runtime state.

4. **Deep validation model**
   - Validation is scope-based rather than a single monolithic pass.

5. **Evolution/task governance**
   - Evolutions and tasks are real runtime concepts, not just terms in docs.

6. **Task trash/archive**
   - Completed work can be archived with retention and recovery semantics.

7. **Dashboard and report layer**
   - The repo has live dashboards, reports, and generated artifacts, which makes governance visible.

8. **Questionnaire-intake pipeline**
   - App-building intake is structured and file-based.

9. **Handoff packaging**
   - There is a formal output path for local delivery packages and final reports.

10. **Policy is encoded in help/docs**
   - The CLI help and docs are not passive; they actively describe operating policy.

## 13. Architecture Problems / Risks

1. **Generated report dirty-state**
   - `docs/reports/*` can be refreshed by validation/check steps and leave the working tree dirty.

2. **Large CLI surface with policy embedded in multiple places**
   - Some policy is in source, some in docs, some in generated reports.

3. **Legacy branch/PR vocabulary still exists**
   - The repo supports it, but old wording can still confuse users if not kept consistent.

4. **README Arabic encoding quality**
   - `README_AR.md` is present but the text extraction showed corruption/encoding issues.

5. **Historical docs overlap**
   - `ROADMAP.md`, `CHANGELOG.md`, and some docs/reports mix history, plan, and current state.

6. **Plugin surface is lighter than core surface**
   - Several plugin bundles have thin docs/tests and rely on runtime routing.

7. **Monolithic or broad routing layers**
   - `src/cli/command_dispatcher.js` and the surrounding command/service surface are large.

8. **App/owner naming can still vary**
   - Some surfaces say Kabeeri, some say Vibe Developer, some say app-track/owner-track. The split is correct, but consistent phrasing still matters.

9. **Runtime boundaries are broad**
   - `.kabeeri/` contains many operational files, which is powerful but easy to over-commit accidentally.

10. **Test coverage gaps**
   - The repo has good coverage, but some delivery-mode and plugin-flow edges could still use more integration tests.

## 14. Recommended Next Evolutions

| Priority | Title | Reason | Files Likely Affected | Expected Output | Risk Level | Validation Commands |
|---|---|---|---|---|---|---|
| 1 | Generate Reports Dirty-State Policy | Prevent `npm run check` from unexpectedly dirtying `docs/reports/*` | `docs/reports/*`, `src/cli/services/report_output.js`, docs/workflows | Stable generated artifacts policy | medium | `node bin/kvdf.js validate`, `npm test`, `npm run check` |
| 2 | Canonical Capability Registry | Centralize command-family ownership and policy | `src/cli/command_dispatcher.js`, `src/cli/ui.js`, `docs/SYSTEM_CAPABILITIES_REFERENCE.md` | One authoritative capability map | medium | `node bin/kvdf.js validate`, `npm test` |
| 3 | Direct-to-Main Wording Normalization | Remove lingering branch/PR-default language in docs/help | `docs/cli/CLI_COMMAND_REFERENCE.md`, `docs/site/assets/js/app.js`, `knowledge/governance/*` | Consistent solo-owner policy wording | low | `node --check docs/site/assets/js/app.js`, `npm test` |
| 4 | README Arabic Cleanup | Fix encoding and keep parity with English README | `README_AR.md` | Clean Arabic docs parity | low | `npm test`, `npm run check` |
| 5 | Plugin Bundle Surface Documentation | Make each plugin surface easier to audit | `plugins/*/docs/*`, `plugins/*/plugin.json` | Better per-plugin discoverability | low | `node bin/kvdf.js validate` |
| 6 | Team/Protected GitHub Delivery Tests | Cover branch/PR optional mode without regressions | `src/cli/commands/*`, `tests/cli.integration.test.js` | Test coverage for protected/team mode | medium | `npm test`, `npm run check` |
| 7 | Dashboard Title Consistency Sweep | Normalize owner/app naming everywhere | `src/cli/commands/dashboard_*.js`, `docs/site/assets/js/app.js` | Clearer owner/app separation | low | `node bin/kvdf.js validate`, `npm test` |
| 8 | Runtime Boundary Documentation | Make `.kabeeri/` boundaries explicit in one canonical place | `knowledge/governance/*`, `docs/workflows/*` | Cleaner runtime/source separation | low | `node bin/kvdf.js validate` |
| 9 | Plugin Loader Hardening | Expand mount/install/uninstall coverage | `src/cli/services/plugin_loader.js`, `src/cli/services/plugin_mounts.js`, plugin tests | Safer plugin lifecycle | medium | `npm test`, `npm run check` |
| 10 | CLI Router Decomposition | Reduce the size of the router and improve maintainability | `src/cli/command_dispatcher.js`, `src/cli/dispatchers/*` | Cleaner command routing architecture | medium | `npm test`, `node bin/kvdf.js validate` |

## 15. Final Understanding Map

KVDF is best understood as a local-first repo operating system with five interconnected layers:

1. **Native CLI/runtime**
   - The executable, router, validation, help text, and command families.

2. **Owner Track / KVDF Core**
   - Framework-level development, direct-to-main delivery, evolution governance, and core platform maintenance.

3. **App Track / Vibe Developer delivery**
   - Questionnaire intake, app evolution, task slicing, local-first handoff, and optional GitHub-backed delivery.

4. **Plugin bundles**
   - Removable capability packs that extend or specialize the core without replacing it.

5. **Runtime state and generated artifacts**
   - `.kabeeri/` plus docs/reports, dashboards, and handoff packages that make the system operational.

The architecture is strong because it already has:
- a real runtime state model
- a real evolution/task model
- a real plugin loader/mount system
- a real dashboard/reporting system
- a real validation pipeline
- a real docs and handoff ecosystem

The main thing left is not to invent more mechanics, but to tighten the boundaries:
- canonicalize policy wording
- keep generated artifacts clean
- reduce docs/source drift
- make plugin surfaces easier to audit
- keep owner-track and app-track language consistent
