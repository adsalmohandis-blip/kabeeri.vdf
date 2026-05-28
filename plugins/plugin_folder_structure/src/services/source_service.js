const path = require("path");
const { repoRoot } = require("../../../../src/cli/fs_utils");
const { resolveTrack } = require("../core/track_resolver");
const { pluginFolderError } = require("../core/errors");
const { ensureDir, writeFileIfMissing } = require("../utils/fs_safe");

function initSource(context) {
  const track = resolveTrack(context);
  if (track !== "plugin_dev") throw pluginFolderError("Source root initialization is only available for Plugin Development Track workspaces.");
  const slug = context.value || context.rest[0];
  if (!slug) throw pluginFolderError("Missing plugin slug.");
  const root = path.join(repoRoot(), "workspaces", "plugins", slug, "source", slug);
  ensureDir(path.join(root, "src", "commands"));
  ensureDir(path.join(root, "src", "core"));
  ensureDir(path.join(root, "src", "services"));
  ensureDir(path.join(root, "src", "utils"));
  ensureDir(path.join(root, "src", "adapters"));
  ensureDir(path.join(root, "src", "policies"));
  ensureDir(path.join(root, "docs"));
  ensureDir(path.join(root, "tests"));
  ensureDir(path.join(root, "schemas"));
  ensureDir(path.join(root, "prompts"));
  ensureDir(path.join(root, "dashboard"));
  writeFileIfMissing(path.join(root, "plugin.json"), JSON.stringify({
    plugin_slug: slug,
    track: "plugin_development_track",
    status: "candidate_source",
    installed: false,
    marketplace_published: false,
    owner_approval_required_for_promotion: true
  }, null, 2) + "\n");
  writeFileIfMissing(path.join(root, "bootstrap.js"), `const candidateSource = require("./src");\n\nmodule.exports = {\n  plugin_slug: "${slug}",\n  status: "candidate_source",\n  candidateSource\n};\n`);
  writeFileIfMissing(path.join(root, "README.md"), `# ${slug} candidate source\n`);
  writeFileIfMissing(path.join(root, "src", "index.js"), `const status = require("./commands/status");\nconst create = require("./commands/create");\nconst register = require("./commands/register");\n\nmodule.exports = {\n  status,\n  create,\n  register\n};\n`);
  writeFileIfMissing(path.join(root, "src", "commands", "status.js"), `module.exports = {};\n`);
  writeFileIfMissing(path.join(root, "src", "commands", "create.js"), `module.exports = {};\n`);
  writeFileIfMissing(path.join(root, "src", "commands", "register.js"), `module.exports = {};\n`);
  writeFileIfMissing(path.join(root, "src", "core", "constants.js"), `module.exports = {};\n`);
  writeFileIfMissing(path.join(root, "src", "core", "errors.js"), `module.exports = {};\n`);
  writeFileIfMissing(path.join(root, "src", "core", "track_resolver.js"), `module.exports = {};\n`);
  writeFileIfMissing(path.join(root, "src", "core", "plugin_context.js"), `module.exports = {};\n`);
  writeFileIfMissing(path.join(root, "src", "services", "status_service.js"), `module.exports = {};\n`);
  writeFileIfMissing(path.join(root, "src", "services", "target_path_service.js"), `module.exports = {};\n`);
  writeFileIfMissing(path.join(root, "src", "services", "validation_service.js"), `module.exports = {};\n`);
  writeFileIfMissing(path.join(root, "src", "services", "git_library_service.js"), `module.exports = {};\n`);
  writeFileIfMissing(path.join(root, "src", "services", "integration_service.js"), `module.exports = {};\n`);
  writeFileIfMissing(path.join(root, "src", "services", "review_request_service.js"), `module.exports = {};\n`);
  writeFileIfMissing(path.join(root, "src", "services", "source_service.js"), `module.exports = {};\n`);
  writeFileIfMissing(path.join(root, "src", "utils", "slugify.js"), `module.exports = {};\n`);
  writeFileIfMissing(path.join(root, "src", "utils", "json_safe.js"), `module.exports = {};\n`);
  writeFileIfMissing(path.join(root, "src", "utils", "fs_safe.js"), `module.exports = {};\n`);
  writeFileIfMissing(path.join(root, "src", "adapters", "index.js"), `module.exports = {};\n`);
  writeFileIfMissing(path.join(root, "src", "policies", "index.js"), `module.exports = {};\n`);
  writeFileIfMissing(path.join(root, "docs", "README.md"), "# Docs\n");
  writeFileIfMissing(path.join(root, "tests", "README.md"), "# Tests\n");
  writeFileIfMissing(path.join(root, "schemas", "README.md"), "# Schemas\n");
  writeFileIfMissing(path.join(root, "prompts", "README.md"), "# Prompts\n");
  writeFileIfMissing(path.join(root, "dashboard", "README.md"), "# Dashboard\n");
  return { report_type: "plugin_folder_structure_source_init", status: "created", slug, root };
}

function runSourceCommand(context) {
  const report = initSource(context);
  if (context.flags && context.flags.json) console.log(JSON.stringify(report, null, 2));
  else console.log(report.report_type);
  return report;
}

module.exports = {
  initSource,
  runSourceCommand
};
