const path = require("path");
const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { fileExists, repoRoot, resolveAsset, assertSafeName, readTextFile } = require("../fs_utils");
const { table } = require("../ui");
const { getSuggestedQuestionsForArea, mapAreaToWorkstream, getSystemAreas } = require("../commands/capability");
const { getPromptPackCatalog, recommendFrameworkPacksForBlueprint } = require("./prompt_pack");

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
  const buildQuestionnaireFlowFn = deps.buildQuestionnaireFlow || buildQuestionnaireFlow;
  const buildQuestionnaireFrameworkContextFn = deps.buildQuestionnaireFrameworkContext || defaultBuildQuestionnaireFrameworkContext;
  const buildQuestionnaireIntakePlanFn = deps.buildQuestionnaireIntakePlan || defaultBuildQuestionnaireIntakePlan;
  const plan = buildQuestionnaireIntakePlanFn(description || blueprintKey, blueprintKey, { ...flags, parseCsv }, {
    buildQuestionnaireFrameworkContext: buildQuestionnaireFrameworkContextFn,
    buildQuestionnaireFlow: buildQuestionnaireFlowFn,
    ...deps
  });
  const file = ".kabeeri/questionnaires/adaptive_intake_plan.json";
  if (!fileExists(file)) writeJsonFile(file, { plans: [], current_plan_id: null });
  const state = readJsonFile(file);
  state.plans = state.plans || [];
  state.plans.push(plan);
  state.current_plan_id = plan.plan_id;
  writeJsonFile(file, state);
  const appendAudit = deps.appendAudit || (() => {});
  appendAudit("questionnaire.intake_plan_created", "questionnaire", plan.plan_id, `Questionnaire intake plan created for ${blueprintKey}`);
  if (!flags.silent) {
    if (flags.json) console.log(JSON.stringify(plan, null, 2));
    else renderQuestionnaireIntakePlan(plan);
  }
  return plan;
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
    ["Framework packs", plan.framework_context.selected_packs.join(", ") || "needs decision"],
    ["Prompt pack picks", (plan.prompt_pack_guidance.selected_packs || []).join(", ") || "needs decision"],
    ["Data modules", plan.data_design_context.modules.join(", ")],
    ["UI pattern", plan.ui_ux_context.experience_pattern],
    ["Questions", plan.generated_questions.length]
  ]));
  console.log("");
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
      created_at: new Date().toISOString()
    };
    tasksData.tasks.push(taskItem);
    existingSources.add(sourceReference);
    created.push(taskItem);
  }
  writeJsonFile(tasksFile, tasksData);
  const appendAudit = deps.appendAudit || (() => {});
  for (const taskItem of created) {
    appendAudit("task.generated_from_questionnaire", "task", taskItem.id, `Generated from ${taskItem.source_reference}`);
  }
  console.log(`Generated ${created.length} questionnaire coverage tasks.`);
  return created;
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

module.exports = {
  questionnaire,
  questionnaireAnswer,
  questionnaireIntakePlan,
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
