const path = require("path");

const { fileExists, repoRoot } = require("../fs_utils");
const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { buildDashboardContracts, validateDashboardContracts } = require("../services/dashboard_contract");
const { readStateArray, summarizeBy } = require("../services/state_utils");
const { readJsonLines } = require("../services/jsonl");
const { buildTaskLifecycleState, buildTaskLifecycleBoard } = require("./task_lifecycle");

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

function buildPlannerPipelineSummary(plan = null) {
  const pipeline = plan && plan.pipeline ? plan.pipeline : null;
  const rawVersionPlan = plan && plan.version_plan ? plan.version_plan : null;
  const taskPunch = plan && plan.task_punch ? plan.task_punch : null;
  const visual = plan && plan.visual ? plan.visual : null;
  const designArtifacts = pipeline && pipeline.design_artifacts ? pipeline.design_artifacts : {};
  const versionPlan = rawVersionPlan || null;
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
  taskWorkstreams
};
