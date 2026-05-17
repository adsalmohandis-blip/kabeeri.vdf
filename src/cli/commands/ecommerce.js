const { buildPluginLoaderReport } = require("../services/plugin_loader");
const { loadPluginBootstrap } = require("../services/plugin_mounts");

function ecommerce(action, value, flags = {}, rest = [], deps = {}) {
  const report = buildPluginLoaderReport();
  const plugin = report.plugins.find((item) => item.plugin_id === "ecommerce-builder");
  const bundle = loadPluginBootstrap("ecommerce-builder", { allowSourceFallback: true });
  if (!bundle || typeof bundle.ecommerce !== "function") {
    throw new Error("Ecommerce Builder plugin is not installed. Run `kvdf plugins install ecommerce-builder` first.");
  }
  return bundle.ecommerce(action, value, flags, rest, {
    ...deps,
    plugin,
    plugin_loader_report: report
  });
}

module.exports = {
  ecommerce
};
