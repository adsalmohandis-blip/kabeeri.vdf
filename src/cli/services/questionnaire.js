const path = require("path");
const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { fileExists, repoRoot, resolveAsset, assertSafeName, readTextFile } = require("../fs_utils");
const { table } = require("../ui");
const { getSuggestedQuestionsForArea, mapAreaToWorkstream, getSystemAreas } = require("../commands/capability");
const { getPromptPackCatalog, recommendFrameworkPacksForBlueprint } = require("./prompt_pack");
const { buildPipelineState } = require("./pipeline_guard");
const { refreshAppScorecards } = require("./app_scorecards");

const UI_DECISION_AREA_KEYS = new Set([
  "ui_ux_design",
  "public_frontend",
  "admin_frontend",
  "internal_operations_frontend",
  "theme_branding",
  "dashboard_customization",
  "accessibility"
]);

function questionnaire(action, value, flags = {}, deps = {}) {
  const listFiles = deps.listFiles || (() => []);
  const files = listFiles("questionnaires", ".docx", true);

  if (!action || action === "list") {
    const rows = files.map((file) => [file]);
    console.log(table(["Questionnaire"], rows));
    return;
  }

  if (action === "status") {
    console.log(`${files.length} questionnaire files found.`);
    return;
  }

  if (action === "entry" || action === "answer") {
    return questionnaireAnswer(value, flags, deps);
  }

  if (action === "coverage" || action === "matrix") {
    ensureWorkspace();
    const matrix = buildCoverageMatrix(deps);
    writeQuestionnaireReports(matrix);
    console.log(JSON.stringify(matrix, null, 2));
    return;
  }

  if (action === "missing") {
    ensureWorkspace();
    const matrix = buildCoverageMatrix(deps);
    writeQuestionnaireReports(matrix);
    const report = buildMissingAnswersReport(matrix, deps);
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (action === "flow") {
    console.log(JSON.stringify(buildQuestionnaireFlow(), null, 2));
    return;
  }

  if (action === "review") {
    return questionnaireReviewPlan(flags, deps);
  }

  if (action === "approve") {
    return questionnaireApprovePlan(flags, deps);
  }

  if (action === "plan" || action === "intake-plan" || action === "recommend") {
    return questionnaireIntakePlan(value, flags, deps);
  }

  if (action === "generate-tasks" || action === "tasks") {
    return generateTasksFromCoverage(flags, deps);
  }

  if (action === "create" || action === "export") {
    const resolveQuestionnaireGroups = deps.resolveQuestionnaireGroups || defaultResolveQuestionnaireGroups;
    const copyQuestionnaireFiles = deps.copyQuestionnaireFiles || defaultCopyQuestionnaireFiles;
    const groups = resolveQuestionnaireGroups(flags.profile, flags.group || value);
    const output = flags.output || "questionnaires";
    const selected = files.filter((file) => groups.some((group) => file.startsWith(`questionnaires/${group}/`)));
    if (selected.length === 0) throw new Error(`No questionnaire files found for: ${groups.join(", ")}`);
    copyQuestionnaireFiles(selected, output, Boolean(flags.force));
    console.log(`Exported ${selected.length} questionnaire files to ${output}`);
    return;
  }

  throw new Error(`Unknown questionnaire action: ${action}`);
}

function questionnaireAnswer(questionId, flags = {}, deps = {}) {
  ensureWorkspace();
  const parseCsv = deps.parseCsv || defaultParseCsv;
  const appendAudit = deps.appendAudit || (() => {});
  const buildCoverageMatrixFn = deps.buildCoverageMatrix || buildCoverageMatrix;
  const writeQuestionnaireReportsFn = deps.writeQuestionnaireReports || writeQuestionnaireReports;
  const inferQuestionAreas = deps.inferQuestionAreas || defaultInferQuestionAreas;
  const id = flags.question || questionId;
  if (!id) throw new Error("Missing question id.");
  if (flags.value === undefined && flags.answer === undefined) throw new Error("Missing --value.");
  const value = String(flags.value !== undefined ? flags.value : flags.answer);
  const answersFile = ".kabeeri/questionnaires/answers.json";
  const sourcesFile = ".kabeeri/questionnaires/answer_sources.json";
  const data = readJsonFile(answersFile);
  data.answers = data.answers || [];
  const existing = data.answers.find((answer) => answer.question_id === id);
  const areaIds = parseCsv(flags.areas || inferQuestionAreas(id).join(","));
  const item = {
    answer_id: existing ? existing.answer_id : `answer-${String(data.answers.length + 1).padStart(3, "0")}`,
    question_id: id,
    value,
    area_ids: areaIds,
    answered_by: flags.by || flags.actor || "local-user",
    answered_at: new Date().toISOString(),
    confidence: flags.confidence || inferAnswerConfidence(value),
    source: flags.source || "questionnaire",
    source_mode: flags["source-mode"] || "direct",
    delivery_mode: flags["delivery-mode"] || null,
    intake_mode: flags["intake-mode"] || "adaptive"
  };
  if (existing) Object.assign(existing, item);
  else data.answers.push(item);
  writeJsonFile(answersFile, data);

  const sources = readJsonFile(sourcesFile);
  sources.sources = sources.sources || [];
  sources.sources.push({
    source_id: `source-${String(sources.sources.length + 1).padStart(3, "0")}`,
    answer_id: item.answer_id,
    question_id: id,
    source_mode: item.source_mode,
    recorded_at: item.answered_at,
    summary: `Answer recorded for ${id}`
  });
  writeJsonFile(sourcesFile, sources);

  const matrix = buildCoverageMatrixFn(deps);
  writeQuestionnaireReportsFn(matrix);
  appendAudit("questionnaire.answer_recorded", "questionnaire", item.answer_id, `Answer recorded for ${id}`);
  console.log(`Recorded answer ${item.answer_id} for ${id}`);
}

function questionnaireIntakePlan(value, flags = {}, deps = {}) {
  ensureWorkspace();
  const parseCsv = deps.parseCsv || defaultParseCsv;
  const description = flags.description || flags.text || flags.project || value || "";
  const inferQuestionnaireBlueprint = deps.inferQuestionnaireBlueprint || defaultInferQuestionnaireBlueprint;
  const blueprintKey = flags.blueprint || getCurrentBlueprintKey() || inferQuestionnaireBlueprint(description, flags, deps);
  if (!blueprintKey) throw new Error("Missing project description or selected blueprint. Use `kvdf questionnaire plan \"Build ecommerce store...\"` or `--blueprint ecommerce`.");
  const pipelineState = buildPipelineState({ fileExists, readJsonFile });
  if (!pipelineState.current_delivery_mode) {
    throw new Error("Questionnaire planning blocked: choose a delivery mode first with `kvdf delivery choose agile` or `kvdf delivery choose structured`.");
  }
  const buildQuestionnaireFlowFn = deps.buildQuestionnaireFlow || buildQuestionnaireFlow;
  const buildQuestionnaireFrameworkContextFn = deps.buildQuestionnaireFrameworkContext || defaultBuildQuestionnaireFrameworkContext;
  const buildQuestionnaireIntakePlanFn = deps.buildQuestionnaireIntakePlan || defaultBuildQuestionnaireIntakePlan;
  const plan = buildQuestionnaireIntakePlanFn(description || blueprintKey, blueprintKey, { ...flags, parseCsv }, {
    buildQuestionnaireFrameworkContext: buildQuestionnaireFrameworkContextFn,
    buildQuestionnaireFlow: buildQuestionnaireFlowFn,
    ...deps
  });
  if (plan && plan.task_generation_contract) {
    plan.task_generation_contract.source_plan_id = plan.plan_id;
  }
  plan.approval_status = plan.approval_status || "pending";
  plan.review_status = plan.review_status || "pending";
  plan.reviewed_at = plan.reviewed_at || null;
  plan.reviewed_by = plan.reviewed_by || null;
  plan.approved_at = plan.approved_at || null;
  plan.approved_by = plan.approved_by || null;
  plan.approval_notes = Array.isArray(plan.approval_notes) ? plan.approval_notes : [];
  const file = ".kabeeri/questionnaires/adaptive_intake_plan.json";
  if (!fileExists(file)) writeJsonFile(file, { plans: [], current_plan_id: null });
  const state = readJsonFile(file);
  state.plans = state.plans || [];
  state.plans.push(plan);
  state.current_plan_id = plan.plan_id;
  writeJsonFile(file, state);
  refreshDeveloperAppScorecardsIfNeeded();
  const appendAudit = deps.appendAudit || (() => {});
  appendAudit("questionnaire.intake_plan_created", "questionnaire", plan.plan_id, `Questionnaire intake plan created for ${blueprintKey}`);
  if (!flags.silent) {
    if (flags.json) console.log(JSON.stringify(plan, null, 2));
    else renderQuestionnaireIntakePlan(plan);
  }
  return plan;
}

function questionnaireReviewPlan(flags = {}, deps = {}) {
  ensureWorkspace();
  const plan = readLatestQuestionnairePlan();
  if (!plan) {
    throw new Error("Questionnaire review blocked: create a planning pack first with `kvdf questionnaire plan`.");
  }
  const state = readQuestionnairePlanState();
  const updatedPlan = {
    ...plan,
    approval_status: plan.approval_status || "pending",
    review_status: "reviewed",
    reviewed_at: new Date().toISOString(),
    reviewed_by: flags.by || flags.actor || "local-user",
    reviewed_summary: flags.note || flags.summary || "Planning pack reviewed for approval readiness."
  };
  updateQuestionnairePlanState(state, updatedPlan);
  refreshDeveloperAppScorecardsIfNeeded();
  const appendAudit = deps.appendAudit || (() => {});
  appendAudit("questionnaire.plan_reviewed", "questionnaire", updatedPlan.plan_id, `Questionnaire intake plan reviewed for ${updatedPlan.blueprint && updatedPlan.blueprint.key ? updatedPlan.blueprint.key : "project"}`);
  if (flags.json) console.log(JSON.stringify(updatedPlan, null, 2));
  else renderQuestionnairePlanReview(updatedPlan);
  return updatedPlan;
}

function questionnaireApprovePlan(flags = {}, deps = {}) {
  ensureWorkspace();
  const requireAnyRole = deps.requireAnyRole || (() => {});
  requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "approve questionnaire planning");
  const plan = readLatestQuestionnairePlan();
  if (!plan) {
    throw new Error("Questionnaire approval blocked: create a planning pack first with `kvdf questionnaire plan`.");
  }
  if (plan.review_status !== "reviewed") {
    throw new Error("Questionnaire approval blocked: review the planning pack first with `kvdf questionnaire review`.");
  }
  if (!(flags.confirm || flags.approve || flags.yes)) {
    throw new Error("Questionnaire approval blocked: pass `--confirm` to approve the reviewed planning pack.");
  }
  const state = readQuestionnairePlanState();
  const updatedPlan = {
    ...plan,
    approval_status: "approved",
    approved_at: new Date().toISOString(),
    approved_by: flags.by || flags.actor || "local-user",
    approval_notes: uniqueList([...(Array.isArray(plan.approval_notes) ? plan.approval_notes : []), flags.note || flags.summary || "Approved for task generation."])
  };
  updateQuestionnairePlanState(state, updatedPlan);
  refreshDeveloperAppScorecardsIfNeeded();
  const appendAudit = deps.appendAudit || (() => {});
  appendAudit("questionnaire.plan_approved", "questionnaire", updatedPlan.plan_id, `Questionnaire intake plan approved for ${updatedPlan.blueprint && updatedPlan.blueprint.key ? updatedPlan.blueprint.key : "project"}`);
  if (flags.json) console.log(JSON.stringify(updatedPlan, null, 2));
  else renderQuestionnairePlanApproval(updatedPlan);
  return updatedPlan;
}

