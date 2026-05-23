const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const repoRoot = path.resolve(__dirname, "../../..");
const pluginManifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "plugins", "ai_tool_adapters", "plugin.json"), "utf8"));
const bootstrap = require("../bootstrap");
const runtime = require("../runtime");
const { scanKnownTools } = require("../commands/tool_scan");

assert.strictEqual(pluginManifest.plugin_id, "ai_tool_adapters");
assert.strictEqual(pluginManifest.enabled_by_default, true);
assert.strictEqual(typeof bootstrap.aiToolAdapters, "function");
assert.strictEqual(typeof runtime.aiToolAdapters, "function");
assert.strictEqual(bootstrap.provider, undefined);

const defaultState = runtime.createDefaultAiToolAdaptersState();
assert.strictEqual(defaultState.policies.execution_default, "disabled");
assert.strictEqual(defaultState.policies.manual_registration_allowed, true);
assert.strictEqual(defaultState.policies.external_dependencies_allowed, false);
assert.ok(Array.isArray(defaultState.tools));
assert.ok(Array.isArray(defaultState.scan_history));

const scanReport = scanKnownTools("2026-05-23T00:00:00.000Z");
assert.ok(Array.isArray(scanReport));
assert.ok(scanReport.length > 0);
assert.ok(scanReport.every((tool) => tool.execution_enabled === false));

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-tool-adapters-contract-"));
const previousCwd = process.cwd();
try {
  process.chdir(tempDir);
  const ensured = runtime.ensureAiToolAdaptersState();
  assert.strictEqual(ensured.version, "v1");
  assert.strictEqual(ensured.policies.execution_default, "disabled");
  assert.ok(fs.existsSync(path.join(tempDir, ".kabeeri", "ai_tool_adapters.json")));
} finally {
  process.chdir(previousCwd);
  fs.rmSync(tempDir, { recursive: true, force: true });
}
