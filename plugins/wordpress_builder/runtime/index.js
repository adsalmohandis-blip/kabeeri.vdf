const { buildWordPressSitePlan } = require("./site_plan");
const { buildWordPressThemePlan } = require("./theme_plan");
const { buildWordPressPluginPlan } = require("./plugin_plan");
const { buildWooCommercePlan } = require("./woocommerce_plan");
const { buildWordPressSecurityCleanupPlan } = require("./security_cleanup_plan");
const { runLegacyWordPressCommand } = require("./wordpress");

const PLUGIN_ID = "wordpress_builder";
const PLUGIN_VERSION = "0.1.0";

function getPluginStatus() {
  return {
    report_type: "wordpress_builder_status",
    plugin_id: PLUGIN_ID,
    plugin_version: PLUGIN_VERSION,
    status: "available",
    capabilities: [
      "site_plan",
      "theme_plan",
      "plugin_plan",
      "woocommerce_plan",
      "security_cleanup_plan"
    ],
    enabled_by_default: false,
    core_dependency: false,
    plugin_family: "app_builders",
    plugin_type: "wordpress_platform_builder",
    standalone: true,
    external_github_dependency: false,
    next_action: "Run kvdf wordpress-builder plan --idea \"...\" --json."
  };
}

function runWordPressBuilder(action, value, flags = {}, rest = [], deps = {}) {
  const normalizedAction = normalizeAction(action);
  if (!normalizedAction || normalizedAction === "status" || normalizedAction === "list") {
    const report = getPluginStatus();
    printReport(report, flags);
    return report;
  }

  if (normalizedAction === "plan") {
    const report = buildWordPressSitePlan([value, ...rest].filter(Boolean).join(" ") || flags.idea || flags.description || "WordPress website", flags);
    printReport(report, flags);
    return report;
  }

  if (normalizedAction === "theme-plan") {
    const report = buildWordPressThemePlan([value, ...rest].filter(Boolean).join(" ") || flags.idea || flags.description || "WordPress theme", flags);
    printReport(report, flags);
    return report;
  }

  if (normalizedAction === "plugin-plan") {
    const report = buildWordPressPluginPlan([value, ...rest].filter(Boolean).join(" ") || flags.idea || flags.description || "WordPress plugin", flags);
    printReport(report, flags);
    return report;
  }

  if (normalizedAction === "woocommerce-plan") {
    const report = buildWooCommercePlan([value, ...rest].filter(Boolean).join(" ") || flags.idea || flags.description || "WooCommerce store", flags);
    printReport(report, flags);
    return report;
  }

  if (normalizedAction === "security-cleanup-plan") {
    const report = buildWordPressSecurityCleanupPlan([value, ...rest].filter(Boolean).join(" ") || flags.idea || flags.description || "WordPress security cleanup", flags);
    printReport(report, flags);
    return report;
  }

  return runLegacyWordPressCommand(action, value, flags, rest, normalizeDeps(deps));
}

function normalizeAction(action) {
  const value = String(action || "").trim().toLowerCase();
  if (value === "status" || value === "list") return "status";
  if (value === "plan") return "plan";
  if (value === "theme-plan" || value === "theme_plan") return "theme-plan";
  if (value === "plugin-plan" || value === "plugin_plan") return "plugin-plan";
  if (value === "woocommerce-plan" || value === "woocommerce_plan") return "woocommerce-plan";
  if (value === "security-cleanup-plan" || value === "security_cleanup_plan") return "security-cleanup-plan";
  if (value === "analyse") return "analyze";
  return value;
}

function normalizeDeps(deps) {
  return {
    ...deps,
    repoRoot: deps.repoRoot || (() => process.cwd())
  };
}

function printReport(report, flags) {
  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(JSON.stringify(report, null, 2));
}

function buildUnavailableWordPressBuilderReport(action) {
  return {
    report_type: "wordpress_builder_unavailable",
    plugin_id: PLUGIN_ID,
    status: "unavailable",
    available: false,
    enabled_by_default: false,
    core_dependency: false,
    plugin_family: "app_builders",
    plugin_type: "wordpress_platform_builder",
    requested_action: action || null,
    next_action: "Install or enable the wordpress_builder plugin to use WordPress planning commands."
  };
}

module.exports = {
  getPluginStatus,
  runWordPressBuilder,
  buildWordPressSitePlan,
  buildWordPressThemePlan,
  buildWordPressPluginPlan,
  buildWooCommercePlan,
  buildWordPressSecurityCleanupPlan,
  buildUnavailableWordPressBuilderReport
};
