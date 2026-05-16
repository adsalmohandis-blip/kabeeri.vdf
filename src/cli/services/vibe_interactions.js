const fs = require("fs");
const path = require("path");
const { fileExists, repoRoot, readJsonFile, writeJsonFile } = require("../fs_utils");
const { table } = require("../ui");
const { uniqueList } = require("./collections");
const { appendJsonLine, readJsonLines } = require("./jsonl");
const { readStateArray } = require("./state_utils");

function ensureInteractionsState() {
  const dir = path.join(repoRoot(), ".kabeeri", "interactions");
  fs.mkdirSync(dir, { recursive: true });
  if (!fileExists(".kabeeri/interactions/suggested_tasks.json")) writeJsonFile(".kabeeri/interactions/suggested_tasks.json", { suggested_tasks: [] });
  if (!fileExists(".kabeeri/interactions/post_work_captures.json")) writeJsonFile(".kabeeri/interactions/post_work_captures.json", { captures: [] });
  if (!fileExists(".kabeeri/interactions/vibe_sessions.json")) writeJsonFile(".kabeeri/interactions/vibe_sessions.json", { sessions: [], current_session_id: null });
  if (!fileExists(".kabeeri/interactions/context_briefs.json")) writeJsonFile(".kabeeri/interactions/context_briefs.json", { briefs: [] });
  if (!fs.existsSync(path.join(dir, "user_intents.jsonl"))) fs.writeFileSync(path.join(dir, "user_intents.jsonl"), "", "utf8");
}

