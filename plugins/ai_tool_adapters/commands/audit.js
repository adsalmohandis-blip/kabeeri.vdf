const fs = require("fs");
const path = require("path");

const provider = require("../provider");
const registry = require("./tool_registry");
const runner = require("./tool_runner");

const POLICY_RESULTS_FILE = ".kabeeri/ai_tool_policy_results.json";
const DEFAULT_LIMIT = 5;

function buildAuditReport(options = {}) {
  const limit = Number(options.limit) > 0 ? Number(options.limit) : DEFAULT_LIMIT;
  const stateSnapshot = readStateSnapshot();
  const runSnapshot = readRunSnapshot();
  const policySnapshot = readPolicyResultsSnapshot();
  const tools = Array.isArray(stateSnapshot.state.tools) ? stateSnapshot.state.tools : [];
  const summary = {
    tools_count: tools.length,
    registered_tools: tools.filter((tool) => tool.status === "registered").length,
    execution_enabled_tools: tools.filter((tool) => Boolean(tool.execution_enabled)).length,
    runs_count: runSnapshot.events.length,
    policy_results_count: policySnapshot.results.length,
    blocked_runs: runSnapshot.events.filter((run) => run.status === "blocked").length,
    failed_runs: runSnapshot.events.filter((run) => run.status === "failed").length,
    policy_blockers: policySnapshot.results.filter((result) => ["blocked", "fail"].includes(String(result.status || "").toLowerCase())).length
  };
  const warnings = [
    ...stateSnapshot.warnings,
    ...runSnapshot.warnings,
    ...policySnapshot.warnings
  ];
  const findings = buildFindings(stateSnapshot, runSnapshot, policySnapshot, summary);
  const status = summary.policy_blockers > 0 || warnings.length > 0 ? "warning" : "pass";
  return {
    report_type: "ai_tool_adapters_audit",
    generated_at: new Date().toISOString(),
    plugin_id: "ai_tool_adapters",
    status,
    summary,
    findings,
    latest_runs: summarizeRuns(runSnapshot.events, limit),
    latest_policy_results: summarizePolicyResults(policySnapshot.results, limit),
    warnings,
    next_actions: buildNextActions(summary, warnings, findings)
  };
}

function readStateSnapshot() {
  try {
    const file = registry.getStatePath();
    if (!fs.existsSync(file)) {
      return {
        exists: false,
        state: registry.createDefaultState(),
        warnings: ["AI tool registry state is missing."]
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
      return {
        exists: false,
        events: [],
        warnings: ["AI tool run evidence log is missing."]
      };
    }
    return {
      exists: true,
      events: runner.readRunEvents(),
      warnings: []
    };
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
      return {
        exists: false,
        results: [],
        warnings: ["AI tool policy results file is missing."]
      };
    }
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    return {
      exists: true,
      results: Array.isArray(data.results) ? data.results.map((item) => normalizePolicyResult(item)) : [],
      warnings: []
    };
  } catch (error) {
    return {
      exists: false,
      results: [],
      warnings: [`Unable to read AI tool policy results: ${error.message}`]
    };
  }
}

function buildFindings(stateSnapshot, runSnapshot, policySnapshot, summary) {
  const findings = [];
  findings.push({
    finding_id: "registry-tools",
    status: summary.tools_count > 0 ? "pass" : "warn",
    message: summary.tools_count > 0 ? "Tool registry contains entries." : "No tools have been registered yet."
  });
  findings.push({
    finding_id: "execution-enabled",
    status: summary.execution_enabled_tools > 0 ? "pass" : "warn",
    message: summary.execution_enabled_tools > 0 ? "At least one registered tool can be enabled for governed execution." : "No registered tools are execution-enabled yet."
  });
  findings.push({
    finding_id: "run-evidence",
    status: runSnapshot.events.length > 0 ? "pass" : "warn",
    message: runSnapshot.events.length > 0 ? "Run evidence is present." : "Run evidence log is empty or missing."
  });
  findings.push({
    finding_id: "policy-results",
    status: policySnapshot.results.length > 0 ? "pass" : "warn",
    message: policySnapshot.results.length > 0 ? "Policy results have been recorded." : "No policy results have been recorded yet."
  });
  findings.push({
    finding_id: "policy-blockers",
    status: summary.policy_blockers > 0 ? "warn" : "pass",
    message: summary.policy_blockers > 0 ? `${summary.policy_blockers} policy result(s) are blocked or failed.` : "No policy result blockers are present."
  });
  findings.push({
    finding_id: "provider-api",
    status: typeof provider.buildAdapterProviderReport === "function" ? "pass" : "fail",
    message: typeof provider.buildAdapterProviderReport === "function" ? "Provider API is available." : "Provider API is unavailable."
  });
  findings.push({
    finding_id: "state-read-only",
    status: stateSnapshot.exists ? "pass" : "warn",
    message: stateSnapshot.exists ? "Registry state file is present." : "Registry state file is missing; visibility uses defaults."
  });
  return findings;
}

