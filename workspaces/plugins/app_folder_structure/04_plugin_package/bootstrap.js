const { appFolderStructure } = require("./src");

module.exports = {
  plugin_id: "app_folder_structure",
  name: "App Folder Structure",
  command_entrypoint: "bootstrap.js",
  runtime_entrypoint: "bootstrap.js",
  appFolderStructure
};
