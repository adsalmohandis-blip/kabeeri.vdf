const fs = require("fs");
const path = require("path");

const { fileExists, listDirectories, listFiles, movePath, readJsonFile, readTextFile, repoRoot, writeJsonFile, writeTextFile } = require("../../../src/cli/fs_utils");
const { resolveWorkspaceRoot, summarizeWorkspaceContract, validateDeveloperAppWorkspace } = require("../../../src/cli/services/app_workspace_contract");

const VIBE_MAINTAINER_STATE_JSON_PATH = ".kabeeri/reports/vibe_maintainer_state.json";
const VIBE_MAINTAINER_AUDIT_JSON_PATH = ".kabeeri/reports/vibe_maintainer_audit.json";
const VIBE_MAINTAINER_AUDIT_MD_PATH = "docs/reports/VIBE_MAINTAINER_AUDIT.md";
const VIBE_MAINTAINER_SUMMARY_JSON_PATH = ".kabeeri/reports/vibe_maintainer_summary.json";
const VIBE_MAINTAINER_SUMMARY_MD_PATH = "docs/reports/VIBE_MAINTAINER_SUMMARY.md";
const VIBE_MAINTAINER_INSPECTION_JSON_PATH = ".kabeeri/reports/vibe_maintainer_inspection.json";
const VIBE_MAINTAINER_INSPECTION_MD_PATH = "docs/reports/VIBE_MAINTAINER_INSPECTION.md";
const VIBE_MAINTAINER_RELOCATION_JSON_PATH = ".kabeeri/reports/vibe_maintainer_relocation.json";
const VIBE_MAINTAINER_RELOCATION_MD_PATH = "docs/reports/VIBE_MAINTAINER_RELOCATION.md";

const WORKSPACE_FOLDER_ALIASES = {
  doc: "docs",
  docs_site: "docs",
  documentation: "docs",
  docs: "docs",
  source: "src",
  sources: "src",
  code: "src",
  test: "tests",
  tests: "tests",
  spec: "tests",
  specs: "tests",
  assets: "assets"
};

