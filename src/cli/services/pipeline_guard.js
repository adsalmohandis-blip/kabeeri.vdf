const PIPELINE_REPORT_PATH = ".kabeeri/reports/pipeline_enforcement.json";
const PIPELINE_MATRIX_DOC_PATH = "docs/reports/KVDF_PIPELINE_ENFORCEMENT_MATRIX.md";

function buildPipelineState(deps = {}) {
  const fileExists = deps.fileExists || (() => false);
  const readJsonFile = deps.readJsonFile || (() => ({}));
  const tasks = fileExists(".kabeeri/tasks.json") ? readJsonFile(".kabeeri/tasks.json").tasks || [] : [];
  const acceptance = fileExists(".kabeeri/acceptance.json") ? readJsonFile(".kabeeri/acceptance.json") : { records: [], checklists: [] };
  const tokens = fileExists(".kabeeri/tokens.json") ? readJsonFile(".kabeeri/tokens.json").tokens || [] : [];
  const locks = fileExists(".kabeeri/locks.json") ? readJsonFile(".kabeeri/locks.json").locks || [] : [];
  const delivery = fileExists(".kabeeri/delivery_decisions.json") ? readJsonFile(".kabeeri/delivery_decisions.json") : { recommendations: [], decisions: [], current_mode: null };
  const project = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
  const profile = fileExists(".kabeeri/project_profile.json") ? readJsonFile(".kabeeri/project_profile.json") : {};
  const blueprints = fileExists(".kabeeri/product_blueprints.json") ? readJsonFile(".kabeeri/product_blueprints.json") : {};
  const dataDesign = fileExists(".kabeeri/data_design.json") ? readJsonFile(".kabeeri/data_design.json") : {};
  const questionnaire = fileExists(".kabeeri/questionnaires/adaptive_intake_plan.json") ? readJsonFile(".kabeeri/questionnaires/adaptive_intake_plan.json") : { plans: [], current_plan_id: null };
  const contextBriefs = fileExists(".kabeeri/interactions/context_briefs.json") ? readJsonFile(".kabeeri/interactions/context_briefs.json") : { briefs: [] };
  const questionnaireAnswers = fileExists(".kabeeri/questionnaires/answers.json") ? readJsonFile(".kabeeri/questionnaires/answers.json") : { answers: [] };
  const taskSynthesis = fileExists(".kabeeri/reports/questionnaire_task_synthesis.json") ? readJsonFile(".kabeeri/reports/questionnaire_task_synthesis.json") : null;
  const taskPacket = fileExists("docs/reports/KVDF_TASK_CONTROL_PLANE_PACKET.json");
  const executorContract = fileExists("docs/reports/KVDF_TASK_EXECUTOR_CONTRACT.json");
  const batchRun = fileExists(".kabeeri/reports/task_batch_run.json") ? readJsonFile(".kabeeri/reports/task_batch_run.json") : null;
  const taskTrash = fileExists(".kabeeri/task_trash.json") ? readJsonFile(".kabeeri/task_trash.json") : { trash: [] };
  const scheduler = fileExists(".kabeeri/task_scheduler.json") ? readJsonFile(".kabeeri/task_scheduler.json") : { routes: [] };
  const currentQuestionnairePlan = findCurrentQuestionnairePlan(questionnaire);
  const packetTraceability = buildPacketTraceabilityState(contextBriefs, questionnaireAnswers, taskSynthesis, blueprints, dataDesign, delivery, currentQuestionnairePlan);
  const approvedOrReadyTasks = tasks.filter((task) => ["approved", "ready"].includes(String(task.status || "").toLowerCase()));
  const deliveryMap = currentQuestionnairePlan && currentQuestionnairePlan.delivery_map ? currentQuestionnairePlan.delivery_map : null;
  const startableTasks = tasks.filter((task) => hasActiveExecutionAccess(task, tokens, locks));
  const completedTasks = tasks.filter((task) => Boolean(task.completed_at || task.verified_at));
  const trashRecords = Array.isArray(taskTrash.trash) ? taskTrash.trash : [];
  const routeRecords = Array.isArray(scheduler.routes) ? scheduler.routes : [];

  return {
    workspace_exists: fileExists(".kabeeri"),
    project,
    profile,
    delivery,
    blueprints,
    questionnaire,
    tasks,
    current_delivery_mode: normalizeMode(resolveModeValue(delivery.current_mode) || project.delivery_mode || profile.current_delivery_mode || profile.current_delivery || ""),
    current_blueprint: blueprints.current_blueprint || null,
    current_questionnaire_plan: currentQuestionnairePlan,
    current_delivery_map: deliveryMap,
    current_task_synthesis: taskSynthesis,
    current_context_briefs: contextBriefs,
    current_questionnaire_answers: questionnaireAnswers,
    packet_traceability: packetTraceability,
    packet_traceability_complete: packetTraceability.complete,
    packet_traceability_missing_steps: packetTraceability.missing_steps,
    has_delivery_map: Boolean(
      deliveryMap && (
        (Array.isArray(deliveryMap.phases) && deliveryMap.phases.length > 0) ||
        (Array.isArray(deliveryMap.sprints) && deliveryMap.sprints.length > 0) ||
        (Array.isArray(deliveryMap.module_batches) && deliveryMap.module_batches.length > 0)
      )
    ),
    tasks_total: tasks.length,
    approved_or_ready_total: approvedOrReadyTasks.length,
    startable_tasks_total: startableTasks.length,
    completed_tasks_total: completedTasks.length,
    task_trash_total: trashRecords.length,
    task_trash_routes_total: routeRecords.filter((route) => String(route.to || "").toLowerCase() === "trash").length,
    active_tokens: tokens.filter((token) => token.status === "active"),
    active_locks: locks.filter((lockItem) => lockItem.status === "active"),
    acceptance_records_total: Array.isArray(acceptance.records) ? acceptance.records.length : 0,
    has_reviewed_acceptance: Array.isArray(acceptance.records) && acceptance.records.some((record) => ["reviewed", "accepted"].includes(String(record.status || "").toLowerCase())),
    task_packet: taskPacket,
    executorContract,
    batch_run: batchRun,
    packet_path: "docs/reports/KVDF_TASK_CONTROL_PLANE_PACKET.json",
    contract_path: "docs/reports/KVDF_TASK_EXECUTOR_CONTRACT.json",
    batch_run_path: ".kabeeri/reports/task_batch_run.json",
    acceptance_path: ".kabeeri/acceptance.json",
    delivery_path: ".kabeeri/delivery_decisions.json",
    project_path: ".kabeeri/project.json",
    profile_path: ".kabeeri/project_profile.json",
    blueprint_path: ".kabeeri/product_blueprints.json",
    questionnaire_path: ".kabeeri/questionnaires/adaptive_intake_plan.json"
  };
}

