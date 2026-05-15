function compileTaskControlPlanePacket(options = {}, deps = {}) {
  const {
    readJsonFile = () => ({}),
    writeJsonFile = () => {},
    writeTextFile = () => {},
    readJsonLines = () => [],
    fileExists = () => false,
    appendAudit = () => {},
    refreshDashboardArtifacts = () => {},
    buildTaskLifecycleState = (task) => ({ current_stage: String(task && task.status ? task.status : "intake"), next_action: "review packet" })
  } = deps;

  const now = () => new Date().toISOString();
  const packetId = `task-packet-${Date.now()}`;
  const packetJsonFile = "docs/reports/KVDF_TASK_CONTROL_PLANE_PACKET.json";
  const packetMdFile = "docs/reports/KVDF_TASK_CONTROL_PLANE_PACKET.md";
  const tasksFile = ".kabeeri/tasks.json";
  const evolutionFile = ".kabeeri/evolution.json";
  const questionnairesFile = ".kabeeri/questionnaires/answers.json";
  const questionnairePlanFile = ".kabeeri/questionnaires/adaptive_intake_plan.json";
  const briefFile = ".kabeeri/interactions/context_briefs.json";
  const suggestedTasksFile = ".kabeeri/interactions/suggested_tasks.json";
  const taskSynthesisFile = ".kabeeri/reports/questionnaire_task_synthesis.json";
  const blueprintsFile = ".kabeeri/product_blueprints.json";
  const dataDesignFile = ".kabeeri/data_design.json";
  const deliveryFile = ".kabeeri/delivery_decisions.json";
  const trackerFile = ".kabeeri/dashboard/task_tracker_state.json";
  const multiAiFile = ".kabeeri/multi_ai_governance.json";
  const assumptionsFile = ".kabeeri/memory/assumptions.jsonl";

  const evolutionState = fileExists(evolutionFile) ? readJsonFile(evolutionFile) : { current_change_id: null, changes: [] };
  const tasksState = fileExists(tasksFile) ? readJsonFile(tasksFile) : { tasks: [] };
  const questionnaires = fileExists(questionnairesFile) ? readJsonFile(questionnairesFile) : { answers: [] };
  const questionnairePlanState = fileExists(questionnairePlanFile) ? readJsonFile(questionnairePlanFile) : { plans: [], current_plan_id: null };
  const contextBriefs = fileExists(briefFile) ? readJsonFile(briefFile) : { briefs: [] };
  const suggestedTasks = fileExists(suggestedTasksFile) ? readJsonFile(suggestedTasksFile) : { suggested_tasks: [] };
  const blueprints = fileExists(blueprintsFile) ? readJsonFile(blueprintsFile) : { selected_blueprints: [], recommendations: [], current_blueprint: null };
  const dataDesign = fileExists(dataDesignFile) ? readJsonFile(dataDesignFile) : { contexts: [], reviews: [], current_context: null };
  const delivery = fileExists(deliveryFile) ? readJsonFile(deliveryFile) : { recommendations: [], decisions: [], current_mode: null };
  const trackerState = fileExists(trackerFile) ? readJsonFile(trackerFile) : null;
  const multiAi = fileExists(multiAiFile) ? readJsonFile(multiAiFile) : { leader_sessions: [], active_leader_session_id: null };
  const answers = Array.isArray(questionnaires.answers) ? questionnaires.answers : [];
  const briefs = Array.isArray(contextBriefs.briefs) ? contextBriefs.briefs : [];
  const suggestions = Array.isArray(suggestedTasks.suggested_tasks) ? suggestedTasks.suggested_tasks : [];
  const taskSynthesis = fileExists(taskSynthesisFile) ? readJsonFile(taskSynthesisFile) : null;
  const selectedBlueprints = Array.isArray(blueprints.selected_blueprints) ? blueprints.selected_blueprints : [];
  const dataContexts = Array.isArray(dataDesign.contexts) ? dataDesign.contexts : [];
  const decisions = Array.isArray(delivery.decisions) ? delivery.decisions : [];
  const tasks = Array.isArray(tasksState.tasks) ? tasksState.tasks : [];
  const currentChangeId = options.evolutionChangeId || evolutionState.current_change_id || null;
  const orderMap = buildEvolutionTaskOrder(evolutionState, currentChangeId);
  const candidateStatuses = parseStatusList(options.statuses, ["approved", "ready"]);
  const executionCandidates = tasks
    .filter((task) => candidateStatuses.has(String(task.status || "").toLowerCase()))
    .sort((left, right) => compareTaskOrder(left, right, orderMap))
    .map((task) => buildPacketTask(task, buildTaskLifecycleState(task)));
  const taskSummary = buildTaskSummary(tasks, trackerState);
  const latestBrief = briefs.length ? briefs[briefs.length - 1] : null;
  const latestIntent = latestBrief && latestBrief.latest_intent ? summarizeIntent(latestBrief.latest_intent) : null;
  const latestAnswers = summarizeAnswers(answers);
  const currentQuestionnairePlan = findCurrentQuestionnairePlan(questionnairePlanState);
  const latestBlueprint = pickCurrentBlueprint(blueprints);
  const latestDataContext = pickCurrentDataContext(dataDesign);
  const latestDelivery = pickCurrentDelivery(delivery);
  const assumptions = collectPacketAssumptions(readJsonLines, assumptionsFile, latestIntent, latestBlueprint, latestDataContext, latestDelivery, taskSummary);
  const recommendedAssigneeId = resolvePacketAssignee(multiAi);
  const nextAction = buildNextAction(executionCandidates, recommendedAssigneeId);
  const traceability = buildPacketTraceability(latestBrief, latestAnswers, taskSynthesis, latestBlueprint, latestDataContext, latestDelivery, currentQuestionnairePlan, executionCandidates);
  if (!traceability.complete) {
    const missing = Array.isArray(traceability.missing_steps) && traceability.missing_steps.length ? traceability.missing_steps.join(", ") : "unknown";
    throw new Error(`Task packet blocked: incomplete traceability chain (${missing}).`);
  }
  const expectedOutputs = [
    "One durable packet artifact exists for every execution-ready request.",
    "The packet records the source state, assumptions, expected outputs, and the next exact action.",
    "The packet can be inspected later without replaying chat history.",
    "The packet stays in the CLI/control-plane layer and does not plan work inside the executor."
  ];

  const packet = {
    report_type: "task_control_plane_packet",
    generated_at: now(),
    audience: "framework_owner",
    command_prefix: "kvdf task",
    surface_role: "control_plane",
    packet_id: packetId,
    packet_state_path: packetJsonFile,
    packet_preview_command: "kvdf task packet --json",
    current_change_id: currentChangeId,
    control_plane_mode: "packet_preview",
    statuses_requested: Array.from(candidateStatuses),
    recommended_assignee_id: recommendedAssigneeId,
    source_snapshot: {
      vibe_intent: latestIntent,
      questionnaire: latestAnswers,
      brief: summarizeBrief(latestBrief),
      task_synthesis: summarizeTaskSynthesis(taskSynthesis),
      blueprints: summarizeBluePrintState(blueprints, latestBlueprint),
      data_design: summarizeDataDesignState(dataDesign, latestDataContext),
      delivery: summarizeDeliveryState(delivery, latestDelivery),
      traceability,
      execution_candidates: executionCandidates,
      proposed_tasks: suggestions.slice(0, 12).map(summarizeSuggestedTask),
      task_tracker: taskSummary,
      current_active_tasks: taskSummary.active_tasks.slice(0, 12)
    },
    assumptions,
    expected_outputs: expectedOutputs,
    next_action: nextAction,
    next_command: nextAction,
    execution_queue: executionCandidates,
    summary: {
      total_tasks: taskSummary.total_tasks,
      approved_total: taskSummary.approved_total,
      ready_total: taskSummary.ready_total,
      in_progress_total: taskSummary.in_progress_total,
      proposed_total: taskSummary.proposed_total,
      candidate_total: executionCandidates.length,
      first_candidate_id: executionCandidates[0] ? executionCandidates[0].id : null,
      first_candidate_status: executionCandidates[0] ? executionCandidates[0].status : null
    },
    status: executionCandidates.length > 0 ? "ready" : "empty",
    message: executionCandidates.length > 0
      ? `Compiled a deterministic control-plane packet for ${executionCandidates.length} execution candidate(s).`
      : "No approved or ready tasks were available for packet compilation."
  };

  writeJsonFile(packetJsonFile, packet);
  writeTextFile(packetMdFile, renderTaskControlPlanePacket(packet));
  if (appendAudit) {
    appendAudit("task.control_plane_packet_compiled", "task", packet.packet_id, "Control-plane packet compiled for execution-ready tasks", {
      packet_id: packet.packet_id,
      current_change_id: packet.current_change_id,
      candidate_total: packet.summary.candidate_total
    });
  }
  if (refreshDashboardArtifacts) refreshDashboardArtifacts();
  return packet;
}

