const { buildPluginLoaderReport } = require("../services/plugin_loader");
const { loadPluginBootstrap } = require("../services/plugin_mounts");

function companyProfile(action, value, flags = {}, rest = [], deps = {}) {
  const report = buildPluginLoaderReport();
  const plugin = report.plugins.find((item) => item.plugin_id === "company-profile");
  const bundle = loadPluginBootstrap("company-profile", { allowSourceFallback: true });
  if (!bundle || typeof bundle.companyProfile !== "function") {
    throw new Error("Company Profile Builder plugin is not installed. Run `kvdf plugins install company-profile` first.");
  }
  return bundle.companyProfile(action, value, flags, rest, {
    ...deps,
    plugin,
    plugin_loader_report: report
  });
}

module.exports = {
  companyProfile
};
