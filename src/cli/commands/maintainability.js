const { getCommandRegistry, formatNextExactAction } = require("../services/command_registry");
const { buildPipelineState } = require("../services/pipeline_guard");
const {
  CLEANUP_AUDIT_JSON_PATH,
  CLEANUP_AUDIT_MD_PATH,
  buildCleanupAuditReport,
  buildCleanupEvolutionAreas,
  buildCleanupEvolutionDescription,
  buildCleanupSummaryReport,
  buildMaintenanceInspectionReport,
  buildMaintenanceRelocationReport,
  applyMaintenanceRelocationPlan,
  persistMaintenanceRelocationReport,
  renderMaintenanceRelocationReport,
  persistCleanupSummaryReport,
  persistMaintenanceInspectionReport,
  renderCleanupAuditReport,
  renderCleanupSummaryReport,
  renderMaintenanceInspectionReport
} = require("../services/cleanup_audit");
const { evolution } = require("./evolution");
const kvdfDevBundle = require("../../../plugins/kvdf-dev/bootstrap");
const { DEFAULT_RETENTION_DAYS, ensureTaskTrashState, moveTaskToTrash, taskTrashSummary } = require("../services/task_trash");
const { buildTaskLifecycleState } = require("./task_lifecycle");

const MAINTAINABILITY_REPORT_PATH = ".kabeeri/reports/maintainability.json";
const MAINTAINABILITY_SCORECARD_PATH = ".kabeeri/reports/kabeeri_scorecards.json";

function loadKvdfDevBundle() {
  return kvdfDevBundle;
}