function buildQuestionnaireIntakePlan(description, blueprintKey, flags = {}, deps = {}) {
  return defaultBuildQuestionnaireIntakePlan(description, blueprintKey, flags, deps);
}

function defaultBuildQuestionnaireIntakePlan(description, blueprintKey, flags = {}, deps = {}) {
  const findProductBlueprint = deps.findProductBlueprint;
  const buildBlueprintContext = deps.buildBlueprintContext;
  const getProductBlueprintCatalog = deps.getProductBlueprintCatalog;
  const buildDataDesignContext = deps.buildDataDesignContext || (() => ({
    modules: [],
    entities: [],
    must_have: [],
    risk_flags: []
  }));
  const buildUiDesignRecommendation = deps.buildUiDesignRecommendation;
  const buildDeliveryModeRecommendation = deps.buildDeliveryModeRecommendation;
  const buildQuestionnaireFrameworkContext = deps.buildQuestionnaireFrameworkContext || defaultBuildQuestionnaireFrameworkContext;
  const buildAdaptiveIntakeQuestions = deps.buildAdaptiveIntakeQuestions || defaultBuildAdaptiveIntakeQuestions;
  const detectLanguage = deps.detectLanguage || defaultDetectLanguage;
  const resolveOutputLanguage = deps.resolveOutputLanguage || defaultResolveOutputLanguage;
  const blueprint = findProductBlueprint ? findProductBlueprint(blueprintKey) : null;
  if (!blueprint) throw new Error(`Product blueprint not found: ${blueprintKey}`);
  const outputLanguage = resolveOutputLanguage(flags, description);
  const corePlatform = getProductBlueprintCatalog ? getProductBlueprintCatalog().core_platform : {};
  const blueprintContext = buildBlueprintContext ? buildBlueprintContext(blueprint, corePlatform) : { blueprint };
  const dataContext = buildDataDesignContext(description ? (flags.blueprint || blueprint.key) : blueprint.key, flags);
  const uiContext = buildUiDesignRecommendation(blueprint.key, flags);
  const delivery = buildDeliveryModeRecommendation(description, {
    ...flags,
    enterprise: flags.enterprise || /erp|enterprise|compliance|audit|large/i.test(description)
  });
  const frameworks = buildQuestionnaireFrameworkContext(description, blueprint, flags, deps);
  const questions = buildAdaptiveIntakeQuestions({
    blueprint,
    blueprintContext,
    dataContext,
    uiContext,
    delivery,
    frameworks,
    flags
  }, deps);
  const uiDecisionChecklist = buildUiDecisionChecklist(uiContext, blueprint, flags);
  const modulePlan = buildQuestionnaireModulePlan({
    blueprint,
    blueprintContext,
    dataContext,
    uiContext,
    delivery,
    frameworks,
    flags
  });
  const deliveryMap = buildQuestionnaireDeliveryMap({
    blueprint,
    blueprintContext,
    dataContext,
    uiContext,
    delivery,
    modulePlan,
    flags
  });
  const compactGuidance = buildQuestionnaireCompactGuidance(description, blueprint, frameworks, uiContext, delivery, outputLanguage);

  return {
    plan_id: `questionnaire-intake-${Date.now()}`,
    created_at: new Date().toISOString(),
    description,
    input_language: detectLanguage(description),
    output_language: outputLanguage,
    language_policy: "follow_user_language_unless_overridden",
    goal: "Generate focused developer questions that identify product type, framework stack, database model, UI approach, and delivery methodology before task generation.",
    blueprint: {
      key: blueprint.key,
      name: blueprint.name,
      category: blueprint.category,
      recommended_delivery: blueprint.recommended_delivery,
      channels: blueprint.channels || [],
      backend_modules: blueprint.backend_modules || [],
      frontend_pages: blueprint.frontend_pages || [],
      database_entities: blueprint.database_entities || [],
      risk_flags: blueprint.risk_flags || []
    },
    delivery_mode_recommendation: {
      recommended_mode: delivery.recommended_mode,
      confidence: delivery.confidence,
      scores: delivery.scores,
      developer_decision_required: true
    },
    framework_context: frameworks,
    data_design_context: {
      modules: dataContext.modules,
      entities: dataContext.entities,
      must_have: dataContext.must_have,
      risk_flags: dataContext.risk_flags
    },
    ui_ux_context: {
      experience_pattern: uiContext.experience_pattern,
      recommended_stacks: uiContext.recommended_stacks,
      component_groups: uiContext.component_groups,
      page_templates: uiContext.page_templates,
      layout_priorities: uiContext.layout_priorities,
      seo_geo: uiContext.seo_geo,
      required_decisions: uiDecisionChecklist.required_decisions
    },
    ui_decision_context: uiDecisionChecklist,
    module_plan: modulePlan,
    delivery_map: deliveryMap,
    task_generation_contract: {
      source_plan_id: null,
      module_plan_id: modulePlan.module_plan_id,
      delivery_map_id: deliveryMap.delivery_map_id,
      active_delivery_mode: deliveryMap.active_mode,
      task_generation_mode: deliveryMap.task_generation_mode,
      source_of_truth: "questionnaire_intake_plan"
    },
    approval_status: "pending",
    review_status: "pending",
    reviewed_at: null,
    reviewed_by: null,
    approved_at: null,
    approved_by: null,
    approval_notes: [],
    prompt_pack_guidance: {
      selected_packs: compactGuidance.selected_prompt_packs,
      prompt_pack_commands: compactGuidance.prompt_pack_commands
    },
    compact_guidance: compactGuidance,
    generated_questions: questions,
    answer_commands: questions.slice(0, 8).map((question) => `kvdf questionnaire answer ${question.question_id} --value "<answer>" --areas ${question.area_ids.join(",")}`),
    next_actions: [
      `Answer and documentation language should be ${outputLanguage === "ar" ? "Arabic" : outputLanguage === "en" ? "English" : "the user's language"}.`,
      "Ask only the generated questions that are not already known from the developer's natural-language request.",
      "Record confirmed answers with `kvdf questionnaire answer` so coverage and missing-answer reports update.",
      "Use `kvdf delivery choose` after the developer approves Agile or Structured.",
      "Review the planning pack with `kvdf questionnaire review` and approve it with `kvdf questionnaire approve --confirm` before generating tasks.",
      "Use Product Blueprint, Data Design, UI/UX Advisor, and one prompt pack at a time before generating tasks."
    ]
  };
}

function buildUiDecisionChecklist(uiContext = {}, blueprint = {}, flags = {}) {
  const experiencePattern = uiContext.experience_pattern || "ui_pattern_not_set";
  const pageTemplates = uniqueList(uiContext.page_templates || []);
  const layoutPriorities = uniqueList(uiContext.layout_priorities || []);
  const designSource = flags.design_source || flags.ui_design_source || flags.reference || null;
  const decisions = [
    {
      decision_id: "ui.design_source",
      title: "Confirm the approved UI design source",
      prompt: `Confirm the approved UI design source for ${blueprint.name || blueprint.key || "this project"} before frontend execution.`,
      why: "A design source prevents the frontend from drifting away from the approved visual system.",
      area_ids: ["ui_ux_design", "design_governance"],
      answer_hint: designSource || "figma_available / brand_guide_available / reference_sites / kabeeri_suggests"
    },
    {
      decision_id: "ui.experience_pattern",
      title: "Confirm the UI experience pattern",
      prompt: `Confirm whether the project should follow the ${experiencePattern} pattern or adopt a different UI direction.`,
      why: "The experience pattern controls page templates, density, component groups, and task slicing.",
      area_ids: ["ui_ux_design", "public_frontend", "admin_frontend"],
      answer_hint: experiencePattern
    },
    {
      decision_id: "ui.responsive_priority",
      title: "Choose the responsive priority",
      prompt: "Choose whether the first release should be mobile-first, desktop-first, or balanced.",
      why: "Responsive priority determines the initial frontend tasks and the most important breakpoints.",
      area_ids: ["public_frontend", "admin_frontend", "accessibility"],
      answer_hint: "mobile_first / desktop_first / balanced"
    },
    {
      decision_id: "ui.public_admin_split",
      title: "Confirm the public/admin UI split",
      prompt: "Confirm whether public pages and admin pages should share one system or follow separate UI flows.",
      why: "Public/admin split changes layout density, navigation, and reuse strategy.",
      area_ids: ["public_frontend", "admin_frontend", "ui_ux_design"],
      answer_hint: "shared_system / separate_flows / public_first / admin_first"
    },
    {
      decision_id: "ui.accessibility_target",
      title: "Confirm the accessibility target",
      prompt: "Confirm the accessibility target for the first release.",
      why: "Accessibility requirements should be explicit before frontend tasks are generated.",
      area_ids: ["accessibility", "ui_ux_design"],
      answer_hint: "basic_accessibility / wcag_minded / strict_accessibility"
    }
  ];
  if (layoutPriorities.length) {
    decisions.push({
      decision_id: "ui.layout_priorities",
      title: "Validate layout priorities",
      prompt: `Validate the leading layout priorities: ${layoutPriorities.slice(0, 8).join(", ")}.`,
      why: "Layout priorities provide a direct basis for frontend task generation and screen order.",
      area_ids: ["ui_ux_design", "public_frontend", "admin_frontend"],
      answer_hint: layoutPriorities.slice(0, 8).join(", ")
    });
  }
  if (pageTemplates.length) {
    decisions.push({
      decision_id: "ui.page_templates",
      title: "Validate the first page templates",
      prompt: `Validate the first page templates: ${pageTemplates.slice(0, 8).join(", ")}.`,
      why: "Page templates should be explicit before turning the UI into implementation tasks.",
      area_ids: ["public_frontend", "admin_frontend", "ui_ux_design"],
      answer_hint: pageTemplates.slice(0, 8).join(", ")
    });
  }
  return {
    source_system: "ui_ux_advisor",
    focus_areas: Array.from(UI_DECISION_AREA_KEYS),
    required_decisions: decisions,
    unresolved_decision_ids: decisions.map((item) => item.decision_id)
  };
}

