const { createAppPluginRuntime } = require("../services/app_plugin_runtime");
const catalog = require("../services/app_plugin_catalog");

const runtime = createAppPluginRuntime(catalog.blog);

function blog(action, value, flags = {}, rest = [], deps = {}) {
  return runtime.command(action, value, flags, rest, deps);
}

module.exports = {
  blog,
  buildBlogStatusReport: runtime.buildStatusReport,
  buildBlogReport: runtime.buildReport,
  buildBlogQuestions: runtime.buildQuestions,
  buildBlogBrief: runtime.buildBrief,
  buildBlogDesign: runtime.buildDesign,
  buildBlogModules: runtime.buildModules,
  buildBlogTasks: runtime.buildTasks
};