function maintainability(action, value, flags = {}, rest = [], deps = {}) {
  const { compileTaskControlPlanePacket, renderTaskControlPlanePacket, compileTaskExecutorContract, renderTaskExecutorContract, runTaskBatch, renderTaskBatchRunReport } = kvdfDevBundle;
  const {
    rawGroup = "maintainability",
    ensureWorkspace = () => {},
    readJsonFile = () => ({}),
    writeJsonFile = () => {},
    writeTextFile = () => {},
    fileExists = () => false,
    table = () => "",
    requireAnyRole = () => {},
    appendAudit = () => {},
    refreshDashboardArtifacts = () => {},
    readStateArray = () => [],
    compactTitle = (input) => String(input || "").trim(),
    nextRecordId = () => "evo-001",
    parseCsv = (input) => String(input || "").split(",").map((item) => item.trim()).filter(Boolean)
  } = deps;

  ensureWorkspace();
  const selected = String(action || value || flags.action || flags.mode || "report").trim().toLowerCase();
  const relocationReview = isRelocationReview(action, value, flags);
  const workflowMode = resolveMaintenanceMode(action, value, flags);

  if (isInspectionAction(selected)) {
    return runMaintenanceInspectionReport(flags, {
      ensureWorkspace,
      readJsonFile,
      writeJsonFile,
      writeTextFile,
      fileExists,
      table,
      analysis_mode: workflowMode
    });
  }

  if (isRelocationAction(selected)) {
    return runMaintenanceRelocationWorkflow(flags, {
      ensureWorkspace,
      readJsonFile,
      writeJsonFile,
      writeTextFile,
      fileExists,
      table,
      assetAliases: deps.assetAliases || null,
      review_mode: relocationReview || workflowMode === "slow",
      review_threshold: flags.threshold ?? flags.confidence ?? null,
      workflow_mode: workflowMode
    });
  }

  if (isCleanupAction(selected)) {
    return handleCleanupWorkflow(selected, flags, rest, {
      rawGroup,
      ensureWorkspace,
      readJsonFile,
      writeJsonFile,
      writeTextFile,
      fileExists,
      table,
      requireAnyRole,
      appendAudit,
      refreshDashboardArtifacts,
      readStateArray,
      compactTitle,
      nextRecordId,
      parseCsv,
      compileTaskControlPlanePacket,
      renderTaskControlPlanePacket,
      compileTaskExecutorContract,
      renderTaskExecutorContract,
      runTaskBatch,
      renderTaskBatchRunReport,
      workflow_mode: workflowMode
    });
  }

  if (String(rawGroup || "").toLowerCase() === "cleaner" && ["report", "show", "status"].includes(selected)) {
    return renderCleanupSummaryFromSavedAudit(flags, {
      ensureWorkspace,
      readJsonFile,
      writeJsonFile,
      writeTextFile,
      fileExists,
      table
    });
  }

  if (!["report", "show", "status"].includes(selected)) {
    throw new Error(`Unknown maintainability action: ${selected}`);
  }

  const state = buildPipelineState({ readJsonFile, fileExists });
  const scorecardReport = readJsonFile(MAINTAINABILITY_SCORECARD_PATH) || {};
  const scorecards = Array.isArray(scorecardReport.scorecards) ? scorecardReport.scorecards : [];
  const maintainabilityScorecard = scorecards.find((card) => String(card.card_id || card.evolution_change_id || "").includes("maintainability")) || null;
  const evolutionState = readJsonFile(".kabeeri/evolution.json") || {};
  const evolutionChanges = Array.isArray(evolutionState.changes) ? evolutionState.changes : [];
  const maintainabilityChange = evolutionChanges.find((change) => String(change.change_id || change.scorecard_id || "").includes("maintainability")) || null;
  const registry = getCommandRegistry();
  const sharedCommands = registry.filter((entry) => entry.owner === "shared" || entry.owner === "kvdf-dev");
  const sharedServices = [
    "src/cli/services/command_registry.js",
    "src/cli/services/pipeline_guard.js",
    "src/cli/services/task_verification.js",
    "src/cli/services/plugin_loader.js",
    "src/cli/services/questionnaire.js"
  ];

  const report = {
    report_type: "kvdf_maintainability_report",
    generated_at: new Date().toISOString(),
    report_path: MAINTAINABILITY_REPORT_PATH,
    scorecard_source: MAINTAINABILITY_SCORECARD_PATH,
    scorecard: maintainabilityScorecard ? {
      scorecard_id: maintainabilityScorecard.card_id || "maintainability",
      change_id: maintainabilityScorecard.evolution_change_id || "evo-scorecard-maintainability",
      title: maintainabilityScorecard.title || "Maintainability and shared service extraction",
      score: maintainabilityScorecard.score != null ? maintainabilityScorecard.score : null,
      band: maintainabilityScorecard.band || null,
      strength: maintainabilityScorecard.strength || null,
      weakness: maintainabilityScorecard.weakness || null,
      next_action: maintainabilityScorecard.next_action || null,
      evidence: Array.isArray(maintainabilityScorecard.evidence) ? maintainabilityScorecard.evidence : []
    } : null,
    shared_service_inventory: sharedServices,
    shared_command_inventory: sharedCommands.map((entry) => ({
      key: entry.key,
      category: entry.category,
      stage: entry.stage,
      owner: entry.owner,
      purpose: entry.purpose
    })),
    live_state: {
      workspace_exists: Boolean(state.workspace_exists),
      current_delivery_mode: state.current_delivery_mode || null,
      current_blueprint: state.current_blueprint || null,
      questionnaire_plan_id: state.current_questionnaire_plan && (state.current_questionnaire_plan.plan_id || state.current_questionnaire_plan.current_plan_id) || null,
      packet_traceability_complete: Boolean(state.packet_traceability_complete),
      approved_or_ready_tasks: state.approved_or_ready_total || 0
    },
    next_exact_action: formatNextExactAction("Run `kvdf cleaner inspect` or `kvdf maintainability inspect` to review the file-by-file maintenance inspection."),
    command_registry_total: registry.length
  };

  writeJsonFile(MAINTAINABILITY_REPORT_PATH, report);

  if (flags.output && flags.output !== true) {
    writeTextFile(flags.output, flags.json ? `${JSON.stringify(report, null, 2)}\n` : renderMaintainabilityReport(report, table));
  }

  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(renderMaintainabilityReport(report, table));
}

function renderCleanupSummaryFromSavedAudit(flags, deps) {
  const saved = loadCleanupAuditReport(deps);
  if (!saved) {
    throw new Error("Cleanup summary blocked: run `kvdf cleaner cleanup` first to generate the saved cleanup audit.");
  }
  const summary = buildCleanupSummaryReport(saved);
  persistCleanupSummaryReport(summary, deps);

  if (flags.output && flags.output !== true) {
    deps.writeTextFile(flags.output, flags.json ? `${JSON.stringify(summary, null, 2)}\n` : `${renderCleanupSummaryReport(summary, deps.table || (() => ""))}\n`);
  }

  if (flags.json) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log(renderCleanupSummaryReport(summary, deps.table || (() => "")));
}