function buildQuestionnaireModulePlan(context = {}) {
  const {
    blueprint = {},
    blueprintContext = {},
    dataContext = {},
    uiContext = {},
    delivery = {},
    frameworks = {},
    flags = {}
  } = context;
  const blueprintModules = uniqueList(blueprint.backend_modules || []);
  const dataModules = uniqueList(dataContext.modules || []);
  const uiPages = uniqueList(uiContext.page_templates || []);
  const implementationModules = blueprintModules.map((moduleKey, index) => {
    const title = titleizeModuleKey(moduleKey);
    const focusEntities = inferModuleEntities(moduleKey, dataContext.entities || [], blueprint.database_entities || []);
    const focusPages = inferModulePages(moduleKey, uiPages, blueprint.frontend_pages || []);
    const boundary = inferModuleBoundary(moduleKey, blueprint, dataContext, uiContext);
    const dependencies = inferModuleDependencies(moduleKey, blueprintModules, dataModules);
    return {
      module_id: `module-${String(index + 1).padStart(3, "0")}-${slugifyModuleKey(moduleKey)}`,
      module_key: moduleKey,
      title,
      boundary,
      scope: inferModuleScope(moduleKey, blueprint, focusPages),
      owner_surface: inferModuleOwnerSurface(moduleKey, blueprint, uiContext),
      entities: focusEntities,
      pages: focusPages,
      dependencies,
      implementation_notes: inferModuleImplementationNotes(moduleKey, blueprint, dataContext, uiContext, delivery, frameworks, flags)
    };
  });
  const backboneModules = dataModules.map((moduleKey, index) => ({
    module_id: `backbone-${String(index + 1).padStart(2, "0")}-${slugifyModuleKey(moduleKey)}`,
    module_key: moduleKey,
    title: titleizeModuleKey(moduleKey),
    boundary: inferBackboneBoundary(moduleKey),
    entities: uniqueList((dataContext.entities || []).filter((entity) => entityMatchesModule(entity, moduleKey))),
    indexes: uniqueList((dataContext.indexes || []).filter((indexName) => indexMatchesModule(indexName, moduleKey))),
    must_have: uniqueList((dataContext.must_have || []).filter((rule) => ruleMatchesModule(rule, moduleKey))),
    dependencies: inferBackboneDependencies(moduleKey, dataModules)
  }));
  return {
    module_plan_id: `module-plan-${Date.now()}`,
    created_at: new Date().toISOString(),
    blueprint_key: blueprint.key,
    blueprint_name: blueprint.name,
    delivery_mode_recommendation: delivery.recommended_mode || "structured",
    delivery_confidence: delivery.confidence || "low",
    source_context: {
      blueprint_context_id: blueprintContext.blueprint ? blueprintContext.blueprint.key : blueprint.key || null,
      data_context_id: dataContext.context_id || null,
      ui_pattern: uiContext.experience_pattern || null
    },
    backbone_modules: backboneModules,
    implementation_modules: implementationModules,
    module_order: implementationModules.map((item) => item.module_key),
    module_boundaries: implementationModules.map((item) => ({
      module_key: item.module_key,
      boundary: item.boundary,
      owner_surface: item.owner_surface
    })),
    module_dependencies: implementationModules.map((item) => ({
      module_key: item.module_key,
      dependencies: item.dependencies
    })),
    task_generation_inputs: {
      module_keys: implementationModules.map((item) => item.module_key),
      backbone_module_keys: backboneModules.map((item) => item.module_key),
      data_entities: uniqueList(dataContext.entities || []),
      ui_pages: uiPages,
      decision_ids: (uiContext.required_decisions || []).map((item) => item.decision_id)
    }
  };
}

function buildQuestionnaireDeliveryMap(context = {}) {
  const {
    blueprint = {},
    dataContext = {},
    uiContext = {},
    delivery = {},
    modulePlan = {},
    flags = {}
  } = context;
  const recommendedMode = normalizeDeliveryModeLabel(delivery.recommended_mode || "structured");
  const selectedMode = flags.delivery_mode ? normalizeDeliveryModeLabel(flags.delivery_mode) : null;
  const activeMode = selectedMode || recommendedMode;
  const implementationModules = modulePlan.implementation_modules || [];
  const backboneModules = modulePlan.backbone_modules || [];
  const moduleKeys = uniqueList([
    ...implementationModules.map((item) => item.module_key),
    ...backboneModules.map((item) => item.module_key)
  ]);
  const batches = buildDeliveryModuleBatches(activeMode, moduleKeys, implementationModules, backboneModules);
  const map = {
    delivery_map_id: `delivery-map-${Date.now()}`,
    created_at: new Date().toISOString(),
    blueprint_key: blueprint.key,
    blueprint_name: blueprint.name,
    recommended_mode: recommendedMode,
    selected_mode: selectedMode,
    active_mode: activeMode,
    confidence: delivery.confidence || "low",
    mode_explanation: activeMode === "structured"
      ? "Structured delivery is compiled into named phases with explicit gates and handoff rules."
      : "Agile delivery is compiled into small iteration batches with review and adaptation gates.",
    delivery_shape: activeMode === "structured" ? "phase_gated" : "iteration_batches",
    phases: activeMode === "structured" ? buildStructuredDeliveryPhases(modulePlan, dataContext, uiContext) : [],
    sprints: activeMode === "agile" ? buildAgileDeliverySprints(modulePlan, dataContext, uiContext) : [],
    module_batches: batches,
    handoff_rules: activeMode === "structured"
      ? [
          "Do not start the next phase until the current phase reaches approval-ready status.",
          "Keep module boundaries explicit in task titles and acceptance criteria.",
          "Re-run the delivery map if the blueprint or intake answers change."
        ]
      : [
          "Keep each sprint batch small and reviewable.",
          "Re-plan after each review if the intake answers change.",
          "Avoid mixing module ownership across batches."
        ],
    task_generation_mode: activeMode === "structured" ? "phase_gated" : "iteration_batches",
    feed_forward_contract: {
      module_plan_id: modulePlan.module_plan_id || null,
      module_keys: modulePlan.task_generation_inputs ? modulePlan.task_generation_inputs.module_keys : [],
      source_of_truth: "questionnaire_intake_plan"
    }
  };
  return map;
}

function buildQuestionnaireTaskSynthesis(matrix, latestPlan, flags = {}, deps = {}) {
  const getWorkstreamPathRules = deps.getWorkstreamPathRules || (() => []);
  const areas = (matrix.areas || []).filter((area) => ["required", "needs_follow_up"].includes(area.status));
  const moduleOrder = latestPlan && latestPlan.module_plan ? latestPlan.module_plan.module_order || [] : [];
  const phaseOrder = latestPlan && latestPlan.delivery_map ? [
    ...(latestPlan.delivery_map.phases || []),
    ...(latestPlan.delivery_map.sprints || []),
    ...(latestPlan.delivery_map.module_batches || [])
  ] : [];
  const synthesis = {
    synthesis_id: `questionnaire-task-synthesis-${Date.now()}`,
    created_at: new Date().toISOString(),
    questionnaire_plan_id: latestPlan ? latestPlan.plan_id : null,
    questionnaire_plan_approval_status: latestPlan ? latestPlan.approval_status || "pending" : null,
    module_plan_id: latestPlan && latestPlan.module_plan ? latestPlan.module_plan.module_plan_id : null,
    delivery_map_id: latestPlan && latestPlan.delivery_map ? latestPlan.delivery_map.delivery_map_id : null,
    delivery_mode: latestPlan && latestPlan.delivery_map ? latestPlan.delivery_map.active_mode : null,
    task_generation_mode: latestPlan && latestPlan.delivery_map ? latestPlan.delivery_map.task_generation_mode : "coverage",
    task_count: areas.length,
    order_hints: {},
    dependencies: {},
    allowed_files: {},
    task_blueprints: []
  };
  for (const [index, area] of areas.entries()) {
    const workstream = mapAreaToWorkstream(area.area_key);
    const taskId = `task-${String(index + 1).padStart(3, "0")}`;
    const moduleKey = moduleOrder[index % Math.max(moduleOrder.length, 1)] || null;
    const phase = phaseOrder[index % Math.max(phaseOrder.length, 1)] || null;
    const dependencyIds = [];
    if (index > 0) dependencyIds.push(`task-${String(index).padStart(3, "0")}`);
    if (phase && Array.isArray(phase.modules) && phase.modules.length > 1) {
      const previous = phase.modules.slice(0, -1);
      for (let i = 0; i < previous.length; i += 1) {
        dependencyIds.push(`task-${String(Math.max(1, index - i - 1)).padStart(3, "0")}`);
      }
    }
    const allowedFiles = uniqueList([
      ...getWorkstreamPathRules(workstream),
      ...inferAllowedFilesForArea(area.area_key, moduleKey, latestPlan)
    ]);
    synthesis.order_hints[area.area_key] = phase ? (phase.phase_id || phase.sprint_id || phase.batch_id || null) : null;
    synthesis.dependencies[area.area_key] = uniqueList(dependencyIds);
    synthesis.allowed_files[area.area_key] = allowedFiles;
    synthesis.task_blueprints.push({
      task_id: taskId,
      area_key: area.area_key,
      workstream,
      title: area.area,
      status: area.status,
      order_hint: synthesis.order_hints[area.area_key],
      dependencies: synthesis.dependencies[area.area_key],
      allowed_files: allowedFiles,
      acceptance_criteria: area.status === "needs_follow_up"
        ? [
            `${area.area} is clarified with a concrete answer or explicit deferral.`,
            "Coverage updates after the follow-up answer.",
            "Provenance ties the task to the module plan and delivery map."
          ]
        : [
            `${area.area} is explicitly handled in the intake plan.`,
            "Dependencies and allowed files are visible to the executor packet.",
            "The task can be executed without rereading raw chat."
          ]
    });
  }
  return synthesis;
}

