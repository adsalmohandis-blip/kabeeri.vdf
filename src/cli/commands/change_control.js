const { fileExists, readJsonFile, writeJsonFile } = require("../fs_utils");
const { ensureWorkspace } = require("../workspace");
const { readStateArray } = require("../services/state_utils");
const { buildTraceabilityReport } = require("./traceability");

const CHANGE_CONTROL_FILE = ".kabeeri/reports/change_control_report.json";

function changeControl(action, value, flags = {}, rest = [], deps = {}) {
  ensureWorkspace();
  const report = buildChangeControlReport(deps);
  writeJsonFile(CHANGE_CONTROL_FILE, report);

  if (!action || ["report", "status", "show", "list"].includes(String(action).toLowerCase())) {
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderChangeControlReport(report));
    return;
  }

  throw new Error(`Unknown change control action: ${action}`);
}

function buildChangeControlReport(deps = {}) {
  const tasks = readStateArray(".kabeeri/tasks.json", "tasks");
  const evolution = readEvolutionState();
  const structured = readStructuredState();
  const traceability = fileExists(".kabeeri/reports/traceability_report.json")
    ? readJsonFile(".kabeeri/reports/traceability_report.json")
    : buildTraceabilityReport(deps);

  const evolutionChanges = Array.isArray(evolution.changes) ? evolution.changes : [];
  const structuredChanges = Array.isArray(structured.change_requests) ? structured.change_requests : [];
  const structuredRisks = Array.isArray(structured.risks) ? structured.risks : [];
  const openEvolutionChanges = evolutionChanges.filter((item) => !["verified", "closed"].includes(String(item.status || "").toLowerCase()));
  const openStructuredChanges = structuredChanges.filter((item) => String(item.status || "").toLowerCase() === "proposed");
  const openRisks = structuredRisks.filter((item) => String(item.status || "").toLowerCase() === "open");
  const highRisks = openRisks.filter((item) => ["high", "critical"].includes(String(item.severity || "").toLowerCase()));
  const mitigatedRisks = structuredRisks.filter((item) => String(item.status || "").toLowerCase() === "mitigated");
  const linkedTasks = tasks.filter((task) => task.evolution_change_id || task.source_reference || task.assessment_id);

  return {
    report_type: "change_control_report",
    generated_at: new Date().toISOString(),
    source: ".kabeeri",
    report_path: CHANGE_CONTROL_FILE,
    summary: {
      evolution_changes_total: evolutionChanges.length,
      open_evolution_changes: openEvolutionChanges.length,
      structured_change_requests_total: structuredChanges.length,
      open_change_requests: openStructuredChanges.length,
      risks_total: structuredRisks.length,
      open_risks: openRisks.length,
      high_risk_open: highRisks.length,
      mitigated_risks: mitigatedRisks.length,
      linked_tasks: linkedTasks.length,
      traceability_gaps: traceability.summary ? Number(traceability.summary.trace_gaps || 0) : 0
    },
    source_of_truth: {
      structured: fileExists(".kabeeri/structured.json"),
      evolution: fileExists(".kabeeri/evolution.json"),
      traceability: fileExists(".kabeeri/reports/traceability_report.json")
    },
    evolution_changes: evolutionChanges.map((item) => ({
      change_id: item.change_id,
      title: item.title,
      status: item.status,
      impacted_areas: Array.isArray(item.impacted_areas) ? item.impacted_areas : [],
      task_ids: Array.isArray(item.task_ids) ? item.task_ids : [],
      duplicate_risk: item.duplicate_risk || "unknown"
    })).slice(0, 50),
    structured_change_requests: structuredChanges.map((item) => ({
      change_id: item.change_id,
      title: item.title,
      status: item.status,
      impact: item.impact || "medium",
      requirement_id: item.requirement_id || null,
      phase_id: item.phase_id || null,
      reason: item.reason || "",
      decision: item.decision || null
    })).slice(0, 50),
    risks: structuredRisks.map((item) => ({
      risk_id: item.risk_id,
      title: item.title,
      severity: item.severity || "medium",
      status: item.status || "open",
      owner_id: item.owner_id || null,
      mitigation: item.mitigation || "",
      requirement_id: item.requirement_id || null,
      phase_id: item.phase_id || null
    })).slice(0, 50),
    traceability_summary: traceability.summary || {},
    next_actions: buildChangeControlNextActions({ openEvolutionChanges, openStructuredChanges, openRisks, highRisks, traceability })
  };
}