function renderTaskControlPlanePacket(packet) {
  const lines = [
    "# Task Control Plane Packet",
    "",
    `Packet ID: ${packet.packet_id || "n/a"}`,
    `Generated at: ${packet.generated_at || "n/a"}`,
    `Surface role: ${packet.surface_role || "control_plane"}`,
    `Current change: ${packet.current_change_id || "none"}`,
    `Status: ${packet.status || "unknown"}`,
    `Message: ${packet.message || ""}`,
    `Packet state path: ${packet.packet_state_path || "n/a"}`,
    `Recommended assignee: ${packet.recommended_assignee_id || "none"}`,
    "",
    "Summary:",
    `- Total tasks: ${packet.summary ? packet.summary.total_tasks : 0}`,
    `- Approved tasks: ${packet.summary ? packet.summary.approved_total : 0}`,
    `- Ready tasks: ${packet.summary ? packet.summary.ready_total : 0}`,
    `- In progress tasks: ${packet.summary ? packet.summary.in_progress_total : 0}`,
    `- Proposed tasks: ${packet.summary ? packet.summary.proposed_total : 0}`,
    `- Execution candidates: ${packet.summary ? packet.summary.candidate_total : 0}`,
    `- First candidate: ${packet.summary && packet.summary.first_candidate_id ? packet.summary.first_candidate_id : "none"}`,
    "",
    "Source snapshot:",
    `- Vibe intent: ${describeIntent(packet.source_snapshot && packet.source_snapshot.vibe_intent)}`,
    `- Questionnaire answers: ${describeQuestionnaire(packet.source_snapshot && packet.source_snapshot.questionnaire)}`,
    `- Brief: ${describeBrief(packet.source_snapshot && packet.source_snapshot.brief)}`,
    `- Task synthesis: ${describeTaskSynthesis(packet.source_snapshot && packet.source_snapshot.task_synthesis)}`,
    `- Blueprints: ${describeBlueprint(packet.source_snapshot && packet.source_snapshot.blueprints)}`,
    `- Data design: ${describeDataDesign(packet.source_snapshot && packet.source_snapshot.data_design)}`,
    `- Delivery: ${describeDelivery(packet.source_snapshot && packet.source_snapshot.delivery)}`,
    `- Traceability: ${describeTraceability(packet.source_snapshot && packet.source_snapshot.traceability)}`,
    "",
    "Assumptions:",
    ...(Array.isArray(packet.assumptions) && packet.assumptions.length ? packet.assumptions.map((item) => `- ${item}`) : ["- None recorded."]),
    "",
    "Expected outputs:",
    ...(Array.isArray(packet.expected_outputs) && packet.expected_outputs.length ? packet.expected_outputs.map((item) => `- ${item}`) : ["- None recorded."]),
    "",
    "Next action:",
    `- ${packet.next_action || "none"}`
  ];
  return `${lines.join("\n")}\n`;
}

