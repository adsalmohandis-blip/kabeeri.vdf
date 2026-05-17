const { buildPluginLoaderReport } = require("../services/plugin_loader");
const { loadPluginBootstrap } = require("../services/plugin_mounts");

function newsWebsite(action, value, flags = {}, rest = [], deps = {}) {
  const report = buildPluginLoaderReport();
  const plugin = report.plugins.find((item) => item.plugin_id === "news-website");
  const bundle = loadPluginBootstrap("news-website", { allowSourceFallback: true });
  if (!bundle || typeof bundle.newsWebsite !== "function") {
    throw new Error("News Website Builder plugin is not installed. Run `kvdf plugins install news-website` first.");
  }
  return bundle.newsWebsite(action, value, flags, rest, {
    ...deps,
    plugin,
    plugin_loader_report: report
  });
}

module.exports = {
  newsWebsite
};
