const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../fs_utils");

function normalizeList(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function buildPluginBundleContract(plugin, options = {}) {
  if (!plugin || typeof plugin !== "object") {
    return {
      ready: false,
      status: "missing_plugin_record",
      missing_required_folders: [],
      present_required_folders: [],
      required_folders: [],
      optional_folders: [],
      domain_folders: [],
      command_surface: [],
      docs_surface: [],
      next_exact_action: options.fallback_action || "Run `kvdf plugins status` to inspect the bundle contract."
    };
  }

  const root = options.root || repoRoot();
  const bundlePath = path.join(root, plugin.bundle_path || `plugins/${plugin.plugin_id}`);
  const requiredFolders = normalizeList(plugin.required_folders);
  const optionalFolders = normalizeList(plugin.optional_folders);
  const domainFolders = normalizeList(plugin.domain_folders);
  const commandSurface = normalizeList(plugin.command_surface);
  const docsSurface = normalizeList(plugin.docs_surface);
  const presentRequiredFolders = requiredFolders.filter((folder) => fs.existsSync(path.join(bundlePath, folder)));
  const missingRequiredFolders = requiredFolders.filter((folder) => !fs.existsSync(path.join(bundlePath, folder)));

  const ready = missingRequiredFolders.length === 0;
  return {
    plugin_id: plugin.plugin_id || plugin.name || null,
    name: plugin.name || plugin.plugin_id || null,
    bundle_path: plugin.bundle_path || null,
    plugin_family: plugin.plugin_family || null,
    plugin_type: plugin.plugin_type || null,
    bundle_type: plugin.bundle_type || null,
    track: plugin.track || null,
    state_file: plugin.state_file || null,
    enabled: Boolean(plugin.enabled),
    status: ready ? "ready" : "missing_required_folders",
    ready,
    required_folders: requiredFolders,
    optional_folders: optionalFolders,
    domain_folders: domainFolders,
    command_surface: commandSurface,
    docs_surface: docsSurface,
    present_required_folders: presentRequiredFolders,
    missing_required_folders: missingRequiredFolders,
    next_exact_action: ready
      ? (options.ready_action || "Use the bundle command surface.")
      : `Restore missing bundle folders: ${missingRequiredFolders.join(", ")}`
  };
}

module.exports = {
  buildPluginBundleContract,
  normalizeList
};