function runMaintenanceInspectionReport(flags, deps) {
  deps.ensureWorkspace();
  const report = buildMaintenanceInspectionReport({
    readJsonFile: deps.readJsonFile,
    fileExists: deps.fileExists,
    analysis_mode: deps.analysis_mode || "slow"
  });
  persistMaintenanceInspectionReport(report, deps);

  if (flags.output && flags.output !== true) {
    deps.writeTextFile(flags.output, flags.json ? `${JSON.stringify(report, null, 2)}\n` : `${renderMaintenanceInspectionReport(report, deps.table || (() => ""))}\n`);
  }

  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(renderMaintenanceInspectionReport(report, deps.table || (() => "")));
}

function runMaintenanceRelocationWorkflow(flags, deps) {
  deps.ensureWorkspace();
  const report = buildMaintenanceRelocationReport({
    assetAliases: deps.assetAliases || null
  }, {
    review_mode: Boolean(deps.review_mode) || deps.workflow_mode === "slow",
    review_threshold: deps.review_threshold != null ? deps.review_threshold : (deps.workflow_mode === "slow" ? 0.9 : 0),
    workflow_mode: deps.workflow_mode || "slow"
  });
  const shouldApply = !deps.review_mode && Boolean(flags.apply || flags.confirm || flags.yes);
  if (shouldApply) {
    applyMaintenanceRelocationPlan(report, deps);
  }
  persistMaintenanceRelocationReport(report, deps);

  if (flags.output && flags.output !== true) {
    deps.writeTextFile(flags.output, flags.json ? `${JSON.stringify(report, null, 2)}\n` : `${renderMaintenanceRelocationReport(report, deps.table || (() => ""))}\n`);
  }

  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(renderMaintenanceRelocationReport(report, deps.table || (() => "")));
}

function handleCleanupWorkflow(action, flags, rest, deps) {
  const cleanup = buildCleanupAuditReport({
    readJsonFile: deps.readJsonFile,
    fileExists: deps.fileExists
  }, {
    workflow_mode: deps.workflow_mode || "fast"
  });

  if (action === "fast" || action === "slow") {
    cleanup.workflow_mode = action;
    cleanup.next_exact_action = action === "slow"
      ? "Run `kvdf maintenance slow` to review the strict maintenance inspection and relocation evidence."
      : "Run `kvdf maintenance fast` to run the quick maintenance audit.";
  }

  if (action === "cleanup" || action === "clean" || action === "cleaner" || action === "hygiene" || action === "sweep" || action === "fast" || action === "slow") {
    persistCleanupAuditReport(cleanup, deps);
    if (flags.approve || flags.confirm || flags.yes) {
      return approveCleanupWorkflow(cleanup, flags, rest, deps);
    }
    if (flags.json) {
      console.log(JSON.stringify(cleanup, null, 2));
      return;
    }
    console.log(renderCleanupAuditReport(cleanup, deps.table || (() => "")));
    return;
  }

  if (action === "approve") {
    return approveCleanupWorkflow(cleanup, flags, rest, deps);
  }

  if (action === "execute") {
    return executeCleanupWorkflow(cleanup, flags, deps);
  }

  if (action === "finalize") {
    return finalizeCleanupWorkflow(cleanup, flags, deps);
  }

  throw new Error(`Unknown cleanup workflow action: ${action}`);
}

