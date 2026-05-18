const fs = require("fs");
const path = require("path");

const DEFAULT_VALIDATION_COMMANDS = ["node bin/kvdf.js validate", "npm test", "npm run check"];
const PLANNER_STATE_FILE = ".kabeeri/planner.json";
const PLANNER_STATUSES = new Set(["proposed", "approved", "rejected", "completed"]);

const MODE_ALIASES = {
  owner: "owner",
  framework_owner: "owner",
  kvdf: "owner",
  vibe: "vibe",
  app: "vibe",
  app_developer: "vibe",
  vibe_app_developer: "vibe",
  plugin: "plugin",
  plugins: "plugin"
};

const OWNER_ALLOWED_FILES = [
  "knowledge/governance/KVDF_PLANNER_LAYER.md",
  "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md",
  "packs/planner/evolution-planner.prompt.md",
  "packs/planner/codex-execution.prompt.md",
  "schemas/planner/evolution-plan.schema.json",
  "schemas/planner/task-punch.schema.json",
  "src/cli/commands/planner.js",
  "src/cli/dispatchers/build.js",
  "src/cli/index.js",
  "src/cli/ui.js",
  "src/cli/validate.js",
  "tests/cli.integration.test.js",
  "docs/cli/CLI_COMMAND_REFERENCE.md",
  "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
  "docs/reports/*"
];

const OWNER_FORBIDDEN_FILES = [
  "KVDOS/",
  ".kabeeri/",
  "workspaces/apps/",
  "plugins/*/runtime/",
  "plugins/*/plugin.json",
  "plugins/*/docs/",
  "docs/site/pages/ar/",
  "docs/site/pages/en/vibe-developer.html"
];

const OWNER_OUT_OF_SCOPE = [
  "KVDOS files or workspace content",
  "runtime state under .kabeeri/",
  "branch/PR as the default KVDF Core delivery path",
  "plugin runtime behavior",
  "app builder behavior",
  "dashboard behavior",
  "evolution execution behavior outside the planner layer MVP"
];

const VIBE_ALLOWED_FILES = [
  "workspaces/apps/<app-slug>/",
  ".kabeeri/questionnaires/",
  ".kabeeri/interactions/",
  ".kabeeri/reports/",
  "knowledge/vibe_ux/",
  "docs/workflows/KVDF_LED_DELIVERY.md",
  "docs/workflows/PR_HANDOFF_TEMPLATE.md",
  "docs/site/pages/en/vibe-developer.html",
  "docs/site/pages/ar/vibe-developer.html",
  "docs/cli/CLI_COMMAND_REFERENCE.md",
  "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
  "tests/cli.integration.test.js"
];

const VIBE_FORBIDDEN_FILES = [
  "KVDOS/",
  "src/cli/commands/planner.js",
  "src/cli/commands/evolution.js",
  "src/cli/commands/dashboard.js",
  "src/cli/commands/dashboard_site.js",
  "src/cli/commands/dashboard_state.js",
  "knowledge/governance/",
  "plugins/*/runtime/",
  "plugins/*/plugin.json",
  ".kabeeri/plugin-links/",
  "docs/reports/"
];

const VIBE_OUT_OF_SCOPE = [
  "KVDF Core edits by default",
  "unrelated products or workspaces",
  "branch/PR as the default path",
  "plugin runtime behavior",
  "dashboard ownership mixing",
  "runtime state writes outside the app-first flow"
];

const VIBE_PIPELINE = [
  "request",
  "questions",
  "answers",
  "intake_plan",
  "review",
  "approve",
  "evolution",
  "task_slicing",
  "implementation",
  "verify",
  "handoff"
];

const PLUGIN_ALLOWED_FILES_GENERIC = [
  "plugins/<plugin-id>/plugin.json",
  "plugins/<plugin-id>/README.md",
  "plugins/<plugin-id>/docs/",
  "plugins/<plugin-id>/runtime/",
  "plugins/<plugin-id>/tests/",
  "plugins/<plugin-id>/schemas/",
  "src/cli/commands/plugin.js",
  "src/cli/services/plugin_loader.js",
  "src/cli/services/plugin_mounts.js",
  "docs/cli/CLI_COMMAND_REFERENCE.md",
  "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
  "knowledge/governance/KVDF_PLANNER_LAYER.md",
  "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md"
];

const PLUGIN_FORBIDDEN_FILES = [
  "KVDOS/",
  ".kabeeri/plugin-links/",
  ".kabeeri/",
  "workspaces/apps/",
  "plugins/*/runtime/",
  "plugins/*/plugin.json",
  "docs/reports/"
];

const PLUGIN_OUT_OF_SCOPE = [
  "unrelated plugin bundles",
  "KVDOS files or workspace content",
  "runtime mount state under .kabeeri/plugin-links/",
  "branch/PR as the default path",
  "app-builder behavior",
  "dashboard ownership mixing"
];

function planner(action, value, flags = {}, rest = [], deps = {}) {
  const mode = normalizePlannerAction(action);
  if (!["next", "status", "show", "plan", "prompt", "evolution", "task-punch", "visual", "propose", "approve", "current", "reject", "complete", "materialize"].includes(mode)) {
    throw new Error(`Unknown planner action: ${action}`);
  }

  const request = resolvePlannerRequest({ action: mode, value, flags, rest }, deps);

  if (mode === "propose") {
    const goal = resolveGoal(value, flags, rest, request.recommended_evolution.title);
    if (!goal) throw new Error("Missing goal for planner propose.");
    const report = buildPlannerProposalReport(goal, request, deps);
    printPlannerOutput(report, flags, deps, "propose");
    return;
  }

  if (mode === "approve") {
    const planId = resolvePlanId(value, flags, rest);
    if (!planId) throw new Error("Missing plan id for planner approve.");
    const report = approvePlannerPlan(planId, resolveApprovalOwner(flags), deps);
    printPlannerOutput(report, flags, deps, "approve");
    return;
  }

  if (mode === "current") {
    const report = buildPlannerCurrentReport(deps);
    printPlannerOutput(report, flags, deps, "current");
    return;
  }

  if (mode === "reject") {
    const planId = resolvePlanId(value, flags, rest);
    if (!planId) throw new Error("Missing plan id for planner reject.");
    const report = rejectPlannerPlan(planId, resolveRejectReason(flags, rest), flags, deps);
    printPlannerOutput(report, flags, deps, "reject");
    return;
  }

  if (mode === "complete") {
    const planId = resolvePlanId(value, flags, rest);
    if (!planId) throw new Error("Missing plan id for planner complete.");
    const report = completePlannerPlan(planId, resolveCompleteNote(flags, rest), deps);
    printPlannerOutput(report, flags, deps, "complete");
    return;
  }

  if (mode === "materialize") {
    const planId = isFromCurrentPlan(flags) ? null : resolvePlanId(value, flags, rest);
    const report = materializePlannerPlan(planId, flags, deps);
    printPlannerOutput(report, flags, deps, "materialize");
    return;
  }

  if (mode === "prompt") {
    if (isFromCurrentPlan(flags)) {
      const report = buildPlannerPromptFromCurrentPlan(request, deps);
      printPlannerOutput(report, flags, deps, "prompt");
      return;
    }
    const goal = resolveGoal(value, flags, rest, request.recommended_evolution.title);
    if (!goal) throw new Error("Missing goal for planner prompt.");
    const report = buildPlannerPromptReport(goal, request, deps);
    printPlannerOutput(report, flags, deps, "prompt");
    return;
  }

  if (mode === "evolution") {
    const goal = resolveGoal(value, flags, rest, request.recommended_evolution.title);
    if (!goal) throw new Error("Missing goal for planner evolution.");
    const report = buildPlannerEvolutionReport(goal, request, deps);
    printPlannerOutput(report, flags, deps, "evolution");
    return;
  }

  if (mode === "task-punch") {
    const goal = resolveGoal(value, flags, rest, request.recommended_evolution.title);
    if (!goal) throw new Error("Missing goal for planner task punch.");
    const report = buildPlannerTaskPunchReport(goal, request, deps);
    printPlannerOutput(report, flags, deps, "task-punch");
    return;
  }

  if (mode === "visual") {
    if (isFromCurrentPlan(flags)) {
      const report = buildPlannerVisualFromCurrentReport(request, deps);
      printPlannerOutput(report, flags, deps, "visual");
      return;
    }
    const goal = resolveGoal(value, flags, rest, request.recommended_evolution.title);
    if (!goal) throw new Error("Missing goal for planner visual.");
    const report = buildPlannerVisualReport(goal, request, deps);
    printPlannerOutput(report, flags, deps, "visual");
    return;
  }

  const report = buildPlannerNextReport(request, deps);
  printPlannerOutput(report, flags, deps, "next");
}

function buildPlannerNextReport(request = {}, deps = {}) {
  const context = buildPlannerContext(deps);
  const mode = resolvePlannerMode(request, context);
  const deliveryMode = getDeliveryMode(mode);
  const pluginContext = mode === "plugin" ? buildPluginContext(request, context) : null;
  const recommendedEvolution = recommendNextEvolution(mode, context, pluginContext, request);
  const plan = buildPlannerEvolutionPlan(recommendedEvolution.title, { ...request, mode, deliveryMode, pluginContext, recommendedEvolution }, context);
  const taskPunch = buildPlannerTaskPunch(plan, { ...request, mode, deliveryMode, pluginContext }, context);
  const report = {
    report_type: "kvdf_planner_next",
    generated_at: new Date().toISOString(),
    planner_mode: mode,
    track: plan.track,
    delivery_mode: deliveryMode,
    recommended_evolution: recommendedEvolution,
    allowed_files: plan.allowed_files,
    forbidden_files: plan.forbidden_files,
    out_of_scope: plan.out_of_scope,
    validation_commands: plan.validation_commands,
    stop_condition: plan.stop_condition,
    task_punch: taskPunch,
    next_action: getPlannerNextAction(mode, plan.title, pluginContext),
    source: context.source
  };
  if (mode === "vibe") report.pipeline = [...VIBE_PIPELINE];
  if (mode === "plugin") report.plugin_context = pluginContext;
  return report;
}

function buildPlannerPromptReport(goal, request = {}, deps = {}) {
  const context = buildPlannerContext(deps);
  const mode = resolvePlannerMode(request, context);
  const deliveryMode = getDeliveryMode(mode);
  const pluginContext = mode === "plugin" ? buildPluginContext(request, context) : null;
  const plan = buildPlannerEvolutionPlan(goal, { ...request, mode, deliveryMode, pluginContext }, context);
  const taskPunch = buildPlannerTaskPunch(plan, { ...request, mode, deliveryMode, pluginContext }, context);
  return {
    report_type: "kvdf_planner_codex_prompt",
    generated_at: new Date().toISOString(),
    planner_mode: mode,
    track: plan.track,
    delivery_mode: deliveryMode,
    goal,
    allowed_files: plan.allowed_files,
    forbidden_files: plan.forbidden_files,
    validation_commands: plan.validation_commands,
    stop_condition: plan.stop_condition,
    task_punch: taskPunch,
    prompt: renderCodexPrompt({ goal, mode, plan, taskPunch, context, pluginContext })
  };
}

function buildPlannerEvolutionReport(goal, request = {}, deps = {}) {
  const context = buildPlannerContext(deps);
  const mode = resolvePlannerMode(request, context);
  const deliveryMode = getDeliveryMode(mode);
  const pluginContext = mode === "plugin" ? buildPluginContext(request, context) : null;
  const plan = buildPlannerEvolutionPlan(goal, { ...request, mode, deliveryMode, pluginContext }, context);
  const taskPunch = buildPlannerTaskPunch(plan, { ...request, mode, deliveryMode, pluginContext }, context);
  return {
    report_type: "kvdf_planner_evolution_plan",
    generated_at: new Date().toISOString(),
    planner_mode: mode,
    track: plan.track,
    delivery_mode: deliveryMode,
    goal,
    evolution_plan: plan,
    task_punch: taskPunch,
    prompt: renderCodexPrompt({ goal, mode, plan, taskPunch, context, pluginContext })
  };
}

