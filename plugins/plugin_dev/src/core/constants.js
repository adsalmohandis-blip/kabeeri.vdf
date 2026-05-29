const PLUGIN_ID = "plugin_dev";
const PLUGIN_NAME = "Plugin Dev Orchestrator";
const PLUGIN_VERSION = "1.0.0";
const LIMITED_COMMANDS = ["status", "doctor", "help"];
const COMMAND_GROUPS = [
  "status",
  "doctor",
  "workspace",
  "intake",
  "libraries",
  "spec",
  "tasks",
  "build",
  "validate",
  "integrations",
  "test",
  "evidence",
  "readiness",
  "package",
  "promotion",
  "dashboard",
  "summary"
];
const WORKSPACE_ROOTS = {
  owner: "plugins",
  plugin_dev: "workspaces/plugins"
};
const ARTIFACT_ROOT_NAME = "docs/plugin_dev";
const PLUGIN_FOLDER_STRUCTURE_TARGET_MESSAGES = {
  owner: "Owner Track plugin target: ./plugins/<plugin-slug>/",
  plugin_dev: "Plugin Development Track plugin target: ./workspaces/plugins/<plugin-slug>/",
  viber: "Viber/App Track plugin creation: blocked; switch to Plugin Development Track required"
};

module.exports = {
  PLUGIN_ID,
  PLUGIN_NAME,
  PLUGIN_VERSION,
  LIMITED_COMMANDS,
  COMMAND_GROUPS,
  WORKSPACE_ROOTS,
  ARTIFACT_ROOT_NAME,
  PLUGIN_FOLDER_STRUCTURE_TARGET_MESSAGES
};
