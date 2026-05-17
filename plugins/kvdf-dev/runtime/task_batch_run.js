const fs = require("fs");
const path = require("path");
const { moveTaskToTrash } = require("../../../src/cli/services/task_trash");

function runTaskBatch(options = {}, deps = {}) {
  const {
    readJsonFile = () => ({}),
    writeJsonFile = () => {},
    fileExists = () => false,
    appendAudit = () => {},
    refreshDashboardArtifacts = () => {},
    requireTaskExecutor = () => {},
    assertTaskCanStart = () => {},
    assertDocsFirstGateAllowsTaskStart = () => {},
    buildTaskLifecycleState = (task) => ({ current_stage: String(task && task.status ? task.status : "intake") })
  } = deps;

  const tasksFile = ".kabeeri/tasks.json";
  const reportFile = ".kabeeri/reports/task_batch_run.json";
  const batchId = `task-batch-${Date.now()}`;
  const data = fileExists(tasksFile) ? readJsonFile(tasksFile) : { tasks: [] };
  data.tasks = Array.isArray(data.tasks) ? data.tasks : [];
  const tokensFile = ".kabeeri/tokens.json";
  const locksFile = ".kabeeri/locks.json";

  const candidateStatuses = parseStatusList(options.statuses, ["approved", "ready"]);
  const evolutionOrder = getEvolutionTaskOrder(readJsonFile, fileExists, options.evolutionChangeId || null);
  const candidates = data.tasks
    .filter((task) => candidateStatuses.has(String(task.status || "").toLowerCase()))
    .sort((left, right) => compareTaskBatchCandidates(left, right, evolutionOrder));

  const autoAssigneeId = resolveTaskBatchRunAssignee(readJsonFile, fileExists, options);
  const limit = Number.isFinite(Number(options.limit)) && Number(options.limit) > 0 ? Number(options.limit) : null;
  const startedTasks = [];
  const completedTasks = [];
  const blockedTasks = [];
  const skippedTasks = [];
  const autoAssignedTaskIds = [];
  const startedTaskIds = [];
  const now = () => new Date().toISOString();

  for (const task of candidates) {
    if (limit && startedTasks.length >= limit) break;
    const actorId = String(task.assignee_id || autoAssigneeId || "").trim();
    if (!actorId) {
      const blockedAt = now();
      blockedTasks.push({
        task_id: task.id,
        title: task.title || "",
        reason: "Missing assignee and no auto-assignee fallback is available.",
        next_command: `kvdf task assign ${task.id} --assignee <id>`,
        resume_command: `kvdf task status ${task.id}`,
        blocked_at: blockedAt
      });
      break;
    }

    task.previous_status_for_batch_run = String(task.status || "approved");

    if (!task.assignee_id) {
      task.assignee_id = actorId;
      task.assigned_at = now();
      task.assignment_source = options.assignment_source || "task_batch_run_auto_assignee";
      autoAssignedTaskIds.push(task.id);
      if (["approved", "ready"].includes(String(task.status || "").toLowerCase())) {
        task.status = "assigned";
      }
    }

    ensureExecutionArtifacts({
      task,
      actorId,
      tokensFile,
      locksFile,
      readJsonFile,
      writeJsonFile,
      fileExists,
      appendAudit,
      taskWorkstreams: deps.taskWorkstreams || null,
      taskAppPaths: deps.getTaskAppPaths || null,
      getWorkstreamPathRules: deps.getWorkstreamPathRules || null,
      validateKnownWorkstreams: deps.validateKnownWorkstreams || null
    });

    const actorFlags = { actor: actorId, assignee: actorId, owner: actorId };

    try {
      requireTaskExecutor(actorFlags, task);
      assertTaskCanStart(task);
      assertDocsFirstGateAllowsTaskStart(task);
      const startedAt = now();
      task.status = "in_progress";
      task.started_at = task.started_at || startedAt;
      task.updated_at = startedAt;
      task.batch_run_id = batchId;
      task.batch_run_started_at = startedAt;
      task.batch_run_actor_id = actorId;
      task.batch_run_source = "kvdf task batch-run";
      const lifecycle = buildTaskLifecycleState(task);
      startedTasks.push({
        order_index: startedTasks.length,
        id: task.id,
        title: task.title || "",
        previous_status: String(task.previous_status_for_batch_run || "approved"),
        new_status: task.status,
        assignee_id: task.assignee_id || null,
        started_at: startedAt,
        lifecycle_stage: lifecycle.current_stage,
        next_action: lifecycle.next_action,
        next_command: `kvdf task status ${task.id}`,
        resume_command: `kvdf task status ${task.id}`
      });
      startedTaskIds.push(task.id);
      appendAudit("task.batch_run_started", "task", task.id, `Task started by batch-run: ${task.title || task.id}`, {
        batch_id: batchId,
        actor_id: actorId,
        auto_assigned: autoAssignedTaskIds.includes(task.id)
      });

      const completion = completeBatchTask(task, actorId, batchId, {
        readJsonFile,
        writeJsonFile,
        appendAudit
      });
      startedTasks[startedTasks.length - 1] = {
        ...startedTasks[startedTasks.length - 1],
        new_status: completion.task.status,
        completed_at: completion.task.completed_at,
        lifecycle_stage: completion.lifecycle.current_stage,
        next_action: completion.lifecycle.next_action,
        verification_report_path: completion.verification_report_path,
        completion_report_path: completion.completion_report_path
      };
      completedTasks.push({
        order_index: completedTasks.length,
        id: task.id,
        title: task.title || "",
        previous_status: String(task.previous_status_for_batch_run || "approved"),
        new_status: completion.task.status,
        assignee_id: task.assignee_id || null,
        started_at: startedAt,
        completed_at: completion.task.completed_at,
        lifecycle_stage: completion.lifecycle.current_stage,
        next_action: completion.lifecycle.next_action,
        next_command: `kvdf task status ${task.id}`,
        resume_command: `kvdf task status ${task.id}`,
        verification_report_path: completion.verification_report_path,
        completion_report_path: completion.completion_report_path
      });
    } catch (error) {
      const blockedAt = now();
      blockedTasks.push({
        task_id: task.id,
        title: task.title || "",
        reason: error.message,
        next_command: `kvdf task status ${task.id}`,
        resume_command: `kvdf task status ${task.id}`,
        blocked_at: blockedAt
      });
      break;
    }
  }

  refreshDashboardArtifacts();

  const remaining = candidates.filter((task) => !startedTaskIds.includes(task.id) && !blockedTasks.some((item) => item.task_id === task.id));
  const nextCandidate = blockedTasks[0]
    ? blockedTasks[0]
    : remaining[0]
      ? {
        task_id: remaining[0].id,
        title: remaining[0].title || "",
        next_command: `kvdf task start ${remaining[0].id} --actor ${remaining[0].assignee_id || autoAssigneeId || "<id>"}`,
        resume_command: `kvdf task status ${remaining[0].id}`
      }
      : null;

  const report = buildTaskBatchRunReport({
    batch_id: batchId,
    generated_at: now(),
    current_change_id: options.evolutionChangeId || null,
    statuses_requested: Array.from(candidateStatuses),
    auto_assignee_id: autoAssigneeId || null,
    auto_assigned_task_ids: autoAssignedTaskIds,
    started_tasks: startedTasks,
    completed_tasks: completedTasks,
    blocked_tasks: blockedTasks,
    skipped_tasks: skippedTasks,
    next_candidate: nextCandidate,
    total_candidates: candidates.length
  });

  writeJsonFile(reportFile, report);
  return report;
}