function buildPlannerTaskPunchReport(goal, request = {}, deps = {}) {
  const context = buildPlannerContext(deps);
  const mode = resolvePlannerMode(request, context);
  const deliveryMode = getDeliveryMode(mode);
  const pluginContext = mode === "plugin" ? buildPluginContext(request, context) : null;
  const plan = buildPlannerEvolutionPlan(goal, { ...request, mode, deliveryMode, pluginContext }, context);
  const taskPunch = buildPlannerTaskPunch(plan, { ...request, mode, deliveryMode, pluginContext }, context);
  return {
    report_type: "kvdf_task_punch",
    generated_at: new Date().toISOString(),
    planner_mode: mode,
    track: plan.track,
    delivery_mode: deliveryMode,
    evolution_id: plan.evolution_id,
    title: `${plan.title} Task Punch`,
    tasks: taskPunch.tasks,
    plugin_context: pluginContext || undefined
  };
}

function buildPlannerVisualReport(goal, request = {}, deps = {}) {
  const context = buildPlannerContext(deps);
  const mode = resolvePlannerMode(request, context);
  const deliveryMode = getDeliveryMode(mode);
  const pluginContext = mode === "plugin" ? buildPluginContext(request, context) : null;
  const evolutionPlan = buildPlannerEvolutionPlan(goal, { ...request, mode, deliveryMode, pluginContext }, context);
  const taskPunch = buildPlannerTaskPunch(evolutionPlan, { ...request, mode, deliveryMode, pluginContext }, context);
  return buildPlannerVisualPayload({
    goal,
    mode,
    deliveryMode,
    evolutionPlan,
    taskPunch,
    context,
    pluginContext
  });
}

function buildPlannerVisualFromCurrentReport(request = {}, deps = {}) {
  const context = buildPlannerContext(deps);
  const state = loadPlannerState(context.repo_root);
  const currentPlan = findCurrentPlannerPlan(state);
  if (!currentPlan) {
    throw new Error("No approved current planner plan exists. Run kvdf planner propose --goal \"...\" --track owner, vibe, or plugin --json first.");
  }
  const goal = currentPlan.goal || (currentPlan.recommended_evolution && currentPlan.recommended_evolution.title) || "Approved planner plan";
  const mode = normalizePlannerMode(currentPlan.planner_mode);
  const deliveryMode = currentPlan.delivery_mode || getDeliveryMode(mode);
  const pluginContext = mode === "plugin"
    ? (currentPlan.plugin_context || buildPluginContext({ plugin_id: currentPlan.recommended_evolution && currentPlan.recommended_evolution.plugin_context && currentPlan.recommended_evolution.plugin_context.plugin_id }, context))
    : null;
  const evolutionPlan = currentPlan.recommended_evolution && Object.keys(currentPlan.recommended_evolution).length
    ? currentPlan.recommended_evolution
    : buildPlannerEvolutionPlan(goal, { mode, deliveryMode, pluginContext }, context);
  const taskPunch = currentPlan.task_punch && Array.isArray(currentPlan.task_punch.tasks) && currentPlan.task_punch.tasks.length
    ? currentPlan.task_punch
    : buildPlannerTaskPunch(evolutionPlan, { mode, deliveryMode, pluginContext }, context);
  if (currentPlan.visual && currentPlan.visual.report_type === "kvdf_planner_visual") {
    return currentPlan.visual;
  }
  return buildPlannerVisualPayload({
    goal,
    mode,
    deliveryMode,
    evolutionPlan,
    taskPunch,
    context,
    pluginContext,
    currentPlan
  });
}

function buildPlannerVisualPayload({ goal, mode, deliveryMode, evolutionPlan, taskPunch, context, pluginContext, currentPlan = null }) {
  const graph = buildPlannerVisualGraph({ mode });
  const board = buildPlannerVisualBoard({ mode, evolutionPlan, taskPunch, currentPlan });
  const scopeMap = buildPlannerVisualScopeMap({ mode, evolutionPlan, taskPunch, pluginContext });
  const validationCommands = [...(evolutionPlan.validation_commands || DEFAULT_VALIDATION_COMMANDS)];
  const stopCondition = evolutionPlan.stop_condition || buildPlannerStopCondition(mode, context, pluginContext);
  const markdownReport = buildPlannerVisualMarkdown({
    goal,
    mode,
    deliveryMode,
    evolutionPlan,
    graph,
    board,
    scopeMap,
    validationCommands,
    stopCondition
  });
  const report = {
    report_type: "kvdf_planner_visual",
    generated_at: new Date().toISOString(),
    planner_mode: mode,
    track: evolutionPlan.track,
    delivery_mode: deliveryMode,
    goal,
    graph,
    board,
    scope_map: scopeMap,
    legend: buildPlannerVisualLegend(),
    markdown_report: markdownReport,
    validation_commands: validationCommands,
    stop_condition: stopCondition,
    recommended_evolution: evolutionPlan,
    task_punch: taskPunch
  };
  if (pluginContext) report.plugin_context = pluginContext;
  return report;
}

function buildPlannerVisualGraph({ mode }) {
  if (mode === "vibe") {
    return {
      format: "mermaid",
      diagram: [
        "flowchart TD",
        "  Request[Request] --> Questions[Questions]",
        "  Questions --> Answers[Answers]",
        "  Answers --> IntakePlan[Intake Plan]",
        "  IntakePlan --> Review[Review]",
        "  Review --> Approval[Approval]",
        "  Approval --> Evolution[Evolution]",
        "  Evolution --> TaskSlicing[Task Slicing]",
        "  TaskSlicing --> Implementation[Implementation]",
        "  Implementation --> Verify[Verify]",
        "  Verify --> Handoff[Handoff]"
      ].join("\n")
    };
  }
  if (mode === "plugin") {
    return {
      format: "mermaid",
      diagram: [
        "flowchart TD",
        "  PluginGoal[Plugin Goal] --> ManifestReview[Manifest Review]",
        "  ManifestReview --> RuntimeEntrypoint[Runtime Entrypoint]",
        "  RuntimeEntrypoint --> Docs[Docs]",
        "  Docs --> Schemas[Schemas]",
        "  Schemas --> Tests[Tests]",
        "  Tests --> InstallUninstall[Install/Uninstall Check]",
        "  InstallUninstall --> Validation[Validation]"
      ].join("\n")
    };
  }
  return {
    format: "mermaid",
    diagram: [
      "flowchart TD",
      "  OwnerDirection[Owner Direction] --> PlannerProposal[Planner Proposal]",
      "  PlannerProposal --> OwnerApproval[Owner Approval]",
      "  OwnerApproval --> Evolution[Evolution]",
      "  Evolution --> TaskPunch[Task Punch]",
      "  TaskPunch --> CodexPrompt[Codex Prompt]",
      "  CodexPrompt --> Validation[Validation]",
      "  Validation --> DirectToMainCommit[Direct-to-main Commit]"
    ].join("\n")
  };
}

function buildPlannerVisualBoard({ mode, evolutionPlan, taskPunch, currentPlan }) {
  const baseColumns = [
    { id: "proposed", title: "Proposed", cards: [] },
    { id: "approved", title: "Approved", cards: [] },
    { id: "in_progress", title: "In Progress", cards: [] },
    { id: "blocked", title: "Blocked", cards: [] },
    { id: "verified", title: "Verified", cards: [] },
    { id: "completed", title: "Completed", cards: [] }
  ];
  const evolutionCard = {
    id: evolutionPlan.evolution_id,
    title: evolutionPlan.title,
    type: "evolution",
    status: currentPlan && String(currentPlan.status || "").toLowerCase() === "approved" ? "approved" : "proposed",
    track: evolutionPlan.track,
    delivery_mode: evolutionPlan.delivery_mode,
    next_action: evolutionPlan.next_action
  };
  const taskCards = (taskPunch.tasks || []).map((task) => ({
    id: task.id,
    title: task.title,
    type: "task",
    status: task.status || "proposed",
    allowed_files: task.allowed_files || [],
    forbidden_files: task.forbidden_files || [],
    acceptance_criteria: task.acceptance_criteria || []
  }));
  const evolutionColumn = evolutionCard.status === "approved" ? "approved" : "proposed";
  baseColumns.find((column) => column.id === evolutionColumn).cards.push(evolutionCard);
  for (const task of taskCards) {
    const columnId = normalizePlannerBoardColumn(task.status);
    const column = baseColumns.find((item) => item.id === columnId) || baseColumns[0];
    column.cards.push(task);
  }
  if (mode === "vibe") {
    baseColumns.find((column) => column.id === "proposed").cards.push({
      id: `${evolutionPlan.evolution_id}-pipeline`,
      title: "Request to Handoff Pipeline",
      type: "pipeline",
      status: "proposed",
      pipeline: VIBE_PIPELINE
    });
  }
  if (mode === "plugin") {
    baseColumns.find((column) => column.id === "proposed").cards.push({
      id: `${evolutionPlan.evolution_id}-plugin-parity`,
      title: "Plugin Manifest / Runtime / Docs / Schema / Tests Parity",
      type: "plugin-parity",
      status: "proposed"
    });
  }
  return { columns: baseColumns };
}

function normalizePlannerBoardColumn(status) {
  const normalized = String(status || "proposed").toLowerCase();
  if (normalized === "approved") return "approved";
  if (normalized === "in_progress") return "in_progress";
  if (normalized === "blocked") return "blocked";
  if (normalized === "verified") return "verified";
  if (normalized === "completed" || normalized === "done" || normalized === "owner_verified") return "completed";
  return "proposed";
}

function buildPlannerVisualScopeMap({ mode, evolutionPlan, taskPunch, pluginContext }) {
  const runtimeState = mode === "plugin"
    ? [".kabeeri/plugin-links/", ".kabeeri/plugins.json"]
    : [".kabeeri/planner.json"];
  const generatedArtifacts = ["docs/reports/"];
  if (mode === "plugin") generatedArtifacts.push(`plugins/${pluginContext ? pluginContext.plugin_id : "plugin"}/`);
  const forbiddenFiles = [...(evolutionPlan.forbidden_files || [])];
  if (mode === "plugin") forbiddenFiles.push("plugins/* (unrelated plugins)");
  return {
    allowed_files: [...(evolutionPlan.allowed_files || [])],
    forbidden_files: forbiddenFiles,
    runtime_state: runtimeState,
    generated_artifacts: generatedArtifacts,
    docs: [
      "docs/cli/CLI_COMMAND_REFERENCE.md",
      "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
      "knowledge/governance/KVDF_PLANNER_LAYER.md",
      "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md"
    ],
    tests: ["tests/cli.integration.test.js"]
  };
}

function buildPlannerVisualLegend() {
  return {
    allowed: "Files Codex may edit",
    forbidden: "Files Codex must not edit",
    runtime_state: "Runtime files that must not be committed",
    generated_artifacts: "Generated files that may refresh during validation",
    docs: "Documentation surfaces",
    tests: "Validation and test surfaces"
  };
}

function buildPlannerVisualMarkdown({ goal, mode, deliveryMode, evolutionPlan, graph, board, scopeMap, validationCommands, stopCondition }) {
  const title = mode === "vibe"
    ? "KVDF Planner Visual Model - Vibe/App"
    : mode === "plugin"
      ? "KVDF Planner Visual Model - Plugin"
      : "KVDF Planner Visual Model - Owner";
  const boardSummary = board.columns.map((column) => `- ${column.title}: ${column.cards.length} card(s)`).join("\n");
  const allowedFiles = (scopeMap.allowed_files || []).map((item) => `- ${item}`).join("\n");
  const forbiddenFiles = (scopeMap.forbidden_files || []).map((item) => `- ${item}`).join("\n");
  const runtimeState = (scopeMap.runtime_state || []).map((item) => `- ${item}`).join("\n");
  const generatedArtifacts = (scopeMap.generated_artifacts || []).map((item) => `- ${item}`).join("\n");
  const docs = (scopeMap.docs || []).map((item) => `- ${item}`).join("\n");
  const tests = (scopeMap.tests || []).map((item) => `- ${item}`).join("\n");
  return [
    `# ${title}`,
    "",
    `- Track: ${evolutionPlan.track}`,
    `- Delivery mode: ${deliveryMode}`,
    `- Proposed Evolution: ${evolutionPlan.title}`,
    "",
    "## Mermaid Graph",
    "```mermaid",
    graph.diagram,
    "```",
    "",
    "## Planning Board",
    boardSummary,
    "",
    "## Scope Map",
    "### Allowed Files",
    allowedFiles || "- None",
    "### Forbidden Files",
    forbiddenFiles || "- None",
    "### Runtime State",
    runtimeState || "- None",
    "### Generated Artifacts",
    generatedArtifacts || "- None",
    "### Docs",
    docs || "- None",
    "### Tests",
    tests || "- None",
    "",
    "## Validation Commands",
    ...validationCommands.map((command) => `- ${command}`),
    "",
    `## Stop Condition`,
    stopCondition,
    "",
    `## Goal`,
    goal
  ].join("\n");
}

