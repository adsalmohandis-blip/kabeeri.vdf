const { fileExists, readJsonFile, writeJsonFile } = require("../fs_utils");
const { ensureWorkspace } = require("../workspace");
const { buildTaskLifecycleState } = require("./task_lifecycle");
const { buildTaskMemory, ensureTaskMemory } = require("../services/task_memory");
const { buildTaskTemporaryQueueSlices } = require("./temp");
const { readTaskAssessmentsState } = require("./task_assessment");

const TASKS_FILE = ".kabeeri/tasks.json";
const BOARD_REPORT_FILE = ".kabeeri/reports/task_coverage_board.json";

function taskCoverage(action, value, flags = {}, rest = [], deps = {}) {
  const {
    ensureWorkspace: ensureWorkspaceOverride = ensureWorkspace,
    readJsonFile: readJsonFileOverride = readJsonFile,
    writeJsonFile: writeJsonFileOverride = writeJsonFile,
    fileExists: fileExistsOverride = fileExists,
    table = () => ""
  } = deps;

  ensureWorkspaceOverride();
  const tasksState = readTaskState(readJsonFileOverride, writeJsonFileOverride, fileExistsOverride);
  const actionName = String(action || "").toLowerCase();

  if (!action || ["coverage", "show", "status", "list", "board", "summary"].includes(actionName)) {
    const targetId = flags.id || flags.task || value || null;
    if (targetId && !["board", "summary", "list"].includes(String(targetId).toLowerCase())) {
      const task = resolveTask(tasksState.tasks, targetId);
      if (!task) throw new Error(`Task not found: ${targetId}`);
      const report = buildTaskCoverageReport(task, tasksState, readJsonFileOverride);
      writeJsonFileOverride(report.report_path, report);
      syncTaskCoverageState(tasksState, task.id, report);
      writeJsonFileOverride(TASKS_FILE, tasksState);
      if (flags.json) console.log(JSON.stringify(report, null, 2));
      else console.log(renderTaskCoverageReport(report));
      return;
    }

    const report = buildTaskCoverageBoard(tasksState, readJsonFileOverride);
    writeJsonFileOverride(BOARD_REPORT_FILE, report);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderTaskCoverageBoard(report, table));
    return;
  }

  throw new Error(`Unknown task coverage action: ${action}`);
}

function buildTaskCoverageBoard(tasksState, readJsonFile) {
  const assessmentsState = readTaskAssessmentsState();
  const rows = (tasksState.tasks || []).map((task) => buildTaskCoverageRow(task, tasksState, assessmentsState, readJsonFile));
  const generatedAt = new Date().toISOString();
  const summary = summarizeCoverageRows(rows);
  return {
    report_type: "task_full_coverage_board",
    generated_at: generatedAt,
    report_path: BOARD_REPORT_FILE,
    source: TASKS_FILE,
    coverage_policy: "full_task_coverage",
    summary,
    tasks: rows,
    next_actions: buildCoverageBoardNextActions(rows, summary)
  };
}

