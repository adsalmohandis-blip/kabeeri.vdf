const { fileExists, readJsonFile, writeJsonFile } = require("../fs_utils");
const { ensureWorkspace } = require("../workspace");
const { buildTaskLifecycleState } = require("./task_lifecycle");

const ASSESSMENTS_FILE = ".kabeeri/task_assessments.json";

function taskAssessment(action, value, flags = {}, rest = [], deps = {}) {
  ensureWorkspace();
  ensureTaskAssessmentsState();
  const state = readJsonFile(ASSESSMENTS_FILE);
  state.assessments = Array.isArray(state.assessments) ? state.assessments : [];

  if (!action || action === "list") {
    const rows = [...state.assessments]
      .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")))
      .map((item) => ({
        assessment_id: item.assessment_id,
        task_id: item.task_id || "",
        title: item.title || "",
        status: item.status || "unknown",
        readiness: item.readiness || "unknown",
        created_at: item.created_at || "",
        updated_at: item.updated_at || ""
      }));
    if (flags.json) console.log(JSON.stringify({ report_type: "task_assessment_list", generated_at: new Date().toISOString(), total: rows.length, items: rows }, null, 2));
    else console.log(renderTaskAssessmentList(rows));
    return;
  }

  if (action === "show" || action === "status") {
    const targetId = flags.id || value;
    if (!targetId) throw new Error("Missing assessment id or task id.");
    const record = findAssessmentRecord(state.assessments, targetId);
    if (!record) throw new Error(`Assessment not found: ${targetId}`);
    if (flags.json) console.log(JSON.stringify(record, null, 2));
    else console.log(renderTaskAssessment(record));
    return;
  }

  if (["assess", "assessment", "generate", "create"].includes(String(action).toLowerCase())) {
    const taskId = flags.id || value || flags.task || null;
    const task = taskId ? readTaskById(taskId) : null;
    const assessment = buildTaskAssessment({
      task,
      task_id: taskId || flags["task-id"] || null,
      title: flags.title || (task && task.title) || value || "Task assessment",
      goal: flags.goal || flags.objective || flags.description || value || (task && task.title) || "",
      source: flags.source || (task && task.source) || "manual",
      workstream: flags.workstream || (task && task.workstream) || null,
      workstreams: normalizeList(flags.workstreams || (task && task.workstreams) || []),
      app_usernames: normalizeList(flags.apps || (task && task.app_usernames) || task && task.app_username || []),
      allowed_files: normalizeList(flags["allowed-files"] || (task && task.allowed_files) || []),
      forbidden_files: normalizeList(flags["forbidden-files"] || (task && task.forbidden_files) || []),
      acceptance_criteria: normalizeList(flags.acceptance || (task && task.acceptance_criteria) || []),
      expected_checks: normalizeList(flags.checks || (task && task.verification_commands) || []),
      dependencies: normalizeList(flags.dependencies || (task && task.dependencies) || []),
      policy_gates: normalizeList(flags.gates || (task && task.policy_gates) || []),
      risk_signals: normalizeList(flags.risks || (task && task.risk_signals) || [])
    });
    const assessmentId = flags.assessment_id || flags.id || nextAssessmentId(state.assessments);
    const record = {
      assessment_id: assessmentId,
      task_id: assessment.task_id || null,
      title: assessment.title,
      goal: assessment.goal,
      source: assessment.source,
      status: assessment.status,
      readiness: assessment.readiness,
      summary: assessment.summary,
      blockers: assessment.blockers,
      dependencies: assessment.dependencies,
      recommended_next_actions: assessment.recommended_next_actions,
      scope: assessment.scope,
      risk_level: assessment.risk_level,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const existingIndex = state.assessments.findIndex((item) => item.assessment_id === record.assessment_id);
    if (existingIndex >= 0) state.assessments[existingIndex] = record;
    else state.assessments.push(record);
    writeTaskAssessmentsState(state);
    if (task) {
      const tasksState = readJsonFile(".kabeeri/tasks.json");
      tasksState.tasks = Array.isArray(tasksState.tasks) ? tasksState.tasks : [];
      const taskIndex = tasksState.tasks.findIndex((item) => item.id === task.id);
      if (taskIndex >= 0) {
        tasksState.tasks[taskIndex].assessment_id = record.assessment_id;
        tasksState.tasks[taskIndex].assessment_status = record.status;
        tasksState.tasks[taskIndex].assessment_readiness = record.readiness;
        tasksState.tasks[taskIndex].assessment_summary = record.summary;
        tasksState.tasks[taskIndex].assessment_updated_at = record.updated_at;
        tasksState.tasks[taskIndex].lifecycle = buildTaskLifecycleState(tasksState.tasks[taskIndex]);
        writeJsonFile(".kabeeri/tasks.json", tasksState);
      }
    }
    if (flags.json) console.log(JSON.stringify(record, null, 2));
    else console.log(renderTaskAssessment(record));
    return;
  }

  throw new Error(`Unknown task assessment action: ${action}`);
}

function buildTaskAssessment(input = {}) {
  const task = input.task || null;
  const title = String(input.title || (task && task.title) || "Task assessment").trim();
  const goal = String(input.goal || input.description || (task && task.title) || "").trim();
  const source = String(input.source || (task && task.source) || "").trim();
  const workstream = normalizeSingle(input.workstream || (task && task.workstream) || "");
  const workstreams = uniqueList([
    ...(Array.isArray(input.workstreams) ? input.workstreams : []),
    ...(task && Array.isArray(task.workstreams) ? task.workstreams : []),
    workstream
  ].filter(Boolean).map(normalizeSingle));
  const appUsernames = uniqueList([
    ...(Array.isArray(input.app_usernames) ? input.app_usernames : []),
    ...(task && Array.isArray(task.app_usernames) ? task.app_usernames : []),
    task && task.app_username ? task.app_username : null
  ].filter(Boolean).map((item) => String(item).trim()));
  const allowedFiles = uniqueList([...(Array.isArray(input.allowed_files) ? input.allowed_files : []), ...(task && Array.isArray(task.allowed_files) ? task.allowed_files : [])].filter(Boolean).map((item) => String(item).trim()));
  const forbiddenFiles = uniqueList([...(Array.isArray(input.forbidden_files) ? input.forbidden_files : []), ...(task && Array.isArray(task.forbidden_files) ? task.forbidden_files : [])].filter(Boolean).map((item) => String(item).trim()));
  const acceptanceCriteria = uniqueList([...(Array.isArray(input.acceptance_criteria) ? input.acceptance_criteria : []), ...(task && Array.isArray(task.acceptance_criteria) ? task.acceptance_criteria : [])].filter(Boolean).map((item) => String(item).trim()));
  const expectedChecks = uniqueList([...(Array.isArray(input.expected_checks) ? input.expected_checks : []), ...(task && Array.isArray(task.verification_commands) ? task.verification_commands : [])].filter(Boolean).map((item) => String(item).trim()));
  const dependencies = uniqueList([...(Array.isArray(input.dependencies) ? input.dependencies : []), ...(task && Array.isArray(task.dependencies) ? task.dependencies : [])].filter(Boolean).map((item) => String(item).trim()));
  const policyGates = uniqueList([...(Array.isArray(input.policy_gates) ? input.policy_gates : []), ...(task && Array.isArray(task.policy_gates) ? task.policy_gates : [])].filter(Boolean).map((item) => String(item).trim()));
  const riskSignals = uniqueList([...(Array.isArray(input.risk_signals) ? input.risk_signals : []), ...(task && Array.isArray(task.risk_signals) ? task.risk_signals : [])].filter(Boolean).map((item) => String(item).trim()));
  const scopeText = [goal, title, allowedFiles.join(" "), dependencies.join(" "), riskSignals.join(" ")].join(" ").toLowerCase();
  const largeScope = workstreams.length > 1 || appUsernames.length > 1 || allowedFiles.length > 3 || /large|enterprise|integration|migration|security|release|publish|orchestrate/.test(scopeText);
  const hasMultiApp = appUsernames.length > 1;
  const needsIntegration = workstreams.length > 1 || hasMultiApp;
  const blockers = [];
  if (!source && !goal && !title) blockers.push("missing_source");
  if (!workstream && workstreams.length === 0) blockers.push("missing_workstream");
  if (needsIntegration && String(input.type || task && task.type || "").toLowerCase() !== "integration") blockers.push("cross_scope_requires_integration");
  if (acceptanceCriteria.length === 0) blockers.push("missing_acceptance_criteria");
  if (expectedChecks.length === 0) blockers.push("missing_expected_checks");
  if (largeScope && allowedFiles.length === 0) blockers.push("missing_allowed_files");
  if (requiresPolicyGates(scopeText, riskSignals) && policyGates.length === 0) blockers.push("missing_policy_gates");
  const readiness = blockers.some((item) => ["missing_source", "missing_workstream", "cross_scope_requires_integration", "missing_policy_gates"].includes(item))
    ? "blocked"
    : blockers.length
      ? "needs_refinement"
      : "ready";
  const recommendedNextActions = buildAssessmentNextActions(blockers, readiness);
  const status = readiness === "ready" ? "ready" : readiness === "blocked" ? "blocked" : "needs_review";
  const lifecycle = task ? buildTaskLifecycleState(task) : null;
  return {
    task_id: task && task.id ? task.id : input.task_id || null,
    title,
    goal,
    source: source || "manual",
    status,
    readiness,
    risk_level: inferAssessmentRiskLevel(scopeText, blockers, largeScope),
    summary: buildAssessmentSummary({ title, goal, workstream, workstreams, appUsernames, largeScope, readiness, lifecycle }),
    blockers,
    dependencies,
    recommended_next_actions: recommendedNextActions,
    scope: {
      workstream: workstream || null,
      workstreams,
      app_usernames: appUsernames,
      allowed_files: allowedFiles,
      forbidden_files: forbiddenFiles,
      large_scope: largeScope,
      integration_required: needsIntegration
    },
    acceptance_criteria: acceptanceCriteria,
    expected_checks: expectedChecks,
    policy_gates: policyGates,
    risk_signals: riskSignals,
    lifecycle: lifecycle ? {
      current_stage: lifecycle.current_stage,
      stage_label: lifecycle.stage_label,
      next_action: lifecycle.next_action,
      next_statuses: lifecycle.next_statuses
    } : null
  };
}

function ensureTaskAssessmentsState() {
  if (!fileExists(ASSESSMENTS_FILE)) {
    writeJsonFile(ASSESSMENTS_FILE, {
      version: "v1",
      assessments: [],
      updated_at: null
    });
  }
  const state = readJsonFile(ASSESSMENTS_FILE);
  state.version = state.version || "v1";
  state.assessments = Array.isArray(state.assessments) ? state.assessments : [];
  state.updated_at = state.updated_at || null;
  writeTaskAssessmentsState(state);
  return state;
}

function writeTaskAssessmentsState(state) {
  writeJsonFile(ASSESSMENTS_FILE, {
    version: state.version || "v1",
    assessments: Array.isArray(state.assessments) ? state.assessments : [],
    updated_at: new Date().toISOString()
  });
}

function readTaskAssessmentsState() {
  return ensureTaskAssessmentsState();
}

function renderTaskAssessment(record) {
  return [
    `Task Assessment: ${record.assessment_id || "unknown"}`,
    `Task: ${record.task_id || "n/a"}`,
    `Title: ${record.title || "n/a"}`,
    `Status: ${record.status || "unknown"}`,
    `Readiness: ${record.readiness || "unknown"}`,
    `Risk: ${record.risk_level || "unknown"}`,
    "",
    `Summary: ${record.summary || "n/a"}`,
    "",
    "Blockers:",
    ...(record.blockers && record.blockers.length ? record.blockers.map((item) => `- ${item}`) : ["- none"]),
    "",
    "Dependencies:",
    ...(record.dependencies && record.dependencies.length ? record.dependencies.map((item) => `- ${item}`) : ["- none"]),
    "",
    "Next actions:",
    ...(record.recommended_next_actions && record.recommended_next_actions.length ? record.recommended_next_actions.map((item) => `- ${item}`) : ["- none"])
  ].join("\n");
}

function renderTaskAssessmentList(rows) {
  return [
    "Task Assessment List",
    "",
    `Total: ${rows.length}`,
    "",
    ...(rows.length ? rows.map((item) => `- ${item.assessment_id} | ${item.task_id || "n/a"} | ${item.status} | ${item.readiness} | ${item.title}`) : ["No assessments recorded."])
  ].join("\n");
}

function readTaskById(taskId) {
  if (!taskId) return null;
  if (!fileExists(".kabeeri/tasks.json")) return null;
  const state = readJsonFile(".kabeeri/tasks.json");
  return (state.tasks || []).find((item) => item.id === taskId) || null;
}

function findAssessmentRecord(records, targetId) {
  return (records || []).find((item) => item.assessment_id === targetId || item.task_id === targetId) || null;
}

function nextAssessmentId(records) {
  const prefix = "task-assessment";
  const existing = new Set((records || []).map((item) => item.assessment_id));
  let index = (records || []).length + 1;
  let id = `${prefix}-${String(index).padStart(3, "0")}`;
  while (existing.has(id)) {
    index += 1;
    id = `${prefix}-${String(index).padStart(3, "0")}`;
  }
  return id;
}

function normalizeList(value) {
  if (Array.isArray(value)) return value.flatMap((item) => normalizeList(item)).filter(Boolean);
  if (value === null || value === undefined) return [];
  return String(value)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSingle(value) {
  return String(value || "").trim();
}

function uniqueList(values) {
  return [...new Set((values || []).map((item) => String(item).trim()).filter(Boolean))];
}

function buildAssessmentSummary(input) {
  const parts = [];
  parts.push(`Task assessment for ${input.title || "untitled task"}.`);
  if (input.goal) parts.push(`Goal: ${input.goal}.`);
  if (input.workstream) parts.push(`Workstream: ${input.workstream}.`);
  if (input.workstreams && input.workstreams.length > 1) parts.push(`Multiple workstreams detected: ${input.workstreams.join(", ")}.`);
  if (input.appUsernames && input.appUsernames.length > 1) parts.push(`Multiple apps detected: ${input.appUsernames.join(", ")}.`);
  if (input.largeScope) parts.push("Large-scope heuristics suggest this work should stay assessment-driven before implementation.");
  parts.push(`Readiness: ${input.readiness}.`);
  if (input.lifecycle) parts.push(`Lifecycle stage: ${input.lifecycle.current_stage}.`);
  return parts.join(" ");
}

function buildAssessmentNextActions(blockers, readiness) {
  if (readiness === "ready") return [
    "Create or approve the governed task",
    "Assign the task and issue the correct token",
    "Use the lifecycle engine to move into execution"
  ];
  const actions = [];
  for (const blocker of blockers) {
    if (blocker === "missing_source") actions.push("add a traceable source or goal before execution");
    else if (blocker === "missing_workstream") actions.push("choose the workstream and app boundary");
    else if (blocker === "cross_scope_requires_integration") actions.push("mark the work as integration or split it into smaller tasks");
    else if (blocker === "missing_acceptance_criteria") actions.push("define measurable acceptance criteria");
    else if (blocker === "missing_expected_checks") actions.push("add expected validation commands");
    else if (blocker === "missing_allowed_files") actions.push("list the allowed files or folders");
    else if (blocker === "missing_policy_gates") actions.push("add the required policy gates or Owner approval path");
  }
  return uniqueList(actions);
}

function inferAssessmentRiskLevel(scopeText, blockers, largeScope) {
  if (blockers.includes("missing_policy_gates") || blockers.includes("cross_scope_requires_integration")) return "high";
  if (/security|migration|release|publish|payments|billing|auth|owner/.test(scopeText)) return "high";
  if (largeScope) return "medium";
  if (blockers.length) return "medium";
  return "low";
}

function requiresPolicyGates(scopeText, riskSignals) {
  return /security|migration|release|publish|payments|billing|auth|owner|payment|finance|compliance|privacy/.test(scopeText) || (riskSignals || []).some((item) => /security|migration|release|publish|policy|owner/i.test(String(item)));
}

module.exports = {
  ASSESSMENTS_FILE,
  buildTaskAssessment,
  ensureTaskAssessmentsState,
  findAssessmentRecord,
  nextAssessmentId,
  normalizeList,
  readTaskAssessmentsState,
  renderTaskAssessment,
  renderTaskAssessmentList,
  taskAssessment
};
