const fs = require("fs");
const path = require("path");

const { getAssetAliases, listDirectories, listFiles, movePath, readTextFile, repoRoot } = require("../fs_utils");
const { buildPluginLoaderReport } = require("./plugin_loader");
const { buildRepositoryStructureReport } = require("../commands/repository_structure");
const { buildPipelineState } = require("./pipeline_guard");
const { getCommandRegistry } = require("./command_registry");
const { buildEvolutionSummary } = require("./evolution");

const CLEANUP_AUDIT_JSON_PATH = ".kabeeri/reports/kvdf_cleanup_audit.json";
const CLEANUP_AUDIT_MD_PATH = "docs/reports/KVDF_CLEANUP_AUDIT.md";
const CLEANUP_SUMMARY_JSON_PATH = ".kabeeri/reports/kvdf_cleanup_summary.json";
const CLEANUP_SUMMARY_MD_PATH = "docs/reports/KVDF_CLEANUP_SUMMARY.md";
const MAINTENANCE_INSPECTION_JSON_PATH = ".kabeeri/reports/kvdf_maintenance_inspection.json";
const MAINTENANCE_INSPECTION_MD_PATH = "docs/reports/KVDF_MAINTENANCE_INSPECTION.md";
const MAINTENANCE_RELOCATION_JSON_PATH = ".kabeeri/reports/kvdf_maintenance_relocation.json";
const MAINTENANCE_RELOCATION_MD_PATH = "docs/reports/KVDF_MAINTENANCE_RELOCATION.md";

function buildCleanupAuditReport(deps = {}, options = {}) {
  const readJsonFile = deps.readJsonFile || (() => ({}));
  const fileExists = deps.fileExists || (() => false);
  const workflowMode = normalizeWorkflowMode(options.workflow_mode || deps.workflow_mode || "fast");
  const files = listFiles(".", null, true).filter((file) => !isIgnoredPath(file));
  const folders = listDirectories(".");
  const pluginLoader = buildPluginLoaderReport();
  const structure = buildRepositoryStructureReport();
  const pipelineState = buildPipelineState({ readJsonFile, fileExists });
  const commandRegistry = getCommandRegistry();
  const evolutionState = fileExists(".kabeeri/evolution.json") ? readJsonFile(".kabeeri/evolution.json") : { changes: [], impact_plans: [], deferred_ideas: [], scorecards: [] };
  const evolutionSummary = buildEvolutionSummary(evolutionState);
  const inspection = buildMaintenanceInspection(files, {
    readTextFile,
    analysis_mode: workflowMode
  });
  const relocation = buildMaintenanceRelocationReport({}, {
    workflow_mode: workflowMode,
    review_mode: workflowMode === "slow",
    review_threshold: workflowMode === "slow" ? 0.9 : 0
  });

  const fileInventory = summarizeFiles(files);
  const folderInventory = summarizeFolders(files);
  const extensionInventory = summarizeExtensions(files);
  const commandCategorySummary = summarizeCommands(commandRegistry, "category");
  const commandOwnerSummary = summarizeCommands(commandRegistry, "owner");
  const kvdfDevPlugin = (pluginLoader.plugins || []).find((plugin) => plugin.plugin_id === "kvdf-dev") || null;

  const cleanupQueue = buildCleanupQueue({
    structure,
    pluginLoader,
    pipelineState,
    evolutionSummary,
    inspection,
    relocation,
    folders,
    fileInventory
  });

  return {
    report_type: "kvdf_system_cleanup_audit",
    generated_at: new Date().toISOString(),
    cleanup_id: `kvdf-cleanup-${Date.now()}`,
    status: "awaiting_approval",
    approval_status: "pending",
    source_bundle: "kvdf-dev",
    workflow_mode: workflowMode,
    report_path_json: CLEANUP_AUDIT_JSON_PATH,
    report_path_md: CLEANUP_AUDIT_MD_PATH,
    summary: {
      workspace_root: repoRoot(),
      total_files: files.length,
      total_folders: folders.length,
      plugin_total: pluginLoader.total_plugins,
      active_plugins: pluginLoader.active_plugins,
      command_total: commandRegistry.length,
      unknown_folders: (structure.validation && Array.isArray(structure.validation.unknown_folders)) ? structure.validation.unknown_folders.length : 0,
      packet_traceability_complete: Boolean(pipelineState.packet_traceability_complete),
      approved_or_ready_tasks: pipelineState.approved_or_ready_total || 0,
      open_evolution_changes: Array.isArray(evolutionState.changes) ? evolutionState.changes.filter((change) => String(change.status || "").toLowerCase() !== "verified").length : 0
    },
    file_inventory: fileInventory,
    folder_inventory: folderInventory,
    extension_inventory: extensionInventory,
    top_level_folders: folders,
    plugin_loader: {
      total_plugins: pluginLoader.total_plugins,
      active_plugins: pluginLoader.active_plugins,
      disabled_plugins: pluginLoader.disabled_plugins,
      kvdf_dev: summarizePlugin(kvdfDevPlugin)
    },
    command_registry: {
      total: commandRegistry.length,
      by_category: commandCategorySummary,
      by_owner: commandOwnerSummary,
      entries: commandRegistry.map((entry) => ({
        key: entry.key,
        aliases: entry.aliases || [],
        category: entry.category,
        stage: entry.stage,
        owner: entry.owner,
        purpose: entry.purpose,
        next_commands: entry.next_commands || []
      }))
    },
    repository_structure: structure,
    maintenance_inspection: inspection,
    maintenance_relocation: relocation,
    pipeline_state: {
      workspace_exists: Boolean(pipelineState.workspace_exists),
      current_delivery_mode: pipelineState.current_delivery_mode || null,
      current_blueprint: pipelineState.current_blueprint || null,
      packet_traceability_complete: Boolean(pipelineState.packet_traceability_complete),
      approved_or_ready_total: pipelineState.approved_or_ready_total || 0,
      task_trash_total: pipelineState.task_trash_total || 0
    },
    evolution: {
      summary: evolutionSummary,
      total_changes: Array.isArray(evolutionState.changes) ? evolutionState.changes.length : 0,
      active_priorities: Array.isArray(evolutionState.development_priorities) ? evolutionState.development_priorities.filter((item) => !["done", "archived", "rejected"].includes(String(item.status || "").toLowerCase())).length : 0
    },
    cleanup_queue: cleanupQueue,
    recommendations: buildCleanupRecommendations({
      structure,
      pluginLoader,
      pipelineState,
      evolutionSummary,
      inspection,
      relocation,
      cleanupQueue
    }),
    approval_commands: [
      "kvdf cleaner approve --confirm",
      "kvdf cleaner execute",
      "kvdf cleaner finalize"
    ],
    next_exact_action: "kvdf cleaner approve --confirm"
  };
}

