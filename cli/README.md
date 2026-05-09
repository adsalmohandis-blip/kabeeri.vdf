# KVDF CLI Design

This directory defines and documents the current **Kabeeri Vibe Developer Framework CLI**.

## Current implementation status

The repository now includes a working `kvdf` CLI implementation.

It is still an early MVP, but it can already:

```text
- initialize local .kabeeri workspace state
- validate repository JSON, prompt pack manifests, generator files, and planning files
- list/show generator profiles
- generate local project skeleton folders from generator profiles
- run `kvdf create --profile <name>` as a shortcut
- list/show prompt packs
- export prompt packs into a project folder
- install a prompt pack into a standard project prompt folder with `prompt-pack use`
- list/show example profiles
- list questionnaire files
- export questionnaire `.docx` files by profile or group
- list/show v3/v4 planning milestones
- create/list/status local tasks
- create/list/status customer apps with public `username` routes
- enforce App Boundary Governance for same-product multi-app workspaces
- run v5 adaptive questionnaire answers, coverage, missing-answer reports, and provenance task generation
- inspect the 53-area system capability map
- add/list/summarize project memory decisions, assumptions, constraints, risks, and deferred features
- create/list/status business features and user journeys
- use optional Vibe-first commands to turn natural language into suggested task cards
- generate compact Vibe briefs and next actions to reduce session resume time and AI token waste
- manage Agile backlog, epics, user stories, sprint planning, and sprint reviews as runtime records
- convert ready Agile stories into governed `.kabeeri` tasks
- create/list/summarize Agile sprints and sprint costs
- create/list local acceptance records
- review acceptance records and store reviewer notes
- list audit events and export Markdown audit reports
- add/list human developer identities
- configure Solo Developer Mode for one full-stack developer across all standard workstreams
- manage a runtime workstream registry with path rules and dashboard rollups
- configure local Owner auth and Owner sessions
- transfer single Owner authority using one-use Owner transfer tokens
- add/list AI Developer identities
- create/list/release local locks
- prevent exact lock conflicts and file/folder scope overlap
- move tasks through approve/assign/start/review/verify/reject/reopen states
- enforce role permissions for governed workspaces using `--actor` and Owner sessions
- enforce workstream ownership during task assignment and require integration type for cross-workstream tasks
- enforce workstream file boundaries when governed AI sessions end
- enforce app ownership during task/session execution and require integration type for cross-app tasks
- regenerate derived dashboard state files
- show Vibe-first suggestions and post-work captures in the private dashboard
- show Vibe sessions and context briefs in the private dashboard
- export a customer-facing static site plus a private technical dashboard
- serve the customer page at `/`, app pages at `/customer/apps/<username>`, the dashboard at `/__kvdf/dashboard`, and live state at `/__kvdf/api/state`
- auto-refresh the served private dashboard when local project state changes
- summarize same-product apps in one KVDF workspace and list separate KVDF folders through `--workspaces`, `KVDF_WORKSPACES`, or `dashboard workspace add`
- scaffold VS Code workspace task files and local VS Code Webview extension files for common KVDF commands
- issue/list/revoke local task access token records
- enforce that task access tokens target real tasks and governed assignees
- derive task access token execution scopes from app and workstream boundaries
- enforce token expiry and allowed/forbidden file scopes for AI session handoffs
- revoke tokens on Owner rejection and reissue limited rework tokens
- require active task locks to cover governed AI session file changes
- approve/list/revoke budget overrun approvals for guarded task tokens
- evaluate policy checks and enforce task, release, handoff, security, and migration policy gates
- block confirmed GitHub writes behind a policy gate before any `gh` command runs
- inspect latest policy gate status and validate policy runtime state
- generate context packs, cost preflights, and model route recommendations for cost-aware AI execution
- generate client and Owner handoff packages with business, technical, readiness, publish, AI cost, and roadmap reports
- scan for secrets and feed policy gates before AI handoff, release, or publish workflows
- create migration plans, rollback plans, dry-run checks, reports, and audit trails without executing migrations
- record/list/summarize AI token usage and cost
- export AI usage cost reports and developer efficiency analysis
- configure AI pricing rules and auto-calculate usage cost
- start/end/list AI Developer sessions and generate handoff reports
- generate final verification reports when Owner verifies a task
- run GitHub commands in dry-run/spec mode
- configure local GitHub sync settings
- sync GitHub labels, milestones, issues, and releases through `gh` when `--confirm` is provided
- generate release checks, release notes, and release checklists from v3/v4 plans
- run Multi-AI scenario reviews for governed workspaces
```

