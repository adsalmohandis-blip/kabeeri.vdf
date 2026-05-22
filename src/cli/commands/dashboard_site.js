const path = require("path");

const { readJsonFile } = require("../workspace");
const { fileExists, repoRoot, writeTextFile } = require("../fs_utils");
const { buildOptionalAssetTags, getOptionalUiAssets } = require("../services/ui_asset_provider");
const { summarizeUsage } = require("./usage_pricing");
const { buildCustomerAppSummaries, buildPlannerDashboardState, collectDashboardStateForCurrentTrack } = require("./dashboard_state");
const { buildDashboardActionItems } = require("./dashboard");
const { readStateArray } = require("../services/state_utils");
const { buildEvolutionSummary } = require("../services/evolution");
const { summarizeWorkspaceContract, validateDeveloperAppWorkspace } = require("../services/app_workspace_contract");
const { refreshAppScorecards, buildAppScorecardTableRows, buildAppScorecardSummaryLine } = require("../services/app_scorecards");

function buildClientHomeHtml(options = {}) {
  const project = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
  const apps = fileExists(".kabeeri/customer_apps.json") ? readJsonFile(".kabeeri/customer_apps.json").apps || [] : [];
  const features = fileExists(".kabeeri/features.json") ? readJsonFile(".kabeeri/features.json").features || [] : [];
  const journeys = fileExists(".kabeeri/journeys.json") ? readJsonFile(".kabeeri/journeys.json").journeys || [] : [];
  const visibleFeatures = features.filter((item) => ["ready_to_demo", "ready_to_publish"].includes(item.readiness));
  const visibleJourneys = journeys.filter((item) => item.ready_to_show || item.status === "ready_to_show");
  const uiAssets = buildUiAssetMarkup(options);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(project.name || "Kabeeri Client Portal")}</title>
