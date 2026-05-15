function buildRuntimeSplit(pluginLoader = {}) {
  const plugins = Array.isArray(pluginLoader.plugins) ? pluginLoader.plugins : [];
  const pluginIds = plugins.map((plugin) => plugin.plugin_id).filter(Boolean);
  const reversiblePlugins = plugins.filter((plugin) => plugin.removable !== false).map((plugin) => plugin.plugin_id);
  const sharedPlugins = plugins
    .filter((plugin) => String(plugin.track || "").toLowerCase() !== "app")
    .map((plugin) => plugin.plugin_id);
  const appPlugins = plugins
    .filter((plugin) => String(plugin.track || "").toLowerCase() === "app")
    .map((plugin) => plugin.plugin_id);

  return {
    boot_entry: "bin/kvdf.js",
    shared_runtime_entry: "src/cli/index.js",
    track_boundaries: {
      control_plane: "bin/kvdf.js",
      shared_runtime: "src/cli/index.js",
      plugin_runtime_root: "plugins/kvdf-dev/",
      plugin_loader_state: ".kabeeri/plugins.json"
    },
    loader_strategy: "manifest_driven_reversible_plugins",
    reversible_plugin_support: true,
    plugin_ids: pluginIds,
    reversible_plugins: reversiblePlugins,
    shared_plugins: sharedPlugins,
    app_plugins: appPlugins,
    summary: {
      total_plugins: plugins.length,
      shared_plugins: sharedPlugins.length,
      app_plugins: appPlugins.length,
      reversible_plugins: reversiblePlugins.length
    }
  };
}

module.exports = {
  buildRuntimeSplit
};
