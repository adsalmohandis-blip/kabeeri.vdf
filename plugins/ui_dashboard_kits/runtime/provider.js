const fs = require("fs");
const path = require("path");

const PLUGIN_ID = "ui_dashboard_kits";
const SUPPORTED_SURFACES = [
  "owner-dashboard",
  "viber-dashboard",
  "planner-visual",
  "docs-site",
  "task-board",
  "release-readiness",
  "security-gate",
  "ai-cost-control",
  "docs-status"
];

function pluginRoot() {
  return path.resolve(__dirname, "..");
}

function pluginManifest() {
  const manifestPath = path.join(pluginRoot(), "plugin.json");
  try {
    if (!fs.existsSync(manifestPath)) return null;
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    return null;
  }
}

function shouldPreferPlugin(options = {}) {
  const raw = String(
    options.ui_dashboard_kits
    || options.include_ui_dashboard_kits
    || options["include-ui-dashboard-kits"]
    || options["ui-dashboard-kits"]
    || options.provider
    || ""
  ).trim().toLowerCase();
  if (raw === "ui_dashboard_kits" || raw === "ui-dashboard-kits" || raw === "dashboard_kits") return true;
  if (raw === "fallback" || raw === "default" || raw === "none") return false;
  return Boolean(options.withUiDashboardKits || options.with_ui_dashboard_kits || options.includeUiDashboardKits);
}

function normalizeSurface(surface) {
  const normalized = String(surface || "").trim().toLowerCase().replace(/[_\s]+/g, "-");
  return SUPPORTED_SURFACES.includes(normalized) ? normalized : "owner-dashboard";
}

function buildDashboardSurfaceRecommendations(surface, options = {}) {
  void options;
  const normalizedSurface = normalizeSurface(surface || options.surface || options.target_surface || "owner-dashboard");
  const recommendationMap = {
    "owner-dashboard": {
      recommended_kits: ["owner-dashboard-summary", "readiness-gates", "cost-control-widget", "security-gate-widget", "docs-status-widget"],
      recommended_widgets: ["kpi-overview", "recent-actions", "governance-summary", "release-status"],
      accessibility_notes: [
        "Keep focus states visible on summary cards and filters.",
        "Ensure metric cards have text labels, not color-only meaning."
      ]
    },
    "viber-dashboard": {
      recommended_kits: ["viber-dashboard-summary", "readiness-gates", "security-gate-widget", "docs-status-widget"],
      recommended_widgets: ["readiness-timeline", "gate-summary", "handoff-status", "docs-status"],
      accessibility_notes: [
        "Provide keyboard access to all dashboard actions.",
        "Keep loading, empty, and error states explicit."
      ]
    },
    "planner-visual": {
      recommended_kits: ["planner-visual-summary", "task-board", "readiness-gates"],
      recommended_widgets: ["stage-map", "task-punch-preview", "review-status", "stop-condition"],
      accessibility_notes: [
        "Preserve readable contrast in visual timeline panels.",
        "Ensure planner visuals degrade to text when diagrams are unavailable."
      ]
    },
    "docs-site": {
      recommended_kits: ["docs-status-widget", "readiness-gates"],
      recommended_widgets: ["docs-coverage", "publication-status", "missing-docs"],
      accessibility_notes: [
        "Keep document navigation clear and keyboard accessible.",
        "Avoid color-only status cues in documentation indexes."
      ]
    },
    "task-board": {
      recommended_kits: ["task-board", "readiness-gates"],
      recommended_widgets: ["task-columns", "task-status", "blocked-items"],
      accessibility_notes: [
        "Ensure drag/reorder alternatives are keyboard accessible.",
        "Expose task status with text labels."
      ]
    },
    "release-readiness": {
      recommended_kits: ["readiness-gates", "security-gate-widget", "cost-control-widget"],
      recommended_widgets: ["release-gates", "risk-summary", "next-action"],
      accessibility_notes: [
        "Publish readiness states must be readable without motion.",
        "Explain blockers in text, not only icons."
      ]
    },
    "security-gate": {
      recommended_kits: ["security-gate-widget", "readiness-gates"],
      recommended_widgets: ["security-summary", "policy-status", "exception-list"],
      accessibility_notes: [
        "Use explicit warning text for blocked security gates.",
        "Keep destructive actions separated from status summaries."
      ]
    },
    "ai-cost-control": {
      recommended_kits: ["cost-control-widget", "readiness-gates"],
      recommended_widgets: ["usage-trends", "budget-status", "optimization-tips"],
      accessibility_notes: [
        "Expose budget thresholds with text and not color alone.",
        "Keep cost trends readable at narrow widths."
      ]
    },
    "docs-status": {
      recommended_kits: ["docs-status-widget", "readiness-gates"],
      recommended_widgets: ["coverage-summary", "missing-docs", "review-status"],
      accessibility_notes: [
        "Make missing-docs states obvious and actionable.",
        "Provide headings and landmarks for document status sections."
      ]
    }
  };
  const selected = recommendationMap[normalizedSurface] || recommendationMap["owner-dashboard"];
  return {
    report_type: "ui_dashboard_kits_recommendation",
    surface: normalizedSurface,
    recommended_kits: [...selected.recommended_kits],
    recommended_widgets: [...selected.recommended_widgets],
    required_states: ["loading", "empty", "error"],
    accessibility_notes: [...selected.accessibility_notes],
    next_action: `Use the ${normalizedSurface} kit guidance when shaping dashboard, docs, or planner surfaces.`
  };
}

