# CLI Command Reference

This is a compact reference for the `kvdf` commands. Use `kvdf` in normal documentation, project work, team onboarding, VS Code tasks, and AI handoff instructions.

Use `node bin/kvdf.js` only while developing Kabeeri itself from the repository source, debugging the CLI entry file, running before the package is linked, or when `kvdf` is not available on `PATH` yet. The working CLI entrypoint is still `bin/kvdf.js`; `kvdf` is the product-facing command exposed by the package bin. Use `kvdf --help`, `node bin/kvdf.js --help`, or `npm run kvdf -- --help` to confirm the exact command surface in the current checkout.

## Global

```bash
kvdf --help
kvdf --version
kvdf create --help
kvdf task --help
kvdf sprint --help
kvdf session --help
kvdf agent --help
kvdf developer --help
kvdf token --help
kvdf lock --help
kvdf pricing --help
kvdf usage --help
kvdf design --help
kvdf structure --help
kvdf evolution --help
kvdf adr --help
kvdf ai-run --help
kvdf dashboard --help
kvdf release --help
kvdf github --help
kvdf resume --help
kvdf track --help
kvdf multi-ai --help
kvdf conflict --help
kvdf source-package --help
```

Common command aliases are supported for terminal convenience:

```bash
kvdf tasks list
kvdf t list
kvdf tokens list
kvdf dash generate
kvdf prompts list
kvdf start
kvdf conflict scan
```

## Workspace

```bash
kvdf init
kvdf init --profile lite
kvdf init --profile standard
kvdf init --profile enterprise
kvdf init --lang user
kvdf init --lang ar
kvdf init --lang en
kvdf init --lang both
kvdf init --goal "Build ecommerce store with Laravel backend and Next.js frontend"
kvdf init --no-intake
```

Without `--lang`, Kabeeri stores `language: user`, so adaptive intake and generated guidance should follow the user's detected language unless a command explicitly overrides it.

When `kvdf init` is run interactively, Kabeeri asks one short question: what software application the developer wants to build. The answer immediately creates an adaptive intake plan and docs-first tasks. In non-interactive automation, use `--goal "<one sentence>"` to trigger the same flow, or `--no-intake` to initialize state only.

The docs-first tasks are intentional. They make Kabeeri ask and document the project before implementation tasks start, reducing the chance that an AI assistant skips project documentation and jumps directly into code.

## Operating Tracks

Kabeeri is organized around two primary tracks:

```text
Framework Owner Track
resume -> evolution priorities -> evolution temp -> implement -> sync -> validate -> verify

Vibe App Developer Track
resume -> vibe/ask -> blueprint/questionnaire -> temp -> tasks/capture -> validate -> handoff
```

Framework-owner sessions use Evolution Steward to change Kabeeri itself. Vibe app-developer sessions use the same CLI engine to build an application with governed tasks, captures, blueprints, and validation. The shared commands `resume`, `guard`, `conflict`, `validate`, `dashboard`, `reports`, and `sync` keep both tracks safe and resumable.

See `docs/reports/KVDF_TWO_TRACK_RESTRUCTURE.md` for the canonical track map and session cycle summary.
See `knowledge/governance/TRACK_ROUTING_GOVERNANCE.md` for the route and block rules that decide which track activates at entry.

## Command Lifecycle Ledger

The current command and deprecation ledger lives in
`docs/reports/KVDF_COMMAND_DEPRECATION_LEDGER.md`. Use it when you need a quick
answer to four questions:

- Which command families are active and canonical right now?
- Which surfaces were migrated out of the monolithic CLI facade?
- Which older entry points remain only as compatibility aliases?
- Which surfaces are still intentionally duplicated during migration?

At the moment, no user-facing command is deprecated. Compatibility aliases are
retained for convenience, and the release publish path still exists through both
`kvdf release publish` and `kvdf github release publish` because both routes
must respect the same release and GitHub write gates.

## Folder Ownership Ledger

The migration ledger also needs to explain where the important folders live and
which track owns them:

| Folder | Track / Status | Notes |
| --- | --- | --- |
| `src/cli/index.js` | shared bridge / migrating | Legacy facade still holds a little routing glue while command modules finish the split. |
| `src/cli/commands/` | shared platform layer / migrated | Canonical command modules live here instead of the monolith. |
| `src/cli/services/` | shared platform layer | Reusable runtime helpers that both owner and app surfaces can call. |
| `plugins/owner-track/` | owner-track | Owner-only framework controls and packaging metadata. |
| `workspaces/apps/<app-slug>/` | app-track | Isolated developer-app workspaces with their own local state. |
| `docs/reports/` | shared reporting layer | Ledger, traceability, readiness, and migration reports. |
| `knowledge/` | shared reference layer | Governance and runtime knowledge that informs both tracks. |
| `packs/` | shared prompt/input layer | Prompt packs, generators, and questionnaires that feed both tracks. |

Remaining migration gaps are kept visible on purpose: `src/cli/index.js` still
acts as a compatibility bridge, and `kvdf release publish` and
`kvdf github release publish` remain duplicated until the publish path fully
settles on one canonical entry point.

## Resume / Start

```bash
kvdf resume
kvdf resume --json
kvdf resume --scan
kvdf start
kvdf entry
kvdf track status
kvdf track route
kvdf onboarding
kvdf onboarding report
```

Use `resume` as the first command in a new AI/developer session. It detects whether the current folder is Kabeeri framework source, a user application workspace with `.kabeeri`, or an application folder that has not been initialized with Kabeeri yet.

The command separates the current application npm root from the Kabeeri engine root. This prevents confusion when a user project is a Next.js or React app but Kabeeri itself is also a Node.js CLI. In a user app workspace, application `npm` commands belong to the app root while Kabeeri should be used as the `kvdf` engine. In the framework source, `npm test` and package commands belong to Kabeeri itself.

For framework owner development, `resume` also shows the Evolution Steward next priority, the top ordered development priorities, a parsed `OWNER_DEVELOPMENT_STATE.md` checkpoint, a compact git diff summary, and one exact next action for the current session. This is the required first-session view before continuing framework work.

Use `kvdf entry` or `kvdf start` when you want automatic routing into the correct track without choosing it yourself. Use `kvdf track status` to inspect the active track state, and `kvdf track route` to persist the current routing decision into `.kabeeri/session_track.json`.

Use `kvdf onboarding` when you want the guided first-session route in a compact form. It shows the current workspace path, the safe first steps, the enter/route/resume sequence, and the commands you should run before touching code. The command also writes `.kabeeri/reports/session_onboarding.json`, and `kvdf onboarding report` reloads that persisted onboarding report when you want the saved first-session guide instead of regenerating it.

The selected track is persisted in `.kabeeri/session_track.json` so the next session can resume the same context without re-deriving it from memory.

`--scan` also runs a small resume scan, including git status and workspace validation when `.kabeeri` exists. For framework owner development it also checks Evolution priorities, runs `kvdf conflict scan`, and runs the test suite.

## Framework Boundary Guard

```bash
kvdf guard
kvdf guard status --json
kvdf guard status --allow-framework-edits
```

`guard` prevents accidental Kabeeri framework edits from user application workspaces. In framework source it passes only as framework-owner development. In a user workspace, framework-like paths such as `src/cli/`, `knowledge/`, `packs/`, and `schemas/` are treated as protected Kabeeri internals and blocked unless `--allow-framework-edits` is provided for an intentional Kabeeri fork. The same boundary is enforced when recording post-work captures or ending AI sessions with changed-file lists.

## Conflict Scan

```bash
kvdf conflict scan
kvdf conflict scan --json
kvdf conflict status
```

`conflict scan` is the pre-development drift check for Kabeeri framework work. It verifies that CLI router/help surfaces are aligned, framework guard enforcement is wired into capture/session flows, core and runtime-schema validation still pass, and local `.kabeeri` task/capture/session/lock state has no obvious conflicts. Run it after `kvdf resume` and before adding broad new behavior.

## GitHub Team Sync

```bash
kvdf sync status
kvdf sync status --json
kvdf sync status --fetch
kvdf sync pull
kvdf sync pull --confirm
kvdf sync push
kvdf sync push --confirm
```

`sync` is the local-to-GitHub team coordination preflight. It checks branch, remote, upstream, ahead/behind counts, local changed files, and whether `.kabeeri` exists. `pull` and `push` are dry-run commands unless `--confirm` is provided.

Use `sync status` before starting a task in a multi-developer workspace. Use `sync pull` to preview a safe `git pull --ff-only`. Use `sync push` to preview remote publication after tests, validation, and Owner review.

For solo or single-developer local workspaces, `sync` is optional and acts as a manual safety check. For team workspaces with multiple active developers or agents, Kabeeri treats sync as recommended before starting team-scoped work and after task/session/capture changes.

## Source Package

