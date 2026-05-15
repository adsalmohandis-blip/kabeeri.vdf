const { fileExists, readJsonFile, writeJsonFile } = require("../fs_utils");
const { ensureWorkspace } = require("../workspace");
const { readStateArray } = require("../services/state_utils");
const { buildTaskLifecycleState } = require("./task_lifecycle");
const { readTaskAssessmentsState } = require("./task_assessment");

const TRACEABILITY_FILE = ".kabeeri/reports/traceability_report.json";

function traceability(action, value, flags = {}, rest = [], deps = {}) {
  ensureWorkspace();
  const report = buildTraceabilityReport(deps);
  writeJsonFile(TRACEABILITY_FILE, report);

  if (!action || ["report", "status", "show", "list"].includes(String(action).toLowerCase())) {
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderTraceabilityReport(report));
    return;
  }

  throw new Error(`Unknown traceability action: ${action}`);
}

function buildTraceabilityReport(deps = {}) {
  const readAiRuns = deps.readAiRuns || (() => []);
  const buildAdrAiRunTraceReport = deps.buildAdrAiRunTraceReport || defaultBuildAdrAiRunTraceReport;
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const features = readStateArray(".kabeeri/features.json", "features");
  const journeys = readStateArray(".kabeeri/journeys.json", "journeys");
  const adrs = readStateArray(".kabeeri/adr/records.json", "adrs");
  const assessmentsState = readTaskAssessmentsState();
  const assessments = Array.isArray(assessmentsState.assessments) ? assessmentsState.assessments : [];
  const aiRuns = readAiRuns();
  const adrTrace = buildAdrAiRunTraceReport(adrs, aiRuns);
  const taskLinks = tasks.map((task) => {
    const lifecycle = buildTaskLifecycleState(task);
    const assessment = assessments.find((item) => item.task_id === task.id || item.assessment_id === task.assessment_id) || null;
    const sourceKind = inferTraceSourceKind(task.source, task.source_reference);
    const verificationCommands = Array.isArray(task.verification_commands) ? task.verification_commands : [];
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      source: task.source || "manual",
      source_kind: sourceKind.kind,
      source_reference: sourceKind.reference,
      lifecycle_stage: lifecycle.current_stage,
      lifecycle_next_action: lifecycle.next_action,
      assessment_id: assessment ? assessment.assessment_id : task.assessment_id || null,
      assessment_status: assessment ? assessment.status : task.assessment_status || null,
      assessment_readiness: assessment ? assessment.readiness : task.assessment_readiness || null,
      assessment_next_actions: assessment ? assessment.recommended_next_actions || [] : [],
      has_memory: Boolean(task.memory),
      has_verification: Boolean(task.verified_at || task.completed_at || verificationCommands.length),
      verification_commands: verificationCommands,
      related_adrs: Array.isArray(task.related_adrs) ? task.related_adrs : [],
      related_ai_runs: Array.isArray(task.related_ai_runs) ? task.related_ai_runs : [],
      evidence: buildTaskEvidence(task)
    };
  });
  const unassessedTasks = taskLinks.filter((item) => ["proposed", "approved", "ready", "assigned"].includes(item.status) && !item.assessment_id);
  const unverifiedTasks = taskLinks.filter((item) => ["proposed", "approved", "ready", "assigned", "in_progress", "blocked"].includes(item.status) && !item.verification_commands.length && !item.has_verification);
  const unlinkedFeatures = features.filter((item) => !Array.isArray(item.tasks) || item.tasks.length === 0);
  const unlinkedJourneys = journeys.filter((item) => !Array.isArray(item.tasks) || item.tasks.length === 0);
  const unlinkedAdrs = adrs.filter((item) => !(Array.isArray(item.related_tasks) && item.related_tasks.length) && !(Array.isArray(item.related_ai_runs) && item.related_ai_runs.length));
  const unlinkedAiRuns = (aiRuns || []).filter((item) => !(Array.isArray(item.related_adrs) && item.related_adrs.length));
  const docsState = {
    command_reference: fileExists("docs/cli/CLI_COMMAND_REFERENCE.md"),
    capability_reference: fileExists("docs/SYSTEM_CAPABILITIES_REFERENCE.md"),
    task_governance: fileExists("knowledge/task_tracking/TASK_GOVERNANCE.md"),
    task_assessment: fileExists("knowledge/task_tracking/TASK_ASSESSMENT.md"),
    task_lifecycle: fileExists("knowledge/task_tracking/TASK_STATES.md")
  };
  const testLinks = taskLinks.flatMap((item) => item.verification_commands.map((command, index) => ({
    node_id: `${item.id}:test:${index + 1}`,
    task_id: item.id,
    command,
    command_type: classifyVerificationCommand(command)
  })));
  const edges = buildTraceabilityEdges({ taskLinks, assessments, adrs, aiRuns, testLinks, adrTrace });
  const generatedAt = new Date().toISOString();
  return {
    report_type: "traceability_report",
    trace_id: `traceability-${generatedAt.replace(/[-:.TZ]/g, "").slice(0, 14)}`,
    generated_at: generatedAt,
    source: ".kabeeri",
    report_path: TRACEABILITY_FILE,
    summary: {
      tasks_total: tasks.length,
      tasks_with_assessments: taskLinks.filter((item) => item.assessment_id).length,
      tasks_with_verification: taskLinks.filter((item) => item.has_verification).length,
      open_tasks: tasks.filter((item) => !["owner_verified", "rejected", "done", "closed"].includes(item.status)).length,
      verified_tasks: tasks.filter((item) => item.status === "owner_verified").length,
      features_total: features.length,
      journeys_total: journeys.length,
      adrs_total: adrs.length,
      adr_links_total: adrTrace.summary.linked_ai_runs || 0,
      ai_runs_linked_to_adrs: adrTrace.summary.linked_ai_runs || 0,
      ai_runs_total: aiRuns.length,
      tests_total: testLinks.length,
      trace_edges_total: edges.length,
      tasks_with_evidence: taskLinks.filter((item) => item.evidence.length).length,
      accepted_adrs: adrs.filter((item) => ["accepted", "approved", "implemented"].includes(String(item.status || "").toLowerCase())).length,
      docs_source_truth: Object.values(docsState).every(Boolean),
      trace_gaps: unassessedTasks.length + unverifiedTasks.length + unlinkedFeatures.length + unlinkedJourneys.length + unlinkedAdrs.length + unlinkedAiRuns.length + adrTrace.summary.unlinked_ai_runs
    },
    docs_state: docsState,
    gaps: {
      unassessed_tasks: unassessedTasks.map((item) => ({ id: item.id, title: item.title, status: item.status, lifecycle_stage: item.lifecycle_stage })),
      unverified_tasks: unverifiedTasks.map((item) => ({ id: item.id, title: item.title, status: item.status, verification_commands: item.verification_commands })),
      unlinked_features: unlinkedFeatures.map((item) => ({ id: item.id, title: item.title, readiness: item.readiness || item.status || "unknown" })),
      unlinked_journeys: unlinkedJourneys.map((item) => ({ id: item.id, name: item.name, status: item.status || "draft" })),
      unlinked_adrs: unlinkedAdrs.map((item) => ({ id: item.adr_id, title: item.title, status: item.status })),
      unlinked_ai_runs: unlinkedAiRuns.map((item) => ({ id: item.run_id, status: item.status, task_id: item.task_id || null }))
    },
    links: {
      tasks: taskLinks,
      assessments: assessments.map((item) => ({
        assessment_id: item.assessment_id,
        task_id: item.task_id,
        readiness: item.readiness,
        status: item.status,
        created_at: item.created_at
      })).slice(0, 50),
      adrs: adrTrace.adr_trace || [],
      ai_runs: normalizeAiRunLinks(aiRuns),
      tests: testLinks.slice(0, 100),
      edges: edges.slice(0, 200)
    },
    next_actions: buildTraceabilityNextActions({ docsState, unassessedTasks, unverifiedTasks, unlinkedFeatures, unlinkedJourneys, unlinkedAdrs, unlinkedAiRuns, adrTrace })
  };
}