function approveCleanupWorkflow(cleanup, flags, rest, deps) {
  deps.requireAnyRole(flags, ["Owner", "Maintainer"], "approve cleanup workflow");
  if (!(flags.confirm || flags.approve || flags.yes)) {
    throw new Error("Cleanup approval blocked: pass --confirm to approve the cleanup audit.");
  }

  cleanup.approval_status = "approved";
  cleanup.status = "approved";
  cleanup.approved_at = new Date().toISOString();
  cleanup.approved_by = flags.by || flags.actor || "local-owner";
  cleanup.next_exact_action = "kvdf cleaner execute";
  persistCleanupAuditReport(cleanup, deps);

  const evolutionDescription = buildCleanupEvolutionDescription(cleanup);
  const evolutionFlags = {
    ...flags,
    confirm: true,
    "confirm-placement": true,
    title: `Cleanup: ${String(cleanup.cleanup_id || "kvdf").replace(/-/g, " ")}`,
    areas: buildCleanupEvolutionAreas(cleanup).join(","),
    requestedBy: flags.by || flags.actor || "local-owner",
    source: "kvdf-cleaner"
  };
  evolution("plan", evolutionDescription, evolutionFlags, rest, {
    ensureWorkspace: deps.ensureWorkspace,
    readJsonFile: deps.readJsonFile,
    writeJsonFile: deps.writeJsonFile,
    writeTextFile: deps.writeTextFile,
    fileExists: deps.fileExists,
    table: deps.table,
    appendAudit: deps.appendAudit,
    refreshDashboardArtifacts: deps.refreshDashboardArtifacts,
    requireAnyRole: deps.requireAnyRole,
    readStateArray: deps.readStateArray,
    compactTitle: deps.compactTitle,
    nextRecordId: deps.nextRecordId,
    parseCsv: deps.parseCsv
  });

  const evolutionState = deps.fileExists(".kabeeri/evolution.json") ? deps.readJsonFile(".kabeeri/evolution.json") : { changes: [] };
  cleanup.evolution_change_id = evolutionState.current_change_id || null;
  cleanup.evolution_plan_id = cleanup.evolution_change_id ? `${cleanup.evolution_change_id}-impact` : null;
  cleanup.cleanup_task_ids = collectCleanupTaskIds(evolutionState, deps.readJsonFile);
  if (cleanup.cleanup_task_ids.length) {
    markCleanupTasksApproved(cleanup.cleanup_task_ids, deps.readJsonFile, deps.writeJsonFile, flags);
  }
  cleanup.status = "planned";
  cleanup.approval_status = "approved";
  cleanup.next_exact_action = "kvdf cleaner execute";
  persistCleanupAuditReport(cleanup, deps);

  if (flags.json) {
    console.log(JSON.stringify(cleanup, null, 2));
    return;
  }

  console.log(renderCleanupAuditReport(cleanup, deps.table || (() => "")));
}

function executeCleanupWorkflow(cleanup, flags, deps) {
  const state = loadCleanupAuditReport(deps) || cleanup;
  if (!state || state.approval_status !== "approved") {
    throw new Error("Cleanup execution blocked: approve the cleanup audit first with `kvdf cleaner approve --confirm`.");
  }
  if (!state.evolution_change_id) {
    throw new Error("Cleanup execution blocked: create the Evolution plan first.");
  }

  const { compileTaskControlPlanePacket, renderTaskControlPlanePacket, compileTaskExecutorContract, renderTaskExecutorContract, runTaskBatch, renderTaskBatchRunReport } = loadKvdfDevBundle();

  const packet = compileTaskControlPlanePacket({
    evolutionChangeId: state.evolution_change_id,
    statuses: "approved,ready"
  }, {
    readJsonFile: deps.readJsonFile,
    writeJsonFile: deps.writeJsonFile,
    writeTextFile: deps.writeTextFile,
    readJsonLines: deps.readJsonLines || (() => []),
    fileExists: deps.fileExists,
    appendAudit: deps.appendAudit,
    refreshDashboardArtifacts: deps.refreshDashboardArtifacts,
    buildTaskLifecycleState
  });
  const contract = compileTaskExecutorContract({
    packetPath: "docs/reports/KVDF_TASK_CONTROL_PLANE_PACKET.json"
  }, {
    readJsonFile: deps.readJsonFile,
    writeJsonFile: deps.writeJsonFile,
    writeTextFile: deps.writeTextFile,
    fileExists: deps.fileExists,
    appendAudit: deps.appendAudit,
    refreshDashboardArtifacts: deps.refreshDashboardArtifacts,
    renderTaskControlPlanePacket
  });
  const batch = runTaskBatch({
    evolutionChangeId: state.evolution_change_id,
    statuses: "approved,ready",
    limit: Number.isFinite(Number(flags.limit)) && Number(flags.limit) > 0 ? Number(flags.limit) : null,
    assignee: flags.assignee || flags.actor || flags.by || "codex"
  }, {
    readJsonFile: deps.readJsonFile,
    writeJsonFile: deps.writeJsonFile,
    fileExists: deps.fileExists,
    appendAudit: deps.appendAudit,
    refreshDashboardArtifacts: deps.refreshDashboardArtifacts,
    buildTaskLifecycleState,
    requireTaskExecutor: () => {},
    assertTaskCanStart: () => {},
    assertDocsFirstGateAllowsTaskStart: () => {}
  });

  state.status = "executing";
  state.next_exact_action = "kvdf cleaner finalize";
  state.execution_report = {
    packet_id: packet.packet_id || null,
    contract_id: contract.contract_id || null,
    batch_id: batch.batch_id || null,
    started_tasks: Array.isArray(batch.started_tasks) ? batch.started_tasks.map((item) => item.id) : [],
    blocked_tasks: Array.isArray(batch.blocked_tasks) ? batch.blocked_tasks.map((item) => item.task_id) : []
  };
  persistCleanupAuditReport(state, deps);

  if (flags.json) {
    console.log(JSON.stringify({ cleanup: state, packet, contract, batch }, null, 2));
    return;
  }

  console.log(renderCleanupAuditReport(state, deps.table || (() => "")));
}