function buildPipelineEnforcementMatrix(state, deps = {}) {
  const fileExists = deps.fileExists || (() => false);
  const readJsonFile = deps.readJsonFile || (() => ({}));
  const taskId = deps.taskId || null;
  const startReadiness = resolveTaskStartReadiness(state, taskId, { fileExists, readJsonFile });
  const completionReadiness = resolveTaskCompletionReadiness(state, taskId, { fileExists, readJsonFile, readTextFile: deps.readTextFile });
  const matrix = [
    createEntry({
      id: "resume",
      command: "kvdf resume",
      guard_condition: "Workspace/session state is readable and the current track can be resolved.",
      file: ".kabeeri/session_track.json",
      failure_message: "Resume blocked: workspace/session state is missing. Run `kvdf init` or `kvdf entry` first.",
      passed: state.workspace_exists || Boolean(state.project && Object.keys(state.project).length),
      evidence: state.workspace_exists ? "Workspace state exists." : "No workspace state found."
    }),
    createEntry({
      id: "delivery-choose",
      command: "kvdf delivery choose <agile|structured>",
      guard_condition: "A delivery decision can be persisted into the workspace.",
      file: state.delivery_path,
      failure_message: "Delivery choice blocked: workspace state is missing. Run `kvdf init` first.",
      passed: state.workspace_exists,
      evidence: state.workspace_exists ? `Current mode: ${state.current_delivery_mode || "unset"}.` : "No workspace state found."
    }),
    createEntry({
      id: "blueprint-select",
      command: "kvdf blueprint select <key>",
      guard_condition: "The product blueprint catalog exists and a selection can be persisted.",
      file: state.blueprint_path,
      failure_message: "Blueprint selection blocked: no blueprint catalog state is available. Run `kvdf blueprint recommend` or `kvdf init` first.",
      passed: state.workspace_exists,
      evidence: state.current_blueprint ? `Current blueprint: ${state.current_blueprint}.` : "No current blueprint selected."
    }),
    createEntry({
      id: "project-profile-route",
      command: "kvdf project profile route --goal <text>",
      guard_condition: "The project profile can be routed from a goal or codebase signal.",
      file: state.profile_path,
      failure_message: "Project profile routing blocked: provide a project goal or workspace signal first.",
      passed: state.workspace_exists,
      evidence: state.profile.current_profile ? `Current profile: ${state.profile.current_profile}.` : "No current project profile."
    }),
    createEntry({
      id: "questionnaire-plan",
      command: "kvdf questionnaire plan <description>",
      guard_condition: "A chosen delivery mode exists and the request can resolve a product blueprint before the plan is compiled.",
      file: state.questionnaire_path,
      failure_message: "Questionnaire planning blocked: choose a delivery mode first with `kvdf delivery choose agile` or `kvdf delivery choose structured`.",
      passed: Boolean(state.current_delivery_mode),
      evidence: state.current_delivery_mode ? `Delivery mode: ${state.current_delivery_mode}.` : "Delivery mode unset."
    }),
    createEntry({
      id: "data-design-context",
      command: "kvdf data-design context <blueprint>",
      guard_condition: "A product blueprint is selected so the data design context can be derived.",
      file: ".kabeeri/data_design.json",
      failure_message: "Data design blocked: select a blueprint first with `kvdf blueprint select <key>`.",
      passed: Boolean(state.current_blueprint),
      evidence: state.current_blueprint ? `Blueprint: ${state.current_blueprint}.` : "No blueprint selected."
    }),
    createEntry({
      id: "task-assessment",
      command: "kvdf task assessment <task-id>",
      guard_condition: "The task has structured planning inputs: delivery mode and questionnaire plan.",
      file: ".kabeeri/task_assessments.json",
      failure_message: "Task assessment blocked: complete delivery selection and questionnaire planning first.",
      passed: Boolean(state.current_delivery_mode) && Boolean(state.current_questionnaire_plan),
      evidence: state.current_questionnaire_plan ? `Current questionnaire plan: ${state.current_questionnaire_plan.plan_id || state.questionnaire.current_plan_id}.` : "No questionnaire plan found."
    }),
    createEntry({
      id: "task-packet",
      command: "kvdf task packet",
      guard_condition: "The workspace has a delivery mode, questionnaire plan with a populated delivery map, a complete traceability chain, and approved or ready tasks to compile.",
      file: state.packet_path,
      failure_message: "Task packet blocked: choose a delivery mode, create a questionnaire plan with a delivery map, complete the traceability chain, and prepare approved or ready tasks first.",
      passed: Boolean(state.current_delivery_mode) && Boolean(state.current_questionnaire_plan) && Boolean(state.has_delivery_map) && Boolean(state.packet_traceability_complete) && state.approved_or_ready_total > 0,
      evidence: state.current_delivery_map
        ? `${state.approved_or_ready_total} approved/ready task(s), delivery map ${state.current_delivery_map.delivery_map_id || "n/a"}, and traceability ${state.packet_traceability_complete ? "complete" : `missing ${state.packet_traceability_missing_steps.join(", ")}`}.`
        : `${state.approved_or_ready_total} approved/ready task(s) available, but no delivery map is present.`
    }),
    createEntry({
      id: "task-executor-contract",
      command: "kvdf task executor-contract",
      guard_condition: "A control-plane packet exists and can be narrowed into a packet-only executor boundary.",
      file: state.contract_path,
      failure_message: "Executor contract blocked: compile the control-plane packet first with `kvdf task packet`.",
      passed: state.task_packet,
      evidence: state.task_packet ? `Packet file found at ${state.packet_path}.` : "No control-plane packet found."
    }),
    createEntry({
      id: "task-batch-run",
      command: "kvdf task batch-run --mode execute",
      guard_condition: "A packet and executor contract exist before approved tasks are started in governed order.",
      file: state.batch_run_path,
      failure_message: "Task batch-run blocked: compile the packet and executor contract first, then retry execution.",
      passed: state.task_packet && state.executorContract,
      evidence: state.task_packet && state.executorContract ? "Packet and contract are present." : "Packet or contract missing."
    }),
    createEntry({
      id: "task-start",
      command: "kvdf task start <task-id>",
      guard_condition: "The task has an assignee, an active token, and an active lock before work starts.",
      file: ".kabeeri/tasks.json",
      failure_message: taskId
        ? (startReadiness.passed ? "Task start blocked: assign the task, issue an active token, and create an active lock first." : `Task start blocked: ${startReadiness.message}`)
        : "Task start blocked: assign the task, issue an active token, and create an active lock first.",
      passed: taskId ? startReadiness.passed : state.startable_tasks_total > 0,
      evidence: buildTaskStartEvidence(state, taskId, startReadiness)
    }),
    createEntry({
      id: "task-verify",
      command: "kvdf task verify <task-id>",
      guard_condition: "Reviewed acceptance evidence exists for every acceptance criterion.",
      file: state.acceptance_path,
      failure_message: "Task verify blocked: record reviewed acceptance evidence before verification.",
      passed: state.has_reviewed_acceptance,
      evidence: state.has_reviewed_acceptance ? `${state.acceptance_records_total} acceptance record(s) present.` : "No reviewed acceptance record found."
    }),
    createEntry({
      id: "task-complete",
      command: "kvdf task complete <task-id>",
      guard_condition: "The task is owner-verified, has a matching verification report, and can be archived into task trash with a scheduler trail.",
      file: ".kabeeri/task_trash.json",
      failure_message: taskId
        ? (completionReadiness.passed ? "Task complete blocked: verify the task with Owner evidence before archiving it, then confirm the verification report and trash trail." : `Task complete blocked: ${completionReadiness.message}`)
        : "Task complete blocked: verify the task with Owner evidence before archiving it, then confirm the verification report and trash trail.",
      passed: taskId
        ? completionReadiness.passed
        : (Boolean(state.batch_run) && state.has_reviewed_acceptance && state.task_trash_total > 0 && state.task_trash_routes_total > 0),
      evidence: buildTaskCompletionEvidence(state, taskId, { fileExists, readJsonFile }, completionReadiness)
    })
  ];

  return matrix;
}