function buildPlannerProposalReport(goal, request = {}, deps = {}) {
  const context = buildPlannerContext(deps);
  const mode = resolvePlannerMode(request, context);
  const deliveryMode = getDeliveryMode(mode);
  const pluginContext = mode === "plugin" ? buildPluginContext(request, context) : null;
  const evolutionPlan = buildPlannerEvolutionPlan(goal, { ...request, mode, deliveryMode, pluginContext }, context);
  const taskPunch = buildPlannerTaskPunch(evolutionPlan, { ...request, mode, deliveryMode, pluginContext }, context);
  const visual = buildPlannerVisualPayload({ goal, mode, deliveryMode, evolutionPlan, taskPunch, context, pluginContext });
  const codexPrompt = renderCodexPrompt({ goal, mode, plan: evolutionPlan, taskPunch, context, pluginContext });
  const state = loadPlannerState(context.repo_root);
  const planId = allocatePlannerPlanId(state);
  const plan = buildPlannerPlanRecord({
    planId,
    goal,
    mode,
    deliveryMode,
    evolutionPlan,
    taskPunch,
    visual,
    codexPrompt,
    pluginContext,
    createdAt: new Date().toISOString()
  });
  state.plans.push(plan);
  savePlannerState(context.repo_root, state);
  return {
    report_type: "kvdf_planner_proposal",
    generated_at: new Date().toISOString(),
    plan_id: planId,
    status: "proposed",
    planner_mode: mode,
    track: evolutionPlan.track,
    delivery_mode: deliveryMode,
    visual,
    next_action: `Review and approve with kvdf planner approve ${planId}.`
  };
}

function approvePlannerPlan(planId, approvedBy, deps = {}) {
  const context = buildPlannerContext(deps);
  const state = loadPlannerState(context.repo_root);
  const plan = findPlannerPlan(state, planId);
  if (!plan) throw new Error(`Planner plan not found: ${planId}`);
  if (String(plan.status || "").toLowerCase() !== "proposed") {
    throw new Error(`Planner plan ${planId} must be proposed before approval.`);
  }
  const owner = String(approvedBy || "").trim();
  if (!owner) throw new Error("Missing owner for planner approve.");
  plan.status = "approved";
  plan.approved_at = new Date().toISOString();
  plan.approved_by = owner;
  plan.rejected_at = null;
  plan.rejection_reason = null;
  const pluginContext = String(plan.planner_mode || "").toLowerCase() === "plugin"
    ? (plan.plugin_context || buildPluginContext({ plugin_id: plan.recommended_evolution && plan.recommended_evolution.plugin_context && plan.recommended_evolution.plugin_context.plugin_id }, context))
    : null;
  plan.visual = buildPlannerVisualPayload({
    goal: plan.goal || (plan.recommended_evolution && plan.recommended_evolution.title) || "Approved planner plan",
    mode: plan.planner_mode,
    deliveryMode: plan.delivery_mode || getDeliveryMode(plan.planner_mode),
    evolutionPlan: plan.recommended_evolution && Object.keys(plan.recommended_evolution).length ? plan.recommended_evolution : buildPlannerEvolutionPlan(plan.goal || "Approved planner plan", { mode: plan.planner_mode, deliveryMode: plan.delivery_mode || getDeliveryMode(plan.planner_mode), pluginContext }, context),
    taskPunch: plan.task_punch && Array.isArray(plan.task_punch.tasks) && plan.task_punch.tasks.length ? plan.task_punch : buildPlannerTaskPunch(plan.recommended_evolution && Object.keys(plan.recommended_evolution).length ? plan.recommended_evolution : buildPlannerEvolutionPlan(plan.goal || "Approved planner plan", { mode: plan.planner_mode, deliveryMode: plan.delivery_mode || getDeliveryMode(plan.planner_mode), pluginContext }, context), { mode: plan.planner_mode, deliveryMode: plan.delivery_mode || getDeliveryMode(plan.planner_mode), pluginContext }, context),
    context,
    pluginContext,
    currentPlan: plan
  });
  state.current_plan_id = planId;
  savePlannerState(context.repo_root, state);
  return {
    report_type: "kvdf_planner_approved",
    generated_at: new Date().toISOString(),
    plan_id: planId,
    status: "approved",
    current_plan_id: planId,
    next_action: "Generate the Codex prompt with kvdf planner prompt --from-current --json."
  };
}

function buildPlannerCurrentReport(deps = {}) {
  const context = buildPlannerContext(deps);
  const state = loadPlannerState(context.repo_root);
  const currentPlan = findCurrentPlannerPlan(state);
  if (!currentPlan) {
    return {
      report_type: "kvdf_planner_current",
      generated_at: new Date().toISOString(),
      status: "empty",
      current_plan: null,
      next_action: "Run kvdf planner propose --goal \"...\" --track owner, vibe, or plugin --json to create a proposed plan."
    };
  }
  return {
    report_type: "kvdf_planner_current",
    generated_at: new Date().toISOString(),
    status: "approved",
    current_plan_id: currentPlan.plan_id,
    current_plan: currentPlan,
    next_action: "Run kvdf planner prompt --from-current --json to generate the Codex prompt from the approved plan."
  };
}

function rejectPlannerPlan(planId, reason, flags = {}, deps = {}) {
  const context = buildPlannerContext(deps);
  const state = loadPlannerState(context.repo_root);
  const plan = findPlannerPlan(state, planId);
  if (!plan) throw new Error(`Planner plan not found: ${planId}`);
  const force = resolveBooleanFlag(flags.force);
  const status = String(plan.status || "").toLowerCase();
  if (status === "completed" && !force) {
    throw new Error(`Planner plan ${planId} is completed. Use --force to reject it.`);
  }
  if (status !== "proposed" && !force) {
    throw new Error(`Planner plan ${planId} must be proposed before rejection.`);
  }
  const rejectionReason = String(reason || "").trim();
  if (!rejectionReason) throw new Error("Missing rejection reason for planner reject.");
  plan.status = "rejected";
  plan.rejected_at = new Date().toISOString();
  plan.rejection_reason = rejectionReason;
  plan.approved_at = null;
  plan.approved_by = null;
  plan.completed_at = null;
  plan.completion_note = null;
  plan.materialized_at = null;
  plan.materialization_status = null;
  plan.evolution_change_id = null;
  plan.materialized_task_ids = [];
  plan.materialization_report_path = null;
  if (state.current_plan_id === planId) state.current_plan_id = null;
  savePlannerState(context.repo_root, state);
  return {
    report_type: "kvdf_planner_rejected",
    generated_at: new Date().toISOString(),
    plan_id: planId,
    status: "rejected",
    rejection_reason: rejectionReason,
    current_plan_id: state.current_plan_id || null,
    next_action: "Run kvdf planner propose --goal \"...\" --track owner, vibe, or plugin --json to create a new proposed plan."
  };
}

function completePlannerPlan(planId, note, deps = {}) {
  const context = buildPlannerContext(deps);
  const state = loadPlannerState(context.repo_root);
  const plan = findPlannerPlan(state, planId);
  if (!plan) throw new Error(`Planner plan not found: ${planId}`);
  if (String(plan.status || "").toLowerCase() !== "approved") {
    throw new Error(`Planner plan ${planId} must be approved before completion.`);
  }
  const completionNote = String(note || "").trim();
  if (!completionNote) throw new Error("Missing completion note for planner complete.");
  plan.status = "completed";
  plan.completed_at = new Date().toISOString();
  plan.completion_note = completionNote;
  if (state.current_plan_id === planId) state.current_plan_id = null;
  savePlannerState(context.repo_root, state);
  return {
    report_type: "kvdf_planner_completed",
    generated_at: new Date().toISOString(),
    plan_id: planId,
    status: "completed",
    current_plan_id: state.current_plan_id || null,
    completion_note: completionNote,
    next_action: "Run kvdf planner propose --goal \"...\" --track owner, vibe, or plugin --json to create the next proposed plan."
  };
}

function materializePlannerPlan(planId, flags = {}, deps = {}) {
  const context = buildPlannerContext(deps);
  const state = loadPlannerState(context.repo_root);
  const plan = resolveMaterializablePlannerPlan(state, planId, flags);
  const approvedPlan = normalizePlannerPlanRecord(plan);
  const materialization = buildPlannerMaterializationArtifact(approvedPlan, context);
  const evolutionState = loadPlannerEvolutionState(context.repo_root);
  const tasksState = loadPlannerTasksState(context.repo_root);
  const evolutionRecord = upsertPlannerEvolutionRecord(evolutionState, approvedPlan, materialization, context);
  const taskRecords = upsertPlannerMaterializationTasks(tasksState, evolutionState, approvedPlan, materialization, context, evolutionRecord.change_id);
  const materializedAt = new Date().toISOString();
  const reportPath = path.join(context.repo_root, ".kabeeri", "reports", `planner_materialization_${approvedPlan.plan_id}.json`);
  const report = buildPlannerMaterializationReport({
    plan: approvedPlan,
    materialization,
    evolutionRecord,
    taskRecords,
    reportPath,
    materializedAt
  });

  plan.materialized_at = materializedAt;
  plan.materialization_status = "materialized";
  plan.evolution_change_id = evolutionRecord.change_id;
  plan.materialized_task_ids = taskRecords.map((task) => task.id);
  plan.materialization_report_path = reportPath.replace(/\\/g, "/");

  evolutionState.current_change_id = evolutionRecord.change_id;
  savePlannerState(context.repo_root, state);
  savePlannerEvolutionState(context.repo_root, evolutionState);
  savePlannerTasksState(context.repo_root, tasksState);
  savePlannerMaterializationReport(reportPath, report);

  return {
    report_type: "kvdf_planner_materialization",
    generated_at: materializedAt,
    plan_id: approvedPlan.plan_id,
    planner_mode: approvedPlan.planner_mode,
    track: approvedPlan.track,
    delivery_mode: approvedPlan.delivery_mode,
    status: "materialized",
    evolution: {
      change_id: evolutionRecord.change_id,
      title: evolutionRecord.title,
      status: evolutionRecord.status,
      planner_plan_id: approvedPlan.plan_id
    },
    task_punch: {
      tasks_created: taskRecords.length,
      task_ids: taskRecords.map((task) => task.id)
    },
    report_path: reportPath.replace(/\\/g, "/"),
    next_action: "Run kvdf planner prompt --from-current --json, then execute the first approved task slice.",
    plugin_context: approvedPlan.plugin_context || null
  };
}

function buildPlannerPromptFromCurrentPlan(request = {}, deps = {}) {
  const context = buildPlannerContext(deps);
  const state = loadPlannerState(context.repo_root);
  const currentPlan = findCurrentPlannerPlan(state);
  if (!currentPlan) {
    throw new Error("No approved current planner plan exists. Run kvdf planner propose --goal \"...\" --track owner, vibe, or plugin --json first.");
  }
  const prompt = currentPlan.codex_prompt || renderPlannerPromptFromPlan(currentPlan, context);
  return {
    report_type: "kvdf_planner_codex_prompt",
    generated_at: new Date().toISOString(),
    planner_mode: currentPlan.planner_mode,
    track: currentPlan.track,
    delivery_mode: currentPlan.delivery_mode,
    plan_id: currentPlan.plan_id,
    goal: currentPlan.goal,
    allowed_files: currentPlan.allowed_files || [],
    forbidden_files: currentPlan.forbidden_files || [],
    validation_commands: currentPlan.validation_commands || [],
    stop_condition: currentPlan.stop_condition || "",
    task_punch: currentPlan.task_punch || null,
    prompt
  };
}