function vibeSession(action, flags = {}, rest = [], deps = {}) {
  const appendAudit = deps.appendAudit || (() => {});
  const file = ".kabeeri/interactions/vibe_sessions.json";
  const data = readJsonFile(file);
  data.sessions = data.sessions || [];
  const verb = String(action || "status").toLowerCase();
  if (verb === "start") {
    const id = flags.id || `vibe-session-${String(data.sessions.length + 1).padStart(3, "0")}`;
    const item = {
      session_id: id,
      title: flags.title || rest.join(" ") || "Vibe session",
      actor_id: flags.actor || "local-user",
      status: "active",
      intent_ids: [],
      suggestion_ids: [],
      capture_ids: [],
      started_at: new Date().toISOString()
    };
    data.sessions.push(item);
    data.current_session_id = id;
    writeJsonFile(file, data);
    appendAudit("vibe.session_started", "vibe_session", id, `Vibe session started`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  if (verb === "end") {
    const id = flags.id || data.current_session_id;
    if (!id) throw new Error("Missing vibe session id.");
    const item = data.sessions.find((sessionItem) => sessionItem.session_id === id);
    if (!item) throw new Error(`Vibe session not found: ${id}`);
    item.status = "completed";
    item.ended_at = new Date().toISOString();
    item.summary = flags.summary || item.summary || "";
    if (data.current_session_id === id) data.current_session_id = null;
    writeJsonFile(file, data);
    appendAudit("vibe.session_completed", "vibe_session", id, `Vibe session completed`);
    console.log(JSON.stringify(item, null, 2));
    return;
  }
  const current = data.sessions.find((item) => item.session_id === data.current_session_id) || null;
  console.log(JSON.stringify({ current_session_id: data.current_session_id || null, current, sessions_total: data.sessions.length }, null, 2));
}

function attachIntentToVibeSession(intent, flags = {}) {
  const file = ".kabeeri/interactions/vibe_sessions.json";
  const data = readJsonFile(file);
  const id = flags.session || data.current_session_id;
  if (!id) return;
  const item = (data.sessions || []).find((sessionItem) => sessionItem.session_id === id && sessionItem.status === "active");
  if (!item) return;
  item.intent_ids = uniqueList([...(item.intent_ids || []), intent.intent_id]);
  item.updated_at = new Date().toISOString();
  writeJsonFile(file, data);
}

function attachSuggestionsToVibeSession(suggestions, flags = {}) {
  const file = ".kabeeri/interactions/vibe_sessions.json";
  const data = readJsonFile(file);
  const id = flags.session || data.current_session_id;
  if (!id) return;
  const item = (data.sessions || []).find((sessionItem) => sessionItem.session_id === id && sessionItem.status === "active");
  if (!item) return;
  item.suggestion_ids = uniqueList([...(item.suggestion_ids || []), ...(suggestions || []).map((suggestion) => suggestion.suggestion_id)]);
  item.updated_at = new Date().toISOString();
  writeJsonFile(file, data);
}

function attachCaptureToVibeSession(capture, flags = {}) {
  const file = ".kabeeri/interactions/vibe_sessions.json";
  const data = readJsonFile(file);
  const id = flags.session || data.current_session_id;
  if (!id) return;
  const item = (data.sessions || []).find((sessionItem) => sessionItem.session_id === id && sessionItem.status === "active");
  if (!item) return;
  item.capture_ids = uniqueList([...(item.capture_ids || []), capture.capture_id]);
  item.updated_at = new Date().toISOString();
  writeJsonFile(file, data);
}

function readLatestQuestionnairePlan() {
  const file = ".kabeeri/questionnaires/adaptive_intake_plan.json";
  if (!fileExists(file)) return null;
  const data = readJsonFile(file);
  const plans = Array.isArray(data.plans) ? data.plans : [];
  if (!plans.length) return null;
  const currentPlan = data.current_plan_id ? plans.find((item) => item.plan_id === data.current_plan_id) : null;
  return currentPlan || plans[plans.length - 1] || null;
}

function readQuestionnaireAnswers() {
  if (!fileExists(".kabeeri/questionnaires/answers.json")) return [];
  const data = readJsonFile(".kabeeri/questionnaires/answers.json");
  return Array.isArray(data.answers) ? data.answers : [];
}

function buildQuestionnaireAnswerMap(answers) {
  return Object.fromEntries((answers || []).map((answer) => [answer.question_id, answer]));
}

function getPlanQuestions(plan) {
  return Array.isArray(plan && plan.generated_questions) ? plan.generated_questions : [];
}

function buildQuestionnaireSummary(plan, answers, answerMap) {
  const questions = getPlanQuestions(plan);
  const missingQuestions = questions.filter((question) => !answerMap[question.question_id]);
  const highPriorityPending = missingQuestions.filter((question) => question.priority === "high");
  const coverage = questions.length === 0 ? 0 : Math.round(((questions.length - missingQuestions.length) / questions.length) * 100);
  return {
    plan_id: plan ? plan.plan_id : null,
    total_questions: questions.length,
    answered_questions: questions.length - missingQuestions.length,
    missing_questions: missingQuestions.length,
    coverage_percent: coverage,
    high_priority_pending: highPriorityPending.length,
    answered_question_ids: questions.filter((question) => answerMap[question.question_id]).map((question) => question.question_id),
    missing_question_ids: missingQuestions.map((question) => question.question_id)
  };
}

function buildVibeBriefProductSection(plan, latestIntent, answerMap) {
  const blueprint = plan && plan.blueprint ? plan.blueprint : {};
  const productType = answerMap["adaptive.product.blueprint_confirmation"] ? answerMap["adaptive.product.blueprint_confirmation"].value : blueprint.key || "unknown";
  return {
    product_type: productType,
    summary: [
      blueprint.name ? `${blueprint.name} product scope.` : "Product scope compiled from vibe and questionnaire input.",
      plan && plan.description ? `Request: ${plan.description}.` : null,
      latestIntent && latestIntent.text ? `Latest intent: ${latestIntent.text}.` : null
    ].filter(Boolean).join(" "),
    blueprint: {
      key: blueprint.key || productType || null,
      name: blueprint.name || null,
      category: blueprint.category || null,
      recommended_delivery: blueprint.recommended_delivery || null
    },
    channels: blueprint.channels || [],
    backend_modules: blueprint.backend_modules || [],
    frontend_pages: blueprint.frontend_pages || [],
    database_entities: blueprint.database_entities || [],
    risk_flags: blueprint.risk_flags || []
  };
}

function buildVibeBriefUiUxSection(plan, answerMap) {
  const uiContext = plan && plan.ui_ux_context ? plan.ui_ux_context : {};
  const experiencePattern = answerMap["adaptive.ui.experience_pattern"] ? answerMap["adaptive.ui.experience_pattern"].value : uiContext.experience_pattern || null;
  return {
    summary: [
      experiencePattern ? `Experience pattern: ${experiencePattern}.` : "Experience pattern compiled from the questionnaire and reference catalog.",
      uiContext.recommended_stacks && uiContext.recommended_stacks.length ? `Recommended stacks: ${uiContext.recommended_stacks.join(", ")}.` : null,
      uiContext.layout_priorities && uiContext.layout_priorities.length ? `Layout priorities: ${uiContext.layout_priorities.join(", ")}.` : null
    ].filter(Boolean).join(" "),
    decisions: {
      experience_pattern: experiencePattern,
      design_source: answerMap["adaptive.ui.design_source"] ? answerMap["adaptive.ui.design_source"].value : null,
      public_admin_split: answerMap["adaptive.ui.public_admin_split"] ? answerMap["adaptive.ui.public_admin_split"].value : null,
      responsive_priority: answerMap["adaptive.ui.responsive_priority"] ? answerMap["adaptive.ui.responsive_priority"].value : null,
      accessibility_target: answerMap["adaptive.ui.accessibility_target"] ? answerMap["adaptive.ui.accessibility_target"].value : null
    },
    recommended_stacks: uiContext.recommended_stacks || [],
    component_groups: uiContext.component_groups || [],
    page_templates: uiContext.page_templates || [],
    layout_priorities: uiContext.layout_priorities || [],
    seo_geo: uiContext.seo_geo || []
  };
}

function buildVibeBriefSystemSection(plan, answerMap) {
  const dataContext = plan && plan.data_design_context ? plan.data_design_context : {};
  const delivery = plan && plan.delivery_mode_recommendation ? plan.delivery_mode_recommendation : {};
  const frameworks = plan && plan.framework_context ? plan.framework_context : {};
  return {
    summary: [
      delivery.recommended_mode ? `Delivery mode: ${delivery.recommended_mode}.` : "Delivery mode compiled from the questionnaire.",
      frameworks.selected_packs && frameworks.selected_packs.length ? `Selected framework packs: ${frameworks.selected_packs.join(", ")}.` : null,
      dataContext.modules && dataContext.modules.length ? `Core modules: ${dataContext.modules.join(", ")}.` : null
    ].filter(Boolean).join(" "),
    delivery_mode: delivery.recommended_mode || null,
    delivery_confidence: delivery.confidence || null,
    framework_packs: frameworks.selected_packs || [],
    detected_packs: frameworks.detected_packs || [],
    recommended_packs: frameworks.recommended_packs || [],
    modules: dataContext.modules || [],
    must_have: dataContext.must_have || [],
    risk_flags: uniqueList([...(plan && plan.blueprint && plan.blueprint.risk_flags ? plan.blueprint.risk_flags : []), ...(dataContext.risk_flags || [])]),
    framework_answers: {
      backend: answerMap["adaptive.framework.backend"] ? answerMap["adaptive.framework.backend"].value : null,
      frontend: answerMap["adaptive.framework.frontend"] ? answerMap["adaptive.framework.frontend"].value : null,
      mobile: answerMap["adaptive.framework.mobile"] ? answerMap["adaptive.framework.mobile"].value : null,
      database: answerMap["adaptive.database.engine"] ? answerMap["adaptive.database.engine"].value : null
    }
  };
}

function buildVibeBriefDataSection(plan, answerMap) {
  const dataContext = plan && plan.data_design_context ? plan.data_design_context : {};
  return {
    summary: [
      answerMap["adaptive.database.engine"] ? `Database engine: ${answerMap["adaptive.database.engine"].value}.` : null,
      dataContext.entities && dataContext.entities.length ? `Entities: ${dataContext.entities.length}.` : null,
      dataContext.must_have && dataContext.must_have.length ? `Critical constraints: ${dataContext.must_have.length}.` : null
    ].filter(Boolean).join(" "),
    database_engine: answerMap["adaptive.database.engine"] ? answerMap["adaptive.database.engine"].value : null,
    entities: dataContext.entities || [],
    must_have: dataContext.must_have || [],
    risk_flags: dataContext.risk_flags || []
  };
}

function buildVibeBriefNextStep(plan, missingQuestions) {
  const firstMissing = missingQuestions[0] || null;
  if (firstMissing) {
    const areas = Array.isArray(firstMissing.area_ids) ? firstMissing.area_ids.join(",") : "";
    return {
      command: `kvdf questionnaire answer ${firstMissing.question_id} --value "<answer>" --areas ${areas}`,
      reason: firstMissing.why || firstMissing.text || "Capture the next missing questionnaire answer.",
      reusable: true,
      mode: "capture_missing_answer"
    };
  }
  if (plan && plan.approval_status !== "approved") {
    if (plan.review_status !== "reviewed") {
      return {
        command: "kvdf questionnaire review",
        reason: "The planning pack is complete enough to review, but it still needs an explicit human review before approval.",
        reusable: true,
        mode: "review_planning_pack"
      };
    }
    return {
      command: "kvdf questionnaire approve --confirm",
      reason: "The planning pack has been reviewed and now needs explicit approval before task generation.",
      reusable: true,
      mode: "approve_planning_pack"
    };
  }
  const projectLabel = plan && plan.blueprint && plan.blueprint.name ? plan.blueprint.name : "the project";
  return {
    command: "kvdf questionnaire generate-tasks",
    reason: `The brief is complete enough to generate governed tasks for ${projectLabel}.`,
    reusable: true,
    mode: "generate_task_candidates"
  };
}

function vibeBrief(flags = {}, deps = {}) {
  const getTaskById = deps.getTaskById || (() => null);
  const intents = readJsonLines(".kabeeri/interactions/user_intents.jsonl");
  const suggestions = readStateArray(".kabeeri/interactions/suggested_tasks.json", "suggested_tasks");
  const captures = readStateArray(".kabeeri/interactions/post_work_captures.json", "captures");
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const sessions = fileExists(".kabeeri/interactions/vibe_sessions.json") ? readJsonFile(".kabeeri/interactions/vibe_sessions.json") : { current_session_id: null, sessions: [] };
  const questionnairePlan = readLatestQuestionnairePlan();
  const questionnaireAnswers = readQuestionnaireAnswers();
  const answerMap = buildQuestionnaireAnswerMap(questionnaireAnswers);
  const questionnaireSummary = buildQuestionnaireSummary(questionnairePlan, questionnaireAnswers, answerMap);
  const generatedQuestions = getPlanQuestions(questionnairePlan);
  const missingQuestions = generatedQuestions.filter((question) => !answerMap[question.question_id]);
  const openSuggestions = suggestions.filter((item) => ["suggested", "edited", "approved"].includes(item.status));
  const openTasks = tasks.filter((item) => !["owner_verified", "rejected", "done"].includes(item.status));
  const product = buildVibeBriefProductSection(questionnairePlan, intents[intents.length - 1] || null, answerMap);
  const uiUx = buildVibeBriefUiUxSection(questionnairePlan, answerMap);
  const system = buildVibeBriefSystemSection(questionnairePlan, answerMap);
  const data = buildVibeBriefDataSection(questionnairePlan, answerMap);
  const nextStep = buildVibeBriefNextStep(questionnairePlan, missingQuestions);
  const brief = {
    brief_id: `brief-${Date.now()}`,
    brief_version: "v2",
    generated_at: new Date().toISOString(),
    current_vibe_session: sessions.current_session_id || null,
    source_chain: {
      intent_id: intents[intents.length - 1] ? intents[intents.length - 1].intent_id : null,
      plan_id: questionnairePlan ? questionnairePlan.plan_id : null,
      question_count: questionnaireSummary.total_questions,
      answer_count: questionnaireAnswers.length
    },
    latest_intent: intents[intents.length - 1] || null,
    questionnaire_summary: questionnaireSummary,
    product,
    ui_ux: uiUx,
    system,
    data,
    next_step: nextStep,
    next_steps: [
      nextStep,
      {
        command: "kvdf vibe next",
        reason: "Review the next governed action in the session queue.",
        reusable: true,
        mode: "session_navigation"
      },
      {
        command: "kvdf task tracker",
        reason: "Inspect the current task queue before implementation.",
        reusable: true,
        mode: "task_navigation"
      }
    ],
    source_artifacts: {
      context_brief_file: ".kabeeri/interactions/context_briefs.json",
      questionnaire_plan_file: ".kabeeri/questionnaires/adaptive_intake_plan.json",
      questionnaire_answers_file: ".kabeeri/questionnaires/answers.json"
    },
    open_suggestions: openSuggestions.slice(-8).map((item) => ({
      id: item.suggestion_id,
      title: item.title,
      workstream: item.workstream,
      risk: item.risk_level,
      status: item.status
    })),
    open_tasks: openTasks.slice(-10).map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      workstream: item.workstream,
      assignee: item.assignee_id || null
    })),
    recent_captures: captures.slice(-5).map((item) => ({
      id: item.capture_id,
      summary: item.summary,
      files: item.files_changed || [],
      classification: item.classification
    })),
    token_saving_hint: "Use this compiled brief as the next-session context instead of rereading the whole repository or chat history."
  };
  const file = ".kabeeri/interactions/context_briefs.json";
  const briefStore = readJsonFile(file);
  briefStore.briefs = briefStore.briefs || [];
  briefStore.briefs.push(brief);
  writeJsonFile(file, briefStore);
  if (flags.json) console.log(JSON.stringify(brief, null, 2));
  else console.log(formatVibeBrief(brief));
  return brief;
}