function buildTaskSummary(tasks = [], trackerState = null) {
  const approved = tasks.filter((task) => String(task.status || "").toLowerCase() === "approved");
  const ready = tasks.filter((task) => String(task.status || "").toLowerCase() === "ready");
  const inProgress = tasks.filter((task) => String(task.status || "").toLowerCase() === "in_progress");
  const proposed = tasks.filter((task) => String(task.status || "").toLowerCase() === "proposed");
  const activeTasks = tasks.filter((task) => ["approved", "ready", "in_progress", "owner_verified", "assigned"].includes(String(task.status || "").toLowerCase()));
  return {
    total_tasks: tasks.length,
    approved_total: approved.length + ready.length,
    ready_total: approved.length + ready.length,
    in_progress_total: inProgress.length,
    proposed_total: proposed.length,
    active_tasks: activeTasks
      .sort((left, right) => String(left.created_at || left.updated_at || "").localeCompare(String(right.created_at || right.updated_at || "")))
      .map((task) => ({
        id: task.id,
        title: task.title || "",
        status: task.status || "",
        assignee_id: task.assignee_id || "",
        lifecycle_stage: buildStage(task),
        next_action: String(task.next_action || ""),
        updated_at: task.updated_at || null
      })),
    tracker_open: trackerState && trackerState.summary ? trackerState.summary.open || 0 : null,
    tracker_blocked: trackerState && trackerState.summary ? trackerState.summary.blocked || 0 : null
  };
}

