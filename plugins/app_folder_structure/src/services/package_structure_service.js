const { buildAppWorkspacePlan, comparePackageStructure } = require("../core/standard_plugin_structure");
const { resolveCategoryProfile, listCategories } = require("../core/category_registry");

function buildPackageStructureSummary(appSlug, options = {}) {
  const plan = buildAppWorkspacePlan(appSlug, options);
  return {
    app_slug: plan.slug,
    workspace_root: plan.root,
    category: plan.category,
    platform_type: plan.category_profile.platform_type,
    profile_version: plan.category_profile.profile_version,
    top_level_dirs: plan.top_level_dirs,
    folder_count: plan.directories.length,
    file_count: plan.files.length,
    profile: plan.category_profile,
    categories: listCategories()
  };
}

function buildPackageStructurePlan(appSlug, options = {}) {
  return buildAppWorkspacePlan(appSlug, options);
}

module.exports = {
  buildPackageStructurePlan,
  buildPackageStructureSummary,
  comparePackageStructure,
  listCategories,
  resolveCategoryProfile
};
