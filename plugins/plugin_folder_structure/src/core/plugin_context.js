const { resolveTrack } = require("./track_resolver");
const { slugify, workspaceSlugify } = require("../utils/slugify");
const { repoRoot } = require("../../../../src/cli/fs_utils");

function buildPluginContext({ action, value, flags = {}, rest = [], deps = {} } = {}) {
  const track = resolveTrack({ flags });
  const rawSlug = flags.slug || value || rest[0] || "";
  const slug = track === "plugin_dev" || track === "viber" ? workspaceSlugify(rawSlug) : slugify(rawSlug);
  return {
    action,
    value,
    flags,
    rest,
    deps,
    repoRoot: deps.repoRoot || repoRoot,
    plugin_slug: slug,
    track,
    base_path: deps.base_path || repoRoot()
  };
}

module.exports = {
  buildPluginContext
};