```bash
kvdf source-package
kvdf source-package study
kvdf source-package inventory
kvdf source-package map
kvdf source-package source-map
kvdf source-package placement
kvdf source-package normalize
kvdf source-package compare
kvdf source-package verify
kvdf source-package migration
kvdf source-package manifest
kvdf source-package cleanup
kvdf source-package decommission
kvdf source-package decommission --confirm-remove
kvdf source-package --json
```

`KVDF_New_Features_Docs/` is a dual-purpose source package, not a generic inbox. It holds a Software Design System reference library plus a project documentation generator system. Use `source-package study` to inspect the dual-purpose intent, `source-package inventory` to review the current file distribution, `source-package map` to see the permanent destination plan, `source-package source-map` to map source branches to capability surfaces and runtime targets, `source-package normalize` to preserve lowercase aliases for the imported roots and sections, `source-package compare` to check overlap against the capability map, `source-package verify` to confirm redistribution readiness before decommissioning the source folder, `source-package cleanup` to preview the safe removal plan after redistribution is complete, and `source-package decommission` to request approval before the folder is actually removed. Pass `--confirm-remove` only when the owner explicitly approves the removal request and you want the CLI to record that confirmation state.


The permanent extraction targets for the imported knowledge are now:

- `knowledge/design_system/software_design_reference/`
- `knowledge/documentation_generator/`

Those folders hold the durable software-design and documentation-lifecycle
references that future Kabeeri sessions should reuse after the source package
is removed.

The permanent reference folders are also available through CLI:

```bash
kvdf software-design list
kvdf software-design index
kvdf software-design map
kvdf software-design compare
kvdf software-design show SOFTWARE_DESIGN_SYSTEM_PATTERNS.md
kvdf docs-generator list
kvdf docs-generator index
kvdf docs-generator map
kvdf docs-generator compare
kvdf docs-generator show DOCS_GENERATION_REFERENCE.md
```

`kvdf software-design compare` produces a duplicate-analysis report for the permanent software design reference and compares it against the central capability map, so we reuse existing capability names instead of inventing duplicates.
`kvdf docs-generator compare` produces the same style of duplicate-analysis report for the permanent documentation generator reference, so lifecycle knowledge stays reusable without inventing duplicate capability names.

## Generators

```bash
kvdf generate --profile lite
kvdf generate --profile standard
kvdf generate --profile enterprise
kvdf create --profile lite
kvdf generate --profile standard --output my-project
kvdf generator create standard --output my-project
```

Generator commands create a folder skeleton with README files and `kabeeri.generated.json`. When they run inside an initialized `.kabeeri` workspace, they also create proposed governance tasks for review, implementation, and validation so scaffolding does not bypass the task tracker. Use `--no-tasks` for a raw folder skeleton only.

## Questionnaires

```bash
kvdf questionnaire list
kvdf questionnaire flow
kvdf questionnaire plan "Build ecommerce store with Laravel backend React frontend payments and mobile app"
kvdf questionnaire plan "Build ERP with inventory accounting and approvals" --json
kvdf questionnaire plan --blueprint ecommerce --framework laravel --frontend react --database mysql
kvdf questionnaire answer entry.project_type --value saas
kvdf questionnaire coverage
kvdf questionnaire missing
kvdf questionnaire generate-tasks
kvdf questionnaire create --profile lite
kvdf questionnaire create --group core
kvdf questionnaire create --group production
kvdf questionnaire create --group extension
kvdf questionnaire create --profile enterprise --output owner-questions
kvdf questionnaire status
```

`questionnaire create` copies the real `.docx` questionnaire files into the output folder. Profiles map to groups: `lite` exports `core`, `standard` exports `core` and `production`, and `enterprise` exports all groups.

`questionnaire plan` generates a focused intake plan from the Product Blueprint Catalog, framework prompt packs, Data Design Blueprint, UI/UX Advisor, and Delivery Mode Advisor. It writes the latest plan to `.kabeeri/questionnaires/adaptive_intake_plan.json` so chat, dashboard, or future VS Code surfaces can ask fewer but more useful questions.

## Repository Foldering

```bash
kvdf structure map
kvdf structure map --json
kvdf structure show standard_systems
kvdf structure validate
kvdf structure validate --json
kvdf structure guide
kvdf validate foldering
```

The foldering system is the repository architecture map for Kabeeri itself. It
groups the current top-level folders into stable areas similar to a mature
framework layout: runtime core, knowledge, packs, integrations, contracts,
documentation, quality, and local runtime state.

The source of truth is `knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json`, with
the human guide in `docs/architecture/REPOSITORY_FOLDERING_SYSTEM.md`.

## Evolution Steward

```bash
kvdf evolution plan "Add docs-first init gate"
kvdf evolution plan "Improve dashboard descriptions" --areas cli,docs,dashboard,tests
kvdf evolution list
kvdf evolution status
kvdf evolution priorities
kvdf evolution next
kvdf evolution roadmap
kvdf evolution partition
kvdf evolution report
kvdf plugins status
kvdf plugins enable owner-track
kvdf plugins disable owner-track
kvdf evolution app status
kvdf evolution app priorities
kvdf evolution app temp
kvdf evolution app defer "Future app idea"
kvdf evolution app deferred
kvdf evolution temp
kvdf evolution temp advance
kvdf evolution temp complete
kvdf evolution defer "Future idea"
kvdf evolution deferred
kvdf evolution deferred restore deferred-001 --confirm-placement --priority-position 8
kvdf evolution priority evo-auto-001 --status in_progress --note "Working now"
kvdf evolution roadmap
kvdf evolution show evo-001
kvdf evolution impact evo-001
kvdf evolution tasks evo-001
kvdf evolution verify evo-001
kvdf multi-ai status
```

Evolution Steward is the single framework-development backlog. It records the
Owner's change request, keeps ordered development priorities, exposes the
seven-step KVDF restructure roadmap and the capability partition matrix,
emits resumable execution reports for each priority, checks possible duplicate
capability matches against the central capability reference, infers impacted
areas, creates proposed follow-up tasks, and exposes unfinished dependent work
in dashboard/live reports. Use it when a requested Kabeeri change may affect
runtime code, CLI help, task tracking,
schemas, dashboard state, reports, prompt/AI guidance, docs, the capability
map, tests, changelog, or release guidance. When a priority is already
`in_progress`, every AI tool must start with `kvdf evolution temp` and work
only on the current temporary slice.

The active Runtime services layer priority keeps reusable orchestration logic
inside `src/cli/services/` modules such as `evolution.js`, `ai_planner.js`,
and `multi_ai_relay.js` so the command facades stay thin while the shared
runtime behavior remains reusable and testable.

The plugin loader is a shared core surface. It reads manifests from `plugins/`
and enablement state from `.kabeeri/plugins.json`, then reports which bundles
are active. Use `kvdf plugins status` to inspect the current load state and
`kvdf plugins show <plugin-id>` to inspect bundle metadata, then use
`kvdf plugins enable|disable <plugin-id>` to adjust the removable owner bundle
without changing the shared core. The owner bundle is packaged as a manifest-
driven removable extension, so `plugins/owner-track/plugin.json` is the source
of truth for its load strategy, version, and command/docs surfaces.

Application developers can also use `kvdf evolution app ...` as a developer-
facing alias. It keeps the same ordered lists and temporary queue behavior but
uses app-friendly labels so a vibe developer can manage app priorities, temp
slices, and deferred ideas without needing framework-owner language. That alias
belongs to the vibe app-developer track, while the unqualified `kvdf evolution`
surface belongs to the framework-owner track.

Use `kvdf evolution priority <id> --status ...` to keep the development phase
list current. Allowed statuses are `planned`, `in_progress`, `blocked`, `done`,
`deferred`, and `rejected`.

If a framework development priority is already `in_progress`, a new
`kvdf evolution plan "<request>"` does not create the change immediately. It
returns a placement report that shows the unfinished priority, the full ordered
priority list, a recommended insertion point, and an explicit waiting state.
The Owner must confirm the placement before Kabeeri records the new change or
creates follow-up tasks:

```bash
kvdf evolution plan "New feature" --confirm-placement --priority-position 4
```

Use deferred ideas for feature concepts that should be remembered but not
implemented yet. Deferred ideas are stored in `.kabeeri/evolution.json`, shown
as one final bucket in `kvdf evolution priorities`, and only become active work
when the Owner restores a selected idea explicitly.

Use temporary execution priorities for the current active `in_progress`
priority only. `kvdf evolution temp` shows or generates the queue, `kvdf
evolution temp advance` moves to the next slice, and `kvdf evolution temp
complete` closes the queue when that priority is finished. The queue expires
automatically when the source priority leaves `in_progress`. It must cover the
full current task from the first required step to the last required step, with
no leftover execution remainder outside the queue. It is the required first
step for any AI tool that begins work on an active priority.

## Temporary Execution Queues

```bash
kvdf temp
kvdf temp advance
kvdf temp complete
kvdf temp clear
```

