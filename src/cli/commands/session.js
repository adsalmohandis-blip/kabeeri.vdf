const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { writeTextFile } = require("../fs_utils");
const { table } = require("../ui");
const { buildSessionHandoff: buildSessionHandoffDefault } = require("../services/session_handoff");

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
    const contract = buildSessionContract(taskItem, token, {
      session_id: flags.id || `session-${String(data.sessions.length + 1).padStart(3, "0")}`,
      task_id: taskId,
      developer_id: developerId,
      provider: flags.provider || "unknown",
      model: flags.model || "unknown",
      started_at
    });
    const item = {
      session_id: flags.id || `session-${String(data.sessions.length + 1).padStart(3, "0")}`,
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
      scope: contract.scope,
      output_contract: null,
      handoff_evidence: [],
      handoff_report_path: null
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

  throw new Error(`Unknown session action: ${action}`);
}

module.exports = {
  session
};

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
