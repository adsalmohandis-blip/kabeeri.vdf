const fs = require("fs");
const path = require("path");

const registry = require("./tool_registry");
const runContract = require("./run_contract");
const runner = require("./tool_runner");

const STATE_FILE = ".kabeeri/ai_tool_policy_results.json";
const TEMPLATE_FILE = path.join(__dirname, "..", "runtime", "ai_tool_policy_results.template.json");
const POLICY_CHECK_IDS = [
  "registered_tool_exists",
  "tool_execution_enabled",
  "run_contract_present",
  "contract_tool_matches_registry",
  "command_allowed",
  "command_not_forbidden",
  "working_directory_exists",
  "working_directory_inside_repo",
  "timeout_within_limit",
  "forbidden_files_not_targeted",
  "secret_like_values_redacted",
  "confirm_required_for_execution",
  "evidence_required",
  "no_shell_execution",
  "no_core_fallback"
];
const DANGEROUS_TOKENS = [
  "rm -rf",
  "del /s",
  "format",
  "shutdown",
  "powershell remove-item",
  "curl | sh",
  "wget | sh",
  "eval",
  "chmod -r 777"
];
const SECRET_KEYS = [
  "API_KEY",
  "TOKEN",
  "SECRET",
  "PASSWORD",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY"
];

function getStatePath() {
  return path.resolve(process.cwd(), STATE_FILE);
}

function ensureWorkspace() {
  fs.mkdirSync(path.dirname(getStatePath()), { recursive: true });
}

function readTemplateState() {
  return JSON.parse(fs.readFileSync(TEMPLATE_FILE, "utf8"));
}

function createDefaultState() {
  return JSON.parse(JSON.stringify(readTemplateState()));
}

function normalizeState(state) {
  const template = createDefaultState();
  const source = state && typeof state === "object" ? state : {};
  return {
    ...template,
    ...source,
    version: "v1",
    updated_at: source.updated_at ?? template.updated_at ?? null,
    results: Array.isArray(source.results) ? source.results.map((item) => normalizePolicyResult(item)) : []
  };
}

function readState({ createIfMissing = true } = {}) {
  ensureWorkspace();
  const file = getStatePath();
  if (!fs.existsSync(file)) {
    if (!createIfMissing) return null;
    const state = createDefaultState();
    writeState(state);
    return state;
  }
  return normalizeState(JSON.parse(fs.readFileSync(file, "utf8")));
}

