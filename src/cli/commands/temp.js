const { buildTaskMemory, ensureTaskMemory } = require("../services/task_memory");

function temp(action, value, flags = {}, rest = [], deps = {}) {
  const {
    ensureWorkspace = () => {},
    readJsonFile = () => ({}),
    writeJsonFile = () => {},
    fileExists = () => false,
    table = () => "",
    appendAudit = () => {}
  } = deps;

  ensureWorkspace();
  ensureTaskTempState(writeJsonFile, fileExists);

  if (!action || ["show", "list", "status"].includes(String(action).toLowerCase())) {
    const report = buildTaskTemporaryQueueReport(readJsonFile, writeJsonFile, fileExists, action, value, flags, rest);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderTaskTemporaryQueueReport(report, table));
    return;
  }

  if (["task", "app"].includes(String(action).toLowerCase())) {
    const report = buildTaskTemporaryQueueReport(readJsonFile, writeJsonFile, fileExists, "show", value, flags, rest);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderTaskTemporaryQueueReport(report, table));
    return;
  }

  if (["advance", "next"].includes(String(action).toLowerCase())) {
    const report = advanceTaskTemporaryQueue(readJsonFile, writeJsonFile, fileExists, value, flags, rest);
    appendAudit("task_temp.advanced", "task_temp", report.queue ? report.queue.queue_id : "none", `Advanced task temporary queue for ${report.active_task ? report.active_task.id : "none"}`);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderTaskTemporaryQueueReport(report, table));
    return;
  }

  if (["complete", "close", "finish"].includes(String(action).toLowerCase())) {
    const report = completeTaskTemporaryQueue(readJsonFile, writeJsonFile, fileExists, value, flags, rest);
    appendAudit("task_temp.completed", "task_temp", report.queue ? report.queue.queue_id : "none", `Completed task temporary queue for ${report.active_task ? report.active_task.id : "none"}`);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderTaskTemporaryQueueReport(report, table));
    return;
  }

  if (String(action).toLowerCase() === "clear") {
    const state = readJsonFile(".kabeeri/tasks.json");
    const queue = state.temporary_queue || null;
    state.temporary_queue = null;
    writeJsonFile(".kabeeri/tasks.json", state);
    const report = {
      report_type: "task_temporary_queue_cleared",
      generated_at: new Date().toISOString(),
      queue,
      status: "cleared"
    };
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log("Task temporary queue cleared.");
    return;
  }

  throw new Error(`Unknown temp action: ${action}`);
}

function ensureTaskTempState(writeJsonFile, fileExists) {
  if (!fileExists(".kabeeri/tasks.json")) {
    writeJsonFile(".kabeeri/tasks.json", { tasks: [], temporary_queue: null });
  }
}

function buildTaskTemporaryQueueReport(readJsonFile, writeJsonFile, fileExists, action, value, flags, rest) {
  const state = readJsonFile(".kabeeri/tasks.json");
  state.tasks = state.tasks || [];
  const queue = state.temporary_queue && typeof state.temporary_queue === "object" ? state.temporary_queue : null;
  const taskId = flags.task || flags.id || (action === "task" ? value : null) || null;
  const activeTask = resolveActiveTask(state.tasks, taskId);

  if (!activeTask) {
    if (queue && queue.source_task_id) {
      state.temporary_queue = null;
      writeJsonFile(".kabeeri/tasks.json", state);
    }
    return {
      report_type: "task_temporary_queue",
      generated_at: new Date().toISOString(),
      status: "empty",
      active_task: null,
      queue: null
    };
  }

  const taskMemory = ensureTaskMemory(activeTask);
  const sourceSignature = [activeTask.id, activeTask.status, activeTask.updated_at || activeTask.created_at || ""].join("|");
  const existing = queue && queue.source_task_id === activeTask.id && queue.source_signature === sourceSignature ? queue : null;
  const generatedAt = new Date().toISOString();
  const builtQueue = existing || {
    queue_id: `${activeTask.id}-temp`,
    source_task_id: activeTask.id,
    source_task_title: activeTask.title,
    source_task_status: activeTask.status,
    source_task_memory: taskMemory,
    source_task_signature: sourceSignature,
    generated_at: generatedAt,
    expires_when_task_changes: true,
    coverage_policy: "full_task_coverage",
    status: "active",
    current_slice_index: 0,
    slices: buildTaskTemporaryQueueSlices(activeTask, taskMemory).map((slice, index) => ({
      ...slice,
      state: index === 0 ? "active" : "pending",
      completed_at: null
    }))
  };

  if (existing && Array.isArray(existing.slices)) {
    builtQueue.slices = existing.slices.map((slice, index) => ({
      ...slice,
      order: slice.order || index + 1,
      state: slice.state || (index === existing.current_slice_index ? "active" : "pending")
    }));
    builtQueue.current_slice_index = Math.min(Math.max(Number(existing.current_slice_index || 0), 0), Math.max(builtQueue.slices.length - 1, 0));
  }

  builtQueue.current_slice = builtQueue.slices[builtQueue.current_slice_index] || null;
  builtQueue.updated_at = generatedAt;
  builtQueue.status = builtQueue.slices.some((slice) => slice.state === "blocked")
    ? "blocked"
    : builtQueue.slices.every((slice) => slice.state === "done")
      ? "completed"
      : "active";
  if (builtQueue.status === "completed") builtQueue.current_slice = null;
  state.temporary_queue = builtQueue;
  writeJsonFile(".kabeeri/tasks.json", state);
  return {
    report_type: "task_temporary_queue",
    generated_at: generatedAt,
    status: builtQueue.status,
    active_task: taskSummary(activeTask),
    queue: builtQueue
  };
}