`kvdf temp` is the general temporary execution queue for developers working on
application tasks. It uses the current `in_progress` task in `.kabeeri/tasks.json`
and covers the full task path from start to finish with no leftover execution
remainder. Use `kvdf temp` for app work and task execution. Use
`kvdf evolution temp` for the Evolution priority backlog.

The source of truth is `.kabeeri/evolution.json`, with human rules in
`knowledge/governance/EVOLUTION_STEWARD.md`.

## Task Scheduler

```bash
kvdf schedule status
kvdf schedule route task-001 --to temp
kvdf schedule route task-001 --to trash
kvdf schedule route task-001 --to restore
kvdf schedule route task-001 --to agent --agent agent-001
kvdf schedule route task-001 --to deferred
kvdf schedule history
```

`kvdf schedule` is the orchestration layer for task movement across active
tasks, temporary queues, trash, deferred routes, and AI agent handoffs. It
records every route in `.kabeeri/task_scheduler.json`, reuses the real temp and
trash systems for actual moves, and keeps a durable movement trail that a
future session can read without rebuilding the route from chat memory.

## Multi-AI Governance

```bash
kvdf multi-ai status
kvdf multi-ai leader start --ai agent-001 --name "Claude Sonnet"
kvdf multi-ai leader transfer --ai agent-002
kvdf multi-ai leader end
kvdf multi-ai agent register --ai agent-001 --name "Claude Sonnet"
kvdf multi-ai agent heartbeat --ai agent-001
kvdf multi-ai agent next --ai agent-001 --count 3
kvdf multi-ai agent call --ai agent-002 --request "Please align the leader lease"
kvdf multi-ai agent respond --call multi-ai-call-001
kvdf multi-ai agent leave --ai agent-001
kvdf multi-ai conversation start --from agent-001 --to agent-002 --topic "Scope" --message "Please review the scope"
kvdf multi-ai conversation send --from agent-001 --to agent-002 --conversation multi-ai-conversation-001 --message "Please review the scope"
kvdf multi-ai conversation inbox --agent agent-002
kvdf multi-ai conversation reply --agent agent-002 --message-id multi-ai-message-001 --reply "Reviewed"
kvdf multi-ai conversation close --conversation multi-ai-conversation-001
kvdf multi-ai sync
kvdf multi-ai sync distribute --leader-ai agent-001 --workers agent-002,agent-003
kvdf multi-ai queue add --ai agent-001 --priority evo-auto-017-multi-ai-governance --title "Schema slice" --files src/cli/index.js
kvdf multi-ai queue list
kvdf multi-ai queue start multi-ai-queue-001
kvdf multi-ai queue advance multi-ai-queue-001
kvdf multi-ai queue complete multi-ai-queue-001
kvdf multi-ai merge add --sources multi-ai-queue-001,multi-ai-queue-002 --title "Leader merge"
kvdf multi-ai merge preview multi-ai-merge-001
kvdf multi-ai merge validate multi-ai-merge-001
kvdf multi-ai merge commit multi-ai-merge-001
kvdf schedule status
kvdf schedule route task-001 --to temp
kvdf schedule route task-001 --to trash
kvdf schedule route task-001 --to restore
kvdf schedule route task-001 --to agent --agent agent-001
kvdf schedule route task-001 --to deferred
```

Multi-AI Governance keeps Evolution as the global priority governor, gives the
first leader-eligible AI entry Leader orchestration status, stores agent hub
entries and leader leases with heartbeat and call tracking, can sync and
distribute the active Evolution temporary queue across worker AIs, advances
queue slices through a durable lifecycle, and records semantic merge bundles
with semantic surface plans so several AI tools can work from the same repo
without trampling one another. The Leader does not execute by default;
execution requires explicit Owner delegation for a scoped slice. Worker-only
tools such as Gemini may still join the hub, but they remain non-leader
participants unless leadership is explicitly allowed. If the Leader disappears
or stops answering calls, the hub promotes the next active leader-eligible
agent after the lease rules are exceeded.

`kvdf multi-ai agent next --ai <agent-id> --count <n>` lets a worker claim the
next available Evolution priorities in order, so AI tools can pull from the
live priority list instead of waiting for a manual task handoff.

The conversation relay layer is separate from leader calls. Use it for durable
agent-to-agent messages, inboxes, replies, and thread closure when two tools
need to coordinate without depending on the human chat transcript.

## Prompt packs

```bash
kvdf prompt-pack list
kvdf prompt-pack show <name>
kvdf prompt-pack common
kvdf prompt-pack export <name> --output <folder>
kvdf prompt-pack use <name>
kvdf prompt-pack compose <name> --task <task-id>
kvdf prompt-pack compose <name> --task <task-id> --context <context-pack-id> --output <file>
kvdf prompt-pack scale --profile enterprise --goal "Build a hospital ERP"
kvdf prompt-pack compositions
kvdf prompt-pack composition-show <composition-id>
kvdf prompt-pack validate <name>
```

Examples:

```bash
kvdf prompt-pack show laravel
kvdf prompt-pack show nextjs
kvdf prompt-pack show fastapi
kvdf prompt-pack show react-native-expo
kvdf prompt-pack export react --output my-project/07_AI_CODE_PROMPTS/react
kvdf prompt-pack export react-native-expo --output my-project/07_AI_CODE_PROMPTS/react-native-expo
kvdf prompt-pack use react --output my-project/07_AI_CODE_PROMPTS/react
kvdf prompt-pack compose react --task task-001 --context ctx-001
kvdf prompt-pack compose react-native-expo --task task-mobile-001
kvdf prompt-pack scale --profile enterprise --goal "Build a hospital ERP"
```

`prompt-pack use` is a convenience install command. Without `--output`, it writes to `07_AI_CODE_PROMPTS/<name>`.

`prompt-pack compose` applies `prompt_packs/common/` before the selected
stack-specific prompt. It creates a reviewable composed prompt under
`.kabeeri/prompt_layer/` by default and records metadata in
`.kabeeri/prompt_layer/compositions.json`.
The common layer also adds shared policy-gate and traceability metadata so a
composed prompt reminds the AI about scope, security, migration, handoff,
release, GitHub writes, AI-run history, ADR links, post-work capture, and task
evidence.

`prompt-pack scale` recommends large-system prompt bundles for enterprise,
regulated, and high-risk projects. It writes
`.kabeeri/reports/scale_specific_packs_report.json` and can be used before
`project profile report` or `prompt-pack compose` when a simple stack pack is
not enough for the requested system.

React Native Expo is available as a mobile pack for Expo apps. Use it when the
same Kabeeri product includes an iOS/Android app connected to the product API
or backend. It includes Expo-specific scope rules for public config, native
permissions, device checks, local/offline storage, and EAS release handoff.
The pack also includes backend API contract and mobile accessibility/performance
prompts. `prompt-pack compose` can use the pack manifest keyword map to select
more specific Expo prompts for tasks such as `api contract`, `deep link`,
`large text`, `push notification`, `offline cache`, and `EAS release`.

## WordPress Development And Adoption

```bash
kvdf wordpress analyze --path . --staging --backup
kvdf wordpress analyze --path existing-wordpress --json
kvdf wordpress plan "Build a WordPress company website" --type corporate --mode new
kvdf wordpress plan "Build a WordPress blog with SEO newsletter and authors" --type blog --mode new
kvdf wordpress plan "Improve existing WooCommerce checkout and product pages" --type woocommerce --mode existing
kvdf wordpress tasks
kvdf wordpress tasks --plan wordpress-plan-001 --json
kvdf wordpress plugin plan "Build a clinic booking plugin" --name "Clinic Booking" --type booking
kvdf wordpress plugin plan "Create a WooCommerce checkout add-on" --name "Checkout Addon" --type woocommerce
kvdf wordpress plugin tasks
kvdf wordpress plugin tasks --plan wordpress-plugin-plan-001 --json
kvdf wordpress plugin scaffold --name "Clinic Booking"
kvdf wordpress plugin checklist
kvdf wordpress scaffold plugin --name "Business Features"
kvdf wordpress scaffold theme --name "Company Theme"
kvdf wordpress scaffold child-theme --name "Company Child" --parent twentytwentyfour
kvdf wordpress checklist woocommerce
kvdf prompt-pack compose wordpress --task task-001
```

WordPress support is a governed capability for three scenarios:

- **New WordPress site**: Kabeeri helps classify the site type, choose the matching product blueprint, plan pages/content/CPTs/taxonomies/admin settings, scaffold a safe extension layer, create tasks, and compose the WordPress prompt pack.
- **Existing WordPress site**: Kabeeri analyzes `wp-content`, plugins, themes, WooCommerce signals, staging/backup risk, forbidden paths, and adoption next steps before any code change.
- **WordPress plugin development**: Kabeeri creates a plugin-specific plan, architecture map, security checklist, scoped tasks, and a production-safe scaffold under `wp-content/plugins/<plugin-slug>/`.

