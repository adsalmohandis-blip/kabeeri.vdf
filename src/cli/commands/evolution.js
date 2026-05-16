const fs = require("fs");
const path = require("path");
const {
  buildEvolutionSummary,
  buildEvolutionScorecards,
  buildEvolutionTemporaryPrioritiesReport,
  buildEvolutionPriorityExecutionDetails,
  ensureEvolutionDevelopmentPriorities,
  ensureEvolutionTemporaryPriorities,
  buildKVDFFeatureRestructureRoadmap,
  buildKVDFFeaturePartitionMatrix,
  renderKVDFFeaturePartitionMatrix,
  handleEvolutionTemporaryPriorities,
  renderEvolutionTemporaryPrioritiesReport
} = require("../services/evolution");
const { buildTaskLifecycleState } = require("./task_lifecycle");
const { readStateArray } = require("../services/state_utils");
const { writeTextFile: writeLocalTextFile } = require("../fs_utils");

const SCORECARDS_REPORT_PATH = "docs/reports/KVDF_SCORECARDS.md";
const SCORECARDS_STATE_PATH = ".kabeeri/reports/kabeeri_scorecards.json";

function localFilePath(relativePath) {
  return path.join(process.cwd(), relativePath);
}

function localFileExists(relativePath) {
  return fs.existsSync(localFilePath(relativePath));
}

function readLocalJsonFile(relativePath) {
  return JSON.parse(fs.readFileSync(localFilePath(relativePath), "utf8"));
}

function resolveEvolutionMode(flags = {}) {
  return flags.app || flags.developer || flags["app-mode"] || flags.mode === "app" ? "app_developer" : "framework_owner";
}

function buildEvolutionCommandPrefix(mode) {
  return mode === "app_developer" ? "kvdf evolution app" : "kvdf evolution";
}

function normalizeEvolutionExecutionReportId(priorityId) {
  const normalized = String(priorityId || "execution-report")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "EXECUTION_REPORT";
  return normalized.endsWith("_REPORTS") ? normalized.replace(/_REPORTS$/, "_REPORT") : normalized;
}

function getEvolutionExecutionReportPath(priorityId) {
  return path.posix.join("docs", "reports", `${normalizeEvolutionExecutionReportId(priorityId)}.md`);
}

function writeEvolutionExecutionReportFile(report, tableRenderer = () => "") {
  const reportPath = localFilePath(report.report_path);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, renderEvolutionExecutionReport(report, tableRenderer), "utf8");
}

function evolution(action, value, flags = {}, rest = [], deps = {}) {
  if (["app", "developer", "dev"].includes(String(action || "").toLowerCase())) {
    return evolution(value, rest[0], { ...flags, app: true }, rest.slice(1), deps);
  }

  const {
    ensureWorkspace = () => {},
    fileExists = () => false,
    readJsonFile = () => ({}),
    writeJsonFile = () => {},
    writeTextFile = () => {},
    readTextFile = () => "",
    table = () => "",
    appendAudit = () => {},
    refreshDashboardArtifacts = () => {},
    requireAnyRole = () => {},
    readStateArray = () => [],
    compactTitle = (input) => String(input || "").trim(),
    nextRecordId = () => "evo-001",
    parseCsv = (value) => String(value || "").split(",").map((item) => item.trim()).filter(Boolean)
  } = deps;
  const mode = resolveEvolutionMode(flags);
  const appMode = mode === "app_developer";

  ensureWorkspace();
  const file = ".kabeeri/evolution.json";
  if (!localFileExists(file)) writeJsonFile(file, { changes: [], impact_plans: [], current_change_id: null, temporary_priorities: null });
  const state = readLocalJsonFile(file);
  state.changes = state.changes || [];
  state.impact_plans = state.impact_plans || [];
  state.deferred_ideas = state.deferred_ideas || [];
  state.scorecards = state.scorecards || [];
  const baseSummary = buildEvolutionSummary(state);

  if (!action || action === "status" || action === "summary") {
    const summary = { ...baseSummary, audience: mode };
    writeJsonFile(file, state);
    if (flags.json) console.log(JSON.stringify(summary, null, 2));
    else console.log(renderEvolutionSummary(summary));
    return;
  }

  if (action === "priority" && value) {
    if (!appMode) requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "update evolution priority");
    const priority = updateEvolutionPriority(state, value, flags);
    writeJsonFile(file, state);
    if (flags.json) console.log(JSON.stringify(priority, null, 2));
    else console.log(`${priority.id}: ${priority.status} - ${priority.title}`);
    return;
  }

  if (["defer", "deferred", "deferred-ideas", "ideas"].includes(action)) {
    if (!appMode && ["add", "create", "restore", "promote"].includes(String(value || "list").toLowerCase())) {
      requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "manage deferred evolution ideas");
    }
    const result = handleEvolutionDeferredIdeas(state, action, value, flags, rest, {
      fileExists,
      readJsonFile,
      writeJsonFile,
      readTextFile,
      table,
      appendAudit,
      refreshDashboardArtifacts,
      requireAnyRole,
      readStateArray,
      compactTitle,
      nextRecordId,
      parseCsv,
      appMode,
      commandPrefix: buildEvolutionCommandPrefix(mode)
    });
    writeJsonFile(file, state);
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else console.log(renderEvolutionDeferredIdeasResult(result, table));
    return;
  }

  if (["temp", "temporary", "temp-priorities", "temporary-priorities"].includes(action)) {
    const result = handleEvolutionTemporaryPriorities(state, value, flags, rest);
    result.audience = appMode ? "app_developer" : "framework_owner";
    writeJsonFile(file, state);
    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else console.log(renderEvolutionTemporaryPrioritiesReport(result, table));
    return;
  }

  if (["roadmap", "work-order", "workorder"].includes(action)) {
    const report = buildKVDFFeatureRestructureRoadmap({ appMode });
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderEvolutionRoadmap(report, table));
    return;
  }

  if (["partition", "matrix", "split"].includes(action)) {
    const report = buildKVDFFeaturePartitionMatrix({ appMode });
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderEvolutionCapabilityPartitionMatrix(report, table));
    return;
  }

  if (["report", "execution", "execution-report"].includes(action)) {
    const report = buildEvolutionExecutionReport(state, readJsonFile, fileExists, {
      appMode,
      commandPrefix: buildEvolutionCommandPrefix(mode),
      reportId: flags.id || value
    });
    writeEvolutionExecutionReportFile(report, table);
    writeJsonFile(file, state);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderEvolutionExecutionReport(report, table));
    return;
  }

  if (["scorecard", "scorecards", "cards"].includes(action)) {
    if (appMode) throw new Error("Evolution scorecards are framework-owner only. Use `kvdf evolution scorecards`.");
    requireAnyRole(flags, ["Owner", "Owner-Developer", "Maintainer", "Business Analyst"], "create evolution scorecards");
    const report = buildEvolutionScorecards(state, { appMode: false });
    const shouldMaterialize = Boolean(flags.materialize || flags["with-evo"] || flags.link_evo || flags["link-evo"]);
    if (shouldMaterialize) {
      const materialized = materializeEvolutionScorecardPlans(state, report.scorecards, {
        readJsonFile,
        writeJsonFile,
        fileExists,
        appendAudit,
        compactTitle,
        nextRecordId,
        parseCsv,
        appMode: false
      });
      report.scorecards = materialized.scorecards;
      report.scorecard_plans = materialized.plans;
      report.scorecard_tasks = materialized.tasks;
      report.summary.scorecard_plans_created = materialized.plans.length;
      report.summary.scorecards_materialized = true;
      state.scorecards = report.scorecards;
    } else {
      report.scorecard_plans = [];
      report.scorecard_tasks = [];
      report.summary.scorecard_plans_created = 0;
      report.summary.scorecards_materialized = false;
      state.scorecards = report.scorecards;
    }
    writeJsonFile(file, state);
    writeJsonFile(SCORECARDS_STATE_PATH, report);
    writeLocalTextFile(SCORECARDS_REPORT_PATH, renderEvolutionScorecardsReport(report, table));
    refreshDashboardArtifacts();
    appendAudit("evolution.scorecards", "evolution", "scorecards", `Evolution scorecards generated: ${report.summary.total}`);
    if (flags.json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }
    console.log(renderEvolutionScorecardsReport(report, table));
    return;
  }

  if (["batch-exe", "batch-execute", "batch-exec", "batch"].includes(action)) {
    if (!appMode) requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst", "Owner-Developer"], "run evolution batch execution");
    const report = buildEvolutionBatchExecutionReport(state, readJsonFile, writeJsonFile, fileExists, {
      appMode,
      commandPrefix: buildEvolutionCommandPrefix(mode),
      autoAssigneeId: flags.assignee || flags["auto-assignee"] || process.env.KVDF_BATCH_ASSIGNEE || null,
      statuses: flags.statuses || flags.status || value || "approved,ready",
      limit: flags.limit || null
    });
    writeJsonFile(file, state);
    const batchFile = ".kabeeri/reports/evolution_batch_execution.json";
    writeJsonFile(batchFile, report);
    if (appendAudit) appendAudit("evolution.batch_exe", "evolution", report.batch_id, `Evolution batch execution planned: ${report.batch_id}`);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderEvolutionBatchExecutionReport(report, table));
    return;
  }

  if (["priorities", "priority", "roadmap", "phases"].includes(action)) {
    const priorities = buildEvolutionPrioritiesReport(state, readJsonFile, fileExists, { appMode });
    writeJsonFile(file, state);
    if (flags.json) console.log(JSON.stringify(priorities, null, 2));
    else console.log(renderEvolutionPriorities(priorities, table));
    return;
  }

  if (action === "next") {
    const priorities = buildEvolutionPrioritiesReport(state, readJsonFile, fileExists, { appMode });
    const next = priorities.priorities.find((item) => !["done", "deferred", "rejected"].includes(item.status)) || null;
    const nextAction = buildEvolutionNextAction(next, { appMode, commandPrefix: buildEvolutionCommandPrefix(mode) });
    const payload = { report_type: "evolution_next_priority", generated_at: new Date().toISOString(), next, next_action: nextAction };
    if (flags.json) console.log(JSON.stringify(payload, null, 2));
    else console.log(next ? `${next.id}: ${next.title}\n${next.summary}\nNext action: ${nextAction}` : "No open evolution priorities.");
    return;
  }

  if (action === "list") {
    const activeChanges = state.changes.filter((item) => !item.archived);
    const archivedChanges = state.changes.filter((item) => item.archived);
    const rows = activeChanges.map((item) => [
      item.change_id,
      item.title,
      item.status,
      (item.impacted_areas || []).join(",")
    ]);
    const output = [
      table(["Change", "Title", "Status", "Impacted Areas"], rows)
    ];
    if (archivedChanges.length) {
      output.push("");
      output.push("Archived changes:");
      output.push(table(["Change", "Title", "Status", "Impacted Areas"], archivedChanges.map((item) => [
        item.change_id,
        item.title,
        item.status,
        (item.impacted_areas || []).join(",")
      ])));
    }
    console.log(output.join("\n"));
    return;
  }

  if (action === "show" || action === "impact" || action === "tasks") {
    const changeId = flags.id || value || state.current_change_id;
    if (!changeId) throw new Error("Missing evolution change id.");
    const change = state.changes.find((item) => item.change_id === changeId);
    if (!change) throw new Error(`Evolution change not found: ${changeId}`);
    const plan = state.impact_plans.find((item) => item.change_id === changeId) || null;
    if (action === "tasks") {
      const tasks = readStateArray(".kabeeri/tasks.json", "tasks").filter((taskItem) => taskItem.evolution_change_id === changeId);
      console.log(JSON.stringify({ change_id: changeId, tasks }, null, 2));
      return;
    }
    if (action === "impact") {
      console.log(JSON.stringify(plan || change.impact_plan || {}, null, 2));
      return;
    }
    console.log(JSON.stringify({ change, impact_plan: plan }, null, 2));
    return;
  }

  if (action === "plan" || action === "request" || action === "create") {
    if (!appMode) requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "create evolution plan");
    const description = [value, ...rest].filter(Boolean).join(" ").trim() || flags.title || flags.description || flags.summary;
    if (!description) throw new Error("Missing evolution description.");
    const placement = buildEvolutionFeatureRequestPlacement(state, description, flags, { fileExists, readTextFile, appMode, commandPrefix: buildEvolutionCommandPrefix(mode) });
    if (!isEvolutionPlacementConfirmed(flags)) {
      if (flags.json) console.log(JSON.stringify(placement, null, 2));
      else console.log(renderEvolutionFeatureRequestPlacement(placement, table));
      return;
    }
    const change = createEvolutionChange(state, description, flags, { fileExists, readTextFile, compactTitle, nextRecordId, parseCsv, appMode });
    if (placement.active_priority || placement.recommended_position || flags["priority-position"]) {
      change.priority_confirmation = {
        confirmed_at: new Date().toISOString(),
        active_priority_id: placement.active_priority ? placement.active_priority.id : null,
        recommended_position: placement.recommended_position || null,
        requested_position: flags["priority-position"] || flags.priority || null,
        confirmation_flag: flags["confirm-placement"] || flags["confirm-priority"] || flags.confirm
      };
    }
    writeJsonFile(file, state);
    const tasks = createEvolutionTasks(change, flags, { readJsonFile, writeJsonFile, appendAudit, compactTitle, nextRecordId, parseCsv, appMode });
    change.task_ids = tasks.map((item) => item.id);
    const plan = buildEvolutionImpactPlan(change, tasks);
    change.impact_plan_id = plan.plan_id;
    state.impact_plans.push(plan);
    state.current_change_id = change.change_id;
    writeJsonFile(file, state);
    refreshDashboardArtifacts();
    appendAudit("evolution.planned", "evolution", change.change_id, `Evolution planned: ${change.title}`);
    if (flags.json) {
      console.log(JSON.stringify({ change, impact_plan: plan, tasks }, null, 2));
      return;
    }
    console.log(`Evolution Steward plan created: ${change.change_id}`);
    console.log(table(["Item", "Value"], [
      ["Title", change.title],
      ["Impacted areas", change.impacted_areas.join(", ")],
      ["Tasks", String(tasks.length)],
      ["Impact plan", plan.plan_id]
    ]));
    return;
  }

  if (action === "verify" || action === "close" || action === "complete") {
    if (!appMode) requireAnyRole(flags, ["Owner", "Maintainer"], "verify evolution plan");
    const changeId = flags.id || value || state.current_change_id;
    if (!changeId) throw new Error("Missing evolution change id.");
    const change = state.changes.find((item) => item.change_id === changeId);
    if (!change) throw new Error(`Evolution change not found: ${changeId}`);
    const tasks = readStateArray(".kabeeri/tasks.json", "tasks").filter((taskItem) => taskItem.evolution_change_id === changeId);
    const openTasks = tasks.filter((taskItem) => !["owner_verified", "done", "closed", "rejected"].includes(taskItem.status));
    change.status = openTasks.length ? "needs_follow_up" : "verified";
    change.verified_at = openTasks.length ? null : new Date().toISOString();
    change.open_task_ids = openTasks.map((taskItem) => taskItem.id);
    writeJsonFile(file, state);
    refreshDashboardArtifacts();
    appendAudit("evolution.verified", "evolution", change.change_id, `Evolution verification: ${change.status}`);
    console.log(`Evolution change ${change.change_id}: ${change.status}`);
    if (openTasks.length) console.log(`Open follow-up tasks: ${openTasks.map((item) => item.id).join(", ")}`);
    return;
  }

  throw new Error(`Unknown evolution action: ${action}`);
}