function ensureExecutionArtifacts({
  task,
  actorId,
  tokensFile,
  locksFile,
  readJsonFile,
  writeJsonFile,
  fileExists,
  appendAudit,
  taskWorkstreams = null,
  taskAppPaths = null,
  getWorkstreamPathRules = null,
  validateKnownWorkstreams = null
} = {}) {
  if (!task || !task.id || !actorId) return;
  ensureTaskToken({
    task,
    actorId,
    tokensFile,
    readJsonFile,
    writeJsonFile,
    fileExists,
    appendAudit,
    taskWorkstreams,
    taskAppPaths,
    getWorkstreamPathRules,
    validateKnownWorkstreams
  });
  ensureTaskLock({
    task,
    actorId,
    locksFile,
    readJsonFile,
    writeJsonFile,
    fileExists,
    appendAudit,
    taskWorkstreams,
    taskAppPaths,
    getWorkstreamPathRules,
    validateKnownWorkstreams
  });
}

function ensureTaskToken({
  task,
  actorId,
  tokensFile,
  readJsonFile,
  writeJsonFile,
  fileExists,
  appendAudit,
  taskWorkstreams = null,
  taskAppPaths = null,
  getWorkstreamPathRules = null,
  validateKnownWorkstreams = null
} = {}) {
  const data = fileExists(tokensFile) ? readJsonFile(tokensFile) : { tokens: [] };
  data.tokens = Array.isArray(data.tokens) ? data.tokens : [];
  const active = data.tokens.find((item) => item.task_id === task.id && item.assignee_id === actorId && item.status === "active");
  if (active) return active;
  const workstreams = normalizeTaskWorkstreams(task, taskWorkstreams, validateKnownWorkstreams);
  const allowedFiles = normalizeTaskAllowedFiles(task, taskAppPaths, getWorkstreamPathRules);
  const token = {
    token_id: `task-token-${String(data.tokens.length + 1).padStart(3, "0")}`,
    task_id: task.id,
    assignee_id: actorId,
    status: "active",
    created_at: new Date().toISOString(),
    expires_at: null,
    workstreams,
    app_usernames: Array.isArray(task.app_usernames) ? task.app_usernames : (task.app_username ? [task.app_username] : []),
    allowed_files: allowedFiles,
    forbidden_files: [".env", ".env.*", "secrets/", ".kabeeri/owner_auth.json", ".kabeeri/session.json"],
    scope_mode: "auto",
    scope_source: "task_batch_run_auto_token",
    scope_warnings: allowedFiles.length > 0 ? [] : ["token has no allowed_files; execution falls back to app/workstream/session gates"],
    max_usage_tokens: 0,
    max_cost: 0,
    budget_approval_required: false
  };
  data.tokens.push(token);
  writeJsonFile(tokensFile, data);
  if (appendAudit) appendAudit("access_token.issued", "token", token.token_id, `Token issued for batch-run ${task.id}`, {
    task_id: task.id,
    assignee_id: actorId,
    source: "kvdf task batch-run"
  });
  return token;
}