function buildPacketTask(task, lifecycle) {
  return {
    id: task.id,
    title: task.title || "",
    status: task.status || "",
    assignee_id: task.assignee_id || "",
    allowed_files: Array.isArray(task.allowed_files) ? task.allowed_files.slice() : [],
    dependencies: Array.isArray(task.dependencies) ? task.dependencies.slice() : [],
    order_hint: task.order_hint || null,
    acceptance_criteria_count: Array.isArray(task.acceptance_criteria) ? task.acceptance_criteria.length : 0,
    lifecycle_stage: lifecycle.current_stage || buildStage(task),
    next_action: lifecycle.next_action || task.next_action || "",
    created_at: task.created_at || null,
    updated_at: task.updated_at || null
  };
}

function buildStage(task) {
  return String(task && task.status ? task.status : "intake");
}

function summarizeIntent(intent) {
  if (!intent) return null;
  return {
    intent_id: intent.intent_id || null,
    language: intent.language || null,
    text: intent.text || "",
    intent_type: intent.intent_type || null,
    confidence: intent.confidence || null,
    risk_level: intent.risk_level || null,
    missing_details: Array.isArray(intent.missing_details) ? intent.missing_details : [],
    suggested_next_action: intent.suggested_next_action || null
  };
}

function summarizeAnswers(answers = []) {
  return {
    total_answers: answers.length,
    confirmed_answers: answers.filter((item) => String(item.confidence || "").toLowerCase() === "confirmed").length,
    latest_answers: answers.slice(-10).map((item) => ({
      answer_id: item.answer_id || null,
      question_id: item.question_id || null,
      value: item.value || null,
      area_ids: Array.isArray(item.area_ids) ? item.area_ids : [],
      answered_at: item.answered_at || null,
      confidence: item.confidence || null
    }))
  };
}

function summarizeBrief(brief) {
  if (!brief) return { brief_id: null, latest_intent_id: null, open_suggestions_total: 0, open_tasks_total: 0 };
  return {
    brief_id: brief.brief_id || null,
    current_vibe_session: brief.current_vibe_session || null,
    latest_intent_id: brief.latest_intent ? brief.latest_intent.intent_id || null : null,
    open_suggestions_total: Array.isArray(brief.open_suggestions) ? brief.open_suggestions.length : 0,
    open_tasks_total: Array.isArray(brief.open_tasks) ? brief.open_tasks.length : 0,
    recent_captures_total: Array.isArray(brief.recent_captures) ? brief.recent_captures.length : 0
  };
}

