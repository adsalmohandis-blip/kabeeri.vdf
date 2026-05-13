const { readJsonFile } = require("../workspace");
const { ensureTaskTrashState, taskTrashSummary } = require("../services/task_trash");

const LIFECYCLE_STAGES = ["intake", "ready", "execution", "validation", "closure", "blocked", "archived"];

function buildTaskLifecycleState(taskItem, options = {}) {
  const status = String(taskItem && taskItem.status ? taskItem.status : "unknown").toLowerCase();
  const stage = normalizeTaskLifecycleStage(taskItem, options);
  const archived = stage === "archived";
  const trashedAt = archived ? (taskItem.trashed_at || options.trashed_at || null) : null;
  const nextStatuses = getNextLifecycleStatuses(stage, status, archived);
  return {
    task_id: taskItem && (taskItem.id || taskItem.task_id) ? (taskItem.id || taskItem.task_id) : null,
    title: taskItem && taskItem.title ? taskItem.title : "",
    status: taskItem && taskItem.status ? taskItem.status : (archived ? "trashed" : "unknown"),
    current_stage: stage,
    stage_label: getLifecycleStageLabel(stage),
    stage_order: LIFECYCLE_STAGES,
    stage_index: Math.max(0, LIFECYCLE_STAGES.indexOf(stage)),
    next_statuses: nextStatuses,
    next_action: getLifecycleNextAction(stage, status, archived),
    blockers: Array.isArray(taskItem && taskItem.blockers) ? taskItem.blockers : [],
    assignee_id: taskItem && taskItem.assignee_id ? taskItem.assignee_id : "",
    reviewer_id: taskItem && taskItem.reviewer_id ? taskItem.reviewer_id : "",
    acceptance_criteria_count: Array.isArray(taskItem && taskItem.acceptance_criteria) ? taskItem.acceptance_criteria.length : 0,
    active_tokens: Array.isArray(taskItem && taskItem.active_tokens) ? taskItem.active_tokens : [],
    active_locks: Array.isArray(taskItem && taskItem.active_locks) ? taskItem.active_locks : [],
    active_sessions: Array.isArray(taskItem && taskItem.active_sessions) ? taskItem.active_sessions : [],
    trashed_at: trashedAt,
    trashed_reason: archived ? (taskItem.trashed_reason || options.trashed_reason || null) : null,
    original_status: archived ? (taskItem.original_status || options.original_status || status) : null,
    lifecycle_path: archived
      ? ["intake", "ready", "execution", "validation", "closure", "archived"]
      : ["intake", "ready", "execution", "validation", "closure"]
  };
}

function buildTaskLifecycleBoard(tasks = []) {
  const trashState = ensureTaskTrashState();
  const activeRows = (tasks || []).map((taskItem) => buildLifecycleRow(taskItem));
  const archivedRows = (trashState.trash || []).map((trashItem) => buildLifecycleRow({
    ...trashItem,
    status: "trashed",
    trashed_at: trashItem.trashed_at || null,
    trashed_reason: trashItem.trashed_reason || null,
    original_status: trashItem.original_status || trashItem.status || null
  }, { archived: true }));
  const rows = [...activeRows, ...archivedRows];
  const summary = summarizeLifecycleRows(rows);
  const byStage = groupLifecycleRows(rows);
  return {
    report_type: "task_lifecycle_board",
    generated_at: new Date().toISOString(),
    source: ".kabeeri/tasks.json",
    summary,
    by_stage: byStage,
    tasks: rows
  };
}

function buildLifecycleRow(taskItem, options = {}) {
  const lifecycle = buildTaskLifecycleState(taskItem, options);
  return {
    id: lifecycle.task_id,
    title: lifecycle.title,
    status: lifecycle.status,
    lifecycle_stage: lifecycle.current_stage,
    lifecycle_stage_label: lifecycle.stage_label,
    lifecycle_next_action: lifecycle.next_action,
    assignee_id: lifecycle.assignee_id,
    reviewer_id: lifecycle.reviewer_id,
    blockers: Array.isArray(lifecycle.blockers) ? lifecycle.blockers : [],
    archived: lifecycle.current_stage === "archived",
    trashed_at: lifecycle.trashed_at || null
  };
}

function renderTaskLifecycleState(state) {
  return [
    `Task Lifecycle: ${state.task_id || "unknown"}`,
    `Title: ${state.title || "n/a"}`,
    `Status: ${state.status || "unknown"}`,
    `Stage: ${state.current_stage || "intake"}${state.stage_label ? ` (${state.stage_label})` : ""}`,
    `Next action: ${state.next_action || "inspect task status and choose next governed action"}`,
    `Assignee: ${state.assignee_id || "n/a"}`,
    `Reviewer: ${state.reviewer_id || "n/a"}`,
    `Acceptance criteria: ${Number(state.acceptance_criteria_count || 0)}`,
    `Active tokens: ${(state.active_tokens || []).length}`,
    `Active locks: ${(state.active_locks || []).length}`,
    `Active sessions: ${(state.active_sessions || []).length}`,
    state.trashed_at ? `Trashed at: ${state.trashed_at}` : null,
    state.trashed_reason ? `Trashed reason: ${state.trashed_reason}` : null,
    "",
    "Lifecycle path:",
    ...renderLifecyclePath(state)
  ].filter(Boolean).join("\n");
}