function renderTraceabilityReport(report) {
  return [
    "Traceability Report",
    "",
    `Generated at: ${report.generated_at || "unknown"}`,
    `Trace id: ${report.trace_id || "unknown"}`,
    `Tasks: ${report.summary.tasks_total || 0}`,
    `Tasks with assessments: ${report.summary.tasks_with_assessments || 0}`,
    `Tasks with verification: ${report.summary.tasks_with_verification || 0}`,
    `Open tasks: ${report.summary.open_tasks || 0}`,
    `Verified tasks: ${report.summary.verified_tasks || 0}`,
    `Features: ${report.summary.features_total || 0}`,
    `Journeys: ${report.summary.journeys_total || 0}`,
    `ADRs: ${report.summary.adrs_total || 0}`,
    `AI runs: ${report.summary.ai_runs_total || 0}`,
    `Trace edges: ${report.summary.trace_edges_total || 0}`,
    `Docs source truth: ${report.summary.docs_source_truth ? "yes" : "no"}`,
    `Trace gaps: ${report.summary.trace_gaps || 0}`,
    "",
    "Docs source truth:",
    ...(report.docs_state ? Object.entries(report.docs_state).map(([key, value]) => `- ${key}: ${value ? "present" : "missing"}`) : ["- none"]),
    "",
    "Next actions:",
    ...(report.next_actions && report.next_actions.length ? report.next_actions.map((item) => `- ${item}`) : ["- none"]),
    "",
    "Unassessed tasks:",
    ...(report.gaps && report.gaps.unassessed_tasks && report.gaps.unassessed_tasks.length ? report.gaps.unassessed_tasks.slice(0, 10).map((item) => `- ${item.id}: ${item.title} (${item.status})`) : ["- none"]),
    "",
    "Unverified tasks:",
    ...(report.gaps && report.gaps.unverified_tasks && report.gaps.unverified_tasks.length ? report.gaps.unverified_tasks.slice(0, 10).map((item) => `- ${item.id}: ${item.title} (${item.status})`) : ["- none"]),
    "",
    "Unlinked features:",
    ...(report.gaps && report.gaps.unlinked_features && report.gaps.unlinked_features.length ? report.gaps.unlinked_features.slice(0, 10).map((item) => `- ${item.id}: ${item.title}`) : ["- none"]),
    "",
    "Unlinked journeys:",
    ...(report.gaps && report.gaps.unlinked_journeys && report.gaps.unlinked_journeys.length ? report.gaps.unlinked_journeys.slice(0, 10).map((item) => `- ${item.id}: ${item.name}`) : ["- none"]),
    "",
    "Unlinked ADRs:",
    ...(report.gaps && report.gaps.unlinked_adrs && report.gaps.unlinked_adrs.length ? report.gaps.unlinked_adrs.slice(0, 10).map((item) => `- ${item.id}: ${item.title} (${item.status || "unknown"})`) : ["- none"]),
    "",
    "Unlinked AI runs:",
    ...(report.gaps && report.gaps.unlinked_ai_runs && report.gaps.unlinked_ai_runs.length ? report.gaps.unlinked_ai_runs.slice(0, 10).map((item) => `- ${item.id}: ${item.status || "unknown"}${item.task_id ? ` (task ${item.task_id})` : ""}`) : ["- none"]),
    "",
    "Sample trace edges:",
    ...(report.links && report.links.edges && report.links.edges.length ? report.links.edges.slice(0, 10).map((item) => `- ${item.from_type}:${item.from_id} -> ${item.to_type}:${item.to_id}`) : ["- none"])
  ].join("\n");
}

