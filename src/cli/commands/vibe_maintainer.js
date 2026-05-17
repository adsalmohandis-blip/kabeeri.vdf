const { buildPluginLoaderReport } = require("../services/plugin_loader");
const { loadPluginBootstrap } = require("../services/plugin_mounts");

function vibeMaintainer(action, value, flags = {}, rest = [], deps = {}) {
  const report = buildPluginLoaderReport();
  const plugin = report.plugins.find((item) => item.plugin_id === "vibe-maintainer");
  const bundle = loadPluginBootstrap("vibe-maintainer", { allowSourceFallback: true });
  if (!bundle || typeof bundle.vibeMaintainer !== "function") {
    throw new Error("Vibe Maintainer plugin is not installed. Run `kvdf plugins install vibe-maintainer` first.");
  }
  return bundle.vibeMaintainer(action, value, flags, rest, {
    ...deps,
    plugin,
    plugin_loader_report: report
  });
}

module.exports = {
  vibeMaintainer
};
