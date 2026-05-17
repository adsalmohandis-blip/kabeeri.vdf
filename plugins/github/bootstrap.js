const command = require("./commands/github");

module.exports = {
  plugin_id: "github",
  name: "GitHub Integration Bundle",
  command_entrypoint: "plugins/github/bootstrap.js",
  runtime_entrypoint: null,
  bundle_kind: "reference_bundle",
  docs: [
    "plugins/github/README.md",
    "plugins/github/import_instructions.md",
    "plugins/github/issues_backlog.md",
    "plugins/github/labels.json",
    "plugins/github/milestones.md"
  ],
  github: command.github,
  command
};
