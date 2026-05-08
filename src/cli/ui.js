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
    profule: "profile",
    profil: "profile"
  };
  return aliases[key] || key;
}

function normalizeCommandName(command) {
  const aliases = {
    tasks: "task",
    t: "task",
    features: "feature",
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
    capabilities: "capability",
    cap: "capability",
    dash: "dashboard",
    board: "dashboard",
    costs: "usage",
    cost: "usage",
    budgets: "budget",
    price: "pricing"
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
`,
    task: `Usage:
  kvdf task create --title "Task title" --workstream backend
  kvdf task create --title "Integration task" --type integration --workstreams backend,public_frontend
  kvdf task list
  kvdf task status task-001
  kvdf task approve task-001
  kvdf task assign task-001 --assignee agent-001
  kvdf task start task-001 --actor agent-001
  kvdf task review task-001 --actor reviewer-001
  kvdf task verify task-001 --owner owner-001
`,
    feature: `Usage:
  kvdf feature create --title "Public signup" --readiness needs_review --tasks task-001
  kvdf feature status feature-001 --readiness ready_to_demo
  kvdf feature list
  kvdf feature show feature-001
`,
    app: `Usage:
  kvdf app create --username acme --name "ACME Portal"
  kvdf app list
  kvdf app show acme
  kvdf app status acme --status ready_to_publish

Public routes always use username:
  /customer/apps/acme
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
  kvdf questionnaire answer entry.project_type --value saas
  kvdf questionnaire answer entry.has_users --value yes
  kvdf questionnaire coverage
  kvdf questionnaire missing
  kvdf questionnaire generate-tasks
`,
    capability: `Usage:
  kvdf capability list
  kvdf capability show payments_billing
  kvdf capability map
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
    token: `Usage:
  kvdf token issue --task task-001 --assignee agent-001
  kvdf token issue --task task-001 --assignee agent-001 --allowed-files src/api/ --forbidden-files .env
  kvdf token issue --task task-001 --assignee agent-001 --max-cost 10 --budget-approval-required
  kvdf token list
  kvdf token revoke task-token-001
  kvdf token reissue task-token-001 --max-usage-tokens 200 --reason "Rework only"
`,
    budget: `Usage:
  kvdf budget approve --task task-001 --tokens 5000 --reason "Owner approved extra work"
  kvdf budget approve --task task-001 --cost 5
  kvdf budget list
  kvdf budget revoke budget-approval-001
`,
    dashboard: `Usage:
  kvdf dashboard generate
  kvdf dashboard state
  kvdf dashboard export
  kvdf dashboard export --output .kabeeri/site/index.html --dashboard-output .kabeeri/site/__kvdf/dashboard/index.html
  kvdf dashboard serve --port 4177
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
    github: `Usage:
  kvdf github issue sync --version v4.0.0 --dry-run
  kvdf github issue sync --version v4.0.0 --confirm
  kvdf github label sync --version v4.0.0 --confirm
  kvdf github milestone sync --version v4.0.0 --confirm
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
  prompt-pack list|show|export List, show, or export prompt packs
  example list|show <profile>  List or show example profiles
  questionnaire list|status    Inspect questionnaire files
  capability list|show|map     Inspect v5 system capability map
  plan list|show <version>     Inspect v3/v4 milestone plans
  release check|notes|checklist Generate release review artifacts
  sprint create|list|summary    Manage agile sprints and sprint cost summaries
  session start|end|list|show   Track AI Developer sessions and handoffs
  task list|create|status      Manage local .kabeeri tasks
  app list|create|status       Manage customer app usernames and public routes
  feature list|create|status   Manage business feature readiness
  journey list|create|status   Manage business user journeys
  acceptance list|create       Manage local acceptance records
  audit list|report            Inspect and export audit events
  memory add|list|summary      Manage v5 project memory records
  owner init|login|status|logout
                               Configure and use local Owner sessions
  owner transfer issue|accept|list|revoke
                               Transfer single Owner authority with one-use tokens
  developer list|add           Manage human developer identities
  agent list|add               Manage AI Developer identities
  lock list|create|release     Manage local locks
  vscode scaffold|status       Generate VS Code workspace task helpers
  dashboard generate|export|serve
                               Generate or view local dashboard
  token list|issue|revoke      Manage local task access token records
  budget approve|list|revoke   Manage over-budget usage approvals
  pricing set|list|show        Manage AI pricing rules
  usage record|list|summary    Track AI token usage and cost
  github plan|label|milestone|issue
                               Dry-run by default; use --confirm to write through gh

Examples:
  kvdf init --profile standard --mode structured
  kvdf validate
  kvdf prompt-pack list
  kvdf create --profile lite --output my-project
  kvdf generate --profile standard --output my-project
  kvdf prompt-pack export react --output my-project/07_AI_CODE_PROMPTS/react
  kvdf sprint create --id sprint-001 --name "Sprint 1"
  kvdf session start --task task-001 --developer agent-001 --provider openai --model gpt-4
  kvdf task create --title "Define checkout flow" --workstream backend
  kvdf app create --username acme --name "ACME Portal"
  kvdf feature create --title "Public signup" --readiness needs_review
  kvdf journey create --name "Signup journey" --steps Landing,Signup,Welcome
  kvdf questionnaire answer entry.project_type --value saas
  kvdf questionnaire coverage
  kvdf capability list
  kvdf task start task-001 --actor agent-001
  kvdf owner init --id owner-001 --name "Project Owner"
  kvdf owner transfer issue --to owner-002 --name "New Owner"
  kvdf token issue --task task-001 --assignee agent-001
  kvdf pricing set --provider openai --model gpt-4 --unit 1M --input 5 --output 15 --cached 1
  kvdf usage record --task task-001 --developer agent-001 --input-tokens 1000 --output-tokens 500 --cost 0.25
  kvdf usage report --output usage-report.md
  kvdf usage efficiency
  kvdf memory add --type decision --text "Use PostgreSQL"
  kvdf github issue sync --version v4.0.0 --dry-run
  kvdf vscode scaffold
  kvdf github issue sync --version v4.0.0 --confirm
  kvdf release notes --version v4.0.0 --output RELEASE_NOTES.md
`);
}

module.exports = { parseArgs, table, printHelp, printCommandHelp, normalizeCommandName };
