const fs = require("fs");
const path = require("path");

const { repoRoot } = require("../fs_utils");
const { readJsonFile, writeJsonFile } = require("../workspace");
const {
  resolveWorkspaceRoot,
  summarizeWorkspaceContract,
  validateDeveloperAppWorkspace,
  normalizeSurfaceScopes
} = require("./app_workspace_contract");

const SCORECARD_FILE = ".kabeeri/scorecards.json";

const BASELINE_SCORECARD_BLUEPRINTS = [
  {
    card_id: "workspace_scope",
    title: "Workspace scope and boundary",
    category: "workspace",
    scope: "workspace",
    description: "Check that the app workspace boundary is valid and that unrelated work is blocked or linked intentionally.",
    applicable_to: ["all"],
    next_action: "Keep the workspace contract compliant."
  },
  {
    card_id: "planning",
    title: "Planning pack and approval",
    category: "planning",
    scope: "workspace",
    description: "Check that the planning pack exists, has been reviewed, and is approved before tasks are generated.",
    applicable_to: ["all"],
    next_action: "Review and approve the planning pack before task generation."
  },
  {
    card_id: "data_design",
    title: "Data design readiness",
    category: "data",
    scope: "workspace",
    description: "Check that data design exists for stateful or backend-heavy work and that the model is ready for implementation.",
    applicable_to: ["all"],
    next_action: "Capture the data design details required for implementation."
  },
  {
    card_id: "ui_ux",
    title: "UI and UX direction",
    category: "ui_ux",
    scope: "workspace",
    description: "Check that the product has a clear interface direction for website, mobile, or admin surfaces when they are in scope.",
    applicable_to: ["website", "mobile", "admin", "shared"],
    next_action: "Confirm the UI/UX direction for each active surface."
  },
  {
    card_id: "task_readiness",
    title: "Task readiness",
    category: "tasks",
    scope: "workspace",
    description: "Check that approved planning actually produces executable tasks and that the task set is not empty when work should proceed.",
    applicable_to: ["all"],
    next_action: "Generate tasks from the approved planning pack."
  },
  {
    card_id: "execution",
    title: "Execution health",
    category: "execution",
    scope: "workspace",
    description: "Check whether work is actively moving through the governed task pipeline and whether execution is blocked.",
    applicable_to: ["all"],
    next_action: "Move approved work through the governed task pipeline."
  },
  {
    card_id: "validation",
    title: "Validation and evidence",
    category: "validation",
    scope: "workspace",
    description: "Check whether the app can be validated against the plan, evidence, and task lifecycle before handoff.",
    applicable_to: ["all"],
    next_action: "Run validation and attach evidence before handoff."
  },
  {
    card_id: "release_readiness",
    title: "Release readiness",
    category: "release",
    scope: "workspace",
    description: "Check whether the workspace is ready to hand off or release after validation and governance checks pass.",
    applicable_to: ["all"],
    next_action: "Complete validation, evidence, and handoff checks before release."
  }
];

function readAppScorecardState(workspaceRootOrSlug) {
  const workspaceRoot = resolveWorkspaceRoot(workspaceRootOrSlug || currentWorkspaceRoot());
  if (!workspaceRoot) return null;
  const target = path.join(workspaceRoot, SCORECARD_FILE);
  if (!fs.existsSync(target)) return null;
  const relative = path.relative(repoRoot(), target).replace(/\\/g, "/");
  const state = readJsonFile(relative);
  state.cards = Array.isArray(state.cards) ? state.cards : [];
  state.surface_cards = Array.isArray(state.surface_cards) ? state.surface_cards : [];
  state.review_state = state.review_state || { status: "draft" };
  state.summary = state.summary || {};
  return state;
}

