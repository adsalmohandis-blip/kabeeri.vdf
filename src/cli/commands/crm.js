const { createAppPluginRuntime } = require("../services/app_plugin_runtime");
const catalog = require("../services/app_plugin_catalog");

const runtime = createAppPluginRuntime(catalog.crm);

function crm(action, value, flags = {}, rest = [], deps = {}) {
  return runtime.command(action, value, flags, rest, deps);
}

module.exports = {
  crm,
  buildCrmStatusReport: runtime.buildStatusReport,
  buildCrmReport: runtime.buildReport,
  buildCrmQuestions: runtime.buildQuestions,
  buildCrmBrief: runtime.buildBrief,
  buildCrmDesign: runtime.buildDesign,
  buildCrmModules: runtime.buildModules,
  buildCrmTasks: runtime.buildTasks
};
