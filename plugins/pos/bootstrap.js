const command = require("./commands/pos");
const runtime = require("./runtime/pos");

module.exports = {
  plugin_id: "pos",
  name: "POS Builder",
  command_entrypoint: "plugins/pos/bootstrap.js",
  runtime_entrypoint: "plugins/pos/runtime/pos.js",
  pos: command.pos,
  command: command.pos,
  runtime,
  buildPosStatusReport: runtime.buildStatusReport,
  buildPosReport: runtime.buildReport,
  buildPosQuestions: runtime.buildQuestions,
  buildPosBrief: runtime.buildBrief,
  buildPosDesign: runtime.buildDesign,
  buildPosModules: runtime.buildModules,
  buildPosTasks: runtime.buildTasks
};