GitHub writes are available through `gh` only when `--confirm` is provided.

## Running locally

From the repository root:

```bash
npm run kvdf -- --help
npm run kvdf -- create --help
npm run kvdf -- doctor
npm run kvdf -- validate
npm run kvdf -- create --profile lite --output my-project
npm run kvdf -- init --profile standard --mode structured
npm run kvdf -- app create --username acme --name "ACME Portal"
npm run kvdf -- questionnaire answer entry.project_type --value saas
npm run kvdf -- questionnaire coverage
npm run kvdf -- capability list
npm run kvdf -- dashboard export
npm test
```

For local development, you can also run:

```bash
node bin/kvdf.js --help
```

After publishing or linking the package, the intended command is:

```bash
kvdf --help
kvdf create --profile lite --output my-project
```

## Tests

```bash
npm test
npm run test:smoke
```

The integration test suite runs the CLI in temporary workspaces and verifies workspace init, Owner auth, task verify, pricing, AI usage, customer app username routes, dashboard export, generator scaffolding, prompt-pack export, and safe GitHub dry-run behavior.

## Proposed CLI name

```text
kvdf
```

Alternative package/display names:

```text
kabeeri-vdf
kabeeri.vdf
```

## Purpose

The current CLI MVP helps vibe developers use Kabeeri VDF from the terminal in a simple and predictable way. Future CLI work should keep the same safety and clarity goals while expanding coverage.

It should help with:

```text
- initializing a Kabeeri VDF workspace
- choosing Lite, Standard, or Enterprise generator
- copying templates
- creating questionnaires
- selecting prompt packs
- creating task tracking files
- running acceptance checklist scaffolds
- validating framework files
- preparing release handoff files
```

## What the CLI should not do in early versions

Early CLI versions should not:

```text
- install Laravel, .NET, Next.js, or other frameworks
- create production apps automatically
- deploy projects
- modify live systems
- store real secrets
- replace GitHub Issues or project management tools
- run destructive commands
```

## Core philosophy

The CLI is not a magic app builder.

It should be a safe assistant for preparing structured Kabeeri VDF files.

```text
Raw idea
→ choose profile
→ generate framework documents
→ choose prompt pack
→ create tasks
→ review with acceptance checklist
→ handoff
```

## Suggested next CLI scope

The next implementation slice should add real command enforcement for:

```text
- GitHub dry-run diff output
- GitHub write operations behind explicit confirmation
- stronger role/session enforcement
- persistent release notes generation
- VS Code extension and webview shell
```

## Proposed command family

```text
kvdf init
kvdf generate
kvdf questionnaire
kvdf prompt-pack
kvdf task
kvdf acceptance
kvdf example
kvdf validate
kvdf release
kvdf doctor
```

## Recommended first implementation language

The first implementation can be one of:

```text
Node.js / TypeScript
Python
Go
```

Recommended for this framework:

```text
Node.js / TypeScript
```

Reason:

```text
- easy npm distribution
- familiar to many frontend/full-stack AI builders
- good JSON/Markdown tooling
- good CLI libraries
```

## Folder contents

```text
README.md
README_AR.md
CLI_COMMANDS.md
CLI_COMMANDS_AR.md
CLI_ROADMAP.md
CLI_SAFETY_RULES.md
CLI_USER_FLOWS.md
CLI_COMMAND_REFERENCE.md
cli.commands.schema.json
cli.commands.example.json
cli_manifest.json
```

## Status

Working CLI MVP plus command structure documentation. Some command families are implemented today; others remain roadmap items and should be checked with `kvdf --help` or [CLI_COMMAND_REFERENCE.md](CLI_COMMAND_REFERENCE.md).
