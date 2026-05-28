const { resolveTrack } = require("./track_resolver");
const { slugify } = require("../utils/slugify");
const { repoRoot } = require("../../../../src/cli/fs_utils");

function buildPluginContext({ action, value, flags = {}, rest = [], deps = {} } = {}) {
  const slug = slugify(flags.slug || value || rest[0] || "");
  return {
    action,
    value,
    flags,
    rest,
    deps,
    repoRoot: deps.repoRoot || repoRoot,
    plugin_slug: slug,
    track: resolveTrack({ flags }),
    base_path: deps.base_path || repoRoot()
  };
}

module.exports = {
  buildPluginContext
};
