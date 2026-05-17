const runtime = require("./runtime");

module.exports = {
  plugin_id: "kvdf-dev",
  name: "KVDF Dev System Bundle",
  command_entrypoint: "plugins/kvdf-dev/bootstrap.js",
  runtime_entrypoint: "plugins/kvdf-dev/runtime/index.js",
  runtime,
  compileTaskControlPlanePacket: runtime.compileTaskControlPlanePacket,
  renderTaskControlPlanePacket: runtime.renderTaskControlPlanePacket,
  compileTaskExecutorContract: runtime.compileTaskExecutorContract,
  renderTaskExecutorContract: runtime.renderTaskExecutorContract,
  runTaskBatch: runtime.runTaskBatch,
  renderTaskBatchRunReport: runtime.renderTaskBatchRunReport
};
