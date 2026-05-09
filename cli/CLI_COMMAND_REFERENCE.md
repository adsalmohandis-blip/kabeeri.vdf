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
kvdf adr --help
kvdf ai-run --help
kvdf dashboard --help
kvdf release --help
kvdf github --help
```

Common command aliases are supported for terminal convenience:

```bash
kvdf tasks list
kvdf t list
kvdf tokens list
kvdf dash generate
kvdf prompts list
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

## Prompt packs

```bash
kvdf prompt-pack list
kvdf prompt-pack show <name>
kvdf prompt-pack common
kvdf prompt-pack export <name> --output <folder>
kvdf prompt-pack use <name>
kvdf prompt-pack compose <name> --task <task-id>
kvdf prompt-pack compose <name> --task <task-id> --context <context-pack-id> --output <file>
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
```

`prompt-pack use` is a convenience install command. Without `--output`, it writes to `07_AI_CODE_PROMPTS/<name>`.

`prompt-pack compose` applies `prompt_packs/common/` before the selected
stack-specific prompt. It creates a reviewable composed prompt under
`.kabeeri/prompt_layer/` by default and records metadata in
`.kabeeri/prompt_layer/compositions.json`.

React Native Expo is available as a mobile pack for Expo apps. Use it when the
same Kabeeri product includes an iOS/Android app connected to the product API
or backend. It includes Expo-specific scope rules for public config, native
permissions, device checks, local/offline storage, and EAS release handoff.

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
kvdf task approve
kvdf task assign
kvdf task start
kvdf task review
kvdf task verify
kvdf task reject
kvdf task reopen
```

Examples:

```bash
kvdf task create --title "Add task tracking format" --type task-tracking --issue 6
kvdf task status --id T006
kvdf task assign task-001 --assignee agent-001
kvdf task start task-001 --actor agent-001
kvdf task review task-001 --actor reviewer-001
kvdf task verify task-001 --owner owner-001
```

When an Owner identity or Owner auth is configured, mutating commands enforce role permissions. Use `--actor <id>` for non-Owner actions, or an active Owner session for Owner/Maintainer-level actions.

Task assignment also checks workstream ownership. If an assignee has `workstreams` configured, they can only receive tasks in those workstreams. Tasks that span multiple workstreams must be created with `--type integration`.

Tasks can also be scoped to registered apps with `--app` or `--apps`. A task that touches multiple apps must use `--type integration`.

## Vibe-first Commands

```bash
kvdf vibe "Add admin dashboard settings page for owner"
kvdf vibe suggest "Add checkout API for the storefront"
kvdf ask "Improve the dashboard"
kvdf vibe list
kvdf vibe show suggestion-001
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

Vibe-first commands are optional. They classify natural-language intent, create reviewable suggested task cards, split larger product requests into safer cards, capture post-work notes, preview captures with `capture scan`, add missing evidence with `capture evidence`, link or convert captured work into governed tasks, reject captures that should not continue, generate compact briefs for the next session, and then hand off to normal governed tasks. They store interaction records under `.kabeeri/interactions/`; the regular CLI remains fully usable without them. See `vibe_ux/VIBE_FIRST_RUNTIME.md`.

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
kvdf validate ui-design
```

The UI/UX Advisor extends Design Governance. It maps a Product Blueprint to an
experience pattern, stack suggestions, component groups, page templates,
SEO/GEO rules, dashboard/mobile rules, and an approval checklist. Its runtime
state lives in `.kabeeri/design_sources/ui_advisor.json`.

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
kvdf validate agile
```

