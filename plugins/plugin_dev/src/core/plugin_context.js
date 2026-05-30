const path = require("path");
const { repoRoot } = require("../../../../src/cli/fs_utils");
const { resolveTrack } = require("./track_resolver");
const { workspaceSlugify } = require("../utils/slugify");

function buildPluginDevContext({ action, value, flags = {}, rest = [], deps = {} } = {}) {
  const normalizedAction = String(action || "").trim().toLowerCase();
  const plugin_slug = workspaceSlugify(
    flags.slug ||
    rest[0] ||
    (["status", "doctor"].includes(normalizedAction) ? value : "")
  );
  const track = resolveTrack({ flags });
  const root = repoRoot();
  const pluginRoot = track === "owner"
    ? path.join(root, "plugins", plugin_slug)
    : path.join(root, "workspaces", "plugins", plugin_slug);
  return {
    action,
    value,
    flags,
    rest,
    deps,
    repoRoot,
    plugin_slug,
    track,
    plugin_root: pluginRoot,
    artifact_root: path.join(pluginRoot, "docs", "plugin_dev"),
    limited_mode: Boolean(deps.limited_mode)
  };
}

module.exports = {
  buildPluginDevContext
};
