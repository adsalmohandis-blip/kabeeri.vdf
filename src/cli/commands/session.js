const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { writeTextFile } = require("../fs_utils");
const { table } = require("../ui");
const { buildSessionHandoff: buildSessionHandoffDefault } = require("../services/session_handoff");
const { buildTaskMemory } = require("../services/task_memory");
const { ensureTaskTrashState, taskTrashSummary } = require("../services/task_trash");

function session(action, value, flags = {}, deps = {}) {
  const {
    requireTaskExecutor,
    hasConfiguredIdentities,
    assertTaskCanStart,
    getTaskById,
    findActiveTaskToken,
    isExpired,
    getTaskSprint,
    appendAudit,
    calculateUsageCost,
    parseCsv,
    assertNoProtectedFrameworkFiles,
    enforceSessionAppBoundary,
    enforceTokenFileScope,
    enforceSessionLockCoverage,
    enforceSessionWorkstreamBoundary,
    appendJsonLine,
    summarizeUsage,
    buildSessionHandoff: buildSessionHandoffService = buildSessionHandoffDefault
  } = deps;
  ensureWorkspace();
  const file = ".kabeeri/sessions.json";
  const data = readJsonFile(file);
  data.sessions = data.sessions || [];

  if (!action || action === "list") {
    console.log(table(["ID", "Task", "Developer", "Status", "Scope", "Model"], data.sessions.map((item) => [
      item.session_id,
      item.task_id,
      item.developer_id,
      getSessionRuntimeStatus(item),
      getSessionScopeSummary(item),
      `${item.provider || ""}/${item.model || ""}`
    ])));
    return;
  }

  if (action === "start") {
    const taskId = flags.task || value;
    const developerId = flags.developer || flags.assignee;
    if (!taskId) throw new Error("Missing --task.");
    if (!developerId) throw new Error("Missing --developer.");
    if (flags.actor && flags.actor !== developerId) throw new Error("Actor must match session developer.");
    const taskItem = getTaskById(taskId);
    if (taskItem) {
      requireTaskExecutor({ ...flags, actor: developerId }, taskItem);
      if (hasConfiguredIdentities()) assertTaskCanStart(taskItem);
    } else if (hasConfiguredIdentities()) {
      throw new Error(`Task not found: ${taskId}`);
    }
    const token = findActiveTaskToken(taskId, developerId);
    if (!token) throw new Error("Active task token required to start AI session.");
    if (isExpired(token.expires_at)) throw new Error(`Task access token expired: ${token.token_id}`);
    const started_at = new Date().toISOString();
    const sessionId = flags.id || `session-${String(data.sessions.length + 1).padStart(3, "0")}`;
    const contract = buildSessionContract(taskItem, token, {
      session_id: sessionId,
      task_id: taskId,
      developer_id: developerId,
      provider: flags.provider || "unknown",
      model: flags.model || "unknown",
      started_at
    });
    const item = {
      session_id: sessionId,
      task_id: taskId,
      sprint_id: getTaskSprint(taskId),
      developer_id: developerId,
      token_id: token ? token.token_id : null,
      provider: flags.provider || "unknown",
      model: flags.model || "unknown",
      status: "active",
      started_at,
      files_touched: [],
      contract,
      task_memory: taskItem ? buildTaskMemory(taskItem, {
        purpose: taskItem.execution_summary || taskItem.title,
        summary: taskItem.execution_summary || taskItem.title,
        source: taskItem.source || "session",
        workstreams: Array.isArray(taskItem.workstreams) ? taskItem.workstreams : taskItem.workstream ? [taskItem.workstream] : [],
        app_usernames: Array.isArray(taskItem.app_usernames) ? taskItem.app_usernames : taskItem.app_username ? [taskItem.app_username] : [],
        app_paths: Array.isArray(taskItem.app_paths) ? taskItem.app_paths : [],
        allowed_files: Array.isArray(taskItem.allowed_files) ? taskItem.allowed_files : [],
        acceptance_criteria: Array.isArray(taskItem.acceptance_criteria) ? taskItem.acceptance_criteria : [],
        required_inputs: Array.isArray(taskItem.required_inputs) ? taskItem.required_inputs : [],
        expected_outputs: Array.isArray(taskItem.expected_outputs) ? taskItem.expected_outputs : [],
        do_not_change: Array.isArray(taskItem.do_not_change) ? taskItem.do_not_change : [],
        resume_steps: Array.isArray(taskItem.resume_steps) ? taskItem.resume_steps : [],
        verification_commands: Array.isArray(taskItem.verification_commands) ? taskItem.verification_commands : []
      }) : null,
      scope: contract.scope,
      output_contract: null,
      handoff_evidence: [],
      handoff_report_path: null,
      session_trace_path: `.kabeeri/reports/${sessionId}.trace.json`
    };
    data.sessions.push(item);
    writeJsonFile(file, data);
    appendAudit("ai_session.started", "session", item.session_id, `AI session started for ${taskId}`);
    console.log(`Started session ${item.session_id}`);
    return;
  }

  if (action === "end") {
    const sessionId = flags.id || value;
    if (!sessionId) throw new Error("Missing session id.");
    const item = data.sessions.find((entry) => entry.session_id === sessionId);
    if (!item) throw new Error(`Session not found: ${sessionId}`);
    if (flags.actor && flags.actor !== item.developer_id) throw new Error("Only the session developer can end this session.");
    const inputTokens = Number(flags["input-tokens"] || 0);
    const outputTokens = Number(flags["output-tokens"] || 0);
    const cachedTokens = Number(flags["cached-tokens"] || 0);
    const calculated = calculateUsageCost({
      provider: item.provider || flags.provider || "unknown",
      model: item.model || flags.model || "unknown",
      inputTokens,
      outputTokens,
      cachedTokens
    });
    item.status = "completed";
    item.ended_at = new Date().toISOString();
    item.input_tokens = inputTokens;
    item.output_tokens = outputTokens;
    item.cached_tokens = cachedTokens;
    item.total_tokens = inputTokens + outputTokens + cachedTokens;
    item.cost = flags.cost !== undefined ? Number(flags.cost || 0) : calculated.cost;
    item.cost_source = flags.cost !== undefined ? "manual" : calculated.source;
    item.files_touched = parseCsv(flags.files);
    assertNoProtectedFrameworkFiles(item.files_touched, flags);
    enforceSessionAppBoundary(item);
    enforceTokenFileScope(item);
    enforceSessionLockCoverage(item);
    enforceSessionWorkstreamBoundary(item);
    item.summary = flags.summary || "";
    item.checks_run = parseCsv(flags.checks);
    item.risks = parseCsv(flags.risks);
    item.known_limitations = parseCsv(flags.limitations);
    item.needs_review = flags["needs-review"] || "";
    item.next_suggested_task = flags.next || "";
    item.output_contract = buildSessionOutputContract(item);
    item.handoff_evidence = buildSessionHandoffEvidence(item);
    item.handoff_report_path = `.kabeeri/reports/${item.session_id}.handoff.md`;
    item.session_trace = buildSessionTrace(item);
    item.session_trace_path = `.kabeeri/reports/${item.session_id}.trace.json`;
    writeJsonFile(file, data);
    appendJsonLine(".kabeeri/ai_usage/usage_events.jsonl", {
      event_id: `usage-${Date.now()}`,
      timestamp: item.ended_at,
      session_id: item.session_id,
      task_id: item.task_id,
      sprint_id: item.sprint_id || getTaskSprint(item.task_id),
      developer_id: item.developer_id,
      workstream: flags.workstream || "untracked",
      provider: item.provider,
      model: item.model,
      input_tokens: item.input_tokens,
      output_tokens: item.output_tokens,
      cached_tokens: item.cached_tokens,
      total_tokens: item.total_tokens,
      cost: item.cost,
      currency: flags.currency || "USD",
      cost_source: item.cost_source,
      source: "ai_session",
      tracked: flags.tracked !== "false"
    });
    writeJsonFile(".kabeeri/ai_usage/usage_summary.json", summarizeUsage());
    writeTextFile(item.handoff_report_path, buildSessionHandoffService(item));
    writeJsonFile(item.session_trace_path, item.session_trace);
    appendAudit("ai_session.completed", "session", item.session_id, `AI session completed for ${item.task_id}`);
    console.log(`Completed session ${item.session_id}`);
    return;
  }

  if (action === "show") {
    const sessionId = flags.id || value;
    if (!sessionId) throw new Error("Missing session id.");
    const item = data.sessions.find((entry) => entry.session_id === sessionId);
    if (!item) throw new Error(`Session not found: ${sessionId}`);
    console.log(JSON.stringify({
      ...item,
      runtime_status: getSessionRuntimeStatus(item)
    }, null, 2));
    return;
  }

  if (action === "replay") {
    const sessionId = flags.id || value || data.current_session_id || latestSessionId(data.sessions);
    if (!sessionId) throw new Error("Missing session id.");
    const item = data.sessions.find((entry) => entry.session_id === sessionId);
    if (!item) throw new Error(`Session not found: ${sessionId}`);
    const taskTrashState = ensureTaskTrashState();
    const tracePath = item.session_trace_path || `.kabeeri/reports/${item.session_id}.trace.json`;
    const trace = readJsonFile(tracePath);
    const replay = buildSessionReplay({
      session: item,
      trace,
      taskTrashState,
      taskMemory: item.task_memory || null
    });
    const replayPath = `.kabeeri/reports/${item.session_id}.replay.json`;
    replay.replay_path = replayPath;
    writeJsonFile(replayPath, replay);
    if (flags.json) {
      console.log(JSON.stringify(replay, null, 2));
      return;
    }
    console.log(renderSessionReplay(replay));
    return;
  }

  throw new Error(`Unknown session action: ${action}`);
}