function command(action, value, flags = {}, rest = [], deps = {}) {
  const selectedAction = normalizeAction(action, value, flags, rest);
  const table = deps.table || defaultTable;
  const ensureWorkspace = deps.ensureWorkspace || (() => {});
  ensureWorkspace();

  if (selectedAction === "status") {
    const state = loadSavedState();
    const audit = loadSavedAudit();
    const summary = loadSavedSummary() || buildVibeMaintainerSummaryReport(audit, state);
    if (flags.json) {
      console.log(JSON.stringify(summary, null, 2));
    } else {
      console.log(renderVibeMaintainerSummaryReport(summary, table));
    }
    return summary;
  }

  if (selectedAction === "fast" || selectedAction === "slow" || selectedAction === "cleanup") {
    const workflowMode = resolveWorkflowMode(selectedAction, flags);
    const report = buildVibeMaintainerAuditReport({
      table
    }, {
      workflow_mode: workflowMode,
      scope: resolveScopeSelection(flags, rest),
      source_action: selectedAction
    });
    persistVibeMaintainerAuditReport(report);
    const summary = buildVibeMaintainerSummaryReport(report, { status: "awaiting_approval", approval_status: "pending" });
    persistVibeMaintainerSummaryReport(summary);
    persistVibeMaintainerState({
      report_type: "vibe_maintainer_state",
      generated_at: new Date().toISOString(),
      status: "awaiting_approval",
      approval_status: "pending",
      workflow_mode: report.workflow_mode,
      scope: report.scope,
      latest_audit_path: VIBE_MAINTAINER_AUDIT_JSON_PATH,
      latest_summary_path: VIBE_MAINTAINER_SUMMARY_JSON_PATH,
      latest_inspection_path: VIBE_MAINTAINER_INSPECTION_JSON_PATH,
      latest_relocation_path: VIBE_MAINTAINER_RELOCATION_JSON_PATH,
      next_exact_action: "kvdf vibe-maintainer approve --confirm"
    });
    if (flags.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(renderVibeMaintainerAuditReport(report, table));
    }
    return report;
  }

  if (selectedAction === "inspect") {
    const workflowMode = resolveWorkflowMode(selectedAction, flags);
    const report = buildVibeMaintainerInspectionReport({
      table
    }, {
      workflow_mode: workflowMode,
      scope: resolveScopeSelection(flags, rest)
    });
    persistVibeMaintainerInspectionReport(report);
    if (flags.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(renderVibeMaintainerInspectionReport(report, table));
    }
    return report;
  }

  if (selectedAction === "report") {
    const audit = loadSavedAudit();
    if (!audit) {
      throw new Error("Vibe Maintainer report blocked: run `kvdf vibe-maintainer cleanup` first.");
    }
    const state = loadSavedState();
    const summary = buildVibeMaintainerSummaryReport(audit, state);
    persistVibeMaintainerSummaryReport(summary);
    if (flags.json) {
      console.log(JSON.stringify(summary, null, 2));
    } else {
      console.log(renderVibeMaintainerSummaryReport(summary, table));
    }
    return summary;
  }

  if (selectedAction === "relocate") {
    const workflowMode = resolveWorkflowMode(selectedAction, flags);
    const report = buildVibeMaintainerRelocationReport({
      table
    }, {
      workflow_mode: workflowMode,
      review_mode: workflowMode === "slow" || Boolean(flags.review),
      review_threshold: flags.threshold ?? flags.confidence ?? null,
      scope: resolveScopeSelection(flags, rest)
    });
    if (flags.apply || flags.confirm || flags.yes) {
      applyVibeMaintainerRelocationPlan(report, { table });
    }
    persistVibeMaintainerRelocationReport(report);
    if (flags.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(renderVibeMaintainerRelocationReport(report, table));
    }
    return report;
  }

  if (selectedAction === "approve") {
    const audit = loadSavedAudit();
    if (!audit) throw new Error("Vibe Maintainer approval blocked: run `kvdf vibe-maintainer cleanup` first.");
    const state = {
      ...loadSavedState(),
      report_type: "vibe_maintainer_state",
      generated_at: new Date().toISOString(),
      status: "approved",
      approval_status: "approved",
      approved_at: new Date().toISOString(),
      scope: audit.scope,
      workflow_mode: audit.workflow_mode,
      latest_audit_path: VIBE_MAINTAINER_AUDIT_JSON_PATH,
      latest_summary_path: VIBE_MAINTAINER_SUMMARY_JSON_PATH,
      latest_inspection_path: VIBE_MAINTAINER_INSPECTION_JSON_PATH,
      latest_relocation_path: VIBE_MAINTAINER_RELOCATION_JSON_PATH,
      next_exact_action: "kvdf vibe-maintainer execute"
    };
    persistVibeMaintainerState(state);
    const summary = buildVibeMaintainerSummaryReport(audit, state);
    persistVibeMaintainerSummaryReport(summary);
    if (flags.json) {
      console.log(JSON.stringify(state, null, 2));
    } else {
      console.log(renderVibeMaintainerSummaryReport(summary, table));
    }
    return state;
  }

  if (selectedAction === "execute") {
    const audit = loadSavedAudit();
    if (!audit) throw new Error("Vibe Maintainer execution blocked: run `kvdf vibe-maintainer cleanup` first.");
    const state = loadSavedState();
    if (String(state.approval_status || "").toLowerCase() !== "approved" && String(state.status || "").toLowerCase() !== "approved") {
      throw new Error("Vibe Maintainer execution blocked: approve the maintenance report first.");
    }
    const relocation = loadSavedRelocation() || buildVibeMaintainerRelocationReport({
      table
    }, {
      workflow_mode: audit.workflow_mode || "slow",
      review_mode: true,
      review_threshold: 0.9,
      scope: audit.scope
    });
    const applied = applyVibeMaintainerRelocationPlan(relocation, { table });
    const nextState = {
      ...state,
      report_type: "vibe_maintainer_state",
      generated_at: new Date().toISOString(),
      status: "executed",
      executed_at: new Date().toISOString(),
      approval_status: "approved",
      scope: audit.scope,
      workflow_mode: audit.workflow_mode || state.workflow_mode || "slow",
      applied_moves: applied.applied_moves,
      blocked_moves: applied.blocked_moves,
      latest_audit_path: VIBE_MAINTAINER_AUDIT_JSON_PATH,
      latest_summary_path: VIBE_MAINTAINER_SUMMARY_JSON_PATH,
      latest_inspection_path: VIBE_MAINTAINER_INSPECTION_JSON_PATH,
      latest_relocation_path: VIBE_MAINTAINER_RELOCATION_JSON_PATH,
      next_exact_action: "kvdf vibe-maintainer finalize"
    };
    persistVibeMaintainerState(nextState);
    persistVibeMaintainerRelocationReport(relocation);
    const summary = buildVibeMaintainerSummaryReport(audit, nextState);
    persistVibeMaintainerSummaryReport(summary);
    if (flags.json) {
      console.log(JSON.stringify(nextState, null, 2));
    } else {
      console.log(renderVibeMaintainerSummaryReport(summary, table));
    }
    return nextState;
  }

  if (selectedAction === "finalize") {
    const audit = loadSavedAudit();
    if (!audit) throw new Error("Vibe Maintainer finalization blocked: run `kvdf vibe-maintainer cleanup` first.");
    const state = loadSavedState();
    if (String(state.approval_status || "").toLowerCase() !== "approved" && String(state.status || "").toLowerCase() !== "executed") {
      throw new Error("Vibe Maintainer finalization blocked: approve and execute the maintenance flow first.");
    }
    const relocation = loadSavedRelocation();
    const blockedCount = relocation && Array.isArray(relocation.blocked_moves) ? relocation.blocked_moves.length : 0;
    if (blockedCount > 0) {
      throw new Error("Vibe Maintainer finalization blocked: resolve blocked relocation items first.");
    }
    const nextState = {
      ...state,
      report_type: "vibe_maintainer_state",
      generated_at: new Date().toISOString(),
      status: "completed",
      completed_at: new Date().toISOString(),
      approval_status: "approved",
      scope: audit.scope,
      workflow_mode: audit.workflow_mode || state.workflow_mode || "slow",
      latest_audit_path: VIBE_MAINTAINER_AUDIT_JSON_PATH,
      latest_summary_path: VIBE_MAINTAINER_SUMMARY_JSON_PATH,
      latest_inspection_path: VIBE_MAINTAINER_INSPECTION_JSON_PATH,
      latest_relocation_path: VIBE_MAINTAINER_RELOCATION_JSON_PATH,
      next_exact_action: "Cleanup cycle complete."
    };
    persistVibeMaintainerState(nextState);
    const summary = buildVibeMaintainerSummaryReport(audit, nextState);
    persistVibeMaintainerSummaryReport(summary);
    if (flags.json) {
      console.log(JSON.stringify(nextState, null, 2));
    } else {
      console.log(renderVibeMaintainerSummaryReport(summary, table));
    }
    return nextState;
  }

  throw new Error(`Unknown vibe-maintainer action: ${selectedAction}`);
}

function buildVibeMaintainerAuditReport(deps = {}, options = {}) {
  const table = deps.table || defaultTable;
  const workflowMode = resolveWorkflowMode(options.workflow_mode || "fast");
  const scope = resolveScopeSelectionFromOptions(options.scope);
  const workspaces = scope.workspaces;
  const workspaceReports = workspaces.map((workspace) => buildWorkspaceMaintenanceReport(workspace, workflowMode));
  const totals = workspaceReports.reduce((acc, report) => {
    acc.total_files += report.summary.total_files;
    acc.total_folders += report.summary.total_folders;
    acc.total_findings += report.inspection.total_findings;
    acc.dead_code_candidates += report.inspection.category_counts.dead_code_candidates || 0;
    acc.stale_docs += report.inspection.category_counts.stale_docs || 0;
    acc.spec_drift_candidates += report.inspection.category_counts.spec_drift_candidates || 0;
    acc.deadlock_candidates += report.inspection.category_counts.deadlock_candidates || 0;
    acc.relocation_candidates += report.relocation.candidate_count || 0;
    acc.contract_needs_attention += report.contract.status === "compliant" ? 0 : 1;
    return acc;
  }, {
    total_files: 0,
    total_folders: 0,
    total_findings: 0,
    dead_code_candidates: 0,
    stale_docs: 0,
    spec_drift_candidates: 0,
    deadlock_candidates: 0,
    relocation_candidates: 0,
    contract_needs_attention: 0
  });

  const status = totals.total_findings > 0 || totals.relocation_candidates > 0 || totals.contract_needs_attention > 0 ? "awaiting_approval" : "ready";
  return {
    report_type: "vibe_maintainer_audit",
    generated_at: new Date().toISOString(),
    plugin_id: "vibe-maintainer",
    workflow_mode: workflowMode,
    scope,
    status,
    approval_status: "pending",
    report_path_json: VIBE_MAINTAINER_AUDIT_JSON_PATH,
    report_path_md: VIBE_MAINTAINER_AUDIT_MD_PATH,
    summary: {
      workspace_count: workspaces.length,
      total_files: totals.total_files,
      total_folders: totals.total_folders,
      total_findings: totals.total_findings,
      dead_code_candidates: totals.dead_code_candidates,
      stale_docs: totals.stale_docs,
      spec_drift_candidates: totals.spec_drift_candidates,
      deadlock_candidates: totals.deadlock_candidates,
      relocation_candidates: totals.relocation_candidates,
      contract_needs_attention: totals.contract_needs_attention
    },
    workspace_reports: workspaceReports,
    recommendations: buildVibeMaintainerRecommendations(totals, scope, workflowMode),
    next_exact_action: "kvdf vibe-maintainer approve --confirm"
  };
}

