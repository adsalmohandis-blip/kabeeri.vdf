const commandModule = require("../commands/ai_tool_adapters");
const registry = require("../commands/tool_registry");
const scanner = require("../commands/tool_scan");

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
  capabilitiesForCommand: scanner.capabilitiesForCommand
};