function createEvolutionChange(state, description, flags = {}, deps = {}) {
  const {
    fileExists = () => false,
    readTextFile = () => "",
    compactTitle = (input) => String(input || "").trim(),
    nextRecordId = () => "evo-001",
    appMode = false
  } = deps;
  const changeId = flags.id || nextRecordId(state.changes, "change_id", "evo");
  const impactedAreas = inferEvolutionImpactedAreas(description, flags, deps);
  const title = flags.title && flags.title !== true ? flags.title : compactTitle(description);
  const createdAt = new Date().toISOString();
  const capabilityMatches = findExistingCapabilityMatches(description, fileExists, readTextFile);
  const existingChangeMatches = findExistingEvolutionMatches(state, description);
  const change = {
    change_id: changeId,
    title,
    description,
    status: "planned",
    requested_by: flags.requestedBy || flags.actor || (appMode ? "local-developer" : "local-owner"),
    source: flags.source || (appMode ? "app_request" : "owner_request"),
    impacted_areas: impactedAreas,
    required_updates: impactedAreas.map((area) => evolutionAreaDefinition(area)),
    duplicate_risk: capabilityMatches.length || existingChangeMatches.length ? "review_required" : "none",
    existing_capability_matches: capabilityMatches,
    existing_change_matches: existingChangeMatches,
    created_at: createdAt,
    task_ids: []
  };
  state.changes.push(change);
  return change;
}

function buildEvolutionFeatureRequestPlacement(state, description, flags = {}, deps = {}) {
  const { compactTitle = (input) => String(input || "").trim(), appMode = false, commandPrefix = "kvdf evolution" } = deps;
  const prioritiesReport = buildEvolutionPrioritiesReport(state, deps.readJsonFile || (() => ({})), deps.fileExists || (() => false), { appMode });
  const priorities = prioritiesReport.priorities || [];
  const activePriority = priorities.find((item) => item.status === "in_progress") || null;
  const requestedPosition = flags["priority-position"] || flags.priority || null;
  const recommendedPosition = activePriority ? Number(activePriority.priority || 0) + 1 : (prioritiesReport.next_priority ? Number(prioritiesReport.next_priority.priority || 0) : 1);
  const placementRequired = !isEvolutionPlacementConfirmed(flags);
  return {
    report_type: "evolution_feature_request_placement",
    generated_at: new Date().toISOString(),
    status: activePriority ? "confirmation_required" : "placement_required",
    requires_confirmation: placementRequired,
    awaiting_decision: placementRequired,
    request: {
      title: flags.title && flags.title !== true ? flags.title : compactTitle(description),
      description
    },
    active_priority: activePriority,
    recommended_position: recommendedPosition || null,
    requested_position: requestedPosition,
    recommendation: activePriority
      ? (appMode
        ? `Finish or explicitly keep ${activePriority.id} in progress, then place this app request at priority ${recommendedPosition}.`
        : `Finish or explicitly keep ${activePriority.id} in progress, then place this request at priority ${recommendedPosition}.`)
      : (appMode
        ? "Review the app priority list, choose the right placement, then confirm before creating this app request."
        : "Review the priority list, choose the right placement, then confirm before creating this request."),
    confirmation_required_reason: activePriority
      ? (appMode
        ? "An app development priority is already in progress. New requests must not interrupt it or change ordering without explicit developer confirmation."
        : "A framework development priority is already in progress. New feature requests must not interrupt it or change ordering without Owner confirmation.")
      : (appMode
        ? "Every new app task must be placed and confirmed before execution."
        : "Every new task must be placed and confirmed before execution."),
    confirmation_commands: activePriority ? [
      `${commandPrefix} plan "${description}" --confirm-placement --priority-position ${recommendedPosition}`,
      `${commandPrefix} priority ${activePriority.id} --status done --note "Finished current priority"`,
      `${commandPrefix} priorities`
    ] : [],
    priorities,
    audience: appMode ? "app_developer" : "framework_owner"
  };
}

