const path = require("path");
const { readJsonFile, writeJsonFile } = require("../workspace");
const { fileExists, repoRoot } = require("../fs_utils");
const { table } = require("../ui");
const { collectDashboardState, writeDashboardStateFiles } = require("./dashboard_state");

function dashboard(action, value, flags = {}, deps = {}) {
  const {
    ensureWorkspace,
    collectDashboardState: collectState = collectDashboardState,
    writeDashboardStateFiles: writeStateFiles = writeDashboardStateFiles,
    appendAudit,
    writeTextFile,
    buildClientHomeHtml,
    buildDashboardHtml,
    exportCustomerAppPages,
    serveSite,
    summarizeWorkspaceRoot
  } = deps;
  ensureWorkspace();
  if (action === "workspace" || action === "workspaces") {
    return dashboardWorkspace(value, flags, { appendAudit, summarizeWorkspaceRoot });
  }
  if (action === "ux" || action === "ux-audit" || action === "audit-ux") {
    return dashboardUxAudit(flags, {
      collectDashboardState: collectState,
      writeDashboardStateFiles: writeStateFiles,
      buildDashboardHtml,
      appendAudit,
      writeTextFile
    });
  }

  if (!action || action === "generate") {
    writeStateFiles(collectState(flags));
    appendAudit("dashboard.generated", "dashboard", "local", "Dashboard state generated");
    console.log("Generated dashboard state files.");
    return;
  }

  if (action === "export") {
    writeStateFiles(collectState(flags));
    appendAudit("dashboard.generated", "dashboard", "local", "Dashboard state generated");
    const output = flags.output || ".kabeeri/site/index.html";
    const dashboardOutput = flags["dashboard-output"] || ".kabeeri/site/__kvdf/dashboard/index.html";
    writeTextFile(output, buildClientHomeHtml());
    writeTextFile(dashboardOutput, buildDashboardHtml(flags));
    exportCustomerAppPages();
    console.log(`Wrote customer page: ${output}`);
    console.log(`Wrote private dashboard: ${dashboardOutput}`);
    return;
  }

  if (action === "state" || action === "api") {
    const state = collectState(flags);
    writeStateFiles(state);
    console.log(JSON.stringify(state, null, 2));
    return;
  }

  if (["task-tracker", "tasks", "tracker", "task-state"].includes(action)) {
    const state = collectState(flags);
    writeStateFiles(state);
    console.log(JSON.stringify(state.task_tracker, null, 2));
    return;
  }

  if (action === "serve") {
    dashboard("export", null, flags, deps);
    return serveSite(flags.port || 4177, flags, deps);
  }

  throw new Error(`Unknown dashboard action: ${action}`);
}

function dashboardUxAudit(flags = {}, deps = {}) {
  const { buildDashboardHtml, appendAudit, collectDashboardState: collectState = collectDashboardState, writeDashboardStateFiles: writeStateFiles = writeDashboardStateFiles } = deps;
  const state = collectState(flags);
  writeStateFiles(state);
  const html = buildDashboardHtml();
  const audit = evaluateDashboardUx(state, html);
  const file = ".kabeeri/dashboard/ux_audits.json";
  if (!fileExists(file)) writeJsonFile(file, { audits: [] });
  const data = readJsonFile(file);
  data.audits = data.audits || [];
  data.audits.push(audit);
  writeJsonFile(file, data);
  const output = flags.output || ".kabeeri/reports/dashboard_ux_report.md";
  deps.writeTextFile(output, buildDashboardUxReport(audit));
  appendAudit("dashboard.ux_audited", "dashboard", audit.audit_id, `Dashboard UX audit: ${audit.status}`);
  if (flags.json) console.log(JSON.stringify(audit, null, 2));
  else console.log(`Dashboard UX audit ${audit.audit_id}: ${audit.status} (${audit.score}/${audit.max_score})`);
}

