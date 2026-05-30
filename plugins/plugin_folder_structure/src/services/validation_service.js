const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../../../../src/cli/fs_utils");
const { resolveTrack } = require("../core/track_resolver");
const { pluginFolderError } = require("../core/errors");
const { buildOwnerStructurePlan, buildWorkspaceStructurePlan, comparePackageStructure } = require("./target_path_service");
const { buildStandardPackagePlan } = require("../core/standard_plugin_structure");
const { readJson } = require("../utils/json_safe");

function validateOwner(slug) {
  const plan = buildOwnerStructurePlan(slug);
  const standardPlan = buildStandardPackagePlan(plan.root, slug, { packageType: "owner" });
  const missing = collectMissing(plan.root, plan.directories, plan.files);
  const manifest = readJson(path.join(plan.root, "plugin.json"), null);
  const pluginManifest = readJson(path.join(plan.root, "plugin_manifest.json"), null);
  const comparison = comparePackageStructure(plan, standardPlan);
  const ok = missing.length === 0 && Boolean(manifest) && Boolean(pluginManifest) && comparison.same_directories && comparison.same_files;
  return {
    target: "owner",
    slug,
    root: plan.root,
    ok,
    missing,
    package_root: plan.root,
    package_structure_ok: comparison.same_directories && comparison.same_files,
    manifest_ok: Boolean(manifest),
    owner_manifest_ok: Boolean(pluginManifest),
    integration_fields_ok: hasIntegrationFields(manifest),
    permissions_ok: Boolean(manifest && Array.isArray(manifest.permissions_required)),
    runtime_path_ok: Boolean(manifest && manifest.runtime_path),
    docs_folder_ok: fs.existsSync(path.join(plan.root, "docs")),
    deep_nested_plugin_root: false
  };
}

function validatePluginDev(slug) {
  const plan = buildWorkspaceStructurePlan(slug);
  const packagePlan = buildStandardPackagePlan(plan.package_root, slug, { packageType: "plugin_dev" });
  const missing = collectMissing(plan.root, plan.directories, plan.files);
  const packageMissing = collectMissing(packagePlan.root, packagePlan.directories, packagePlan.files);
  const manifest = readJson(path.join(plan.root, "plugin_workspace_manifest.json"), null);
  const packageManifest = readJson(path.join(packagePlan.root, "plugin_manifest.json"), null);
  const comparison = comparePackageStructure(buildOwnerStructurePlan(slug), packagePlan);
  const legacyPackageExists = fs.existsSync(path.join(plan.root, "03_plugin_package"));
  const redundantSourceFolderExists = fs.existsSync(path.join(plan.root, "08_plugin_source"));
  const deepNestedPluginRoot = fs.existsSync(path.join(plan.root, "08_plugin_source", "plugin_root"));
  const compactDetected = ["00_inputs", "01_spec", "02_tasks", "04_evidence", "05_release"]
    .some((folder) => fs.existsSync(path.join(plan.root, folder)));
  const compactPreserved = compactDetected || Boolean(manifest && manifest.compatibility && manifest.compatibility.compact_folders_preserved);
  const pendingMigration = Boolean(manifest && manifest.compatibility && (manifest.compatibility.renumbering_migrated === false || manifest.compatibility.removed_redundant_source_folder === false));
  const sourceReady = !redundantSourceFolderExists && !deepNestedPluginRoot;
  const packageReady = !legacyPackageExists;
  const ok = missing.length === 0 && packageMissing.length === 0 && Boolean(manifest) && Boolean(packageManifest) && comparison.same_directories && comparison.same_files && sourceReady && packageReady;
  return {
    target: "plugin_dev",
    slug,
    root: plan.root,
    ok,
    missing: [...missing, ...packageMissing],
    manifest_ok: Boolean(manifest),
    package_manifest_ok: Boolean(packageManifest),
    package_root: packagePlan.root,
    canonical_package_folder: "04_plugin_package",
    previous_package_folder: "03_plugin_package",
    renumbering_migrated: Boolean(manifest && manifest.compatibility && manifest.compatibility.renumbering_migrated),
    removed_redundant_source_folder: Boolean(manifest && manifest.compatibility && manifest.compatibility.removed_redundant_source_folder),
    package_structure_ok: comparison.same_directories && comparison.same_files,
    candidate_source_ok: sourceReady,
    git_library_governance_ok: fs.existsSync(path.join(plan.root, "00_plugin_inputs", "git_libraries")),
    integration_contracts_ok: fs.existsSync(path.join(plan.root, "03_plugin_specifications", "integration_specification", "integration_contracts.md")),
    roadmap_governance_ok: fs.existsSync(path.join(plan.root, "02_plugin_roadmaps_plans", "integration_plan")),
    evidence_ok: fs.existsSync(path.join(plan.root, "10_plugin_evidence_audit")),
    deep_nested_plugin_root: deepNestedPluginRoot,
    legacy_package_folder_exists: legacyPackageExists,
    redundant_source_folder_exists: redundantSourceFolderExists,
    compact_folders_detected: compactDetected,
    compact_folders_preserved: compactPreserved,
    pending_migration: pendingMigration,
    owner_review_only_for_promotion: true
  };
}

function buildValidationReport(context = {}, deps = {}) {
  const track = resolveTrack(context);
  const slug = context.plugin_slug || context.value || (context.rest && context.rest[0]) || "";
  if (!slug) throw pluginFolderError("Missing plugin slug.");
  const mode = deps.readiness ? "readiness" : "validation";
  if (track === "owner") return { ...validateOwner(slug), mode, readiness: Boolean(deps.readiness) };
  if (track === "plugin_dev") return { ...validatePluginDev(slug), mode, readiness: Boolean(deps.readiness) };
  throw pluginFolderError("Viber/App Track cannot create plugins directly. Switch to Plugin Development Track.");
}

function runValidation(context, deps = {}) {
  const report = buildValidationReport(context, deps);
  if (context.flags && context.flags.json) console.log(JSON.stringify(report, null, 2));
  else console.log(report.ok ? `${report.readiness ? "Readiness" : "Validation"} passed for ${report.target}: ${report.slug}` : `${report.readiness ? "Readiness" : "Validation"} failed for ${report.target}: ${report.slug}`);
  return report;
}

function collectMissing(root, directories, files) {
  const missing = [];
  for (const dir of directories) if (!fs.existsSync(dir)) missing.push(path.relative(root, dir).replace(/\\/g, "/"));
  for (const [filePath] of files) if (!fs.existsSync(filePath)) missing.push(path.relative(root, filePath).replace(/\\/g, "/"));
  return missing;
}

function hasIntegrationFields(manifest) {
  if (!manifest) return false;
  return Array.isArray(manifest.commands)
    && Array.isArray(manifest.depends_on)
    && Array.isArray(manifest.integrates_with)
    && Array.isArray(manifest.provides)
    && Array.isArray(manifest.consumes)
    && Array.isArray(manifest.conflicts_with)
    && Array.isArray(manifest.permissions_required)
    && Array.isArray(manifest.schemas);
}

function comparePackageManifests(leftRoot, rightRoot) {
  const left = readJson(path.join(leftRoot, "plugin.json"), null);
  const right = readJson(path.join(rightRoot, "plugin.json"), null);
  return { same_structure: Boolean(left && right) };
}

module.exports = {
  validateOwner,
  validatePluginDev,
  buildValidationReport,
  runValidation
};

