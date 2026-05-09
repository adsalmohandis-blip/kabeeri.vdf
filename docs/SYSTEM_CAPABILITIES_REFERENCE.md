# Kabeeri VDF System Capabilities Reference

This document is the main high-level reference for Kabeeri VDF capabilities.
Use it to quickly understand what the system can do, which layer owns each
capability, where the source files live, and which CLI commands or runtime
state are involved.

> Kabeeri VDF is a meta-framework for AI-driven software development. It does
> not replace Laravel, React, Next.js, Django, .NET, WordPress, or other coding
> frameworks. It governs how ideas become scoped tasks, prompts, code work,
> reviews, dashboards, handoffs, releases, and AI cost records.

## Quick Map

| Area | What It Does | Main Runtime / Docs |
| --- | --- | --- |
| CLI Engine | Runs local workspace operations and governance commands. | `bin/kvdf.js`, `src/cli/`, `cli/CLI_COMMAND_REFERENCE.md` |
| Repository Foldering System | Defines a Laravel-like root architecture so maintainers and AI tools know where runtime, knowledge, packs, integrations, schemas, docs, tests, and local state belong. | `knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json`, `docs/architecture/REPOSITORY_FOLDERING_SYSTEM.md`, `kvdf structure` |
| Workspace State | Stores the project truth under `.kabeeri/`. | `.kabeeri/`, `src/cli/workspace.js` |
| Vibe-first UX | Converts natural language into governed suggestions, plans, captures, briefs, and next actions. | `knowledge/vibe_ux/`, `.kabeeri/interactions/` |
| Delivery Mode Advisor | Recommends Agile or Structured from the requested application context and records the developer's final choice. | `knowledge/delivery_modes/`, `.kabeeri/delivery_decisions.json`, `kvdf delivery` |
| Product Blueprint Catalog | Maps real market systems to channels, backend modules, frontend pages, database entities, workstreams, and risk flags for compact AI planning. | `knowledge/standard_systems/PRODUCT_BLUEPRINT_CATALOG.json`, `.kabeeri/product_blueprints.json`, `kvdf blueprint` |
| Data Design Blueprint | Guides AI database modeling from business workflow to modules, entities, constraints, snapshots, indexes, audit, transactions, idempotency, and migration safety. | `knowledge/standard_systems/DATA_DESIGN_BLUEPRINT.json`, `.kabeeri/data_design.json`, `kvdf data-design` |
| Agile Templates Runtime | Turns backlog, epic, story, sprint planning, impediments, retrospectives, velocity, forecast, and sprint reviews into executable workspace records. | `knowledge/agile_delivery/`, `.kabeeri/agile.json`, `.kabeeri/dashboard/agile_state.json` |
| Structured Delivery Runtime | Turns Waterfall-style requirements, phases, deliverables, risks, change requests, phase gates, and traceability into executable workspace records. | `knowledge/delivery_modes/`, `.kabeeri/structured.json`, `.kabeeri/dashboard/structured_state.json` |
| Project Intake | Starts new or existing projects with profile, language, and delivery structure. | `knowledge/project_intake/`, `packs/generators/`, `packs/templates/` |
| Generators | Creates Lite, Standard, and Enterprise project skeletons. | `packs/generators/*.json`, `kvdf create`, `kvdf generate` |
| Examples Library | Shows Lite, Standard, and Enterprise reference examples. | `packs/examples/`, `kvdf example` |
| Questionnaires | Collects structured product and technical answers; adaptive intake planning now uses blueprints, framework prompt packs, data design, UI/UX, and delivery mode context before asking. | `knowledge/questionnaires/`, `knowledge/questionnaire_engine/`, `.kabeeri/questionnaires/adaptive_intake_plan.json`, `kvdf questionnaire plan` |
| Capability Map | Maps project type to required, optional, deferred, or unknown system areas. | `knowledge/standard_systems/`, `kvdf capability`, `kvdf questionnaire coverage` |
| Prompt Packs And Common Prompt Layer | Provides stack-specific AI coding prompts plus shared scope, review, and AI-run rules. | `packs/prompt_packs/`, `packs/prompt_packs/common/`, `.kabeeri/prompt_layer/`, `kvdf prompt-pack` |
| Task Tracking | Manages approved work from intake to verification and exposes a focused live task tracker JSON for dashboards and VS Code-style surfaces. | `knowledge/task_tracking/`, `knowledge/governance/TASK_GOVERNANCE.md`, `.kabeeri/dashboard/task_tracker_state.json`, `kvdf task` |
| Workstream Governance | Separates backend, frontend, mobile, admin, QA, security, docs, and integration work. | `knowledge/governance/WORKSTREAM_GOVERNANCE.md`, `kvdf workstream` |
| App Boundary Governance | Allows same-product multi-app workspaces while blocking unrelated products in one folder. | `knowledge/governance/APP_BOUNDARY_GOVERNANCE.md`, `kvdf app` |
| Execution Scope Governance | Derives allowed files, apps, and workstreams for task access tokens. | `knowledge/governance/EXECUTION_SCOPE_GOVERNANCE.md`, `kvdf token` |
| Multi-AI Governance | Controls identities, roles, sessions, locks, tokens, audit, and Owner verification. | `knowledge/governance/`, `integrations/multi_ai_governance/` |
| Policy Gates | Blocks unsafe verification, release, handoff, security, migration, and GitHub write operations. | `kvdf policy`, `schemas/policy*.json` |
| Runtime Schema Registry | Maps `.kabeeri/` JSON and JSONL runtime files to schemas for drift checks. | `schemas/runtime/`, `kvdf validate runtime-schemas` |
| Design Governance | Converts design sources into approved text specs before frontend implementation. | `knowledge/design_sources/`, `knowledge/design_system/`, `knowledge/frontend_specs/`, `kvdf design` |
| UI/UX Advisor | Recommends frontend experience pattern, component groups, page templates, stacks, SEO/GEO rules, and dashboard/mobile UX rules from the product blueprint. | `knowledge/standard_systems/UI_UX_DESIGN_BLUEPRINT.json`, `.kabeeri/design_sources/ui_advisor.json`, `kvdf design recommend` |
| ADR And AI Run History | Records formal architecture decisions and accepted/rejected AI prompt runs. | `knowledge/project_intelligence/ADR_AI_RUN_HISTORY_RUNTIME.md`, `.kabeeri/adr/`, `.kabeeri/ai_runs/`, `kvdf adr`, `kvdf ai-run` |
| AI Cost Control | Tracks usage, budgets, context packs, preflight estimates, and model routing. | `knowledge/ai_cost_control/`, `kvdf usage`, `kvdf preflight` |
| Live Dashboard | Shows live state for tasks, governance, apps, costs, policies, linked workspaces, and dashboard UX audits. | `integrations/dashboard/`, `kvdf dashboard` |
| VS Code Integration | Scaffolds workspace tasks and command helpers. | `integrations/vscode_extension/`, `kvdf vscode` |
| GitHub Sync | Plans and optionally confirms labels, milestones, issues, and releases through `gh`. | `integrations/github_sync/`, `integrations/github/`, `kvdf github` |
| Security Governance | Scans local files for common secret patterns and blocks high-risk readiness gates. | `kvdf security`, `.kabeeri/security/` |
| Migration Safety | Records migration plans, rollback plans, checks, reports, and approval state. | `kvdf migration`, `.kabeeri/migrations/` |
| Handoff Packages | Generates Owner/client reports from local state. | `kvdf handoff`, `.kabeeri/handoff/` |
| Independent Reports | Exports standalone readiness/governance reports and a compact live JSON report state for Codex, dashboard, VS Code, and automation. | `kvdf readiness report`, `kvdf governance report`, `kvdf reports live`, `.kabeeri/reports/live_reports_state.json` |
| Release Readiness | Checks validation, policy, notes, checklist, and publish gates. | `kvdf release`, `docs/production/` |
| Product Packaging And Upgrade | Checks npm packaging readiness and workspace upgrade compatibility. | `kvdf package`, `kvdf upgrade`, `docs/production/` |
| Validation And Doctor | Checks repository health, JSON/state integrity, and scoped governance rules. | `kvdf doctor`, `kvdf validate` |
| Roadmap And Plan Inspection | Reads packaged v3/v4 milestone plans and source roadmap material. | `integrations/platform_integration/`, `integrations/multi_ai_governance/`, `docs/codex_context/`, `kvdf plan` |
| Reports And Traceability | Keeps audit, gap, implementation, requirement, and validation reports. | `docs/reports/` |
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
| `integrations/` | Dashboard, GitHub, VS Code, platform integration, and multi-AI integration material. |
| `docs/` | Human documentation, reports, architecture docs, bilingual docs, docs site, and Codex context. |
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

