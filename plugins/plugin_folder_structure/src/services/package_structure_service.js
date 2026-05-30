const {
  buildOwnerStructurePlan,
  buildWorkspaceStructurePlan,
  comparePackageStructure
} = require("./target_path_service");

function buildPackageStructureReport(slug) {
  const ownerPlan = buildOwnerStructurePlan(slug);
  const workspacePlan = buildWorkspaceStructurePlan(slug);
  const comparison = comparePackageStructure(ownerPlan, {
    directories: workspacePlan.directories.filter((item) => String(item).includes("/04_plugin_package/")),
    files: workspacePlan.files.filter(([item]) => String(item).includes("/04_plugin_package/"))
  });
  return {
    report_type: "plugin_folder_structure_package_structure",
    plugin_slug: slug,
    owner_root: ownerPlan.root,
    workspace_root: workspacePlan.root,
    workspace_package_root: workspacePlan.package_root,
    same_directories: comparison.same_directories,
    same_files: comparison.same_files
  };
}

module.exports = {
  buildPackageStructureReport
};