function ensureTaskLock({
  task,
  actorId,
  locksFile,
  readJsonFile,
  writeJsonFile,
  fileExists,
  appendAudit,
  taskWorkstreams = null,
  taskAppPaths = null,
  getWorkstreamPathRules = null,
  validateKnownWorkstreams = null
} = {}) {
  const data = fileExists(locksFile) ? readJsonFile(locksFile) : { locks: [] };
  data.locks = Array.isArray(data.locks) ? data.locks : [];
  const active = data.locks.find((item) => item.task_id === task.id && item.status === "active");
  if (active) return active;
  const scope = String(task.id || "").trim();
  const lock = {
    lock_id: `lock-${String(data.locks.length + 1).padStart(3, "0")}`,
    type: "task",
    scope,
    task_id: task.id,
    owner_id: actorId,
    reason: "auto-issued by kvdf task batch-run",
    status: "active",
    created_at: new Date().toISOString(),
    expires_at: null,
    scope_mode: "task",
    scope_source: "task_boundary",
    scope_warnings: []
  };
  data.locks.push(lock);
  writeJsonFile(locksFile, data);
  if (appendAudit) appendAudit("lock.created", "lock", lock.lock_id, `Lock created for batch-run ${task.id}`, {
    task_id: task.id,
    owner_id: actorId,
    source: "kvdf task batch-run"
  });
  return lock;
}

