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

test("workspace plan migrates the candidate package from 03 to 04", () => {
  const plan = buildWorkspaceStructurePlan("alpha-plugin");
  const manifestEntry = plan.files.find(([item]) => item.endsWith("plugin_workspace_manifest.json"));
  assert.ok(manifestEntry);
  const manifest = JSON.parse(manifestEntry[1]);
  assert.strictEqual(manifest.previous_package_folder, "03_plugin_package");
  assert.strictEqual(manifest.canonical_package_folder, "04_plugin_package");
  assert.strictEqual(manifest.renumbering_migrated, false);
  assert.strictEqual(manifest.removed_redundant_source_folder, true);
});