Agile template commands turn backlog, epic, user story, sprint planning, and sprint review templates into runtime records under `.kabeeri/agile.json`. A ready story can be converted into a normal governed task, keeping source provenance as `story:<story_id>`. See `agile_delivery/AGILE_RUNTIME.md`.

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
kvdf design page-create --spec text-spec-001 --name "Checkout page" --output frontend_specs/checkout.page.md
kvdf design page-list
kvdf design page-approve page-spec-001 --actor owner-001
kvdf design component-create --page page-spec-001 --name CheckoutSummary --variants default,compact
kvdf design component-list
kvdf design component-approve component-contract-001 --actor owner-001
kvdf design visual-review --page page-spec-001 --task task-001 --screenshots desktop.png,mobile.png --decision pass
kvdf design visual-review-list
kvdf design gate --task task-001 --page page-spec-001 --json
kvdf validate design
kvdf design missing-report --source design-source-001 --items responsive,empty-state --risk high
kvdf design approve design-source-001 --spec frontend_specs/checkout.page.md --tokens design_system/tokens.json --actor owner-001
kvdf design reject design-source-001 --reason "Source is outdated" --actor owner-001
kvdf design audit
kvdf design audit design-source-001
```

Design sources are inputs, not implementation specs. Raw links, images, PDFs, screenshots, Figma files, and reference websites must become approved text specs before frontend implementation begins. After frontend implementation, visual reviews record screenshot evidence and `design gate` checks whether a frontend task has approved page evidence and a passing visual review.

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
kvdf ai-run record --task task-001 --developer agent-001 --provider openai --model gpt-4 --input-tokens 1000 --output-tokens 500 --summary "Implemented endpoint"
kvdf ai-run list
kvdf ai-run show ai-run-001
kvdf ai-run accept ai-run-001 --reviewer reviewer-001 --evidence tests-pass
kvdf ai-run reject ai-run-001 --reason "Wrong scope"
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

`dashboard ux` writes a Dashboard UX Governance audit into `.kabeeri/dashboard/ux_audits.json` and a Markdown report under `.kabeeri/reports/dashboard_ux_report.md`. It checks the action center, source-of-truth notice, live state, responsive tables, empty states, governance visibility, cost visibility, Vibe/Agile visibility, and common secret leakage.

When served locally, the private dashboard polls the live API every few seconds and reloads itself when project state changes, so new tasks, generated scaffold tasks, usage records, locks, delivery status, and governance updates appear without running `dashboard export` again. The dashboard summarizes multiple same-product apps inside the current `.kabeeri` workspace and can show separate KVDF folders as linked workspace summaries. Each dashboard section adds an inline explanation describing what the table means and why it exists.

Use `--workspaces`, `KVDF_WORKSPACES`, or `kvdf dashboard workspace add` to add summary rows for other KVDF folders that have their own `.kabeeri` state. Linked workspaces are summarized, not merged into the current workspace.

See `dashboard/LIVE_DASHBOARD_RUNTIME.md`.

## Documentation Site

```bash
kvdf docs open
kvdf docs serve --port 4188
kvdf docs serve --port auto --open
kvdf docs generate
kvdf docs path
kvdf docs code
```

`docs open` regenerates the documentation site, starts a local docs server,
and opens the site in the default browser. This is the recommended reading
flow for developers.

`docs serve` runs the same local docs server without opening a browser unless
`--open` is provided. `docs generate` rebuilds `docs/site/pages/*` from the
site source. `docs path` prints the generated docs home file. `docs code`
opens `docs/site` in VS Code for editing.

## Independent Readiness And Governance Reports

```bash
kvdf readiness report
kvdf readiness report --json
kvdf readiness report --output .kabeeri/reports/readiness_report.md
kvdf governance report
kvdf governance report --json
kvdf governance report --output .kabeeri/reports/governance_report.md
kvdf reports live
kvdf reports live --json
kvdf reports show readiness
```

`readiness report` summarizes whether the workspace is ready for demo, handoff,
release review, or publish review. It combines validation, task status, feature
readiness, journey readiness, policy blockers, latest security scan, migration
checks, handoff packages, AI run review state, and unresolved post-work captures.

`governance report` summarizes whether the workspace governance model is healthy.
It checks Owner identity, developer and agent counts, workstreams, active locks,
lock conflicts, active/expired task tokens, missing assignees, unknown
workstreams, policy blockers, and workspace governance validation.

`reports live` writes `.kabeeri/reports/live_reports_state.json`, a compact
derived JSON state for Codex, dashboard widgets, VS Code views, and automation.
Markdown reports remain human-readable snapshots; live JSON is the fast-changing
operational surface.

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

Main references:

- `docs/production/PACKAGING_GUIDE.md`
- `docs/production/UPGRADE_GUIDE.md`

## VS Code

```bash
kvdf vscode scaffold
kvdf vscode status
```

`vscode scaffold` writes `.vscode/tasks.json`, `.vscode/extensions.json`, and `.vscode/kvdf.commands.json` so common Kabeeri CLI actions can be run from VS Code tasks.

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
kvdf adopt analyze --path existing-app
```

`project analyze` inspects an existing application folder before Kabeeri starts
governing it. It records detected stacks, likely app boundaries, suggested
workstreams, risk signals, and next adoption actions in
`.kabeeri/project_analysis.json`.

## GitHub Dry Run

```bash
kvdf github plan --version v4.0.0 --dry-run
kvdf github label sync --version v4.0.0 --dry-run
kvdf github milestone sync --version v4.0.0 --dry-run
kvdf github issue sync --version v4.0.0 --dry-run
kvdf github issue sync --version v4.0.0 --dry-run --output github-issues.dry-run.txt
kvdf github config set --repo owner/repo --branch main --default-version v4.0.0
kvdf github config show
```

These commands do not write to GitHub.

## GitHub Confirmed Sync

```bash
kvdf github label sync --version v4.0.0 --confirm
kvdf github milestone sync --version v4.0.0 --confirm
kvdf github issue sync --version v4.0.0 --confirm
kvdf github release publish --version v4.0.0 --confirm
```

Confirmed commands use the installed GitHub CLI (`gh`) and write to the current GitHub repository. Issue creation is recorded in `.kabeeri/github/issue_map.json` when a workspace exists.
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
