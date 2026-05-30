const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { repoRoot } = require("../../../../src/cli/fs_utils");
const { resolveTrack } = require("../core/track_resolver");
const { pluginFolderError } = require("../core/errors");
const { ensureDir, writeFileIfMissing } = require("../utils/fs_safe");
const { readJson, writeJson } = require("../utils/json_safe");

function walkFiles(root) {
  const entries = [];
  if (!fs.existsSync(root)) return entries;
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else entries.push(full);
    }
  }
  return entries;
}

function buildChecksums(root) {
  const files = walkFiles(root);
  const checksums = {};
  for (const file of files) {
    const data = fs.readFileSync(file);
    checksums[path.relative(root, file).replace(/\\/g, "/")] = crypto.createHash("sha256").update(data).digest("hex");
  }
  return checksums;
}

function runArchiveCommand(context) {
  const track = resolveTrack(context);
  if (track !== "plugin_dev") throw pluginFolderError("Archive evidence is only available for Plugin Development Track workspaces.");
  const slug = context.plugin_slug || context.value || context.rest[0];
  if (!slug) throw pluginFolderError("Missing plugin slug.");
  const root = path.join(repoRoot(), "workspaces", "plugins", slug);
  const releaseDir = path.join(root, "12_plugin_package_release");
  const privateBundle = path.join(releaseDir, "private_evidence_bundle");
  const archiveBundle = path.join(root, "99_plugin_archive", "evidence_bundle");
  ensureDir(releaseDir);
  ensureDir(privateBundle);
  ensureDir(archiveBundle);
  const checksumRoot = path.join(root, "10_plugin_evidence_audit");
  const checksums = buildChecksums(checksumRoot);
  const checksumsPath = path.join(releaseDir, "checksums.json");
  writeJson(checksumsPath, { algorithm: "sha256", files: checksums });
  const manifest = {
    plugin_slug: slug,
    workspace_path: `./workspaces/plugins/${slug}/`,
    package_root: `./workspaces/plugins/${slug}/04_plugin_package/`,
    generated_at: new Date().toISOString(),
    archive_status: "created",
    archive_locations: [
      `./workspaces/plugins/${slug}/12_plugin_package_release/private_evidence_bundle/`,
      `./workspaces/plugins/${slug}/12_plugin_package_release/checksums.json`
    ],
    checksum_algorithm: "sha256",
    files_included: Object.keys(checksums),
    files_excluded: [],
    notes: "Private evidence archive created by plugin_folder_structure."
  };
  writeJson(path.join(releaseDir, "promotion_archive_manifest.json"), manifest);
  writeFileIfMissing(path.join(privateBundle, "README.md"), "# Private evidence bundle\n");
  writeFileIfMissing(path.join(archiveBundle, "README.md"), "# Evidence bundle\n");
  const report = { report_type: "plugin_folder_structure_archive_evidence", status: "created", slug, root };
  if (!context.flags || context.flags.json !== false) console.log(JSON.stringify(report, null, 2));
  else console.log(report.report_type);
  return report;
}

module.exports = {
  runArchiveCommand
};