module.exports = {
  session
};

function latestSessionId(sessions = []) {
  const sorted = [...sessions].sort((a, b) => String(b.started_at || b.ended_at || b.session_id || "").localeCompare(String(a.started_at || a.ended_at || a.session_id || "")));
  return sorted[0] ? sorted[0].session_id : null;
}

function buildSessionContract(taskItem, token, item) {
  const taskWorkstreams = Array.isArray(taskItem && taskItem.workstreams) && taskItem.workstreams.length
    ? taskItem.workstreams
    : taskItem && taskItem.workstream
      ? [taskItem.workstream]
      : [];
  const allowedFiles = (token && token.allowed_files) || [];
  const forbiddenFiles = (token && token.forbidden_files) || [];
  return {
    contract_type: "ai_session",
    version: 1,
    task_id: item.task_id,
    task_title: taskItem ? taskItem.title : "",
    task_status: taskItem ? taskItem.status : "",
    developer_id: item.developer_id,
    provider: item.provider,
    model: item.model,
    token_id: token ? token.token_id : null,
    started_at: item.started_at,
    acceptance_criteria: Array.isArray(taskItem && taskItem.acceptance_criteria) ? taskItem.acceptance_criteria : [],
    scope: {
      workstreams: taskWorkstreams,
      app_usernames: Array.isArray(taskItem && taskItem.app_usernames) ? taskItem.app_usernames : [],
      app_paths: Array.isArray(taskItem && taskItem.app_paths) ? taskItem.app_paths : [],
      allowed_files: allowedFiles,
      forbidden_files: forbiddenFiles,
      scope_mode: token ? token.scope_mode || "manual" : "manual",
      scope_source: token ? token.scope_source || "manual" : "manual",
      scope_warnings: token ? token.scope_warnings || [] : []
    }
  };
}

