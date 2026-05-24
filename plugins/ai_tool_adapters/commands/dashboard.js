const fs = require("fs");
const path = require("path");

const registry = require("./tool_registry");
const runner = require("./tool_runner");

const DASHBOARD_REPORT_FILE = ".kabeeri/reports/ai_tool_adapters_dashboard.json";
const POLICY_RESULTS_FILE = ".kabeeri/ai_tool_policy_results.json";
const DEFAULT_RUN_LIMIT = 5;

function buildDashboardReport(options = {}) {
  const snapshot = readStateSnapshot();
  const runsSnapshot = readRunSnapshot();
  const policySnapshot = readPolicyResultsSnapshot();
  const generatedAt = new Date().toISOString();
  const summary = buildSummary(snapshot.state, runsSnapshot.events, policySnapshot.results);
  const warnings = [
    ...snapshot.warnings,
    ...runsSnapshot.warnings,
    ...policySnapshot.warnings
  ];
  const report = {
    report_type: "ai_tool_adapters_dashboard",
    generated_at: generatedAt,
    plugin_id: "ai_tool_adapters",
    summary,
    tools: summarizeTools(snapshot.state),
    latest_runs: summarizeRuns(runsSnapshot.events, Number(options.limit) || DEFAULT_RUN_LIMIT),
    latest_policy_results: summarizePolicyResults(policySnapshot.results, Number(options.limit) || DEFAULT_RUN_LIMIT),
    warnings,
    next_actions: buildNextActions(summary, snapshot.exists, runsSnapshot.exists, policySnapshot.exists)
  };
  writeDashboardReport(report);
  return report;
}

function readStateSnapshot() {
  try {
    const file = registry.getStatePath();
    if (!fs.existsSync(file)) {
      return {
        exists: false,
        state: registry.createDefaultState(),
        warnings: ["AI tool registry state is missing; run scan or register to populate tools."]
      };
    }
    const state = registry.readState({ createIfMissing: false }) || registry.createDefaultState();
    return { exists: true, state, warnings: [] };
  } catch (error) {
    return {
      exists: false,
      state: registry.createDefaultState(),
      warnings: [`Unable to read AI tool registry state: ${error.message}`]
    };
  }
}

function readRunSnapshot() {
  try {
    const file = path.join(process.cwd(), runner.RUNS_FILE);
    if (!fs.existsSync(file)) {
      return { exists: false, events: [], warnings: ["AI tool run evidence log is missing."] };
    }
    return { exists: true, events: runner.readRunEvents(), warnings: [] };
  } catch (error) {
    return {
      exists: false,
      events: [],
      warnings: [`Unable to read AI tool run evidence: ${error.message}`]
    };
  }
}

function readPolicyResultsSnapshot() {
  try {
    const file = path.join(process.cwd(), POLICY_RESULTS_FILE);
    if (!fs.existsSync(file)) {
      return { exists: false, results: [], warnings: ["AI tool policy results file is missing."] };
    }
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    const results = Array.isArray(data.results) ? data.results.map((item) => normalizePolicyResult(item)) : [];
    return { exists: true, results, warnings: [] };
  } catch (error) {
    return {
      exists: false,
      results: [],
      warnings: [`Unable to read AI tool policy results: ${error.message}`]
    };
  }
}

function buildSummary(state, runs = [], policyResults = []) {
  const tools = Array.isArray(state.tools) ? state.tools : [];
  return {
    tools_count: tools.length,
    detected_tools: tools.filter((tool) => tool.status === "detected").length,
    registered_tools: tools.filter((tool) => tool.status === "registered").length,
    execution_enabled_tools: tools.filter((tool) => Boolean(tool.execution_enabled)).length,
    runs_count: runs.length,
    completed_runs: runs.filter((run) => run.status === "completed").length,
    blocked_runs: runs.filter((run) => run.status === "blocked").length,
    failed_runs: runs.filter((run) => run.status === "failed").length,
    policy_results_count: policyResults.length,
    policy_blockers: policyResults.filter((result) => ["blocked", "fail"].includes(String(result.status || "").toLowerCase())).length
  };
}

function summarizeTools(state) {
  const tools = Array.isArray(state.tools) ? state.tools : [];
  return tools.map((tool) => ({
    tool_id: tool.tool_id,
    platform_name: tool.platform_name ?? null,
    tool_type: tool.tool_type,
    display_name: tool.display_name,
    command: tool.command,
    resolved_command: tool.resolved_command ?? null,
    adapter_family: tool.adapter_family ?? null,
    adapter_surface: tool.adapter_surface ?? null,
    editor: tool.editor,
    status: tool.status,
    execution_enabled: Boolean(tool.execution_enabled),
    capabilities: Array.isArray(tool.capabilities) ? tool.capabilities.slice() : [],
    detected_at: tool.detected_at ?? null,
    registered_at: tool.registered_at ?? null,
    last_checked_at: tool.last_checked_at ?? null,
    notes: tool.notes ?? null
  }));
}

