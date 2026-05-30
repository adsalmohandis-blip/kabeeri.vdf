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

test("full-set upgrade preserves canonical folders and does not require legacy compact folders", () => {
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
    assert.ok(Array.from(directories).some((item) => item.endsWith(`/${folder}`) || item.endsWith(folder)), `missing canonical folder ${folder}`);
  });

  [
    "workspaces/plugins/alpha_plugin/04_plugin_package/plugin.json",
    "workspaces/plugins/alpha_plugin/04_plugin_package/bootstrap.js",
    "workspaces/plugins/alpha_plugin/04_plugin_package/docs/OVERVIEW.md",
    "workspaces/plugins/alpha_plugin/04_plugin_package/tests/README.md",
    "workspaces/plugins/alpha_plugin/04_plugin_package/tests/unit/status_service.test.js",
    "workspaces/plugins/alpha_plugin/04_plugin_package/dashboard/views/README.md",
    "workspaces/plugins/alpha_plugin/99_plugin_archive/compact_structure_mapping.md"
  ].forEach((file) => assert.ok(files.has(file), `missing canonical file ${file}`));
});