function buildDashboardKitProviderSummary(options = {}) {
  const manifest = pluginManifest();
  const runtimePath = path.join(pluginRoot(), "runtime", "index.js");
  const available = Boolean(manifest && fs.existsSync(runtimePath));
  const provider = available && shouldPreferPlugin(options) ? PLUGIN_ID : "fallback";
  return {
    report_type: "ui_dashboard_kits_provider",
    plugin_id: PLUGIN_ID,
    status: available ? (provider === PLUGIN_ID ? "available" : "warning") : "unavailable",
    provider,
    available: true,
    enabled_by_default: false,
    fallback_safe: true,
    core_dependency: false,
    ui_library_dependency: false,
    supports: ["examples", "templates", "snippets", "check", "dashboard_guidance"],
    next_action: provider === PLUGIN_ID
      ? "Use ui_dashboard_kits for dashboard kit recommendations and optional guidance."
      : available
        ? "Pass --include-ui-dashboard-kits when you want to opt into the plugin guidance."
        : "Install ui_dashboard_kits if dashboard kit guidance is needed."
  };
}

function buildDashboardKitGuidance(options = {}) {
  const provider = buildDashboardKitProviderSummary(options);
  const recommendation = buildDashboardSurfaceRecommendations(options.surface || options.target_surface || "owner-dashboard", options);
  return {
    report_type: "ui_dashboard_kits_guidance",
    plugin_id: PLUGIN_ID,
    provider: provider.provider,
    status: provider.status,
    available: provider.available,
    fallback_safe: true,
    core_dependency: false,
    ui_library_dependency: false,
    surface: recommendation.surface,
    recommended_kits: recommendation.recommended_kits,
    recommended_widgets: recommendation.recommended_widgets,
    required_states: recommendation.required_states,
    accessibility_notes: recommendation.accessibility_notes,
    next_action: recommendation.next_action
  };
}

function buildDashboardKitHtmlComment(options = {}) {
  const provider = buildDashboardKitProviderSummary(options);
  return provider.provider === PLUGIN_ID
    ? "<!-- KVDF UI dashboard kit provider: ui_dashboard_kits -->"
    : "<!-- KVDF UI dashboard kit provider: fallback -->";
}

module.exports = {
  buildDashboardKitGuidance,
  buildDashboardKitHtmlComment,
  buildDashboardKitProviderSummary,
  buildDashboardSurfaceRecommendations
};