function isEvolutionPlacementConfirmed(flags = {}) {
  return Boolean(flags["confirm-placement"] || flags["confirm-priority"] || flags.confirm || flags.force);
}

function renderEvolutionFeatureRequestPlacement(report, table) {
  const lines = [
    report.audience === "app_developer" ? "Kabeeri App Evolution Request Placement" : "Kabeeri Evolution Feature Request Placement",
    "",
    `Status: ${report.status}`,
    `Request: ${report.request.title}`,
    ""
  ];
  if (report.active_priority) {
    lines.push(`Active unfinished priority: ${report.active_priority.id} - ${report.active_priority.title}`);
    lines.push(`Recommended placement: priority ${report.recommended_position}`);
    lines.push(`Reason: ${report.confirmation_required_reason}`);
    lines.push(`Awaiting decision: ${report.awaiting_decision ? "yes" : "no"}`);
    lines.push("");
    lines.push("Current priorities:");
    lines.push(table(["#", "ID", "Status", "Title"], report.priorities.map((item) => [item.priority, item.id, item.status, item.title])));
    lines.push("");
    lines.push("Confirm with one of:");
    for (const command of report.confirmation_commands) lines.push(`- ${command}`);
  } else {
    lines.push(report.recommendation);
    lines.push(`Awaiting decision: ${report.awaiting_decision ? "yes" : "no"}`);
  }
  return lines.join("\n");
}

function createEvolutionTasks(change, flags = {}, deps = {}) {
  if (flags["no-tasks"]) return [];
  const { readJsonFile = () => ({}), writeJsonFile = () => {}, appendAudit = () => {}, nextRecordId = () => "task-001" } = deps;
  const tasksFile = ".kabeeri/tasks.json";
  const data = readJsonFile(tasksFile);
  data.tasks = data.tasks || [];
  const existing = new Set(data.tasks.map((item) => item.id));
  const nextTaskId = () => {
    let index = data.tasks.length + 1;
    let id = `task-${String(index).padStart(3, "0")}`;
    while (existing.has(id)) {
      index += 1;
      id = `task-${String(index).padStart(3, "0")}`;
    }
    existing.add(id);
    return id;
  };
  const createdAt = new Date().toISOString();
  const selectedAreas = orderEvolutionAreas(change.impacted_areas);
  const tasks = selectedAreas.map((area) => {
    const definition = evolutionAreaDefinition(area);
    const durable = buildEvolutionTaskExecutionDetails(change, area, definition);
    const taskId = nextTaskId();
    return {
      id: taskId,
      title: `Evolution Steward: update ${definition.label}`,
      status: "proposed",
      type: "framework_update",
      workstream: definition.workstream,
      workstreams: [definition.workstream],
      source: `evolution:${change.change_id}`,
      evolution_change_id: change.change_id,
      evolution_area: area,
      allowed_files: definition.files,
      acceptance_criteria: definition.acceptance,
      execution_summary: durable.execution_summary,
      memory: {
        task_id: taskId,
        title: `Evolution Steward: update ${definition.label}`,
        purpose: durable.execution_summary,
        scope: `Impacted area: ${area}`,
        source_of_truth: {
          source: `evolution:${change.change_id}`,
          workstreams: [definition.workstream],
          app_usernames: [],
          allowed_files: definition.files
        },
        acceptance_criteria: definition.acceptance,
        required_inputs: durable.required_inputs,
        expected_outputs: durable.expected_outputs,
        do_not_change: durable.do_not_change,
        resume_steps: durable.resume_steps,
        verification_commands: durable.verification_commands
      },
      resume_steps: durable.resume_steps,
      required_inputs: durable.required_inputs,
      expected_outputs: durable.expected_outputs,
      do_not_change: durable.do_not_change,
      verification_commands: durable.verification_commands,
      created_at: createdAt
    };
  });
  data.tasks.push(...tasks);
  writeJsonFile(tasksFile, data);
  for (const taskItem of tasks) {
    appendAudit("task.created", "task", taskItem.id, `Evolution follow-up task created: ${taskItem.title}`);
  }
  return tasks;
}

function buildEvolutionImpactPlan(change, tasks) {
  return {
    plan_id: `${change.change_id}-impact`,
    change_id: change.change_id,
    generated_at: new Date().toISOString(),
    title: change.title,
    status: "planned",
    impacted_areas: change.impacted_areas,
    dependency_rule: "When a Kabeeri framework capability changes, update every dependent runtime, schema, dashboard, report, documentation, and test surface before treating the change as done.",
    update_order: orderEvolutionAreas(change.impacted_areas),
    tasks: tasks.map((taskItem) => ({
      task_id: taskItem.id,
      area: taskItem.evolution_area,
      title: taskItem.title,
      workstream: taskItem.workstream,
      allowed_files: taskItem.allowed_files,
      execution_summary: taskItem.execution_summary,
      resume_steps: taskItem.resume_steps,
      expected_outputs: taskItem.expected_outputs,
      verification_commands: taskItem.verification_commands
    }))
  };
}

function materializeEvolutionScorecardPlans(state, scorecards, deps = {}) {
  const { readJsonFile = () => ({}), writeJsonFile = () => {}, fileExists = () => false, appendAudit = () => {}, compactTitle = (input) => String(input || "").trim(), nextRecordId = () => "evo-001", parseCsv = (value) => String(value || "").split(",").map((item) => item.trim()).filter(Boolean), appMode = false } = deps;
  const tasksState = fileExists(".kabeeri/tasks.json") ? readJsonFile(".kabeeri/tasks.json") : {};
  const existingTasks = Array.isArray(tasksState.tasks) ? tasksState.tasks : [];
  const createdChanges = [];
  const createdPlans = [];
  const createdTasks = [];
  const createdScorecards = [];
  state.impact_plans = state.impact_plans || [];
  state.changes = state.changes || [];

  for (const card of scorecards) {
    const changeId = card.evolution_change_id || `evo-scorecard-${card.card_id}`;
    let change = state.changes.find((item) => item.change_id === changeId) || null;
    if (!change) {
      change = createEvolutionChange(state, card.evolution_plan_summary, {
        id: changeId,
        title: card.evolution_plan_title,
        areas: card.impacted_areas.join(","),
        source: "scorecard_auto",
        requestedBy: appMode ? "local-developer" : "local-owner"
      }, { compactTitle, nextRecordId, parseCsv, appMode });
    } else {
      change.title = card.evolution_plan_title;
      change.description = card.evolution_plan_summary;
      change.impacted_areas = card.impacted_areas;
      change.required_updates = card.impacted_areas.map((area) => evolutionAreaDefinition(area));
      change.source = "scorecard_auto";
      change.updated_at = new Date().toISOString();
    }
    change.scorecard_id = card.card_id;
    change.scorecard_score = card.score;
    change.scorecard_band = card.band;
    change.scorecard_strength = card.strength;
    change.scorecard_weakness = card.weakness;
    change.scorecard_evidence = card.evidence;

    let tasks = existingTasks.filter((taskItem) => taskItem.evolution_change_id === change.change_id);
    if (!tasks.length) {
      tasks = createEvolutionTasks(change, {}, { readJsonFile, writeJsonFile, appendAudit, nextRecordId });
    }
    change.task_ids = tasks.map((item) => item.id);

    let plan = state.impact_plans.find((item) => item.change_id === change.change_id) || null;
    if (!plan) {
      plan = buildEvolutionImpactPlan(change, tasks);
      state.impact_plans.push(plan);
    } else {
      plan.title = change.title;
      plan.impacted_areas = change.impacted_areas;
      plan.tasks = tasks.map((taskItem) => ({
        task_id: taskItem.id,
        area: taskItem.evolution_area,
        title: taskItem.title,
        workstream: taskItem.workstream,
        allowed_files: taskItem.allowed_files,
        execution_summary: taskItem.execution_summary,
        resume_steps: taskItem.resume_steps,
        expected_outputs: taskItem.expected_outputs,
        verification_commands: taskItem.verification_commands
      }));
      plan.updated_at = new Date().toISOString();
    }
    change.impact_plan_id = plan.plan_id;
    createdChanges.push(change);
    createdPlans.push(plan);
    createdTasks.push(...tasks);
    createdScorecards.push(card);
  }

  state.current_change_id = createdChanges[0] ? createdChanges[0].change_id : state.current_change_id;
  return {
    scorecards: createdScorecards,
    changes: createdChanges,
    plans: createdPlans,
    tasks: createdTasks
  };
}

