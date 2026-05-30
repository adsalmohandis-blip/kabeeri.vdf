const fs = require("fs");
const path = require("path");
const { writeJsonIfMissing, readJson, writeJson } = require("../utils/json_safe");
const { writeFileIfMissing, ensureDir, isNonEmptyFile } = require("../utils/fs_safe");
const { SOURCE_PLUGIN, PROFILE_VERSION, PLUGIN_ID, PLUGIN_NAME, PLUGIN_TRACK, PLUGIN_VERSION } = require("../core/constants");
const { buildAppFolderManifest } = require("../core/standard_plugin_structure");

function ensureManifestFiles(plan, options = {}) {
  const manifest = plan.manifest;
  const state = {
    app_slug: plan.slug,
    category: plan.category,
    profile_version: plan.category_profile.profile_version,
    source_plugin: SOURCE_PLUGIN,
    workspace_root: `workspaces/apps/${plan.slug}`,
    status: "draft",
    created_at: manifest.created_at,
    updated_at: new Date().toISOString()
  };
  const yaml = plan.app_kvdos_yaml;
  const manifestPath = path.join(plan.root, ".kabeeri", "app_folder_manifest.json");
  const statePath = path.join(plan.root, ".kabeeri", "app_state.json");
  const yamlPath = path.join(plan.root, "app.kvdos.yaml");
  const writes = {
    manifest: writeJsonIfMissing(manifestPath, manifest),
    state: writeJsonIfMissing(statePath, state),
    yaml: writeFileIfMissing(yamlPath, yaml)
  };
  return { ...writes, manifest, state, yaml, manifest_path: manifestPath, state_path: statePath, yaml_path: yamlPath };
}

function readAppFolderManifest(workspaceRoot) {
  return readJson(path.join(workspaceRoot, ".kabeeri", "app_folder_manifest.json"), null);
}

function updateAppFolderManifest(workspaceRoot, patch = {}) {
  const filePath = path.join(workspaceRoot, ".kabeeri", "app_folder_manifest.json");
  const existing = readJson(filePath, null) || {};
  const next = { ...existing, ...patch, updated_at: new Date().toISOString() };
  writeJson(filePath, next);
  return next;
}

function buildPluginPackageManifest(appSlug, workspaceRoot, categoryProfile = null) {
  return {
    plugin_id: PLUGIN_ID,
    id: PLUGIN_ID,
    name: PLUGIN_NAME,
    version: PLUGIN_VERSION,
    type: "kvdf_plugin",
    status: "draft",
    entry: "bootstrap.js",
    commands: ["status", "create", "validate", "repair", "print", "manifest", "readiness"],
    depends_on: [],
    integrates_with: ["app_category_registry", "app_workspace_contract", "track_control"],
    provides: ["app folder creation", "app folder validation", "app folder repair", "app folder manifests"],
    consumes: ["category profiles", "workspace inputs", "app workspace state"],
    conflicts_with: [],
    permissions_required: ["filesystem_write", "workspace_state_read"],
    runtime_path: "bootstrap.js",
    schemas: [
      "schemas/app_workspace_manifest.schema.json",
      "schemas/folder_structure_profile.schema.json",
      "schemas/app_workspace_validation.schema.json"
    ],
    docs_surface: [
      "docs/README.md",
      "docs/OVERVIEW.md",
      "docs/COMMANDS.md",
      "docs/ARCHITECTURE.md",
      "docs/INTEGRATIONS.md",
      "docs/PERMISSIONS.md",
      "docs/SECURITY.md",
      "docs/TESTING.md",
      "docs/TROUBLESHOOTING.md"
    ],
    workspace_root: workspaceRoot,
    app_slug: appSlug,
    selected_category: categoryProfile ? categoryProfile.category_id : null
  };
}

function buildPluginManifest(appSlug, workspaceRoot, categoryProfile = null) {
  const createdAt = new Date().toISOString();
  return {
    plugin_slug: appSlug,
    track: PLUGIN_TRACK,
    package_root: `workspaces/plugins/${appSlug}/04_plugin_package`,
    workspace_root: workspaceRoot,
    status: "draft",
    owner_created_directly: false,
    marketplace_published: false,
    created_at: createdAt,
    updated_at: createdAt,
    actual_plugin_package: "04_plugin_package",
    source_tracking_folder: "08_source",
    owner_approval_required_for_promotion: true,
    compatibility: {
      compact_folders_detected: false,
      compact_folders_preserved: false,
      canonical_full_set_enabled: true,
      actual_plugin_package: "04_plugin_package",
      source_tracking_folder: "08_source"
    },
    category_profile: categoryProfile ? {
      category_id: categoryProfile.category_id,
      title: categoryProfile.title,
      platform_type: categoryProfile.platform_type,
      profile_version: categoryProfile.profile_version
    } : null
  };
}

function writePluginManifest(workspaceRoot, appSlug, categoryProfile = null, options = {}) {
  const manifest = buildPluginManifest(appSlug, workspaceRoot, categoryProfile);
  const filePath = path.join(workspaceRoot, "plugin_workspace_manifest.json");
  if (options.force || !fs.existsSync(filePath) || !isNonEmptyFile(filePath)) {
    writeJson(filePath, manifest);
  }
  return manifest;
}

function buildAppStateTemplate(plan) {
  return {
    version: PROFILE_VERSION,
    plugin_id: PLUGIN_ID,
    plugin_name: PLUGIN_NAME,
    plugin_track: PLUGIN_TRACK,
    workspace_kind: "app_folder_structure_workspace",
    app_slug: plan.slug,
    app_name: plan.app_name,
    category: plan.category,
    platform_type: plan.category_profile.platform_type,
    profile_version: plan.category_profile.profile_version,
    source_plugin: SOURCE_PLUGIN,
    workspace_root: `workspaces/apps/${plan.slug}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function buildAppFolderManifestJson(plan) {
  return JSON.stringify(buildAppFolderManifest(plan.app_name, plan.slug, plan.category_profile, new Date().toISOString()), null, 2) + "\n";
}

module.exports = {
  buildAppFolderManifestJson,
  buildAppStateTemplate,
  buildPluginManifest,
  buildPluginPackageManifest,
  ensureManifestFiles,
  readAppFolderManifest,
  updateAppFolderManifest,
  writePluginManifest
};