function writeState(state) {
  ensureWorkspace();
  const normalized = normalizeState(state);
  fs.writeFileSync(getStatePath(), `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  return normalized;
}

function ensureStateFile() {
  return readState({ createIfMissing: true });
}

function nextPolicyResultId(results = readState({ createIfMissing: true }).results) {
  let max = 0;
  for (const result of results || []) {
    const match = String(result && (result.policy_result_id || result.result_id) || "").match(/(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `ai-tool-policy-${String(max + 1).padStart(3, "0")}`;
}

function normalizePolicyCheck(check = {}) {
  const status = ["pass", "warn", "fail", "blocked"].includes(String(check.status || "").toLowerCase())
    ? String(check.status).toLowerCase()
    : "warn";
  const severity = ["info", "warn", "fail", "block"].includes(String(check.severity || "").toLowerCase())
    ? String(check.severity).toLowerCase()
    : "warn";
  return {
    check_id: String(check.check_id || "").trim() || "unknown_check",
    status,
    severity,
    message: String(check.message || "").trim() || "",
    details: check.details === undefined ? null : check.details
  };
}

function normalizePolicyResult(result = {}) {
  return {
    policy_result_id: String(result.policy_result_id || result.result_id || "").trim() || "ai-tool-policy-000",
    contract_id: result.contract_id === null || result.contract_id === undefined ? null : String(result.contract_id).trim() || null,
    tool_id: result.tool_id === null || result.tool_id === undefined ? null : String(result.tool_id).trim() || null,
    status: normalizePolicyStatus(result.status),
    generated_at: result.generated_at || new Date().toISOString(),
    checks: Array.isArray(result.checks) ? result.checks.map((check) => normalizePolicyCheck(check)) : [],
    blockers: Array.isArray(result.blockers) ? result.blockers.map((item) => String(item)) : [],
    warnings: Array.isArray(result.warnings) ? result.warnings.map((item) => String(item)) : [],
    next_action: String(result.next_action || "").trim() || defaultNextAction(result.status)
  };
}

function normalizePolicyStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();
  return ["pass", "warn", "fail", "blocked"].includes(normalized) ? normalized : "blocked";
}

function defaultNextAction(status) {
  if (status === "pass") return "Review the contract and continue through multi_ai_governance.";
  if (status === "warn") return "Review the warnings, then re-run with --confirm if execution is still intended.";
  return "Fix the blocked policy checks before attempting a governed run.";
}

function readPolicyResults() {
  const state = ensureStateFile();
  return state.results.slice();
}

function writePolicyResult(result) {
  const state = ensureStateFile();
  const normalized = normalizePolicyResult(result);
  state.results.push(normalized);
  state.updated_at = normalized.generated_at;
  writeState(state);
  return normalized;
}

function findPolicyResult(policyResultId) {
  if (!policyResultId) return null;
  return readPolicyResults().find((item) => item.policy_result_id === policyResultId || item.result_id === policyResultId) || null;
}

function readContractInput(contractInput) {
  if (!contractInput) {
    return { error: "missing contract" };
  }
  if (typeof contractInput === "string") {
    try {
      return { contract: runContract.readRunContractFromFile(contractInput), contract_path: contractInput };
    } catch (error) {
      return { error: error.message, contract_path: contractInput };
    }
  }
  if (typeof contractInput === "object") {
    return { contract: contractInput, contract_path: null };
  }
  return { error: "missing contract" };
}

function evaluateContract(contractInput, options = {}) {
  const state = options.state || registry.ensureStateFile();
  const loaded = readContractInput(contractInput);
  const contract = loaded.contract ? runContract.normalizeRunContract(loaded.contract) : null;
  const policyResultId = nextPolicyResultId(readPolicyResults());
  const checks = [];
  const blockers = [];
  const warnings = [];
  const tool = contract && contract.tool_id ? registry.findTool(state, contract.tool_id) : null;
  const workingDirectory = contract ? path.resolve(process.cwd(), contract.working_directory || ".") : null;
  const repoRoot = path.resolve(process.cwd());

  if (!contract) {
    addCheck(checks, "run_contract_present", "blocked", "block", loaded.error || "missing contract");
    addCheck(checks, "registered_tool_exists", "blocked", "block", "run contract missing");
    blockers.push(loaded.error || "missing contract");
    return buildPolicyResultReport(finalizePolicyResult({
      policy_result_id: policyResultId,
      contract_id: null,
      tool_id: null,
      status: "blocked",
      generated_at: new Date().toISOString(),
      checks,
      blockers,
      warnings,
      next_action: "Provide a valid run contract before asking for a policy evaluation."
    }, { persist: true }));
  }

  addCheck(checks, "run_contract_present", "pass", "info", "Run contract loaded.");

  if (!contract.contract_id) {
    blockers.push("missing contract_id");
  }
  if (!contract.tool_id) {
    blockers.push("missing tool_id");
  }

  if (tool) {
    addCheck(checks, "registered_tool_exists", "pass", "info", `Registered tool found: ${tool.tool_id}.`);
  } else {
    addCheck(checks, "registered_tool_exists", "blocked", "block", `tool not found: ${contract.tool_id || ""}`.trim());
    blockers.push(`tool not found: ${contract.tool_id || ""}`.trim());
  }

  if (tool && tool.execution_enabled === true) {
    addCheck(checks, "tool_execution_enabled", "pass", "info", `Tool execution is enabled for ${tool.tool_id}.`);
  } else {
    addCheck(checks, "tool_execution_enabled", "blocked", "block", tool ? `tool execution disabled: ${tool.tool_id}` : "tool execution disabled");
    blockers.push(tool ? `tool execution disabled: ${tool.tool_id}` : "tool execution disabled");
  }

  if (tool && contract.command && matchesRegisteredToolCommand(contract.command, tool)) {
    addCheck(checks, "contract_tool_matches_registry", "pass", "info", "Contract command matches the registered tool.");
  } else {
    addCheck(checks, "contract_tool_matches_registry", "blocked", "block", "command does not match registered tool command or resolved path");
    blockers.push("command does not match registered tool command or resolved path");
  }

  if (contract.command && Array.isArray(contract.allowed_commands) && contract.allowed_commands.includes(contract.command)) {
    addCheck(checks, "command_allowed", "pass", "info", "Contract command is allowed.");
  } else {
    addCheck(checks, "command_allowed", "blocked", "block", "command not present in allowed_commands");
    blockers.push("command not present in allowed_commands");
  }

  const forbiddenToken = findForbiddenToken(contract);
  if (forbiddenToken) {
    addCheck(checks, "command_not_forbidden", "blocked", "block", `forbidden command token detected: ${forbiddenToken}`);
    blockers.push(`forbidden command token detected: ${forbiddenToken}`);
  } else {
    addCheck(checks, "command_not_forbidden", "pass", "info", "No forbidden shell-like token was detected.");
  }

  if (workingDirectory && fs.existsSync(workingDirectory)) {
    addCheck(checks, "working_directory_exists", "pass", "info", `Working directory exists: ${contract.working_directory}.`);
    const relative = path.relative(repoRoot, workingDirectory);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      addCheck(checks, "working_directory_inside_repo", "blocked", "block", "working_directory must be inside repo root");
      blockers.push("working_directory must be inside repo root");
    } else {
      addCheck(checks, "working_directory_inside_repo", "pass", "info", "Working directory is inside the repo root.");
    }
  } else {
    addCheck(checks, "working_directory_exists", "blocked", "block", `working_directory does not exist: ${contract.working_directory || "."}`);
    addCheck(checks, "working_directory_inside_repo", "blocked", "block", "working_directory must be inside repo root");
    blockers.push(`working_directory does not exist: ${contract.working_directory || "."}`);
    blockers.push("working_directory must be inside repo root");
  }

  if (Number(contract.timeout_seconds) <= 1800) {
    addCheck(checks, "timeout_within_limit", "pass", "info", "Timeout is within the 1800 second limit.");
  } else {
    addCheck(checks, "timeout_within_limit", "blocked", "block", "timeout_seconds exceeds 1800");
    blockers.push("timeout_seconds exceeds 1800");
  }

  const forbiddenFilesConflict = findForbiddenFileConflict(contract);
  if (forbiddenFilesConflict) {
    addCheck(checks, "forbidden_files_not_targeted", "blocked", "block", `forbidden file targeted: ${forbiddenFilesConflict}`);
    blockers.push(`forbidden file targeted: ${forbiddenFilesConflict}`);
  } else {
    addCheck(checks, "forbidden_files_not_targeted", "pass", "info", "No forbidden files are targeted.");
  }

  const secretPreview = buildSecretPreview(contract);
  if (secretPreview.redactions.length > 0) {
    addCheck(checks, "secret_like_values_redacted", "warn", "warn", `Potential secrets were redacted from the contract preview: ${secretPreview.redactions.join(", ")}`);
    warnings.push("Potential secret-like values were redacted from the policy preview.");
  } else {
    addCheck(checks, "secret_like_values_redacted", "pass", "info", "No secret-like values were detected in the contract preview.");
  }

  if (options.confirm === true) {
    addCheck(checks, "confirm_required_for_execution", "pass", "info", "Execution confirm flag was supplied.");
  } else {
    addCheck(checks, "confirm_required_for_execution", "warn", "warn", "Execution confirm flag is required before a governed run can proceed.");
    warnings.push("missing --confirm");
  }

  if (contract.evidence_required === false) {
    addCheck(checks, "evidence_required", "warn", "warn", "Evidence logging is disabled in the contract.");
    warnings.push("Evidence logging is disabled in the contract.");
  } else {
    addCheck(checks, "evidence_required", "pass", "info", "Evidence logging is required.");
  }

  if (containsShellLikeText(contract)) {
    addCheck(checks, "no_shell_execution", "blocked", "block", "shell-like or destructive command text detected");
    blockers.push("shell-like or destructive command text detected");
  } else {
    addCheck(checks, "no_shell_execution", "pass", "info", "No shell-like execution text was detected.");
  }

  addCheck(checks, "no_core_fallback", "pass", "info", "Policy evaluation is handled inside the plugin; no Core fallback is used.");

  const status = resolvePolicyStatus(checks, blockers);
  const result = finalizePolicyResult({
    policy_result_id: policyResultId,
    contract_id: contract.contract_id || null,
    tool_id: contract.tool_id || null,
    status,
    generated_at: new Date().toISOString(),
    checks,
    blockers,
    warnings,
    next_action: nextPolicyAction(status)
  }, { persist: true });

  return buildPolicyResultReport(result);
}

function finalizePolicyResult(result, { persist = false } = {}) {
  const normalized = normalizePolicyResult(result);
  if (persist) {
    writePolicyResult(normalized);
  }
  return normalized;
}

function resolvePolicyStatus(checks = [], blockers = []) {
  if (Array.isArray(blockers) && blockers.length > 0) return "blocked";
  let hasBlocked = false;
  let hasFail = false;
  let hasWarn = false;
  for (const check of checks) {
    const status = String(check.status || "").toLowerCase();
    if (status === "blocked") hasBlocked = true;
    else if (status === "fail") hasFail = true;
    else if (status === "warn") hasWarn = true;
  }
  if (hasBlocked) return "blocked";
  if (hasFail) return "fail";
  if (hasWarn) return "warn";
  return "pass";
}

function nextPolicyAction(status) {
  if (status === "pass") return "Use multi_ai_governance to approve the assignment, then run with --confirm if execution is still intended.";
  if (status === "warn") return "Review the warnings, then rerun with --confirm if the governed run should proceed.";
  return "Fix the blocked policy checks before attempting a governed run.";
}

function addCheck(checks, checkId, status, severity, message, details = null) {
  checks.push({
    check_id: checkId,
    status,
    severity,
    message,
    details
  });
}

function matchesRegisteredToolCommand(command, tool) {
  if (!command || !tool) return false;
  const normalizedCommand = String(command).trim();
  if (normalizedCommand === String(tool.command || "").trim()) return true;
  if (normalizedCommand === String(tool.resolved_command || "").trim()) return true;
  if (Array.isArray(tool.commands) && tool.commands.some((item) => String(item || "").trim() === normalizedCommand)) return true;
  if (tool.resolved_path) {
    const commandPath = normalizePath(normalizedCommand);
    const resolvedPath = normalizePath(tool.resolved_path);
    if (commandPath === resolvedPath) return true;
  }
  return false;
}

function normalizePath(value) {
  const resolved = path.resolve(String(value || "").trim());
  return process.platform === "win32" ? resolved.toLowerCase() : resolved;
}

function findForbiddenToken(contract) {
  const haystack = [contract.command, ...(Array.isArray(contract.args) ? contract.args : []), contract.stdin || ""].join(" ").toLowerCase();
  return DANGEROUS_TOKENS.find((token) => haystack.includes(token)) || null;
}

function findForbiddenFileConflict(contract) {
  const fields = [
    contract.working_directory,
    contract.command,
    ...(Array.isArray(contract.args) ? contract.args : []),
    contract.stdin || "",
    ...(Array.isArray(contract.allowed_files) ? contract.allowed_files : []),
    ...(Array.isArray(contract.forbidden_files) ? contract.forbidden_files : [])
  ].map((item) => String(item || "").toLowerCase());
  for (const forbidden of Array.isArray(contract.forbidden_files) ? contract.forbidden_files : []) {
    const normalizedForbidden = String(forbidden || "").trim().toLowerCase();
    if (!normalizedForbidden) continue;
    if (fields.some((field) => field.includes(normalizedForbidden))) return forbidden;
  }
  return null;
}

function containsShellLikeText(contract) {
  const text = [contract.command, ...(Array.isArray(contract.args) ? contract.args : []), contract.stdin || ""].join(" ").toLowerCase();
  return DANGEROUS_TOKENS.some((token) => text.includes(token)) || /(\|\s*sh|;\s*rm\b|&&\s*rm\b|\|\s*bash\b)/i.test(text);
}

function buildSecretPreview(contract) {
  const text = [contract.command, ...(Array.isArray(contract.args) ? contract.args : []), contract.stdin || ""].join(" ");
  const redacted = runner.redactSensitiveText(text);
  return {
    text: redacted.text,
    redactions: Array.isArray(redacted.redactions_applied) ? redacted.redactions_applied.slice() : []
  };
}

function buildPolicyResultsReport(options = {}) {
  const results = readPolicyResults();
  return {
    report_type: "ai_tool_adapters_policy_results",
    plugin_id: "ai_tool_adapters",
    status: results.length ? "available" : "warning",
    count: results.length,
    results,
    next_action: results.length
      ? "Use ai-tool-adapter policy-show <policy-result-id> to inspect one result."
      : "Run ai-tool-adapter policy --contract <path> to record a policy result."
  };
}

function buildPolicyShowReport(policyResultId) {
  const result = findPolicyResult(policyResultId);
  if (!result) {
    return {
      report_type: "ai_tool_adapters_policy_show",
      plugin_id: "ai_tool_adapters",
      status: "warning",
      found: false,
      policy_result_id: policyResultId || null,
      result: null,
      next_action: "Run ai-tool-adapter policy-results or re-run the policy gate to create a result."
  };
  }
  return {
    report_type: "ai_tool_adapters_policy_show",
    plugin_id: "ai_tool_adapters",
    status: result.status,
    found: true,
    policy_result_id: result.policy_result_id,
    result,
    next_action: "Review the policy checks and rerun the contract after addressing blockers."
  };
}

function buildPolicyRunBlockReport(policyResult) {
  return {
    report_type: "ai_tool_adapters_run",
    plugin_id: "ai_tool_adapters",
    status: "blocked",
    dry_run: true,
    run_id: null,
    event_id: null,
    policy_result_id: policyResult.policy_result_id,
    contract_id: policyResult.contract_id,
    tool_id: policyResult.tool_id,
    command: null,
    args_count: 0,
    working_directory: null,
    started_at: null,
    ended_at: null,
    duration_ms: 0,
    exit_code: null,
    signal: null,
    stdout_excerpt: "",
    stderr_excerpt: "",
    redactions_applied: [],
    policy_checks: Array.isArray(policyResult.checks) ? policyResult.checks.map((item) => item.check_id) : [],
    blockers: Array.isArray(policyResult.blockers) ? policyResult.blockers.slice() : [],
    warnings: Array.isArray(policyResult.warnings) ? policyResult.warnings.slice() : [],
    error: Array.isArray(policyResult.blockers) && policyResult.blockers.length ? policyResult.blockers[0] : policyResult.next_action,
    next_action: policyResult.next_action
  };
}

function buildPolicyResultReport(result) {
  return {
    report_type: "ai_tool_adapters_policy_result",
    plugin_id: "ai_tool_adapters",
    ...normalizePolicyResult(result)
  };
}

module.exports = {
  STATE_FILE,
  POLICY_CHECK_IDS,
  getStatePath,
  readTemplateState,
  createDefaultState,
  normalizeState,
  readState,
  writeState,
  ensureStateFile,
  nextPolicyResultId,
  normalizePolicyCheck,
  normalizePolicyResult,
  readPolicyResults,
  writePolicyResult,
  findPolicyResult,
  evaluateContract,
  buildPolicyResultReport,
  buildPolicyResultsReport,
  buildPolicyShowReport,
  buildPolicyRunBlockReport,
  buildPolicyActionReport: evaluateContract
};
