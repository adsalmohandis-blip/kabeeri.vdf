const fs = require("fs");
const path = require("path");
const { buildAppWorkspacePlan, comparePackageStructure } = require("../core/standard_plugin_structure");
const { appFolderError } = require("../core/errors");
const { normalizeCategory } = require("../utils/slugify");
const { ensureDir, writeFileIfMissing, writeFileIfEmpty, fileExists, isNonEmptyFile } = require("../utils/fs_safe");
const { readJson, writeJsonIfMissing } = require("../utils/json_safe");
const { buildValidationReport, validateWorkspaceFiles } = require("./validation_service");
const { writeStructureEvidence } = require("./evidence_service");
const { ensureManifestFiles, readAppFolderManifest } = require("./manifest_service");

function resolveWorkspaceRoot(slug, repoRootPath = process.cwd()) {
  const normalized = normalizeWorkspaceSlug(slug);
  if (!normalized) throw appFolderError("Missing app slug.");
  return path.resolve(repoRootPath, "workspaces", "apps", normalized);
}

function resolveWorkspaceTarget(context = {}, deps = {}) {
  const flags = context.flags || {};
  const slug = normalizeWorkspaceSlug(flags.app || flags.slug || flags.workspace || context.value || context.rest?.[0] || "");
  const category = normalizeCategory(flags.category || flags.platform || flags.type || "generic");
  const repoRootPath = path.resolve(deps.repoRootPath || process.cwd());
  if (!slug) throw appFolderError("Missing app slug.");
  return {
    app_slug: slug,
    category,
    workspace_root: resolveWorkspaceRoot(slug, repoRootPath),
    repo_root: repoRootPath
  };
}

function createTargetStructure(context = {}, deps = {}) {
  const target = resolveWorkspaceTarget(context, deps);
  const plan = buildAppWorkspacePlan(target.app_slug, {
    category: target.category,
    repoRootPath: target.repo_root,
    appName: context.flags?.name || context.flags?.app_name || target.app_slug
  });
  const existedBefore = fs.existsSync(plan.root);
  const created = materializePlan(plan);
  const manifestResult = ensureManifestFiles(plan, { force: false });
  const validation = validateTargetStructure(context, { ...deps, _precomputedPlan: plan, _skipEvidence: true });
  const report = buildValidationReport(plan.root, validation, {
    app_slug: plan.slug,
    category: plan.category,
    created,
    manifestResult
  });
  writeStructureEvidence(plan.root, "create", report);
  return {
    report_type: "app_folder_structure_create",
    status: existedBefore ? "updated" : "created",
    message: existedBefore
      ? `Updated app workspace ${plan.slug} at ./workspaces/apps/${plan.slug}/`
      : `Created app workspace ${plan.slug} at ./workspaces/apps/${plan.slug}/`,
    app_slug: plan.slug,
    category: plan.category,
    workspace_root: plan.root,
    created_files: created.files,
    created_directories: created.directories,
    manifest: manifestResult.manifest,
    validation
  };
}

function validateTargetStructure(context = {}, deps = {}) {
  const target = resolveWorkspaceTarget(context, deps);
  const plan = deps._precomputedPlan || buildAppWorkspacePlan(target.app_slug, {
    category: target.category,
    repoRootPath: target.repo_root,
    appName: context.flags?.name || context.flags?.app_name || target.app_slug
  });
  return validateWorkspaceFiles(plan.root, plan.category_profile);
}

function repairTargetStructure(context = {}, deps = {}) {
  const target = resolveWorkspaceTarget(context, deps);
  const plan = buildAppWorkspacePlan(target.app_slug, {
    category: target.category,
    repoRootPath: target.repo_root,
    appName: context.flags?.name || context.flags?.app_name || target.app_slug
  });
  const repaired = materializePlan(plan, { preserveExisting: true });
  const manifestResult = ensureManifestFiles(plan, { force: false });
  const validation = validateWorkspaceFiles(plan.root, plan.category_profile);
  const report = buildValidationReport(plan.root, validation, {
    app_slug: plan.slug,
    category: plan.category,
    repaired,
    manifestResult
  });
  writeStructureEvidence(plan.root, "repair", report);
  return {
    report_type: "app_folder_structure_repair",
    status: validation.ok ? "repaired" : "needs_attention",
    app_slug: plan.slug,
    category: plan.category,
    workspace_root: plan.root,
    repaired_files: repaired.files,
    repaired_directories: repaired.directories,
    manifest: manifestResult.manifest,
    validation
  };
}

function materializePlan(plan, options = {}) {
  const created = { directories: [], files: [] };
  for (const directory of plan.directories || []) {
    if (!fs.existsSync(directory)) {
      ensureDir(directory);
      created.directories.push(directory);
    }
  }
  for (const [filePath, content] of plan.files || []) {
    const exists = fs.existsSync(filePath);
    const nonEmpty = isNonEmptyFile(filePath);
    if (options.preserveExisting && nonEmpty) continue;
    if (!exists || !nonEmpty) {
      const wrote = writeFileIfEmpty(filePath, content);
      if (wrote) created.files.push(filePath);
    }
  }
  return created;
}

function printCategoryProfile(category, deps = {}) {
  const plan = buildAppWorkspacePlan(normalizeWorkspaceSlug("profile"), {
    category,
    repoRootPath: deps.repoRootPath || process.cwd(),
    appName: "Category Profile Preview"
  });
  return {
    report_type: "app_folder_structure_category_profile",
    category: plan.category,
    profile: plan.category_profile,
    roadmap_sections: {
      uiux: plan.category_profile.uiux_sections,
      system_design: plan.category_profile.system_design_sections,
      database: plan.category_profile.database_sections
    }
  };
}

function inspectWorkspace(appSlug, deps = {}) {
  const target = resolveWorkspaceTarget({ flags: { app: appSlug, category: deps.category || "generic" } }, deps);
  const plan = buildAppWorkspacePlan(target.app_slug, {
    category: target.category,
    repoRootPath: target.repo_root,
    appName: deps.appName || appSlug
  });
  const manifest = readAppFolderManifest(plan.root);
  const validation = validateWorkspaceFiles(plan.root, plan.category_profile);
  return {
    plan,
    manifest,
    validation,
    comparison: comparePackageStructure(
      { directories: [], files: [] },
      { directories: [], files: [] }
    )
  };
}

function normalizeWorkspaceSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

module.exports = {
  createTargetStructure,
  inspectWorkspace,
  materializePlan,
  normalizeWorkspaceSlug,
  printCategoryProfile,
  resolveWorkspaceRoot,
  resolveWorkspaceTarget,
  repairTargetStructure,
  validateTargetStructure
};
