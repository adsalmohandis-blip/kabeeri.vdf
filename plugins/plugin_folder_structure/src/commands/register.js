function registerPluginFolderStructure() {
  return {
    command: "plugin-folder",
    actions: [
      "status",
      "create",
      "upgrade-full-set",
      "validate",
      "readiness",
      "fix-numbering",
      "git-library",
      "integration",
      "request-owner-review",
      "request-direct-install",
      "request-marketplace-upload",
      "archive-evidence",
      "lifecycle",
      "audit",
      "init-source"
    ]
  };
}

module.exports = {
  registerPluginFolderStructure
};