function buildTraceabilityNextActions(context) {
  const actions = [];
  if (!context.docsState.command_reference || !context.docsState.capability_reference) actions.push("repair docs source-of-truth surfaces");
  if (context.unassessedTasks.length) actions.push(`run kvdf task assessment for ${context.unassessedTasks.length} open task(s)`);
  if (context.unverifiedTasks.length) actions.push(`add verification commands for ${context.unverifiedTasks.length} open task(s)`);
  if (context.unlinkedFeatures.length) actions.push(`link ${context.unlinkedFeatures.length} feature(s) to governed tasks`);
  if (context.unlinkedJourneys.length) actions.push(`link ${context.unlinkedJourneys.length} journey record(s) to governed tasks`);
  if (context.unlinkedAdrs.length) actions.push(`link ${context.unlinkedAdrs.length} ADR(s) to related tasks or AI runs`);
  if (context.unlinkedAiRuns.length || (context.adrTrace && context.adrTrace.summary && context.adrTrace.summary.unlinked_ai_runs)) actions.push(`link AI runs to ADRs or mark them as intentionally task-only`);
  if (actions.length === 0) actions.push("traceability is healthy");
  return actions;
}

function buildTraceabilityEdges(context = {}) {
  const edges = [];
  for (const task of context.taskLinks || []) {
    if (task.assessment_id) edges.push({ from_type: "task", from_id: task.id, to_type: "assessment", to_id: task.assessment_id, relation: "has_assessment" });
    for (const command of task.verification_commands || []) edges.push({ from_type: "task", from_id: task.id, to_type: "test", to_id: `${task.id}:test:${stableCommandToken(command)}`, relation: "verified_by" });
    if (task.source_kind === "evolution" && task.source_reference) edges.push({ from_type: "task", from_id: task.id, to_type: "evolution", to_id: task.source_reference, relation: "derived_from" });
    if (task.source_kind === "structured_requirement" && task.source_reference) edges.push({ from_type: "task", from_id: task.id, to_type: "requirement", to_id: task.source_reference, relation: "derived_from" });
    if (task.source_kind === "adr" && task.source_reference) edges.push({ from_type: "task", from_id: task.id, to_type: "adr", to_id: task.source_reference, relation: "derived_from" });
    for (const adrId of task.related_adrs || []) edges.push({ from_type: "task", from_id: task.id, to_type: "adr", to_id: adrId, relation: "linked_to" });
    for (const runId of task.related_ai_runs || []) edges.push({ from_type: "task", from_id: task.id, to_type: "ai_run", to_id: runId, relation: "linked_to" });
  }
  for (const adr of context.adrs || []) {
    for (const taskId of adr.related_tasks || []) edges.push({ from_type: "adr", from_id: adr.adr_id, to_type: "task", to_id: taskId, relation: "references_task" });
    for (const runId of adr.related_ai_runs || []) edges.push({ from_type: "adr", from_id: adr.adr_id, to_type: "ai_run", to_id: runId, relation: "references_ai_run" });
  }
  for (const run of context.aiRuns || []) {
    for (const adrId of run.related_adrs || []) edges.push({ from_type: "ai_run", from_id: run.run_id, to_type: "adr", to_id: adrId, relation: "supports" });
    if (run.task_id) edges.push({ from_type: "ai_run", from_id: run.run_id, to_type: "task", to_id: run.task_id, relation: "executed_for" });
  }
  for (const test of context.testLinks || []) {
    edges.push({ from_type: "task", from_id: test.task_id, to_type: "test", to_id: test.node_id, relation: "verification_command" });
  }
  return uniqueEdges(edges);
}

