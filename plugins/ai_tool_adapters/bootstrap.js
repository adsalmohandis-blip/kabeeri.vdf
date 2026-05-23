const runtime = require("./runtime");

module.exports = {
  plugin_id: "ai_tool_adapters",
  name: "AI Tool Adapters",
  command_entrypoint: "plugins/ai_tool_adapters/runtime/index.js",
  runtime_entrypoint: "plugins/ai_tool_adapters/runtime/index.js",
  aiToolAdapters: runtime.aiToolAdapters,
  getPluginStatus: runtime.getPluginStatus,
  buildAiToolAdaptersStatus: runtime.buildAiToolAdaptersStatus,
  buildAiToolAdaptersScanReport: runtime.buildAiToolAdaptersScanReport,
  buildAiToolAdaptersListReport: runtime.buildAiToolAdaptersListReport,
  buildAiToolAdaptersShowReport: runtime.buildAiToolAdaptersShowReport,
  buildAiToolAdaptersRegisterReport: runtime.buildAiToolAdaptersRegisterReport,
  buildAiToolAdaptersUnregisterReport: runtime.buildAiToolAdaptersUnregisterReport,
  buildAiToolAdaptersTestReport: runtime.buildAiToolAdaptersTestReport,
  buildAiToolAdaptersRunContractReport: runtime.buildAiToolAdaptersRunContractReport,
  buildAiToolAdaptersRunReport: runtime.buildAiToolAdaptersRunReport,
  buildAiToolAdaptersRunsReport: runtime.buildAiToolAdaptersRunsReport,
  buildAiToolAdaptersRunShowReport: runtime.buildAiToolAdaptersRunShowReport,
  buildAiToolAdaptersEnableExecutionReport: runtime.buildAiToolAdaptersEnableExecutionReport,
  buildAiToolAdaptersDisableExecutionReport: runtime.buildAiToolAdaptersDisableExecutionReport,
  scanKnownTools: runtime.scanKnownTools,
  resolveExecutableOnPath: runtime.resolveExecutableOnPath
};