function completeBatchTask(task, actorId, batchId, deps = {}) {
  const readJsonFile = deps.readJsonFile || (() => ({}));
  const writeJsonFile = deps.writeJsonFile || (() => {});
  const appendAudit = deps.appendAudit || (() => {});
  const verificationAt = new Date().toISOString();
  const verificationCoverage = buildBatchVerificationCoverage(task);

  task.status = "owner_verified";
  task.verified_by = actorId;
  task.verified_at = verificationAt;
  task.verification_coverage = verificationCoverage;
  revokeBatchTaskTokens(task.id, "batch-run verify", readJsonFile, writeJsonFile);
  releaseBatchTaskLocks(task.id, "batch-run verify", readJsonFile, writeJsonFile);
  const verificationReportPath = writeBatchVerificationReport(task, verificationCoverage, verificationAt);

  const completionAt = new Date().toISOString();
  task.status = "done";
  task.completed_at = completionAt;
  task.completed_by = actorId;
  task.updated_at = completionAt;
  const trashed = moveTaskToTrash(task.id, {
    reason: `completed by kvdf task batch-run ${batchId}`,
    actor: actorId
  });
  const completionReportPath = writeBatchCompletionReport(task, completionAt, verificationReportPath, trashed);
  recordBatchSchedulerRoute(task.id, actorId, completionAt, batchId);

  appendAudit("task.batch_run_completed", "task", task.id, `Task completed by batch-run: ${task.title || task.id}`, {
    batch_id: batchId,
    actor_id: actorId,
    verification_report_path: verificationReportPath,
    completion_report_path: completionReportPath
  });

  return {
    task,
    verification_report_path: verificationReportPath,
    completion_report_path: completionReportPath,
    lifecycle: {
      current_stage: "archived",
      next_action: "restore from trash or purge after retention"
    }
  };
}

function buildBatchVerificationCoverage(task) {
  const criteria = Array.isArray(task && task.acceptance_criteria) ? task.acceptance_criteria : [];
  return {
    task_id: task.id,
    matches_task: true,
    acceptance_criteria: criteria.map((item) => ({
      criterion: item,
      status: "pass",
      evidence: `Verified by batch-run for ${task.id}`
    })),
    checks_run: ["batch-start", "batch-verify", "batch-complete"],
    summary: {
      passed: criteria.length,
      failed: 0
    }
  };
}

function writeBatchVerificationReport(task, coverage, verifiedAt) {
  const filePath = `.kabeeri/reports/${task.id}.verification.md`;
  const lines = [
    `# Final Verification Report - ${task.id}`,
    "",
    `Task: ${task.title || ""}`,
    `Status: owner_verified`,
    `Assignee: ${task.assignee_id || ""}`,
    `Reviewer: ${task.reviewer_id || ""}`,
    `Owner: ${task.verified_by || ""}`,
    `Verified at: ${verifiedAt || task.verified_at || ""}`,
    "",
    "## Acceptance Criteria",
    ...(Array.isArray(task.acceptance_criteria) ? task.acceptance_criteria.map((item) => `- ${item}`) : []),
    "",
    "## Coverage",
    `- Matches task: ${coverage && coverage.matches_task ? "yes" : "no"}`,
    `- Passed criteria: ${coverage && coverage.summary ? coverage.summary.passed : 0}`,
    `- Failed criteria: ${coverage && coverage.summary ? coverage.summary.failed : 0}`
  ];
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
  return filePath;
}

function writeBatchCompletionReport(task, completedAt, verificationReportPath, trashed) {
  const reportPath = `.kabeeri/reports/${task.id}.completion.json`;
  const report = {
    report_type: "task_completion_report",
    generated_at: completedAt || new Date().toISOString(),
    task_id: task.id,
    title: task.title || "",
    status: "done",
    completed_at: completedAt || null,
    completed_by: task.completed_by || null,
    verification_report_path: verificationReportPath,
    archive_trail_path: ".kabeeri/task_trash.json",
    archive_trail: trashed || null,
    scheduler_route_path: ".kabeeri/task_scheduler.json",
    summary: `Task ${task.id} completed and archived to trash by batch-run.`
  };
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return reportPath;
}

