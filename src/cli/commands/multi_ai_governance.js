const { buildPluginLoaderReport } = require("../services/plugin_loader");
const { loadPluginBootstrap } = require("../services/plugin_mounts");

function getMultiAiGovernanceBundle() {
  const bundle = loadPluginBootstrap("multi_ai_governance", { allowSourceFallback: true });
  if (!bundle || !bundle.governance || typeof bundle.multiAiGovernance !== "function") {
    throw new Error("Multi-AI Governance plugin is not installed. Run `kvdf plugins install multi_ai_governance` first.");
  }
  return bundle;
}

function multiAiGovernance(action, value, flags = {}, deps = {}) {
  const report = buildPluginLoaderReport();
  const plugin = report.plugins.find((item) => item.plugin_id === "multi_ai_governance");
  const bundle = getMultiAiGovernanceBundle();
  return bundle.multiAiGovernance(action, value, flags, {
    ...deps,
    plugin,
    plugin_loader_report: report
  });
}

module.exports = {
  multiAiGovernance,
  defaultMultiAiGovernanceState: (...args) => getMultiAiGovernanceBundle().governance.defaultMultiAiGovernanceState(...args),
  ensureMultiAiGovernanceState: (...args) => getMultiAiGovernanceBundle().governance.ensureMultiAiGovernanceState(...args),
  buildMultiAiGovernanceReport: (...args) => getMultiAiGovernanceBundle().governance.buildMultiAiGovernanceReport(...args),
  getCurrentEvolutionPriority: (...args) => getMultiAiGovernanceBundle().governance.getCurrentEvolutionPriority(...args)
};