function seedAppScorecardState(workspaceRootOrSlug, options = {}) {
  const workspaceRoot = resolveWorkspaceRoot(workspaceRootOrSlug || currentWorkspaceRoot());
  if (!workspaceRoot) throw new Error("Missing app workspace root.");
  const contract = validateDeveloperAppWorkspace(workspaceRoot);
  const metadata = readWorkspaceMetadata(workspaceRoot);
  const existing = readAppScorecardState(workspaceRoot);
  const state = existing || {
    version: "v1",
    generated_at: null,
    workspace_root: contract.workspace_root,
    workspace_slug: contract.workspace_slug,
    workspace_kind: metadata.workspace_kind || "developer_app",
    app_slug: metadata.app_slug || contract.workspace_slug,
    app_name: metadata.app_name || contract.workspace_slug,
    app_type: metadata.app_type || contract.app_type || "application",
    surface_scopes: normalizeSurfaceScopes(metadata.surface_scopes || contract.surface_scopes, metadata.app_type || contract.app_type || "application"),
    linked_workspace_roots: contract.linked_workspace_roots || [],
    current_plan_id: null,
    review_state: {
      status: "draft",
      reviewed_at: null,
      reviewed_by: null,
      locked_at: null,
      locked_by: null,
      notes: []
    },
    cards: [],
    surface_cards: [],
    summary: {}
  };
  state.cards = state.cards.length ? state.cards : buildBaselineScorecards(contract, state, options);
  state.surface_cards = state.surface_cards.length ? state.surface_cards : buildSurfaceScorecards(contract, state, options);
  state.generated_at = state.generated_at || new Date().toISOString();
  state.summary = summarizeAppScorecards(state);
  writeAppScorecardState(workspaceRoot, state);
  return state;
}

function refreshAppScorecards(workspaceRootOrSlug, options = {}) {
  const workspaceRoot = resolveWorkspaceRoot(workspaceRootOrSlug || currentWorkspaceRoot());
  if (!workspaceRoot) return null;
  const contract = validateDeveloperAppWorkspace(workspaceRoot);
  const metadata = readWorkspaceMetadata(workspaceRoot);
  const state = seedAppScorecardState(workspaceRoot, options);
  const planning = readPlanningPack(workspaceRoot);
  const tasks = readTasks(workspaceRoot);
  const workspaceSummary = summarizeWorkspaceContract(contract);
  const locked = Boolean(state.review_state && state.review_state.status === "locked");
  const nextState = {
    ...state,
    workspace_root: contract.workspace_root,
    workspace_slug: contract.workspace_slug,
    workspace_kind: metadata.workspace_kind || "developer_app",
    app_slug: metadata.app_slug || contract.workspace_slug,
    app_name: metadata.app_name || contract.workspace_slug,
    app_type: metadata.app_type || contract.app_type || "application",
    surface_scopes: normalizeSurfaceScopes(metadata.surface_scopes || contract.surface_scopes, metadata.app_type || contract.app_type || "application"),
    linked_workspace_roots: contract.linked_workspace_roots || [],
    current_plan_id: planning.current_plan_id || null,
    planning_status: planning.summary.approval_status,
    cards: buildBaselineScorecards(contract, { ...state, ...metadata, current_plan_id: planning.current_plan_id }, { planning, tasks, workspaceSummary }),
    surface_cards: buildSurfaceScorecards(contract, { ...state, ...metadata, current_plan_id: planning.current_plan_id }, { planning, tasks, workspaceSummary }),
    generated_at: new Date().toISOString(),
    review_state: {
      ...(state.review_state || { status: "draft" }),
      status: locked ? "locked" : (state.review_state && state.review_state.status) || "draft"
    }
  };
  nextState.summary = summarizeAppScorecards(nextState);
  nextState.next_exact_action = nextState.summary.next_exact_action;
  writeAppScorecardState(workspaceRoot, nextState);
  return nextState;
}

function reviewAppScorecards(workspaceRootOrSlug, options = {}) {
  const state = refreshAppScorecards(workspaceRootOrSlug, options);
  if (!state) return null;
  state.review_state = state.review_state || { status: "draft" };
  state.review_state.status = "reviewed";
  state.review_state.reviewed_at = new Date().toISOString();
  state.review_state.reviewed_by = options.by || options.actor || "local-user";
  state.review_state.notes = uniqueList([...(state.review_state.notes || []), options.note || options.summary || "App scorecards reviewed."]);
  state.summary = summarizeAppScorecards(state);
  writeAppScorecardState(resolveWorkspaceRoot(workspaceRootOrSlug || currentWorkspaceRoot()), state);
  return state;
}