function writeQuestionnaireTaskSynthesis(synthesis) {
  writeJsonFile(".kabeeri/reports/questionnaire_task_synthesis.json", synthesis);
}

function inferAllowedFilesForArea(areaKey, moduleKey, latestPlan) {
  const areaFileMap = {
    product_business: ["docs/", "knowledge/", "src/cli/commands/blueprint.js"],
    mvp_scope: ["docs/", "knowledge/"],
    backend: ["src/cli/", "plugins/kvdf-dev/runtime/", "src/cli/commands/"],
    api_layer: ["src/cli/", "plugins/kvdf-dev/runtime/"],
    technology_governance: ["knowledge/", "docs/"],
    public_frontend: ["src/cli/", "docs/site/", "docs/cli/"],
    admin_frontend: ["src/cli/", "docs/site/", "docs/cli/"],
    mobile: ["src/cli/", "docs/"],
    database: ["src/cli/commands/blueprint.js", "knowledge/standard_systems/DATA_DESIGN_BLUEPRINT.json", "docs/"],
    multi_tenancy: ["knowledge/standard_systems/DATA_DESIGN_BLUEPRINT.json", "docs/"],
    ui_ux_design: ["src/cli/commands/blueprint.js", "knowledge/design_system/", "docs/"],
    design_governance: ["knowledge/design_system/", "docs/"],
    accessibility: ["knowledge/design_system/", "docs/site/"],
    qa: ["tests/", "docs/"],
    security: ["src/cli/", "docs/"],
    product_design: ["docs/", "knowledge/"],
    kabeeri_control_layer: ["src/cli/", "plugins/kvdf-dev/runtime/", ".kabeeri/"]
  };
  const base = areaFileMap[areaKey] ? [...areaFileMap[areaKey]] : [];
  if (moduleKey && latestPlan && latestPlan.module_plan) {
    const moduleMatch = (latestPlan.module_plan.implementation_modules || []).find((item) => item.module_key === moduleKey)
      || (latestPlan.module_plan.backbone_modules || []).find((item) => item.module_key === moduleKey);
    if (moduleMatch) {
      if (Array.isArray(moduleMatch.pages) && moduleMatch.pages.length) base.push("src/cli/commands/blueprint.js", "docs/site/");
      if (Array.isArray(moduleMatch.entities) && moduleMatch.entities.length) base.push("knowledge/standard_systems/DATA_DESIGN_BLUEPRINT.json");
      if (Array.isArray(moduleMatch.must_have) && moduleMatch.must_have.length) base.push("knowledge/standard_systems/DATA_DESIGN_BLUEPRINT.json");
      if (Array.isArray(moduleMatch.dependencies) && moduleMatch.dependencies.includes("core")) base.push("src/cli/index.js");
    }
  }
  return uniqueList(base);
}

function defaultBuildQuestionnaireFrameworkContext(description, blueprint, flags = {}, deps = {}) {
  const getPromptPackCatalogFn = deps.getPromptPackCatalog || getPromptPackCatalog;
  const detectFrameworkPacks = deps.detectFrameworkPacks;
  const recommendFrameworkPacksForBlueprintFn = deps.recommendFrameworkPacksForBlueprint || recommendFrameworkPacksForBlueprint;
  const packs = getPromptPackCatalogFn ? getPromptPackCatalogFn() : [];
  const explicit = uniqueList(defaultParseCsv([flags.framework, flags.backend, flags.frontend, flags.mobile, flags.stack].filter(Boolean).join(",")));
  const detected = detectFrameworkPacks ? detectFrameworkPacks(description, packs) : [];
  const recommended = recommendFrameworkPacksForBlueprintFn ? recommendFrameworkPacksForBlueprintFn(blueprint, packs) : [];
  const selected = uniqueList([...explicit, ...detected, ...recommended].filter((item) => packs.some((pack) => pack.pack === item))).slice(0, 6);
  return {
    selected_packs: selected,
    explicit_packs: explicit,
    detected_packs: detected,
    recommended_packs: recommended,
    available_packs: packs.map((pack) => ({ pack: pack.pack, display_name: pack.display_name || pack.pack })),
    required_decisions: [
      "Confirm backend framework.",
      "Confirm frontend framework or UI library.",
      "Confirm mobile framework if mobile_app is in scope.",
      "Confirm database engine and ORM/migration approach.",
      "Confirm whether stack choice is fixed by the developer/client or open to recommendation."
    ]
  };
}

function buildQuestionnaireCompactGuidance(description, blueprint, frameworks, uiContext, delivery, outputLanguage) {
  const selectedPacks = uniqueList([...(frameworks.selected_packs || []), ...(frameworks.recommended_packs || [])]).slice(0, 6);
  const promptPackCommands = selectedPacks.slice(0, 4).map((pack) => `kvdf prompt-pack compose ${pack} --task <task-id>`);
  return {
    task_kind: "project_start",
    execution_mode: "guided_first",
    recommended_model_class: "cheap",
    routing_reason: "Questionnaire intake should stay compact, then hand off to a single focused prompt pack.",
    token_saving_hint: "Ask only the unanswered intake questions and compose one prompt pack at a time.",
    input_language: defaultDetectLanguage(description),
    output_language: outputLanguage,
    selected_prompt_packs: selectedPacks,
    prompt_pack_commands: promptPackCommands,
    next_actions: uniqueList([
      "Use the questionnaire to confirm blueprint, stack, and UI decisions before implementation.",
      "Choose one prompt pack at a time to keep the AI context short.",
      "Compose the selected pack only after the intake answers are clear."
    ])
  };
}

function defaultBuildAdaptiveIntakeQuestions(context, deps = {}) {
  const { blueprint, dataContext, uiContext, delivery, frameworks } = context;
  const questions = [];
  const add = (question) => questions.push({
    priority: question.priority || "medium",
    source_systems: question.source_systems || [],
    area_ids: question.area_ids || [],
    question_id: question.question_id,
    text: question.text,
    why: question.why,
    answer_type: question.answer_type || "text",
    choices: question.choices || []
  });

  add({
    priority: "high",
    question_id: "adaptive.product.blueprint_confirmation",
    text: `Is this project best described as ${blueprint.name}, or should Kabeeri use a different product blueprint?`,
    why: "The product blueprint determines modules, pages, database entities, workstreams, and risks.",
    answer_type: "choice",
    choices: [blueprint.key, "different_blueprint", "hybrid"],
    area_ids: ["product_business", "mvp_scope"],
    source_systems: ["product_blueprint"]
  });
  add({
    priority: "high",
    question_id: "adaptive.delivery.mode_confirmation",
    text: `Should delivery use ${delivery.recommended_mode}, or does the developer prefer Agile/Structured differently?`,
    why: "The delivery mode changes planning depth, approval gates, sprint/phase records, and task slicing.",
    answer_type: "choice",
    choices: ["agile", "structured", "hybrid", "undecided"],
    area_ids: ["kabeeri_control_layer", "mvp_scope"],
    source_systems: ["delivery_mode_advisor"]
  });
  add({
    priority: "high",
    question_id: "adaptive.framework.backend",
    text: "Which backend framework should own APIs, auth, business rules, migrations, and integrations?",
    why: "Framework choice selects prompt packs, folder rules, migrations, testing style, and execution scope.",
    answer_type: "choice",
    choices: uniqueList([...frameworks.selected_packs, "laravel", "nestjs", "django", "dotnet", "fastapi", "expressjs", "not_decided"]),
    area_ids: ["backend", "api_layer", "technology_governance"],
    source_systems: ["prompt_packs", "framework_context"]
  });
  add({
    priority: "high",
    question_id: "adaptive.framework.frontend",
    text: "Which frontend framework/library should own the public/admin UI?",
    why: "Frontend stack affects routing, components, state, SEO/GEO, visual QA, and prompt pack selection.",
    answer_type: "choice",
    choices: uniqueList([...frameworks.selected_packs, "react", "nextjs", "vue", "nuxt-vue", "angular", "astro", "not_decided"]),
    area_ids: ["public_frontend", "admin_frontend", "technology_governance"],
    source_systems: ["prompt_packs", "ui_ux_advisor"]
  });
  if ((blueprint.channels || []).some((item) => String(item).includes("mobile"))) {
    add({
      priority: "high",
      question_id: "adaptive.framework.mobile",
      text: "Will the mobile channel use React Native Expo, Flutter, native apps, or be deferred?",
      why: "Mobile stack affects offline state, push notifications, app versions, deep links, permissions, and release handoff.",
      answer_type: "choice",
      choices: ["react-native-expo", "flutter", "native_ios_android", "deferred", "not_needed"],
      area_ids: ["mobile", "technology_governance"],
      source_systems: ["prompt_packs", "ui_ux_advisor"]
    });
  }
  add({
    priority: "high",
    question_id: "adaptive.database.engine",
    text: "Which database engine should be used, and is multi-tenancy required from day one?",
    why: "Database engine and tenancy shape migrations, constraints, indexing, data isolation, backups, and reporting.",
    answer_type: "text",
    choices: ["postgresql", "mysql", "sqlite_for_mvp", "mongodb", "not_decided"],
    area_ids: ["database", "multi_tenancy"],
    source_systems: ["data_design_blueprint"]
  });
  add({
    priority: "high",
    question_id: "adaptive.database.workflow_entities",
    text: `Are these core entities correct for V1: ${dataContext.entities.slice(0, 12).join(", ")}?`,
    why: "Confirmed entities reduce database redesign and keep tasks aligned with the real business workflow.",
    answer_type: "confirm_or_edit",
    area_ids: ["database", "product_business"],
    source_systems: ["data_design_blueprint", "product_blueprint"]
  });
  add({
    priority: "medium",
    question_id: "adaptive.ui.experience_pattern",
    text: `Should the UI follow the ${uiContext.experience_pattern} pattern with pages like ${uiContext.page_templates.slice(0, 8).join(", ")}?`,
    why: "The UI pattern controls component groups, page templates, SEO/GEO needs, dashboard density, and mobile ergonomics.",
    answer_type: "confirm_or_edit",
    area_ids: ["ui_ux_design", "public_frontend", "admin_frontend"],
    source_systems: ["ui_ux_advisor"]
  });
  add({
    priority: "medium",
    question_id: "adaptive.ui.design_source",
    text: "Is there an approved design source, brand guide, reference website, Figma, or should Kabeeri propose a UI direction?",
    why: "Design governance blocks frontend implementation until design source, text spec, and visual expectations are clear.",
    answer_type: "choice",
    choices: ["figma_available", "brand_guide_available", "reference_sites", "kabeeri_suggests", "not_decided"],
    area_ids: ["ui_ux_design", "design_governance"],
    source_systems: ["ui_ux_advisor", "design_governance"]
  });
  add({
    priority: "medium",
    question_id: "adaptive.ui.public_admin_split",
    text: "Should public pages and admin pages share one visual system, or should they follow separate UI flows?",
    why: "The public/admin split changes navigation, component reuse, density, and the task structure for frontend work.",
    answer_type: "choice",
    choices: ["shared_system", "separate_flows", "public_first", "admin_first", "not_decided"],
    area_ids: ["public_frontend", "admin_frontend", "ui_ux_design"],
    source_systems: ["ui_ux_advisor", "ui_decision_intake"]
  });
  add({
    priority: "medium",
    question_id: "adaptive.ui.responsive_priority",
    text: "What is the responsive priority for the first release: mobile-first, desktop-first, or balanced?",
    why: "Responsive priority affects page composition, breakpoints, components, and which frontend tasks are generated first.",
    answer_type: "choice",
    choices: ["mobile_first", "desktop_first", "balanced", "defer_mobile", "not_decided"],
    area_ids: ["public_frontend", "admin_frontend", "accessibility"],
    source_systems: ["ui_ux_advisor", "ui_decision_intake"]
  });
  add({
    priority: "medium",
    question_id: "adaptive.ui.accessibility_target",
    text: "What accessibility target should the UI meet in V1: basic accessibility, WCAG-minded, or strict accessibility?",
    why: "Accessibility target determines keyboard support, contrast, semantic structure, and QA coverage for frontend tasks.",
    answer_type: "choice",
    choices: ["basic_accessibility", "wcag_minded", "strict_accessibility", "not_decided"],
    area_ids: ["accessibility", "ui_ux_design"],
    source_systems: ["ui_ux_advisor", "accessibility_governance"]
  });
  for (const risk of (blueprint.risk_flags || []).slice(0, 4)) {
    add({
      priority: "medium",
      question_id: `adaptive.risk.${risk}`,
      text: `How should the project handle this risk: ${risk}?`,
      why: "Blueprint risks should become acceptance criteria, policy checks, or explicit deferrals.",
      answer_type: "text",
      area_ids: ["security", "qa", "product_business"],
      source_systems: ["product_blueprint", "policy_gates"]
    });
  }
  return questions;
}

