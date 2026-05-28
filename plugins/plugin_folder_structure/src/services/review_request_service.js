const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../../../../src/cli/fs_utils");
const { resolveTrack } = require("../core/track_resolver");
const { pluginFolderError } = require("../core/errors");
const { ensureDir, writeFileIfMissing } = require("../utils/fs_safe");
const { readJson, writeJson } = require("../utils/json_safe");

function workspaceRoot(slug) {
  return path.join(repoRoot(), "workspaces", "plugins", slug);
}

function requestOwnerReview(context) {
  const track = resolveTrack(context);
  if (track !== "plugin_dev") throw pluginFolderError("Only Plugin Development Track workspaces can request owner review.");
  const slug = context.value || context.rest[0];
  if (!slug) throw pluginFolderError("Missing plugin slug.");
  const root = workspaceRoot(slug);
  const approvalDir = path.join(root, "reviews_approvals");
  const evidenceDir = path.join(root, "evidence_audit", "owner_approval_evidence");
  const releaseDir = path.join(root, "package_release");
  ensureDir(approvalDir);
  ensureDir(evidenceDir);
  ensureDir(releaseDir);
  const request = {
    plugin_slug: slug,
    workspace_path: `./workspaces/plugins/${slug}/`,
    candidate_plugin_root: `./workspaces/plugins/${slug}/source/${slug}/`,
    requested_by_track: "plugin_development_track",
    requested_action_options: ["direct_install", "marketplace_upload", "reject_changes_required"],
    readiness_status: "pending",
    test_summary: "pending",
    evidence_summary: "pending",
    integration_summary: "pending",
    git_library_summary: "pending",
    requested_at: new Date().toISOString(),
    status: "pending_owner_review"
  };
  writeJson(path.join(approvalDir, "owner_approval_request.json"), request);
  writeJson(path.join(releaseDir, "promotion_manifest.json"), { ...request, status: "promotion_requested" });
  writeFileIfMissing(path.join(evidenceDir, "request_evidence.md"), "# Owner approval request evidence\n");
  return { report_type: "plugin_folder_structure_owner_review_request", status: request.status, slug, root };
}

function requestMarketplaceUpload(context) {
  const track = resolveTrack(context);
  if (track !== "plugin_dev") throw pluginFolderError("Only Plugin Development Track workspaces can request marketplace upload.");
  const slug = context.value || context.rest[0];
  if (!slug) throw pluginFolderError("Missing plugin slug.");
  const root = workspaceRoot(slug);
  const releaseDir = path.join(root, "package_release");
  const evidenceDir = path.join(root, "evidence_audit", "marketplace_request_evidence");
  ensureDir(releaseDir);
  ensureDir(evidenceDir);
  const request = {
    plugin_slug: slug,
    source_workspace: `./workspaces/plugins/${slug}/`,
    candidate_plugin_root: `./workspaces/plugins/${slug}/source/${slug}/`,
    requested_destination: `./marketplace/plugins/${slug}/`,
    requested_by_track: "plugin_development_track",
    owner_approval_required: true,
    marketplace_track_required: true,
    marketplace_available: false,
    status: "marketplace_pending_not_available",
    validation_status: "pending",
    readiness_status: "pending",
    integration_status: "pending",
    security_status: "pending",
    test_status: "pending",
    requested_at: new Date().toISOString()
  };
  writeJson(path.join(releaseDir, "marketplace_upload_request.json"), request);
  writeFileIfMissing(path.join(evidenceDir, "marketplace_upload_request_evidence.md"), "# Marketplace upload request evidence\n");
  return { report_type: "plugin_folder_structure_marketplace_request", status: request.status, slug, root };
}

function runReviewRequestCommand(context) {
  const action = String(context.action || "").toLowerCase();
  if (action === "request-owner-review") return printResult(requestOwnerReview(context), context);
  if (action === "request-marketplace-upload") return printResult(requestMarketplaceUpload(context), context);
  throw pluginFolderError(`Unknown review request action: ${action}`);
}

function printResult(report, context) {
  if (context.flags && context.flags.json) console.log(JSON.stringify(report, null, 2));
  else console.log(report.report_type);
  return report;
}

module.exports = {
  requestOwnerReview,
  requestMarketplaceUpload,
  runReviewRequestCommand
};