function renderEvolutionScorecardsReport(report, table) {
  const rows = (report.scorecards || []).map((card) => [
    card.card_id,
    String(card.score),
    card.band,
    card.risk,
    card.evolution_change_id,
    card.next_action
  ]);
  return [
    "Kabeeri Scorecards",
    "",
    `Generated at: ${report.generated_at || "unknown"}`,
    `Status: ${report.status || "ready"}`,
    `Average score: ${report.summary ? report.summary.average_score : "n/a"}`,
    `Strong: ${report.summary ? report.summary.strong : 0} | Watch: ${report.summary ? report.summary.watch : 0} | Needs attention: ${report.summary ? report.summary.needs_attention : 0}`,
    `Evolution plans materialized: ${report.summary && typeof report.summary.scorecard_plans_created === "number" ? report.summary.scorecard_plans_created : (report.scorecard_plans || []).length}`,
    `Scorecards are review-only by default: ${report.summary && report.summary.scorecards_materialized ? "no" : "yes"}`,
    "",
    table(["Card", "Score", "Band", "Risk", "Suggested Evolution ID", "Next action"], rows.length ? rows : [["", "", "", "", "", "No scorecards available."]]),
    "",
    "Evidence and notes:",
    ...(report.scorecards || []).flatMap((card) => [
      `- ${card.card_id}: ${card.strength}`,
      `  Weakness: ${card.weakness}`,
      `  Evidence: ${(card.evidence || []).join(" | ")}`
    ]),
    "",
    "Next actions:",
    ...(report.next_actions && report.next_actions.length ? report.next_actions.map((item) => `- ${item}`) : ["- none"])
  ].join("\n");
}

function buildEvolutionTaskExecutionDetails(change, area, definition) {
   const files = Array.isArray(definition.files) ? definition.files : [];
   const acceptance = Array.isArray(definition.acceptance) ? definition.acceptance : [];
   const changeTitle = change.title || change.description || change.change_id;
   const fileList = files.length ? files.join(", ") : "the files listed by the task scope";
   return {
     execution_summary: `Advance ${change.change_id} (${changeTitle}) by implementing all necessary changes to ${definition.label} within ${fileList} to satisfy the acceptance criteria, ensuring no work remains outside this scope.`,
     resume_steps: [
       `Read .kabeeri/evolution.json and confirm ${change.change_id} is still the source change with status "${change.status}".`,
       `Verify this task (${change.change_id}:${area}) is still in "${this.status || "proposed"}" status and not blocked by dependencies.`,
       `Read this task's allowed_files (${fileList}) and inspect only the files needed for ${definition.label}.`,
       `Confirm no conflicting work exists in related areas by checking evolution temporary priorities and active priorities.`,
       `Apply the smallest coherent update for area '${area}' that satisfies all acceptance criteria without starting a second Evolution priority or creating side work.`,
       "Update related runtime state, docs, or tests only when they are inside the declared task scope and directly support this task's objectives.",
       "Run all listed verification commands and record results; if any command fails, document the failure as a blocker before proceeding."
     ],
     required_inputs: [
       `Evolution change ${change.change_id}: "${change.title}"`,
       `Impacted area: ${area}`,
       `Allowed files: ${fileList}`,
       `Acceptance criteria: ${acceptance.length ? acceptance.join(" | ") : "none listed"}`
     ],
     expected_outputs: [
       `${definition.label} fully implements the requested Evolution change as verified by acceptance criteria.`,
       `All changed files are contained within allowed_files (${fileList}) unless explicit Owner approval exists for scope expansion.`,
       `Each acceptance criterion is satisfied and documented, or a specific blocker is recorded preventing completion.`,
       `No partial work remains; the task is either complete with evidence or blocked with clear documentation.`
     ],
     do_not_change: [
       "Do not reorder unrelated Evolution priorities or change their sequencing without explicit Owner confirmation.",
       "Do not edit files outside allowed_files without explicit Owner confirmation and documentation of necessity.",
       "Do not mark the source change complete only because this one follow-up task is done; all linked tasks must reach owner_verified status.",
       "Do not expand scope beyond allowed_files without creating a new evolution change and undergoing placement confirmation.",
       "Do not skip verification steps or record incomplete verification as success."
     ],
     verification_commands: buildEvolutionTaskVerificationCommands(area)
   };
 }

function buildEvolutionTaskVerificationCommands(area) {
  const commands = ["npm test"];
  if (area === "schemas") commands.unshift("npm run kvdf -- validate runtime-schemas");
  if (area === "tasks") commands.unshift("npm run kvdf -- validate tasks");
  if (area === "dashboard") commands.unshift("npm run kvdf -- dashboard state");
  if (area === "capabilities" || area === "docs" || area === "ai_context") commands.unshift("npm run kvdf -- validate");
  return Array.from(new Set(commands));
}

function handleEvolutionDeferredIdeas(state, action, value, flags = {}, rest = [], deps = {}) {
  state.deferred_ideas = state.deferred_ideas || [];
  const {
    requireAnyRole = () => {},
    appendAudit = () => {},
    refreshDashboardArtifacts = () => {},
    compactTitle = (input) => String(input || "").trim()
  } = deps;
  const appMode = Boolean(flags.app || flags.developer || flags["app-mode"] || flags.mode === "app");
  const commandPrefix = deps.commandPrefix || (appMode ? "kvdf evolution app" : "kvdf evolution");
  const subaction = action === "defer" ? "add" : String(value || "list").toLowerCase();
  const text = action === "defer"
    ? [value, ...rest].filter(Boolean).join(" ").trim()
    : rest.filter(Boolean).join(" ").trim();

  if (["list", "show", "status"].includes(subaction)) {
    const ideas = state.deferred_ideas.filter((item) => !flags.all ? item.status === "deferred" : true);
    return {
      report_type: "evolution_deferred_ideas",
      generated_at: new Date().toISOString(),
      audience: appMode ? "app_developer" : "framework_owner",
      status: ideas.length ? "has_deferred_ideas" : "empty",
      total: state.deferred_ideas.length,
      open: getOpenDeferredIdeas(state).length,
      ideas
    };
  }

  if (subaction === "add" || subaction === "create") {
    if (!appMode) requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "defer evolution idea");
    const description = text || flags.description || flags.summary || flags.title;
    if (!description || description === true) throw new Error("Missing deferred idea description.");
    const ideaId = nextDeferredIdeaId(state.deferred_ideas);
    const title = flags.title && flags.title !== true ? flags.title : compactTitle(description);
    const idea = {
      idea_id: ideaId,
      title,
      description: String(description),
      status: "deferred",
      source: flags.source || (appMode ? "app_deferred_idea" : "owner_deferred_idea"),
      reason: flags.reason || (appMode ? "Deferred by developer for later review." : "Deferred by Owner for later review."),
      recommended_after: flags["recommended-after"] || null,
      recommended_before: flags["recommended-before"] || null,
      analysis_summary: flags.analysis || null,
      execution_details: buildDeferredIdeaExecutionDetails(ideaId, title, { appMode, commandPrefix }),
      created_at: new Date().toISOString(),
      restored_at: null,
      restored_change_id: null
    };
    state.deferred_ideas.push(idea);
    return {
      report_type: "evolution_deferred_idea_added",
      generated_at: new Date().toISOString(),
      audience: appMode ? "app_developer" : "framework_owner",
      idea,
      priorities_hint: appMode
        ? "This idea appears only inside the final deferred ideas bucket until the developer restores it."
        : "This idea appears only inside the final deferred ideas bucket until the Owner restores it."
    };
  }

  if (subaction === "restore" || subaction === "promote") {
    if (!appMode) requireAnyRole(flags, ["Owner", "Maintainer", "Business Analyst"], "restore deferred idea");
    const ideaId = flags.id || rest[0];
    if (!ideaId) throw new Error("Missing deferred idea id.");
    const idea = state.deferred_ideas.find((item) => item.idea_id === ideaId);
    if (!idea) throw new Error(`Deferred idea not found: ${ideaId}`);
    if (idea.status !== "deferred") throw new Error(`Deferred idea is not open: ${ideaId}`);
    const description = flags.description || idea.description;
    const placement = buildEvolutionFeatureRequestPlacement(state, description, flags, { fileExists: deps.fileExists, readTextFile: deps.readTextFile, compactTitle, appMode, commandPrefix });
    if (placement.requires_confirmation && !isEvolutionPlacementConfirmed(flags)) {
      return {
        ...placement,
        deferred_idea: idea,
        restore_requires_confirmation: true
      };
    }
    const change = createEvolutionChange(state, description, {
      ...flags,
      title: flags.title || idea.title,
      source: "deferred_idea_restore"
    }, { fileExists: deps.fileExists, readTextFile: deps.readTextFile, compactTitle, appMode });
    change.restored_deferred_idea_id = idea.idea_id;
    change.priority_confirmation = {
      confirmed_at: new Date().toISOString(),
      active_priority_id: placement.active_priority ? placement.active_priority.id : null,
      recommended_position: placement.recommended_position || null,
      requested_position: flags["priority-position"] || flags.priority || null,
      confirmation_flag: flags["confirm-placement"] || flags["confirm-priority"] || flags.confirm
    };
    const tasks = createEvolutionTasks(change, flags, deps);
    change.task_ids = tasks.map((item) => item.id);
    const plan = buildEvolutionImpactPlan(change, tasks);
    change.impact_plan_id = plan.plan_id;
    state.impact_plans.push(plan);
    state.current_change_id = change.change_id;
    idea.status = "restored";
    idea.restored_at = new Date().toISOString();
    idea.restored_change_id = change.change_id;
    refreshDashboardArtifacts();
    appendAudit("evolution.deferred_idea_restored", "evolution", idea.idea_id, `Deferred idea restored: ${idea.title}`);
    return {
      report_type: "evolution_deferred_idea_restored",
      generated_at: new Date().toISOString(),
      audience: appMode ? "app_developer" : "framework_owner",
      idea,
      change,
      impact_plan: plan,
      tasks
    };
  }

  throw new Error(`Unknown deferred ideas action: ${subaction}`);
}

