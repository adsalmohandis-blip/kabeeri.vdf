function registerPluginFolderStructure() {
  return {
    command: "plugin-folder",
    actions: ["status", "create", "validate", "readiness", "git-library", "integration", "request-owner-review", "request-marketplace-upload", "init-source"]
  };
}

module.exports = {
  registerPluginFolderStructure
};
