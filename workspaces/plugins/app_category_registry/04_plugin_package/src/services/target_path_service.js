const path = require("path");
const { slugify } = require("../utils/slugify");

function getWorkspaceTargetPlan(pluginSlug) {
  const slug = slugify(pluginSlug);
  return {
    plugin_slug: slug,
    workspace_root: path.join("workspaces", "plugins", slug),
    package_root: path.join("workspaces", "plugins", slug, "04_plugin_package"),
    canonical_package_folder: "04_plugin_package",
    previous_package_folder: "03_plugin_package",
    removed_redundant_source_folder: true,
    direct_install_target: path.join("plugins", slug),
    marketplace_target: path.join("marketplace", "plugins", slug)
  };
}

module.exports = { getWorkspaceTargetPlan };