function buildPlannerEvolutionPlan(goal, request = {}, context = {}) {
  const mode = request.mode || "owner";
  const deliveryMode = request.deliveryMode || getDeliveryMode(mode);
  const pluginContext = request.pluginContext || null;
  const title = normalizeEvolutionTitle(goal, mode, context, pluginContext);
  const evolutionId = normalizeEvolutionId(title);
  const recommendationArea = getPlannerArea(mode);
  const nextAction = getPlannerNextAction(mode, title, pluginContext);
  const plan = {
    report_type: "kvdf_planner_evolution_plan",
    evolution_id: evolutionId,
    title,
    planner_mode: mode,
    track: getPlannerTrack(mode),
    area: recommendationArea,
    reason: buildPlannerReason(mode, context, pluginContext),
    in_scope: buildPlannerInScope(mode, context, pluginContext),
    out_of_scope: buildPlannerOutOfScope(mode, context, pluginContext),
    allowed_files: buildPlannerAllowedFiles(mode, context, pluginContext),
    forbidden_files: buildPlannerForbiddenFiles(mode, context, pluginContext),
    acceptance_criteria: buildPlannerAcceptanceCriteria(mode, context, pluginContext),
    validation_commands: buildPlannerValidationCommands(mode, context, pluginContext),
    delivery_mode: deliveryMode,
    next_action: nextAction,
    stop_condition: buildPlannerStopCondition(mode, context, pluginContext)
  };
  if (mode === "vibe") plan.pipeline = [...VIBE_PIPELINE];
  if (mode === "plugin") plan.plugin_context = pluginContext;
  return plan;
}

function buildPlannerTaskPunch(plan, request = {}, context = {}) {
  const mode = request.mode || plan.planner_mode || "owner";
  const pluginContext = request.pluginContext || plan.plugin_context || null;
  const evolutionId = plan.evolution_id || normalizeEvolutionId(plan.title);
  const tasks = buildModeTaskPunchTasks(mode, plan, pluginContext, context, evolutionId);
  return {
    report_type: "kvdf_task_punch",
    generated_at: new Date().toISOString(),
    evolution_id: evolutionId,
    title: `${plan.title} Task Punch`,
    planner_mode: mode,
    track: plan.track,
    delivery_mode: plan.delivery_mode,
    tasks
  };
}

function buildModeTaskPunchTasks(mode, plan, pluginContext, context, evolutionId) {
  if (mode === "vibe") {
    return [
      taskPunchItem(`${evolutionId}-intake`, "Define app-track intake and scope boundaries", [
        "workspaces/apps/<app-slug>/",
        ".kabeeri/questionnaires/",
        ".kabeeri/interactions/",
        "docs/workflows/KVDF_LED_DELIVERY.md"
      ], [
        "KVDOS/",
        "src/cli/",
        "plugins/*/runtime/",
        ".kabeeri/plugin-links/"
      ], [
        "The request is documented in a file-based intake flow.",
        "Owner-track files remain untouched unless explicitly requested.",
        "The output states whether GitHub handoff is optional or local-only."
      ], plan.validation_commands, "Stop if the request would turn into owner-track work by default."),
      taskPunchItem(`${evolutionId}-evolution`, "Draft the app evolution and task slicing guidance", [
        "workspaces/apps/<app-slug>/",
        ".kabeeri/reports/",
        "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md",
        "docs/workflows/PR_HANDOFF_TEMPLATE.md"
      ], [
        "KVDOS/",
        "src/cli/commands/evolution.js",
        "plugins/*/plugin.json",
        ".kabeeri/plugin-links/"
      ], [
        "The evolution slice is milestone-based and local-first by default.",
        "The task slice is small enough to finish without changing KVDF Core.",
        "Branch/PR appears only as an optional handoff path."
      ], plan.validation_commands, "Stop if the task slice drifts into KVDF Core implementation by default."),
      taskPunchItem(`${evolutionId}-handoff`, "Add handoff and validation guidance for app delivery", [
        "docs/workflows/KVDF_LED_DELIVERY.md",
        "docs/workflows/PR_HANDOFF_TEMPLATE.md",
        "docs/site/pages/en/vibe-developer.html",
        "docs/site/pages/ar/vibe-developer.html",
        "tests/cli.integration.test.js"
      ], [
        "KVDOS/",
        "src/cli/commands/planner.js",
        "src/cli/commands/dashboard_site.js",
        ".kabeeri/plugin-links/"
      ], [
        "The handoff flow remains valid even when GitHub is disabled.",
        "The final report names the app workspace and the next action.",
        "The output explains the direct-to-main KVDF Core exception separately."
      ], plan.validation_commands, "Stop if the handoff guidance starts redefining KVDF Core delivery as the default app path.")
    ];
  }

  if (mode === "plugin") {
    const pluginId = pluginContext ? pluginContext.plugin_id : "plugin";
    return [
      taskPunchItem(`${evolutionId}-manifest`, "Align the plugin manifest and CLI contract", [
        `plugins/${pluginId}/plugin.json`,
        `plugins/${pluginId}/README.md`,
        `plugins/${pluginId}/docs/`,
        "src/cli/services/plugin_loader.js",
        "src/cli/services/plugin_mounts.js"
      ], [
        "KVDOS/",
        ".kabeeri/plugin-links/",
        "workspaces/apps/",
        "plugins/*/runtime/"
      ], [
        "The plugin manifest stays the source of truth.",
        "The plugin command surface, docs surface, and runtime entrypoint match the manifest.",
        "Install and uninstall behavior stays reversible and local."
      ], [...plan.validation_commands, "kvdf plugins status"], "Stop if the work would alter unrelated plugins."),
      taskPunchItem(`${evolutionId}-runtime`, "Protect plugin runtime and mount state boundaries", [
        `plugins/${pluginId}/runtime/`,
        `.kabeeri/plugins.json`,
        ".kabeeri/plugin-links/",
        `plugins/${pluginId}/tests/`
      ], [
        "KVDOS/",
        "workspaces/apps/",
        "plugins/*/plugin.json",
        "plugins/*/runtime/"
      ], [
        "Plugin runtime state and mount links are protected.",
        "Plugin install/uninstall lifecycle checks are included where relevant.",
        "The planner output explains the bundle contract parity."
      ], plan.validation_commands, "Stop if the runtime work would require changing unrelated plugin mounts."),
      taskPunchItem(`${evolutionId}-docs-tests`, "Add plugin docs, schema, and test parity guidance", [
        "docs/cli/CLI_COMMAND_REFERENCE.md",
        "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
        "knowledge/governance/KVDF_PLANNER_LAYER.md",
        "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md",
        `plugins/${pluginId}/tests/`
      ], [
        "KVDOS/",
        "plugins/*/runtime/",
        ".kabeeri/plugin-links/",
        "workspaces/apps/"
      ], [
        "The plugin docs mention manifest, docs, runtime, and tests parity.",
        "The planner prompt says plugin development explicitly.",
        "The output protects mount state and unrelated plugin bundles."
      ], plan.validation_commands, "Stop if the docs or tests would blur plugin scope across bundles.")
    ];
  }

  return [
    taskPunchItem(`${evolutionId}-docs`, "Document the planner layer and workflow contract", [
      "knowledge/governance/KVDF_PLANNER_LAYER.md",
      "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md",
      "packs/planner/evolution-planner.prompt.md",
      "packs/planner/codex-execution.prompt.md",
      "schemas/planner/evolution-plan.schema.json",
      "schemas/planner/task-punch.schema.json"
    ], [...OWNER_FORBIDDEN_FILES], [
      "The planner layer governance document explains the roles and rules clearly.",
      "The workflow document shows Owner direction -> planner -> Codex execution -> validation -> review -> direct-to-main commit.",
      "The prompt templates exist and match the direct-to-main KVDF Core policy."
    ], plan.validation_commands, "Stop if the documentation would describe branch/PR as the default KVDF Core delivery path."),
    taskPunchItem(`${evolutionId}-cli`, "Wire the planner command into the KVDF Core CLI", [
      "src/cli/commands/planner.js",
      "src/cli/dispatchers/build.js",
      "src/cli/index.js",
      "src/cli/ui.js"
    ], [...OWNER_FORBIDDEN_FILES], [
      "kvdf planner next --json returns a deterministic recommendation.",
      "kvdf planner prompt --goal \"...\" --json returns a Codex-ready prompt.",
      "KVDF Core stays direct-to-main by default and branch/PR remains optional only."
    ], plan.validation_commands, "Stop if command wiring would make branch/PR the default KVDF Core path."),
    taskPunchItem(`${evolutionId}-tests`, "Add planner integration and documentation coverage", [
      "tests/cli.integration.test.js",
      "docs/cli/CLI_COMMAND_REFERENCE.md",
      "docs/SYSTEM_CAPABILITIES_REFERENCE.md"
    ], [...OWNER_FORBIDDEN_FILES], [
      "The planner command has integration coverage for JSON and prompt output.",
      "The CLI command reference documents the planner command family.",
      "The system capabilities reference records the Planner Layer in the core area map."
    ], plan.validation_commands, "Stop if the test additions require runtime state edits or unrelated feature changes.")
  ];
}

function taskPunchItem(id, title, allowedFiles, forbiddenFiles, acceptanceCriteria, validationCommands, stopCondition) {
  return {
    id,
    title,
    status: "proposed",
    allowed_files: allowedFiles,
    forbidden_files: forbiddenFiles,
    acceptance_criteria: acceptanceCriteria,
    validation_commands: validationCommands,
    stop_condition: stopCondition
  };
}

function renderCodexPrompt({ goal, mode, plan, taskPunch, pluginContext }) {
  const heading = mode === "vibe"
    ? "CODEx PROMPT — KVDF Vibe/App Delivery"
    : mode === "plugin"
      ? "CODEx PROMPT — KVDF Plugin Development"
      : "CODEx PROMPT — KVDF Core";
  const allowedFiles = plan.allowed_files || [];
  const forbiddenFiles = plan.forbidden_files || [];
  const validationCommands = plan.validation_commands || [];
  const taskLines = (taskPunch.tasks || []).map((task, index) => `${index + 1}. ${task.title}`);
  const contextLines = buildPromptContextLines(mode, pluginContext);
  const commitLines = buildPromptCommitLines(mode, plan, pluginContext);
  const pipelineLines = mode === "vibe"
    ? ["", "Pipeline:", ...VIBE_PIPELINE.map((step) => `- ${step}`)]
    : [];
  return [
    heading,
    "",
    "Context:",
    "- Repo: kabeeri.vdf",
    ...contextLines,
    "",
    "Goal:",
    goal,
    "",
    "Scope:",
    "Allowed files:",
    ...allowedFiles.map((item) => `- ${item}`),
    "Forbidden files:",
    ...forbiddenFiles.map((item) => `- ${item}`),
    ...pipelineLines,
    "",
    "Implementation tasks:",
    ...taskLines,
    "",
    "Validation:",
    "Run:",
    ...validationCommands.map((command) => `- ${command}`),
    "",
    "Commit:",
    ...commitLines,
    "",
    `Stop condition: ${plan.stop_condition}`
  ].join("\\n");
}

function buildPromptContextLines(mode, pluginContext) {
  if (mode === "vibe") {
    return [
      "- Track: Vibe App Developer",
      "- Delivery mode: Local-first",
      "- No branch / no PR unless explicitly enabled",
      "- Do not touch KVDF Core unless the Owner explicitly asks for framework work",
      "- GitHub handoff is optional and never the default",
      "- The Owner is the only active KVDF Core developer for framework work"
    ];
  }
  if (mode === "plugin") {
    return [
      "- Track: Plugin Development",
      `- Plugin: ${pluginContext ? pluginContext.plugin_id : "unknown"}`,
      "- Delivery mode: Direct-to-main",
      "- Do not touch KVDOS",
      "- Protect .kabeeri/plugin-links/ runtime mount state",
      "- Plugin manifest, docs, runtime, and tests must stay in parity"
    ];
  }
  return [
    "- Track: Owner Track / KVDF Core only",
    "- Delivery mode: Direct-to-main",
    "- No branch / no PR unless explicitly requested",
    "- Do not touch KVDOS",
    "- Do not commit runtime state under .kabeeri/",
    "- The Owner is the only active KVDF Core developer",
    "- Codex is the executor, not the planner"
  ];
}

