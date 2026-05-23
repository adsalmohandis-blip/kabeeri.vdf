const fs = require("fs");
const path = require("path");

const registry = require("./tool_registry");
const runner = require("./tool_runner");

const TEMPLATE_FILE = path.join(__dirname, "..", "runtime", "run_contract.template.json");

function readTemplateContract() {
  return JSON.parse(fs.readFileSync(TEMPLATE_FILE, "utf8"));
}

function createDefaultRunContract() {
  return JSON.parse(JSON.stringify(readTemplateContract()));
}

function readRunContractFromFile(contractPath) {
  if (!contractPath) return null;
  const resolved = path.resolve(process.cwd(), contractPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Run contract not found: ${contractPath}`);
  }
  return JSON.parse(fs.readFileSync(resolved, "utf8"));
}

function normalizeRunContract(contract = {}) {
  const template = createDefaultRunContract();
  const source = contract && typeof contract === "object" ? contract : {};
  return {
    ...template,
    ...source,
    contract_id: String(source.contract_id || template.contract_id || "").trim() || null,
    requested_by: normalizeRequestedBy(source.requested_by || template.requested_by),
    task_id: normalizeNullableString(source.task_id),
    assignment_id: normalizeNullableString(source.assignment_id),
    tool_id: String(source.tool_id || "").trim() || null,
    working_directory: String(source.working_directory || template.working_directory || ".").trim() || ".",
    command: String(source.command || "").trim() || null,
    args: Array.isArray(source.args) ? source.args.map((item) => String(item)) : [],
    stdin: source.stdin === null || source.stdin === undefined ? null : String(source.stdin),
    allowed_commands: Array.isArray(source.allowed_commands) ? source.allowed_commands.map((item) => String(item).trim()).filter(Boolean) : [],
    forbidden_commands: Array.isArray(source.forbidden_commands) ? source.forbidden_commands.map((item) => String(item).trim()).filter(Boolean) : template.forbidden_commands.slice(),
    allowed_files: Array.isArray(source.allowed_files) ? source.allowed_files.map((item) => String(item).trim()).filter(Boolean) : [],
    forbidden_files: Array.isArray(source.forbidden_files) ? source.forbidden_files.map((item) => String(item).trim()).filter(Boolean) : template.forbidden_files.slice(),
    timeout_seconds: Number.isFinite(Number(source.timeout_seconds)) ? Number(source.timeout_seconds) : Number(template.timeout_seconds || 900),
    capture_stdout: source.capture_stdout !== undefined ? Boolean(source.capture_stdout) : Boolean(template.capture_stdout),
    capture_stderr: source.capture_stderr !== undefined ? Boolean(source.capture_stderr) : Boolean(template.capture_stderr),
    evidence_required: source.evidence_required !== undefined ? Boolean(source.evidence_required) : Boolean(template.evidence_required)
  };
}

function normalizeRequestedBy(value) {
  const normalized = String(value || "manual").trim().toLowerCase();
  return normalized === "multi_ai_governance" ? "multi_ai_governance" : "manual";
}

function normalizeNullableString(value) {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized ? normalized : null;
}

function validateRunContract(contract, options = {}) {
  const normalized = normalizeRunContract(contract);
  const state = options.state || registry.ensureStateFile();
  const tool = normalized.tool_id ? registry.findTool(state, normalized.tool_id) : null;
  const repoRoot = path.resolve(process.cwd());
  const workingDirectory = path.resolve(repoRoot, normalized.working_directory || ".");
  const policyChecks = [];
  const blockers = [];
  const warnings = [];

  if (!normalized.contract_id) blockers.push("missing contract_id");
  else policyChecks.push("contract_id_present");

  if (!normalized.tool_id) blockers.push("missing tool_id");
  else policyChecks.push("tool_id_present");

  if (!normalized.command) blockers.push("missing command");
  else policyChecks.push("command_present");

  if (!normalized.working_directory) blockers.push("missing working_directory");
  else policyChecks.push("working_directory_present");

  if (normalized.timeout_seconds > 1800) blockers.push("timeout_seconds exceeds 1800");
  else policyChecks.push("timeout_seconds_within_limit");

  if (!Array.isArray(normalized.allowed_commands) || normalized.allowed_commands.length === 0) {
    blockers.push("allowed_commands missing");
  } else {
    policyChecks.push("allowed_commands_present");
  }

  if (normalized.command && Array.isArray(normalized.allowed_commands) && normalized.allowed_commands.length > 0 && !normalized.allowed_commands.includes(normalized.command)) {
    blockers.push("command not present in allowed_commands");
  } else if (normalized.command) {
    policyChecks.push("command_allowed");
  }

  const forbiddenToken = findForbiddenToken(normalized);
  if (forbiddenToken) blockers.push(`forbidden command token detected: ${forbiddenToken}`);
  else policyChecks.push("forbidden_tokens_clear");

  if (!fs.existsSync(workingDirectory)) {
    blockers.push(`working_directory does not exist: ${normalized.working_directory}`);
  } else {
    policyChecks.push("working_directory_exists");
    const relative = path.relative(repoRoot, workingDirectory);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      blockers.push("working_directory must be inside repo root");
    } else {
      policyChecks.push("working_directory_inside_repo_root");
    }
  }

  if (!tool) {
    blockers.push(`tool not found: ${normalized.tool_id}`);
  } else {
    policyChecks.push("tool_registered");
    if (tool.execution_enabled !== true) blockers.push(`tool execution disabled: ${tool.tool_id}`);
    else policyChecks.push("tool_execution_enabled");
    if (!matchesRegisteredToolCommand(normalized.command, tool)) {
      blockers.push("command does not match registered tool command or resolved path");
    } else {
      policyChecks.push("tool_command_matches");
    }
  }

  if (options.confirm !== true) warnings.push("missing --confirm");

  return {
    valid: blockers.length === 0,
    contract: normalized,
    tool,
    blockers,
    warnings,
    policy_checks: policyChecks,
    working_directory: workingDirectory,
    repo_root: repoRoot
  };
}

function findForbiddenToken(contract) {
  const haystack = [contract.command, ...(contract.args || [])].join(" ").toLowerCase();
  for (const token of contract.forbidden_commands || []) {
    const normalized = String(token || "").trim().toLowerCase();
    if (!normalized) continue;
    if (haystack.includes(normalized)) return token;
  }
  return null;
}

function matchesRegisteredToolCommand(command, tool) {
  if (!command || !tool) return false;
  const normalizedCommand = String(command).trim();
  if (normalizedCommand === String(tool.command || "").trim()) return true;
  if (tool.resolved_path) {
    const normalizedPath = normalizePath(tool.resolved_path);
    if (normalizePath(normalizedCommand) === normalizedPath) return true;
  }
  return false;
}

function normalizePath(value) {
  const resolved = path.resolve(String(value || "").trim());
  return process.platform === "win32" ? resolved.toLowerCase() : resolved;
}

function buildRunContractReport(contractPath, options = {}) {
  let loaded;
  try {
    loaded = readRunContractFromFile(contractPath);
  } catch (error) {
    return {
      report_type: "ai_tool_adapters_run_contract",
      plugin_id: "ai_tool_adapters",
      status: "blocked",
      contract_path: contractPath || null,
      valid: false,
      blockers: [error.message],
      warnings: [],
      policy_checks: [],
      next_action: "Provide a valid run contract file."
    };
  }
  if (!loaded) {
    return {
      report_type: "ai_tool_adapters_run_contract",
      plugin_id: "ai_tool_adapters",
      status: "blocked",
      contract_path: contractPath || null,
      valid: false,
      blockers: ["missing contract path"],
      warnings: [],
      policy_checks: [],
      next_action: "Provide --contract <path> to validate a run contract."
    };
  }
  const validation = validateRunContract(loaded, { ...options, confirm: options.confirm === true });
  return {
    report_type: "ai_tool_adapters_run_contract",
    plugin_id: "ai_tool_adapters",
    status: validation.valid ? "pass" : "blocked",
    contract_path: contractPath || null,
    contract: validation.contract,
    tool: validation.tool,
    valid: validation.valid,
    blockers: validation.blockers,
    warnings: validation.warnings,
    policy_checks: validation.policy_checks,
    next_action: validation.valid
      ? "Run kvdf ai-tool-adapters run --tool <tool-id> --contract <path> --confirm to execute the contract."
      : "Fix the blocked policy checks before running the contract."
  };
}

function buildTestReport(toolId, contractPath, options = {}) {
  const state = options.state || registry.ensureStateFile();
  const tool = toolId ? registry.findTool(state, toolId) : null;
  let contract = null;
  let contractReadError = null;
  if (contractPath) {
    try {
      contract = readRunContractFromFile(contractPath);
    } catch (error) {
      contractReadError = error.message;
    }
  }
  const validation = contract ? validateRunContract(contract, { state }) : null;
  const ready = Boolean(tool && tool.execution_enabled === true && (!validation || validation.valid));
  const blockers = [];
  const warnings = [];
  if (!toolId) blockers.push("missing tool_id");
  if (!tool) blockers.push(`tool not found: ${toolId || ""}`.trim());
  else if (tool.execution_enabled !== true) blockers.push(`tool execution disabled: ${tool.tool_id}`);
  if (contractReadError) blockers.push(contractReadError);
  if (contractPath && validation && !validation.valid) blockers.push(...validation.blockers);
  if (!contractPath) warnings.push("no contract supplied");
  return {
    report_type: "ai_tool_adapters_test",
    plugin_id: "ai_tool_adapters",
    status: blockers.length ? "blocked" : (warnings.length ? "warning" : "pass"),
    tool_id: toolId || null,
    tool,
    contract_path: contractPath || null,
    contract: validation ? validation.contract : null,
    contract_valid: validation ? validation.valid : null,
    tool_available: Boolean(tool),
    execution_enabled: Boolean(tool && tool.execution_enabled === true),
    ready_to_run: ready,
    blockers,
    warnings,
    next_action: ready
      ? "Run kvdf ai-tool-adapters run --tool <tool-id> --contract <path> --confirm to execute."
      : "Enable execution and provide a valid contract before running."
  };
}

function buildRunEventBase({ runId, contract, tool, status, startedAt, endedAt, durationMs, exitCode, signal, stdoutExcerpt, stderrExcerpt, redactionsApplied, policyChecks, error }) {
  return {
    event_id: runId,
    run_id: runId,
    contract_id: contract.contract_id,
    tool_id: tool.tool_id,
    task_id: contract.task_id ?? null,
    assignment_id: contract.assignment_id ?? null,
    status,
    command: contract.command,
    args_count: Array.isArray(contract.args) ? contract.args.length : 0,
    working_directory: contract.working_directory,
    started_at: startedAt,
    ended_at: endedAt,
    duration_ms: Number.isFinite(durationMs) ? durationMs : 0,
    exit_code: exitCode,
    signal: signal || null,
    stdout_excerpt: stdoutExcerpt || "",
    stderr_excerpt: stderrExcerpt || "",
    redactions_applied: Array.isArray(redactionsApplied) ? redactionsApplied : [],
    policy_checks: Array.isArray(policyChecks) ? policyChecks : [],
    error: error || null
  };
}

function buildRunReportFromValidation(validation, flags = {}, options = {}) {
  if (!validation.tool) {
    const event = buildBlockedRunEvent(validation, validation.blockers[0] || "tool not found");
    return buildRunReportFromEvent(event, true, "Register or scan the tool before running it.");
  }

  if (validation.tool.execution_enabled !== true) {
    const event = buildBlockedRunEvent(validation, validation.blockers[0] || `tool execution disabled: ${validation.tool.tool_id}`);
    return buildRunReportFromEvent(event, true, "Run kvdf ai-tool-adapters enable-execution --tool <tool-id> --confirm first.");
  }

  if (flags.confirm !== true) {
    const event = buildBlockedRunEvent(validation, "missing --confirm");
    return buildRunReportFromEvent(event, true, "Re-run with --confirm after reviewing the contract.");
  }

  if (!validation.valid) {
    const event = buildBlockedRunEvent(validation, validation.blockers[0] || "run contract validation failed");
    return buildRunReportFromEvent(event, true, "Fix the contract blockers before running.");
  }

  return executeValidContract(validation, {
    evidence_required: validation.contract.evidence_required !== false,
    ...options
  }).then((event) => buildRunReportFromEvent(
    event,
    false,
    event.status === "blocked" && String(event.error || "").includes("deferred")
      ? "Execution is deferred in this phase; review the evidence log or revisit the contract later."
      : event.status === "completed"
        ? "Review the evidence log and disable execution when finished."
        : event.status === "timed_out"
          ? "Review the timeout evidence and adjust the contract if needed."
          : "Review the failure evidence and retry after fixing the contract or tool."
  ));
}

async function buildRunReportFromContract(contract, flags = {}, options = {}) {
  const state = options.state || registry.ensureStateFile();
  const normalizedContract = normalizeRunContract(contract);
  if (!normalizedContract.tool_id) {
    const validation = {
      contract: normalizedContract,
      tool: null,
      policy_checks: [],
      blockers: ["missing tool_id"]
    };
    const event = buildBlockedRunEvent(validation, validation.blockers[0]);
    return buildRunReportFromEvent(event, true, "Provide a tool_id in the run contract before running.");
  }
  const validation = validateRunContract(normalizedContract, { state, confirm: flags.confirm === true });
  return buildRunReportFromValidation(validation, flags, options);
}

async function executeValidContract(validation, options = {}) {
  const runId = runner.nextRunId();
  const startedAt = new Date();
  const event = buildRunEventBase({
    runId,
    contract: validation.contract,
    tool: validation.tool,
    status: "blocked",
    startedAt: startedAt.toISOString(),
    endedAt: startedAt.toISOString(),
    durationMs: 0,
    exitCode: null,
    signal: null,
    stdoutExcerpt: "",
    stderrExcerpt: "",
    redactionsApplied: [],
    policyChecks: validation.policy_checks,
    error: "tool execution deferred in this phase"
  });
  if (options.evidence_required !== false) runner.appendRunEvent(event);
  return event;
}

function buildBlockedRunEvent(validation, reason) {
  const runId = runner.nextRunId();
  const event = buildRunEventBase({
    runId,
    contract: validation.contract,
    tool: validation.tool || { tool_id: validation.contract.tool_id || "unknown" },
    status: "blocked",
    startedAt: null,
    endedAt: null,
    durationMs: 0,
    exitCode: null,
    signal: null,
    stdoutExcerpt: "",
    stderrExcerpt: "",
    redactionsApplied: [],
    policyChecks: validation.policy_checks,
    error: reason
  });
  return runner.appendRunEvent(event);
}

function buildRunReportFromEvent(event, dryRun = false, nextAction = "") {
  return {
    report_type: "ai_tool_adapters_run",
    plugin_id: "ai_tool_adapters",
    status: event.status,
    dry_run: dryRun,
    run_id: event.run_id,
    event_id: event.event_id,
    contract_id: event.contract_id,
    task_id: event.task_id,
    assignment_id: event.assignment_id,
    tool_id: event.tool_id,
    command: event.command,
    args_count: event.args_count,
    working_directory: event.working_directory,
    started_at: event.started_at,
    ended_at: event.ended_at,
    duration_ms: event.duration_ms,
    exit_code: event.exit_code,
    signal: event.signal || null,
    stdout_excerpt: event.stdout_excerpt,
    stderr_excerpt: event.stderr_excerpt,
    redactions_applied: event.redactions_applied,
    policy_checks: event.policy_checks,
    error: event.error,
    next_action: nextAction
  };
}

async function buildRunReport(toolId, contractPath, flags = {}, options = {}) {
  const state = options.state || registry.ensureStateFile();
  const tool = toolId ? registry.findTool(state, toolId) : null;
  if (!tool) {
    const validation = { contract: { contract_id: null, tool_id: toolId || null }, tool: null, policy_checks: [], blockers: [`tool not found: ${toolId || ""}`.trim()] };
    const event = buildBlockedRunEvent(validation, validation.blockers[0]);
    return buildRunReportFromEvent(event, true, "Register or scan the tool before running it.");
  }

  if (!contractPath) {
    const validation = { contract: { contract_id: null, tool_id: tool.tool_id }, tool, policy_checks: [], blockers: ["missing contract path"] };
    const event = buildBlockedRunEvent(validation, validation.blockers[0]);
    return buildRunReportFromEvent(event, true, "Provide --contract <path> to run the tool.");
  }

  let contract;
  try {
    contract = readRunContractFromFile(contractPath);
  } catch (error) {
    const validation = { contract: { contract_id: null, tool_id: tool.tool_id }, tool, policy_checks: [], blockers: [error.message] };
    const event = buildBlockedRunEvent(validation, validation.blockers[0]);
    return buildRunReportFromEvent(event, true, "Provide a valid run contract before running.");
  }
  contract = { ...contract, tool_id: contract.tool_id || tool.tool_id };
  return buildRunReportFromContract(contract, flags, { ...options, state });
}

function buildRunsReport() {
  const runs = runner.readRunEvents();
  const counts = runs.reduce((acc, event) => {
    acc.total += 1;
    acc[event.status] = (acc[event.status] || 0) + 1;
    return acc;
  }, { total: 0, blocked: 0, started: 0, completed: 0, failed: 0, timed_out: 0 });
  return {
    report_type: "ai_tool_adapters_runs",
    plugin_id: "ai_tool_adapters",
    status: counts.total ? "available" : "warning",
    count: runs.length,
    runs,
    status_counts: counts,
    next_action: runs.length
      ? "Use kvdf ai-tool-adapters run-show <run-id> --json to inspect one evidence record."
      : "Run a governed tool contract to start evidence logging."
  };
}

function buildRunShowReport(runId) {
  const runs = runner.readRunEvents();
  const event = runs.find((item) => item.run_id === runId || item.event_id === runId) || null;
  if (!event) {
    return {
      report_type: "ai_tool_adapters_run_show",
      plugin_id: "ai_tool_adapters",
      status: "warning",
      found: false,
      run_id: runId || null,
      run: null,
      next_action: "Run ai-tool-adapters runs or rerun the contract to create evidence."
    };
  }
  return {
    report_type: "ai_tool_adapters_run_show",
    plugin_id: "ai_tool_adapters",
    status: event.status === "completed" ? "available" : event.status,
    found: true,
    run_id: event.run_id,
    run: event,
    next_action: "Use the evidence record to review policy checks and redactions."
  };
}

function buildEnableExecutionReport(toolId) {
  const state = registry.ensureStateFile();
  const result = registry.setToolExecutionEnabled(state, toolId, true);
  const tool = result.tool;
  return {
    report_type: "ai_tool_adapters_enable_execution",
    plugin_id: "ai_tool_adapters",
    status: tool ? "pass" : "warning",
    tool_id: toolId || null,
    tool,
    execution_enabled: Boolean(tool && tool.execution_enabled),
    next_action: tool ? "Execution is enabled for this registry entry, but run contracts still require validation and --confirm." : "Register or scan the tool before enabling execution."
  };
}

function buildDisableExecutionReport(toolId) {
  const state = registry.ensureStateFile();
  const result = registry.setToolExecutionEnabled(state, toolId, false);
  const tool = result.tool;
  return {
    report_type: "ai_tool_adapters_disable_execution",
    plugin_id: "ai_tool_adapters",
    status: tool ? "pass" : "warning",
    tool_id: toolId || null,
    tool,
    execution_enabled: Boolean(tool && tool.execution_enabled),
    next_action: tool ? "Execution is disabled for this registry entry." : "Register or scan the tool before disabling execution."
  };
}

module.exports = {
  readTemplateContract,
  createDefaultRunContract,
  readRunContractFromFile,
  normalizeRunContract,
  validateRunContract,
  buildRunContractReport,
  buildTestReport,
  buildRunReportFromContract,
  buildRunReport,
  buildRunsReport,
  buildRunShowReport,
  buildEnableExecutionReport,
  buildDisableExecutionReport,
  executeValidContract
};