function assertStrictPipeline(commandKey, state, options = {}) {
  const matrix = buildPipelineEnforcementMatrix(state, options);
  const entry = matrix.find((item) => item.id === commandKey || item.command === commandKey);
  if (!entry) throw new Error(`Unknown pipeline command: ${commandKey}`);
  if (entry.status !== "pass") {
    throw new Error(entry.failure_message);
  }
  return { entry, matrix };
}

function renderPipelineEnforcementMatrix(matrix) {
  const rows = matrix.map((item) => [
    item.id,
    item.status,
    item.file,
    item.command,
    item.guard_condition,
    item.failure_message
  ]);
  return [
    "# KVDF Pipeline Enforcement Matrix",
    "",
    table(["Stage", "Status", "File", "Command", "Guard Condition", "Failure Message"], rows)
  ].join("\n");
}

function createEntry({ id, command, guard_condition, file, failure_message, passed, evidence }) {
  return {
    id,
    command,
    status: passed ? "pass" : "fail",
    file,
    guard_condition,
    failure_message,
    evidence: evidence || "",
    next_action: passed ? "Proceed to the next stage." : failure_message
  };
}

function resolveTaskStartReadiness(state, taskId, deps = {}) {
  const fileExists = deps.fileExists || (() => false);
  const readJsonFile = deps.readJsonFile || (() => ({}));
  if (!taskId) {
    return {
      passed: state.startable_tasks_total > 0,
      task: null,
      message: state.startable_tasks_total > 0
        ? `${state.startable_tasks_total} task(s) already have assignee, active token, and active lock coverage.`
        : "No task currently has a complete start trail."
    };
  }
  const task = findTaskById(state, taskId);
  const tokenState = fileExists(".kabeeri/tokens.json")
    ? readJsonFile(".kabeeri/tokens.json")
    : null;
  const lockState = fileExists(".kabeeri/locks.json")
    ? readJsonFile(".kabeeri/locks.json")
    : null;
  const tokenPool = Array.isArray(tokenState && tokenState.tokens) ? tokenState.tokens : Array.isArray(state.active_tokens) ? state.active_tokens : [];
  const lockPool = Array.isArray(lockState && lockState.locks) ? lockState.locks : Array.isArray(state.active_locks) ? state.active_locks : [];
  const taskRecord = task || { id: taskId, assignee_id: null };
  const token = tokenPool.find((item) => item.task_id === taskRecord.id && item.status === "active" && (!taskRecord.assignee_id || item.assignee_id === taskRecord.assignee_id)) || null;
  const lock = lockPool.find((item) => item.task_id === taskRecord.id && item.status === "active") || null;
  const blockers = [];
  if (task && !task.assignee_id) blockers.push("missing assignee");
  if (!token) blockers.push("missing active token");
  if (!lock) blockers.push("missing active lock");
  return {
    passed: blockers.length === 0,
    task: taskRecord,
    token,
    lock,
    message: blockers.length === 0
      ? `Task ${taskRecord.id} has assignee ${taskRecord.assignee_id || token.assignee_id}, token ${token.token_id}, and lock ${lock.lock_id}.`
      : `Task ${taskRecord.id} is not ready to start: ${blockers.join(", ")}.`
  };
}

