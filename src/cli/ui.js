const fs = require("fs");
const path = require("path");
const { readJsonFile, repoRoot } = require("./fs_utils");

function getActiveTrackSurface() {
  const file = path.join(repoRoot(), ".kabeeri", "session_track.json");
  if (!fs.existsSync(file)) return null;
  try {
    const state = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!state || !state.active) return null;
    if (state.active_track === "framework_owner") return "owner";
    if (state.active_track === "vibe_app_developer") return "developer";
  } catch {
    return null;
  }
  return null;
}

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
    start: "entry",
    "start-here": "entry",
    resume: "resume",
    boundary: "guard",
    conflicts: "conflict",
    scan: "conflict",
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
    "source-package": "source-package",
    source_package: "source-package",
    sourcepackage: "source-package",
    company_profile: "company-profile",
    news_website: "news-website",
    ecommerce_mobile_app: "ecommerce-mobile-app",
    generate: "generator",
    "software-design": "software-design",
    "software_design": "software-design",
    "software-design-reference": "software-design",
    softwaredesign: "software-design",
    "docs-generator": "docs-generator",
    docs_generator: "docs-generator",
    docsgenerator: "docs-generator",
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
    multiai: "multi-ai",
    multi_ai: "multi-ai",
    dash: "dashboard",
    board: "dashboard",
    report: "reports",
    costs: "usage",
    cost: "usage",
    budgets: "budget",
    price: "pricing",
    contract: "contract",
    operator: "contract",
    "ai-contract": "contract",
    designs: "design",
    adrs: "adr",
    airun: "ai-run",
    "ai-runs": "ai-run",
    "design-source": "design",
    "design-sources": "design",
    policies: "policy",
    gates: "policy",
    "cost-control": "cost-control",
    cost_control: "cost-control",
    context: "context-pack",
    contexts: "context-pack",
    "context-packs": "context-pack",
    "team-sync": "sync",
    routes: "model-route",
    routing: "model-route",
    handoffs: "handoff",
    secure: "security",
    securefiles: "security",
    migrate: "migration",
    migrations: "migration"
  };
  return aliases[command] || command;
}