function advanceTaskTemporaryQueue(readJsonFile, writeJsonFile, fileExists, value, flags, rest) {
  const report = buildTaskTemporaryQueueReport(readJsonFile, writeJsonFile, fileExists, "show", value, flags, rest);
  const state = readJsonFile(".kabeeri/tasks.json");
  const queue = state.temporary_queue;
  if (!queue) {
    return { ...report, action: "advance", message: "No active task temporary queue exists." };
  }
  const currentSlice = queue.slices[queue.current_slice_index] || null;
  if (!currentSlice) {
    return { ...report, action: "advance", message: "Task temporary queue has no current slice." };
  }
  currentSlice.state = "done";
  currentSlice.completed_at = new Date().toISOString();
  const nextIndex = queue.slices.findIndex((slice, index) => index > queue.current_slice_index && slice.state !== "done");
  if (nextIndex >= 0) {
    queue.current_slice_index = nextIndex;
    queue.slices[nextIndex].state = "active";
    queue.current_slice = queue.slices[nextIndex];
    queue.status = "active";
  } else {
    queue.current_slice = null;
    queue.status = "completed";
    queue.completed_at = new Date().toISOString();
  }
  queue.updated_at = new Date().toISOString();
  state.temporary_queue = queue;
  writeJsonFile(".kabeeri/tasks.json", state);
  return {
    report_type: "task_temporary_queue_advanced",
    generated_at: new Date().toISOString(),
    active_task: report.active_task,
    queue,
    completed_slice: currentSlice,
    next_slice: queue.current_slice || null,
    status: queue.status
  };
}

function completeTaskTemporaryQueue(readJsonFile, writeJsonFile, fileExists, value, flags, rest) {
  const report = buildTaskTemporaryQueueReport(readJsonFile, writeJsonFile, fileExists, "show", value, flags, rest);
  const state = readJsonFile(".kabeeri/tasks.json");
  const queue = state.temporary_queue;
  if (!queue) {
    return { ...report, action: "complete", message: "No active task temporary queue exists." };
  }
  const completedAt = new Date().toISOString();
  for (const slice of queue.slices) {
    if (slice.state !== "done") {
      slice.state = "done";
      slice.completed_at = slice.completed_at || completedAt;
    }
  }
  queue.status = "completed";
  queue.completed_at = completedAt;
  queue.current_slice = null;
  queue.updated_at = completedAt;
  state.temporary_queue = queue;
  writeJsonFile(".kabeeri/tasks.json", state);
  return {
    report_type: "task_temporary_queue_completed",
    generated_at: completedAt,
    active_task: report.active_task,
    queue,
    status: "completed"
  };
}

function resolveActiveTask(tasks, explicitTaskId) {
  const byId = explicitTaskId ? tasks.find((item) => item.id === explicitTaskId) || null : null;
  if (byId) return byId.status === "in_progress" ? byId : null;
  return tasks.find((item) => item.status === "in_progress") || null;
}

