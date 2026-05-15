const { buildPluginLoaderReport, findPluginById, renderPluginLoaderReport, setPluginEnabled } = require("../services/plugin_loader");

function plugin(action, value, flags = {}, rest = [], deps = {}) {
  const { table = () => "", ensureWorkspace = () => {}, writeJsonFile = () => {}, readJsonFile = () => ({}) } = deps;
  ensureWorkspace();
  const report = buildPluginLoaderReport();
  const normalizedAction = normalizePluginAction(action);

  if (!normalizedAction || ["status", "list"].includes(normalizedAction)) {
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderPluginLoaderReport(report, table));
    return;
  }

  if (normalizedAction === "show") {
    const pluginId = value || flags.id || rest[0];
    if (!pluginId) throw new Error("Missing plugin id.");
    const pluginItem = findPluginById(pluginId);
    if (flags.json) console.log(JSON.stringify(pluginItem, null, 2));
    else console.log(JSON.stringify(pluginItem, null, 2));
    return;
  }

  if (["enable", "disable", "install", "uninstall"].includes(normalizedAction)) {
    const pluginId = value || flags.id || rest[0];
    if (!pluginId) throw new Error("Missing plugin id.");
    const enabled = normalizedAction === "enable" || normalizedAction === "install";
    const updated = setPluginEnabled(pluginId, enabled);
    if (flags.json) console.log(JSON.stringify(updated, null, 2));
    else {
      const verb = enabled ? (normalizedAction === "install" ? "Installed" : "Enabled") : (normalizedAction === "uninstall" ? "Uninstalled" : "Disabled");
      console.log(`${verb} plugin: ${pluginId}`);
    }
    return;
  }

  if (normalizedAction === "reload") {
    const refreshed = buildPluginLoaderReport();
    if (flags.json) console.log(JSON.stringify(refreshed, null, 2));
    else console.log(renderPluginLoaderReport(refreshed, table));
    return;
  }

  throw new Error(`Unknown plugin action: ${action}`);
}

function normalizePluginAction(action) {
  const value = String(action || "").trim().toLowerCase();
  if (value === "add") return "install";
  if (value === "remove") return "uninstall";
  return value;
}

module.exports = {
  plugin
};
