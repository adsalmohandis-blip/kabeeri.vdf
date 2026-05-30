function registerAppFolderStructure() {
  return {
    command: "app-folder",
    actions: ["status", "create", "validate", "repair", "manifest", "print", "readiness"]
  };
}

module.exports = { registerAppFolderStructure };