function buildTaskTemporaryQueueSlices(task, memory = null) {
  const title = task ? task.title : "Task";
  const taskMemory = memory || ensureTaskMemory(task) || buildTaskMemory(task);
  const allowedFiles = (taskMemory.source_of_truth && taskMemory.source_of_truth.allowed_files) || [];
  const workstreams = (taskMemory.source_of_truth && taskMemory.source_of_truth.workstreams) || [];
  const appUsernames = (taskMemory.source_of_truth && taskMemory.source_of_truth.app_usernames) || [];
  const acceptanceCriteria = taskMemory.acceptance_criteria || [];
  const verificationCommands = taskMemory.verification_commands || [];
  return [
    {
      slice_id: "scope",
      order: 1,
      title: `Lock full task coverage for ${title}`,
      description: `Restate the task memory in execution form so no part of the task is left outside the queue. ${taskMemory.scope || ""}`.trim(),
      done_definition: "The full task is written down from start to finish without omissions.",
      owner_confirmation_required: false
    },
    {
      slice_id: "map",
      order: 2,
      title: "Map app and task surfaces",
      description: `Identify the task files, app paths, workstreams, docs, tests, acceptance criteria, and handoff surfaces that must move together. ${allowedFiles.length ? `Allowed files: ${allowedFiles.join(", ")}.` : ""} ${workstreams.length ? `Workstreams: ${workstreams.join(", ")}.` : ""} ${appUsernames.length ? `Apps: ${appUsernames.join(", ")}.` : ""}`.trim(),
      done_definition: "All task surfaces are named and no known part is left out.",
      owner_confirmation_required: false
    },
    {
      slice_id: "implement",
      order: 3,
      title: "Implement the complete task path",
      description: `Make the smallest code and state change that still covers the entire current task path from entry to finish with no leftover execution remainder. ${acceptanceCriteria.length ? `Acceptance criteria: ${acceptanceCriteria.join(" | ")}.` : ""}`.trim(),
      done_definition: "The task path is implemented with no leftover execution remainder outside the queue.",
      owner_confirmation_required: false
    },
    {
      slice_id: "sync",
      order: 4,
      title: "Sync docs, state, and reports",
      description: `Update the source-of-truth docs, runtime state, and reports so the full task path is visible everywhere. ${taskMemory.handoff_note || ""}`.trim(),
      done_definition: "Documentation, live state, and reports all reflect the complete task path.",
      owner_confirmation_required: false
    },
    {
      slice_id: "validate",
      order: 5,
      title: "Validate and close the queue",
      description: `Run the relevant checks, confirm there are no conflicts, and close the queue only when the entire current task has been covered from start to finish. ${verificationCommands.length ? `Verification commands: ${verificationCommands.join(" | ")}.` : ""}`.trim(),
      done_definition: "Validation passes and no uncovered part of the active task remains.",
      owner_confirmation_required: false
    }
  ];
}

function taskSummary(task) {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    workstreams: Array.isArray(task.workstreams) ? task.workstreams : task.workstream ? [task.workstream] : [],
    app_username: task.app_username || null,
    app_usernames: Array.isArray(task.app_usernames) ? task.app_usernames : [],
    app_paths: Array.isArray(task.app_paths) ? task.app_paths : [],
    memory: task.memory || null
  };
}

function renderTaskTemporaryQueueReport(report, table) {
  if (report.report_type === "task_temporary_queue_advanced") {
    return `Task temporary queue advanced: ${report.completed_slice.title} -> ${report.next_slice ? report.next_slice.title : "complete"}`;
  }
  if (report.report_type === "task_temporary_queue_completed") {
    return `Task temporary queue completed for ${report.active_task ? report.active_task.id : "none"}`;
  }
  if (report.report_type === "task_temporary_queue_cleared") {
    return "Task temporary queue cleared.";
  }
  if (report.status === "empty") return "No active task temporary queue.";
  const queue = report.queue;
  const lines = [
    "Task Temporary Queue",
    "",
    `Active task: ${report.active_task.id} - ${report.active_task.title}`,
    report.active_task.memory ? `Memory: ${report.active_task.memory.summary || report.active_task.memory.purpose || "available"}` : "Memory: available",
    `Queue status: ${report.status}`,
    `Current slice: ${queue.current_slice ? `${queue.current_slice.order}. ${queue.current_slice.title}` : "none"}`,
    `Coverage policy: ${queue.coverage_policy || "full_task_coverage"}`,
    "",
    "Slices:"
  ];
  for (const slice of queue.slices) {
    lines.push(`- [${slice.state}] ${slice.order}. ${slice.title}: ${slice.description}`);
  }
  return lines.join("\n");
}

module.exports = {
  temp,
  buildTaskTemporaryQueueReport,
  advanceTaskTemporaryQueue,
  completeTaskTemporaryQueue,
  buildTaskTemporaryQueueSlices,
  resolveActiveTask,
  taskSummary,
  renderTaskTemporaryQueueReport,
  ensureTaskTempState
};
