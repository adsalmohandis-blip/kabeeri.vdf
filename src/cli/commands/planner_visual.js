const { buildPluginLoaderReport } = require("../services/plugin_loader");
const { buildPlannerVisualReport, buildPlannerVisualFromCurrentReport } = require("./planner");
const { renderMarkdownVisualReport, buildPlannerVisualRenderArtifact } = require("../../../plugins/planner-visual/runtime");

function plannerVisual(action, value, flags = {}, rest = [], deps = {}) {
  const { ensureWorkspace = () => {} } = deps;
  ensureWorkspace();
  const mode = normalizeAction(action);
  const pluginReport = buildPluginLoaderReport();
  const plugin = Array.isArray(pluginReport.plugins)
    ? pluginReport.plugins.find((item) => item.plugin_id === "planner-visual" || item.name === "planner-visual")
    : null;

  if (!mode || mode === "status" || mode === "list") {
    const report = buildPlannerVisualPluginStatus(plugin);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderPlannerVisualPluginStatus(report));
    return;
  }

  if (!plugin || !plugin.enabled) {
    throw new Error("Planner Visual Renderer plugin is not installed. Run `kvdf plugins install planner-visual` first.");
  }

  if (mode === "render" || mode === "export") {
    const visual = isFromCurrentPlan(flags)
      ? buildPlannerVisualFromCurrentReport({}, deps)
      : buildPlannerVisualReport(resolveGoal(value, flags, rest), buildPlannerVisualRequest(flags), deps);
    const artifact = buildPlannerVisualRenderArtifact(visual, { pluginId: "planner-visual" });
    if (flags.json) console.log(JSON.stringify(artifact, null, 2));
    else console.log(renderMarkdownVisualReport(visual));
    return;
  }

  throw new Error(`Unknown planner-visual action: ${action}`);
}

function buildPlannerVisualPluginStatus(plugin) {
  const available = Boolean(plugin);
  const enabled = Boolean(plugin && plugin.enabled);
  return {
    report_type: "planner_visual_plugin_status",
    plugin_id: "planner-visual",
    status: available ? "available" : "missing",
    renderer: "mermaid_text",
    plugin_enabled: enabled,
    generated_at: new Date().toISOString(),
    next_action: enabled
      ? "Run kvdf planner visual --json, then render with planner-visual."
      : "Run kvdf plugins install planner-visual."
  };
}

function renderPlannerVisualPluginStatus(report) {
  return [
    "Planner Visual Renderer",
    "",
    `Plugin: ${report.plugin_id}`,
    `Status: ${report.status}`,
    `Renderer: ${report.renderer}`,
    `Enabled: ${report.plugin_enabled ? "yes" : "no"}`,
    `Next action: ${report.next_action}`
  ].join("\n");
}

function buildPlannerVisualRequest(flags) {
  const request = {};
  if (flags.plugin) {
    request.mode = "plugin";
    request.plugin_id = flags.plugin;
    return request;
  }
  request.mode = normalizeTrackAlias(flags.track);
  return request;
}

function resolveGoal(value, flags = {}, rest = []) {
  const candidates = [value, flags.goal, flags.title, rest.filter(Boolean).join(" ")];
  const goal = candidates.find((item) => typeof item === "string" && item.trim());
  return goal ? String(goal).trim() : "";
}

function normalizeTrackAlias(value) {
  if (!value) return "owner";
  const normalized = String(value || "").trim().toLowerCase().replace(/[\s_-]+/g, "_");
  if (["owner", "framework_owner", "kvdf"].includes(normalized)) return "owner";
  if (["vibe", "app", "app_developer", "vibe_app_developer"].includes(normalized)) return "vibe";
  if (["plugin", "plugins"].includes(normalized)) return "plugin";
  return "owner";
}

function isFromCurrentPlan(flags) {
  return Boolean(flags["from-current"] || flags.fromCurrent || flags.from_current);
}

function normalizeAction(action) {
  const text = String(action || "").trim().toLowerCase();
  if (text === "add") return "render";
  return text;
}

module.exports = {
  plannerVisual,
  buildPlannerVisualPluginStatus,
  renderPlannerVisualPluginStatus
};
