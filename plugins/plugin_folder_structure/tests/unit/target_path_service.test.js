const assert = require("assert");
const { buildOwnerStructurePlan, buildWorkspaceStructurePlan, comparePackageStructure } = require("../../src/services/target_path_service");

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

test("owner package uses the single standard package structure", () => {
  const plan = buildOwnerStructurePlan("alpha-plugin");
  const root = plan.root.replace(/\\/g, "/");
  assert.ok(root.endsWith("plugins/alpha-plugin"));
  assert.ok(plan.directories.some((item) => item.replace(/\\/g, "/").endsWith("/src/commands")));
  assert.ok(plan.directories.some((item) => item.replace(/\\/g, "/").endsWith("/docs")));
  assert.ok(plan.files.some(([item]) => item.replace(/\\/g, "/").endsWith("/plugin.json")));
  assert.ok(plan.files.some(([item]) => item.replace(/\\/g, "/").endsWith("/plugin_manifest.json")));
});

test("plugin dev workspace carries the same package under 04_plugin_package", () => {
  const plan = buildWorkspaceStructurePlan("alpha-plugin");
  const root = plan.root.replace(/\\/g, "/");
  assert.ok(root.endsWith("workspaces/plugins/alpha_plugin"));
  assert.ok(plan.directories.some((item) => item.replace(/\\/g, "/").endsWith("/00_plugin_inputs/git_libraries")));
  assert.ok(plan.directories.some((item) => item.replace(/\\/g, "/").endsWith("/08_plugin_agents")));
  assert.ok(plan.directories.some((item) => item.replace(/\\/g, "/").endsWith("/12_plugin_package_release")));
  assert.ok(plan.directories.some((item) => item.replace(/\\/g, "/").endsWith("/04_plugin_package/src/commands")));
  assert.ok(plan.directories.some((item) => item.replace(/\\/g, "/").endsWith("/05_plugin_version_control")));
  assert.ok(plan.files.some(([item]) => item.replace(/\\/g, "/").endsWith("/04_plugin_package/plugin.json")));
  assert.ok(plan.files.some(([item]) => item.replace(/\\/g, "/").endsWith("/plugin_workspace_manifest.json")));
  assert.ok(plan.files.some(([item]) => item.replace(/\\/g, "/").endsWith("/99_plugin_archive/compact_structure_mapping.md")));
});

test("owner and plugin dev packages compare as the same package tree", () => {
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