The runtime state is stored in `.kabeeri/wordpress.json` and validated by
`schemas/runtime/wordpress-state.schema.json`.

Command dispatch now uses `src/cli/services/wordpress.js` for state
persistence and `src/cli/services/wordpress_plans.js` for planning and
checklist generation.

Safety rules:

- Never edit `wp-admin/` or `wp-includes/`.
- Never expose `wp-config.php` secrets to prompts or commits.
- Use a custom plugin, custom theme, or child theme as the safe change layer.
- Existing sites should confirm staging and backup before changes.
- WooCommerce checkout, orders, payments, stock, tax, refunds, and emails require explicit tasks and review evidence.

WordPress plugin tasks always scope writes to the plugin folder and forbid
`wp-admin/`, `wp-includes/`, `wp-config.php`, and uploads. Plugin plans cover
admin settings, public shortcodes/blocks, REST permission callbacks, custom post
types, WooCommerce hooks, activation/deactivation, uninstall policy, nonces,
capabilities, sanitization, escaping, and handoff notes.

## Tasks

```bash
kvdf sprint create --id sprint-001 --name "Sprint 1" --start 2026-05-01 --end 2026-05-14
kvdf sprint list
kvdf sprint summary sprint-001
kvdf task create
kvdf task create --title "Add API" --sprint sprint-001
kvdf task create --title "Integration task" --type integration --workstreams backend,public_frontend
kvdf task list
kvdf task status
kvdf task assessment
kvdf task coverage
kvdf task lifecycle
kvdf trace report
kvdf task memory
kvdf task approve
kvdf task assign
kvdf task start
kvdf task review
kvdf task verify
kvdf task complete
kvdf task trash list
kvdf task trash show
kvdf task trash restore
kvdf task trash purge
kvdf task reject
kvdf task reopen
```

Examples:

```bash
kvdf task create --title "Add task tracking format" --type task-tracking --issue 6
kvdf task status --id T006
kvdf task assessment task-001
kvdf task coverage task-001
kvdf task lifecycle task-001
kvdf trace status
kvdf task memory task-001
kvdf task assign task-001 --assignee agent-001
kvdf task start task-001 --actor agent-001
kvdf task review task-001 --actor reviewer-001
kvdf task verify task-001 --owner owner-001
kvdf task complete task-001 --owner owner-001
kvdf task trash list
kvdf task trash show task-001
kvdf task trash restore task-001
```

When an Owner identity or Owner auth is configured, mutating commands enforce role permissions. Use `--actor <id>` for non-Owner actions, or an active Owner session for Owner/Maintainer-level actions.

`kvdf task assessment` generates a structured assessment before large work starts so scope, blockers, dependencies, and readiness gates are visible. `kvdf task coverage` writes a full-task-coverage report that shows the planned execution slices, the materialized temporary queue, and whether any remainder is still open. `kvdf task lifecycle` renders the visible lifecycle board from intake to ready, execution, validation, closure, and archived states. `kvdf task status` shows a single task with its lifecycle stage and next action, and reads from trash when a task is no longer active. `kvdf task complete`, `close`, `finish`, and `archive` move an owner-verified task into `.kabeeri/task_trash.json` and remove it from `.kabeeri/tasks.json`. The trash retains the full task payload plus the trashed timestamp, expiry timestamp, reason, actor, original position, and retention metadata. `kvdf task trash restore <task-id>` returns the task to the active list, and `kvdf task trash purge` / `kvdf task trash sweep` remove expired trash records.

`kvdf trace report` builds the end-to-end traceability report. It links tasks, task assessments, ADRs, AI runs, docs source-of-truth checks, and verification commands so change evidence is visible from one command. `kvdf trace status` prints the same report in summary form, and `kvdf trace show` / `kvdf trace list` are aliases for the report view.

`kvdf change report` builds the change-control report. It consolidates structured change requests, evolution changes, and risk register entries so high-risk work can be reviewed before release or handoff. `kvdf risk report` is an alias for the same report.

`kvdf docs coverage` builds the docs site deep publishing coverage report. It groups the generated docs site pages into major framework families so orientation, governance, project intake, platform operations, examples, and support coverage stay visible from one command.

`kvdf docs build`, `kvdf docs preview`, and `kvdf docs sync` are CLI-first aliases for the docs publishing lifecycle. `build` regenerates the site, `preview` opens the site for local review, and `sync` regenerates, validates, and writes a docs site sync report so docs, CLI help, and runtime behavior stay aligned.

Any task created through `kvdf task create` inherits a default `do_not_change` rule that protects the `KVDF_New_Features_Docs/` intake folder. Folder-structure tasks may analyze that folder, but they must not move, rename, delete, or recreate it.

Task assignment also checks workstream ownership. If an assignee has `workstreams` configured, they can only receive tasks in those workstreams. Tasks that span multiple workstreams must be created with `--type integration`.

Tasks can also be scoped to registered apps with `--app` or `--apps`. A task that touches multiple apps must use `--type integration`.

## Vibe-first Commands

```bash
kvdf vibe "Add admin dashboard settings page for owner"
kvdf vibe suggest "Add checkout API for the storefront"
kvdf ask "Improve the dashboard"
kvdf vibe list
kvdf vibe show suggestion-001
kvdf vibe approve suggestion-001 --actor owner-001
kvdf vibe convert suggestion-001
kvdf vibe reject suggestion-001 --reason "Too broad"
kvdf vibe plan "Build an ecommerce store with catalog cart checkout and admin"
kvdf vibe session start --title "Ecommerce planning"
kvdf vibe brief
kvdf vibe next
kvdf capture --summary "Updated dashboard filters" --files src/cli/index.js --checks "npm test"
kvdf capture scan --summary "Finished a small cleanup" --files src/cli/index.js
kvdf capture list
kvdf capture show capture-001
kvdf capture evidence capture-001 --checks "npm test" --evidence "manual review"
kvdf capture link capture-001 --task task-001
kvdf capture convert capture-001 --task task-002
kvdf capture reject capture-001 --reason "Exploration will not continue"
kvdf capture resolve capture-001 --reason "Evidence reviewed"
kvdf validate capture
```

Vibe-first commands are optional. They classify natural-language intent, create reviewable suggested task cards, split larger product requests into safer cards, approve/reject suggestions before execution, convert approved suggestions into governed tasks, capture post-work notes, preview captures with `capture scan`, add missing evidence with `capture evidence`, link or convert captured work into governed tasks, reject captures that should not continue, generate compact briefs for the next session, and then hand off to normal governed tasks. They store interaction records under `.kabeeri/interactions/`; the regular CLI remains fully usable without them. See `vibe_ux/VIBE_FIRST_RUNTIME.md`.

## Delivery Mode Advisor

```bash
kvdf delivery recommend "Build hospital management system with billing compliance roles and audit"
kvdf delivery recommend "Build startup MVP prototype with fast user feedback" --json
kvdf delivery choose structured --reason "Known compliant scope"
kvdf delivery choose agile --recommendation delivery-recommendation-123 --reason "MVP discovery"
kvdf delivery history
```

Delivery advisor compares Agile and Structured signals from the application description. It returns scores, confidence, rationale, and next actions. The recommendation is advisory; the developer/Owner chooses the final mode. Recommendations and decisions are stored in `.kabeeri/delivery_decisions.json`, and `delivery choose` updates `.kabeeri/project.json`.

## Product Blueprints

```bash
kvdf blueprint list
kvdf blueprint show ecommerce
kvdf blueprint recommend "Build ecommerce store with catalog cart checkout payments shipping and customer mobile app"
kvdf blueprint recommend "Build news website with breaking news ads paywall and mobile app" --json
kvdf blueprint select ecommerce --delivery structured --reason "Large catalog with payments and shipping"
kvdf blueprint context ecommerce --json
kvdf blueprint history
```

Product blueprints map real market systems to compact AI-ready structure:
channels, backend modules, frontend pages/screens, database entities,
workstreams, risk flags, and governance links. They are stored in
`standard_systems/PRODUCT_BLUEPRINT_CATALOG.json`; selections and
recommendations are stored in `.kabeeri/product_blueprints.json`.

Use this before creating tasks or composing prompts. It helps Codex or another
AI assistant understand whether the product is eCommerce, POS, ERP, CRM, news,
booking, delivery/logistics, mobile app, or a hybrid platform without spending
tokens rediscovering the same structure each session.

## Data Design

```bash
kvdf data-design principles
kvdf data-design principle workflow_first
kvdf data-design modules
kvdf data-design module commerce
kvdf data-design context ecommerce --json
kvdf data-design recommend "Build ecommerce store with payments inventory mobile app" --json
kvdf data-design checklist
kvdf data-design review "orders table with price float and items json"
kvdf data-design history
```

Data Design maps a selected Product Blueprint to database modules, entities,
constraints, index hints, integrity rules, risk flags, and an approval checklist.
It helps AI tools design from business workflows rather than screens, and it
stores generated context in `.kabeeri/data_design.json`.