function renderQuestionnaireIntakePlan(plan) {
  console.log(`Questionnaire intake plan: ${plan.plan_id}`);
  console.log(table(["Surface", "Value"], [
    ["Blueprint", `${plan.blueprint.name} (${plan.blueprint.key})`],
    ["Delivery", `${plan.delivery_mode_recommendation.recommended_mode} (${plan.delivery_mode_recommendation.confidence})`],
    ["Approval", `${plan.review_status || "pending"} / ${plan.approval_status || "pending"}`],
    ["Framework packs", plan.framework_context.selected_packs.join(", ") || "needs decision"],
    ["Prompt pack picks", (plan.prompt_pack_guidance.selected_packs || []).join(", ") || "needs decision"],
    ["Data modules", plan.data_design_context.modules.join(", ")],
    ["UI pattern", plan.ui_ux_context.experience_pattern],
    ["Implementation modules", (plan.module_plan.implementation_modules || []).map((item) => item.title).join(", ") || "none"],
    ["Delivery map", `${plan.delivery_map.active_mode} (${plan.delivery_map.delivery_shape})`],
    ["Questions", plan.generated_questions.length]
  ]));
  console.log("");
  console.log("Module Plan:");
  console.log(table(["Module", "Boundary", "Pages"], (plan.module_plan.implementation_modules || []).map((module) => [
    module.title,
    module.boundary,
    (module.pages || []).slice(0, 4).join(", ") || "—"
  ])));
  console.log("");
  console.log("Delivery Map:");
  const deliveryRows = [];
  for (const phase of plan.delivery_map.phases || []) deliveryRows.push([phase.phase_id || phase.sprint_id || phase.batch_id, phase.title, (phase.modules || []).join(", ") || "—"]);
  for (const sprint of plan.delivery_map.sprints || []) deliveryRows.push([sprint.sprint_id || sprint.phase_id || sprint.batch_id, sprint.title, (sprint.modules || []).join(", ") || "—"]);
  for (const batch of plan.delivery_map.module_batches || []) deliveryRows.push([batch.batch_id, batch.title, (batch.modules || []).join(", ") || "—"]);
  if (deliveryRows.length) console.log(table(["Unit", "Title", "Modules"], deliveryRows));
  else console.log("No delivery map rows generated.");
  console.log("");
  if (plan.task_generation_contract) {
    console.log("Task Generation Contract:");
    console.log(table(["Field", "Value"], [
      ["Source plan", plan.task_generation_contract.source_plan_id || "n/a"],
      ["Module plan", plan.task_generation_contract.module_plan_id || "n/a"],
      ["Delivery map", plan.task_generation_contract.delivery_map_id || "n/a"],
      ["Mode", plan.task_generation_contract.task_generation_mode || "n/a"],
      ["Source of truth", plan.task_generation_contract.source_of_truth || "n/a"]
    ]));
    console.log("");
  }
  console.log("Compact Guidance:");
  console.log(table(["Field", "Value"], [
    ["Task kind", plan.compact_guidance.task_kind],
    ["Routing", plan.compact_guidance.routing_reason],
    ["Model class", plan.compact_guidance.recommended_model_class],
    ["Prompt packs", (plan.compact_guidance.selected_prompt_packs || []).join(", ") || "none"],
    ["Token-saving hint", plan.compact_guidance.token_saving_hint]
  ]));
  console.log("");
  console.log(table(["Priority", "Question ID", "Question"], plan.generated_questions.map((item) => [
    item.priority,
    item.question_id,
    item.text
  ])));
}

function renderQuestionnairePlanReview(plan) {
  console.log(`Questionnaire planning pack reviewed: ${plan.plan_id}`);
  console.log(table(["Field", "Value"], [
    ["Blueprint", `${plan.blueprint.name} (${plan.blueprint.key})`],
    ["Review status", plan.review_status || "reviewed"],
    ["Reviewed by", plan.reviewed_by || "local-user"],
    ["Reviewed at", plan.reviewed_at || "n/a"],
    ["Approval status", plan.approval_status || "pending"],
    ["Next action", "kvdf questionnaire approve --confirm"]
  ]));
}

function renderQuestionnairePlanApproval(plan) {
  console.log(`Questionnaire planning pack approved: ${plan.plan_id}`);
  console.log(table(["Field", "Value"], [
    ["Blueprint", `${plan.blueprint.name} (${plan.blueprint.key})`],
    ["Approval status", plan.approval_status || "approved"],
    ["Approved by", plan.approved_by || "local-user"],
    ["Approved at", plan.approved_at || "n/a"],
    ["Next action", "kvdf questionnaire generate-tasks"]
  ]));
}

function buildCoverageMatrix(deps = {}) {
  const parseCsv = deps.parseCsv || defaultParseCsv;
  const answers = fileExists(".kabeeri/questionnaires/answers.json") ? readJsonFile(".kabeeri/questionnaires/answers.json").answers || [] : [];
  const answerMap = Object.fromEntries(answers.map((answer) => [answer.question_id, answer]));
  const projectType = normalizeAnswerValue(answerMap["entry.project_type"] && answerMap["entry.project_type"].value);
  const complexity = normalizeAnswerValue(answerMap["entry.complexity"] && answerMap["entry.complexity"].value);
  const areas = (deps.getSystemAreas || getSystemAreas)().map((area) => {
    const activation = activateSystemArea(area, answerMap, projectType, complexity);
    const relatedAnswers = answers.filter((answer) => (answer.area_ids || []).includes(area.key));
    const status = relatedAnswers.some((answer) => ["unknown", "unsure", "not sure", "maybe"].includes(normalizeAnswerValue(answer.value)))
      ? "needs_follow_up"
      : activation.status;
    return {
      area_id: area.id,
      area_key: area.key,
      area: area.name,
      group: area.group,
      status,
      reason: status === "needs_follow_up" ? "Answer is uncertain and needs follow-up." : activation.reason,
      required_action: getCoverageAction(status, area),
      question_group: area.question_group,
      answered: relatedAnswers.length > 0,
      answers: relatedAnswers.map((answer) => ({
        answer_id: answer.answer_id,
        question_id: answer.question_id,
        source_mode: answer.source_mode
      }))
    };
  });
  return {
    generated_at: new Date().toISOString(),
    source: ".kabeeri/questionnaires/answers.json",
    project_type: projectType || "unknown",
    complexity: complexity || "unknown",
    areas,
    summary: summarizeBy(areas, "status")
  };
}

function writeQuestionnaireReports(matrix) {
  writeJsonFile(".kabeeri/questionnaires/coverage_matrix.json", matrix);
  writeJsonFile(".kabeeri/questionnaires/missing_answers_report.json", buildMissingAnswersReport(matrix));
}

function buildMissingAnswersReport(matrix) {
  const missing = (matrix.areas || [])
    .filter((area) => ["required", "unknown", "needs_follow_up"].includes(area.status) && !area.answered)
    .map((area) => ({
      area_id: area.area_id,
      area_key: area.area_key,
      area: area.area,
      status: area.status,
      required_action: area.required_action,
      suggested_questions: getSuggestedQuestionsForArea(area.area_key)
    }));
  const followUp = (matrix.areas || [])
    .filter((area) => area.status === "needs_follow_up" && area.answered)
    .map((area) => ({
      area_id: area.area_id,
      area_key: area.area_key,
      area: area.area,
      required_action: area.required_action,
      suggested_questions: getSuggestedQuestionsForArea(area.area_key)
    }));
  return {
    generated_at: new Date().toISOString(),
    project_type: matrix.project_type,
    missing,
    follow_up: followUp,
    totals: {
      missing: missing.length,
      follow_up: followUp.length
    }
  };
}