function renderCleanupAuditReport(report, table) {
  const cleanupRows = (report.cleanup_queue || []).map((item) => [
    item.area || "",
    item.reason || "",
    item.next_action || ""
  ]);
  const pluginRows = report.plugin_loader && report.plugin_loader.kvdf_dev ? [[
    report.plugin_loader.kvdf_dev.plugin_id || "kvdf-dev",
    report.plugin_loader.kvdf_dev.status || "",
    report.plugin_loader.kvdf_dev.track || "",
    (report.plugin_loader.kvdf_dev.required_folders || []).join(", "),
    (report.plugin_loader.kvdf_dev.command_surface || []).length
  ]] : [["kvdf-dev", "missing", "", "", 0]];
  const topFolders = (report.folder_inventory || []).slice(0, 12).map((item) => [
    item.folder,
    String(item.count),
    item.primary_extension || "",
    item.role || ""
  ]);
  const extensionRows = (report.extension_inventory || []).slice(0, 12).map((item) => [
    item.extension,
    String(item.count)
  ]);
  const inspectionRows = (report.maintenance_inspection && Array.isArray(report.maintenance_inspection.findings))
    ? report.maintenance_inspection.findings.slice(0, 20).map((item) => [
      item.category || "",
      item.file || "",
      String(item.line || ""),
      item.excerpt || ""
    ])
    : [];
  const inspectionSummaryRows = report.maintenance_inspection ? [
    ["Analysis mode", report.maintenance_inspection.analysis_mode || "slow"],
    ["Scanned files", String(report.maintenance_inspection.scanned_files || 0)],
    ["Dead code candidates", String(report.maintenance_inspection.category_counts ? report.maintenance_inspection.category_counts.dead_code_candidates || 0 : 0)],
    ["Stale docs candidates", String(report.maintenance_inspection.category_counts ? report.maintenance_inspection.category_counts.stale_docs || 0 : 0)],
    ["Spec drift candidates", String(report.maintenance_inspection.category_counts ? report.maintenance_inspection.category_counts.spec_drift_candidates || 0 : 0)],
    ["Blocked flow candidates", String(report.maintenance_inspection.category_counts ? report.maintenance_inspection.category_counts.deadlock_candidates || 0 : 0)]
  ] : [];

  return [
    "# KVDF System Cleanup Audit",
    "",
    `- Report ID: ${report.cleanup_id || "n/a"}`,
    `- Generated at: ${report.generated_at || "n/a"}`,
    `- Approval status: ${report.approval_status || "pending"}`,
    `- Next exact action: ${report.next_exact_action || "kvdf cleaner approve --confirm"}`,
    "",
    "## Summary",
    "",
    table(["Metric", "Value"], [
      ["Workspace root", report.summary ? report.summary.workspace_root || "" : ""],
      ["Workflow mode", report.workflow_mode || "fast"],
      ["Total files", report.summary ? String(report.summary.total_files || 0) : "0"],
      ["Total folders", report.summary ? String(report.summary.total_folders || 0) : "0"],
      ["Plugin total", report.summary ? String(report.summary.plugin_total || 0) : "0"],
      ["Active plugins", report.summary ? String(report.summary.active_plugins || 0) : "0"],
      ["Commands", report.summary ? String(report.summary.command_total || 0) : "0"],
      ["Unknown folders", report.summary ? String(report.summary.unknown_folders || 0) : "0"],
      ["Traceability complete", report.summary && report.summary.packet_traceability_complete ? "yes" : "no"],
      ["Approved/ready tasks", report.summary ? String(report.summary.approved_or_ready_tasks || 0) : "0"]
    ]),
    "",
    "## Cleanup Queue",
    "",
    cleanupRows.length ? table(["Area", "Reason", "Next action"], cleanupRows) : "No cleanup queue items were generated.",
    "",
    "## Top-Level Folders",
    "",
    topFolders.length ? table(["Folder", "Files", "Primary extension", "Role"], topFolders) : "No folder inventory found.",
    "",
    "## File Extensions",
    "",
    extensionRows.length ? table(["Extension", "Files"], extensionRows) : "No file inventory found.",
    "",
    "## Maintenance Inspection",
    "",
    report.maintenance_inspection ? table(["Metric", "Value"], inspectionSummaryRows) : "No maintenance inspection was generated.",
    "",
    report.maintenance_inspection && inspectionRows.length ? table(["Category", "File", "Line", "Excerpt"], inspectionRows) : "No inspection findings recorded.",
    "",
    "## Relocation Plan",
    "",
    report.maintenance_relocation ? renderMaintenanceRelocationSummary(report.maintenance_relocation, table) : "No relocation plan was generated.",
    "",
    "## kvdf-dev Plugin",
    "",
    table(["Plugin", "Status", "Track", "Required folders", "Commands"], pluginRows),
    "",
    "## Recommendations",
    "",
    ...(Array.isArray(report.recommendations) && report.recommendations.length ? report.recommendations.map((item) => `- ${item}`) : ["- No recommendations recorded."]),
    "",
    "## Approval Commands",
    "",
    ...(Array.isArray(report.approval_commands) && report.approval_commands.length ? report.approval_commands.map((item) => `- ${item}`) : ["- kvdf cleaner approve --confirm"])
  ].join("\n");
}

