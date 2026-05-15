const { buildPluginLoaderReport } = require("../cli/services/plugin_loader");
const { buildRuntimeSplit } = require("../tracks");

function buildBootContext() {
  const pluginLoader = buildPluginLoaderReport();
  const runtimeSplit = buildRuntimeSplit(pluginLoader);
  return {
    report_type: "kvdf_bootstrap_context",
    generated_at: new Date().toISOString(),
    boot_path: [
      "bin/kvdf.js",
      "src/core/bootstrap.js",
      "src/cli/index.js"
    ],
    single_boot_entry: "bin/kvdf.js",
    loader_strategy: runtimeSplit.loader_strategy,
    runtime_split: runtimeSplit,
    shared_runtime: {
      status: "ready",
      entry_module: "src/cli/index.js",
      reversible_plugin_support: runtimeSplit.reversible_plugin_support
    },
    plugin_loader: pluginLoader,
    reversible_plugins: runtimeSplit.reversible_plugins,
    shared_plugins: runtimeSplit.shared_plugins,
    summary: {
      total_plugins: pluginLoader.total_plugins || 0,
      active_plugins: pluginLoader.active_plugins || 0,
      disabled_plugins: pluginLoader.disabled_plugins || 0,
      reversible_plugins: runtimeSplit.reversible_plugins.length
    }
  };
}

function createCliRunner() {
  const { run } = require("../cli");
  const bootContext = buildBootContext();
  return {
    bootContext,
    run
  };
}

module.exports = {
  buildBootContext,
  createCliRunner
};
