const fs = require("fs");
const path = require("path");
const {
  APP_ARCHIVE_DIRS,
  APP_AGENT_DIRS,
  APP_EVIDENCE_DIRS,
  APP_EVOLUTION_DIRS,
  APP_INPUT_DIRS,
  APP_RELEASE_DIRS,
  APP_REVIEW_DIRS,
  APP_ROADMAP_DIRS,
  APP_RUNTIME_DIRS,
  APP_SPEC_FILES,
  APP_TASK_PUNCH_DIRS,
  APP_TEST_DIRS,
  APP_TOP_LEVEL_DIRS,
  APP_TOP_LEVEL_FILES,
  APP_VERSION_CONTROL_DIRS,
  SOURCE_PLUGIN
} = require("../core/constants");
const { resolveCategoryProfile } = require("../core/category_registry");
const { readJson } = require("../utils/json_safe");

function validateWorkspaceFiles(workspaceRoot, profileOrCategory = "generic") {
  const profile = typeof profileOrCategory === "string"
    ? resolveCategoryProfile(profileOrCategory)
    : profileOrCategory;
  const result = {
    ok: true,
    workspace_root: workspaceRoot,
    app_slug: path.basename(workspaceRoot || ""),
    selected_category: profile.category_id,
    platform_type: profile.platform_type,
    profile_version: profile.profile_version,
    source_plugin: SOURCE_PLUGIN,
    missing: [],
    present: [],
    checks: [],
    generated: {},
    summary: {}
  };

  function addCheck(id, passed, message, evidence = "") {
    result.checks.push({ id, passed, message, evidence });
    if (!passed) result.ok = false;
  }

  if (!workspaceRoot || !fs.existsSync(workspaceRoot)) {
    result.ok = false;
    result.missing.push(workspaceRoot || "workspaces/apps/<slug>");
    addCheck("workspace_root", false, "Workspace root is missing.");
    return result;
  }

  const requiredPaths = [
    ...APP_TOP_LEVEL_DIRS,
    ...APP_RUNTIME_DIRS,
    ...APP_INPUT_DIRS,
    ...APP_ROADMAP_DIRS,
    ...APP_VERSION_CONTROL_DIRS,
    ...APP_EVOLUTION_DIRS,
    ...APP_TASK_PUNCH_DIRS,
    ...APP_AGENT_DIRS,
    ...APP_TEST_DIRS,
    ...APP_EVIDENCE_DIRS,
    ...APP_REVIEW_DIRS,
    ...APP_RELEASE_DIRS,
    ...APP_ARCHIVE_DIRS,
    ...APP_TOP_LEVEL_FILES,
    "00_viber_inputs/README.md",
    "00_viber_inputs/app_brief.md",
    "00_viber_inputs/viber_notes.md",
    "00_viber_inputs/snapshots/README.md",
    "00_viber_inputs/external_files/README.md",
    "00_viber_inputs/links/links.md",
    "00_viber_inputs/questions_answers/questions_answers.md",
    "00_viber_inputs/questions_answers/unanswered_questions.md",
    "00_viber_inputs/questions_answers/answered_questions.md",
    "00_viber_inputs/references/README.md",
    "01_category/selected_category.json",
    "01_category/folder_structure_profile.json",
    "01_category/category_profile.md",
    "02_roadmaps_plans/README.md",
    "02_roadmaps_plans/roadmap_order.md",
    "02_roadmaps_plans/roadmap_status.json",
    "02_roadmaps_plans/01_uiux/generated_uiux_structure.json",
    "02_roadmaps_plans/02_system_design/generated_system_structure.json",
    "02_roadmaps_plans/03_database/generated_database_structure.json",
    "08_source/README.md",
    "08_source/source_manifest.json",
    "99_archive/compact_structure_mapping.md"
  ];

  for (const relative of requiredPaths) {
    const absolute = path.join(workspaceRoot, relative);
    const exists = fs.existsSync(absolute);
    if (exists) {
      result.present.push(relative);
      addCheck(`path:${relative}`, true, `${relative} present.`, relative);
    } else {
      result.missing.push(relative);
      addCheck(`path:${relative}`, false, `${relative} missing.`, relative);
    }
  }

  const manifestPath = path.join(workspaceRoot, ".kabeeri", "app_folder_manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = readJson(manifestPath, null);
    result.manifest = manifest;
    addCheck("manifest", Boolean(manifest), manifest ? "app folder manifest parsed." : "app folder manifest could not be parsed.", ".kabeeri/app_folder_manifest.json");
    if (manifest) {
      addCheck("manifest_category", manifest.category === profile.category_id, `manifest category is ${manifest.category || "unset"}.`, ".kabeeri/app_folder_manifest.json");
      addCheck("manifest_source", manifest.source_plugin === SOURCE_PLUGIN, `manifest source plugin is ${manifest.source_plugin || "unset"}.`, ".kabeeri/app_folder_manifest.json");
    }
  } else {
    result.ok = false;
    addCheck("manifest", false, ".kabeeri/app_folder_manifest.json is missing.");
  }

  const categoryProfile = readJson(path.join(workspaceRoot, "01_category", "folder_structure_profile.json"), null);
  result.category_profile = categoryProfile;
  addCheck("category_profile", Boolean(categoryProfile), categoryProfile ? "category profile parsed." : "category profile missing.", "01_category/folder_structure_profile.json");
  if (categoryProfile) {
    addCheck("category_profile_source", categoryProfile.source_plugin === SOURCE_PLUGIN, `category profile source plugin is ${categoryProfile.source_plugin || "unset"}.`, "01_category/folder_structure_profile.json");
    addCheck("category_profile_sections", Array.isArray(categoryProfile.uiux_sections) && Array.isArray(categoryProfile.system_design_sections) && Array.isArray(categoryProfile.database_sections), "category profile exposes roadmap sections.", "01_category/folder_structure_profile.json");
  }

  const sourceManifest = readJson(path.join(workspaceRoot, "08_source", "source_manifest.json"), null);
  result.source_manifest = sourceManifest;
  addCheck("source_manifest", Boolean(sourceManifest), sourceManifest ? "source manifest parsed." : "source manifest missing.", "08_source/source_manifest.json");
  if (sourceManifest) {
    addCheck("source_layout_mode", sourceManifest.source_layout_mode === "stack_adaptive", `source layout mode is ${sourceManifest.source_layout_mode || "unset"}.`, "08_source/source_manifest.json");
    addCheck("source_root", String(sourceManifest.source_root || "").trim() === "08_source", "source root remains stack-adaptive.", "08_source/source_manifest.json");
    addCheck("source_tracking_only", sourceManifest.actual_source_root === "../04_plugin_package/", "source manifest points back to the package root.", "08_source/source_manifest.json");
  }

  const forbiddenSourceChildren = ["frontend", "backend", "api", "shared", "database", "mobile", "integrations"];
  const sourceChildren = fs.existsSync(path.join(workspaceRoot, "08_source")) ? fs.readdirSync(path.join(workspaceRoot, "08_source")) : [];
  result.forbidden_source_children = sourceChildren.filter((item) => forbiddenSourceChildren.includes(String(item || "").toLowerCase()));
  addCheck("source_forbidden_children", result.forbidden_source_children.length === 0, result.forbidden_source_children.length === 0 ? "08_source remains neutral." : "08_source contains forbidden stack-specific children.", "08_source/");

  result.summary = {
    required_paths_total: requiredPaths.length,
    required_paths_present: result.present.length,
    missing_count: result.missing.length,
    category: profile.category_id,
    platform_type: profile.platform_type
  };
  return result;
}

function buildValidationReport(workspaceRoot, validation, metadata = {}) {
  return {
    report_type: "app_folder_structure_validation",
    workspace_root: workspaceRoot,
    app_slug: metadata.app_slug || path.basename(workspaceRoot || ""),
    category: metadata.category || validation.selected_category || "generic",
    source_plugin: SOURCE_PLUGIN,
    ok: Boolean(validation.ok),
    summary: validation.summary || {},
    missing: validation.missing || [],
    present: validation.present || [],
    checks: validation.checks || [],
    manifest: validation.manifest || null,
    category_profile: validation.category_profile || null,
    source_manifest: validation.source_manifest || null,
    created: metadata.created || null,
    repaired: metadata.repaired || null,
    manifest_result: metadata.manifestResult || null,
    generated_at: new Date().toISOString()
  };
}

module.exports = {
  buildValidationReport,
  validateWorkspaceFiles
};