function lockAppScorecards(workspaceRootOrSlug, options = {}) {
  const state = refreshAppScorecards(workspaceRootOrSlug, options);
  if (!state) return null;
  state.review_state = state.review_state || { status: "draft" };
  state.review_state.status = "locked";
  state.review_state.locked_at = new Date().toISOString();
  state.review_state.locked_by = options.by || options.actor || "local-user";
  state.review_state.notes = uniqueList([...(state.review_state.notes || []), options.note || options.summary || "App scorecards locked."]);
  state.summary = summarizeAppScorecards(state);
  writeAppScorecardState(resolveWorkspaceRoot(workspaceRootOrSlug || currentWorkspaceRoot()), state);
  return state;
}

function summarizeAppScorecards(state) {
  const cards = [...(state.cards || []), ...(state.surface_cards || [])];
  const total = cards.length;
  const counts = cards.reduce((acc, card) => {
    const status = String(card.status || "unknown").toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    if (["ready", "approved", "active", "locked"].includes(status)) acc.ready += 1;
    if (["pending", "reviewed"].includes(status)) acc.pending += 1;
    if (["blocked"].includes(status)) acc.blocked += 1;
    if (["not_applicable"].includes(status)) acc.not_applicable += 1;
    acc.total_score += Number(card.score || 0);
    return acc;
  }, { total: 0, ready: 0, pending: 0, blocked: 0, not_applicable: 0, total_score: 0 });
  const average_score = total ? Number((counts.total_score / total).toFixed(2)) : 0;
  const baseline_ready = (state.cards || []).every((card) => ["ready", "approved", "active", "locked", "not_applicable"].includes(String(card.status || "").toLowerCase()));
  const release_ready = baseline_ready && counts.blocked === 0 && counts.pending === 0;
  const next_exact_action = release_ready
    ? "kvdf app workspace validate"
    : (cards.find((item) => ["blocked", "pending"].includes(String(item.status || "").toLowerCase())) || {}).next_action || "kvdf questionnaire review";
  return {
    total,
    ready: counts.ready,
    pending: counts.pending,
    blocked: counts.blocked,
    not_applicable: counts.not_applicable,
    average_score,
    baseline_ready,
    release_ready,
    next_exact_action
  };
}

function buildBaselineScorecards(contract, state = {}, context = {}) {
  const workspaceSummary = context.workspaceSummary || summarizeWorkspaceContract(contract);
  const planning = context.planning || readPlanningPack(resolveWorkspaceRoot(contract.workspace_root || state.workspace_root));
  const tasks = context.tasks || readTasks(resolveWorkspaceRoot(contract.workspace_root || state.workspace_root));
  const surfaceScopes = Array.isArray(state.surface_scopes) ? state.surface_scopes : [];
  return BASELINE_SCORECARD_BLUEPRINTS.map((blueprint) => evaluateScorecardBlueprint(blueprint, {
    contract,
    workspaceSummary,
    planning,
    tasks,
    surfaceScopes,
    state
  }));
}

function buildSurfaceScorecards(contract, state = {}, context = {}) {
  const surfaceScopes = Array.isArray(state.surface_scopes) && state.surface_scopes.length ? state.surface_scopes : normalizeSurfaceScopes(state.surface_scopes, state.app_type || contract.app_type || "application");
  const planning = context.planning || readPlanningPack(resolveWorkspaceRoot(contract.workspace_root || state.workspace_root));
  const tasks = context.tasks || readTasks(resolveWorkspaceRoot(contract.workspace_root || state.workspace_root));
  const workspaceSummary = context.workspaceSummary || summarizeWorkspaceContract(contract);
  const cards = [];
  for (const scope of surfaceScopes) {
    const blueprint = {
      card_id: `surface_${scope}`,
      title: `${capitalize(scope)} surface readiness`,
      category: "surface",
      scope,
      description: `Check readiness for the ${scope} surface inside the current workspace.`,
      applicable_to: [scope],
      next_action: `Keep the ${scope} surface aligned with the approved planning pack.`
    };
    cards.push(evaluateScorecardBlueprint(blueprint, {
      contract,
      planning,
      tasks,
      workspaceSummary,
      surfaceScopes,
      state,
      surface_scope: scope
    }));
  }
  return cards;
}