function resolveTaskCompletionReadiness(state, taskId, deps = {}) {
  const fileExists = deps.fileExists || (() => false);
  const readJsonFile = deps.readJsonFile || (() => ({}));
  if (!taskId) {
    return {
      passed: state.task_trash_total > 0 && state.task_trash_routes_total > 0,
      task: null,
      verification_report: null,
      trash_record: null,
      route_record: null,
      message: state.task_trash_total > 0 && state.task_trash_routes_total > 0
        ? `${state.task_trash_total} trashed task(s) and ${state.task_trash_routes_total} trash route(s) are recorded.`
        : "No completed task trail is recorded."
    };
  }
  const task = findTaskById(state, taskId);
  const taskRecord = task || { id: taskId, title: "" };
  const verificationPath = `.kabeeri/reports/${taskId}.verification.md`;
  let verificationText = "";
  if (fileExists(verificationPath) && typeof deps.readTextFile === "function") {
    try {
      verificationText = String(deps.readTextFile(verificationPath) || "");
    } catch (error) {
      verificationText = "";
    }
  }
  const verificationReport = fileExists(verificationPath)
    ? {
      path: verificationPath,
      matches_task: verificationText.includes(`# Final Verification Report - ${taskId}`)
    }
    : null;
  const trashState = fileExists(".kabeeri/task_trash.json") ? readJsonFile(".kabeeri/task_trash.json") : { trash: [] };
  const trashRecord = Array.isArray(trashState.trash) ? trashState.trash.find((item) => item.id === taskId) || null : null;
  const schedulerState = fileExists(".kabeeri/task_scheduler.json") ? readJsonFile(".kabeeri/task_scheduler.json") : { routes: [] };
  const routeRecord = Array.isArray(schedulerState.routes)
    ? schedulerState.routes.find((route) => route.task_id === taskId && String(route.to || "").toLowerCase() === "trash") || null
    : null;
  const blockers = [];
  if (!verificationReport) blockers.push("missing verification report");
  else if (!verificationReport.matches_task) blockers.push("verification report does not match task");
  if (!trashRecord) blockers.push("missing trash archive record");
  if (!routeRecord) blockers.push("missing trash scheduler route");
  return {
    passed: blockers.length === 0,
    task: taskRecord,
    verification_report: verificationReport,
    trash_record: trashRecord,
    route_record: routeRecord,
    message: blockers.length === 0
      ? `Task ${taskRecord.id} has a matching verification report and archive trail.`
      : `Task ${taskRecord.id} is not ready for completion: ${blockers.join(", ")}.`
  };
}

