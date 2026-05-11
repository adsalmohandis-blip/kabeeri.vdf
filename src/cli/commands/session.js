const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { writeTextFile } = require("../fs_utils");
const { table } = require("../ui");

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
    buildSessionHandoff
  } = deps;
  ensureWorkspace();
  const file = ".kabeeri/sessions.json";
  const data = readJsonFile(file);
  data.sessions = data.sessions || [];

  if (!action || action === "list") {
    console.log(table(["ID", "Task", "Developer", "Status", "Model"], data.sessions.map((item) => [
      item.session_id,
      item.task_id,
      item.developer_id,
      item.status,
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
    const item = {
      session_id: flags.id || `session-${String(data.sessions.length + 1).padStart(3, "0")}`,
      task_id: taskId,
      sprint_id: getTaskSprint(taskId),
      developer_id: developerId,
      token_id: token ? token.token_id : null,
      provider: flags.provider || "unknown",
      model: flags.model || "unknown",
      status: "active",
      started_at: new Date().toISOString(),
      files_touched: []
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
    writeTextFile(`.kabeeri/reports/${item.session_id}.handoff.md`, buildSessionHandoff(item));
    appendAudit("ai_session.completed", "session", item.session_id, `AI session completed for ${item.task_id}`);
    console.log(`Completed session ${item.session_id}`);
    return;
  }

  if (action === "show") {
    const sessionId = flags.id || value;
    if (!sessionId) throw new Error("Missing session id.");
    const item = data.sessions.find((entry) => entry.session_id === sessionId);
    if (!item) throw new Error(`Session not found: ${sessionId}`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }

  throw new Error(`Unknown session action: ${action}`);
}

module.exports = {
  session
};