function evaluateScorecardBlueprint(blueprint, context = {}) {
  const workspaceSummary = context.workspaceSummary || {};
  const planning = context.planning || { summary: { approval_status: "pending", review_status: "pending" }, plans: [] };
  const tasks = context.tasks || [];
  const status = evaluateScorecardStatus(blueprint.card_id, context);
  return {
    card_id: blueprint.card_id,
    title: blueprint.title,
    category: blueprint.category,
    scope: blueprint.scope,
    group: blueprint.category === "surface" ? "surface" : "baseline",
    description: blueprint.description,
    applicable_to: blueprint.applicable_to,
    status: status.status,
    score: status.score,
    band: scorecardBand(status.score),
    reason: status.reason,
    next_action: status.next_action || blueprint.next_action,
    evidence: status.evidence,
    planning_status: planning.summary ? planning.summary.approval_status : "pending",
    task_count: tasks.length,
    workspace_boundary_status: workspaceSummary.boundary_status || "unknown",
    source_plan_id: planning.current_plan_id || null,
    updated_at: new Date().toISOString()
  };
}

function evaluateScorecardStatus(cardId, context = {}) {
  const contract = context.contract || {};
  const planning = context.planning || { plans: [], summary: { approval_status: "pending", review_status: "pending" } };
  const tasks = Array.isArray(context.tasks) ? context.tasks : [];
  const surfaceScope = context.surface_scope || null;
  const surfaceTasks = surfaceScope ? tasks.filter((task) => matchesSurfaceTask(task, surfaceScope)) : tasks;
  const approvedPlan = planning.summary ? planning.summary.approval_status === "approved" : false;
  const reviewedPlan = planning.summary ? planning.summary.review_status === "reviewed" : false;
  const hasTasks = surfaceTasks.length > 0;
  const inProgress = surfaceTasks.some((task) => ["ready", "assigned", "in_progress", "execution", "validation"].includes(normalizeStatus(task.status)));
  const validated = surfaceTasks.length > 0 && surfaceTasks.every((task) => ["owner_verified", "done", "closed"].includes(normalizeStatus(task.status)));
  const blockedTasks = surfaceTasks.filter((task) => ["blocked", "rejected"].includes(normalizeStatus(task.status)));
  const complianceReady = contract.status === "compliant";

  if (cardId === "workspace_scope") {
    return complianceReady
      ? { status: "ready", score: 5, reason: "Workspace contract is compliant.", evidence: ["developer_app_workspace_validation"] }
      : { status: "blocked", score: 1, reason: "Workspace contract needs attention.", evidence: ["developer_app_workspace_validation"], next_action: contract.next_exact_action || "kvdf app workspace validate" };
  }
  if (cardId === "planning") {
    if (approvedPlan) return { status: "approved", score: 5, reason: "Planning pack is approved.", evidence: [planning.current_plan_id || "adaptive_intake_plan"] };
    if (reviewedPlan) return { status: "reviewed", score: 3, reason: "Planning pack has been reviewed and waits for approval.", evidence: [planning.current_plan_id || "adaptive_intake_plan"], next_action: "kvdf questionnaire approve --confirm" };
    if (planning.plans && planning.plans.length) return { status: "pending", score: 1.5, reason: "Planning pack exists but has not been reviewed yet.", evidence: [planning.current_plan_id || "adaptive_intake_plan"], next_action: "kvdf questionnaire review" };
    return { status: "pending", score: 0.5, reason: "Planning pack has not been created yet.", evidence: [], next_action: "kvdf questionnaire plan \"Describe the project in one sentence\"" };
  }
  if (cardId === "data_design") {
    const dataFile = readWorkspaceJson(context.workspace_root || contract.workspace_root, "data_design.json");
    if (dataFile && (Array.isArray(dataFile.contexts) ? dataFile.contexts.length > 0 : Boolean(dataFile.current_context))) {
      return { status: "ready", score: 4, reason: "Data design context exists.", evidence: [".kabeeri/data_design.json"] };
    }
    if (approvedPlan) return { status: "pending", score: 2, reason: "Planning is approved but data design still needs to be recorded.", evidence: [planning.current_plan_id || "adaptive_intake_plan"], next_action: "Capture the data model in .kabeeri/data_design.json" };
    return { status: "pending", score: 1, reason: "Data design is not ready yet.", evidence: [], next_action: "Approve the planning pack before capturing data design details." };
  }
  if (cardId === "ui_ux") {
    const needsUi = Array.isArray(context.surfaceScopes) && context.surfaceScopes.some((scope) => ["website", "mobile", "admin"].includes(scope));
    if (!needsUi) return { status: "not_applicable", score: 5, reason: "The workspace is not delivering a UI-heavy surface.", evidence: ["surface_scopes"] };
    if (blockedTasks.length) return { status: "blocked", score: 1.5, reason: "Surface tasks are blocked.", evidence: blockedTasks.map((task) => task.id), next_action: "Resolve blocked surface tasks first." };
    if (hasTasks && approvedPlan) return { status: "ready", score: 4, reason: "Surface work has approved planning and executable tasks.", evidence: surfaceTasks.map((task) => task.id), next_action: "Keep the surface tasks aligned with the approved design direction." };
    if (reviewedPlan) return { status: "reviewed", score: 3, reason: "Surface direction is reviewed but not fully task-backed.", evidence: [planning.current_plan_id || "adaptive_intake_plan"], next_action: "Generate or refine surface tasks." };
    return { status: "pending", score: 1, reason: "UI/UX direction still needs planning approval.", evidence: [], next_action: "Review and approve the planning pack." };
  }
  if (cardId === "task_readiness") {
    if (!approvedPlan) return { status: "pending", score: 1, reason: "Task generation waits for an approved planning pack.", evidence: [planning.current_plan_id || "adaptive_intake_plan"], next_action: "Approve the planning pack before generating tasks." };
    if (!hasTasks) return { status: "blocked", score: 1.5, reason: "The planning pack is approved but no tasks exist yet.", evidence: [planning.current_plan_id || "adaptive_intake_plan"], next_action: "Run `kvdf questionnaire generate-tasks`." };
    return { status: "ready", score: 4.5, reason: "Approved planning has produced executable tasks.", evidence: surfaceTasks.map((task) => task.id), next_action: "Keep task execution synchronized with the plan." };
  }
  if (cardId === "execution") {
    if (!hasTasks) return { status: "pending", score: 1, reason: "No task execution has started yet.", evidence: [], next_action: "Generate tasks and begin execution." };
    if (inProgress) return { status: "active", score: 4.2, reason: "At least one surface task is actively moving.", evidence: surfaceTasks.filter((task) => ["assigned", "ready", "in_progress", "execution"].includes(normalizeStatus(task.status))).map((task) => task.id), next_action: "Continue execution within the approved task boundary." };
    if (blockedTasks.length) return { status: "blocked", score: 1.5, reason: "Surface execution is blocked.", evidence: blockedTasks.map((task) => task.id), next_action: "Unblock the stalled tasks before continuing." };
    return { status: approvedPlan ? "ready" : "pending", score: approvedPlan ? 3.6 : 1.2, reason: approvedPlan ? "Tasks exist and are ready for governed execution." : "Tasks exist but the planning gate is not approved yet.", evidence: surfaceTasks.map((task) => task.id), next_action: approvedPlan ? "Keep execution synchronized with the approved task set." : "Approve the planning pack before execution." };
  }
  if (cardId === "validation") {
    if (!hasTasks) return { status: "pending", score: 1, reason: "No tasks exist to validate yet.", evidence: [], next_action: "Generate tasks before validation." };
    if (validated) return { status: "ready", score: 4.6, reason: "All surface tasks are closed or owner-verified.", evidence: surfaceTasks.map((task) => task.id), next_action: "Use the validation evidence for handoff." };
    if (blockedTasks.length) return { status: "blocked", score: 1.5, reason: "Some surface tasks are blocked or rejected.", evidence: blockedTasks.map((task) => task.id), next_action: "Resolve blocked validation findings first." };
    return { status: "reviewed", score: 3.2, reason: "Validation is in progress but not yet closed.", evidence: surfaceTasks.map((task) => task.id), next_action: "Finish verification and collect evidence." };
  }
  if (cardId === "release_readiness") {
    const ready = complianceReady && approvedPlan && hasTasks && validated && !blockedTasks.length;
    if (ready) return { status: "ready", score: 5, reason: "Workspace contract, planning, execution, and validation are aligned.", evidence: [".kabeeri/project.json", ".kabeeri/questionnaires/adaptive_intake_plan.json", ".kabeeri/tasks.json"], next_action: "Proceed with handoff or release." };
    if (!approvedPlan) return { status: "pending", score: 1, reason: "Release waits for planning approval.", evidence: [], next_action: "Approve the planning pack." };
    if (!hasTasks) return { status: "blocked", score: 1.5, reason: "No executable tasks exist for release.", evidence: [planning.current_plan_id || "adaptive_intake_plan"], next_action: "Generate tasks from the approved planning pack." };
    if (!validated) return { status: "blocked", score: 2, reason: "Execution is not fully validated yet.", evidence: surfaceTasks.map((task) => task.id), next_action: "Complete validation evidence before release." };
    return { status: "reviewed", score: 3.5, reason: "The workspace is close to release but still needs a final check.", evidence: surfaceTasks.map((task) => task.id), next_action: "Perform the final handoff check." };
  }
  const surfaceRelated = surfaceTasks.length;
  return {
    status: surfaceRelated ? "reviewed" : "pending",
    score: surfaceRelated ? 3 : 1,
    reason: surfaceRelated ? "Surface work exists." : "No surface work exists yet.",
    evidence: surfaceTasks.map((task) => task.id),
    next_action: surfaceRelated ? "Keep the surface tasks synchronized." : "Create the surface tasks."
  };
}