function buildPromptCommitLines(mode, plan, pluginContext) {
  if (mode === "vibe") {
    return [
      "git add -A",
      'git commit -m "feat: implement approved vibe/app delivery slice"',
      "If GitHub handoff is enabled, publish only through the approved delivery branch and Owner review gate.",
      "If GitHub handoff is not enabled, keep the delivery local and write the final handoff report."
    ];
  }
  if (mode === "plugin") {
    return [
      "git add -A",
      'git commit -m "feat: implement approved plugin delivery slice"',
      "git push origin main"
    ];
  }
  return [
    "git add -A",
    'git commit -m "feat: add KVDF planner layer MVP"',
    "git push origin main"
  ];
}

function printPlannerOutput(report, flags, deps, kind) {
  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  const rendered = kind === "prompt"
    ? renderPlannerPromptReport(report)
    : kind === "visual"
      ? renderPlannerVisualReport(report)
      : kind === "materialize"
        ? renderPlannerMaterializationReport(report, deps.table)
    : kind === "evolution"
      ? renderPlannerEvolutionPlan(report, deps.table)
      : kind === "task-punch"
        ? renderPlannerTaskPunchReport(report, deps.table)
        : ["propose", "approve", "current", "reject"].includes(kind)
          ? renderPlannerStateSummaryReport(report, deps.table)
        : renderPlannerNextReport(report, deps.table);
  console.log(rendered);
}

function buildPlannerContext(deps = {}) {
  const repoRootPath = typeof deps.repoRoot === "function" ? deps.repoRoot() : process.cwd();
  const evolutionFile = path.join(repoRootPath, ".kabeeri", "evolution.json");
  const tasksFile = path.join(repoRootPath, ".kabeeri", "tasks.json");
  const projectFile = path.join(repoRootPath, ".kabeeri", "project.json");
  const plannerFile = path.join(repoRootPath, PLANNER_STATE_FILE);
  const capabilityRegistryFile = path.join(repoRootPath, "knowledge", "standard_systems", "KVDF_CANONICAL_CAPABILITY_REGISTRY.json");
  const evolutionState = fs.existsSync(evolutionFile) ? safeReadJson(evolutionFile) : { changes: [], development_priorities: [] };
  const taskState = fs.existsSync(tasksFile) ? safeReadJson(tasksFile) : { tasks: [] };
  const projectState = fs.existsSync(projectFile) ? safeReadJson(projectFile) : null;
  const plannerState = fs.existsSync(plannerFile) ? safeReadJson(plannerFile) : null;
  const capabilityRegistry = fs.existsSync(capabilityRegistryFile) ? safeReadJson(capabilityRegistryFile) : null;
  const resumeReport = safeBuild(() => (typeof deps.buildResumeReport === "function" ? deps.buildResumeReport({ scan: false }) : null));
  const pluginLoader = safeBuild(() => (typeof deps.buildPluginLoaderReport === "function" ? deps.buildPluginLoaderReport() : null));
  const openTasksTotal = Array.isArray(taskState.tasks)
    ? taskState.tasks.filter((task) => !["owner_verified", "done", "closed", "rejected"].includes(String(task.status || "").toLowerCase())).length
    : 0;
  const openPrioritiesTotal = Array.isArray(evolutionState.development_priorities)
    ? evolutionState.development_priorities.filter((item) => !["done", "deferred", "rejected"].includes(String(item.status || "").toLowerCase())).length
    : 0;
  const currentTrack = resumeReport && resumeReport.primary_track ? resumeReport.primary_track.id : inferTrackFromWorkspace(repoRootPath);
  return {
    repo_root: repoRootPath,
    current_track: currentTrack,
    source: {
      report_type: "kvdf_planner_context",
      track: currentTrack || "framework_owner",
      runtime_state_present: fs.existsSync(path.join(repoRootPath, ".kabeeri")),
      open_tasks_total: openTasksTotal,
      open_priorities_total: openPrioritiesTotal,
      evolution_summary: resumeReport && resumeReport.evolution ? {
        current_change_id: resumeReport.evolution.current_change_id || null,
        next_priority: resumeReport.evolution.next_priority ? {
          id: resumeReport.evolution.next_priority.id || null,
          title: resumeReport.evolution.next_priority.title || null,
          status: resumeReport.evolution.next_priority.status || null
        } : null
      } : null,
      capability_registry: capabilityRegistry ? {
        report_type: capabilityRegistry.report_type || "kvdf_canonical_capability_registry",
        registry_version: capabilityRegistry.registry_version || "1",
        area_count: Array.isArray(capabilityRegistry.areas) ? capabilityRegistry.areas.length : 0
      } : null,
      planner_state: plannerState ? {
        planner_version: plannerState.planner_version || "1",
        current_plan_id: plannerState.current_plan_id || null,
        proposed_plans_total: Array.isArray(plannerState.plans) ? plannerState.plans.length : 0,
        approved_plans_total: Array.isArray(plannerState.plans) ? plannerState.plans.filter((item) => String(item.status || "").toLowerCase() === "approved").length : 0
      } : null,
      plugin_loader: pluginLoader ? {
        total_plugins: pluginLoader.total_plugins || 0,
        active_plugins: pluginLoader.active_plugins || 0,
        plugin_ids: Array.isArray(pluginLoader.plugins) ? pluginLoader.plugins.map((item) => item.plugin_id) : []
      } : null,
      project: projectState ? {
        product_name: projectState.product_name || "",
        profile: projectState.profile || null,
        delivery_mode: projectState.delivery_mode || null,
        slug: projectState.slug || null
      } : null,
      workspace_mode: resumeReport ? resumeReport.mode || null : null
    },
    resume_report: resumeReport,
    plugin_loader: pluginLoader,
    task_state: taskState,
    evolution_state: evolutionState,
    project_state: projectState
  };
}

function resolvePlannerRequest({ action, value, flags, rest }, deps = {}) {
  const explicitTrack = normalizeTrackAlias(flags.track);
  const explicitPlugin = normalizePluginId(flags.plugin);
  const goal = resolveGoal(value, flags, rest, "");
  const context = buildPlannerContext(deps);
  const mode = explicitPlugin ? "plugin" : (explicitTrack || detectPlannerMode(context, explicitTrack));
  const deliveryMode = getDeliveryMode(mode);
  const pluginContext = mode === "plugin" ? buildPluginContext({ plugin_id: explicitPlugin }, context) : null;
  const recommendedEvolution = recommendNextEvolution(mode, context, pluginContext, { goal });
  return {
    action,
    goal,
    mode,
    deliveryMode,
    plugin_id: pluginContext ? pluginContext.plugin_id : null,
    recommended_evolution: recommendedEvolution,
    context
  };
}

function detectPlannerMode(context, explicitTrack) {
  if (explicitTrack) return explicitTrack;
  if (context.resume_report && context.resume_report.primary_track && context.resume_report.primary_track.id === "vibe_app_developer") return "vibe";
  if (context.resume_report && context.resume_report.primary_track && context.resume_report.primary_track.id === "framework_owner") return "owner";
  if (context.current_track === "vibe_app_developer") return "vibe";
  return "owner";
}

function resolvePlannerMode(request, context) {
  if (request.plugin_id) return "plugin";
  if (request.mode) return request.mode;
  return detectPlannerMode(context, null);
}

function recommendNextEvolution(mode, context, pluginContext, request = {}) {
  if (mode === "vibe") {
    const openTask = Array.isArray(context.task_state.tasks)
      ? context.task_state.tasks.find((task) => !["done", "closed", "rejected", "owner_verified"].includes(String(task.status || "").toLowerCase()))
      : null;
    const productName = context.project_state && context.project_state.product_name ? context.project_state.product_name : "App Delivery";
    return {
      evolution_id: normalizeEvolutionId(`${productName} delivery slice`),
      title: request.goal || `${productName} Delivery Slice`,
      reason: openTask
        ? `The current app-track work can continue from the next open task: ${openTask.title}.`
        : "The next app-track step is a local-first delivery slice that keeps intake, blueprinting, and handoff separated from KVDF Core work.",
      area: "vibe_development_pipeline_dev",
      risk: openTask ? "medium" : "low"
    };
  }

  if (mode === "plugin") {
    const pluginId = pluginContext ? pluginContext.plugin_id : normalizePluginId(request.plugin_id) || "plugin";
    const pluginName = pluginContext && pluginContext.name ? pluginContext.name : pluginId;
    return {
      evolution_id: normalizeEvolutionId(`${pluginId} plugin slice`),
      title: request.goal || `${pluginName} Plugin Delivery Slice`,
      reason: `The plugin track should keep manifest, docs, runtime, and tests in parity for ${pluginName}.`,
      area: "plugins_dev",
      risk: "medium"
    };
  }

  const summary = context.resume_report && context.resume_report.evolution ? context.resume_report.evolution : null;
  const nextPriority = summary && summary.next_priority ? summary.next_priority : null;
  if (nextPriority) {
    return {
      evolution_id: nextPriority.id || normalizeEvolutionId(nextPriority.title || "next kvdf evolution"),
      title: nextPriority.title || "Next KVDF Evolution",
      reason: "The current open framework priority is the next governed Evolution.",
      area: "kvdf_development_pipeline_dev",
      risk: String(nextPriority.risk || "medium").toLowerCase()
    };
  }
  return {
    evolution_id: "kvdf-planner-track-awareness",
    title: request.goal || "KVDF Planner Track Awareness",
    reason: "No open framework-owner priority or task punch remains, so the repository should keep the planner track-aware and deterministic from local context.",
    area: "kvdf_development_pipeline_dev",
    risk: "medium"
  };
}

function buildPlannerReason(mode, context, pluginContext) {
  if (mode === "vibe") {
    return "The app track needs a local-first planner that keeps intake, blueprints, task slicing, verification, and handoff separate from KVDF Core.";
  }
  if (mode === "plugin") {
    const pluginId = pluginContext ? pluginContext.plugin_id : "plugin";
    return `The plugin track needs manifest, docs, runtime, and tests in parity for ${pluginId}.`;
  }
  return context.source.open_tasks_total > 0
    ? "The repository still has active framework work that should be wrapped in a deterministic planner plan before execution."
    : "The repository needs the track-aware planner layer so Codex can recommend the next governed Evolution from local context.";
}

function buildPlannerInScope(mode, context, pluginContext) {
  if (mode === "vibe") {
    return [
      "File-based app intake and planning",
      "App-track evolution slices and task punch generation",
      "Local-first handoff with optional GitHub mirroring",
      "App workspace boundaries and app-facing docs"
    ];
  }
  if (mode === "plugin") {
    const pluginId = pluginContext ? pluginContext.plugin_id : "plugin";
    return [
      `Manifest and docs parity for ${pluginId}`,
      "Runtime and tests parity for the selected plugin",
      "Plugin install / enable / disable / uninstall lifecycle checks",
      "Plugin mount and plugin-link runtime safety"
    ];
  }
  return [
    "Planner governance docs and workflow docs",
    "Planner schemas, prompt templates, and CLI command wiring",
    "Deterministic next-Evolution recommendation from repo/runtime context",
    "Task Punch generation with allowed and forbidden file lists",
    "Codex-ready prompt generation for direct-to-main KVDF Core delivery"
  ];
}

function buildPlannerOutOfScope(mode, context, pluginContext) {
  if (mode === "vibe") return [...VIBE_OUT_OF_SCOPE];
  if (mode === "plugin") return [...PLUGIN_OUT_OF_SCOPE];
  return [...OWNER_OUT_OF_SCOPE];
}

function buildPlannerAllowedFiles(mode, context, pluginContext) {
  if (mode === "vibe") return [...VIBE_ALLOWED_FILES];
  if (mode === "plugin") return buildPluginAllowedFiles(pluginContext);
  return [...OWNER_ALLOWED_FILES];
}

function buildPlannerForbiddenFiles(mode, context, pluginContext) {
  if (mode === "vibe") return [...VIBE_FORBIDDEN_FILES];
  if (mode === "plugin") return [...PLUGIN_FORBIDDEN_FILES];
  return [...OWNER_FORBIDDEN_FILES];
}

