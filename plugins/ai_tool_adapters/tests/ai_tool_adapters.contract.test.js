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
assert.strictEqual(pluginManifest.name, "AI Tool Adapter");
assert.strictEqual(pluginManifest.enabled_by_default, true);
assert.strictEqual(typeof bootstrap.aiToolAdapters, "function");
assert.ok(bootstrap.provider);
assert.strictEqual(typeof bootstrap.provider.getProviderInfo, "function");
assert.strictEqual(typeof runtime.aiToolAdapters, "function");
assert.strictEqual(typeof runtime.getProviderInfo, "function");
assert.strictEqual(typeof runtime.canRunContract, "function");
assert.strictEqual(typeof runtime.runContract, "function");
assert.strictEqual(typeof runtime.buildAiToolAdaptersCatalogReport, "function");
assert.strictEqual(typeof runtime.buildAiToolAdaptersAdaptationPackReport, "function");
assert.strictEqual(typeof runtime.buildAiToolAdaptersPromptCatalogReport, "function");
assert.strictEqual(typeof runtime.buildAiToolAdaptersPromptCompositionReport, "function");
assert.strictEqual(typeof runtime.buildAiToolAdaptersPromptBlueprintReport, "function");

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
assert.ok(scanReport.some((tool) => tool.platform_name === "claude"));
assert.ok(scanReport.every((tool) => typeof tool.adapter_family === "string"));

const catalogReport = runtime.buildAiToolAdaptersCatalogReport();
assert.strictEqual(catalogReport.report_type, "ai_tool_adapters_catalog");
assert.ok(catalogReport.count >= 10);
assert.ok(Array.isArray(catalogReport.profiles));
assert.ok(catalogReport.profiles.some((profile) => profile.platform_name === "claude"));
assert.ok(Array.isArray(catalogReport.adaptation_packs));
assert.ok(catalogReport.adaptation_packs.some((pack) => pack.platform_name === "claude"));
assert.ok(catalogReport.profiles.every((profile) => profile.adaptation_pack_id));
assert.ok(catalogReport.profiles.every((profile) => typeof profile.activation_state === "string"));
assert.ok(catalogReport.summary.by_activation);
assert.ok(catalogReport.prompt_profile_count >= 10);

const packReport = runtime.buildAiToolAdaptersAdaptationPackReport();
assert.strictEqual(packReport.report_type, "ai_tool_adapters_adaptation_packs");
assert.ok(packReport.count >= 10);
assert.ok(packReport.packs.some((pack) => pack.platform_name === "gemini"));
assert.ok(packReport.packs.every((pack) => typeof pack.description === "string"));
assert.ok(packReport.packs.every((pack) => Array.isArray(pack.tags)));
assert.ok(packReport.summary.by_activation);

const promptReport = runtime.buildAiToolAdaptersPromptCatalogReport();
assert.strictEqual(promptReport.report_type, "ai_tool_adapters_prompt_profiles");
assert.ok(promptReport.count >= 10);
assert.ok(promptReport.prompt_profiles.some((profile) => profile.platform_name === "claude"));
assert.ok(promptReport.prompt_profiles.every((profile) => profile.prompt_profile));

const compositionReport = runtime.buildAiToolAdaptersPromptCompositionReport({
  brief: "fix login bug",
  tool: "claude",
  track: "owner",
  track_mode: "owner_core",
  context: "The login form is failing validation on submit."
});
assert.strictEqual(compositionReport.report_type, "ai_tool_adapters_prompt_composition");
assert.ok(compositionReport.professional_prompt.includes("Task: Fix login bug"));
assert.ok(compositionReport.composed_prompt.includes("## User"));
assert.strictEqual(compositionReport.platform_name, "claude");
assert.strictEqual(compositionReport.track, "owner");
assert.strictEqual(compositionReport.track_label, "KVDF Core owner track");
assert.strictEqual(compositionReport.track_mode, "owner_core");
assert.strictEqual(compositionReport.track_mode_label, "owner core template");
assert.strictEqual(compositionReport.track_mode_goal, "Keep core implementation work direct, main-ready, and evidence-first.");
assert.strictEqual(compositionReport.preset, "bugfix");
assert.strictEqual(compositionReport.preset_label, "bugfix prompt");
assert.ok(Array.isArray(compositionReport.examples));
assert.ok(Array.isArray(compositionReport.track_examples));
assert.ok(Array.isArray(compositionReport.track_mode_examples));
assert.ok(Array.isArray(compositionReport.track_mode_aliases));
assert.ok(Array.isArray(compositionReport.decision_checkpoints));
assert.ok(compositionReport.examples.some((item) => item.includes("login bug")));

const blueprintReport = runtime.buildAiToolAdaptersPromptBlueprintReport({
  brief: "fix login bug",
  tool: "codex",
  track: "owner",
  track_mode: "owner_docs"
});
assert.strictEqual(blueprintReport.style_label, "patch-first engineering prompt");
assert.strictEqual(blueprintReport.track, "owner");
assert.strictEqual(blueprintReport.track_label, "KVDF Core owner track");
assert.strictEqual(blueprintReport.track_mode, "owner_docs");
assert.strictEqual(blueprintReport.track_mode_label, "owner docs template");
assert.strictEqual(blueprintReport.track_mode_goal, "Keep KVDF Core documentation authoritative and easy to review.");
assert.strictEqual(blueprintReport.preset, "bugfix");
assert.strictEqual(blueprintReport.preset_label, "bugfix prompt");
assert.ok(Array.isArray(blueprintReport.must_include));
assert.ok(Array.isArray(blueprintReport.output_contract));
assert.ok(Array.isArray(blueprintReport.response_frame));
assert.ok(Array.isArray(blueprintReport.track_examples));
assert.ok(Array.isArray(blueprintReport.track_mode_examples));
assert.ok(Array.isArray(blueprintReport.track_mode_aliases));
assert.ok(Array.isArray(blueprintReport.decision_checkpoints));
assert.ok(Array.isArray(blueprintReport.examples));
assert.ok(blueprintReport.user_prompt.includes("Task: Fix login bug"));

const aliasReport = runtime.buildAiToolAdaptersPromptCompositionReport({
  brief: "refresh the docs for the owner workflow",
  tool: "claude",
  track: "owner",
  track_mode: "docs"
});
assert.strictEqual(aliasReport.track_mode, "owner_docs");
assert.strictEqual(aliasReport.track_mode_label, "owner docs template");

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
