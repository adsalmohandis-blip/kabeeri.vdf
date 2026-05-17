const { buildPluginLoaderReport } = require("../services/plugin_loader");
const { loadPluginBootstrap } = require("../services/plugin_mounts");

function getMultiAiCommunicationsBundle() {
  const bundle = loadPluginBootstrap("multi_ai_governance", { allowSourceFallback: true });
  if (!bundle || !bundle.communications || typeof bundle.multiAiCommunications !== "function") {
    throw new Error("Multi-AI Governance plugin is not installed. Run `kvdf plugins install multi_ai_governance` first.");
  }
  return bundle;
}

function multiAiCommunications(action, value, flags = {}, rest = [], deps = {}) {
  const report = buildPluginLoaderReport();
  const plugin = report.plugins.find((item) => item.plugin_id === "multi_ai_governance");
  const bundle = getMultiAiCommunicationsBundle();
  return bundle.multiAiCommunications(action, value, flags, rest, {
    ...deps,
    plugin,
    plugin_loader_report: report
  });
}

module.exports = {
  multiAiCommunications,
  defaultMultiAiCommunicationsState: (...args) => getMultiAiCommunicationsBundle().communications.defaultMultiAiCommunicationsState(...args),
  ensureMultiAiCommunicationsState: (...args) => getMultiAiCommunicationsBundle().communications.ensureMultiAiCommunicationsState(...args),
  buildMultiAiCommunicationsReport: (...args) => getMultiAiCommunicationsBundle().communications.buildMultiAiCommunicationsReport(...args),
  buildMultiAiRelayReport: (...args) => getMultiAiCommunicationsBundle().communications.buildMultiAiRelayReport(...args),
  renderMultiAiRelayReport: (...args) => getMultiAiCommunicationsBundle().communications.renderMultiAiRelayReport(...args),
  watchMultiAiRelay: (...args) => getMultiAiCommunicationsBundle().communications.watchMultiAiRelay(...args),
  synchronizeRelayWithGovernance: (...args) => getMultiAiCommunicationsBundle().communications.synchronizeRelayWithGovernance(...args)
};