function buildVibeMaintainerSummaryReport(audit = {}, state = {}) {
  const lifecycleStatus = String(state.status || audit.status || "awaiting_approval").toLowerCase();
  return {
    report_type: "vibe_maintainer_summary",
    generated_at: new Date().toISOString(),
    plugin_id: "vibe-maintainer",
    workflow_mode: audit.workflow_mode || state.workflow_mode || "fast",
    scope: audit.scope || state.scope || { scope_mode: "workspace", workspaces: [] },
    status: lifecycleStatus,
    approval_status: state.approval_status || audit.approval_status || "pending",
    completed_at: state.completed_at || null,
    approved_at: state.approved_at || null,
    executed_at: state.executed_at || null,
    report_path_json: VIBE_MAINTAINER_SUMMARY_JSON_PATH,
    report_path_md: VIBE_MAINTAINER_SUMMARY_MD_PATH,
    summary: audit.summary || {
      workspace_count: 0,
      total_files: 0,
      total_folders: 0,
      total_findings: 0,
      dead_code_candidates: 0,
      stale_docs: 0,
      spec_drift_candidates: 0,
      deadlock_candidates: 0,
      relocation_candidates: 0,
      contract_needs_attention: 0
    },
    recommendations: Array.isArray(audit.recommendations) ? audit.recommendations : [],
    next_exact_action: state.next_exact_action || audit.next_exact_action || "kvdf vibe-maintainer cleanup"
  };
}

function buildVibeMaintainerInspectionReport(deps = {}, options = {}) {
  const workflowMode = resolveWorkflowMode(options.workflow_mode || "slow");
  const scope = resolveScopeSelectionFromOptions(options.scope);
  const workspaceReports = scope.workspaces.map((workspace) => buildWorkspaceInspectionOnly(workspace, workflowMode));
  const totals = workspaceReports.reduce((acc, report) => {
    acc.scanned_files += report.scanned_files;
    acc.scanned_files_total += report.scanned_files_total;
    acc.total_findings += report.total_findings || 0;
    acc.dead_code_candidates += report.category_counts.dead_code_candidates || 0;
    acc.stale_docs += report.category_counts.stale_docs || 0;
    acc.spec_drift_candidates += report.category_counts.spec_drift_candidates || 0;
    acc.deadlock_candidates += report.category_counts.deadlock_candidates || 0;
    return acc;
  }, {
    scanned_files: 0,
    scanned_files_total: 0,
    total_findings: 0,
    dead_code_candidates: 0,
    stale_docs: 0,
    spec_drift_candidates: 0,
    deadlock_candidates: 0
  });
  return {
    report_type: "vibe_maintainer_inspection",
    generated_at: new Date().toISOString(),
    plugin_id: "vibe-maintainer",
    workflow_mode: workflowMode,
    scope,
    report_path_json: VIBE_MAINTAINER_INSPECTION_JSON_PATH,
    report_path_md: VIBE_MAINTAINER_INSPECTION_MD_PATH,
    summary: totals,
    workspace_reports: workspaceReports,
    findings: workspaceReports.flatMap((item) => item.findings || []).slice(0, 200),
    next_exact_action: buildInspectionNextAction(totals)
  };
}

function buildVibeMaintainerRelocationReport(deps = {}, options = {}) {
  const workflowMode = resolveWorkflowMode(options.workflow_mode || "slow");
  const scope = resolveScopeSelectionFromOptions(options.scope);
  const reviewMode = Boolean(options.review_mode) || workflowMode === "slow";
  const reviewThreshold = normalizeThreshold(options.review_threshold, 0.9);
  const candidates = [];

  for (const workspace of scope.workspaces) {
    const workspaceRoot = resolveWorkspaceRoot(workspace.root || workspace.workspace_root || workspace.slug);
    const workspaceRel = path.relative(repoRoot(), workspaceRoot).replace(/\\/g, "/");
    const topFolders = listDirectories(workspaceRel);
    for (const folder of topFolders) {
      if (!folder || folder.startsWith(".")) continue;
      const normalized = normalizeKey(folder);
      const target = WORKSPACE_FOLDER_ALIASES[normalized];
      if (!target || target === folder) continue;
      const source = `${workspaceRel}/${folder}`;
      const targetPath = `${workspaceRel}/${target}`;
      if (!fs.existsSync(path.join(repoRoot(), source))) continue;
      const reviewItems = listFiles(source, null, true).slice(0, 8);
      const targetExists = fs.existsSync(path.join(repoRoot(), targetPath));
      const confidence = reviewItems.length > 0 ? 0.95 : 0.8;
      if (reviewMode && confidence < reviewThreshold) continue;
      candidates.push({
        workspace_slug: workspace.slug,
        workspace_root: workspaceRel,
        source,
        target: targetPath,
        kind: "folder",
        match_type: "workspace_root_alias",
        confidence,
        review_status: targetExists ? "needs_review" : "approved",
        review_items: reviewItems,
        review_file_count: reviewItems.length,
        source_exists: true,
        target_exists: targetExists,
        status: targetExists ? "merge" : "move",
        reason: `Folder ${folder} in workspace ${workspace.slug} normalizes to canonical folder ${target}.`
      });
    }
  }

  const deduped = dedupeCandidates(candidates);
  return {
    report_type: "vibe_maintainer_relocation",
    generated_at: new Date().toISOString(),
    plugin_id: "vibe-maintainer",
    workflow_mode: workflowMode,
    scope,
    review_mode: reviewMode,
    review_threshold: reviewThreshold,
    report_path_json: VIBE_MAINTAINER_RELOCATION_JSON_PATH,
    report_path_md: VIBE_MAINTAINER_RELOCATION_MD_PATH,
    status: deduped.length ? "preview" : "clear",
    candidate_count: deduped.length,
    candidates: deduped,
    applied_moves: [],
    blocked_moves: [],
    recommendations: buildRelocationRecommendations(deduped),
    next_exact_action: deduped.length ? "kvdf vibe-maintainer execute" : "No relocation action is needed."
  };
}