function buildCleanupSummaryReport(report = {}) {
  const queue = Array.isArray(report.cleanup_queue) ? report.cleanup_queue : [];
  const recommendations = Array.isArray(report.recommendations) ? report.recommendations : [];
  const lifecycle = {
    status: report.status || null,
    approval_status: report.approval_status || null,
    completed_at: report.completed_at || null,
    approved_at: report.approved_at || null,
    evolution_change_id: report.evolution_change_id || null,
    trashed_tasks: Array.isArray(report.trashed_tasks) ? report.trashed_tasks.length : 0,
    remaining_tasks: Array.isArray(report.remaining_tasks) ? report.remaining_tasks.length : 0,
    blocked_tasks: String(report.status || "").toLowerCase() === "completed"
      ? 0
      : Array.isArray(report.finalization_blockers)
        ? report.finalization_blockers.length
        : 0
  };

  return {
    report_type: "kvdf_system_cleanup_summary",
    generated_at: new Date().toISOString(),
    source_report_type: report.report_type || null,
    source_report_path_json: report.report_path_json || CLEANUP_AUDIT_JSON_PATH,
    source_report_path_md: report.report_path_md || CLEANUP_AUDIT_MD_PATH,
    report_path_json: CLEANUP_SUMMARY_JSON_PATH,
    report_path_md: CLEANUP_SUMMARY_MD_PATH,
    cleanup_id: report.cleanup_id || null,
    status: report.status || "unknown",
    approval_status: report.approval_status || "pending",
    next_exact_action: report.next_exact_action || "kvdf cleaner cleanup",
    clean_status_line: formatCleanupStatusLine({
      status: report.status || "unknown",
      approval_status: report.approval_status || "pending",
      cleanup_queue_count: queue.length,
      lifecycle,
      next_exact_action: report.next_exact_action || "kvdf cleaner cleanup"
    }),
    summary: {
      workspace_root: report.summary ? report.summary.workspace_root || null : null,
      total_files: report.summary ? report.summary.total_files || 0 : 0,
      total_folders: report.summary ? report.summary.total_folders || 0 : 0,
      plugin_total: report.summary ? report.summary.plugin_total || 0 : 0,
      active_plugins: report.summary ? report.summary.active_plugins || 0 : 0,
      command_total: report.summary ? report.summary.command_total || 0 : 0,
      unknown_folders: report.summary ? report.summary.unknown_folders || 0 : 0,
      packet_traceability_complete: Boolean(report.summary && report.summary.packet_traceability_complete),
      approved_or_ready_tasks: report.summary ? report.summary.approved_or_ready_tasks || 0 : 0
    },
    lifecycle,
    cleanup_queue_count: queue.length,
    queue_highlights: queue.slice(0, 4).map((item) => ({
      area: item.area || null,
      next_action: item.next_action || null
    })),
    recommendations: recommendations.slice(0, 3),
    approval_commands: Array.isArray(report.approval_commands) ? report.approval_commands.slice(0, 3) : ["kvdf cleaner approve --confirm"],
    plugin_focus: report.plugin_loader && report.plugin_loader.kvdf_dev ? {
      plugin_id: report.plugin_loader.kvdf_dev.plugin_id || "kvdf-dev",
      status: report.plugin_loader.kvdf_dev.status || null,
      track: report.plugin_loader.kvdf_dev.track || null,
      command_surface: Array.isArray(report.plugin_loader.kvdf_dev.command_surface) ? report.plugin_loader.kvdf_dev.command_surface : []
    } : null
  };
}

function buildMaintenanceInspectionReport(deps = {}) {
  const readJsonFile = deps.readJsonFile || (() => ({}));
  const fileExists = deps.fileExists || (() => false);
  const files = listFiles(".", null, true).filter((file) => !isIgnoredPath(file));
  const folders = listDirectories(".");
  const inspection = buildMaintenanceInspection(files, {
    readTextFile,
    analysis_mode: deps.analysis_mode || "slow"
  });
  const structure = buildRepositoryStructureReport();
  const pipelineState = buildPipelineState({ readJsonFile, fileExists });
  const evolutionState = fileExists(".kabeeri/evolution.json") ? readJsonFile(".kabeeri/evolution.json") : { changes: [] };
  const evolutionSummary = buildEvolutionSummary(evolutionState);

  return {
    report_type: "kvdf_maintenance_inspection_report",
    generated_at: new Date().toISOString(),
    report_path_json: MAINTENANCE_INSPECTION_JSON_PATH,
    report_path_md: MAINTENANCE_INSPECTION_MD_PATH,
    source_bundle: "kvdf-dev",
    workspace_root: repoRoot(),
    analysis_mode: deps.analysis_mode || "slow",
    total_files: files.length,
    total_folders: folders.length,
    repository_structure: structure,
    pipeline_state: {
      packet_traceability_complete: Boolean(pipelineState.packet_traceability_complete),
      approved_or_ready_total: pipelineState.approved_or_ready_total || 0
    },
    evolution: {
      summary: evolutionSummary,
      total_changes: Array.isArray(evolutionState.changes) ? evolutionState.changes.length : 0
    },
    inspection,
    recommendations: buildMaintenanceInspectionRecommendations(inspection),
    next_exact_action: buildMaintenanceInspectionNextAction(inspection)
  };
}

function renderCleanupSummaryReport(report, table) {
  const queueRows = (report.queue_highlights || []).map((item) => [
    item.area || "",
    item.next_action || ""
  ]);
  const lifecycleRows = [
    ["Status", report.status || "unknown"],
    ["Approval status", report.approval_status || "pending"],
    ["Next exact action", report.next_exact_action || "kvdf cleaner cleanup"],
    ["Cleanup queue items", String(report.cleanup_queue_count || 0)],
    ["Trashed tasks", String(report.lifecycle ? report.lifecycle.trashed_tasks || 0 : 0)],
    ["Remaining tasks", String(report.lifecycle ? report.lifecycle.remaining_tasks || 0 : 0)],
    ["Blocked tasks", String(report.lifecycle ? report.lifecycle.blocked_tasks || 0 : 0)]
  ];

  return [
    "# KVDF Cleaner Summary",
    "",
    `Clean status: ${report.clean_status_line || formatCleanupStatusLine(report)}`,
    "",
    `- Cleanup ID: ${report.cleanup_id || "n/a"}`,
    `- Source report: ${report.source_report_path_json || CLEANUP_AUDIT_JSON_PATH}`,
    `- Generated at: ${report.generated_at || "n/a"}`,
    "",
    "## Lifecycle",
    "",
    table(["Metric", "Value"], lifecycleRows),
    "",
    "## Queue Highlights",
    "",
    queueRows.length ? table(["Area", "Next action"], queueRows) : "No cleanup queue items were generated.",
    "",
    "## Recommendations",
    "",
    ...(Array.isArray(report.recommendations) && report.recommendations.length ? report.recommendations.map((item) => `- ${item}`) : ["- No recommendations recorded."]),
    "",
    "## Approval Commands",
    "",
    ...(Array.isArray(report.approval_commands) && report.approval_commands.length ? report.approval_commands.map((item) => `- ${item}`) : ["- kvdf cleaner approve --confirm"])
  ].join("\n");
}

function formatCleanupStatusLine(report = {}) {
  const status = report.status || "unknown";
  const approval = report.approval_status || "pending";
  const queue = Number(report.cleanup_queue_count || 0);
  const trashed = report.lifecycle ? Number(report.lifecycle.trashed_tasks || 0) : 0;
  const remaining = report.lifecycle ? Number(report.lifecycle.remaining_tasks || 0) : 0;
  const next = String(report.next_exact_action || "kvdf cleaner cleanup").trim();
  return `${status} / ${approval} / queue ${queue} / trashed ${trashed} / remaining ${remaining} / next ${next}`;
}

function persistCleanupSummaryReport(report, deps) {
  deps.writeJsonFile(CLEANUP_SUMMARY_JSON_PATH, report);
  deps.writeTextFile(CLEANUP_SUMMARY_MD_PATH, `${renderCleanupSummaryReport(report, deps.table || (() => ""))}\n`);
}

