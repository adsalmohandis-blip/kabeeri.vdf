const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../fs_utils");

function loadUiDashboardKitsRuntime() {
  const runtimeIndex = path.join(repoRoot(), "plugins", "ui_dashboard_kits", "runtime", "index.js");
  if (fs.existsSync(runtimeIndex)) return require(runtimeIndex);
  return require("../../../plugins/ui_dashboard_kits/runtime");
}

function uiDashboardKits(action, value, flags = {}, rest = [], deps = {}) {
  void deps;
  const runtime = loadUiDashboardKitsRuntime();
  const mode = normalizeAction(action);

  if (!mode || mode === "status" || mode === "list") {
    outputReport(runtime.getPluginStatus(), flags);
    return;
  }

  if (mode === "check") {
    const files = [value, ...rest].filter(Boolean);
    if (!files.length && !flags.json) {
      console.log(runtime.renderUsage ? runtime.renderUsage() : "Usage: kvdf ui-dashboard-kits check <files...>");
      return;
    }
    const report = runtime.buildUiDashboardKitsCheckReport(files, { strict: Boolean(flags.strict) });
    outputReport(report, flags, renderCheckText);
    if (report.status !== "pass") process.exitCode = 1;
    return;
  }

  if (mode === "examples") {
    outputReport(runtime.buildExamplesReport(), flags);
    return;
  }

  if (mode === "templates") {
    outputReport(runtime.buildTemplatesReport(), flags);
    return;
  }

  if (mode === "snippets") {
    outputReport(runtime.buildSnippetsReport(), flags);
    return;
  }

  if (mode === "provider") {
    const report = runtime.buildDashboardKitProviderSummary
      ? runtime.buildDashboardKitProviderSummary(flags)
      : {
          report_type: "ui_dashboard_kits_provider",
          plugin_id: "ui_dashboard_kits",
          status: "unavailable",
          provider: "fallback",
          available: true,
          fallback_safe: true,
          core_dependency: false,
          ui_library_dependency: false,
          next_action: "Install ui_dashboard_kits if dashboard kit guidance is needed."
        };
    outputReport(report, flags);
    return;
  }

  if (mode === "recommend") {
    const surface = resolveSurface(value, flags, rest);
    const report = runtime.buildDashboardSurfaceRecommendations
      ? runtime.buildDashboardSurfaceRecommendations(surface, flags)
      : {
          report_type: "ui_dashboard_kits_recommendation",
          surface: surface || "owner-dashboard",
          recommended_kits: ["owner-dashboard-summary", "readiness-gates"],
          recommended_widgets: ["loading-state", "empty-state", "error-state"],
          required_states: ["loading", "empty", "error"],
          accessibility_notes: ["Keep keyboard focus visible.", "Explain empty and error states in text."],
          next_action: "Use the fallback kit guidance until ui_dashboard_kits is available."
        };
    outputReport(report, flags);
    return;
  }

  if (mode === "html-comment") {
    const report = {
      report_type: "ui_dashboard_kits_html_comment",
      comment: runtime.buildDashboardKitHtmlComment
        ? runtime.buildDashboardKitHtmlComment(flags)
        : "<!-- KVDF UI dashboard kit provider: fallback -->",
      fallback_comment: "<!-- KVDF UI dashboard kit provider: fallback -->"
    };
    outputReport(report, flags);
    return;
  }

  throw new Error(`Unknown ui-dashboard-kits action: ${action}`);
}

function normalizeAction(action) {
  const value = String(action || "").trim().toLowerCase();
  if (value === "status" || value === "list") return "status";
  if (value === "check") return "check";
  if (value === "examples") return "examples";
  if (value === "templates") return "templates";
  if (value === "snippets") return "snippets";
  if (value === "provider") return "provider";
  if (value === "recommend") return "recommend";
  if (value === "html-comment" || value === "html_comment") return "html-comment";
  return value;
}

function resolveSurface(value, flags = {}, rest = []) {
  const direct = String(flags.surface || flags.target_surface || flags["target-surface"] || value || "").trim();
  if (direct) return direct;
  const positional = rest.find((item) => item && !String(item).startsWith("--"));
  return String(positional || "owner-dashboard").trim() || "owner-dashboard";
}

function outputReport(report, flags, renderer = null) {
  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  if (typeof renderer === "function") {
    console.log(renderer(report));
    return;
  }
  console.log(JSON.stringify(report, null, 2));
}

function renderCheckText(report) {
  if (!report.files_checked || report.files_checked.length === 0) {
    return "Usage: kvdf ui-dashboard-kits check <files...>";
  }
  if (!report.problems.length) return "Kabeeri UI check passed.";
  return ["Kabeeri UI check failed:", ...report.problems.map((problem) => `- ${problem}`)].join("\n");
}

module.exports = {
  uiDashboardKits
};