function applyVibeMaintainerRelocationPlan(report, deps = {}) {
  const applied_moves = [];
  const blocked_moves = [];
  for (const candidate of Array.isArray(report.candidates) ? report.candidates : []) {
    if (candidate.status !== "move" || candidate.review_status !== "approved") {
      blocked_moves.push({
        ...candidate,
        blocked_reason: candidate.status !== "move" ? "target already exists or merge required" : "candidate requires review"
      });
      continue;
    }
    try {
      movePath(candidate.source, candidate.target);
      applied_moves.push({ source: candidate.source, target: candidate.target, workspace_slug: candidate.workspace_slug || null });
    } catch (error) {
      blocked_moves.push({ ...candidate, blocked_reason: error.message });
    }
  }
  report.applied_moves = applied_moves;
  report.blocked_moves = blocked_moves;
  report.status = blocked_moves.length ? "partial" : (applied_moves.length ? "applied" : report.status || "clear");
  return report;
}

function persistVibeMaintainerState(state) {
  writeJsonFile(VIBE_MAINTAINER_STATE_JSON_PATH, state);
  return state;
}

function persistVibeMaintainerAuditReport(report) {
  writeJsonFile(VIBE_MAINTAINER_AUDIT_JSON_PATH, report);
  writeTextFile(VIBE_MAINTAINER_AUDIT_MD_PATH, `${renderVibeMaintainerAuditReport(report, defaultTable)}\n`);
  return report;
}

function persistVibeMaintainerSummaryReport(report) {
  writeJsonFile(VIBE_MAINTAINER_SUMMARY_JSON_PATH, report);
  writeTextFile(VIBE_MAINTAINER_SUMMARY_MD_PATH, `${renderVibeMaintainerSummaryReport(report, defaultTable)}\n`);
  return report;
}

function persistVibeMaintainerInspectionReport(report) {
  writeJsonFile(VIBE_MAINTAINER_INSPECTION_JSON_PATH, report);
  writeTextFile(VIBE_MAINTAINER_INSPECTION_MD_PATH, `${renderVibeMaintainerInspectionReport(report, defaultTable)}\n`);
  return report;
}

function persistVibeMaintainerRelocationReport(report) {
  writeJsonFile(VIBE_MAINTAINER_RELOCATION_JSON_PATH, report);
  writeTextFile(VIBE_MAINTAINER_RELOCATION_MD_PATH, `${renderVibeMaintainerRelocationReport(report, defaultTable)}\n`);
  return report;
}

function renderVibeMaintainerAuditReport(report, table) {
  const workspaceRows = (report.workspace_reports || []).map((item) => [
    item.workspace_slug || "",
    item.contract ? item.contract.status || "" : "",
    item.inspection ? String(item.inspection.scanned_files || 0) : "0",
    item.inspection ? String(item.inspection.total_findings || 0) : "0",
    item.relocation ? String(item.relocation.candidate_count || 0) : "0",
    item.recommendation || ""
  ]);
  return [
    "# Vibe Maintainer Audit",
    "",
    `- Generated at: ${report.generated_at || "n/a"}`,
    `- Workflow mode: ${report.workflow_mode || "fast"}`,
    `- Scope mode: ${report.scope ? report.scope.scope_mode || "workspace" : "workspace"}`,
    `- Status: ${report.status || "awaiting_approval"}`,
    `- Next exact action: ${report.next_exact_action || "kvdf vibe-maintainer approve --confirm"}`,
    "",
    "## Summary",
    "",
    table(["Metric", "Value"], [
      ["Workspaces", String(report.summary ? report.summary.workspace_count || 0 : 0)],
      ["Total files", String(report.summary ? report.summary.total_files || 0 : 0)],
      ["Total folders", String(report.summary ? report.summary.total_folders || 0 : 0)],
      ["Findings", String(report.summary ? report.summary.total_findings || 0 : 0)],
      ["Dead code", String(report.summary ? report.summary.dead_code_candidates || 0 : 0)],
      ["Stale docs", String(report.summary ? report.summary.stale_docs || 0 : 0)],
      ["Spec drift", String(report.summary ? report.summary.spec_drift_candidates || 0 : 0)],
      ["Blocked flows", String(report.summary ? report.summary.deadlock_candidates || 0 : 0)],
      ["Relocation candidates", String(report.summary ? report.summary.relocation_candidates || 0 : 0)]
    ]),
    "",
    "## Workspace Review",
    "",
    workspaceRows.length ? table(["Workspace", "Contract", "Scanned files", "Findings", "Relocations", "Note"], workspaceRows) : "No workspace reports were generated.",
    "",
    "## Recommendations",
    "",
    ...(Array.isArray(report.recommendations) && report.recommendations.length ? report.recommendations.map((item) => `- ${item}`) : ["- No recommendations recorded."])
  ].join("\n");
}

