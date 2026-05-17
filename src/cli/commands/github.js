const { buildPluginLoaderReport } = require("../services/plugin_loader");
const { loadPluginBootstrap } = require("../services/plugin_mounts");

function github(action, value, flags = {}, deps = {}) {
  const report = buildPluginLoaderReport();
  const plugin = report.plugins.find((item) => item.plugin_id === "github");
  const bundle = loadPluginBootstrap("github", { allowSourceFallback: true });
  if (!bundle || typeof bundle.github !== "function") {
    throw new Error("GitHub plugin is not installed. Run `kvdf plugins install github` first.");
  }
  return bundle.github(action, value, flags, {
    ...deps,
    plugin,
    plugin_loader_report: report
  });
}

module.exports = {
  github
};