function buildTaskCoverageReport(task, tasksState, readJsonFile) {
  const assessmentsState = readTaskAssessmentsState();
  const assessment = findAssessmentForTask(assessmentsState.assessments || [], task);
  const memory = ensureTaskMemory(task, {
    purpose: task.execution_summary || task.title,
    summary: task.execution_summary || task.title,
    source: task.source || "manual",
    workstreams: Array.isArray(task.workstreams) ? task.workstreams : task.workstream ? [task.workstream] : [],
    app_usernames: Array.isArray(task.app_usernames) ? task.app_usernames : task.app_username ? [task.app_username] : [],
    allowed_files: Array.isArray(task.allowed_files) ? task.allowed_files : [],
    acceptance_criteria: Array.isArray(task.acceptance_criteria) ? task.acceptance_criteria : [],
    required_inputs: Array.isArray(task.required_inputs) ? task.required_inputs : [],
    expected_outputs: Array.isArray(task.expected_outputs) ? task.expected_outputs : [],
    do_not_change: Array.isArray(task.do_not_change) ? task.do_not_change : [],
    resume_steps: Array.isArray(task.resume_steps) ? task.resume_steps : [],
    verification_commands: Array.isArray(task.verification_commands) ? task.verification_commands : []
  }) || buildTaskMemory(task);
  const lifecycle = buildTaskLifecycleState(task);
  const plannedSlices = buildTaskTemporaryQueueSlices(task, memory).map(normalizeCoverageSlice);
  const queue = resolveMaterializedQueue(tasksState, task.id);
  const queueSlices = queue && Array.isArray(queue.slices) ? queue.slices.map(normalizeCoverageSlice) : plannedSlices.map((slice) => ({ ...slice, state: "pending", completed_at: null }));
  const completedSlices = queueSlices.filter((slice) => slice.state === "done").length;
  const openSlices = queueSlices.length - completedSlices;
  const coverageState = queue ? (queue.status === "completed" ? "complete" : "materialized") : "planned";
  const generatedAt = new Date().toISOString();
  return {
    report_type: "task_full_coverage_report",
    generated_at: generatedAt,
    report_path: taskCoverageReportPath(task.id),
    task_id: task.id,
    title: task.title,
    status: task.status,
    coverage_policy: "full_task_coverage",
    lifecycle,
    assessment: assessment ? {
      assessment_id: assessment.assessment_id,
      status: assessment.status,
      readiness: assessment.readiness,
      risk_level: assessment.risk_level,
      blockers: assessment.blockers || [],
      recommended_next_actions: assessment.recommended_next_actions || []
    } : null,
    memory,
    planned_slices: plannedSlices,
    materialized_queue: queue ? {
      queue_id: queue.queue_id,
      source_task_id: queue.source_task_id,
      status: queue.status,
      current_slice_index: queue.current_slice_index,
      current_slice: queue.current_slice || null,
      coverage_policy: queue.coverage_policy || "full_task_coverage",
      slices: queue.slices || []
    } : null,
    coverage: {
      state: coverageState,
      materialized: Boolean(queue),
      planned_slices: plannedSlices.length,
      completed_slices: completedSlices,
      open_slices: openSlices,
      remainder_free: queue ? queue.status === "completed" : false
    },
    next_actions: buildCoverageTaskNextActions({ lifecycle, assessment, coverageState, queue, openSlices })
  };
}

function buildTaskCoverageRow(task, tasksState, assessmentsState, readJsonFile) {
  const assessment = findAssessmentForTask(assessmentsState.assessments || [], task);
  const memory = ensureTaskMemory(task, {
    source: task.source || "manual",
    workstreams: Array.isArray(task.workstreams) ? task.workstreams : task.workstream ? [task.workstream] : [],
    app_usernames: Array.isArray(task.app_usernames) ? task.app_usernames : task.app_username ? [task.app_username] : [],
    allowed_files: Array.isArray(task.allowed_files) ? task.allowed_files : []
  }) || buildTaskMemory(task);
  const plannedSlices = buildTaskTemporaryQueueSlices(task, memory);
  const queue = resolveMaterializedQueue(tasksState, task.id);
  const queueSlices = queue && Array.isArray(queue.slices) ? queue.slices : plannedSlices;
  const completedSlices = queueSlices.filter((slice) => String(slice.state || "").toLowerCase() === "done").length;
  const openSlices = queueSlices.length - completedSlices;
  const lifecycle = buildTaskLifecycleState(task);
  const coverageState = queue ? (queue.status === "completed" ? "complete" : "materialized") : (memory ? "planned" : "missing");
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    lifecycle_stage: lifecycle.current_stage,
    lifecycle_next_action: lifecycle.next_action,
    assessment_id: assessment ? assessment.assessment_id : null,
    coverage_state: coverageState,
    coverage_policy: "full_task_coverage",
    planned_slices: plannedSlices.length,
    completed_slices: completedSlices,
    open_slices: openSlices,
    queue_id: queue ? queue.queue_id : null,
    report_path: taskCoverageReportPath(task.id)
  };
}

