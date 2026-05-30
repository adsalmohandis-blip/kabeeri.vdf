const { appCategoryRegistry, appCategoryRegistryCommand, registerAppCategoryRegistry } = require("./src");

module.exports = {
  plugin_id: "app_category_registry",
  name: "App Category Registry",
  command_entrypoint: "workspaces/plugins/app_category_registry/04_plugin_package/bootstrap.js",
  runtime_entrypoint: "workspaces/plugins/app_category_registry/04_plugin_package/bootstrap.js",
  appCategoryRegistry,
  appCategoryRegistryCommand,
  registerAppCategoryRegistry
};