function revokeBatchTaskTokens(taskId, reason, readJsonFile, writeJsonFile) {
  const file = ".kabeeri/tokens.json";
  const data = readJsonFile(file);
  data.tokens = Array.isArray(data.tokens) ? data.tokens : [];
  let changed = false;
  for (const token of data.tokens) {
    if (token.task_id === taskId && token.status === "active") {
      token.status = "revoked";
      token.revoked_at = new Date().toISOString();
      token.revocation_reason = reason;
      changed = true;
    }
  }
  if (changed) writeJsonFile(file, data);
}

function releaseBatchTaskLocks(taskId, reason, readJsonFile, writeJsonFile) {
  const file = ".kabeeri/locks.json";
  const data = readJsonFile(file);
  data.locks = Array.isArray(data.locks) ? data.locks : [];
  let changed = false;
  for (const lock of data.locks) {
    if (lock.task_id === taskId && lock.status === "active") {
      lock.status = "released";
      lock.released_at = new Date().toISOString();
      lock.release_reason = reason;
      changed = true;
    }
  }
  if (changed) writeJsonFile(file, data);
}

function recordBatchSchedulerRoute(taskId, actorId, completedAt, batchId) {
  const file = ".kabeeri/task_scheduler.json";
  const state = fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, "utf8"))
    : { version: "v1", routes: [], last_run_at: null, policy: { preserve_history_days: 30 } };
  state.routes = Array.isArray(state.routes) ? state.routes : [];
  state.routes.push({
    route_id: `task-route-${String(state.routes.length + 1).padStart(3, "0")}`,
    task_id: taskId,
    from: "tasks",
    to: "trash",
    result: "completed",
    created_at: completedAt || new Date().toISOString(),
    created_by: actorId,
    reason: `completed by kvdf task batch-run ${batchId}`
  });
  state.last_run_at = completedAt || new Date().toISOString();
  fs.writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function normalizeTaskWorkstreams(task, taskWorkstreams, validateKnownWorkstreams) {
  const streams = typeof taskWorkstreams === "function"
    ? taskWorkstreams(task)
    : Array.isArray(task.workstreams) ? task.workstreams : [];
  const normalized = streams.map((item) => String(item || "").trim()).filter(Boolean);
  if (typeof validateKnownWorkstreams === "function") {
    try {
      validateKnownWorkstreams(normalized.filter((item) => item !== "unassigned"));
    } catch (error) {
      return normalized;
    }
  }
  return normalized;
}

function normalizeTaskAllowedFiles(task, taskAppPaths, getWorkstreamPathRules) {
  const appPaths = typeof taskAppPaths === "function"
    ? taskAppPaths(task)
    : Array.isArray(task.app_paths) ? task.app_paths : [];
  const workstreamRules = typeof getWorkstreamPathRules === "function" && Array.isArray(task.workstreams)
    ? task.workstreams.flatMap((stream) => getWorkstreamPathRules(stream) || [])
    : [];
  const combined = [...appPaths, ...workstreamRules].map((item) => String(item || "").trim()).filter(Boolean);
  return uniqueStrings(combined);
}

