const { buildPluginLoaderReport } = require("../services/plugin_loader");
const { loadPluginBootstrap } = require("../services/plugin_mounts");

function pos(action, value, flags = {}, rest = [], deps = {}) {
  const report = buildPluginLoaderReport();
  const plugin = report.plugins.find((item) => item.plugin_id === "pos");
  const bundle = loadPluginBootstrap("pos", { allowSourceFallback: true });
  if (!bundle || typeof bundle.pos !== "function") {
    throw new Error("POS Builder plugin is not installed. Run `kvdf plugins install pos` first.");
  }
  return bundle.pos(action, value, flags, rest, {
    ...deps,
    plugin,
    plugin_loader_report: report
  });
}

module.exports = {
  pos
};