function buildEvolutionPrioritiesReport(state, readJsonFile, fileExists, options = {}) {
  const appMode = Boolean(options.appMode);
  const summary = buildEvolutionSummary(state);
  const priorities = (state.development_priorities || []).map((priority) => appMode
    ? localizeEvolutionPriority(priority, { appMode })
    : priority);
  const openPriorities = priorities.filter((item) => !["done", "deferred", "rejected"].includes(item.status));
  const archivedPriorities = priorities.filter((item) => ["done", "rejected"].includes(item.status));
  const deferredIdeas = getOpenDeferredIdeas(state);
  const deferredSummary = {
    total: Array.isArray(state.deferred_ideas) ? state.deferred_ideas.length : 0,
    open: deferredIdeas.length,
    latest: deferredIdeas.length ? deferredIdeas[deferredIdeas.length - 1] : null
  };
  const deferredBucket = deferredSummary.open > 0 ? buildDeferredIdeasPriorityItem(priorities, deferredSummary, { appMode }) : null;
  const combinedPriorities = [...openPriorities, ...archivedPriorities, ...(deferredBucket ? [deferredBucket] : [])];
  const temporaryReport = buildEvolutionTemporaryPrioritiesReport(state);
  const multiAiState = fileExists(".kabeeri/multi_ai_governance.json") ? readJsonFile(".kabeeri/multi_ai_governance.json") : null;
  const activeLeader = multiAiState && Array.isArray(multiAiState.leader_sessions)
    ? multiAiState.leader_sessions.find((item) => item.session_id === multiAiState.active_leader_session_id) || multiAiState.leader_sessions.find((item) => item.status === "active") || null
    : null;
  state.priorities_last_reviewed_at = new Date().toISOString();
  return {
    report_type: "evolution_development_priorities",
    generated_at: new Date().toISOString(),
    audience: appMode ? "app_developer" : "framework_owner",
    status: openPriorities.some((item) => !["deferred", "rejected"].includes(item.status)) ? "active" : "complete",
    priorities: combinedPriorities,
    open_priorities: openPriorities,
    archived_priorities: archivedPriorities,
    deferred_bucket: deferredBucket,
    deferred_ideas: deferredSummary,
    temporary_priorities: temporaryReport.status === "empty" ? null : temporaryReport.queue,
    roadmap: buildKVDFFeatureRestructureRoadmap({ appMode }),
    multi_ai: multiAiState ? {
      status: activeLeader ? "active" : "idle",
      active_leader_session_id: activeLeader ? activeLeader.session_id : null,
      active_leader_ai_id: activeLeader ? activeLeader.leader_ai_id : null,
      active_queues: Array.isArray(multiAiState.worker_queues) ? multiAiState.worker_queues.filter((item) => item.status === "active").length : 0
    } : null,
    next_priority: openPriorities.find((item) => !["deferred", "rejected"].includes(item.status)) || null
  };
}

function localizeEvolutionPriority(priority, options = {}) {
  const appMode = Boolean(options.appMode);
  if (!appMode || !priority) return priority;
  return {
    ...priority,
    execution_details: buildEvolutionPriorityExecutionDetails(priority, { appMode })
  };
}

function buildEvolutionNextAction(next, options = {}) {
  if (!next) return null;
  const appMode = Boolean(options.appMode);
  const commandPrefix = options.commandPrefix || (appMode ? "kvdf evolution app" : "kvdf evolution");
  if (next.status === "planned") {
    if (next.id === "evo-auto-005-durable-task-details") {
      return `Activate the priority with \`${commandPrefix} priority evo-auto-005-durable-task-details --status in_progress\`, then run \`${commandPrefix} temp\` and expand each task and deferred idea with durable execution details before handing work to tools.`;
    }
    return `Activate ${next.id} with \`${commandPrefix} priority ${next.id} --status in_progress\`, then run \`${commandPrefix} temp\` to generate the execution queue and start from the current slice.`;
  }
  if (next.status === "in_progress") {
    return `Run \`${commandPrefix} temp\` for ${next.id} before any implementation, docs, or tests, then advance slices as each execution-grade task is completed.`;
  }
  if (next.status === "blocked") {
    return `Clear blockers for ${next.id} before advancing it again.`;
  }
  return `Review ${next.id} and update its status as needed.`;
}

function renderEvolutionDeferredIdeasResult(result, table) {
  if (result.report_type === "evolution_deferred_idea_added") {
    return `Deferred idea added: ${result.idea.idea_id} - ${result.idea.title}`;
  }
  if (result.report_type === "evolution_deferred_idea_restored") {
    return `Deferred idea restored: ${result.idea.idea_id} -> ${result.change.change_id}`;
  }
  if (result.report_type === "evolution_feature_request_placement") {
    return renderEvolutionFeatureRequestPlacement(result, table);
  }
  if (result.report_type === "evolution_deferred_ideas") {
    const rows = result.ideas.map((item) => [item.idea_id, item.status, item.title, item.created_at || ""]);
    return [
      result.audience === "app_developer" ? "Kabeeri Deferred App Ideas" : "Kabeeri Deferred Development Ideas",
      table(["Idea", "Status", "Title", "Created"], rows.length ? rows : [["", "", "No deferred ideas.", ""]]),
      "",
      `Open: ${result.open}/${result.total}`
    ].join("\n");
  }
  return JSON.stringify(result, null, 2);
}

function renderEvolutionPriorities(report, table) {
  const openRows = (report.open_priorities || []).map((item) => [
    item.priority,
    item.id,
    item.status,
    item.title
  ]);
  const archivedRows = (report.archived_priorities || []).map((item) => [
    item.priority,
    item.id,
    item.status,
    item.title
  ]);
  const tempRows = report.temporary_priorities ? report.temporary_priorities.slices.map((slice) => [
    slice.order,
    slice.slice_id,
    slice.state,
    slice.title
  ]) : [];
  const deferredRow = report.deferred_bucket ? [
    "Deferred bucket:",
    table(["#", "ID", "Status", "Title"], [[
      report.deferred_bucket.priority,
      report.deferred_bucket.id,
      report.deferred_bucket.status,
      report.deferred_bucket.title
    ]]),
    ""
  ].join("\n") : "";
  const roadmapRows = report.roadmap ? report.roadmap.roadmap.map((step) => [
    step.order,
    step.id,
    step.title,
    step.done_definition
  ]) : [];
  return [
    report.audience === "app_developer" ? "Kabeeri App Evolution Priorities" : "Kabeeri Evolution Development Priorities",
    "Open priorities:",
    table(["#", "ID", "Status", "Title"], openRows.length ? openRows : [[ "", "", "No open priorities.", "" ]]),
    "",
    archivedRows.length ? [
      "Archived priorities:",
      table(["#", "ID", "Status", "Title"], archivedRows),
      ""
    ].join("\n") : "",
    "",
    report.roadmap ? [
      "KVDF Feature Restructure Roadmap",
      table(["#", "ID", "Capability", "Done Definition"], roadmapRows),
      ""
    ].join("\n") : "",
    report.temporary_priorities ? [
      "Temporary Execution Priorities",
      table(["#", "ID", "Status", "Title"], tempRows),
      ""
    ].join("\n") : "",
    deferredRow,
    `Multi-AI sync: ${report.multi_ai ? `${report.multi_ai.status} (${report.multi_ai.active_queues} active queues)` : "none"}`,
    `Next: ${report.next_priority ? `${report.next_priority.id} - ${report.next_priority.title}` : "none"}`
  ].join("\n");
}

