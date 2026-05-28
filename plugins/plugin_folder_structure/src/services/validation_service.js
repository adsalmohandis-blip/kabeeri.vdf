const fs = require("fs");
const path = require("path");
const { repoRoot } = require("../../../../src/cli/fs_utils");
const { resolveTrack } = require("../core/track_resolver");
const { pluginFolderError } = require("../core/errors");
const { SHARED_SHELL_FOLDERS, WORKSPACE_GOVERNANCE_FOLDERS } = require("../core/constants");
const { readJson } = require("../utils/json_safe");

function validateOwner(slug) {
  const root = path.join(repoRoot(), "plugins", slug);
  const requiredFiles = ["plugin.json", "bootstrap.js", "README.md", "CHANGELOG.md", "plugin_manifest.json"];
  const requiredDirs = [...SHARED_SHELL_FOLDERS, "src/commands", "src/core", "src/services", "src/utils", "src/adapters", "src/policies", "schemas", "tests", "tests/unit", "tests/contract", "tests/integration", "tests/smoke", "docs"];
  const missing = [];
  for (const file of requiredFiles) if (!fs.existsSync(path.join(root, file))) missing.push(file);
  for (const dir of requiredDirs) if (!fs.existsSync(path.join(root, dir))) missing.push(dir);
  const manifest = readJson(path.join(root, "plugin.json"), null);
  const ownerManifest = readJson(path.join(root, "plugin_manifest.json"), null);
  const requiredPluginJsonFields = ["entry", "commands", "depends_on", "integrates_with", "provides", "consumes", "conflicts_with", "permissions_required", "runtime_path", "schemas"];
  const pluginJsonFieldChecks = requiredPluginJsonFields.every((field) => Object.prototype.hasOwnProperty.call(manifest || {}, field));
  const ok = missing.length === 0 && manifest && ownerManifest && pluginJsonFieldChecks;
  return {
    target: "owner",
    slug,
    root,
    ok,
    missing,
    manifest_ok: Boolean(manifest),
    owner_manifest_ok: Boolean(ownerManifest),
    integration_fields_ok: pluginJsonFieldChecks,
    permissions_ok: Boolean(manifest && Array.isArray(manifest.permissions_required) && manifest.permissions_required.length > 0),
    runtime_path_ok: Boolean(manifest && manifest.runtime_path),
    docs_folder_ok: fs.existsSync(path.join(root, "docs")),
    shell_folders_ok: [...SHARED_SHELL_FOLDERS].every((folder) => fs.existsSync(path.join(root, folder)))
  };
}

function validatePluginDev(slug) {
  const root = path.join(repoRoot(), "workspaces", "plugins", slug);
  const requiredFiles = ["plugin_workspace_manifest.json", "README.md"];
  const requiredDirs = [...SHARED_SHELL_FOLDERS, ...WORKSPACE_GOVERNANCE_FOLDERS, "inputs/git_libraries", "source", "roadmaps_plans", "specifications", "evidence_audit", "reviews_approvals", "package_release", "documentation", "archive", "tests/unit", "tests/integration"];
  const missing = [];
  for (const file of requiredFiles) if (!fs.existsSync(path.join(root, file))) missing.push(file);
  for (const dir of requiredDirs) if (!fs.existsSync(path.join(root, dir))) missing.push(dir);
  const manifest = readJson(path.join(root, "plugin_workspace_manifest.json"), null);
  const ok = missing.length === 0 && manifest;
  return {
    target: "plugin_dev",
    slug,
    root,
    ok,
    missing,
    manifest_ok: Boolean(manifest),
    candidate_source_ok: fs.existsSync(path.join(root, "source", slug)),
    git_library_governance_ok: fs.existsSync(path.join(root, "inputs", "git_libraries")),
    integration_contracts_ok: fs.existsSync(path.join(root, "roadmaps_plans", "integration_plan")) && fs.existsSync(path.join(root, "specifications", "integration_specification")),
    evidence_ok: fs.existsSync(path.join(root, "evidence_audit")),
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

module.exports = {
  validateOwner,
  validatePluginDev,
  buildValidationReport,
  runValidation
};