function renderVibeMaintainerSummaryReport(report, table) {
  const scope = report.scope || {};
  return [
    "# Vibe Maintainer Summary",
    "",
    `- Status: ${report.status || "pending"}`,
    `- Approval status: ${report.approval_status || "pending"}`,
    `- Workflow mode: ${report.workflow_mode || "fast"}`,
    `- Scope mode: ${scope.scope_mode || "workspace"}`,
    `- Workspaces: ${scope.workspaces ? scope.workspaces.length : 0}`,
    `- Next exact action: ${report.next_exact_action || "kvdf vibe-maintainer cleanup"}`,
    "",
    "## Summary",
    "",
    table(["Metric", "Value"], [
      ["Total files", String(report.summary ? report.summary.total_files || 0 : 0)],
      ["Total folders", String(report.summary ? report.summary.total_folders || 0 : 0)],
      ["Total findings", String(report.summary ? report.summary.total_findings || 0 : 0)],
      ["Dead code", String(report.summary ? report.summary.dead_code_candidates || 0 : 0)],
      ["Stale docs", String(report.summary ? report.summary.stale_docs || 0 : 0)],
      ["Spec drift", String(report.summary ? report.summary.spec_drift_candidates || 0 : 0)],
      ["Blocked flows", String(report.summary ? report.summary.deadlock_candidates || 0 : 0)],
      ["Relocation candidates", String(report.summary ? report.summary.relocation_candidates || 0 : 0)]
    ]),
    "",
    "## Recommendations",
    "",
    ...(Array.isArray(report.recommendations) && report.recommendations.length ? report.recommendations.map((item) => `- ${item}`) : ["- No recommendations recorded."])
  ].join("\n");
}

function renderVibeMaintainerInspectionReport(report, table) {
  const findings = Array.isArray(report.findings) ? report.findings.slice(0, 20).map((item) => [
    item.category || "",
    item.file || "",
    String(item.line || ""),
    item.excerpt || ""
  ]) : [];
  return [
    "# Vibe Maintainer Inspection",
    "",
    `- Workflow mode: ${report.workflow_mode || "slow"}`,
    `- Scope mode: ${report.scope ? report.scope.scope_mode || "workspace" : "workspace"}`,
    `- Next exact action: ${report.next_exact_action || "kvdf vibe-maintainer cleanup"}`,
    "",
    "## Summary",
    "",
    table(["Metric", "Value"], [
      ["Scanned files", String(report.summary ? report.summary.scanned_files || 0 : 0)],
      ["Inspectable files", String(report.summary ? report.summary.scanned_files_total || 0 : 0)],
      ["Findings", String(report.summary ? report.summary.total_findings || 0 : 0)],
      ["Dead code", String(report.summary ? report.summary.dead_code_candidates || 0 : 0)],
      ["Stale docs", String(report.summary ? report.summary.stale_docs || 0 : 0)],
      ["Spec drift", String(report.summary ? report.summary.spec_drift_candidates || 0 : 0)],
      ["Blocked flows", String(report.summary ? report.summary.deadlock_candidates || 0 : 0)]
    ]),
    "",
    "## Findings",
    "",
    findings.length ? table(["Category", "File", "Line", "Excerpt"], findings) : "No inspection findings recorded."
  ].join("\n");
}

function renderVibeMaintainerRelocationReport(report, table) {
  const rows = (report.candidates || []).map((item) => [
    item.workspace_slug || "",
    item.source || "",
    item.target || "",
    item.kind || "",
    item.match_type || "",
    item.review_status || "",
    item.status || "",
    item.reason || ""
  ]);
  const summaryRows = [
    ["Status", report.status || "preview"],
    ["Workflow mode", report.workflow_mode || "fast"],
    ["Review mode", report.review_mode ? "yes" : "no"],
    ["Review threshold", report.review_threshold != null ? String(report.review_threshold) : "0.90"],
    ["Candidate count", String(report.candidate_count || 0)],
    ["Applied moves", String(Array.isArray(report.applied_moves) ? report.applied_moves.length : 0)],
    ["Blocked moves", String(Array.isArray(report.blocked_moves) ? report.blocked_moves.length : 0)],
    ["Next exact action", report.next_exact_action || "No relocation action is needed."]
  ];
  return [
    "# Vibe Maintainer Relocation",
    "",
    table(["Metric", "Value"], summaryRows),
    "",
    rows.length ? table(["Workspace", "Source", "Target", "Kind", "Match", "Review", "Status", "Reason"], rows) : "No relocation candidates were found.",
    "",
    "## Recommendations",
    "",
    ...(Array.isArray(report.recommendations) && report.recommendations.length ? report.recommendations.map((item) => `- ${item}`) : ["- No relocation candidates were found."])
  ].join("\n");
}

function buildVibeMaintainerInspectionOnlyReport(workspace, workflowMode) {
  const record = ensureWorkspaceRecord(workspace);
  const workspaceRoot = resolveWorkspaceRoot(record.root || record.slug);
  const workspaceRel = path.relative(repoRoot(), workspaceRoot).replace(/\\/g, "/");
  const files = listFiles(workspaceRel, null, true).filter(isInspectableWorkspaceFile);
  const filesToInspect = workflowMode === "fast" ? files.slice(0, 120) : files;
  const findings = [];
  const categoryCounts = {
    dead_code_candidates: 0,
    stale_docs: 0,
    spec_drift_candidates: 0,
    deadlock_candidates: 0
  };

  for (const file of filesToInspect) {
    let text = "";
    try {
      text = String(readTextFile(file) || "");
    } catch {
      continue;
    }
    const fileFindings = inspectTextForSignals(file, text);
    for (const finding of fileFindings) {
      findings.push(finding);
      categoryCounts[finding.category] = (categoryCounts[finding.category] || 0) + 1;
    }
  }

  return {
    report_type: "vibe_maintainer_workspace_inspection",
    generated_at: new Date().toISOString(),
    workspace_slug: record.slug,
    workspace_root: workspaceRel,
    analysis_mode: workflowMode,
    inspection_mode: workflowMode,
    scanned_files: filesToInspect.length,
    scanned_files_total: files.length,
    total_findings: findings.length,
    category_counts: categoryCounts,
    findings: findings.slice(0, 100),
    top_files: summarizeFindingsByFile(findings)
  };
}

function buildWorkspaceInspectionOnly(workspace, workflowMode) {
  const inspection = buildVibeMaintainerInspectionOnlyReport(workspace, workflowMode);
  return inspection;
}

