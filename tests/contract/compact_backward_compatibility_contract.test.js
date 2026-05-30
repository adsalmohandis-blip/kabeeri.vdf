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

test("workspace manifest keeps the canonical compatibility mapping", () => {
  const plan = buildWorkspaceStructurePlan("alpha-plugin");
  const manifestEntry = plan.files.find(([item]) => item.endsWith("plugin_workspace_manifest.json"));
  assert.ok(manifestEntry);
  const manifest = JSON.parse(manifestEntry[1]);
  assert.strictEqual(manifest.plugin_slug, "alpha_plugin");
  assert.strictEqual(manifest.track, "plugin_development_track");
  assert.strictEqual(manifest.package_root.endsWith("/04_plugin_package"), true);
  assert.strictEqual(manifest.canonical_package_folder, "04_plugin_package");
  assert.strictEqual(manifest.previous_package_folder, "03_plugin_package");
  assert.strictEqual(manifest.renumbering_migrated, false);
  assert.strictEqual(manifest.removed_redundant_source_folder, true);
  assert.ok(manifest.compatibility);
  assert.strictEqual(manifest.compatibility.compact_folders_detected, false);
  assert.strictEqual(manifest.compatibility.compact_folders_preserved, false);
  assert.strictEqual(manifest.compatibility.canonical_full_set_enabled, true);
  assert.strictEqual(manifest.compatibility.actual_plugin_package, "04_plugin_package");
  assert.strictEqual(manifest.compatibility.canonical_package_folder, "04_plugin_package");
  assert.strictEqual(manifest.compatibility.previous_package_folder, "03_plugin_package");
  assert.strictEqual(manifest.compatibility.renumbering_migrated, false);
  assert.strictEqual(manifest.compatibility.removed_redundant_source_folder, true);
});