function summarizeRuns(runs, limit = DEFAULT_RUN_LIMIT) {
  return (Array.isArray(runs) ? runs.slice(-limit) : []).reverse().map((run) => ({
    run_id: run.run_id,
    event_id: run.event_id,
    status: run.status,
    tool_id: run.tool_id,
    contract_id: run.contract_id ?? null,
    command: run.command,
    args_count: Number.isFinite(Number(run.args_count)) ? Number(run.args_count) : 0,
    working_directory: run.working_directory,
    started_at: run.started_at ?? null,
    ended_at: run.ended_at ?? null,
    duration_ms: Number.isFinite(Number(run.duration_ms)) ? Number(run.duration_ms) : 0,
    exit_code: run.exit_code ?? null,
    signal: run.signal ?? null,
    error: run.error ?? null
  }));
}

function summarizePolicyResults(results, limit = DEFAULT_RUN_LIMIT) {
  return (Array.isArray(results) ? results.slice(-limit) : []).reverse().map((result) => ({
    policy_result_id: result.policy_result_id,
    contract_id: result.contract_id ?? null,
    tool_id: result.tool_id ?? null,
    status: result.status,
    generated_at: result.generated_at,
    blockers: Array.isArray(result.blockers) ? result.blockers.slice() : [],
    warnings: Array.isArray(result.warnings) ? result.warnings.slice() : [],
    next_action: result.next_action
  }));
}

function buildNextActions(summary, stateExists, runsExists, policyResultsExists) {
  const actions = [];
  if (!stateExists || summary.tools_count === 0) {
    actions.push("Run kvdf ai-tool-adapter scan --json to detect local AI tools.");
  }
  if (summary.execution_enabled_tools === 0) {
    actions.push("Enable a registered tool only after reviewing its policy gate and run contract.");
  }
  if (!runsExists || summary.runs_count === 0) {
    actions.push("Run a governed contract with kvdf ai-tool-adapter policy and run to collect evidence.");
  }
  if (!policyResultsExists || summary.policy_results_count === 0) {
    actions.push("Run kvdf ai-tool-adapter policy --contract <path> to capture policy results.");
  }
  if (summary.policy_blockers > 0) {
    actions.push("Review policy blockers before attempting a governed run.");
  }
  return actions.length ? actions : ["AI tool adapter visibility is current."];
}

function writeDashboardReport(report) {
  const file = path.join(process.cwd(), DASHBOARD_REPORT_FILE);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return file;
}

function renderDashboardText(report) {
  return [
    "AI Tool Adapter Dashboard",
    `Tools: ${report.summary.tools_count} total, ${report.summary.detected_tools} detected, ${report.summary.registered_tools} registered, ${report.summary.execution_enabled_tools} execution-enabled`,
    `Runs: ${report.summary.runs_count} total, ${report.summary.completed_runs} completed, ${report.summary.blocked_runs} blocked, ${report.summary.failed_runs} failed`,
    `Policy results: ${report.summary.policy_results_count} total, ${report.summary.policy_blockers} blockers`,
    ...(report.warnings.length ? ["Warnings:", ...report.warnings.map((item) => `- ${item}`)] : []),
    "Next actions:",
    ...(report.next_actions.length ? report.next_actions.map((item) => `- ${item}`) : ["- None."])
  ].join("\n");
}

function normalizePolicyResult(result = {}) {
  return {
    policy_result_id: String(result.policy_result_id || result.result_id || "").trim() || "ai-tool-policy-000",
    contract_id: result.contract_id === null || result.contract_id === undefined ? null : String(result.contract_id).trim() || null,
    tool_id: result.tool_id === null || result.tool_id === undefined ? null : String(result.tool_id).trim() || null,
    status: String(result.status || "blocked").trim().toLowerCase(),
    generated_at: String(result.generated_at || new Date().toISOString()),
    checks: Array.isArray(result.checks) ? result.checks.slice() : [],
    blockers: Array.isArray(result.blockers) ? result.blockers.map((item) => String(item)) : [],
    warnings: Array.isArray(result.warnings) ? result.warnings.map((item) => String(item)) : [],
    next_action: String(result.next_action || "").trim() || "Review the policy result."
  };
}

module.exports = {
  DASHBOARD_REPORT_FILE,
  buildDashboardReport,
  writeDashboardReport,
  renderDashboardText,
  readStateSnapshot,
  readRunSnapshot,
  readPolicyResultsSnapshot
};