function buildWorkspaceMaintenanceReport(workspace, workflowMode) {
  const record = ensureWorkspaceRecord(workspace);
  const validation = validateDeveloperAppWorkspace(record.root);
  const inspection = buildWorkspaceInspectionOnly(record, workflowMode);
  const relocation = buildVibeMaintainerRelocationReport({}, {
    workflow_mode: workflowMode,
    review_mode: workflowMode === "slow",
    review_threshold: workflowMode === "slow" ? 0.9 : 0,
    scope: { scope_mode: "workspace", workspaces: [record] }
  });
  const recommendation = buildWorkspaceRecommendation(validation, inspection, relocation);
  return {
    workspace_slug: record.slug,
    workspace_root: normalizeWorkspaceRoot(record.root),
    contract: {
      status: validation.status,
      missing_count: validation.missing_count,
      boundary_status: validation.boundary ? (validation.boundary.counts.blocked > 0 ? "blocked" : validation.boundary.counts.linked > 0 ? "linked" : "allowed") : "unknown",
      next_exact_action: validation.next_exact_action
    },
    validation,
    inspection,
    relocation,
    summary: {
      total_files: inspection.scanned_files_total || 0,
      total_folders: listDirectories(normalizeWorkspaceRoot(record.root)).length
    },
    recommendation
  };
}

function buildWorkspaceRecommendation(validation, inspection, relocation) {
  if (validation && validation.ok === false) return "Fix the workspace contract before deeper cleanup.";
  if (inspection && inspection.category_counts && Object.values(inspection.category_counts).some((count) => count > 0)) return "Review maintenance findings file by file.";
  if (relocation && relocation.candidate_count > 0) return "Review the relocation plan before applying moves.";
  return "Workspace is ready for a clean maintenance pass.";
}

function buildVibeMaintainerRecommendations(totals = {}, scope = {}, workflowMode = "fast") {
  const recommendations = [];
  if (Number(totals.contract_needs_attention || 0) > 0) {
    recommendations.push("Fix workspace contract issues before deeper maintenance work.");
  }
  if (Number(totals.dead_code_candidates || 0) > 0) {
    recommendations.push(`Review ${totals.dead_code_candidates} dead-code candidate(s) file by file.`);
  }
  if (Number(totals.stale_docs || 0) > 0) {
    recommendations.push(`Refresh ${totals.stale_docs} stale-doc candidate(s) against the current workspace state.`);
  }
  if (Number(totals.spec_drift_candidates || 0) > 0) {
    recommendations.push(`Correct ${totals.spec_drift_candidates} spec-drift candidate(s) against the live implementation.`);
  }
  if (Number(totals.deadlock_candidates || 0) > 0) {
    recommendations.push(`Unblock ${totals.deadlock_candidates} workflow candidate(s) that still describe waiting or blocked states.`);
  }
  if (Number(totals.relocation_candidates || 0) > 0) {
    recommendations.push(`Review ${totals.relocation_candidates} relocation candidate(s) before applying moves.`);
  }
  if (!recommendations.length) {
    recommendations.push(`No maintenance issues were found in the selected ${scope.scope_mode || "workspace"} scope.`);
  }
  recommendations.push(workflowMode === "slow" ? "Slow mode ran a strict file-by-file pass." : "Fast mode ran a lighter pass for quick signal.");
  return recommendations;
}

function ensureWorkspaceRecord(workspace) {
  if (!workspace) throw new Error("Workspace selection failed.");
  if (typeof workspace === "string") {
    return {
      slug: path.basename(workspace).toLowerCase(),
      root: resolveWorkspaceRoot(workspace)
        ? path.relative(repoRoot(), resolveWorkspaceRoot(workspace)).replace(/\\/g, "/")
        : workspace
    };
  }
  return {
    slug: String(workspace.slug || path.basename(workspace.root || "")).trim().toLowerCase(),
    root: normalizeWorkspaceRoot(workspace.root || workspace.workspace_root || workspace.slug)
  };
}

function normalizeWorkspaceRoot(value) {
  const resolved = resolveWorkspaceRoot(value);
  return path.relative(repoRoot(), resolved).replace(/\\/g, "/");
}

function discoverWorkspaceRecords() {
  const registry = fileExists(".kabeeri/app_workspaces.json") ? readJsonFile(".kabeeri/app_workspaces.json") : { workspaces: [] };
  const registryWorkspaces = Array.isArray(registry.workspaces) ? registry.workspaces : [];
  const discovered = listDirectories("workspaces/apps").map((slug) => ({
    slug,
    name: slug,
    root: `workspaces/apps/${slug}`,
    app_type: "application",
    surface_scopes: ["shared"]
  }));
  const merged = new Map();
  for (const item of [...registryWorkspaces, ...discovered]) {
    if (!item) continue;
    const slug = String(item.slug || item.app_slug || path.basename(item.root || "")).trim().toLowerCase();
    if (!slug) continue;
    merged.set(slug, {
      slug,
      name: item.name || item.app_name || slug,
      root: normalizeWorkspaceRoot(item.root || `workspaces/apps/${slug}`),
      app_type: item.app_type || "application",
      surface_scopes: Array.isArray(item.surface_scopes) ? item.surface_scopes : ["shared"],
      linked_workspace_roots: Array.isArray(item.linked_workspace_roots) ? item.linked_workspace_roots : []
    });
  }
  return [...merged.values()].sort((left, right) => left.slug.localeCompare(right.slug));
}

function resolveScopeSelection(flags = {}, rest = []) {
  return resolveScopeSelectionFromOptions({
    scope: flags.scope,
    workspace: flags.workspace || flags.slug || flags.app || flags.app_workspace || flags.appWorkspace || valueFromRest(rest),
    workspaces: flags.workspaces || flags["workspace-list"] || flags["workspace-list"] || rest.join(","),
    all: flags.all
  });
}

function valueFromRest(rest = []) {
  return Array.isArray(rest) && rest.length ? String(rest[0] || "").trim() : "";
}