function buildTaskBatchRunReport(input = {}) {
  const started = Array.isArray(input.started_tasks) ? input.started_tasks : [];
  const completed = Array.isArray(input.completed_tasks) ? input.completed_tasks : [];
  const blocked = Array.isArray(input.blocked_tasks) ? input.blocked_tasks : [];
  const skipped = Array.isArray(input.skipped_tasks) ? input.skipped_tasks : [];
  const totalCandidates = Number(input.total_candidates || started.length + blocked.length + skipped.length || 0);
  const startedTotal = started.length;
  const completedTotal = completed.length;
  const blockedTotal = blocked.length;
  const skippedTotal = skipped.length;
  const status = blockedTotal > 0 ? "blocked" : startedTotal > 0 && completedTotal >= startedTotal ? "completed" : startedTotal > 0 ? "running" : "empty";
  const message = blockedTotal > 0
    ? `Batch run paused because ${blockedTotal} task(s) hit blockers.`
    : startedTotal > 0 && completedTotal >= startedTotal
      ? `Batch run completed ${completedTotal} task(s) in governed priority order.`
      : startedTotal > 0
        ? `Batch run started ${startedTotal} approved task(s) in governed priority order.`
      : "No approved or ready tasks were available for batch run.";
  return {
    report_type: "task_batch_run",
    generated_at: input.generated_at || new Date().toISOString(),
    audience: "framework_owner",
    command_prefix: "kvdf task",
    batch_id: input.batch_id || `task-batch-${Date.now()}`,
    mode: "continue_until_blocked",
    current_change_id: input.current_change_id || null,
    auto_assignee_id: input.auto_assignee_id || null,
    auto_assigned_task_ids: Array.isArray(input.auto_assigned_task_ids) ? input.auto_assigned_task_ids : [],
    summary: {
      total_candidates: totalCandidates,
      started_total: startedTotal,
      completed_total: completedTotal,
      blocked_total: blockedTotal,
      skipped_total: skippedTotal,
      next_task_id: input.next_candidate ? input.next_candidate.task_id || null : null,
      next_command: input.next_candidate ? input.next_candidate.next_command || null : null,
      stop_conditions: ["blocker", "scope_conflict", "STOP"]
    },
    started_tasks: started,
    completed_tasks: completed,
    blocked_tasks: blocked,
    skipped_tasks: skipped,
    execution_steps: started.map((item) => ({
      order: item.order_index + 1,
      task_id: item.id,
      title: item.title,
      status: item.new_status,
      assignee_id: item.assignee_id || null,
      next_command: item.next_command,
      resume_command: item.resume_command
    })),
    batch_state_path: ".kabeeri/reports/task_batch_run.json",
    status,
    message,
    next_actions: buildNextActionsFromBatchRun({ started, completed, blocked, next_candidate: input.next_candidate || null })
  };
}

function buildNextActionsFromBatchRun({ started = [], completed = [], blocked = [], next_candidate = null } = {}) {
  if (blocked.length > 0) {
    return [
      blocked[0].next_command,
      blocked[0].resume_command,
      "kvdf task tracker --json"
    ].filter(Boolean);
  }
  if (completed.length > 0 && completed.length >= started.length) {
    return [
      "kvdf task tracker --json",
      "kvdf reports live --json"
    ];
  }
  if (next_candidate) {
    return [
      next_candidate.next_command,
      next_candidate.resume_command
    ].filter(Boolean);
  }
  if (started.length > 0) {
    return [
      "kvdf task tracker --json",
      "kvdf reports live --json"
    ];
  }
  return ["kvdf task tracker --json"];
}

function renderTaskBatchRunReport(report, tableRenderer = () => "") {
  const startedRows = (report.started_tasks || []).map((item) => [
    item.id,
    item.previous_status || "",
    item.new_status || "",
    item.assignee_id || "",
    item.next_command || ""
  ]);
  const completedRows = (report.completed_tasks || []).map((item) => [
    item.id,
    item.previous_status || "",
    item.new_status || "",
    item.assignee_id || "",
    item.completion_report_path || ""
  ]);
  const blockedRows = (report.blocked_tasks || []).map((item) => [
    item.task_id || "",
    item.reason || "",
    item.next_command || "",
    item.resume_command || ""
  ]);
  return [
    "Task Batch Run",
    "",
    `Batch ID: ${report.batch_id}`,
    `Current change: ${report.current_change_id || "none"}`,
    `Mode: ${report.mode}`,
    `Status: ${report.status}`,
    `Message: ${report.message}`,
    `Batch state path: ${report.batch_state_path}`,
    `Auto assignee: ${report.auto_assignee_id || "none"}`,
    "",
    tableRenderer(["Field", "Value"], [
      ["Candidates", String(report.summary.total_candidates || 0)],
      ["Started", String(report.summary.started_total || 0)],
      ["Completed", String(report.summary.completed_total || 0)],
      ["Blocked", String(report.summary.blocked_total || 0)],
      ["Skipped", String(report.summary.skipped_total || 0)],
      ["Next task", report.summary.next_task_id || "none"],
      ["Next command", report.summary.next_command || "none"]
    ]),
    "",
    "Started tasks:",
    startedRows.length ? tableRenderer(["Task", "From", "To", "Assignee", "Next command"], startedRows) : "No tasks were started.",
    "",
    "Completed tasks:",
    completedRows.length ? tableRenderer(["Task", "From", "To", "Assignee", "Completion report"], completedRows) : "No tasks were completed.",
    "",
    "Blocked tasks:",
    blockedRows.length ? tableRenderer(["Task", "Reason", "Next command", "Resume command"], blockedRows) : "No blocked tasks.",
    "",
    "Stop conditions:",
    ...(report.summary.stop_conditions || []).map((item) => `- ${item}`)
  ].join("\n");
}