- `cli/CLI_COMMAND_REFERENCE.md`
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
kvdf validate
kvdf dashboard state
```

## 3. Agile Templates Runtime

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
- compact context briefs
- next-action recommendations

Main commands:

```bash
kvdf vibe "Add admin settings page"
kvdf vibe suggest "Add checkout API"
kvdf ask "Improve the dashboard"
kvdf vibe plan "Build ecommerce store with products cart checkout admin and tests"
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
- Commerce and Integrations
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
pack, instead of duplicating the same safety text in every framework folder.

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
- `knowledge/governance/TASK_GOVERNANCE.md`
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
many developers, one AI agent, or multiple AI agents.

It covers:

- single active Owner
- Owner sessions and Owner transfer
- developer identities
- AI agent identities
- role permissions
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
kvdf lock create --type folder --scope src/api --task task-001 --owner agent-001
kvdf session start --task task-001 --developer agent-001 --provider openai --model gpt
kvdf session end session-001 --files src/api/users.ts --summary "Implemented endpoint"
```

Main references:

- `knowledge/governance/README.md`
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
kvdf design missing-report --source design-source-001 --items responsive,empty-state --risk high
kvdf design audit
```

Main references:

- `knowledge/design_sources/`
- `knowledge/design_system/`
- `knowledge/frontend_specs/`
- `knowledge/design_sources/VISUAL_ACCEPTANCE_RUNTIME.md`
- `docs/reports/V7_DESIGN_SOURCE_GOVERNANCE_IMPLEMENTATION_REPORT.md`

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
kvdf ai-run record --task task-001 --developer agent-001 --provider openai --model gpt-4 --input-tokens 1000 --output-tokens 500
kvdf ai-run accept ai-run-001 --reviewer reviewer-001 --evidence tests-pass
kvdf ai-run reject ai-run-001 --reason "Wrong scope"
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
kvdf usage summary
kvdf usage efficiency
kvdf usage report --output usage-report.md
kvdf context-pack create --task task-001 --allowed-files src/api/,tests/api/
kvdf preflight estimate --task task-001 --context ctx-001 --provider openai --model gpt-4
kvdf model-route recommend --kind implementation --risk medium
kvdf budget approve --task task-001 --tokens 5000 --reason "Owner approved extra work"
```

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

Main reference:

- `integrations/dashboard/LIVE_DASHBOARD_RUNTIME.md`
- `integrations/dashboard/DASHBOARD_UX_GOVERNANCE.md`

## 19. VS Code Integration

The VS Code layer helps developers run common Kabeeri commands from editor
tasks and workspace files.

Main commands:

```bash
kvdf vscode scaffold
kvdf vscode status
```

Main references:

- `integrations/vscode_extension/`
- `.vscode/tasks.json`
- `.vscode/extensions.json`
- `.vscode/kvdf.commands.json`

## 20. GitHub Sync

GitHub sync can run as dry-run by default or write through GitHub CLI when
confirmed. Confirmed writes are protected by policy gates.

Main commands:

```bash
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