function formatVibeBrief(brief) {
  const lines = [
    `Vibe brief: ${brief.brief_id}${brief.brief_version ? ` (${brief.brief_version})` : ""}`,
    `Current session: ${brief.current_vibe_session || "none"}`,
    brief.latest_intent ? `Latest intent: ${brief.latest_intent.text}` : "Latest intent: none",
    brief.questionnaire_summary ? `Questionnaire coverage: ${brief.questionnaire_summary.coverage_percent}% (${brief.questionnaire_summary.answered_questions}/${brief.questionnaire_summary.total_questions})` : null,
    "",
    "Product:",
    `- ${brief.product && brief.product.summary ? brief.product.summary : "none"}`,
    brief.product && brief.product.blueprint ? `- Blueprint: ${brief.product.blueprint.name || brief.product.blueprint.key || "unknown"}${brief.product.blueprint.recommended_delivery ? ` (${brief.product.blueprint.recommended_delivery})` : ""}` : null,
    brief.product && brief.product.channels && brief.product.channels.length ? `- Channels: ${brief.product.channels.join(", ")}` : null,
    brief.product && brief.product.backend_modules && brief.product.backend_modules.length ? `- Backend modules: ${brief.product.backend_modules.join(", ")}` : null,
    brief.product && brief.product.frontend_pages && brief.product.frontend_pages.length ? `- Frontend pages: ${brief.product.frontend_pages.join(", ")}` : null,
    "",
    "UI/UX:",
    `- ${brief.ui_ux && brief.ui_ux.summary ? brief.ui_ux.summary : "none"}`,
    brief.ui_ux && brief.ui_ux.decisions ? `- Experience: ${brief.ui_ux.decisions.experience_pattern || "unknown"} | Split: ${brief.ui_ux.decisions.public_admin_split || "unknown"} | Responsive: ${brief.ui_ux.decisions.responsive_priority || "unknown"}` : null,
    brief.ui_ux && brief.ui_ux.recommended_stacks && brief.ui_ux.recommended_stacks.length ? `- Stacks: ${brief.ui_ux.recommended_stacks.join(", ")}` : null,
    brief.ui_ux && brief.ui_ux.page_templates && brief.ui_ux.page_templates.length ? `- Page templates: ${brief.ui_ux.page_templates.join(", ")}` : null,
    "",
    "System:",
    `- ${brief.system && brief.system.summary ? brief.system.summary : "none"}`,
    brief.system && brief.system.framework_packs && brief.system.framework_packs.length ? `- Framework packs: ${brief.system.framework_packs.join(", ")}` : null,
    brief.system && brief.system.modules && brief.system.modules.length ? `- Modules: ${brief.system.modules.join(", ")}` : null,
    brief.system && brief.system.must_have && brief.system.must_have.length ? `- Must-have constraints: ${brief.system.must_have.join(", ")}` : null,
    "",
    "Data:",
    `- ${brief.data && brief.data.summary ? brief.data.summary : "none"}`,
    brief.data && brief.data.database_engine ? `- Database engine: ${brief.data.database_engine}` : null,
    brief.data && brief.data.entities && brief.data.entities.length ? `- Entities: ${brief.data.entities.slice(0, 12).join(", ")}${brief.data.entities.length > 12 ? ", ..." : ""}` : null,
    brief.data && brief.data.must_have && brief.data.must_have.length ? `- Critical data rules: ${brief.data.must_have.slice(0, 10).join(", ")}${brief.data.must_have.length > 10 ? ", ..." : ""}` : null,
    "",
    "Next step:",
    brief.next_step ? `- ${brief.next_step.command} :: ${brief.next_step.reason}` : "- none",
    brief.questionnaire_summary && brief.questionnaire_summary.missing_questions > 0 ? `- Missing questionnaire answers: ${brief.questionnaire_summary.missing_questions}` : "- Questionnaire answers complete enough for task generation",
    "",
    "Open suggestions:",
    ...(brief.open_suggestions.length ? brief.open_suggestions.map((item) => `- ${item.id}: ${item.title} [${item.workstream}/${item.status}]`) : ["- none"]),
    "",
    "Open tasks:",
    ...(brief.open_tasks.length ? brief.open_tasks.map((item) => `- ${item.id}: ${item.title} [${item.workstream}/${item.status}]`) : ["- none"]),
    "",
    "Recent captures:",
    ...(brief.recent_captures.length ? brief.recent_captures.map((item) => `- ${item.id}: ${item.summary}`) : ["- none"]),
    "",
    brief.token_saving_hint
  ].filter((item) => item !== null);
  return lines.join("\n");
}