function printCommandHelp(command) {
  const help = {
  resume: `Usage:
  kvdf resume
  kvdf resume --json
  kvdf resume --scan
  kvdf start
  kvdf entry
  kvdf track status
  kvdf track route
  kvdf onboarding

  Notes:
  Resume is the safe first command for a new AI/developer session. It detects whether the current folder is Kabeeri framework source, a user application workspace, or an application folder without .kabeeri state. It also separates the app npm root from the Kabeeri engine root to avoid Next.js/npm confusion and shows the primary track for the session. Use entry/start when you want Kabeeri to auto-route the session into the correct track without asking you to choose.
`,
    entry: `Usage:
  kvdf entry
  kvdf entry --json
  kvdf start

Notes:
  Entry is the automatic session routing command. It detects the active track and returns the framework-owner or vibe app-developer path immediately without asking the human to choose first.
`,
    track: `Usage:
  kvdf track status
  kvdf track status --json
  kvdf track route
  kvdf track route --json

Notes:
  Track shows the current session track and the route that would be activated for the current workspace. Use route to persist the current entry decision into .kabeeri/session_track.json.
`,
    onboarding: `Usage:
  kvdf onboarding
  kvdf onboarding report
  kvdf onboarding --json

Notes:
  Onboarding shows the guided first-session route for the current workspace. It summarizes the safe opening steps, the enter/route/resume sequence, commands, guardrails, and a persisted session onboarding report for framework-owner or app-developer work.
`,
    guard: `Usage:
  kvdf guard
  kvdf guard status
  kvdf guard status --json
  kvdf guard status --allow-framework-edits

Notes:
  Guard checks whether the current folder is Kabeeri framework source or a user workspace. In user workspaces it blocks accidental framework-internal edits unless an explicit override is provided.
`,
    conflict: `Usage:
  kvdf conflict scan
  kvdf conflict scan --json
  kvdf conflict status

Notes:
  Conflict scan is the pre-development drift check. It verifies CLI router/help alignment, framework guard wiring, core/runtime schema validation, and local workspace task/capture/session/lock conflicts before new framework work starts.
`,
    generator: `Usage:
  kvdf generate --profile lite --output my-project
  kvdf generate --profile standard --output my-project
  kvdf generate --profile enterprise --output my-project
  kvdf generator create lite --output my-project

Notes:
  Generators create governed project scaffolds and intake artifacts. Use generate for the short entry path and generator for the full command surface.
`,
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
  kvdf task packet
  kvdf task packet --json
  kvdf task executor-contract
  kvdf task executor-contract --json
  kvdf task batch-run
  kvdf task batch-run --mode dry-run
  kvdf task batch-run --mode review
  kvdf task batch-run --mode execute
    kvdf task assessment task-001
    kvdf task assessment --goal "Build checkout API"
    kvdf task coverage task-001
    kvdf task coverage
    kvdf task lifecycle task-001
    kvdf task lifecycle
    kvdf trace report --json
    kvdf trace status
    kvdf change report --json
    kvdf risk report
    kvdf task memory task-001
  kvdf task approve task-001
  kvdf task assign task-001 --assignee agent-001
  kvdf task start task-001 --actor agent-001
  kvdf task review task-001 --actor reviewer-001
    kvdf task verify task-001 --owner owner-001
  kvdf task complete task-001 --owner owner-001
  kvdf task trash list
  kvdf task trash show task-001
  kvdf task trash restore task-001
  kvdf task trash purge
`,
    contract: `Usage:
  kvdf contract
  kvdf contract --json
  kvdf contract pipeline
  kvdf contract task-packet

Notes:
  Contract shows the shared operating model for AI and CLI work: AI reasons over current state, CLI validates and writes state, and filesystem artifacts remain the source of truth. Use it when you want the current next exact action, the command registry, the pipeline contract, and the architecture or track boundary view in one place.
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
  Governance reports are standalone snapshots from .kabeeri. They summarize Owner identity, workstreams, assignment health, lock conflicts, active task tokens, policy blockers, workspace governance validation, and a governance coverage view for trust, safety, privacy, compliance, and extensibility.
`,
    reports: `Usage:
  kvdf reports live
  kvdf reports live --json
  kvdf reports blocked
  kvdf reports blocked --json
  kvdf reports state
  kvdf reports show readiness
  kvdf reports show governance
  kvdf reports show task_tracker

Notes:
  Live reports write .kabeeri/reports/live_reports_state.json as a small derived JSON state for Codex, dashboard widgets, VS Code views, and automation. \`reports blocked\` writes .kabeeri/reports/blocked_scenarios_report.json so blocked or invalid scenarios can be read in one place. Markdown reports remain human-readable snapshots; live JSON is the fast-changing operational surface.
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
  kvdf evolution priorities
  kvdf evolution next
  kvdf evolution roadmap
  kvdf evolution partition
  kvdf evolution scorecards [--materialize]
  kvdf evolution report
  kvdf evolution batch-exe
  kvdf batch-exe
  kvdf plugins status
  kvdf plugins install kvdf-dev
  kvdf plugins enable kvdf-dev
  kvdf plugins uninstall kvdf-dev
  kvdf plugins disable kvdf-dev
  kvdf company-profile status|init|questionnaire|brief|design|modules|tasks|approve|report
  kvdf news-website status|init|questionnaire|brief|design|modules|tasks|approve|report
  kvdf blog status|init|questionnaire|brief|design|modules|tasks|approve|report
  kvdf ecommerce-mobile-app status|init|questionnaire|brief|design|modules|tasks|approve|report
  kvdf crm status|init|questionnaire|brief|design|modules|tasks|approve|report
  kvdf pos status|init|questionnaire|brief|design|modules|tasks|approve|report
  kvdf ecommerce status|init|questionnaire|brief|design|modules|tasks|approve|report
  kvdf booking status|init|questionnaire|brief|design|modules|tasks|approve|report
  kvdf evolution defer "Future idea"
  kvdf evolution deferred
  kvdf evolution deferred restore deferred-001 --confirm-placement --priority-position 8
  kvdf evolution priority evo-auto-001 --status in_progress --note "Working now"
  kvdf evolution show evo-001
  kvdf evolution tasks evo-001
  kvdf evolution impact evo-001
  kvdf evolution verify evo-001

Notes:
  Evolution Steward is the single framework-development backlog. It records requested framework changes, keeps ordered development priorities, exposes the seven-step KVDF restructure roadmap and the capability partition matrix, emits resumable execution reports for each priority, stores deferred development ideas as one final bucket, checks for possible duplicate capabilities, creates follow-up tasks for runtime, CLI, docs, schemas, tests, dashboards, reports, and capabilities, and exposes the update state to dashboard/live reports.
  Use batch-exe to print the next governed execution queue for approved and ready tasks in priority order without losing track of blockers or stop conditions.
  The plugin loader exposes removable bundles such as kvdf-dev and keeps install/enable/uninstall/disable state under .kabeeri/plugins.json.
  Framework-owner sessions use this track to move from resume to priorities, placement confirmation, temp slices, sync, validation, and verification.
`,
    "batch-exe": `Usage:
  kvdf batch-exe
  kvdf batch-exe --json
  kvdf batch-exe --statuses approved,ready
  kvdf evolution batch-exe

Notes:
  Batch execution prints a governed execution queue for ready or approved tasks in priority order, auto-assigns missing EVO assignees to the active Multi-AI leader or codex fallback, and stops at blockers, scope conflicts, or explicit STOP instructions. It stores a durable batch report under .kabeeri/reports/evolution_batch_execution.json so the AI can resume without rereading chat.
`,
    "multi-ai": `Usage:
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
  kvdf schedule route task-001 --to agent --agent agent-001
  kvdf schedule route task-001 --to deferred

Notes:
Multi-AI Governance keeps Evolution as the global priority governor, gives the first active AI entry Leader orchestration status, stores agent hub entries and leader leases with heartbeat and call tracking, can sync and distribute the active Evolution temporary queue across workers, advances queue slices through a durable lifecycle, and records semantic merge bundles with semantic surface plans so several AI tools can work from the same repo without trampling each other. The Leader does not execute by default; execution requires explicit Owner delegation for a scoped slice. If the Leader disappears or stops answering calls, the hub promotes the next active agent after the lease rules are exceeded.
  kvdf multi-ai agent next --ai <agent-id> --count <n> lets a worker claim the next available Evolution priorities in order, so AI tools can pull from the live priority list instead of waiting for a manual task handoff.
The conversation relay layer is separate from leader calls: use it for durable agent-to-agent messages, inboxes, replies, and closing threads without relying on chat history.
`,
    schedule: `Usage:
  kvdf schedule status
  kvdf schedule route task-001 --to temp
  kvdf schedule route task-001 --to trash
  kvdf schedule route task-001 --to restore
  kvdf schedule route task-001 --to agent --agent agent-001
  kvdf schedule route task-001 --to deferred
  kvdf schedule history

Notes:
  Task Scheduler is the orchestration layer for task movement across tasks, temp queues, trash, deferred routes, and agent handoffs. It records every route decision, reuses the temp queue and trash systems for actual moves, and keeps a durable route history so the next session can resume the same movement state without reconstructing intent from chat.
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
  pipeline: `Usage:
  kvdf pipeline matrix
  kvdf pipeline strict [--task task-001]
  kvdf pipeline check task-packet --task task-001

Notes:
  Pipeline enforcement renders the exact guard condition, state file, and failure message for each stage from delivery selection through task packet, executor contract, batch execution, verification, and completion. Pass --task to inspect a specific task path for token, lock, traceability, verification, or archive readiness.
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
  kvdf session replay session-001
  kvdf session replay --json

Notes:
  Governed AI sessions require task assignment, an active task token, and lock coverage for edited files. Replay loads the saved session trace, task memory, and archive state so you can continue the last line of work without rereading chat.
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

Developer app workspaces:
  kvdf app workspace create --slug storefront-web --name "Storefront Web" --type frontend
  kvdf app workspace list
  kvdf app workspace show storefront-web
  kvdf app workspace validate storefront-web
  kvdf app workspace scorecards storefront-web

Public routes always use username:
  /customer/apps/storefront

  Notes:
  App Boundary Governance allows multiple apps inside one KVDF workspace only when they belong to the same product.
  Developer app workspaces live under workspaces/apps/<app-slug>/ with local .kabeeri state, a strict workspace contract, tests/docs/package metadata, and workspace scorecards.
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
  kvdf questionnaire review
  kvdf questionnaire approve --confirm
  kvdf questionnaire answer entry.project_type --value saas
  kvdf questionnaire answer entry.has_users --value yes
  kvdf questionnaire coverage
  kvdf questionnaire missing
  kvdf questionnaire generate-tasks

Notes:
  Questionnaire planning uses Product Blueprints, framework prompt packs, Data Design, UI/UX Advisor, and Delivery Mode Advisor to generate focused developer questions before task generation. The resulting planning pack is fail-closed until it is reviewed with \`kvdf questionnaire review\` and approved with \`kvdf questionnaire approve --confirm\`. It also recommends a short prompt-pack path and compact guidance so the next AI step stays small and task-specific.
`,
    capability: `Usage:
  kvdf capability list
  kvdf capability show payments_billing
  kvdf capability map
  kvdf capability registry
  kvdf capability registry payments_billing
  kvdf capability registry map
  kvdf capability surface
  kvdf capability matrix
  kvdf capability search

Notes:
  Capability mapping turns project answers into the 53 standard system areas and their activation states. Capability registry exposes the same areas as named, traceable units with owner/workstream and source mapping.
  Capability surface maps those same areas to discoverable CLI command families and docs references.
  Capability matrix adds the docs, CLI, runtime, tests, and report links for every capability in one traceable table.
  Capability search lets you filter the registry, surface, matrix, and roadmap views by track, capability, command, phase, and report type.
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
      traceability: `Usage:
    kvdf trace report
    kvdf trace status
    kvdf trace show
    kvdf trace list

  Notes:
    Traceability ties tasks, assessments, ADRs, AI runs, docs, and test evidence together so every change can be traced end to end.
  `,
      "change-control": `Usage:
    kvdf change report
    kvdf change status
    kvdf risk report
    kvdf risk status

  Notes:
    Change control consolidates structured change requests, evolution changes, and risk register entries so high-risk work can be reviewed before release or handoff.
  `,
      "ai-run": `Usage:
    kvdf ai-run record --task task-001 --developer agent-001 --provider openai --model gpt-4 --input-tokens 1000 --output-tokens 500 --summary "Implemented endpoint"
  kvdf ai-run list
  kvdf ai-run show ai-run-001
  kvdf ai-run accept ai-run-001 --reviewer reviewer-001 --evidence tests-pass
  kvdf ai-run reject ai-run-001 --reason "Wrong scope"
  kvdf ai-run link ai-run-001 --adr adr-001
  kvdf ai-run provenance --json
  kvdf ai-run report
  kvdf ai-run report --json

Notes:
  AI run history records prompt quality and accepted/rejected outputs. Provenance links AI runs to usage events, post-work captures, and audit events. Usage remains the cost ledger, and sessions remain execution boundary records. Link important runs to ADRs so durable decisions keep their AI evidence.
`,
    "prompt-pack": `Usage:
  kvdf prompt-pack list
  kvdf prompt-pack show react
  kvdf prompt-pack common
  kvdf prompt-pack export react --output my-project/07_AI_CODE_PROMPTS/react
  kvdf prompt-pack use vue --output my-project/07_AI_CODE_PROMPTS/vue
  kvdf prompt-pack compose react --task task-001
  kvdf prompt-pack compose react --task task-001 --context ctx-001 --output .kabeeri/prompt_layer/task-001.react.md
  kvdf prompt-pack scale --profile enterprise --goal "Build a hospital ERP"
  kvdf prompt-pack compositions
  kvdf prompt-pack composition-show prompt-composition-001
  kvdf prompt-pack validate react

Notes:
  compose merges prompt_packs/common, the selected stack prompt, task scope, acceptance criteria, compact guidance, and an optional context pack into one reviewable prompt.
  scale recommends large-system prompt bundles for enterprise, regulated, and high-risk projects so Kabeeri can route a richer context pack before implementation.
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
    "cost-control": `Usage:
  kvdf cost-control --help
  kvdf cost-control summary
  kvdf cost-control report --output usage-report.md
  kvdf cost-control context-pack create --task task-001 --allowed-files src/api/
  kvdf cost-control preflight estimate --task task-001
  kvdf cost-control model-route recommend --kind implementation --risk medium

Notes:
  Cost-control is the umbrella surface for usage accounting, budget guardrails, context packs, preflight estimation, and model routing. Use it to see token pressure, budget approvals, and routing advice from one place.
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
  Control-plane commands:
  - Use task packet to compile a durable packet from vibe intake, questionnaire answers, briefs, modules, and task state before any executor starts work.
  - Use task batch-run with --mode dry-run or --mode review when you want packet-only or packet-plus-contract previews.

  Executor commands:
  - Use task executor-contract to show the packet-only AI boundary, allowed files, and forbidden actions before implementation starts.
  - Use task batch-run --mode execute to start approved or ready tasks in governed priority order, auto-assign missing tasks to the active Multi-AI leader or codex fallback, and stop on blockers without losing the queue.

  Dashboard UX audit checks action center, source-of-truth notice, live state, role visibility, widget registry, app/workspace strategy, empty states, responsive tables, governance visibility, and common secret leakage.
  Use dashboard workspace add or --workspaces to add summary rows for other KVDF folders that also contain .kabeeri state.
`,
    docs: `Usage:
  kvdf docs open
  kvdf docs serve --port 4188
  kvdf docs serve --port auto --open
  kvdf docs generate
  kvdf docs build
  kvdf docs preview
  kvdf docs sync
  kvdf docs workflow
  kvdf docs manifest
  kvdf docs contracts
  kvdf docs coverage
  kvdf docs validate
  kvdf docs path
  kvdf docs code

Notes:
  The docs site is served from docs/site and regenerated before open/serve/generate.
  Use docs open for reading the live documentation in the browser.
  Use docs build, preview, and sync as CLI-first aliases for the docs publishing lifecycle.
  Use docs workflow to inspect the template catalog, manifest, page contracts, and validation steps as one resumable report.
  Use docs manifest and docs contracts to inspect the generated site manifest and page contracts.
  Use docs coverage to inspect deep publishing coverage for the site families.
  Use docs validate to check that the generated artifacts stay in sync.
  Use docs code when you want to edit the docs site source in VS Code.
`,
    project: `Usage:
  kvdf project analyze --path <folder>
  kvdf project route --goal "Build a SaaS product"
  kvdf project profile route --goal "Build a SaaS product"
  kvdf project profile status
  kvdf project profile report
  kvdf adopt analyze --path <folder>

Notes:
  Project analyze inspects an existing application for Kabeeri adoption. Project profile routing turns a project goal or current codebase signals into a durable Lite, Standard, or Enterprise profile, recommends delivery mode, and suggests prompt packs plus intake groups before the workspace is created.
`,
    "software-design": `Usage:
  kvdf software-design list
  kvdf software-design index
  kvdf software-design map
  kvdf software-design compare
  kvdf software-design show SOFTWARE_DESIGN_SYSTEM_PATTERNS.md
  kvdf software-design path
  kvdf software-design --json

Notes:
  Software Design System Reference is the permanent Kabeeri home for analyzed software design knowledge imported from source packages. Use it to inspect the durable reference library that future sessions should reuse instead of re-analyzing the source folder.
`,
    "docs-generator": `Usage:
  kvdf docs-generator list
  kvdf docs-generator index
  kvdf docs-generator map
  kvdf docs-generator compare
  kvdf docs-generator show DOCS_GENERATION_REFERENCE.md
  kvdf docs-generator path
  kvdf docs-generator --json

Notes:
  Documentation Generator Reference is the permanent Kabeeri home for reusable project documentation lifecycle knowledge imported from source packages. Use it to inspect the durable lifecycle rules that future Kabeeri projects should reuse.
`,
    "source-package": `Usage:
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

Notes:
  KVDF_New_Features_Docs is treated as a dual-purpose source package: a Software Design System reference library and a project documentation generator system. The CLI surface exposes its study, inventory, destination map, source-capability map, normalization map, and verification state so the package can be redistributed into permanent Kabeeri folders before the source folder is removed. \`cleanup\` previews the decommission path, while \`decommission\` only requests removal approval unless \`--confirm-remove\` is explicitly passed.
`,
    vscode: `Usage:
  kvdf vscode scaffold
  kvdf vscode status
  kvdf vscode report
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
  kvdf github status
  kvdf github report
  kvdf github feedback list
  kvdf github feedback record --type status --subject task-001 --message "Ready for review"
  kvdf github issue sync --version v4.0.0 --dry-run
  kvdf github issue sync --version v4.0.0 --confirm
  kvdf github label sync --version v4.0.0 --confirm
  kvdf github milestone sync --version v4.0.0 --confirm
`,
    sync: `Usage:
  kvdf sync status
  kvdf sync status --json
  kvdf sync status --fetch
  kvdf sync pull
  kvdf sync pull --confirm
  kvdf sync push
  kvdf sync push --confirm

Notes:
  Sync is the GitHub/team coordination preflight. Status is read-only by default. Pull and push are dry-runs unless --confirm is provided, so Kabeeri can warn about stale remote work, local changes, app/team drift, and GitHub feedback counts before touching git remotes.
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
`,
    "company-profile": `Usage:
  kvdf company-profile status
  kvdf company-profile init --mode corporate
  kvdf company-profile questionnaire
  kvdf company-profile brief
  kvdf company-profile design
  kvdf company-profile modules
  kvdf company-profile tasks
  kvdf company-profile approve
  kvdf company-profile report
  kvdf plugins install company-profile
  kvdf plugins uninstall company-profile

Notes:
  Company Profile Builder is a removable app-track plugin for company profile sites. Its live runtime state is stored in .kabeeri/company_profile.json. The runtime pipeline is strict: init, questionnaire, brief, design, modules, tasks, approve, report.
`,
    "news-website": `Usage:
  kvdf news-website status
  kvdf news-website init --mode editorial
  kvdf news-website questionnaire
  kvdf news-website brief
  kvdf news-website design
  kvdf news-website modules
  kvdf news-website tasks
  kvdf news-website approve
  kvdf news-website report
  kvdf plugins install news-website
  kvdf plugins uninstall news-website

Notes:
  News Website Builder is a removable app-track plugin for news and editorial sites. Its live runtime state is stored in .kabeeri/news_website.json. The runtime pipeline is strict: init, questionnaire, brief, design, modules, tasks, approve, report.
`,
    blog: `Usage:
  kvdf blog status
  kvdf blog init --mode personal
  kvdf blog questionnaire
  kvdf blog brief
  kvdf blog design
  kvdf blog modules
  kvdf blog tasks
  kvdf blog approve
  kvdf blog report
  kvdf plugins install blog
  kvdf plugins uninstall blog

Notes:
  Blog Builder is a removable app-track plugin for personal, business, and technical blogs. Its live runtime state is stored in .kabeeri/blog.json. The runtime pipeline is strict: init, questionnaire, brief, design, modules, tasks, approve, report.
`,
    "ecommerce-mobile-app": `Usage:
  kvdf ecommerce-mobile-app status
  kvdf ecommerce-mobile-app init --mode shopping
  kvdf ecommerce-mobile-app questionnaire
  kvdf ecommerce-mobile-app brief
  kvdf ecommerce-mobile-app design
  kvdf ecommerce-mobile-app modules
  kvdf ecommerce-mobile-app tasks
  kvdf ecommerce-mobile-app approve
  kvdf ecommerce-mobile-app report
  kvdf plugins install ecommerce-mobile-app
  kvdf plugins uninstall ecommerce-mobile-app

Notes:
  Ecommerce Mobile App Builder is a removable app-track plugin for mobile commerce apps. Its live runtime state is stored in .kabeeri/ecommerce_mobile_app.json. The runtime pipeline is strict: init, questionnaire, brief, design, modules, tasks, approve, report.
`,
    crm: `Usage:
  kvdf crm status
  kvdf crm init --mode sales
  kvdf crm questionnaire
  kvdf crm brief
  kvdf crm design
  kvdf crm modules
  kvdf crm tasks
  kvdf crm approve
  kvdf crm report
  kvdf plugins install crm
  kvdf plugins uninstall crm

Notes:
  CRM Builder is a removable app-track plugin for customer relationship management systems. Its live runtime state is stored in .kabeeri/crm.json. The runtime pipeline is strict: init, questionnaire, brief, design, modules, tasks, approve, report.
`,
    pos: `Usage:
  kvdf pos status
  kvdf pos init --mode retail
  kvdf pos questionnaire
  kvdf pos brief
  kvdf pos design
  kvdf pos modules
  kvdf pos tasks
  kvdf pos approve
  kvdf pos report
  kvdf plugins install pos
  kvdf plugins uninstall pos

Notes:
  POS Builder is a removable app-track plugin for point-of-sale systems. Its live runtime state is stored in .kabeeri/pos.json. The runtime pipeline is strict: init, questionnaire, brief, design, modules, tasks, approve, report.
`,
    ecommerce: `Usage:
  kvdf ecommerce status
  kvdf ecommerce init --mode store
  kvdf ecommerce questionnaire
  kvdf ecommerce brief
  kvdf ecommerce design
  kvdf ecommerce modules
  kvdf ecommerce tasks
  kvdf ecommerce approve
  kvdf ecommerce report
  kvdf plugins install ecommerce-builder
  kvdf plugins uninstall ecommerce-builder

Notes:
  Ecommerce Builder is a removable app-track plugin for commerce systems. Its live runtime state is stored in .kabeeri/ecommerce.json. The runtime pipeline is strict: init, questionnaire, brief, design, modules, tasks, approve, report.
`,
    booking: `Usage:
  kvdf booking status
  kvdf booking init --mode appointments
  kvdf booking questionnaire
  kvdf booking brief
  kvdf booking design
  kvdf booking modules
  kvdf booking tasks
  kvdf booking approve
  kvdf booking report
  kvdf plugins install booking-builder
  kvdf plugins uninstall booking-builder

Notes:
  Booking Builder is a removable app-track plugin for reservation systems. Its live runtime state is stored in .kabeeri/booking.json. The runtime pipeline is strict: init, questionnaire, brief, design, modules, tasks, approve, report.
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
  const trackSurface = getActiveTrackSurface();
  const sharedCommands = [
    "  init                         Create local .kabeeri workspace state",
    "  doctor                       Show environment and repository status",
    "  resume                       Detect session mode and safe next actions",
    "  start|entry                  Auto-route to the correct track",
    "  track status|route           Inspect or persist the current session track",
    "  pipeline matrix|strict       Show or enforce the strict build pipeline",
    "  contract                     Show the AI/CLI operating contract and command registry",
    "  maintainability              Show the shared-service maintainability scorecard and live state",
    "  onboarding                   Show the guided first-session route and report",
    "  guard                        Check framework boundary before edits",
    "  conflict scan                Scan for command, schema, and workspace logic drift",
    "  validate [scope]             Validate repo JSON, plans, workspace state, docs source-of-truth, historical source clarity, and blocked scenarios",
    "  generator list|show|create   List, show, or scaffold generator profiles",
    "  create --profile <name>      Shortcut for generator create",
    "  prompt-pack list|show|export|scale List, show, export, scale, or compose prompt packs",
    "  schedule status|route|history Orchestrate task movement across temp, trash, deferred, and agents",
    "  plan list|show <version>     Inspect v3/v4 milestone plans",
  "  source-package study|inventory|map|source-map|placement|normalize|compare|verify Inspect the KVDF_New_Features_Docs source package",
    "  docs generate|workflow|manifest|contracts|coverage|validate Manage the docs site generation workflow artifacts",
    "  software-design list|show|index|compare Inspect the permanent software design reference",
    "  docs-generator list|show|index|compare Inspect the permanent docs generator reference",
    "  project analyze|profile|route|report Analyze adoption or route a project profile, prompt packs, and scale packs",
    "  release check|notes|checklist Generate release review artifacts",
    "  delivery recommend|choose    Recommend Agile or Structured delivery mode",
    "  structured health|phase      Manage Structured/Waterfall delivery runtime",
    "  agile backlog|epic|story|sprint Manage Agile templates as runtime records",
    "  sprint create|list|summary    Manage agile sprints and sprint cost summaries",
    "  session start|end|list|show|replay Track AI Developer sessions, replay traces, and handoffs",
    "  task list|create|status|assessment|coverage|lifecycle|complete|trash Manage local .kabeeri tasks, assessments, coverage, and trash",
    "  trace report|status|show|list          Build the end-to-end traceability report for tasks, assessments, ADRs, AI runs, docs, and tests",
    "  change report|status|show|list          Build the change-control report for risks, change requests, and mitigation notes",
    "  workstream list|show|add     Manage workstream runtime boundaries",
    "  multi-ai status|leader|agent|conversation|queue|merge|sync Orchestrate multi-AI governance, leader sessions, queues, and merges",
    "  memory add|list|summary      Manage v5 project memory records",
    "  adr create|list|report       Track architecture decision records",
    "  ai-run record|accept|report  Track AI prompt run quality and waste",
    "  developer list|add           Manage human developer identities",
    "  agent list|add               Manage AI Developer identities",
    "  lock list|create|release     Manage local locks",
    "  dashboard generate|export|serve Generate or view local dashboard",
    "  reports live|blocked         Refresh derived live report JSON state or summarize blockers",
    "  package check|guide          Validate product packaging readiness",
    "  upgrade check|guide          Inspect workspace upgrade compatibility",
    "  readiness report             Export independent readiness status reports",
    "  governance report            Export independent governance status reports",
    "  token list|issue|revoke      Manage local task access token records",
    "  budget approve|list|revoke   Manage over-budget usage approvals",
    "  pricing set|list|show        Manage AI pricing rules",
    "  usage record|admin|inquiry   Track task and non-task AI token usage and cost",
    "  policy list|show|evaluate    Evaluate governance policies and approval gates",
    "  context-pack create|list      Generate focused task context packs",
    "  preflight estimate|list       Estimate AI cost and approval needs before execution",
    "  model-route list|recommend    Recommend AI model class by task kind and risk",
    "  handoff package|list          Generate client and Owner handoff report packages",
    "  security scan|report|gate     Scan for secrets and enforce security readiness",
    "  migration plan|check|report   Govern migration safety and rollback readiness",
    "  github status|report|feedback|plan|label|milestone|issue Dry-run by default; use --confirm to write through gh",
    "  sync status|pull|push         Coordinate local Kabeeri state with git/GitHub and feedback counts",
    "  ecommerce status|init|questionnaire|brief|design|modules|tasks|approve|report Build ecommerce/commerce app plugins",
    "  booking status|init|questionnaire|brief|design|modules|tasks|approve|report Build booking/reservation app plugins",
    "  design list|add|snapshot|approve|audit Govern design sources before frontend implementation"
  ];
  const ownerCommands = [
    "  evolution plan|status|report Govern Kabeeri framework updates and dependent tasks",
    "  plugins status|enable|disable|show Inspect and control removable plugin bundles",
    "  owner init|login|status|logout Configure and use local Owner sessions",
    "  owner session status|close    Inspect or end the active Owner session and revoke docs tokens",
    "  owner docs open|status|close  Issue or revoke the owner docs token gate",
    "  owner transfer issue|accept|list|revoke Transfer single Owner authority with one-use tokens"
  ];
  const developerCommands = [
    "  questionnaire list|status    Inspect questionnaire files",
    "  vibe suggest|ask|capture     Convert natural language into governed suggestions",
    "  capability list|show|map|registry|search Inspect v5 system capability map and registry",
    "  structure map|validate       Inspect and validate repository foldering",
    "  blueprint list|recommend     Map product type to modules, pages, data, and risks",
    "  data-design context|checklist Guide database modeling and review",
    "  wordpress analyze|plan|scaffold Build or adopt WordPress sites safely",
    "  example list|show <profile>  List or show example profiles",
    "  app list|create|status|workspace Manage customer app usernames and developer app workspaces",
    "  feature list|create|status   Manage business feature readiness",
    "  journey list|create|status   Manage business user journeys",
    "  acceptance list|create       Manage local acceptance records",
    "  audit list|report            Inspect and export audit events",
    "  vscode scaffold|status|report Generate VS Code workspace task helpers"
  ];
  const blockedCommands = [
    "  blocked commands are surfaced by help, task status, and validation output",
    "  when a command is blocked, the CLI should explain whether the missing piece is track, plugin, or permission related",
    "  next-command hints should point to the shortest unblocking step"
  ];
  const lines = [
    "Kabeeri VDF CLI",
    "",
    "Usage:",
    "  kvdf <command> [action] [options]",
    "",
    "Shared Commands:",
    ...sharedCommands,
    "",
    ...(trackSurface === "developer" ? [] : ["Owner Track Commands:", ...ownerCommands, ""]),
    ...(trackSurface === "owner" ? [] : ["Developer Track Commands:", ...developerCommands, ""]),
    "",
    "Blocked Command Guidance:",
    ...blockedCommands,
    "",
    "Track Surface:",
    trackSurface ? `  ${trackSurface} session active` : "  Run kvdf entry or kvdf start to activate a track and hide the opposite surface.",
    "",
    "Examples:",
    "  kvdf init --profile standard --mode structured",
    "  kvdf resume",
    "  kvdf guard",
    "  kvdf maintainability",
    "  kvdf conflict scan",
    "  kvdf task create --title \"Define checkout flow\" --workstream backend",
    "  kvdf app workspace create --slug storefront-web --name \"Storefront Web\" --type frontend",
    "  kvdf app workspace validate storefront-web",
    "  kvdf evolution plan \"Add a new Kabeeri capability\"",
    "  kvdf batch-exe",
    "  kvdf multi-ai status",
    "  kvdf sync status"
  ];
  console.log(lines.join("\n"));
}

module.exports = { parseArgs, table, printHelp, printCommandHelp, normalizeCommandName };