function buildPlannerAcceptanceCriteria(mode, context, pluginContext) {
  if (mode === "vibe") {
    return [
      "The planner keeps app-track intake local-first by default.",
      "The planner separates app delivery from KVDF Core edits unless the Owner explicitly requests framework work.",
      "The generated prompt includes the file-based intake, evolution, task slicing, verify, and handoff pipeline."
    ];
  }
  if (mode === "plugin") {
    return [
      "The plugin manifest, docs, runtime, and tests remain in parity.",
      "The planner output protects plugin mount and plugin-link state.",
      "The generated prompt includes plugin lifecycle checks and parity guidance."
    ];
  }
  return [
    "The planner can recommend the next KVDF Core Evolution without relying on chat memory.",
    "The planner can emit a Task Punch with scoped tasks, allowed files, forbidden files, validation commands, and a stop condition.",
    "The planner can emit a Codex-ready execution prompt for KVDF Core direct-to-main delivery.",
    "The planner does not write runtime state under .kabeeri/ in the MVP.",
    "The planner keeps branch/PR optional and never treats it as the default KVDF Core path."
  ];
}

function buildPlannerValidationCommands(mode, context, pluginContext) {
  const commands = [...DEFAULT_VALIDATION_COMMANDS];
  if (mode === "plugin") commands.unshift("kvdf plugins status");
  if (mode === "vibe") commands.unshift("kvdf dashboard state --json");
  return commands;
}

function getPlannerNextAction(mode, title, pluginContext) {
  return buildPlannerNextAction(mode, title, pluginContext);
}

function buildPlannerStopCondition(mode, context, pluginContext) {
  if (mode === "vibe") {
    return "Stop if the requested change would touch KVDF Core by default, write runtime state outside the app-first flow, or treat branch/PR as mandatory for local-first app delivery.";
  }
  if (mode === "plugin") {
    return "Stop if the requested change would touch unrelated plugins, break plugin mount/runtime safety, or write plugin-link runtime state without an explicit plugin Evolution.";
  }
  return "Stop if the requested change would touch KVDOS, runtime state under .kabeeri/, plugin runtime behavior, dashboard behavior, or any file outside the allowed KVDF Core planner scope.";
}

function buildPlannerNextAction(mode, title, pluginContext) {
  if (mode === "vibe") {
    return `Run kvdf planner evolution --goal "${escapeQuotes(title)}" --track vibe --json`;
  }
  if (mode === "plugin") {
    const pluginId = pluginContext ? pluginContext.plugin_id : "plugin";
    return `Run kvdf planner evolution --goal "${escapeQuotes(title)}" --track plugin --plugin ${pluginId} --json`;
  }
  return `Run kvdf planner evolution --goal "${escapeQuotes(title)}" --track owner --json`;
}

function buildPluginAllowedFiles(pluginContext) {
  const pluginId = pluginContext ? pluginContext.plugin_id : "plugin";
  const pluginRoot = `plugins/${pluginId}`;
  return [
    `${pluginRoot}/plugin.json`,
    `${pluginRoot}/README.md`,
    `${pluginRoot}/docs/`,
    `${pluginRoot}/runtime/`,
    `${pluginRoot}/tests/`,
    `${pluginRoot}/schemas/`,
    "src/cli/commands/plugin.js",
    "src/cli/services/plugin_loader.js",
    "src/cli/services/plugin_mounts.js",
    "docs/cli/CLI_COMMAND_REFERENCE.md",
    "docs/SYSTEM_CAPABILITIES_REFERENCE.md",
    "knowledge/governance/KVDF_PLANNER_LAYER.md",
    "docs/workflows/EVOLUTION_PLANNER_WORKFLOW.md"
  ];
}

function buildPluginContext(request, context) {
  const pluginId = normalizePluginId(request.plugin_id) || "kvdf-dev";
  const plugin = context.plugin_loader && Array.isArray(context.plugin_loader.plugins)
    ? context.plugin_loader.plugins.find((item) => item.plugin_id === pluginId || item.name === pluginId)
    : null;
  return {
    plugin_id: pluginId,
    name: plugin ? plugin.name || pluginId : pluginId,
    track: "plugin",
    plugin_family: plugin ? plugin.plugin_family || null : null,
    plugin_type: plugin ? plugin.plugin_type || null : null,
    enabled_by_default: plugin ? Boolean(plugin.enabled_by_default) : true,
    removable: plugin ? Boolean(plugin.removable) : true,
    runtime_entrypoint: plugin ? plugin.runtime_entrypoint || null : null,
    command_surface: plugin ? plugin.command_surface || [] : [],
    docs_surface: plugin ? plugin.docs_surface || [] : [],
    manifest_path: plugin ? plugin.manifest_path || null : null
  };
}

function getPlannerTrack(mode) {
  if (mode === "vibe") return "vibe_app_developer";
  if (mode === "plugin") return "plugin";
  return "framework_owner";
}

function getPlannerArea(mode) {
  if (mode === "vibe") return "vibe_development_pipeline_dev";
  if (mode === "plugin") return "plugins_dev";
  return "kvdf_development_pipeline_dev";
}

function getDeliveryMode(mode) {
  return mode === "vibe" ? "local_first" : "direct_main";
}

function normalizePlannerAction(value) {
  return String(value || "next").trim().toLowerCase();
}

function normalizeTrackAlias(value) {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase().replace(/[\s_-]+/g, "_");
  return MODE_ALIASES[normalized] || null;
}

function normalizePluginId(value) {
  const text = String(value || "").trim();
  return text ? text : null;
}

function resolveGoal(value, flags = {}, rest = [], fallback = "") {
  const candidates = [value, flags.goal, flags.title, rest.filter(Boolean).join(" "), fallback];
  const goal = candidates.find((item) => typeof item === "string" && item.trim());
  return goal ? String(goal).trim() : "";
}

function normalizeEvolutionTitle(goal, mode, context, pluginContext) {
  const text = String(goal || "").trim();
  if (mode === "vibe") {
    if (text) return text;
    const projectName = context.project_state && context.project_state.product_name ? context.project_state.product_name : "App Delivery";
    return `${projectName} Delivery Slice`;
  }
  if (mode === "plugin") {
    const pluginName = pluginContext && pluginContext.name ? pluginContext.name : "Plugin";
    return text || `${pluginName} Plugin Delivery Slice`;
  }
  if (/planner/i.test(text)) return text || "KVDF Planner Track Awareness";
  if (/direct[- ]?to[- ]?main/i.test(text)) return "KVDF Core Direct-to-Main Delivery Guidance";
  if (/capability/i.test(text)) return "KVDF Canonical Capability Registry";
  return text ? `KVDF Core Evolution - ${text}` : "KVDF Core Evolution MVP";
}

function normalizeEvolutionId(title) {
  return String(title || "kvdf-evolution").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function inferTrackFromWorkspace(repoRootPath) {
  const packageFile = path.join(repoRootPath, "package.json");
  const workspaceFile = path.join(repoRootPath, ".kabeeri", "workspace.json");
  if (!fs.existsSync(path.join(repoRootPath, ".kabeeri"))) return "framework_owner";
  if (fs.existsSync(workspaceFile)) return "vibe";
  if (fs.existsSync(packageFile)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageFile, "utf8"));
      if (String(pkg.name || "").toLowerCase() !== "kabeeri-vdf") return "vibe";
    } catch (_) {
      return "vibe";
    }
  }
  return "framework_owner";
}

function safeReadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function safeBuild(factory) {
  try {
    return factory();
  } catch {
    return null;
  }
}

function loadPlannerState(repoRootPath) {
  const filePath = path.join(repoRootPath || process.cwd(), PLANNER_STATE_FILE);
  if (!fs.existsSync(filePath)) {
    return { planner_version: "1", current_plan_id: null, plans: [] };
  }
  const state = safeReadJson(filePath);
  return normalizePlannerState(state);
}

