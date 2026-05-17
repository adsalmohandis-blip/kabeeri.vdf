const { buildPluginLoaderReport } = require("../services/plugin_loader");
const { loadPluginBootstrap } = require("../services/plugin_mounts");

function crm(action, value, flags = {}, rest = [], deps = {}) {
  const report = buildPluginLoaderReport();
  const plugin = report.plugins.find((item) => item.plugin_id === "crm");
  const bundle = loadPluginBootstrap("crm", { allowSourceFallback: true });
  if (!bundle || typeof bundle.crm !== "function") {
    throw new Error("CRM Builder plugin is not installed. Run `kvdf plugins install crm` first.");
  }
  return bundle.crm(action, value, flags, rest, {
    ...deps,
    plugin,
    plugin_loader_report: report
  });
}

module.exports = {
  crm
};
