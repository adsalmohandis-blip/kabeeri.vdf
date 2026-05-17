module.exports = {
  plugin_id: "github_sync",
  name: "GitHub Sync Rules Bundle",
  command_entrypoint: "plugins/github_sync/bootstrap.js",
  runtime_entrypoint: null,
  bundle_kind: "reference_bundle",
  docs: [
    "plugins/github_sync/README.md",
    "plugins/github_sync/GITHUB_SYNC_RULES.md",
    "plugins/github_sync/GITHUB_ISSUE_MAPPING.md"
  ]
};