function writeAppScorecardState(workspaceRootOrSlug, state) {
  const workspaceRoot = resolveWorkspaceRoot(workspaceRootOrSlug || currentWorkspaceRoot());
  if (!workspaceRoot) return null;
  const target = path.join(workspaceRoot, SCORECARD_FILE);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  writeJsonFile(path.relative(repoRoot(), target).replace(/\\/g, "/"), state);
  return state;
}

function buildAppScorecardReport(workspaceRootOrSlug, options = {}) {
  const state = refreshAppScorecards(workspaceRootOrSlug, options) || seedAppScorecardState(workspaceRootOrSlug, options);
  return {
    report_type: "developer_app_scorecards",
    generated_at: state.generated_at || new Date().toISOString(),
    workspace_root: state.workspace_root,
    workspace_slug: state.workspace_slug,
    app_name: state.app_name,
    app_type: state.app_type,
    surface_scopes: state.surface_scopes,
    planning_status: state.planning_status || (state.summary ? state.summary.planning_status : "pending"),
    review_state: state.review_state,
    summary: state.summary,
    cards: state.cards,
    surface_cards: state.surface_cards,
    next_exact_action: state.summary ? state.summary.next_exact_action : "kvdf questionnaire review"
  };
}

function buildAppScorecardSummaryLine(state) {
  const summary = state.summary || {};
  return `Scorecards: ${summary.total || 0} total, ${summary.ready || 0} ready, ${summary.pending || 0} pending, ${summary.blocked || 0} blocked`;
}