function generateTasksFromCoverage(flags = {}, deps = {}) {
  ensureWorkspace();
  const requireAnyRole = deps.requireAnyRole || (() => {});
  const parseCsv = deps.parseCsv || defaultParseCsv;
  requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "generate questionnaire tasks");
  const matrix = buildCoverageMatrix(deps);
  writeQuestionnaireReports(matrix);
  const latestPlan = readLatestQuestionnairePlan();
  if (!latestPlan) {
    throw new Error("Questionnaire task generation blocked: create a planning pack first with `kvdf questionnaire plan`.");
  }
  if (latestPlan.approval_status !== "approved") {
    const nextAction = latestPlan.review_status === "reviewed"
      ? "kvdf questionnaire approve --confirm"
      : "kvdf questionnaire review";
    throw new Error(`Questionnaire task generation blocked: review and approve the planning pack first with \`${nextAction}\`.`);
  }
  const synthesis = buildQuestionnaireTaskSynthesis(matrix, latestPlan, flags, deps);
  writeQuestionnaireTaskSynthesis(synthesis);
  const tasksFile = ".kabeeri/tasks.json";
  const tasksData = readJsonFile(tasksFile);
  tasksData.tasks = tasksData.tasks || [];
  const existingSources = new Set(tasksData.tasks.map((taskItem) => taskItem.source_reference).filter(Boolean));
  const targetStatuses = new Set(parseCsv(flags.statuses || "required,needs_follow_up"));
  const selected = matrix.areas.filter((area) => targetStatuses.has(area.status));
  const created = [];
  for (const area of selected) {
    const sourceReference = `coverage:${area.area_key}`;
    if (existingSources.has(sourceReference)) continue;
    const id = `task-${String(tasksData.tasks.length + 1).padStart(3, "0")}`;
    const isUiDecisionArea = UI_DECISION_AREA_KEYS.has(area.area_key);
    const uiDecisionTitleMap = {
      public_frontend: "Define public frontend UI direction",
      admin_frontend: "Define admin frontend UI direction",
      ui_ux_design: "Confirm UI/UX design direction",
      accessibility: "Confirm accessibility requirements",
      theme_branding: "Define theme, branding, and design tokens",
      dashboard_customization: "Define dashboard layout and density strategy",
      internal_operations_frontend: "Define internal operations UI direction"
    };
    const uiDecisionCriteria = [
      `The ${area.area} decision is documented in the questionnaire.`,
      "The frontend scope reflects the approved design source and experience pattern.",
      "Responsive priority and accessibility expectations are explicit.",
      "The task can be regenerated only if the coverage state changes."
    ];
    const taskItem = {
      id,
      title: isUiDecisionArea
        ? (uiDecisionTitleMap[area.area_key] || `${area.status === "needs_follow_up" ? "Clarify" : "Define"} ${area.area}`)
        : `${area.status === "needs_follow_up" ? "Clarify" : "Define"} ${area.area}`,
      status: "proposed",
      type: isUiDecisionArea
        ? "ui-decision-coverage"
        : area.status === "needs_follow_up" ? "questionnaire-follow-up" : "capability-coverage",
      workstream: mapAreaToWorkstream(area.area_key),
      workstreams: [mapAreaToWorkstream(area.area_key)],
      sprint_id: flags.sprint || null,
      source: "questionnaire_coverage",
      source_reference: sourceReference,
      source_mode: area.status === "needs_follow_up" ? "required" : "derived",
      provenance: {
        questionnaire_plan_id: latestPlan ? latestPlan.plan_id : null,
        module_plan_id: latestPlan && latestPlan.module_plan ? latestPlan.module_plan.module_plan_id : null,
        delivery_map_id: latestPlan && latestPlan.delivery_map ? latestPlan.delivery_map.delivery_map_id : null,
        delivery_mode: latestPlan && latestPlan.delivery_map ? latestPlan.delivery_map.active_mode : null,
        system_area_id: area.area_id,
        system_area_key: area.area_key,
        question_ids: (area.answers || []).map((answer) => answer.question_id),
        answer_ids: (area.answers || []).map((answer) => answer.answer_id),
        source_mode: area.status === "needs_follow_up" ? "required" : "derived",
        source_reason: area.reason,
        ui_decision_focus: isUiDecisionArea ? area.area_key : null
      },
      acceptance_criteria: isUiDecisionArea ? uiDecisionCriteria : [
        `${area.area} is answered, deferred, or marked not_applicable with a reason.`,
        "Coverage matrix is regenerated after the answer is recorded.",
        "Task provenance includes system area, question_id, answer_id, and source_mode when available."
      ],
      dependencies: synthesis.dependencies[area.area_key] || [],
      order_hint: synthesis.order_hints[area.area_key] || null,
      allowed_files: synthesis.allowed_files[area.area_key] || [],
      created_at: new Date().toISOString()
    };
    tasksData.tasks.push(taskItem);
    existingSources.add(sourceReference);
    created.push(taskItem);
  }
  writeJsonFile(tasksFile, tasksData);
  refreshDeveloperAppScorecardsIfNeeded();
  const appendAudit = deps.appendAudit || (() => {});
  for (const taskItem of created) {
    appendAudit("task.generated_from_questionnaire", "task", taskItem.id, `Generated from ${taskItem.source_reference}`);
  }
  console.log(`Generated ${created.length} questionnaire coverage tasks.`);
  return created;
}

function readLatestQuestionnairePlan() {
  const state = readQuestionnairePlanState();
  const plans = state.plans || [];
  if (!plans.length) return null;
  if (state.current_plan_id) {
    const current = plans.find((item) => item.plan_id === state.current_plan_id);
    if (current) return current;
  }
  return plans[plans.length - 1] || null;
}

function readQuestionnairePlanState() {
  if (!fileExists(".kabeeri/questionnaires/adaptive_intake_plan.json")) return { plans: [], current_plan_id: null };
  const state = readJsonFile(".kabeeri/questionnaires/adaptive_intake_plan.json");
  state.plans = Array.isArray(state.plans) ? state.plans : [];
  state.current_plan_id = state.current_plan_id || null;
  return state;
}

function updateQuestionnairePlanState(state, updatedPlan) {
  const plans = Array.isArray(state.plans) ? state.plans : [];
  const nextPlans = plans.map((item) => item.plan_id === updatedPlan.plan_id ? updatedPlan : item);
  if (!nextPlans.some((item) => item.plan_id === updatedPlan.plan_id)) {
    nextPlans.push(updatedPlan);
  }
  const nextState = {
    ...state,
    plans: nextPlans,
    current_plan_id: updatedPlan.plan_id
  };
  writeJsonFile(".kabeeri/questionnaires/adaptive_intake_plan.json", nextState);
  return nextState;
}

function refreshDeveloperAppScorecardsIfNeeded() {
  try {
    if (!fileExists(".kabeeri/project.json")) return null;
    const project = readJsonFile(".kabeeri/project.json");
    if (project.workspace_kind !== "developer_app") return null;
    return refreshAppScorecards(process.cwd());
  } catch (_) {
    return null;
  }
}

function buildQuestionnaireFlow() {
  return {
    version: "v5.0.0",
    start_here: "kvdf questionnaire flow",
    next_command: "kvdf questionnaire plan \"Describe the project in one sentence\"",
    flow: [
      "entry_questions",
      "project_type_detection",
      "system_area_activation",
      "grouped_questionnaires",
      "conditional_deep_questions",
      "coverage_review",
      "missing_answers_only",
      "generated_docs_tasks"
    ],
    states: ["required", "optional", "deferred", "not_applicable", "unknown", "needs_follow_up"],
    rule_keys: ["question_minimization", "progressive_expansion", "unknown_follow_up", "no_silent_skip", "traceability"],
    rules: [
      "Question Minimization",
      "Progressive Expansion",
      "Unknown Follow-up",
      "No Silent Skip",
      "Traceability"
    ],
    operator_notes: [
      "Start from the questionnaire flow before searching the repo tree.",
      "Use capability list for the machine-readable system area map.",
      "If an area is unknown, ask a short follow-up instead of scanning unrelated folders."
    ],
    entry_questions: getEntryQuestions()
  };
}

function getEntryQuestions() {
  return [
    { question_id: "entry.project_type", text: "What type of project is this?", choices: ["saas", "ecommerce", "booking", "content", "landing_page", "static_site", "internal_tool", "api", "mobile_app"] },
    { question_id: "entry.complexity", text: "How complex is the first release?", choices: ["small", "medium", "large", "unknown"] },
    { question_id: "entry.has_users", text: "Will people sign in?", choices: ["yes", "no", "unknown"] },
    { question_id: "entry.has_admin", text: "Does it need an admin panel?", choices: ["yes", "no", "unknown"] },
    { question_id: "entry.has_payments", text: "Are payments or billing required in V1?", choices: ["yes", "no", "later", "unknown"] },
    { question_id: "entry.has_multi_tenancy", text: "Will multiple companies/tenants use separated spaces?", choices: ["yes", "no", "later", "unknown"] },
    { question_id: "entry.has_public_frontend", text: "Does it have public pages?", choices: ["yes", "no", "unknown"] },
    { question_id: "entry.needs_integrations", text: "Does it integrate with external systems?", choices: ["yes", "no", "later", "unknown"] },
    { question_id: "entry.needs_ai_features", text: "Does the product itself include AI features?", choices: ["yes", "no", "later", "unknown"] }
  ];
}

function getCurrentBlueprintKey() {
  if (!fileExists(".kabeeri/product_blueprints.json")) return null;
  const state = readJsonFile(".kabeeri/product_blueprints.json");
  return state.current_blueprint;
}

