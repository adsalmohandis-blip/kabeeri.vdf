const { createAppPluginRuntime } = require("../services/app_plugin_runtime");
const catalog = require("../services/app_plugin_catalog");

const runtime = createAppPluginRuntime(catalog["news-website"]);

function newsWebsite(action, value, flags = {}, rest = [], deps = {}) {
  return runtime.command(action, value, flags, rest, deps);
}

module.exports = {
  newsWebsite,
  buildNewsWebsiteStatusReport: runtime.buildStatusReport,
  buildNewsWebsiteReport: runtime.buildReport,
  buildNewsWebsiteQuestions: runtime.buildQuestions,
  buildNewsWebsiteBrief: runtime.buildBrief,
  buildNewsWebsiteDesign: runtime.buildDesign,
  buildNewsWebsiteModules: runtime.buildModules,
  buildNewsWebsiteTasks: runtime.buildTasks
};
