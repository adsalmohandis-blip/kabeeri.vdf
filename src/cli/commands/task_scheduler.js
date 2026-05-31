const { ensureWorkspace } = require("../workspace");
const { buildTaskSchedulerReport, routeTaskMovement, ensureTaskSchedulerState, recordTaskSchedulerRoute } = require("../services/task_scheduler");

function taskScheduler(action, value, flags = {}, rest = [], deps = {}) {
  const {
    readJsonFile = () => ({}),
    writeJsonFile = () => {},
    fileExists = () => false,
    table = () => "",
    appendAudit = () => {}
  } = deps;

  ensureWorkspace();
  const project = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
  const workspaceTrack = project.workspace_kind === "developer_app" ? "vibe_app_developer" : "framework_owner";
  ensureTaskSchedulerState(readJsonFile, writeJsonFile, fileExists);

  if (!action || ["status", "show", "summary", "list"].includes(String(action).toLowerCase())) {
    const report = buildTaskSchedulerReport(readJsonFile, fileExists, { workspaceTrack });
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderTaskSchedulerReport(report, table));
    return;
  }

  if (["move", "route", "assign", "handoff"].includes(String(action).toLowerCase())) {
    const state = readJsonFile(".kabeeri/task_scheduler.json");
    state.routes = Array.isArray(state.routes) ? state.routes : [];
    const result = routeTaskMovement(readJsonFile, writeJsonFile, fileExists, action, value, flags, rest, appendAudit, state);
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else console.log(renderTaskSchedulerResult(result));
    return;
  }

  if (["history", "routes"].includes(String(action).toLowerCase())) {
    const report = buildTaskSchedulerReport(readJsonFile, fileExists, { workspaceTrack });
    if (flags.json) console.log(JSON.stringify({ routes: report.routes, task_lineage: report.task_lineage, trash_recovery: report.trash_recovery }, null, 2));
    else console.log(table(["Route", "Task", "From", "To", "At"], report.routes.map((item) => [
      item.route_id,
      item.task_id,
      item.from || "",
      item.to || "",
      item.created_at || ""
    ])));
    return;
  }

  throw new Error(`Unknown schedule action: ${action}`);
}

function renderTaskSchedulerReport(report, table) {
  const lines = [
    "Task Scheduler",
    "",
    `Tasks: ${report.counts.tasks} total, ${report.counts.active_tasks} active`,
    `Temporary queue: ${report.temporary_queue ? `${report.temporary_queue.queue_id} (${report.temporary_queue.status})` : "none"}`,
    `Trash: ${report.trash.total} task(s) / retention ${report.trash.retention_days} days`,
    `Deferred ideas: ${report.deferred_ideas.open}/${report.deferred_ideas.total} open`,
    `Multi-AI leader: ${report.multi_ai.active_leader_ai_id || "none"}`,
    `Active agents: ${report.multi_ai.active_agents}`,
    `Pending calls: ${report.multi_ai.pending_calls}`,
    `Next recommendation: ${report.next_recommendation ? `${report.next_recommendation.action} (${report.next_recommendation.reason})` : "none"}`,
    "",
    "Recent routes:"
  ];
  if (report.routes.length) {
    lines.push(table(["Route", "Task", "From", "To", "Result"], report.routes.slice(-8).reverse().map((item) => [
      item.route_id,
      item.task_id,
      item.from || "",
      item.to || "",
      item.result || ""
    ])));
  } else {
    lines.push("No routes recorded.");
  }
  lines.push("", "Task lineage:");
  if (report.task_lineage && report.task_lineage.length) {
    lines.push(table(["Task", "Current", "Hops", "Last reason", "Restore hint"], report.task_lineage.slice(0, 20).map((item) => [
      item.task_id,
      [
        item.current_location || "",
        item.current_milestone_id ? `milestone:${item.current_milestone_id}` : null,
        item.current_branch_name ? `branch:${item.current_branch_name}` : null,
        item.current_review_gate ? `review:${item.current_review_gate}` : null
      ].filter(Boolean).join(" | "),
      String(item.route_count || 0),
      item.current_reason || "",
      item.restore_hint ? item.restore_hint.command : ""
    ])));
  } else {
    lines.push("No task lineage recorded.");
  }
  lines.push("", "Trash recovery:");
  if (report.trash_recovery && report.trash_recovery.items && report.trash_recovery.items.length) {
    lines.push(table(["Task", "Trashed reason", "Restore command"], report.trash_recovery.items.map((item) => [
      item.task_id || "",
      item.trashed_reason || "",
      item.restore_command || ""
    ])));
  } else {
    lines.push("No recoverable trash records.");
  }
  return lines.join("\n");
}

function renderTaskSchedulerResult(result) {
  if (result.report_type === "task_scheduler_route_completed") {
    return `Task routed: ${result.route} for ${result.task ? result.task.id : "unknown"}`;
  }
  if (result.report_type === "task_scheduler_route_planned") {
    return `Task route planned: ${result.route} for ${result.task ? result.task.id : "unknown"}`;
  }
  return "Task scheduler updated.";
}

module.exports = {
  taskScheduler,
  ensureTaskSchedulerState,
  buildTaskSchedulerReport,
  routeTaskMovement,
  recordTaskSchedulerRoute
};