function buildEvolutionExecutionReport(state, readJsonFile, fileExists, options = {}) {
  ensureEvolutionDevelopmentPriorities(state);
  ensureEvolutionTemporaryPriorities(state);
  const appMode = Boolean(options.appMode);
  const commandPrefix = options.commandPrefix || (appMode ? "kvdf evolution app" : "kvdf evolution");
  const prioritiesReport = buildEvolutionPrioritiesReport(state, readJsonFile, fileExists, { appMode });
  const openPriorities = prioritiesReport.open_priorities || [];
  const requestedId = String(options.reportId || "").trim();
  const targetPriority = requestedId
    ? prioritiesReport.priorities.find((item) => item.id === requestedId) || null
    : prioritiesReport.next_priority || openPriorities[0] || null;
  const executionDetails = targetPriority ? buildEvolutionPriorityExecutionDetails(targetPriority, { appMode, commandPrefix }) : null;
  const nextAction = targetPriority ? buildEvolutionNextAction(targetPriority, { appMode, commandPrefix }) : null;
  const temporaryQueue = prioritiesReport.temporary_priorities;
  const reportPath = getEvolutionExecutionReportPath(targetPriority ? targetPriority.id : "execution-report");
  const currentTaskIds = targetPriority
    ? (readStateArray(".kabeeri/tasks.json", "tasks").filter((task) => task.evolution_change_id === targetPriority.id).map((task) => task.id))
    : [];
  const report = {
    report_type: "evolution_execution_report",
    generated_at: new Date().toISOString(),
    audience: appMode ? "app_developer" : "framework_owner",
    status: targetPriority ? (targetPriority.status === "done" ? "complete" : targetPriority.status === "in_progress" ? "active" : "ready") : "empty",
    report_path: reportPath,
    requested_priority_id: requestedId || null,
    target_priority: targetPriority,
    target_priority_execution_details: executionDetails,
    next_priority: prioritiesReport.next_priority || null,
    next_exact_action: nextAction,
    resume_command: targetPriority ? `${commandPrefix} priority ${targetPriority.id} --status in_progress` : null,
    current_change_id: state.current_change_id || null,
    current_temp_queue: temporaryQueue ? {
      queue_id: temporaryQueue.queue_id,
      source_priority_id: temporaryQueue.source_priority_id,
      current_slice: temporaryQueue.current_slice ? temporaryQueue.current_slice.title : null,
      status: temporaryQueue.status
    } : null,
    priority_summary: {
      total: prioritiesReport.priorities ? prioritiesReport.priorities.length : 0,
      open: openPriorities.length
    },
    linked_task_ids: currentTaskIds,
    report_commands: targetPriority ? [
      `${commandPrefix} report ${targetPriority.id}`,
      `${commandPrefix} report ${targetPriority.id} --json`,
      `${commandPrefix} priority ${targetPriority.id} --status in_progress`,
      `${commandPrefix} temp`
    ] : []
  };

  if (targetPriority && executionDetails) {
    report.execution_summary = executionDetails.execution_summary;
    report.resume_steps = executionDetails.resume_steps;
    report.required_inputs = executionDetails.required_inputs;
    report.expected_outputs = executionDetails.expected_outputs;
    report.do_not_change = executionDetails.do_not_change;
    report.verification_commands = executionDetails.verification_commands;
  }

  if (!targetPriority) {
    report.message = "No open execution target is available.";
  } else if (targetPriority.status === "planned") {
    report.message = `Prepare ${targetPriority.id} for execution, then move it to in_progress before implementation starts.`;
  } else if (targetPriority.status === "in_progress") {
    report.message = `Continue ${targetPriority.id} from the current temporary execution slice.`;
  } else if (targetPriority.status === "done") {
    report.message = `Priority ${targetPriority.id} is complete; keep this report for resume context or archive it with the finished improvement.`;
  } else {
    report.message = `Review ${targetPriority.id} and update its status as needed.`;
  }

  return report;
}

function renderEvolutionExecutionReport(report, tableRenderer = () => "") {
  if (!report.target_priority) {
    return [
      report.audience === "app_developer" ? "Kabeeri App Execution Report" : "Kabeeri Evolution Execution Report",
      "",
      report.message || "No open execution target is available.",
      "",
      `Report path: ${report.report_path}`
    ].join("\n");
  }

  const priority = report.target_priority;
  const executionDetails = report.target_priority_execution_details || {};
  const renderList = (label, values) => {
    if (!Array.isArray(values) || values.length === 0) return [];
    return [label, ...values.map((item) => `- ${item}`), ""];
  };
  const renderText = (label, value) => value ? [label, value, ""] : [];
  return [
    report.audience === "app_developer" ? "Kabeeri App Execution Report" : "Kabeeri Evolution Execution Report",
    "",
    `Priority: ${priority.id} - ${priority.title}`,
    `Status: ${priority.status}`,
    `Report path: ${report.report_path}`,
    `Message: ${report.message}`,
    "",
    tableRenderer(["Field", "Value"], [
      ["Execution summary", report.execution_summary || executionDetails.execution_summary || "n/a"],
      ["Resume command", report.resume_command || "n/a"],
      ["Next exact action", report.next_exact_action || "n/a"],
      ["Current change", report.current_change_id || "none"],
      ["Linked tasks", report.linked_task_ids.length ? report.linked_task_ids.join(", ") : "none"],
      ["Open priorities", `${report.priority_summary.open}/${report.priority_summary.total}`]
    ]),
    "",
    "Resume steps:",
    ...((report.resume_steps || executionDetails.resume_steps || []).map((step) => `- ${step}`)),
    "",
    "Verification commands:",
    ...((report.verification_commands || executionDetails.verification_commands || []).map((command) => `- ${command}`)),
    "",
    ...renderText("Context:", executionDetails.execution_context),
    ...renderText("Explanation:", executionDetails.explanation),
    ...renderText("Source package:", executionDetails.source_package ? `${executionDetails.source_package}${Array.isArray(executionDetails.source_package_roles) && executionDetails.source_package_roles.length ? ` (${executionDetails.source_package_roles.join(", ")})` : ""}` : null),
    ...renderList("Cleanup prerequisites:", executionDetails.cleanup_prerequisites),
    ...renderList("Cleanup checklist:", executionDetails.cleanup_checklist),
    ...renderList("Guardrails:", executionDetails.guardrails),
    ...renderList("Validation flow:", executionDetails.validation_flow),
    ...renderList("Rollback plan:", executionDetails.rollback_plan),
    ...renderList("Expected artifacts:", executionDetails.expected_artifacts),
    report.current_temp_queue ? `Temporary queue: ${report.current_temp_queue.source_priority_id} (${report.current_temp_queue.status})` : "Temporary queue: none",
    report.next_priority ? `Next priority: ${report.next_priority.id} - ${report.next_priority.title}` : "Next priority: none"
  ].join("\n");
}

function buildEvolutionBatchExecutionReport(state, readJsonFile, writeJsonFile, fileExists, options = {}) {
  ensureEvolutionDevelopmentPriorities(state);
  const appMode = Boolean(options.appMode);
  const commandPrefix = options.commandPrefix || (appMode ? "kvdf evolution app" : "kvdf evolution");
  const autoAssigneeId = resolveEvolutionBatchAutoAssignee(readJsonFile, fileExists, options);
  const taskStatuses = new Set(
    String(options.statuses || "approved,ready")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  );
  const tasksFile = ".kabeeri/tasks.json";
  const tasksState = fileExists(tasksFile) ? readJsonFile(tasksFile) : { tasks: [] };
  tasksState.tasks = Array.isArray(tasksState.tasks) ? tasksState.tasks : [];
  const autoAssignedTaskIds = [];
  const now = new Date().toISOString();
  for (const taskItem of tasksState.tasks) {
    if (!taskStatuses.has(String(taskItem.status || "").toLowerCase())) continue;
    if (taskItem.assignee_id) continue;
    taskItem.assignee_id = autoAssigneeId;
    taskItem.assigned_at = taskItem.assigned_at || now;
    taskItem.assignment_source = taskItem.assignment_source || "evolution_batch_auto_assignee";
    taskItem.updated_at = now;
    autoAssignedTaskIds.push(taskItem.id);
  }
  if (autoAssignedTaskIds.length > 0) {
    writeJsonFile(tasksFile, tasksState);
  }
  const tasks = tasksState.tasks;
  const candidates = tasks
    .filter((taskItem) => taskStatuses.has(String(taskItem.status || "").toLowerCase()))
    .map((taskItem, index) => {
      const lifecycle = buildTaskLifecycleState(taskItem);
      const blockers = [];
      if (lifecycle.current_stage === "blocked") blockers.push("blocked_stage");
      if (String(taskItem.status || "").toLowerCase() === "approved" && !taskItem.assignee_id) blockers.push("missing_assignee");
      if (Array.isArray(taskItem.allowed_files) && taskItem.allowed_files.length === 0) blockers.push("missing_allowed_files");
      return {
        order_index: index,
        id: taskItem.id,
        title: taskItem.title || "",
        status: taskItem.status || "unknown",
        workstream: taskItem.workstream || (Array.isArray(taskItem.workstreams) ? taskItem.workstreams[0] : null) || null,
        evolution_change_id: taskItem.evolution_change_id || null,
        assignee_id: taskItem.assignee_id || null,
        created_at: taskItem.created_at || null,
        lifecycle_stage: lifecycle.current_stage,
        lifecycle_next_action: lifecycle.next_action,
        lifecycle_statuses: lifecycle.next_statuses || [],
        blockers,
        next_command: taskItem.assignee_id
          ? `kvdf task start ${taskItem.id} --actor ${taskItem.assignee_id}`
          : `kvdf task assign ${taskItem.id} --assignee <id>`,
        resume_command: `kvdf task status ${taskItem.id}`
      };
    })
    .sort((left, right) => {
      const leftCreated = left.created_at || "";
      const rightCreated = right.created_at || "";
      if (leftCreated && rightCreated && leftCreated !== rightCreated) return String(leftCreated).localeCompare(String(rightCreated));
      if (leftCreated && !rightCreated) return -1;
      if (!leftCreated && rightCreated) return 1;
      if (left.order_index !== right.order_index) return Number(left.order_index || 0) - Number(right.order_index || 0);
      return String(left.id || "").localeCompare(String(right.id || ""));
    });

  const blockedTasks = candidates.filter((item) => item.blockers.length > 0);
  const readyTasks = candidates.filter((item) => item.blockers.length === 0);
  const batchId = `evo-batch-${Date.now()}`;
  const report = {
    report_type: "evolution_batch_execution",
    generated_at: new Date().toISOString(),
    audience: appMode ? "app_developer" : "framework_owner",
    command_prefix: commandPrefix,
    batch_id: batchId,
    mode: "continue_until_blocked",
    requested_statuses: Array.from(taskStatuses),
    current_change_id: state.current_change_id || null,
    auto_assignee_id: autoAssignedTaskIds.length > 0 ? autoAssigneeId : null,
    auto_assigned_task_ids: autoAssignedTaskIds,
    summary: {
      total_candidates: candidates.length,
      ready_total: readyTasks.length,
      blocked_total: blockedTasks.length,
      next_task_id: readyTasks[0] ? readyTasks[0].id : null,
      next_command: readyTasks[0] ? readyTasks[0].next_command : null,
      stop_conditions: ["blocker", "scope_conflict", "STOP"]
    },
    ready_tasks: readyTasks,
    blocked_tasks: blockedTasks,
    execution_steps: readyTasks.map((taskItem, index) => ({
      order: index + 1,
      task_id: taskItem.id,
      title: taskItem.title,
      status: taskItem.status,
      workstream: taskItem.workstream,
      next_command: taskItem.next_command,
      resume_command: taskItem.resume_command
    })),
    next_actions: readyTasks.slice(0, 8).map((taskItem) => taskItem.next_command),
    batch_state_path: ".kabeeri/reports/evolution_batch_execution.json"
  };

  if (blockedTasks.length > 0) {
    report.status = "blocked";
    report.message = `Batch execution paused because ${blockedTasks.length} task(s) still have blockers before execution can continue.`;
  } else if (readyTasks.length > 0) {
    report.status = "ready";
    report.message = `Batch execution can continue through ${readyTasks.length} ready task(s) in priority order without stopping after each task.`;
  } else {
    report.status = "empty";
    report.message = "No approved or ready tasks are available for batch execution.";
  }

  return report;
}