function summarizeRuns(runs, limit = DEFAULT_LIMIT) {
  return (Array.isArray(runs) ? runs : []).slice(-limit).reverse().map((run) => ({
    run_id: run.run_id,
    status: run.status,
    tool_id: run.tool_id ?? null,
    command: run.command,
    working_directory: run.working_directory,
    duration_ms: Number.isFinite(Number(run.duration_ms)) ? Number(run.duration_ms) : 0,
    error: run.error ?? null
  }));
}

function summarizePolicyResults(results, limit = DEFAULT_LIMIT) {
  return (Array.isArray(results) ? results : []).slice(-limit).reverse().map((result) => ({
    policy_result_id: result.policy_result_id,
    status: result.status,
    tool_id: result.tool_id ?? null,
    contract_id: result.contract_id ?? null,
    generated_at: result.generated_at,
    blockers: Array.isArray(result.blockers) ? result.blockers.slice() : []
  }));
}

function buildNextActions(summary, warnings, findings) {
  if (summary.tools_count === 0) {
    return ["Run kvdf ai-tool-adapter scan --json to detect local AI tools."];
  }
  if (summary.policy_blockers > 0) {
    return ["Review the blocked policy results before attempting a governed run."];
  }
  if (summary.runs_count === 0) {
    return ["Run kvdf ai-tool-adapter policy --contract <path> and then run with --confirm after owner approval."];
  }
  if (warnings.length) {
    return [warnings[0]];
  }
  if (findings.some((item) => item.status === "warn")) {
    return ["Review the warning findings before enabling additional tools."];
  }
  return ["AI tool adapter audit is current."];
}

function normalizePolicyResult(result = {}) {
  return {
    policy_result_id: String(result.policy_result_id || result.result_id || "").trim() || "ai-tool-policy-000",
    contract_id: result.contract_id === null || result.contract_id === undefined ? null : String(result.contract_id).trim() || null,
    tool_id: result.tool_id === null || result.tool_id === undefined ? null : String(result.tool_id).trim() || null,
    status: String(result.status || "blocked").trim().toLowerCase(),
    generated_at: String(result.generated_at || new Date().toISOString()),
    blockers: Array.isArray(result.blockers) ? result.blockers.map((item) => String(item)) : [],
    warnings: Array.isArray(result.warnings) ? result.warnings.map((item) => String(item)) : [],
    next_action: String(result.next_action || "").trim() || "Review the policy result."
  };
}

function renderAuditText(report) {
  return [
    "AI Tool Adapter Audit",
    `Status: ${report.status}`,
    `Tools: ${report.summary.tools_count} total, ${report.summary.execution_enabled_tools} execution-enabled`,
    `Runs: ${report.summary.runs_count} total, ${report.summary.blocked_runs} blocked, ${report.summary.failed_runs} failed`,
    `Policy results: ${report.summary.policy_results_count} total, ${report.summary.policy_blockers} blockers`,
    ...(report.findings.length ? ["Findings:", ...report.findings.map((item) => `- ${item.finding_id}: ${item.status} - ${item.message}`)] : []),
    ...(report.warnings.length ? ["Warnings:", ...report.warnings.map((item) => `- ${item}`)] : []),
    "Next actions:",
    ...(report.next_actions.length ? report.next_actions.map((item) => `- ${item}`) : ["- None."])
  ].join("\n");
}

module.exports = {
  buildAuditReport,
  renderAuditText,
  readStateSnapshot,
  readRunSnapshot,
  readPolicyResultsSnapshot,
  summarizeRuns,
  summarizePolicyResults
};