function persistMaintenanceInspectionReport(report, deps) {
  deps.writeJsonFile(MAINTENANCE_INSPECTION_JSON_PATH, report);
  deps.writeTextFile(MAINTENANCE_INSPECTION_MD_PATH, `${renderMaintenanceInspectionReport(report, deps.table || (() => ""))}\n`);
}

function renderMaintenanceInspectionReport(report, table) {
  const inspectionRows = report.inspection && Array.isArray(report.inspection.findings)
    ? report.inspection.findings.slice(0, 40).map((item) => [
      item.category || "",
      item.file || "",
      String(item.line || ""),
      item.excerpt || ""
    ])
    : [];
  const summaryRows = report.inspection ? [
    ["Scanned files", String(report.inspection.scanned_files || 0)],
    ["Dead code candidates", String(report.inspection.category_counts ? report.inspection.category_counts.dead_code_candidates || 0 : 0)],
    ["Stale docs candidates", String(report.inspection.category_counts ? report.inspection.category_counts.stale_docs || 0 : 0)],
    ["Spec drift candidates", String(report.inspection.category_counts ? report.inspection.category_counts.spec_drift_candidates || 0 : 0)],
    ["Blocked flow candidates", String(report.inspection.category_counts ? report.inspection.category_counts.deadlock_candidates || 0 : 0)]
  ] : [];
  const topFilesRows = Array.isArray(report.inspection && report.inspection.top_files)
    ? report.inspection.top_files.slice(0, 10).map((item) => [
      item.file || "",
      String(item.count || 0)
    ])
    : [];

  return [
    "# KVDF Maintenance Inspection",
    "",
    `- Report path: ${report.report_path_json || MAINTENANCE_INSPECTION_JSON_PATH}`,
    `- Generated at: ${report.generated_at || "n/a"}`,
    `- Next exact action: ${report.next_exact_action || "Review the maintenance inspection findings."}`,
    "",
    "## Summary",
    "",
    table(["Metric", "Value"], [
      ["Workspace root", report.workspace_root || ""],
      ["Analysis mode", report.analysis_mode || "slow"],
      ["Total files", String(report.total_files || 0)],
      ["Total folders", String(report.total_folders || 0)],
      ["Packet traceability complete", report.pipeline_state && report.pipeline_state.packet_traceability_complete ? "yes" : "no"],
      ["Approved or ready tasks", String(report.pipeline_state ? report.pipeline_state.approved_or_ready_total || 0 : 0)],
      ["Open evolution changes", String(report.evolution ? report.evolution.total_changes || 0 : 0)]
    ]),
    "",
    "## Inspection Metrics",
    "",
    table(["Metric", "Value"], summaryRows),
    "",
    "## Top Files",
    "",
    topFilesRows.length ? table(["File", "Findings"], topFilesRows) : "No files were flagged.",
    "",
    "## Findings",
    "",
    inspectionRows.length ? table(["Category", "File", "Line", "Excerpt"], inspectionRows) : "No inspection findings recorded.",
    "",
    "## Recommendations",
    "",
    ...(Array.isArray(report.recommendations) && report.recommendations.length ? report.recommendations.map((item) => `- ${item}`) : ["- No maintenance inspection issues were found."])
  ].join("\n");
}

function buildCleanupEvolutionDescription(report) {
  const areas = Array.isArray(report.cleanup_queue) ? report.cleanup_queue.map((item) => item.area).filter(Boolean).join(", ") : "cli, docs, reports, tests";
  return `Repo-wide cleanup audit for ${areas}. Save the organized audit, approve the cleanup, create the Evolution plan, execute the governed cleanup tasks, and finalize completed items into task trash.`;
}

function buildMaintenanceInspectionRecommendations(inspection = {}) {
  const counts = inspection.category_counts || {};
  const recommendations = [];
  if (Number(counts.dead_code_candidates || 0) > 0) {
    recommendations.push(`Review ${counts.dead_code_candidates} dead-code candidates and remove or consolidate the unused surface.`);
  }
  if (Number(counts.stale_docs || 0) > 0) {
    recommendations.push(`Refresh ${counts.stale_docs} stale-doc candidates and align wording with the current source of truth.`);
  }
  if (Number(counts.spec_drift_candidates || 0) > 0) {
    recommendations.push(`Correct ${counts.spec_drift_candidates} spec-drift candidates against the live implementation.`);
  }
  if (Number(counts.deadlock_candidates || 0) > 0) {
    recommendations.push(`Resolve ${counts.deadlock_candidates} blocked-flow candidates so workflow files stop describing waiting states as final state.`);
  }
  if (!recommendations.length) {
    recommendations.push("No maintenance inspection issues were found.");
  }
  return recommendations;
}

function buildMaintenanceInspectionNextAction(inspection = {}) {
  const counts = inspection.category_counts || {};
  if (Number(counts.dead_code_candidates || 0) > 0) return "Review dead-code candidates file by file.";
  if (Number(counts.stale_docs || 0) > 0) return "Refresh stale documentation and compatibility wording.";
  if (Number(counts.spec_drift_candidates || 0) > 0) return "Correct spec drift against the current source of truth.";
  if (Number(counts.deadlock_candidates || 0) > 0) return "Unblock workflow files that still describe waiting or blocked states.";
  return "No maintenance inspection action is needed.";
}