function vibeNext(flags = {}, deps = {}) {
  const suggestions = readStateArray(".kabeeri/interactions/suggested_tasks.json", "suggested_tasks");
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const captures = readStateArray(".kabeeri/interactions/post_work_captures.json", "captures");
  const actions = [];
  const suggested = suggestions.find((item) => item.status === "suggested");
  if (suggested) actions.push({ action: "review_suggestion", command: `kvdf vibe show ${suggested.suggestion_id}`, reason: `Review ${suggested.title}` });
  const converted = suggestions.find((item) => item.status === "converted_to_task" && item.task_id && tasks.some((taskItem) => taskItem.id === item.task_id && taskItem.status === "proposed"));
  if (converted) actions.push({ action: "approve_or_refine_task", command: `kvdf task status ${converted.task_id}`, reason: "Converted Vibe task is still proposed." });
  const unassigned = tasks.find((item) => ["approved", "ready"].includes(item.status) && !item.assignee_id);
  if (unassigned) actions.push({ action: "assign_task", command: `kvdf task assign ${unassigned.id} --assignee <id>`, reason: "Approved task needs an assignee." });
  const uncaptured = captures.find((item) => item.classification === "needs_new_task" && item.status === "captured");
  if (uncaptured) actions.push({ action: "create_task_from_capture", command: `kvdf capture convert ${uncaptured.capture_id}`, reason: "Captured work has not been converted into governed work." });
  if (actions.length === 0) actions.push({ action: "create_or_capture_intent", command: `kvdf vibe "Describe the next change"`, reason: "No pending Vibe action found." });
  const result = { generated_at: new Date().toISOString(), actions: actions.slice(0, Number(flags.limit || 5)) };
  if (flags.json) console.log(JSON.stringify(result, null, 2));
  else console.log(table(["Action", "Command", "Reason"], result.actions.map((item) => [item.action, item.command, item.reason])));
  return result;
}

module.exports = {
  ensureInteractionsState,
  vibeSession,
  attachIntentToVibeSession,
  attachSuggestionsToVibeSession,
  attachCaptureToVibeSession,
  vibeBrief,
  vibeNext,
  formatVibeBrief,
  readStateArray,
  readJsonLines,
  appendJsonLine
};
