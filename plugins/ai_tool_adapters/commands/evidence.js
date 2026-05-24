const fs = require("fs");
const path = require("path");

const runner = require("./tool_runner");

const DEFAULT_LIMIT = 10;

function buildEvidenceReport(options = {}) {
  const runId = normalizeRunId(options.runId || options.run || null);
  const limit = Number(options.limit) > 0 ? Number(options.limit) : DEFAULT_LIMIT;
  const snapshot = readRunEvidenceSnapshot();
  const latestRuns = summarizeRuns(snapshot.events.slice(-limit), limit);
  const selectedRun = runId ? findRun(snapshot.events, runId) : null;
  const report = {
    report_type: "ai_tool_adapters_evidence",
    plugin_id: "ai_tool_adapters",
    status: snapshot.error ? "warning" : (runId ? (selectedRun ? "available" : "warning") : (snapshot.events.length ? "available" : "warning")),
    found: Boolean(selectedRun),
    filter_run_id: runId,
    count: snapshot.events.length,
    latest_runs: latestRuns,
    matched_runs: selectedRun ? [summarizeRun(selectedRun)] : [],
    run: selectedRun ? summarizeRun(selectedRun) : null,
    warnings: snapshot.warnings.slice(),
    next_action: buildNextAction(runId, selectedRun, snapshot.events.length, snapshot.warnings)
  };
  return report;
}

function readRunEvidenceSnapshot() {
  try {
    const file = path.join(process.cwd(), runner.RUNS_FILE);
    if (!fs.existsSync(file)) {
      return {
        events: [],
        warnings: ["AI tool run evidence log is missing."],
        error: null
      };
    }
    return {
      events: runner.readRunEvents(),
      warnings: [],
      error: null
    };
  } catch (error) {
    return {
      events: [],
      warnings: [`Unable to read AI tool run evidence: ${error.message}`],
      error: error.message
    };
  }
}

function summarizeRuns(runs, limit = DEFAULT_LIMIT) {
  return (Array.isArray(runs) ? runs : []).slice(-limit).reverse().map((run) => summarizeRun(run));
}

function summarizeRun(run) {
  if (!run) return null;
  return {
    run_id: run.run_id,
    event_id: run.event_id,
    contract_id: run.contract_id ?? null,
    tool_id: run.tool_id ?? null,
    task_id: run.task_id ?? null,
    assignment_id: run.assignment_id ?? null,
    status: run.status,
    command: run.command,
    args_count: Number.isFinite(Number(run.args_count)) ? Number(run.args_count) : 0,
    working_directory: run.working_directory,
    started_at: run.started_at ?? null,
    ended_at: run.ended_at ?? null,
    duration_ms: Number.isFinite(Number(run.duration_ms)) ? Number(run.duration_ms) : 0,
    exit_code: run.exit_code ?? null,
    signal: run.signal ?? null,
    stdout_excerpt: run.stdout_excerpt ?? "",
    stderr_excerpt: run.stderr_excerpt ?? "",
    redactions_applied: Array.isArray(run.redactions_applied) ? run.redactions_applied.slice() : [],
    policy_checks: Array.isArray(run.policy_checks) ? run.policy_checks.slice() : [],
    error: run.error ?? null
  };
}

function findRun(events, runId) {
  return (Array.isArray(events) ? events : []).find((event) => event.run_id === runId || event.event_id === runId) || null;
}

function normalizeRunId(value) {
  const normalized = String(value || "").trim();
  return normalized ? normalized : null;
}

function buildNextAction(runId, selectedRun, totalRuns, warnings) {
  if (runId && selectedRun) {
    return "Review the selected run evidence and policy checks.";
  }
  if (runId && !selectedRun) {
    return "Run ai-tool-adapter runs or repeat the governed contract to create matching evidence.";
  }
  if (totalRuns > 0) {
    return "Use kvdf ai-tool-adapter evidence --run <run-id> to inspect one run in detail.";
  }
  if (warnings.length) {
    return warnings[0];
  }
  return "Run a governed contract to create evidence.";
}

function renderEvidenceText(report) {
  return [
    "AI Tool Adapter Evidence",
    `Status: ${report.status}`,
    `Total runs: ${report.count}`,
    report.filter_run_id ? `Filter: ${report.filter_run_id}` : "Filter: latest runs",
    ...(report.run ? [
      `Selected run: ${report.run.run_id}`,
      `Selected status: ${report.run.status}`,
      `Selected tool: ${report.run.tool_id}`
    ] : []),
    ...(report.latest_runs.length ? ["Latest runs:", ...report.latest_runs.map((run) => `- ${run.run_id}: ${run.status} (${run.tool_id || "unknown"})`)] : ["Latest runs: none"]),
    ...(report.warnings.length ? ["Warnings:", ...report.warnings.map((item) => `- ${item}`)] : []),
    `Next action: ${report.next_action}`
  ].join("\n");
}

module.exports = {
  buildEvidenceReport,
  renderEvidenceText,
  readRunEvidenceSnapshot,
  summarizeRuns,
  summarizeRun,
  findRun
};
