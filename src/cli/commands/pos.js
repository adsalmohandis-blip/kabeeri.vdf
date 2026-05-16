const { createAppPluginRuntime } = require("../services/app_plugin_runtime");
const catalog = require("../services/app_plugin_catalog");

const runtime = createAppPluginRuntime(catalog.pos);

function pos(action, value, flags = {}, rest = [], deps = {}) {
  return runtime.command(action, value, flags, rest, deps);
}

module.exports = {
  pos,
  buildPosStatusReport: runtime.buildStatusReport,
  buildPosReport: runtime.buildReport,
  buildPosQuestions: runtime.buildQuestions,
  buildPosBrief: runtime.buildBrief,
  buildPosDesign: runtime.buildDesign,
  buildPosModules: runtime.buildModules,
  buildPosTasks: runtime.buildTasks
};
