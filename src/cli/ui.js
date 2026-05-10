function parseArgs(argv) {
  const flags = {};
  const positionals = [];

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (item === "--help" || item === "-h") {
      flags.help = true;
    } else if (item === "-v") {
      flags.version = true;
    } else if (item.startsWith("--")) {
      const key = normalizeFlagName(item.slice(2));
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) {
        flags[key] = true;
      } else {
        flags[key] = next;
        index += 1;
      }
    } else {
      positionals.push(item);
    }
  }

  return { flags, positionals };
}

function normalizeFlagName(key) {
  const aliases = {
    profil: "profile"
  };
  return aliases[key] || key;
}

function normalizeCommandName(command) {
  const aliases = {
    tasks: "task",
    t: "task",
    features: "feature",
    workstreams: "workstream",
    ws: "workstream",
    apps: "app",
    "customer-app": "app",
    "customer-apps": "app",
    journeys: "journey",
    tokens: "token",
    tok: "token",
    agents: "agent",
    developers: "developer",
    dev: "developer",
    locks: "lock",
    code: "vscode",
    vs: "vscode",
    plans: "plan",
    prompts: "prompt-pack",
    promptpack: "prompt-pack",
    promptpacks: "prompt-pack",
    vibes: "vibe",
    "vibe-first": "vibe",
    ask: "ask",
    capture: "capture",
    pkg: "package",
    packaging: "package",
    upgrade: "upgrade",
    delivery: "delivery",
    structured: "structured",
    waterfall: "structured",
    agile: "agile",
    backlog: "agile",
    epics: "agile",
    stories: "agile",
    capabilities: "capability",
    cap: "capability",
    foldering: "structure",
    folders: "structure",
    structure: "structure",
    blueprints: "blueprint",
    "product-blueprint": "blueprint",
    "product-blueprints": "blueprint",
    systems: "blueprint",
    "system-blueprint": "blueprint",
    data: "data-design",
    database: "data-design",
    "data-design": "data-design",
    "database-design": "data-design",
    evolve: "evolution",
    evolution: "evolution",
    "evolution-steward": "evolution",
    dash: "dashboard",
    board: "dashboard",
    report: "reports",
    costs: "usage",
    cost: "usage",
    budgets: "budget",
    price: "pricing",
    designs: "design",
    adrs: "adr",
    airun: "ai-run",
    "ai-runs": "ai-run",
    "design-source": "design",
    "design-sources": "design",
    policies: "policy",
    gates: "policy",
    context: "context-pack",
    contexts: "context-pack",
    "context-packs": "context-pack",
    routes: "model-route",
    routing: "model-route",
    handoffs: "handoff",
    secret: "security",
    secrets: "security",
    migrate: "migration",
    migrations: "migration"
  };
  return aliases[command] || command;
}

