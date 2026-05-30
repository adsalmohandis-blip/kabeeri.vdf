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

test("plugin-dev workspace exposes the full canonical folder set", () => {
  const plan = buildWorkspaceStructurePlan("alpha-plugin");
  const directories = new Set(plan.directories.map((item) => item.replace(/\\/g, "/")));
  const files = new Set(plan.files.map(([item]) => item.replace(/\\/g, "/")));

  [
    "00_plugin_inputs",
    "01_plugin_identity",
    "02_plugin_roadmaps_plans",
    "03_plugin_specifications",
    "04_plugin_package",
    "05_plugin_version_control",
    "06_plugin_evolutions",
    "07_plugin_task_punches",
    "08_plugin_agents",
    "09_plugin_tests_quality",
    "10_plugin_evidence_audit",
    "11_plugin_reviews_approvals",
    "12_plugin_package_release",
    "13_plugin_documentation",
    "99_plugin_archive"
  ].forEach((folder) => {
    assert.ok(Array.from(directories).some((item) => item.endsWith(`/${folder}`) || item.endsWith(folder)), `missing ${folder}`);
  });

  assert.ok(files.has("workspaces/plugins/alpha_plugin/plugin_workspace_manifest.json"));
  assert.ok(files.has("workspaces/plugins/alpha_plugin/99_plugin_archive/compact_structure_mapping.md"));
});