## UI/UX Advisor

```bash
kvdf design recommend ecommerce --json
kvdf design recommend news_website --json
kvdf design recommend erp --json
kvdf design ui-checklist
kvdf design ui-review "news article page with semantic HTML structured data responsive accessibility loading empty error"
kvdf design ui-history
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
kvdf validate ui-design
```

The UI/UX Advisor extends Design Governance. It maps a Product Blueprint to an
experience pattern, stack suggestions, component groups, page templates,
SEO/GEO rules, dashboard/mobile rules, and an approval checklist. Its runtime
state lives in `.kabeeri/design_sources/ui_advisor.json`.

The modern UI design runtime is split into compact catalogs that keep prompts
short and make frontend work repeatable without making every product look the
same:

- `theme-*` chooses product-aware palette/token presets.
- `composition-*` chooses a screen composition such as dashboard, CRUD table,
  checkout, content detail, settings, or AI prompt workspace.
- `framework-*` translates tokens and compositions into Bootstrap, Tailwind,
  Bulma, Foundation, MUI, Ant Design, daisyUI, or shadcn/ui implementation
  guidance.
- `ui-questions` and `ui-decisions` turn developer/client answers into density,
  navigation, surface style, tone, variant, adapter, and composition decisions.
- `playbook*` selects the default UI direction for a Kabeeri product blueprint.
- `variant*` generates bounded creative directions so similar products can vary
  while preserving accessibility, performance, RTL, motion, content, and design
  governance rules.

The UI/UX Reference Library adds reusable, approved UI patterns under
`knowledge/design_system/ui_ux_reference/`. `reference-recommend` selects a
pattern from a short brief, `reference-questions` turns that pattern into
developer/client discovery questions, and `reference-tasks` creates governed
design-system, page-spec, component-contract, and QA tasks before code starts.

## Agile Templates

```bash
kvdf agile summary
kvdf agile backlog add --id BL-001 --title "Checkout MVP" --type epic --priority high --source "vision"
kvdf agile epic create --id epic-checkout --title "Checkout" --goal "Customers can place orders" --users customer --source "vision"
kvdf agile story create --id story-checkout-001 --epic epic-checkout --title "Cart checkout" --role customer --want "pay for cart items" --value "complete an order" --points 5 --workstream backend --acceptance "Order is created,Payment result is stored" --reviewer owner-001
kvdf agile story ready story-checkout-001
kvdf agile story task story-checkout-001 --task task-001
kvdf agile sprint plan sprint-001 --stories story-checkout-001 --capacity-points 10 --goal "Checkout foundation"
kvdf agile sprint review sprint-001 --accepted story-checkout-001 --goal-met yes --decision accepted
kvdf agile impediment add --id imp-001 --story story-checkout-001 --severity high --title "Payment credentials missing"
kvdf agile retrospective add sprint-001 --good "Goal was clear" --improve "Slice stories smaller" --actions "Add QA earlier"
kvdf agile release plan release-001 --title "Checkout demo" --stories story-checkout-001 --criteria "Checkout accepted" --checks "Policy gates reviewed"
kvdf agile release readiness release-001
kvdf agile health
kvdf agile forecast
kvdf validate agile
```

Agile template commands turn backlog, epic, user story, sprint planning, sprint review, impediment, retrospective, and release-plan templates into runtime records under `.kabeeri/agile.json`. A ready story can be converted into a normal governed task, keeping source provenance as `story:<story_id>`. See `agile_delivery/AGILE_RUNTIME.md`.

## Structured Delivery

```bash
kvdf structured health
kvdf structured requirement add --id REQ-001 --title "Email login" --source questionnaire --acceptance "User can login,Invalid password is rejected"
kvdf structured requirement approve REQ-001 --reason "Owner reviewed"
kvdf structured phase plan phase-001 --requirements REQ-001 --goal "Authentication foundation"
kvdf structured task REQ-001 --task task-001
kvdf structured deliverable add --id deliv-001 --phase phase-001 --title "Authentication specification" --acceptance "Owner approved"
kvdf structured deliverable approve deliv-001
kvdf structured risk add --id risk-001 --phase phase-001 --severity high --title "OAuth provider limit"
kvdf structured risk mitigate risk-001 --mitigation "Fallback documented"
kvdf structured gate check phase-001
kvdf structured phase complete phase-001
kvdf validate structured
```

Structured commands turn Waterfall-style planning into runtime records under `.kabeeri/structured.json`. They manage approved requirements, phases, deliverables, risks, change requests, phase gates, and requirement-to-task traceability. Live state is written to `.kabeeri/dashboard/structured_state.json` and served at `/__kvdf/api/structured`. See `delivery_modes/STRUCTURED_RUNTIME.md`.

## Workstreams

```bash
kvdf workstream list
kvdf workstream show backend
kvdf workstream add --id payments --name "Payments" --paths src/payments,app/Payments --review security,contract_safety
kvdf workstream update backend --paths src/api,app/Http,routes/api.php
kvdf workstream validate
kvdf validate workstream
```

Workstreams are runtime boundaries stored in `.kabeeri/workstreams.json`. Task creation rejects unknown workstreams, assignment checks developer capability, and AI session completion checks touched files against the task workstream path rules. See `governance/WORKSTREAM_GOVERNANCE.md`.

## Business Features and Journeys

```bash
kvdf feature create --title "Public signup" --readiness needs_review --tasks task-001
kvdf feature status feature-001 --readiness ready_to_demo
kvdf feature list
kvdf feature show feature-001
kvdf journey create --name "Signup journey" --audience Visitors --steps Landing,Signup,Welcome
kvdf journey status journey-001 --status ready_to_show --ready-to-show
kvdf journey list
kvdf journey show journey-001
kvdf validate business
```

Feature readiness supports `ready_to_demo`, `ready_to_publish`, `needs_review`, and `future`. Journey status supports `draft`, `needs_review`, `ready_to_show`, and `future`.

## Acceptance

```bash
kvdf acceptance create
kvdf acceptance review <acceptance-id>
kvdf acceptance list
```

Examples:

```bash
kvdf acceptance create --type task-completion --issue 7
kvdf acceptance create --type release --version v0.1.1
kvdf acceptance review acceptance-001 --reviewer reviewer-001 --result pass --notes "Ready"
```

## Audit

```bash
kvdf audit list
kvdf audit list --limit 50
kvdf audit report
kvdf audit report --task task-001 --output audit.md
```

## Developers and AI Agents

```bash
kvdf owner init --id owner-001 --name "Project Owner"
kvdf owner login --id owner-001
kvdf owner status
kvdf owner logout
kvdf owner session status
kvdf owner session close
kvdf owner docs open
kvdf owner docs status
kvdf owner docs close
kvdf owner transfer issue --to owner-002 --name "New Owner"
kvdf owner transfer accept --id owner-transfer-001 --token TRANSFER-SECRET
kvdf owner transfer list
kvdf owner transfer revoke --id owner-transfer-001
kvdf developer list
kvdf developer add --id owner-001 --name "Project Owner" --role Owner
kvdf developer solo --id dev-main --name "Main Developer"
kvdf developer owner-developer --id owner-001 --name "Project Owner"
kvdf agent list
kvdf agent add --id agent-001 --name "AI Backend Agent" --role "AI Developer" --workstreams backend
```

`owner init` and `owner login` read the passphrase from `--passphrase` or `KVDF_OWNER_PASSPHRASE`. When Owner auth is configured, `task verify` requires an active Owner session.

`owner docs open` issues a fresh 50-character mixed owner-docs token, stores it as a one-minute gate, and revokes any previous active owner-docs token for the current session. `owner docs status` lists the current gate state. `owner docs close` revokes the active gate without ending the Owner session.

`owner session close` ends the Owner session explicitly and also revokes any active owner-docs token. `owner logout` is an alias for ending the active Owner session.

`developer solo` configures one `Full-stack Developer` across the standard backend, frontend, admin, database, DevOps, QA, docs, integration, and security workstreams. It keeps app boundaries, locks, tokens, usage tracking, and policy gates active. See `governance/SOLO_DEVELOPER_MODE.md`.

`owner transfer issue` requires the active Owner session and creates a one-use transfer token. `owner transfer accept` moves the `Owner` role to the new owner, downgrades the previous owner to `Maintainer`, rewrites Owner auth for the new owner, starts a new Owner session, and marks the transfer token as used.

## Tokens and Locks

