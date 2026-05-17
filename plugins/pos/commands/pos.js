const runtime = require("../runtime/pos");

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
