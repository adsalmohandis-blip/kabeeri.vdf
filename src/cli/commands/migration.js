const fs = require("fs");
const path = require("path");

const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { fileExists, repoRoot, writeTextFile } = require("../fs_utils");
const { table } = require("../ui");

const VERSION = require("../../../package.json").version;

function migration(action, value, flags = {}, deps = {}) {
  ensureWorkspace();
  ensureMigrationState();
  const requireAnyRole = deps.requireAnyRole || (() => {});
  const getEffectiveActor = deps.getEffectiveActor || (() => null);
  const appendAudit = deps.appendAudit || (() => {});

  if (!action || action === "list") {
    const plans = readStateArray(".kabeeri/migrations/migration_plans.json", "plans");
    console.log(table(["Plan", "Status", "From", "To", "Risk", "Rollback"], plans.map((item) => [
      item.plan_id,
      item.status,
      item.from_version || "",
      item.to_version || "",
      item.risk_level,
      item.rollback_plan_id || ""
    ])));
    return;
  }

  if (action === "show") {
    const id = flags.id || value;
    if (!id) throw new Error("Missing migration plan id.");
    const plan = getMigrationPlan(id);
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  if (action === "plan") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "create migration plan");
    const plansFile = ".kabeeri/migrations/migration_plans.json";
    const data = readJsonFile(plansFile);
    data.plans = data.plans || [];
    const id = flags.id || `migration-plan-${String(data.plans.length + 1).padStart(3, "0")}`;
    if (data.plans.some((item) => item.plan_id === id)) throw new Error(`Migration plan already exists: ${id}`);
    const plan = {
      plan_id: id,
      title: flags.title || value || id,
      status: "planned",
      from_version: flags.from || flags["from-version"] || "",
      to_version: flags.to || flags["to-version"] || "",
      scope: parseCsv(flags.scope || flags.files),
      reason: flags.reason || "",
      risk_level: normalizeMigrationRisk(flags.risk || inferMigrationRisk(flags)),
      backup_reference: flags.backup || flags["backup-reference"] || "",
      rollback_plan_id: null,
      dry_run_required: flags["dry-run-required"] !== "false",
      owner_approval_required: flags["owner-approval-required"] !== "false",
      created_by: getEffectiveActor(flags) || "local-cli",
      created_at: new Date().toISOString()
    };
    data.plans.push(plan);
    writeJsonFile(plansFile, data);
    updateMigrationState({ phase: "planned", pending_migration: id, rollback_available: false, migration_risks: [plan.risk_level] });
    writeTextFile(`.kabeeri/migrations/${id}.plan.md`, buildMigrationPlanMarkdown(plan));
    appendMigrationAudit("migration.plan.created", id, `Migration plan created: ${plan.title}`);
    appendAudit("migration.plan.created", "migration", id, `Migration plan created: ${plan.title}`);
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  if (action === "rollback-plan" || action === "rollback") {
    requireAnyRole(flags, ["Owner", "Maintainer"], "create rollback plan");
    const planId = flags.plan || value;
    if (!planId) throw new Error("Missing --plan.");
    const plan = getMigrationPlan(planId);
    const file = ".kabeeri/migrations/rollback_plans.json";
    const data = readJsonFile(file);
    data.rollback_plans = data.rollback_plans || [];
    const id = flags.id || `rollback-plan-${String(data.rollback_plans.length + 1).padStart(3, "0")}`;
    if (data.rollback_plans.some((item) => item.rollback_plan_id === id)) throw new Error(`Rollback plan already exists: ${id}`);
    const rollback = {
      rollback_plan_id: id,
      plan_id: planId,
      status: "planned",
      backup_reference: flags.backup || flags["backup-reference"] || plan.backup_reference || "",
      steps: parseCsv(flags.steps || "restore backup,run rollback migrations,verify application,record audit result"),
      verification: parseCsv(flags.verify || flags.verification || "tests pass,owner reviews critical paths"),
      created_by: getEffectiveActor(flags) || "local-cli",
      created_at: new Date().toISOString()
    };
    data.rollback_plans.push(rollback);
    writeJsonFile(file, data);
    linkRollbackPlan(planId, id, rollback.backup_reference);
    updateMigrationState({ rollback_available: true });
    writeTextFile(`.kabeeri/migrations/${id}.rollback.md`, buildRollbackPlanMarkdown(rollback));
    appendMigrationAudit("migration.rollback_plan.created", planId, `Rollback plan created: ${id}`);
    appendAudit("migration.rollback_plan.created", "migration", planId, `Rollback plan created: ${id}`);
    console.log(JSON.stringify(rollback, null, 2));
    return;
  }

  if (action === "check" || action === "dry-run") {
    const planId = flags.plan || value;
    if (!planId) throw new Error("Missing migration plan id.");
    const plan = getMigrationPlan(planId);
    const rollback = plan.rollback_plan_id ? getRollbackPlan(plan.rollback_plan_id) : null;
    const result = evaluateMigrationPlan(plan, rollback, flags);
    const file = ".kabeeri/migrations/migration_checks.json";
    const data = readJsonFile(file);
    data.checks = data.checks || [];
    data.checks.push(result);
    writeJsonFile(file, data);
    updateMigrationPlanStatus(planId, result.status === "blocked" ? "blocked" : "checked");
    updateMigrationState({ phase: result.status === "blocked" ? "blocked" : "checked", pending_migration: planId, migration_risks: result.warnings.map((item) => item.check_id) });
    appendMigrationAudit("migration.check", planId, `Migration check: ${result.status}`);
    appendAudit("migration.check", "migration", planId, `Migration check: ${result.status}`);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (action === "report") {
    const planId = flags.plan || value;
    if (!planId) throw new Error("Missing migration plan id.");
    const plan = getMigrationPlan(planId);
    const rollback = plan.rollback_plan_id ? getRollbackPlan(plan.rollback_plan_id) : null;
    const checks = readStateArray(".kabeeri/migrations/migration_checks.json", "checks").filter((item) => item.plan_id === planId);
    const output = flags.output || `.kabeeri/migrations/${planId}.migration_report.md`;
    writeTextFile(output, buildMigrationReport(plan, rollback, checks));
    appendMigrationAudit("migration.report", planId, `Migration report written: ${output}`);
    appendAudit("migration.report", "migration", planId, `Migration report written: ${output}`);
    console.log(`Wrote migration report: ${output}`);
    return;
  }

  if (action === "audit") {
    const events = readJsonFile(".kabeeri/migrations/migration_audit.json").events || [];
    console.log(table(["Time", "Event", "Plan", "Message"], events.map((item) => [item.timestamp, item.event, item.plan_id, item.message])));
    return;
  }

  throw new Error(`Unknown migration action: ${action}`);
}

function ensureMigrationState() {
  fs.mkdirSync(path.join(repoRoot(), ".kabeeri", "migrations"), { recursive: true });
  if (!fileExists(".kabeeri/migrations/migration_plans.json")) writeJsonFile(".kabeeri/migrations/migration_plans.json", { plans: [] });
  if (!fileExists(".kabeeri/migrations/rollback_plans.json")) writeJsonFile(".kabeeri/migrations/rollback_plans.json", { rollback_plans: [] });
  if (!fileExists(".kabeeri/migrations/migration_checks.json")) writeJsonFile(".kabeeri/migrations/migration_checks.json", { checks: [] });
  if (!fileExists(".kabeeri/migrations/migration_audit.json")) writeJsonFile(".kabeeri/migrations/migration_audit.json", { events: [] });
  if (!fileExists(".kabeeri/migration_state.json")) writeJsonFile(".kabeeri/migration_state.json", { phase: "none", pending_migration: null, last_migration: null, rollback_available: false, migration_risks: [] });
  if (!fileExists(".kabeeri/version_compatibility.json")) writeJsonFile(".kabeeri/version_compatibility.json", { created_with_version: VERSION, current_engine_version: VERSION, compatibility_status: "current", migration_required: false, last_migration: null });
}

function normalizeMigrationRisk(value) {
  const normalized = String(value || "medium").toLowerCase();
  const allowed = new Set(["low", "medium", "high", "critical"]);
  if (!allowed.has(normalized)) throw new Error("Invalid migration risk. Use low, medium, high, or critical.");
  return normalized;
}

function inferMigrationRisk(flags) {
  const text = `${flags.scope || ""} ${flags.files || ""} ${flags.title || ""}`.toLowerCase();
  if (/database|migration|schema|payment|stripe|production|auth|permission|role|tenant/.test(text)) return "high";
  return "medium";
}

function getMigrationPlan(id) {
  const plan = readStateArray(".kabeeri/migrations/migration_plans.json", "plans").find((item) => item.plan_id === id);
  if (!plan) throw new Error(`Migration plan not found: ${id}`);
  return plan;
}

function getRollbackPlan(id) {
  const rollback = readStateArray(".kabeeri/migrations/rollback_plans.json", "rollback_plans").find((item) => item.rollback_plan_id === id);
  if (!rollback) throw new Error(`Rollback plan not found: ${id}`);
  return rollback;
}

function linkRollbackPlan(planId, rollbackPlanId, backupReference) {
  const file = ".kabeeri/migrations/migration_plans.json";
  const data = readJsonFile(file);
  const plan = (data.plans || []).find((item) => item.plan_id === planId);
  if (!plan) throw new Error(`Migration plan not found: ${planId}`);
  plan.rollback_plan_id = rollbackPlanId;
  if (backupReference) plan.backup_reference = backupReference;
  plan.updated_at = new Date().toISOString();
  writeJsonFile(file, data);
}

function updateMigrationPlanStatus(planId, status) {
  const file = ".kabeeri/migrations/migration_plans.json";
  const data = readJsonFile(file);
  const plan = (data.plans || []).find((item) => item.plan_id === planId);
  if (!plan) throw new Error(`Migration plan not found: ${planId}`);
  plan.status = status;
  plan.updated_at = new Date().toISOString();
  writeJsonFile(file, data);
}

function updateMigrationState(patch) {
  const file = ".kabeeri/migration_state.json";
  const current = fileExists(file) ? readJsonFile(file) : {};
  writeJsonFile(file, { ...current, ...patch, updated_at: new Date().toISOString() });
  const compatibilityFile = ".kabeeri/version_compatibility.json";
  const compatibility = fileExists(compatibilityFile) ? readJsonFile(compatibilityFile) : {};
  writeJsonFile(compatibilityFile, {
    created_with_version: compatibility.created_with_version || VERSION,
    current_engine_version: VERSION,
    compatibility_status: patch.pending_migration ? "migration_pending" : compatibility.compatibility_status || "current",
    migration_required: Boolean(patch.pending_migration || compatibility.migration_required),
    last_migration: compatibility.last_migration || null,
    updated_at: new Date().toISOString()
  });
}

function evaluateMigrationPlan(plan, rollback, flags = {}) {
  const checks = [];
  const add = (check_id, severity, passed, message) => checks.push({ check_id, severity, result: passed ? "pass" : severity === "warn" ? "warn" : "fail", message });
  add("backup_reference_present", "fail", Boolean(plan.backup_reference || flags.backup), "Migration must record a backup reference.");
  add("rollback_plan_present", "fail", Boolean(rollback), "Migration must have a rollback plan.");
  add("scope_present", "fail", (plan.scope || []).length > 0, "Migration scope must list files, folders, database areas, or version areas.");
  add("reason_present", "warn", Boolean(plan.reason), "Migration should explain why the change is needed.");
  add("dry_run_required", "warn", plan.dry_run_required !== false, "Dry-run should remain required unless Owner approves otherwise.");
  add("high_risk_owner_approval", "fail", !["high", "critical"].includes(plan.risk_level) || Boolean(flags.approved || flags["owner-approved"]), "High/critical migrations require Owner approval evidence.");
  const blockers = checks.filter((item) => item.result === "fail" && item.severity === "fail");
  const warnings = checks.filter((item) => item.result === "warn");
  return {
    check_id: flags.id || `migration-check-${Date.now()}`,
    plan_id: plan.plan_id,
    generated_at: new Date().toISOString(),
    status: blockers.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "pass",
    blockers,
    warnings,
    checks,
    dry_run: true,
    note: "KVDF migration check is a governance dry-run. It does not execute database or file migrations."
  };
}

function appendMigrationAudit(event, planId, message) {
  const file = ".kabeeri/migrations/migration_audit.json";
  const data = fileExists(file) ? readJsonFile(file) : { events: [] };
  data.events = data.events || [];
  data.events.push({ timestamp: new Date().toISOString(), event, plan_id: planId, message });
  writeJsonFile(file, data);
}

function buildMigrationPlanMarkdown(plan) {
  return `# Migration Plan - ${plan.plan_id}

Title: ${plan.title}
Status: ${plan.status}
From version: ${plan.from_version || "not recorded"}
To version: ${plan.to_version || "not recorded"}
Risk: ${plan.risk_level}

## Scope

${(plan.scope || []).length ? plan.scope.map((item) => `- ${item}`).join("\n") : "- No scope recorded."}

## Reason

${plan.reason || "No reason recorded."}

## Safety Requirements

- Backup reference: ${plan.backup_reference || "missing"}
- Rollback plan: ${plan.rollback_plan_id || "missing"}
- Dry-run required: ${plan.dry_run_required}
- Owner approval required: ${plan.owner_approval_required}
`;
}

function buildRollbackPlanMarkdown(rollback) {
  return `# Rollback Plan - ${rollback.rollback_plan_id}

Migration plan: ${rollback.plan_id}
Backup reference: ${rollback.backup_reference || "missing"}

## Steps

${(rollback.steps || []).map((item) => `- ${item}`).join("\n")}

## Verification

${(rollback.verification || []).map((item) => `- ${item}`).join("\n")}
`;
}

function buildMigrationReport(plan, rollback, checks) {
  const latest = checks.length ? checks[checks.length - 1] : null;
  return `# Migration Safety Report - ${plan.plan_id}

## Summary

- Title: ${plan.title}
- Status: ${plan.status}
- Risk: ${plan.risk_level}
- From version: ${plan.from_version || "not recorded"}
- To version: ${plan.to_version || "not recorded"}
- Backup reference: ${plan.backup_reference || "missing"}
- Rollback plan: ${plan.rollback_plan_id || "missing"}
- Latest check: ${latest ? latest.status : "not checked"}

## Scope

${(plan.scope || []).length ? plan.scope.map((item) => `- ${item}`).join("\n") : "- No scope recorded."}

## Latest Check Findings

${latest ? latest.checks.map((item) => `- ${item.result}: ${item.check_id} - ${item.message}`).join("\n") : "- No checks recorded."}

## Rollback

${rollback ? (rollback.steps || []).map((item) => `- ${item}`).join("\n") : "- No rollback plan recorded."}

## Note

This report is a KVDF governance artifact. It does not execute migrations.
`;
}

function latestMigrationChecks() {
  const checks = readStateArray(".kabeeri/migrations/migration_checks.json", "checks");
  const latest = new Map();
  for (const item of checks) latest.set(item.plan_id, item);
  return [...latest.values()];
}

function readStateArray(file, key) {
  if (!fileExists(file)) return [];
  const data = readJsonFile(file);
  return Array.isArray(data[key]) ? data[key] : [];
}

function parseCsv(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(parseCsv);
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

module.exports = {
  migration,
  getMigrationPlan,
  latestMigrationChecks
};
