const path = require("path");

const { readJsonFile } = require("../workspace");
const { fileExists, repoRoot, writeTextFile } = require("../fs_utils");
const { summarizeUsage } = require("./usage_pricing");
const { buildCustomerAppSummaries } = require("./dashboard_state");
const { buildDashboardActionItems } = require("./dashboard");
const { readStateArray } = require("../services/state_utils");

function buildClientHomeHtml() {
  const project = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
  const apps = fileExists(".kabeeri/customer_apps.json") ? readJsonFile(".kabeeri/customer_apps.json").apps || [] : [];
  const features = fileExists(".kabeeri/features.json") ? readJsonFile(".kabeeri/features.json").features || [] : [];
  const journeys = fileExists(".kabeeri/journeys.json") ? readJsonFile(".kabeeri/journeys.json").journeys || [] : [];
  const visibleFeatures = features.filter((item) => ["ready_to_demo", "ready_to_publish"].includes(item.readiness));
  const visibleJourneys = journeys.filter((item) => item.ready_to_show || item.status === "ready_to_show");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(project.name || "Kabeeri Client Portal")}</title>
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

function buildCustomerAppHtml(appItem) {
  const features = readStateArray(".kabeeri/features.json", "features");
  const journeys = readStateArray(".kabeeri/journeys.json", "journeys");
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const summary = buildCustomerAppSummaries([appItem], features, journeys, tasks, summarizeUsage())[0];
  const linkedFeatures = features.filter((featureItem) => (appItem.feature_ids || []).includes(featureItem.id));
  const linkedJourneys = journeys.filter((journeyItem) => (appItem.journey_ids || []).includes(journeyItem.id));
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(appItem.name)}</title>
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

function buildDashboardHtml() {
  const project = fileExists(".kabeeri/project.json") ? readJsonFile(".kabeeri/project.json") : {};
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
  <title>Kabeeri VDF Dashboard</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; color: #202124; background: #f6f7f9; }
    header { background: #1f2937; color: white; padding: 20px 28px; }
    main { max-width: 1180px; margin: 0 auto; padding: 24px; }
    h1, h2 { margin: 0 0 12px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .card { background: white; border: 1px solid #d9dee7; border-radius: 8px; padding: 16px; }
    .metric { font-size: 30px; font-weight: 700; }
    .muted { color: #5f6b7a; font-size: 13px; }
    .source-note { margin-top: 8px; font-size: 13px; color: #d7e8ff; }
    .section-help { margin: -6px 0 12px; color: #5f6b7a; font-size: 13px; max-width: 920px; }
    .table-wrap { width: 100%; overflow-x: auto; margin-bottom: 24px; }
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
    table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #d9dee7; margin-bottom: 24px; }
    th, td { text-align: left; border-bottom: 1px solid #e7ebf0; padding: 10px; font-size: 14px; }
    th { background: #eef2f7; }
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
    <h1>Kabeeri VDF Dashboard</h1>
    <div>Generated at ${escapeHtml(technical.generated_at || new Date().toISOString())}</div>
    <div class="live">Live endpoint: <code>/__kvdf/api/state</code> · Task tracker: <code>/__kvdf/api/tasks</code> · Agile: <code>/__kvdf/api/agile</code> · Reports: <code>/__kvdf/api/reports</code> · <span id="live-status">checking...</span></div>
    <div class="source-note">Derived view; .kabeeri is the source of truth.</div>
    <div class="source-note">Stale data policy: poll the live API and keep static exports readable.</div>
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
      <p class="section-help">Project scope: <code>${escapeHtml(project.project_scope || "single_product_multi_app")}</code>; app strategy: <code>same_product_multi_app</code></p>
      <p class="section-help">same-product apps and Linked KVDF workspaces are visible together so boundaries stay obvious during review.</p>
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

function metricCard(label, value) {
  return `<div class="card"><div>${escapeHtml(label)}</div><div class="metric">${escapeHtml(value)}</div></div>`;
}

function developerModeValue(developerMode, key) {
  if (!developerMode || typeof developerMode !== "object") return key === "workstreams" ? [] : "";
  if (key === "workstreams") return Array.isArray(developerMode.workstreams) ? developerMode.workstreams : [];
  return developerMode[key];
}

function htmlTable(headers, rows, options = {}) {
  const trusted = new Set(options.trustedHtmlColumns || []);
  if (!rows.length) {
    return `<div class="table-wrap"><table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody><tr><td class="empty-state" colspan="${headers.length}">No records</td></tr></tbody></table></div>`;
  }
  return `<div class="table-wrap"><table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${headers.map((_, index) => `<td>${trusted.has(index) ? String(row[index] || "") : escapeHtml(row[index] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
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

module.exports = {
  buildClientHomeHtml,
  buildCustomerAppHtml,
  buildDashboardHtml,
  renderLiveReportsDashboard,
  metricCard,
  htmlTable,
  escapeHtml,
  exportCustomerAppPages,
  buildAiRunHistoryReport
};
