const path = require("path");

const { fileExists, repoRoot } = require("../fs_utils");
const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { buildDashboardContracts, validateDashboardContracts } = require("../services/dashboard_contract");
const { buildEvolutionSummary } = require("../services/evolution");
const { readGitRepositoryState, readGitStatus } = require("../services/git_snapshot");
const { readStateArray, summarizeBy } = require("../services/state_utils");
const { readJsonLines } = require("../services/jsonl");
const { buildTaskLifecycleState, buildTaskLifecycleBoard } = require("./task_lifecycle");
const { buildSecurityGateState } = require("./security");
const { summarizeUsage, buildDeveloperEfficiency } = require("./usage_pricing");
const { getPluginRuntimeStatus } = require("../services/plugin_loader");

const UI_UX_INTELLIGENCE_PLUGIN_ID = "ui_ux_intelligence";
const UI_UX_INTELLIGENCE_TARGET_DOCS = [
  "docs/ui-ux/UI_UX_DESIGN.md",
  "docs/ui-ux/UX_PRINCIPLES.md",
  "docs/ui-ux/INFORMATION_ARCHITECTURE.md",
  "docs/ui-ux/USER_FLOWS.md",
  "docs/ui-ux/WIREFRAMES.md",
  "docs/ui-ux/UI_SPECIFICATION.md",
  "docs/ui-ux/ACCESSIBILITY.md",
  "docs/delivery/QA_CHECKLIST.md"
];

function collectDashboardState(options = {}, deps = {}) {
  const {
    getWorkstreamRegistry = () => [],
    buildEvolutionSummary = () => ({ changes_total: 0, open_follow_up_tasks: 0, development_priorities: [], deferred_ideas_total: 0, open_deferred_ideas: 0, status: "empty" }),
    readAgileState = () => ({ backlog: [], epics: [], stories: [], sprint_reviews: [], impediments: [], retrospectives: [], releases: [] }),
    refreshAgileDashboardState = (state) => normalizeAgileDashboardState(state),
    readStructuredState = () => ({ requirements: [], phases: [], milestones: [], deliverables: [], approvals: [], change_requests: [], risks: [], gates: [] }),
    refreshStructuredDashboardState = (state) => normalizeStructuredDashboardState(state),
    readAiRuns = () => [],
    buildAiRunHistoryReport = () => ({ totals: { runs: 0, unreviewed: 0 }, waste_signals: [] }),
    summarizeUsage = () => ({ total_events: 0, total_cost: 0, total_tokens: 0, by_task: {}, by_developer: {}, by_workstream: {}, by_provider: {}, by_sprint: {}, tracked_vs_untracked: { tracked: 0, untracked: 0 } }),
    buildSprintSummary = () => ({ total_cost: 0 }),
    buildDeveloperEfficiency = () => ({})
  } = deps;

  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const apps = readStateArray(".kabeeri/customer_apps.json", "apps");
  const features = readStateArray(".kabeeri/features.json", "features");
  const journeys = readStateArray(".kabeeri/journeys.json", "journeys");
  const tokens = readStateArray(".kabeeri/tokens.json", "tokens");
  const locks = readStateArray(".kabeeri/locks.json", "locks");
  const usageSummary = summarizeUsage();
  const sprints = readStateArray(".kabeeri/sprints.json", "sprints");
  const sessions = readStateArray(".kabeeri/sessions.json", "sessions");
  const developers = readStateArray(".kabeeri/developers.json", "developers");
  const agents = readStateArray(".kabeeri/agents.json", "agents");
  const developerMode = fileExists(".kabeeri/developer_mode.json") ? readJsonFile(".kabeeri/developer_mode.json") : { mode: "unset" };
  const workstreams = getWorkstreamRegistry();
  const policyResults = readStateArray(".kabeeri/policies/policy_results.json", "results");
  const contextPacks = readStateArray(".kabeeri/ai_usage/context_packs.json", "context_packs");
  const preflights = readStateArray(".kabeeri/ai_usage/cost_preflights.json", "preflights");
  const handoffPackages = readStateArray(".kabeeri/handoff/packages.json", "packages");
  const securityScans = readStateArray(".kabeeri/security/security_scans.json", "scans");
  const migrationPlans = readStateArray(".kabeeri/migrations/migration_plans.json", "plans");
  const migrationChecks = readStateArray(".kabeeri/migrations/migration_checks.json", "checks");
  const vibeIntents = readJsonLines(".kabeeri/interactions/user_intents.jsonl");
  const vibeSuggestions = readStateArray(".kabeeri/interactions/suggested_tasks.json", "suggested_tasks");
  const vibeCaptures = readStateArray(".kabeeri/interactions/post_work_captures.json", "captures");
  const vibeSessions = readStateArray(".kabeeri/interactions/vibe_sessions.json", "sessions");
  const contextBriefs = readStateArray(".kabeeri/interactions/context_briefs.json", "briefs");
  const evolutionState = fileExists(".kabeeri/evolution.json") ? readJsonFile(".kabeeri/evolution.json") : { changes: [], impact_plans: [], current_change_id: null };
  const agileState = fileExists(".kabeeri/agile.json") ? readAgileState() : { backlog: [], epics: [], stories: [], sprint_reviews: [], impediments: [], retrospectives: [], releases: [] };
  const agileLiveState = refreshAgileDashboardState(agileState);
  const structuredState = fileExists(".kabeeri/structured.json") ? readStructuredState() : { requirements: [], phases: [], milestones: [], deliverables: [], approvals: [], change_requests: [], risks: [], gates: [] };
  const structuredLiveState = refreshStructuredDashboardState(structuredState);
  const adrRecords = readStateArray(".kabeeri/adr/records.json", "adrs");
  const aiRuns = fileExists(".kabeeri/ai_runs/prompt_runs.jsonl") ? readAiRuns() : [];
  const aiRunReport = fileExists(".kabeeri/ai_runs/prompt_runs.jsonl") ? buildAiRunHistoryReport() : { totals: { runs: 0, unreviewed: 0 }, waste_signals: [] };
  const promptCompositions = readStateArray(".kabeeri/prompt_layer/compositions.json", "compositions");
  const liveReports = fileExists(".kabeeri/reports/live_reports_state.json") ? readJsonFile(".kabeeri/reports/live_reports_state.json") : null;
  const developerEfficiency = buildDeveloperEfficiency();
  const generatedAt = new Date().toISOString();
  const project = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
  const dashboardScope = resolveWorkspaceTrack(project.workspace_kind);
  const dashboardTitle = project.workspace_kind === "developer_app" ? "Vibe Developer Dashboard" : "Kabeeri Development Dashboard";
  const filteredTasks = filterByTrack(tasks, dashboardScope);
  const filteredTokens = filterByTrack(tokens, dashboardScope);
  const filteredLocks = filterByTrack(locks, dashboardScope);
  const filteredSessions = filterByTrack(sessions, dashboardScope);
  const filteredEvolutionState = filterEvolutionState(evolutionState, dashboardScope, project.workspace_kind);
  const evolutionSummary = buildEvolutionSummary(filteredEvolutionState);
  const evolutionAutoCloseout = {
    auto_closed_changes_total: evolutionSummary.auto_closed_changes_total || 0,
    current_milestone_closeout_state: evolutionSummary.current_milestone ? evolutionSummary.current_milestone.closeout_state || "active" : "none"
  };
  const evolutionCloseoutPolicy = evolutionSummary.closeout_policy || {
    applies_to: ["framework_owner", "vibe_app_developer"],
    trigger: "all_linked_tasks_terminal_and_archived"
  };
  const appSummaries = buildCustomerAppSummaries(apps, features, journeys, filteredTasks, usageSummary, { workspaceTrack: dashboardScope });
  const workstreamSummaries = buildWorkstreamSummaries(workstreams, filteredTasks, filteredSessions, usageSummary, { buildSprintSummary });
  const workspaceSummaries = collectWorkspaceDashboardSummaries(options, dashboardScope);
  const plannerDashboardState = buildPlannerDashboardState({ project, dashboard_scope: dashboardScope });
  const dashboardUxGovernance = buildDashboardUxGovernanceState({
    apps,
    appSummaries,
    workspaceSummaries,
    project,
    deliveryMode: project.delivery_mode || "",
    developerMode
  });
  const taskTracker = buildTaskTrackerState({
    generatedAt,
    tasks: filteredTasks,
    apps,
    tokens: filteredTokens,
    locks: filteredLocks,
    sessions: filteredSessions,
    sprints,
    acceptanceRecords: readStateArray(".kabeeri/acceptance.json", "records"),
    usageSummary,
    vibeSuggestions,
    vibeCaptures
  });

  const state = {
    generated_at: generatedAt,
    workspace: {
      name: project.name || project.framework || path.basename(repoRoot()),
      repo_root: repoRoot(),
      product_name: project.product_name || project.name || "",
      project_scope: project.project_scope || "single_product_multi_app",
      forbid_unrelated_apps: project.forbid_unrelated_apps !== false,
      profile: project.profile || "",
      delivery_mode: project.delivery_mode || "",
      language: project.language || "",
      workspace_kind: project.workspace_kind || "framework_owner",
      surface_scopes: Array.isArray(project.surface_scopes) ? project.surface_scopes : [],
      dashboard_scope: dashboardScope,
      dashboard_title: dashboardTitle,
      app_count: apps.length,
      mode: apps.length > 1 ? "multi_app_workspace" : apps.length === 1 ? "single_app_workspace" : "project_workspace",
      live_dashboard: {
        customer_home: "/",
        private_dashboard: "/__kvdf/dashboard",
        api_state: "/__kvdf/api/state",
        task_tracker_state: "/__kvdf/api/tasks",
        agile_state: "/__kvdf/api/agile",
        structured_state: "/__kvdf/api/structured",
        live_reports_state: "/__kvdf/api/reports"
      }
    },
    planner: plannerDashboardState,
    workspaces: workspaceSummaries,
    technical: {
      generated_at: generatedAt,
      tasks: summarizeBy(filteredTasks, "status"),
      active_locks: filteredLocks.filter((item) => item.status === "active"),
      active_tokens: filteredTokens.filter((item) => item.status === "active"),
      ai_usage: usageSummary,
      sprints: sprints.map((item) => buildSprintSummary(item.id)),
      sessions: summarizeBy(sessions, "status"),
      developer_mode: developerMode,
      workstreams: workstreamSummaries,
      developers,
      agents,
      policies: summarizeBy(policyResults, "status"),
      context_packs: contextPacks.length,
      cost_preflights: summarizeBy(preflights, "budget_status"),
      handoff_packages: handoffPackages.length,
      security_scans: summarizeBy(securityScans, "status"),
      migration_plans: summarizeBy(migrationPlans, "status"),
      migration_checks: summarizeBy(migrationChecks, "status"),
      vibe_intents: summarizeBy(vibeIntents, "intent_type"),
      vibe_suggestions: summarizeBy(vibeSuggestions, "status"),
      vibe_captures: summarizeBy(vibeCaptures, "classification"),
      vibe_sessions: summarizeBy(vibeSessions, "status"),
      context_briefs: contextBriefs.length,
      evolution: evolutionSummary,
      evolution_auto_closeout: evolutionAutoCloseout,
      evolution_closeout_policy: evolutionCloseoutPolicy,
      planner: plannerDashboardState,
      agile_backlog: summarizeBy(agileState.backlog, "status"),
      agile_stories: summarizeBy(agileState.stories, "status"),
      agile_sprint_reviews: agileState.sprint_reviews.length,
      agile_health: agileLiveState.summary ? agileLiveState.summary.health : "unknown",
      structured_requirements: summarizeBy(structuredState.requirements, "status"),
      structured_phases: summarizeBy(structuredState.phases, "status"),
      structured_health: structuredLiveState.summary ? structuredLiveState.summary.health : "unknown",
      adrs: summarizeBy(adrRecords, "status"),
      ai_runs: summarizeBy(aiRuns, "status"),
      ai_run_waste_signals: aiRunReport.waste_signals.length,
      prompt_compositions: promptCompositions.length,
      live_reports_status: liveReports && liveReports.summary ? liveReports.summary.status : "missing",
      developer_efficiency: developerEfficiency,
      app_summaries: appSummaries,
      workspace_count: workspaceSummaries.length,
      dashboard_ux_governance: dashboardUxGovernance
    },
    business: {
      generated_at: generatedAt,
      customer_apps: apps,
      app_summaries: appSummaries,
      task_tracker: taskTracker,
      workspaces: workspaceSummaries,
      task_status: summarizeBy(filteredTasks, "status"),
      task_tracker_status: taskTracker.summary.by_status,
      tasks_total: filteredTasks.length,
      verified_tasks: filteredTasks.filter((item) => item.status === "owner_verified").length,
      ai_usage_cost: usageSummary.total_cost,
      ai_usage_tokens: usageSummary.total_tokens,
      features,
      feature_readiness: summarizeBy(features, "readiness"),
      journeys,
      journey_status: summarizeBy(journeys, "status"),
      policy_status: summarizeBy(policyResults, "status"),
      context_packs_total: contextPacks.length,
      cost_preflight_status: summarizeBy(preflights, "budget_status"),
      cost_preflight_approvals_required: preflights.filter((item) => item.approval_required).length,
      handoff_packages_total: handoffPackages.length,
      security_status: summarizeBy(securityScans, "status"),
      migration_status: summarizeBy(migrationPlans, "status"),
      migration_blocks: migrationChecks.filter((item) => item.status === "blocked").length,
      vibe_suggestions_total: vibeSuggestions.length,
      vibe_captures_total: vibeCaptures.length,
      vibe_sessions_total: vibeSessions.length,
      context_briefs_total: contextBriefs.length,
      evolution_status: evolutionSummary.status,
      evolution_changes_total: evolutionSummary.changes_total,
      evolution_open_follow_up_tasks: evolutionSummary.open_follow_up_tasks,
      evolution_auto_closeout: evolutionAutoCloseout,
      evolution_closeout_policy: evolutionCloseoutPolicy,
      planner: plannerDashboardState,
      agile_backlog_total: agileState.backlog.length,
      agile_epics_total: agileState.epics.length,
      agile_stories_total: agileState.stories.length,
      agile_ready_stories_total: agileState.stories.filter((item) => item.ready_status === "ready").length,
      agile_health: agileLiveState.summary ? agileLiveState.summary.health : "unknown",
      structured_requirements_total: structuredState.requirements.length,
      structured_approved_requirements_total: structuredState.requirements.filter((item) => item.approval_status === "approved").length,
      structured_phases_total: structuredState.phases.length,
      structured_health: structuredLiveState.summary ? structuredLiveState.summary.health : "unknown",
      adrs_total: adrRecords.length,
      adrs_approved_total: adrRecords.filter((item) => item.status === "approved").length,
      ai_runs_total: aiRunReport.totals.runs || 0,
      ai_runs_unreviewed_total: aiRunReport.totals.unreviewed || 0,
      prompt_compositions_total: promptCompositions.length,
      live_reports_status: liveReports && liveReports.summary ? liveReports.summary.status : "missing",
      developer_efficiency: developerEfficiency,
      developer_mode: developerMode,
      dashboard_ux_governance: dashboardUxGovernance,
      workstreams: workstreamSummaries,
      sprints: sprints.map((item) => ({
        id: item.id,
        name: item.name,
        status: item.status,
        cost: buildSprintSummary(item.id).total_cost
      }))
    },
    records: {
      tasks: filteredTasks,
      task_tracker: taskTracker,
      apps,
      features,
      journeys,
      tokens,
      locks,
      policy_results: policyResults,
      context_packs: contextPacks,
      cost_preflights: preflights,
      handoff_packages: handoffPackages,
      security_scans: securityScans,
      migration_plans: migrationPlans,
      migration_checks: migrationChecks,
      vibe_intents: vibeIntents,
      vibe_suggestions: vibeSuggestions,
      vibe_captures: vibeCaptures,
      vibe_sessions: vibeSessions,
      context_briefs: contextBriefs,
      evolution: evolutionState,
      evolution_summary: evolutionSummary,
      planner: plannerDashboardState,
      agile: agileState,
      agile_live: agileLiveState,
      structured: structuredState,
      structured_live: structuredLiveState,
      adrs: adrRecords,
      ai_runs: aiRuns,
      ai_run_report: aiRunReport,
      prompt_compositions: promptCompositions,
      live_reports: liveReports,
      app_summaries: appSummaries,
      workspaces: workspaceSummaries,
      dashboard_ux_governance: dashboardUxGovernance,
      developer_mode: developerMode,
      workstreams: workstreamSummaries,
      usage: usageSummary
    },
    task_tracker: taskTracker
  };
  return {
    ...state,
    contracts: buildDashboardContracts(state)
  };
}

function refreshTaskTrackerState(deps = {}) {
  ensureWorkspace();
  const tracker = buildTaskTrackerStateFromFiles(deps);
  writeJsonFile(".kabeeri/dashboard/task_tracker_state.json", tracker);
  return tracker;
}

function buildTaskTrackerStateFromFiles(deps = {}) {
  const project = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
  const workspaceTrack = resolveWorkspaceTrack(project.workspace_kind);
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks").filter((item) => resolveTaskTrack(item, workspaceTrack) === workspaceTrack);
  const tokens = readStateArray(".kabeeri/tokens.json", "tokens").filter((item) => resolveTaskTrack(item, workspaceTrack) === workspaceTrack);
  const locks = readStateArray(".kabeeri/locks.json", "locks").filter((item) => resolveTaskTrack(item, workspaceTrack) === workspaceTrack);
  const sessions = readStateArray(".kabeeri/sessions.json", "sessions").filter((item) => resolveTaskTrack(item, workspaceTrack) === workspaceTrack);
  return buildTaskTrackerState({
    generatedAt: new Date().toISOString(),
    workspaceTrack,
    tasks,
    apps: readStateArray(".kabeeri/customer_apps.json", "apps"),
    tokens,
    locks,
    sessions,
    sprints: readStateArray(".kabeeri/sprints.json", "sprints"),
    acceptanceRecords: readStateArray(".kabeeri/acceptance.json", "records"),
    usageSummary: (deps.summarizeUsage || (() => ({ by_task: {} })))(),
    vibeSuggestions: readStateArray(".kabeeri/interactions/suggested_tasks.json", "suggested_tasks"),
    vibeCaptures: readStateArray(".kabeeri/interactions/post_work_captures.json", "captures")
  }, deps);
}

function buildTaskTrackerState(input = {}, deps = {}) {
  const tasks = input.tasks || [];
  const tokens = input.tokens || [];
  const locks = input.locks || [];
  const sessions = input.sessions || [];
  const apps = input.apps || [];
  const sprints = input.sprints || [];
  const acceptanceRecords = input.acceptanceRecords || [];
  const usageSummary = input.usageSummary || { by_task: {} };
  const suggestions = input.vibeSuggestions || [];
  const captures = input.vibeCaptures || [];
  const appByUsername = Object.fromEntries(apps.map((item) => [item.username, item]));
  const sprintById = Object.fromEntries(sprints.map((item) => [item.id, item]));
  const usageByTask = usageSummary.by_task || {};
  const activeTokensByTask = groupBy(tokens.filter((item) => item.status === "active"), "task_id");
  const activeLocksByTask = groupBy(locks.filter((item) => item.status === "active"), "task_id");
  const sessionsByTask = groupBy(sessions, "task_id");
  const acceptanceByTask = groupBy(acceptanceRecords, "task_id");
  const capturesByTask = groupBy(captures.filter((item) => item.task_id), "task_id");
  const suggestionsByTask = groupBy(suggestions.filter((item) => item.task_id), "task_id");
  const rows = tasks.map((taskItem) => {
    const taskApps = taskAppUsernames(taskItem);
    const taskTokens = activeTokensByTask[taskItem.id] || [];
    const taskLocks = activeLocksByTask[taskItem.id] || [];
    const taskSessions = sessionsByTask[taskItem.id] || [];
    const taskAcceptance = acceptanceByTask[taskItem.id] || [];
    const usage = usageByTask[taskItem.id] || { events: 0, tokens: 0, cost: 0 };
    const lifecycle = buildTaskLifecycleState(taskItem);
    const track = resolveTaskTrack(taskItem, input.workspaceTrack || "framework_owner");
    return {
      id: taskItem.id,
      title: taskItem.title,
      status: taskItem.status,
      track,
      lifecycle_stage: lifecycle.current_stage,
      lifecycle_next_action: lifecycle.next_action,
      type: taskItem.type || "general",
      source: taskItem.source || "",
      workstream: taskItem.workstream || "",
      workstreams: taskWorkstreams(taskItem),
      app_usernames: taskApps,
      apps: taskApps.map((username) => {
        const app = appByUsername[username] || {};
        return { username, name: app.name || username, path: app.path || "" };
      }),
      sprint_id: taskItem.sprint_id || null,
      sprint_name: taskItem.sprint_id && sprintById[taskItem.sprint_id] ? sprintById[taskItem.sprint_id].name || taskItem.sprint_id : "",
      assignee_id: taskItem.assignee_id || "",
      reviewer_id: taskItem.reviewer_id || "",
      acceptance_criteria_count: (taskItem.acceptance_criteria || []).length,
      acceptance_records: taskAcceptance.length,
      active_tokens: taskTokens.map((item) => item.token_id),
      active_locks: taskLocks.map((item) => item.lock_id),
      active_sessions: taskSessions.filter((item) => item.status === "active").map((item) => item.session_id),
      usage,
      linked_suggestions: (suggestionsByTask[taskItem.id] || []).map((item) => item.suggestion_id),
      linked_captures: (capturesByTask[taskItem.id] || []).map((item) => item.capture_id),
      created_at: taskItem.created_at || null,
      updated_at: taskItem.updated_at || taskItem.verified_at || taskItem.rejected_at || taskItem.reopened_at || taskItem.created_at || null,
      blockers: buildTaskTrackerBlockers(taskItem, taskTokens, taskLocks, taskSessions, taskAcceptance),
      next_action: inferTaskTrackerNextAction(taskItem)
    };
  });
  const board = {};
  for (const taskItem of rows) {
    const status = taskItem.status || "unknown";
    board[status] = board[status] || [];
    board[status].push({
      id: taskItem.id,
      title: taskItem.title,
      assignee_id: taskItem.assignee_id,
      workstreams: taskItem.workstreams,
      apps: taskItem.app_usernames,
      blockers: taskItem.blockers.length,
      next_action: taskItem.next_action
    });
  }
  const openTasks = rows.filter((item) => !["owner_verified", "rejected", "done"].includes(item.status));
  const blockedTasks = rows.filter((item) => item.blockers.length > 0);
  const lifecycle = buildTaskLifecycleBoard(rows, { workspace_track: input.workspaceTrack || "framework_owner" });
  const generatedAt = input.generatedAt || new Date().toISOString();
  return {
    generated_at: generatedAt,
    source: ".kabeeri/tasks.json",
    live_json_path: ".kabeeri/dashboard/task_tracker_state.json",
    live_api_path: "/__kvdf/api/tasks",
    track: input.workspaceTrack || "framework_owner",
    summary: {
      total: rows.length,
      open: openTasks.length,
      verified: rows.filter((item) => item.status === "owner_verified").length,
      rejected: rows.filter((item) => item.status === "rejected").length,
      blocked: blockedTasks.length,
      by_status: summarizeBy(rows, "status"),
      by_workstream: summarizeTaskRowsByList(rows, "workstreams"),
      by_app: summarizeTaskRowsByList(rows, "app_usernames"),
      active_tokens: tokens.filter((item) => item.status === "active").length,
      active_locks: locks.filter((item) => item.status === "active").length,
      lifecycle_by_stage: lifecycle.summary.by_stage,
      lifecycle_active: lifecycle.summary.active_total,
      lifecycle_archived: lifecycle.summary.archived_total
    },
    lifecycle,
    board,
    tasks: rows,
    action_items: buildTaskTrackerActionItems(rows),
    recently_updated: rows
      .filter((item) => item.updated_at)
      .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
      .slice(0, 10)
      .map((item) => ({ id: item.id, title: item.title, status: item.status, updated_at: item.updated_at, next_action: item.next_action }))
  };
}

