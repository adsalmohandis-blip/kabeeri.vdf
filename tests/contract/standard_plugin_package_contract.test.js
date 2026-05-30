const assert = require("assert");
const { buildOwnerStructurePlan, buildWorkspaceStructurePlan, comparePackageStructure } = require("../../plugins/plugin_folder_structure/src/services/target_path_service");

function test(name, fn) {
  try {
    fn();
    console.log(`OK ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}

test("owner and plugin-dev packages share the same standard package contract", () => {
  const owner = buildOwnerStructurePlan("alpha-plugin");
  const workspace = buildWorkspaceStructurePlan("alpha-plugin");
  const workspacePackage = {
    directories: workspace.directories.filter((item) => item.includes("/04_plugin_package/")),
    files: workspace.files.filter(([item]) => item.includes("/04_plugin_package/"))
  };
  const comparison = comparePackageStructure(owner, workspacePackage);
  assert.strictEqual(comparison.same_directories, true);
  assert.strictEqual(comparison.same_files, true);
});