```bash
kvdf token list
kvdf token issue --task task-001 --assignee agent-001
kvdf token show task-token-001
kvdf token issue --task task-001 --assignee agent-001 --max-usage-tokens 50000 --max-cost 10
kvdf token issue --task task-001 --assignee agent-001 --max-cost 10 --budget-approval-required
kvdf token issue --task task-001 --assignee agent-001 --allowed-files src/api/ --forbidden-files .env,secrets/
kvdf token issue --task task-001 --assignee agent-001 --allowed-files src/ --allow-broad-scope
kvdf token revoke task-token-001
kvdf token reissue task-token-001 --max-usage-tokens 200 --reason "Rework only"
kvdf lock list
kvdf lock create --type file --scope src/api/users.ts --task task-001 --owner agent-001
kvdf lock create --type folder --scope src/api --task task-001 --owner agent-001
kvdf lock create --type workstream --scope backend --task task-001 --owner agent-001
kvdf lock release lock-001
```

Active locks prevent exact scope conflicts and file/folder overlap. For example, a folder lock on `src/api` blocks a file lock on `src/api/users.ts` until the folder lock is released.

## Budget Approvals

```bash
kvdf budget approve --task task-001 --tokens 5000 --reason "Owner approved extra work"
kvdf budget approve --task task-001 --cost 5
kvdf budget list
kvdf budget revoke budget-approval-001
```

When a task access token is issued with `--budget-approval-required`, `usage record` refuses over-budget token or cost usage until an active approval covers the overrun.

Task access tokens require a real local task. In governed workspaces, the token assignee must match the task assignee, and AI sessions cannot start for unassigned tasks.

By default, `token issue` derives `allowed_files`, `workstreams`, and `app_usernames` from the task's app boundary and workstream boundary. Manual `--allowed-files` cannot be broader than those boundaries unless `--allow-broad-scope` is used for an audited override. See `governance/EXECUTION_SCOPE_GOVERNANCE.md`.

Owner rejection revokes active task tokens. Use `token reissue` to create a limited rework token from a revoked token.

## AI Usage

```bash
kvdf session start --task task-001 --developer agent-001 --provider openai --model gpt
kvdf session end session-001 --input-tokens 1000 --output-tokens 500 --files src/api/users.ts --summary "Implemented endpoint" --checks "npm test" --risks "Needs API review"
kvdf session list
kvdf session show session-001
kvdf pricing set --provider openai --model gpt --unit 1M --input 5 --output 15 --cached 1 --currency USD
kvdf pricing list
kvdf pricing show
kvdf usage record --task task-001 --developer agent-001 --provider openai --model gpt --input-tokens 1000 --output-tokens 500 --cached-tokens 0 --cost 0.25 --workstream backend
kvdf usage record --task task-001 --developer agent-001 --provider openai --model gpt --input-tokens 1000 --output-tokens 500 --cached-tokens 0 --workstream backend
kvdf usage record --untracked --input-tokens 1000 --output-tokens 500 --cost 0.25 --source ad-hoc-prompt
kvdf usage inquiry --input-tokens 300 --output-tokens 120 --cost 0.04 --operation owner-question
kvdf usage admin --input-tokens 500 --output-tokens 200 --operation dashboard-review
kvdf usage list
kvdf usage summary
kvdf usage efficiency
kvdf usage report --output usage-report.md
```

Usage records are stored in `.kabeeri/ai_usage/usage_events.jsonl` and rolled up into `.kabeeri/ai_usage/usage_summary.json`. If `--cost` is omitted, Kabeeri calculates cost from `.kabeeri/ai_usage/pricing_rules.json` when a matching provider/model rule exists. `usage inquiry`, `usage admin`, `usage question`, `usage planning`, and `usage docs` record non-task AI operations under `admin:<operation>` buckets so owner questions, dashboard reviews, planning, and documentation conversations are visible beside task cost.

Completed AI sessions generate `.kabeeri/reports/<session-id>.handoff.md`.

## Design Source Governance

```bash
kvdf design list
kvdf design add --id design-source-001 --type figma --location "https://figma.com/file/..." --owner "Client" --use "Checkout page" --mode manual
kvdf design show design-source-001
kvdf design snapshot design-source-001 --reference "figma-export-v1" --captured-by designer-001 --checksum abc123
kvdf design spec-create --source design-source-001 --title "Checkout page" --output frontend_specs/checkout.page.md
kvdf design spec-list
kvdf design spec-approve text-spec-001 --tokens design_system/tokens.json --actor owner-001
kvdf design theme-recommend ecommerce --output knowledge/frontend_specs/tokens.json
kvdf design composition-recommend ecommerce --page checkout --json
kvdf design framework-plan shadcn-ui --blueprint ecommerce --page checkout --json
kvdf design ui-decisions ecommerce --page checkout --json
kvdf design playbook ecommerce --page checkout --json
kvdf design variants ecommerce --page checkout --count 3 --json
kvdf design reference-list
kvdf design reference-show ADMIT-ADB04
kvdf design reference-recommend "billing dashboard with invoices transactions and payment methods"
kvdf design reference-questions ADMIT-ADB04
kvdf design reference-tasks ADMIT-ADB04 --scope "billing page"
kvdf design page-create --spec text-spec-001 --name "Checkout page" --output frontend_specs/checkout.page.md
kvdf design page-list
kvdf design page-approve page-spec-001 --actor owner-001
kvdf design component-create --page page-spec-001 --name CheckoutSummary --variants default,compact
kvdf design component-list
kvdf design component-approve component-contract-001 --actor owner-001
kvdf design visual-review --page page-spec-001 --task task-001 --screenshots desktop.png,mobile.png --decision pass
kvdf design visual-review-list
kvdf design gate --task task-001 --page page-spec-001 --json
kvdf design governance
kvdf design governance --json
kvdf validate design
kvdf design missing-report --source design-source-001 --items responsive,empty-state --risk high
kvdf design approve design-source-001 --spec frontend_specs/checkout.page.md --tokens design_system/tokens.json --actor owner-001
kvdf design reject design-source-001 --reason "Source is outdated" --actor owner-001
kvdf design audit
kvdf design audit design-source-001
```

Design sources are inputs, not implementation specs. Raw links, images, PDFs, screenshots, Figma files, and reference websites must become approved text specs before frontend implementation begins. After frontend implementation, visual reviews record screenshot evidence and `design gate` checks whether a frontend task has approved page evidence and a passing visual review.

`design governance` writes a unified Design Governance report into `.kabeeri/design_sources/governance_reports.json` and `.kabeeri/reports/design_governance_report.md`. It checks source snapshots, approved text specs, design tokens, page specs, component contracts, visual review evidence, accessibility/contrast coverage, UI/UX Advisor context, missing design reports, and next actions.

## Customer Apps

```bash
kvdf app create --username backend-api --name "Laravel API" --type backend --path apps/api-laravel --product "Store"
kvdf app create --username storefront --name "React Storefront" --type frontend --path apps/storefront-react --product "Store"
kvdf app list
kvdf app show storefront
kvdf app status storefront --status ready_to_publish --workstreams public_frontend
kvdf task create --title "Build product API" --app backend-api --workstream backend
kvdf task create --title "Wire API to storefront" --type integration --apps backend-api,storefront --workstreams backend,public_frontend
kvdf validate routes
```

Developer app workspaces live under `workspaces/apps/<app-slug>/` and keep app-local `.kabeeri` state, tests, docs, and package metadata isolated from `kabeeri-core`:

```bash
kvdf app workspace create --slug storefront-web --name "Storefront Web" --type frontend
kvdf app workspace list
kvdf app workspace show storefront-web
```

Customer-facing app routes always use `username`, never numeric IDs:

```text
/customer/apps/acme
```

`kvdf app create --username 3` fails because public customer URLs must not expose numeric IDs such as `/customer/apps/3`.

App Boundary Governance allows Laravel backends, React/Vue/Angular storefronts, admin panels, mobile apps, and workers to live in one KVDF workspace when they belong to the same product. Unrelated products must use separate KVDF workspaces. App-scoped AI sessions cannot report changed files outside the registered app path.

See `governance/APP_BOUNDARY_GOVERNANCE.md`.

## v5 Adaptive Questionnaire and Capability Map

```bash
kvdf capability list
kvdf capability show payments_billing
kvdf capability map
kvdf capability registry
kvdf capability registry payments_billing
kvdf capability registry map
kvdf capability matrix
kvdf capability search
kvdf questionnaire flow
kvdf questionnaire answer entry.project_type --value saas
kvdf questionnaire answer entry.has_users --value yes
kvdf questionnaire answer entry.has_payments --value unknown
kvdf questionnaire coverage
kvdf questionnaire missing
kvdf questionnaire generate-tasks
kvdf validate questionnaire
```

`questionnaire coverage` generates `.kabeeri/questionnaires/coverage_matrix.json` for the 53 standard system areas. `questionnaire missing` writes `.kabeeri/questionnaires/missing_answers_report.json`. `questionnaire generate-tasks` creates proposed tasks with provenance fields for `system_area_key`, `question_ids`, `answer_ids`, and `source_mode`.
`kvdf capability registry` exposes the same 53 areas as named, traceable units with owner/workstream and source mapping so the imported capability catalog stays machine-readable. `kvdf capability registry payments_billing` shows one registry entry directly; `kvdf capability registry map` returns the grouped registry map as JSON.