function renderChangeControlReport(report) {
  return [
    "Change Control Report",
    "",
    `Generated at: ${report.generated_at || "unknown"}`,
    `Evolution changes: ${report.summary.evolution_changes_total || 0}`,
    `Open evolution changes: ${report.summary.open_evolution_changes || 0}`,
    `Structured change requests: ${report.summary.structured_change_requests_total || 0}`,
    `Open change requests: ${report.summary.open_change_requests || 0}`,
    `Risks: ${report.summary.risks_total || 0}`,
    `Open risks: ${report.summary.open_risks || 0}`,
    `High open risks: ${report.summary.high_risk_open || 0}`,
    `Mitigated risks: ${report.summary.mitigated_risks || 0}`,
    `Linked tasks: ${report.summary.linked_tasks || 0}`,
    `Traceability gaps: ${report.summary.traceability_gaps || 0}`,
    "",
    "Source of truth:",
    ...(report.source_of_truth ? Object.entries(report.source_of_truth).map(([key, value]) => `- ${key}: ${value ? "present" : "missing"}`) : ["- none"]),
    "",
    "Next actions:",
    ...(report.next_actions && report.next_actions.length ? report.next_actions.map((item) => `- ${item}`) : ["- none"]),
    "",
    "Open evolution changes:",
    ...(report.evolution_changes && report.evolution_changes.length ? report.evolution_changes.filter((item) => item.status !== "verified" && item.status !== "closed").slice(0, 10).map((item) => `- ${item.change_id}: ${item.title} (${item.status})`) : ["- none"]),
    "",
    "Open structured change requests:",
    ...(report.structured_change_requests && report.structured_change_requests.length ? report.structured_change_requests.filter((item) => item.status === "proposed").slice(0, 10).map((item) => `- ${item.change_id}: ${item.title} (${item.impact})`) : ["- none"]),
    "",
    "Open risks:",
    ...(report.risks && report.risks.length ? report.risks.filter((item) => item.status === "open").slice(0, 10).map((item) => `- ${item.risk_id}: ${item.title} (${item.severity})`) : ["- none"])
  ].join("\n");
}

function buildChangeControlNextActions(context) {
  const actions = [];
  if (context.openEvolutionChanges.length) actions.push(`verify or close ${context.openEvolutionChanges.length} evolution change(s)`);
  if (context.openStructuredChanges.length) actions.push(`approve or reject ${context.openStructuredChanges.length} structured change request(s)`);
  if (context.openRisks.length) actions.push(`mitigate ${context.openRisks.length} open risk(s)`);
  if (context.highRisks.length) actions.push(`resolve ${context.highRisks.length} high/critical risk(s) before release`);
  if (context.traceability && context.traceability.summary && context.traceability.summary.trace_gaps) actions.push("reduce traceability gaps before treating the change set as stable");
  if (actions.length === 0) actions.push("change control is healthy");
  return actions;
}

function readStructuredState() {
  return fileExists(".kabeeri/structured.json")
    ? readJsonFile(".kabeeri/structured.json")
    : { change_requests: [], risks: [] };
}

function readEvolutionState() {
  return fileExists(".kabeeri/evolution.json")
    ? readJsonFile(".kabeeri/evolution.json")
    : { changes: [], current_change_id: null };
}

module.exports = {
  CHANGE_CONTROL_FILE,
  buildChangeControlNextActions,
  buildChangeControlReport,
  changeControl,
  renderChangeControlReport
};