function finalizeCleanupWorkflow(cleanup, flags, deps) {
  const state = loadCleanupAuditReport(deps) || cleanup;
  if (!state || !state.evolution_change_id) {
    throw new Error("Cleanup finalize blocked: run approval and execution first.");
  }

  const tasksState = deps.fileExists(".kabeeri/tasks.json") ? deps.readJsonFile(".kabeeri/tasks.json") : { tasks: [] };
  tasksState.tasks = Array.isArray(tasksState.tasks) ? tasksState.tasks : [];
  const trashState = ensureTaskTrashState();
  const completedStatuses = new Set(["owner_verified", "done", "closed"]);
  const cleanupTasks = tasksState.tasks.filter((task) => task.evolution_change_id === state.evolution_change_id);
  const completedTasks = cleanupTasks.filter((task) => completedStatuses.has(String(task.status || "").toLowerCase()));
  const pendingTasks = cleanupTasks.filter((task) => !completedStatuses.has(String(task.status || "").toLowerCase()));
  const cleanupTaskIds = Array.isArray(state.cleanup_task_ids) ? state.cleanup_task_ids : [];
  const trashedCleanupTasks = (trashState.trash || []).filter((task) => {
    if (task.evolution_change_id && task.evolution_change_id === state.evolution_change_id) return true;
    return cleanupTaskIds.includes(task.id);
  });
  const allCleanupTasksAccountedFor = cleanupTaskIds.length
    ? cleanupTaskIds.every((taskId) => completedTasks.some((task) => task.id === taskId) || trashedCleanupTasks.some((task) => task.id === taskId))
    : completedTasks.length > 0 || trashedCleanupTasks.length > 0;

  if (!allCleanupTasksAccountedFor) {
    state.status = "waiting_for_completion";
    state.next_exact_action = "Complete the cleanup tasks, then rerun `kvdf cleaner finalize`.";
    state.finalization_blockers = pendingTasks.map((task) => ({
      task_id: task.id,
      status: task.status || "unknown"
    }));
    persistCleanupAuditReport(state, deps);
    if (flags.json) {
      console.log(JSON.stringify(state, null, 2));
      return;
    }
    console.log(renderCleanupAuditReport(state, deps.table || (() => "")));
    return;
  }

  const trashed = [];
  const tasksToArchive = completedTasks.length ? completedTasks : trashedCleanupTasks;
  for (const task of tasksToArchive) {
    const result = archiveCleanupTask(task.id, {
      reason: "cleanup_complete",
      actor: flags.by || flags.actor || "local-owner"
    }, deps);
    trashed.push(result.task);
  }

  state.status = "completed";
  state.approval_status = "approved";
  state.completed_at = new Date().toISOString();
  state.trashed_tasks = trashed;
  state.remaining_tasks = pendingTasks.map((task) => ({
    id: task.id,
    status: task.status || "unknown"
  }));
  state.finalization_blockers = [];
  state.next_exact_action = pendingTasks.length ? "Review any remaining cleanup tasks." : "Cleanup cycle complete.";
  persistCleanupAuditReport(state, deps);

  if (flags.json) {
    console.log(JSON.stringify(state, null, 2));
    return;
  }

  console.log(renderCleanupAuditReport(state, deps.table || (() => "")));
}

