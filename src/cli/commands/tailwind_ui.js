const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../fs_utils");
const { buildTailwindGuidanceSummary } = require("../services/ui_asset_provider");

function loadTailwindRuntime() {
  const runtimeIndex = path.join(repoRoot(), "plugins", "tailwind_ui", "runtime", "index.js");
  if (fs.existsSync(runtimeIndex)) return require(runtimeIndex);
  return require("../../../plugins/tailwind_ui/runtime");
}

function tailwindUi(action, value, flags = {}, rest = [], deps = {}) {
  void deps;
  const runtime = loadTailwindRuntime();
  const mode = normalizeAction(action);

  if (!mode || mode === "status" || mode === "list") {
    const report = runtime.getPluginStatus();
    outputReport(report, flags);
    return;
  }

  if (mode === "snippet") {
    const report = runtime.buildTailwindHtmlSnippet({
      title: flags.title || value || rest.join(" ")
    });
    outputReport(report, flags);
    return;
  }

  if (mode === "utility-map" || mode === "utility_map") {
    const report = runtime.buildTailwindUtilityMap();
    outputReport(report, flags);
    return;
  }

  if (mode === "verify") {
    const report = runtime.verifyTailwindCoreDependencyRemoved();
    outputReport(report, flags);
    return;
  }

  if (mode === "provider") {
    const report = buildTailwindGuidanceSummary({
      idea: flags.idea || value || rest.join(" "),
      goal: flags.goal || value || rest.join(" "),
      app: flags.app || flags.app_slug || "",
      track: flags.track || "",
      stack: flags.stack || flags.stack_name || "",
      ui_provider: flags.ui_provider || flags.provider || "",
      provider: flags.ui_provider || flags.provider || "",
      withTailwind: flags.withTailwind || flags["with-tailwind"],
      with_tailwind: flags.with_tailwind,
      noTailwind: flags.noTailwind || flags["no-tailwind"],
      no_tailwind: flags.no_tailwind
    });
    outputReport({
      report_type: "tailwind_ui_provider",
      provider: report.provider || "fallback",
      available: Boolean(report.available),
      enabled: Boolean(report.enabled),
      core_dependency: false,
      core_dev_dependency: false,
      runtime_mode: report.runtime_mode || "guidance_only",
      fallback_used: report.fallback_used !== false,
      next_action: report.next_action || "Use kvdf tailwind-ui planner-guidance or docs-guidance when Tailwind is explicitly selected."
    }, flags);
    return;
  }

  if (mode === "planner-guidance" || mode === "planner_guidance") {
    const report = runtime.buildTailwindPlannerGuidance({
      idea: flags.idea || value || rest.join(" "),
      goal: flags.goal || value || rest.join(" "),
      stack: flags.stack || flags.stack_name || "",
      app: flags.app || flags.app_slug || ""
    });
    outputReport(report, flags);
    return;
  }

  if (mode === "docs-guidance" || mode === "docs_guidance") {
    const report = runtime.buildTailwindDocsGuidance({
      idea: flags.idea || value || rest.join(" "),
      goal: flags.goal || value || rest.join(" "),
      track: flags.track || "",
      app: flags.app || flags.app_slug || "",
      stack: flags.stack || flags.stack_name || ""
    });
    outputReport(report, flags);
    return;
  }

  if (mode === "html-comment" || mode === "html_comment") {
    const provider = runtime.buildTailwindProviderSummary({
      idea: flags.idea || value || rest.join(" ")
    });
    outputReport({
      report_type: "tailwind_ui_html_comment",
      comment: "<!-- KVDF UI provider: tailwind_ui guidance-only -->",
      fallback_comment: "<!-- KVDF UI provider: fallback -->",
      provider: provider.provider || "fallback",
      runtime_mode: provider.runtime_mode || "guidance_only"
    }, flags);
    return;
  }

  throw new Error(`Unknown tailwind-ui action: ${action}`);
}

function normalizeAction(action) {
  const value = String(action || "").trim().toLowerCase();
  if (!value) return "";
  if (value === "status" || value === "list") return "status";
  if (value === "snippet") return "snippet";
  if (value === "utility-map" || value === "utility_map" || value === "utilitymap") return "utility-map";
  if (value === "verify") return "verify";
  if (value === "provider") return "provider";
  if (value === "planner-guidance" || value === "planner_guidance") return "planner-guidance";
  if (value === "docs-guidance" || value === "docs_guidance") return "docs-guidance";
  if (value === "html-comment" || value === "html_comment") return "html-comment";
  return value;
}

function outputReport(report, flags) {
  if (flags.json) console.log(JSON.stringify(report, null, 2));
  else if (report && typeof report.html === "string") console.log(report.html);
  else console.log(JSON.stringify(report, null, 2));
}

module.exports = {
  tailwindUi
};
