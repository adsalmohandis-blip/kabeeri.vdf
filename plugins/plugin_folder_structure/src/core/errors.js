class PluginFolderError extends Error {
  constructor(message, code = "PLUGIN_FOLDER_ERROR") {
    super(message);
    this.name = "PluginFolderError";
    this.code = code;
  }
}

function pluginFolderError(message, code) {
  return new PluginFolderError(message, code);
}

module.exports = {
  PluginFolderError,
  pluginFolderError
};
