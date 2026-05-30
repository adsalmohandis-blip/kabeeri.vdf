const { appFolderStructure } = require("./src");

module.exports = {
  plugin_id: "app_folder_structure",
  name: "App Folder Structure",
  track: "owner_track",
  command_entrypoint: "plugins/app_folder_structure/bootstrap.js",
  runtime_entrypoint: "plugins/app_folder_structure/bootstrap.js",
  runtime_path: "plugins/app_folder_structure/bootstrap.js",
  appFolderStructure
};