function buildTaskEvidence(task) {
  const evidence = [];
  if (task.source) evidence.push(`source:${task.source}`);
  if (task.source_reference) evidence.push(`source_reference:${task.source_reference}`);
  if (task.assessment_id) evidence.push(`assessment:${task.assessment_id}`);
  if (task.completed_at) evidence.push(`completed_at:${task.completed_at}`);
  if (task.verified_at) evidence.push(`verified_at:${task.verified_at}`);
  if (Array.isArray(task.verification_commands) && task.verification_commands.length) evidence.push(...task.verification_commands.map((command) => `verify:${command}`));
  return uniqueList(evidence);
}

function inferTraceSourceKind(source, sourceReference) {
  const value = String(source || "").toLowerCase();
  const reference = sourceReference || null;
  if (value.startsWith("evolution:")) return { kind: "evolution", reference: reference || source.split(":").slice(1).join(":") || null };
  if (value === "structured_requirement" || value.startsWith("requirement:")) return { kind: "structured_requirement", reference: reference || source.split(":").slice(1).join(":") || null };
  if (value.startsWith("adr:")) return { kind: "adr", reference: reference || source.split(":").slice(1).join(":") || null };
  if (value.startsWith("questionnaire")) return { kind: "questionnaire", reference };
  if (!value) return { kind: "manual", reference };
  return { kind: value, reference };
}

function classifyVerificationCommand(command) {
  const value = String(command || "").toLowerCase();
  if (value.includes("npm test") || value.includes("node --test")) return "test";
  if (value.includes("validate")) return "validation";
  if (value.includes("conflict")) return "conflict-scan";
  if (value.includes("task")) return "task-check";
  return "check";
}

function stableCommandToken(command) {
  return String(command || "").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "check";
}

function uniqueList(values) {
  return [...new Set((values || []).map((item) => String(item).trim()).filter(Boolean))];
}