function buildMaintenanceRelocationReport(deps = {}, options = {}) {
  const aliases = deps.assetAliases || getAssetAliases();
  const candidates = [];
  const aliasIndex = buildRelocationAliasIndex(aliases);
  const workflowMode = normalizeWorkflowMode(options.workflow_mode || "slow");
  const reviewMode = Boolean(options.review_mode) || workflowMode === "slow";
  const reviewThreshold = normalizeRelocationThreshold(options.review_threshold, 0.9);
  for (const [source, target] of Object.entries(aliases)) {
    if (!source || !target || source === target) continue;
    const sourceAbs = path.join(repoRoot(), source);
    if (!fs.existsSync(sourceAbs)) continue;
    const sourceStat = fs.statSync(sourceAbs);
    const review = buildRelocationReviewEvidence(source);
    if (reviewMode && sourceStat.isDirectory() && review.review_file_count === 0 && review.review_folder_count === 0) continue;
    const targetAbs = path.join(repoRoot(), target);
    const targetExists = fs.existsSync(targetAbs);
    const confidence = 1;
    if (reviewMode && confidence < reviewThreshold) continue;
    candidates.push({
      source,
      target,
      kind: sourceStat.isDirectory() ? "folder" : "file",
      match_type: "exact_alias",
      confidence,
      review_status: "approved",
      review_file_count: review.review_file_count,
      review_folder_count: review.review_folder_count,
      review_items: review.review_items,
      source_exists: true,
      target_exists: targetExists,
      status: targetExists ? (sourceStat.isDirectory() ? "merge" : "conflict") : "move",
      reason: `Relocate ${source} into canonical path ${target}.`
    });
  }
  if (workflowMode === "slow") {
    for (const entry of listDirectories(".")) {
      if (!entry || entry.startsWith(".")) continue;
      const normalizedEntry = normalizeRelocationKey(entry);
      const match = aliasIndex.get(normalizedEntry);
      if (!match || match.alias === entry) continue;
      const sourceAbs = path.join(repoRoot(), entry);
      if (!fs.existsSync(sourceAbs) || !fs.statSync(sourceAbs).isDirectory()) continue;
      const review = buildRelocationReviewEvidence(entry);
      if (reviewMode && review.review_file_count === 0 && review.review_folder_count === 0) continue;
      const targetAbs = path.join(repoRoot(), match.target);
      const targetExists = fs.existsSync(targetAbs);
      const confidence = 0.92;
      if (reviewMode && confidence < reviewThreshold) continue;
      candidates.push({
        source: entry,
        target: match.target,
        kind: "folder",
        match_type: "fuzzy_alias",
        confidence,
        source_alias: match.alias,
        review_status: review.review_file_count > 0 ? "approved" : "needs_review",
        review_file_count: review.review_file_count,
        review_folder_count: review.review_folder_count,
        review_items: review.review_items,
        source_exists: true,
        target_exists: targetExists,
        status: targetExists ? "merge" : "move",
        reason: `Folder ${entry} normalizes to canonical alias ${match.alias} and should live at ${match.target}.`
      });
    }
  }
  const seen = new Set();
  const deduped = [];
  for (const candidate of candidates) {
    const key = `${candidate.source}=>${candidate.target}::${candidate.match_type || "exact_alias"}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(candidate);
  }
  deduped.sort((left, right) => {
    if (left.source === right.source) return (left.target || "").localeCompare(right.target || "");
    return left.source.localeCompare(right.source);
  });
  return {
    report_type: "kvdf_maintenance_relocation",
    generated_at: new Date().toISOString(),
    report_path_json: MAINTENANCE_RELOCATION_JSON_PATH,
    report_path_md: MAINTENANCE_RELOCATION_MD_PATH,
    source_bundle: "kvdf-dev",
    workspace_root: repoRoot(),
    workflow_mode: workflowMode,
    review_mode: reviewMode,
    review_threshold: reviewThreshold,
    status: deduped.length ? "preview" : "clear",
    candidate_count: deduped.length,
    candidates: deduped,
    applied_moves: [],
    blocked_moves: [],
    recommendations: buildMaintenanceRelocationRecommendations(deduped),
    next_exact_action: deduped.length ? "Run `kvdf cleaner relocate --apply` to move mislocated files and folders." : "No relocation action is needed."
  };
}

function buildMaintenanceRelocationRecommendations(candidates = []) {
  if (!Array.isArray(candidates) || !candidates.length) {
    return ["No relocation candidates were found."];
  }
  return [
    `Review ${candidates.length} relocation candidate(s) against the canonical alias map.`,
    "Inspect the per-file evidence before applying the relocation plan to move or merge exact and fuzzy alias-root folders."
  ];
}

function renderMaintenanceRelocationSummary(report, table) {
  const candidateRows = Array.isArray(report.candidates) ? report.candidates.map((item) => [
    item.source || "",
    item.target || "",
    item.kind || "",
    item.match_type || "",
    item.review_status || "",
    item.status || "",
    item.reason || ""
  ]) : [];
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
  const reviewEvidenceRows = [];
  for (const item of Array.isArray(report.candidates) ? report.candidates : []) {
    const reviewItems = Array.isArray(item.review_items) ? item.review_items : [];
    if (!reviewItems.length) continue;
    reviewEvidenceRows.push([
      item.source || "",
      String(item.review_file_count || reviewItems.length || 0),
      reviewItems.slice(0, 8).join(", ")
    ]);
  }
  return [
    "## Relocation Summary",
    "",
    table(["Metric", "Value"], summaryRows),
    "",
    candidateRows.length ? table(["Source", "Target", "Kind", "Match type", "Review status", "Status", "Reason"], candidateRows) : "No relocation candidates were found.",
    "",
    "## Review Evidence",
    "",
    reviewEvidenceRows.length ? table(["Source", "File count", "Files"], reviewEvidenceRows) : "No per-file review evidence recorded.",
    "",
    "## Relocation Recommendations",
    "",
    ...(Array.isArray(report.recommendations) && report.recommendations.length ? report.recommendations.map((item) => `- ${item}`) : ["- No relocation candidates were found."])
  ].join("\n");
}

function persistMaintenanceRelocationReport(report, deps) {
  deps.writeJsonFile(MAINTENANCE_RELOCATION_JSON_PATH, report);
  deps.writeTextFile(MAINTENANCE_RELOCATION_MD_PATH, `${renderMaintenanceRelocationReport(report, deps.table || (() => ""))}\n`);
}

function renderMaintenanceRelocationReport(report, table) {
  return [
    "# KVDF Maintenance Relocation",
    "",
    `- Report path: ${report.report_path_json || MAINTENANCE_RELOCATION_JSON_PATH}`,
    `- Generated at: ${report.generated_at || "n/a"}`,
    `- Next exact action: ${report.next_exact_action || "No relocation action is needed."}`,
    "",
    renderMaintenanceRelocationSummary(report, table)
  ].join("\n");
}

function applyMaintenanceRelocationPlan(report, deps = {}) {
  const appliedMoves = [];
  const blockedMoves = [];
  for (const candidate of Array.isArray(report.candidates) ? report.candidates : []) {
    const sourceAbs = path.join(repoRoot(), candidate.source);
    const targetAbs = path.join(repoRoot(), candidate.target);
    if (!fs.existsSync(sourceAbs)) {
      blockedMoves.push({ ...candidate, reason: "Source path no longer exists." });
      continue;
    }
    if (candidate.kind === "file") {
      if (fs.existsSync(targetAbs)) {
        blockedMoves.push({ ...candidate, reason: "Target file already exists." });
        continue;
      }
      movePath(candidate.source, candidate.target);
      appliedMoves.push({ ...candidate, action: "moved" });
      continue;
    }

    if (!fs.existsSync(targetAbs)) {
      movePath(candidate.source, candidate.target);
      appliedMoves.push({ ...candidate, action: "moved" });
      continue;
    }

    const mergeResult = mergeDirectoryContents(candidate.source, candidate.target);
    if (mergeResult.moved.length) {
      appliedMoves.push({ ...candidate, action: "merged", moved_children: mergeResult.moved, blocked_children: mergeResult.blocked });
    } else {
      blockedMoves.push({ ...candidate, reason: "No files could be merged into the canonical target." });
    }
  }

  report.status = blockedMoves.length ? "partial" : "applied";
  report.applied_at = new Date().toISOString();
  report.applied_moves = appliedMoves;
  report.blocked_moves = blockedMoves;
  report.next_exact_action = blockedMoves.length ? "Review blocked relocation candidates and rerun `kvdf cleaner relocate --apply`." : "Relocation cycle complete.";
  return report;
}

function normalizeRelocationKey(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function normalizeWorkflowMode(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "slow" || normalized === "strict") return "slow";
  return "fast";
}

function normalizeRelocationThreshold(value, fallback = 0.9) {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
    return parsed;
  }
  return fallback;
}

function buildRelocationReviewEvidence(relativePath) {
  const reviewItems = [];
  const fileItems = listFiles(relativePath, null, true);
  const folderItems = listDirectories(relativePath);
  for (const file of fileItems.slice(0, 12)) {
    reviewItems.push(file);
  }
  for (const folder of folderItems.slice(0, 12)) {
    reviewItems.push(path.posix.join(relativePath.replace(/\\/g, "/"), folder));
  }
  return {
    review_file_count: fileItems.length,
    review_folder_count: folderItems.length,
    review_items: reviewItems
  };
}

function buildRelocationAliasIndex(aliases = {}) {
  const index = new Map();
  for (const [alias, target] of Object.entries(aliases)) {
    const normalizedAlias = normalizeRelocationKey(alias);
    if (!normalizedAlias || index.has(normalizedAlias)) continue;
    index.set(normalizedAlias, {
      alias,
      target,
      normalized_alias: normalizedAlias
    });
  }
  return index;
}

function mergeDirectoryContents(sourceRelativePath, targetRelativePath) {
  const sourceAbs = path.join(repoRoot(), sourceRelativePath);
  const targetAbs = path.join(repoRoot(), targetRelativePath);
  if (!fs.existsSync(sourceAbs) || !fs.statSync(sourceAbs).isDirectory()) {
    return { moved: [], blocked: [sourceRelativePath] };
  }
  fs.mkdirSync(targetAbs, { recursive: true });
  const moved = [];
  const blocked = [];
  for (const entry of fs.readdirSync(sourceAbs, { withFileTypes: true })) {
    const sourceChildAbs = path.join(sourceAbs, entry.name);
    const targetChildAbs = path.join(targetAbs, entry.name);
    if (!fs.existsSync(targetChildAbs)) {
      fs.renameSync(sourceChildAbs, targetChildAbs);
      moved.push(entry.name);
      continue;
    }
    if (entry.isDirectory() && fs.statSync(targetChildAbs).isDirectory()) {
      const nested = mergeDirectoryContents(path.posix.join(sourceRelativePath, entry.name), path.posix.join(targetRelativePath, entry.name));
      moved.push(...nested.moved.map((name) => `${entry.name}/${name}`));
      blocked.push(...nested.blocked.map((name) => `${entry.name}/${name}`));
      continue;
    }
    blocked.push(entry.name);
  }
  if (!fs.readdirSync(sourceAbs).length) {
    fs.rmdirSync(sourceAbs);
  }
  return { moved, blocked };
}

function buildCleanupEvolutionAreas(report) {
  const areas = new Set(["cli", "docs", "reports", "tests", "tasks", "capabilities"]);
  if (report.summary && report.summary.unknown_folders > 0) areas.add("schemas");
  if (report.pipeline_state && !report.pipeline_state.packet_traceability_complete) areas.add("ai_context");
  if (report.maintenance_inspection && report.maintenance_inspection.category_counts && report.maintenance_inspection.category_counts.dead_code_candidates > 0) areas.add("dead_code");
  if (report.maintenance_inspection && report.maintenance_inspection.category_counts && report.maintenance_inspection.category_counts.stale_docs > 0) areas.add("docs");
  if (report.maintenance_inspection && report.maintenance_inspection.category_counts && report.maintenance_inspection.category_counts.deadlock_candidates > 0) areas.add("pipeline");
  if (report.maintenance_relocation && report.maintenance_relocation.candidate_count > 0) areas.add("relocation");
  if ((report.cleanup_queue || []).some((item) => String(item.area || "").toLowerCase().includes("plugin"))) areas.add("dashboard");
  return Array.from(areas);
}

function buildCleanupQueue(context = {}) {
  const inspection = context.inspection || {};
  const counts = inspection.category_counts || {};
  const queue = [
    {
      area: "repo-structure",
      reason: (context.structure.validation && Array.isArray(context.structure.validation.unknown_folders) && context.structure.validation.unknown_folders.length)
        ? `Classify ${context.structure.validation.unknown_folders.join(", ")} into the repository map.`
        : "Keep the repository foldering map authoritative."
      ,
      next_action: "Review the structure validation and remove folder drift."
    },
    {
      area: "kvdf-dev",
      reason: context.pluginLoader && context.pluginLoader.plugins && context.pluginLoader.plugins.length
        ? "Keep the framework-development bundle aligned with its manifest, commands, docs, and runtime."
        : "No plugin bundles were discovered in the current workspace.",
      next_action: "Review the kvdf-dev plugin bundle and command surface."
    },
    {
      area: "pipeline",
      reason: context.pipelineState && context.pipelineState.packet_traceability_complete
        ? "The packet traceability chain is healthy."
        : "The packet traceability chain still needs review before execution.",
      next_action: context.pipelineState && context.pipelineState.packet_traceability_complete
        ? "Keep the execution gates in sync."
        : "Complete traceability before starting the cleanup execution."
    },
    {
      area: "dead-code",
      reason: Number(counts.dead_code_candidates || 0) > 0
        ? `Review ${counts.dead_code_candidates} file(s) flagged as dead-code candidates by the file inspection pass.`
        : "Run the file inspection pass to look for orphaned exports, dead branches, and stale compatibility shims.",
      next_action: "Review dead-code candidates file by file and remove or consolidate the unused surface."
    },
    {
      area: "stale-docs",
      reason: Number(counts.stale_docs || 0) > 0
        ? `Review ${counts.stale_docs} file(s) with stale wording, legacy aliases, or future-only language.`
        : "Run the file inspection pass to look for stale wording and compatibility drift in docs.",
      next_action: "Inspect docs one by one and refresh outdated wording, references, and status claims."
    },
    {
      area: "spec-drift",
      reason: Number(counts.spec_drift_candidates || 0) > 0
        ? `Review ${counts.spec_drift_candidates} file(s) flagged for possible wrong-spec or drift signals.`
        : "Run the file inspection pass to look for wrong-spec or outdated assumption signals.",
      next_action: "Compare each flagged file with the current source of truth and correct drifted specs."
    },
    {
      area: "blocked-flows",
      reason: Number(counts.deadlock_candidates || 0) > 0
        ? `Review ${counts.deadlock_candidates} workflow file(s) with blocked or waiting-state signals.`
        : "Run the workflow inspection pass to look for blocked or waiting-state deadlocks.",
      next_action: "Resolve blocked workflow states and make finalization paths idempotent."
    },
    ...(context.relocation && Number(context.relocation.candidate_count || 0) > 0 ? [{
      area: "relocate",
      reason: `Move ${context.relocation.candidate_count} alias-root file or folder candidate(s) into canonical paths.`,
      next_action: "Apply the relocation plan to merge or move mislocated files and folders."
    }] : [])
  ];
  return queue;
}

function buildCleanupRecommendations(context = {}) {
  const recommendations = [];
  const unknownFolders = context.structure && context.structure.validation && Array.isArray(context.structure.validation.unknown_folders)
    ? context.structure.validation.unknown_folders
    : [];
  if (unknownFolders.length) {
    recommendations.push(`Classify unknown top-level folders: ${unknownFolders.join(", ")}.`);
  }
  if (context.pluginLoader && context.pluginLoader.kvdf_dev && context.pluginLoader.kvdf_dev.status === "disabled") {
    recommendations.push("Enable kvdf-dev before running the cleanup workflow.");
  }
  if (context.pipelineState && !context.pipelineState.packet_traceability_complete) {
    recommendations.push("Complete the packet traceability chain before starting execution.");
  }
  if (context.inspection && context.inspection.category_counts && context.inspection.category_counts.dead_code_candidates > 0) {
    recommendations.push(`Review ${context.inspection.category_counts.dead_code_candidates} dead-code candidates flagged by the file inspection pass.`);
  }
  if (context.inspection && context.inspection.category_counts && context.inspection.category_counts.stale_docs > 0) {
    recommendations.push(`Refresh ${context.inspection.category_counts.stale_docs} stale-doc candidates flagged by the file inspection pass.`);
  }
  if (context.inspection && context.inspection.category_counts && context.inspection.category_counts.spec_drift_candidates > 0) {
    recommendations.push(`Resolve ${context.inspection.category_counts.spec_drift_candidates} possible spec-drift candidates.`);
  }
  if (context.inspection && context.inspection.category_counts && context.inspection.category_counts.deadlock_candidates > 0) {
    recommendations.push(`Unblock ${context.inspection.category_counts.deadlock_candidates} workflow deadlock candidates.`);
  }
  if (context.relocation && Number(context.relocation.candidate_count || 0) > 0) {
    recommendations.push(`Apply the relocation plan for ${context.relocation.candidate_count} mislocated file or folder candidate(s).`);
  }
  if (context.evolutionSummary && context.evolutionSummary.status && context.evolutionSummary.status !== "clean") {
    recommendations.push(`Resolve active Evolution state first: ${context.evolutionSummary.status}.`);
  }
  if (!recommendations.length) {
    recommendations.push("The workspace is ready for a cleanup approval cycle.");
  }
  return recommendations;
}

function summarizePlugin(plugin) {
  if (!plugin) return null;
  return {
    plugin_id: plugin.plugin_id || null,
    status: plugin.status || null,
    track: plugin.track || null,
    bundle_path: plugin.bundle_path || null,
    required_folders: Array.isArray(plugin.required_folders) ? plugin.required_folders : [],
    command_surface: Array.isArray(plugin.command_surface) ? plugin.command_surface : []
  };
}

function summarizeFiles(files) {
  const byRoot = new Map();
  for (const file of files) {
    const parts = String(file || "").split("/");
    const root = parts[0] || ".";
    const entry = byRoot.get(root) || { folder: root, count: 0, primary_extension: "", role: inferFolderRole(root) };
    entry.count += 1;
    byRoot.set(root, entry);
  }
  return Array.from(byRoot.values()).sort((a, b) => b.count - a.count || a.folder.localeCompare(b.folder));
}

function summarizeFolders(files) {
  const map = new Map();
  for (const file of files) {
    const parts = String(file || "").split("/");
    const folder = parts[0] || ".";
    const ext = path.extname(file).toLowerCase() || "[no extension]";
    const entry = map.get(folder) || { folder, count: 0, primary_extension: ext, role: inferFolderRole(folder) };
    entry.count += 1;
    if (!entry.primary_extension || entry.primary_extension === "[no extension]") entry.primary_extension = ext;
    map.set(folder, entry);
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count || a.folder.localeCompare(b.folder));
}

function summarizeExtensions(files) {
  const map = new Map();
  for (const file of files) {
    const ext = path.extname(file).toLowerCase() || "[no extension]";
    const entry = map.get(ext) || { extension: ext, count: 0 };
    entry.count += 1;
    map.set(ext, entry);
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count || a.extension.localeCompare(b.extension));
}

function summarizeCommands(commands, key) {
  const map = new Map();
  for (const command of commands) {
    const label = String(command && command[key] ? command[key] : "unknown");
    map.set(label, (map.get(label) || 0) + 1);
  }
  return Object.fromEntries(Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])));
}

function inferFolderRole(folder) {
  if (folder === "src") return "runtime source";
  if (folder === "plugins") return "plugin bundles";
  if (folder === "docs") return "documentation";
  if (folder === "tests") return "tests";
  if (folder === ".kabeeri") return "workspace state";
  return "project surface";
}

function isIgnoredPath(file) {
  const normalized = String(file || "").replace(/\\/g, "/");
  return normalized.startsWith(".git/") || normalized.startsWith("node_modules/") || normalized.startsWith(".next/") || normalized.startsWith("dist/") || normalized.startsWith("coverage/");
}

function buildMaintenanceInspection(files, deps = {}) {
  const textReader = deps.readTextFile || readTextFile;
  const analysisMode = normalizeWorkflowMode(deps.analysis_mode || "slow");
  const inspectableFiles = (Array.isArray(files) ? files : []).filter(isInspectableMaintenanceFile);
  const filesToInspect = analysisMode === "fast" ? inspectableFiles.slice(0, 120) : inspectableFiles;
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
      text = String(textReader(file) || "");
    } catch (error) {
      continue;
    }

    const fileFindings = inspectFileForMaintenanceSignals(file, text);
    if (!fileFindings.length) continue;
    for (const finding of fileFindings) {
      categoryCounts[finding.category] = (categoryCounts[finding.category] || 0) + 1;
      findings.push(finding);
    }
  }

  findings.sort((left, right) => {
    const categoryOrder = {
      dead_code_candidates: 1,
      stale_docs: 2,
      spec_drift_candidates: 3,
      deadlock_candidates: 4
    };
    const leftOrder = categoryOrder[left.category] || 99;
    const rightOrder = categoryOrder[right.category] || 99;
    return leftOrder - rightOrder || left.file.localeCompare(right.file) || left.line - right.line;
  });

  return {
    report_type: "kvdf_maintenance_inspection",
    generated_at: new Date().toISOString(),
    analysis_mode: analysisMode,
    inspection_mode: analysisMode,
    scanned_files: filesToInspect.length,
    scanned_files_total: inspectableFiles.length,
    category_counts: Object.fromEntries(Object.entries(categoryCounts).map(([key, value]) => [key, value || 0])),
    findings: findings.slice(0, 200),
    top_files: summarizeInspectionFiles(findings)
  };
}

function inspectFileForMaintenanceSignals(file, text) {
  const lines = String(text || "").split(/\r?\n/);
  const findings = [];
  const seen = new Set();
  const isWorkflowFile = /(?:^|\/)(maintainability|evolution|pipeline_guard|task_scheduler|task_trash|traceability)\.(js|ts|cjs|cts|mjs)$/.test(file);
  const rules = [
    {
      category: "dead_code_candidates",
      pattern: /\b(dead code|orphaned export|unused export|unused import|duplicate helper|dead branch|dead path)\b/i
    },
    {
      category: "stale_docs",
      pattern: /\b(TBD|TODO|FIXME|future only|planned only|legacy alias|compatibility alias|stale wording|outdated|old info|old wording)\b/i
    },
    {
      category: "spec_drift_candidates",
      pattern: /\b(wrong spec|wrong specs|spec drift|outdated spec|stale claim|future scope|possible drift)\b/i
    }
  ];

  if (isWorkflowFile) {
    rules.push({
      category: "deadlock_candidates",
      pattern: /\b(deadlock|waiting_for_completion|blocked|stuck|stalled|needs_follow_up)\b/i
    });
  }

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    for (const rule of rules) {
      if (!rule.pattern.test(line)) continue;
      if (shouldIgnoreMaintenanceSignal(file, line, rule.category)) continue;
      const key = `${file}:${rule.category}`;
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

function shouldIgnoreMaintenanceSignal(file, line, category) {
  const normalizedFile = String(file || "").replace(/\\/g, "/");
  const normalizedLine = String(line || "").toLowerCase();

  if (normalizedFile === "src/cli/services/cleanup_audit.js") {
    return true;
  }

  if (
    normalizedFile === "docs/reports/KVDF_CLEANUP_AUDIT.md" ||
    normalizedFile === "docs/reports/KVDF_CLEANUP_SUMMARY.md" ||
    normalizedFile === "docs/reports/KVDF_MAINTENANCE_INSPECTION.md" ||
    normalizedFile === "docs/reports/KVDF_MAINTENANCE_RELOCATION.md" ||
    normalizedFile === ".kabeeri/reports/kvdf_cleanup_audit.json" ||
    normalizedFile === ".kabeeri/reports/kvdf_cleanup_summary.json" ||
    normalizedFile === ".kabeeri/reports/kvdf_maintenance_inspection.json" ||
    normalizedFile === ".kabeeri/reports/kvdf_maintenance_relocation.json"
  ) {
    return true;
  }

  if (normalizedFile === "knowledge/task_tracking/task.schema.json") {
    return category === "stale_docs";
  }

  if (normalizedFile === "src/cli/commands/task_lifecycle.js") {
    return category === "stale_docs";
  }

  if (normalizedFile === "docs/reports/KVDF_MAINTENANCE_INSPECTION.md") {
    return true;
  }

  if (normalizedFile === "src/cli/ui.js") {
    return normalizedLine.includes("maintenance inspection pass") || normalizedLine.includes("file-by-file maintenance inspection pass");
  }

  if (
    normalizedFile === "src/cli/commands/evolution.js" ||
    normalizedFile === "src/cli/commands/maintainability.js" ||
    normalizedFile === "src/cli/commands/traceability.js" ||
    normalizedFile === "src/cli/services/evolution.js" ||
    normalizedFile === "src/cli/services/pipeline_guard.js"
  ) {
    return category === "deadlock_candidates";
  }

  if (normalizedFile === "tests/service.unit.test.js") {
    return normalizedLine.includes("dead code candidate") || normalizedLine.includes("wrong spec drift");
  }

  if (category === "deadlock_candidates") {
    return normalizedLine.includes("blocked by") || normalizedLine.includes("run `kvdf cleaner cleanup` first");
  }

  return false;
}

function isInspectableMaintenanceFile(file) {
  const normalized = String(file || "").replace(/\\/g, "/");
  if (!normalized) return false;
  if (isIgnoredPath(normalized)) return false;
  if (normalized.startsWith(".kabeeri/") || normalized.startsWith(".kilo/")) return false;
  if (normalized.startsWith("node_modules/")) return false;
  return (
    normalized.startsWith("src/") ||
    normalized.startsWith("docs/") ||
    normalized.startsWith("knowledge/") ||
    normalized.startsWith("plugins/") ||
    normalized.startsWith("schemas/") ||
    normalized.startsWith("tests/") ||
    normalized.startsWith("packs/") ||
    normalized.startsWith("bin/") ||
    normalized.startsWith(".clinerules/") ||
    normalized.startsWith(".github/") ||
    ["README.md", "README_AR.md", "ROADMAP.md", "CHANGELOG.md", "package.json"].includes(normalized)
  );
}

function summarizeInspectionFiles(findings) {
  const counts = new Map();
  for (const finding of findings || []) {
    const current = counts.get(finding.file) || 0;
    counts.set(finding.file, current + 1);
  }
  return Array.from(counts.entries())
    .map(([file, count]) => ({ file, count }))
    .sort((left, right) => right.count - left.count || left.file.localeCompare(right.file))
    .slice(0, 20);
}

module.exports = {
  CLEANUP_AUDIT_JSON_PATH,
  CLEANUP_AUDIT_MD_PATH,
  CLEANUP_SUMMARY_JSON_PATH,
  CLEANUP_SUMMARY_MD_PATH,
  MAINTENANCE_INSPECTION_JSON_PATH,
  MAINTENANCE_INSPECTION_MD_PATH,
  MAINTENANCE_RELOCATION_JSON_PATH,
  MAINTENANCE_RELOCATION_MD_PATH,
  buildCleanupAuditReport,
  buildCleanupSummaryReport,
  buildMaintenanceInspectionReport,
  buildMaintenanceInspectionRecommendations,
  buildMaintenanceInspectionNextAction,
  buildMaintenanceRelocationReport,
  buildMaintenanceRelocationRecommendations,
  applyMaintenanceRelocationPlan,
  persistMaintenanceRelocationReport,
  renderMaintenanceRelocationReport,
  persistMaintenanceInspectionReport,
  persistCleanupSummaryReport,
  renderCleanupAuditReport,
  renderCleanupSummaryReport,
  renderMaintenanceInspectionReport,
  buildCleanupEvolutionDescription,
  buildCleanupEvolutionAreas
};