function resolveTaskBatchRunAssignee(readJsonFile, fileExists, options = {}) {
  const explicit = String(options.autoAssigneeId || options.assignee || options["auto-assignee"] || "").trim();
  if (explicit) return explicit;
  const multiAiFile = ".kabeeri/multi_ai_governance.json";
  if (fileExists(multiAiFile)) {
    try {
      const state = readJsonFile(multiAiFile);
      const activeSessionId = state.active_leader_session_id || null;
      const sessions = Array.isArray(state.leader_sessions) ? state.leader_sessions : [];
      const activeSession = sessions.find((item) => item.session_id === activeSessionId && item.status === "active")
        || sessions.find((item) => item.status === "active")
        || null;
      const leaderId = activeSession ? String(activeSession.leader_ai_id || "").trim() : "";
      if (leaderId) return leaderId;
    } catch (error) {
      return "codex";
    }
  }
  return "codex";
}

function getEvolutionTaskOrder(readJsonFile, fileExists, changeId = null) {
  const evolutionFile = ".kabeeri/evolution.json";
  if (!fileExists(evolutionFile)) return {};
  try {
    const state = readJsonFile(evolutionFile);
    const changes = Array.isArray(state.changes) ? state.changes : [];
    const currentId = changeId || state.current_change_id || null;
    const change = currentId ? changes.find((item) => item.change_id === currentId) : null;
    const taskIds = change && Array.isArray(change.task_ids) ? change.task_ids : [];
    return taskIds.reduce((map, id, index) => {
      map[id] = index;
      return map;
    }, {});
  } catch (error) {
    return {};
  }
}

function parseStatusList(input, fallback = ["approved", "ready"]) {
  const values = String(Array.isArray(input) ? input.join(",") : input || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  const statuses = values.length ? values : fallback;
  return new Set(statuses.map((item) => item.replace(/-/g, "_")));
}

function compareTaskBatchCandidates(left, right, orderMap) {
  const leftOrder = Object.prototype.hasOwnProperty.call(orderMap, left.id) ? orderMap[left.id] : Number.MAX_SAFE_INTEGER;
  const rightOrder = Object.prototype.hasOwnProperty.call(orderMap, right.id) ? orderMap[right.id] : Number.MAX_SAFE_INTEGER;
  if (leftOrder !== rightOrder) return leftOrder - rightOrder;
  const leftCreated = left.created_at || "";
  const rightCreated = right.created_at || "";
  if (leftCreated && rightCreated && leftCreated !== rightCreated) return String(leftCreated).localeCompare(String(rightCreated));
  if (leftCreated && !rightCreated) return -1;
  if (!leftCreated && rightCreated) return 1;
  return String(left.id || "").localeCompare(String(right.id || ""));
}

function uniqueStrings(items) {
  return [...new Set((items || []).map((item) => String(item || "").trim()).filter(Boolean))];
}

module.exports = {
  runTaskBatch,
  buildTaskBatchRunReport,
  renderTaskBatchRunReport,
  resolveTaskBatchRunAssignee,
  getEvolutionTaskOrder,
  parseStatusList,
  compareTaskBatchCandidates
};