function printCommandHelp(command) {
  const help = {
    create: `Usage:
  kvdf create --profile lite --output my-project
  kvdf create --profile standard --output my-project
  kvdf create --profile enterprise --output my-project

Aliases:
  kvdf generate --profile lite --output my-project
  kvdf generator create lite --output my-project

Notes:
  Inside an initialized .kabeeri workspace, generators also create proposed governance tasks for review, implementation, and validation unless --no-tasks is used.
`,
    task: `Usage:
  kvdf task create --title "Task title" --workstream backend
  kvdf task create --title "Integration task" --type integration --workstreams backend,public_frontend
  kvdf task list
  kvdf task tracker
  kvdf task tracker --json
  kvdf task status task-001
  kvdf task approve task-001
  kvdf task assign task-001 --assignee agent-001
  kvdf task start task-001 --actor agent-001
  kvdf task review task-001 --actor reviewer-001
  kvdf task verify task-001 --owner owner-001
`,
    vibe: `Usage:
  kvdf vibe "Add admin theme settings"
  kvdf vibe suggest "Add checkout API"
  kvdf vibe ask "Improve the dashboard"
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

Notes:
  Vibe-first commands are optional. They classify natural language, create suggested task cards, approve or reject them, convert approved suggestions into governed tasks, and capture post-work notes without replacing the regular CLI.
`,
    ask: `Usage:
  kvdf ask "How should I improve the dashboard?"
  kvdf vibe ask "Improve the dashboard"

Notes:
  Ask classifies the request and returns safe clarifying questions instead of creating execution work directly.
`,
    capture: `Usage:
  kvdf capture --summary "Updated dashboard filters" --files src/cli/index.js --checks "npm test"
  kvdf capture scan --summary "Finished a small cleanup" --files src/cli/index.js
  kvdf capture list
  kvdf capture show capture-001
  kvdf capture evidence capture-001 --checks "npm test" --evidence "manual review"
  kvdf capture link capture-001 --task task-001
  kvdf capture convert capture-001 --task task-002
  kvdf capture reject capture-001 --reason "Exploration will not continue"
  kvdf capture resolve capture-001 --reason "Linked in review notes"
  kvdf vibe capture --summary "Finished a small docs cleanup"

Notes:
  Capture records post-work notes and changed files under .kabeeri/interactions without reverting user changes. Use scan to preview classification without writing. Captures can receive evidence, be linked to existing tasks, converted to governed tasks, rejected, or resolved after review.
`,
    package: `Usage:
  kvdf package check
  kvdf package check --json
  kvdf package guide

Notes:
  Package checks verify the local product packaging contract before npm dry-runs or distribution.
`,
    upgrade: `Usage:
  kvdf upgrade guide
  kvdf upgrade check
  kvdf upgrade check --json

Notes:
  Upgrade checks compare the current CLI version with .kabeeri version compatibility state and report pending migration risks.
`,
    readiness: `Usage:
  kvdf readiness report
  kvdf readiness report --json
  kvdf readiness report --target demo
  kvdf readiness report --target release --strict
  kvdf readiness report --output .kabeeri/reports/readiness_report.md

Notes:
  Readiness reports are standalone snapshots from .kabeeri. Targets: workspace, demo, handoff, release, publish. Use --strict when warnings should block final review.
`,
    governance: `Usage:
  kvdf governance report
  kvdf governance report --json
  kvdf governance report --target workspace
  kvdf governance report --target publish --strict
  kvdf governance report --output .kabeeri/reports/governance_report.md

Notes:
  Governance reports are standalone snapshots from .kabeeri. They summarize Owner identity, workstreams, assignment health, lock conflicts, active task tokens, policy blockers, and workspace governance validation.
`,
    reports: `Usage:
  kvdf reports live
  kvdf reports live --json
  kvdf reports state
  kvdf reports show readiness
  kvdf reports show governance
  kvdf reports show task_tracker

Notes:
  Live reports write .kabeeri/reports/live_reports_state.json as a small derived JSON state for Codex, dashboard widgets, VS Code views, and automation. Markdown reports remain human-readable snapshots; live JSON is the fast-changing operational surface.
`,
    agile: `Usage:
  kvdf agile summary
  kvdf agile backlog add --id BL-001 --title "Checkout MVP" --type epic --priority high --source "vision"
  kvdf agile epic create --id epic-checkout --title "Checkout" --goal "Customers can place orders" --users customer --source "vision"
  kvdf agile story create --id story-checkout-001 --epic epic-checkout --title "Cart checkout" --role customer --want "pay for cart items" --value "complete an order" --points 5 --workstream backend --acceptance "Order is created,Payment result is stored" --reviewer owner-001
  kvdf agile story ready story-checkout-001
  kvdf agile story task story-checkout-001 --task task-001
  kvdf agile sprint plan sprint-001 --stories story-checkout-001 --capacity-points 20 --goal "Checkout foundation"
  kvdf agile sprint review sprint-001 --accepted story-checkout-001 --goal-met yes --decision accepted
  kvdf agile impediment add --id imp-001 --story story-checkout-001 --severity high --title "Payment provider credentials missing" --owner owner-001
  kvdf agile impediment resolve imp-001 --resolution "Credentials added to local env"
  kvdf agile retrospective add sprint-001 --good "Goal was clear" --improve "Slice stories smaller" --actions "Add QA earlier"
  kvdf agile health
  kvdf agile forecast
  kvdf validate agile

Notes:
  Agile commands turn the markdown templates into runtime backlog, epic, story, sprint planning, impediment, retrospective, forecast, and sprint review records under .kabeeri/agile.json. Stories can be converted into normal governed tasks.
`,
    structured: `Usage:
  kvdf structured health
  kvdf structured requirement add --id REQ-001 --title "Email login" --priority high --source questionnaire --acceptance "User can login,Invalid password is rejected"
  kvdf structured requirement approve REQ-001 --reason "Reviewed by Owner"
  kvdf structured phase plan phase-001 --requirements REQ-001 --goal "Authentication foundation" --exit "Requirements approved,Deliverables approved"
  kvdf structured task REQ-001 --task task-001
  kvdf structured deliverable add --id deliv-001 --phase phase-001 --title "Authentication specification" --acceptance "Owner approved"
  kvdf structured deliverable approve deliv-001
  kvdf structured risk add --id risk-001 --phase phase-001 --severity high --title "OAuth provider limits" --mitigation "Use fallback email login"
  kvdf structured risk mitigate risk-001 --mitigation "Fallback path documented"
  kvdf structured gate check phase-001
  kvdf structured phase complete phase-001
  kvdf validate structured

Notes:
  Structured commands support waterfall-style delivery with approved requirements, phase gates, deliverables, change control, risks, traceability, and live dashboard state under .kabeeri/structured.json.
`,
    evolution: `Usage:
  kvdf evolution plan "Add docs-first init gate"
  kvdf evolution plan "Improve dashboard descriptions" --areas cli,docs,dashboard,tests
  kvdf evolution list
  kvdf evolution status
  kvdf evolution show evo-001
  kvdf evolution tasks evo-001
  kvdf evolution impact evo-001
  kvdf evolution verify evo-001

Notes:
  Evolution Steward governs Kabeeri's own development. It records requested framework changes, infers impacted areas, creates follow-up tasks for runtime, CLI, docs, schemas, tests, dashboards, reports, and capabilities, and exposes the update state to dashboard/live reports.
`,
    delivery: `Usage:
  kvdf delivery recommend "Build hospital management system with billing compliance roles and audit"
  kvdf delivery recommend "Build startup MVP prototype with fast user feedback" --json
  kvdf delivery choose agile --recommendation delivery-recommendation-123 --reason "MVP discovery"
  kvdf delivery choose structured --reason "Known compliant scope"
  kvdf delivery history

Notes:
  Delivery advisor compares Agile and Structured using the requested app context. It records recommendations and developer decisions in .kabeeri/delivery_decisions.json. The recommendation is advisory; the developer/Owner chooses the final mode.
`,
    workstream: `Usage:
  kvdf workstream list
  kvdf workstream show backend
  kvdf workstream add --id payments --name "Payments" --paths src/payments,app/Payments --review security,contract_safety
  kvdf workstream update backend --paths src/api,app/Http,routes/api.php
  kvdf workstream validate

Notes:
  Workstreams define capability and file boundaries. Tasks can only reference known workstreams, assignments must match developer capabilities, and AI session files must stay inside the task workstream paths.
`,
    sprint: `Usage:
  kvdf sprint create --id sprint-001 --name "Sprint 1"
  kvdf sprint create --id sprint-001 --name "Sprint 1" --start 2026-05-01 --end 2026-05-14 --goal "MVP foundation"
  kvdf sprint list
  kvdf sprint summary sprint-001

Notes:
  Mutating sprint commands require Owner or Maintainer authority in governed workspaces.
`,
    session: `Usage:
  kvdf session start --task task-001 --developer agent-001 --provider openai --model gpt-4
  kvdf session start --id session-001 --task task-001 --developer agent-001
  kvdf session end session-001 --input-tokens 1000 --output-tokens 500 --files src/api/users.ts --summary "Implemented endpoint"
  kvdf session list
  kvdf session show session-001

Notes:
  Governed AI sessions require task assignment, an active task token, and lock coverage for edited files.
`,
    feature: `Usage:
  kvdf feature create --title "Public signup" --readiness needs_review --tasks task-001
  kvdf feature status feature-001 --readiness ready_to_demo
  kvdf feature list
  kvdf feature show feature-001
`,
    app: `Usage:
  kvdf app create --username backend-api --name "Laravel API" --type backend --path apps/api-laravel --product "Store"
  kvdf app create --username storefront --name "React Storefront" --type frontend --path apps/storefront-react --product "Store"
  kvdf app list
  kvdf app show storefront
  kvdf app status storefront --status ready_to_publish --workstreams public_frontend

Public routes always use username:
  /customer/apps/storefront

Notes:
  App Boundary Governance allows multiple apps inside one KVDF workspace only when they belong to the same product.
  Use separate KVDF workspaces for unrelated products, clients, or release lifecycles.
`,
    journey: `Usage:
  kvdf journey create --name "Signup journey" --steps Landing,Signup,Welcome
  kvdf journey status journey-001 --status ready_to_show --ready-to-show
  kvdf journey list
  kvdf journey show journey-001
`,
    questionnaire: `Usage:
  kvdf questionnaire list
  kvdf questionnaire flow
  kvdf questionnaire plan "Build ecommerce store with Laravel backend React frontend payments and mobile app"
  kvdf questionnaire plan "Build ERP with inventory accounting and approvals" --json
  kvdf questionnaire plan --blueprint ecommerce --framework laravel --frontend react --database mysql
  kvdf questionnaire answer entry.project_type --value saas
  kvdf questionnaire answer entry.has_users --value yes
  kvdf questionnaire coverage
  kvdf questionnaire missing
  kvdf questionnaire generate-tasks

Notes:
  Questionnaire planning uses Product Blueprints, framework prompt packs, Data Design, UI/UX Advisor, and Delivery Mode Advisor to generate focused developer questions before task generation.
`,
    capability: `Usage:
  kvdf capability list
  kvdf capability show payments_billing
  kvdf capability map
`,
    structure: `Usage:
  kvdf structure map
  kvdf structure map --json
  kvdf structure show standard_systems
  kvdf structure validate
  kvdf structure validate --json
  kvdf structure guide
  kvdf validate foldering

Notes:
  Repository foldering defines a Laravel-like root architecture for Kabeeri. It keeps existing paths compatible while mapping every top-level folder into core, knowledge, packs, integrations, contracts, documentation, quality, or runtime_state.
`,
    blueprint: `Usage:
  kvdf blueprint list
  kvdf blueprint show ecommerce
  kvdf blueprint recommend "Build ecommerce store with Laravel backend React frontend payments shipping and mobile app"
  kvdf blueprint recommend "Build news website with breaking news ads paywall and mobile app" --json
  kvdf blueprint select ecommerce --delivery structured --reason "Large catalog with payments and shipping"
  kvdf blueprint context ecommerce --json
  kvdf blueprint history

Notes:
  Product blueprints map real market systems to channels, backend modules, frontend pages, database entities, workstreams, risk flags, and governance links. They help AI tools start from a compact shared context instead of rediscovering the same app structure every session.
`,
    "data-design": `Usage:
  kvdf data-design principles
  kvdf data-design principle workflow_first
  kvdf data-design modules
  kvdf data-design module commerce
  kvdf data-design context ecommerce --json
  kvdf data-design recommend "Build ecommerce store with payments inventory mobile app" --json
  kvdf data-design checklist
  kvdf data-design review "orders table with price float and items json"
  kvdf data-design history

Notes:
  Data Design helps AI tools design databases from business workflow, modules, constraints, snapshots, audit logs, indexes, transactions, idempotency, reports, mobile, and integration needs. It is linked to Product Blueprints and writes compact runtime context to .kabeeri/data_design.json.
`,
    acceptance: `Usage:
  kvdf acceptance list
  kvdf acceptance create --type task-completion --issue 7
  kvdf acceptance create --task task-001 --criteria "Reviewed by QA"
  kvdf acceptance review acceptance-001 --reviewer reviewer-001 --result pass --notes "Ready"
`,
    audit: `Usage:
  kvdf audit list
  kvdf audit list --limit 50
  kvdf audit report
  kvdf audit report --task task-001 --output audit.md
`,
    memory: `Usage:
  kvdf memory add --type decision --text "Use PostgreSQL"
  kvdf memory add --type risk --text "Payment provider not confirmed"
  kvdf memory list --type risk
  kvdf memory summary
`,
    adr: `Usage:
  kvdf adr create --title "Use PostgreSQL" --context "Need reliable relational data" --decision "Use PostgreSQL for v1"
  kvdf adr create --title "Adopt event queue" --context "Async order emails" --decision "Use queue workers" --status approved
  kvdf adr list
  kvdf adr show adr-001
  kvdf adr approve adr-001
  kvdf adr reject adr-001 --reason "Not needed for MVP"
  kvdf adr supersede adr-001 --by adr-002 --reason "Architecture changed"
  kvdf adr report --output adr-report.md
  kvdf adr trace --json

Notes:
  ADRs are for durable architecture, security, migration, release, or integration decisions. Lightweight notes belong in kvdf memory.
`,
    "ai-run": `Usage:
  kvdf ai-run record --task task-001 --developer agent-001 --provider openai --model gpt-4 --input-tokens 1000 --output-tokens 500 --summary "Implemented endpoint"
  kvdf ai-run list
  kvdf ai-run show ai-run-001
  kvdf ai-run accept ai-run-001 --reviewer reviewer-001 --evidence tests-pass
  kvdf ai-run reject ai-run-001 --reason "Wrong scope"
  kvdf ai-run link ai-run-001 --adr adr-001
  kvdf ai-run report
  kvdf ai-run report --json

Notes:
  AI run history records prompt quality and accepted/rejected outputs. Usage remains the cost ledger, and sessions remain execution boundary records. Link important runs to ADRs so durable decisions keep their AI evidence.
`,
    "prompt-pack": `Usage:
  kvdf prompt-pack list
  kvdf prompt-pack show react
  kvdf prompt-pack common
  kvdf prompt-pack export react --output my-project/07_AI_CODE_PROMPTS/react
  kvdf prompt-pack use vue --output my-project/07_AI_CODE_PROMPTS/vue
  kvdf prompt-pack compose react --task task-001
  kvdf prompt-pack compose react --task task-001 --context ctx-001 --output .kabeeri/prompt_layer/task-001.react.md
  kvdf prompt-pack compositions
  kvdf prompt-pack composition-show prompt-composition-001
  kvdf prompt-pack validate react

Notes:
  compose merges prompt_packs/common, the selected stack prompt, task scope, acceptance criteria, and an optional context pack into one reviewable prompt.
`,
    token: `Usage:
  kvdf token issue --task task-001 --assignee agent-001
  kvdf token show task-token-001
  kvdf token issue --task task-001 --assignee agent-001 --allowed-files src/api/ --forbidden-files .env
  kvdf token issue --task task-001 --assignee agent-001 --allowed-files src/ --allow-broad-scope
  kvdf token issue --task task-001 --assignee agent-001 --max-cost 10 --budget-approval-required
  kvdf token list
  kvdf token revoke task-token-001
  kvdf token reissue task-token-001 --max-usage-tokens 200 --reason "Rework only"

Notes:
  Token issue derives execution scope from task app and workstream boundaries unless --allowed-files is supplied.
`,
    lock: `Usage:
  kvdf lock list
  kvdf lock create --type file --scope src/api/users.ts --task task-001 --owner agent-001
  kvdf lock create --type folder --scope src/api --task task-001 --owner agent-001
  kvdf lock create --type workstream --scope backend --task task-001 --owner agent-001
  kvdf lock release lock-001 --actor owner-001

Notes:
  Active locks prevent exact scope conflicts and file/folder overlap. Release requires Owner or Maintainer authority.
`,
    budget: `Usage:
  kvdf budget approve --task task-001 --tokens 5000 --reason "Owner approved extra work"
  kvdf budget approve --task task-001 --cost 5
  kvdf budget list
  kvdf budget revoke budget-approval-001
`,
    pricing: `Usage:
  kvdf pricing set --provider openai --model gpt-4 --unit 1M --input 5 --output 15 --cached 1 --currency USD
  kvdf pricing list
  kvdf pricing show openai/gpt-4
  kvdf pricing show --provider openai --model gpt-4

Notes:
  Pricing rules let usage records calculate cost when --cost is omitted.
`,
    usage: `Usage:
  kvdf usage record --task task-001 --developer agent-001 --provider openai --model gpt-4 --input-tokens 1000 --output-tokens 500 --cached-tokens 0
  kvdf usage record --untracked --input-tokens 1000 --output-tokens 500 --cost 0.25 --source ad-hoc-prompt
  kvdf usage inquiry --input-tokens 300 --output-tokens 120 --cost 0.04 --operation owner-question
  kvdf usage admin --input-tokens 500 --output-tokens 200 --operation dashboard-review
  kvdf usage list
  kvdf usage summary
  kvdf usage efficiency
  kvdf usage report --output usage-report.md

Notes:
  Usage records are stored in .kabeeri/ai_usage/usage_events.jsonl and rolled into task, sprint, and developer cost summaries.
`,
    policy: `Usage:
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

Notes:
  Policy evaluation records check results under .kabeeri/policies/policy_results.json.
  Policy status shows the latest result for every policy/subject pair.
  Policy gates cover task verification, release publish readiness, handoff readiness, security scans, migration safety, and confirmed GitHub writes.
  Policy gates block when required checks fail unless an Owner records an audited override with a reason.
`,
    "context-pack": `Usage:
  kvdf context-pack create --task task-001 --allowed-files src/api/,tests/api/ --specs docs/spec.md
  kvdf context-pack create --task task-001 --provider openai --model gpt-4 --input-tokens 8000
  kvdf context-pack list
  kvdf context-pack show ctx-001

Notes:
  Context packs keep AI work focused and reviewable before execution. They are stored in .kabeeri/ai_usage/context_packs.json.
`,
    preflight: `Usage:
  kvdf preflight estimate --task task-001
  kvdf preflight estimate --task task-001 --context ctx-001 --provider openai --model gpt-4
  kvdf preflight list
  kvdf preflight show preflight-001

Notes:
  Preflight estimates budget status, risk, model class, split recommendation, and whether approval is required.
`,
    "model-route": `Usage:
  kvdf model-route list
  kvdf model-route recommend --kind implementation --risk medium
  kvdf model-route recommend --kind security_review --risk high

Notes:
  Model routing recommends cheap, balanced, premium, or human-only paths based on task kind and risk.
`,
    handoff: `Usage:
  kvdf handoff package --id handoff-001 --audience owner
  kvdf handoff package --id client-mvp --audience client --output .kabeeri/handoff/client-mvp
  kvdf handoff list
  kvdf handoff show handoff-001

Notes:
  Handoff packages generate business, technical, feature readiness, publish status, AI cost, and roadmap reports from local .kabeeri state.
`,
    security: `Usage:
  kvdf security scan
  kvdf security scan --include app/,routes/,config/
  kvdf security report
  kvdf security report --id security-scan-001 --output .kabeeri/security/security.md
  kvdf security gate
  kvdf security list
  kvdf security show security-scan-001

Notes:
  Security scan is a lightweight KVDF secrets and privacy guard. It stores results in .kabeeri/security/security_scans.json and blocks security gate on critical/high findings.
`,
    migration: `Usage:
  kvdf migration plan --id migration-001 --title "Upgrade schema" --from v1 --to v2 --scope database,migrations --backup backup-2026-05-08 --risk high
  kvdf migration rollback-plan --plan migration-001 --backup backup-2026-05-08 --steps "restore backup,run rollback,verify app"
  kvdf migration check migration-001 --owner-approved
  kvdf migration report migration-001 --output .kabeeri/migrations/migration-001.report.md
  kvdf migration list
  kvdf migration show migration-001
  kvdf migration audit

Notes:
  Migration commands are dry-run governance. They record plans, rollback steps, checks, and audit events without executing database or file migrations.
`,
    dashboard: `Usage:
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

Notes:
  The live dashboard shows multiple customer apps from the current .kabeeri workspace.
  Task tracker JSON is written to .kabeeri/dashboard/task_tracker_state.json and served live at /__kvdf/api/tasks.
  Dashboard UX audit checks action center, source-of-truth notice, live state, role visibility, widget registry, app/workspace strategy, empty states, responsive tables, governance visibility, and common secret leakage.
  Use dashboard workspace add or --workspaces to add summary rows for other KVDF folders that also contain .kabeeri state.
`,
    docs: `Usage:
  kvdf docs open
  kvdf docs serve --port 4188
  kvdf docs serve --port auto --open
  kvdf docs generate
  kvdf docs path
  kvdf docs code

Notes:
  The docs site is served from docs/site and regenerated before open/serve/generate.
  Use docs open for reading the live documentation in the browser.
  Use docs code when you want to edit the docs site source in VS Code.
`,
    vscode: `Usage:
  kvdf vscode scaffold
  kvdf vscode status
`,
    owner: `Usage:
  kvdf owner init --id owner-001 --name "Project Owner"
  kvdf owner login --id owner-001
  kvdf owner status
  kvdf owner logout
  kvdf owner transfer issue --to owner-002 --name "New Owner"
  kvdf owner transfer accept --id owner-transfer-001 --token TRANSFER-SECRET
  kvdf owner transfer list
  kvdf owner transfer revoke --id owner-transfer-001
`,
    developer: `Usage:
  kvdf developer list
  kvdf developer add --id owner-001 --name "Project Owner" --role Owner
  kvdf developer add --id reviewer-001 --name "QA Reviewer" --role Reviewer --workstreams qa,security
  kvdf developer solo --id dev-main --name "Main Developer"
  kvdf developer owner-developer --id owner-001 --name "Project Owner"

Notes:
  Human developer identities can own, maintain, review, or view governed work depending on role.
  Solo mode configures one full-stack developer across all standard workstreams without disabling app boundaries or policy gates.
`,
    agent: `Usage:
  kvdf agent list
  kvdf agent add --id agent-001 --name "AI Backend Agent" --role "AI Developer" --workstreams backend
  kvdf agent add --id agent-002 --name "AI Integration Agent" --role "AI Developer" --workstreams backend,docs,integrations

Notes:
  Workstreams restrict task assignment. Cross-workstream tasks must be created as --type integration.
`,
    release: `Usage:
  kvdf release check --version v4.0.0
  kvdf release gate --version v4.0.0
  kvdf release publish-gate --version v4.0.0
  kvdf release notes --version v4.0.0 --output RELEASE_NOTES.md
  kvdf release checklist --version v4.0.0 --output RELEASE_CHECKLIST.md
  kvdf release publish --version v4.0.0 --confirm

Notes:
  Confirmed publishing must pass release_policy and github_write_policy before any gh release command runs.
`,
    design: `Usage:
  kvdf design list
  kvdf design add --id design-source-001 --type figma --location "https://figma.com/file/..." --owner "Client" --use "Checkout page" --mode manual
  kvdf design show design-source-001
  kvdf design snapshot design-source-001 --reference "figma-export-v1" --captured-by designer-001 --checksum abc123
  kvdf design spec-create --source design-source-001 --title "Checkout page" --output frontend_specs/checkout.page.md
  kvdf design spec-list
  kvdf design spec-approve text-spec-001 --tokens design_system/tokens.json --actor owner-001
  kvdf design reference-list
  kvdf design reference-show ADMIT-ADB01
  kvdf design reference-recommend "admin ecommerce dashboard with orders and revenue"
  kvdf design reference-questions ADMIT-ADB02
  kvdf design reference-tasks ADMIT-ADB02 --scope "ecommerce admin dashboard"
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
  kvdf design missing-report --source design-source-001 --items responsive,empty-state --risk high
  kvdf design approve design-source-001 --spec frontend_specs/checkout.page.md --tokens design_system/tokens.json --actor owner-001
  kvdf design reject design-source-001 --reason "Source is outdated" --actor owner-001
  kvdf design audit
  kvdf design audit design-source-001

Notes:
  Raw design links, images, PDFs, and reference websites are inputs only. Frontend implementation is blocked until a source has a snapshot and an approved text spec. UI/UX references are approved learning/spec patterns used to ask better questions and generate governed design tasks, not to copy third-party assets. Frontend verification should also have a passing visual review. Design governance reports summarize sources, specs, tokens, page specs, components, visual evidence, UI advisor context, and next actions.
`,
    github: `Usage:
  kvdf github issue sync --version v4.0.0 --dry-run
  kvdf github issue sync --version v4.0.0 --confirm
  kvdf github label sync --version v4.0.0 --confirm
  kvdf github milestone sync --version v4.0.0 --confirm
`,
    wordpress: `Usage:
  kvdf wordpress analyze --path . --staging --backup
  kvdf wordpress plan "Build a WordPress corporate website" --type corporate --mode new
  kvdf wordpress plan "Improve existing WooCommerce store checkout" --type woocommerce --mode existing
  kvdf wordpress tasks --plan wordpress-plan-001
  kvdf wordpress plugin plan "Build a booking plugin" --name "Clinic Booking"
  kvdf wordpress plugin tasks --plan wordpress-plugin-plan-001
  kvdf wordpress plugin scaffold --name "Clinic Booking"
  kvdf wordpress plugin checklist woocommerce
  kvdf wordpress scaffold plugin --name "Clinic Booking"
  kvdf wordpress scaffold theme --name "Acme Theme"
  kvdf wordpress scaffold child-theme --name "Acme Child" --parent twentytwentyfour
  kvdf wordpress checklist woocommerce

Notes:
  WordPress support is a governed capability for building from scratch or adopting an existing site. It uses the WordPress prompt pack, product blueprints, UI/Data Design guidance, security checks, and task governance. It never edits WordPress core paths such as wp-admin or wp-includes.
`
  };
  console.log(help[command] || `No detailed help for "${command}". Run kvdf --help.`);
}

