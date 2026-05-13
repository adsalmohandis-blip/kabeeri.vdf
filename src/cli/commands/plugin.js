const { buildPluginLoaderReport, findPluginById, renderPluginLoaderReport, setPluginEnabled } = require("../services/plugin_loader");

function plugin(action, value, flags = {}, rest = [], deps = {}) {
  const { table = () => "", ensureWorkspace = () => {}, writeJsonFile = () => {}, readJsonFile = () => ({}) } = deps;
  ensureWorkspace();
  const report = buildPluginLoaderReport();

  if (!action || ["status", "list"].includes(action)) {
    if (flags.json) console.log(JSON.stringify(report, null, 2));
    else console.log(renderPluginLoaderReport(report, table));
    return;
  }

  if (action === "show") {
    const pluginId = value || flags.id || rest[0];
    if (!pluginId) throw new Error("Missing plugin id.");
    const pluginItem = findPluginById(pluginId);
    if (flags.json) console.log(JSON.stringify(pluginItem, null, 2));
    else console.log(JSON.stringify(pluginItem, null, 2));
    return;
  }

  if (action === "enable" || action === "disable") {
    const pluginId = value || flags.id || rest[0];
    if (!pluginId) throw new Error("Missing plugin id.");
    const updated = setPluginEnabled(pluginId, action === "enable");
    if (flags.json) console.log(JSON.stringify(updated, null, 2));
    else console.log(`${action === "enable" ? "Enabled" : "Disabled"} plugin: ${pluginId}`);
    return;
  }

  if (action === "reload") {
    const refreshed = buildPluginLoaderReport();
    if (flags.json) console.log(JSON.stringify(refreshed, null, 2));
    else console.log(renderPluginLoaderReport(refreshed, table));
    return;
  }

  throw new Error(`Unknown plugin action: ${action}`);
}

module.exports = {
  plugin
};