function resolveScopeSelectionFromOptions(options = {}) {
  if (options && Array.isArray(options.workspaces) && options.scope_mode) {
    return {
      scope_mode: options.scope_mode,
      selection_reason: options.selection_reason || "",
      workspace_count: options.workspace_count != null ? options.workspace_count : options.workspaces.length,
      workspace_roots: Array.isArray(options.workspace_roots) ? options.workspace_roots : options.workspaces.map((item) => item.root),
      workspace_slugs: Array.isArray(options.workspace_slugs) ? options.workspace_slugs : options.workspaces.map((item) => item.slug),
      workspaces: dedupeWorkspaceRecords(options.workspaces.map((item) => ensureWorkspaceRecord(item)))
    };
  }
  const allWorkspaces = discoverWorkspaceRecords();
  const requestedScope = normalizeKey(options.scope);
  const workspaceValue = String(options.workspace || "").trim();
  const workspacesValue = String(options.workspaces || "").trim();
  const explicitAll = Boolean(options.all) || requestedScope === "all";
  const explicitSelected = requestedScope === "selected";
  const explicitCurrent = requestedScope === "current";
  let selected = [];
  let scopeMode = "workspace";
  let selectionReason = "";

  if (explicitAll) {
    selected = allWorkspaces;
    scopeMode = "all";
    selectionReason = "all app workspaces";
  } else if (explicitSelected || workspacesValue) {
    const requested = splitList(workspacesValue);
    selected = requested.map((item) => resolveWorkspaceRecordBySelector(item, allWorkspaces)).filter(Boolean);
    scopeMode = "selected";
    selectionReason = "selected app workspaces";
  } else if (explicitCurrent || workspaceValue) {
    const record = resolveWorkspaceRecordBySelector(workspaceValue || detectCurrentWorkspaceSlug() || "", allWorkspaces);
    if (record) {
      selected = [record];
      scopeMode = explicitCurrent ? "current" : "workspace";
      selectionReason = "requested workspace";
    } else if (workspaceValue || detectCurrentWorkspaceSlug()) {
      const fallbackSlug = normalizeKey(workspaceValue || detectCurrentWorkspaceSlug() || "");
      const fallbackRoot = normalizeWorkspaceRoot(`workspaces/apps/${fallbackSlug}`);
      selected = [{
        slug: fallbackSlug,
        name: fallbackSlug,
        root: fallbackRoot,
        app_type: "application",
        surface_scopes: ["shared"]
      }];
      scopeMode = explicitCurrent ? "current" : "workspace";
      selectionReason = "requested workspace";
    }
  } else {
    const current = detectCurrentWorkspaceSlug();
    if (current) {
      const record = resolveWorkspaceRecordBySelector(current, allWorkspaces);
      if (record) {
        selected = [record];
        scopeMode = "current";
        selectionReason = "current workspace";
      } else {
        selected = [{
          slug: normalizeKey(current),
          name: normalizeKey(current),
          root: normalizeWorkspaceRoot(`workspaces/apps/${normalizeKey(current)}`),
          app_type: "application",
          surface_scopes: ["shared"]
        }];
        scopeMode = "current";
        selectionReason = "current workspace";
      }
    }
  }

  if (!selected.length && allWorkspaces.length === 1) {
    selected = [allWorkspaces[0]];
    scopeMode = "current";
    selectionReason = "single discovered workspace";
  }

  if (!selected.length) {
    throw new Error("No app workspace scope was selected. Use --workspace <slug> or --all.");
  }

  const unique = dedupeWorkspaceRecords(selected);
  return {
    scope_mode: scopeMode,
    selection_reason: selectionReason,
    workspace_count: unique.length,
    workspace_roots: unique.map((item) => item.root),
    workspace_slugs: unique.map((item) => item.slug),
    workspaces: unique
  };
}

function resolveWorkspaceRecordBySelector(selector, workspaces) {
  const normalizedSelector = String(selector || "").trim().toLowerCase();
  if (!normalizedSelector) return null;
  const resolvedRoot = normalizeWorkspaceRoot(selector);
  return workspaces.find((item) => {
    const normalizedRoot = normalizeKey(item.root);
    return normalizeKey(item.slug) === normalizedSelector || normalizedRoot === normalizeKey(resolvedRoot);
  }) || null;
}

function detectCurrentWorkspaceSlug() {
  const cwd = path.resolve(process.cwd()).replace(/\\/g, "/");
  const match = /(?:^|\/)workspaces\/apps\/([^/]+)/.exec(cwd);
  return match ? match[1] : null;
}

function dedupeWorkspaceRecords(records = []) {
  const seen = new Set();
  const result = [];
  for (const item of records) {
    const key = `${normalizeKey(item.slug)}::${normalizeKey(item.root)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function dedupeCandidates(candidates = []) {
  const seen = new Set();
  const result = [];
  for (const candidate of candidates) {
    const key = `${normalizeKey(candidate.workspace_slug)}::${normalizeKey(candidate.source)}=>${normalizeKey(candidate.target)}::${normalizeKey(candidate.match_type)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(candidate);
  }
  result.sort((left, right) => {
    if (left.workspace_slug === right.workspace_slug) return String(left.source || "").localeCompare(String(right.source || ""));
    return String(left.workspace_slug || "").localeCompare(String(right.workspace_slug || ""));
  });
  return result;
}

function splitList(value) {
  return String(value || "")
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeAction(action, value, flags, rest) {
  const raw = String(action || value || flags.action || flags.mode || "").trim().toLowerCase();
  if (raw === "maintenance" || raw === "maintainer") return "cleanup";
  if (raw === "fast" || raw === "slow") return raw;
  if (["cleanup", "inspect", "report", "relocate", "approve", "execute", "finalize", "status"].includes(raw)) return raw;
  if (!raw && Array.isArray(rest) && rest.length) {
    const first = String(rest[0] || "").trim().toLowerCase();
    if (["fast", "slow", "cleanup", "inspect", "report", "relocate", "approve", "execute", "finalize", "status"].includes(first)) return first;
  }
  return raw || "status";
}

function resolveWorkflowMode(action, flags = {}) {
  const raw = String(flags.mode || flags.workflow_mode || action || "").trim().toLowerCase();
  if (raw === "fast") return "fast";
  if (raw === "slow") return "slow";
  if (flags.fast) return "fast";
  if (flags.slow) return "slow";
  return action === "inspect" || action === "relocate" ? "slow" : "fast";
}

function normalizeThreshold(value, fallback = 0.9) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  if (parsed > 1) return 1;
  return parsed;
}

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/^-|-$/g, "");
}

function isInspectableWorkspaceFile(file) {
  const normalized = normalizeKey(file);
  if (!normalized) return false;
  if (normalized.startsWith(".kabeeri/")) return false;
  if (normalized.startsWith("node_modules/") || normalized.startsWith("dist/") || normalized.startsWith("coverage/") || normalized.startsWith("build/") || normalized.startsWith("out/")) return false;
  return /\.(md|mdx|js|jsx|ts|tsx|json|yml|yaml|css|scss|html|php|txt|sh|mjs|cjs)$/i.test(normalized) ||
    normalized.startsWith("src/") ||
    normalized.startsWith("docs/") ||
    normalized.startsWith("tests/") ||
    normalized.startsWith("assets/") ||
    normalized === "readme.md" ||
    normalized === "package.json";
}

