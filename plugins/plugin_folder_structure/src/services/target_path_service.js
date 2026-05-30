const fs = require("fs");
const path = require("path");
const { repoRoot, assertSafeName } = require("../../../../src/cli/fs_utils");
const { ensureDir, writeFileIfMissing } = require("../utils/fs_safe");
const { resolveTrack } = require("../core/track_resolver");
const { pluginFolderError } = require("../core/errors");
const { slugify, workspaceSlugify, isSafeSlug, isSafeWorkspaceSlug } = require("../utils/slugify");
const {
  OWNER_PACKAGE_ROOT,
  WORKSPACE_ROOT,
  WORKSPACE_PACKAGE_SEGMENT,
  buildStandardPackagePlan,
  buildWorkspacePlan,
  comparePackageStructure
} = require("../core/standard_plugin_structure");

function buildOwnerStructurePlan(slug) {
  const normalized = slugify(slug);
  const root = path.join(repoRoot(), OWNER_PACKAGE_ROOT, normalized);
  return buildStandardPackagePlan(root, normalized, { packageType: "owner" });
}

function buildWorkspaceStructurePlan(slug) {
  const normalized = workspaceSlugify(slug);
  const plan = buildWorkspacePlan(normalized, { workspaceRoot: path.join(repoRoot(), WORKSPACE_ROOT, normalized) });
  return plan;
}

function resolveTargetWorkspaceRoot(slug, track) {
  const normalizedTrack = resolveTrack({ flags: { track } });
  if (normalizedTrack === "viber") {
    throw pluginFolderError("Viber/App Track cannot create plugins directly. Switch to Plugin Development Track.");
  }
  if (normalizedTrack === "owner") {
    const normalizedSlug = slugify(slug);
    if (!isSafeSlug(normalizedSlug)) throw pluginFolderError(`Invalid plugin slug: ${normalizedSlug || "(empty)"}`);
    return path.join(repoRoot(), OWNER_PACKAGE_ROOT, normalizedSlug);
  }
  const normalizedSlug = workspaceSlugify(slug);
  if (!isSafeWorkspaceSlug(normalizedSlug)) throw pluginFolderError(`Invalid plugin workspace slug: ${normalizedSlug || "(empty)"}`);
  return path.join(repoRoot(), WORKSPACE_ROOT, normalizedSlug);
}

function createTargetStructure(context, deps = {}) {
  const track = resolveTrack(context);
  const rawSlug = context.plugin_slug || context.value || context.rest[0] || context.flags.slug || "";
  const slug = track === "owner" ? slugify(rawSlug) : workspaceSlugify(rawSlug);
  if (track === "owner" && !isSafeSlug(slug)) throw pluginFolderError(`Invalid plugin slug: ${slug || "(empty)"}`);
  if (track !== "owner" && !isSafeWorkspaceSlug(slug)) throw pluginFolderError(`Invalid plugin workspace slug: ${slug || "(empty)"}`);
  if (track === "viber") {
    throw pluginFolderError("Viber/App Track cannot create plugins directly. Switch to Plugin Development Track.");
  }

  const plan = track === "owner" ? buildOwnerStructurePlan(slug) : buildWorkspaceStructurePlan(slug);
  const exists = fs.existsSync(plan.root);

  for (const dir of plan.directories) ensureDir(dir);
  for (const [filePath, content] of plan.files) writeFileIfMissing(filePath, content);

  return {
    report_type: "plugin_folder_structure_create",
    status: exists ? "upgraded" : "created",
    track,
    plugin_slug: slug,
    target_root: plan.root,
    message: track === "owner"
      ? `Created owner plugin at ./plugins/${slug}/`
      : `Created plugin development workspace at ./workspaces/plugins/${slug}/`
  };
}

module.exports = {
  OWNER_PACKAGE_ROOT,
  WORKSPACE_ROOT,
  WORKSPACE_PACKAGE_SEGMENT,
  buildOwnerStructurePlan,
  buildWorkspaceStructurePlan,
  comparePackageStructure,
  createTargetStructure,
  resolveTargetWorkspaceRoot
};