function summarizeCoverageRows(rows) {
  const summary = {
    total: rows.length,
    complete: 0,
    materialized: 0,
    planned: 0,
    missing: 0,
    open: 0,
    completed_slices: 0,
    open_slices: 0
  };
  for (const row of rows) {
    summary.completed_slices += Number(row.completed_slices || 0);
    summary.open_slices += Number(row.open_slices || 0);
    summary[row.coverage_state] = (summary[row.coverage_state] || 0) + 1;
    if (row.open_slices > 0) summary.open += 1;
    if (row.coverage_state === "materialized") summary.materialized += 0;
    if (row.coverage_state === "complete") summary.complete += 0;
  }
  summary.complete = rows.filter((row) => row.coverage_state === "complete").length;
  summary.materialized = rows.filter((row) => row.coverage_state === "materialized").length;
  summary.planned = rows.filter((row) => row.coverage_state === "planned").length;
  summary.missing = rows.filter((row) => row.coverage_state === "missing").length;
  summary.covered = summary.complete + summary.materialized + summary.planned;
  return summary;
}

function buildCoverageBoardNextActions(rows, summary) {
  const actions = [];
  if (summary.open > 0) {
    const next = rows.find((row) => row.open_slices > 0 && row.coverage_state !== "complete");
    if (next) actions.push(`run kvdf task coverage ${next.id}`);
    actions.push("advance the active task temporary queue until all slices are complete");
  } else {
    actions.push("all visible tasks have full task coverage");
  }
  return actions;
}

function buildCoverageTaskNextActions(context) {
  const actions = [];
  if (context.coverageState === "planned") actions.push("materialize the task temporary queue with `kvdf temp`");
  if (context.coverageState === "materialized" && context.openSlices > 0) actions.push("advance the active temp queue slices until the task is complete");
  if (context.coverageState === "complete") actions.push("sync docs, state, and task tracker so coverage is visible everywhere");
  if (context.assessment && context.assessment.recommended_next_actions && context.assessment.recommended_next_actions.length) actions.push(...context.assessment.recommended_next_actions);
  if (context.lifecycle && context.lifecycle.next_action) actions.push(context.lifecycle.next_action);
  return uniqueList(actions);
}

function resolveMaterializedQueue(tasksState, taskId) {
  const queue = tasksState && tasksState.temporary_queue && tasksState.temporary_queue.source_task_id === taskId ? tasksState.temporary_queue : null;
  return queue && typeof queue === "object" ? queue : null;
}

function normalizeCoverageSlice(slice) {
  return {
    slice_id: slice.slice_id || slice.id || "",
    order: Number(slice.order || 0),
    title: slice.title || "",
    description: slice.description || "",
    state: String(slice.state || "pending").toLowerCase(),
    completed_at: slice.completed_at || null,
    done_definition: slice.done_definition || "",
    owner_confirmation_required: Boolean(slice.owner_confirmation_required)
  };
}

function renderTaskCoverageReport(report) {
  return [
    `Task Coverage Report: ${report.task_id || "unknown"}`,
    `Title: ${report.title || "n/a"}`,
    `Status: ${report.status || "unknown"}`,
    `Coverage policy: ${report.coverage_policy || "full_task_coverage"}`,
    `Coverage state: ${report.coverage && report.coverage.state ? report.coverage.state : "planned"}`,
    `Lifecycle: ${report.lifecycle ? `${report.lifecycle.current_stage} -> ${report.lifecycle.next_action}` : "n/a"}`,
    `Assessment: ${report.assessment ? `${report.assessment.readiness} / ${report.assessment.status}` : "none"}`,
    `Report path: ${report.report_path || taskCoverageReportPath(report.task_id)}`,
    "",
    "Planned slices:",
    ...(report.planned_slices && report.planned_slices.length ? report.planned_slices.map(renderCoverageSliceLine) : ["- none"]),
    "",
    "Materialized queue:",
    ...(report.materialized_queue ? [
      `- Queue: ${report.materialized_queue.queue_id || "unknown"} (${report.materialized_queue.status || "unknown"})`,
      `- Open slices: ${report.coverage ? report.coverage.open_slices : 0}`,
      `- Completed slices: ${report.coverage ? report.coverage.completed_slices : 0}`
    ] : ["- none"]),
    "",
    "Next actions:",
    ...(report.next_actions && report.next_actions.length ? report.next_actions.map((item) => `- ${item}`) : ["- none"])
  ].join("\n");
}