function summarizeTaskSynthesis(synthesis) {
  if (!synthesis) return null;
  return {
    synthesis_id: synthesis.synthesis_id || null,
    questionnaire_plan_id: synthesis.questionnaire_plan_id || null,
    module_plan_id: synthesis.module_plan_id || null,
    delivery_map_id: synthesis.delivery_map_id || null,
    delivery_mode: synthesis.delivery_mode || null,
    task_generation_mode: synthesis.task_generation_mode || null,
    task_count: Number.isFinite(synthesis.task_count) ? synthesis.task_count : 0,
    task_blueprints_total: Array.isArray(synthesis.task_blueprints) ? synthesis.task_blueprints.length : 0,
    has_dependencies: Boolean(synthesis.dependencies && Object.keys(synthesis.dependencies).length),
    has_allowed_files: Boolean(synthesis.allowed_files && Object.keys(synthesis.allowed_files).length)
  };
}

function findCurrentQuestionnairePlan(questionnaire = {}) {
  const plans = Array.isArray(questionnaire.plans) ? questionnaire.plans : [];
  if (questionnaire.current_plan_id) {
    const byId = plans.find((item) => item.plan_id === questionnaire.current_plan_id);
    if (byId) return byId;
  }
  return plans.length ? plans[plans.length - 1] : null;
}

function buildPacketTraceability(latestBrief, latestAnswers, taskSynthesis, latestBlueprint, latestDataContext, latestDelivery, currentQuestionnairePlan = null, executionCandidates = []) {
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
    latestAnswers && latestAnswers.total_answers > 0 ? "questionnaire_answers" : null,
    (taskSynthesis || (currentQuestionnairePlan && currentQuestionnairePlan.module_plan)) ? "module_plan" : null,
    (taskSynthesis || (currentQuestionnairePlan && currentQuestionnairePlan.delivery_map)) ? "delivery_map" : null,
    taskSynthesis ? "task_synthesis" : null,
    taskSynthesis && Array.isArray(taskSynthesis.task_blueprints) && taskSynthesis.task_blueprints.length > 0 ? "task_blueprints" : null,
    latestBlueprint ? "blueprint" : null,
    latestDataContext ? "data_context" : null,
    latestDelivery ? "delivery_mode" : null,
    Array.isArray(executionCandidates) && executionCandidates.length > 0 ? "execution_candidates" : null
  ].filter(Boolean);
  const missingSteps = requiredChain.filter((step) => !chain.includes(step));
  return {
    brief_id: latestBrief ? latestBrief.brief_id || null : null,
    questionnaire_plan_id: taskSynthesis ? taskSynthesis.questionnaire_plan_id || null : currentQuestionnairePlan ? currentQuestionnairePlan.plan_id || null : null,
    module_plan_id: taskSynthesis ? taskSynthesis.module_plan_id || null : currentQuestionnairePlan && currentQuestionnairePlan.module_plan ? currentQuestionnairePlan.module_plan.module_plan_id || null : null,
    delivery_map_id: taskSynthesis ? taskSynthesis.delivery_map_id || null : currentQuestionnairePlan && currentQuestionnairePlan.delivery_map ? currentQuestionnairePlan.delivery_map.delivery_map_id || null : null,
    task_synthesis_id: taskSynthesis ? taskSynthesis.synthesis_id || null : null,
    chain,
    required_chain: requiredChain,
    missing_steps: missingSteps,
    complete: chain.length > 0 && missingSteps.length === 0,
    readable_summary: buildTraceabilitySummary(latestBrief, taskSynthesis, latestBlueprint, latestDataContext, latestDelivery)
  };
}

function buildTraceabilitySummary(latestBrief, taskSynthesis, latestBlueprint, latestDataContext, latestDelivery) {
  const parts = [];
  if (latestBrief) parts.push(`brief:${latestBrief.brief_id || "latest"}`);
  if (taskSynthesis) parts.push(`modules:${taskSynthesis.module_plan_id || "latest"}`);
  if (taskSynthesis) parts.push(`delivery:${taskSynthesis.delivery_map_id || "latest"}`);
  if (latestBlueprint) parts.push(`blueprint:${latestBlueprint.blueprint_key || latestBlueprint.key || "current"}`);
  if (latestDataContext) parts.push(`data:${latestDataContext.context_id || "current"}`);
  if (latestDelivery) parts.push(`mode:${latestDelivery.mode || latestDelivery.active_mode || latestDelivery.title || "current"}`);
  return parts.join(" -> ") || "n/a";
}