function archiveCleanupTask(taskId, options, deps) {
  try {
    return moveTaskToTrash(taskId, options);
  } catch (error) {
    const message = String(error && error.message ? error.message : "");
    if (!message.includes("already exists in trash") && !message.includes("Task not found")) {
      throw error;
    }
  }

  const tasksState = deps.fileExists(".kabeeri/tasks.json") ? deps.readJsonFile(".kabeeri/tasks.json") : { tasks: [] };
  tasksState.tasks = Array.isArray(tasksState.tasks) ? tasksState.tasks : [];
  const taskIndex = tasksState.tasks.findIndex((item) => item.id === taskId);
  const currentTask = taskIndex === -1 ? { id: taskId, title: "", status: "done" } : { ...tasksState.tasks[taskIndex] };
  const trashState = ensureTaskTrashState();
  trashState.trash = Array.isArray(trashState.trash) ? trashState.trash : [];
  const existingIndex = trashState.trash.findIndex((item) => item.id === taskId);
  if (taskIndex === -1 && existingIndex >= 0) {
    return {
      report_type: "task_trashed",
      generated_at: new Date().toISOString(),
      status: "trashed",
      task: taskTrashSummary(trashState.trash[existingIndex]),
      trashed_task: trashState.trash[existingIndex],
      original_task: taskTrashSummary(currentTask)
    };
  }
  const now = new Date();
  const retentionDays = Number(trashState.retention_days || DEFAULT_RETENTION_DAYS) || DEFAULT_RETENTION_DAYS;
  const expiresAt = new Date(now.getTime());
  expiresAt.setUTCDate(expiresAt.getUTCDate() + retentionDays);
  const record = {
    ...currentTask,
    trashed_at: now.toISOString(),
    trash_expires_at: expiresAt.toISOString(),
    trashed_reason: options.reason || "completed",
    trashed_by: options.actor || options.by || options.trashed_by || null,
    original_position: taskIndex >= 0 ? taskIndex : null,
    original_status: currentTask.status || "proposed",
    source_collection: "tasks.json",
    trash_retention_days: retentionDays
  };

  if (taskIndex >= 0) {
    tasksState.tasks.splice(taskIndex, 1);
    deps.writeJsonFile(".kabeeri/tasks.json", tasksState);
  }

  if (existingIndex >= 0) trashState.trash[existingIndex] = record;
  else trashState.trash.push(record);
  deps.writeJsonFile(".kabeeri/task_trash.json", trashState);

  return {
    report_type: "task_trashed",
    generated_at: now.toISOString(),
    status: "trashed",
    task: taskTrashSummary(record),
    trashed_task: record,
    original_task: taskTrashSummary(currentTask)
  };
}

function buildMaintainabilityReport(report, table) {
  const scorecardRows = report.scorecard ? [[
    report.scorecard.scorecard_id || "",
    report.scorecard.change_id || "",
    String(report.scorecard.score ?? ""),
    report.scorecard.band || "",
    report.scorecard.next_action || ""
  ]] : [["", "", "", "", ""]];
  const commandRows = (report.shared_command_inventory || []).map((entry) => [
    entry.key,
    entry.category,
    entry.stage,
    entry.owner,
    entry.purpose
  ]);

  return [
    "# KVDF Maintainability Report",
    "",
    `- Report path: ${report.report_path}`,
    `- Scorecard source: ${report.scorecard_source}`,
    `- Next exact action: ${report.next_exact_action}`,
    "",
    "## Scorecard",
    "",
    table(["Scorecard", "Change", "Score", "Band", "Next action"], scorecardRows),
    "",
    "## Shared Service Inventory",
    "",
    ...report.shared_service_inventory.map((item) => `- ${item}`),
    "",
    "## Shared Command Inventory",
    "",
    table(["Command", "Category", "Stage", "Owner", "Purpose"], commandRows),
    "",
    "## Live State",
    "",
    `- Workspace exists: ${report.live_state.workspace_exists ? "yes" : "no"}`,
    `- Current delivery mode: ${report.live_state.current_delivery_mode || "unset"}`,
    `- Current blueprint: ${report.live_state.current_blueprint || "unset"}`,
    `- Questionnaire plan: ${report.live_state.questionnaire_plan_id || "unset"}`,
    `- Packet traceability complete: ${report.live_state.packet_traceability_complete ? "yes" : "no"}`,
    `- Approved or ready tasks: ${report.live_state.approved_or_ready_tasks}`,
    ""
  ].join("\n");
}