function buildAppScorecardTableRows(state) {
  return [...(state.cards || []), ...(state.surface_cards || [])].map((card) => [
    card.card_id,
    card.title,
    card.category || card.group || "",
    card.scope || "",
    card.status || "",
    Number(card.score || 0).toFixed(1),
    card.next_action || ""
  ]);
}

function readPlanningPack(workspaceRoot) {
  const target = workspaceRoot ? path.join(workspaceRoot, ".kabeeri", "questionnaires", "adaptive_intake_plan.json") : null;
  if (!target || !fs.existsSync(target)) {
    return { plans: [], current_plan_id: null, summary: { approval_status: "pending", review_status: "pending" } };
  }
  const state = readJsonFile(path.relative(repoRoot(), target).replace(/\\/g, "/"));
  const plans = Array.isArray(state.plans) ? state.plans : [];
  const current = state.current_plan_id ? plans.find((item) => item.plan_id === state.current_plan_id) || plans[plans.length - 1] || null : plans[plans.length - 1] || null;
  return {
    ...state,
    current_plan_id: state.current_plan_id || (current ? current.plan_id : null),
    summary: {
      review_status: current ? current.review_status || "pending" : "pending",
      approval_status: current ? current.approval_status || "pending" : "pending"
    }
  };
}

function readTasks(workspaceRoot) {
  const target = workspaceRoot ? path.join(workspaceRoot, ".kabeeri", "tasks.json") : null;
  if (!target || !fs.existsSync(target)) return [];
  const state = readJsonFile(path.relative(repoRoot(), target).replace(/\\/g, "/"));
  return Array.isArray(state.tasks) ? state.tasks : [];
}