function inspectTextForSignals(file, text) {
  const lines = String(text || "").split(/\r?\n/);
  const findings = [];
  const seen = new Set();
  const isWorkflowFile = /(?:^|\/)(maintainability|vibe_maintainer|vibe-maintainer|cleanup|inspection|relocation|pipeline_guard|task_scheduler|task_trash|traceability)\.(js|ts|cjs|cts|mjs)$/i.test(file);
  const rules = [
    { category: "dead_code_candidates", pattern: /\b(dead code|orphaned export|unused export|unused import|duplicate helper|dead branch|dead path)\b/i },
    { category: "stale_docs", pattern: /\b(TBD|TODO|FIXME|future only|planned only|legacy alias|compatibility alias|stale wording|outdated|old info|old wording)\b/i },
    { category: "spec_drift_candidates", pattern: /\b(wrong spec|wrong specs|spec drift|outdated spec|stale claim|future scope|possible drift)\b/i }
  ];
  if (isWorkflowFile) {
    rules.push({ category: "deadlock_candidates", pattern: /\b(deadlock|waiting_for_completion|blocked|stuck|stalled|needs_follow_up)\b/i });
  }
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    for (const rule of rules) {
      if (!rule.pattern.test(line)) continue;
      if (shouldIgnoreInspectionSignal(file, line, rule.category)) continue;
      const key = `${normalizeKey(file)}::${rule.category}`;
      if (seen.has(key)) continue;
      seen.add(key);
      findings.push({
        file,
        line: lineNumber,
        category: rule.category,
        excerpt: String(line).trim().slice(0, 180)
      });
    }
  });
  return findings;
}

function shouldIgnoreInspectionSignal(file, line, category) {
  const normalizedFile = normalizeKey(file);
  const normalizedLine = String(line || "").toLowerCase();
  if (normalizedFile.startsWith(".kabeeri/")) return true;
  if (normalizedFile === "plugins/vibe-maintainer/runtime/vibe_maintainer.js") return true;
  if (category === "deadlock_candidates") {
    return normalizedLine.includes("run `kvdf vibe-maintainer cleanup` first") || normalizedLine.includes("blocked by");
  }
  return false;
}

function summarizeFindingsByFile(findings = []) {
  const counts = new Map();
  for (const finding of findings) {
    counts.set(finding.file, (counts.get(finding.file) || 0) + 1);
  }
  return [...counts.entries()].map(([file, count]) => ({ file, count })).sort((left, right) => right.count - left.count || left.file.localeCompare(right.file)).slice(0, 20);
}

function buildRelocationRecommendations(candidates = []) {
  if (!Array.isArray(candidates) || !candidates.length) return ["No relocation candidates were found."];
  return [
    `Review ${candidates.length} relocation candidate(s) against the workspace folder contract.`,
    "Only apply moves after verifying the workspace boundary and the target folder structure."
  ];
}

function buildInspectionNextAction(totals) {
  if (Number(totals.dead_code_candidates || 0) > 0) return "Review dead-code candidates file by file.";
  if (Number(totals.stale_docs || 0) > 0) return "Refresh stale documentation and compatibility wording.";
  if (Number(totals.spec_drift_candidates || 0) > 0) return "Correct spec drift against the current source of truth.";
  if (Number(totals.deadlock_candidates || 0) > 0) return "Unblock workflow files that still describe waiting or blocked states.";
  return "No maintenance inspection action is needed.";
}

function loadSavedAudit() {
  return fileExists(VIBE_MAINTAINER_AUDIT_JSON_PATH) ? readJsonFile(VIBE_MAINTAINER_AUDIT_JSON_PATH) : null;
}

function loadSavedSummary() {
  return fileExists(VIBE_MAINTAINER_SUMMARY_JSON_PATH) ? readJsonFile(VIBE_MAINTAINER_SUMMARY_JSON_PATH) : null;
}

function loadSavedState() {
  return fileExists(VIBE_MAINTAINER_STATE_JSON_PATH) ? readJsonFile(VIBE_MAINTAINER_STATE_JSON_PATH) : {};
}

function loadSavedRelocation() {
  return fileExists(VIBE_MAINTAINER_RELOCATION_JSON_PATH) ? readJsonFile(VIBE_MAINTAINER_RELOCATION_JSON_PATH) : null;
}

function defaultTable(headers, rows) {
  const cols = Array.isArray(headers) ? headers.length : 0;
  const data = [
    Array.isArray(headers) ? headers.map((item) => String(item)) : [],
    ...(Array.isArray(rows) ? rows.map((row) => row.map((cell) => String(cell))) : [])
  ];
  const widths = new Array(cols).fill(0).map((_, index) => Math.max(...data.map((row) => String(row[index] || "").length), 0));
  return data.map((row, rowIndex) => row.map((cell, index) => String(cell || "").padEnd(widths[index])).join(" | ")).join("\n");
}

module.exports = {
  VIBE_MAINTAINER_STATE_JSON_PATH,
  VIBE_MAINTAINER_AUDIT_JSON_PATH,
  VIBE_MAINTAINER_AUDIT_MD_PATH,
  VIBE_MAINTAINER_SUMMARY_JSON_PATH,
  VIBE_MAINTAINER_SUMMARY_MD_PATH,
  VIBE_MAINTAINER_INSPECTION_JSON_PATH,
  VIBE_MAINTAINER_INSPECTION_MD_PATH,
  VIBE_MAINTAINER_RELOCATION_JSON_PATH,
  VIBE_MAINTAINER_RELOCATION_MD_PATH,
  command,
  buildVibeMaintainerAuditReport,
  buildVibeMaintainerSummaryReport,
  buildVibeMaintainerInspectionReport,
  buildVibeMaintainerRelocationReport,
  applyVibeMaintainerRelocationPlan,
  persistVibeMaintainerState,
  persistVibeMaintainerAuditReport,
  persistVibeMaintainerSummaryReport,
  persistVibeMaintainerInspectionReport,
  persistVibeMaintainerRelocationReport,
  renderVibeMaintainerAuditReport,
  renderVibeMaintainerSummaryReport,
  renderVibeMaintainerInspectionReport,
  renderVibeMaintainerRelocationReport
};