`kvdf capability surface` builds a CLI capability surface report that maps the same registry entries to discoverable command families and docs references so new capabilities always have an obvious operational entry point.

`kvdf capability matrix` builds the capability-to-documentation matrix so every imported capability has traceable docs, CLI, runtime, test, and report links in one place.

`kvdf capability search` builds a searchable reference index over the registry, surface, matrix, and roadmap views, then filters that index by track, capability, command, phase, and report type. It writes `docs/reports/KVDF_CAPABILITY_SEARCH_INDEX.json` so the same facets are available to later sessions.

## Project Memory

```bash
kvdf memory add --type decision --text "Use PostgreSQL"
kvdf memory add --type risk --text "Payment provider not confirmed"
kvdf memory list --type risk
kvdf memory summary
```

Project memory writes append-only JSONL files under `.kabeeri/memory/` and keeps `.kabeeri/memory/memory_summary.json` updated.

## ADR And AI Run History

```bash
kvdf adr create --title "Use PostgreSQL" --context "Need relational consistency" --decision "Use PostgreSQL for v1"
kvdf adr create --title "Adopt queue workers" --context "Order emails are async" --decision "Use background jobs" --status approved
kvdf adr list
kvdf adr show adr-001
kvdf adr approve adr-001
kvdf adr reject adr-001 --reason "Not needed for MVP"
kvdf adr supersede adr-001 --by adr-002 --reason "Architecture changed"
kvdf adr report --output adr-report.md
kvdf adr trace --json
kvdf ai-run record --task task-001 --developer agent-001 --provider openai --model gpt-4 --input-tokens 1000 --output-tokens 500 --summary "Implemented endpoint"
kvdf ai-run list
kvdf ai-run show ai-run-001
kvdf ai-run accept ai-run-001 --reviewer reviewer-001 --evidence tests-pass
kvdf ai-run reject ai-run-001 --reason "Wrong scope"
kvdf ai-run link ai-run-001 --adr adr-001
kvdf ai-run report
kvdf ai-run report --json
kvdf validate adr
kvdf validate ai-run
```

ADRs are formal durable decisions. Use them for architecture, database,
security, integration, migration, release, or cross-workstream decisions. Use
`kvdf memory` for lightweight notes.

AI run history records prompt output quality and review decisions. `kvdf usage`
remains the cost ledger, while `kvdf ai-run` explains whether the output was
accepted, rejected, unreviewed, or wasteful. See
`project_intelligence/ADR_AI_RUN_HISTORY_RUNTIME.md`.

Use `kvdf ai-run link <run-id> --adr <adr-id>` when a prompt run shaped a durable architecture decision. Use `kvdf adr trace` to see decisions with linked AI runs, accepted/rejected counts, cost, tokens, unlinked runs, and high-impact decisions that still need approval.

## Policy Engine

```bash
kvdf policy list
kvdf policy show task_verification_policy
kvdf policy evaluate --task task-001
kvdf policy evaluate --scope release --version v4.0.0
kvdf policy gate --scope security
kvdf policy gate --scope migration --plan migration-plan-001
kvdf policy gate --task task-001 --stage verify --actor owner-001
kvdf policy gate --task task-001 --override true --reason "Owner accepted known risk" --owner owner-001
kvdf policy status
kvdf policy status --json
kvdf policy report --output .kabeeri/reports/policy_report.md
kvdf validate policy
```

`policy evaluate` checks a governed subject and stores the result in `.kabeeri/policies/policy_results.json`. `policy gate` is stricter: it exits with an error when required checks fail, unless an Owner records an audited override with `--override true --reason "..."`.

`policy status` shows the latest stored result for each policy and subject pair, which makes it the fastest command for resuming after an interrupted session. `validate policy` checks policy definition files and stored policy results for required fields, duplicate IDs, invalid severities, invalid statuses, and malformed timestamps.

Policy scopes now include:

- `task`: source provenance, acceptance evidence, Owner final verification, AI output contracts, token revocation after verification, and AI usage traceability.
- `release`: repository validation, latest security scan, migration safety state, and unresolved policy blockers before confirmed publish.
- `handoff`: latest security scan and unresolved blockers before client/Owner package generation.
- `security`: latest security scan existence and blocker status.
- `migration`: migration plan, rollback plan, backup reference, and latest migration safety check.
- `github_write`: explicit confirmation, repository validation, latest security scan, unresolved policy blockers, and Owner actor warning before confirmed GitHub writes.

## Cost-Aware AI Execution

```bash
kvdf context-pack create --task task-001 --allowed-files src/api/,tests/api/ --specs docs/spec.md
kvdf context-pack list
kvdf context-pack show ctx-001
kvdf preflight estimate --task task-001 --context ctx-001 --provider openai --model gpt-4
kvdf preflight list
kvdf preflight show preflight-001
kvdf model-route list
kvdf model-route recommend --kind implementation --risk medium
```

`context-pack create` turns a task into a compact, reviewable AI context bundle instead of sending broad repository context. It records allowed files, forbidden files, required specs, acceptance criteria, memory summary, open questions, and estimated tokens/cost under `.kabeeri/ai_usage/context_packs.json`.

`preflight estimate` estimates input/output/cached tokens, cost, risk, budget status, recommended path, recommended model class, split recommendation, and whether approval is required. `model-route recommend` returns the recommended class: `cheap`, `balanced`, `premium`, or `human_only`.

## Handoff Packages

```bash
kvdf handoff package --id handoff-001 --audience owner
kvdf handoff package --id client-mvp --audience client --output .kabeeri/handoff/client-mvp
kvdf handoff list
kvdf handoff show handoff-001
```

`handoff package` generates a professional report folder from local `.kabeeri` state. The package includes an index, business summary, technical summary, feature readiness report, production vs publish status, AI token cost summary, and next roadmap report. It is designed for client/Owner review and does not replace Owner approval for final delivery, release, or publish.

## Security / Secrets Governance

```bash
kvdf security scan
kvdf security scan --include app/,routes/,config/
kvdf security report
kvdf security report --id security-scan-001 --output .kabeeri/security/security.md
kvdf security gate
kvdf security list
kvdf security show security-scan-001
```

`security scan` performs a lightweight local pattern scan for common secrets such as private keys, API keys, Stripe secret keys, GitHub tokens, AWS access keys, `.env` files, and generic secret assignments. Results are stored in `.kabeeri/security/security_scans.json`; the latest scan is also written to `.kabeeri/security/latest_security_scan.json` and `.kabeeri/security/latest_security_report.md`.

`security gate` runs a scan and exits with an error if critical or high findings exist. It is intended as a pre-AI, pre-release, and pre-publish guard. It is not a replacement for a professional security scanner.

## Migration Safety

```bash
kvdf migration plan --id migration-001 --title "Upgrade schema" --from v1 --to v2 --scope database,migrations --backup backup-2026-05-08 --risk high
kvdf migration rollback-plan --plan migration-001 --backup backup-2026-05-08 --steps "restore backup,run rollback,verify app"
kvdf migration check migration-001 --owner-approved
kvdf migration report migration-001 --output .kabeeri/migrations/migration-001.report.md
kvdf migration list
kvdf migration show migration-001
kvdf migration audit
```

Migration commands are dry-run governance commands. They do not execute database or file migrations. `migration plan` records scope, version movement, risk, backup reference, and approval requirements. `migration rollback-plan` links rollback steps and verification checks. `migration check` blocks unsafe plans that lack backup, rollback, scope, or Owner approval for high-risk work. Reports are written as Markdown under `.kabeeri/migrations/`.

## Dashboard

```bash
kvdf dashboard generate
kvdf dashboard state
kvdf dashboard task-tracker
kvdf dashboard export
kvdf dashboard export --output .kabeeri/site/index.html --dashboard-output .kabeeri/site/__kvdf/dashboard/index.html
kvdf dashboard ux
kvdf dashboard ux --json
kvdf dashboard serve --port 4177
kvdf dashboard serve --port auto
kvdf dashboard serve --port 4177 --workspaces ../store-a,../store-b
kvdf dashboard workspace add --path ../store-a --name "Store A"
kvdf dashboard workspace list
kvdf dashboard workspace remove --path ../store-a
```

`dashboard export` writes the customer-facing first page to `.kabeeri/site/index.html`, writes the private technical dashboard to `.kabeeri/site/__kvdf/dashboard/index.html`, and exports per-app pages under `.kabeeri/site/customer/apps/<username>/index.html`.

`dashboard state` prints the same live JSON state used by the local dashboard API. `dashboard task-tracker` prints the focused task board JSON written to `.kabeeri/dashboard/task_tracker_state.json`. `dashboard serve` serves the customer page at `/`, app pages at `/customer/apps/<username>`, the private dashboard at `/__kvdf/dashboard`, full live JSON at `/__kvdf/api/state`, and task tracker JSON at `/__kvdf/api/tasks`.

