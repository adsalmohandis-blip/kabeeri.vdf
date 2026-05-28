const OWNER_ROOT = "plugins";
const WORKSPACE_ROOT = "workspaces/plugins";
const SHARED_SHELL_FOLDERS = ["docs", "prompts", "runtime", "dashboard", "viber_blocking", "src", "schemas", "tests"];
const WORKSPACE_GOVERNANCE_FOLDERS = [
  "inputs",
  "identity",
  "roadmaps_plans",
  "specifications",
  "version_control",
  "evolutions",
  "task_punches",
  "agents",
  "source",
  "tests_quality",
  "evidence_audit",
  "reviews_approvals",
  "package_release",
  "documentation",
  "archive"
];

const STATUS_MESSAGE = {
  owner: "Owner Track plugin target: ./plugins/<plugin-slug>/",
  plugin_dev: "Plugin Development Track plugin target: ./workspaces/plugins/<plugin-slug>/",
  viber: "Viber/App Track plugin creation: blocked; switch to Plugin Development Track required"
};

module.exports = {
  OWNER_ROOT,
  WORKSPACE_ROOT,
  SHARED_SHELL_FOLDERS,
  WORKSPACE_GOVERNANCE_FOLDERS,
  STATUS_MESSAGE
};