function evaluateDashboardUx(state, html) {
  const checks = [];
  const push = (id, status, message, weight = 1) => checks.push({ id, status, message, weight });
  const technical = state.technical || {};
  const business = state.business || {};
  const records = state.records || {};
  const blockers = buildDashboardActionItems(state).filter((item) => item.severity === "blocker");
  const warnings = buildDashboardActionItems(state).filter((item) => item.severity === "warning");

  push("source_of_truth_notice", html.includes(".kabeeri is the source of truth"), "Dashboard states that .kabeeri remains the source of truth.");
  push("action_center", html.includes("Action Center") && html.includes("Next Action"), "Dashboard has a top action center for resume decisions.", 2);
  push("live_status", html.includes("/__kvdf/api/state") && html.includes("live-status"), "Dashboard exposes live API status.");
  push("responsive_tables", html.includes("table-wrap") && html.includes("overflow-x: auto"), "Tables are wrapped for small screens.");
  push("empty_states", html.includes("empty-state"), "Empty tables render a readable empty state.");
  push("workspace_boundary", html.includes("App Boundary Governance") && html.includes("KVDF Workspaces"), "Dashboard separates app boundaries from linked workspaces.");
  push("dashboard_ux_governance", html.includes("Dashboard UX Governance") && html.includes("Widget Registry"), "Dashboard renders its own UX governance model.", 2);
  push("role_visibility", html.includes("Role Visibility") && html.includes("Owner") && html.includes("AI Agent"), "Dashboard documents role-based widget visibility.", 2);
  push("dashboard_controls", html.includes("app-filter") && html.includes("role-filter") && html.includes("view-preset") && html.includes("app-drilldown") && html.includes("Dashboard Controls"), "Dashboard exposes app, role, saved view, and app drilldown controls.");
  push("multi_app_multi_workspace_strategy", html.includes("same-product apps") && html.includes("Linked KVDF workspaces"), "Dashboard explains same-workspace apps versus separate KVDF workspaces.", 2);
  push("live_state_ux_rules", html.includes("Stale data policy") && html.includes("poll the live API"), "Dashboard explains live refresh and stale/static export behavior.");
  push("workstream_governance", html.includes("Workstream Governance") && html.includes("Workstreams"), "Dashboard shows workstream governance and scoped execution boundaries.");
  push("governance_visibility", html.includes("Policy Results") && html.includes("Security Scans") && html.includes("Migration Safety"), "Dashboard shows key governance blockers.", 2);
  push("cost_visibility", html.includes("AI Usage by Task") && html.includes("Tracked vs Untracked AI Usage"), "Dashboard shows tracked and untracked AI usage.");
  push("vibe_visibility", html.includes("Vibe-first Suggestions") && html.includes("Post-work Captures"), "Dashboard shows Vibe suggestions and post-work captures.");
  push("agile_visibility", html.includes("Agile Backlog and Stories"), "Dashboard shows Agile stories and reviews.");
  push("no_common_secret_patterns", !/(sk_live_|sk_test_|ghp_|BEGIN PRIVATE KEY|AWS_SECRET_ACCESS_KEY)/.test(html), "Dashboard HTML does not contain common secret patterns.", 2);
  push("business_summary", Number(business.tasks_total || 0) >= 0 && Array.isArray(records.tasks || []), "Dashboard state includes business task summary.");
  push("technical_summary", Boolean(technical.ai_usage && technical.tasks), "Dashboard state includes technical task and AI usage summaries.");

  const maxScore = checks.reduce((sum, check) => sum + check.weight, 0);
  const score = checks.filter((check) => check.status).reduce((sum, check) => sum + check.weight, 0);
  const failed = checks.filter((check) => !check.status);
  return {
    audit_id: `dashboard-ux-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`,
    audited_at: new Date().toISOString(),
    status: failed.some((check) => check.weight >= 2) || blockers.length ? "needs_attention" : "pass",
    score,
    max_score: maxScore,
    action_items: buildDashboardActionItems(state),
    blockers: blockers.length,
    warnings: warnings.length,
    checks
  };
}

function buildDashboardUxReport(audit) {
  const lines = [
    `# Dashboard UX Governance Report - ${audit.audit_id}`,
    "",
    `- Status: ${audit.status}`,
    `- Score: ${audit.score}/${audit.max_score}`,
    `- Audited at: ${audit.audited_at}`,
    "",
    "## Action Items",
    "",
    "| Severity | Area | Message | Next Action |",
    "| --- | --- | --- | --- |",
    ...(audit.action_items.length ? audit.action_items.map((item) => `| ${item.severity} | ${item.area} | ${item.message} | ${item.next_action} |`) : ["| info | dashboard | No immediate dashboard actions found. | Continue normal validation. |"]),
    "",
    "## Checks",
    "",
    "| Check | Status | Message |",
    "| --- | --- | --- |",
    ...audit.checks.map((check) => `| ${check.id} | ${check.status ? "pass" : "fail"} | ${check.message} |`)
  ];
  return `${lines.join("\n")}\n`;
}