function renderTaskLifecycleBoard(board) {
  const stageRows = Object.entries(board.summary.by_stage || {}).map(([stage, count]) => [
    stage,
    String(count || 0),
    getLifecycleStageLabel(stage),
    getLifecycleNextAction(stage)
  ]);
  const recentRows = (board.tasks || [])
    .slice()
    .sort((a, b) => String(b.trashed_at || b.status || "").localeCompare(String(a.trashed_at || a.status || "")))
    .slice(0, 12)
    .map((item) => [
      item.id || "",
      item.title || "",
      item.status || "",
      item.lifecycle_stage || "",
      item.lifecycle_next_action || ""
    ]);
  return [
    "Task Lifecycle Board",
    "",
    `Generated at: ${board.generated_at || "unknown"}`,
    `Total items: ${board.summary.total || 0}`,
    `Active: ${board.summary.active_total || 0}`,
    `Archived: ${board.summary.archived_total || 0}`,
    "",
    "Stages:",
    stageRows.length ? require("./../ui").table(["Stage", "Count", "Label", "Next Action"], stageRows) : "No lifecycle data.",
    "",
    "Recent lifecycle rows:",
    recentRows.length ? require("./../ui").table(["ID", "Title", "Status", "Stage", "Next Action"], recentRows) : "No recent tasks."
  ].join("\n");
}

function normalizeTaskLifecycleStage(taskItem, options = {}) {
  if (options.archived || taskItem && (taskItem.trashed_at || taskItem.source_collection === "tasks.json" && taskItem.trashed_reason)) return "archived";
  const status = String(taskItem && taskItem.status ? taskItem.status : "").toLowerCase();
  if (["proposed", "todo", "draft", "suggested", "intake", "backlog"].includes(status)) return "intake";
  if (["approved", "ready", "assigned"].includes(status)) return "ready";
  if (["in_progress", "working", "executing", "implementation"].includes(status)) return "execution";
  if (["review", "owner_verified", "verified", "accepted"].includes(status)) return "validation";
  if (["done", "closed", "completed"].includes(status)) return "closure";
  if (["blocked", "rejected", "deferred"].includes(status)) return "blocked";
  return status === "trashed" ? "archived" : "intake";
}

function getLifecycleStageLabel(stage) {
  const labels = {
    intake: "Intake",
    ready: "Ready",
    execution: "Execution",
    validation: "Validation",
    closure: "Closure",
    blocked: "Blocked",
    archived: "Archived"
  };
  return labels[stage] || "Intake";
}

function getLifecycleNextAction(stage, status = "", archived = false) {
  if (archived || stage === "archived" || status === "trashed") return "restore from trash or purge after retention";
  if (stage === "intake") return "approve or refine task scope";
  if (stage === "ready") return "assign the task and issue a scoped token";
  if (stage === "execution") return "continue execution, record evidence, then move to review";
  if (stage === "validation") return "review acceptance evidence and Owner verify or reject";
  if (stage === "closure") return "archive the completed task, tokens, and locks";
  if (stage === "blocked") return "resolve blockers or reopen with a clearer scope";
  return "inspect task status and choose next governed action";
}

function getNextLifecycleStatuses(stage, status, archived = false) {
  if (archived || stage === "archived" || status === "trashed") return ["restore", "purge"];
  if (stage === "intake") return ["approved", "ready"];
  if (stage === "ready") return ["assigned", "in_progress"];
  if (stage === "execution") return ["review"];
  if (stage === "validation") return ["owner_verified", "rejected"];
  if (stage === "closure") return ["closed"];
  if (stage === "blocked") return ["reopened", "ready"];
  return [];
}

function renderLifecyclePath(state) {
  const path = state.lifecycle_path || ["intake", "ready", "execution", "validation", "closure"];
  const current = state.current_stage || "intake";
  return path.map((stage) => {
    const marker = stage === current ? ">" : " ";
    return `${marker} ${stage}${stage === current ? " (current)" : ""}`;
  });
}

function summarizeLifecycleRows(rows) {
  const byStage = Object.fromEntries(LIFECYCLE_STAGES.map((stage) => [stage, 0]));
  let archivedTotal = 0;
  for (const row of rows) {
    const stage = row.lifecycle_stage || "intake";
    byStage[stage] = (byStage[stage] || 0) + 1;
    if (stage === "archived") archivedTotal += 1;
  }
  return {
    total: rows.length,
    active_total: rows.length - archivedTotal,
    archived_total: archivedTotal,
    by_stage: byStage
  };
}

function groupLifecycleRows(rows) {
  return rows.reduce((groups, row) => {
    const stage = row.lifecycle_stage || "intake";
    groups[stage] = groups[stage] || [];
    groups[stage].push({
      id: row.id,
      title: row.title,
      status: row.status,
      next_action: row.lifecycle_next_action,
      archived: row.archived || false,
      trashed_at: row.trashed_at || null
    });
    return groups;
  }, {});
}

function readTaskLifecycleTrash(taskId) {
  const trash = ensureTaskTrashState();
  const record = (trash.trash || []).find((item) => item.id === taskId);
  return record ? taskTrashSummary(record) : null;
}

module.exports = {
  buildTaskLifecycleState,
  buildTaskLifecycleBoard,
  normalizeTaskLifecycleStage,
  getLifecycleStageLabel,
  getLifecycleNextAction,
  readTaskLifecycleTrash,
  renderTaskLifecycleState,
  renderTaskLifecycleBoard
};