function buildTaskStartEvidence(state, taskId, readiness) {
  if (!taskId) return readiness.message;
  if (!readiness.task) return readiness.message;
  const details = [
    `Task ${readiness.task.id}`,
    readiness.task.assignee_id ? `assignee ${readiness.task.assignee_id}` : "no assignee",
    readiness.token ? `token ${readiness.token.token_id}` : "no active token",
    readiness.lock ? `lock ${readiness.lock.lock_id}` : "no active lock"
  ];
  return readiness.message || details.join(", ");
}

function buildTaskCompletionEvidence(state, taskId, deps, readiness) {
  if (!taskId) return readiness.message;
  if (!readiness.task) return readiness.message;
  const parts = [`Task ${readiness.task.id}`];
  if (readiness.verification_report) parts.push(`verification report ${readiness.verification_report.path}`);
  if (readiness.trash_record) parts.push(`trash record ${readiness.trash_record.id || taskId}`);
  if (readiness.route_record) parts.push(`scheduler route ${readiness.route_record.route_id || "n/a"}`);
  return readiness.message || parts.join(", ");
}

function findTaskById(state, taskId) {
  const tasks = Array.isArray(state.tasks) ? state.tasks : [];
  return tasks.find((task) => task.id === taskId) || null;
}

function findActiveTaskToken(state, task) {
  const tokens = Array.isArray(state.active_tokens) ? state.active_tokens : [];
  return tokens.find((token) => token.task_id === task.id && token.status === "active" && (!task.assignee_id || token.assignee_id === task.assignee_id)) || null;
}