function buildDashboardActionItems(state) {
  const technical = state.technical || {};
  const business = state.business || {};
  const records = state.records || {};
  const items = [];
  const add = (severity, area, message, nextAction) => items.push({ severity, area, message, next_action: nextAction });
  const activeLocks = technical.active_locks || [];
  const activeTokens = technical.active_tokens || [];
  const policyBlocks = Object.entries(technical.policies || {}).filter(([status]) => status === "blocked").reduce((sum, [, count]) => sum + count, 0);
  const securityBlocks = Object.entries(technical.security_scans || {}).filter(([status]) => status === "blocked").reduce((sum, [, count]) => sum + count, 0);
  const migrationBlocks = business.migration_blocks || 0;
  const untracked = technical.ai_usage && technical.ai_usage.tracked_vs_untracked ? technical.ai_usage.tracked_vs_untracked.untracked : null;
  const openCaptures = (records.vibe_captures || []).filter((item) => ["captured", "linked", "converted_to_task"].includes(item.status || ""));
  const readyStories = ((records.agile && records.agile.stories) || []).filter((item) => item.ready_status === "ready" && !item.task_id);
  const proposedHighImpactAdrs = (records.adrs || []).filter((item) => item.status === "proposed" && ["critical", "high"].includes(item.impact || ""));
  const aiRunWasteSignals = records.ai_run_report && records.ai_run_report.waste_signals ? records.ai_run_report.waste_signals : [];
  const evolutionOpen = records.evolution_summary ? records.evolution_summary.open_follow_up_tasks || 0 : 0;

  if (policyBlocks) add("blocker", "policy", `${policyBlocks} policy result(s) are blocked.`, "Run `kvdf policy status` and resolve or record an Owner override.");
  if (securityBlocks) add("blocker", "security", `${securityBlocks} security scan(s) are blocked.`, "Run `kvdf security report` and remove high-risk findings.");
  if (migrationBlocks) add("blocker", "migration", `${migrationBlocks} migration safety check(s) are blocked.`, "Run `kvdf migration audit` before release or publish.");
  if (proposedHighImpactAdrs.length) add("warning", "ADR", `${proposedHighImpactAdrs.length} high-impact ADR(s) still need approval.`, "Run `kvdf adr list` and approve, reject, or supersede the decision.");
  if (aiRunWasteSignals.length) add("warning", "AI run history", `${aiRunWasteSignals.length} AI run waste signal(s) need review.`, "Run `kvdf ai-run report` and accept or reject unreviewed runs.");
  if (openCaptures.length) add("warning", "post-work capture", `${openCaptures.length} capture(s) need review.`, "Run `kvdf capture list` and link, convert, or resolve captures.");
  if (evolutionOpen) add("warning", "Evolution Steward", `${evolutionOpen} framework update follow-up task(s) are still open.`, "Run `kvdf evolution status` before treating the Kabeeri update as complete.");
  if (readyStories.length) add("info", "agile", `${readyStories.length} ready Agile stor(ies) are not tasks yet.`, "Run `kvdf agile story task <story-id>` for committed work.");
  if (activeLocks.length) add("info", "locks", `${activeLocks.length} active lock(s).`, "Review `kvdf lock list` before assigning overlapping work.");
  if (activeTokens.length) add("info", "tokens", `${activeTokens.length} active task token(s).`, "Review token scope and expiry before continuing AI sessions.");
  if (untracked && untracked.cost > 0) add("warning", "ai cost", `Untracked AI cost is ${untracked.cost}.`, "Run `kvdf usage summary` and attach usage to tasks where possible.");
  if (!items.length) add("info", "dashboard", "No immediate blockers found.", "Continue with the next governed task.");
  return items;
}

function dashboardWorkspace(action, flags = {}, deps = {}) {
  const { appendAudit = () => {}, summarizeWorkspaceRoot = () => false } = deps;
  const file = ".kabeeri/dashboard/workspaces.json";
  if (!fileExists(file)) writeJsonFile(file, { workspaces: [] });
  const data = readJsonFile(file);
  data.workspaces = data.workspaces || [];

  if (!action || action === "list") {
    console.log(table(["Name", "Path", "Status"], data.workspaces.map((item) => [
      item.name || path.basename(item.path || ""),
      item.path,
      summarizeWorkspaceRoot(item.path, false) ? "ok" : "missing"
    ])));
    return;
  }

  if (action === "add" || action === "link") {
    const workspacePath = flags.path || flags.root || flags.workspace;
    if (!workspacePath) throw new Error("Missing --path.");
    const resolved = path.resolve(repoRoot(), workspacePath);
    if (!summarizeWorkspaceRoot(resolved, false)) throw new Error(`Linked path is not a KVDF workspace: ${resolved}`);
    if (data.workspaces.some((item) => path.resolve(repoRoot(), item.path) === resolved)) {
      throw new Error(`Dashboard workspace already linked: ${resolved}`);
    }
    data.workspaces.push({
      name: flags.name || path.basename(resolved),
      path: resolved,
      linked_at: new Date().toISOString()
    });
    writeJsonFile(file, data);
    appendAudit("dashboard.workspace.linked", "dashboard", resolved, `Linked dashboard workspace: ${resolved}`);
    console.log(`Linked dashboard workspace: ${resolved}`);
    return;
  }

  if (action === "remove" || action === "unlink") {
    const workspacePath = flags.path || flags.root || flags.workspace || flags.name;
    if (!workspacePath) throw new Error("Missing --path.");
    const resolved = path.resolve(repoRoot(), workspacePath);
    const before = data.workspaces.length;
    data.workspaces = data.workspaces.filter((item) => path.resolve(repoRoot(), item.path) !== resolved && item.name !== workspacePath);
    writeJsonFile(file, data);
    console.log(before === data.workspaces.length ? "No dashboard workspace removed." : `Unlinked dashboard workspace: ${workspacePath}`);
    return;
  }

  throw new Error(`Unknown dashboard workspace action: ${action}`);
}

module.exports = {
  dashboard,
  buildDashboardActionItems
};