function buildSessionOutputContract(item) {
  return {
    contract_type: "ai_session_output",
    version: 1,
    session_id: item.session_id,
    task_id: item.task_id,
    developer_id: item.developer_id,
    summary: item.summary || "",
    files_touched: item.files_touched || [],
    checks_run: item.checks_run || [],
    risks: item.risks || [],
    known_limitations: item.known_limitations || [],
    needs_review: item.needs_review || "",
    next_suggested_task: item.next_suggested_task || "",
    session_trace_path: item.session_trace_path || null,
    totals: {
      input_tokens: item.input_tokens || 0,
      output_tokens: item.output_tokens || 0,
      cached_tokens: item.cached_tokens || 0,
      total_tokens: item.total_tokens || 0,
      cost: item.cost || 0
    },
    handoff_report_path: `.kabeeri/reports/${item.session_id}.handoff.md`
  };
}

function buildSessionTrace(item) {
  return {
    trace_type: "ai_session_trace",
    version: 1,
    session_id: item.session_id,
    task_id: item.task_id,
    sprint_id: item.sprint_id || null,
    developer_id: item.developer_id,
    token_id: item.token_id || null,
    provider: item.provider || "unknown",
    model: item.model || "unknown",
    status: item.status || "unknown",
    started_at: item.started_at || null,
    ended_at: item.ended_at || null,
    task_memory: item.task_memory || null,
    contract: item.contract || null,
    output_contract: item.output_contract || null,
    scope: item.scope || null,
    files_touched: item.files_touched || [],
    handoff_report_path: item.handoff_report_path || null,
    generated_at: new Date().toISOString()
  };
}

function buildSessionHandoffEvidence(item) {
  return [
    {
      evidence_type: "handoff_report",
      path: `.kabeeri/reports/${item.session_id}.handoff.md`,
      generated_at: item.ended_at || new Date().toISOString()
    },
    {
      evidence_type: "usage_event",
      path: ".kabeeri/ai_usage/usage_events.jsonl",
      generated_at: item.ended_at || new Date().toISOString()
    }
  ];
}

