const { pluginDev } = require("./src");

module.exports = {
  plugin_id: "plugin_dev",
  name: "Plugin Dev Orchestrator",
  command_entrypoint: "plugins/plugin_dev/bootstrap.js",
  runtime_entrypoint: "plugins/plugin_dev/bootstrap.js",
  pluginDev
};
