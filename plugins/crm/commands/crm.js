const runtime = require("../runtime/crm");

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
