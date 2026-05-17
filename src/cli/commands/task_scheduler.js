const { buildTaskTemporaryQueueReport } = require("./temp");
const { ensureTaskTrashState, moveTaskToTrash, restoreTaskFromTrash, taskTrashSummary } = require("../services/task_trash");
const { resolvePlannedAiCandidateFromList, buildPlannedAiCandidatePoolFromEntries } = require("../services/ai_planner");

const SCHEDULER_FILE = ".kabeeri/task_scheduler.json";
const TASKS_FILE = ".kabeeri/tasks.json";
const AGENTS_FILE = ".kabeeri/agents.json";
const MULTI_AI_FILE = ".kabeeri/multi_ai_governance.json";
const EVOLUTION_FILE = ".kabeeri/evolution.json";

function taskScheduler(action, value, flags = {}, rest = [], deps = {}) {
  const {
    ensureWorkspace = () => {},
    readJsonFile = () => ({}),
    writeJsonFile = () => {},
    fileExists = () => false,
    table = () => "",
    appendAudit = () => {}
  } = deps;

  ensureWorkspace();
  ensureTaskSchedulerState(readJsonFile, writeJsonFile, fileExists);
  const state = readJsonFile(SCHEDULER_FILE);
  state.routes = Array.isArray(state.routes) ? state.routes : [];

  if (!action || ["status", "show", "summary", "list"].includes(String(action).toLowerCase())) {
    const report = buildTaskSchedulerReport(readJsonFile, fileExists);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderTaskSchedulerReport(report, table));
    return;
  }

  if (["move", "route", "assign", "handoff"].includes(String(action).toLowerCase())) {
    const result = routeTaskMovement(readJsonFile, writeJsonFile, fileExists, action, value, flags, rest, appendAudit, state);
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else console.log(renderTaskSchedulerResult(result));
    return;
  }

  if (["history", "routes"].includes(String(action).toLowerCase())) {
    const report = buildTaskSchedulerReport(readJsonFile, fileExists);
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

function ensureTaskSchedulerState(readJsonFile, writeJsonFile, fileExists) {
  if (!fileExists(SCHEDULER_FILE)) {
    writeJsonFile(SCHEDULER_FILE, {
      version: "v1",
      routes: [],
      last_run_at: null,
      policy: {
        preserve_history_days: 30
      }
    });
  }
  const state = readJsonFile(SCHEDULER_FILE);
  state.version = state.version || "v1";
  state.routes = Array.isArray(state.routes) ? state.routes : [];
  state.policy = state.policy && typeof state.policy === "object" ? state.policy : { preserve_history_days: 30 };
  state.last_run_at = state.last_run_at || null;
  writeJsonFile(SCHEDULER_FILE, state);
  return state;
}

function buildTaskSchedulerReport(readJsonFile, fileExists) {
  const schedulerState = fileExists(SCHEDULER_FILE) ? readJsonFile(SCHEDULER_FILE) : { routes: [], policy: {} };
  const tasksState = fileExists(TASKS_FILE) ? readJsonFile(TASKS_FILE) : { tasks: [], temporary_queue: null };
  const trashState = fileExists(".kabeeri/task_trash.json") ? readJsonFile(".kabeeri/task_trash.json") : ensureTaskTrashState();
  const multiAiState = fileExists(MULTI_AI_FILE) ? readJsonFile(MULTI_AI_FILE) : null;
  const evolutionState = fileExists(EVOLUTION_FILE) ? readJsonFile(EVOLUTION_FILE) : null;
  const tempQueue = tasksState.temporary_queue || null;
  const deferredIdeas = evolutionState && Array.isArray(evolutionState.deferred_ideas)
    ? evolutionState.deferred_ideas.filter((item) => item.status === "deferred")
    : [];
  const activeLeader = multiAiState && Array.isArray(multiAiState.leader_sessions)
    ? multiAiState.leader_sessions.find((item) => item.session_id === multiAiState.active_leader_session_id) || multiAiState.leader_sessions.find((item) => item.status === "active") || null
    : null;
  const activeAgentEntries = multiAiState && Array.isArray(multiAiState.agent_entries)
    ? multiAiState.agent_entries.filter((item) => item.status === "active")
    : [];
  const activeTasks = tasksState.tasks.filter((item) => ["assigned", "in_progress", "review", "owner_verified"].includes(item.status));
  const routes = schedulerState.routes.map((route) => buildTaskSchedulerRouteRecord(route));
  const newestRoute = routes.length ? routes[routes.length - 1] : null;
  const taskLineage = buildTaskSchedulerLineage(routes, tasksState, trashState);
  const trashRecovery = buildTaskTrashRecovery(trashState);
  return {
    report_type: "task_scheduler_status",
    generated_at: new Date().toISOString(),
    active_tasks: activeTasks.map(taskSchedulerSummary),
    temporary_queue: tempQueue ? {
      queue_id: tempQueue.queue_id,
      source_task_id: tempQueue.source_task_id,
      current_slice: tempQueue.current_slice || null,
      status: tempQueue.status
    } : null,
    trash: {
      total: trashState.trash.length,
      retention_days: trashState.retention_days || 30,
      last_sweep_at: trashState.last_sweep_at || null
    },
    deferred_ideas: {
      total: Array.isArray(evolutionState && evolutionState.deferred_ideas) ? evolutionState.deferred_ideas.length : 0,
      open: deferredIdeas.length
    },
    multi_ai: {
      active_leader_session_id: activeLeader ? activeLeader.session_id : null,
      active_leader_ai_id: activeLeader ? activeLeader.leader_ai_id : null,
      active_agents: activeAgentEntries.length,
      pending_calls: multiAiState && Array.isArray(multiAiState.call_inbox) ? multiAiState.call_inbox.filter((item) => item.status === "pending").length : 0
    },
    routes,
    current_route: newestRoute,
    task_lineage: taskLineage,
    trash_recovery: trashRecovery,
    counts: {
      tasks: tasksState.tasks.length,
      active_tasks: activeTasks.length,
      routes: routes.length,
      lineage_tasks: taskLineage.length,
      recoverable_trash: trashRecovery.items.length
    },
    next_recommendation: recommendNextRoute(tasksState, tempQueue, trashState, activeLeader, activeAgentEntries, deferredIdeas)
  };
}

function routeTaskMovement(readJsonFile, writeJsonFile, fileExists, action, value, flags, rest, appendAudit, schedulerState) {
  const route = String(flags.to || flags.destination || flags.route || value || rest[0] || "").trim().toLowerCase();
  const taskId = flags.task || flags.id || (route === "restore" ? rest[1] : value) || rest[0] || null;
  if (!route) throw new Error("Missing route target. Use --to trash|temp|agent|deferred|restore.");
  if (!taskId) throw new Error("Missing task id.");
  const now = new Date().toISOString();

  if (route === "trash") {
    const result = moveTaskToTrash(taskId, {
      reason: flags.reason || "scheduler_move",
      actor: flags.actor || flags.owner || flags.by || "scheduler"
    });
    const routeRecord = recordTaskSchedulerRoute(readJsonFile, writeJsonFile, fileExists, {
      route_id: nextRouteId(schedulerState.routes),
      task_id: taskId,
      from: "tasks",
      to: "trash",
      result: "completed",
      created_at: now,
      created_by: flags.actor || flags.owner || "scheduler",
      reason: flags.reason || "scheduler_move"
    }, schedulerState);
    if (appendAudit) appendAudit("task.scheduler_route", "task_scheduler", taskId, `Task routed to trash: ${taskId}`);
    return {
      report_type: "task_scheduler_route_completed",
      generated_at: now,
      route: "trash",
      task: result.task,
      task_record: result.trashed_task,
      route_record: routeRecord,
      trash: listTrashSummary(fileExists, readJsonFile)
    };
  }

  if (route === "restore") {
    const result = restoreTaskFromTrash(taskId, { reason: flags.reason || "scheduler_restore" });
    const routeRecord = recordTaskSchedulerRoute(readJsonFile, writeJsonFile, fileExists, {
      route_id: nextRouteId(schedulerState.routes),
      task_id: taskId,
      from: "trash",
      to: "tasks",
      result: "completed",
      created_at: now,
      created_by: flags.actor || flags.owner || "scheduler",
      reason: flags.reason || "scheduler_restore"
    }, schedulerState);
    if (appendAudit) appendAudit("task.scheduler_route", "task_scheduler", taskId, `Task restored from trash: ${taskId}`);
    return {
      report_type: "task_scheduler_route_completed",
      generated_at: now,
      route: "restore",
      task: result.task,
      restored_task: result.restored_task,
      route_record: routeRecord
    };
  }

  if (route === "temp") {
    const tasksState = readJsonFile(TASKS_FILE);
    const task = tasksState.tasks.find((item) => item.id === taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    const fromStatus = task.status || "tasks";
    if (!["owner_verified", "rejected"].includes(task.status)) {
      task.status = "in_progress";
    }
    task.scheduler_state = "temp";
    task.scheduler_routed_at = now;
    task.scheduler_reason = flags.reason || "scheduler_temp";
    task.updated_at = now;
    writeJsonFile(TASKS_FILE, tasksState);
    const tempReport = buildTaskTemporaryQueueReport(readJsonFile, writeJsonFile, fileExists, "show", taskId, { task: taskId, json: true }, []);
    const routeRecord = recordTaskSchedulerRoute(readJsonFile, writeJsonFile, fileExists, {
      route_id: nextRouteId(schedulerState.routes),
      task_id: taskId,
      from: fromStatus,
      to: "temp",
      result: "completed",
      created_at: now,
      created_by: flags.actor || flags.owner || "scheduler",
      reason: flags.reason || "scheduler_temp",
      queue_id: tempReport.queue ? tempReport.queue.queue_id : null
    }, schedulerState);
    if (appendAudit) appendAudit("task.scheduler_route", "task_scheduler", taskId, `Task routed to temp: ${taskId}`);
    return {
      report_type: "task_scheduler_route_completed",
      generated_at: now,
      route: "temp",
      task: taskSchedulerSummary(task),
      queue: tempReport.queue,
      route_record: routeRecord
    };
  }

  if (route === "agent") {
    const tasksState = readJsonFile(TASKS_FILE);
    const task = tasksState.tasks.find((item) => item.id === taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    const agentState = fileExists(AGENTS_FILE) ? readJsonFile(AGENTS_FILE) : { agents: [] };
    const explicitTarget = flags.to && String(flags.to).trim().toLowerCase() !== "agent" ? flags.to : null;
    const agentId = flags.agent || flags.ai || flags.assignee || explicitTarget || rest[1] || resolvePlannedAiCandidateFromList(buildPlannedAiCandidatePoolFromEntries(agentState.agents || [], {
      mapEntry: (agent) => ({
        agent_id: agent.id,
        agent_name: agent.name || agent.id,
        provider: agent.provider || "unknown",
        model: agent.model || "unknown",
        role: agent.role || "worker",
        capabilities: Array.isArray(agent.workstreams) ? agent.workstreams : [],
        leader_eligible: agent.leader_eligible,
        entered_at: agent.created_at || agent.updated_at || null,
        last_seen_at: agent.updated_at || agent.created_at || null,
        active_queue_count: 0,
        queue_labels: []
      })
    }), {
      title: task.title || taskId,
      name: task.title || taskId,
      label: task.title || taskId,
      description: task.description || task.summary || task.title || taskId,
      summary: task.summary || task.description || task.title || taskId,
      topic: task.title || taskId
    });
    if (!agentId) throw new Error("Missing --agent or no suitable agent found.");
    const agent = resolveAgentIdentity(agentId, readJsonFile, fileExists);
    if (!agent) throw new Error(`Agent not found: ${agentId}`);
    task.assignee_id = agent.id;
    if (!["in_progress", "review", "owner_verified"].includes(task.status)) task.status = "assigned";
    task.scheduler_state = "agent_handoff";
    task.scheduler_routed_at = now;
    task.scheduler_reason = flags.reason || "scheduler_agent";
    task.updated_at = now;
    writeJsonFile(TASKS_FILE, tasksState);
    const routeRecord = recordTaskSchedulerRoute(readJsonFile, writeJsonFile, fileExists, {
      route_id: nextRouteId(schedulerState.routes),
      task_id: taskId,
      from: flags.from || "tasks",
      to: `agent:${agent.id}`,
      result: "completed",
      created_at: now,
      created_by: flags.actor || flags.owner || "scheduler",
      reason: flags.reason || "scheduler_agent",
      agent_id: agent.id
    }, schedulerState);
    if (appendAudit) appendAudit("task.scheduler_route", "task_scheduler", taskId, `Task handed to agent: ${agent.id}`);
    return {
      report_type: "task_scheduler_route_completed",
      generated_at: now,
      route: "agent",
      task: taskSchedulerSummary(task),
      agent: summarizeAgent(agent),
      route_record: routeRecord
    };
  }

  if (route === "deferred") {
    const tasksState = readJsonFile(TASKS_FILE);
    const task = tasksState.tasks.find((item) => item.id === taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    task.scheduler_state = "deferred";
    task.deferred_at = now;
    task.deferred_reason = flags.reason || "scheduler_deferred";
    task.deferred_review_at = flags["review-at"] || flags.review_at || null;
    task.updated_at = now;
    writeJsonFile(TASKS_FILE, tasksState);
    const routeRecord = recordTaskSchedulerRoute(readJsonFile, writeJsonFile, fileExists, {
      route_id: nextRouteId(schedulerState.routes),
      task_id: taskId,
      from: flags.from || task.status || "tasks",
      to: "deferred",
      result: "planned",
      created_at: now,
      created_by: flags.actor || flags.owner || "scheduler",
      reason: flags.reason || "scheduler_deferred"
    }, schedulerState);
    if (appendAudit) appendAudit("task.scheduler_route", "task_scheduler", taskId, `Task deferred: ${taskId}`);
    return {
      report_type: "task_scheduler_route_planned",
      generated_at: now,
      route: "deferred",
      task: taskSchedulerSummary(task),
      route_record: routeRecord,
      next_command: task.scheduler_state === "deferred" ? "kvdf evolution deferred" : null
    };
  }

  throw new Error(`Unknown scheduler route target: ${route}`);
}

function buildTaskSchedulerRouteRecord(record) {
  return {
    route_id: record.route_id,
    task_id: record.task_id,
    from: record.from || null,
    to: record.to || null,
    result: record.result || "planned",
    created_at: record.created_at || null,
    created_by: record.created_by || null,
    reason: record.reason || null,
    agent_id: record.agent_id || null,
    queue_id: record.queue_id || null
  };
}

function recordTaskSchedulerRoute(readJsonFile, writeJsonFile, fileExists, record, schedulerState = null) {
  const state = schedulerState || ensureTaskSchedulerState(readJsonFile, writeJsonFile, fileExists);
  state.routes = Array.isArray(state.routes) ? state.routes : [];
  const routeRecord = buildTaskSchedulerRouteRecord(record);
  state.routes.push(routeRecord);
  state.last_run_at = routeRecord.created_at || new Date().toISOString();
  writeJsonFile(SCHEDULER_FILE, state);
  return routeRecord;
}

function nextRouteId(records) {
  return `task-route-${String((records || []).length + 1).padStart(3, "0")}`;
}

function taskSchedulerSummary(task) {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    assignee_id: task.assignee_id || null,
    scheduler_state: task.scheduler_state || null,
    workstreams: Array.isArray(task.workstreams) ? task.workstreams : task.workstream ? [task.workstream] : []
  };
}

function summarizeAgent(agent) {
  return {
    id: agent.id,
    name: agent.name || "",
    role: agent.role || "",
    workstreams: Array.isArray(agent.workstreams) ? agent.workstreams : []
  };
}

function buildTaskSchedulerLineage(routes, tasksState, trashState) {
  const taskIndex = new Map();
  for (const task of Array.isArray(tasksState && tasksState.tasks) ? tasksState.tasks : []) {
    taskIndex.set(task.id, {
      location: "tasks",
      task: taskTrashSummary(task),
      status: task.status || "unknown",
      title: task.title || ""
    });
  }
  for (const task of Array.isArray(trashState && trashState.trash) ? trashState.trash : []) {
    taskIndex.set(task.id, {
      location: "trash",
      task: taskTrashSummary(task),
      status: task.original_status || task.status || "trashed",
      title: task.title || ""
    });
  }

  const grouped = new Map();
  for (const route of Array.isArray(routes) ? routes : []) {
    if (!route || !route.task_id) continue;
    const normalized = buildTaskSchedulerRouteRecord(route);
    const entry = grouped.get(normalized.task_id) || {
      task_id: normalized.task_id,
      route_count: 0,
      history: [],
      last_moved_at: null,
      current_destination: null,
      current_reason: null
    };
    entry.history.push(normalized);
    entry.route_count += 1;
    entry.last_moved_at = normalized.created_at || entry.last_moved_at;
    entry.current_destination = normalized.to || entry.current_destination;
    entry.current_reason = normalized.reason || entry.current_reason;
    entry.current_route = normalized;
    grouped.set(normalized.task_id, entry);
  }

  return Array.from(grouped.values())
    .map((entry) => {
      const snapshot = taskIndex.get(entry.task_id) || null;
      const restoreHint = snapshot && snapshot.location === "trash"
        ? {
            command: `kvdf task trash restore ${entry.task_id}`,
            scheduler_command: `kvdf schedule route ${entry.task_id} --to restore`,
            reason: snapshot.task.trashed_reason || entry.current_reason || "scheduler_restore",
            trash_expires_at: snapshot.task.trash_expires_at || null
          }
        : null;
      return {
        ...entry,
        history: entry.history.sort((left, right) => compareDates(left.created_at, right.created_at)),
        current_location: snapshot ? snapshot.location : entry.current_destination || null,
        current_status: snapshot ? snapshot.status : null,
        current_title: snapshot ? snapshot.title : null,
        restore_hint: restoreHint
      };
    })
    .sort((left, right) => compareDates(right.last_moved_at, left.last_moved_at));
}

function buildTaskTrashRecovery(trashState) {
  const items = Array.isArray(trashState && trashState.trash) ? trashState.trash : [];
  return {
    total: items.length,
    items: items.map((item) => ({
      task_id: item.id || null,
      title: item.title || "",
      trashed_reason: item.trashed_reason || null,
      trashed_at: item.trashed_at || null,
      trash_expires_at: item.trash_expires_at || null,
      original_status: item.original_status || null,
      restore_command: item.id ? `kvdf task trash restore ${item.id}` : null,
      scheduler_command: item.id ? `kvdf schedule route ${item.id} --to restore` : null
    }))
  };
}

function compareDates(left, right) {
  const a = left ? new Date(left) : null;
  const b = right ? new Date(right) : null;
  const leftTime = a && !Number.isNaN(a.getTime()) ? a.getTime() : 0;
  const rightTime = b && !Number.isNaN(b.getTime()) ? b.getTime() : 0;
  return leftTime - rightTime;
}

function resolveAgentIdentity(agentId, readJsonFile, fileExists) {
  const id = String(agentId || "").trim();
  if (!id) return null;
  const agents = fileExists(AGENTS_FILE) ? readJsonFile(AGENTS_FILE).agents || [] : [];
  return agents.find((item) => item.id === id && item.status !== "inactive") || null;
}

function listTrashSummary(fileExists, readJsonFile) {
  if (!fileExists(".kabeeri/task_trash.json")) return { total: 0, last_sweep_at: null };
  const trash = readJsonFile(".kabeeri/task_trash.json");
  return {
    total: Array.isArray(trash.trash) ? trash.trash.length : 0,
    last_sweep_at: trash.last_sweep_at || null,
    retention_days: trash.retention_days || 30
  };
}

function recommendNextRoute(tasksState, tempQueue, trashState, activeLeader, activeAgentEntries, deferredIdeas) {
  const inProgressTask = tasksState.tasks.find((item) => item.status === "in_progress" && !item.scheduler_state);
  if (inProgressTask && !tempQueue) {
    return {
      action: "route_to_temp",
      task_id: inProgressTask.id,
      reason: "The active task has not been materialized into the temporary queue yet.",
      next_command: `kvdf schedule route ${inProgressTask.id} --to temp`
    };
  }
  if (tasksState.tasks.some((item) => item.status === "owner_verified" && !item.scheduler_state && item.updated_at && !item.completed_at)) {
    const task = tasksState.tasks.find((item) => item.status === "owner_verified" && !item.scheduler_state && item.updated_at && !item.completed_at);
    return {
      action: "route_to_trash",
      task_id: task ? task.id : null,
      reason: "Verified tasks should move into the trash retention bucket after completion.",
      next_command: task ? `kvdf task complete ${task.id}` : "kvdf task complete <task-id>"
    };
  }
  if (activeLeader && activeAgentEntries.length > 0) {
    return {
      action: "ready_for_agent_handoff",
      reason: "A leader and agents are available for scheduled handoffs.",
      next_command: "kvdf multi-ai agent call --ai <agent-id> --request \"Need routing input\""
    };
  }
  if (trashState.trash.length > 0) {
    const nextTrash = trashState.trash[trashState.trash.length - 1];
    return {
      action: "review_trash",
      reason: "There are archived tasks that can be restored if needed.",
      next_command: nextTrash ? `kvdf task trash restore ${nextTrash.id}` : "kvdf task trash list"
    };
  }
  if (deferredIdeas.length > 0) {
    return {
      action: "review_deferred",
      reason: "There are deferred items waiting for a restore decision.",
      next_command: "kvdf evolution deferred"
    };
  }
  return {
    action: "idle",
    reason: "No special routing required right now."
  };
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
      item.current_location || "",
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
