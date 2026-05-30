function register() {
  return {
    command: "app-category",
    plugin: "app_category_registry",
    actions: ["status", "profile", "plan", "validate", "create"]
  };
}

module.exports = { register };
