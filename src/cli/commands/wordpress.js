const fs = require("fs");
const path = require("path");

const SOURCE_ROOT = path.resolve(__dirname, "../../..");

function loadLegacyWordPressRuntime() {
  const runtimeFile = path.join(SOURCE_ROOT, "plugins", "wordpress_builder", "runtime", "wordpress.js");
  if (fs.existsSync(runtimeFile)) return require(runtimeFile);
  return null;
}

function buildUnavailableWordPressReport(action) {
  return {
    report_type: "wordpress_compatibility_unavailable",
    plugin_id: "wordpress_builder",
    status: "unavailable",
    available: false,
    enabled_by_default: false,
    core_dependency: false,
    plugin_family: "app_builders",
    plugin_type: "wordpress_platform_builder",
    requested_action: action || null,
    next_action: "Install or enable the wordpress_builder plugin to use WordPress compatibility commands."
  };
}

function wordpress(action, value, flags = {}, rest = [], deps = {}) {
  const runtime = typeof deps.loadRuntime === "function" ? deps.loadRuntime() : loadLegacyWordPressRuntime();
  if (!runtime || typeof runtime.runLegacyWordPressCommand !== "function") {
    const report = buildUnavailableWordPressReport(action);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(report.next_action);
    return report;
  }
  const normalizedFlags = { ...flags };
  return runtime.runLegacyWordPressCommand(action, value, normalizedFlags, rest, deps);
}

module.exports = {
  wordpress,
  loadLegacyWordPressRuntime,
  buildUnavailableWordPressReport
};