function summarizeSuggestedTask(task) {
  return {
    suggestion_id: task.suggestion_id || null,
    title: task.title || "",
    workstream: task.workstream || "",
    task_type: task.task_type || "",
    status: task.status || "",
    risk_level: task.risk_level || null,
    approval_required: Boolean(task.approval_required),
    dependencies: Array.isArray(task.dependencies) ? task.dependencies.slice() : [],
    allowed_files: Array.isArray(task.allowed_files) ? task.allowed_files.slice() : [],
    order_hint: task.order_hint || null
  };
}

function describeTaskSynthesis(synthesis) {
  if (!synthesis) return "none";
  const parts = [];
  if (synthesis.synthesis_id) parts.push(synthesis.synthesis_id);
  if (synthesis.task_generation_mode) parts.push(synthesis.task_generation_mode);
  if (Number.isFinite(synthesis.task_count)) parts.push(`${synthesis.task_count} tasks`);
  if (synthesis.module_plan_id) parts.push(`module:${synthesis.module_plan_id}`);
  if (synthesis.delivery_map_id) parts.push(`delivery:${synthesis.delivery_map_id}`);
  return parts.join(" | ");
}

function describeTraceability(traceability) {
  if (!traceability) return "none";
  const parts = [];
  if (traceability.brief_id) parts.push(`brief:${traceability.brief_id}`);
  if (traceability.questionnaire_plan_id) parts.push(`questionnaire:${traceability.questionnaire_plan_id}`);
  if (traceability.module_plan_id) parts.push(`modules:${traceability.module_plan_id}`);
  if (traceability.delivery_map_id) parts.push(`delivery:${traceability.delivery_map_id}`);
  if (traceability.task_synthesis_id) parts.push(`tasks:${traceability.task_synthesis_id}`);
  if (traceability.complete === true) parts.push("complete");
  else if (Array.isArray(traceability.missing_steps) && traceability.missing_steps.length) parts.push(`missing:${traceability.missing_steps.join(",")}`);
  return parts.join(" -> ") || "n/a";
}

function pickCurrentBlueprint(blueprints) {
  if (!blueprints) return null;
  if (blueprints.current_blueprint) return blueprints.current_blueprint;
  if (Array.isArray(blueprints.selected_blueprints) && blueprints.selected_blueprints.length) return blueprints.selected_blueprints[blueprints.selected_blueprints.length - 1];
  if (Array.isArray(blueprints.recommendations) && blueprints.recommendations.length) return blueprints.recommendations[0];
  return null;
}

function summarizeBluePrintState(blueprints, currentBlueprint) {
  return {
    selected_blueprints_total: Array.isArray(blueprints.selected_blueprints) ? blueprints.selected_blueprints.length : 0,
    recommendations_total: Array.isArray(blueprints.recommendations) ? blueprints.recommendations.length : 0,
    current_blueprint: currentBlueprint ? {
      blueprint_key: currentBlueprint.blueprint_key || currentBlueprint.key || null,
      blueprint_name: currentBlueprint.blueprint_name || currentBlueprint.name || null,
      backend_modules: Array.isArray(currentBlueprint.backend_modules) ? currentBlueprint.backend_modules.slice() : [],
      frontend_pages: Array.isArray(currentBlueprint.frontend_pages) ? currentBlueprint.frontend_pages.slice() : [],
      database_entities: Array.isArray(currentBlueprint.database_entities) ? currentBlueprint.database_entities.slice() : []
    } : null
  };
}

function pickCurrentDataContext(dataDesign) {
  if (!dataDesign) return null;
  if (dataDesign.current_context) return dataDesign.current_context;
  if (Array.isArray(dataDesign.contexts) && dataDesign.contexts.length) return dataDesign.contexts[dataDesign.contexts.length - 1];
  if (Array.isArray(dataDesign.reviews) && dataDesign.reviews.length) return dataDesign.reviews[dataDesign.reviews.length - 1];
  return null;
}

