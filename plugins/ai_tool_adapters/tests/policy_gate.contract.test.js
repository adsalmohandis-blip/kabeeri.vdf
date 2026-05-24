const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const repoRoot = path.resolve(__dirname, "../../..");
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "plugins", "ai_tool_adapters", "plugin.json"), "utf8"));
const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
const runtime = require("../runtime");
const policyGate = require("../commands/policy_gate");

assert.strictEqual(manifest.plugin_id, "ai_tool_adapters");
assert.strictEqual(typeof policyGate.evaluateContract, "function");
assert.strictEqual(typeof policyGate.buildPolicyResultsReport, "function");
assert.strictEqual(typeof policyGate.buildPolicyShowReport, "function");
assert.strictEqual(typeof policyGate.buildPolicyRunBlockReport, "function");
assert.ok(!packageJson.dependencies || !Object.keys(packageJson.dependencies).length);
assert.ok(!packageJson.devDependencies || !Object.keys(packageJson.devDependencies).length);

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-tool-policy-"));
const previousCwd = process.cwd();
try {
  process.chdir(tempDir);

  const missing = policyGate.evaluateContract(null);
  assert.strictEqual(missing.report_type, "ai_tool_adapters_policy_result");
  assert.strictEqual(missing.status, "blocked");
  assert.ok(missing.blockers.length > 0);

  const contractPath = path.join(tempDir, "contract.json");
  fs.writeFileSync(contractPath, JSON.stringify({
    contract_id: "ai-run-contract-001",
    requested_by: "manual",
    task_id: "task-001",
    assignment_id: "mai-asg-001",
    tool_id: "codex-local",
    working_directory: ".",
    command: "codex",
    args: [],
    stdin: null,
    allowed_commands: ["codex"],
    forbidden_commands: ["rm", "del", "format", "shutdown", "powershell Remove-Item"],
    allowed_files: [],
    forbidden_files: [".env", ".kabeeri/owner_auth.json"],
    timeout_seconds: 900,
    capture_stdout: true,
    capture_stderr: true,
    evidence_required: true
  }, null, 2), "utf8");

  const unregistered = policyGate.evaluateContract(contractPath);
  assert.strictEqual(unregistered.report_type, "ai_tool_adapters_policy_result");
  assert.strictEqual(unregistered.status, "blocked");
  assert.ok(unregistered.blockers.some((item) => String(item).includes("tool not found")));

  runtime.saveAiToolAdaptersState({
    version: "v1",
    generated_at: null,
    updated_at: null,
    tools: [
      {
        tool_id: "codex-local",
        tool_type: "codex_cli",
        display_name: "OpenAI Codex CLI",
        command: "codex",
        resolved_path: null,
        editor: "vscode",
        status: "registered",
        capabilities: ["code_edit", "patch_proposal", "terminal_assist"],
        execution_enabled: false,
        detected_at: null,
        registered_at: null,
        last_checked_at: null,
        notes: null
      }
    ],
    scan_history: [],
    policies: {
      execution_default: "disabled",
      manual_registration_allowed: true,
      external_dependencies_allowed: false
    }
  });

  const executionDisabled = policyGate.evaluateContract(contractPath);
  assert.strictEqual(executionDisabled.report_type, "ai_tool_adapters_policy_result");
  assert.strictEqual(executionDisabled.status, "blocked");
  assert.ok(executionDisabled.blockers.some((item) => String(item).includes("tool execution disabled")));

  const forbiddenPath = path.join(tempDir, "forbidden.json");
  fs.writeFileSync(forbiddenPath, JSON.stringify({
    contract_id: "ai-run-contract-002",
    requested_by: "manual",
    task_id: "task-001",
    assignment_id: "mai-asg-001",
    tool_id: "codex-local",
    working_directory: ".",
    command: "powershell Remove-Item",
    args: ["-Recurse", "-Force", "."],
    stdin: null,
    allowed_commands: ["powershell Remove-Item"],
    forbidden_commands: ["rm", "del", "format", "shutdown", "powershell Remove-Item"],
    allowed_files: [],
    forbidden_files: [".env", ".kabeeri/owner_auth.json"],
    timeout_seconds: 900,
    capture_stdout: true,
    capture_stderr: true,
    evidence_required: true
  }, null, 2), "utf8");

  runtime.saveAiToolAdaptersState({
    version: "v1",
    generated_at: null,
    updated_at: null,
    tools: [
      {
        tool_id: "codex-local",
        tool_type: "codex_cli",
        display_name: "OpenAI Codex CLI",
        command: "codex",
        resolved_path: null,
        editor: "vscode",
        status: "registered",
        capabilities: ["code_edit", "patch_proposal", "terminal_assist"],
        execution_enabled: true,
        detected_at: null,
        registered_at: null,
        last_checked_at: null,
        notes: null
      }
    ],
    scan_history: [],
    policies: {
      execution_default: "disabled",
      manual_registration_allowed: true,
      external_dependencies_allowed: false
    }
  });

  const forbidden = policyGate.evaluateContract(forbiddenPath, { confirm: true });
  assert.strictEqual(forbidden.report_type, "ai_tool_adapters_policy_result");
  assert.strictEqual(forbidden.status, "blocked");
  assert.ok(forbidden.blockers.some((item) => String(item).includes("forbidden command token detected")));

  const unsafeDir = path.resolve(tempDir, "../outside");
  fs.mkdirSync(unsafeDir, { recursive: true });
  const unsafePath = path.join(tempDir, "unsafe.json");
  fs.writeFileSync(unsafePath, JSON.stringify({
    contract_id: "ai-run-contract-003",
    requested_by: "manual",
    task_id: "task-001",
    assignment_id: "mai-asg-001",
    tool_id: "codex-local",
    working_directory: "../outside",
    command: "codex",
    args: [],
    stdin: null,
    allowed_commands: ["codex"],
    forbidden_commands: ["rm", "del", "format", "shutdown", "powershell Remove-Item"],
    allowed_files: [],
    forbidden_files: [".env", ".kabeeri/owner_auth.json"],
    timeout_seconds: 900,
    capture_stdout: true,
    capture_stderr: true,
    evidence_required: true
  }, null, 2), "utf8");

  const unsafe = policyGate.evaluateContract(unsafePath, { confirm: true });
  assert.strictEqual(unsafe.report_type, "ai_tool_adapters_policy_result");
  assert.strictEqual(unsafe.status, "blocked");
  assert.ok(unsafe.blockers.some((item) => String(item).includes("working_directory must be inside repo root")));

  const timeoutPath = path.join(tempDir, "timeout.json");
  fs.writeFileSync(timeoutPath, JSON.stringify({
    contract_id: "ai-run-contract-004",
    requested_by: "manual",
    task_id: "task-001",
    assignment_id: "mai-asg-001",
    tool_id: "codex-local",
    working_directory: ".",
    command: "codex",
    args: [],
    stdin: null,
    allowed_commands: ["codex"],
    forbidden_commands: ["rm", "del", "format", "shutdown", "powershell Remove-Item"],
    allowed_files: [],
    forbidden_files: [".env", ".kabeeri/owner_auth.json"],
    timeout_seconds: 2001,
    capture_stdout: true,
    capture_stderr: true,
    evidence_required: true
  }, null, 2), "utf8");

  const timeout = policyGate.evaluateContract(timeoutPath, { confirm: true });
  assert.strictEqual(timeout.report_type, "ai_tool_adapters_policy_result");
  assert.strictEqual(timeout.status, "blocked");
  assert.ok(timeout.blockers.some((item) => String(item).includes("timeout_seconds exceeds 1800")));

  const results = policyGate.readPolicyResults();
  assert.ok(results.length >= 6);
  assert.ok(fs.existsSync(path.join(tempDir, ".kabeeri", "ai_tool_policy_results.json")));

  const resultsReport = policyGate.buildPolicyResultsReport();
  assert.strictEqual(resultsReport.report_type, "ai_tool_adapters_policy_results");
  assert.ok(resultsReport.count >= 6);

  const firstResult = results[0];
  const show = policyGate.buildPolicyShowReport(firstResult.policy_result_id);
  assert.strictEqual(show.report_type, "ai_tool_adapters_policy_show");
  assert.strictEqual(show.found, true);

  const blockReport = policyGate.buildPolicyRunBlockReport(firstResult);
  assert.strictEqual(blockReport.report_type, "ai_tool_adapters_run");
  assert.strictEqual(blockReport.status, "blocked");
} finally {
  process.chdir(previousCwd);
  fs.rmSync(path.resolve(tempDir, "../outside"), { recursive: true, force: true });
  fs.rmSync(tempDir, { recursive: true, force: true });
}
