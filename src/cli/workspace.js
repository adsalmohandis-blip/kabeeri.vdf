const fs = require("fs");
const path = require("path");
const { repoRoot, fileExists, readJsonFile, writeJsonFile } = require("./fs_utils");

function getStateDir() {
  return ".kabeeri";
}

function ensureWorkspace() {
  if (!fileExists(getStateDir())) {
    throw new Error("No .kabeeri workspace found. Run `kvdf init` first.");
  }
}

function createWorkspace({ profile, mode, lang }) {
  const root = repoRoot();
  const stateDir = path.join(root, getStateDir());
  fs.mkdirSync(stateDir, { recursive: true });
  fs.mkdirSync(path.join(stateDir, "dashboard"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "github"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "ai_usage"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "questionnaires"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "memory"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "adr"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "ai_runs"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "policies"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "events"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "approvals"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "migrations"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "security"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "handoff"), { recursive: true });
  fs.mkdirSync(path.join(stateDir, "reports"), { recursive: true });

  const files = [
    ["project.json", {
      framework: "Kabeeri VDF",
      profile,
      delivery_mode: mode,
      language: lang,
      version: "0.1.0",
      created_at: new Date().toISOString()
    }],
    ["tasks.json", { tasks: [] }],
    ["customer_apps.json", { apps: [] }],
    ["features.json", { features: [] }],
    ["journeys.json", { journeys: [] }],
    ["version_compatibility.json", { created_with_version: "0.1.0", current_engine_version: "0.1.0", compatibility_status: "current", migration_required: false, last_migration: null }],
    ["migration_state.json", { phase: "none", pending_migration: null, last_migration: null, rollback_available: false, migration_risks: [] }],
    ["sprints.json", { sprints: [] }],
    ["sessions.json", { sessions: [] }],
    ["developers.json", { developers: [] }],
    ["agents.json", { agents: [] }],
    ["owner_auth.json", { configured: false }],
    ["owner_transfer_tokens.json", { tokens: [] }],
    ["session.json", { active: false }],
    ["locks.json", { locks: [] }],
    ["acceptance.json", { records: [] }],
    ["tokens.json", { tokens: [] }],
    ["questionnaires/answers.json", { answers: [] }],
    ["questionnaires/answer_sources.json", { sources: [] }],
    ["questionnaires/completion_state.json", { groups: {}, areas: {} }],
    ["questionnaires/coverage_matrix.json", { generated_at: null, areas: [] }],
    ["questionnaires/missing_answers_report.json", { generated_at: null, missing: [] }],
    ["dashboard/technical_state.json", { generated_at: null, source: ".kabeeri", sections: {} }],
    ["dashboard/business_state.json", { generated_at: null, source: ".kabeeri", sections: {} }],
    ["github/sync_config.json", { dry_run_default: true, write_requires_confirmation: true }],
    ["github/issue_map.json", { tasks: [], conflicts: [] }],
    ["ai_usage/usage_summary.json", { total_events: 0, total_tokens: 0, total_cost: 0 }],
    ["ai_usage/pricing_rules.json", { currency: "USD", providers: [] }],
    ["ai_usage/budget_approvals.json", { approvals: [] }],
    ["ai_usage/cost_breakdown.json", { by_task: {}, by_developer: {}, by_workstream: {}, by_provider: {} }]
  ];

  const created = [];
  for (const [relative, data] of files) {
    const target = path.join(getStateDir(), relative).replace(/\\/g, "/");
    if (fileExists(target)) {
      created.push({ path: target, status: "exists" });
      continue;
    }
    writeJsonFile(target, data);
    created.push({ path: target, status: "created" });
  }

  const auditFile = path.join(stateDir, "audit_log.jsonl");
  if (!fs.existsSync(auditFile)) {
    fs.writeFileSync(auditFile, "", "utf8");
    created.push({ path: ".kabeeri/audit_log.jsonl", status: "created" });
  } else {
    created.push({ path: ".kabeeri/audit_log.jsonl", status: "exists" });
  }

  const usageEventsFile = path.join(stateDir, "ai_usage", "usage_events.jsonl");
  if (!fs.existsSync(usageEventsFile)) {
    fs.writeFileSync(usageEventsFile, "", "utf8");
    created.push({ path: ".kabeeri/ai_usage/usage_events.jsonl", status: "created" });
  } else {
    created.push({ path: ".kabeeri/ai_usage/usage_events.jsonl", status: "exists" });
  }

  for (const relative of [
    "memory/decisions.jsonl",
    "memory/assumptions.jsonl",
    "memory/constraints.jsonl",
    "memory/risks.jsonl",
    "memory/deferred_features.jsonl",
    "ai_runs/prompt_runs.jsonl",
    "ai_runs/accepted_runs.jsonl",
    "ai_runs/rejected_runs.jsonl",
    "events/event_log.jsonl",
    "approvals/approval_log.jsonl"
  ]) {
    const target = path.join(stateDir, relative);
    if (!fs.existsSync(target)) {
      fs.writeFileSync(target, "", "utf8");
      created.push({ path: `.kabeeri/${relative}`, status: "created" });
    } else {
      created.push({ path: `.kabeeri/${relative}`, status: "exists" });
    }
  }

  return created;
}

module.exports = {
  createWorkspace,
  ensureWorkspace,
  getStateDir,
  readJsonFile,
  writeJsonFile
};
