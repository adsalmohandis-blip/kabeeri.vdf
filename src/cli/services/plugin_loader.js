const fs = require("fs");
const path = require("path");
const { repoRoot, fileExists, readJsonFile, writeJsonFile } = require("../fs_utils");

const PLUGIN_STATE_FILE = ".kabeeri/plugins.json";

function ensurePluginLoaderState() {
  const state = fileExists(PLUGIN_STATE_FILE) ? readJsonFile(PLUGIN_STATE_FILE) : null;
  if (state && typeof state === "object") {
    state.enabled_plugins = Array.isArray(state.enabled_plugins) ? state.enabled_plugins : [];
    state.disabled_plugins = Array.isArray(state.disabled_plugins) ? state.disabled_plugins : [];
    state.updated_at = state.updated_at || null;
    return state;
  }
  return {
    plugin_loader_version: 1,
    enabled_plugins: [],
    disabled_plugins: [],
    updated_at: null
  };
}

function scanPluginManifests() {
  const root = repoRoot();
  const pluginRoot = path.join(root, "plugins");
  if (!fs.existsSync(pluginRoot)) return [];
  const bundles = [];
  for (const entry of fs.readdirSync(pluginRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const bundlePath = path.join(pluginRoot, entry.name);
    const manifestPath = path.join(bundlePath, "plugin.json");
    if (!fs.existsSync(manifestPath)) continue;
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      bundles.push({
        plugin_id: manifest.plugin_id || entry.name,
        name: manifest.name || entry.name,
        plugin_version: manifest.plugin_version || null,
        bundle_type: manifest.bundle_type || "bundle",
        load_strategy: manifest.load_strategy || "manifest_driven",
        removable: manifest.removable !== false,
        track: manifest.track || "shared",
        enabled_by_default: manifest.enabled_by_default !== false,
        command_surface: Array.isArray(manifest.command_surface) ? manifest.command_surface : [],
        docs_surface: Array.isArray(manifest.docs_surface) ? manifest.docs_surface : [],
        bundle_path: path.relative(root, bundlePath).replace(/\\/g, "/"),
        manifest_path: path.relative(root, manifestPath).replace(/\\/g, "/"),
        description: manifest.description || "",
        manifest
      });
    } catch (error) {
      bundles.push({
        plugin_id: entry.name,
        name: entry.name,
        plugin_version: null,
        bundle_type: "bundle",
        load_strategy: "manifest_driven",
        removable: false,
        track: "shared",
        enabled_by_default: false,
        command_surface: [],
        docs_surface: [],
        bundle_path: path.relative(root, bundlePath).replace(/\\/g, "/"),
        manifest_path: path.relative(root, manifestPath).replace(/\\/g, "/"),
        description: `Invalid plugin manifest: ${error.message}`,
        manifest: null,
        invalid_manifest: true
      });
    }
  }
  return bundles.sort((a, b) => a.plugin_id.localeCompare(b.plugin_id));
}

function resolvePluginStates(manifests, state) {
  const enabled = new Set(state.enabled_plugins || []);
  const disabled = new Set(state.disabled_plugins || []);
  return manifests.map((plugin) => {
    const explicitEnabled = enabled.has(plugin.plugin_id);
    const explicitDisabled = disabled.has(plugin.plugin_id);
    const active = explicitDisabled ? false : (explicitEnabled || plugin.enabled_by_default);
    return {
      ...plugin,
      enabled: active,
      status: active ? "enabled" : "disabled"
    };
  });
}

function buildPluginLoaderReport() {
  const state = ensurePluginLoaderState();
  const manifests = scanPluginManifests();
  const plugins = resolvePluginStates(manifests, state);
  const active = plugins.filter((plugin) => plugin.enabled);
  return {
    report_type: "plugin_loader_status",
    generated_at: new Date().toISOString(),
    state_file: PLUGIN_STATE_FILE,
    total_plugins: plugins.length,
    active_plugins: active.length,
    disabled_plugins: plugins.length - active.length,
    plugins
  };
}

function setPluginEnabled(pluginId, enabled) {
  if (!pluginId) throw new Error("Missing plugin id.");
  const state = ensurePluginLoaderState();
  const enabledPlugins = new Set(state.enabled_plugins || []);
  const disabledPlugins = new Set(state.disabled_plugins || []);
  if (enabled) {
    enabledPlugins.add(pluginId);
    disabledPlugins.delete(pluginId);
  } else {
    disabledPlugins.add(pluginId);
    enabledPlugins.delete(pluginId);
  }
  state.enabled_plugins = Array.from(enabledPlugins).sort();
  state.disabled_plugins = Array.from(disabledPlugins).sort();
  state.updated_at = new Date().toISOString();
  writeJsonFile(PLUGIN_STATE_FILE, state);
  return buildPluginLoaderReport();
}

function renderPluginLoaderReport(report, table) {
  const rows = (report.plugins || []).map((plugin) => [
    plugin.plugin_id,
    plugin.status,
    plugin.track,
    plugin.bundle_path
  ]);
  return [
    "Kabeeri Plugin Loader",
    `State file: ${report.state_file}`,
    `Active plugins: ${report.active_plugins}/${report.total_plugins}`,
    "",
    table(["Plugin", "Status", "Track", "Bundle"], rows.length ? rows : [["", "", "No plugins discovered.", ""]])
  ].join("\n");
}

function findPluginById(pluginId) {
  const report = buildPluginLoaderReport();
  const plugin = report.plugins.find((item) => item.plugin_id === pluginId || item.name === pluginId || item.bundle_path === pluginId);
  if (!plugin) throw new Error(`Plugin not found: ${pluginId}`);
  return plugin;
}

module.exports = {
  PLUGIN_STATE_FILE,
  ensurePluginLoaderState,
  scanPluginManifests,
  buildPluginLoaderReport,
  setPluginEnabled,
  renderPluginLoaderReport,
  findPluginById
};