function renderTaskCoverageBoard(report, table) {
  const rows = report.tasks || [];
  return [
    "Task Coverage Board",
    "",
    `Generated at: ${report.generated_at || "unknown"}`,
    `Coverage policy: ${report.coverage_policy || "full_task_coverage"}`,
    `Tasks: ${report.summary.total || 0}`,
    `Complete: ${report.summary.complete || 0}`,
    `Materialized: ${report.summary.materialized || 0}`,
    `Planned: ${report.summary.planned || 0}`,
    `Missing: ${report.summary.missing || 0}`,
    `Open slices: ${report.summary.open_slices || 0}`,
    "",
    "Task coverage rows:",
    rows.length ? table(["ID", "Title", "Status", "Coverage", "Slices", "Open"], rows.slice(0, 50).map((item) => [
      item.id,
      item.title,
      item.status,
      item.coverage_state,
      String(item.planned_slices || 0),
      String(item.open_slices || 0)
    ])) : "No tasks found.",
    "",
    "Next actions:",
    ...(report.next_actions && report.next_actions.length ? report.next_actions.map((item) => `- ${item}`) : ["- none"])
  ].join("\n");
}

function renderCoverageSliceLine(slice) {
  return `- [${slice.state || "pending"}] ${slice.order}. ${slice.title}${slice.description ? `: ${slice.description}` : ""}`;
}

function readTaskState(readJsonFile, writeJsonFile, fileExists) {
  if (!fileExists(TASKS_FILE)) {
    writeJsonFile(TASKS_FILE, { version: "v1", tasks: [], temporary_queue: null });
  }
  const state = readJsonFile(TASKS_FILE);
  state.version = state.version || "v1";
  state.tasks = Array.isArray(state.tasks) ? state.tasks : [];
  state.temporary_queue = state.temporary_queue && typeof state.temporary_queue === "object" ? state.temporary_queue : null;
  return state;
}

function resolveTask(tasks, targetId) {
  const id = String(targetId || "").trim();
  if (!id) return null;
  return (tasks || []).find((item) => item.id === id) || null;
}

function taskCoverageReportPath(taskId) {
  return `.kabeeri/reports/task_coverage_${String(taskId || "task").replace(/[^a-z0-9._-]+/gi, "_")}.json`;
}

function syncTaskCoverageState(tasksState, taskId, report) {
  const task = resolveTask(tasksState.tasks, taskId);
  if (!task) return;
  task.coverage_report_path = report.report_path;
  task.coverage_policy = report.coverage_policy;
  task.coverage_state = report.coverage.state;
  task.coverage_updated_at = report.generated_at;
  task.coverage_open_slices = report.coverage.open_slices;
  task.coverage_completed_slices = report.coverage.completed_slices;
  task.coverage_slices = report.planned_slices.length;
  task.coverage_materialized = report.coverage.materialized;
}

function findAssessmentForTask(records, task) {
  return (records || []).find((item) => item.task_id === task.id || item.assessment_id === task.assessment_id) || null;
}

function uniqueList(values) {
  return [...new Set((values || []).map((item) => String(item).trim()).filter(Boolean))];
}

module.exports = {
  taskCoverage,
  buildTaskCoverageBoard,
  buildTaskCoverageReport,
  taskCoverageReportPath
};