function savePlannerState(repoRootPath, state) {
  const filePath = path.join(repoRootPath || process.cwd(), PLANNER_STATE_FILE);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(normalizePlannerState(state), null, 2)}\n`, "utf8");
}

function loadPlannerEvolutionState(repoRootPath) {
  const filePath = path.join(repoRootPath || process.cwd(), ".kabeeri", "evolution.json");
  if (!fs.existsSync(filePath)) {
    return { changes: [], impact_plans: [], current_change_id: null };
  }
  const state = safeReadJson(filePath);
  state.changes = Array.isArray(state.changes) ? state.changes : [];
  state.impact_plans = Array.isArray(state.impact_plans) ? state.impact_plans : [];
  state.current_change_id = state.current_change_id || null;
  return state;
}

function savePlannerEvolutionState(repoRootPath, state) {
  const filePath = path.join(repoRootPath || process.cwd(), ".kabeeri", "evolution.json");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function loadPlannerTasksState(repoRootPath) {
  const filePath = path.join(repoRootPath || process.cwd(), ".kabeeri", "tasks.json");
  if (!fs.existsSync(filePath)) {
    return { tasks: [] };
  }
  const state = safeReadJson(filePath);
  state.tasks = Array.isArray(state.tasks) ? state.tasks : [];
  return state;
}

function savePlannerTasksState(repoRootPath, state) {
  const filePath = path.join(repoRootPath || process.cwd(), ".kabeeri", "tasks.json");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function savePlannerMaterializationReport(reportPath, report) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function normalizePlannerState(state = {}) {
  const plans = Array.isArray(state.plans) ? state.plans.map(normalizePlannerPlanRecord).filter(Boolean) : [];
  return {
    planner_version: String(state.planner_version || "1"),
    current_plan_id: state.current_plan_id || null,
    plans
  };
}

function normalizePlannerPlanRecord(plan = {}) {
  if (!plan || typeof plan !== "object") return null;
  const planId = String(plan.plan_id || "").trim();
  if (!planId) return null;
  return {
    plan_id: planId,
    status: normalizePlannerStatus(plan.status),
    planner_mode: normalizePlannerMode(plan.planner_mode),
    track: normalizePlannerTrack(plan.track),
    delivery_mode: String(plan.delivery_mode || "direct_main"),
    goal: String(plan.goal || "").trim(),
    recommended_evolution: plan.recommended_evolution || {},
    task_punch: plan.task_punch || {},
    codex_prompt: String(plan.codex_prompt || ""),
    allowed_files: Array.isArray(plan.allowed_files) ? [...plan.allowed_files] : [],
    forbidden_files: Array.isArray(plan.forbidden_files) ? [...plan.forbidden_files] : [],
    out_of_scope: Array.isArray(plan.out_of_scope) ? [...plan.out_of_scope] : [],
    validation_commands: Array.isArray(plan.validation_commands) ? [...plan.validation_commands] : [],
    stop_condition: String(plan.stop_condition || ""),
    visual: plan.visual || null,
    created_at: plan.created_at || null,
    approved_at: plan.approved_at || null,
    approved_by: plan.approved_by || null,
    rejected_at: plan.rejected_at || null,
    rejection_reason: plan.rejection_reason || null,
    completed_at: plan.completed_at || null,
    completion_note: plan.completion_note || null,
    materialized_at: plan.materialized_at || null,
    materialization_status: plan.materialization_status || null,
    evolution_change_id: plan.evolution_change_id || null,
    materialized_task_ids: Array.isArray(plan.materialized_task_ids) ? [...plan.materialized_task_ids] : [],
    materialization_report_path: plan.materialization_report_path || null,
    plugin_context: plan.plugin_context || null,
    pipeline: Array.isArray(plan.pipeline) ? [...plan.pipeline] : undefined
  };
}

function buildPlannerPlanRecord({
  planId,
  goal,
  mode,
  deliveryMode,
  evolutionPlan,
  taskPunch,
  visual,
  codexPrompt,
  pluginContext,
  createdAt
}) {
  const plan = {
    plan_id: planId,
    status: "proposed",
    planner_mode: mode,
    track: evolutionPlan.track,
    delivery_mode: deliveryMode,
    goal,
    recommended_evolution: evolutionPlan,
    task_punch: taskPunch,
    codex_prompt: codexPrompt,
    allowed_files: [...(evolutionPlan.allowed_files || [])],
    forbidden_files: [...(evolutionPlan.forbidden_files || [])],
    out_of_scope: [...(evolutionPlan.out_of_scope || [])],
    validation_commands: [...(evolutionPlan.validation_commands || [])],
    stop_condition: evolutionPlan.stop_condition || "",
    visual: visual || null,
    created_at: createdAt,
    approved_at: null,
    approved_by: null,
    rejected_at: null,
    rejection_reason: null,
    completed_at: null,
    completion_note: null,
    materialized_at: null,
    materialization_status: null,
    evolution_change_id: null,
    materialized_task_ids: [],
    materialization_report_path: null
  };
  if (pluginContext) plan.plugin_context = pluginContext;
  if (Array.isArray(evolutionPlan.pipeline)) plan.pipeline = [...evolutionPlan.pipeline];
  return plan;
}

function resolveMaterializablePlannerPlan(state = {}, planId, flags = {}) {
  const selectedPlanId = isFromCurrentPlan(flags) ? String(state.current_plan_id || "").trim() : String(planId || "").trim();
  if (!selectedPlanId) {
    throw new Error("No approved current planner plan exists. Run kvdf planner propose --goal \"...\" --track owner, vibe, or plugin --json first.");
  }
  const plan = findPlannerPlan(state, selectedPlanId);
  if (!plan) {
    throw new Error(`Planner plan not found: ${selectedPlanId}`);
  }
  const status = String(plan.status || "").toLowerCase();
  if (status !== "approved") {
    throw new Error(`Planner plan ${selectedPlanId} must be approved before materialization.`);
  }
  return plan;
}

function buildPlannerMaterializationArtifact(plan, context = {}) {
  const mode = normalizePlannerMode(plan.planner_mode);
  const deliveryMode = plan.delivery_mode || getDeliveryMode(mode);
  const pluginContext = mode === "plugin" ? (plan.plugin_context || buildPluginContext({ plugin_id: plan.recommended_evolution && plan.recommended_evolution.plugin_context && plan.recommended_evolution.plugin_context.plugin_id }, context)) : null;
  const evolutionPlan = plan.recommended_evolution && Object.keys(plan.recommended_evolution).length
    ? plan.recommended_evolution
    : buildPlannerEvolutionPlan(plan.goal || "Approved planner plan", { mode, deliveryMode, pluginContext }, context);
  const taskPunch = plan.task_punch && Array.isArray(plan.task_punch.tasks) && plan.task_punch.tasks.length
    ? plan.task_punch
    : buildPlannerTaskPunch(evolutionPlan, { mode, deliveryMode, pluginContext }, context);
  return {
    report_type: "kvdf_planner_materialization_artifact",
    generated_at: new Date().toISOString(),
    planner_mode: mode,
    track: plan.track || getPlannerTrack(mode),
    delivery_mode: deliveryMode,
    goal: plan.goal || evolutionPlan.title || "",
    evolution_plan: evolutionPlan,
    task_punch: taskPunch,
    plugin_context: pluginContext
  };
}

function upsertPlannerEvolutionRecord(evolutionState, plan, materialization, context = {}) {
  evolutionState.changes = Array.isArray(evolutionState.changes) ? evolutionState.changes : [];
  evolutionState.impact_plans = Array.isArray(evolutionState.impact_plans) ? evolutionState.impact_plans : [];
  const changeId = plan.evolution_change_id || (plan.recommended_evolution && plan.recommended_evolution.evolution_id) || normalizeEvolutionId(plan.goal || "planner evolution");
  const evolutionPlan = materialization.evolution_plan || {};
  const existing = evolutionState.changes.find((item) => String(item.change_id || "") === changeId) || null;
  const now = new Date().toISOString();
  const change = existing || {
    change_id: changeId,
    title: evolutionPlan.title || plan.goal || "Planner Evolution",
    description: plan.goal || evolutionPlan.reason || evolutionPlan.title || "Planner Evolution",
    status: "planned",
    impacted_areas: [],
    task_ids: [],
    created_at: now
  };
  change.title = evolutionPlan.title || plan.goal || change.title;
  change.description = plan.goal || evolutionPlan.reason || change.description || change.title;
  change.status = "planned";
  change.source = "planner";
  change.planner_source = plan.planner_mode === "owner" ? "planner_owner" : plan.planner_mode === "vibe" ? "planner_vibe" : "planner_plugin";
  change.planner_plan_id = plan.plan_id;
  change.planner_mode = plan.planner_mode;
  change.track = plan.track;
  change.delivery_mode = plan.delivery_mode;
  change.impacted_areas = Array.isArray(evolutionPlan.impacted_areas)
    ? [...evolutionPlan.impacted_areas]
    : (Array.isArray(evolutionPlan.in_scope) ? [...evolutionPlan.in_scope] : []);
  change.in_scope = Array.isArray(evolutionPlan.in_scope) ? [...evolutionPlan.in_scope] : [];
  change.out_of_scope = Array.isArray(evolutionPlan.out_of_scope) ? [...evolutionPlan.out_of_scope] : [];
  change.allowed_files = Array.isArray(evolutionPlan.allowed_files) ? [...evolutionPlan.allowed_files] : [];
  change.forbidden_files = Array.isArray(evolutionPlan.forbidden_files) ? [...evolutionPlan.forbidden_files] : [];
  change.validation_commands = Array.isArray(evolutionPlan.validation_commands) ? [...evolutionPlan.validation_commands] : [];
  change.stop_condition = evolutionPlan.stop_condition || "";
  change.task_ids = [];
  change.updated_at = now;
  change.milestone_id = change.milestone_id || `planner-${changeId}`;
  change.milestone_title = evolutionPlan.title || change.title;
  change.milestone_summary = evolutionPlan.reason || plan.goal || change.description;
  change.milestone_status = "planned";
  change.local_first = plan.delivery_mode === "local_first";
  change.source_control = plan.delivery_mode === "local_first" ? "local" : "direct_main";
  change.sync_mode = plan.delivery_mode === "local_first" ? "local_first" : "direct_main";
  change.sync_policy = plan.delivery_mode === "local_first" ? "local_only" : "direct_main";
  change.github_sync_enabled = plan.delivery_mode !== "local_first";
  change.branch_name = change.branch_name || (plan.delivery_mode === "local_first" ? "local-first" : `evo/${changeId}`);
  change.merge_target_branch = change.merge_target_branch || "main";
  change.review_gate = change.review_gate || (plan.planner_mode === "owner" ? "owner_approval_required" : "planner_approval_required");
  change.review_required = true;
  change.review_status = change.review_status || "pending";
  change.branch_policy = change.branch_policy || {
    mode: plan.delivery_mode === "local_first" ? "local_only" : "direct_main"
  };
  change.task_trash_policy = change.task_trash_policy || {
    enabled: true,
    archive_status: "archived"
  };
  change.release_gate = change.release_gate || {
    enabled: plan.planner_mode === "owner",
    owner_required: true
  };
  change.planner_materialized_at = now;
  change.planner_materialization_status = "materialized";
  change.planner_materialization_report_path = `.kabeeri/reports/planner_materialization_${plan.plan_id}.json`;
  if (existing) {
    const index = evolutionState.changes.findIndex((item) => String(item.change_id || "") === changeId);
    evolutionState.changes[index] = change;
  } else {
    evolutionState.changes.push(change);
  }
  const impactPlan = {
    plan_id: `${changeId}-materialization`,
    change_id: changeId,
    title: change.title,
    status: "planned",
    planner_plan_id: plan.plan_id,
    planner_mode: plan.planner_mode,
    track: plan.track,
    delivery_mode: plan.delivery_mode,
    impacted_areas: [...change.impacted_areas],
    tasks: []
  };
  const impactIndex = evolutionState.impact_plans.findIndex((item) => String(item.change_id || "") === changeId);
  if (impactIndex >= 0) evolutionState.impact_plans[impactIndex] = impactPlan;
  else evolutionState.impact_plans.push(impactPlan);
  return change;
}

function upsertPlannerMaterializationTasks(tasksState, evolutionState, plan, materialization, context = {}, changeId) {
  tasksState.tasks = Array.isArray(tasksState.tasks) ? tasksState.tasks : [];
  const evolutionPlan = materialization.evolution_plan || {};
  const taskPunch = materialization.task_punch || { tasks: [] };
  const now = new Date().toISOString();
  const createdTasks = [];
  for (const task of taskPunch.tasks || []) {
    const taskId = String(task.id || "").trim();
    if (!taskId) continue;
    const record = {
      id: taskId,
      title: task.title || `Planner task for ${plan.plan_id}`,
      status: "proposed",
      source: `planner:${plan.plan_id}`,
      planner_source: plan.planner_mode === "owner" ? "planner_owner" : plan.planner_mode === "vibe" ? "planner_vibe" : "planner_plugin",
      planner_plan_id: plan.plan_id,
      evolution_change_id: changeId,
      evolution_milestone_id: evolutionState.changes.find((item) => String(item.change_id || "") === changeId)?.milestone_id || `planner-${changeId}`,
      evolution_milestone_title: evolutionState.changes.find((item) => String(item.change_id || "") === changeId)?.milestone_title || plan.goal || evolutionPlan.title || "Planner Evolution",
      track: plan.track,
      allowed_files: Array.isArray(task.allowed_files) ? [...task.allowed_files] : [],
      forbidden_files: Array.isArray(task.forbidden_files) ? [...task.forbidden_files] : [],
      acceptance_criteria: Array.isArray(task.acceptance_criteria) ? [...task.acceptance_criteria] : [],
      validation_commands: Array.isArray(task.validation_commands) ? [...task.validation_commands] : [],
      stop_condition: task.stop_condition || evolutionPlan.stop_condition || "",
      created_at: now
    };
    if (task.workstream) record.workstream = task.workstream;
    if (Array.isArray(task.workstreams)) record.workstreams = [...task.workstreams];
    if (plan.planner_mode === "plugin" && plan.plugin_context) record.plugin_context = plan.plugin_context;
    if (plan.delivery_mode === "direct_main") {
      record.branch_name = `evo/${changeId}`;
      record.merge_target_branch = "main";
      record.sync_policy = "direct_main";
      record.github_sync_enabled = true;
    } else {
      record.branch_name = "local-first";
      record.merge_target_branch = "main";
      record.sync_policy = "local_only";
      record.github_sync_enabled = false;
    }
    const existingIndex = tasksState.tasks.findIndex((item) => String(item.id || "") === taskId || String(item.planner_plan_id || "") === plan.plan_id);
    if (existingIndex >= 0) tasksState.tasks[existingIndex] = { ...tasksState.tasks[existingIndex], ...record };
    else tasksState.tasks.push(record);
    createdTasks.push(record);
  }
  const existingTaskIds = new Set(createdTasks.map((task) => task.id));
  for (const task of tasksState.tasks) {
    if (String(task.planner_plan_id || "") === plan.plan_id && !existingTaskIds.has(task.id)) {
      task.evolution_change_id = changeId;
    }
  }
  if (changeId) {
    const evolutionStateTaskTargets = createdTasks.map((task) => task.id);
    const idx = Array.isArray(evolutionState.changes)
      ? evolutionState.changes.findIndex((item) => String(item.change_id || "") === changeId)
      : -1;
    if (idx >= 0) {
      evolutionState.changes[idx].task_ids = evolutionStateTaskTargets;
      evolutionState.changes[idx].updated_at = now;
    }
    const impactIdx = Array.isArray(evolutionState.impact_plans)
      ? evolutionState.impact_plans.findIndex((item) => String(item.change_id || "") === changeId)
      : -1;
    if (impactIdx >= 0) {
      evolutionState.impact_plans[impactIdx].tasks = createdTasks.map((task) => ({
        task_id: task.id,
        title: task.title,
        allowed_files: Array.isArray(task.allowed_files) ? [...task.allowed_files] : [],
        validation_commands: Array.isArray(task.validation_commands) ? [...task.validation_commands] : []
      }));
      evolutionState.impact_plans[impactIdx].updated_at = now;
    }
  }
  return createdTasks;
}

function buildPlannerMaterializationReport({ plan, materialization, evolutionRecord, taskRecords, reportPath, materializedAt }) {
  return {
    report_type: "kvdf_planner_materialization",
    generated_at: materializedAt,
    plan_id: plan.plan_id,
    planner_mode: plan.planner_mode,
    track: plan.track,
    delivery_mode: plan.delivery_mode,
    status: "materialized",
    evolution: {
      change_id: evolutionRecord.change_id,
      title: evolutionRecord.title,
      status: evolutionRecord.status,
      planner_plan_id: plan.plan_id,
      area: evolutionRecord.impacted_areas && evolutionRecord.impacted_areas.length ? evolutionRecord.impacted_areas[0] : null
    },
    task_punch: {
      tasks_created: taskRecords.length,
      task_ids: taskRecords.map((task) => task.id)
    },
    report_path: reportPath.replace(/\\/g, "/"),
    next_action: "Run kvdf planner prompt --from-current --json, then execute the first approved task slice.",
    visual: plan.visual || null,
    allowed_files: materialization.evolution_plan ? materialization.evolution_plan.allowed_files || [] : [],
    forbidden_files: materialization.evolution_plan ? materialization.evolution_plan.forbidden_files || [] : [],
    validation_commands: materialization.evolution_plan ? materialization.evolution_plan.validation_commands || [] : [],
    stop_condition: materialization.evolution_plan ? materialization.evolution_plan.stop_condition || "" : ""
  };
}

function normalizePlannerStatus(value) {
  const status = String(value || "proposed").trim().toLowerCase();
  return PLANNER_STATUSES.has(status) ? status : "proposed";
}

function normalizePlannerMode(value) {
  const mode = String(value || "owner").trim().toLowerCase();
  if (mode === "vibe" || mode === "plugin") return mode;
  return "owner";
}

function normalizePlannerTrack(value) {
  const track = String(value || "framework_owner").trim().toLowerCase();
  if (track === "vibe_app_developer" || track === "plugin") return track;
  return "framework_owner";
}

function allocatePlannerPlanId(state = {}) {
  const existingIds = Array.isArray(state.plans) ? state.plans.map((plan) => String(plan.plan_id || "")).filter(Boolean) : [];
  let maxIndex = 0;
  for (const id of existingIds) {
    const match = /^planner-plan-(\d{3,})$/i.exec(id);
    if (!match) continue;
    const index = Number(match[1]);
    if (Number.isFinite(index) && index > maxIndex) maxIndex = index;
  }
  return `planner-plan-${String(maxIndex + 1).padStart(3, "0")}`;
}

function findPlannerPlan(state = {}, planId = "") {
  const id = String(planId || "").trim();
  if (!id) return null;
  return Array.isArray(state.plans) ? state.plans.find((plan) => String(plan.plan_id || "") === id) || null : null;
}

function findCurrentPlannerPlan(state = {}) {
  if (!state || !Array.isArray(state.plans)) return null;
  const currentId = String(state.current_plan_id || "").trim();
  const currentPlan = currentId ? findPlannerPlan(state, currentId) : null;
  if (currentPlan && String(currentPlan.status || "").toLowerCase() === "approved") return currentPlan;
  return state.plans.find((plan) => String(plan.status || "").toLowerCase() === "approved") || null;
}

function resolvePlanId(value, flags = {}, rest = []) {
  const candidates = [value, flags.plan_id, flags.planId, flags.plan, rest.find((item) => !String(item || "").startsWith("--"))];
  const planId = candidates.find((item) => typeof item === "string" && item.trim());
  return planId ? String(planId).trim() : "";
}

function resolveApprovalOwner(flags = {}) {
  return String(flags.owner || flags.approver || flags.by || "").trim();
}

function resolveRejectReason(flags = {}, rest = []) {
  const candidates = [flags.reason, flags.message, rest.filter((item) => typeof item === "string" && !String(item).startsWith("--")).join(" ")];
  const reason = candidates.find((item) => typeof item === "string" && item.trim());
  return reason ? String(reason).trim() : "";
}

function resolveCompleteNote(flags = {}, rest = []) {
  const candidates = [flags.note, flags.message, rest.filter((item) => typeof item === "string" && !String(item).startsWith("--")).join(" ")];
  const note = candidates.find((item) => typeof item === "string" && item.trim());
  return note ? String(note).trim() : "";
}

function resolveBooleanFlag(value) {
  if (value === true) return true;
  if (value === false || value == null) return false;
  const normalized = String(value).trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
}

function isFromCurrentPlan(flags = {}) {
  return Boolean(flags["from-current"] || flags.fromCurrent || flags.from_current);
}

function escapeQuotes(value) {
  return String(value || "").replace(/"/g, '\\"');
}

function renderPlannerNextReport(report, tableRenderer) {
  const rows = [
    ["Planner mode", report.planner_mode],
    ["Track", report.track],
    ["Delivery mode", report.delivery_mode],
    ["Recommended evolution", report.recommended_evolution.title],
    ["Area", report.recommended_evolution.area],
    ["Risk", report.recommended_evolution.risk],
    ["Next action", report.next_action]
  ];
  const lines = [
    "KVDF Planner Next",
    "",
    tableRenderer(["Field", "Value"], rows),
    "",
    "Out of scope:",
    ...(report.out_of_scope || []).map((item) => `- ${item}`),
    "",
    "Allowed files:",
    ...(report.allowed_files || []).map((item) => `- ${item}`),
    "",
    "Forbidden files:",
    ...(report.forbidden_files || []).map((item) => `- ${item}`),
    "",
    "Validation commands:",
    ...(report.validation_commands || []).map((item) => `- ${item}`),
    "",
    "Task Punch:",
    ...((report.task_punch && report.task_punch.tasks) || []).map((task) => `- ${task.id}: ${task.title} (${task.status})`),
    "",
    `Stop condition: ${report.stop_condition}`
  ];
  if (report.pipeline) {
    lines.splice(4, 0, "", "Pipeline:", ...report.pipeline.map((step) => `- ${step}`));
  }
  if (report.plugin_context) {
    lines.splice(4, 0, "", "Plugin context:", tableRenderer(["Field", "Value"], [
      ["Plugin", report.plugin_context.plugin_id || ""],
      ["Family", report.plugin_context.plugin_family || ""],
      ["Type", report.plugin_context.plugin_type || ""],
      ["Enabled by default", report.plugin_context.enabled_by_default ? "yes" : "no"],
      ["Removable", report.plugin_context.removable ? "yes" : "no"]
    ]));
  }
  return lines.join("\n");
}

function renderPlannerEvolutionPlan(report, tableRenderer) {
  const plan = report.evolution_plan || report;
  const rows = [
    ["Planner mode", plan.planner_mode],
    ["Evolution", plan.title],
    ["Track", plan.track],
    ["Delivery mode", plan.delivery_mode],
    ["Area", plan.area],
    ["Next action", plan.next_action]
  ];
  const lines = [
    "KVDF Planner Evolution Plan",
    "",
    tableRenderer(["Field", "Value"], rows),
    "",
    "In scope:",
    ...(plan.in_scope || []).map((item) => `- ${item}`),
    "",
    "Out of scope:",
    ...(plan.out_of_scope || []).map((item) => `- ${item}`),
    "",
    "Allowed files:",
    ...(plan.allowed_files || []).map((item) => `- ${item}`),
    "",
    "Forbidden files:",
    ...(plan.forbidden_files || []).map((item) => `- ${item}`),
    "",
    "Validation commands:",
    ...(plan.validation_commands || []).map((item) => `- ${item}`),
    "",
    `Stop condition: ${plan.stop_condition}`
  ];
  if (plan.pipeline) {
    lines.splice(4, 0, "", "Pipeline:", ...plan.pipeline.map((step) => `- ${step}`));
  }
  if (plan.plugin_context) {
    lines.splice(4, 0, "", "Plugin context:", tableRenderer(["Field", "Value"], [
      ["Plugin", plan.plugin_context.plugin_id || ""],
      ["Family", plan.plugin_context.plugin_family || ""],
      ["Type", plan.plugin_context.plugin_type || ""],
      ["Enabled by default", plan.plugin_context.enabled_by_default ? "yes" : "no"],
      ["Removable", plan.plugin_context.removable ? "yes" : "no"]
    ]));
  }
  return lines.join("\n");
}

function renderPlannerPromptReport(report) {
  return report.prompt;
}

function renderPlannerVisualReport(report) {
  return report.markdown_report;
}

function renderPlannerMaterializationReport(report, tableRenderer) {
  const rows = [
    ["Plan ID", report.plan_id || ""],
    ["Planner mode", report.planner_mode || ""],
    ["Track", report.track || ""],
    ["Delivery mode", report.delivery_mode || ""],
    ["Status", report.status || ""],
    ["Evolution", report.evolution && report.evolution.change_id ? report.evolution.change_id : ""]
  ];
  const taskIds = Array.isArray(report.task_punch && report.task_punch.task_ids) ? report.task_punch.task_ids : [];
  return [
    "KVDF Planner Materialization",
    "",
    tableRenderer(["Field", "Value"], rows),
    "",
    "Evolution:",
    `- Change ID: ${report.evolution && report.evolution.change_id ? report.evolution.change_id : ""}`,
    `- Title: ${report.evolution && report.evolution.title ? report.evolution.title : ""}`,
    `- Status: ${report.evolution && report.evolution.status ? report.evolution.status : ""}`,
    `- Planner plan: ${report.evolution && report.evolution.planner_plan_id ? report.evolution.planner_plan_id : ""}`,
    "",
    "Task Punch:",
    `- Tasks created: ${report.task_punch && typeof report.task_punch.tasks_created === "number" ? report.task_punch.tasks_created : 0}`,
    ...(taskIds.length ? taskIds.map((taskId) => `- ${taskId}`) : ["- None"]),
    "",
    "Validation commands:",
    ...(report.validation_commands || []).map((command) => `- ${command}`),
    "",
    `Stop condition: ${report.stop_condition || ""}`,
    "",
    `Report path: ${report.report_path || ""}`,
    "",
    `Next action: ${report.next_action || ""}`
  ].join("\n");
}

function renderPlannerStateSummaryReport(report, tableRenderer) {
  const rows = [];
  if (report.plan_id) rows.push(["Plan ID", report.plan_id]);
  if (report.status) rows.push(["Status", report.status]);
  if (report.planner_mode) rows.push(["Planner mode", report.planner_mode]);
  if (report.track) rows.push(["Track", report.track]);
  if (report.delivery_mode) rows.push(["Delivery mode", report.delivery_mode]);
  if (report.current_plan_id) rows.push(["Current plan", report.current_plan_id]);
  if (report.rejection_reason) rows.push(["Rejection reason", report.rejection_reason]);
  if (report.current_plan && report.current_plan.goal) rows.push(["Current goal", report.current_plan.goal]);
  if (report.next_action) rows.push(["Next action", report.next_action]);
  return [
    "KVDF Planner State",
    "",
    tableRenderer(["Field", "Value"], rows)
  ].join("\n");
}

function renderPlannerPromptFromPlan(plan, context) {
  const goal = plan.goal || (plan.recommended_evolution && plan.recommended_evolution.title) || "Approved planner plan";
  const mode = normalizePlannerMode(plan.planner_mode);
  const pluginContext = mode === "plugin"
    ? (plan.plugin_context || buildPluginContext({ plugin_id: plan.recommended_evolution && plan.recommended_evolution.plugin_context && plan.recommended_evolution.plugin_context.plugin_id }, context))
    : null;
  const evolutionPlan = plan.recommended_evolution && Object.keys(plan.recommended_evolution).length
    ? plan.recommended_evolution
    : buildPlannerEvolutionPlan(goal, { mode, deliveryMode: plan.delivery_mode, pluginContext }, context);
  const taskPunch = plan.task_punch && Array.isArray(plan.task_punch.tasks) && plan.task_punch.tasks.length
    ? plan.task_punch
    : buildPlannerTaskPunch(evolutionPlan, { mode, deliveryMode: plan.delivery_mode, pluginContext }, context);
  return renderCodexPrompt({
    goal,
    mode,
    plan: evolutionPlan,
    taskPunch,
    context,
    pluginContext
  });
}

function renderPlannerTaskPunchReport(report, tableRenderer) {
  const rows = (report.tasks || []).map((task) => [
    task.id,
    task.title,
    task.status,
    String((task.allowed_files || []).length)
  ]);
  return [
    "KVDF Planner Task Punch",
    "",
    tableRenderer(["Task ID", "Title", "Status", "Allowed files"], rows),
    "",
    `Planner mode: ${report.planner_mode || ""}`,
    `Track: ${report.track || ""}`,
    `Delivery mode: ${report.delivery_mode || ""}`,
    `Evolution: ${report.evolution_id || ""}`
  ].join("\n");
}

module.exports = {
  planner,
  buildPlannerNextReport,
  buildPlannerPromptReport,
  buildPlannerEvolutionReport,
  buildPlannerTaskPunchReport,
  buildPlannerVisualReport,
  buildPlannerVisualFromCurrentReport,
  buildPlannerEvolutionPlan,
  renderPlannerNextReport,
  renderPlannerEvolutionPlan,
  renderPlannerPromptReport,
  renderPlannerTaskPunchReport,
  renderPlannerVisualReport
};