function findActiveTaskLock(state, task) {
  const locks = Array.isArray(state.active_locks) ? state.active_locks : [];
  return locks.find((lockItem) => lockItem.task_id === task.id && lockItem.status === "active") || null;
}

function hasActiveExecutionAccess(task, tokens = [], locks = []) {
  if (!task || !task.id) return false;
  if (!task.assignee_id) return false;
  const activeToken = (tokens || []).find((token) => token.task_id === task.id && token.status === "active" && token.assignee_id === task.assignee_id);
  if (!activeToken) return false;
  return (locks || []).some((lockItem) => lockItem.task_id === task.id && lockItem.status === "active");
}

function findCurrentQuestionnairePlan(questionnaire = {}) {
  const plans = Array.isArray(questionnaire.plans) ? questionnaire.plans : [];
  if (questionnaire.current_plan_id) {
    const byId = plans.find((item) => item.plan_id === questionnaire.current_plan_id);
    if (byId) return byId;
  }
  return plans.length ? plans[plans.length - 1] : null;
}

function buildPacketTraceabilityState(contextBriefs = {}, questionnaireAnswers = {}, taskSynthesis = null, blueprints = {}, dataDesign = {}, delivery = {}, currentQuestionnairePlan = null) {
  const latestBrief = Array.isArray(contextBriefs.briefs) && contextBriefs.briefs.length ? contextBriefs.briefs[contextBriefs.briefs.length - 1] : null;
  const latestAnswers = Array.isArray(questionnaireAnswers.answers) && questionnaireAnswers.answers.length ? questionnaireAnswers.answers : [];
  const currentBlueprint = blueprints && blueprints.current_blueprint ? blueprints.current_blueprint : null;
  const currentDataContext = dataDesign && dataDesign.current_context ? dataDesign.current_context : null;
  const currentDelivery = resolveModeValue(delivery && delivery.current_mode ? delivery.current_mode : null);
  const requiredChain = [
    "vibe_brief",
    "questionnaire_answers",
    "module_plan",
    "delivery_map",
    "blueprint",
    "data_context",
    "delivery_mode"
  ];
  const chain = [
    latestBrief ? "vibe_brief" : null,
    latestAnswers.length > 0 ? "questionnaire_answers" : null,
    currentQuestionnairePlan && currentQuestionnairePlan.module_plan ? "module_plan" : null,
    currentQuestionnairePlan && currentQuestionnairePlan.delivery_map ? "delivery_map" : null,
    taskSynthesis ? "task_synthesis" : null,
    taskSynthesis && Array.isArray(taskSynthesis.task_blueprints) && taskSynthesis.task_blueprints.length > 0 ? "task_blueprints" : null,
    currentBlueprint ? "blueprint" : null,
    currentDataContext ? "data_context" : null,
    currentDelivery ? "delivery_mode" : null
  ].filter(Boolean);
  const missingSteps = requiredChain.filter((step) => !chain.includes(step));
  return {
    complete: chain.length > 0 && missingSteps.length === 0,
    chain,
    required_chain: requiredChain,
    missing_steps: missingSteps,
    brief_id: latestBrief ? latestBrief.brief_id || null : null,
    questionnaire_plan_id: currentQuestionnairePlan ? currentQuestionnairePlan.plan_id || null : null,
    module_plan_id: currentQuestionnairePlan && currentQuestionnairePlan.module_plan ? currentQuestionnairePlan.module_plan.module_plan_id || null : null,
    delivery_map_id: currentQuestionnairePlan && currentQuestionnairePlan.delivery_map ? currentQuestionnairePlan.delivery_map.delivery_map_id || null : null,
    task_synthesis_id: taskSynthesis ? taskSynthesis.synthesis_id || null : null,
    blueprint_key: currentBlueprint ? currentBlueprint.blueprint_key || currentBlueprint.key || null : null,
    data_context_id: currentDataContext ? currentDataContext.context_id || null : null,
    delivery_mode: currentDelivery ? normalizeMode(currentDelivery) : null
  };
}

