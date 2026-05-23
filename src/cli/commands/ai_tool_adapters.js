const { loadPluginBootstrap } = require("../services/plugin_mounts");

function loadAiToolAdaptersBundle() {
  return loadPluginBootstrap("ai_tool_adapters", { allowSourceFallback: true });
}

function buildUnavailableAiToolAdaptersReport(action) {
  return {
    report_type: "ai_tool_adapters_unavailable",
    plugin_id: "ai_tool_adapters",
    status: "unavailable",
    available: false,
    enabled_by_default: true,
    execution_enabled: false,
    requested_action: action || null,
    next_action: "Install or enable ai_tool_adapters to use local AI tool registry commands."
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
