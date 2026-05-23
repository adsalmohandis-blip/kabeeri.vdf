const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const repoRoot = path.resolve(__dirname, "../../..");
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "plugins", "ai_tool_adapters", "plugin.json"), "utf8"));
const bootstrap = require("../bootstrap");
const runtime = require("../runtime");
const runner = require("../commands/tool_runner");
const runContract = require("../commands/run_contract");

assert.strictEqual(manifest.plugin_id, "ai_tool_adapters");
assert.strictEqual(typeof bootstrap.aiToolAdapters, "function");
assert.strictEqual(typeof runtime.aiToolAdapters, "function");
assert.strictEqual(typeof runtime.buildAiToolAdaptersRunReport, "function");

const defaultContract = runContract.createDefaultRunContract();
assert.strictEqual(defaultContract.timeout_seconds, 900);
assert.strictEqual(defaultContract.requested_by, "manual");
assert.strictEqual(defaultContract.capture_stdout, true);
assert.strictEqual(defaultContract.capture_stderr, true);
assert.strictEqual(defaultContract.evidence_required, true);

const redacted = runner.redactSensitiveText("API_KEY=abc TOKEN=def SECRET=ghi PASSWORD=jkl OPENAI_API_KEY=one ANTHROPIC_API_KEY=two");
assert.ok(redacted.text.includes("[REDACTED]"));
assert.ok(redacted.redactions_applied.includes("API_KEY"));
assert.ok(redacted.redactions_applied.includes("TOKEN"));
assert.ok(redacted.redactions_applied.includes("SECRET"));
assert.ok(redacted.redactions_applied.includes("PASSWORD"));
assert.ok(redacted.redactions_applied.includes("OPENAI_API_KEY"));
assert.ok(redacted.redactions_applied.includes("ANTHROPIC_API_KEY"));

const validState = {
  tools: [
    {
      tool_id: "node",
      command: "node",
      tool_type: "node_runtime",
      display_name: "Node.js",
      status: "registered",
      execution_enabled: true,
      resolved_path: process.execPath
    }
  ],
  scan_history: [],
  policies: defaultContract.policies || {
    execution_default: "disabled",
    manual_registration_allowed: true,
    external_dependencies_allowed: false
  }
};

const validContract = runContract.normalizeRunContract({
  contract_id: "ai-run-contract-001",
  requested_by: "manual",
  tool_id: "node",
  working_directory: ".",
  command: process.execPath,
  args: ["-e", "process.stdout.write('ok')"],
  allowed_commands: [process.execPath],
  forbidden_commands: defaultContract.forbidden_commands.slice(),
  allowed_files: [],
  forbidden_files: defaultContract.forbidden_files.slice(),
  timeout_seconds: 900,
  capture_stdout: true,
  capture_stderr: true,
  evidence_required: true
});

const validation = runContract.validateRunContract(validContract, { state: validState });
assert.strictEqual(validation.valid, true);
assert.deepStrictEqual(validation.blockers, []);

const timeoutValidation = runContract.validateRunContract({
  ...validContract,
  timeout_seconds: 2001
}, { state: validState });
assert.strictEqual(timeoutValidation.valid, false);
assert.ok(timeoutValidation.blockers.some((item) => String(item).includes("timeout_seconds")));

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-tool-runs-"));
const previousCwd = process.cwd();
try {
  process.chdir(tempDir);
  const event = runner.appendRunEvent({
    event_id: "ai-tool-run-001",
    run_id: "ai-tool-run-001",
    contract_id: "ai-run-contract-001",
    tool_id: "node",
    task_id: "task-001",
    assignment_id: "mai-asg-001",
    status: "blocked",
    command: "node",
    args_count: 0,
    working_directory: ".",
    started_at: null,
    ended_at: null,
    duration_ms: 0,
    exit_code: null,
    signal: null,
    stdout_excerpt: "",
    stderr_excerpt: "",
    redactions_applied: [],
    policy_checks: [],
    error: "missing --confirm"
  });
  assert.strictEqual(event.run_id, "ai-tool-run-001");
  assert.ok(fs.existsSync(path.join(tempDir, ".kabeeri", "ai_tool_runs.jsonl")));
  assert.deepStrictEqual(runner.readRunEvents(), [event]);
} finally {
  process.chdir(previousCwd);
  fs.rmSync(tempDir, { recursive: true, force: true });
}