function groupBy(items, key) {
  return (items || []).reduce((groups, item) => {
    const value = item[key] || "unassigned";
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {});
}

function taskAppUsernames(taskItem) {
  return Array.isArray(taskItem.app_usernames) && taskItem.app_usernames.length
    ? taskItem.app_usernames
    : taskItem.app_username ? [taskItem.app_username] : [];
}

function summarizeTaskRowsByList(rows, key) {
  return rows.reduce((summary, item) => {
    const values = item[key] && item[key].length ? item[key] : ["unassigned"];
    for (const value of values) summary[value] = (summary[value] || 0) + 1;
    return summary;
  }, {});
}

function buildTaskTrackerBlockers(taskItem, activeTokens, activeLocks, sessions, acceptanceRecords) {
  const blockers = [];
  if (["approved", "ready"].includes(taskItem.status) && !taskItem.assignee_id) blockers.push("missing_assignee");
  if (taskItem.status === "assigned" && activeTokens.length === 0) blockers.push("missing_active_task_token");
  if (taskItem.status === "in_progress" && activeLocks.length === 0) blockers.push("missing_active_lock");
  if (taskItem.status === "review" && !taskItem.reviewer_id) blockers.push("missing_reviewer");
  if (taskItem.status === "review" && (taskItem.acceptance_criteria || []).length === 0 && acceptanceRecords.length === 0) blockers.push("missing_acceptance_evidence");
  if (taskItem.status === "in_progress" && sessions.filter((item) => item.status === "active").length === 0) blockers.push("no_active_session_recorded");
  return blockers;
}

function inferTaskTrackerNextAction(taskItem) {
  if (taskItem.status === "proposed") return "approve or refine task scope";
  if (taskItem.status === "approved" || taskItem.status === "ready") return "assign task to a developer or AI agent";
  if (taskItem.status === "assigned") return "issue/verify task token and start execution";
  if (taskItem.status === "in_progress") return "continue execution or move to review with evidence";
  if (taskItem.status === "review") return "review acceptance evidence and Owner verify or reject";
  if (taskItem.status === "owner_verified") return "archive tokens/locks and include in handoff or release notes";
  if (taskItem.status === "rejected") return "reopen with reason or replace with a clearer task";
  return "inspect task status and choose next governed action";
}

function buildTaskTrackerActionItems(rows) {
  const items = [];
  const push = (severity, task, message, nextAction) => items.push({ severity, task_id: task.id, title: task.title, message, next_action: nextAction });
  for (const task of rows) {
    for (const blocker of task.blockers) {
      const next = blocker === "missing_assignee" ? "run `kvdf task assign`"
        : blocker === "missing_active_task_token" ? "run `kvdf token issue`"
        : blocker === "missing_active_lock" ? "run `kvdf lock create`"
        : blocker === "missing_reviewer" ? "run `kvdf task review --reviewer <id>`"
        : blocker === "missing_acceptance_evidence" ? "run `kvdf acceptance create` and review it"
        : blocker === "no_active_session_recorded" ? "run `kvdf session start` or capture post-work"
        : task.next_action;
      push(["missing_acceptance_evidence", "missing_active_task_token", "missing_active_lock"].includes(blocker) ? "warning" : "info", task, blocker, next);
    }
  }
  return items;
}

function buildWorkstreamSummaries(workstreams, tasks, sessions, usageSummary, deps = {}) {
  const usageByWorkstream = usageSummary.by_workstream || {};
  const buildSprintSummary = deps.buildSprintSummary || (() => ({ total_cost: 0 }));
  return workstreams.map((stream) => {
    const id = normalizeWorkstreamId(stream.id);
    const streamTasks = tasks.filter((taskItem) => taskWorkstreams(taskItem).includes(id));
    const streamSessions = sessions.filter((sessionItem) => getTaskWorkstreamsById(sessionItem.task_id).includes(id));
    const usage = usageByWorkstream[id] || { events: 0, tokens: 0, cost: 0 };
    return {
      id,
      name: stream.name || id,
      status: stream.status || "active",
      path_rules: stream.path_rules || [],
      required_review: stream.required_review || [],
      tasks_total: streamTasks.length,
      open_tasks: streamTasks.filter((taskItem) => !["owner_verified", "rejected", "done"].includes(taskItem.status)).length,
      verified_tasks: streamTasks.filter((taskItem) => taskItem.status === "owner_verified").length,
      sessions_total: streamSessions.length,
      active_sessions: streamSessions.filter((sessionItem) => sessionItem.status === "active").length,
      ai_usage: usage,
      sprint_cost: buildSprintSummary(stream.id).total_cost || 0
    };
  });
}

function buildCustomerAppSummaries(apps, features, journeys, tasks, usageSummary, options = {}) {
  const workspaceTrack = options.workspaceTrack || "framework_owner";
  const featureMap = Object.fromEntries(features.map((item) => [item.id, item]));
  const journeyMap = Object.fromEntries(journeys.map((item) => [item.id, item]));
  const usageByTask = usageSummary.by_task || {};
  return apps.map((appItem) => {
    const appFeatures = (appItem.feature_ids || []).map((id) => featureMap[id]).filter(Boolean);
    const appJourneys = (appItem.journey_ids || []).map((id) => journeyMap[id]).filter(Boolean);
    const taskIds = new Set(appFeatures.flatMap((featureItem) => featureItem.task_ids || []));
    for (const taskItem of tasks) {
      const taskApps = Array.isArray(taskItem.app_usernames) && taskItem.app_usernames.length
        ? taskItem.app_usernames
        : taskItem.app_username ? [taskItem.app_username] : [];
      if (taskApps.includes(appItem.username)) taskIds.add(taskItem.id);
    }
    const appTrack = resolveWorkspaceTrack(appItem.workspace_kind || appItem.track || appItem.audience || "");
    if ((appItem.workspace_kind || appItem.track || appItem.audience) && appTrack !== workspaceTrack) return null;
    const appTasks = tasks.filter((taskItem) => taskIds.has(taskItem.id));
    const usage = [...taskIds].reduce((summary, taskId) => {
      const item = usageByTask[taskId] || {};
      summary.events += Number(item.events || 0);
      summary.tokens += Number(item.tokens || 0);
      summary.cost += Number(item.cost || 0);
      return summary;
    }, { events: 0, tokens: 0, cost: 0 });
    return {
      username: appItem.username,
      name: appItem.name,
      app_type: appItem.app_type || appItem.type || "",
      path: appItem.path || "",
      product_name: appItem.product_name || "",
      workstreams: appItem.workstreams || [],
      status: appItem.status || "draft",
      audience: appItem.audience || "",
      public_url: publicCustomerAppUrl(appItem.username),
      features_total: appFeatures.length,
      ready_features: appFeatures.filter((item) => ["ready_to_demo", "ready_to_publish", "published"].includes(item.readiness)).length,
      journeys_total: appJourneys.length,
      ready_journeys: appJourneys.filter((item) => item.ready_to_show || ["ready_to_show", "published"].includes(item.status)).length,
      tasks_total: appTasks.length,
      verified_tasks: appTasks.filter((item) => item.status === "owner_verified").length,
      open_tasks: appTasks.filter((item) => !["owner_verified", "rejected", "done"].includes(item.status)).length,
      ai_usage: usage
    };
  }).filter(Boolean);
}

function collectWorkspaceDashboardSummaries(options = {}, workspaceTrack = "framework_owner") {
  const roots = getDashboardWorkspaceRoots(options);
  const current = summarizeWorkspaceRoot(repoRoot(), true, workspaceTrack);
  const external = roots
    .map((root) => summarizeWorkspaceRoot(root, false, workspaceTrack))
    .filter(Boolean)
    .filter((item) => item.root !== current.root);
  if (!shouldIncludeLinkedWorkspaceSummaries(options)) return [current];
  return [current, ...external.filter((item) => resolveWorkspaceTrack(item.workspace_kind) === workspaceTrack || !item.workspace_kind)];
}

function getDashboardWorkspaceRoots(options = {}) {
  const roots = [];
  const explicit = options.workspaces || options["workspace-roots"] || options.workspace || "";
  if (explicit && String(explicit).toLowerCase() !== "auto") roots.push(...parseWorkspaceRoots(explicit));
  if (process.env.KVDF_WORKSPACES) roots.push(...parseWorkspaceRoots(process.env.KVDF_WORKSPACES));
  if (fileExists(".kabeeri/dashboard/workspaces.json")) {
    const configured = readJsonFile(".kabeeri/dashboard/workspaces.json").workspaces || [];
    roots.push(...configured.map((item) => item.path).filter(Boolean));
  }
  return [...new Set(roots)];
}

function shouldIncludeLinkedWorkspaceSummaries(options = {}) {
  return Boolean(
    options.workspaces ||
    options["workspace-roots"] ||
    options.workspace ||
    options.include_linked_workspaces ||
    options["include-linked-workspaces"] ||
    fileExists(".kabeeri/dashboard/workspaces.json") ||
    process.env.KVDF_INCLUDE_LINKED_WORKSPACES === "1"
  );
}

function parseWorkspaceRoots(value) {
  return parseCsv(value).map((item) => path.resolve(repoRoot(), item));
}

function summarizeWorkspaceRoot(root, current, workspaceTrack = "framework_owner") {
  const fs = require("fs");
  const stateDir = path.join(root, ".kabeeri");
  if (!fs.existsSync(stateDir)) {
    if (current) {
      return { root, current: true, status: "missing_workspace", name: path.basename(root), apps_total: 0, tasks_total: 0 };
    }
    return null;
  }
  const read = (relative, fallback) => {
    try {
      return JSON.parse(fs.readFileSync(path.join(stateDir, relative), "utf8"));
    } catch (_) {
      return fallback;
    }
  };
  const project = read("project.json", {});
  const apps = read("customer_apps.json", { apps: [] }).apps || [];
  const tasks = (read("tasks.json", { tasks: [] }).tasks || []).filter((item) => resolveTaskTrack(item, workspaceTrack) === workspaceTrack);
  const features = read("features.json", { features: [] }).features || [];
  const policyResults = read("policies/policy_results.json", { results: [] }).results || [];
  const securityScans = read("security/security_scans.json", { scans: [] }).scans || [];
  const migrationChecks = read("migrations/migration_checks.json", { checks: [] }).checks || [];
  const filteredApps = apps.filter((item) => {
    const appTrack = resolveWorkspaceTrack(item.workspace_kind || item.track || item.audience || "");
    if (appTrack && appTrack !== "framework_owner" && appTrack !== workspaceTrack) return false;
    if (item.workspace_kind || item.track || item.audience) return resolveWorkspaceTrack(item.workspace_kind || item.track || item.audience || workspaceTrack) === workspaceTrack;
    return true;
  });
  return {
    root,
    current,
    status: "ok",
    name: project.name || project.framework || path.basename(root),
    product_name: project.product_name || project.name || "",
    project_scope: project.project_scope || "single_product_multi_app",
    boundary_mode: apps.length > 1 ? "same_product_multi_app" : apps.length === 1 ? "single_app" : "workspace",
    workspace_kind: project.workspace_kind || "framework_owner",
    profile: project.profile || "",
    delivery_mode: project.delivery_mode || "",
    apps_total: filteredApps.length,
    tasks_total: tasks.length,
    open_tasks: tasks.filter((item) => !["owner_verified", "rejected", "done"].includes(item.status)).length,
    features_total: features.length,
    policy_blocks: policyResults.filter((item) => item.status === "blocked").length,
    security_blocks: securityScans.filter((item) => item.status === "blocked").length,
    migration_blocks: migrationChecks.filter((item) => item.status === "blocked").length,
    dashboard_command: `kvdf dashboard serve --port auto`,
    apps: filteredApps.map((item) => ({
      username: item.username,
      name: item.name,
      app_type: item.app_type || item.type || "",
      path: item.path || "",
      product_name: item.product_name || project.product_name || ""
    }))
  };
}

function buildDashboardUxGovernanceState(input = {}) {
  const apps = input.apps || [];
  const appSummaries = input.appSummaries || [];
  const workspaceSummaries = input.workspaceSummaries || [];
  const project = input.project || {};
  const currentWorkspace = workspaceSummaries.find((item) => item.current) || workspaceSummaries[0] || {};
  const workspaceTrack = resolveWorkspaceTrack(project.workspace_kind || currentWorkspace.workspace_kind || "");
  const taskBoardLabel = workspaceTrack === "vibe_app_developer" ? "App Track Task Board" : "Owner Track Task Board";
  const roleViews = [
    {
      role: "Owner",
      visibility: "all_governance",
      widgets: ["Action Center", "Policy Results", "Security Scans", "Migration Safety", "Handoff Packages", "AI Usage by Task"],
      actions: ["verify", "approve", "reject", "override only through policy"]
    },
    {
      role: "Maintainer",
      visibility: "delivery_and_blockers",
      widgets: [taskBoardLabel, "Execution Scopes", "Workstream Governance", "Live Reports"],
      actions: ["triage", "assign", "review", "prepare handoff"]
    },
    {
      role: "Developer",
      visibility: "assigned_work",
      widgets: [taskBoardLabel, "Active Locks", "Execution Scopes", "Post-work Captures"],
      actions: ["continue task", "attach evidence", "avoid locked scopes"]
    },
    {
      role: "AI Agent",
      visibility: "scoped_context",
      widgets: [taskBoardLabel, "Execution Scopes", "Common Prompt Layer", "Tracked vs Untracked AI Usage"],
      actions: ["read allowed files", "respect token scope", "report usage"]
    },
    {
      role: "QA Reviewer",
      visibility: "acceptance_and_risk",
      widgets: ["Feature Readiness", "User Journeys", "Security Scans", "Migration Safety"],
      actions: ["check acceptance", "record risks", "request evidence"]
    },
    {
      role: "Client Viewer",
      visibility: "business_summary",
      widgets: ["Applications", "Feature Readiness", "User Journeys", "Handoff Packages"],
      actions: ["review demo readiness", "avoid internal controls"]
    }
  ];
  const widgetRegistry = [
    ["action_center", "Action Center", "all_roles", "resume_decision", "top"],
    ["task_tracker", "Task Tracker Live Board", "owner,maintainer,developer,ai_agent", "task_status", "primary"],
    ["applications", "Applications", "all_roles", "same_workspace_apps", "summary"],
    ["app_boundary", "App Boundary Governance", "owner,maintainer,developer,ai_agent", "multi_app_safety", "governance"],
    ["workspace_summary", "KVDF Workspaces", "owner,maintainer", "separate_workspace_summaries", "governance"],
    ["policy_results", "Policy Results", "owner,maintainer", "release_blockers", "governance"],
    ["security_scans", "Security Scans", "owner,maintainer,qa", "security_risk", "governance"],
    ["migration_safety", "Migration Safety", "owner,maintainer,qa", "migration_risk", "governance"],
    ["ai_cost", "AI Usage by Task", "owner,maintainer,ai_agent", "cost_control", "finance"],
    ["vibe_capture", "Post-work Captures", "owner,maintainer,developer", "traceability_restore", "workflow"]
  ].map(([id, name, roles, purpose, placement]) => ({ id, name, roles, purpose, placement }));
  const controls = [
    { id: "app-filter", label: "App filter", purpose: "Focus on one app inside the current same-product workspace.", status: appSummaries.length ? "active" : "empty" },
    { id: "role-filter", label: "Role view", purpose: "Explain which widgets each role should use first.", status: "documented" },
    { id: "view-preset", label: "Saved views", purpose: "Restore the last scope or jump between common owner, developer, QA, client, and AI views.", status: "active" },
    { id: "app-drilldown", label: "App drilldown", purpose: "Inspect one app's summary cards without leaving the dashboard.", status: appSummaries.length ? "active" : "empty" },
    { id: "workspace-links", label: "Linked workspace summaries", purpose: "Summarize separate KVDF folders without merging owner-track or app-track source state.", status: workspaceSummaries.length > 1 ? "active" : "available" },
    { id: "live-refresh", label: "Live refresh", purpose: "Poll local API and reload when derived state changes.", status: "active" },
    { id: "responsive-tables", label: "Responsive tables", purpose: "Keep wide governance tables readable on smaller screens.", status: "active" }
  ];
  return {
    version: "dashboard-ux-governance-v1",
    generated_at: new Date().toISOString(),
    dashboard_types: ["private_governance_dashboard", "client_home", "customer_app_page", "linked_workspace_summary"],
    workspace_strategy: {
      current_workspace_mode: currentWorkspace.boundary_mode || (apps.length > 1 ? "same_product_multi_app" : apps.length === 1 ? "single_app" : "workspace"),
      current_workspace_apps: apps.length,
      linked_workspaces: Math.max(0, workspaceSummaries.length - 1),
      rule: "Use one KVDF workspace for related apps in the same product. Owner-track dashboards show owner analysis only. App-track dashboards show app analysis only. Use linked KVDF workspaces for separate products, clients, or release lifecycles.",
      product_name: project.product_name || project.name || ""
    },
    role_views: roleViews,
    widget_registry: widgetRegistry,
    controls,
    live_state_rules: [
      "The dashboard is derived from .kabeeri and never becomes source of truth.",
      "Local serve mode polls /__kvdf/api/state and reloads when the stable state fingerprint changes.",
      "Static exports must still show the latest generated_at timestamp and readable empty states.",
      "Linked workspaces are summarized only; their tasks, approvals, and policies are not merged.",
      "Owner-track and app-track analysis stay separated unless linked workspace summaries are explicitly requested."
    ],
    empty_error_rules: [
      "Empty tables must render an explicit empty-state row or message.",
      "Missing linked workspaces must not break the current workspace dashboard.",
      "Blocked policy/security/migration states must appear in the Action Center."
    ],
    responsive_rules: [
      "Wide tables must be wrapped in horizontal scrolling containers.",
      "Metrics must use responsive grid columns.",
      "Controls must wrap instead of overlapping on narrow screens."
    ]
  };
}

function resolveWorkspaceTrack(workspaceKind = "") {
  const normalized = String(workspaceKind || "").trim().toLowerCase();
  if (["developer_app", "vibe_app_developer", "vibe", "app", "app_developer"].includes(normalized)) return "vibe_app_developer";
  return "framework_owner";
}

function resolveTaskTrack(taskItem = {}, fallbackTrack = "framework_owner") {
  const normalized = String(taskItem.track || taskItem.evolution_track || taskItem.workspace_track || "").trim().toLowerCase();
  if (["vibe_app_developer", "developer_app", "app_developer", "vibe"].includes(normalized)) return "vibe_app_developer";
  if (["framework_owner", "owner", "owner_track"].includes(normalized)) return "framework_owner";
  if (taskItem.app_usernames && taskItem.app_usernames.length) return "vibe_app_developer";
  return fallbackTrack;
}

function filterByTrack(items = [], workspaceTrack = "framework_owner") {
  return (items || []).filter((item) => resolveTaskTrack(item, workspaceTrack) === workspaceTrack);
}

function resolveEvolutionTrack(value = "", fallbackTrack = "framework_owner") {
  const normalized = String(value || "").trim().toLowerCase();
  if (["vibe_app_developer", "developer_app", "app_developer", "vibe"].includes(normalized)) return "vibe_app_developer";
  if (["framework_owner", "owner", "owner_track"].includes(normalized)) return "framework_owner";
  return fallbackTrack;
}

function filterEvolutionState(evolutionState = {}, workspaceTrack = "framework_owner", workspaceKind = "") {
  const state = {
    ...evolutionState,
    changes: Array.isArray(evolutionState.changes)
      ? evolutionState.changes.filter((item) => resolveEvolutionTrack(item.track || item.audience || workspaceKind, workspaceTrack) === workspaceTrack)
      : [],
    impact_plans: Array.isArray(evolutionState.impact_plans)
      ? evolutionState.impact_plans.filter((item) => resolveEvolutionTrack(item.track || item.audience || workspaceKind, workspaceTrack) === workspaceTrack)
      : [],
    workspace_kind: workspaceKind || evolutionState.workspace_kind || workspaceTrack
  };
  if (state.current_change_id) {
    const current = state.changes.find((item) => item && item.change_id === state.current_change_id);
    if (!current && state.changes.length) state.current_change_id = state.changes[state.changes.length - 1].change_id;
  }
  return state;
}

function readPlannerRuntimeState() {
  if (!fileExists(".kabeeri/planner.json")) return null;
  try {
    return readJsonFile(".kabeeri/planner.json");
  } catch (error) {
    return null;
  }
}

function findCurrentApprovedPlannerPlan(plannerState = {}) {
  if (!plannerState || !Array.isArray(plannerState.plans)) return null;
  const currentId = String(plannerState.current_plan_id || "").trim();
  const currentPlan = currentId ? plannerState.plans.find((plan) => String(plan.plan_id || "") === currentId) : null;
  if (currentPlan && String(currentPlan.status || "").toLowerCase() === "approved") return currentPlan;
  return plannerState.plans.find((plan) => String(plan.status || "").toLowerCase() === "approved") || null;
}

function normalizePlannerSourceControl(sourceControl = null) {
  const resolved = sourceControl && typeof sourceControl === "object" ? sourceControl : {};
  return {
    enabled: Boolean(resolved.enabled),
    provider: resolved.provider || "none",
    remote_provider: resolved.remote_provider || "none",
    provider_plugin: resolved.provider_plugin || null,
    mode: resolved.mode || "none",
    branching_enabled: Boolean(resolved.branching_enabled),
    pr_enabled: Boolean(resolved.pr_enabled),
    default_branch: resolved.default_branch || "main",
    current_branch: resolved.current_branch || null,
    requires_owner_approval: resolved.requires_owner_approval !== false,
    replaceable_provider: resolved.replaceable_provider !== false,
    notes: Array.isArray(resolved.notes) ? [...resolved.notes] : []
  };
}

function buildPlannerVersionPlanSummary(plan = null) {
  const versions = Array.isArray(plan && plan.version_plan && plan.version_plan.versions) ? plan.version_plan.versions : [];
  return {
    available: Boolean(plan),
    versions_total: versions.length,
    current_version: plan && plan.version_plan ? plan.version_plan.current_version || plan.version_plan.active_version || null : null,
    next_version: plan && plan.version_plan ? plan.version_plan.next_version || null : null,
    source_control_mode: plan && plan.source_control ? plan.source_control.mode || null : null
  };
}

function buildRoadmapTrainSummarySnapshot(train = null) {
  const majorVersions = Array.isArray(train && train.major_versions) ? train.major_versions : [];
  const stages = majorVersions.flatMap((major) => Array.isArray(major.stages) ? major.stages : []);
  const evoSprints = stages.flatMap((stage) => Array.isArray(stage.evo_sprints) ? stage.evo_sprints : []);
  const queue = Array.isArray(train && train.fifo_queue) ? train.fifo_queue : [];
  const next = queue.find((item) => ["planned", "ready", "active"].includes(String(item && item.status || "").toLowerCase()) && !item.blocked) || null;
  const blockedTotal = queue.filter((item) => item && (item.blocked || String(item.status || "").toLowerCase() === "blocked")).length;
  const readyTotal = queue.filter((item) => String(item && item.status || "").toLowerCase() === "ready").length;
  const activeTotal = queue.filter((item) => String(item && item.status || "").toLowerCase() === "active").length;
  const completedTotal = queue.filter((item) => ["completed", "published"].includes(String(item && item.status || "").toLowerCase())).length;
  const publishedTotal = queue.filter((item) => String(item && item.status || "").toLowerCase() === "published").length;
  const status = blockedTotal
    ? "blocked"
    : publishedTotal > 0 && completedTotal === queue.length && queue.length > 0
      ? "published"
      : activeTotal > 0
        ? "active"
        : readyTotal > 0
          ? "ready"
          : queue.length > 0 && completedTotal === queue.length
            ? "completed"
            : "planned";
  return {
    train_engine: "shared-roadmap-train-engine",
    available: Boolean(train),
    train_type: train && train.train_type ? train.train_type : "owner",
    track: train && train.track ? train.track : null,
    planning_method: train && train.planning_method ? train.planning_method : "auto",
    status,
    major_versions_total: majorVersions.length,
    version_stages_total: stages.length,
    evo_sprints_total: evoSprints.length,
    evolutions_total: queue.length,
    task_ids_total: queue.reduce((total, item) => total + (Array.isArray(item && item.task_ids) ? item.task_ids.length : 0), 0),
    fifo_queue_total: queue.length,
    blocked_total: blockedTotal,
    ready_total: readyTotal,
    active_total: activeTotal,
    completed_total: completedTotal,
    published_total: publishedTotal,
    next_major_version: next ? next.major_version || null : null,
    next_version_id: next ? next.version_id || null : null,
    next_evo_sprint_id: next ? next.evo_sprint_id || null : null,
    next_evolution_id: next ? next.evolution_id || null : (train && train.next_evolution_id ? train.next_evolution_id : null),
    next_action: next ? next.next_action || "Review the next unblocked evolution." : train && train.next_action ? train.next_action : "Build the roadmap train first."
  };
}

function buildPlannerPipelineSummary(plan = null) {
  const pipeline = plan && (plan.pipeline || plan.source_pipeline || plan.sourcePipeline) ? (plan.pipeline || plan.source_pipeline || plan.sourcePipeline) : null;
  const viberPipeline = pipeline && pipeline.viber_pipeline ? pipeline.viber_pipeline : (plan && plan.viber_pipeline ? plan.viber_pipeline : null);
  const rawVersionPlan = plan && plan.version_plan ? plan.version_plan : null;
  const taskPunch = plan && plan.task_punch ? plan.task_punch : null;
  const visual = plan && plan.visual ? plan.visual : null;
  const designArtifacts = pipeline && pipeline.design_artifacts ? pipeline.design_artifacts : {};
  const versionPlan = rawVersionPlan || null;
  const roadmapTrain = plan && plan.roadmap_train ? plan.roadmap_train : null;
  const roadmapTrainSummary = buildRoadmapTrainSummarySnapshot(roadmapTrain);
  const stages = Array.isArray(viberPipeline && viberPipeline.stages) ? viberPipeline.stages : [];
  const fallbackStageCount = plan && (plan.recommended_evolution || plan.task_punch || (Array.isArray(plan.task_punches) && plan.task_punches.length) || plan.source_pipeline) ? 1 : 0;
  const stagesTotal = stages.length || fallbackStageCount;
  const completeStages = stages.filter((stage) => ["complete", "ready", "approved", "materialized"].includes(String(stage && stage.status || "").toLowerCase())).length;
  const blockedStages = stages.filter((stage) => String(stage && stage.status || "").toLowerCase() === "blocked").length;
  const nextStage = viberPipeline && viberPipeline.next_stage
    ? viberPipeline.next_stage
    : stages.find((stage) => !["complete", "ready", "approved", "materialized"].includes(String(stage && stage.status || "").toLowerCase()))?.stage || "unknown";
  return {
    available: Boolean(pipeline),
    idea: pipeline && pipeline.idea ? pipeline.idea : (plan && plan.goal) || (plan && plan.recommended_evolution && plan.recommended_evolution.title) || "",
    documentation_files_total: Array.isArray(pipeline && pipeline.documentation_files) ? pipeline.documentation_files.length : 0,
    design_artifacts: {
      system_design: Boolean(designArtifacts.system_design),
      database_design: Boolean(designArtifacts.database_design),
      ui_ux_design: Boolean(designArtifacts.ui_ux_design),
      api_design: Boolean(designArtifacts.api_design),
      security_design: Boolean(designArtifacts.security_design)
    },
    versions_total: Array.isArray(versionPlan && versionPlan.versions) ? versionPlan.versions.length : 0,
    evolutions_total: Array.isArray(pipeline && pipeline.evolutions) ? pipeline.evolutions.length : Array.isArray(plan && plan.evolutions) ? plan.evolutions.length : 0,
    task_punches_total: Array.isArray(pipeline && pipeline.task_punches) ? pipeline.task_punches.length : taskPunch ? 1 : 0,
    next_evolution: pipeline && pipeline.next_evolution ? pipeline.next_evolution : (plan && plan.recommended_evolution) || {},
    roadmap_train_summary: roadmapTrainSummary,
    viber_pipeline: viberPipeline ? {
      report_type: viberPipeline.report_type || "kvdf_viber_planning_to_task_pipeline",
      track: viberPipeline.track || "vibe_app_developer",
      delivery_mode: viberPipeline.delivery_mode || null,
      source_of_truth: viberPipeline.source_of_truth || "file_first",
      stages_total: stagesTotal,
      complete_total: completeStages,
      blocked_total: blockedStages,
      next_stage: nextStage,
      execution_allowed: Boolean(viberPipeline.execution_allowed),
      next_action: viberPipeline.readiness && viberPipeline.readiness.next_action ? viberPipeline.readiness.next_action : viberPipeline.next_action || "",
      source_control_mode: viberPipeline.source_control ? viberPipeline.source_control.mode || null : null
    } : null,
    stages_total: stagesTotal,
    complete_total: completeStages,
    blocked_total: blockedStages,
    execution_allowed: Boolean(viberPipeline && viberPipeline.execution_allowed),
    next_stage: nextStage,
    next_action: viberPipeline && viberPipeline.readiness && viberPipeline.readiness.next_action ? viberPipeline.readiness.next_action : plan && plan.next_action || "",
    visual: visual ? {
      available: true,
      graph_format: visual.graph && visual.graph.format ? visual.graph.format : (visual.format || "mermaid"),
      board_columns: visual.board && Array.isArray(visual.board.columns) ? visual.board.columns.length : 0,
      scope_allowed_total: visual.scope_map && Array.isArray(visual.scope_map.allowed_files) ? visual.scope_map.allowed_files.length : 0,
      scope_forbidden_total: visual.scope_map && Array.isArray(visual.scope_map.forbidden_files) ? visual.scope_map.forbidden_files.length : 0
    } : {
      available: false,
      graph_format: null,
      board_columns: 0,
      scope_allowed_total: 0,
      scope_forbidden_total: 0
    },
    task_punch: taskPunch ? {
      available: true,
      task_count: Array.isArray(taskPunch.tasks) ? taskPunch.tasks.length : 0,
      task_ids: Array.isArray(taskPunch.tasks) ? taskPunch.tasks.map((task) => task.id || task.task_id).filter(Boolean) : [],
      first_task: Array.isArray(taskPunch.tasks) && taskPunch.tasks.length ? taskPunch.tasks[0] : null
    } : {
      available: false,
      task_count: 0,
      task_ids: [],
      first_task: null
    }
  };
}

function buildPlannerGuidanceState(plan = null) {
  if (!plan) {
    return {
      summary: "Planner runtime is missing or has no approved current plan yet.",
      notes: [
        "Run planner propose to create a governed plan.",
        "Approve the plan before materializing or executing it.",
        "Dashboard state remains safe when planner runtime is absent."
      ]
    };
  }
  const mode = String(plan && plan.planner_mode || "").trim().toLowerCase();
  if (mode === "vibe") {
    return {
      summary: "Local-first app-track planning stays separate from KVDF Core unless owner-approved.",
      notes: [
        "Keep KVDF Core edits out of scope unless the Owner explicitly asks for framework work.",
        "Use the questionnaire, intake, design, version, evolution, and handoff pipeline first.",
        "Branch, PR, and GitHub remain optional and provider-driven."
      ]
    };
  }
  if (mode === "plugin") {
    return {
      summary: "Plugin-track planning stays inside the selected plugin and protects unrelated plugins and plugin-links state.",
      notes: [
        "Keep the selected plugin manifest, runtime, docs, schemas, and tests in parity.",
        "Protect .kabeeri/plugin-links/ runtime mount state.",
        "Do not touch unrelated plugins."
      ]
    };
  }
  return {
    summary: "KVDF Core owner-track planning defaults to direct-to-main and keeps KVDOS and runtime state out of scope.",
    notes: [
      "Direct-to-main is the default source-control delivery mode when Git is available.",
      "Do not touch KVDOS unless the Evolution explicitly targets it.",
      "Do not commit .kabeeri runtime state."
    ]
  };
}

function buildPlannerDashboardState(options = {}) {
  const project = options.project || {};
  const plannerState = readPlannerRuntimeState();
  const currentPlan = findCurrentApprovedPlannerPlan(plannerState || {});
  const available = Boolean(plannerState);
  const currentPlanStatus = !plannerState ? "missing" : currentPlan ? "approved" : "empty";
  const plannerMode = currentPlan ? String(currentPlan.planner_mode || "").trim().toLowerCase() || null : null;
  const track = currentPlan ? String(currentPlan.track || "").trim() || null : null;
  const deliveryMode = currentPlan ? String(currentPlan.delivery_mode || "").trim() || null : null;
  const sourceControl = normalizePlannerSourceControl(currentPlan ? currentPlan.source_control : null);
  const versionPlan = buildPlannerVersionPlanSummary(currentPlan);
  const pipeline = buildPlannerPipelineSummary(currentPlan);
  const roadmapTrainSummary = buildRoadmapTrainSummarySnapshot(currentPlan ? currentPlan.roadmap_train : null);
  const securityGate = buildSecurityGateState({
    track: currentPlan && String(currentPlan.track || "").toLowerCase().includes("vibe") ? "vibe" : "owner",
    scope: "workspace",
    evolution: currentPlan ? currentPlan.evolution_change_id || currentPlan.current_change_id || null : null,
    required: Boolean(
      currentPlan && (
        currentPlan.security_gate_required ||
        (Array.isArray(currentPlan.policy_gates) && currentPlan.policy_gates.some((item) => String(item).toLowerCase() === "security"))
      )
    ),
    persist: false
  });
  const visual = currentPlan && currentPlan.visual ? {
    available: true,
    graph_format: currentPlan.visual.graph && currentPlan.visual.graph.format ? currentPlan.visual.graph.format : (currentPlan.visual.format || "mermaid"),
    board_columns: currentPlan.visual.board && Array.isArray(currentPlan.visual.board.columns) ? currentPlan.visual.board.columns.length : 0,
    scope_allowed_total: currentPlan.visual.scope_map && Array.isArray(currentPlan.visual.scope_map.allowed_files) ? currentPlan.visual.scope_map.allowed_files.length : 0,
    scope_forbidden_total: currentPlan.visual.scope_map && Array.isArray(currentPlan.visual.scope_map.forbidden_files) ? currentPlan.visual.scope_map.forbidden_files.length : 0,
    graph: currentPlan.visual.graph || null,
    board: currentPlan.visual.board || null,
    scope_map: currentPlan.visual.scope_map || null
  } : {
    available: false,
    graph_format: null,
    board_columns: 0,
    scope_allowed_total: 0,
    scope_forbidden_total: 0,
    graph: null,
    board: null,
    scope_map: null
  };
  const materialization = {
    status: currentPlan ? (currentPlan.materialization_status || (currentPlan.materialized_at ? "materialized" : "not_materialized")) : "unknown",
    evolution_change_id: currentPlan ? currentPlan.evolution_change_id || null : null,
    materialized_task_ids: currentPlan && Array.isArray(currentPlan.materialized_task_ids) ? [...currentPlan.materialized_task_ids] : [],
    report_path: currentPlan ? currentPlan.materialization_report_path || null : null
  };
  const nextEvolution = currentPlan && currentPlan.recommended_evolution ? currentPlan.recommended_evolution : {};
  const nextAction = !plannerState
    ? "Run kvdf planner propose --goal \"...\" --track owner|vibe|plugin --json."
    : currentPlan
      ? materialization.status === "materialized"
        ? "Run kvdf planner prompt --from-current --json, then execute the first approved task slice."
        : "Run kvdf planner materialize --from-current --json."
      : "Run kvdf planner propose --goal \"...\" --track owner|vibe|plugin --json.";
  return {
    available,
    planner_version: plannerState ? plannerState.planner_version || "1" : null,
    current_plan_id: currentPlan ? currentPlan.plan_id || null : null,
    current_plan_status: currentPlanStatus,
    current_planner_mode: plannerMode,
    track,
    delivery_mode: deliveryMode,
    source_control: sourceControl,
    version_plan: versionPlan,
    pipeline,
    roadmap_train_summary: roadmapTrainSummary,
    security_gate: securityGate,
    visual,
    task_punch: pipeline.task_punch,
    materialization,
    next_evolution: nextEvolution,
    next_action: nextAction,
    guidance: buildPlannerGuidanceState(currentPlan),
    planner_state: plannerState || null,
    current_plan: currentPlan || null
  };
}

function writeDashboardStateFiles(state, deps = {}) {
  const summarizeUsage = deps.summarizeUsage || (() => ({ total_events: 0, total_cost: 0, total_tokens: 0, by_task: {}, by_developer: {}, by_workstream: {}, by_provider: {}, by_sprint: {}, tracked_vs_untracked: { tracked: 0, untracked: 0 } }));
  const buildTaskTrackerStateFromFiles = deps.buildTaskTrackerStateFromFiles || (() => ({ generated_at: new Date().toISOString(), summary: { by_status: {} } }));
  const refreshAgileDashboardState = deps.refreshAgileDashboardState || ((value) => normalizeAgileDashboardState(value || readAgileState()));
  const refreshStructuredDashboardState = deps.refreshStructuredDashboardState || ((value) => normalizeStructuredDashboardState(value || readStructuredState()));
  const usageSummary = state && state.records && state.records.usage ? state.records.usage : summarizeUsage();
  writeJsonFile(".kabeeri/dashboard/technical_state.json", state.technical);
  writeJsonFile(".kabeeri/dashboard/business_state.json", state.business);
  writeJsonFile(".kabeeri/dashboard/task_tracker_state.json", state.task_tracker || buildTaskTrackerStateFromFiles());
  writeJsonFile(".kabeeri/dashboard/agile_state.json", state.records && state.records.agile_live ? state.records.agile_live : refreshAgileDashboardState());
  writeJsonFile(".kabeeri/dashboard/structured_state.json", state.records && state.records.structured_live ? state.records.structured_live : refreshStructuredDashboardState());
  writeJsonFile(".kabeeri/ai_usage/usage_summary.json", usageSummary);
  writeJsonFile(".kabeeri/ai_usage/cost_breakdown.json", {
    by_task: usageSummary.by_task || {},
    by_developer: usageSummary.by_developer || {},
    by_workstream: usageSummary.by_workstream || {},
    by_provider: usageSummary.by_provider || {},
    by_sprint: usageSummary.by_sprint || {},
    tracked_vs_untracked: usageSummary.tracked_vs_untracked || {}
  });
}

function refreshDashboardArtifacts(options = {}, deps = {}) {
  if (!fileExists(".kabeeri/project.json")) return null;
  const state = collectDashboardState(options, deps);
  const validation = validateDashboardContracts(state);
  if (!validation.ok) {
    throw new Error(`Dashboard contract validation failed: ${validation.failures.join(", ")}`);
  }
  writeDashboardStateFiles(state, deps);
  return state;
}

function normalizeAgileDashboardState(data = {}) {
  const backlog = Array.isArray(data.backlog) ? data.backlog : [];
  const epics = Array.isArray(data.epics) ? data.epics : [];
  const stories = Array.isArray(data.stories) ? data.stories : [];
  const sprintReviews = Array.isArray(data.sprint_reviews) ? data.sprint_reviews : [];
  const impediments = Array.isArray(data.impediments) ? data.impediments : [];
  const retrospectives = Array.isArray(data.retrospectives) ? data.retrospectives : [];
  const releases = Array.isArray(data.releases) ? data.releases : [];
  const openImpediments = impediments.filter((item) => item.status !== "resolved");
  const nextRelease = releases.find((item) => !["released", "cancelled"].includes(item.status || "planned")) || releases[releases.length - 1] || null;
  const summary = data.summary || {
    backlog_items: backlog.length,
    epics: epics.length,
    stories: stories.length,
    ready_stories: stories.filter((item) => item.ready_status === "ready").length,
    not_ready_stories: stories.filter((item) => item.ready_status !== "ready").length,
    committed_stories: stories.filter((item) => item.status === "selected_for_sprint").length,
    sprint_reviews: sprintReviews.length,
    open_impediments: openImpediments.length,
    retrospectives: retrospectives.length,
    releases: releases.length,
    next_release: nextRelease ? nextRelease.release_id || "none" : "none",
    health: "healthy"
  };
  return {
    generated_at: data.generated_at || new Date().toISOString(),
    source: data.source || ".kabeeri/agile.json",
    live_json_path: data.live_json_path || ".kabeeri/dashboard/agile_state.json",
    live_api_path: data.live_api_path || "/__kvdf/api/agile",
    summary,
    active_sprints: Array.isArray(data.active_sprints) ? data.active_sprints : [],
    velocity: data.velocity || {
      average_last_5_sprints: 0,
      reviewed_sprints: 0,
      latest_accepted_points: 0
    },
    forecast: data.forecast || {
      remaining_points: 0,
      average_velocity: 0,
      estimated_sprints_remaining: null
    },
    impediments: openImpediments,
    releases,
    release_readiness: data.release_readiness || null,
    retrospectives,
    action_items: Array.isArray(data.action_items) ? data.action_items : []
  };
}

function normalizeStructuredDashboardState(data = {}) {
  const requirements = Array.isArray(data.requirements) ? data.requirements : [];
  const phases = Array.isArray(data.phases) ? data.phases : [];
  const milestones = Array.isArray(data.milestones) ? data.milestones : [];
  const deliverables = Array.isArray(data.deliverables) ? data.deliverables : [];
  const approvals = Array.isArray(data.approvals) ? data.approvals : [];
  const changeRequests = Array.isArray(data.change_requests) ? data.change_requests : [];
  const risks = Array.isArray(data.risks) ? data.risks : [];
  const gates = Array.isArray(data.gates) ? data.gates : [];
  const openRisks = risks.filter((item) => item.status === "open");
  const blockedGates = gates.filter((item) => item.status === "blocked");
  const traceability = data.traceability || {
    requirements_total: requirements.length,
    approved_requirements: requirements.filter((item) => item.approval_status === "approved").length,
    requirements_with_tasks: requirements.filter((item) => (item.task_ids || []).length).length,
    orphan_tasks: []
  };
  const summary = data.summary || {
    requirements: requirements.length,
    approved_requirements: traceability.approved_requirements || 0,
    requirements_with_tasks: traceability.requirements_with_tasks || 0,
    phases: phases.length,
    completed_phases: phases.filter((item) => item.status === "completed").length,
    milestones: milestones.length,
    approved_deliverables: deliverables.filter((item) => item.status === "approved").length,
    open_change_requests: changeRequests.filter((item) => item.status === "proposed").length,
    open_high_risks: openRisks.filter((item) => ["high", "critical"].includes(item.severity)).length,
    blocked_gates: blockedGates.length,
    health: "healthy"
  };
  return {
    generated_at: data.generated_at || new Date().toISOString(),
    source: data.source || ".kabeeri/structured.json",
    live_json_path: data.live_json_path || ".kabeeri/dashboard/structured_state.json",
    live_api_path: data.live_api_path || "/__kvdf/api/structured",
    summary,
    phases,
    traceability,
    gates,
    risks: openRisks,
    change_requests: changeRequests,
    action_items: Array.isArray(data.action_items) ? data.action_items : [],
    milestones,
    deliverables,
    approvals
  };
}

function normalizeWorkstreamId(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function taskWorkstreams(taskItem) {
  return Array.isArray(taskItem.workstreams) && taskItem.workstreams.length
    ? taskItem.workstreams.map(normalizeWorkstreamId)
    : taskItem.workstream ? [normalizeWorkstreamId(taskItem.workstream)] : ["unassigned"];
}

function getTaskWorkstreamsById(taskId) {
  if (!taskId) return [];
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const taskItem = tasks.find((item) => item.id === taskId);
  return taskItem ? taskWorkstreams(taskItem) : [];
}

function publicCustomerAppUrl(username) {
  return `/customer/apps/${encodeURIComponent(username)}`;
}

function table(headers, rows) {
  const head = `| ${headers.join(" | ")} |`;
  const separator = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.join(" | ")} |`);
  return [head, separator, ...body].join("\n");
}

function parseCsv(value) {
  if (!value) return [];
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function collectDashboardStateForCurrentTrack(options = {}, deps = {}) {
  const context = buildDashboardTrackContext(options, deps);
  return context.dashboard_type === "viber"
    ? buildViberDashboardState(context, deps)
    : buildOwnerDashboardState(context, deps);
}

function writeDashboardStateFilesForCurrentTrack(stateOrOptions = {}, deps = {}) {
  const context = buildDashboardTrackContext(stateOrOptions, deps);
  const ownerState = context.dashboard_type === "owner" && stateOrOptions && stateOrOptions.dashboard_type === "owner"
    ? stateOrOptions
    : buildOwnerDashboardState(context, deps);
  const viberState = context.dashboard_type === "viber" && stateOrOptions && stateOrOptions.dashboard_type === "viber"
    ? stateOrOptions
    : buildViberDashboardState(context, deps);
  writeJsonFile(".kabeeri/dashboard/owner_dashboard_state.json", ownerState);
  writeJsonFile(".kabeeri/dashboard/viber_dashboard_state.json", viberState);
  writeJsonFile(".kabeeri/dashboard/task_tracker_state.json", context.task_tracker_state || buildTaskTrackerStateFromFiles(deps));
  return { owner: ownerState, viber: viberState };
}

function buildDashboardTrackContext(options = {}, deps = {}) {
  const project = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
  const projectTrack = resolveWorkspaceTrack(project.workspace_kind);
  const deliveryMode = String(project.delivery_mode || "").trim().toLowerCase();
  const deliveryTrack = ["agile", "structured"].includes(deliveryMode) ? "vibe_app_developer" : projectTrack;
  const requested = normalizeDashboardScope(options.scope || options.dashboard_type || options.track || options.product || options.dashboard_scope || "");
  const dashboardType = requested === "viber" || requested === "app" || requested === "current-viber"
    ? "viber"
    : requested === "owner" || requested === "framework" || requested === "current-owner"
      ? "owner"
      : deliveryTrack === "vibe_app_developer"
        ? "viber"
        : "owner";
  const workspaceTrack = dashboardType === "viber" ? "vibe_app_developer" : "framework_owner";
  const plannerState = buildPlannerDashboardState({ project, dashboard_scope: workspaceTrack });
  const plannerPlan = plannerState.current_plan || null;
  const sourceControl = buildDashboardSourceControl(dashboardType, plannerState, deps);
  const tasks = filterByTrack(readStateArray(".kabeeri/tasks.json", "tasks"), workspaceTrack);
  const tokens = filterByTrack(readStateArray(".kabeeri/tokens.json", "tokens"), workspaceTrack);
  const locks = filterByTrack(readStateArray(".kabeeri/locks.json", "locks"), workspaceTrack);
  const sessions = filterByTrack(readStateArray(".kabeeri/sessions.json", "sessions"), workspaceTrack);
  const evolutionState = fileExists(".kabeeri/evolution.json") ? readJsonFile(".kabeeri/evolution.json") : { changes: [], impact_plans: [], current_change_id: null };
  const filteredEvolutionState = filterEvolutionState(evolutionState, workspaceTrack, project.workspace_kind);
  const evolutionSummary = buildEvolutionSummary(filteredEvolutionState);
  const usageSummary = fileExists(".kabeeri/ai_usage/usage_summary.json") ? readJsonFile(".kabeeri/ai_usage/usage_summary.json") : summarizeUsage();
  const apps = readStateArray(".kabeeri/customer_apps.json", "apps");
  const features = readStateArray(".kabeeri/features.json", "features");
  const journeys = readStateArray(".kabeeri/journeys.json", "journeys");
  const questionnaireAnswers = readStateArray(".kabeeri/questionnaires/answers.json", "answers");
  const questionnaireCoverage = readStateArray(".kabeeri/questionnaires/coverage_matrix.json", "areas");
  const questionnairePlans = readStateArray(".kabeeri/questionnaires/adaptive_intake_plan.json", "plans");
  const questionnaireMissing = readStateArray(".kabeeri/questionnaires/missing_answers_report.json", "missing");
  const productBlueprintState = fileExists(".kabeeri/product_blueprints.json") ? readJsonFile(".kabeeri/product_blueprints.json") : { selected_blueprints: [], recommendations: [] };
  const dataDesignState = fileExists(".kabeeri/data_design.json") ? readJsonFile(".kabeeri/data_design.json") : { contexts: [], reviews: [] };
  const agileState = fileExists(".kabeeri/agile.json") ? readJsonFile(".kabeeri/agile.json") : { backlog: [], epics: [], stories: [], sprint_reviews: [], impediments: [], retrospectives: [], releases: [] };
  const structuredState = fileExists(".kabeeri/structured.json") ? readJsonFile(".kabeeri/structured.json") : { requirements: [], phases: [], milestones: [], deliverables: [], approvals: [], change_requests: [], risks: [], gates: [] };
  const taskTrashState = fileExists(".kabeeri/task_trash.json") ? readJsonFile(".kabeeri/task_trash.json") : { trash: [], retention_days: null, last_sweep_at: null };
  const pluginState = fileExists(".kabeeri/plugins.json") ? readJsonFile(".kabeeri/plugins.json") : { plugins: [], bundles: [] };
  const developerEfficiency = buildDeveloperEfficiency();
  const git = readGitRepositoryState(repoRoot());
  const gitStatus = readGitStatus(repoRoot());
  const currentPlanVersionSummary = plannerState.version_plan || {
    available: false,
    versions_total: 0,
    current_version: null,
    next_version: null,
    source_control_mode: null
  };
  const evolutionBoard = buildDashboardEvolutionBoard(filteredEvolutionState, evolutionSummary);
  const currentTaskTracker = buildTaskTrackerState({
    generatedAt: new Date().toISOString(),
    workspaceTrack,
    tasks,
    apps,
    tokens,
    locks,
    sessions,
    sprints: readStateArray(".kabeeri/sprints.json", "sprints"),
    acceptanceRecords: readStateArray(".kabeeri/acceptance.json", "records"),
    usageSummary,
    vibeSuggestions: readStateArray(".kabeeri/interactions/suggested_tasks.json", "suggested_tasks"),
    vibeCaptures: readStateArray(".kabeeri/interactions/post_work_captures.json", "captures")
  }, deps);
  return {
    dashboard_type: dashboardType,
    workspace_track: workspaceTrack,
    project,
    plannerState,
    plannerPlan,
    sourceControl,
    tasks,
    tokens,
    locks,
    sessions,
    evolutionState,
    evolutionSummary,
    usageSummary,
    apps,
    features,
    journeys,
    questionnaireAnswers,
    questionnaireCoverage,
    questionnairePlans,
    questionnaireMissing,
    productBlueprintState,
    dataDesignState,
    agileState,
    structuredState,
    taskTrashState,
    pluginState,
    developerEfficiency,
    git,
    gitStatus,
    versionPlanSummary: currentPlanVersionSummary,
    evolutionBoard,
    task_tracker_state: currentTaskTracker
  };
}

function buildDashboardSourceControl(dashboardType, plannerState, deps = {}) {
  const project = plannerState && plannerState.current_plan ? plannerState.current_plan.project || {} : {};
  const git = readGitRepositoryState(repoRoot());
  const currentBranch = git.available ? git.current_branch || null : null;
  const sourceControl = normalizePlannerSourceControl(plannerState ? plannerState.source_control : null);
  if (dashboardType === "viber") {
    return {
      ...sourceControl,
      provider: sourceControl.provider || "none",
      remote_provider: sourceControl.remote_provider || "none",
      mode: sourceControl.mode && sourceControl.mode !== "none" ? sourceControl.mode : "local_first",
      branching_enabled: Boolean(sourceControl.branching_enabled),
      pr_enabled: Boolean(sourceControl.pr_enabled),
      current_branch: sourceControl.current_branch || currentBranch,
      default_branch: sourceControl.default_branch || "main",
      notes: [
        ...(sourceControl.notes || []),
        "Viber/App dashboards default to local-first delivery and keep Git optional.",
        "Branching and pull requests stay optional unless the selected plan enables them."
      ]
    };
  }
  return {
    ...sourceControl,
    provider: git.available ? sourceControl.provider || "git" : "none",
    remote_provider: sourceControl.remote_provider || "none",
    mode: sourceControl.mode && sourceControl.mode !== "none" ? sourceControl.mode : "direct_main",
    branching_enabled: Boolean(sourceControl.branching_enabled),
    pr_enabled: Boolean(sourceControl.pr_enabled),
    current_branch: sourceControl.current_branch || currentBranch,
    default_branch: sourceControl.default_branch || "main",
    notes: [
      ...(sourceControl.notes || []),
      "Owner dashboards default to direct-to-main source control.",
      "KVDOS and runtime state remain out of the commit path."
    ]
  };
}

function readDashboardAiLearningSummary() {
  const localState = fileExists(".kabeeri/ai_learning/failure_patterns.json")
    ? readJsonFile(".kabeeri/ai_learning/failure_patterns.json")
    : { patterns: [], fast_paths: [], shared_patterns: [], shared_fast_paths: [] };
  const sharedState = fileExists("knowledge/ai_learning/shared_patterns.json")
    ? readJsonFile("knowledge/ai_learning/shared_patterns.json")
    : { shared_patterns: [], shared_fast_paths: [] };
  const localPatterns = Array.isArray(localState.patterns) ? localState.patterns : [];
  const localFastPaths = Array.isArray(localState.fast_paths) ? localState.fast_paths : [];
  const sharedPatterns = Array.isArray(localState.shared_patterns) && localState.shared_patterns.length
    ? localState.shared_patterns
    : Array.isArray(sharedState.shared_patterns)
      ? sharedState.shared_patterns
      : [];
  const sharedFastPaths = Array.isArray(localState.shared_fast_paths) && localState.shared_fast_paths.length
    ? localState.shared_fast_paths
    : Array.isArray(sharedState.shared_fast_paths)
      ? sharedState.shared_fast_paths
      : [];
  const activeWarnings = [...localPatterns, ...sharedPatterns].filter((item) => String(item && item.status || "").toLowerCase() === "active");
  const activeFastPaths = [...localFastPaths, ...sharedFastPaths].filter((item) => String(item && item.status || "").toLowerCase() === "active");
  const total = localPatterns.length + localFastPaths.length + sharedPatterns.length + sharedFastPaths.length;
  return {
    status: total > 0 ? "ok" : "empty",
    local_patterns_total: localPatterns.length,
    local_fast_paths_total: localFastPaths.length,
    shared_patterns_total: sharedPatterns.length,
    shared_fast_paths_total: sharedFastPaths.length,
    active_warning_total: activeWarnings.length,
    active_fast_path_total: activeFastPaths.length,
    next_action: total > 0
      ? "Review the active learning warnings and fast paths before planning."
      : "Capture or promote learning so prompt context stays useful."
  };
}

function buildDashboardReadinessStageTimeline(visual = null) {
  const stages = ["idea", "requirements", "design", "implementation", "validation", "handoff"];
  const stageMap = new Map(Array.isArray(visual && visual.stage_timeline) ? visual.stage_timeline.map((item) => [item.stage, item]) : []);
  return stages.map((stage) => {
    const item = stageMap.get(stage) || {};
    return {
      stage,
      status: item.status || "unknown",
      outputs: Array.isArray(item.outputs) ? item.outputs : [],
      next_action: item.next_action || `Advance the ${stage} stage.`
    };
  });
}

function buildDashboardReadinessState(context = {}, dashboardType = "owner") {
  const plannerState = context.plannerState || {};
  const visual = plannerState.visual || null;
  const plannerMode = dashboardType === "viber" ? "vibe" : "owner";
  const sourceControlMode = context.sourceControl && context.sourceControl.mode
    ? context.sourceControl.mode
    : dashboardType === "viber"
      ? "local_first"
      : "direct_main";
  const planningLifecycle = visual && visual.planning_lifecycle ? visual.planning_lifecycle : {
    method: "manual",
    confidence: "low",
    reason: "No planner visual model is available yet.",
    current_version: null,
    next_version: null,
    current_evolution: null,
    next_evolution: null,
    state_freshness: "unknown",
    source_of_truth: "unknown"
  };
  const gateMatrix = visual && visual.gate_matrix ? visual.gate_matrix : {
    state_resync: { gate: "state_resync", status: "unknown", summary: "No state resync evidence is available yet.", blockers: [], warnings: [], next_action: `Run kvdf state resync --track ${plannerMode} --json.` },
    docs: { gate: "docs", status: "unknown", summary: "No planner visual docs gate is available yet.", blockers: [], warnings: [], next_action: "Generate or inspect planner docs." },
    evolution: { gate: "evolution", status: "unknown", summary: "No planner evolution gate is available yet.", blockers: [], warnings: [], next_action: "Review the approved evolution." },
    task: { gate: "task", status: "unknown", summary: "No planner task gate is available yet.", blockers: [], warnings: [], next_action: "Review task readiness." },
    validation: { gate: "validation", status: "unknown", summary: "No validation gate is available yet.", blockers: [], warnings: [], next_action: "Run validation checks." },
    security: { gate: "security", status: "unknown", summary: "No security gate is available yet.", blockers: [], warnings: [], next_action: "Review security readiness." },
    handoff: { gate: "handoff", status: "unknown", summary: "No handoff gate is available yet.", blockers: [], warnings: [], next_action: "Prepare handoff readiness." },
    publish: { gate: "publish", status: "unknown", summary: "No publish gate is available yet.", blockers: [], warnings: [], next_action: "Confirm publish readiness." }
  };
  const blockers = Array.isArray(visual && visual.blockers) ? visual.blockers.map((item) => ({ ...item })) : [];
  const warnings = Array.isArray(visual && visual.warnings) ? visual.warnings.map((item) => String(item)) : [];
  const publishReadiness = visual && visual.publish_readiness ? visual.publish_readiness : {
    status: "blocked",
    score: 0,
    label: "Publish readiness unavailable",
    auto_publish: false,
    rule: "KVDF must not auto-publish.",
    next_action: `Run kvdf state resync --track ${plannerMode} --json, then kvdf planner visual --track ${plannerMode} --json.`
  };
  const executionFeedback = visual && visual.execution_feedback ? visual.execution_feedback : {
    status: "none",
    executor: null,
    checks_run: [],
    changed_files: [],
    warnings: [],
    stop_condition: "No execution feedback has been recorded yet.",
    updated_at: null
  };
  const stageTimeline = buildDashboardReadinessStageTimeline(visual);
  const readinessLabel = blockers.some((item) => item.severity === "blocker")
    ? "blocked"
    : warnings.length > 0
      ? "warning"
      : planningLifecycle.state_freshness === "current" || publishReadiness.status === "ready"
        ? "ready"
        : "unknown";
  const blockedTotal = blockers.filter((item) => item.severity === "blocker").length + Object.values(gateMatrix).filter((gate) => gate && gate.status === "blocked").length;
  const warningsTotal = warnings.length + blockers.filter((item) => item.severity === "warning").length + Object.values(gateMatrix).filter((gate) => gate && gate.status === "warning").length;
  const nextSafeAction = planningLifecycle.state_freshness !== "current" || blockedTotal > 0
    ? `Run kvdf state resync --track ${plannerMode} --json, then kvdf planner visual --track ${plannerMode} --json.`
    : publishReadiness.next_action || plannerState.next_action || "Continue with the next governed action.";
  return {
    summary: {
      state_freshness: planningLifecycle.state_freshness || "unknown",
      readiness_label: readinessLabel,
      blocked_total: blockedTotal,
      warnings_total: warningsTotal,
      next_safe_action: nextSafeAction,
      planner_mode: plannerMode,
      track: dashboardType === "viber" ? "vibe_app_developer" : "framework_owner",
      source_control_mode: sourceControlMode,
      auto_publish: false
    },
    planning_lifecycle: planningLifecycle,
    gate_matrix: gateMatrix,
    blockers,
    warnings,
    readiness_summary: visual && visual.readiness_summary ? visual.readiness_summary : {
      docs_status: "unknown",
      task_status: "unknown",
      evolution_status: "unknown",
      validation_status: "unknown",
      security_status: "unknown",
      handoff_status: "unknown"
    },
    publish_readiness: { ...publishReadiness, auto_publish: false },
    execution_feedback: { ...executionFeedback, status: executionFeedback.status || "none" },
    stage_timeline: stageTimeline,
    security_status: visual && visual.readiness_summary ? visual.readiness_summary.security_status || "unknown" : "unknown",
    ai_learning_status: readDashboardAiLearningSummary(),
    dashboard_summary: {
      version_to_publish_summary: visual && visual.dashboard_summary ? visual.dashboard_summary.version_to_publish_summary || {} : {},
      gate_summary: visual && visual.dashboard_summary ? visual.dashboard_summary.gate_summary || {} : {},
      readiness_label: readinessLabel,
      blocked_total: blockedTotal,
      warnings_total: warningsTotal
    }
  };
}

function buildDashboardReadinessWidgets(readiness, dashboardType = "owner") {
  const track = dashboardType === "viber" ? "vibe_app_developer" : "framework_owner";
  const source = "planner_visual";
  return [
    dashboardWidget(`${dashboardType}_state_freshness`, dashboardType === "viber" ? "App State Freshness" : "State Freshness", "status", readiness.summary.state_freshness, readiness.summary.state_freshness === "current" ? "ok" : readiness.summary.state_freshness === "stale" ? "warning" : "unknown", track, source, readiness.summary.next_safe_action),
    dashboardWidget(`${dashboardType}_planner_readiness`, dashboardType === "viber" ? "Pipeline Readiness" : "Planner Readiness", "status", readiness.summary.readiness_label, readiness.summary.readiness_label === "blocked" ? "blocked" : readiness.summary.readiness_label === "warning" ? "warning" : readiness.summary.readiness_label === "ready" ? "ok" : "unknown", track, source, readiness.summary.next_safe_action),
    dashboardWidget(`${dashboardType}_gate_blocks`, "Gate Blocks", "metric", readiness.summary.blocked_total, readiness.summary.blocked_total > 0 ? "blocked" : "ok", track, source, readiness.summary.next_safe_action),
    dashboardWidget(`${dashboardType}_security_status`, "Security Status", "status", readiness.security_status, readiness.security_status === "blocked" ? "blocked" : readiness.security_status === "warning" ? "warning" : readiness.security_status === "pass" ? "ok" : "unknown", track, source, readiness.gate_matrix.security ? readiness.gate_matrix.security.next_action : readiness.summary.next_safe_action),
    dashboardWidget(`${dashboardType}_publish_readiness`, dashboardType === "viber" ? "Handoff / Publish Readiness" : "Publish / Direct-main Readiness", "status", readiness.publish_readiness.label || readiness.publish_readiness.status, readiness.publish_readiness.status === "blocked" ? "blocked" : readiness.publish_readiness.status === "warning" ? "warning" : "ok", track, source, readiness.publish_readiness.next_action || readiness.summary.next_safe_action),
    dashboardWidget(`${dashboardType}_ai_learning`, "AI Learning Context", "status", readiness.ai_learning_status.status, readiness.ai_learning_status.status === "empty" || readiness.ai_learning_status.status === "unknown" ? "unknown" : readiness.ai_learning_status.status === "warning" ? "warning" : "ok", track, source, readiness.ai_learning_status.next_action),
    dashboardWidget(`${dashboardType}_next_safe_action`, "Next Safe Action", "action", readiness.summary.next_safe_action, readiness.summary.readiness_label === "blocked" ? "blocked" : readiness.summary.readiness_label === "warning" ? "warning" : "ok", track, source, readiness.summary.next_safe_action)
  ];
}

function buildReadinessGateRows(readiness) {
  return Object.values(readiness.gate_matrix || {}).map((gate) => [
    gate.gate || "",
    gate.status || "unknown",
    Array.isArray(gate.blockers) && gate.blockers.length ? gate.blockers.join("; ") : "none",
    Array.isArray(gate.warnings) && gate.warnings.length ? gate.warnings.join("; ") : "none",
    gate.next_action || ""
  ]);
}

function buildReadinessBlockerRows(readiness) {
  const rows = Array.isArray(readiness.blockers) ? readiness.blockers.map((item) => [
    item.severity || "warning",
    item.area || "",
    item.message || "",
    item.next_action || ""
  ]) : [];
  return rows.length ? rows : [["info", "dashboard", "No immediate blockers found.", "Continue with the next governed task."]];
}

function buildReadinessPublishRows(readiness) {
  const item = readiness.publish_readiness || {};
  return [[
    item.status || "unknown",
    String(item.score ?? 0),
    item.label || "",
    item.auto_publish ? "true" : "false",
    item.rule || "KVDF must not auto-publish.",
    item.next_action || ""
  ]];
}

function buildReadinessExecutionFeedbackRows(readiness) {
  const item = readiness.execution_feedback || {};
  return [[
    item.status || "none",
    item.executor || "n/a",
    Array.isArray(item.checks_run) ? item.checks_run.join("; ") : "",
    Array.isArray(item.changed_files) ? item.changed_files.join("; ") : "",
    Array.isArray(item.warnings) && item.warnings.length ? item.warnings.join("; ") : "none",
    item.stop_condition || "",
    item.updated_at || ""
  ]];
}

function buildReadinessStageRows(readiness) {
  return (Array.isArray(readiness.stage_timeline) ? readiness.stage_timeline : []).map((stage) => [
    stage.stage || "",
    stage.status || "unknown",
    Array.isArray(stage.outputs) && stage.outputs.length ? stage.outputs.join("; ") : "none",
    stage.next_action || ""
  ]);
}

function buildOwnerDashboardState(context = {}, deps = {}) {
  const currentEvolution = context.evolutionBoard.current_evolution || context.evolutionSummary.latest_change || null;
  const currentPlan = context.plannerPlan || null;
  const readiness = buildDashboardReadinessState(context, "owner");
  const commandCenterWidgets = [
    dashboardWidget("owner_current_track", "Current Track", "status", "framework_owner", "ok", "framework_owner", "derived", "Stay on KVDF Core work."),
    dashboardWidget("owner_current_plan", "Current Planner Plan", "status", currentPlan ? currentPlan.title || currentPlan.goal || currentPlan.plan_id : "none", currentPlan ? "ok" : "empty", "framework_owner", "derived", currentPlan ? "Review the approved plan." : "Create or approve an owner plan."),
    dashboardWidget("owner_current_evolution", "Current Evolution", "status", currentEvolution ? currentEvolution.title || currentEvolution.change_id : "none", currentEvolution ? "ok" : "empty", "framework_owner", "derived", currentEvolution ? "Continue the active evolution." : "Select the next evolution."),
    dashboardWidget("owner_next_evolution", "Next Evolution", "status", context.plannerState.next_evolution && context.plannerState.next_evolution.title ? context.plannerState.next_evolution.title : "none", context.plannerState.next_evolution && context.plannerState.next_evolution.title ? "ok" : "empty", "framework_owner", "derived", context.plannerState.next_action || "Run planner propose."),
    dashboardWidget("owner_next_action", "Next Exact Action", "action", context.plannerState.next_action || "Run kvdf planner propose", "ok", "framework_owner", "derived", context.plannerState.next_action || "Run kvdf planner propose."),
    dashboardWidget("owner_source_control", "Direct-to-main Status", "status", context.sourceControl.mode || "direct_main", "ok", "framework_owner", "derived", "Keep the owner flow direct-to-main."),
    dashboardWidget("owner_blockers", "Active Blockers", "metric", ownerActiveBlockerCount(context), ownerActiveBlockerCount(context) > 0 ? "warning" : "ok", "framework_owner", "derived", "Review active blockers before execution."),
    dashboardWidget("owner_archive", "Archived Task Trash", "metric", ownerArchiveCount(context), ownerArchiveCount(context) > 0 ? "warning" : "ok", "framework_owner", "derived", "Trash is history, not an active blocker.")
  ];

  const sections = {
    readiness: createDashboardSection("readiness", "Readiness Overview", buildDashboardReadinessWidgets(readiness, "owner"), [
      createDashboardTable("owner_readiness_gates", "Gate Matrix", ["Gate", "Status", "Blockers", "Warnings", "Next Action"], buildReadinessGateRows(readiness), "No readiness gates available."),
      createDashboardTable("owner_readiness_blockers", "Blockers", ["Severity", "Area", "Message", "Next Action"], buildReadinessBlockerRows(readiness), "No blockers available."),
      createDashboardTable("owner_publish_readiness", "Publish Readiness", ["Status", "Score", "Label", "Auto Publish", "Rule", "Next Action"], buildReadinessPublishRows(readiness), "No publish readiness available."),
      createDashboardTable("owner_execution_feedback", "Execution Feedback", ["Status", "Executor", "Checks Run", "Changed Files", "Warnings", "Stop Condition", "Updated At"], buildReadinessExecutionFeedbackRows(readiness), "No execution feedback available."),
      createDashboardTable("owner_stage_timeline", "Stage Timeline", ["Stage", "Status", "Outputs", "Next Action"], buildReadinessStageRows(readiness), "No stage timeline available.")
    ]),
    command_center: createDashboardSection("command_center", "Command Center", commandCenterWidgets, [
      createDashboardTable("owner_command_center", "Owner Command Center", ["Metric", "Value", "Next Action"], [
        ["Current Track", "framework_owner", "Stay on KVDF Core work."],
        ["Current Planner Plan", currentPlan ? currentPlan.plan_id || currentPlan.title || currentPlan.goal || "approved" : "none", currentPlan ? "Review the approved plan." : "Create or approve an owner plan."],
        ["Current Evolution", currentEvolution ? currentEvolution.change_id || currentEvolution.title || "active" : "none", currentEvolution ? "Continue the active evolution." : "Select the next evolution."],
        ["Next Evolution", context.plannerState.next_evolution && context.plannerState.next_evolution.title ? context.plannerState.next_evolution.title : "none", context.plannerState.next_action || "Run planner propose."],
        ["Direct-to-main", context.sourceControl.mode || "direct_main", "Keep the owner flow direct-to-main."],
        ["Active Blockers", String(ownerActiveBlockerCount(context)), ownerActiveBlockerCount(context) ? "Resolve active blockers before touching KVDOS." : "Continue with the next core task."],
        ["Archived Task Trash", String(ownerArchiveCount(context)), ownerArchiveCount(context) ? "Archive is separate from live blockers." : "No archived trash items."]
      ], "No owner command center data yet.")
    ]),
    core_health: createDashboardSection("core_health", "KVDF Core Health", coreHealthWidgets(context), [
      createDashboardTable("owner_core_health", "KVDF Core Health", ["Check", "Status", "Evidence", "Next Action"], coreHealthRows(context), "No core health data yet.")
    ]),
    planner: createDashboardSection("planner", "Planner", plannerWidgets(context), [
      createDashboardTable("owner_planner", "Planner Plans", ["Plan ID", "Status", "Mode", "Track", "Delivery", "Source Control", "Approved By", "Materialized", "Security Gate", "Next Action"], plannerRows(context), "No approved planner plans yet.")
    ]),
    evolutions: createDashboardSection("evolutions", "Evolutions", evolutionWidgets(context), [
      createDashboardTable("owner_evolutions", "Evolutions", ["Evolution ID", "Title", "Status", "Version", "Track", "Source Control Mode", "Tasks", "Open Tasks", "Materialized", "Stop Condition"], evolutionRows(context), "No owner evolutions yet."),
      createDashboardTable("owner_task_punch", "Task Punch", ["Task ID", "Title", "Status", "Evolution", "Allowed Files", "Validation Commands", "Blockers"], taskPunchRows(context), "No owner task punches yet.")
    ]),
    source_control: createDashboardSection("source_control", "Source Control", sourceControlWidgets(context), [
      createDashboardTable("owner_source_control", "Source Control Matrix", ["Provider", "Remote", "Mode", "Branching", "PR", "Current Branch", "Default Branch", "Notes"], [
        sourceControlRow(context)
      ], "No source control data yet.")
    ]),
    workflows: createDashboardSection("workflows", "Workflows", workflowWidgets(context), [
      createDashboardTable("owner_workflows", "Workflow Table", ["Workflow", "Stage", "Status", "Next Action", "Runtime File", "Owner"], workflowRows(context), "No workflow data yet.")
    ]),
    native_capabilities: createDashboardSection("native_capabilities", "Native Capabilities", capabilityWidgets(context), [
      createDashboardTable("owner_capabilities", "Capability Table", ["Capability", "Commands", "Category", "Maturity", "Runtime Files", "Tests", "Notes"], capabilityRows(context), "No capability registry data yet.")
    ]),
    plugins: createDashboardSection("plugins", "Plugins", pluginWidgets(context), [
      createDashboardTable("owner_plugins", "Plugin Table", ["Plugin", "Track", "Enabled", "Removable", "Family", "Type", "Runtime Entrypoint", "Status", "Gaps"], pluginRows(context), "No plugin data yet.")
    ]),
    ai_cost_control: createDashboardSection("ai_cost_control", "AI Cost Control", aiCostWidgets(context), [
      createDashboardTable("owner_ai_usage", "AI Usage by Task", ["Task ID", "Events", "Tokens", "Cost", "Provider", "Model", "Tracked", "Workstream"], aiUsageRows(context), "No AI usage data yet."),
      createDashboardTable("owner_ai_cost", "AI Cost Control", ["Budget/Preflight ID", "Task", "Estimated Cost", "Approval Required", "Status"], aiCostRows(context), "No cost preflights yet.")
    ]),
    docs_reports: createDashboardSection("docs_reports", "Docs / Reports", docsWidgets(context), [
      createDashboardTable("owner_reports", "Reports", ["Report", "Type", "Generated At", "Source of Truth", "Status"], reportsRows(context), "No report data yet.")
    ]),
    governance: createDashboardSection("governance", "Security / Migration / Governance", governanceWidgets(context), [
      createDashboardTable("owner_governance", "Governance Blockers", ["Area", "Status", "Count", "Next Action"], governanceRows(context), "No governance blockers found.")
      ,
      createDashboardTable("owner_security_gate_details", "Security Gate Details", ["Scope", "Status", "Plugin", "Installed", "Enabled", "Available", "Active", "Blocked", "Warnings", "Required", "Strict", "Policy Source", "Target", "Next Action"], securityGateDetailRows(buildSecurityGateDashboardState(context, { track: "owner", scope: "workspace" })), "No security gate data yet.")
    ])
  };

  return finalizeDashboardState({
    report_type: "kvdf_owner_dashboard_state",
    dashboard_type: "owner",
    track: "framework_owner",
    title: "KVDF Owner Dashboard",
    subtitle: "Owner Track / KVDF Core",
    widgets: flattenDashboardWidgets(sections),
    tables: flattenDashboardTables(sections),
    sections,
    blocked_cross_track_data: ["viber_app_workspace_data"],
    source_control: context.sourceControl,
    planner: context.plannerState,
    readiness: readiness.summary,
    gate_matrix: readiness.gate_matrix,
    blockers: readiness.blockers,
    publish_readiness: readiness.publish_readiness,
    execution_feedback: readiness.execution_feedback,
    stage_timeline: readiness.stage_timeline,
    security_status: readiness.security_status,
    ai_learning_status: readiness.ai_learning_status,
    task_tracker: context.task_tracker_state,
    next_action: context.plannerState.next_action || "Run kvdf planner propose",
    current_plan_id: currentPlan ? currentPlan.plan_id || null : null,
    current_plan_status: context.plannerState.current_plan_status || "empty",
    current_evolution: currentEvolution ? currentEvolution.change_id || currentEvolution.title || null : null,
    generated_at: new Date().toISOString()
  });
}

function buildUiUxIntelligenceDashboardSummary({ idea = "", app = "", track = "vibe", stack = "" } = {}) {
  const pluginStatus = getPluginRuntimeStatus(UI_UX_INTELLIGENCE_PLUGIN_ID);
  if (!pluginStatus || !pluginStatus.available) {
    return {
      status: "unavailable",
      plugin_id: UI_UX_INTELLIGENCE_PLUGIN_ID,
      standalone: true,
      external_github_dependency: false,
      available: false,
      docs_ready: false,
      recommendation_available: false,
      checklist_status: "unavailable",
      recommendation_summary: {},
      target_docs: [],
      next_action: "Run kvdf plugins install ui_ux_intelligence if UI/UX intelligence is needed."
    };
  }
  try {
    const runtime = require(path.join(repoRoot(), "plugins", UI_UX_INTELLIGENCE_PLUGIN_ID, "runtime"));
    const input = String(idea || app || "Viber UI/UX planning").trim();
    const recommendation = runtime.recommendUiUx(input, { track, app, stack });
    const checklist = runtime.generateChecklist(input, { track, app, recommendation });
    const docs = runtime.generateDocsSections(input, { track, app, stack, recommendation });
    const checklistSummary = runtime.summarizeChecklist(checklist);
    return {
      status: "available",
      plugin_id: UI_UX_INTELLIGENCE_PLUGIN_ID,
      standalone: true,
      external_github_dependency: false,
      available: true,
      recommendation_available: true,
      docs_ready: Array.isArray(docs.target_docs) && docs.target_docs.length > 0,
      checklist_status: checklistSummary.blockers > 0 ? "warning" : (checklistSummary.warnings > 0 ? "warning" : "pass"),
      recommendation_summary: {
        detected_product_type: recommendation.detected_product_type,
        recommended_style: recommendation.recommended_style,
        recommended_palette: recommendation.recommended_palette,
        recommended_typography: recommendation.recommended_typography,
        recommended_layout_patterns: Array.isArray(recommendation.recommended_layout_patterns) ? [...recommendation.recommended_layout_patterns] : [],
        standalone: true,
        external_github_dependency: false
      },
      target_docs: Array.isArray(docs.target_docs) ? [...docs.target_docs] : [...UI_UX_INTELLIGENCE_TARGET_DOCS],
      next_action: docs.next_action || "Use kvdf ui-ux-intelligence docs --idea \"...\" --track vibe --app <slug> --json."
    };
  } catch (error) {
    return {
      status: "warning",
      plugin_id: UI_UX_INTELLIGENCE_PLUGIN_ID,
      standalone: true,
      external_github_dependency: false,
      available: true,
      docs_ready: false,
      recommendation_available: false,
      checklist_status: "warning",
      recommendation_summary: {},
      target_docs: [],
      warnings: [error.message],
      next_action: "Fix the plugin runtime, then re-run the dashboard state."
    };
  }
}

function buildViberDashboardState(context = {}, deps = {}) {
  const currentEvolution = context.evolutionBoard.current_evolution || context.evolutionSummary.latest_change || null;
  const currentPlan = context.plannerPlan || null;
  const currentApp = context.apps.find((app) => resolveWorkspaceTrack(app.workspace_kind || app.track || app.audience || "") === "vibe_app_developer") || context.apps[0] || {};
  const readiness = buildDashboardReadinessState(context, "viber");
  const uiUxIntelligence = buildUiUxIntelligenceDashboardSummary({
    idea: context.plannerState.current_plan && context.plannerState.current_plan.goal ? context.plannerState.current_plan.goal : (currentPlan && currentPlan.goal ? currentPlan.goal : ""),
    app: currentApp.name || currentApp.username || "",
    track: "vibe",
    stack: String(context.plannerState.current_plan && context.plannerState.current_plan.stack || "").trim()
  });
  const commandCenterWidgets = [
    dashboardWidget("viber_current_track", "Current Track", "status", "vibe_app_developer", "ok", "vibe_app_developer", "derived", "Stay on app/product delivery work."),
    dashboardWidget("viber_current_workspace", "Current App / Workspace", "status", currentApp.name || currentApp.username || context.project.name || "none", currentApp.username || currentApp.name ? "ok" : "empty", "vibe_app_developer", "derived", currentApp.username ? "Review app workspace state." : "Create or link an app workspace."),
    dashboardWidget("viber_current_request", "Current Idea / Request", "status", context.plannerState.current_plan && context.plannerState.current_plan.goal ? context.plannerState.current_plan.goal : "none", context.plannerState.current_plan ? "ok" : "empty", "vibe_app_developer", "derived", context.plannerState.next_action || "Run planner propose."),
    dashboardWidget("viber_current_plan", "Current Planner Plan", "status", currentPlan ? currentPlan.title || currentPlan.goal || currentPlan.plan_id : "none", currentPlan ? "ok" : "empty", "vibe_app_developer", "derived", currentPlan ? "Review the approved plan." : "Approve the app plan."),
    dashboardWidget("viber_next_evolution", "Next App Evolution", "status", context.plannerState.next_evolution && context.plannerState.next_evolution.title ? context.plannerState.next_evolution.title : "none", context.plannerState.next_evolution && context.plannerState.next_evolution.title ? "ok" : "empty", "vibe_app_developer", "derived", context.plannerState.next_action || "Run planner propose."),
    dashboardWidget("viber_next_task_punch", "Next Task Punch", "action", nextTaskPunchLabel(context), "ok", "vibe_app_developer", "derived", nextTaskPunchAction(context)),
    dashboardWidget("viber_handoff", "Local-first Handoff Status", "status", context.sourceControl.mode || "local_first", "ok", "vibe_app_developer", "derived", "Keep app delivery local-first unless a remote is explicitly enabled."),
    dashboardWidget("viber_blockers", "Active Blockers", "metric", viberActiveBlockerCount(context), viberActiveBlockerCount(context) > 0 ? "warning" : "ok", "vibe_app_developer", "derived", "Resolve app blockers before releasing."),
    dashboardWidget("viber_questionnaire_gaps", "Questionnaire Gaps", "metric", viberQuestionnaireGapCount(context), viberQuestionnaireGapCount(context) > 0 ? "warning" : "ok", "vibe_app_developer", "derived", "Close intake gaps before design."),
    dashboardWidget("viber_pipeline_gaps", "Pipeline Gaps", "metric", viberPipelineGapCount(context), viberPipelineGapCount(context) > 0 ? "warning" : "ok", "vibe_app_developer", "derived", "Keep the idea-to-evolution pipeline explicit.")
  ];

  const sections = {
    readiness: createDashboardSection("readiness", "Readiness Overview", buildDashboardReadinessWidgets(readiness, "viber"), [
      createDashboardTable("viber_readiness_gates", "Gate Matrix", ["Gate", "Status", "Blockers", "Warnings", "Next Action"], buildReadinessGateRows(readiness), "No readiness gates available."),
      createDashboardTable("viber_readiness_blockers", "Blockers", ["Severity", "Area", "Message", "Next Action"], buildReadinessBlockerRows(readiness), "No blockers available."),
      createDashboardTable("viber_publish_readiness", "Handoff / Publish Readiness", ["Status", "Score", "Label", "Auto Publish", "Rule", "Next Action"], buildReadinessPublishRows(readiness), "No publish readiness available."),
      createDashboardTable("viber_execution_feedback", "Execution Feedback", ["Status", "Executor", "Checks Run", "Changed Files", "Warnings", "Stop Condition", "Updated At"], buildReadinessExecutionFeedbackRows(readiness), "No execution feedback available."),
      createDashboardTable("viber_stage_timeline", "Stage Timeline", ["Stage", "Status", "Outputs", "Next Action"], buildReadinessStageRows(readiness), "No stage timeline available.")
    ]),
    command_center: createDashboardSection("command_center", "Command Center", commandCenterWidgets, [
      createDashboardTable("viber_command_center", "Viber Command Center", ["Metric", "Value", "Next Action"], [
        ["Current App / Workspace", currentApp.name || currentApp.username || "none", currentApp.username ? "Review app workspace state." : "Create or link an app workspace."],
        ["Current Idea / Request", context.plannerState.current_plan && context.plannerState.current_plan.goal ? context.plannerState.current_plan.goal : "none", context.plannerState.next_action || "Run planner propose."],
        ["Current Planner Plan", currentPlan ? currentPlan.plan_id || currentPlan.title || currentPlan.goal || "approved" : "none", currentPlan ? "Review the approved plan." : "Approve the app plan."],
        ["Next App Evolution", context.plannerState.next_evolution && context.plannerState.next_evolution.title ? context.plannerState.next_evolution.title : "none", context.plannerState.next_action || "Run planner propose."],
        ["Next Task Punch", nextTaskPunchLabel(context), nextTaskPunchAction(context)],
        ["Local-first Handoff", context.sourceControl.mode || "local_first", "Keep app delivery local-first unless a remote is explicitly enabled."],
        ["Active Blockers", String(viberActiveBlockerCount(context)), viberActiveBlockerCount(context) ? "Resolve blockers before releasing." : "Continue delivery."],
        ["Questionnaire Gaps", String(viberQuestionnaireGapCount(context)), viberQuestionnaireGapCount(context) ? "Close intake gaps before design." : "Intake is complete."],
        ["Pipeline Gaps", String(viberPipelineGapCount(context)), viberPipelineGapCount(context) ? "Keep the idea-to-evolution pipeline explicit." : "Pipeline is populated."]
      ], "No app command center data yet.")
    ]),
    idea_to_evolution_pipeline: createDashboardSection("idea_to_evolution_pipeline", "Idea-to-Evolution Pipeline", pipelineWidgets(context), [
      createDashboardTable("viber_pipeline", "Pipeline Stage Table", ["Stage", "Status", "Output", "Next Action", "Owner", "Runtime/Doc Path"], pipelineRows(context), "No pipeline stages yet.")
    ]),
    questionnaire: createDashboardSection("questionnaire", "Questionnaire / Intake", questionnaireWidgets(context), [
      createDashboardTable("viber_questionnaire", "Questions", ["Question ID", "Area", "Status", "Answered", "Required Action"], questionnaireRows(context), "No questionnaire data yet.")
    ]),
    product_app_design: createDashboardSection("product_app_design", "Product / App Design", productWidgets(context), [
      createDashboardTable("viber_modules", "Module Table", ["Module", "Purpose", "Workstream", "Status", "Related Tasks"], moduleRows(context), "No module data yet."),
      createDashboardTable("viber_journeys", "Journey Table", ["Journey", "Status", "Ready", "Related Features", "Related Tasks"], journeyRows(context), "No journey data yet.")
    ]),
    system_design: createDashboardSection("system_design", "System Design", systemWidgets(context), [
      createDashboardTable("viber_system_design", "System Design", ["Component", "Responsibility", "Dependencies", "Risks", "Status"], systemRows(context), "No system design data yet.")
    ]),
    database_design: createDashboardSection("database_design", "Database Design", databaseWidgets(context), [
      createDashboardTable("viber_database", "Entity Table", ["Entity", "Fields/Notes", "Relationships", "Migration", "Status"], databaseRows(context), "No database design data yet.")
    ]),
    ui_ux_design: createDashboardSection("ui_ux_design", "UI/UX Design", uiUxWidgets(context), [
      createDashboardTable("viber_uiux", "Screen/Page Table", ["Screen", "Purpose", "Components", "Status", "Related Tasks"], uiUxRows(context), "No UI/UX design data yet.")
    ]),
    version_plan: createDashboardSection("version_plan", "Version Plan", versionWidgets(context), [
      createDashboardTable("viber_version", "Version Table", ["Version", "Goal", "Included Evolutions", "Excluded Scope", "Readiness Gate", "Source Control Mode"], versionRows(context), "No version plan yet.")
    ]),
    evolutions: createDashboardSection("evolutions", "Evolutions", evolutionWidgets(context, "viber"), [
      createDashboardTable("viber_evolutions", "Evolution Table", ["Evolution ID", "Title", "Version", "Status", "Tasks", "Next Action", "Stop Condition"], evolutionRows(context, "viber"), "No app evolutions yet.")
    ]),
    task_punches: createDashboardSection("task_punches", "Task Punch / Execution", taskPunchWidgets(context), [
      createDashboardTable("viber_task_punch", "Task Punch Table", ["Task ID", "Title", "Status", "Evolution", "Allowed Files", "Forbidden Files", "Acceptance", "Validation", "Stop Condition"], taskPunchRows(context, true), "No task punches yet.")
    ]),
    source_control_handoff: createDashboardSection("source_control_handoff", "Source Control / Handoff", sourceControlWidgets(context, "viber"), [
      createDashboardTable("viber_source_control", "Source Control Table", ["Provider", "Remote", "Mode", "Branching", "PR", "Current Branch", "Notes"], [
        sourceControlRow(context, "viber")
      ], "No source control data yet."),
      createDashboardTable("viber_handoff", "Handoff Table", ["Handoff ID", "Status", "Evidence", "Next Action"], handoffRows(context), "No handoff package yet.")
    ]),
    ai_cost_control: createDashboardSection("ai_cost_control", "AI Cost Control", aiCostWidgets(context, "viber"), [
      createDashboardTable("viber_ai_usage", "AI Usage Table", ["Task", "Evolution", "Events", "Tokens", "Cost", "Provider", "Model", "Tracked"], aiUsageRows(context, "viber"), "No AI usage data yet.")
    ]),
    app_plugins: createDashboardSection("app_plugins", "App Plugins / Integrations", appPluginWidgets(context), [
      createDashboardTable("viber_plugins", "App Plugin Table", ["Plugin", "Enabled", "Purpose", "Runtime Entrypoint", "Status", "Gaps"], appPluginRows(context), "No app plugin data yet.")
    ]),
    validation_readiness: createDashboardSection("validation_readiness", "Validation / Readiness", validationWidgets(context), [
      createDashboardTable("viber_validation", "Validation Table", ["Check", "Status", "Evidence", "Next Action"], validationRows(context), "No validation data yet.")
      ,
      createDashboardTable("viber_app_security_details", "App Security Details", ["Scope", "Status", "Plugin", "Installed", "Enabled", "Available", "Active", "Blocked", "Warnings", "Required", "Strict", "Policy Source", "Target", "Next Action"], securityGateDetailRows(buildSecurityGateDashboardState(context, { track: "vibe", scope: "handoff" })), "No app security data yet.")
    ])
  };

  return finalizeDashboardState({
    report_type: "kvdf_viber_dashboard_state",
    dashboard_type: "viber",
    track: "vibe_app_developer",
    title: "KVDF Viber Dashboard",
    subtitle: "Viber/App Track",
    widgets: flattenDashboardWidgets(sections),
    tables: flattenDashboardTables(sections),
    sections,
    blocked_cross_track_data: ["kvdf_core_owner_data"],
    source_control: context.sourceControl,
    planner: context.plannerState,
    readiness: readiness.summary,
    gate_matrix: readiness.gate_matrix,
    blockers: readiness.blockers,
    publish_readiness: readiness.publish_readiness,
    execution_feedback: readiness.execution_feedback,
    stage_timeline: readiness.stage_timeline,
    security_status: readiness.security_status,
    ai_learning_status: readiness.ai_learning_status,
    task_tracker: context.task_tracker_state,
    next_action: context.plannerState.next_action || "Run kvdf planner propose",
    current_plan_id: currentPlan ? currentPlan.plan_id || null : null,
    current_plan_status: context.plannerState.current_plan_status || "empty",
    current_evolution: currentEvolution ? currentEvolution.change_id || currentEvolution.title || null : null,
    ui_ux_intelligence: uiUxIntelligence,
    generated_at: new Date().toISOString()
  });
}

function buildDashboardStateForCurrentTrack(options = {}, deps = {}) {
  return collectDashboardStateForCurrentTrack(options, deps);
}

function buildDashboardStateForScope(scope, options = {}, deps = {}) {
  const normalized = normalizeDashboardScope(scope);
  return normalized === "viber" ? buildViberDashboardState(buildDashboardTrackContext({ ...options, scope: "viber" }, deps), deps) : buildOwnerDashboardState(buildDashboardTrackContext({ ...options, scope: "owner" }, deps), deps);
}

function normalizeDashboardScope(value = "") {
  const normalized = String(value || "").trim().toLowerCase().replace(/[_\s]+/g, "-");
  if (["viber", "vibe", "app", "app-developer", "vibe-app-developer", "current-viber"].includes(normalized)) return "viber";
  if (["owner", "framework", "framework-owner", "framework-owner-track", "current-owner"].includes(normalized)) return "owner";
  if (normalized === "current") return "current";
  return normalized;
}

function dashboardWidget(id, title, type, value, status, track, source, nextAction) {
  return {
    id,
    title,
    type,
    value,
    status: status || "unknown",
    track: track || "plugin",
    source: source || "derived",
    next_action: nextAction || ""
  };
}

function createDashboardTable(id, title, columns, rows, emptyState) {
  return {
    id,
    title,
    columns,
    rows,
    empty_state: emptyState
  };
}

function createDashboardSection(id, title, widgets = [], tables = []) {
  return {
    id,
    title,
    widgets,
    tables
  };
}

function flattenDashboardWidgets(sections) {
  return Object.values(sections).flatMap((section) => section.widgets || []);
}

function flattenDashboardTables(sections) {
  return Object.values(sections).reduce((tables, section) => {
    for (const table of section.tables || []) tables[table.id] = table;
    return tables;
  }, {});
}

function finalizeDashboardState(state) {
  return {
    ...state,
    widgets: Array.isArray(state.widgets) ? state.widgets : [],
    tables: state.tables || {},
    sections: state.sections || {},
    blocked_cross_track_data: Array.isArray(state.blocked_cross_track_data) ? state.blocked_cross_track_data : [],
    source_control: state.source_control || {},
    planner: state.planner || null,
    next_action: state.next_action || "",
    current_plan_id: state.current_plan_id || null,
    current_plan_status: state.current_plan_status || "empty",
    current_evolution: state.current_evolution || null
  };
}

function ownerBlockerCount(context) {
  return ownerActiveBlockerCount(context);
}

function viberBlockerCount(context) {
  return viberActiveBlockerCount(context) + viberQuestionnaireGapCount(context) + viberPipelineGapCount(context);
}

function ownerActiveBlockerCount(context) {
  return (
    countBlocked(context.plannerState) +
    countBlockedEntries(context.gitStatus) +
    countRecords((context.evolutionSummary.open_follow_up_tasks || 0) ? [{ id: "open_follow_up_tasks" }] : []) +
    countRecords(context.structuredState.gates ? context.structuredState.gates.filter((item) => item.status === "blocked") : []) +
    countRecords(context.structuredState.risks ? context.structuredState.risks.filter((item) => item.status === "open" && ["high", "critical"].includes(item.severity)) : [])
  );
}

function ownerArchiveCount(context) {
  return countRecords(context.taskTrashState.trash);
}

function viberActiveBlockerCount(context) {
  return (
    countBlocked(context.plannerState) +
    countRecords(context.structuredState.gates ? context.structuredState.gates.filter((item) => item.status === "blocked") : []) +
    countRecords(context.structuredState.risks ? context.structuredState.risks.filter((item) => item.status === "open" && ["high", "critical"].includes(item.severity)) : [])
  );
}

function viberQuestionnaireGapCount(context) {
  return (
    countRecords(context.questionnaireMissing) +
    countRecords(context.questionnaireCoverage.filter((item) => item.status === "missing" || item.status === "blocked"))
  );
}

function viberPipelineGapCount(context) {
  return countBlocked(context.plannerState);
}

function countBlocked(plannerState) {
  if (!plannerState || !plannerState.current_plan) return 0;
  return plannerState.materialization && plannerState.materialization.status === "materialized" ? 0 : 1;
}

function countBlockedEntries(value) {
  if (!value) return 0;
  if (Array.isArray(value.entries)) return value.entries.length;
  if (typeof value.changed_files === "number") return value.changed_files > 0 ? 1 : 0;
  return 0;
}

function countRecords(items) {
  return Array.isArray(items) ? items.length : Number(items || 0);
}

function coreHealthWidgets(context) {
  const dirtyCount = Number(context.gitStatus && context.gitStatus.changed_files ? context.gitStatus.changed_files : 0);
  return [
    dashboardWidget("owner_validation", "Validation Status", "status", "ready", "ok", "framework_owner", "derived", "Run validate before touching core state."),
    dashboardWidget("owner_npm_test", "npm test Status", "status", "ready", "ok", "framework_owner", "derived", "Keep the suite green before merge."),
    dashboardWidget("owner_npm_check", "npm run check Status", "status", "ready", "ok", "framework_owner", "derived", "Refresh generated reports when needed."),
    dashboardWidget("owner_runtime_schema", "Runtime Schema Validation", "status", "ready", "ok", "framework_owner", "derived", "Keep runtime schemas in sync."),
    dashboardWidget("owner_package_check", "Package / Check Status", "status", "ready", "ok", "framework_owner", "derived", "Use package checks to guard release prep."),
    dashboardWidget("owner_dirty_reports", "Generated Report Dirty-State Warning", "warning", dirtyCount > 0 ? `${dirtyCount} changed file(s)` : "clean", dirtyCount > 0 ? "warning" : "ok", "framework_owner", "generated", dirtyCount > 0 ? "Inspect generated report churn." : "No generated report drift detected.")
  ];
}

function coreHealthRows(context) {
  return [
    ["Validation", "ready", "schema registry and CLI validation are available", "Run validate before touching core state."],
    ["npm test", "ready", "test suite is present", "Keep the suite green before merge."],
    ["npm run check", "ready", "generated docs/reports can refresh", "Refresh generated reports when needed."],
    ["Runtime schema validation", "ready", fileExists("schemas/runtime/schema_registry.json") ? "schema registry exists" : "schema registry missing", "Keep runtime schemas in sync."],
    ["Package / check", "ready", "package scripts are wired", "Use package checks to guard release prep."],
    ["Generated report drift", context.gitStatus && context.gitStatus.changed_files ? "warning" : "clean", context.gitStatus && context.gitStatus.entries ? context.gitStatus.entries.join("; ") : "clean working tree", context.gitStatus && context.gitStatus.changed_files ? "Inspect generated report churn." : "No generated report drift detected."]
  ];
}

function plannerWidgets(context) {
  const currentPlan = context.plannerPlan || null;
  return [
    dashboardWidget("owner_planner_mode", "Planner Mode", "status", context.plannerState.current_planner_mode || "none", currentPlan ? "ok" : "empty", "framework_owner", "derived", "Keep the planner track-aware."),
    dashboardWidget("owner_planner_materialization", "Materialization Status", "status", context.plannerState.materialization ? context.plannerState.materialization.status || "unknown" : "unknown", context.plannerState.materialization && context.plannerState.materialization.status === "materialized" ? "ok" : "warning", "framework_owner", "derived", context.plannerState.next_action || "Materialize the plan."),
    dashboardWidget("owner_planner_security_gate", "Planner Security Gate", "status", context.plannerState.security_gate ? context.plannerState.security_gate.status : "not_recorded", context.plannerState.security_gate && context.plannerState.security_gate.status === "blocked" ? "warning" : context.plannerState.security_gate && context.plannerState.security_gate.status === "warning" ? "warning" : "ok", "framework_owner", "derived", context.plannerState.security_gate ? context.plannerState.security_gate.next_action : "Security gate is optional for planner summaries."),
    dashboardWidget("owner_pipeline_status", "Idea-to-Evolution Pipeline Status", "status", context.plannerState.pipeline && context.plannerState.pipeline.available ? "available" : "missing", context.plannerState.pipeline && context.plannerState.pipeline.available ? "ok" : "empty", "framework_owner", "derived", "Use the pipeline as the governed path to evolution."),
    dashboardWidget("owner_visual_status", "Visual Planner Availability", "status", context.plannerState.visual && context.plannerState.visual.available ? "available" : "missing", context.plannerState.visual && context.plannerState.visual.available ? "ok" : "empty", "framework_owner", "derived", "Keep the visual planner and scope map available."),
    dashboardWidget("owner_next_action_planner", "Planner Next Action", "action", context.plannerState.next_action || "Run kvdf planner propose", "ok", "framework_owner", "derived", context.plannerState.next_action || "Run kvdf planner propose.")
  ];
}

function plannerRows(context) {
  const currentPlan = context.plannerPlan || {};
  return [[
    currentPlan.plan_id || "none",
    context.plannerState.current_plan_status || "empty",
    context.plannerState.current_planner_mode || "",
    context.plannerState.track || "",
    context.plannerState.delivery_mode || "",
    context.plannerState.source_control && context.plannerState.source_control.mode ? context.plannerState.source_control.mode : "",
    currentPlan.approved_by || currentPlan.owner || "",
    context.plannerState.materialization ? context.plannerState.materialization.status || "unknown" : "unknown",
    context.plannerState.security_gate ? context.plannerState.security_gate.status : "not_recorded",
    context.plannerState.next_action || ""
  ]];
}

function evolutionWidgets(context, dashboardType = "owner") {
  return [
    dashboardWidget(`${dashboardType}_open_evolutions`, "Open Evolutions", "metric", countRecords(context.evolutionBoard.open_evolutions || []), "ok", context.workspace_track, "derived", "Keep evolutions track-aligned."),
    dashboardWidget(`${dashboardType}_current_evolution`, "Current Evolution", "status", context.evolutionBoard.current_evolution ? context.evolutionBoard.current_evolution.title || context.evolutionBoard.current_evolution.change_id : "none", context.evolutionBoard.current_evolution ? "ok" : "empty", context.workspace_track, "derived", context.plannerState.next_action || "Select the next evolution."),
    dashboardWidget(`${dashboardType}_archived_evolutions`, "Completed / Archived Evolutions", "metric", countRecords(context.evolutionBoard.archived_evolutions || []), "ok", context.workspace_track, "derived", "Preserve archive history."),
    dashboardWidget(`${dashboardType}_closeout`, "Auto-closeout Status", "status", context.evolutionBoard.auto_closeout_status || "unknown", "ok", context.workspace_track, "derived", "Use the closeout policy consistently."),
    dashboardWidget(`${dashboardType}_future_blocked`, "Future-only Blocked Items", "warning", countRecords(context.evolutionBoard.future_blocked_items || []), context.evolutionBoard.future_blocked_items && context.evolutionBoard.future_blocked_items.length ? "warning" : "ok", context.workspace_track, "derived", "Keep future-only items out of the current plan.")
  ];
}

function evolutionRows(context) {
  const changes = Array.isArray(context.evolutionBoard.changes) ? context.evolutionBoard.changes : [];
  return (changes.length ? changes : [context.evolutionBoard.current_evolution || {}]).map((item) => [
    item.change_id || item.id || "none",
    item.title || item.goal || "",
    item.status || "",
    item.version || item.release || "",
    item.track || context.workspace_track,
    item.source_control_mode || (context.sourceControl && context.sourceControl.mode) || "",
    String((item.task_ids || []).length || item.tasks_total || 0),
    String((item.open_tasks || []).length || item.open_tasks_total || 0),
    item.materialization_status || item.materialized ? "yes" : "no",
    item.stop_condition || item.task_trash_policy || ""
  ]);
}

function taskPunchRows(context, viber = false) {
  const source = context.plannerState.task_punch || {};
  const tasks = Array.isArray(source.tasks) ? source.tasks : [];
  if (!tasks.length) {
    const trackerRows = context.task_tracker_state && Array.isArray(context.task_tracker_state.tasks) ? context.task_tracker_state.tasks : [];
    return trackerRows.slice(0, 10).map((task) => [
      task.id || "",
      task.title || "",
      task.status || "",
      task.evolution_id || task.evolution || "",
      (task.allowed_files || []).join(", "),
      (task.forbidden_files || []).join(", "),
      (task.acceptance_criteria || []).join(", "),
      (task.validation_commands || []).join(", "),
      task.stop_condition || ""
    ]);
  }
  return tasks.map((task) => [
    task.id || task.task_id || "",
    task.title || "",
    task.status || "",
    task.evolution_id || task.evolution || "",
    (task.allowed_files || []).join(", "),
    (task.forbidden_files || []).join(", "),
    (task.acceptance_criteria || []).join(", "),
    (task.validation_commands || []).join(", "),
    task.stop_condition || ""
  ]);
}

function sourceControlWidgets(context, dashboardType = "owner") {
  const source = context.sourceControl || {};
  return [
    dashboardWidget(`${dashboardType}_sc_provider`, "Provider", "status", source.provider || "none", source.provider === "none" ? "warning" : "ok", context.workspace_track, "derived", "Show the correct provider mode."),
    dashboardWidget(`${dashboardType}_sc_remote`, "Remote Provider", "status", source.remote_provider || "none", "ok", context.workspace_track, "derived", "Optional remote is fine for this track."),
    dashboardWidget(`${dashboardType}_sc_mode`, "Mode", "status", source.mode || (dashboardType === "viber" ? "local_first" : "direct_main"), "ok", context.workspace_track, "derived", "Keep the track's preferred mode visible."),
    dashboardWidget(`${dashboardType}_sc_branching`, "Branching Enabled", "status", source.branching_enabled ? "yes" : "no", source.branching_enabled ? "ok" : "warning", context.workspace_track, "derived", "Branching is optional and should be explicit."),
    dashboardWidget(`${dashboardType}_sc_pr`, "PR Enabled", "status", source.pr_enabled ? "yes" : "no", source.pr_enabled ? "ok" : "warning", context.workspace_track, "derived", "PRs stay optional unless explicitly enabled."),
    dashboardWidget(`${dashboardType}_sc_branch`, "Current Branch", "status", source.current_branch || "none", "ok", context.workspace_track, "derived", "Show the live branch when Git exists.")
  ];
}

function sourceControlRow(context) {
  const source = context.sourceControl || {};
  return [[
    source.provider || "none",
    source.remote_provider || "none",
    source.mode || (context.dashboard_type === "viber" ? "local_first" : "direct_main"),
    source.branching_enabled ? "enabled" : "disabled",
    source.pr_enabled ? "enabled" : "disabled",
    source.current_branch || context.git.current_branch || "none",
    source.default_branch || "main",
    (source.notes || []).join(" ")
  ]];
}

function workflowWidgets(context) {
  return [
    dashboardWidget("owner_pipeline_dev", "KVDF Development Pipeline", "status", context.plannerState.pipeline && context.plannerState.pipeline.available ? "available" : "missing", "ok", "framework_owner", "derived", "Keep the core development pipeline track-aware."),
    dashboardWidget("owner_pipeline_planner", "Planner Pipeline", "status", context.plannerState.pipeline && context.plannerState.pipeline.available ? "available" : "missing", "ok", "framework_owner", "derived", "Use planner output as the pipeline source."),
    dashboardWidget("owner_pipeline_validation", "Validation Pipeline", "status", "ready", "ok", "framework_owner", "derived", "Keep validation part of the dashboard flow."),
    dashboardWidget("owner_pipeline_docs", "Docs Pipeline", "status", "ready", "ok", "framework_owner", "derived", "Refresh docs alongside dashboard changes."),
    dashboardWidget("owner_pipeline_release", "Release / Package Pipeline", "status", "ready", "ok", "framework_owner", "derived", "Release checks stay explicit.")
  ];
}

function workflowRows(context) {
  return [
    ["KVDF Development Pipeline", "dashboard", context.plannerState.pipeline && context.plannerState.pipeline.available ? "available" : "missing", context.plannerState.next_action || "", ".kabeeri/planner.json", "Owner"],
    ["Planner Pipeline", "planner", context.plannerState.pipeline && context.plannerState.pipeline.available ? "available" : "missing", context.plannerState.next_action || "", ".kabeeri/planner.json", "Owner"],
    ["Validation Pipeline", "validation", "ready", "Run validate before export.", "schemas/runtime/schema_registry.json", "Owner"],
    ["Docs Pipeline", "docs", "ready", "Refresh generated docs/reports when needed.", "docs/cli/CLI_COMMAND_REFERENCE.md", "Owner"],
    ["Release / Package Pipeline", "release", "ready", "Keep package and release checks green.", "package.json", "Owner"]
  ];
}

function capabilityWidgets(context) {
  const total = 0;
  return [
    dashboardWidget("owner_cap_total", "Total Native Capabilities", "metric", total, "unknown", "framework_owner", "derived", "Capability registry coverage can be expanded later."),
    dashboardWidget("owner_cap_mature", "Mature / Working", "metric", 0, "unknown", "framework_owner", "derived", "Count working capabilities when the registry is available."),
    dashboardWidget("owner_cap_partial", "Partial", "metric", 0, "unknown", "framework_owner", "derived", "Count partial capabilities when the registry is available."),
    dashboardWidget("owner_cap_registry", "Capability Registry Status", "status", fileExists("docs/SYSTEM_CAPABILITIES_REFERENCE.md") ? "present" : "missing", fileExists("docs/SYSTEM_CAPABILITIES_REFERENCE.md") ? "ok" : "warning", "framework_owner", "docs", "Keep capability docs in sync.")
  ];
}

function capabilityRows(context) {
  return [
    ["KVDF Core", "dashboard, planner, validate", "core", "working", "docs/SYSTEM_CAPABILITIES_REFERENCE.md", "npm test", "Owner track capability surface."],
    ["Planner / Pipeline", "planner, planner-visual", "planner", "working", ".kabeeri/planner.json", "npm test", "Shared planner cycle feeds both dashboards."],
    ["Dashboard", "dashboard state, dashboard export", "reports", "working", ".kabeeri/dashboard/owner_dashboard_state.json", "npm run check", "Separate owner and viber dashboards."],
    ["Reports", "reports live, dashboard ux", "reports", "working", ".kabeeri/reports/live_reports_state.json", "npm run check", "Generated reports stay derived."]
  ];
}

function pluginWidgets(context) {
  return [
    dashboardWidget("owner_plugins_active", "Active Plugins", "metric", countRecords((context.pluginState.plugins || []).filter((item) => item.enabled !== false)), "ok", "framework_owner", "derived", "Show only relevant KVDF development plugins."),
    dashboardWidget("owner_plugins_disabled", "Disabled Plugins", "metric", countRecords((context.pluginState.plugins || []).filter((item) => item.enabled === false)), "ok", "framework_owner", "derived", "Disabled plugins remain visible."),
    dashboardWidget("owner_plugins_kvdf_dev", "kvdf-dev Status", "status", "available", "ok", "framework_owner", "plugin", "Core development plugins stay visible."),
    dashboardWidget("owner_plugins_planner_visual", "planner-visual Status", "status", plannerVisualStatus(context), "ok", "framework_owner", "plugin", "Planner visual support stays visible when installed."),
    dashboardWidget("owner_plugins_github", "GitHub Provider Plugin", "status", githubProviderStatus(context), "ok", "framework_owner", "plugin", "GitHub provider remains optional.")
  ];
}

function pluginRows(context) {
  const plugins = Array.isArray(context.pluginState.plugins) ? context.pluginState.plugins : [];
  if (!plugins.length) return [["kvdf-dev", "framework_owner", "unknown", "yes", "core", "plugin", "src/cli", "missing", "No plugin registry state yet."]];
  return plugins.map((plugin) => [
    plugin.id || plugin.name || "",
    plugin.track || "framework_owner",
    plugin.enabled === false ? "no" : "yes",
    plugin.removable === false ? "no" : "yes",
    plugin.family || plugin.scope || "",
    plugin.type || "",
    plugin.runtime_entrypoint || plugin.entrypoint || "",
    plugin.status || (plugin.enabled === false ? "disabled" : "active"),
    Array.isArray(plugin.gaps) ? plugin.gaps.join(", ") : plugin.gaps || ""
  ]);
}

function aiCostWidgets(context, dashboardType = "owner") {
  const summary = context.usageSummary || {};
  return [
    dashboardWidget(`${dashboardType}_ai_cost`, "Total AI Usage Cost", "metric", summary.total_cost || 0, "ok", context.workspace_track, "derived", "Keep the cost visible."),
    dashboardWidget(`${dashboardType}_ai_tokens`, "Total Tokens", "metric", summary.total_tokens || 0, "ok", context.workspace_track, "derived", "Track tokens against tasks."),
    dashboardWidget(`${dashboardType}_ai_tracked`, "Tracked AI", "metric", summary.tracked_vs_untracked && summary.tracked_vs_untracked.tracked ? summary.tracked_vs_untracked.tracked.cost || 0 : 0, "ok", context.workspace_track, "derived", "Task-linked cost stays visible."),
    dashboardWidget(`${dashboardType}_ai_untracked`, "Untracked AI", "metric", summary.tracked_vs_untracked && summary.tracked_vs_untracked.untracked ? summary.tracked_vs_untracked.untracked.cost || 0 : 0, "warning", context.workspace_track, "derived", "Untracked work needs review.")
  ];
}

function aiUsageRows(context, dashboardType = "owner") {
  const byTask = (context.usageSummary && context.usageSummary.by_task) || {};
  const entries = Object.entries(byTask);
  if (!entries.length) return [["untracked", 0, 0, 0, "", "", "", ""]];
  return entries.map(([taskId, usage]) => [
    taskId,
    usage.events || 0,
    usage.tokens || 0,
    usage.cost || 0,
    (usage.provider || usage.by_provider || usage.last_provider || "unknown"),
    usage.model || "unknown",
    usage.tracked === false ? "no" : "yes",
    usage.workstream || ""
  ]);
}

function aiCostRows(context) {
  return [
    ["budget:default", "all tasks", context.usageSummary.total_cost || 0, "no", context.usageSummary.budget_pressure ? context.usageSummary.budget_pressure.level || "unknown" : "unknown"]
  ];
}

function docsWidgets(context) {
  return [
    dashboardWidget("owner_docs_sync", "Docs Sync Status", "status", fileExists("docs/cli/CLI_COMMAND_REFERENCE.md") ? "present" : "missing", fileExists("docs/cli/CLI_COMMAND_REFERENCE.md") ? "ok" : "warning", "framework_owner", "docs", "Keep command docs synchronized."),
    dashboardWidget("owner_cli_reference", "CLI Reference Status", "status", fileExists("docs/cli/CLI_COMMAND_REFERENCE.md") ? "present" : "missing", fileExists("docs/cli/CLI_COMMAND_REFERENCE.md") ? "ok" : "warning", "framework_owner", "docs", "Document owner and viber commands separately."),
    dashboardWidget("owner_system_capabilities", "System Capabilities Status", "status", fileExists("docs/SYSTEM_CAPABILITIES_REFERENCE.md") ? "present" : "missing", fileExists("docs/SYSTEM_CAPABILITIES_REFERENCE.md") ? "ok" : "warning", "framework_owner", "docs", "Keep capability docs explicit."),
    dashboardWidget("owner_reports_generated", "Generated Reports Status", "status", fileExists(".kabeeri/reports/live_reports_state.json") ? "present" : "missing", "ok", "framework_owner", "generated", "Generated reports stay derived.")
  ];
}

function reportsRows(context) {
  return [
    ["Live Reports", "live_reports_state", new Date().toISOString(), ".kabeeri/reports/live_reports_state.json", context.gitStatus.changed_files ? "dirty" : "clean"],
    ["CLI Command Reference", "documentation", new Date().toISOString(), "docs/cli/CLI_COMMAND_REFERENCE.md", fileExists("docs/cli/CLI_COMMAND_REFERENCE.md") ? "present" : "missing"],
    ["System Capabilities Reference", "documentation", new Date().toISOString(), "docs/SYSTEM_CAPABILITIES_REFERENCE.md", fileExists("docs/SYSTEM_CAPABILITIES_REFERENCE.md") ? "present" : "missing"]
  ];
}

function buildSecurityGateDashboardState(context = {}, options = {}) {
  const currentEvolution = context.evolutionBoard.current_evolution || context.evolutionSummary.latest_change || null;
  const required = Boolean(
    options.required ||
    (currentEvolution && (
      currentEvolution.security_gate_required ||
      (Array.isArray(currentEvolution.policy_gates) && currentEvolution.policy_gates.some((item) => String(item).toLowerCase() === "security"))
    ))
  );
  try {
    return buildSecurityGateState({
      track: options.track || context.workspace_track || "owner",
      scope: options.scope || "workspace",
      evolution: currentEvolution ? currentEvolution.change_id : null,
      required,
      persist: false
    });
  } catch (error) {
    if (!/evolution not found|current evolution not found|ambiguous current evolution/i.test(String(error && error.message ? error.message : error))) {
      throw error;
    }
    const target = currentEvolution ? {
      task_id: null,
      evolution_id: currentEvolution.change_id || currentEvolution.evolution_id || currentEvolution.id || null,
      handoff_id: null,
      evolution_status: currentEvolution.status || null
    } : { task_id: null, evolution_id: null, handoff_id: null };
    return {
      report_type: "security_gate_state",
      generated_at: new Date().toISOString(),
      track: options.track || context.workspace_track || "owner",
      scope: options.scope || "workspace",
      task_id: null,
      evolution_id: target.evolution_id,
      handoff_id: null,
      target,
      required,
      strict_blocking: false,
      status: required ? "warning" : "not_required",
      policy_source: "default",
      findings_summary: { blocked: 0, warnings: 0 },
      plugin: {
        plugin_id: "security-auditor",
        installed: false,
        enabled: false,
        available: false,
        active: false
      },
      next_action: "Create or materialize the current evolution before running the security gate."
    };
  }
}

function governanceWidgets(context) {
  const securityGate = buildSecurityGateDashboardState(context, { track: "owner", scope: "workspace" });
  return [
    dashboardWidget("owner_policy_blocks", "Policy Blockers", "warning", countRecords((context.plannerState && context.plannerState.current_plan && context.plannerState.current_plan.policy_blocks) || []), "ok", "framework_owner", "derived", "Resolve policy blockers before merge."),
    dashboardWidget("owner_security_gate", "Security Gate", "status", securityGate.status, securityGate.status === "blocked" ? "warning" : securityGate.status === "warning" ? "warning" : "ok", "framework_owner", "derived", securityGate.next_action),
    dashboardWidget("owner_migration_blocks", "Migration Blockers", "warning", countRecords(context.structuredState.risks ? context.structuredState.risks.filter((item) => item.status === "open") : []), "ok", "framework_owner", "derived", "Migration blockers stay visible."),
    dashboardWidget("owner_handoff", "Handoff Readiness", "status", context.plannerState.materialization && context.plannerState.materialization.status === "materialized" ? "ready" : "pending", context.plannerState.materialization && context.plannerState.materialization.status === "materialized" ? "ok" : "warning", "framework_owner", "derived", "Handoff is only ready after materialization.")
  ];
}

function governanceRows(context) {
  const securityGate = buildSecurityGateDashboardState(context, { track: "owner", scope: "workspace" });
  return [
    ["Policy", countRecords((context.plannerState && context.plannerState.current_plan && context.plannerState.current_plan.policy_blocks) || []), countRecords((context.plannerState && context.plannerState.current_plan && context.plannerState.current_plan.policy_blocks) || []), "Run the relevant policy command."],
    ["Security Gate", securityGate.status, securityGatePluginSummary(securityGate), securityGate.next_action],
    ["Migration", countRecords(context.structuredState.risks ? context.structuredState.risks.filter((item) => item.status === "open") : []), countRecords(context.structuredState.risks ? context.structuredState.risks.filter((item) => item.status === "open") : []), "Resolve migration blockers before deploy."],
    ["Handoff", context.plannerState.materialization && context.plannerState.materialization.status === "materialized" ? 0 : 1, context.plannerState.materialization && context.plannerState.materialization.status === "materialized" ? 0 : 1, context.plannerState.materialization && context.plannerState.materialization.status === "materialized" ? "Use the handoff package." : "Materialize the plan first."]
  ];
}

function securityGatePluginSummary(securityGate) {
  const plugin = securityGate.plugin || {};
  return [
    plugin.installed ? "installed" : "missing",
    plugin.enabled ? "enabled" : "disabled",
    plugin.available ? "available" : "unavailable",
    plugin.active ? "active" : "inactive"
  ].join(" / ");
}

function securityGateDetailRows(securityGate) {
  const plugin = securityGate.plugin || {};
  const target = securityGate.target || {};
  return [[
    securityGate.scope || "workspace",
    securityGate.status || "unknown",
    plugin.plugin_id || "security-auditor",
    plugin.installed ? "yes" : "no",
    plugin.enabled ? "yes" : "no",
    plugin.available ? "yes" : "no",
    plugin.active ? "yes" : "no",
    String((securityGate.findings_summary && securityGate.findings_summary.blocked) || 0),
    String((securityGate.findings_summary && securityGate.findings_summary.warnings) || 0),
    securityGate.required ? "yes" : "no",
    securityGate.strict_blocking ? "yes" : "no",
    securityGate.policy_source || "default",
    target.task_id || target.evolution_id || target.handoff_id || "workspace",
    securityGate.next_action || "n/a"
  ]];
}

function nextTaskPunchLabel(context) {
  const punch = context.plannerState.task_punch || {};
  if (Array.isArray(punch.tasks) && punch.tasks.length) return punch.tasks[0].title || punch.tasks[0].id || "task punch ready";
  return "No task punch yet";
}

function nextTaskPunchAction(context) {
  const punch = context.plannerState.task_punch || {};
  if (Array.isArray(punch.tasks) && punch.tasks.length) return "Execute the first approved task slice.";
  return "Run kvdf planner materialize --from-current --json.";
}

function pipelineWidgets(context) {
  const pipeline = context.plannerState.pipeline || {};
  return [
    dashboardWidget("viber_pipeline_readiness", "Pipeline Readiness", "status", pipeline.execution_allowed ? "ready" : (pipeline.blocked_total ? "blocked" : "warning"), pipeline.execution_allowed ? "ok" : pipeline.blocked_total ? "blocked" : "warning", "vibe_app_developer", "derived", pipeline.next_action || "Keep the Viber pipeline gated."),
    dashboardWidget("viber_next_stage", "Next Stage", "status", pipeline.next_stage || "unknown", pipeline.next_stage ? "ok" : "warning", "vibe_app_developer", "derived", "Advance the next blocked or planned stage."),
    dashboardWidget("viber_idea", "Idea Captured", "status", pipeline.idea || context.plannerState.current_plan && context.plannerState.current_plan.goal || "none", pipeline.available ? "ok" : "empty", "vibe_app_developer", "derived", "Keep the original idea visible."),
    dashboardWidget("viber_docs", "Documentation Files", "metric", pipeline.documentation_files_total || 0, pipeline.available ? "ok" : "empty", "vibe_app_developer", "derived", "Document the app before implementation."),
    dashboardWidget("viber_system_design", "System Design Status", "status", pipeline.design_artifacts && pipeline.design_artifacts.system_design ? "ready" : "missing", pipeline.design_artifacts && pipeline.design_artifacts.system_design ? "ok" : "warning", "vibe_app_developer", "derived", "System design stays app-focused."),
    dashboardWidget("viber_database_design", "Database Design Status", "status", pipeline.design_artifacts && pipeline.design_artifacts.database_design ? "ready" : "missing", pipeline.design_artifacts && pipeline.design_artifacts.database_design ? "ok" : "warning", "vibe_app_developer", "derived", "Database design stays app-focused."),
    dashboardWidget("viber_uiux_design", "UI/UX Design Status", "status", pipeline.design_artifacts && pipeline.design_artifacts.ui_ux_design ? "ready" : "missing", pipeline.design_artifacts && pipeline.design_artifacts.ui_ux_design ? "ok" : "warning", "vibe_app_developer", "derived", "UI/UX planning stays app-focused."),
    dashboardWidget("viber_visual_planning", "Visual Planning Status", "status", pipeline.visual && pipeline.visual.available ? "available" : "missing", pipeline.visual && pipeline.visual.available ? "ok" : "warning", "vibe_app_developer", "derived", "Keep the visual planner and board available."),
    dashboardWidget("viber_version_plan", "Version Plan Status", "status", context.versionPlanSummary.available ? "available" : "missing", context.versionPlanSummary.available ? "ok" : "warning", "vibe_app_developer", "derived", "Version plans stay app-focused."),
    dashboardWidget("viber_next_evolution", "Next Evolution Status", "status", context.plannerState.next_evolution && context.plannerState.next_evolution.title ? context.plannerState.next_evolution.title : "none", context.plannerState.next_evolution && context.plannerState.next_evolution.title ? "ok" : "empty", "vibe_app_developer", "derived", context.plannerState.next_action || "Run planner propose.")
  ];
}

function pipelineRows(context) {
  const pipeline = context.plannerState.pipeline || {};
  const visual = context.plannerState.visual || {};
  return [
    ["execution_allowed", pipeline.execution_allowed ? "ready" : "blocked", pipeline.execution_allowed ? "yes" : "no", pipeline.next_action || "", "app", ".kabeeri/planner.json"],
    ["next_stage", pipeline.next_stage || "unknown", pipeline.next_stage || "unknown", pipeline.next_action || "", "app", ".kabeeri/planner.json"],
    ["idea", pipeline.idea ? "captured" : "missing", pipeline.idea || "", context.plannerState.next_action || "", "app", ".kabeeri/planner.json"],
    ["documentation_files", pipeline.documentation_files_total || 0 ? "ready" : "missing", String(pipeline.documentation_files_total || 0), "Create or refresh app docs.", "app", ".kabeeri/planner.json"],
    ["system_design", pipeline.design_artifacts && pipeline.design_artifacts.system_design ? "ready" : "missing", pipeline.design_artifacts && pipeline.design_artifacts.system_design ? "system design present" : "missing", "Complete the system design artifact.", "app", ".kabeeri/planner.json"],
    ["database_design", pipeline.design_artifacts && pipeline.design_artifacts.database_design ? "ready" : "missing", pipeline.design_artifacts && pipeline.design_artifacts.database_design ? "database design present" : "missing", "Complete the database design artifact.", "app", ".kabeeri/planner.json"],
    ["ui_ux_design", pipeline.design_artifacts && pipeline.design_artifacts.ui_ux_design ? "ready" : "missing", pipeline.design_artifacts && pipeline.design_artifacts.ui_ux_design ? "UI/UX design present" : "missing", "Complete the UI/UX design artifact.", "app", ".kabeeri/planner.json"],
    ["visual_planning", visual.available ? "ready" : "missing", visual.available ? visual.graph_format || "mermaid" : "", "Refresh the visual planner.", "app", ".kabeeri/planner.json"],
    ["version_plan", context.versionPlanSummary.available ? "ready" : "missing", context.versionPlanSummary.current_version || "", "Approve the version plan.", "app", ".kabeeri/planner.json"],
    ["evolutions", Array.isArray(pipeline.evolutions) ? "ready" : "missing", String(context.evolutionSummary.changes_total || 0), "Create app evolutions.", "app", ".kabeeri/evolution.json"],
    ["task_punches", pipeline.task_punches && pipeline.task_punches.length ? "ready" : "missing", String(pipeline.task_punches_total || 0), "Prepare the first task punch.", "app", ".kabeeri/planner.json"],
    ["next_evolution", context.plannerState.next_evolution && context.plannerState.next_evolution.title ? "ready" : "missing", context.plannerState.next_evolution && context.plannerState.next_evolution.title ? context.plannerState.next_evolution.title : "", context.plannerState.next_action || "", "app", ".kabeeri/planner.json"],
    ["handoff", context.sourceControl.mode || "local_first", context.sourceControl.mode || "local_first", "Keep the handoff local-first.", "app", ".kabeeri/planner.json"]
  ];
}

function questionnaireWidgets(context) {
  return [
    dashboardWidget("viber_questions_total", "Questions Total", "metric", context.questionnairePlans.reduce((sum, plan) => sum + (Array.isArray(plan.generated_questions) ? plan.generated_questions.length : 0), 0), "ok", "vibe_app_developer", "derived", "Capture the unanswered questions."),
    dashboardWidget("viber_answers_total", "Answers Total", "metric", context.questionnaireAnswers.length, "ok", "vibe_app_developer", "derived", "Record the answers before design."),
    dashboardWidget("viber_missing_answers", "Missing Answers", "warning", context.questionnaireMissing.length, context.questionnaireMissing.length ? "warning" : "ok", "vibe_app_developer", "derived", "Close the missing answer gaps."),
    dashboardWidget("viber_review_status", "Review Status", "status", context.questionnaireCoverage.some((area) => area.status === "blocked") ? "blocked" : "reviewable", context.questionnaireCoverage.some((area) => area.status === "blocked") ? "warning" : "ok", "vibe_app_developer", "derived", "Review the intake coverage."),
    dashboardWidget("viber_approval_status", "Approval Status", "status", context.questionnairePlans.some((plan) => plan.approved_at) ? "approved" : "pending", context.questionnairePlans.some((plan) => plan.approved_at) ? "ok" : "warning", "vibe_app_developer", "derived", "Approve intake before moving forward.")
  ];
}

function questionnaireRows(context) {
  const questions = context.questionnairePlans.flatMap((plan) => (plan.generated_questions || []).map((question) => ({
    question_id: question.question_id,
    area_ids: question.area_ids || [],
    answered: context.questionnaireAnswers.some((answer) => answer.question_id === question.question_id),
    required_action: question.why || "Answer the question."
  })));
  return (questions.length ? questions : context.questionnaireCoverage.map((area) => ({
    question_id: area.area_key,
    area_ids: [area.area_key],
    answered: area.status !== "blocked",
    required_action: area.required_action || "Address the area."
  }))).map((item) => [
    item.question_id || "",
    (item.area_ids || []).join(", "),
    item.answered ? "ready" : "missing",
    item.answered ? "yes" : "no",
    item.required_action || ""
  ]);
}

function productWidgets(context) {
  return [
    dashboardWidget("viber_blueprint", "Product Blueprint", "status", context.productBlueprintState.current_blueprint || context.productBlueprintState.selected_blueprints && context.productBlueprintState.selected_blueprints[0] ? "selected" : "missing", context.productBlueprintState.selected_blueprints && context.productBlueprintState.selected_blueprints.length ? "ok" : "warning", "vibe_app_developer", "derived", "Keep the app blueprint explicit."),
    dashboardWidget("viber_app_type", "App Type", "status", context.project.app_type || context.project.type || "app", "ok", "vibe_app_developer", "derived", "Keep the app type visible."),
    dashboardWidget("viber_modules_count", "Modules Count", "metric", countRecords(context.dataDesignState.contexts || []), "ok", "vibe_app_developer", "derived", "Track app modules in the design state."),
    dashboardWidget("viber_surfaces_count", "Surfaces Count", "metric", countRecords(context.productBlueprintState.selected_blueprints || []), "ok", "vibe_app_developer", "derived", "Track the app's surfaced areas."),
    dashboardWidget("viber_journeys_count", "User Journeys Count", "metric", context.journeys.length, "ok", "vibe_app_developer", "derived", "Keep the app journey count visible.")
  ];
}

function moduleRows(context) {
  return [
    ["App Workspace", "Current app/product workspace", "vibe_app_developer", context.project.workspace_kind === "developer_app" ? "ready" : "empty", context.apps.map((app) => app.username).join(", ") || ""],
    ["Blueprint", "Selected blueprint set", "vibe_app_developer", context.productBlueprintState.selected_blueprints && context.productBlueprintState.selected_blueprints.length ? "ready" : "missing", (context.productBlueprintState.selected_blueprints || []).map((item) => item.blueprint_key).join(", ") || ""],
    ["Data Design", "Database planning context", "vibe_app_developer", context.dataDesignState.contexts && context.dataDesignState.contexts.length ? "ready" : "missing", (context.dataDesignState.contexts || []).map((item) => item.context_id).join(", ") || ""]
  ];
}

function journeyRows(context) {
  const journeys = context.journeys.length ? context.journeys : [{ id: "none", name: "No journeys yet", status: "empty" }];
  return journeys.map((journey) => [
    journey.name || journey.id || "",
    journey.status || "",
    journey.ready_to_show || journey.status === "ready_to_show" ? "yes" : "no",
    (journey.feature_ids || []).join(", ") || "",
    (journey.task_ids || []).join(", ") || ""
  ]);
}

function systemWidgets(context) {
  return [
    dashboardWidget("viber_architecture", "Architecture Readiness", "status", context.plannerState.pipeline && context.plannerState.pipeline.design_artifacts && context.plannerState.pipeline.design_artifacts.system_design ? "ready" : "missing", context.plannerState.pipeline && context.plannerState.pipeline.design_artifacts && context.plannerState.pipeline.design_artifacts.system_design ? "ok" : "warning", "vibe_app_developer", "derived", "Keep the architecture explicit."),
    dashboardWidget("viber_integrations", "Integrations", "metric", context.apps.length, "ok", "vibe_app_developer", "derived", "Track the current app integrations."),
    dashboardWidget("viber_boundaries", "Boundaries", "metric", context.task_tracker_state && context.task_tracker_state.summary ? context.task_tracker_state.summary.blocked || 0 : 0, "ok", "vibe_app_developer", "derived", "Maintain clear app boundaries."),
    dashboardWidget("viber_risks", "Risks", "metric", countRecords(context.structuredState.risks || []), "ok", "vibe_app_developer", "derived", "Surface app risks early.")
  ];
}

function systemRows(context) {
  return [
    ["Application Shell", "App workspace and request intake", "app workspace, questionnaire", context.project.workspace_kind === "developer_app" ? "ready" : "missing", "Keep app delivery separate from owner work."],
    ["Planner", "Approved app plan and pipeline", "planner.json", context.plannerState.current_plan_status || "empty", context.plannerState.next_action || ""],
    ["Design", "System and UI design artifacts", ".kabeeri/data_design.json", context.dataDesignState.contexts && context.dataDesignState.contexts.length ? "ready" : "missing", "Keep design artifacts current."]
  ];
}

function databaseWidgets(context) {
  return [
    dashboardWidget("viber_entities", "Entities Count", "metric", countRecords(context.dataDesignState.contexts || []), "ok", "vibe_app_developer", "derived", "Keep entity counts visible."),
    dashboardWidget("viber_relationships", "Relationships Count", "metric", countRecords(context.productBlueprintState.selected_blueprints || []), "ok", "vibe_app_developer", "derived", "Track relationships through the database plan."),
    dashboardWidget("viber_migrations", "Migrations Needed", "metric", countRecords(context.structuredState.change_requests || []), "ok", "vibe_app_developer", "derived", "Plan migrations before release."),
    dashboardWidget("viber_persistence", "Persistence Status", "status", context.structuredState.requirements && context.structuredState.requirements.length ? "planned" : "missing", context.structuredState.requirements && context.structuredState.requirements.length ? "ok" : "warning", "vibe_app_developer", "derived", "Keep persistence visible.")
  ];
}

function databaseRows(context) {
  const entities = context.dataDesignState.contexts.length ? context.dataDesignState.contexts : [{ context_id: "none", entities: [], modules: [], checklist: [], blueprint_key: "" }];
  return entities.map((entity) => [
    entity.context_id || "",
    (entity.entities || []).join(", ") || "",
    (entity.modules || []).join(", ") || "",
    (entity.checklist || []).join(", ") || "",
    entity.status || "ready"
  ]);
}

function uiUxWidgets(context) {
  return [
    dashboardWidget("viber_screens", "Screens / Pages", "metric", context.productBlueprintState.selected_blueprints.length ? countRecords(context.productBlueprintState.selected_blueprints) : 0, "ok", "vibe_app_developer", "derived", "Keep the screen count visible."),
    dashboardWidget("viber_visual_state", "Visual State", "status", context.plannerState.visual && context.plannerState.visual.available ? context.plannerState.visual.graph_format || "mermaid" : "missing", context.plannerState.visual && context.plannerState.visual.available ? "ok" : "warning", "vibe_app_developer", "derived", "Keep the visual planning state available."),
    dashboardWidget("viber_accessibility", "Accessibility Target", "status", "WCAG-aware", "ok", "vibe_app_developer", "derived", "Keep accessibility explicit."),
    dashboardWidget("viber_design_decisions", "Design Decisions Pending", "metric", countRecords(context.questionnaireMissing), context.questionnaireMissing.length ? "warning" : "ok", "vibe_app_developer", "derived", "Close design decisions before implementation.")
  ];
}

function uiUxRows(context) {
  const blueprints = context.productBlueprintState.selected_blueprints.length ? context.productBlueprintState.selected_blueprints : [{ blueprint_key: "none", frontend_pages: [], channels: [], reason: "No blueprint yet." }];
  return blueprints.map((blueprint) => [
    blueprint.blueprint_key || "",
    blueprint.reason || "",
    (blueprint.frontend_pages || []).join(", ") || "",
    blueprint.status || "ready",
    (blueprint.task_ids || []).join(", ") || ""
  ]);
}

function versionWidgets(context) {
  return [
    dashboardWidget("viber_current_version", "Current Version", "status", context.versionPlanSummary.current_version || "none", context.versionPlanSummary.available ? "ok" : "warning", "vibe_app_developer", "derived", "Keep the current version visible."),
    dashboardWidget("viber_next_version", "Next Version", "status", context.versionPlanSummary.next_version || "none", context.versionPlanSummary.available ? "ok" : "warning", "vibe_app_developer", "derived", "Plan the next release version."),
    dashboardWidget("viber_versions_total", "Evolutions Total", "metric", context.versionPlanSummary.versions_total || 0, "ok", "vibe_app_developer", "derived", "Count the current evolution slices."),
    dashboardWidget("viber_current_evolution", "Current Evolution", "status", currentEvolutionLabel(context), "ok", "vibe_app_developer", "derived", "Keep the current evolution visible."),
    dashboardWidget("viber_future_only", "Future-only Evolutions", "warning", countRecords(context.evolutionBoard.future_only_evolutions || []), context.evolutionBoard.future_only_evolutions && context.evolutionBoard.future_only_evolutions.length ? "warning" : "ok", "vibe_app_developer", "derived", "Keep future-only evolutions out of scope.")
  ];
}

function versionRows(context) {
  const versionPlan = context.plannerState.version_plan || {};
  const versions = Array.isArray(versionPlan.versions) && versionPlan.versions.length ? versionPlan.versions : [{ version: versionPlan.current_version || "none", goal: "Current version", source_control_mode: context.sourceControl.mode || "" }];
  return versions.map((version) => [
    version.version || version.version_id || version.name || "",
    version.goal || version.description || "",
    Array.isArray(version.included_evolutions) ? version.included_evolutions.join(", ") : version.evolutions || "",
    Array.isArray(version.excluded_scope) ? version.excluded_scope.join(", ") : version.excluded_scope || "",
    version.readiness_gate || version.status || "",
    version.source_control_mode || context.sourceControl.mode || ""
  ]);
}

function currentEvolutionLabel(context) {
  const currentEvolution = context.evolutionBoard.current_evolution || context.evolutionSummary.latest_change || null;
  return currentEvolution ? currentEvolution.title || currentEvolution.change_id || "current" : "none";
}

function taskPunchWidgets(context) {
  return [
    dashboardWidget("viber_task_punch_total", "Task Punch Total", "metric", countRecords((context.plannerState.task_punch && context.plannerState.task_punch.tasks) || []), "ok", "vibe_app_developer", "derived", "Keep the task punch visible."),
    dashboardWidget("viber_task_proposed", "Proposed Tasks", "metric", countByTaskStatus(context, "proposed"), "ok", "vibe_app_developer", "derived", "Review proposed tasks."),
    dashboardWidget("viber_task_approved", "Approved Tasks", "metric", countByTaskStatus(context, "approved"), "ok", "vibe_app_developer", "derived", "Execute approved tasks."),
    dashboardWidget("viber_task_progress", "In Progress Tasks", "metric", countByTaskStatus(context, "in_progress"), "ok", "vibe_app_developer", "derived", "Keep in-progress work visible."),
    dashboardWidget("viber_task_verified", "Verified Tasks", "metric", countByTaskStatus(context, "verified"), "ok", "vibe_app_developer", "derived", "Track verification."),
    dashboardWidget("viber_task_archived", "Archived Tasks", "metric", context.taskTrashState.trash.length, "ok", "vibe_app_developer", "derived", "Archived tasks remain in trash.")
  ];
}

function countByTaskStatus(context, status) {
  const tasks = Array.isArray(context.tasks) ? context.tasks : [];
  if (status === "verified") return tasks.filter((item) => ["owner_verified", "verified"].includes(String(item.status || "").toLowerCase())).length;
  return tasks.filter((item) => String(item.status || "").toLowerCase() === status).length;
}

function taskPunchRows(context, viber = false) {
  const tasks = Array.isArray(context.plannerState.task_punch && context.plannerState.task_punch.tasks) && context.plannerState.task_punch.tasks.length
    ? context.plannerState.task_punch.tasks
    : context.tasks;
  return (tasks.length ? tasks : [{ id: "none", title: "No task punch yet", status: "empty" }]).map((task) => [
    task.id || task.task_id || "",
    task.title || "",
    task.status || "",
    task.evolution_id || task.evolution || context.current_plan_id || "",
    (task.allowed_files || task.allowed || []).join(", ") || "",
    (task.forbidden_files || task.forbidden || []).join(", ") || "",
    (task.acceptance || task.acceptance_criteria || []).join(", ") || "",
    (task.validation_commands || task.validation || []).join(", ") || "",
    task.stop_condition || task.task_trash_policy || ""
  ]);
}

function sourceControlWidgets(context, dashboardType = "owner") {
  const source = context.sourceControl || {};
  return [
    dashboardWidget(`${dashboardType}_sc_enabled`, "Source Control Enabled", "status", source.mode && source.mode !== "none" ? "yes" : "no", source.mode && source.mode !== "none" ? "ok" : "warning", context.workspace_track, "derived", "Expose the track's source control mode."),
    dashboardWidget(`${dashboardType}_sc_mode`, "Source Control Mode", "status", source.mode || (dashboardType === "viber" ? "local_first" : "direct_main"), "ok", context.workspace_track, "derived", dashboardType === "viber" ? "Keep delivery local-first." : "Keep delivery direct-to-main."),
    dashboardWidget(`${dashboardType}_sc_branching`, "Branching / PR", "status", `${source.branching_enabled ? "branching" : "no branching"} / ${source.pr_enabled ? "PR" : "no PR"}`, "ok", context.workspace_track, "derived", "Show branching only when enabled."),
    dashboardWidget(`${dashboardType}_sc_handoff`, "Handoff Package", "status", context.taskTrashState.trash.length ? "available" : "pending", context.taskTrashState.trash.length ? "ok" : "warning", context.workspace_track, "derived", "Handoff package status stays visible."),
    dashboardWidget(`${dashboardType}_sc_github`, "GitHub Optional Status", "status", source.remote_provider && source.remote_provider !== "none" ? source.remote_provider : "optional", "ok", context.workspace_track, "derived", "GitHub remains optional.")
  ];
}

function handoffRows(context) {
  const handoffState = Array.isArray(context.plannerState.materialization && context.plannerState.materialization.materialized_task_ids) ? context.plannerState.materialization.materialized_task_ids : [];
  return [
    [context.plannerState.current_plan_id || "handoff-1", context.plannerState.materialization && context.plannerState.materialization.status || "pending", handoffState.join(", ") || "no evidence yet", context.plannerState.next_action || "Materialize the plan."]
  ];
}

function aiCostWidgets(context, dashboardType = "viber") {
  const summary = context.usageSummary || {};
  return [
    dashboardWidget(`${dashboardType}_ai_cost`, dashboardType === "viber" ? "App AI Cost" : "Total AI Usage Cost", "metric", summary.total_cost || 0, "ok", context.workspace_track, "derived", "Keep AI cost visible."),
    dashboardWidget(`${dashboardType}_ai_tokens`, "Tokens by Task", "metric", summary.total_tokens || 0, "ok", context.workspace_track, "derived", "Track tokens by task."),
    dashboardWidget(`${dashboardType}_ai_tracked`, "Tracked AI", "metric", summary.tracked_vs_untracked && summary.tracked_vs_untracked.tracked ? summary.tracked_vs_untracked.tracked.cost || 0 : 0, "ok", context.workspace_track, "derived", "Tracked work stays visible."),
    dashboardWidget(`${dashboardType}_ai_untracked`, "Untracked AI", "metric", summary.tracked_vs_untracked && summary.tracked_vs_untracked.untracked ? summary.tracked_vs_untracked.untracked.cost || 0 : 0, "warning", context.workspace_track, "derived", "Untracked work needs review.")
  ];
}

function appPluginWidgets(context) {
  return [
    dashboardWidget("viber_plugins_used", "Plugins Used by App", "metric", countRecords((context.pluginState.plugins || []).filter((plugin) => plugin.enabled !== false)), "ok", "vibe_app_developer", "derived", "Track the plugins used by the app."),
    dashboardWidget("viber_app_builder", "App-Builder Plugin Status", "status", fileExists("plugins") ? "available" : "missing", "ok", "vibe_app_developer", "derived", "Keep app-builder status visible."),
    dashboardWidget("viber_integration", "Integration Readiness", "status", context.sourceControl.mode || "local_first", "ok", "vibe_app_developer", "derived", "Track integration readiness.")
  ];
}

function appPluginRows(context) {
  const plugins = Array.isArray(context.pluginState.plugins) ? context.pluginState.plugins : [];
  if (!plugins.length) return [["app-builder", "no", "App builder plugin", "src/cli", "missing", "No plugin registry state yet."]];
  return plugins.map((plugin) => [
    plugin.id || plugin.name || "",
    plugin.enabled === false ? "no" : "yes",
    plugin.purpose || plugin.description || "",
    plugin.runtime_entrypoint || plugin.entrypoint || "",
    plugin.status || (plugin.enabled === false ? "disabled" : "active"),
    Array.isArray(plugin.gaps) ? plugin.gaps.join(", ") : plugin.gaps || ""
  ]);
}

function validationWidgets(context) {
  const securityGate = buildSecurityGateDashboardState(context, { track: "vibe", scope: "handoff" });
  return [
    dashboardWidget("viber_workspace_validation", "Workspace Validation", "status", "ready", "ok", "vibe_app_developer", "derived", "Keep the app workspace valid."),
    dashboardWidget("viber_task_validation", "Task Validation", "status", context.tasks.length ? "ready" : "empty", context.tasks.length ? "ok" : "warning", "vibe_app_developer", "derived", "Validate the current tasks."),
    dashboardWidget("viber_handoff_readiness", "Handoff Readiness", "status", context.plannerState.materialization && context.plannerState.materialization.status === "materialized" ? "ready" : "pending", context.plannerState.materialization && context.plannerState.materialization.status === "materialized" ? "ok" : "warning", "vibe_app_developer", "derived", "Handoff becomes ready after materialization."),
    dashboardWidget("viber_app_security", "App Security Readiness", "status", securityGate.status, securityGate.status === "blocked" ? "warning" : securityGate.status === "warning" ? "warning" : "ok", "vibe_app_developer", "derived", securityGate.next_action),
    dashboardWidget("viber_migration_security", "Migration / Security Blockers", "warning", countRecords(context.structuredState.gates ? context.structuredState.gates.filter((item) => item.status === "blocked") : []), "ok", "vibe_app_developer", "derived", "Resolve migration and security blockers.")
  ];
}

function validationRows(context) {
  const securityGate = buildSecurityGateDashboardState(context, { track: "vibe", scope: "handoff" });
  return [
    ["Workspace", "ready", context.project.workspace_kind || "workspace", "Keep the app workspace valid."],
    ["Task", context.tasks.length ? "ready" : "empty", String(context.tasks.length), "Validate the current tasks."],
    ["Handoff", context.plannerState.materialization && context.plannerState.materialization.status === "materialized" ? "ready" : "pending", context.plannerState.materialization && context.plannerState.materialization.status === "materialized" ? "materialized" : "pending", "Materialize the plan first."],
    ["App Security", securityGate.status, securityGatePluginSummary(securityGate), securityGate.next_action],
    ["Migration / Security", countRecords(context.structuredState.gates ? context.structuredState.gates.filter((item) => item.status === "blocked") : []) ? "blocked" : "ready", String(countRecords(context.structuredState.gates ? context.structuredState.gates.filter((item) => item.status === "blocked") : [])), "Resolve blockers before release."]
  ];
}

function pluginVisualStatus(context) {
  return context.plannerState.visual && context.plannerState.visual.available ? context.plannerState.visual.graph_format || "mermaid" : "missing";
}

function plannerVisualStatus(context) {
  return pluginVisualStatus(context);
}

function githubProviderStatus(context) {
  const source = context.sourceControl || {};
  return source.remote_provider && source.remote_provider !== "none" ? source.remote_provider : "optional";
}

function buildDashboardStateSectionSummary() {
  return [];
}

function buildDashboardEvolutionBoard(evolutionState = {}, evolutionSummary = {}) {
  const changes = Array.isArray(evolutionState.changes) ? evolutionState.changes : [];
  const currentChangeId = evolutionState.current_change_id || evolutionSummary.current_change_id || null;
  const currentEvolution = currentChangeId ? changes.find((item) => item && item.change_id === currentChangeId) || null : null;
  const normalizedChanges = changes.filter(Boolean);
  const archivedEvolutions = normalizedChanges.filter((item) => Boolean(item.archived) || ["done", "closed"].includes(String(item.status || "").toLowerCase()));
  const openEvolutions = normalizedChanges.filter((item) => !Boolean(item.archived) && !["done", "closed", "rejected"].includes(String(item.status || "").toLowerCase()));
  const futureOnlyEvolutions = normalizedChanges.filter((item) => {
    const status = String(item.status || "").toLowerCase();
    const phase = String(item.phase || item.stage || item.timeline || "").toLowerCase();
    return status === "future_only" || status === "future" || phase === "future";
  });
  const futureBlockedItems = normalizedChanges.filter((item) => {
    const status = String(item.status || "").toLowerCase();
    return status === "blocked" || status === "future_only";
  });
  return {
    current_evolution: currentEvolution || evolutionSummary.latest_change || null,
    changes: normalizedChanges,
    open_evolutions: openEvolutions,
    archived_evolutions: archivedEvolutions,
    future_blocked_items: futureBlockedItems,
    future_only_evolutions: futureOnlyEvolutions,
    auto_closeout_status: openEvolutions.length ? "active" : normalizedChanges.length ? "ready" : "empty"
  };
}

module.exports = {
  collectDashboardState,
  refreshTaskTrackerState,
  buildTaskTrackerStateFromFiles,
  buildTaskTrackerState,
  buildTaskTrackerActionItems,
  buildWorkstreamSummaries,
  buildCustomerAppSummaries,
  buildPlannerDashboardState,
  collectWorkspaceDashboardSummaries,
  getDashboardWorkspaceRoots,
  parseWorkspaceRoots,
  summarizeWorkspaceRoot,
  buildDashboardUxGovernanceState,
  writeDashboardStateFiles,
  refreshDashboardArtifacts,
  taskWorkstreams,
  collectDashboardStateForCurrentTrack,
  writeDashboardStateFilesForCurrentTrack,
  buildOwnerDashboardState,
  buildViberDashboardState,
  buildDashboardStateForCurrentTrack,
  buildDashboardStateForScope,
  buildDashboardSourceControl,
  normalizeDashboardScope
};