${indentHtmlBlock(uiAssets, 2)}
  <style>
    body { margin: 0; font-family: Arial, sans-serif; color: #1f2933; background: #f7f8fb; }
    header { background: #ffffff; border-bottom: 1px solid #d9dee7; padding: 28px; }
    main { max-width: 1080px; margin: 0 auto; padding: 24px; }
    h1, h2 { margin: 0 0 12px; }
    p { margin: 0 0 16px; color: #52606d; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-bottom: 24px; }
    .card { background: white; border: 1px solid #d9dee7; border-radius: 8px; padding: 16px; }
    .status { display: inline-block; margin-top: 8px; font-size: 12px; color: #334e68; background: #e8f1f8; border-radius: 999px; padding: 4px 8px; }
    a { color: #0b5cad; text-decoration: none; font-weight: 700; }
    ul { background: white; border: 1px solid #d9dee7; border-radius: 8px; margin: 0 0 24px; padding: 16px 16px 16px 34px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(project.name || "Kabeeri Client Portal")}</h1>
    <p>Customer-facing project page. Internal governance and dashboard data are kept on the private dashboard route.</p>
  </header>
  <main>
    <section>
      <h2>Apps</h2>
      <div class="grid">
        ${(apps.length ? apps : [{ username: "demo", name: "Demo App", status: "draft", public_url: "/customer/apps/demo" }]).map((appItem) => `
          <article class="card">
            <h3>${escapeHtml(appItem.name)}</h3>
            <a href="${escapeHtml(publicCustomerAppUrl(appItem.username))}">${escapeHtml(publicCustomerAppUrl(appItem.username))}</a>
            <div class="status">${escapeHtml(appItem.status || "draft")}</div>
          </article>
        `).join("")}
      </div>
    </section>
    <section>
      <h2>Ready Features</h2>
      <ul>
        ${(visibleFeatures.length ? visibleFeatures : [{ title: "No ready features yet", readiness: "needs_review" }]).map((featureItem) => `<li>${escapeHtml(featureItem.title)} <span class="status">${escapeHtml(featureItem.readiness || "")}</span></li>`).join("")}
      </ul>
    </section>
    <section>
      <h2>Ready Journeys</h2>
      <ul>
        ${(visibleJourneys.length ? visibleJourneys : [{ name: "No ready journeys yet", status: "draft" }]).map((journeyItem) => `<li>${escapeHtml(journeyItem.name)} <span class="status">${escapeHtml(journeyItem.status || "")}</span></li>`).join("")}
      </ul>
    </section>
  </main>
</body>
</html>
`;
}

function buildCustomerAppHtml(appItem, options = {}) {
  const features = readStateArray(".kabeeri/features.json", "features");
  const journeys = readStateArray(".kabeeri/journeys.json", "journeys");
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const summary = buildCustomerAppSummaries([appItem], features, journeys, tasks, summarizeUsage())[0] || {
    features_total: 0,
    ready_features: 0,
    journeys_total: 0,
    ready_journeys: 0,
    tasks_total: 0,
    verified_tasks: 0,
    open_tasks: 0,
    ai_usage: { events: 0, tokens: 0, cost: 0 },
    public_url: publicCustomerAppUrl(appItem.username)
  };
  const linkedFeatures = features.filter((featureItem) => (appItem.feature_ids || []).includes(featureItem.id));
  const linkedJourneys = journeys.filter((journeyItem) => (appItem.journey_ids || []).includes(journeyItem.id));
  const uiAssets = buildUiAssetMarkup(options);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(appItem.name)}</title>
${indentHtmlBlock(uiAssets, 2)}
  <style>
    body { margin: 0; font-family: Arial, sans-serif; color: #1f2933; background: #ffffff; }
    main { max-width: 860px; margin: 0 auto; padding: 42px 24px; }
    h1 { margin: 0 0 12px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin: 18px 0; }
    .card { border: 1px solid #d9dee7; border-radius: 8px; padding: 14px; }
    .metric { display: block; font-size: 24px; font-weight: 700; margin-top: 4px; }
    .status { display: inline-block; margin-top: 12px; font-size: 13px; color: #334e68; background: #e8f1f8; border-radius: 999px; padding: 5px 9px; }
    a { color: #0b5cad; text-decoration: none; font-weight: 700; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <main>
    <a href="/">Back to apps</a>
    <h1>${escapeHtml(appItem.name)}</h1>
    <p>Public username: <strong>${escapeHtml(appItem.username)}</strong></p>
    <p>Public route: <strong>${escapeHtml(publicCustomerAppUrl(appItem.username))}</strong></p>
    <div class="status">${escapeHtml(appItem.status || "draft")}</div>
    <section class="grid">
      ${metricCard("Features", summary.features_total)}
      ${metricCard("Ready Features", summary.ready_features)}
      ${metricCard("Journeys", summary.journeys_total)}
      ${metricCard("Open Tasks", summary.open_tasks)}
    </section>
    <section>
      <h2>Linked Features</h2>
      <ul>${(linkedFeatures.length ? linkedFeatures : [{ title: "No linked features yet", readiness: "draft" }]).map((featureItem) => `<li>${escapeHtml(featureItem.title)} <span class="status">${escapeHtml(featureItem.readiness || "")}</span></li>`).join("")}</ul>
    </section>
    <section>
      <h2>Linked Journeys</h2>
      <ul>${(linkedJourneys.length ? linkedJourneys : [{ name: "No linked journeys yet", status: "draft" }]).map((journeyItem) => `<li>${escapeHtml(journeyItem.name)} <span class="status">${escapeHtml(journeyItem.status || "")}</span></li>`).join("")}</ul>
    </section>
  </main>
</body>
</html>
`;
}

function buildDeveloperAppDashboardHtml(options = {}) {
  const project = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
  const contract = validateDeveloperAppWorkspace(repoRoot());
  const summary = summarizeWorkspaceContract(contract);
  const evolutionState = fileExists(".kabeeri/evolution.json")
    ? readJsonFile(".kabeeri/evolution.json")
    : { changes: [], impact_plans: [], current_change_id: null };
  const evolutionSummary = buildEvolutionSummary(evolutionState);
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const taskTracker = fileExists(".kabeeri/dashboard/task_tracker_state.json")
    ? readJsonFile(".kabeeri/dashboard/task_tracker_state.json")
    : { generated_at: null, summary: {}, tasks: [] };
  const questionnairePlan = fileExists(".kabeeri/questionnaires/adaptive_intake_plan.json")
    ? readJsonFile(".kabeeri/questionnaires/adaptive_intake_plan.json")
    : { plans: [], current_plan_id: null };
  const coverage = fileExists(".kabeeri/questionnaires/coverage_matrix.json")
    ? readJsonFile(".kabeeri/questionnaires/coverage_matrix.json")
    : { areas: [] };
  const missingAnswers = fileExists(".kabeeri/questionnaires/missing_answers_report.json")
    ? readJsonFile(".kabeeri/questionnaires/missing_answers_report.json")
    : { missing: [] };
  const scorecards = refreshAppScorecards(repoRoot()) || {
    summary: { total: 0, ready: 0, pending: 0, blocked: 0, not_applicable: 0, average_score: 0, baseline_ready: false, release_ready: false, next_exact_action: "kvdf questionnaire review" },
    review_state: { status: "draft" },
    cards: [],
    surface_cards: []
  };
  const boundaries = (contract.boundary && contract.boundary.items) || [];
  const nextAction = scorecards.summary.next_exact_action || summary.next_exact_action || "kvdf app workspace validate";
  const title = project.app_name || project.name || summary.workspace_slug || "Vibe Developer Workspace";
  const dashboardTitle = "Vibe Developer Dashboard";
  const evolutionCloseoutBadge = buildEvolutionCloseoutBadge(
    evolutionSummary.current_milestone ? evolutionSummary.current_milestone.closeout_state : "none",
    evolutionSummary.auto_closed_changes_total || 0
  );
  const plannerState = buildPlannerDashboardState({ project });
  const uiAssets = buildUiAssetMarkup(options);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} - ${escapeHtml(dashboardTitle)}</title>
${indentHtmlBlock(uiAssets, 2)}
  <style>
    body { margin: 0; font-family: Arial, sans-serif; color: #1f2933; background: #f6f7f9; }
    header { background: linear-gradient(135deg, #0f766e, #134e4a); color: white; padding: 24px 28px; }
    main { max-width: 1100px; margin: 0 auto; padding: 24px; }
    h1, h2 { margin: 0 0 12px; }
    p { margin: 0 0 14px; color: #dbe8e4; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 20px 0 26px; }
    .card { background: white; border: 1px solid #d9dee7; border-radius: 10px; padding: 16px; }
    .metric { display: block; font-size: 30px; font-weight: 700; margin-top: 6px; color: #0f172a; }
    .status { display: inline-block; margin-top: 8px; font-size: 12px; color: #334e68; background: #e8f1f8; border-radius: 999px; padding: 4px 8px; }
    .pill { display: inline-block; margin-right: 8px; margin-top: 10px; font-size: 12px; padding: 4px 8px; border-radius: 999px; background: rgba(255,255,255,0.16); color: #fff; }
    .section { margin-bottom: 24px; }
    .section-help { margin: -6px 0 12px; color: #5f6b7a; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #d9dee7; margin-bottom: 16px; }
    th, td { text-align: left; border-bottom: 1px solid #e7ebf0; padding: 10px; font-size: 14px; }
    th { background: #eef2f7; }
    code { background: #eef2f7; padding: 2px 5px; border-radius: 4px; }
    .muted { color: #5f6b7a; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(title)}</h1>
    <p>Workspace scope: ${escapeHtml(project.workspace_kind || "developer_app")} · Contract status: ${escapeHtml(contract.status || "unknown")} · Next action: ${escapeHtml(nextAction)}</p>
    <span class="pill">${escapeHtml(summary.boundary_status || "unknown")} boundary</span>
    ${(summary.surface_scopes || []).map((scope) => `<span class="pill">${escapeHtml(scope)}</span>`).join("")}
    <div class="muted">This dashboard is the app-track view for the current app workspace. It stays separate from the owner dashboard and only shows app-track analysis. Milestones auto-archive when their linked tasks finish and trash/archive is written.</div>
    <div class="muted">Planner: ${escapeHtml(plannerState.available ? `${plannerState.current_planner_mode || "unknown"} / ${plannerState.delivery_mode || "unknown"}` : "missing")}</div>
    <div class="pill">${escapeHtml(evolutionCloseoutBadge)}</div>
  </header>
  <main>
    ${renderPlannerDashboardSection(plannerState, { label: "Planner / Pipeline", emptyMessage: "No planner runtime state yet. The app dashboard stays safe when planner state is missing." })}
    <section class="grid">
      ${metricCard("Tasks", tasks.length)}
      ${metricCard("Open Tasks", tasks.filter((item) => !["done", "closed", "archived", "owner_verified"].includes(String(item.status || "").toLowerCase())).length)}
      ${metricCard("Planning Packs", Array.isArray(questionnairePlan.plans) ? questionnairePlan.plans.length : 0)}
      ${metricCard("Scorecards", scorecards.summary.total || 0)}
      ${metricCard("Scorecard Ready", scorecards.summary.ready || 0)}
      ${metricCard("Boundary", summary.boundary_status || "unknown")}
    </section>

    <section class="section">
      <h2>App Workspace Contract</h2>
      <p class="section-help">The app workspace contract is the hard boundary for the vibe developer workspace. Anything outside it is blocked or must be explicitly linked.</p>
      ${htmlTable(["Field", "Value"], [
        ["Workspace", summary.workspace_root || ""],
        ["Kind", summary.status || ""],
        ["App Type", summary.app_type || ""],
        ["Surfaces", (summary.surface_scopes || []).join(", ") || ""],
        ["Linked Roots", (summary.linked_workspace_roots || []).join(", ") || "none"],
        ["Boundary Status", summary.boundary_status || ""],
        ["Missing Count", String(summary.missing_count || 0)],
        ["Next Exact Action", summary.next_exact_action || ""]
      ])}
    </section>

    <section class="section">
      <h2>Boundary Items</h2>
      <p class="section-help">Allowed, linked, and blocked items are classified by the runtime boundary helper.</p>
      ${htmlTable(["Path", "Status", "Reason"], (boundaries.length ? boundaries : [{ path: "", status: "none", reason: "No boundary items available." }]).map((item) => [
        item.path || "",
        item.status || "",
        item.reason || ""
      ]))}
    </section>

    <section class="section">
      <h2>Planning Pack</h2>
      <p class="section-help">The planning pack must be reviewed and approved before tasks are allowed to proceed.</p>
      ${htmlTable(["Plan", "Status", "Reviewed", "Approved"], (Array.isArray(questionnairePlan.plans) && questionnairePlan.plans.length ? questionnairePlan.plans : [{ plan_id: "none", status: "empty", reviewed_at: "", approved_at: "" }]).map((item) => [
        item.plan_id || item.id || "",
        item.status || "",
        item.reviewed_at || "",
        item.approved_at || ""
      ]))}
      </section>

    <section class="section">
      <h2>App Scorecards</h2>
      <p class="section-help">${escapeHtml(buildAppScorecardSummaryLine(scorecards))}</p>
      ${htmlTable(["Card", "Title", "Category", "Scope", "Status", "Score", "Next Action"], buildAppScorecardTableRows(scorecards))}
    </section>

    <section class="section">
      <h2>Task Tracker Live Board</h2>
      <p class="section-help">Task tracker state is derived from the local app workspace and is refreshed from the same source of truth before render. It does not show owner-track tasks. Completed milestone slices auto-close when the last linked task is archived.</p>
      ${htmlTable(["Metric", "Value"], [
        ["Generated At", taskTracker.generated_at || ""],
        ["Tracked Tasks", Array.isArray(taskTracker.tasks) ? taskTracker.tasks.length : 0],
        ["Open Tasks", taskTracker.summary && taskTracker.summary.open_tasks !== undefined ? taskTracker.summary.open_tasks : tasks.filter((item) => !["done", "closed", "archived", "owner_verified"].includes(String(item.status || "").toLowerCase())).length]
      ])}
      ${htmlTable(["Task", "Title", "Status"], tasks.map((item) => [
        item.id,
        item.title,
        item.status || ""
      ]))}
    </section>

    <section class="section">
      <h2>Action Center</h2>
      ${htmlTable(["Severity", "Area", "Message", "Next Action"], buildDashboardActionItems({ technical: {}, business: {}, records: {}}).map((item) => [item.severity, item.area, item.message, item.next_action]))}
    </section>

    <section class="section">
      <h2>Scorecard Readiness</h2>
      <p class="section-help">The scorecard set is now workspace-backed and updates when planning approval or task generation changes.</p>
      ${htmlTable(["Readiness", "State"], [
        ["Workspace Contract", contract.ok ? "ready" : "blocked"],
        ["Planning Pack", (questionnairePlan.plans || []).some((item) => item.status === "approved") ? "ready" : "blocked"],
        ["Boundary Classification", summary.boundary_status || "unknown"],
        ["Scorecard Baseline", scorecards.summary.baseline_ready ? "ready" : "blocked"],
        ["Release Readiness", scorecards.summary.release_ready ? "ready" : "blocked"]
      ])}
    </section>
  </main>
</body>
</html>
`;
}

function buildDashboardHtml(options = {}) {
  const project = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
  const dashboardScope = String(options.scope || project.workspace_kind || "framework_owner").trim().toLowerCase();
  if (project.workspace_kind === "developer_app" && (dashboardScope === "developer_app" || dashboardScope === "vibe_app_developer" || dashboardScope === "vibe")) {
    return buildDeveloperAppDashboardHtml(options);
  }
  const dashboardTitle = "Kabeeri Development Dashboard";
  const technical = readJsonFile(".kabeeri/dashboard/technical_state.json");
  const business = readJsonFile(".kabeeri/dashboard/business_state.json");
  const apps = readStateArray(".kabeeri/customer_apps.json", "apps");
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const features = readStateArray(".kabeeri/features.json", "features");
  const journeys = readStateArray(".kabeeri/journeys.json", "journeys");
  const tokens = readStateArray(".kabeeri/tokens.json", "tokens");
  const locks = readStateArray(".kabeeri/locks.json", "locks");
  const policyResults = readStateArray(".kabeeri/policies/policy_results.json", "results");
  const contextPacks = readStateArray(".kabeeri/ai_usage/context_packs.json", "context_packs");
  const preflights = readStateArray(".kabeeri/ai_usage/cost_preflights.json", "preflights");
  const handoffPackages = readStateArray(".kabeeri/handoff/packages.json", "packages");
  const securityScans = readStateArray(".kabeeri/security/security_scans.json", "scans");
  const migrationChecks = readStateArray(".kabeeri/migrations/migration_checks.json", "checks");
  const vibeSuggestions = readStateArray(".kabeeri/interactions/suggested_tasks.json", "suggested_tasks");
  const vibeCaptures = readStateArray(".kabeeri/interactions/post_work_captures.json", "captures");
  const vibeSessions = readStateArray(".kabeeri/interactions/vibe_sessions.json", "sessions");
  const contextBriefs = readStateArray(".kabeeri/interactions/context_briefs.json", "briefs");
  const agileState = readJsonFile(".kabeeri/dashboard/agile_state.json");
  const structuredState = readJsonFile(".kabeeri/dashboard/structured_state.json");
  const adrRecords = readStateArray(".kabeeri/adr/records.json", "adrs");
  const aiRuns = fileExists(".kabeeri/ai_runs/prompt_runs.jsonl") ? readAiRuns() : [];
  const aiRunReport = fileExists(".kabeeri/ai_runs/prompt_runs.jsonl") ? buildAiRunHistoryReport() : { totals: { runs: 0, unreviewed: 0 }, waste_signals: [] };
  const promptCompositions = readStateArray(".kabeeri/prompt_layer/compositions.json", "compositions");
  const liveReports = fileExists(".kabeeri/reports/live_reports_state.json") ? readJsonFile(".kabeeri/reports/live_reports_state.json") : null;
  const usage = summarizeUsage();
  const appSummaries = business.app_summaries || buildCustomerAppSummaries(apps, features, journeys, tasks, usage);
  const workspaceSummaries = business.workspaces || [];
  const workstreamSummaries = business.workstreams || [];
  const dashboardUxGovernance = business.dashboard_ux_governance || {};
  const evolutionCloseoutBadge = buildEvolutionCloseoutBadge(
    (business.evolution_auto_closeout || {}).current_milestone_closeout_state,
    (business.evolution_auto_closeout || {}).auto_closed_changes_total || 0
  );
  const plannerState = buildPlannerDashboardState({ project });
  const dashboardActionItems = buildDashboardActionItems({
    technical,
    business,
    records: {
      vibe_captures: vibeCaptures,
      agile: agileState,
      structured: structuredState,
      adrs: adrRecords,
      ai_run_report: aiRunReport
    }
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(dashboardTitle)}</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; color: #202124; background: #f6f7f9; }
    header { background: #1f2937; color: white; padding: 20px 28px; }
    main { max-width: 1180px; margin: 0 auto; padding: 24px; }
    h1, h2 { margin: 0 0 12px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .card { background: white; border: 1px solid #d9dee7; border-radius: 8px; padding: 16px; }
    .metric { font-size: 24px; font-weight: 700; line-height: 1.1; word-break: break-word; }
    .muted { color: #5f6b7a; font-size: 13px; }
    .source-note { margin-top: 8px; font-size: 13px; color: #d7e8ff; }
    .section-help { margin: -6px 0 12px; color: #5f6b7a; font-size: 13px; max-width: 920px; }
    .table-shell { border: 1px solid #d9dee7; border-radius: 10px; overflow: hidden; background: white; margin-bottom: 24px; }
    .table-toolbar { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; align-items: flex-start; padding: 12px 14px; border-bottom: 1px solid #e7ebf0; background: #f8fafc; }
    .table-toolbar-title h3 { margin: 0; font-size: 15px; color: #202124; }
    .table-summary { margin-top: 4px; font-size: 12px; color: #5f6b7a; }
    .table-controls { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; }
    .table-control { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #5f6b7a; }
    .table-control input,
    .table-control select { min-width: 150px; border: 1px solid #9aa7b6; border-radius: 6px; padding: 8px 10px; background: white; color: #202124; font: inherit; }
    .table-wrap { width: 100%; overflow-x: auto; }
    .empty-state { color: #5f6b7a; font-style: italic; }
    .dashboard-section[hidden],
    .app-drilldown-card[hidden] { display: none !important; }
    .severity-blocker { color: #991b1b; font-weight: 700; }
    .severity-warning { color: #92400e; font-weight: 700; }
    .severity-info { color: #1d4ed8; font-weight: 700; }
    .toolbar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin: 18px 0 0; }
    .toolbar .muted { margin-right: 4px; }
    select { min-width: 220px; border: 1px solid #9aa7b6; border-radius: 6px; padding: 8px 10px; background: white; color: #202124; }
    .scope-summary { margin-top: 10px; font-size: 13px; color: #d7e8ff; }
    table { width: max-content; min-width: 100%; border-collapse: collapse; background: white; }
    th, td { text-align: left; border-bottom: 1px solid #e7ebf0; padding: 9px 10px; font-size: 13px; vertical-align: top; word-break: break-word; }
    th { white-space: nowrap; word-break: normal; }
    th { background: #eef2f7; position: sticky; top: 0; z-index: 1; }
    .table-pagination { display: flex; justify-content: space-between; gap: 12px; align-items: center; padding: 10px 14px; border-top: 1px solid #e7ebf0; background: #fff; }
    .table-pagination-summary { font-size: 12px; color: #5f6b7a; }
    .table-pagination-controls { display: flex; gap: 8px; flex-wrap: wrap; }
    .table-pagination-controls button { border: 1px solid #9aa7b6; border-radius: 6px; padding: 7px 12px; background: white; color: #202124; font: inherit; cursor: pointer; }
    .table-pagination-controls button:disabled { opacity: 0.5; cursor: not-allowed; }
    code { background: #eef2f7; padding: 2px 5px; border-radius: 4px; }
    .live { display: inline-block; margin-top: 8px; font-size: 13px; color: #c7f9cc; }
    .app-drilldown-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
    .app-drilldown-card { border: 1px solid #d9dee7; border-radius: 8px; padding: 16px; background: white; }
    .app-drilldown-card h3 { margin: 0 0 8px; }
    .app-drilldown-card .metric { font-size: 24px; }
    .app-drilldown-meta { display: grid; gap: 8px; margin-top: 12px; }
    .app-drilldown-meta span { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; color: #52606d; }
    .pill { display: inline-block; margin-top: 10px; padding: 4px 8px; border-radius: 999px; background: #e8f1f8; color: #334e68; font-size: 12px; font-weight: 700; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(dashboardTitle)}</h1>
    <div>Generated at ${escapeHtml(technical.generated_at || new Date().toISOString())}</div>
    <div class="live">Live endpoint: <code>/__kvdf/api/state</code> · Task tracker: <code>/__kvdf/api/tasks</code> · Agile: <code>/__kvdf/api/agile</code> · Reports: <code>/__kvdf/api/reports</code> · <span id="live-status">checking...</span></div>
    <div class="source-note">Derived view; .kabeeri is the source of truth.</div>
    <div class="source-note">Stale data policy: poll the live API and keep static exports readable.</div>
    <div class="source-note">Framework-owner view: platform health, governance, evolution, runtime contracts, plugins, and shared workspace state. App-track dashboards use the app route and stay separate by default.</div>
    <div class="source-note">Workspace mode: ${escapeHtml(dashboardUxGovernance.workspace_strategy && dashboardUxGovernance.workspace_strategy.current_workspace_mode ? dashboardUxGovernance.workspace_strategy.current_workspace_mode : "workspace")}</div>
    <div class="source-note">Evolution closeout: <strong>${escapeHtml(evolutionCloseoutBadge)}</strong></div>
    <div class="source-note">Planner: <strong>${escapeHtml(plannerState.available ? `${plannerState.current_planner_mode || "unknown"} / ${plannerState.delivery_mode || "unknown"}` : "missing")}</strong></div>
    <div class="toolbar">
      <span class="muted"><strong>Dashboard Controls</strong></span>
      <label for="app-filter">App</label>
      <select id="app-filter">
        <option value="">All apps in this KVDF workspace</option>
        ${appSummaries.map((appItem) => `<option value="${escapeHtml(appItem.username)}">${escapeHtml(appItem.name || appItem.username)} (${escapeHtml(appItem.username)})</option>`).join("")}
      </select>
      <label for="role-filter">Role</label>
      <select id="role-filter">
        <option value="">All role guidance</option>
        ${(dashboardUxGovernance.role_views || []).map((roleItem) => `<option value="${escapeHtml(roleItem.role)}">${escapeHtml(roleItem.role)}</option>`).join("")}
      </select>
      <label for="view-preset">Saved view</label>
      <select id="view-preset">
        <option value="overview">Overview</option>
        <option value="owner-review">Owner review</option>
        <option value="developer-execution">Developer execution</option>
        <option value="qa-review">QA review</option>
        <option value="client-view">Client view</option>
        <option value="ai-agent">AI agent scope</option>
        <option value="custom">Custom selection</option>
      </select>
      <span class="muted">Same-product apps share this workspace. Separate products should be linked as KVDF workspaces or served on their own port.</span>
    </div>
    <div class="scope-summary" id="scope-summary">Current view: Overview</div>
  </header>
  <main>
    ${renderPlannerDashboardSection(plannerState, { label: "Planner / Pipeline", emptyMessage: "No planner runtime state yet. The owner dashboard stays safe when planner state is missing." })}
    <section class="grid">
      ${metricCard("Tasks", tasks.length)}
      ${metricCard("Verified", business.verified_tasks || 0)}
      ${metricCard("Active Tokens", tokens.filter((item) => item.status === "active").length)}
      ${metricCard("Active Locks", locks.filter((item) => item.status === "active").length)}
      ${metricCard("Policy Blocks", policyResults.filter((item) => item.status === "blocked").length)}
      ${metricCard("Context Packs", contextPacks.length)}
      ${metricCard("Preflight Approvals", preflights.filter((item) => item.approval_required).length)}
      ${metricCard("Handoff Packages", handoffPackages.length)}
      ${metricCard("Security Blocks", securityScans.filter((item) => item.status === "blocked").length)}
      ${metricCard("Migration Blocks", migrationChecks.filter((item) => item.status === "blocked").length)}
      ${metricCard("Vibe Suggestions", vibeSuggestions.length)}
      ${metricCard("Vibe Sessions", vibeSessions.length)}
      ${metricCard("Agile Stories", (agileState.stories || []).length)}
      ${metricCard("Ready Stories", (agileState.stories || []).filter((item) => item.ready_status === "ready").length)}
      ${metricCard("Structured Reqs", (structuredState.requirements || []).length)}
      ${metricCard("ADRs", adrRecords.length)}
      ${metricCard("AI Runs", aiRuns.length)}
      ${metricCard("Unreviewed Runs", aiRunReport.totals.unreviewed || 0)}
      ${metricCard("Composed Prompts", promptCompositions.length)}
      ${metricCard("AI Tokens", usage.total_tokens)}
      ${metricCard("AI Cost", `${usage.total_cost} ${usage.currency}`)}
      ${metricCard("Apps", appSummaries.length)}
      ${metricCard("Workstreams", workstreamSummaries.length)}
      ${metricCard("KVDF Workspaces", workspaceSummaries.length || 1)}
    </section>
    <section class="dashboard-section" data-roles="all_roles">
      <h2>App Drilldown</h2>
      <p class="section-help">Use the app filter to focus on one product app. Each card keeps the app summary, linked work, and basic delivery health visible without leaving the dashboard.</p>
      <div class="app-drilldown-grid">
        ${renderAppDrilldownCards(appSummaries)}
      </div>
    </section>
    <section class="dashboard-section" data-roles="all_roles">
      <h2>Task Tracker Live Board</h2>
      <p class="section-help">This board shows the current owner-track task analysis only. App-track tasks stay on the app dashboard unless linked summaries are explicitly requested. Completed milestone slices auto-close when the last linked task is archived.</p>
      ${htmlTable(["Task", "Title", "Status", "Workstream"], tasks.map((item) => [
        item.id,
        item.title,
        item.status || "",
        item.workstream || ""
      ]))}
    </section>
    <section class="dashboard-section" data-roles="all_roles">
      <h2>Feature Readiness</h2>
      ${htmlTable(["Feature", "Title", "Readiness"], features.map((item) => [
        item.id,
        item.title,
        item.readiness || ""
      ]))}
    </section>
    <section class="dashboard-section" data-roles="all_roles">
      <h2>User Journeys</h2>
      ${htmlTable(["Journey", "Name", "Status"], journeys.map((item) => [
        item.id,
        item.name,
        item.status || ""
      ]))}
    </section>
    <section class="dashboard-section" data-roles="owner,maintainer">
      <h2>Dashboard UX Governance</h2>
      <p class="section-help">This section documents the role visibility map, widget registry, live-state rules, and responsive controls that keep the dashboard understandable.</p>
      ${htmlTable(["Role", "Visibility", "Widgets", "Actions"], (dashboardUxGovernance.role_views || []).map((item) => [
        item.role,
        item.visibility,
        (item.widgets || []).join(", "),
        (item.actions || []).join(", ")
      ]))}
      <p class="section-help"><strong>Widget Registry</strong> keeps dashboard surfaces explicit rather than implied.</p>
    </section>
    <section class="dashboard-section" data-roles="owner,maintainer">
      <h2>Role Visibility</h2>
      <p class="section-help">Role Visibility spells out what Owner, AI Agent, and reviewer roles can see so the dashboard stays predictable under mixed access.</p>
      ${htmlTable(["Role", "Visible Widgets", "Notes"], (dashboardUxGovernance.role_views || []).map((item) => [
        item.role,
        (item.widgets || []).join(", "),
        item.visibility || ""
      ]))}
    </section>
    <section class="dashboard-section" data-roles="owner,maintainer,developer,ai_agent">
      <h2>App Boundary Governance</h2>
      <p class="section-help">Same-product apps stay inside the current KVDF workspace; linked KVDF workspaces are summarized separately and never merged into source truth.</p>
      <p class="section-help">Project scope: <code>${escapeHtml(project.project_scope || "single_product_multi_app")}</code>; current track: <code>framework_owner</code></p>
      <p class="section-help">Owner analysis stays on this dashboard. App-track analysis stays on the app dashboard unless linked workspace summaries are explicitly enabled.</p>
    </section>
    <section class="dashboard-section" data-roles="owner,maintainer,developer,ai_agent">
      <h2>AI Usage by Task</h2>
      <p class="section-help">Tracked vs Untracked AI Usage keeps task-linked cost visible while still exposing administrative or planning operations.</p>
      ${htmlTable(["Scope", "Events", "Tokens", "Cost"], [
        ["Tracked AI Usage", technical.ai_usage && technical.ai_usage.tracked_vs_untracked ? technical.ai_usage.tracked_vs_untracked.tracked.events || 0 : 0, technical.ai_usage && technical.ai_usage.tracked_vs_untracked ? technical.ai_usage.tracked_vs_untracked.tracked.tokens || 0 : 0, technical.ai_usage && technical.ai_usage.tracked_vs_untracked ? technical.ai_usage.tracked_vs_untracked.tracked.cost || 0 : 0],
        ["Untracked AI Usage", technical.ai_usage && technical.ai_usage.tracked_vs_untracked ? technical.ai_usage.tracked_vs_untracked.untracked.events || 0 : 0, technical.ai_usage && technical.ai_usage.tracked_vs_untracked ? technical.ai_usage.tracked_vs_untracked.untracked.tokens || 0 : 0, technical.ai_usage && technical.ai_usage.tracked_vs_untracked ? technical.ai_usage.tracked_vs_untracked.untracked.cost || 0 : 0]
      ])}
      ${htmlTable(["Task", "Events", "Tokens", "Cost"], Object.entries((technical.ai_usage && technical.ai_usage.by_task) || {}).map(([taskId, item]) => [
        taskId,
        item.events || 0,
        item.tokens || 0,
        item.cost || 0
      ]))}
    </section>
    <section class="dashboard-section" data-roles="owner,maintainer,developer,ai_agent">
      <h2>Cost Preflights</h2>
      ${htmlTable(["Preflight", "Task", "Model", "Approval", "Estimated Cost"], preflights.map((item) => [
        item.preflight_id,
        item.task_id || "",
        [item.provider, item.model].filter(Boolean).join("/"),
        item.approval_required ? "required" : "not required",
        item.estimated_cost || item.cost || 0
      ]))}
    </section>
    <section class="dashboard-section" data-roles="owner,maintainer,developer">
      <h2>Developer Mode</h2>
      ${htmlTable(["Mode", "Solo Developer", "Workstreams"], [[
        developerModeValue(technical.developer_mode, "mode") || "unset",
        developerModeValue(technical.developer_mode, "solo_developer_id") || "",
        (developerModeValue(technical.developer_mode, "workstreams") || []).join(", ")
      ]])}
    </section>
    <section class="dashboard-section" data-roles="owner,maintainer,developer,qa">
      <h2>Agile Backlog and Stories</h2>
      <p class="section-help">Agile Backlog and Stories are summarized here so the dashboard can show whether the current workspace is ready for iterative execution.</p>
      ${htmlTable(["Metric", "Value"], [
        ["Backlog Items", agileState.summary ? agileState.summary.backlog_items || 0 : 0],
        ["Stories", agileState.summary ? agileState.summary.stories || 0 : 0],
        ["Ready Stories", agileState.summary ? agileState.summary.ready_stories || 0 : 0],
        ["Open Impediments", agileState.summary ? agileState.summary.open_impediments || 0 : 0],
        ["Health", agileState.summary ? agileState.summary.health || "unknown" : "unknown"]
      ])}
    </section>
    <section class="dashboard-section" data-roles="owner,maintainer,qa">
      <h2>Structured Delivery</h2>
      <p class="section-help">Structured Delivery tracks requirements, phases, gates, and traceability for larger or higher-risk work. Live JSON: <code>/__kvdf/api/structured</code></p>
      ${htmlTable(["Metric", "Value"], [
        ["Requirements", structuredState.summary ? structuredState.summary.requirements || 0 : 0],
        ["Approved Requirements", structuredState.summary ? structuredState.summary.approved_requirements || 0 : 0],
        ["Phases", structuredState.summary ? structuredState.summary.phases || 0 : 0],
        ["Blocked Gates", structuredState.summary ? structuredState.summary.blocked_gates || 0 : 0],
        ["Health", structuredState.summary ? structuredState.summary.health || "unknown" : "unknown"]
      ])}
    </section>
    <section class="dashboard-section" data-roles="owner,maintainer,qa">
      <h2>Governance Visibility</h2>
      <p class="section-help">Policy Results, Security Scans, and Migration Safety stay visible here so blockers are obvious before release or merge actions.</p>
    </section>
    <section class="dashboard-section" data-roles="owner,maintainer,developer,ai_agent">
      <h2>Workstream Governance</h2>
      <p class="section-help">This workspace keeps related work in explicit workstreams so execution, review, and AI usage stay scoped.</p>
      ${htmlTable(["Workstream", "Status", "Tasks", "Open Tasks", "Active Sessions", "AI Usage"], workstreamSummaries.map((item) => [
        item.name || item.id,
        item.status || "active",
        item.tasks_total || 0,
        item.open_tasks || 0,
        item.active_sessions || 0,
        `${(item.ai_usage && item.ai_usage.tokens) || 0} tokens / ${(item.ai_usage && item.ai_usage.cost) || 0}`
      ]))}
    </section>
    <section class="dashboard-section" data-roles="all_roles">
      <h2>Action Center</h2>
      ${htmlTable(["Severity", "Area", "Message", "Next Action"], dashboardActionItems.map((item) => [item.severity, item.area, item.message, item.next_action]), { trustedHtmlColumns: [0] })}
    </section>
    <section class="dashboard-section" data-roles="owner,maintainer,developer,ai_agent">
      <h2>Vibe-first Suggestions</h2>
      ${htmlTable(["Suggestion", "Title", "Workstream", "Risk", "Status"], vibeSuggestions.map((item) => [
        item.suggestion_id,
        item.title,
        item.workstream || "",
        item.risk_level || "",
        item.status || ""
      ]))}
    </section>
    <section class="dashboard-section" data-roles="owner,maintainer,developer">
      <h2>Post-work Captures</h2>
      ${htmlTable(["Capture", "Task", "Classification", "Summary"], vibeCaptures.map((item) => [
        item.capture_id,
        item.task_id || "",
        item.classification || "",
        item.summary || ""
      ]))}
    </section>
    <section class="dashboard-section" data-roles="owner,maintainer,developer,ai_agent">
      <h2>Vibe Sessions and Briefs</h2>
      ${htmlTable(["Type", "ID", "Title", "Status"], [
        ...vibeSessions.map((item) => ["Session", item.session_id, item.title || "", item.status || ""]),
        ...contextBriefs.map((item) => ["Brief", item.brief_id, item.title || item.summary || "", item.status || ""])
      ])}
    </section>
    <section class="dashboard-section" data-roles="owner,maintainer,qa">
      <h2>Live Reports</h2>
      ${renderLiveReportsDashboard(liveReports)}
    </section>
  </main>
  <script>
  (function () {
    var storage = null;
    try {
      storage = window.localStorage;
    } catch (error) {
      storage = null;
    }
    var roleFilter = document.getElementById("role-filter");
    var appFilter = document.getElementById("app-filter");
    var viewPreset = document.getElementById("view-preset");
    var scopeSummary = document.getElementById("scope-summary");
    var sections = Array.prototype.slice.call(document.querySelectorAll(".dashboard-section[data-roles]"));
    var appCards = Array.prototype.slice.call(document.querySelectorAll("[data-app-summary]"));
    var presetMap = {
      overview: { app: "", role: "" },
      "owner-review": { app: "", role: "Owner" },
      "developer-execution": { app: "", role: "Developer" },
      "qa-review": { app: "", role: "QA Reviewer" },
      "client-view": { app: "", role: "Client Viewer" },
      "ai-agent": { app: "", role: "AI Agent" },
      custom: { app: "", role: "" }
    };
    function normalize(value) {
      return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
    }
    function normalizeView(value) {
      return String(value || "overview").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
    function getStored(key) {
      return storage ? storage.getItem(key) || "" : "";
    }
    function setStored(key, value) {
      if (storage) storage.setItem(key, value || "");
    }
    function updateSummary() {
      var parts = ["Current view: " + (viewPreset.options[viewPreset.selectedIndex] ? viewPreset.options[viewPreset.selectedIndex].text : "Overview")];
      if (appFilter.value) parts.push("App: " + (appFilter.options[appFilter.selectedIndex] ? appFilter.options[appFilter.selectedIndex].text : appFilter.value));
      if (roleFilter.value) parts.push("Role: " + roleFilter.value);
      if (scopeSummary) scopeSummary.textContent = parts.join(" · ");
    }
    function applyFilters() {
      var selectedApp = normalize(appFilter.value);
      var selectedRole = normalize(roleFilter.value);
      sections.forEach(function (section) {
        var allowedRoles = String(section.getAttribute("data-roles") || "")
          .split(",")
          .map(function (item) { return normalize(item.trim()); })
          .filter(Boolean);
        var visible = !selectedRole || allowedRoles.indexOf("all_roles") !== -1 || allowedRoles.indexOf(selectedRole) !== -1 || (selectedRole === "qa_reviewer" && allowedRoles.indexOf("qa") !== -1);
        section.hidden = !visible;
      });
      appCards.forEach(function (card) {
        var apps = String(card.getAttribute("data-apps") || "")
          .split(",")
          .map(function (item) { return normalize(item.trim()); })
          .filter(Boolean);
        card.hidden = Boolean(selectedApp) && apps.indexOf(selectedApp) === -1;
      });
      updateSummary();
      setStored("kvdf.dashboard.app", appFilter.value || "");
      setStored("kvdf.dashboard.role", roleFilter.value || "");
      setStored("kvdf.dashboard.view", viewPreset.value || "overview");
    }
    function applyPreset(presetKey) {
      var preset = presetMap[presetKey] || presetMap.overview;
      if (presetKey === "custom") {
        appFilter.value = getStored("kvdf.dashboard.app");
        roleFilter.value = getStored("kvdf.dashboard.role");
      } else {
        appFilter.value = preset.app || "";
        roleFilter.value = preset.role || "";
      }
      viewPreset.value = presetKey;
      applyFilters();
    }
    var storedView = normalizeView(getStored("kvdf.dashboard.view", "overview"));
    var storedApp = getStored("kvdf.dashboard.app");
    var storedRole = getStored("kvdf.dashboard.role");
    if (storedApp) appFilter.value = storedApp;
    if (storedRole) roleFilter.value = storedRole;
    if (viewPreset.querySelector('option[value="' + storedView + '"]')) {
      if (storedView === "custom") {
        viewPreset.value = "custom";
      } else {
        applyPreset(storedView);
      }
    } else {
      applyPreset("overview");
    }
    appFilter.addEventListener("change", function () {
      viewPreset.value = "custom";
      applyFilters();
    });
    roleFilter.addEventListener("change", function () {
      viewPreset.value = "custom";
      applyFilters();
    });
    viewPreset.addEventListener("change", function () {
      applyPreset(viewPreset.value);
    });
    var liveStatus = document.getElementById("live-status");
    if (liveStatus) liveStatus.textContent = "static export";
    applyFilters();
  })();
  </script>
  ${buildTableEnhancementScript()}
</body>
</html>
`;
}

function renderLiveReportsDashboard(liveReports) {
  if (!liveReports || !liveReports.summary) {
    return `<p class="empty-state">No live reports state yet. Run <code>kvdf reports live</code> to generate <code>.kabeeri/reports/live_reports_state.json</code>.</p>`;
  }
  const summary = liveReports.summary || {};
  const actionItems = liveReports.action_items || [];
  return `
    <section class="grid">
      ${metricCard("Status", summary.status || "unknown")}
      ${metricCard("Readiness", summary.readiness || "unknown")}
      ${metricCard("Governance", summary.governance || "unknown")}
      ${metricCard("Package", summary.package || "unknown")}
      ${metricCard("Security", summary.security || "unknown")}
      ${metricCard("Migration", summary.migration || "unknown")}
    </section>
    <p>Live JSON: <code>${escapeHtml(liveReports.live_json_path || ".kabeeri/reports/live_reports_state.json")}</code></p>
    ${htmlTable(["Severity", "Area", "Message", "Next Action"], actionItems.map((item) => [item.severity, item.area, item.message, item.next_action]))}
  `;
}

function renderAppDrilldownCards(appSummaries) {
  if (!appSummaries.length) {
    return `<div class="app-drilldown-card"><h3>No apps yet</h3><p class="section-help">Create a customer app to see app-level drilldowns, linked work, and delivery health here.</p></div>`;
  }
  return appSummaries.map((appItem) => {
    const appLabel = appItem.name || appItem.username;
    const appTokens = Number((appItem.ai_usage && appItem.ai_usage.tokens) || 0);
    const appCost = Number((appItem.ai_usage && appItem.ai_usage.cost) || 0);
    return `
      <article class="app-drilldown-card" data-app-summary data-apps="${escapeHtml(appItem.username)}">
        <h3>${escapeHtml(appLabel)}</h3>
        <div class="pill">${escapeHtml(appItem.status || "draft")}</div>
        <div class="app-drilldown-meta">
          <span><strong>Username</strong><span>${escapeHtml(appItem.username)}</span></span>
          <span><strong>Tasks</strong><span>${escapeHtml(appItem.tasks_total || 0)}</span></span>
          <span><strong>Features</strong><span>${escapeHtml(appItem.features_total || 0)}</span></span>
          <span><strong>Journeys</strong><span>${escapeHtml(appItem.journeys_total || 0)}</span></span>
          <span><strong>AI Tokens</strong><span>${escapeHtml(appTokens)}</span></span>
          <span><strong>AI Cost</strong><span>${escapeHtml(appCost)}</span></span>
        </div>
        <p class="section-help">Public route: <code>${escapeHtml(appItem.public_url || "")}</code></p>
      </article>
    `;
  }).join("");
}

function buildEvolutionCloseoutBadge(closeoutState, autoClosedTotal) {
  const total = Number(autoClosedTotal || 0);
  const state = String(closeoutState || "").trim().toLowerCase();
  if (state === "auto-archived") return total === 1 ? "Auto-archived milestone" : `Auto-archived milestones (${total})`;
  if (state === "awaiting_archive") return "Milestone awaiting archive";
  if (state === "active") return "Milestone active";
  return "No active evolution";
}

function renderPlannerDashboardSection(plannerState = null, options = {}) {
  const label = options.label || "Planner / Pipeline";
  const emptyMessage = options.emptyMessage || "No planner runtime state yet. Run `kvdf planner propose --goal \"...\" --track owner|vibe|plugin --json` to create a plan.";
  if (!plannerState || !plannerState.available) {
    return `
      <section class="section">
        <h2>${escapeHtml(label)}</h2>
        <p class="section-help">${escapeHtml(emptyMessage)}</p>
      </section>
    `;
  }
  const sourceControl = plannerState.source_control || {};
  const currentPlan = plannerState.current_plan || {};
  const pipeline = plannerState.pipeline || {};
  const visual = plannerState.visual || {};
  const materialization = plannerState.materialization || {};
  const versionPlan = plannerState.version_plan || {};
  const taskPunch = plannerState.task_punch || {};
  const guidance = plannerState.guidance || {};
  const notes = Array.isArray(guidance.notes) ? guidance.notes : [];
  return `
    <section class="section">
      <h2>${escapeHtml(label)}</h2>
      <p class="section-help">${escapeHtml(guidance.summary || "Planner state is available for the current workspace.")}</p>
      ${htmlTable(["Field", "Value"], [
        ["Current plan", plannerState.current_plan_id || ""],
        ["Planner mode", plannerState.current_planner_mode || ""],
        ["Track", plannerState.track || ""],
        ["Delivery mode", plannerState.delivery_mode || ""],
        ["Source control", [
          sourceControl.enabled ? "enabled" : "disabled",
          sourceControl.provider || "none",
          sourceControl.remote_provider || "none",
          sourceControl.mode || "none"
        ].join(" / ")],
        ["Version plan", `${versionPlan.available ? versionPlan.versions_total || 0 : 0} version(s)`],
        ["Materialization", materialization.status || "unknown"],
        ["Task punch", `${taskPunch.available ? taskPunch.task_count || 0 : 0} task(s)`],
        ["Next evolution", plannerState.next_evolution && plannerState.next_evolution.title ? plannerState.next_evolution.title : ""],
        ["Next action", plannerState.next_action || ""]
      ])}
      <p class="section-help"><strong>Current plan</strong>: ${escapeHtml(currentPlan.goal || currentPlan.title || "none")}</p>
      <p class="section-help"><strong>Pipeline</strong>: ${escapeHtml(pipeline.available ? `${pipeline.documentation_files_total || 0} docs, ${pipeline.versions_total || 0} versions, ${pipeline.evolutions_total || 0} evolutions` : "not available")}</p>
      <p class="section-help"><strong>Visual</strong>: ${escapeHtml(visual.available ? `${visual.graph_format || "mermaid"}, ${visual.board_columns || 0} board columns, ${visual.scope_allowed_total || 0} allowed files, ${visual.scope_forbidden_total || 0} forbidden files` : "not available")}</p>
      <p class="section-help"><strong>Task punch IDs</strong>: ${escapeHtml((taskPunch.task_ids || []).join(", ") || "none")}</p>
      <p class="section-help"><strong>Guidance</strong>: ${escapeHtml(guidance.summary || "")}</p>
      ${notes.length ? `<ul>${notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>` : ""}
    </section>
  `;
}

function metricCard(label, value) {
  return `<div class="card"><div>${escapeHtml(label)}</div><div class="metric">${escapeHtml(value)}</div></div>`;
}

function developerModeValue(developerMode, key) {
  if (!developerMode || typeof developerMode !== "object") return key === "workstreams" ? [] : "";
  if (key === "workstreams") return Array.isArray(developerMode.workstreams) ? developerMode.workstreams : [];
  return developerMode[key];
}

function tableShellMarkup(title, headers, rows, options = {}) {
  const trusted = new Set(options.trustedHtmlColumns || []);
  const normalizedRows = Array.isArray(rows) ? rows : [];
  const totalRows = normalizedRows.length;
  const titleMarkup = title ? `<h3>${escapeHtml(title)}</h3>` : "";
  const tableRows = totalRows
    ? normalizedRows.map((row) => `<tr data-kvdf-table-row>${headers.map((_, index) => `<td>${trusted.has(index) ? String(row[index] || "") : escapeHtml(row[index] || "")}</td>`).join("")}</tr>`).join("")
    : `<tr data-kvdf-table-empty><td class="empty-state" colspan="${headers.length}">${escapeHtml(options.emptyState || "No records")}</td></tr>`;
  return `
    <div class="table-shell" data-kvdf-table-shell>
      <div class="table-toolbar">
        <div class="table-toolbar-title">
          ${titleMarkup}
          <div class="table-summary" data-table-summary>${escapeHtml(totalRows ? `${totalRows} row${totalRows === 1 ? "" : "s"}` : options.emptyState || "No records")}</div>
        </div>
        <div class="table-controls">
          <label class="table-control">
            <span>Search</span>
            <input type="search" data-table-search placeholder="Filter rows">
          </label>
          <label class="table-control">
            <span>Rows shown</span>
            <select data-table-page-size>
              <option value="5">5</option>
              <option value="10" selected>10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="all">All</option>
            </select>
          </label>
        </div>
      </div>
      <div class="table-wrap">
        <table data-kvdf-table>
          <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      <div class="table-pagination">
        <div class="table-pagination-summary" data-table-page-summary>Showing all rows</div>
        <div class="table-pagination-controls">
          <button type="button" data-table-prev>Previous</button>
          <button type="button" data-table-next>Next</button>
        </div>
      </div>
    </div>
  `;
}

function htmlTable(headers, rows, options = {}) {
  return tableShellMarkup(options.title || "", headers, rows, options);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function exportCustomerAppPages() {
  const apps = fileExists(".kabeeri/customer_apps.json") ? readJsonFile(".kabeeri/customer_apps.json").apps || [] : [];
  for (const appItem of apps) {
    writeTextFile(`.kabeeri/site/customer/apps/${appItem.username}/index.html`, buildCustomerAppHtml(appItem));
  }
}

function publicCustomerAppUrl(username) {
  return `/customer/apps/${encodeURIComponent(username)}`;
}

function readAiRuns() {
  const fs = require("fs");
  const file = path.join(repoRoot(), ".kabeeri", "ai_runs", "prompt_runs.jsonl");
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function buildAiRunHistoryReport() {
  const runs = readAiRuns();
  return {
    totals: {
      runs: runs.length,
      unreviewed: runs.filter((item) => item.status !== "reviewed").length
    },
    waste_signals: runs.filter((item) => Number(item.tokens || 0) > 0 && item.status !== "reviewed").map((item) => ({ run_id: item.run_id, reason: "unreviewed run" }))
  };
}

function buildSeparatedDashboardHtml(options = {}) {
  const state = collectDashboardStateForCurrentTrack(options);
  return renderDashboardProductHtml(state, options);
}

function renderDashboardProductHtml(state = {}, options = {}) {
  const isOwner = state.dashboard_type === "owner";
  const title = state.title || (isOwner ? "KVDF Owner Dashboard" : "KVDF Viber Dashboard");
  const header = state.subtitle || (isOwner ? "Owner Track / KVDF Core" : "Viber/App Track");
  const plannerMode = state.planner && state.planner.current_planner_mode ? state.planner.current_planner_mode : "missing";
  const deliveryMode = state.planner && state.planner.delivery_mode ? state.planner.delivery_mode : "unknown";
  const sections = Object.values(state.sections || {});
  const uiAssets = buildUiAssetMarkup(options);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
${indentHtmlBlock(uiAssets, 2)}
  <style>
    body { margin: 0; font-family: Arial, sans-serif; color: #1f2933; background: linear-gradient(180deg, #f7f8fb 0%, #eef2f7 100%); }
    header { background: ${isOwner ? "linear-gradient(135deg, #1f2937, #334155)" : "linear-gradient(135deg, #0f766e, #134e4a)"}; color: white; padding: 28px; }
    main { max-width: 1180px; margin: 0 auto; padding: 24px; }
    h1, h2, h3 { margin: 0 0 12px; }
    p { margin: 0 0 12px; }
    .subtle { color: ${isOwner ? "#d8e1ea" : "#d7e8e4"}; }
    .meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .pill { display: inline-flex; align-items: center; border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 700; background: rgba(255,255,255,0.16); }
    .section { background: white; border: 1px solid #d9dee7; border-radius: 12px; padding: 18px; margin-bottom: 18px; }
    .widget-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin: 12px 0 16px; }
    .widget { display: flex; flex-direction: column; gap: 6px; min-height: 122px; border: 1px solid #e7ebf0; border-radius: 10px; padding: 12px 14px; background: #fbfcfe; }
    .widget-title { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #52606d; margin-bottom: 0; }
    .widget-value { font-size: 15px; line-height: 1.45; font-weight: 700; color: #0f172a; word-break: break-word; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
    .widget--metric .widget-value { font-size: 30px; line-height: 1.05; }
    .widget--status .widget-value { font-size: 16px; }
    .widget--action { min-height: 148px; }
    .widget--action .widget-value { font-size: 13px; line-height: 1.5; font-weight: 600; -webkit-line-clamp: 5; }
    .widget-note { font-size: 11px; color: #52606d; margin-top: auto; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .widget-status { display: inline-block; margin-top: 8px; font-size: 12px; border-radius: 999px; padding: 3px 8px; background: #e8f1f8; color: #334e68; }
    .widget-status.warning { background: #fff4d6; color: #8a5b00; }
    .widget-status.blocked { background: #fde2e1; color: #9b1c1c; }
    .table-shell { border: 1px solid #d9dee7; border-radius: 12px; overflow: hidden; background: white; margin-top: 12px; }
    .table-toolbar { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; align-items: flex-start; padding: 12px 14px; border-bottom: 1px solid #e7ebf0; background: #f8fafc; }
    .table-toolbar-title h3 { margin: 0; font-size: 15px; }
    .table-summary { margin-top: 4px; font-size: 12px; color: #5f6b7a; }
    .table-controls { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; }
    .table-control { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #52606d; }
    .table-control input,
    .table-control select { min-width: 150px; border: 1px solid #cdd6e0; border-radius: 8px; padding: 8px 10px; background: white; font: inherit; color: #1f2933; }
    .table-wrap { width: 100%; overflow-x: auto; }
    table { width: max-content; min-width: 100%; border-collapse: collapse; }
    th, td { text-align: left; border-bottom: 1px solid #e7ebf0; padding: 9px 10px; font-size: 13px; vertical-align: top; word-break: break-word; }
    th { white-space: nowrap; word-break: normal; }
    th { background: #eef2f7; position: sticky; top: 0; z-index: 1; }
    .table-pagination { display: flex; justify-content: space-between; gap: 12px; align-items: center; padding: 10px 14px; border-top: 1px solid #e7ebf0; background: #fff; }
    .table-pagination-summary { font-size: 12px; color: #5f6b7a; }
    .table-pagination-controls { display: flex; gap: 8px; flex-wrap: wrap; }
    .table-pagination-controls button { border: 1px solid #cdd6e0; border-radius: 8px; padding: 7px 12px; background: #fff; color: #1f2933; font: inherit; cursor: pointer; }
    .table-pagination-controls button:disabled { opacity: 0.5; cursor: not-allowed; }
    .empty-state { color: #5f6b7a; font-style: italic; }
    .section-help { color: #5f6b7a; font-size: 13px; margin-top: 4px; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(title)}</h1>
    <p class="subtle">${escapeHtml(header)}</p>
    <div class="meta">
      <span class="pill">Planner: ${escapeHtml(plannerMode)} / ${escapeHtml(deliveryMode)}</span>
      <span class="pill">Track: ${escapeHtml(state.track || "")}</span>
      <span class="pill">Next: ${escapeHtml(state.next_action || "")}</span>
    </div>
    ${state.blocked_cross_track_data && state.blocked_cross_track_data.length ? `<p class="subtle">Blocked cross-track data: ${escapeHtml(state.blocked_cross_track_data.join(", "))}</p>` : ""}
  </header>
  <main>
    ${sections.map((section) => renderDashboardSection(section)).join("")}
  </main>
  ${buildTableEnhancementScript()}
</body>
</html>
`;
}

function renderDashboardSection(section = {}) {
  const widgets = Array.isArray(section.widgets) ? section.widgets : [];
  const tables = Array.isArray(section.tables) ? section.tables : [];
  return `
    <section class="section">
      <h2>${escapeHtml(section.title || section.id || "")}</h2>
      <div class="widget-grid">
        ${widgets.map((widget) => renderDashboardWidget(widget)).join("")}
      </div>
      ${tables.map((tableState) => renderDashboardTable(tableState)).join("")}
    </section>
  `;
}

function renderDashboardWidget(widget = {}) {
  const statusClass = widget.status === "warning" ? "warning" : widget.status === "blocked" ? "blocked" : "";
  const widgetTypeClass = widget.type ? ` widget--${escapeHtml(widget.type)}` : "";
  return `
    <article class="widget${widgetTypeClass}">
      <div class="widget-title">${escapeHtml(widget.title || widget.id || "")}</div>
      <div class="widget-value">${escapeHtml(widget.value ?? "")}</div>
      <div class="widget-status ${statusClass}">${escapeHtml(widget.status || "unknown")}</div>
      ${widget.next_action ? `<div class="widget-note">${escapeHtml(widget.next_action)}</div>` : ""}
    </article>
  `;
}

function renderDashboardTable(tableState = {}) {
  const columns = Array.isArray(tableState.columns) ? tableState.columns : [];
  const rows = Array.isArray(tableState.rows) ? tableState.rows : [];
  if (!columns.length) return "";
  return tableShellMarkup(tableState.title || tableState.id || "", columns, rows, {
    emptyState: tableState.empty_state || "No records"
  });
}

function buildTableEnhancementScript() {
  return `
  <script>
  (function () {
    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }
    function clampPage(page, totalPages) {
      if (!Number.isFinite(page) || page < 1) return 1;
      if (page > totalPages) return totalPages;
      return page;
    }
    function initShell(shell) {
      var table = shell.querySelector("table");
      var rows = table ? Array.prototype.slice.call(table.querySelectorAll("tbody tr[data-kvdf-table-row]")) : [];
      var search = shell.querySelector("[data-table-search]");
      var pageSizeSelect = shell.querySelector("[data-table-page-size]");
      var prevButton = shell.querySelector("[data-table-prev]");
      var nextButton = shell.querySelector("[data-table-next]");
      var summary = shell.querySelector("[data-table-summary]");
      var pageSummary = shell.querySelector("[data-table-page-summary]");
      var allRowsLabel = "all";
      var state = { query: "", page: 1, pageSize: rows.length > 10 ? 10 : "all" };
      var emptyRow = table ? table.querySelector("tbody tr[data-kvdf-table-empty]") : null;

      function getVisibleRows() {
        if (!rows.length) return [];
        if (!state.query) return rows.slice();
        return rows.filter(function (row) {
          return normalize(row.textContent).indexOf(state.query) !== -1;
        });
      }

      function getPageSize(total) {
        if (state.pageSize === allRowsLabel) return total || 1;
        var parsed = Number(state.pageSize || 10);
        if (!Number.isFinite(parsed) || parsed < 1) return 10;
        return parsed;
      }

      function update() {
        var visibleRows = getVisibleRows();
        var total = visibleRows.length;
        var pageSize = getPageSize(total);
        var totalPages = Math.max(1, Math.ceil(total / pageSize));
        state.page = clampPage(state.page, totalPages);
        var start = total ? (state.page - 1) * pageSize : 0;
        var end = total ? Math.min(start + pageSize, total) : 0;

        rows.forEach(function (row) { row.hidden = true; });
        if (emptyRow) emptyRow.hidden = total !== 0;
        visibleRows.forEach(function (row, index) {
          row.hidden = index < start || index >= end;
        });

        if (summary) {
          summary.textContent = total ? total + " row" + (total === 1 ? "" : "s") : "No records";
        }
        if (pageSummary) {
          pageSummary.textContent = total
            ? "Showing " + (start + 1) + "-" + end + " of " + total + " row" + (total === 1 ? "" : "s")
            : "No rows to show";
        }
        if (prevButton) prevButton.disabled = state.page <= 1 || total === 0;
        if (nextButton) nextButton.disabled = state.page >= totalPages || total === 0;
      }

      if (search) {
        search.addEventListener("input", function () {
          state.query = normalize(search.value);
          state.page = 1;
          update();
        });
      }
      if (pageSizeSelect) {
        pageSizeSelect.addEventListener("change", function () {
          state.pageSize = pageSizeSelect.value === allRowsLabel ? allRowsLabel : Number(pageSizeSelect.value);
          state.page = 1;
          update();
        });
        if (rows.length <= 10) {
          pageSizeSelect.value = allRowsLabel;
          state.pageSize = allRowsLabel;
        }
      }
      if (prevButton) {
        prevButton.addEventListener("click", function () {
          state.page = clampPage(state.page - 1, Math.max(1, Math.ceil(getVisibleRows().length / getPageSize(getVisibleRows().length))));
          update();
        });
      }
      if (nextButton) {
        nextButton.addEventListener("click", function () {
          state.page = state.page + 1;
          update();
        });
      }
      update();
    }
    Array.prototype.slice.call(document.querySelectorAll("[data-kvdf-table-shell]")).forEach(initShell);
  })();
  </script>
`;
}

function buildUiAssetMarkup(options = {}) {
  const selected = getOptionalUiAssets({
    ui_provider: options.ui_provider || options["ui-provider"] || options.provider,
    provider: options.provider,
    withBootstrap: options.withBootstrap || options["with-bootstrap"],
    with_bootstrap: options.with_bootstrap,
    noBootstrap: options.noBootstrap || options["no-bootstrap"],
    no_bootstrap: options.no_bootstrap
  });
  return buildOptionalAssetTags(selected, {
    ...options,
    document_path: resolveDashboardDocumentPath(options)
  });
}

function resolveDashboardDocumentPath(options = {}) {
  if (options["dashboard-output"]) return String(options["dashboard-output"]);
  if (options.output) return String(options.output);
  const scope = String(options.scope || "").trim().toLowerCase();
  if (scope === "owner" || scope === "viber") {
    return `.kabeeri/site/__kvdf/dashboard/${scope}.html`;
  }
  const project = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
  if (project.workspace_kind === "developer_app") {
    return ".kabeeri/site/__kvdf/dashboard/index.html";
  }
  return ".kabeeri/site/__kvdf/dashboard/index.html";
}

function indentHtmlBlock(value, spaces = 2) {
  const text = String(value || "").trim();
  if (!text) return "";
  const indent = " ".repeat(spaces);
  return text.split("\n").map((line) => `${indent}${line}`).join("\n");
}

module.exports = {
  buildClientHomeHtml,
  buildCustomerAppHtml,
  buildDashboardHtml: buildSeparatedDashboardHtml,
  renderLiveReportsDashboard,
  metricCard,
  htmlTable,
  escapeHtml,
  exportCustomerAppPages,
  buildAiRunHistoryReport
};