function table(headers, rows) {
  const values = [headers, ...rows].map((row) => row.map((item) => String(item ?? "")));
  const widths = headers.map((_, index) => Math.max(...values.map((row) => row[index].length)));
  return values.map((row, rowIndex) => {
    const line = row.map((cell, index) => cell.padEnd(widths[index])).join("  ");
    if (rowIndex === 0) {
      const separator = widths.map((width) => "-".repeat(width)).join("  ");
      return `${line}\n${separator}`;
    }
    return line;
  }).join("\n");
}

function printHelp() {
  console.log(`Kabeeri VDF CLI

Usage:
  kvdf <command> [action] [options]

Commands:
  init                         Create local .kabeeri workspace state
  doctor                       Show environment and repository status
  validate [scope]             Validate repo JSON, plans, and workspace state
  generator list|show|create   List, show, or scaffold generator profiles
  create --profile <name>      Shortcut for generator create
  prompt-pack list|show|export List, show, export, or compose prompt packs
  wordpress analyze|plan|scaffold
                               Build or adopt WordPress sites safely
  example list|show <profile>  List or show example profiles
  questionnaire list|status    Inspect questionnaire files
  vibe suggest|ask|capture     Convert natural language into governed suggestions
  capability list|show|map     Inspect v5 system capability map
  structure map|validate       Inspect and validate repository foldering
  blueprint list|recommend     Map product type to modules, pages, data, and risks
  data-design context|checklist Guide database modeling and review
  evolution plan|status        Govern Kabeeri framework updates and dependent tasks
  plan list|show <version>     Inspect v3/v4 milestone plans
  project analyze              Analyze an existing app for KVDF adoption
  release check|notes|checklist Generate release review artifacts
  delivery recommend|choose    Recommend Agile or Structured delivery mode
  structured health|phase      Manage Structured/Waterfall delivery runtime
  agile backlog|epic|story|sprint
                               Manage Agile templates as runtime records
  sprint create|list|summary    Manage agile sprints and sprint cost summaries
  session start|end|list|show   Track AI Developer sessions and handoffs
  task list|create|status      Manage local .kabeeri tasks
  workstream list|show|add     Manage workstream runtime boundaries
  app list|create|status       Manage customer app usernames and public routes
  feature list|create|status   Manage business feature readiness
  journey list|create|status   Manage business user journeys
  acceptance list|create       Manage local acceptance records
  audit list|report            Inspect and export audit events
  memory add|list|summary      Manage v5 project memory records
  adr create|list|report       Track architecture decision records
  ai-run record|accept|report  Track AI prompt run quality and waste
  owner init|login|status|logout
                               Configure and use local Owner sessions
  owner transfer issue|accept|list|revoke
                               Transfer single Owner authority with one-use tokens
  developer list|add           Manage human developer identities
  agent list|add               Manage AI Developer identities
  lock list|create|release     Manage local locks
  vscode scaffold|status       Generate VS Code workspace task helpers
  docs open|serve|code         Open or serve the documentation site
  dashboard generate|export|serve
                               Generate or view local dashboard
  reports live                 Refresh derived live report JSON state
  package check|guide          Validate product packaging readiness
  upgrade check|guide          Inspect workspace upgrade compatibility
  readiness report             Export independent readiness status reports
  governance report            Export independent governance status reports
  token list|issue|revoke      Manage local task access token records
  budget approve|list|revoke   Manage over-budget usage approvals
  pricing set|list|show        Manage AI pricing rules
  usage record|admin|inquiry   Track task and non-task AI token usage and cost
  policy list|show|evaluate    Evaluate governance policies and approval gates
  context-pack create|list      Generate focused task context packs
  preflight estimate|list       Estimate AI cost and approval needs before execution
  model-route list|recommend    Recommend AI model class by task kind and risk
  handoff package|list          Generate client and Owner handoff report packages
  security scan|report|gate     Scan for secrets and enforce security readiness
  migration plan|check|report   Govern migration safety and rollback readiness
  github plan|label|milestone|issue
                               Dry-run by default; use --confirm to write through gh
  design list|add|snapshot|approve|audit
                               Govern design sources before frontend implementation

Examples:
  kvdf init --profile standard --mode structured
  kvdf init --profile standard --goal "Build ecommerce store with Laravel backend and Next.js frontend"
  kvdf validate
  kvdf validate runtime-schemas
  kvdf reports live --json
  kvdf readiness report --output .kabeeri/reports/readiness_report.md
  kvdf governance report --output .kabeeri/reports/governance_report.md
  kvdf prompt-pack list
  kvdf wordpress plan "Build a WordPress company website"
  kvdf wordpress plugin plan "Create a WooCommerce checkout add-on" --name "Checkout Addon"
  kvdf wordpress analyze --path existing-wordpress --staging --backup
  kvdf wordpress scaffold plugin --name "Business Features"
  kvdf docs open
  kvdf docs serve --port auto --open
  kvdf create --profile lite --output my-project
  kvdf generate --profile standard --output my-project
  kvdf prompt-pack export react --output my-project/07_AI_CODE_PROMPTS/react
  kvdf prompt-pack compose react --task task-001 --output .kabeeri/prompt_layer/task-001.react.md
  kvdf sprint create --id sprint-001 --name "Sprint 1"
  kvdf session start --task task-001 --developer agent-001 --provider openai --model gpt-4
  kvdf task create --title "Define checkout flow" --workstream backend
  kvdf app create --username acme --name "ACME Portal"
  kvdf feature create --title "Public signup" --readiness needs_review
  kvdf journey create --name "Signup journey" --steps Landing,Signup,Welcome
  kvdf questionnaire answer entry.project_type --value saas
  kvdf questionnaire coverage
  kvdf capability list
  kvdf structure map
  kvdf structure validate
  kvdf blueprint recommend "Build ecommerce store with payments shipping and mobile app"
  kvdf data-design context ecommerce --json
  kvdf evolution plan "Add a new Kabeeri capability"
  kvdf project analyze --path existing-app
  kvdf task start task-001 --actor agent-001
  kvdf owner init --id owner-001 --name "Project Owner"
  kvdf owner transfer issue --to owner-002 --name "New Owner"
  kvdf token issue --task task-001 --assignee agent-001
  kvdf pricing set --provider openai --model gpt-4 --unit 1M --input 5 --output 15 --cached 1
  kvdf usage record --task task-001 --developer agent-001 --input-tokens 1000 --output-tokens 500 --cost 0.25
  kvdf usage report --output usage-report.md
  kvdf usage efficiency
  kvdf memory add --type decision --text "Use PostgreSQL"
  kvdf adr create --title "Use PostgreSQL" --context "Relational data" --decision "Use PostgreSQL for v1"
  kvdf ai-run record --task task-001 --developer agent-001 --provider openai --model gpt-4 --input-tokens 1000 --output-tokens 500
  kvdf design add --type figma --location "https://figma.com/file/..." --use "Checkout"
  kvdf design recommend ecommerce --json
  kvdf design framework-adapters
  kvdf design framework-plan bootstrap --blueprint erp --composition crud_table_workspace --json
  kvdf design ui-questions ecommerce --json
  kvdf design ui-decisions ecommerce --page checkout --json
  kvdf design playbooks
  kvdf design playbook erp --json
  kvdf design variant-archetypes
  kvdf design variants ecommerce --page checkout --count 3 --json
  kvdf design ui-checklist
  kvdf design ui-review "news article page with semantic HTML structured data responsive accessibility loading empty error"
  kvdf design audit
  kvdf github issue sync --version v4.0.0 --dry-run
  kvdf vscode scaffold
  kvdf github issue sync --version v4.0.0 --confirm
  kvdf release notes --version v4.0.0 --output RELEASE_NOTES.md
`);
}

module.exports = { parseArgs, table, printHelp, printCommandHelp, normalizeCommandName };