function defaultResolveQuestionnaireGroups(profile, group) {
  if (group) {
    assertSafeName(group);
    if (!["core", "production", "extension"].includes(group)) throw new Error("Invalid questionnaire group. Use core, production, or extension.");
    return [group];
  }
  const profileGroups = {
    lite: ["core"],
    standard: ["core", "production"],
    enterprise: ["core", "production", "extension"]
  };
  const normalized = profile || "lite";
  assertSafeName(normalized);
  if (!profileGroups[normalized]) throw new Error("Invalid questionnaire profile. Use lite, standard, or enterprise.");
  return profileGroups[normalized];
}

function defaultCopyQuestionnaireFiles(files, output, force) {
  const fs = require("fs");
  const outputRoot = path.resolve(repoRoot(), output);
  for (const file of files) {
    const relative = file.replace(/^questionnaires\//, "");
    const target = path.join(outputRoot, relative);
    if (fs.existsSync(target) && !force) continue;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(resolveAsset(file), target);
  }
}

function defaultParseCsv(value) {
  if (Array.isArray(value)) return value.flatMap(defaultParseCsv);
  if (!value) return [];
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function defaultInferQuestionnaireBlueprint(description, flags = {}, deps = {}) {
  if (flags.blueprint) return flags.blueprint;
  const input = String(description || "").trim();
  if (!input) return null;
  const buildBlueprintRecommendation = deps.buildBlueprintRecommendation;
  const recommendation = buildBlueprintRecommendation ? buildBlueprintRecommendation(input, { limit: 1 }) : null;
  return recommendation && recommendation.matches[0] ? recommendation.matches[0].blueprint_key : null;
}

function defaultResolveOutputLanguage(flags = {}, text = "") {
  const detectLanguage = flags.detectLanguage || defaultDetectLanguage;
  if (flags.language) return String(flags.language).toLowerCase();
  return detectLanguage(text) || "en";
}

function defaultDetectLanguage(text) {
  const value = String(text || "");
  if (/[اأإآء-ي]/.test(value)) return "ar";
  return "en";
}

function defaultInferQuestionAreas(questionId) {
  const map = {
    "entry.project_type": ["product_business", "kabeeri_control_layer"],
    "entry.complexity": ["mvp_scope", "kabeeri_control_layer"],
    "entry.has_users": ["users_roles", "authentication", "authorization"],
    "entry.has_admin": ["admin_frontend", "admin_panel"],
    "entry.has_payments": ["payments_billing"],
    "entry.has_multi_tenancy": ["multi_tenancy", "tenant_admin_customization"],
    "entry.has_public_frontend": ["public_frontend", "seo", "accessibility"],
    "entry.needs_integrations": ["integrations"],
    "entry.needs_ai_features": ["ai_product_features"]
  };
  return map[questionId] || [];
}

function normalizeAnswerValue(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
}

function inferAnswerConfidence(value) {
  return ["unknown", "unsure", "not_sure", "maybe"].includes(normalizeAnswerValue(value)) ? "low" : "confirmed";
}

function activateSystemArea(area, answers, projectType, complexity) {
  const value = (questionId) => normalizeAnswerValue(answers[questionId] && answers[questionId].value);
  const yes = (questionId) => value(questionId) === "yes";
  const no = (questionId) => value(questionId) === "no";
  const later = (questionId) => ["later", "deferred", "future"].includes(value(questionId));
  const unknown = (questionId) => !value(questionId) || value(questionId) === "unknown";
  const requiredBase = new Set(["product_business", "mvp_scope", "documentation", "kabeeri_control_layer", "security", "testing_qa", "error_handling"]);
  const backendProjects = new Set(["saas", "ecommerce", "booking", "internal_tool", "api", "mobile_app"]);
  const publicProjects = new Set(["saas", "ecommerce", "booking", "content", "landing_page", "static_site"]);
  const commerceProjects = new Set(["ecommerce"]);

  if (requiredBase.has(area.key)) return { status: "required", reason: "Core Kabeeri project coverage area." };
  if (["backend_apis", "business_logic", "database"].includes(area.key) && backendProjects.has(projectType)) return { status: "required", reason: `${projectType} needs backend/data coverage.` };
  if (["public_frontend", "seo"].includes(area.key) && (publicProjects.has(projectType) || yes("entry.has_public_frontend"))) return { status: "required", reason: "Public pages exist." };
  if (["users_roles", "authentication", "authorization", "user_journeys", "onboarding"].includes(area.key)) {
    if (yes("entry.has_users") || ["saas", "ecommerce", "booking", "internal_tool", "mobile_app"].includes(projectType)) return { status: "required", reason: "Users need access and journeys." };
    if (unknown("entry.has_users")) return { status: "unknown", reason: "User access is not confirmed." };
    return { status: "not_applicable", reason: "No user sign-in in current scope." };
  }
  if (["admin_frontend", "admin_panel", "settings_system", "dashboard_customization"].includes(area.key)) {
    if (yes("entry.has_admin")) return { status: "required", reason: "Admin panel is required." };
    if (unknown("entry.has_admin")) return { status: "unknown", reason: "Admin need is not confirmed." };
    return { status: "not_applicable", reason: "No admin panel in current scope." };
  }
  if (area.key === "payments_billing") {
    if (yes("entry.has_payments") || commerceProjects.has(projectType)) return { status: "required", reason: "Payments or billing are in scope." };
    if (later("entry.has_payments")) return { status: "deferred", reason: "Payments are planned later." };
    if (unknown("entry.has_payments")) return { status: "unknown", reason: "Payments are not confirmed." };
    return { status: "not_applicable", reason: "Payments are not needed." };
  }
  if (["multi_tenancy", "tenant_admin_customization"].includes(area.key)) {
    if (yes("entry.has_multi_tenancy")) return { status: "required", reason: "Tenant separation is required." };
    if (later("entry.has_multi_tenancy")) return { status: "deferred", reason: "Multi-tenancy is planned later." };
    if (unknown("entry.has_multi_tenancy") && projectType === "saas") return { status: "unknown", reason: "SaaS tenancy model needs confirmation." };
    return { status: "not_applicable", reason: "Single organization/project scope." };
  }
  if (area.key === "integrations") {
    if (yes("entry.needs_integrations")) return { status: "required", reason: "External integrations are needed." };
    if (later("entry.needs_integrations")) return { status: "deferred", reason: "Integrations are planned later." };
    if (unknown("entry.needs_integrations")) return { status: "unknown", reason: "Integration need is not confirmed." };
  }
  if (area.key === "ai_product_features") {
    if (yes("entry.needs_ai_features")) return { status: "required", reason: "AI product features are in scope." };
    if (later("entry.needs_ai_features")) return { status: "deferred", reason: "AI features are planned later." };
    if (unknown("entry.needs_ai_features")) return { status: "unknown", reason: "AI product feature need is not confirmed." };
  }
  if (["monitoring", "backup_recovery", "deployment", "production_publish", "performance", "audit_logs", "legal_compliance", "data_governance"].includes(area.key)) {
    if (complexity === "large" || ["saas", "ecommerce", "booking"].includes(projectType)) return { status: "required", reason: "Operational readiness is important for this project type." };
    return { status: "optional", reason: "Useful for production hardening." };
  }
  if (no("entry.has_public_frontend") && ["seo", "accessibility", "public_frontend"].includes(area.key)) return { status: "not_applicable", reason: "No public frontend." };
  return { status: "optional", reason: "Useful capability, not confirmed for V1." };
}

function getCoverageAction(status, area) {
  const actions = {
    required: `Ask ${area.question_group} questions and generate tasks if unanswered.`,
    optional: "Keep available without blocking V1.",
    deferred: "Add to future roadmap and prevent accidental implementation now.",
    not_applicable: "No tasks required.",
    unknown: "Ask entry or follow-up questions before skipping.",
    needs_follow_up: "Ask small helper questions and resolve contradictions."
  };
  return actions[status] || "Review manually.";
}

function summarizeBy(items, key) {
  const summary = {};
  for (const item of items || []) summary[item[key]] = (summary[item[key]] || 0) + 1;
  return summary;
}

function uniqueList(items) {
  return Array.from(new Set((items || []).filter(Boolean)));
}

function slugifyModuleKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleizeModuleKey(value) {
  return String(value || "")
    .split(/[_\-\s]+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function inferModuleBoundary(moduleKey, blueprint, dataContext, uiContext) {
  const boundaryMap = {
    catalog: "Owns product discovery, listing, browsing, and product detail presentation.",
    cart: "Owns cart state, item edits, and pre-checkout calculations.",
    checkout: "Owns checkout flow, address capture, review, and order submission.",
    orders: "Owns order lifecycle, status transitions, and customer order history.",
    payments: "Owns payment intent, provider handoff, payment status, and reconciliation hooks.",
    shipping: "Owns shipping methods, delivery estimation, shipment status, and tracking hooks.",
    coupons: "Owns discount rules, coupon eligibility, redemption, and campaign linkage.",
    reviews: "Owns ratings, reviews, moderation, and product feedback presentation.",
    customers: "Owns customer profile data, addresses, loyalty tie-ins, and account surfaces.",
    services: "Owns service catalog definitions, scheduling input, and service availability rules.",
    staff: "Owns staff records, assignments, and staff-facing schedules.",
    availability: "Owns time slots, availability rules, blackout periods, and booking windows.",
    appointments: "Owns appointment lifecycle, booking creation, rescheduling, and cancellation state.",
    reminders: "Owns reminders, notifications, and follow-up timing for booked items.",
    cancellation_policy: "Owns cancellation windows, fees, reschedule rules, and approval constraints."
  };
  if (boundaryMap[moduleKey]) return boundaryMap[moduleKey];
  const display = titleizeModuleKey(moduleKey);
  const pages = (uiContext.page_templates || []).slice(0, 4).join(", ");
  const entities = (dataContext.entities || []).slice(0, 6).join(", ");
  return `Owns the ${display.toLowerCase()} scope, including related entities (${entities || "n/a"}) and UI surfaces (${pages || "n/a"}).`;
}

function inferModuleScope(moduleKey, blueprint, pages = []) {
  const scope = new Set(["backend"]);
  const frontendPages = new Set(blueprint.frontend_pages || []);
  if (["catalog", "cart", "checkout", "orders", "payments", "shipping", "coupons", "reviews", "customers", "services", "staff", "availability", "appointments", "reminders"].includes(moduleKey)) {
    if (pages.some((page) => frontendPages.has(page))) scope.add("public_frontend");
    if ((blueprint.channels || []).some((channel) => String(channel).includes("admin"))) scope.add("admin_frontend");
  }
  if (["customers", "orders", "payments", "appointments"].includes(moduleKey)) scope.add("database");
  return Array.from(scope);
}

function inferModuleOwnerSurface(moduleKey, blueprint, uiContext) {
  if ((uiContext.experience_pattern || "").includes("admin") || (blueprint.channels || []).some((channel) => String(channel).includes("admin"))) return "admin";
  if ((blueprint.channels || []).some((channel) => String(channel).includes("customer"))) return "customer";
  return "shared";
}

function inferModuleEntities(moduleKey, dataEntities = [], blueprintEntities = []) {
  const combined = uniqueList([...dataEntities, ...blueprintEntities]);
  const keywords = String(moduleKey || "").split(/[_\-\s]+/g).filter(Boolean);
  if (!keywords.length) return [];
  return combined.filter((entity) => keywords.some((keyword) => String(entity).toLowerCase().includes(keyword.toLowerCase())));
}

function inferModulePages(moduleKey, uiPages = [], blueprintPages = []) {
  const combined = uniqueList([...uiPages, ...blueprintPages]);
  const modulePageMap = {
    catalog: ["home", "category", "product_details"],
    cart: ["cart"],
    checkout: ["checkout"],
    orders: ["order_tracking", "customer_account", "admin_orders"],
    payments: ["checkout", "admin_orders"],
    shipping: ["order_tracking", "admin_orders"],
    coupons: ["checkout", "admin_products"],
    reviews: ["product_details"],
    customers: ["customer_account"],
    services: ["service_list", "admin_calendar"],
    staff: ["admin_calendar", "staff_schedule"],
    availability: ["booking_calendar", "time_slots"],
    appointments: ["booking_calendar", "appointment_details", "customer_bookings"],
    reminders: ["customer_bookings", "appointment_details"],
    cancellation_policy: ["appointment_details", "customer_bookings"]
  };
  const desired = modulePageMap[moduleKey] || [];
  return combined.filter((page) => desired.includes(page));
}

function inferModuleDependencies(moduleKey, blueprintModules = [], dataModules = []) {
  const dataSet = new Set(dataModules);
  const depsMap = {
    catalog: ["core"],
    cart: ["core", "catalog"],
    checkout: ["core", "cart", "catalog"],
    orders: ["core", "cart", "checkout"],
    payments: ["core", "checkout", "orders"],
    shipping: ["core", "orders", "payments"],
    coupons: ["core", "catalog", "checkout"],
    reviews: ["core", "customers", "catalog"],
    customers: ["core"],
    services: ["core"],
    staff: ["core", "services"],
    availability: ["core", "staff", "services"],
    appointments: ["core", "services", "availability", "customers"],
    reminders: ["core", "appointments", "customers"],
    cancellation_policy: ["core", "appointments"]
  };
  return uniqueList([...(depsMap[moduleKey] || []), ...(blueprintModules.includes(moduleKey) ? [] : []), ...(dataSet.has("core") ? [] : ["core"])]);
}

function inferModuleImplementationNotes(moduleKey, blueprint, dataContext, uiContext, delivery, frameworks, flags) {
  const notes = [];
  if ((frameworks.selected_packs || []).length) notes.push(`Framework packs: ${(frameworks.selected_packs || []).slice(0, 4).join(", ")}`);
  if ((delivery.recommended_mode || "").toLowerCase() === "structured") notes.push("Treat this module as a phase-gated build slice.");
  else notes.push("Treat this module as a short iterative batch slice.");
  if (uiContext.experience_pattern) notes.push(`UI pattern: ${uiContext.experience_pattern}`);
  if (flags.enterprise || /enterprise|compliance|audit/i.test(String(blueprint.name || ""))) notes.push("Preserve traceability and approval boundaries.");
  return uniqueList(notes);
}

function inferBackboneBoundary(moduleKey) {
  const map = {
    core: "Owns identity, authorization, settings, audit, and platform controls.",
    commerce: "Owns commerce-wide money, pricing, order lifecycle, and checkout rules.",
    inventory: "Owns stock movement, balance snapshots, reservations, and warehouse controls.",
    analytics: "Owns summary tables, dashboards, exports, and reporting read models.",
    integration: "Owns external provider bridges, webhooks, outbox events, and idempotency."
  };
  return map[moduleKey] || `Owns the ${titleizeModuleKey(moduleKey)} backbone module.`;
}

function inferBackboneDependencies(moduleKey, dataModules = []) {
  const depsMap = {
    commerce: ["core"],
    inventory: ["core", "commerce"],
    analytics: ["core", "commerce", "inventory"],
    integration: ["core"]
  };
  return uniqueList(depsMap[moduleKey] || ["core"]);
}

function entityMatchesModule(entity, moduleKey) {
  const key = String(moduleKey || "").toLowerCase();
  const value = String(entity || "").toLowerCase();
  return value.includes(key) || (key === "commerce" && ["products", "orders", "payments", "customers", "carts", "shipments", "coupons", "reviews"].some((fragment) => value.includes(fragment)));
}

function indexMatchesModule(indexName, moduleKey) {
  const key = String(moduleKey || "").toLowerCase();
  const value = String(indexName || "").toLowerCase();
  return value.includes(key);
}

function ruleMatchesModule(rule, moduleKey) {
  const key = String(moduleKey || "").toLowerCase();
  const value = String(rule || "").toLowerCase();
  return value.includes(key);
}

function normalizeDeliveryModeLabel(mode) {
  const normalized = String(mode || "").toLowerCase();
  if (["structured", "waterfall"].includes(normalized)) return "structured";
  if (["agile", "scrum"].includes(normalized)) return "agile";
  return "structured";
}

function buildDeliveryModuleBatches(activeMode, moduleKeys, implementationModules, backboneModules) {
  const sliceModules = (keys) => keys.map((key) => {
    const implementation = implementationModules.find((item) => item.module_key === key);
    const backbone = backboneModules.find((item) => item.module_key === key);
    return implementation || backbone || { module_key: key, title: titleizeModuleKey(key) };
  });
  const keys = moduleKeys.length ? moduleKeys : ["core"];
  if (activeMode === "agile") {
    return keys.slice(0, 6).map((key, index) => ({
      batch_id: `sprint-batch-${String(index + 1).padStart(2, "0")}`,
      title: `${titleizeModuleKey(key)} sprint batch`,
      modules: sliceModules([key]).map((item) => item.module_key),
      purpose: "Iterate on one small implementation slice."
    }));
  }
  const phaseSize = Math.max(1, Math.ceil(keys.length / 4));
  const batches = [];
  for (let index = 0; index < keys.length; index += phaseSize) {
    const chunk = keys.slice(index, index + phaseSize);
    batches.push({
      batch_id: `phase-batch-${String(batches.length + 1).padStart(2, "0")}`,
      title: `Phase batch ${batches.length + 1}`,
      modules: sliceModules(chunk).map((item) => item.module_key),
      purpose: "Deliver a gated phase slice."
    });
  }
  return batches;
}

function buildStructuredDeliveryPhases(modulePlan, dataContext, uiContext) {
  const modules = modulePlan.implementation_modules || [];
  const phases = [
    {
      phase_id: "phase-01-foundation",
      title: "Foundation",
      modules: modules.filter((module) => module.module_key === "catalog" || module.module_key === "services" || module.module_key === "core").map((module) => module.module_key)
    },
    {
      phase_id: "phase-02-transactions",
      title: "Transactions",
      modules: modules.filter((module) => ["cart", "checkout", "orders", "payments", "appointments"].includes(module.module_key)).map((module) => module.module_key)
    },
    {
      phase_id: "phase-03-operations",
      title: "Operations",
      modules: modules.filter((module) => ["shipping", "staff", "availability", "customers", "coupons", "reviews", "reminders", "cancellation_policy"].includes(module.module_key)).map((module) => module.module_key)
    },
    {
      phase_id: "phase-04-hardening",
      title: "Hardening",
      modules: uniqueList([...(modulePlan.backbone_modules || []).map((item) => item.module_key), "analytics", "integration"]).filter((key) => modules.some((module) => module.module_key === key) || ["analytics", "integration"].includes(key))
    }
  ];
  return phases.map((phase) => ({
    ...phase,
    checks: [
      "Source brief exists.",
      "Module boundaries are explicit.",
      "Tasks can be generated from this phase without rereading raw chat."
    ]
  }));
}

function buildAgileDeliverySprints(modulePlan, dataContext, uiContext) {
  const modules = modulePlan.implementation_modules || [];
  const sprints = [];
  const batchSize = Math.max(1, Math.ceil(modules.length / 4));
  for (let index = 0; index < modules.length; index += batchSize) {
    const chunk = modules.slice(index, index + batchSize);
    sprints.push({
      sprint_id: `sprint-${String(sprints.length + 1).padStart(2, "0")}`,
      title: `Sprint ${sprints.length + 1}`,
      modules: chunk.map((module) => module.module_key),
      goal: `Deliver ${chunk.map((module) => module.title).join(", ")}`,
      checks: [
        "Module boundaries remain explicit.",
        "Review output can feed task generation.",
        "No raw chat context is needed to explain the sprint scope."
      ]
    });
  }
  return sprints;
}

module.exports = {
  questionnaire,
  questionnaireAnswer,
  questionnaireIntakePlan,
  questionnaireReviewPlan,
  questionnaireApprovePlan,
  buildQuestionnaireIntakePlan,
  buildQuestionnaireFlow,
  buildCoverageMatrix,
  buildMissingAnswersReport,
  writeQuestionnaireReports,
  generateTasksFromCoverage,
  resolveQuestionnaireGroups: defaultResolveQuestionnaireGroups,
  copyQuestionnaireFiles: defaultCopyQuestionnaireFiles,
  renderQuestionnaireIntakePlan,
  buildQuestionnaireFrameworkContext: defaultBuildQuestionnaireFrameworkContext,
  buildAdaptiveIntakeQuestions: defaultBuildAdaptiveIntakeQuestions,
  getEntryQuestions,
  inferQuestionnaireBlueprint: defaultInferQuestionnaireBlueprint,
  resolveOutputLanguage: defaultResolveOutputLanguage,
  detectLanguage: defaultDetectLanguage,
  inferQuestionAreas: defaultInferQuestionAreas,
  normalizeAnswerValue,
  inferAnswerConfidence,
  activateSystemArea,
  getCoverageAction
};
