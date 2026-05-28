const { pluginFolderStructure } = require("./src");

module.exports = {
  plugin_id: "plugin_folder_structure",
  name: "Plugin Folder Structure",
  command_entrypoint: "plugins/plugin_folder_structure/bootstrap.js",
  runtime_entrypoint: "plugins/plugin_folder_structure/bootstrap.js",
  pluginFolderStructure
};
