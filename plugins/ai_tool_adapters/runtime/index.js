const commandModule = require("../commands/ai_tool_adapters");
const registry = require("../commands/tool_registry");
const scanner = require("../commands/tool_scan");
const runContract = require("../commands/run_contract");
const runner = require("../commands/tool_runner");
const provider = require("../provider");

function getPluginStatus() {
  return buildAiToolAdaptersStatus();
}

function buildAiToolAdaptersStatus(options = {}) {
  const state = options.state || registry.ensureStateFile();
  return registry.buildStatusReport(state);
}

function buildAiToolAdaptersScanReport(options = {}) {
  const state = options.state || registry.ensureStateFile();
  const { state: nextState, scanHistoryEntry, added } = registry.runScanAndRegister(state);
  return registry.buildScanReport(nextState, nextState.tools, scanHistoryEntry, added);
}

function buildAiToolAdaptersListReport(options = {}) {
  return registry.buildListReport(options.state || registry.ensureStateFile());
}

function buildAiToolAdaptersShowReport(toolId, options = {}) {
  return registry.buildShowReport(toolId, options.state || registry.ensureStateFile());
}

function buildAiToolAdaptersRegisterReport(input = {}, options = {}) {
  const report = registry.registerTool(input, options);
  return report;
}

function buildAiToolAdaptersUnregisterReport(toolId, options = {}) {
  void options;
  return registry.unregisterTool(toolId);
}

function buildAiToolAdaptersTestReport(toolId, contractPath, options = {}) {
  return runContract.buildTestReport(toolId, contractPath, options);
}

function buildAiToolAdaptersRunContractReport(contractPath, options = {}) {
  return runContract.buildRunContractReport(contractPath, options);
}

function buildAiToolAdaptersRunReport(toolId, contractPath, flags = {}, options = {}) {
  return runContract.buildRunReport(toolId, contractPath, flags, options);
}

function buildAiToolAdaptersRunsReport(options = {}) {
  void options;
  return runContract.buildRunsReport();
}

function buildAiToolAdaptersRunShowReport(runId, options = {}) {
  void options;
  return runContract.buildRunShowReport(runId);
}

function buildAiToolAdaptersEnableExecutionReport(toolId, options = {}) {
  void options;
  return runContract.buildEnableExecutionReport(toolId);
}

function buildAiToolAdaptersDisableExecutionReport(toolId, options = {}) {
  void options;
  return runContract.buildDisableExecutionReport(toolId);
}

function aiToolAdapters(action, value, flags = {}, rest = [], deps = {}) {
  return commandModule.aiToolAdapters(action, value, flags, rest, deps);
}

module.exports = {
  STATE_FILE: registry.STATE_FILE,
  DEFAULT_STATE: registry.createDefaultState(),
  getPluginStatus,
  buildAiToolAdaptersStatus,
  buildAiToolAdaptersScanReport,
  buildAiToolAdaptersListReport,
  buildAiToolAdaptersShowReport,
  buildAiToolAdaptersRegisterReport,
  buildAiToolAdaptersUnregisterReport,
  buildAiToolAdaptersTestReport,
  buildAiToolAdaptersRunContractReport,
  buildAiToolAdaptersRunReport,
  buildAiToolAdaptersRunsReport,
  buildAiToolAdaptersRunShowReport,
  buildAiToolAdaptersEnableExecutionReport,
  buildAiToolAdaptersDisableExecutionReport,
  provider,
  getProviderInfo: provider.getProviderInfo,
  ensureState: provider.ensureState,
  listAvailableTools: provider.listAvailableTools,
  getToolCapabilities: provider.getToolCapabilities,
  canRunContract: provider.canRunContract,
  runContract: provider.runContract,
  getRunEvidence: provider.getRunEvidence,
  buildAdapterProviderReport: provider.buildAdapterProviderReport,
  buildAiToolAdaptersProviderReport: provider.buildAdapterProviderReport,
  aiToolAdapters,
  loadAiToolAdaptersState: registry.readState,
  ensureAiToolAdaptersState: registry.ensureStateFile,
  saveAiToolAdaptersState: registry.writeState,
  createDefaultAiToolAdaptersState: registry.createDefaultState,
  normalizeAiToolAdaptersState: registry.normalizeState,
  scanKnownTools: scanner.scanKnownTools,
  resolveExecutableOnPath: scanner.resolveExecutableOnPath,
  KNOWN_TOOL_CANDIDATES: scanner.KNOWN_TOOL_CANDIDATES,
  normalizeToolId: scanner.normalizeToolId,
  normalizeEditor: scanner.normalizeEditor,
  toolTypeForCommand: scanner.toolTypeForCommand,
  displayNameForCommand: scanner.displayNameForCommand,
  capabilitiesForCommand: scanner.capabilitiesForCommand,
  loadRunContractFromFile: runContract.readRunContractFromFile,
  normalizeRunContract: runContract.normalizeRunContract,
  validateRunContract: runContract.validateRunContract,
  buildRunReportFromContract: runContract.buildRunReportFromContract,
  createDefaultRunContract: runContract.createDefaultRunContract,
  redactSensitiveText: runner.redactSensitiveText,
  appendAiToolRunEvent: runner.appendRunEvent,
  readAiToolRunEvents: runner.readRunEvents,
  nextAiToolRunId: runner.nextRunId,
  executeAiToolRun: runner.executeSpawn
};