function summarizeDataDesignState(dataDesign, currentContext) {
  return {
    current_context_id: currentContext ? currentContext.context_id || null : null,
    modules_total: currentContext && Array.isArray(currentContext.modules) ? currentContext.modules.length : 0,
    entities_total: currentContext && Array.isArray(currentContext.entities) ? currentContext.entities.length : 0,
    modules: currentContext && Array.isArray(currentContext.modules) ? currentContext.modules.slice() : [],
    entities: currentContext && Array.isArray(currentContext.entities) ? currentContext.entities.slice(0, 12) : []
  };
}

function pickCurrentDelivery(delivery) {
  if (!delivery) return null;
  if (delivery.current_mode) return delivery.current_mode;
  if (Array.isArray(delivery.decisions) && delivery.decisions.length) return delivery.decisions[delivery.decisions.length - 1];
  if (Array.isArray(delivery.recommendations) && delivery.recommendations.length) return delivery.recommendations[delivery.recommendations.length - 1];
  return null;
}

function summarizeDeliveryState(delivery, currentDelivery) {
  return {
    current_mode: delivery && delivery.current_mode ? delivery.current_mode : null,
    decisions_total: Array.isArray(delivery.decisions) ? delivery.decisions.length : 0,
    recommendations_total: Array.isArray(delivery.recommendations) ? delivery.recommendations.length : 0,
    current_delivery: currentDelivery && typeof currentDelivery === "object"
      ? {
        delivery_id: currentDelivery.delivery_id || currentDelivery.id || null,
        mode: currentDelivery.mode || currentDelivery.delivery_mode || null,
        title: currentDelivery.title || currentDelivery.name || null,
        status: currentDelivery.status || null
      }
      : currentDelivery || null
  };
}

function collectPacketAssumptions(readJsonLines, assumptionsFile, latestIntent, latestBlueprint, latestDataContext, latestDelivery, taskSummary) {
  const assumptions = [];
  if (typeof readJsonLines === "function") {
    const records = readJsonLines(assumptionsFile) || [];
    for (const record of records.slice(-10)) {
      if (record && typeof record === "object") {
        const text = record.text || record.assumption || record.value;
        if (text) assumptions.push(String(text));
      } else if (record) {
        assumptions.push(String(record));
      }
    }
  }
  if (!assumptions.length) {
    assumptions.push("The CLI owns planning and packet compilation.");
    assumptions.push("The AI executor should consume the packet instead of inventing the work plan.");
    assumptions.push("Approved or ready tasks are the execution candidates for the packet.");
    if (latestIntent && latestIntent.text) assumptions.push(`Latest vibe intent is: ${latestIntent.text}.`);
    if (latestBlueprint && (latestBlueprint.blueprint_name || latestBlueprint.blueprint_key)) assumptions.push(`Current blueprint is ${latestBlueprint.blueprint_name || latestBlueprint.blueprint_key}.`);
    if (latestDataContext && latestDataContext.context_id) assumptions.push(`Current data context is ${latestDataContext.context_id}.`);
    if (latestDelivery && typeof latestDelivery === "object" && (latestDelivery.mode || latestDelivery.title)) assumptions.push(`Current delivery decision is ${latestDelivery.mode || latestDelivery.title}.`);
    assumptions.push(`There are ${taskSummary.ready_total} execution-ready task(s) in the tracker.`);
  }
  return assumptions.slice(0, 12);
}

function resolvePacketAssignee(multiAi) {
  if (multiAi && Array.isArray(multiAi.leader_sessions)) {
    const activeSessionId = multiAi.active_leader_session_id || null;
    const activeSession = multiAi.leader_sessions.find((session) => session.session_id === activeSessionId && String(session.status || "").toLowerCase() === "active")
      || multiAi.leader_sessions.find((session) => String(session.status || "").toLowerCase() === "active")
      || null;
    const leaderId = activeSession ? String(activeSession.leader_ai_id || "").trim() : "";
    if (leaderId) return leaderId;
  }
  return "codex";
}

function buildNextAction(executionCandidates = [], recommendedAssigneeId = "codex") {
  const candidate = executionCandidates[0] || null;
  if (!candidate) return "kvdf task tracker --json";
  if (!candidate.assignee_id) return `kvdf task assign ${candidate.id} --assignee ${recommendedAssigneeId || "<id>"}`;
  return `kvdf task start ${candidate.id} --actor ${candidate.assignee_id}`;
}