function resolveEvolutionBatchAutoAssignee(readJsonFile, fileExists, options = {}) {
  const explicit = String(options.autoAssigneeId || options.assignee || options["auto-assignee"] || "").trim();
  if (explicit) return explicit;
  const multiAiFile = ".kabeeri/multi_ai_governance.json";
  if (fileExists(multiAiFile)) {
    try {
      const state = readJsonFile(multiAiFile);
      const activeSessionId = state.active_leader_session_id || null;
      const sessions = Array.isArray(state.leader_sessions) ? state.leader_sessions : [];
      const activeSession = sessions.find((item) => item.session_id === activeSessionId && item.status === "active")
        || sessions.find((item) => item.status === "active")
        || null;
      const leaderId = activeSession ? String(activeSession.leader_ai_id || "").trim() : "";
      if (leaderId) return leaderId;
    } catch (error) {
      return "codex";
    }
  }
  return "codex";
}

function renderEvolutionBatchExecutionReport(report, tableRenderer = () => "") {
  const readyRows = (report.ready_tasks || []).map((item) => [
    item.id,
    item.status,
    item.workstream || "",
    item.next_command || ""
  ]);
  const blockedRows = (report.blocked_tasks || []).map((item) => [
    item.id,
    item.status,
    (item.blockers || []).join(", "),
    item.next_command || ""
  ]);
  return [
    report.audience === "app_developer" ? "Kabeeri App Batch Execution" : "Evolution Batch Execution",
    "",
    `Batch ID: ${report.batch_id}`,
    `Current change: ${report.current_change_id || "none"}`,
    `Mode: ${report.mode}`,
    `Status: ${report.status}`,
    `Message: ${report.message}`,
    `Batch state path: ${report.batch_state_path}`,
    `Auto assignee: ${report.auto_assignee_id || "none"}`,
    "",
    tableRenderer(["Field", "Value"], [
      ["Ready tasks", String(report.summary.ready_total || 0)],
      ["Blocked tasks", String(report.summary.blocked_total || 0)],
      ["Total candidates", String(report.summary.total_candidates || 0)],
      ["Next task", report.summary.next_task_id || "none"],
      ["Next command", report.summary.next_command || "none"]
    ]),
    "",
    "Ready tasks:",
    readyRows.length ? tableRenderer(["Task", "Status", "Workstream", "Next command"], readyRows) : "No ready tasks.",
    "",
    "Blocked tasks:",
    blockedRows.length ? tableRenderer(["Task", "Status", "Blockers", "Next command"], blockedRows) : "No blocked tasks.",
    "",
    "Execution steps:",
    ...(report.execution_steps && report.execution_steps.length
      ? report.execution_steps.map((step) => `${step.order}. ${step.task_id} -> ${step.next_command}`)
      : ["- none"]),
    "",
    "Stop conditions:",
    ...(report.summary.stop_conditions || []).map((item) => `- ${item}`)
  ].join("\n");
}

function renderEvolutionRoadmap(report, table) {
  const rows = (report.roadmap || []).map((step) => [
    step.order,
    step.id,
    step.title,
    step.done_definition
  ]);
  return [
    report.audience === "app_developer" ? "Kabeeri App Restructure Roadmap" : "KVDF Feature Restructure Roadmap",
    `Source: ${report.source || "unknown"}`,
    `Coverage policy: ${report.coverage_policy || "full_task_coverage"}`,
    "",
    table(["#", "ID", "Capability", "Done Definition"], rows)
  ].join("\n");
}

function renderEvolutionCapabilityPartitionMatrix(report, table) {
  return renderKVDFFeaturePartitionMatrix(report, table);
}

function inferEvolutionImpactedAreas(description, flags = {}, deps = {}) {
  const { parseCsv = (value) => String(value || "").split(",").map((item) => item.trim()).filter(Boolean) } = deps;
  const explicit = parseCsv(flags.areas || flags.area || "");
  if (explicit.length) return orderEvolutionAreas(explicit.map(normalizeEvolutionArea).filter(Boolean));
  const text = String(description || "").toLowerCase();
  const areas = new Set(["implementation", "tasks", "tests", "docs", "capabilities", "changelog"]);
  if (/cli|command|kvdf|help|terminal/.test(text)) areas.add("cli");
  if (/dashboard|live|json|monitor|state/.test(text)) areas.add("dashboard");
  if (/schema|contract|json state|validation|validate/.test(text)) areas.add("schemas");
  if (/report|readiness|governance/.test(text)) areas.add("reports");
  if (/github|release|publish/.test(text)) areas.add("release");
  if (/prompt|ai|vibe|question|intake|token|cost/.test(text)) areas.add("ai_context");
  return orderEvolutionAreas(Array.from(areas));
}

function normalizeEvolutionArea(area) {
  const value = String(area || "").trim().toLowerCase().replace(/[_\s]+/g, "-");
  const aliases = {
    runtime: "implementation",
    code: "implementation",
    source: "implementation",
    task: "tasks",
    tracking: "tasks",
    doc: "docs",
    documentation: "docs",
    capability: "capabilities",
    capabilitymap: "capabilities",
    schema: "schemas",
    validation: "schemas",
    report: "reports",
    "live-report": "reports",
    "live-reports": "reports",
    "ai-context": "ai_context",
    ai: "ai_context",
    prompts: "ai_context",
    releases: "release"
  };
  return aliases[value] || value;
}