- `integrations/github_sync/`
- `integrations/github/`

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
kvdf readiness report --output .kabeeri/reports/readiness_report.md
kvdf governance report
kvdf governance report --json
kvdf governance report --output .kabeeri/reports/governance_report.md
```

Readiness reports answer: "Can this workspace be shown, handed off, or reviewed
for release?" Governance reports answer: "Is the control model healthy enough
for safe development?"

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
- `integrations/platform_integration/`
- `integrations/multi_ai_governance/`
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
pages.

Main references:

- `docs/site/README.md`
- `docs/site/pages/en/`
- `docs/site/pages/ar/`
- `docs/site/generate-pages.js`

## 32. Where To Start By Goal

| Goal | Start Here |
| --- | --- |
| Know every command | `cli/CLI_COMMAND_REFERENCE.md` |
| Understand the repository layout | `knowledge/standard_systems/REPOSITORY_FOLDERING_MAP.json` and `docs/architecture/REPOSITORY_FOLDERING_SYSTEM.md` |
| Start a new project | `kvdf create --profile standard --output my-project` |
| See example projects | `kvdf example list` |
| Talk naturally and create governed tasks | `knowledge/vibe_ux/VIBE_FIRST_RUNTIME.md` |
| Govern multiple apps in one product | `knowledge/governance/APP_BOUNDARY_GOVERNANCE.md` |
| Prevent scope creep during AI execution | `knowledge/governance/EXECUTION_SCOPE_GOVERNANCE.md` |
| Control team and AI work boundaries | `knowledge/governance/WORKSTREAM_GOVERNANCE.md` |
| Control design-to-frontend flow | `knowledge/design_sources/README.md` |
| Reduce AI tokens and cost | `knowledge/ai_cost_control/README.md` |
| Preserve durable architecture decisions | `knowledge/project_intelligence/ADR_AI_RUN_HISTORY_RUNTIME.md` |
| See live project status | `integrations/dashboard/LIVE_DASHBOARD_RUNTIME.md` |
| Check repository/workspace health | `kvdf doctor` and `kvdf validate` |
| Inspect roadmap plans | `kvdf plan list` |
| Prepare Owner/client delivery | `kvdf handoff package` |
| Prepare release | `kvdf release check --strict` |

## 33. Source Of Truth Rules

- `.kabeeri/` is the runtime source of truth for a project workspace.
- CLI commands mutate or validate `.kabeeri/` state.
- The physical repository root is grouped into `src/`, `knowledge/`, `packs/`,
  `integrations/`, `docs/`, `schemas/`, `tests/`, `cli/`, and `bin/`.
- Legacy root paths are compatibility aliases only; new source files should use
  the new physical layout.
- Dashboard, VS Code, docs site, and chat are surfaces over that state.
- Vibe-first creates reviewable suggestions before execution.
- Task access tokens govern permission; AI usage tokens measure cost.
- Owner verification is the final authority for task completion.
- GitHub confirmed writes require explicit confirmation and policy gates.
- Separate products should use separate KVDF folders.
