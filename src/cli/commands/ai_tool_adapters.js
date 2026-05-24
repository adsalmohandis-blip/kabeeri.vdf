const { getPluginRuntimeStatus } = require("../services/plugin_loader");
const { loadPluginBootstrap } = require("../services/plugin_mounts");

function loadAiToolAdaptersBundle() {
  const plugin = getPluginRuntimeStatus("ai_tool_adapters");
  if (!plugin || !plugin.available || !plugin.enabled) {
    return null;
  }
  return loadPluginBootstrap("ai_tool_adapters", { allowSourceFallback: true });
}

function buildUnavailableAiToolAdaptersReport(action) {
  return {
    report_type: "ai_tool_adapters_unavailable",
    plugin_id: "ai_tool_adapters",
    plugin_name: "AI Tool Adapter",
    status: "unavailable",
    available: false,
    enabled_by_default: false,
    execution_enabled: false,
    requested_action: action || null,
    next_action: "AI Tool Adapter plugin is not installed or enabled. Run `kvdf plugins install ai_tool_adapters` first."
  };
}

function aiToolAdapters(action, value, flags = {}, rest = [], deps = {}) {
  const bundle = typeof deps.loadRuntime === "function" ? deps.loadRuntime() : loadAiToolAdaptersBundle();
  if (!bundle || typeof bundle.aiToolAdapters !== "function") {
    const report = buildUnavailableAiToolAdaptersReport(action);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(report.next_action);
    return report;
  }
  return bundle.aiToolAdapters(action, value, flags, rest, deps);
}

module.exports = {
  aiToolAdapters,
  loadAiToolAdaptersBundle,
  buildUnavailableAiToolAdaptersReport
};