function orderEvolutionAreas(areas) {
  const order = ["implementation", "cli", "tasks", "schemas", "dashboard", "reports", "ai_context", "docs", "capabilities", "tests", "changelog", "release"];
  const normalized = [...new Set((areas || []).map(normalizeEvolutionArea).filter((area) => evolutionAreaDefinition(area, false)))];
  return normalized.sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

function evolutionAreaDefinition(area, required = true) {
  const definitions = {
    implementation: {
      label: "runtime implementation",
      workstream: "backend",
      files: ["src/cli/", "src/cli/workspace.js"],
      acceptance: ["Runtime behavior implements the requested Kabeeri capability.", "The implementation updates live state instead of relying on chat memory."]
    },
    cli: {
      label: "CLI surface and help",
      workstream: "docs",
      files: ["src/cli/index.js", "src/cli/ui.js", "docs/cli/CLI_COMMAND_REFERENCE.md"],
      acceptance: ["The kvdf command surface is documented.", "Command help explains when and why to use the capability."]
    },
    tasks: {
      label: "task tracking integration",
      workstream: "docs",
      files: [".kabeeri/tasks.json", "knowledge/task_tracking/", "knowledge/task_tracking/TASK_GOVERNANCE.md"],
      acceptance: ["The update creates or links follow-up tasks.", "Task source and acceptance criteria identify the framework change."]
    },
    schemas: {
      label: "runtime schemas and validation",
      workstream: "qa",
      files: ["schemas/runtime/", "schemas/runtime/schema_registry.json", "src/cli/validate.js"],
      acceptance: ["New or changed runtime state has schema coverage.", "`kvdf validate runtime-schemas` can validate the state."]
    },
    dashboard: {
      label: "dashboard and live JSON surfaces",
      workstream: "admin_frontend",
      files: ["docs/reports/dashboard/", "src/cli/index.js", ".kabeeri/dashboard/"],
      acceptance: ["Dashboard state includes the update where operationally useful.", "The state can be refreshed after the change."]
    },
    reports: {
      label: "readiness/governance reports",
      workstream: "qa",
      files: [".kabeeri/reports/", "src/cli/index.js", "docs/internal/LIVE_JSON_REPORTS.md"],
      acceptance: ["Live reports summarize the update state.", "Action items show unfinished dependent work."]
    },
    ai_context: {
      label: "AI context and prompt guidance",
      workstream: "docs",
      files: ["knowledge/vibe_ux/", "packs/prompt_packs/", "README.md", "README_AR.md"],
      acceptance: ["AI assistants know how the capability affects their workflow.", "Prompt/context guidance avoids bypassing Kabeeri governance."]
    },
    docs: {
      label: "human documentation",
      workstream: "docs",
      files: ["docs/", "knowledge/"],
      acceptance: ["Human docs explain the capability, purpose, workflow, and source of truth.", "Arabic/English documentation is updated where the site exposes the capability."]
    },
    capabilities: {
      label: "capabilities reference",
      workstream: "docs",
      files: ["docs/SYSTEM_CAPABILITIES_REFERENCE.md", "docs/site/assets/js/app.js"],
      acceptance: ["The central capability map lists the new or changed capability.", "Docs site capability pages expose the capability to developers."]
    },
    tests: {
      label: "automated tests",
      workstream: "qa",
      files: ["tests/"],
      acceptance: ["Integration tests cover the new command/state behavior.", "`npm test` passes."]
    },
    changelog: {
      label: "changelog and owner state",
      workstream: "docs",
      files: ["CHANGELOG.md", "OWNER_DEVELOPMENT_STATE.md"],
      acceptance: ["CHANGELOG records the framework change.", "Owner development state is updated when the change affects future continuation."]
    },
    release: {
      label: "release and publishing guidance",
      workstream: "qa",
      files: ["docs/production/", "CHANGELOG.md"],
      acceptance: ["Release notes/gates mention any publishing impact.", "No release/publish step proceeds before validation."]
    }
  };
  const definition = definitions[area];
  if (!definition && required) throw new Error(`Unknown evolution area: ${area}`);
  return definition || null;
}

function findExistingCapabilityMatches(description, fileExists, readTextFile) {
  const capabilityText = fileExists("docs/SYSTEM_CAPABILITIES_REFERENCE.md")
    ? readTextFile("docs/SYSTEM_CAPABILITIES_REFERENCE.md").toLowerCase()
    : "";
  const words = significantWords(description);
  return words
    .filter((word) => capabilityText.includes(word))
    .slice(0, 12);
}

function findExistingEvolutionMatches(state, description) {
  const words = significantWords(description);
  return (state.changes || [])
    .filter((change) => {
      const text = `${change.title || ""} ${change.description || ""}`.toLowerCase();
      return words.filter((word) => text.includes(word)).length >= Math.min(3, words.length);
    })
    .slice(0, 5)
    .map((change) => ({ change_id: change.change_id, title: change.title, status: change.status }));
}

function significantWords(value) {
  const stop = new Set(["add", "new", "the", "and", "for", "with", "from", "into", "system", "feature", "kabeeri", "kvdf", "عايز", "نظام", "ميزة"]);
  return String(value || "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}_]+/u)
    .map((word) => word.trim())
    .filter((word) => word.length >= 4 && !stop.has(word))
    .slice(0, 20);
}

function getOpenDeferredIdeas(state) {
  return (state.deferred_ideas || []).filter((item) => item.status === "deferred");
}

function nextDeferredIdeaId(items) {
  return `deferred-${String((items || []).length + 1).padStart(3, "0")}`;
}

function buildDeferredIdeaExecutionDetails(ideaId, title, options = {}) {
  const appMode = Boolean(options.appMode);
  const commandPrefix = options.commandPrefix || (appMode ? "kvdf evolution app" : "kvdf evolution");
  return {
    execution_summary: `Deferred idea ${ideaId} (${title}) is preserved for later review and must not be implemented until restored into Evolution.`,
    resume_steps: [
      `Run \`${commandPrefix} deferred restore ${ideaId} --confirm-placement\` only after ${appMode ? "developer" : "Owner"} approval.`,
      "Review duplicate capability risk before creating implementation tasks.",
      "Use the restored Evolution change and generated tasks as the execution source.",
      "Keep this deferred record as history after restore."
    ],
    required_inputs: [
      `Deferred idea id: ${ideaId}`,
      `Idea title: ${title}`,
      "Owner restore decision"
    ],
    expected_outputs: [
      "Either the idea remains deferred with analysis intact, or it is restored into a normal Evolution change.",
      "No implementation happens directly from the deferred idea record."
    ],
    do_not_change: [
      "Do not edit product/runtime code for a deferred idea before restore.",
      "Do not delete the deferred idea to save context.",
      "Do not treat analysis_summary as execution approval."
    ],
    verification_commands: ["npm run kvdf -- evolution deferred --json"]
  };
}

function buildDeferredIdeasPriorityItem(priorities, summary, options = {}) {
  const maxPriority = priorities.reduce((max, item) => Math.max(max, Number(item.priority || 0)), 0);
  return {
    id: "evo-deferred-ideas",
    priority: maxPriority + 1,
    title: options.appMode ? "Deferred app ideas" : "Deferred development ideas",
    summary: `${summary.open} deferred idea(s). Review with ${options.appMode ? "kvdf evolution app deferred --json" : "kvdf evolution deferred --json"}; restore selected ideas explicitly before implementation.`,
    source: "deferred_ideas_store",
    status: "deferred",
    count: summary.open,
    latest_idea_id: summary.latest ? summary.latest.idea_id : null,
    execution_details: {
      execution_summary: options.appMode
        ? "Review deferred ideas as candidates only; do not execute them until the developer restores a selected idea into Evolution."
        : "Review deferred ideas as candidates only; do not execute them until the Owner restores a selected idea into Evolution.",
      resume_steps: [
        options.appMode ? "Run `kvdf evolution app deferred --json` to list open ideas." : "Run `kvdf evolution deferred --json` to list open ideas.",
        "Compare the idea against the capability map and current priorities.",
        options.appMode ? "Restore only the selected idea with explicit developer placement confirmation." : "Restore only the selected idea with explicit Owner placement confirmation.",
        "Let the restored idea create a normal Evolution change and scoped tasks before implementation."
      ],
      required_inputs: ["Deferred idea id", "Owner placement decision", "Capability duplicate review"],
      expected_outputs: ["A restored Evolution change or a decision to keep the idea deferred."],
      do_not_change: ["Do not implement directly from the deferred bucket.", "Do not reorder active priorities while reviewing deferred ideas."],
      verification_commands: [options.appMode ? "npm run kvdf -- evolution app priorities" : "npm run kvdf -- evolution priorities"]
    }
  };
}

function renderEvolutionSummary(summary) {
  const temp = summary.temporary_priority_queue;
  return [
    summary.audience === "app_developer" ? "Kabeeri App Evolution" : "Evolution Steward",
    "",
    `Status: ${summary.status}`,
    `Changes: ${summary.changes_total}`,
    `Open follow-up tasks: ${summary.open_follow_up_tasks}`,
    `Development priorities: ${summary.open_priorities}/${summary.priorities_total} open`,
    `Deferred ideas: ${summary.open_deferred_ideas}/${summary.deferred_ideas_total} open`,
    `Scorecards: ${summary.scorecards_total || 0} total (${summary.scorecards_open || 0} open)`,
    `Temporary priority queue: ${temp ? `${temp.queue_id} (${temp.open_slices}/${temp.total_slices} open)` : "none"}`,
    `Multi-AI orchestration: ${summary.multi_ai ? `${summary.multi_ai.status} (${summary.multi_ai.active_queues} active queues)` : "none"}`,
    `Restructure roadmap: ${summary.feature_restructure_work_order ? `${summary.feature_restructure_work_order.total_steps} steps` : "none"}`,
    `Capability partition matrix: ${summary.capability_partition_matrix ? `${summary.capability_partition_matrix.total_capabilities} capabilities` : "none"}`,
    `Plugin loader: ${summary.plugin_loader ? `${summary.plugin_loader.active_plugins} active plugins` : "none"}`,
    `Next priority: ${summary.next_priority ? summary.next_priority.title : "none"}`,
    `Current change: ${summary.current_change_id || "none"}`
  ].join("\n");
}

function updateEvolutionPriority(state, id, flags = {}) {
  const priority = state.development_priorities.find((item) => item.id === id || String(item.priority) === String(id));
  if (!priority) throw new Error(`Evolution priority not found: ${id}`);
  if (!flags.status && !flags.note && !flags.notes && !flags.summary) return priority;
  const status = flags.status ? String(flags.status).toLowerCase().replace(/-/g, "_") : null;
  const allowed = new Set(["planned", "in_progress", "blocked", "done", "deferred", "rejected"]);
  if (status && !allowed.has(status)) throw new Error("Invalid priority status. Use planned, in_progress, blocked, done, deferred, or rejected.");
  if (status) priority.status = status;
  const note = flags.note || flags.notes || flags.summary;
  if (note && note !== true) {
    priority.notes = priority.notes || [];
    priority.notes.push({ at: new Date().toISOString(), text: String(note) });
  }
  priority.updated_at = new Date().toISOString();
  buildEvolutionSummary(state);
  return priority;
}

module.exports = { evolution };
