const path = require("path");
const { repoRoot } = require("../../../../src/cli/fs_utils");
const { resolveTrack } = require("../core/track_resolver");
const { pluginFolderError } = require("../core/errors");
const { ensureDir, writeFileIfMissing } = require("../utils/fs_safe");

function initSource(context) {
  const track = resolveTrack(context);
  if (track !== "plugin_dev") throw pluginFolderError("Source root initialization is only available for Plugin Development Track workspaces.");
  const slug = context.plugin_slug || context.value || context.rest[0];
  if (!slug) throw pluginFolderError("Missing plugin slug.");
  const workspaceRoot = path.join(repoRoot(), "workspaces", "plugins", slug);
  const archiveRoot = path.join(workspaceRoot, "99_plugin_archive");
  ensureDir(archiveRoot);
  writeFileIfMissing(path.join(archiveRoot, "source_tracking_deprecated.md"), `# ${slug} Source Tracking\n\nThe redundant source-pointer folder has been removed. The canonical package now lives in ../04_plugin_package/.\n`);
  writeFileIfMissing(path.join(archiveRoot, "package_folder_renumbering.md"), `# Package Folder Renumbering\n\n- canonical package folder: 04_plugin_package\n- previous package folder: 03_plugin_package\n- redundant source folder removed: true\n`);
  return { report_type: "plugin_folder_structure_source_init", status: "deprecated", slug, root: archiveRoot };
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

