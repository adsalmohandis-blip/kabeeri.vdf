const assert = require("assert");
const { buildWorkspaceStructurePlan } = require("../../plugins/plugin_folder_structure/src/services/target_path_service");

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

test("workspace manifest points package_root at 04_plugin_package", () => {
  const plan = buildWorkspaceStructurePlan("alpha-plugin");
  const manifestEntry = plan.files.find(([item]) => item.endsWith("plugin_workspace_manifest.json"));
  assert.ok(manifestEntry);
  const manifest = JSON.parse(manifestEntry[1]);
  assert.strictEqual(manifest.package_root.endsWith("/04_plugin_package"), true);
  assert.strictEqual(manifest.actual_plugin_package, "04_plugin_package");
  assert.strictEqual(manifest.canonical_package_folder, "04_plugin_package");
});
