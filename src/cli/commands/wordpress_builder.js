const fs = require("fs");
const path = require("path");
const SOURCE_ROOT = path.resolve(__dirname, "../../..");

function loadWordPressBuilderRuntime() {
  const runtimeIndex = path.join(SOURCE_ROOT, "plugins", "wordpress_builder", "runtime", "index.js");
  if (fs.existsSync(runtimeIndex)) return require(runtimeIndex);
  return null;
}

function buildUnavailableWordPressBuilderReport(action) {
  return {
    report_type: "wordpress_builder_unavailable",
    plugin_id: "wordpress_builder",
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

function wordpressBuilder(action, value, flags = {}, rest = [], deps = {}) {
  const runtime = typeof deps.loadRuntime === "function" ? deps.loadRuntime() : loadWordPressBuilderRuntime();
  if (!runtime) {
    const report = buildUnavailableWordPressBuilderReport(action);
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(report.next_action);
    return report;
  }
  const normalizedFlags = { ...flags };
  const report = runtime.runWordPressBuilder(action, value, normalizedFlags, rest, deps);
  return report;
}

module.exports = {
  wordpressBuilder,
  loadWordPressBuilderRuntime,
  buildUnavailableWordPressBuilderReport
};