function renderMaintainabilityReport(report, table) {
  return [
    "# KVDF Maintainability Report",
    "",
    `- Report path: ${report.report_path}`,
    `- Scorecard source: ${report.scorecard_source}`,
    `- Next exact action: ${report.next_exact_action}`,
    "",
    "## Scorecard",
    "",
    table(["Scorecard", "Change", "Score", "Band", "Next action"], report.scorecard ? [[
      report.scorecard.scorecard_id || "",
      report.scorecard.change_id || "",
      String(report.scorecard.score ?? ""),
      report.scorecard.band || "",
      report.scorecard.next_action || ""
    ]] : [["", "", "", "", ""]]),
    "",
    "## Shared Service Inventory",
    "",
    ...report.shared_service_inventory.map((item) => `- ${item}`),
    "",
    "## Shared Command Inventory",
    "",
    table(["Command", "Category", "Stage", "Owner", "Purpose"], (report.shared_command_inventory || []).map((entry) => [
      entry.key,
      entry.category,
      entry.stage,
      entry.owner,
      entry.purpose
    ])),
    "",
    "## Live State",
    "",
    `- Workspace exists: ${report.live_state.workspace_exists ? "yes" : "no"}`,
    `- Current delivery mode: ${report.live_state.current_delivery_mode || "unset"}`,
    `- Current blueprint: ${report.live_state.current_blueprint || "unset"}`,
    `- Questionnaire plan: ${report.live_state.questionnaire_plan_id || "unset"}`,
    `- Packet traceability complete: ${report.live_state.packet_traceability_complete ? "yes" : "no"}`,
    `- Approved or ready tasks: ${report.live_state.approved_or_ready_tasks}`,
    ""
  ].join("\n");
}

function persistCleanupAuditReport(report, deps) {
  deps.writeJsonFile(CLEANUP_AUDIT_JSON_PATH, report);
  deps.writeTextFile(CLEANUP_AUDIT_MD_PATH, `${renderCleanupAuditReport(report, deps.table || (() => ""))}\n`);
}

function loadCleanupAuditReport(deps) {
  if (!deps.fileExists(CLEANUP_AUDIT_JSON_PATH)) return null;
  return deps.readJsonFile(CLEANUP_AUDIT_JSON_PATH);
}

function collectCleanupTaskIds(evolutionState, readJsonFile) {
  let tasks = { tasks: [] };
  try {
    tasks = readJsonFile(".kabeeri/tasks.json");
  } catch {
    tasks = { tasks: [] };
  }
  const list = Array.isArray(tasks.tasks) ? tasks.tasks : [];
  const changeId = evolutionState.current_change_id || null;
  if (!changeId) return [];
  return list.filter((task) => task.evolution_change_id === changeId).map((task) => task.id);
}

function markCleanupTasksApproved(taskIds, readJsonFile, writeJsonFile, flags) {
  if (!taskIds.length) return [];
  let data = { tasks: [] };
  try {
    data = readJsonFile(".kabeeri/tasks.json");
  } catch {
    data = { tasks: [] };
  }
  data.tasks = Array.isArray(data.tasks) ? data.tasks : [];
  const approvedAt = new Date().toISOString();
  for (const task of data.tasks) {
    if (!taskIds.includes(task.id)) continue;
    task.status = "approved";
    task.approved_at = approvedAt;
    task.approved_by = flags.by || flags.actor || "local-owner";
    task.updated_at = approvedAt;
  }
  writeJsonFile(".kabeeri/tasks.json", data);
  return taskIds;
}

function isCleanupAction(action) {
  return ["cleanup", "clean", "cleaner", "hygiene", "sweep", "fast", "slow", "approve", "execute", "finalize"].includes(action);
}

function isInspectionAction(action) {
  return ["inspect", "inspection", "scan", "audit"].includes(action);
}

function isRelocationAction(action) {
  return ["relocate", "reorder", "reorganize", "review"].includes(action);
}

function isRelocationReview(action, value, flags = {}) {
  const normalizedAction = String(action || "").trim().toLowerCase();
  const normalizedValue = String(value || flags.action || flags.mode || "").trim().toLowerCase();
  return normalizedAction === "review" || normalizedValue === "review" || Boolean(flags.review);
}

function resolveMaintenanceMode(action, value, flags = {}) {
  const candidates = [flags.mode, flags.speed, action, value, flags.action];
  for (const candidate of candidates) {
    const normalized = String(candidate || "").trim().toLowerCase();
    if (normalized === "fast" || normalized === "slow") return normalized;
  }
  return null;
}

module.exports = {
  MAINTAINABILITY_REPORT_PATH,
  MAINTAINABILITY_SCORECARD_PATH,
  maintainability,
  renderMaintainabilityReport
};
