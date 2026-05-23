const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const repoRoot = path.resolve(__dirname, "../../..");
const aiToolManifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "plugins", "ai_tool_adapters", "plugin.json"), "utf8"));
const multiAiManifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "plugins", "multi_ai_governance", "plugin.json"), "utf8"));
const bootstrap = require("../bootstrap");
const provider = require("../provider");
const runtime = require("../runtime");

assert.strictEqual(aiToolManifest.plugin_id, "ai_tool_adapters");
assert.strictEqual(typeof bootstrap.provider, "object");
assert.strictEqual(typeof provider.getProviderInfo, "function");
assert.strictEqual(typeof provider.ensureState, "function");
assert.strictEqual(typeof provider.listAvailableTools, "function");
assert.strictEqual(typeof provider.getToolCapabilities, "function");
assert.strictEqual(typeof provider.canRunContract, "function");
assert.strictEqual(typeof provider.runContract, "function");
assert.strictEqual(typeof provider.getRunEvidence, "function");
assert.strictEqual(typeof provider.buildAdapterProviderReport, "function");

const providerInfo = provider.getProviderInfo();
assert.strictEqual(providerInfo.provider_id, "ai_tool_adapters");
assert.strictEqual(providerInfo.authority_plugin_id, "multi_ai_governance");
assert.strictEqual(providerInfo.execution_default, "disabled");

assert.ok(Array.isArray(aiToolManifest.provides));
assert.ok(aiToolManifest.provides.includes("ai_tool_provider_api"));
assert.ok(Array.isArray(aiToolManifest.consumed_by));
assert.ok(aiToolManifest.consumed_by.some((entry) => entry.plugin_id === "multi_ai_governance"));

assert.ok(Array.isArray(multiAiManifest.optional_integrations));
assert.strictEqual(multiAiManifest.optional_integrations.length, 1);
assert.strictEqual(multiAiManifest.optional_integrations[0].plugin_id, "ai_tool_adapters");
assert.strictEqual(multiAiManifest.optional_integrations[0].dependency_type, "optional");

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-tool-provider-"));
const previousCwd = process.cwd();
try {
  process.chdir(tempDir);

  const state = provider.ensureState();
  assert.strictEqual(state.version, "v1");
  assert.ok(fs.existsSync(path.join(tempDir, ".kabeeri", "ai_tool_adapters.json")));

  const emptyTools = provider.listAvailableTools();
  assert.deepStrictEqual(emptyTools, []);

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

  const tools = provider.listAvailableTools();
  assert.strictEqual(tools.length, 1);
  assert.strictEqual(tools[0].tool_id, "codex-local");
  assert.strictEqual(tools[0].execution_enabled, false);

  const capabilities = provider.getToolCapabilities("codex-local");
  assert.strictEqual(capabilities.found, true);
  assert.deepStrictEqual(capabilities.capabilities, ["code_edit", "patch_proposal", "terminal_assist"]);

  const canRun = provider.canRunContract({
    contract_id: "ai-run-contract-001",
    requested_by: "multi_ai_governance",
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
  });
  assert.strictEqual(canRun.report_type, "ai_tool_adapters_can_run");
  assert.strictEqual(canRun.status, "blocked");
  assert.strictEqual(canRun.execution_enabled, false);

  assert.strictEqual(provider.getRunEvidence("ai-tool-run-999"), null);

  const report = provider.buildAdapterProviderReport();
  assert.strictEqual(report.report_type, "ai_tool_adapters_provider");
  assert.strictEqual(report.provider_id, "ai_tool_adapters");
  assert.strictEqual(report.tools_count, 1);
  assert.strictEqual(report.execution_enabled_count, 0);
  assert.ok(Array.isArray(report.available_tools));
  assert.ok(Array.isArray(report.latest_runs));
  assert.ok(report.integration_status);
  assert.strictEqual(report.integration_status.authority_plugin_id, "multi_ai_governance");
} finally {
  process.chdir(previousCwd);
  fs.rmSync(tempDir, { recursive: true, force: true });
}