function buildEvolutionTaskOrder(evolutionState, currentChangeId = null) {
  const changes = Array.isArray(evolutionState && evolutionState.changes) ? evolutionState.changes : [];
  const activeChange = currentChangeId ? changes.find((change) => change.change_id === currentChangeId) : null;
  const taskIds = activeChange && Array.isArray(activeChange.task_ids) ? activeChange.task_ids : [];
  return taskIds.reduce((map, id, index) => {
    map[id] = index;
    return map;
  }, {});
}

function parseStatusList(input, fallback = ["approved", "ready"]) {
  const values = String(Array.isArray(input) ? input.join(",") : input || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const statuses = values.length ? values : fallback;
  return new Set(statuses.map((item) => item.replace(/-/g, "_")));
}

function compareTaskOrder(left, right, orderMap) {
  const leftOrder = Object.prototype.hasOwnProperty.call(orderMap, left.id) ? orderMap[left.id] : Number.MAX_SAFE_INTEGER;
  const rightOrder = Object.prototype.hasOwnProperty.call(orderMap, right.id) ? orderMap[right.id] : Number.MAX_SAFE_INTEGER;
  if (leftOrder !== rightOrder) return leftOrder - rightOrder;
  const leftCreated = left.created_at || "";
  const rightCreated = right.created_at || "";
  if (leftCreated && rightCreated && leftCreated !== rightCreated) return String(leftCreated).localeCompare(String(rightCreated));
  if (leftCreated && !rightCreated) return -1;
  if (!leftCreated && rightCreated) return 1;
  return String(left.id || "").localeCompare(String(right.id || ""));
}

function describeIntent(intent) {
  if (!intent) return "none";
  const parts = [];
  if (intent.intent_id) parts.push(intent.intent_id);
  if (intent.text) parts.push(intent.text);
  if (intent.intent_type) parts.push(`type=${intent.intent_type}`);
  if (intent.risk_level) parts.push(`risk=${intent.risk_level}`);
  return parts.join(" | ");
}

function describeQuestionnaire(questionnaire) {
  if (!questionnaire) return "none";
  return `${questionnaire.total_answers || 0} answer(s), ${questionnaire.confirmed_answers || 0} confirmed`;
}

function describeBrief(brief) {
  if (!brief) return "none";
  const parts = [];
  if (brief.brief_id) parts.push(brief.brief_id);
  if (brief.latest_intent_id) parts.push(`intent=${brief.latest_intent_id}`);
  parts.push(`suggestions=${brief.open_suggestions_total || 0}`);
  parts.push(`open_tasks=${brief.open_tasks_total || 0}`);
  return parts.join(" | ");
}

function describeBlueprint(blueprints) {
  if (!blueprints) return "none";
  const current = blueprints.current_blueprint || null;
  if (!current) return `${blueprints.selected_blueprints_total || 0} selected, ${blueprints.recommendations_total || 0} recommendations`;
  return `${current.blueprint_key || current.blueprint_name || "unknown"} | modules=${(current.backend_modules || []).length}/${(current.frontend_pages || []).length}/${(current.database_entities || []).length}`;
}

function describeDataDesign(dataDesign) {
  if (!dataDesign) return "none";
  const current = dataDesign.current_context || null;
  if (!current) return `${dataDesign.modules_total || 0} module(s), ${dataDesign.entities_total || 0} entity(s)`;
  return `${current.context_id || "context"} | modules=${(current.modules || []).length} | entities=${(current.entities || []).length}`;
}

function describeDelivery(delivery) {
  if (!delivery) return "none";
  const current = delivery.current_delivery || null;
  if (!current || typeof current !== "object") return `${delivery.current_mode || "none"} | ${delivery.decisions_total || 0} decision(s)`;
  return `${current.mode || current.title || "unknown"} | ${current.status || "selected"}`;
}

module.exports = {
  compileTaskControlPlanePacket,
  renderTaskControlPlanePacket
};
