const fs = require("fs");
const path = require("path");

const { repoRoot } = require("../fs_utils");
const { getPluginRuntimeStatus } = require("./plugin_loader");

const PLUGIN_ID = "ui_dashboard_kits";

function loadUiDashboardKitsRuntime() {
  try {
    const runtimePath = path.join(repoRoot(), "plugins", PLUGIN_ID, "runtime");
    if (!fs.existsSync(runtimePath)) return null;
    return require(runtimePath);
  } catch {
    return null;
  }
}

function isProviderRequested(options = {}) {
  const raw = String(
    options.ui_dashboard_kits
    || options.include_ui_dashboard_kits
    || options["include-ui-dashboard-kits"]
    || options["ui-dashboard-kits"]
    || options.provider
    || ""
  ).trim().toLowerCase();
  return raw === PLUGIN_ID || raw === "ui-dashboard-kits" || raw === "dashboard_kits"
    || Boolean(options.withUiDashboardKits || options.with_ui_dashboard_kits || options.includeUiDashboardKits);
}

function getUiDashboardKitProvider(options = {}) {
  const runtimeStatus = getPluginRuntimeStatus(PLUGIN_ID);
  const runtime = loadUiDashboardKitsRuntime();
  const providerSummary = runtime && typeof runtime.buildDashboardKitProviderSummary === "function"
    ? runtime.buildDashboardKitProviderSummary(options)
    : buildFallbackProviderSummary();
  const available = Boolean(runtimeStatus && runtimeStatus.manifest && runtime);
  return {
    ...providerSummary,
    available: true,
    status: available ? (providerSummary.provider === PLUGIN_ID || isProviderRequested(options) ? "available" : "warning") : "unavailable",
    provider: available && isProviderRequested(options) ? PLUGIN_ID : "fallback",
    fallback_used: !available || !isProviderRequested(options),
    next_action: available
      ? (isProviderRequested(options)
        ? "Use ui_dashboard_kits guidance for optional dashboard kit surfaces."
        : "Pass --include-ui-dashboard-kits when you want the plugin guidance.")
      : "Install ui_dashboard_kits if dashboard kit guidance is needed."
  };
}

function buildDashboardKitSummary(options = {}) {
  const runtime = loadUiDashboardKitsRuntime();
  const provider = getUiDashboardKitProvider(options);
  const surface = options.surface || options.target_surface || "owner-dashboard";
  const guidance = runtime && typeof runtime.buildDashboardSurfaceRecommendations === "function"
    ? runtime.buildDashboardSurfaceRecommendations(surface, options)
    : buildFallbackRecommendation(surface);
  return {
    report_type: "ui_dashboard_kits_summary",
    provider: provider.provider,
    available: provider.available,
    fallback_safe: true,
    core_dependency: false,
    ui_library_dependency: false,
    surface: guidance.surface,
    recommended_kits: guidance.recommended_kits,
    recommended_widgets: guidance.recommended_widgets,
    required_states: guidance.required_states,
    accessibility_notes: guidance.accessibility_notes,
    next_action: guidance.next_action
  };
}

function buildDashboardKitGuidanceSummary(options = {}) {
  const provider = getUiDashboardKitProvider(options);
  const summary = buildDashboardKitSummary(options);
  return {
    ...summary,
    provider: provider.provider,
    status: provider.status,
    available: provider.available,
    fallback_used: provider.fallback_used
  };
}

function buildDashboardKitHtmlComment(options = {}) {
  const provider = getUiDashboardKitProvider(options);
  return provider.provider === PLUGIN_ID
    ? "<!-- KVDF UI dashboard kit provider: ui_dashboard_kits -->"
    : "<!-- KVDF UI dashboard kit provider: fallback -->";
}

function buildFallbackProviderSummary() {
  return {
    report_type: "ui_dashboard_kits_provider",
    plugin_id: PLUGIN_ID,
    status: "unavailable",
    provider: "fallback",
    available: true,
    enabled_by_default: false,
    fallback_safe: true,
    core_dependency: false,
    ui_library_dependency: false,
    supports: ["examples", "templates", "snippets", "check", "dashboard_guidance"],
    next_action: "Install ui_dashboard_kits if dashboard kit guidance is needed."
  };
}

function buildFallbackRecommendation(surface) {
  const normalized = String(surface || "owner-dashboard").trim().toLowerCase();
  return {
    surface: normalized,
    recommended_kits: ["owner-dashboard-summary", "readiness-gates"],
    recommended_widgets: ["loading-state", "empty-state", "error-state"],
    required_states: ["loading", "empty", "error"],
    accessibility_notes: [
      "Keep keyboard focus visible.",
      "Explain empty and error states in text."
    ],
    next_action: `Use the fallback kit guidance for ${normalized} until ui_dashboard_kits is explicitly requested.`
  };
}

module.exports = {
  buildDashboardKitGuidanceSummary,
  buildDashboardKitHtmlComment,
  buildDashboardKitSummary,
  getUiDashboardKitProvider
};