`dashboard ux` writes a Dashboard UX Governance audit into `.kabeeri/dashboard/ux_audits.json` and a Markdown report under `.kabeeri/reports/dashboard_ux_report.md`. It checks the action center, source-of-truth notice, live state, role visibility, widget registry, app/workspace strategy, responsive tables, empty states, governance visibility, cost visibility, Vibe/Agile visibility, and common secret leakage.

When served locally, the private dashboard polls the live API every few seconds and reloads itself when project state changes, so new tasks, generated scaffold tasks, usage records, locks, delivery status, and governance updates appear without running `dashboard export` again. The dashboard summarizes multiple same-product apps inside the current `.kabeeri` workspace and can show separate KVDF folders as linked workspace summaries. Each dashboard section adds an inline explanation describing what the table means and why it exists.

Use `--workspaces`, `KVDF_WORKSPACES`, or `kvdf dashboard workspace add` to add summary rows for other KVDF folders that have their own `.kabeeri` state. Linked workspaces are summarized, not merged into the current workspace.

See `dashboard/LIVE_DASHBOARD_RUNTIME.md`.

## Documentation Site

```bash
kvdf docs open
kvdf docs serve --port 4188
kvdf docs serve --port auto --open
kvdf docs generate
kvdf docs workflow
kvdf docs manifest
kvdf docs contracts
kvdf docs validate
kvdf docs path
kvdf docs code
```

`docs open` regenerates the documentation site, starts a local docs server,
and opens the site in the default browser. This is the recommended reading
flow for developers.

`docs serve` runs the same local docs server without opening a browser unless
`--open` is provided. `docs generate` rebuilds `docs/site/pages/*` plus the
generated template catalog, site manifest, and page contracts from the site
source. `docs workflow` prints the resumable generation workflow report,
including the templates, manifest, contracts, validation steps, and coverage
report at `docs/reports/DOCS_SITE_GENERATION_WORKFLOW.json`. `docs manifest`
prints the manifest, `docs contracts` prints the page contract set, and
`docs validate` checks that all generated artifacts stay in sync. `docs path`
prints the generated docs home file. `docs code` opens `docs/site` in VS Code
for editing.

## Independent Readiness And Governance Reports

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
kvdf reports live
kvdf reports live --json
kvdf reports blocked
kvdf reports blocked --json
kvdf reports show readiness
```

`readiness report` summarizes whether the workspace is ready for demo, handoff,
release review, or publish review. It combines validation, task status, feature
readiness, journey readiness, policy blockers, latest security scan, migration
checks, handoff packages, AI run review state, and unresolved post-work captures.

`governance report` summarizes whether the workspace governance model is healthy.
It checks Owner identity, developer and agent counts, workstreams, active locks,
lock conflicts, active/expired task tokens, missing assignees, unknown
workstreams, policy blockers, workspace governance validation, and a governance
coverage view for trust, safety, privacy, compliance, and extensibility.

`reports live` writes `.kabeeri/reports/live_reports_state.json`, a compact
derived JSON state for Codex, dashboard widgets, VS Code views, and automation.
Markdown reports remain human-readable snapshots; live JSON is the fast-changing
operational surface.

`reports blocked` writes `.kabeeri/reports/blocked_scenarios_report.json`, a
derived blocker summary that explains what cannot proceed yet, why it is blocked
or warning-level, and what the next governed action should be. Use it when you
want a single concise report for blocked or invalid scenarios instead of
reading multiple live reports.

Supported report targets are `workspace`, `demo`, `handoff`, `release`, and
`publish`. Use `--strict` when warnings should block release, publish, or final
handoff review.

## Product Packaging And Upgrade

```bash
kvdf package check
kvdf package check --json
kvdf package guide
kvdf upgrade guide
kvdf upgrade check
kvdf upgrade check --json
```

`package check` validates the local npm package contract: required package
fields, `bin.kvdf`, Node engine metadata, package file coverage, and required
runtime/docs files. `upgrade check` compares the current CLI version with
`.kabeeri/version_compatibility.json` and `.kabeeri/migration_state.json`.

Both checks now return standalone report metadata, status, blockers, warnings,
and next actions. `package guide` explains the distribution contract and manual
`npm pack --dry-run` review. `upgrade guide` explains the safe upgrade sequence,
compatibility state, migration blockers, and when upgrade decisions need ADR or
project memory.

Main references:

- `docs/production/PACKAGING_GUIDE.md`
- `docs/production/UPGRADE_GUIDE.md`

## VS Code

```bash
kvdf vscode scaffold
kvdf vscode status
kvdf vscode report
```

`vscode scaffold` writes `.vscode/tasks.json`, `.vscode/extensions.json`, and `.vscode/kvdf.commands.json` so common Kabeeri CLI actions can be run from VS Code tasks. `vscode report` summarizes the generated editor bridge, the command palette contract, and the file-state trace that keeps the extension read-only.

## Plans

```bash
kvdf plan list
kvdf plan show v3.0.0
kvdf plan show v4.0.0
```

## Existing Project Adoption

```bash
kvdf project analyze --path .
kvdf project analyze --path existing-app --json
kvdf project route --goal "Build a SaaS product"
kvdf project profile route --goal "Build a SaaS product"
kvdf project profile route --profile enterprise --goal "Build a hospital ERP"
kvdf project profile status
kvdf project profile report
kvdf adopt analyze --path existing-app
```

`project analyze` inspects an existing application folder before Kabeeri starts
governing it. It records detected stacks, likely app boundaries, suggested
workstreams, risk signals, and next adoption actions in
`.kabeeri/project_analysis.json`.

`project profile route` inspects the current codebase or the supplied project
goal and writes `.kabeeri/project_profile.json`. It selects Lite, Standard, or
Enterprise, recommends a delivery mode, and suggests prompt packs and intake
groups before the workspace is created. `project profile report` writes
`.kabeeri/reports/project_profile_report.json` so the current routing decision
can be resumed without re-reading the full state file. The report also records
the current scale pack bundle selection for large systems.

## GitHub Dry Run

```bash
kvdf github status
kvdf github report
kvdf github feedback list
kvdf github feedback record --type status --subject task-001 --message "Ready for review"
kvdf github plan --version v4.0.0 --dry-run
kvdf github label sync --version v4.0.0 --dry-run
kvdf github milestone sync --version v4.0.0 --dry-run
kvdf github issue sync --version v4.0.0 --dry-run
kvdf github issue sync --version v4.0.0 --dry-run --output github-issues.dry-run.txt
kvdf github config set --repo owner/repo --branch main --default-version v4.0.0
kvdf github config show
```

These commands do not write to GitHub. `github report` is the trace surface for the local sync adapter and reads the same `.kabeeri` state that powers the dry-run and confirmed write flows.

## GitHub Confirmed Sync

```bash
kvdf github label sync --version v4.0.0 --confirm
kvdf github milestone sync --version v4.0.0 --confirm
kvdf github issue sync --version v4.0.0 --confirm
kvdf github release publish --version v4.0.0 --confirm
```

Confirmed commands use the installed GitHub CLI (`gh`) and write to the current GitHub repository. Issue creation is recorded in `.kabeeri/github/issue_map.json` when a workspace exists.
`kvdf github status` and `kvdf github feedback` stay local but summarize issue/PR/status/comment feedback records when the workspace is in team mode.
Confirmed GitHub writes are protected by `github_write_policy` before the CLI calls `gh`. Dry-runs do not require this gate. Use `kvdf policy status` and `kvdf validate policy` to inspect the latest write-gate result before retrying a blocked operation.

## Examples

```bash
kvdf example list
kvdf example show lite
kvdf example show standard
kvdf example show enterprise
```

## Validation

```bash
kvdf validate
kvdf validate task
kvdf validate acceptance
kvdf validate prompt-packs
kvdf validate generators
kvdf validate runtime-schemas
kvdf validate historical-source-clarity
kvdf validate blocked-scenarios
```

## Release

```bash
kvdf release check
kvdf release check --version v4.0.0 --strict
kvdf release gate --version v4.0.0
kvdf release publish-gate --version v4.0.0
kvdf release scenario --version v4.0.0
kvdf release notes --version v0.1.1
kvdf release checklist --version v0.1.1
kvdf release notes --version v4.0.0 --output RELEASE_NOTES.md
kvdf release checklist --version v4.0.0 --output RELEASE_CHECKLIST.md
kvdf release publish --version v4.0.0
kvdf release publish --version v4.0.0 --confirm
```

`release gate` evaluates `release_policy` only. `release publish-gate` evaluates
both `release_policy` and `github_write_policy` without calling `gh`. Confirmed
release publishing through either `kvdf release publish --confirm` or
`kvdf github release publish --confirm` must pass both gates before any GitHub
release command runs.

## Doctor

```bash
kvdf doctor
```

