const { appCategoryRegistry, appCategoryRegistryCommand, registerAppCategoryRegistry } = require("./src");

module.exports = {
  plugin_id: "app_category_registry",
  name: "App Category Registry",
  track: "owner_track",
  command_entrypoint: "plugins/app_category_registry/bootstrap.js",
  runtime_entrypoint: "plugins/app_category_registry/bootstrap.js",
  runtime_path: "plugins/app_category_registry/bootstrap.js",
  appCategoryRegistry,
  appCategoryRegistryCommand,
  registerAppCategoryRegistry
};
