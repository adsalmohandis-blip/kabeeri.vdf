const assert = require("assert");
const { buildStatusReport } = require("../../plugins/plugin_folder_structure/src/services/status_service");
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

test("package root references are updated to the canonical 04 folder", () => {
  const report = buildStatusReport();
  assert.strictEqual(report.plugin_dev_track_target, "./workspaces/plugins/<plugin-slug>/04_plugin_package/");
  assert.strictEqual(report.actual_candidate_plugin_package, "./workspaces/plugins/<plugin-slug>/04_plugin_package/");
  const plan = buildWorkspaceStructurePlan("alpha-plugin");
  const manifestEntry = plan.files.find(([item]) => item.endsWith("plugin_workspace_manifest.json"));
  assert.ok(manifestEntry);
  const manifest = JSON.parse(manifestEntry[1]);
  assert.strictEqual(manifest.package_root.endsWith("/04_plugin_package"), true);
});