function getSessionRuntimeStatus(item) {
  return item && item.status ? item.status : "unknown";
}

function getSessionScopeSummary(item) {
  const scope = item && item.scope ? item.scope : item && item.contract ? item.contract.scope : null;
  if (!scope) return "n/a";
  const workstreams = (scope.workstreams || []).join("+") || "unscoped";
  const files = (scope.allowed_files || []).length;
  return `${workstreams}${files ? `/${files}` : ""}`;
}

function buildSessionReplay({ session, trace, taskTrashState, taskMemory }) {
  const traceTaskMemory = trace && trace.task_memory ? trace.task_memory : null;
  const focusTaskMemory = taskMemory || traceTaskMemory || null;
  const archiveItems = Array.isArray(taskTrashState && taskTrashState.trash) ? taskTrashState.trash : [];
  const archivedTask = archiveItems.find((item) => item.id === session.task_id) || null;
  return {
    report_type: "session_replay",
    generated_at: new Date().toISOString(),
    session_id: session.session_id,
    task_id: session.task_id,
    developer_id: session.developer_id,
    status: session.status,
    replay_summary: buildSessionReplaySummary(session, focusTaskMemory, archivedTask, trace),
    session,
    task_memory: focusTaskMemory,
    trace: trace || null,
    archive_state: {
      total: archiveItems.length,
      retention_days: Number(taskTrashState && taskTrashState.retention_days ? taskTrashState.retention_days : 0) || 0,
      last_sweep_at: taskTrashState && taskTrashState.last_sweep_at ? taskTrashState.last_sweep_at : null,
      archived_task: archivedTask ? taskTrashSummary(archivedTask) : null,
      archived_task_present: Boolean(archivedTask)
    },
    next_action: session.status === "completed"
      ? "open the handoff report or start the next governed task"
      : "resume from the stored task memory and trace"
  };
}

function buildSessionReplaySummary(session, taskMemory, archivedTask, trace) {
  const parts = [];
  parts.push(`Session ${session.session_id} replayed for task ${session.task_id}.`);
  if (taskMemory) parts.push(`Task memory exists for ${taskMemory.task_id} with scope: ${taskMemory.scope || "n/a"}.`);
  if (trace && trace.task_memory) parts.push(`Trace includes resumable task memory and output contract.`);
  if (archivedTask) parts.push(`Archive state retains ${archivedTask.id} with status ${archivedTask.status}.`);
  parts.push(`Use the replay output instead of rereading chat to continue the last line of work.`);
  return parts.join(" ");
}

function renderSessionReplay(replay) {
  const session = replay.session || {};
  const memory = replay.task_memory || {};
  const archive = replay.archive_state || {};
  return [
    `Session Replay: ${replay.session_id || "unknown"}`,
    `Task: ${replay.task_id || "unknown"}`,
    `Developer: ${replay.developer_id || "unknown"}`,
    `Status: ${replay.status || "unknown"}`,
    `Replay path: ${replay.replay_path || "n/a"}`,
    `Next action: ${replay.next_action || "inspect task memory"}`,
    "",
    `Summary: ${replay.replay_summary || "n/a"}`,
    "",
    "Task memory:",
    `- Purpose: ${memory.purpose || "n/a"}`,
    `- Scope: ${memory.scope || "n/a"}`,
    `- Allowed files: ${(memory.source_of_truth && memory.source_of_truth.allowed_files && memory.source_of_truth.allowed_files.length) ? memory.source_of_truth.allowed_files.join(", ") : "n/a"}`,
    `- Resume steps: ${(memory.resume_steps && memory.resume_steps.length) ? memory.resume_steps.length : 0}`,
    "",
    "Archive state:",
    `- Total trashed: ${archive.total || 0}`,
    `- Retention days: ${archive.retention_days || 0}`,
    `- Last sweep: ${archive.last_sweep_at || "none"}`,
    `- Archived task present: ${archive.archived_task_present ? "yes" : "no"}`,
    archive.archived_task ? `- Archived task: ${archive.archived_task.id} (${archive.archived_task.original_status || archive.archived_task.status || "unknown"})` : null,
    "",
    "Session trace:",
    `- Trace path: ${session.session_trace_path || "n/a"}`,
    `- Handoff report: ${session.handoff_report_path || "n/a"}`
  ].filter(Boolean).join("\n");
}
