const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../../../../src/cli/fs_utils");
const { resolveTrack } = require("../core/track_resolver");
const { pluginFolderError } = require("../core/errors");
const { readJson } = require("../utils/json_safe");

function getOwnerLifecycle(slug) {
  const root = path.join(repoRoot(), "plugins", slug);
  const manifest = readJson(path.join(root, "plugin_manifest.json"), null);
  if (!fs.existsSync(root)) return "missing";
  if (manifest && manifest.status === "owner_direct_development") return "owner_direct_development";
  return "active";
}

function getPluginDevLifecycle(slug) {
  const root = path.join(repoRoot(), "workspaces", "plugins", slug);
  const releaseDir = path.join(root, "12_plugin_package_release");
  const reviewDir = path.join(root, "11_plugin_reviews_approvals");
  const legacyReleaseDir = path.join(root, "05_release");
  if (!fs.existsSync(root)) return "missing";
  if (fs.existsSync(path.join(releaseDir, "marketplace_upload_request.json")) || fs.existsSync(path.join(legacyReleaseDir, "marketplace_upload_request.json"))) return "marketplace_upload_requested";
  if (fs.existsSync(path.join(releaseDir, "direct_install_request.json")) || fs.existsSync(path.join(legacyReleaseDir, "direct_install_request.json"))) return "direct_install_requested";
  if (fs.existsSync(path.join(reviewDir, "owner_approval_request.json")) || fs.existsSync(path.join(legacyReleaseDir, "owner_approval_request.json"))) return "owner_review_requested";
  if (fs.existsSync(path.join(root, "04_plugin_package"))) return "package_ready";
  return "draft";
}

function buildLifecycleReport(context = {}) {
  const track = resolveTrack(context);
  const slug = context.plugin_slug || context.value || context.rest[0];
  if (!slug) throw pluginFolderError("Missing plugin slug.");
  if (track === "viber") throw pluginFolderError("Viber/App Track cannot create plugins directly. Switch to Plugin Development Track.");
  const lifecycle = track === "owner" ? getOwnerLifecycle(slug) : getPluginDevLifecycle(slug);
  return {
    report_type: "plugin_folder_structure_lifecycle",
    plugin_slug: slug,
    track,
    lifecycle,
    generated_at: new Date().toISOString()
  };
}

function runLifecycleCommand(context) {
  const report = buildLifecycleReport(context);
  if (context.flags && context.flags.json) console.log(JSON.stringify(report, null, 2));
  else console.log(`${report.plugin_slug}: ${report.lifecycle}`);
  return report;
}

module.exports = {
  buildLifecycleReport,
  runLifecycleCommand
};