function uniqueEdges(edges) {
  const seen = new Set();
  const out = [];
  for (const edge of edges || []) {
    const key = [edge.from_type, edge.from_id, edge.to_type, edge.to_id, edge.relation].join("::");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(edge);
  }
  return out;
}

function normalizeAiRunLinks(aiRuns) {
  return (aiRuns || []).slice(0, 50).map((item) => ({
    run_id: item.run_id,
    task_id: item.task_id || null,
    status: item.status,
    related_adrs: Array.isArray(item.related_adrs) ? item.related_adrs : [],
    source_reference: item.source_reference || null,
    related_task: item.task_id || null,
    related_adr_count: Array.isArray(item.related_adrs) ? item.related_adrs.length : 0
  }));
}

function defaultBuildAdrAiRunTraceReport(adrs, runs) {
  const runsById = Object.fromEntries((runs || []).map((item) => [item.run_id, item]));
  const adrTrace = (adrs || []).map((adrItem) => {
    const linkedRuns = (adrItem.related_ai_runs || []).map((runId) => runsById[runId]).filter(Boolean);
    return {
      adr_id: adrItem.adr_id,
      title: adrItem.title,
      status: adrItem.status,
      impact: adrItem.impact || "",
      tasks: adrItem.related_tasks || [],
      run_ids: linkedRuns.map((item) => item.run_id),
      runs_total: linkedRuns.length,
      accepted_runs: linkedRuns.filter((item) => item.status === "accepted").length,
      rejected_runs: linkedRuns.filter((item) => item.status === "rejected").length,
      unreviewed_runs: linkedRuns.filter((item) => !["accepted", "rejected"].includes(item.status)).length,
      tokens: linkedRuns.reduce((sum, item) => sum + Number(item.total_tokens || 0), 0),
      cost: linkedRuns.reduce((sum, item) => sum + Number(item.cost || 0), 0),
      decision: adrItem.decision
    };
  });
  const linkedRunIds = new Set(adrTrace.flatMap((item) => item.run_ids));
  const runsWithAdrField = new Set((runs || []).flatMap((item) => item.related_adrs || []).filter(Boolean));
  const unlinkedRuns = (runs || []).filter((item) => !linkedRunIds.has(item.run_id) && !(item.related_adrs || []).length);
  const openHighImpact = (adrs || []).filter((item) => item.status === "proposed" && ["critical", "high"].includes(item.impact || ""));
  const warnings = [];
  if (openHighImpact.length) warnings.push(`${openHighImpact.length} high-impact ADR(s) still need approval.`);
  if (unlinkedRuns.length) warnings.push(`${unlinkedRuns.length} AI run(s) are not linked to any ADR. This is fine for task-only work but weak for durable decisions.`);
  if (runsWithAdrField.size && !linkedRunIds.size) warnings.push("Some AI runs declare ADR links; run `kvdf ai-run link` if ADR records do not show them.");
  return {
    trace_id: `adr-ai-run-trace-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`,
    generated_at: new Date().toISOString(),
    status: openHighImpact.length ? "needs_attention" : "pass",
    summary: {
      adrs_total: (adrs || []).length,
      approved_adrs: (adrs || []).filter((item) => item.status === "approved").length,
      ai_runs_total: (runs || []).length,
      linked_ai_runs: linkedRunIds.size,
      unlinked_ai_runs: unlinkedRuns.length,
      open_high_impact_adrs: openHighImpact.length
    },
    warnings,
    adr_trace: adrTrace,
    unlinked_run_ids: unlinkedRuns.map((item) => item.run_id),
    next_actions: buildAdrAiRunTraceNextActions(openHighImpact, unlinkedRuns)
  };
}

function buildAdrAiRunTraceNextActions(openHighImpact, unlinkedRuns) {
  const actions = [];
  if (openHighImpact.length) actions.push("Approve, reject, or supersede high-impact ADRs before treating architecture as stable.");
  if (unlinkedRuns.length) actions.push("For AI runs that shaped architecture, run `kvdf ai-run link <run-id> --adr <adr-id>`.");
  if (!actions.length) actions.push("Continue using ADRs for durable decisions and AI run reviews for accepted/rejected output history.");
  return actions;
}

module.exports = {
  TRACEABILITY_FILE,
  buildTraceabilityReport,
  buildTraceabilityNextActions,
  renderTraceabilityReport,
  traceability
};
