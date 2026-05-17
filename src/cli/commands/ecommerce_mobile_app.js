const { buildPluginLoaderReport } = require("../services/plugin_loader");
const { loadPluginBootstrap } = require("../services/plugin_mounts");

function ecommerceMobileApp(action, value, flags = {}, rest = [], deps = {}) {
  const report = buildPluginLoaderReport();
  const plugin = report.plugins.find((item) => item.plugin_id === "ecommerce-mobile-app");
  const bundle = loadPluginBootstrap("ecommerce-mobile-app", { allowSourceFallback: true });
  if (!bundle || typeof bundle.ecommerceMobileApp !== "function") {
    throw new Error("Ecommerce Mobile App Builder plugin is not installed. Run `kvdf plugins install ecommerce-mobile-app` first.");
  }
  return bundle.ecommerceMobileApp(action, value, flags, rest, {
    ...deps,
    plugin,
    plugin_loader_report: report
  });
}

module.exports = {
  ecommerceMobileApp
};
