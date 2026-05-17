const { buildPluginLoaderReport } = require("../services/plugin_loader");
const { loadPluginBootstrap } = require("../services/plugin_mounts");

function blog(action, value, flags = {}, rest = [], deps = {}) {
  const report = buildPluginLoaderReport();
  const plugin = report.plugins.find((item) => item.plugin_id === "blog");
  const bundle = loadPluginBootstrap("blog", { allowSourceFallback: true });
  if (!bundle || typeof bundle.blog !== "function") {
    throw new Error("Blog Builder plugin is not installed. Run `kvdf plugins install blog` first.");
  }
  return bundle.blog(action, value, flags, rest, {
    ...deps,
    plugin,
    plugin_loader_report: report
  });
}

module.exports = {
  blog
};