function readWorkspaceMetadata(workspaceRoot) {
  if (!workspaceRoot) return {};
  const target = path.join(workspaceRoot, ".kabeeri", "workspace.json");
  if (!fs.existsSync(target)) return {};
  return readJsonFile(path.relative(repoRoot(), target).replace(/\\/g, "/"));
}

function readWorkspaceJson(workspaceRoot, fileName) {
  const target = workspaceRoot ? path.join(workspaceRoot, ".kabeeri", fileName) : null;
  if (!target || !fs.existsSync(target)) return null;
  return readJsonFile(path.relative(repoRoot(), target).replace(/\\/g, "/"));
}

function currentWorkspaceRoot() {
  return path.resolve(process.cwd());
}

function scorecardBand(score) {
  const value = Number(score || 0);
  if (value >= 4.5) return "strong";
  if (value >= 3.5) return "watch";
  return "needs_attention";
}

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function matchesSurfaceTask(task, surfaceScope) {
  const normalizedSurface = String(surfaceScope || "").trim().toLowerCase();
  const workstreams = Array.isArray(task.workstreams) ? task.workstreams.map(normalizeStatus) : [];
  const single = normalizeStatus(task.workstream);
  const mapped = surfaceToWorkstreams(normalizedSurface);
  return mapped.some((candidate) => workstreams.includes(candidate) || single === candidate);
}

function surfaceToWorkstreams(surfaceScope) {
  switch (surfaceScope) {
    case "website":
      return ["public_frontend", "frontend"];
    case "admin":
      return ["admin_frontend", "internal_operations_frontend"];
    case "mobile":
      return ["mobile"];
    case "shared":
      return ["shared", "backend", "api", "service", "database", "devops"];
    default:
      return [surfaceScope];
  }
}

function capitalize(value) {
  const text = String(value || "");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

function uniqueList(items = []) {
  return [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))];
}

module.exports = {
  SCORECARD_FILE,
  BASELINE_SCORECARD_BLUEPRINTS,
  buildAppScorecardReport,
  buildAppScorecardSummaryLine,
  buildAppScorecardTableRows,
  evaluateScorecardStatus,
  lockAppScorecards,
  normalizeStatus,
  readAppScorecardState,
  refreshAppScorecards,
  reviewAppScorecards,
  seedAppScorecardState,
  summarizeAppScorecards,
  writeAppScorecardState
};