function normalizeMode(mode) {
  const normalized = String(mode || "").trim().toLowerCase();
  if (["agile", "scrum"].includes(normalized)) return "agile";
  if (["structured", "waterfall"].includes(normalized)) return "structured";
  return normalized || null;
}

function resolveModeValue(value) {
  if (!value || typeof value !== "object") return value;
  return value.mode || value.active_mode || value.delivery_mode || value.title || value.name || null;
}

function table(headers, rows) {
  if (typeof headers === "function") return headers;
  const safeRows = Array.isArray(rows) ? rows : [];
  const widths = headers.map((header, index) => Math.max(String(header).length, ...safeRows.map((row) => String(row[index] || "").length)));
  const renderRow = (row) => `| ${row.map((cell, index) => String(cell || "").padEnd(widths[index], " ")).join(" | ")} |`;
  const separator = `| ${widths.map((width) => "-".repeat(width)).join(" | ")} |`;
  return [renderRow(headers), separator, ...safeRows.map(renderRow)].join("\n");
}

module.exports = {
  PIPELINE_MATRIX_DOC_PATH,
  PIPELINE_REPORT_PATH,
  assertStrictPipeline,
  buildPipelineEnforcementMatrix,
  buildPipelineState,
  findCurrentQuestionnairePlan,
  normalizeMode,
  renderPipelineEnforcementMatrix
};
